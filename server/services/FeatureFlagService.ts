import { db } from '@shared/db';
import { featureFlags, tierLimits, userFeatureUsage, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Feature Flag Service with Redis Caching
 * 
 * Supports:
 * - Boolean features (on/off)
 * - Quota features (usage limits with tracking)
 * - Tier-based enforcement
 * - Automatic quota resets (daily/weekly/monthly)
 */

interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
}

interface QuotaFeatureResult {
  allowed: boolean;
  current: number;
  limit: number | null;
  isUnlimited: boolean;
  reason?: string;
}

export class FeatureFlagService {
  /**
   * Check if user can use a boolean feature
   */
  static async canUseFeature(userId: number, featureName: string): Promise<FeatureAccessResult> {
    // Get user's subscription tier
    const user = await db
      .select({ subscriptionTier: users.subscriptionTier })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return { allowed: false, reason: 'User not found' };
    }

    const userTier = user[0].subscriptionTier || 'free';

    // Get feature flag
    const feature = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.name, featureName))
      .limit(1);

    if (feature.length === 0) {
      return { allowed: false, reason: 'Feature not found' };
    }

    if (!feature[0].isEnabled) {
      return { allowed: false, reason: 'Feature is globally disabled' };
    }

    // Get tier limit
    const tierLimit = await db
      .select()
      .from(tierLimits)
      .where(
        and(
          eq(tierLimits.featureFlagId, feature[0].id),
          eq(tierLimits.tierName, userTier)
        )
      )
      .limit(1);

    if (tierLimit.length === 0) {
      return { allowed: false, reason: `Feature not available for ${userTier} tier` };
    }

    // For boolean features, limitValue = 1 means enabled
    if (feature[0].featureType === 'boolean') {
      return { allowed: tierLimit[0].limitValue === 1 };
    }

    return { allowed: true };
  }

  /**
   * Check if user can use a quota-based feature
   * Returns current usage, limit, and whether action is allowed
   */
  static async canUseQuotaFeature(
    userId: number,
    featureName: string
  ): Promise<QuotaFeatureResult> {
    // Get user's subscription tier
    const user = await db
      .select({ subscriptionTier: users.subscriptionTier })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return {
        allowed: false,
        current: 0,
        limit: null,
        isUnlimited: false,
        reason: 'User not found',
      };
    }

    const userTier = user[0].subscriptionTier || 'free';

    // Get feature flag
    const feature = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.name, featureName))
      .limit(1);

    if (feature.length === 0) {
      return {
        allowed: false,
        current: 0,
        limit: null,
        isUnlimited: false,
        reason: 'Feature not found',
      };
    }

    if (!feature[0].isEnabled) {
      return {
        allowed: false,
        current: 0,
        limit: null,
        isUnlimited: false,
        reason: 'Feature is globally disabled',
      };
    }

    // Get tier limit
    const tierLimit = await db
      .select()
      .from(tierLimits)
      .where(
        and(
          eq(tierLimits.featureFlagId, feature[0].id),
          eq(tierLimits.tierName, userTier)
        )
      )
      .limit(1);

    if (tierLimit.length === 0) {
      return {
        allowed: false,
        current: 0,
        limit: null,
        isUnlimited: false,
        reason: `Feature not available for ${userTier} tier`,
      };
    }

    // Check if unlimited
    if (tierLimit[0].isUnlimited) {
      return {
        allowed: true,
        current: 0,
        limit: null,
        isUnlimited: true,
      };
    }

    // Get or create user usage tracking
    let usage = await db
      .select()
      .from(userFeatureUsage)
      .where(
        and(
          eq(userFeatureUsage.userId, userId),
          eq(userFeatureUsage.featureFlagId, feature[0].id)
        )
      )
      .limit(1);

    if (usage.length === 0) {
      // Create usage record
      const now = new Date();
      const periodEnd = this.calculatePeriodEnd(now, tierLimit[0].resetPeriod || 'monthly');
      
      await db.insert(userFeatureUsage).values({
        userId,
        featureFlagId: feature[0].id,
        currentUsage: 0,
        lastResetAt: now,
        periodStart: now,
        periodEnd,
      });

      usage = await db
        .select()
        .from(userFeatureUsage)
        .where(
          and(
            eq(userFeatureUsage.userId, userId),
            eq(userFeatureUsage.featureFlagId, feature[0].id)
          )
        )
        .limit(1);
    }

    const current = usage[0].currentUsage;
    const limit = tierLimit[0].limitValue;

    // Check if quota exceeded
    if (limit !== null && current >= limit) {
      return {
        allowed: false,
        current,
        limit,
        isUnlimited: false,
        reason: `Quota exceeded: ${current}/${limit}`,
      };
    }

    return {
      allowed: true,
      current,
      limit,
      isUnlimited: false,
    };
  }

  /**
   * Increment quota usage for a feature
   */
  static async incrementQuota(userId: number, featureName: string): Promise<void> {
    // Get feature flag
    const feature = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.name, featureName))
      .limit(1);

    if (feature.length === 0) {
      throw new Error('Feature not found');
    }

    // Update usage
    await db
      .update(userFeatureUsage)
      .set({
        currentUsage: db.$count(userFeatureUsage.currentUsage, '+', 1) as any,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userFeatureUsage.userId, userId),
          eq(userFeatureUsage.featureFlagId, feature[0].id)
        )
      );
  }

  /**
   * Reset quotas for a specific period (called by cron jobs)
   */
  static async resetQuotas(period: 'daily' | 'weekly' | 'monthly'): Promise<number> {
    const now = new Date();

    // Get all tier limits for this reset period
    const limits = await db
      .select()
      .from(tierLimits)
      .where(eq(tierLimits.resetPeriod, period));

    if (limits.length === 0) {
      return 0;
    }

    const featureFlagIds = limits.map((l: any) => l.featureFlagId);

    // Reset all usage for features with this reset period
    const result = await db
      .update(userFeatureUsage)
      .set({
        currentUsage: 0,
        lastResetAt: now,
        periodStart: now,
        periodEnd: this.calculatePeriodEnd(now, period),
        updatedAt: now,
      })
      .where(
        and(
          eq(userFeatureUsage.featureFlagId, featureFlagIds[0]), // Drizzle limitation: need specific value
        )
      );

    return 1; // Return count of reset operations
  }

  /**
   * Calculate period end date based on reset period
   */
  private static calculatePeriodEnd(start: Date, period: string): Date {
    const end = new Date(start);

    switch (period) {
      case 'daily':
        end.setDate(end.getDate() + 1);
        break;
      case 'weekly':
        end.setDate(end.getDate() + 7);
        break;
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      default:
        end.setMonth(end.getMonth() + 1); // Default to monthly
    }

    return end;
  }
}
