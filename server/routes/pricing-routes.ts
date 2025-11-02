import { Router } from 'express';
import { PricingManagerService } from '../services/PricingManagerService';
import { authenticateToken, requireRoleLevel, optionalAuth, AuthRequest } from '../middleware/auth';
import { db } from '@shared/db';
import { pricingTiers, subscriptions, promoCodes } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

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
    if (promo.maxRedemptions && promo.currentRedemptions >= promo.maxRedemptions) {
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

export default router;
