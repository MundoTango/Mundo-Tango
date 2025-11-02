/**
 * BLOCKER 9: Predictive Context System - API Routes
 * Markov chain prediction and cache warming
 */

import { Router, type Response } from "express";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { PredictiveContextService } from "../services/PredictiveContextService";

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

export default router;
