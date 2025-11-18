import { db } from "@shared/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * SupabaseSyncService
 * 
 * Syncs Supabase auth.users with Mundo Tango users table
 * Follows MB.MD v9.0 Pattern 25 (Platform Compliance)
 * 
 * Flow:
 * 1. User authenticates via Supabase Facebook OAuth
 * 2. Supabase creates entry in auth.users
 * 3. We sync to MT users table with Facebook metadata
 * 4. Return MT user for application use
 */

export interface SupabaseSyncRequest {
  supabaseUserId: string;
  email: string;
  fullName?: string;
  facebookUserId?: string;
  profileImage?: string;
  facebookScopes?: string[];
}

export class SupabaseSyncService {
  /**
   * Sync or create user from Supabase auth data
   */
  async syncUser(request: SupabaseSyncRequest) {
    console.log('[SupabaseSyncService] Syncing user:', {
      email: request.email,
      supabaseUserId: request.supabaseUserId,
      hasFacebookId: !!request.facebookUserId,
    });

    // Check if user exists by supabaseUserId first
    let existingUser = await db.query.users.findFirst({
      where: eq(users.supabaseUserId, request.supabaseUserId),
    });

    // Fallback: check by email
    if (!existingUser && request.email) {
      existingUser = await db.query.users.findFirst({
        where: eq(users.email, request.email),
      });
    }

    if (existingUser) {
      // Update existing user with Facebook OAuth data
      console.log('[SupabaseSyncService] Updating existing user:', existingUser.id);
      
      const [updatedUser] = await db.update(users)
        .set({
          supabaseUserId: request.supabaseUserId,
          facebookUserId: request.facebookUserId || existingUser.facebookUserId,
          facebookScopes: request.facebookScopes || existingUser.facebookScopes,
          profileImage: request.profileImage || existingUser.profileImage,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();

      return updatedUser;
    } else {
      // Create new user from Supabase data
      console.log('[SupabaseSyncService] Creating new user from OAuth');
      
      // Generate username from email or name
      const baseUsername = request.email 
        ? request.email.split('@')[0]
        : request.fullName?.toLowerCase().replace(/\s+/g, '') || 'user';
      
      // Ensure unique username
      const username = await this.generateUniqueUsername(baseUsername);

      const [newUser] = await db.insert(users)
        .values({
          supabaseUserId: request.supabaseUserId,
          email: request.email,
          name: request.fullName || request.email.split('@')[0],
          username,
          password: 'OAUTH_USER', // Placeholder - OAuth users don't use password
          facebookUserId: request.facebookUserId,
          facebookScopes: request.facebookScopes,
          profileImage: request.profileImage,
          isVerified: true, // Facebook OAuth verified
          isActive: true,
        })
        .returning();

      console.log('[SupabaseSyncService] New user created:', newUser.id);
      return newUser;
    }
  }

  /**
   * Update user with Facebook Page Access Token
   */
  async updatePageToken(userId: number, tokenData: {
    pageId: string;
    pageAccessToken: string;
    expiresAt: Date;
  }) {
    console.log('[SupabaseSyncService] Updating page token for user:', userId);

    const [updatedUser] = await db.update(users)
      .set({
        facebookPageId: tokenData.pageId,
        facebookPageAccessToken: tokenData.pageAccessToken,
        facebookTokenExpiresAt: tokenData.expiresAt,
        facebookMessengerOptIn: true, // Enable Messenger by default
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  /**
   * Generate unique username by appending numbers if needed
   */
  private async generateUniqueUsername(base: string): Promise<string> {
    let username = base;
    let counter = 1;

    while (true) {
      const existing = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (!existing) {
        return username;
      }

      username = `${base}${counter}`;
      counter++;
    }
  }

  /**
   * Get user by Supabase ID
   */
  async getUserBySupabaseId(supabaseUserId: string) {
    return await db.query.users.findFirst({
      where: eq(users.supabaseUserId, supabaseUserId),
    });
  }

  /**
   * Check if user has valid Facebook Page Access Token
   */
  async hasValidPageToken(userId: number): Promise<boolean> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user?.facebookPageAccessToken) {
      return false;
    }

    // Check if token is expired
    if (user.facebookTokenExpiresAt && user.facebookTokenExpiresAt < new Date()) {
      console.log('[SupabaseSyncService] Page token expired for user:', userId);
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const supabaseSyncService = new SupabaseSyncService();
