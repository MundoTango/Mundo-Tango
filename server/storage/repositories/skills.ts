/**
 * Skills Repository
 * Handles user skills and endorsements database operations
 * MB.MD God Command #6: NEVER change ID column types
 * MB.MD God Command #2: Separation of concerns - extracted from storage.ts
 */

import { eq, and, desc } from 'drizzle-orm';
import { db as defaultDb } from '../core/connection';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  userSkills,
  skillEndorsements,
} from '@shared/schema';

// Infer types from tables
type SelectUserSkill = typeof userSkills.$inferSelect;
type InsertUserSkill = typeof userSkills.$inferInsert;
type SelectSkillEndorsement = typeof skillEndorsements.$inferSelect;
type InsertSkillEndorsement = typeof skillEndorsements.$inferInsert;

// ==============================
// Custom Error Classes
// ==============================

export class SkillsRepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SkillsRepositoryError';
  }
}

export class SkillsValidationError extends SkillsRepositoryError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'SkillsValidationError';
  }
}

export class SkillsDatabaseError extends SkillsRepositoryError {
  constructor(message: string, cause?: unknown) {
    super(message, 'DATABASE_ERROR', cause);
    this.name = 'SkillsDatabaseError';
  }
}

// ==============================
// Validation Helpers
// ==============================

const validateId = (id: number, fieldName: string = 'id'): void => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new SkillsValidationError(`Invalid ${fieldName}: ${id}. Must be a positive integer.`);
  }
};

const validateSkillInput = (data: InsertUserSkill): void => {
  validateId(data.userId, 'userId');
  if (!data.skillName || data.skillName.trim().length === 0) {
    throw new SkillsValidationError('Skill name is required');
  }
  if (data.skillName.length > 100) {
    throw new SkillsValidationError('Skill name must be 100 characters or less');
  }
  const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  if (data.level && !validLevels.includes(data.level)) {
    throw new SkillsValidationError(`Invalid level: ${data.level}. Must be one of: ${validLevels.join(', ')}`);
  }
};

// ==============================
// Skills Repository
// ==============================

export class SkillsRepository {
  private db: NeonHttpDatabase<Record<string, never>>;

  constructor(database?: NeonHttpDatabase<Record<string, never>>) {
    this.db = database || defaultDb;
  }

  // ==============================
  // User Skills
  // ==============================

  async getSkill(id: number): Promise<SelectUserSkill | null> {
    validateId(id);
    try {
      const result = await this.db.select().from(userSkills).where(eq(userSkills.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new SkillsDatabaseError('Failed to get skill', error);
    }
  }

  async getUserSkills(userId: number): Promise<SelectUserSkill[]> {
    validateId(userId, 'userId');
    try {
      return await this.db
        .select()
        .from(userSkills)
        .where(eq(userSkills.userId, userId))
        .orderBy(desc(userSkills.createdAt));
    } catch (error) {
      throw new SkillsDatabaseError('Failed to get user skills', error);
    }
  }

  async createSkill(data: InsertUserSkill): Promise<SelectUserSkill> {
    validateSkillInput(data);
    try {
      const [result] = await this.db.insert(userSkills).values(data).returning();
      return result;
    } catch (error) {
      throw new SkillsDatabaseError('Failed to create skill', error);
    }
  }

  async updateSkill(id: number, data: Partial<SelectUserSkill>): Promise<SelectUserSkill | null> {
    validateId(id);
    try {
      const [result] = await this.db
        .update(userSkills)
        .set(data)
        .where(eq(userSkills.id, id))
        .returning();
      return result || null;
    } catch (error) {
      throw new SkillsDatabaseError('Failed to update skill', error);
    }
  }

  async deleteSkill(id: number): Promise<void> {
    validateId(id);
    try {
      await this.db.delete(userSkills).where(eq(userSkills.id, id));
    } catch (error) {
      throw new SkillsDatabaseError('Failed to delete skill', error);
    }
  }

  // ==============================
  // Skill Endorsements
  // ==============================

  async getEndorsement(id: number): Promise<SelectSkillEndorsement | null> {
    validateId(id);
    try {
      const result = await this.db.select().from(skillEndorsements).where(eq(skillEndorsements.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new SkillsDatabaseError('Failed to get endorsement', error);
    }
  }

  async getSkillEndorsements(skillId: number): Promise<SelectSkillEndorsement[]> {
    validateId(skillId, 'skillId');
    try {
      return await this.db
        .select()
        .from(skillEndorsements)
        .where(eq(skillEndorsements.skillId, skillId))
        .orderBy(desc(skillEndorsements.createdAt));
    } catch (error) {
      throw new SkillsDatabaseError('Failed to get skill endorsements', error);
    }
  }

  async createEndorsement(data: InsertSkillEndorsement): Promise<SelectSkillEndorsement> {
    validateId(data.skillId, 'skillId');
    validateId(data.endorserId, 'endorserId');
    try {
      const [result] = await this.db.insert(skillEndorsements).values(data).returning();
      return result;
    } catch (error) {
      throw new SkillsDatabaseError('Failed to create endorsement', error);
    }
  }

  async deleteEndorsement(id: number): Promise<void> {
    validateId(id);
    try {
      await this.db.delete(skillEndorsements).where(eq(skillEndorsements.id, id));
    } catch (error) {
      throw new SkillsDatabaseError('Failed to delete endorsement', error);
    }
  }

  async removeEndorsement(skillId: number, endorserId: number): Promise<void> {
    validateId(skillId, 'skillId');
    validateId(endorserId, 'endorserId');
    try {
      await this.db
        .delete(skillEndorsements)
        .where(and(
          eq(skillEndorsements.skillId, skillId),
          eq(skillEndorsements.endorserId, endorserId)
        ));
    } catch (error) {
      throw new SkillsDatabaseError('Failed to remove endorsement', error);
    }
  }
}

// Export singleton instance
export const skillsRepository = new SkillsRepository();
