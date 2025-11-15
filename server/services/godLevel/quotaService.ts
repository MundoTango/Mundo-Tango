import { db } from '../../db';
import { godLevelQuotas, users } from '../../../shared/schema';
import { eq, lte } from 'drizzle-orm';

export type QuotaType = 'video' | 'voice';

export interface QuotaStatus {
  videoQuotaUsed: number;
  videoQuotaLimit: number;
  voiceQuotaUsed: number;
  voiceQuotaLimit: number;
  quotaResetDate: Date;
  daysUntilReset: number;
}

export class GodLevelQuotaService {
  private getNextResetDate(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth;
  }

  async ensureQuotaExists(userId: number): Promise<void> {
    const existing = await db.query.godLevelQuotas.findFirst({
      where: eq(godLevelQuotas.userId, userId)
    });

    if (!existing) {
      await db.insert(godLevelQuotas).values({
        userId,
        videoQuotaUsed: 0,
        videoQuotaLimit: 5,
        voiceQuotaUsed: 0,
        voiceQuotaLimit: 5,
        quotaResetDate: this.getNextResetDate()
      });
    }
  }

  async checkQuota(
    userId: number,
    quotaType: QuotaType
  ): Promise<{ available: boolean; used: number; limit: number }> {
    await this.ensureQuotaExists(userId);

    const quota = await db.query.godLevelQuotas.findFirst({
      where: eq(godLevelQuotas.userId, userId)
    });

    if (!quota) {
      return { available: true, used: 0, limit: 5 };
    }

    const now = new Date();
    if (now >= quota.quotaResetDate) {
      await this.resetUserQuota(userId);
      return { available: true, used: 0, limit: 5 };
    }

    if (quotaType === 'video') {
      return {
        available: quota.videoQuotaUsed < quota.videoQuotaLimit,
        used: quota.videoQuotaUsed,
        limit: quota.videoQuotaLimit
      };
    } else {
      return {
        available: quota.voiceQuotaUsed < quota.voiceQuotaLimit,
        used: quota.voiceQuotaUsed,
        limit: quota.voiceQuotaLimit
      };
    }
  }

  async incrementQuota(userId: number, quotaType: QuotaType): Promise<void> {
    await this.ensureQuotaExists(userId);

    const quota = await db.query.godLevelQuotas.findFirst({
      where: eq(godLevelQuotas.userId, userId)
    });

    if (!quota) {
      throw new Error('Quota record not found');
    }

    const now = new Date();
    if (now >= quota.quotaResetDate) {
      await this.resetUserQuota(userId);
    }

    if (quotaType === 'video') {
      await db.update(godLevelQuotas)
        .set({
          videoQuotaUsed: quota.videoQuotaUsed + 1,
          updatedAt: new Date()
        })
        .where(eq(godLevelQuotas.userId, userId));
    } else {
      await db.update(godLevelQuotas)
        .set({
          voiceQuotaUsed: quota.voiceQuotaUsed + 1,
          updatedAt: new Date()
        })
        .where(eq(godLevelQuotas.userId, userId));
    }
  }

  async resetUserQuota(userId: number): Promise<void> {
    await db.update(godLevelQuotas)
      .set({
        videoQuotaUsed: 0,
        voiceQuotaUsed: 0,
        quotaResetDate: this.getNextResetDate(),
        updatedAt: new Date()
      })
      .where(eq(godLevelQuotas.userId, userId));
  }

  async resetMonthlyQuotas(): Promise<void> {
    const now = new Date();
    const quotasToReset = await db.query.godLevelQuotas.findMany({
      where: lte(godLevelQuotas.quotaResetDate, now)
    });

    for (const quota of quotasToReset) {
      await this.resetUserQuota(quota.userId);
    }
  }

  async getQuotaStatus(userId: number): Promise<QuotaStatus> {
    await this.ensureQuotaExists(userId);

    const quota = await db.query.godLevelQuotas.findFirst({
      where: eq(godLevelQuotas.userId, userId)
    });

    if (!quota) {
      throw new Error('Quota not found');
    }

    const now = new Date();
    const daysUntilReset = Math.ceil(
      (quota.quotaResetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      videoQuotaUsed: quota.videoQuotaUsed,
      videoQuotaLimit: quota.videoQuotaLimit,
      voiceQuotaUsed: quota.voiceQuotaUsed,
      voiceQuotaLimit: quota.voiceQuotaLimit,
      quotaResetDate: quota.quotaResetDate,
      daysUntilReset: Math.max(0, daysUntilReset)
    };
  }

  async setCustomQuota(
    userId: number,
    quotaType: QuotaType,
    newLimit: number
  ): Promise<void> {
    await this.ensureQuotaExists(userId);

    if (quotaType === 'video') {
      await db.update(godLevelQuotas)
        .set({
          videoQuotaLimit: newLimit,
          updatedAt: new Date()
        })
        .where(eq(godLevelQuotas.userId, userId));
    } else {
      await db.update(godLevelQuotas)
        .set({
          voiceQuotaLimit: newLimit,
          updatedAt: new Date()
        })
        .where(eq(godLevelQuotas.userId, userId));
    }
  }

  async getAllGodUsers(): Promise<Array<{ userId: number; username: string; email: string }>> {
    const godUsers = await db.query.users.findMany({
      where: eq(users.subscriptionTier, 'god'),
      columns: {
        id: true,
        username: true,
        email: true
      }
    });

    return godUsers.map(user => ({
      userId: user.id,
      username: user.username,
      email: user.email
    }));
  }
}

export const quotaService = new GodLevelQuotaService();
