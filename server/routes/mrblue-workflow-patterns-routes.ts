/**
 * MR BLUE WORKFLOW PATTERNS API ROUTES - AGENT #46
 * API endpoints for workflow pattern learning and prediction
 */

import { Router, Request, Response } from 'express';
import { workflowPatternTracker } from '../services/mrBlue/workflowPatternTracker';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

// Initialize service on startup
workflowPatternTracker.initialize().catch(err => 
  console.error('[WorkflowPatternTracker Routes] Initialization error:', err)
);

/**
 * POST /api/mrblue/workflow/record
 * Record a user action
 */
router.post('/record', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { sessionId, actionType, context } = req.body;

    if (!sessionId || !actionType) {
      return res.status(400).json({
        success: false,
        error: 'sessionId and actionType are required'
      });
    }

    await workflowPatternTracker.recordAction({
      userId: userId!,
      sessionId,
      actionType,
      context: context || {}
    });

    res.json({
      success: true,
      message: 'Action recorded successfully'
    });
  } catch (error: any) {
    console.error('[WorkflowPatternTracker API] Record error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/workflow/predict
 * Predict next action based on recent workflow
 */
router.post('/predict', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required'
      });
    }

    const prediction = await workflowPatternTracker.predictNextAction(userId!, sessionId);

    if (!prediction) {
      return res.json({
        success: true,
        prediction: null,
        message: 'Not enough data for prediction'
      });
    }

    res.json({
      success: true,
      prediction
    });
  } catch (error: any) {
    console.error('[WorkflowPatternTracker API] Predict error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/workflow/stats
 * Get workflow statistics for the authenticated user
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    const stats = await workflowPatternTracker.getWorkflowStats(userId!);

    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('[WorkflowPatternTracker API] Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/workflow/feedback
 * Provide feedback on prediction accuracy
 */
router.post('/feedback', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { predictedAction, actualAction, wasAccurate } = req.body;

    if (!predictedAction || !actualAction || typeof wasAccurate !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'predictedAction, actualAction, and wasAccurate (boolean) are required'
      });
    }

    await workflowPatternTracker.recordFeedback(
      userId!,
      predictedAction,
      actualAction,
      wasAccurate
    );

    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error: any) {
    console.error('[WorkflowPatternTracker API] Feedback error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
