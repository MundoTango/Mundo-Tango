/**
 * Bookmark Repository
 * Handles bookmark/saved content operations
 * Sprint 1.3 Phase 4: Specialized Repositories
 */

import { db } from '../core/connection';
import { eq, and } from 'drizzle-orm';
import { savedPosts as bookmarks } from '@shared/schema';
import type { SelectBookmark, InsertBookmark } from '@shared/schema';

export class BookmarkRepository {
  /**
   * Get user's bookmarks by collection
   */
  async getUserBookmarks(userId: number, collection?: string): Promise<SelectBookmark[]> {
    let query = db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));
    
    if (collection) {
      query = query.where(eq(bookmarks.collection, collection)) as any;
    }
    
    return await query;
  }

  /**
   * Create a bookmark
   */
  async createBookmark(data: InsertBookmark): Promise<SelectBookmark> {
    const [bookmark] = await db
      .insert(bookmarks)
      .values(data)
      .returning();
    
    return bookmark;
  }

  /**
   * Delete a bookmark
   */
  async deleteBookmark(userId: number, postId: number): Promise<void> {
    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.postId, postId)
        )
      );
  }
}

export const bookmarkRepository = new BookmarkRepository();
