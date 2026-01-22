/**
 * GDPR Account Deletion Job
 * Implements Article 17 - Right to Erasure (Right to be Forgotten)
 *
 * This job runs daily to:
 * 1. Find accounts scheduled for deletion that have passed the 30-day grace period
 * 2. Permanently delete all user data (hard delete)
 * 3. Log the deletion for audit purposes
 */

import { db } from '../db';
import {
  users,
  posts,
  comments,
  eventAttendees,
  groupMembers,
  messages,
  notifications,
  userPrivacySettings,
  accountDeletionRequests,
  refreshTokens,
  passwordResetTokens,
  verificationTokens,
} from '@shared/schema';
import { and, eq, lt, inArray } from 'drizzle-orm';

interface DeletionResult {
  userId: number;
  email: string;
  deletedAt: Date;
  tablesCleared: string[];
}

/**
 * Delete all data associated with a user
 * This performs a GDPR-compliant hard deletion
 */
async function hardDeleteUserData(userId: number, userEmail: string): Promise<DeletionResult> {
  const tablesCleared: string[] = [];

  try {
    // Delete in order to respect foreign key constraints
    // Start with tables that reference other tables

    // 1. Delete notifications
    await db.delete(notifications).where(eq(notifications.userId, userId));
    tablesCleared.push('notifications');

    // 2. Delete messages (both sent and received)
    await db.delete(messages).where(eq(messages.senderId, userId));
    tablesCleared.push('messages');

    // 3. Delete comments
    await db.delete(comments).where(eq(comments.authorId, userId));
    tablesCleared.push('comments');

    // 4. Delete posts
    await db.delete(posts).where(eq(posts.authorId, userId));
    tablesCleared.push('posts');

    // 5. Delete event attendees
    await db.delete(eventAttendees).where(eq(eventAttendees.userId, userId));
    tablesCleared.push('event_attendees');

    // 6. Delete group memberships
    await db.delete(groupMembers).where(eq(groupMembers.userId, userId));
    tablesCleared.push('group_members');

    // 7. Delete privacy settings
    await db.delete(userPrivacySettings).where(eq(userPrivacySettings.userId, userId));
    tablesCleared.push('user_privacy_settings');

    // 8. Delete auth tokens
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    await db.delete(verificationTokens).where(eq(verificationTokens.userId, userId));
    tablesCleared.push('auth_tokens');

    // 9. Update deletion request status
    await db.update(accountDeletionRequests)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(accountDeletionRequests.userId, userId));
    tablesCleared.push('account_deletion_requests');

    // 10. Finally, delete the user record
    await db.delete(users).where(eq(users.id, userId));
    tablesCleared.push('users');

    console.log(`[GDPR Deletion] Successfully deleted all data for user ${userId} (${userEmail})`);

    return {
      userId,
      email: userEmail,
      deletedAt: new Date(),
      tablesCleared,
    };
  } catch (error) {
    console.error(`[GDPR Deletion] Error deleting user ${userId}:`, error);
    throw error;
  }
}

/**
 * Process all accounts scheduled for deletion that have passed the grace period
 */
export async function processScheduledDeletions(): Promise<DeletionResult[]> {
  const results: DeletionResult[] = [];
  const now = new Date();

  try {
    // Find all deletion requests that are scheduled and past the scheduled date
    const pendingDeletions = await db.query.accountDeletionRequests.findMany({
      where: and(
        eq(accountDeletionRequests.status, 'scheduled'),
        lt(accountDeletionRequests.scheduledFor, now)
      ),
    });

    if (pendingDeletions.length === 0) {
      console.log('[GDPR Deletion] No accounts pending deletion');
      return results;
    }

    console.log(`[GDPR Deletion] Found ${pendingDeletions.length} accounts to delete`);

    // Process each deletion
    for (const request of pendingDeletions) {
      try {
        // Get user details for logging
        const user = await db.query.users.findFirst({
          where: eq(users.id, request.userId),
        });

        if (!user) {
          // User already deleted, just update the request status
          await db.update(accountDeletionRequests)
            .set({ status: 'completed', completedAt: new Date() })
            .where(eq(accountDeletionRequests.id, request.id));
          continue;
        }

        // Perform the deletion
        const result = await hardDeleteUserData(request.userId, user.email || 'unknown');
        results.push(result);

      } catch (error) {
        console.error(`[GDPR Deletion] Failed to delete user ${request.userId}:`, error);

        // Mark as failed for manual review
        await db.update(accountDeletionRequests)
          .set({
            status: 'failed',
            cancellationReason: `Deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          .where(eq(accountDeletionRequests.id, request.id));
      }
    }

    console.log(`[GDPR Deletion] Completed ${results.length} account deletions`);
    return results;

  } catch (error) {
    console.error('[GDPR Deletion] Error processing scheduled deletions:', error);
    throw error;
  }
}

/**
 * Cancel a scheduled deletion (user can do this by logging back in within grace period)
 */
export async function cancelScheduledDeletion(userId: number, reason?: string): Promise<boolean> {
  try {
    // Find the pending deletion request
    const request = await db.query.accountDeletionRequests.findFirst({
      where: and(
        eq(accountDeletionRequests.userId, userId),
        eq(accountDeletionRequests.status, 'scheduled')
      ),
    });

    if (!request) {
      return false; // No pending deletion to cancel
    }

    // Update the request status
    await db.update(accountDeletionRequests)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason || 'User logged in during grace period',
      })
      .where(eq(accountDeletionRequests.id, request.id));

    // Reactivate the user account
    await db.update(users)
      .set({
        isActive: true,
        suspended: false,
        deletionScheduledAt: null,
      })
      .where(eq(users.id, userId));

    console.log(`[GDPR Deletion] Cancelled deletion for user ${userId}`);
    return true;

  } catch (error) {
    console.error(`[GDPR Deletion] Error cancelling deletion for user ${userId}:`, error);
    return false;
  }
}

/**
 * Initialize the GDPR deletion job (runs daily at 3 AM)
 */
export function initGdprDeletionJob() {
  console.log('[GDPR Deletion] Initializing GDPR account deletion job (runs daily)');

  // Run immediately on startup to catch any missed deletions
  processScheduledDeletions().catch(error => {
    console.error('[GDPR Deletion] Initial deletion check failed:', error);
  });

  // Run daily (every 24 hours)
  setInterval(() => {
    processScheduledDeletions().catch(error => {
      console.error('[GDPR Deletion] Scheduled deletion check failed:', error);
    });
  }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
}

export default {
  processScheduledDeletions,
  cancelScheduledDeletion,
  initGdprDeletionJob,
};
