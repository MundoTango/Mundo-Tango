/**
 * MR BLUE ROLE ADAPTER API ROUTES - AGENT #47
 * API endpoints for tier-based feature gating and permissions
 */

import { Router, Request, Response } from 'express';
import { roleAdapterAgent } from '../services/mrBlue/roleAdapterAgent';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/mrblue/role/permissions
 * Get user permissions based on role/tier
 */
router.get('/permissions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    const permissions = await roleAdapterAgent.getUserPermissions(userId!);

    res.json({
      success: true,
      permissions
    });
  } catch (error: any) {
    console.error('[RoleAdapter API] Permissions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/role/check-feature
 * Check if user has access to a specific feature
 */
router.post('/check-feature', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { feature } = req.body;

    if (!feature || typeof feature !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'feature (string) is required'
      });
    }

    const hasAccess = await roleAdapterAgent.hasFeatureAccess(userId!, feature);

    res.json({
      success: true,
      hasAccess,
      feature
    });
  } catch (error: any) {
    console.error('[RoleAdapter API] Check feature error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/role/tier-info
 * Get detailed tier information for user
 */
router.get('/tier-info', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    const tierInfo = await roleAdapterAgent.getTierInfo(userId!);

    res.json({
      success: true,
      tierInfo
    });
  } catch (error: any) {
    console.error('[RoleAdapter API] Tier info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/role/adapt-ui
 * Get UI configuration based on user tier
 */
router.post('/adapt-ui', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { component } = req.body;

    if (!component || typeof component !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'component (string) is required'
      });
    }

    const uiConfig = await roleAdapterAgent.adaptUI(userId!, component);

    res.json({
      success: true,
      uiConfig
    });
  } catch (error: any) {
    console.error('[RoleAdapter API] Adapt UI error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
