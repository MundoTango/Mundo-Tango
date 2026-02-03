/**
 * Auth/Security Repository
 * Handles authentication tokens and security audit database operations
 * MB.MD God Command #6: NEVER change ID column types
 * MB.MD God Command #2: Separation of concerns - extracted from storage.ts
 */

import { eq, and, lt, desc } from 'drizzle-orm';
import { db as defaultDb } from '../core/connection';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  refreshTokens,
  emailVerificationTokens,
  passwordResetTokens,
  twoFactorSecrets,
  securityAuditLogs,
} from '@shared/schema';

// Infer types from tables
type SelectRefreshToken = typeof refreshTokens.$inferSelect;
type InsertRefreshToken = typeof refreshTokens.$inferInsert;
type SelectEmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
type InsertEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;
type SelectPasswordResetToken = typeof passwordResetTokens.$inferSelect;
type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
type SelectTwoFactorSecret = typeof twoFactorSecrets.$inferSelect;
type InsertTwoFactorSecret = typeof twoFactorSecrets.$inferInsert;
type SelectSecurityAuditLog = typeof securityAuditLogs.$inferSelect;
type InsertSecurityAuditLog = typeof securityAuditLogs.$inferInsert;

// ==============================
// Custom Error Classes
// ==============================

export class SecurityRepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SecurityRepositoryError';
  }
}

export class SecurityValidationError extends SecurityRepositoryError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'SecurityValidationError';
  }
}

export class SecurityDatabaseError extends SecurityRepositoryError {
  constructor(message: string, cause?: unknown) {
    super(message, 'DATABASE_ERROR', cause);
    this.name = 'SecurityDatabaseError';
  }
}

// ==============================
// Validation Helpers
// ==============================

const validateId = (id: number, fieldName: string = 'id'): void => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new SecurityValidationError(`Invalid ${fieldName}: ${id}. Must be a positive integer.`);
  }
};

const validateToken = (token: string, fieldName: string = 'token'): void => {
  if (!token || token.trim().length === 0) {
    throw new SecurityValidationError(`${fieldName} is required`);
  }
};

// ==============================
// Security Repository
// ==============================

export class SecurityRepository {
  private db: NeonHttpDatabase<Record<string, never>>;

  constructor(database?: NeonHttpDatabase<Record<string, never>>) {
    this.db = database || defaultDb;
  }

  // ==============================
  // Refresh Tokens
  // ==============================

  async getRefreshToken(token: string): Promise<SelectRefreshToken | null> {
    validateToken(token);
    try {
      const result = await this.db.select().from(refreshTokens).where(eq(refreshTokens.token, token)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new SecurityDatabaseError('Failed to get refresh token', error);
    }
  }

  async createRefreshToken(data: InsertRefreshToken): Promise<SelectRefreshToken> {
    validateId(data.userId, 'userId');
    validateToken(data.token);
    try {
      const [result] = await this.db.insert(refreshTokens).values(data).returning();
      return result;
    } catch (error) {
      throw new SecurityDatabaseError('Failed to create refresh token', error);
    }
  }

  async deleteRefreshToken(token: string): Promise<void> {
    validateToken(token);
    try {
      await this.db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    } catch (error) {
      throw new SecurityDatabaseError('Failed to delete refresh token', error);
    }
  }

  async deleteUserRefreshTokens(userId: number): Promise<void> {
    validateId(userId, 'userId');
    try {
      await this.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
    } catch (error) {
      throw new SecurityDatabaseError('Failed to delete user refresh tokens', error);
    }
  }

  async cleanExpiredRefreshTokens(): Promise<void> {
    try {
      await this.db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, new Date()));
    } catch (error) {
      throw new SecurityDatabaseError('Failed to clean expired refresh tokens', error);
    }
  }

  // ==============================
  // Email Verification Tokens
  // ==============================

  async getEmailVerificationToken(token: string): Promise<SelectEmailVerificationToken | null> {
    validateToken(token);
    try {
      const result = await this.db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, token)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new SecurityDatabaseError('Failed to get email verification token', error);
    }
  }

  async createEmailVerificationToken(data: InsertEmailVerificationToken): Promise<SelectEmailVerificationToken> {
    validateId(data.userId, 'userId');
    validateToken(data.token);
    try {
      const [result] = await this.db.insert(emailVerificationTokens).values(data).returning();
      return result;
    } catch (error) {
      throw new SecurityDatabaseError('Failed to create email verification token', error);
    }
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    validateToken(token);
    try {
      await this.db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
    } catch (error) {
      throw new SecurityDatabaseError('Failed to delete email verification token', error);
    }
  }

  // ==============================
  // Password Reset Tokens
  // ==============================

  async getPasswordResetToken(token: string): Promise<SelectPasswordResetToken | null> {
    validateToken(token);
    try {
      const result = await this.db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new SecurityDatabaseError('Failed to get password reset token', error);
    }
  }

  async createPasswordResetToken(data: InsertPasswordResetToken): Promise<SelectPasswordResetToken> {
    validateId(data.userId, 'userId');
    validateToken(data.token);
    try {
      const [result] = await this.db.insert(passwordResetTokens).values(data).returning();
      return result;
    } catch (error) {
      throw new SecurityDatabaseError('Failed to create password reset token', error);
    }
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    validateToken(token);
    try {
      await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    } catch (error) {
      throw new SecurityDatabaseError('Failed to delete password reset token', error);
    }
  }

  async deleteUserPasswordResetTokens(userId: number): Promise<void> {
    validateId(userId, 'userId');
    try {
      await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    } catch (error) {
      throw new SecurityDatabaseError('Failed to delete user password reset tokens', error);
    }
  }

  // ==============================
  // Two-Factor Secrets
  // ==============================

  async getTwoFactorSecret(userId: number): Promise<SelectTwoFactorSecret | null> {
    validateId(userId, 'userId');
    try {
      const result = await this.db.select().from(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new SecurityDatabaseError('Failed to get two-factor secret', error);
    }
  }

  async createTwoFactorSecret(data: InsertTwoFactorSecret): Promise<SelectTwoFactorSecret> {
    validateId(data.userId, 'userId');
    try {
      const [result] = await this.db.insert(twoFactorSecrets).values(data).returning();
      return result;
    } catch (error) {
      throw new SecurityDatabaseError('Failed to create two-factor secret', error);
    }
  }

  async deleteTwoFactorSecret(userId: number): Promise<void> {
    validateId(userId, 'userId');
    try {
      await this.db.delete(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
    } catch (error) {
      throw new SecurityDatabaseError('Failed to delete two-factor secret', error);
    }
  }

  // ==============================
  // Security Audit Logs
  // ==============================

  async logSecurityEvent(data: InsertSecurityAuditLog): Promise<SelectSecurityAuditLog> {
    if (data.userId) {
      validateId(data.userId, 'userId');
    }
    try {
      const [result] = await this.db.insert(securityAuditLogs).values(data).returning();
      return result;
    } catch (error) {
      throw new SecurityDatabaseError('Failed to log security event', error);
    }
  }

  async getUserSecurityLogs(userId: number, limit: number = 50): Promise<SelectSecurityAuditLog[]> {
    validateId(userId, 'userId');
    try {
      return await this.db
        .select()
        .from(securityAuditLogs)
        .where(eq(securityAuditLogs.userId, userId))
        .orderBy(desc(securityAuditLogs.createdAt))
        .limit(limit);
    } catch (error) {
      throw new SecurityDatabaseError('Failed to get user security logs', error);
    }
  }
}

// Export singleton instance
export const securityRepository = new SecurityRepository();
