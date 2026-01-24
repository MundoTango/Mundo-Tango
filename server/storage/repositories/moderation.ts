import { db } from "../core/connection";
import {
  blockedUsers,
  blockedContent,
  contentReports,
  moderationQueue,
  type InsertBlockedUser,
  type SelectBlockedUser,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * ModerationRepository - Handles all content moderation and safety operations
 * Migrated from DbStorage class as part of Sprint 2.1
 * 
 * Manages:
 * - User blocking/unblocking
 * - Content blocking (posts, comments, etc.)
 * - Content reporting
 * - Moderation queue management
 * 
 * @see server/storage.ts (legacy DbStorage class)
 */
export class ModerationRepository {
  // ============================================
  // USER BLOCKING
  // ============================================

  async blockUser(blockerId: number, blockedId: number, reason?: string): Promise<SelectBlockedUser> {
    const [blocked] = await db
      .insert(blockedUsers)
      .values({
        blockerId,
        blockedId,
        reason,
        blockedAt: new Date(),
      })
      .returning();
    return blocked;
  }

  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    await db
      .delete(blockedUsers)
      .where(
        and(
          eq(blockedUsers.blockerId, blockerId),
          eq(blockedUsers.blockedId, blockedId)
        )
      );
  }

  async isUserBlocked(blockerId: number, blockedId: number): Promise<boolean> {
    const [blocked] = await db
      .select()
      .from(blockedUsers)
      .where(
        and(
          eq(blockedUsers.blockerId, blockerId),
          eq(blockedUsers.blockedId, blockedId)
        )
      )
      .limit(1);
    return !!blocked;
  }

  async getBlockedUsers(userId: number): Promise<SelectBlockedUser[]> {
    return await db
      .select()
      .from(blockedUsers)
      .where(eq(blockedUsers.blockerId, userId))
      .orderBy(desc(blockedUsers.blockedAt));
  }

  // ============================================
  // CONTENT BLOCKING
  // ============================================

  async blockContent(contentData: {
    contentType: string;
    contentId: number;
    blockerId: number;
    reason?: string;
  }): Promise<any> {
    const [blocked] = await db
      .insert(blockedContent)
      .values({
        ...contentData,
        blockedAt: new Date(),
      })
      .returning();
    return blocked;
  }

  async unblockContent(contentType: string, contentId: number): Promise<void> {
    await db
      .delete(blockedContent)
      .where(
        and(
          eq(blockedContent.contentType, contentType),
          eq(blockedContent.contentId, contentId)
        )
      );
  }

  async getBlockedContent(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(blockedContent)
      .where(eq(blockedContent.blockerId, userId))
      .orderBy(desc(blockedContent.blockedAt));
  }

  // ============================================
  // CONTENT REPORTING
  // ============================================

  async reportPost(reportData: {
    contentType: string;
    contentId: number;
    reporterId: number;
    reason: string;
    details?: string;
  }): Promise<any> {
    const [report] = await db
      .insert(contentReports)
      .values({
        ...reportData,
        status: "pending",
        createdAt: new Date(),
      })
      .returning();
    
    // Add to moderation queue
    await db.insert(moderationQueue).values({
      contentType: reportData.contentType,
      contentId: reportData.contentId,
      reportId: report.id,
      priority: "normal",
      status: "pending",
      createdAt: new Date(),
    });

    return report;
  }

  async getModerationQueue(params: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { status, limit = 50, offset = 0 } = params;
    
    let query = db.select().from(moderationQueue);
    
    if (status) {
      query = query.where(eq(moderationQueue.status, status));
    }
    
    return await query
      .orderBy(desc(moderationQueue.priority), desc(moderationQueue.createdAt))
      .limit(limit)
      .offset(offset);
  }
}

// Export singleton instance
export const moderationRepository = new ModerationRepository();
