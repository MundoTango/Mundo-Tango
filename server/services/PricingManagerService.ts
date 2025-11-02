import Stripe from 'stripe';
import { db } from '@db';
import { pricingTiers, tierFeatures, promoCodes, subscriptions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Dynamic Pricing Management Service
 * 
 * Features:
 * - Dynamic tier creation with Stripe integration
 * - Feature assignment to tiers
 * - Promo code management
 * - Subscription handling
 * - A/B price testing
 */
export class PricingManagerService {
  /**
   * Create new pricing tier with Stripe product/prices
   */
  static async createTier(data: {
    name: string;
    displayName: string;
    description: string;
    monthlyPrice: number; // In cents
    annualPrice?: number; // In cents
    roleLevel?: number;
    features?: any;
  }): Promise<any> {
    // Create Stripe product
    const product = await stripe.products.create({
      name: data.displayName,
      description: data.description,
    });

    // Create Stripe monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: data.monthlyPrice,
      recurring: { interval: 'month' },
    });

    let annualPrice;
    if (data.annualPrice) {
      annualPrice = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: data.annualPrice,
        recurring: { interval: 'year' },
      });
    }

    // Create tier in database
    const [tier] = await db
      .insert(pricingTiers)
      .values({
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        monthlyPrice: data.monthlyPrice,
        annualPrice: data.annualPrice,
        stripeProductId: product.id,
        stripeMonthlyPriceId: monthlyPrice.id,
        stripeAnnualPriceId: annualPrice?.id,
        roleLevel: data.roleLevel,
        features: data.features,
      })
      .returning();

    return tier;
  }

  /**
   * Assign feature to tier
   */
  static async assignFeature(
    tierId: number,
    featureKey: string,
    featureName: string,
    limitType: 'boolean' | 'numeric' | 'unlimited',
    limitValue?: number
  ): Promise<void> {
    await db
      .insert(tierFeatures)
      .values({
        tierId,
        featureKey,
        featureName,
        limitType,
        limitValue,
        isEnabled: true,
      })
      .onConflictDoUpdate({
        target: [tierFeatures.tierId, tierFeatures.featureKey],
        set: {
          featureName,
          limitType,
          limitValue,
          isEnabled: true,
        },
      });
  }

  /**
   * Create promo code with Stripe coupon
   */
  static async createPromoCode(data: {
    code: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    applicableTiers: number[];
    maxRedemptions?: number;
    validUntil?: Date;
  }): Promise<any> {
    // Create Stripe coupon
    const couponData: any = {
      id: data.code,
      currency: data.discountType === 'fixed_amount' ? 'usd' : undefined,
    };

    if (data.discountType === 'percentage') {
      couponData.percent_off = data.discountValue;
    } else {
      couponData.amount_off = data.discountValue;
    }

    const coupon = await stripe.coupons.create(couponData);

    // Create promo code in database
    const [promo] = await db
      .insert(promoCodes)
      .values({
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        applicableTiers: data.applicableTiers,
        stripeCouponId: coupon.id,
        maxRedemptions: data.maxRedemptions,
        validUntil: data.validUntil,
      })
      .returning();

    return promo;
  }

  /**
   * Get all active (visible) pricing tiers
   */
  static async getActiveTiers(): Promise<any[]> {
    const tiers = await db
      .select()
      .from(pricingTiers)
      .where(eq(pricingTiers.isVisible, true));

    // Get features for each tier
    const tiersWithFeatures = await Promise.all(
      tiers.map(async (tier: any) => {
        const features = await db
          .select()
          .from(tierFeatures)
          .where(
            and(
              eq(tierFeatures.tierId, tier.id),
              eq(tierFeatures.isEnabled, true)
            )
          );

        return { ...tier, tierFeatures: features };
      })
    );

    return tiersWithFeatures;
  }

  /**
   * Check if user has access to a specific feature based on their subscription
   */
  static async checkFeatureAccess(
    userId: number,
    featureKey: string
  ): Promise<{ hasAccess: boolean; limit?: number }> {
    // Get user's current subscription
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        )
      )
      .limit(1);

    if (!subscription) {
      return { hasAccess: false };
    }

    // Get tier feature
    const [feature] = await db
      .select()
      .from(tierFeatures)
      .where(
        and(
          eq(tierFeatures.tierId, subscription.tierId),
          eq(tierFeatures.featureKey, featureKey),
          eq(tierFeatures.isEnabled, true)
        )
      )
      .limit(1);

    if (!feature) {
      return { hasAccess: false };
    }

    return {
      hasAccess: true,
      limit: feature.limitValue || undefined,
    };
  }

  /**
   * Get pricing tier by name
   */
  static async getTierByName(name: string): Promise<any> {
    const [tier] = await db
      .select()
      .from(pricingTiers)
      .where(eq(pricingTiers.name, name))
      .limit(1);

    if (!tier) {
      throw new Error(`Pricing tier ${name} not found`);
    }

    // Get features
    const features = await db
      .select()
      .from(tierFeatures)
      .where(
        and(
          eq(tierFeatures.tierId, tier.id),
          eq(tierFeatures.isEnabled, true)
        )
      );

    return { ...tier, tierFeatures: features };
  }

  /**
   * Update tier visibility (for A/B testing or maintenance)
   */
  static async updateTierVisibility(tierId: number, isVisible: boolean): Promise<void> {
    await db
      .update(pricingTiers)
      .set({ isVisible, updatedAt: new Date() })
      .where(eq(pricingTiers.id, tierId));
  }

  /**
   * Mark tier as popular (for UI display)
   */
  static async setTierPopular(tierId: number, isPopular: boolean): Promise<void> {
    await db
      .update(pricingTiers)
      .set({ isPopular, updatedAt: new Date() })
      .where(eq(pricingTiers.id, tierId));
  }
}
