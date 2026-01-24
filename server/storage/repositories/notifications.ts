import { db } from "../core/connection";
import {
  notifications,
  type InsertNotification,
  type SelectNotification,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * NotificationRepository - Handles all notification-related database operations
 * Migrated from DbStorage class as part of Sprint 2.1
 * 
 * Manages:
 * - Notification CRUD operations
 * - Read/unread status tracking
 * - Unread count retrieval
 * 
 * @see server/storage.ts (legacy DbStorage class)
 */
export class NotificationRepository {
  async createNotification(
    notificationData: InsertNotification
  ): Promise<SelectNotification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async getNotifications(userId: number, params: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<SelectNotification[]> {
    const { limit = 50, offset = 0, unreadOnly = false } = params;
    
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    if (unreadOnly) {
      query = query.where(eq(notifications.isRead, false));
    }

    return await query
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async markNotificationAsRead(id: number): Promise<SelectNotification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async getUnreadCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: db.$count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return result[0]?.count || 0;
  }
}

// Export singleton instance
export const notificationRepository = new NotificationRepository();
