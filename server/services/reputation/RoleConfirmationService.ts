import { db } from '../../db';
import {
  roleConfirmations,
  InsertRoleConfirmation,
  SelectRoleConfirmation,
  users
} from '@shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { TangoResumeService } from './TangoResumeService';

export interface CreateConfirmationRequest {
  userId: number; // User being confirmed
  confirmerId: number; // User confirming
  tangoRole: string; // 'teacher', 'dj', 'organizer', 'performer'
  relationship: string; // 'student', 'colleague', 'event_attendee', 'co-organizer'
  comment?: string;
  rating?: number; // 1-5 stars
}

export interface ConfirmationWithUsers extends SelectRoleConfirmation {
  user: any;
  confirmer: any;
}

export class RoleConfirmationService {
  private userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  /**
   * Create a role confirmation
   */
  async confirmRole(request: CreateConfirmationRequest): Promise<SelectRoleConfirmation> {
    // Validate that user can't confirm their own role
    if (request.userId === request.confirmerId) {
      throw new Error('Cannot confirm your own role');
    }

    // Check if confirmation already exists
    const existing = await db.query.roleConfirmations.findFirst({
      where: and(
        eq(roleConfirmations.userId, request.userId),
        eq(roleConfirmations.confirmerId, request.confirmerId),
        eq(roleConfirmations.tangoRole, request.tangoRole)
      )
    });

    if (existing) {
      throw new Error('Role confirmation already exists');
    }

    // Create confirmation
    const [confirmation] = await db.insert(roleConfirmations)
      .values({
        userId: request.userId,
        confirmerId: request.confirmerId,
        tangoRole: request.tangoRole,
        relationship: request.relationship,
        comment: request.comment,
        rating: request.rating,
        isVerified: false // Platform verifies later
      })
      .returning();

    console.log(`[RoleConfirmationService] ${request.confirmerId} confirmed ${request.userId} as ${request.tangoRole}`);

    // Recalculate professional score
    const resumeService = new TangoResumeService(request.userId);
    await resumeService.calculateProfessionalScore(request.userId);

    // TODO: Send notification to user being confirmed

    return confirmation;
  }

  /**
   * Get all confirmations for a user
   */
  async getUserConfirmations(userId: number): Promise<ConfirmationWithUsers[]> {
    const confirmations = await db.query.roleConfirmations.findMany({
      where: eq(roleConfirmations.userId, userId),
      orderBy: [desc(roleConfirmations.createdAt)]
    });

    // Fetch user details for each confirmation
    const confirmationsWithUsers: ConfirmationWithUsers[] = [];

    for (const confirmation of confirmations) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, confirmation.userId),
        columns: {
          id: true,
          name: true,
          username: true,
          profileImageUrl: true
        }
      });

      const confirmer = await db.query.users.findFirst({
        where: eq(users.id, confirmation.confirmerId),
        columns: {
          id: true,
          name: true,
          username: true,
          profileImageUrl: true
        }
      });

      confirmationsWithUsers.push({
        ...confirmation,
        user,
        confirmer
      });
    }

    return confirmationsWithUsers;
  }

  /**
   * Get confirmations by role
   */
  async getConfirmationsByRole(userId: number, role: string): Promise<ConfirmationWithUsers[]> {
    const confirmations = await db.query.roleConfirmations.findMany({
      where: and(
        eq(roleConfirmations.userId, userId),
        eq(roleConfirmations.tangoRole, role)
      ),
      orderBy: [desc(roleConfirmations.createdAt)]
    });

    const confirmationsWithUsers: ConfirmationWithUsers[] = [];

    for (const confirmation of confirmations) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, confirmation.userId),
        columns: {
          id: true,
          name: true,
          username: true,
          profileImageUrl: true
        }
      });

      const confirmer = await db.query.users.findFirst({
        where: eq(users.id, confirmation.confirmerId),
        columns: {
          id: true,
          name: true,
          username: true,
          profileImageUrl: true
        }
      });

      confirmationsWithUsers.push({
        ...confirmation,
        user,
        confirmer
      });
    }

    return confirmationsWithUsers;
  }

  /**
   * Get confirmation stats for a user
   */
  async getConfirmationStats(userId: number): Promise<{
    totalConfirmations: number;
    byRole: Record<string, number>;
    avgRating: number | null;
    topConfirmers: any[];
  }> {
    const confirmations = await db.query.roleConfirmations.findMany({
      where: eq(roleConfirmations.userId, userId)
    });

    // Count by role
    const byRole: Record<string, number> = {};
    let totalRating = 0;
    let ratedCount = 0;

    for (const confirmation of confirmations) {
      byRole[confirmation.tangoRole] = (byRole[confirmation.tangoRole] || 0) + 1;
      
      if (confirmation.rating) {
        totalRating += confirmation.rating;
        ratedCount++;
      }
    }

    const avgRating = ratedCount > 0 ? totalRating / ratedCount : null;

    // Get top confirmers (users who confirmed this user the most)
    const confirmerCounts: Record<number, number> = {};
    for (const confirmation of confirmations) {
      confirmerCounts[confirmation.confirmerId] = (confirmerCounts[confirmation.confirmerId] || 0) + 1;
    }

    const topConfirmersIds = Object.entries(confirmerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => parseInt(id));

    const topConfirmers = [];
    for (const confirmerId of topConfirmersIds) {
      const confirmer = await db.query.users.findFirst({
        where: eq(users.id, confirmerId),
        columns: {
          id: true,
          name: true,
          username: true,
          profileImageUrl: true
        }
      });
      if (confirmer) {
        topConfirmers.push({
          ...confirmer,
          confirmationCount: confirmerCounts[confirmerId]
        });
      }
    }

    return {
      totalConfirmations: confirmations.length,
      byRole,
      avgRating,
      topConfirmers
    };
  }

  /**
   * Delete confirmation (admin or user can delete their own confirmations)
   */
  async deleteConfirmation(confirmationId: number, requesterId: number): Promise<void> {
    const confirmation = await db.query.roleConfirmations.findFirst({
      where: eq(roleConfirmations.id, confirmationId)
    });

    if (!confirmation) {
      throw new Error('Confirmation not found');
    }

    // Only confirmer or admin can delete
    if (confirmation.confirmerId !== requesterId) {
      throw new Error('Unauthorized to delete this confirmation');
    }

    await db.delete(roleConfirmations)
      .where(eq(roleConfirmations.id, confirmationId));

    console.log(`[RoleConfirmationService] Deleted confirmation ${confirmationId}`);

    // Recalculate professional score
    const resumeService = new TangoResumeService(confirmation.userId);
    await resumeService.calculateProfessionalScore(confirmation.userId);
  }

  /**
   * Verify confirmation (platform verification by admin)
   */
  async verifyConfirmation(confirmationId: number, isVerified: boolean): Promise<void> {
    await db.update(roleConfirmations)
      .set({ isVerified })
      .where(eq(roleConfirmations.id, confirmationId));

    console.log(`[RoleConfirmationService] ${isVerified ? 'Verified' : 'Unverified'} confirmation ${confirmationId}`);
  }

  /**
   * Get pending confirmations awaiting verification
   */
  async getPendingConfirmations(limit = 20): Promise<ConfirmationWithUsers[]> {
    const confirmations = await db.query.roleConfirmations.findMany({
      where: eq(roleConfirmations.isVerified, false),
      orderBy: [desc(roleConfirmations.createdAt)],
      limit
    });

    const confirmationsWithUsers: ConfirmationWithUsers[] = [];

    for (const confirmation of confirmations) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, confirmation.userId),
        columns: {
          id: true,
          name: true,
          username: true,
          profileImageUrl: true
        }
      });

      const confirmer = await db.query.users.findFirst({
        where: eq(users.id, confirmation.confirmerId),
        columns: {
          id: true,
          name: true,
          username: true,
          profileImageUrl: true
        }
      });

      confirmationsWithUsers.push({
        ...confirmation,
        user,
        confirmer
      });
    }

    return confirmationsWithUsers;
  }
}
