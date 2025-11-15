import { db } from '../../db';
import { users } from '../../../shared/schema';
import { eq, and, isNull } from 'drizzle-orm';

const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'scott@mundotango.com';

export interface GodLevelRequest {
  userId: number;
  username: string;
  email: string;
  reason: string;
  requestedAt: Date;
}

export class GodLevelApprovalService {
  async requestGodLevelAccess(userId: number, reason: string): Promise<{ requestId: number }> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.godLevelApproved) {
      throw new Error('User already has God Level access');
    }

    if (user.godLevelRequestedAt) {
      throw new Error('Request already pending');
    }

    await db.update(users)
      .set({
        godLevelRequestedAt: new Date(),
        godLevelRejectionReason: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return { requestId: userId };
  }

  async getPendingRequests(): Promise<GodLevelRequest[]> {
    const pendingUsers = await db.query.users.findMany({
      where: and(
        isNull(users.godLevelApprovedAt),
        eq(users.godLevelApproved, false)
      ),
      columns: {
        id: true,
        username: true,
        email: true,
        godLevelRequestedAt: true
      }
    });

    return pendingUsers
      .filter(user => user.godLevelRequestedAt !== null)
      .map(user => ({
        userId: user.id,
        username: user.username,
        email: user.email,
        reason: '',
        requestedAt: user.godLevelRequestedAt!
      }));
  }

  async approveRequest(userId: number, approvedBy: number): Promise<void> {
    const approver = await db.query.users.findFirst({
      where: eq(users.id, approvedBy)
    });

    if (!approver || approver.email !== TEST_ADMIN_EMAIL) {
      throw new Error('Only admin can approve God Level requests');
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.godLevelApproved) {
      throw new Error('User already approved');
    }

    await db.update(users)
      .set({
        godLevelApproved: true,
        godLevelApprovedAt: new Date(),
        godLevelApprovedBy: approvedBy,
        godLevelRejectionReason: null,
        subscriptionTier: 'god',
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async rejectRequest(userId: number, reason: string, rejectedBy: number): Promise<void> {
    const rejector = await db.query.users.findFirst({
      where: eq(users.id, rejectedBy)
    });

    if (!rejector || rejector.email !== TEST_ADMIN_EMAIL) {
      throw new Error('Only admin can reject God Level requests');
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      throw new Error('User not found');
    }

    await db.update(users)
      .set({
        godLevelApproved: false,
        godLevelRequestedAt: null,
        godLevelRejectionReason: reason,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async isGodLevelApproved(userId: number): Promise<boolean> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        godLevelApproved: true,
        subscriptionTier: true
      }
    });

    return user?.godLevelApproved === true && user?.subscriptionTier === 'god';
  }

  async getRequestStatus(userId: number): Promise<{
    approved: boolean;
    pending: boolean;
    rejected: boolean;
    rejectionReason?: string;
  }> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        godLevelApproved: true,
        godLevelRequestedAt: true,
        godLevelRejectionReason: true
      }
    });

    if (!user) {
      return { approved: false, pending: false, rejected: false };
    }

    return {
      approved: user.godLevelApproved,
      pending: !user.godLevelApproved && user.godLevelRequestedAt !== null,
      rejected: !user.godLevelApproved && user.godLevelRejectionReason !== null,
      rejectionReason: user.godLevelRejectionReason || undefined
    };
  }
}

export const approvalService = new GodLevelApprovalService();
