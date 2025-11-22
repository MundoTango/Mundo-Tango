/**
 * MR BLUE SUBSCRIPTION API ROUTES - AGENT #48
 * API endpoints for quota management and subscription enforcement
 */

import { Router, Request, Response } from 'express';
import { subscriptionAgent } from '../services/mrBlue/subscriptionAgent';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/mrblue/subscription/usage
 * Get usage statistics for the authenticated user
 */
router.get('/usage', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    const usage = await subscriptionAgent.getUsageStats(userId!);

    res.json({
      success: true,
      usage
    });
  } catch (error: any) {
    console.error('[Subscription API] Usage error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/subscription/check-quota
 * Check if user has quota available for a specific action
 */
router.post('/check-quota', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { action } = req.body;

    if (!action || typeof action !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'action (string) is required'
      });
    }

    const hasQuota = await subscriptionAgent.checkQuota(userId!, action);

    res.json({
      success: true,
      hasQuota,
      action
    });
  } catch (error: any) {
    console.error('[Subscription API] Check quota error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/subscription/consume
 * Consume quota for a specific action
 */
router.post('/consume', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { action, amount } = req.body;

    if (!action || typeof action !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'action (string) is required'
      });
    }

    const result = await subscriptionAgent.consumeQuota(userId!, action, amount || 1);

    res.json({
      success: result,
      action,
      consumed: result
    });
  } catch (error: any) {
    console.error('[Subscription API] Consume error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/subscription/limits
 * Get quota limits for user's tier
 */
router.get('/limits', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    const limits = await subscriptionAgent.getQuotaLimits(userId!);

    res.json({
      success: true,
      limits
    });
  } catch (error: any) {
    console.error('[Subscription API] Limits error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/subscription/reset
 * Reset daily quotas (admin or scheduled task)
 */
router.post('/reset', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    // TODO: Add admin check or scheduled task verification
    await subscriptionAgent.resetDailyQuotas();

    res.json({
      success: true,
      message: 'Daily quotas reset successfully'
    });
  } catch (error: any) {
    console.error('[Subscription API] Reset error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
