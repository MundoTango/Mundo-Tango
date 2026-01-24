/**
 * Album Repository
 * Handles photo album operations
 * Sprint 1.3 Phase 4: Specialized Repositories
 */

import { db } from '../core/connection';
import { eq } from 'drizzle-orm';
import { media as albums } from '@shared/schema';
import type { SelectAlbum, InsertAlbum } from '@shared/schema';

export class AlbumRepository {
  /**
   * Get user's albums
   */
  async getUserAlbums(userId: number): Promise<SelectAlbum[]> {
    return await db
      .select()
      .from(albums)
      .where(eq(albums.userId, userId));
  }

  /**
   * Create an album
   */
  async createAlbum(data: InsertAlbum): Promise<SelectAlbum> {
    const [album] = await db
      .insert(albums)
      .values(data)
      .returning();
    
    return album;
  }

  /**
   * Update an album
   */
  async updateAlbum(albumId: number, data: Partial<InsertAlbum>): Promise<SelectAlbum | undefined> {
    const [updated] = await db
      .update(albums)
      .set(data)
      .where(eq(albums.id, albumId))
      .returning();
    
    return updated;
  }

  /**
   * Delete an album
   */
  async deleteAlbum(albumId: number): Promise<void> {
    await db
      .delete(albums)
      .where(eq(albums.id, albumId));
  }
}

export const albumRepository = new AlbumRepository();
