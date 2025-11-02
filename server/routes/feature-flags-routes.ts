import { Router } from 'express';
import { FeatureFlagService } from '../services/FeatureFlagService';
import { authenticateToken, requireRoleLevel, AuthRequest } from '../middleware/auth';
import { db } from '@shared/db';
import { featureFlags, tierLimits, userFeatureUsage } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Check if user can use a feature
router.get('/can-use/:featureName', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { featureName } = req.params;
    const access = await FeatureFlagService.canUseFeature(req.userId, featureName);

    res.json(access);
  } catch (error) {
    console.error('Check feature access error:', error);
    res.status(500).json({ message: 'Error checking feature access' });
  }
});

// Check quota feature
router.get('/quota/:featureName', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { featureName } = req.params;
    const quota = await FeatureFlagService.canUseQuotaFeature(req.userId, featureName);

    res.json(quota);
  } catch (error) {
    console.error('Check quota error:', error);
    res.status(500).json({ message: 'Error checking quota' });
  }
});

// Increment quota usage
router.post('/increment-quota/:featureName', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { featureName } = req.params;
    
    // Check if user can use the feature first
    const quota = await FeatureFlagService.canUseQuotaFeature(req.userId, featureName);
    
    if (!quota.allowed) {
      return res.status(403).json({
        message: 'Quota exceeded',
        quota,
        upgradeRequired: true,
      });
    }

    await FeatureFlagService.incrementQuota(req.userId, featureName);

    res.json({ message: 'Quota incremented', newUsage: quota.current + 1 });
  } catch (error) {
    console.error('Increment quota error:', error);
    res.status(500).json({ message: 'Error incrementing quota' });
  }
});

// Get all feature flags (Admin+)
router.get('/all', authenticateToken, requireRoleLevel(4), async (req, res) => {
  try {
    const flags = await db.select().from(featureFlags);
    res.json({ flags });
  } catch (error) {
    console.error('Get feature flags error:', error);
    res.status(500).json({ message: 'Error fetching feature flags' });
  }
});

// Get user's feature usage
router.get('/my-usage', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const usage = await db
      .select()
      .from(userFeatureUsage)
      .where(eq(userFeatureUsage.userId, req.userId));

    res.json({ usage });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ message: 'Error fetching usage' });
  }
});

export default router;
