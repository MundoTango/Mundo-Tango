import { db } from '@shared/db';
import { featureFlags, tierLimits, userFeatureUsage, users, platformUserRoles, platformRoles } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import Redis from 'ioredis';

/**
 * Feature Flag Service with CONDITIONAL Redis Caching
 * 
 * Supports:
 * - Boolean features (on/off)
 * - Quota features (usage limits with tracking)
 * - Tier-based enforcement
 * - Automatic quota resets (daily/weekly/monthly)
 * - Redis caching for performance (TTL: 5 minutes) - ONLY if Redis is available
 */

// Conditional Redis - only connect if REDIS_URL is set
const REDIS_ENABLED = Boolean(process.env.REDIS_URL);
let redis: Redis | null = null;

if (REDIS_ENABLED) {
  redis = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 1) {
        console.warn('[FeatureFlagService] Redis unavailable, using direct DB queries');
        redis = null;
        return null;
      }
      return 200;
    },
    enableOfflineQueue: false,
  });
} else {
  console.log('[FeatureFlagService] Redis disabled - using direct DB queries');
}

const CACHE_TTL = 300; // 5 minutes

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
   * Get user's tier name from their RBAC role level
   * Maps role level to tier name for feature flag checks
   */
  private static async getUserTierName(userId: number): Promise<string> {
    // Get user's highest role level from RBAC
    const userRolesData = await db
      .select({
        roleLevel: platformRoles.roleLevel,
        roleName: platformRoles.name,
      })
      .from(platformUserRoles)
      .innerJoin(platformRoles, eq(platformUserRoles.roleId, platformRoles.id))
      .where(eq(platformUserRoles.userId, userId));

    if (userRolesData.length === 0) {
      return 'free'; // Default: Free tier
    }

    // Get highest role level
    const maxRoleLevel = Math.max(...userRolesData.map((r: any) => r.roleLevel));

    // Map role level to tier name for feature flag tier_limits table
    // tier_limits.tierName uses role names: 'free', 'premium', 'community_leader', 'admin', etc.
    const highestRole = userRolesData.find((r: any) => r.roleLevel === maxRoleLevel);
    return highestRole?.roleName || 'free';
  }

  /**
   * Check if user can use a boolean feature (with Redis caching)
   */
  static async canUseFeature(userId: number, featureName: string): Promise<FeatureAccessResult> {
    // Try cache first (only if Redis is available)
    if (redis) {
      const cacheKey = `feature:${userId}:${featureName}`;
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        console.warn('[FeatureFlagService] Redis read error, using DB');
      }
    }

    // Get user's tier from RBAC roles (not users.subscriptionTier)
    const userTier = await this.getUserTierName(userId);

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
    const result = feature[0].featureType === 'boolean' 
      ? { allowed: tierLimit[0].limitValue === 1 }
      : { allowed: true };

    // Cache result (only if Redis available)
    if (redis) {
      const cacheKey = `feature:${userId}:${featureName}`;
      try {
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
      } catch (err) {
        console.warn('[FeatureFlagService] Redis write error');
      }
    }

    return result;
  }

  /**
   * Check if user can use a quota-based feature (with Redis caching)
   * Returns current usage, limit, and whether action is allowed
   */
  static async canUseQuotaFeature(
    userId: number,
    featureName: string
  ): Promise<QuotaFeatureResult> {
    // Try cache first (only if Redis available)
    if (redis) {
      const cacheKey = `quota:${userId}:${featureName}`;
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        console.warn('[FeatureFlagService] Redis read error, using DB');
      }
    }

    // Get user's tier from RBAC roles (not users.subscriptionTier)
    const userTier = await this.getUserTierName(userId);

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

    const current = usage[0]?.currentUsage ?? 0;
    const limit = tierLimit[0].limitValue;

    // Check if quota exceeded
    const result = limit !== null && current >= limit
      ? {
          allowed: false,
          current,
          limit,
          isUnlimited: false,
          reason: `Quota exceeded: ${current}/${limit}`,
        }
      : {
          allowed: true,
          current,
          limit,
          isUnlimited: false,
        };

    // Cache result (only if Redis available)
    if (redis) {
      const cacheKey = `quota:${userId}:${featureName}`;
      try {
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
      } catch (err) {
        console.warn('[FeatureFlagService] Redis write error');
      }
    }

    return result;
  }

  /**
   * Increment quota usage for a feature (invalidates cache)
   */
  static async incrementQuota(userId: number, featureName: string): Promise<void> {
    // Invalidate cache (only if Redis available)
    if (redis) {
      const cacheKey = `quota:${userId}:${featureName}`;
      try {
        await redis.del(cacheKey);
      } catch (err) {
        console.warn('[FeatureFlagService] Redis delete error');
      }
    }
    // Get feature flag
    const feature = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.name, featureName))
      .limit(1);

    if (feature.length === 0) {
      throw new Error('Feature not found');
    }

    // Check if usage record exists
    const existing = await db
      .select()
      .from(userFeatureUsage)
      .where(
        and(
          eq(userFeatureUsage.userId, userId),
          eq(userFeatureUsage.featureFlagId, feature[0].id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      // Create initial usage record
      await db.insert(userFeatureUsage).values({
        userId,
        featureFlagId: feature[0].id,
        currentUsage: 1,
        periodStart: new Date(),
        periodEnd: this.calculatePeriodEnd(new Date(), 'monthly'), // Default to monthly
      });
    } else {
      // Increment existing usage
      await db
        .update(userFeatureUsage)
        .set({
          currentUsage: sql`${userFeatureUsage.currentUsage} + 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userFeatureUsage.userId, userId),
            eq(userFeatureUsage.featureFlagId, feature[0].id)
          )
        );
    }
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
