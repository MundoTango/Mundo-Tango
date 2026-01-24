import { db } from "../core/connection";
import {
  media,
  type Insertmedia,
  type SelectMedia,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

/**
 * MediaRepository - Handles all media and photo operations
 * Migrated from DbStorage class as part of Sprint 2.2
 * 
 * Manages:
 * - Media CRUD operations
 * - Photo uploads
 * - Media metadata
 * 
 * Note: Albums are handled by AlbumRepository
 * 
 * @see server/storage.ts (legacy DbStorage class)
 */
export class MediaRepository {
  async createMedia(mediaData: InsertMedia): Promise<SelectMedia> {
    const [mediaItem] = await db.insert(media).values(mediaData).returning();
    return mediaItem;
  }

  async getMedia(id: number): Promise<SelectMedia | undefined> {
    const [mediaItem] = await db
      .select()
      .from(media)
      .where(eq(media.id, id))
      .limit(1);
    return mediaItem;
  }

  async getUserMedia(userId: number, params: { limit?: number; offset?: number }): Promise<SelectMedia[]> {
    const { limit = 50, offset = 0 } = params;
    return await db
      .select()
      .from(media)
      .where(eq(media.userId, userId))
      .orderBy(desc(media.uploadedAt))
      .limit(limit)
      .offset(offset);
  }

  async updateMedia(id: number, data: Partial<SelectMedia>): Promise<SelectMedia | undefined> {
    const [updated] = await db
      .update(media)
      .set(data)
      .where(eq(media.id, id))
      .returning();
    return updated;
  }

  async deleteMedia(id: number): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  async getPhotosByType(userId: number, type: string): Promise<SelectMedia[]> {
    return await db
      .select()
      .from(media)
      .where(eq(media.userId, userId))
      .where(eq(media.type, type))
      .orderBy(desc(media.uploadedAt));
  }
}

// Export singleton instance
export const mediaRepository = new MediaRepository();
