import { Request, Response } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { chatMessages } from '@shared/schema';

export async function getUnreadCount(userId: number) {
  try {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(chatMessages)
      .where(sql`(${chatMessages.readBy} IS NULL OR NOT (${userId} = ANY(${chatMessages.readBy})))`);
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