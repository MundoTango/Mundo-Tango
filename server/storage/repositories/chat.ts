import { db } from "../core/connection";
import {
  chatRooms,
  chatRoomUsers,
  chatMessages,
  mrBlueConversations,
  mrBlueMessages,
  memories,
  type InsertChatMessage,
  type SelectChatMessage,
  type InsertChatRoom,
  type SelectChatRoom,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * ChatRepository - Handles all chat and messaging operations
 * Migrated from DbStorage class as part of Sprint  2.2
 * 
 * Manages:
 * - Chat rooms
 * - Chat messages
 * - Mr. Blue AI conversations
 * - Memory/conversation summaries
 * 
 * @see server/storage.ts (legacy DbStorage class)
 */
export class ChatRepository {
  // Chat Rooms & Messages
  async getChatRoomMessages(roomId: number, params: { limit?: number; offset?: number }): Promise<SelectChatMessage[]> {
    const { limit = 50, offset = 0 } = params;
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async markConversationAsRead(userId: number, roomId: number): Promise<void> {
    // Update read status for all messages in the room for this user
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(and(
        eq(chatMessages.roomId, roomId),
        eq(chatMessages.receiverId, userId)
      ));
  }

  // Mr. Blue Conversations
  async createMrBlueConversation(conversationData: any): Promise<any> {
    const [conversation] = await db
      .insert(mrBlueConversations)
      .values(conversationData)
      .returning();
    return conversation;
  }

  async createMrBlueMessage(messageData: any): Promise<any> {
    const [message] = await db
      .insert(mrBlueMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getMrBlueConversations(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(mrBlueConversations)
      .where(eq(mrBlueConversations.userId, userId))
      .orderBy(desc(mrBlueConversations.updatedAt));
  }

  // Memory Management
  async createMemory(memoryData: any): Promise<any> {
    const [memory] = await db.insert(memories).values(memoryData).returning();
    return memory;
  }

  async getMemories(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.createdAt));
  }

  async updateMemory(id: number, data: any): Promise<any | undefined> {
    const [updated] = await db
      .update(memories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(memories.id, id))
      .returning();
    return updated;
  }
}

// Export singleton instance
export const chatRepository = new ChatRepository();
