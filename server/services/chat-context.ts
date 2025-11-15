import { db } from '../db';
import { mrBlueMessages, mrBlueConversations } from '@shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function getConversationContext(
  conversationId: number,
  contextWindow: number = 10
) {
  const recentMessages = await db.query.mrBlueMessages.findMany({
    where: eq(mrBlueMessages.conversationId, conversationId),
    orderBy: [desc(mrBlueMessages.createdAt)],
    limit: contextWindow,
  });
  
  return recentMessages.reverse().map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

export async function saveMessageToHistory(
  conversationId: number,
  userId: number,
  role: 'user' | 'assistant',
  content: string,
  metadata?: any
) {
  const [message] = await db.insert(mrBlueMessages)
    .values({
      conversationId,
      userId,
      role,
      content,
      metadata,
      createdAt: sql`now()`,
    })
    .returning();
    
  await db.update(mrBlueConversations)
    .set({ 
      updatedAt: sql`now()`,
      lastMessageAt: sql`now()`,
    })
    .where(eq(mrBlueConversations.id, conversationId));
    
  return message;
}
