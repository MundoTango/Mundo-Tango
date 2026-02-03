/**
 * User Repository
 * Handles all user-related database operations
 * MB.MD God Command #6: NEVER change ID column types
 */

import { eq, and, gt } from 'drizzle-orm';
import {
  users,
  refreshTokens,
  emailVerificationTokens,
  passwordResetTokens,
  twoFactorSecrets,
  type SelectUser,
  type InsertUser,
  type SelectRefreshToken,
  type InsertRefreshToken,
  type SelectEmailVerificationToken,
  type InsertEmailVerificationToken,
  type SelectPasswordResetToken,
  type InsertPasswordResetToken,
  type SelectTwoFactorSecret,
  type InsertTwoFactorSecret,
} from '@shared/schema';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { db as defaultDb } from '../core/connection';

export class UserRepository {
  constructor(private db: NeonHttpDatabase = defaultDb) {}

  // ==============================
  // User CRUD Operations
  // ==============================

  async getUserById(id: number): Promise<SelectUser | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<SelectUser | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<SelectUser | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByStripeCustomerId(customerId: string): Promise<SelectUser | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<SelectUser> {
    // Explicitly set isActive: true to ensure new users are active by default
    // This prevents issues where the database default might not beapplied correctly
    const result = await this.db
      .insert(users)
      .values({ ...user, isActive: true } as any)
      .returning();
    return result[0];
  }

  async updateUser(id: number, data: Partial<SelectUser>): Promise<SelectUser | undefined> {
    const result = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await this.db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateUserSubscription(
    userId: number,
    data: {
      stripeSubscriptionId?: string;
      stripeCustomerId?: string;
      plan?: string;
      status?: 'active' | 'canceled' | 'past_due';
      currentPeriodEnd?: Date;
    }
  ): Promise<void> {
    await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // ==============================
  // Refresh Tokens
  // ==============================

  async createRefreshToken(token: InsertRefreshToken): Promise<SelectRefreshToken> {
    const result = await this.db.insert(refreshTokens).values(token).returning();
    return result[0];
  }

  async getRefreshToken(token: string): Promise<SelectRefreshToken | undefined> {
    const result = await this.db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.token, token), gt(refreshTokens.expiresAt, new Date())))
      .limit(1);
    return result[0];
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteUserRefreshTokens(userId: number): Promise<void> {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  // ==============================
  // Email Verification Tokens
  // ==============================

  async createEmailVerificationToken(
    token: InsertEmailVerificationToken
  ): Promise<SelectEmailVerificationToken> {
    const result = await this.db.insert(emailVerificationTokens).values(token).returning();
    return result[0];
  }

  async getEmailVerificationToken(token: string): Promise<SelectEmailVerificationToken | undefined> {
    const result = await this.db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          gt(emailVerificationTokens.expiresAt, new Date())
        )
      )
      .limit(1);
    return result[0];
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    await this.db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
  }

  async getEmailVerificationTokenByUserId(
    userId: number
  ): Promise<SelectEmailVerificationToken | undefined> {
    const result = await this.db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.userId, userId),
          gt(emailVerificationTokens.expiresAt, new Date())
        )
      )
      .orderBy(emailVerificationTokens.createdAt)
      .limit(1);
    return result[0];
  }

  // ==============================
  // Password Reset Tokens
  // ==============================

  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<SelectPasswordResetToken> {
    const result = await this.db.insert(passwordResetTokens).values(token).returning();
    return result[0];
  }

  async getPasswordResetToken(token: string): Promise<SelectPasswordResetToken | undefined> {
    const result = await this.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);
    return result[0];
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  async deleteUserPasswordResetTokens(userId: number): Promise<void> {
    await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  }

  // ==============================
  // Two-Factor Authentication
  // ==============================

  async createTwoFactorSecret(secret: InsertTwoFactorSecret): Promise<SelectTwoFactorSecret> {
    const result = await this.db.insert(twoFactorSecrets).values(secret).returning();
    return result[0];
  }

  async getTwoFactorSecret(userId: number): Promise<SelectTwoFactorSecret | undefined> {
    const result = await this.db
      .select()
      .from(twoFactorSecrets)
      .where(eq(twoFactorSecrets.userId, userId))
      .limit(1);
    return result[0];
  }

  async updateTwoFactorSecret(userId: number, secret: Partial<SelectTwoFactorSecret>): Promise<void> {
    await this.db.update(twoFactorSecrets).set(secret).where(eq(twoFactorSecrets.userId, userId));
  }

  async deleteTwoFactorSecret(userId: number): Promise<void> {
    await this.db.delete(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
  }
}

// Export singleton instance for backward compatibility
export const userRepository = new UserRepository();
