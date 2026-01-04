import { Request, Response } from 'express';
import { db } from '../db';
import { sql, eq, and, or } from 'drizzle-orm';
import { directMessages } from '@shared/schema';

export async function getUnreadCount(userId: number) {
  try {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(directMessages)
      .where(and(
        eq(directMessages.recipientId, userId),
        eq(directMessages.isRead, false)
      ));
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw new Error('Failed to fetch unread count');
  }
}

export async function getMessages() {
  // Implementation of fetching messages
}

export async function sendMessage(messageData: any) {
  // Implementation of sending messages
}