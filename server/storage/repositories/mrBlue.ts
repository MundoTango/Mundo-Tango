/**
 * Mr. Blue AI Repository
 * Handles AI conversation and message database operations
 * MB.MD God Command #6: NEVER change ID column types
 * MB.MD God Command #2: Separation of concerns - extracted from storage.ts
 */

import { eq, and, desc, asc } from 'drizzle-orm';
import { db as defaultDb } from '../core/connection';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  mrBlueConversations,
  mrBlueMessages,
  workflowPatterns,
  userWorkflowActions,
} from '@shared/schema';

// Infer types from tables
type SelectMrBlueConversation = typeof mrBlueConversations.$inferSelect;
type InsertMrBlueConversation = typeof mrBlueConversations.$inferInsert;
type SelectMrBlueMessage = typeof mrBlueMessages.$inferSelect;
type InsertMrBlueMessage = typeof mrBlueMessages.$inferInsert;
type SelectWorkflowPattern = typeof workflowPatterns.$inferSelect;
type InsertWorkflowPattern = typeof workflowPatterns.$inferInsert;
type SelectUserWorkflowAction = typeof userWorkflowActions.$inferSelect;
type InsertUserWorkflowAction = typeof userWorkflowActions.$inferInsert;

// ==============================
// Custom Error Classes
// ==============================

export class MrBlueRepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'MrBlueRepositoryError';
  }
}

export class MrBlueValidationError extends MrBlueRepositoryError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'MrBlueValidationError';
  }
}

export class MrBlueDatabaseError extends MrBlueRepositoryError {
  constructor(message: string, cause?: unknown) {
    super(message, 'DATABASE_ERROR', cause);
    this.name = 'MrBlueDatabaseError';
  }
}

// ==============================
// Validation Helpers
// ==============================

const validateId = (id: number, fieldName: string = 'id'): void => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new MrBlueValidationError(`Invalid ${fieldName}: ${id}. Must be a positive integer.`);
  }
};

const validateConversationInput = (data: InsertMrBlueConversation): void => {
  validateId(data.userId, 'userId');
  if (data.contextWindow != null && (data.contextWindow < 1 || data.contextWindow > 100)) {
    throw new MrBlueValidationError('contextWindow must be between 1 and 100');
  }
};

const validateMessageInput = (data: InsertMrBlueMessage): void => {
  validateId(data.conversationId, 'conversationId');
  validateId(data.userId, 'userId');
  if (!data.role || !['user', 'assistant', 'system'].includes(data.role)) {
    throw new MrBlueValidationError(`Invalid role: ${data.role}. Must be 'user', 'assistant', or 'system'.`);
  }
  if (!data.content || data.content.trim().length === 0) {
    throw new MrBlueValidationError('Message content cannot be empty');
  }
};

// ==============================
// Mr. Blue Repository
// ==============================

export class MrBlueRepository {
  private db: NeonHttpDatabase<Record<string, never>>;

  constructor(database?: NeonHttpDatabase<Record<string, never>>) {
    this.db = database || defaultDb;
  }

  // ==============================
  // Conversations
  // ==============================

  async getConversation(id: number): Promise<SelectMrBlueConversation | null> {
    validateId(id);
    try {
      const result = await this.db.select().from(mrBlueConversations).where(eq(mrBlueConversations.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to get conversation', error);
    }
  }

  async getUserConversations(userId: number, limit: number = 50): Promise<SelectMrBlueConversation[]> {
    validateId(userId, 'userId');
    try {
      return await this.db
        .select()
        .from(mrBlueConversations)
        .where(eq(mrBlueConversations.userId, userId))
        .orderBy(desc(mrBlueConversations.lastMessageAt))
        .limit(limit);
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to get user conversations', error);
    }
  }

  async createConversation(data: InsertMrBlueConversation): Promise<SelectMrBlueConversation> {
    validateConversationInput(data);
    try {
      const [result] = await this.db.insert(mrBlueConversations).values(data).returning();
      return result;
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to create conversation', error);
    }
  }

  async updateConversation(id: number, data: Partial<SelectMrBlueConversation>): Promise<SelectMrBlueConversation | null> {
    validateId(id);
    try {
      const [result] = await this.db
        .update(mrBlueConversations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(mrBlueConversations.id, id))
        .returning();
      return result || null;
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to update conversation', error);
    }
  }

  async deleteConversation(id: number): Promise<void> {
    validateId(id);
    try {
      await this.db.delete(mrBlueConversations).where(eq(mrBlueConversations.id, id));
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to delete conversation', error);
    }
  }

  // ==============================
  // Messages
  // ==============================

  async getMessage(id: number): Promise<SelectMrBlueMessage | null> {
    validateId(id);
    try {
      const result = await this.db.select().from(mrBlueMessages).where(eq(mrBlueMessages.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to get message', error);
    }
  }

  async getConversationMessages(conversationId: number, limit: number = 50): Promise<SelectMrBlueMessage[]> {
    validateId(conversationId, 'conversationId');
    try {
      return await this.db
        .select()
        .from(mrBlueMessages)
        .where(eq(mrBlueMessages.conversationId, conversationId))
        .orderBy(asc(mrBlueMessages.createdAt))
        .limit(limit);
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to get conversation messages', error);
    }
  }

  async createMessage(data: InsertMrBlueMessage): Promise<SelectMrBlueMessage> {
    validateMessageInput(data);
    try {
      const [result] = await this.db.insert(mrBlueMessages).values(data).returning();
      
      // Update conversation's lastMessageAt
      await this.db
        .update(mrBlueConversations)
        .set({ lastMessageAt: new Date(), updatedAt: new Date() })
        .where(eq(mrBlueConversations.id, data.conversationId));
      
      return result;
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to create message', error);
    }
  }

  async deleteMessage(id: number): Promise<void> {
    validateId(id);
    try {
      // Soft delete
      await this.db.update(mrBlueMessages).set({ deletedAt: new Date() }).where(eq(mrBlueMessages.id, id));
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to delete message', error);
    }
  }

  // ==============================
  // Workflow Patterns
  // ==============================

  async getUserWorkflowPatterns(userId: number, limit: number = 20): Promise<SelectWorkflowPattern[]> {
    validateId(userId, 'userId');
    try {
      return await this.db
        .select()
        .from(workflowPatterns)
        .where(eq(workflowPatterns.userId, userId))
        .orderBy(desc(workflowPatterns.confidence))
        .limit(limit);
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to get workflow patterns', error);
    }
  }

  async createWorkflowPattern(data: InsertWorkflowPattern): Promise<SelectWorkflowPattern> {
    validateId(data.userId, 'userId');
    try {
      const [result] = await this.db.insert(workflowPatterns).values(data).returning();
      return result;
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to create workflow pattern', error);
    }
  }

  // ==============================
  // User Workflow Actions
  // ==============================

  async logWorkflowAction(data: InsertUserWorkflowAction): Promise<SelectUserWorkflowAction> {
    validateId(data.userId, 'userId');
    try {
      const [result] = await this.db.insert(userWorkflowActions).values(data).returning();
      return result;
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to log workflow action', error);
    }
  }

  async getRecentWorkflowActions(userId: number, limit: number = 10): Promise<SelectUserWorkflowAction[]> {
    validateId(userId, 'userId');
    try {
      return await this.db
        .select()
        .from(userWorkflowActions)
        .where(eq(userWorkflowActions.userId, userId))
        .orderBy(desc(userWorkflowActions.timestamp))
        .limit(limit);
    } catch (error) {
      throw new MrBlueDatabaseError('Failed to get recent workflow actions', error);
    }
  }
}

// Export singleton instance
export const mrBlueRepository = new MrBlueRepository();
