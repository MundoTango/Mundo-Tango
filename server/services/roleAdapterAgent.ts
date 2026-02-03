import { db } from "@db";
import { mrBlueKnowledgeBase, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export type SubscriptionTier = 'free' | 'basic' | 'plus' | 'pro' | 'god';

interface TierFeatures {
  tier: SubscriptionTier;
  features: string[];
  limits: {
    posts: number;
    events: number;
    groups: number;
    messages: number;
    storage: string;
    aiRequests: number;
  };
}

const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  free: {
    tier: 'free',
    features: ['basic_profile', 'view_events', 'join_groups', 'basic_messaging'],
    limits: {
      posts: 10,
      events: 2,
      groups: 3,
      messages: 50,
      storage: '100MB',
      aiRequests: 10
    }
  },
  basic: {
    tier: 'basic',
    features: ['basic_profile', 'create_events', 'join_groups', 'messaging', 'photo_upload'],
    limits: {
      posts: 50,
      events: 10,
      groups: 10,
      messages: 200,
      storage: '500MB',
      aiRequests: 50
    }
  },
  plus: {
    tier: 'plus',
    features: [
      'premium_profile', 
      'create_events', 
      'create_groups', 
      'unlimited_messaging', 
      'photo_upload',
      'video_upload',
      'analytics',
      'advanced_search'
    ],
    limits: {
      posts: 200,
      events: 50,
      groups: 25,
      messages: 1000,
      storage: '2GB',
      aiRequests: 200
    }
  },
  pro: {
    tier: 'pro',
    features: [
      'premium_profile',
      'unlimited_events',
      'unlimited_groups',
      'unlimited_messaging',
      'photo_upload',
      'video_upload',
      'analytics',
      'advanced_search',
      'priority_support',
      'custom_branding',
      'api_access'
    ],
    limits: {
      posts: 1000,
      events: 200,
      groups: 100,
      messages: 5000,
      storage: '10GB',
      aiRequests: 1000
    }
  },
  god: {
    tier: 'god',
    features: [
      'premium_profile',
      'unlimited_events',
      'unlimited_groups',
      'unlimited_messaging',
      'photo_upload',
      'video_upload',
      'analytics',
      'advanced_search',
      'priority_support',
      'custom_branding',
      'api_access',
      'white_label',
      'dedicated_support',
      'custom_integrations'
    ],
    limits: {
      posts: -1,
      events: -1,
      groups: -1,
      messages: -1,
      storage: 'Unlimited',
      aiRequests: -1
    }
  }
};

export class RoleAdapterAgent {
  async adaptContent(content: string, userTier: SubscriptionTier): Promise<{ adapted: string; hiddenFeatures: string[] }> {
    const tierConfig = TIER_FEATURES[userTier];
    const hiddenFeatures: string[] = [];

    let adapted = content;

    if (!tierConfig.features.includes('video_upload')) {
      adapted = adapted.replace(/\[video\]/gi, '[Upgrade to Plus for video uploads]');
      hiddenFeatures.push('video_upload');
    }

    if (!tierConfig.features.includes('analytics')) {
      adapted = adapted.replace(/\[analytics\]/gi, '[Upgrade to Plus for analytics]');
      hiddenFeatures.push('analytics');
    }

    if (!tierConfig.features.includes('custom_branding')) {
      adapted = adapted.replace(/\[custom-brand\]/gi, '[Upgrade to Pro for custom branding]');
      hiddenFeatures.push('custom_branding');
    }

    await this.storePreference(null, userTier, {
      adaptedContent: true,
      hiddenFeatures,
      timestamp: new Date().toISOString()
    });

    return { adapted, hiddenFeatures };
  }

  async getAvailableFeatures(userTier: SubscriptionTier): Promise<TierFeatures> {
    return TIER_FEATURES[userTier];
  }

  async suggestUpgrade(currentTier: SubscriptionTier, desiredFeature: string): Promise<{
    needsUpgrade: boolean;
    suggestedTier?: SubscriptionTier;
    message: string;
  }> {
    const currentFeatures = TIER_FEATURES[currentTier].features;

    if (currentFeatures.includes(desiredFeature)) {
      return {
        needsUpgrade: false,
        message: `You already have access to ${desiredFeature}!`
      };
    }

    const tiers: SubscriptionTier[] = ['basic', 'plus', 'pro', 'god'];
    for (const tier of tiers) {
      if (TIER_FEATURES[tier].features.includes(desiredFeature)) {
        return {
          needsUpgrade: true,
          suggestedTier: tier,
          message: `Upgrade to ${tier.toUpperCase()} to unlock ${desiredFeature}!`
        };
      }
    }

    return {
      needsUpgrade: true,
      message: `Feature ${desiredFeature} not found in any tier.`
    };
  }

  async checkFeatureAccess(userId: number, feature: string): Promise<boolean> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) return false;

    const tier = (user.subscriptionTier || 'free') as SubscriptionTier;
    const tierConfig = TIER_FEATURES[tier];

    return tierConfig.features.includes(feature);
  }

  private async storePreference(userId: number | null, tier: SubscriptionTier, metadata: any): Promise<void> {
    try {
      await db.insert(mrBlueKnowledgeBase).values({
        userId,
        category: 'user_preference',
        title: `Tier Adaptation - ${tier}`,
        content: JSON.stringify(metadata),
        tags: ['tier', tier, 'adaptation'],
        useCount: 1,
        lastUsedAt: new Date()
      });
    } catch (error) {
      console.error('[RoleAdapterAgent] Failed to store preference:', error);
    }
  }

  getTierPricing(): Record<SubscriptionTier, { monthly: number; yearly: number }> {
    return {
      free: { monthly: 0, yearly: 0 },
      basic: { monthly: 9.99, yearly: 99 },
      plus: { monthly: 19.99, yearly: 199 },
      pro: { monthly: 49.99, yearly: 499 },
      god: { monthly: 199.99, yearly: 1999 }
    };
  }
}

export const roleAdapterAgent = new RoleAdapterAgent();
