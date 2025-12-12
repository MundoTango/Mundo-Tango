/**
 * useClosenessFilter Hook
 * 
 * MB.MD Pattern: Friendship Closeness Filter System
 * Extends usePrivacyFilter pattern for closeness-based content filtering.
 * 
 * Evaluates closeness visibility settings and determines access based on:
 * - closenessScore (0-100): Strength of friendship
 * - connectionDegree (1-3): Degrees of separation
 */

import { useQuery } from "@tanstack/react-query";
import type { ClosenessVisibility } from "@shared/schema";

export interface ConnectionInfo {
  isConnected: boolean;
  connectionDegree: number | null;
  closenessScore: number | null;
  path?: number[];
}

export interface ClosenessCheckResult {
  canAccess: boolean;
  reason: string;
  connectionInfo?: ConnectionInfo;
}

export interface UseClosenessFilterOptions {
  viewerId: number | undefined;
  ownerId: number;
  visibility: ClosenessVisibility;
  enabled?: boolean;
}

/**
 * Determine access based on closeness visibility (client-side estimation)
 * For accurate results, use the server-side ConnectionPathService
 */
export function evaluateClosenessAccess(
  visibility: ClosenessVisibility,
  connectionDegree: number | null,
  closenessScore: number | null,
  isOwner: boolean
): ClosenessCheckResult {
  if (isOwner) {
    return { canAccess: true, reason: "Owner access" };
  }

  if (visibility === "all") {
    return { canAccess: true, reason: "Content is public" };
  }

  if (!connectionDegree) {
    return { canAccess: false, reason: "Not connected" };
  }

  switch (visibility) {
    case "close_friend":
      if (closenessScore && closenessScore >= 71) {
        return { canAccess: true, reason: "Close friend" };
      }
      return { canAccess: false, reason: "Only close friends can access" };

    case "friends_1st":
      if (connectionDegree === 1) {
        return { canAccess: true, reason: "Direct friend" };
      }
      return { canAccess: false, reason: "Only direct friends can access" };

    case "friends_2nd":
      if (connectionDegree <= 2) {
        return { canAccess: true, reason: "Within 2nd degree" };
      }
      return { canAccess: false, reason: "Only friends and friends of friends can access" };

    case "friends_3rd":
      if (connectionDegree <= 3) {
        return { canAccess: true, reason: "Within 3rd degree" };
      }
      return { canAccess: false, reason: "Only extended network can access" };

    default:
      return { canAccess: true, reason: "Default public access" };
  }
}

/**
 * Hook to check closeness-based access via API
 */
export function useClosenessFilter({
  viewerId,
  ownerId,
  visibility,
  enabled = true,
}: UseClosenessFilterOptions) {
  const isOwner = viewerId === ownerId;
  const shouldCheck = enabled && !isOwner && visibility !== "all" && viewerId !== undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/connections/check", viewerId, ownerId, visibility],
    enabled: shouldCheck,
  });

  // If owner or public, return immediate access
  if (isOwner) {
    return {
      canAccess: true,
      reason: "Owner access",
      isLoading: false,
      error: null,
      connectionInfo: undefined,
    };
  }

  if (visibility === "all") {
    return {
      canAccess: true,
      reason: "Content is public",
      isLoading: false,
      error: null,
      connectionInfo: undefined,
    };
  }

  if (!viewerId) {
    return {
      canAccess: false,
      reason: "Not logged in",
      isLoading: false,
      error: null,
      connectionInfo: undefined,
    };
  }

  // Return API result
  const result = data as ClosenessCheckResult | undefined;

  return {
    canAccess: result?.canAccess ?? false,
    reason: result?.reason ?? "Checking access...",
    isLoading,
    error,
    connectionInfo: result?.connectionInfo,
  };
}

/**
 * Get closeness label for display
 */
export function getClosenessLevelLabel(visibility: ClosenessVisibility): string {
  switch (visibility) {
    case "close_friend":
      return "Close Friends Only";
    case "friends_1st":
      return "Friends Only";
    case "friends_2nd":
      return "Friends of Friends";
    case "friends_3rd":
      return "Extended Network";
    case "all":
    default:
      return "Everyone";
  }
}

/**
 * Get helper text for closeness level
 */
export function getClosenessHelperText(visibility: ClosenessVisibility): string {
  switch (visibility) {
    case "close_friend":
      return "People you've connected deeply with through tango";
    case "friends_1st":
      return "Your direct friends on the platform";
    case "friends_2nd":
      return "People connected through your friends";
    case "friends_3rd":
      return "Wider community - friends of friends of friends";
    case "all":
    default:
      return "Open to everyone on Mundo Tango";
  }
}

/**
 * Determine minimum required connection for access
 */
export function getMinConnectionDegree(visibility: ClosenessVisibility): number | null {
  switch (visibility) {
    case "close_friend":
    case "friends_1st":
      return 1;
    case "friends_2nd":
      return 2;
    case "friends_3rd":
      return 3;
    case "all":
    default:
      return null;
  }
}

/**
 * Check if a closeness score qualifies as "close friend"
 */
export function isCloseFriend(closenessScore: number | null | undefined): boolean {
  return closenessScore !== null && closenessScore !== undefined && closenessScore >= 71;
}

/**
 * Get friendship tier from closeness score
 */
export function getFriendshipTier(closenessScore: number | null | undefined): string {
  if (closenessScore === null || closenessScore === undefined) {
    return "Not Connected";
  }
  if (closenessScore >= 86) return "Best Friend";
  if (closenessScore >= 71) return "Close Friend";
  if (closenessScore >= 41) return "Friend";
  return "Acquaintance";
}

export default useClosenessFilter;
