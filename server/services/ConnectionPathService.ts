/**
 * ConnectionPathService - Computes and caches connection paths between users
 * 
 * MB.MD Pattern: Friendship Closeness Filter System
 * 
 * Evaluates whether a viewer can access content based on:
 * - closenessScore (0-100): Strength of friendship
 * - connectionDegree (1-3): Degrees of separation
 */

import { db } from "../db";
import { friendships } from "@shared/schema";
import { eq, or, and, sql } from "drizzle-orm";
import type { ClosenessVisibility } from "@shared/schema";

// Cache for connection paths (TTL: 5 minutes)
const connectionCache = new Map<string, { result: ConnectionResult; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface ConnectionResult {
  isConnected: boolean;
  connectionDegree: number | null; // 1, 2, 3, or null if not connected
  closenessScore: number | null; // 0-100 or null if not connected
  path?: number[]; // User IDs in the connection path
}

export interface VisibilityCheckResult {
  canAccess: boolean;
  reason: string;
  connectionInfo?: ConnectionResult;
}

/**
 * Get the connection between two users
 */
export async function getConnection(
  userId: number,
  targetUserId: number
): Promise<ConnectionResult> {
  if (userId === targetUserId) {
    return { isConnected: true, connectionDegree: 0, closenessScore: 100, path: [userId] };
  }

  const cacheKey = `${Math.min(userId, targetUserId)}-${Math.max(userId, targetUserId)}`;
  const cached = connectionCache.get(cacheKey);
  
  if (cached && cached.expiry > Date.now()) {
    return cached.result;
  }

  // Check direct friendship (1st degree)
  const directFriendship = await db
    .select({
      closenessScore: friendships.closenessScore,
      connectionDegree: friendships.connectionDegree,
    })
    .from(friendships)
    .where(
      and(
        or(
          and(eq(friendships.userId, userId), eq(friendships.friendId, targetUserId)),
          and(eq(friendships.userId, targetUserId), eq(friendships.friendId, userId))
        ),
        eq(friendships.status, "accepted")
      )
    )
    .limit(1);

  if (directFriendship.length > 0) {
    const result: ConnectionResult = {
      isConnected: true,
      connectionDegree: 1,
      closenessScore: directFriendship[0].closenessScore || 0,
      path: [userId, targetUserId],
    };
    connectionCache.set(cacheKey, { result, expiry: Date.now() + CACHE_TTL });
    return result;
  }

  // Check 2nd degree (friends of friends)
  const secondDegree = await db.execute(sql`
    SELECT 
      f1.friend_id as mutual_friend,
      f2.closeness_score as score
    FROM friendships f1
    INNER JOIN friendships f2 ON f1.friend_id = f2.user_id
    WHERE f1.user_id = ${userId}
      AND f2.friend_id = ${targetUserId}
      AND f1.status = 'accepted'
      AND f2.status = 'accepted'
    LIMIT 1
  `);

  if (secondDegree.rows && secondDegree.rows.length > 0) {
    const row = secondDegree.rows[0] as { mutual_friend: number; score: number };
    const result: ConnectionResult = {
      isConnected: true,
      connectionDegree: 2,
      closenessScore: row.score || 0,
      path: [userId, row.mutual_friend, targetUserId],
    };
    connectionCache.set(cacheKey, { result, expiry: Date.now() + CACHE_TTL });
    return result;
  }

  // Check 3rd degree (extended network)
  const thirdDegree = await db.execute(sql`
    SELECT 
      f1.friend_id as friend1,
      f2.friend_id as friend2,
      f3.closeness_score as score
    FROM friendships f1
    INNER JOIN friendships f2 ON f1.friend_id = f2.user_id
    INNER JOIN friendships f3 ON f2.friend_id = f3.user_id
    WHERE f1.user_id = ${userId}
      AND f3.friend_id = ${targetUserId}
      AND f1.status = 'accepted'
      AND f2.status = 'accepted'
      AND f3.status = 'accepted'
    LIMIT 1
  `);

  if (thirdDegree.rows && thirdDegree.rows.length > 0) {
    const row = thirdDegree.rows[0] as { friend1: number; friend2: number; score: number };
    const result: ConnectionResult = {
      isConnected: true,
      connectionDegree: 3,
      closenessScore: row.score || 0,
      path: [userId, row.friend1, row.friend2, targetUserId],
    };
    connectionCache.set(cacheKey, { result, expiry: Date.now() + CACHE_TTL });
    return result;
  }

  // Not connected
  const result: ConnectionResult = {
    isConnected: false,
    connectionDegree: null,
    closenessScore: null,
  };
  connectionCache.set(cacheKey, { result, expiry: Date.now() + CACHE_TTL });
  return result;
}

/**
 * Check if a user can access content based on closeness visibility setting
 */
export async function checkVisibilityAccess(
  viewerId: number,
  ownerId: number,
  visibility: ClosenessVisibility
): Promise<VisibilityCheckResult> {
  // Everyone can access 'all' content
  if (visibility === "all") {
    return { canAccess: true, reason: "Content is public" };
  }

  // Owner always has access
  if (viewerId === ownerId) {
    return { canAccess: true, reason: "Owner access" };
  }

  const connection = await getConnection(viewerId, ownerId);

  switch (visibility) {
    case "close_friend":
      // Requires closeness score >= 71
      if (connection.isConnected && connection.closenessScore && connection.closenessScore >= 71) {
        return { canAccess: true, reason: "Close friend", connectionInfo: connection };
      }
      return { canAccess: false, reason: "Only close friends can access", connectionInfo: connection };

    case "friends_1st":
      // Requires direct friendship
      if (connection.connectionDegree === 1) {
        return { canAccess: true, reason: "Direct friend", connectionInfo: connection };
      }
      return { canAccess: false, reason: "Only direct friends can access", connectionInfo: connection };

    case "friends_2nd":
      // Requires 1st or 2nd degree connection
      if (connection.connectionDegree && connection.connectionDegree <= 2) {
        return { canAccess: true, reason: "Within 2nd degree", connectionInfo: connection };
      }
      return { canAccess: false, reason: "Only friends and friends of friends can access", connectionInfo: connection };

    case "friends_3rd":
      // Requires 1st, 2nd, or 3rd degree connection
      if (connection.connectionDegree && connection.connectionDegree <= 3) {
        return { canAccess: true, reason: "Within 3rd degree", connectionInfo: connection };
      }
      return { canAccess: false, reason: "Only extended network can access", connectionInfo: connection };

    default:
      return { canAccess: true, reason: "Default public access" };
  }
}

/**
 * Get all users within a specific closeness level from a user
 * Useful for filtering content in bulk
 */
export async function getUsersWithinCloseness(
  userId: number,
  visibility: ClosenessVisibility
): Promise<number[]> {
  if (visibility === "all") {
    return []; // Empty means no filtering needed
  }

  const results: number[] = [userId]; // Always include self

  // Get 1st degree friends
  const firstDegree = await db
    .select({ friendId: friendships.friendId, closenessScore: friendships.closenessScore })
    .from(friendships)
    .where(and(eq(friendships.userId, userId), eq(friendships.status, "accepted")));

  if (visibility === "close_friend") {
    // Only friends with closeness >= 71
    return results.concat(
      firstDegree
        .filter((f) => f.closenessScore && f.closenessScore >= 71)
        .map((f) => f.friendId)
    );
  }

  if (visibility === "friends_1st") {
    return results.concat(firstDegree.map((f) => f.friendId));
  }

  // Add all 1st degree for 2nd and 3rd degree visibility
  const firstDegreeIds = firstDegree.map((f) => f.friendId);
  results.push(...firstDegreeIds);

  if (visibility === "friends_2nd" || visibility === "friends_3rd") {
    // Get 2nd degree
    const secondDegree = await db.execute(sql`
      SELECT DISTINCT f2.friend_id
      FROM friendships f1
      INNER JOIN friendships f2 ON f1.friend_id = f2.user_id
      WHERE f1.user_id = ${userId}
        AND f1.status = 'accepted'
        AND f2.status = 'accepted'
        AND f2.friend_id != ${userId}
    `);

    if (secondDegree.rows) {
      results.push(...(secondDegree.rows as { friend_id: number }[]).map((r) => r.friend_id));
    }
  }

  if (visibility === "friends_3rd") {
    // Get 3rd degree
    const thirdDegree = await db.execute(sql`
      SELECT DISTINCT f3.friend_id
      FROM friendships f1
      INNER JOIN friendships f2 ON f1.friend_id = f2.user_id
      INNER JOIN friendships f3 ON f2.friend_id = f3.user_id
      WHERE f1.user_id = ${userId}
        AND f1.status = 'accepted'
        AND f2.status = 'accepted'
        AND f3.status = 'accepted'
        AND f3.friend_id != ${userId}
    `);

    if (thirdDegree.rows) {
      results.push(...(thirdDegree.rows as { friend_id: number }[]).map((r) => r.friend_id));
    }
  }

  return [...new Set(results)]; // Remove duplicates
}

/**
 * Clear connection cache for a user (call when friendships change)
 */
export function clearConnectionCache(userId: number): void {
  for (const key of connectionCache.keys()) {
    if (key.includes(userId.toString())) {
      connectionCache.delete(key);
    }
  }
}

/**
 * Clear entire cache (for admin/maintenance)
 */
export function clearAllConnectionCache(): void {
  connectionCache.clear();
}

export default {
  getConnection,
  checkVisibilityAccess,
  getUsersWithinCloseness,
  clearConnectionCache,
  clearAllConnectionCache,
};
