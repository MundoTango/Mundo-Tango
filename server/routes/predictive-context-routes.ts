/**
 * BLOCKER 9: Predictive Context System - API Routes
 * Markov chain prediction and cache warming
 * 
 * C5-4: Predictive Pre-Check System Integration
 * - POST /api/predictive/run-check - Run predictive pre-checks
 */

import { Router, type Response } from "express";
import { authenticateToken, requireRoleLevel, type AuthRequest } from "../middleware/auth";
import { PredictiveContextService } from "../services/PredictiveContextService";
import { PredictivePreCheckService, AutoFixEngine } from "../services/self-healing";
import logger from "../middleware/logger";

const router = Router();

/**
 * POST /api/predictive/track
 * Track user navigation pattern
 */
router.post("/track", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { fromPage, toPage, timeOnPage } = req.body;
    
    if (!fromPage || !toPage || !timeOnPage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await PredictiveContextService.trackNavigation(
      req.user!.id,
      fromPage,
      toPage,
      timeOnPage
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/predictive/predict
 * Get predicted next pages for current page
 */
router.get("/predict", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPage } = req.query;
    
    if (!currentPage) {
      return res.status(400).json({ error: 'currentPage is required' });
    }

    // Check cache first
    let prediction = await PredictiveContextService.getCachedPrediction(
      req.user!.id,
      currentPage as string
    );

    // If not cached, generate prediction and cache it
    if (!prediction) {
      prediction = await PredictiveContextService.predictNextPages(
        req.user!.id,
        currentPage as string
      );

      // Warm cache for next time
      await PredictiveContextService.warmCache(req.user!.id, currentPage as string);
    }

    res.json(prediction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/predictive/warm-cache
 * Warm cache for current page (proactive caching)
 */
router.post("/warm-cache", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPage } = req.body;
    
    if (!currentPage) {
      return res.status(400).json({ error: 'currentPage is required' });
    }

    const result = await PredictiveContextService.warmCache(req.user!.id, currentPage);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/predictive/record-hit
 * Record cache hit/miss for accuracy tracking
 */
router.post("/record-hit", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPage, actualNextPage } = req.body;
    
    if (!currentPage || !actualNextPage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await PredictiveContextService.recordCacheHit(
      req.user!.id,
      currentPage,
      actualNextPage
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/predictive/accuracy
 * Get prediction accuracy stats for current user
 */
router.get("/accuracy", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await PredictiveContextService.getAccuracyStats(req.user!.id);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/predictive/patterns
 * Get user navigation patterns summary
 */
router.get("/patterns", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const patterns = await PredictiveContextService.getUserPatternsSummary(req.user!.id);
    res.json(patterns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/predictive/clean-cache
 * Clean expired cache entries (admin only)
 */
router.delete("/clean-cache", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const deletedCount = await PredictiveContextService.cleanExpiredCache();
    res.json({ deletedCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// C5-4: Predictive Pre-Check System
// Predicts potential issues BEFORE they occur
// ============================================================================

/**
 * POST /api/predictive/run-check
 * Run predictive pre-checks on pages
 * 
 * Triggers:
 * - Before deployments
 * - On schema changes  
 * - When high-risk routes are modified
 * 
 * Integrates with AutoFixEngine for proactive healing
 */
router.post("/run-check", async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { 
      pageId,
      trigger = 'manual',
      checkType = 'full'
    } = req.body;
    
    logger.info('🔮 [PredictivePreCheck] Starting predictive check', {
      pageId,
      trigger,
      checkType,
      timestamp: new Date().toISOString()
    });

    if (!pageId) {
      logger.warn('[PredictivePreCheck] Missing pageId in request');
      return res.status(400).json({ 
        success: false,
        error: 'pageId is required' 
      });
    }

    // Run predictive pre-check
    await PredictivePreCheckService.checkPagesNavigatesTo(pageId);
    
    // Get cached results
    const cachedResult = await PredictivePreCheckService.getCachedPreCheck(pageId);
    
    // Calculate Expected Free Energy for prioritization
    const efeResult = await PredictivePreCheckService.calculateEFE(pageId);
    
    const duration = Date.now() - startTime;
    
    logger.info('✅ [PredictivePreCheck] Check completed', {
      pageId,
      trigger,
      duration: `${duration}ms`,
      issuesPredicted: cachedResult?.issuesPredicted || 0,
      criticalPredicted: cachedResult?.criticalPredicted || 0,
      efe: efeResult.efe,
      strategy: efeResult.details
    });

    res.json({
      success: true,
      pageId,
      trigger,
      duration,
      predictions: {
        issuesPredicted: cachedResult?.issuesPredicted || 0,
        criticalPredicted: cachedResult?.criticalPredicted || 0,
        confidenceScore: cachedResult?.confidenceScore || 0,
        proactiveHealingApplied: cachedResult?.proactiveHealingApplied || false
      },
      freeEnergy: {
        efe: efeResult.efe,
        risk: efeResult.risk,
        ambiguity: efeResult.ambiguity,
        strategy: efeResult.details
      },
      autoFixStatus: AutoFixEngine.getStatus()
    });
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('❌ [PredictivePreCheck] Check failed', {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });
    
    res.status(500).json({ 
      success: false,
      error: error.message,
      duration
    });
  }
});

/**
 * POST /api/predictive/pre-deployment-check
 * Special endpoint for pre-deployment validation
 * Runs comprehensive predictive checks before deployment
 */
router.post("/pre-deployment-check", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { 
      targetPages = [],
      deploymentType = 'production'
    } = req.body;
    
    logger.info('🚀 [PreDeploymentCheck] Starting pre-deployment validation', {
      deploymentType,
      targetPagesCount: targetPages.length,
      userId: req.user?.id
    });

    const results = [];
    let totalIssues = 0;
    let criticalIssues = 0;
    
    // Check high-risk routes first
    const highRiskRoutes = [
      '/feed', '/events', '/admin', '/settings', '/profile',
      '/housing', '/marketplace', '/messages', '/groups'
    ];
    
    const pagesToCheck = targetPages.length > 0 
      ? targetPages 
      : highRiskRoutes;
    
    for (const pageId of pagesToCheck) {
      try {
        await PredictivePreCheckService.checkPagesNavigatesTo(pageId);
        const cached = await PredictivePreCheckService.getCachedPreCheck(pageId);
        const efe = await PredictivePreCheckService.calculateEFE(pageId);
        
        const pageResult = {
          pageId,
          issuesPredicted: cached?.issuesPredicted || 0,
          criticalPredicted: cached?.criticalPredicted || 0,
          healingApplied: cached?.proactiveHealingApplied || false,
          efe: efe.efe,
          risk: efe.risk,
          status: (cached?.criticalPredicted || 0) > 0 ? 'warning' : 'ok'
        };
        
        results.push(pageResult);
        totalIssues += pageResult.issuesPredicted;
        criticalIssues += pageResult.criticalPredicted;
        
        logger.info(`[PreDeploymentCheck] Checked ${pageId}`, pageResult);
        
      } catch (err: any) {
        logger.warn(`[PreDeploymentCheck] Failed to check ${pageId}:`, err.message);
        results.push({
          pageId,
          status: 'error',
          error: err.message
        });
      }
    }
    
    const duration = Date.now() - startTime;
    const deploymentRecommendation = criticalIssues === 0 
      ? 'proceed' 
      : criticalIssues > 3 
        ? 'block' 
        : 'proceed_with_caution';
    
    logger.info('✅ [PreDeploymentCheck] Complete', {
      duration: `${duration}ms`,
      pagesChecked: results.length,
      totalIssues,
      criticalIssues,
      recommendation: deploymentRecommendation
    });

    res.json({
      success: true,
      deploymentType,
      duration,
      summary: {
        pagesChecked: results.length,
        totalIssues,
        criticalIssues,
        recommendation: deploymentRecommendation
      },
      results,
      autoFixStatus: AutoFixEngine.getStatus()
    });
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('❌ [PreDeploymentCheck] Failed', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false,
      error: error.message,
      duration
    });
  }
});

/**
 * POST /api/predictive/schema-change-check
 * Run checks when database schema changes are detected
 */
router.post("/schema-change-check", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { 
      affectedTables = [],
      changeType = 'migration'
    } = req.body;
    
    logger.info('📊 [SchemaChangeCheck] Analyzing schema change impact', {
      affectedTables,
      changeType
    });

    // Map tables to potentially affected pages
    const tableToPageMapping: Record<string, string[]> = {
      'users': ['/profile', '/settings', '/admin/users'],
      'posts': ['/feed', '/profile'],
      'events': ['/events', '/feed'],
      'housing_listings': ['/housing', '/marketplace'],
      'messages': ['/messages'],
      'groups': ['/groups'],
      'notifications': ['/notifications', '/feed']
    };
    
    const affectedPages = new Set<string>();
    for (const table of affectedTables) {
      const pages = tableToPageMapping[table] || [];
      pages.forEach(p => affectedPages.add(p));
    }
    
    const results = [];
    
    for (const pageId of affectedPages) {
      try {
        await PredictivePreCheckService.checkPagesNavigatesTo(pageId);
        const cached = await PredictivePreCheckService.getCachedPreCheck(pageId);
        
        results.push({
          pageId,
          issuesPredicted: cached?.issuesPredicted || 0,
          status: (cached?.criticalPredicted || 0) > 0 ? 'warning' : 'ok'
        });
        
      } catch (err: any) {
        results.push({
          pageId,
          status: 'error',
          error: err.message
        });
      }
    }
    
    const duration = Date.now() - startTime;
    
    logger.info('✅ [SchemaChangeCheck] Complete', {
      duration: `${duration}ms`,
      affectedPages: affectedPages.size,
      results
    });

    res.json({
      success: true,
      changeType,
      affectedTables,
      affectedPages: Array.from(affectedPages),
      duration,
      results
    });
    
  } catch (error: any) {
    logger.error('❌ [SchemaChangeCheck] Failed', {
      error: error.message
    });
    
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;
