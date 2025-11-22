/**
 * MR BLUE LEARNING COORDINATOR API ROUTES - AGENT #49
 * API endpoints for 10-pathway learning system and knowledge retention
 */

import { Router, Request, Response } from 'express';
import { learningCoordinator } from '../services/mrBlue/learningCoordinator';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/mrblue/learning/record
 * Record a learning event
 */
router.post('/record', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { pathway, content, success } = req.body;

    if (!pathway || !content) {
      return res.status(400).json({
        success: false,
        error: 'pathway and content are required'
      });
    }

    await learningCoordinator.recordLearning(userId!, pathway, content, success);

    res.json({
      success: true,
      message: 'Learning event recorded successfully'
    });
  } catch (error: any) {
    console.error('[Learning API] Record error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/learning/insights
 * Get learning insights for the authenticated user
 */
router.get('/insights', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    const insights = await learningCoordinator.getLearningInsights(userId!);

    res.json({
      success: true,
      insights
    });
  } catch (error: any) {
    console.error('[Learning API] Insights error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/learning/pathways
 * Get all 10 learning pathways with stats
 */
router.get('/pathways', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    const pathways = await learningCoordinator.getPathwayStats(userId!);

    res.json({
      success: true,
      pathways
    });
  } catch (error: any) {
    console.error('[Learning API] Pathways error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/learning/adapt
 * Get adaptive suggestions based on learning history
 */
router.post('/adapt', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { currentContext } = req.body;

    const suggestions = await learningCoordinator.getAdaptiveSuggestions(
      userId!,
      currentContext || {}
    );

    res.json({
      success: true,
      suggestions
    });
  } catch (error: any) {
    console.error('[Learning API] Adapt error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/learning/retention
 * Get knowledge retention score
 */
router.get('/retention', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    const retention = await learningCoordinator.getRetentionScore(userId!);

    res.json({
      success: true,
      retention
    });
  } catch (error: any) {
    console.error('[Learning API] Retention error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
