import { db } from "@db";
import { users, userTelemetry } from "@shared/schema";
import { eq, and, gte, lt, sql } from "drizzle-orm";

export type SubscriptionTier = 'free' | 'basic' | 'plus' | 'pro' | 'god';

export interface FeatureLimit {
  feature: string;
  limit: number;
  period: 'daily' | 'monthly' | 'total';
  description: string;
}

export interface QuotaUsage {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  resetDate?: Date;
}

const FEATURE_LIMITS: Record<SubscriptionTier, Record<string, FeatureLimit>> = {
  free: {
    posts: { feature: 'posts', limit: 10, period: 'monthly', description: 'Posts per month' },
    events: { feature: 'events', limit: 2, period: 'monthly', description: 'Events per month' },
    groups: { feature: 'groups', limit: 3, period: 'total', description: 'Maximum groups' },
    messages: { feature: 'messages', limit: 50, period: 'monthly', description: 'Messages per month' },
    aiRequests: { feature: 'aiRequests', limit: 10, period: 'daily', description: 'AI requests per day' },
    storage: { feature: 'storage', limit: 100, period: 'total', description: 'Storage (MB)' }
  },
  basic: {
    posts: { feature: 'posts', limit: 50, period: 'monthly', description: 'Posts per month' },
    events: { feature: 'events', limit: 10, period: 'monthly', description: 'Events per month' },
    groups: { feature: 'groups', limit: 10, period: 'total', description: 'Maximum groups' },
    messages: { feature: 'messages', limit: 200, period: 'monthly', description: 'Messages per month' },
    aiRequests: { feature: 'aiRequests', limit: 50, period: 'daily', description: 'AI requests per day' },
    storage: { feature: 'storage', limit: 500, period: 'total', description: 'Storage (MB)' }
  },
  plus: {
    posts: { feature: 'posts', limit: 200, period: 'monthly', description: 'Posts per month' },
    events: { feature: 'events', limit: 50, period: 'monthly', description: 'Events per month' },
    groups: { feature: 'groups', limit: 25, period: 'total', description: 'Maximum groups' },
    messages: { feature: 'messages', limit: 1000, period: 'monthly', description: 'Messages per month' },
    aiRequests: { feature: 'aiRequests', limit: 200, period: 'daily', description: 'AI requests per day' },
    storage: { feature: 'storage', limit: 2048, period: 'total', description: 'Storage (MB)' }
  },
  pro: {
    posts: { feature: 'posts', limit: 1000, period: 'monthly', description: 'Posts per month' },
    events: { feature: 'events', limit: 200, period: 'monthly', description: 'Events per month' },
    groups: { feature: 'groups', limit: 100, period: 'total', description: 'Maximum groups' },
    messages: { feature: 'messages', limit: 5000, period: 'monthly', description: 'Messages per month' },
    aiRequests: { feature: 'aiRequests', limit: 1000, period: 'daily', description: 'AI requests per day' },
    storage: { feature: 'storage', limit: 10240, period: 'total', description: 'Storage (MB)' }
  },
  god: {
    posts: { feature: 'posts', limit: -1, period: 'monthly', description: 'Unlimited posts' },
    events: { feature: 'events', limit: -1, period: 'monthly', description: 'Unlimited events' },
    groups: { feature: 'groups', limit: -1, period: 'total', description: 'Unlimited groups' },
    messages: { feature: 'messages', limit: -1, period: 'monthly', description: 'Unlimited messages' },
    aiRequests: { feature: 'aiRequests', limit: -1, period: 'daily', description: 'Unlimited AI requests' },
    storage: { feature: 'storage', limit: -1, period: 'total', description: 'Unlimited storage' }
  }
};

export class SubscriptionAgent {
  async isFeatureAvailable(userId: number, feature: string): Promise<boolean> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) return false;

    const tier = (user.subscriptionTier || 'free') as SubscriptionTier;
    const limits = FEATURE_LIMITS[tier];

    if (!limits[feature]) return true;

    const quota = await this.checkQuota(userId, feature);
    
    if (quota.limit === -1) return true;
    
    return quota.remaining > 0;
  }

  getFeatureLimits(tier: SubscriptionTier): Record<string, FeatureLimit> {
    return FEATURE_LIMITS[tier];
  }

  async checkQuota(userId: number, feature: string): Promise<QuotaUsage> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return { used: 0, limit: 0, remaining: 0, percentage: 0 };
    }

    const tier = (user.subscriptionTier || 'free') as SubscriptionTier;
    const featureLimit = FEATURE_LIMITS[tier][feature];

    if (!featureLimit) {
      return { used: 0, limit: -1, remaining: -1, percentage: 0 };
    }

    if (featureLimit.limit === -1) {
      return { used: 0, limit: -1, remaining: -1, percentage: 0 };
    }

    const { startDate, endDate, resetDate } = this.getPeriodDates(featureLimit.period);

    const usageCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(userTelemetry)
      .where(
        and(
          eq(userTelemetry.userId, userId),
          eq(userTelemetry.eventType, `usage_${feature}`),
          gte(userTelemetry.timestamp, startDate),
          lt(userTelemetry.timestamp, endDate)
        )
      );

    const used = Number(usageCount[0]?.count || 0);
    const remaining = Math.max(0, featureLimit.limit - used);
    const percentage = (used / featureLimit.limit) * 100;

    return {
      used,
      limit: featureLimit.limit,
      remaining,
      percentage: Math.min(100, percentage),
      resetDate
    };
  }

  async incrementUsage(userId: number, feature: string): Promise<void> {
    try {
      await db.insert(userTelemetry).values({
        userId,
        sessionId: `usage-${Date.now()}`,
        eventType: `usage_${feature}`,
        pagePath: '/api',
        elementId: feature,
        value: '1',
        metadata: {
          feature,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[SubscriptionAgent] Failed to increment usage:', error);
    }
  }

  async canUseFeature(userId: number, feature: string): Promise<{
    allowed: boolean;
    reason?: string;
    quota?: QuotaUsage;
  }> {
    const allowed = await this.isFeatureAvailable(userId, feature);
    const quota = await this.checkQuota(userId, feature);

    if (!allowed) {
      return {
        allowed: false,
        reason: `You've reached your ${feature} limit. Upgrade your plan for more.`,
        quota
      };
    }

    return { allowed: true, quota };
  }

  private getPeriodDates(period: 'daily' | 'monthly' | 'total'): {
    startDate: Date;
    endDate: Date;
    resetDate: Date;
  } {
    const now = new Date();
    const endDate = new Date(now);
    let startDate: Date;
    let resetDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        resetDate = new Date(startDate);
        resetDate.setDate(resetDate.getDate() + 1);
        break;

      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;

      case 'total':
        startDate = new Date(0);
        resetDate = new Date('2099-12-31');
        break;

      default:
        startDate = new Date(0);
        resetDate = new Date('2099-12-31');
    }

    return { startDate, endDate, resetDate };
  }

  getAllTierLimits(): Record<SubscriptionTier, Record<string, FeatureLimit>> {
    return FEATURE_LIMITS;
  }

  compareTiers(currentTier: SubscriptionTier, targetTier: SubscriptionTier): {
    upgrades: string[];
    downgrades: string[];
  } {
    const currentLimits = FEATURE_LIMITS[currentTier];
    const targetLimits = FEATURE_LIMITS[targetTier];

    const upgrades: string[] = [];
    const downgrades: string[] = [];

    for (const feature in targetLimits) {
      const currentLimit = currentLimits[feature]?.limit || 0;
      const targetLimit = targetLimits[feature]?.limit || 0;

      if (targetLimit === -1 || targetLimit > currentLimit) {
        upgrades.push(feature);
      } else if (targetLimit < currentLimit && currentLimit !== -1) {
        downgrades.push(feature);
      }
    }

    return { upgrades, downgrades };
  }
}

export const subscriptionAgent = new SubscriptionAgent();
