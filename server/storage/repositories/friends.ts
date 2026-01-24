/**
 * Friend Repository
 * Handles friend relationship operations
 * Sprint 1.3 Phase 4: Specialized Repositories
 */

import { db } from '../core/connection';
import { eq, and } from 'drizzle-orm';
import { follows } from '@shared/schema';
import type { SelectFollow, InsertFollow } from '@shared/schema';

export class FriendRepository {
  /**
   * Get user's friends (mutual follows)
   */
  async getUserFriends(userId: number): Promise<any[]> {
    // Friends are mutual follows
    const userFollows = await db
      .select()
      .from(follows)
      .where(eq(follows.followerId, userId));
    
    return userFollows;
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: number, data: any): Promise<void> {
    // Implementation depends on friend request schema
    // For now, accepting means creating a bidirectional follow
    await db
      .update(follows)
      .set({ status: 'accepted', ...data })
      .where(eq(follows.id, requestId));
  }

  /**
   * Remove a friend (delete mutual follows)
   */
  async removeFriend(userId: number, friendId: number): Promise<void> {
    // Remove both directions of the friendship
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, userId),
          eq(follows.followingId, friendId)
        )
      );
    
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, friendId),
          eq(follows.followingId, userId)
        )
      );
  }
}

export const friendRepository = new FriendRepository();
