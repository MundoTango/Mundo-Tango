import { Router } from 'express';
import { PricingManagerService } from '../services/PricingManagerService';
import { authenticateToken, requireRoleLevel, optionalAuth, AuthRequest } from '../middleware/auth';
import { db } from '@shared/db';
import { pricingTiers, subscriptions, promoCodes, upgradeEvents, checkoutSessions, tierLimits } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.TESTING_STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn('⚠️ Stripe not configured - checkout routes will fail');
}
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-10-29.clover' }) : null;

// Get all active pricing tiers (public)
router.get('/tiers', optionalAuth, async (req, res) => {
  try {
    const tiers = await PricingManagerService.getActiveTiers();
    res.json({ tiers });
  } catch (error) {
    console.error('Get pricing tiers error:', error);
    res.status(500).json({ message: 'Error fetching pricing tiers' });
  }
});

// Get specific tier by name (public)
router.get('/tiers/:name', optionalAuth, async (req, res) => {
  try {
    const { name } = req.params;
    const tier = await PricingManagerService.getTierByName(name);
    res.json({ tier });
  } catch (error: any) {
    console.error('Get tier error:', error);
    res.status(404).json({ message: error.message || 'Tier not found' });
  }
});

// Get user's current subscription
router.get('/my-subscription', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, req.userId),
          eq(subscriptions.status, 'active')
        )
      )
      .limit(1);

    if (!subscription) {
      return res.json({ subscription: null, message: 'No active subscription' });
    }

    // Get tier details
    const [tier] = await db
      .select()
      .from(pricingTiers)
      .where(eq(pricingTiers.id, subscription.tierId))
      .limit(1);

    res.json({ subscription, tier });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Error fetching subscription' });
  }
});

// Check feature access
router.get('/check-feature/:featureKey', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { featureKey } = req.params;
    const access = await PricingManagerService.checkFeatureAccess(req.userId, featureKey);

    res.json(access);
  } catch (error) {
    console.error('Check feature access error:', error);
    res.status(500).json({ message: 'Error checking feature access' });
  }
});

// Validate promo code
router.post('/validate-promo', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Promo code is required' });
    }

    const [promo] = await db
      .select()
      .from(promoCodes)
      .where(
        and(
          eq(promoCodes.code, code),
          eq(promoCodes.isActive, true)
        )
      )
      .limit(1);

    if (!promo) {
      return res.status(404).json({ message: 'Invalid promo code' });
    }

    // Check expiration
    if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
      return res.status(400).json({ message: 'Promo code expired' });
    }

    // Check max redemptions
    if (promo.maxRedemptions && (promo.currentRedemptions || 0) >= promo.maxRedemptions) {
      return res.status(400).json({ message: 'Promo code redemption limit reached' });
    }

    res.json({
      valid: true,
      promo: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
      },
    });
  } catch (error) {
    console.error('Validate promo error:', error);
    res.status(500).json({ message: 'Error validating promo code' });
  }
});

// ============================================================================
// ADMIN ROUTES (God/Super Admin only)
// ============================================================================

// Create new pricing tier
router.post('/admin/tiers', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const { name, displayName, description, monthlyPrice, annualPrice, roleLevel, features } = req.body;

    if (!name || !displayName || monthlyPrice === undefined) {
      return res.status(400).json({ message: 'name, displayName, and monthlyPrice are required' });
    }

    const tier = await PricingManagerService.createTier({
      name,
      displayName,
      description,
      monthlyPrice,
      annualPrice,
      roleLevel,
      features,
    });

    res.status(201).json({ tier });
  } catch (error: any) {
    console.error('Create tier error:', error);
    res.status(500).json({ message: error.message || 'Error creating tier' });
  }
});

// Assign feature to tier
router.post('/admin/assign-feature', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const { tierId, featureKey, featureName, limitType, limitValue } = req.body;

    if (!tierId || !featureKey || !featureName) {
      return res.status(400).json({ message: 'tierId, featureKey, and featureName are required' });
    }

    await PricingManagerService.assignFeature(tierId, featureKey, featureName, limitType, limitValue);

    res.json({ message: 'Feature assigned successfully' });
  } catch (error: any) {
    console.error('Assign feature error:', error);
    res.status(500).json({ message: error.message || 'Error assigning feature' });
  }
});

// Create promo code
router.post('/admin/promo-codes', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const { code, discountType, discountValue, applicableTiers, maxRedemptions, validUntil } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ message: 'code, discountType, and discountValue are required' });
    }

    const promo = await PricingManagerService.createPromoCode({
      code,
      discountType,
      discountValue,
      applicableTiers: applicableTiers || [],
      maxRedemptions,
      validUntil: validUntil ? new Date(validUntil) : undefined,
    });

    res.status(201).json({ promo });
  } catch (error: any) {
    console.error('Create promo code error:', error);
    res.status(500).json({ message: error.message || 'Error creating promo code' });
  }
});

// Update tier visibility
router.patch('/admin/tiers/:tierId/visibility', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const { tierId } = req.params;
    const { isVisible } = req.body;

    if (isVisible === undefined) {
      return res.status(400).json({ message: 'isVisible is required' });
    }

    await PricingManagerService.updateTierVisibility(parseInt(tierId), isVisible);

    res.json({ message: 'Tier visibility updated' });
  } catch (error) {
    console.error('Update visibility error:', error);
    res.status(500).json({ message: 'Error updating tier visibility' });
  }
});

// Set tier as popular
router.patch('/admin/tiers/:tierId/popular', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const { tierId } = req.params;
    const { isPopular } = req.body;

    if (isPopular === undefined) {
      return res.status(400).json({ message: 'isPopular is required' });
    }

    await PricingManagerService.setTierPopular(parseInt(tierId), isPopular);

    res.json({ message: 'Tier popularity updated' });
  } catch (error) {
    console.error('Update popularity error:', error);
    res.status(500).json({ message: 'Error updating tier popularity' });
  }
});

// ============================================================================
// PHASE 2: CONVERSION BLOCKERS (Blocker 4: Upgrade Modal System)
// ============================================================================

// Create Stripe checkout session for tier upgrade
router.post('/checkout-session', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!stripe) {
      return res.status(503).json({ message: 'Payment system unavailable' });
    }

    const { tierId, billingInterval = 'monthly', promoCode } = req.body;

    if (!tierId) {
      return res.status(400).json({ message: 'tierId is required' });
    }

    const [tier] = await db.select().from(pricingTiers).where(eq(pricingTiers.id, tierId)).limit(1);
    if (!tier) {
      return res.status(404).json({ message: 'Tier not found' });
    }

    const priceId = billingInterval === 'annual' ? tier.stripeAnnualPriceId : tier.stripeMonthlyPriceId;
    if (!priceId) {
      return res.status(400).json({ message: `No ${billingInterval} price available for this tier` });
    }

    const amount = billingInterval === 'annual' ? tier.annualPrice || 0 : tier.monthlyPrice;

    let promoCodeId: number | null = null;
    if (promoCode) {
      const [promo] = await db
        .select()
        .from(promoCodes)
        .where(and(eq(promoCodes.code, promoCode), eq(promoCodes.isActive, true)))
        .limit(1);
      
      if (promo) {
        promoCodeId = promo.id;
      }
    }

    const successUrl = `${req.headers.origin || 'http://localhost:5000'}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${req.headers.origin || 'http://localhost:5000'}/upgrade/cancelled`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: req.userId.toString(),
      metadata: {
        userId: req.userId.toString(),
        tierId: tierId.toString(),
        billingInterval,
      },
    });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [checkoutSession] = await db
      .insert(checkoutSessions)
      .values({
        userId: req.userId,
        stripeSessionId: session.id,
        tierId,
        priceId,
        billingInterval,
        amount,
        promoCodeId,
        status: 'pending',
        expiresAt,
        successUrl,
        cancelUrl,
        metadata: { sessionUrl: session.url },
      })
      .returning();

    await db.insert(upgradeEvents).values({
      userId: req.userId,
      eventType: 'checkout_created',
      featureName: null,
      currentTier: 'free',
      targetTier: tier.name,
      currentQuota: null,
      quotaLimit: null,
      conversionCompleted: false,
      checkoutSessionId: session.id,
      metadata: { tierId, billingInterval },
    });

    res.json({ sessionId: session.id, url: session.url, checkoutSession });
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ message: error.message || 'Error creating checkout session' });
  }
});

// Track upgrade event (when user sees upgrade modal)
router.post('/track-upgrade-event', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { eventType, featureName, currentTier, targetTier, currentQuota, quotaLimit, checkoutSessionId } = req.body;

    if (!eventType || !currentTier) {
      return res.status(400).json({ message: 'eventType and currentTier are required' });
    }

    const [event] = await db
      .insert(upgradeEvents)
      .values({
        userId: req.userId,
        eventType,
        featureName,
        currentTier,
        targetTier,
        currentQuota,
        quotaLimit,
        conversionCompleted: false,
        checkoutSessionId: checkoutSessionId || null,
        metadata: req.body.metadata || {},
      })
      .returning();

    res.json({ event });
  } catch (error: any) {
    console.error('Track upgrade event error:', error);
    res.status(500).json({ message: error.message || 'Error tracking upgrade event' });
  }
});

// ============================================================================
// PHASE 2: ADMIN PRICING MANAGER UI (Blocker 10)
// ============================================================================

// Bulk toggle feature for tier (God/Super Admin only)
router.post('/admin/toggle-feature-for-tier', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const { tierName, featureFlagId, limitValue, isUnlimited } = req.body;

    if (!tierName || !featureFlagId) {
      return res.status(400).json({ message: 'tierName and featureFlagId are required' });
    }

    const [existing] = await db
      .select()
      .from(tierLimits)
      .where(
        and(
          eq(tierLimits.tierName, tierName),
          eq(tierLimits.featureFlagId, featureFlagId)
        )
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(tierLimits)
        .set({ 
          limitValue: isUnlimited ? null : limitValue,
          isUnlimited: isUnlimited || false,
          updatedAt: new Date() 
        })
        .where(eq(tierLimits.id, existing.id))
        .returning();

      return res.json({ limit: updated, action: 'updated' });
    }

    const [created] = await db
      .insert(tierLimits)
      .values({
        tierName,
        featureFlagId,
        limitValue: isUnlimited ? null : limitValue,
        isUnlimited: isUnlimited || false,
      })
      .returning();

    res.json({ limit: created, action: 'created' });
  } catch (error: any) {
    console.error('Toggle feature error:', error);
    res.status(500).json({ message: error.message || 'Error toggling feature' });
  }
});

// Get all tier limits (for admin UI matrix)
router.get('/admin/tier-limits', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const limits = await db.select().from(tierLimits);
    
    const matrix: Record<string, Record<number, { limitValue: number | null; isUnlimited: boolean }>> = {};
    for (const limit of limits) {
      if (!matrix[limit.tierName]) {
        matrix[limit.tierName] = {};
      }
      matrix[limit.tierName][limit.featureFlagId] = {
        limitValue: limit.limitValue,
        isUnlimited: limit.isUnlimited || false,
      };
    }

    res.json({ limits, matrix });
  } catch (error) {
    console.error('Get tier limits error:', error);
    res.status(500).json({ message: 'Error fetching tier limits' });
  }
});

export default router;
