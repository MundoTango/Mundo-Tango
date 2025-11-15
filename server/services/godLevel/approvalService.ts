import { db } from '../../db';
import { users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

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

    if (user.role === 'god') {
      throw new Error('User already has God Level access');
    }

    // Note: Request tracking fields removed from schema, direct approval only
    return { requestId: userId };
  }

  async getPendingRequests(): Promise<GodLevelRequest[]> {
    // Simplified: No pending requests tracking, direct approval only
    return [];
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

    if (user.role === 'god') {
      throw new Error('User already approved');
    }

    await db.update(users)
      .set({
        role: 'god',
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

    // Simplified: No rejection tracking, just prevent upgrade
    // User remains at current role
  }

  async isGodLevelApproved(userId: number): Promise<boolean> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        role: true,
        subscriptionTier: true
      }
    });

    return user?.role === 'god' && user?.subscriptionTier === 'god';
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
        role: true
      }
    });

    if (!user) {
      return { approved: false, pending: false, rejected: false };
    }

    const isGod = user.role === 'god';
    return {
      approved: isGod,
      pending: false,
      rejected: false,
      rejectionReason: undefined
    };
  }
}

export const approvalService = new GodLevelApprovalService();
