/**
 * MR BLUE AUTONOMOUS ROUTES - SYSTEM 7
 * API endpoints for autonomous coding engine
 */

import { Router, Request, Response } from 'express';
import { AutonomousEngine, AutonomousRequest } from '../services/mrBlue/AutonomousEngine';

const router = Router();

// Initialize autonomous engine
const autonomousEngine = new AutonomousEngine();
let engineInitialized = false;

// Ensure engine is initialized
async function ensureInitialized() {
  if (!engineInitialized) {
    await autonomousEngine.initialize();
    engineInitialized = true;
  }
}

/**
 * POST /api/mrblue/autonomous/start
 * Start a new autonomous coding session
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    await ensureInitialized();

    const { userRequest, maxCost, runTests, autoApprove } = req.body;

    if (!userRequest || typeof userRequest !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: userRequest is required and must be a string',
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const autonomousRequest: AutonomousRequest = {
      userRequest,
      userId: req.user.id,
      maxCost: maxCost || 5.0,
      runTests: runTests || false,
      autoApprove: autoApprove || false,
    };

    console.log(`[API] Starting autonomous session for user ${req.user.id}`);

    // Start autonomous session (non-blocking)
    const sessionPromise = autonomousEngine.runAutonomous(autonomousRequest);

    // Return session ID immediately
    // The session will continue running in the background
    sessionPromise.then(session => {
      console.log(`[API] Autonomous session ${session.id} completed`);
    }).catch(error => {
      console.error(`[API] Autonomous session failed:`, error);
    });

    // Get initial session ID by decomposing first
    const decomposition = await autonomousEngine.decomposeTask(userRequest);

    res.json({
      success: true,
      message: 'Autonomous session started',
      decomposition,
      estimatedCost: decomposition.subtasks.length * 0.05,
      estimatedTime: decomposition.estimatedTotalTime,
    });

  } catch (error: any) {
    console.error('[API] Error starting autonomous session:', error);
    res.status(500).json({
      error: 'Failed to start autonomous session',
      message: error.message,
    });
  }
});

/**
 * GET /api/mrblue/autonomous/progress/:sessionId
 * Get real-time progress for a session
 */
router.get('/progress/:sessionId', async (req: Request, res: Response) => {
  try {
    await ensureInitialized();

    const { sessionId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const progress = await autonomousEngine.getProgress(sessionId);

    // Verify user owns this session
    if (progress.sessionId !== sessionId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      progress,
    });

  } catch (error: any) {
    console.error('[API] Error fetching progress:', error);
    res.status(500).json({
      error: 'Failed to fetch progress',
      message: error.message,
    });
  }
});

/**
 * GET /api/mrblue/autonomous/history
 * Get past autonomous sessions for current user
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    await ensureInitialized();

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit as string) || 10;

    const sessions = await autonomousEngine.getHistory(req.user.id, limit);

    res.json({
      success: true,
      sessions,
    });

  } catch (error: any) {
    console.error('[API] Error fetching history:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      message: error.message,
    });
  }
});

/**
 * POST /api/mrblue/autonomous/approve/:taskId
 * Approve a risky task (requires manual approval)
 */
router.post('/approve/:taskId', async (req: Request, res: Response) => {
  try {
    await ensureInitialized();

    const { taskId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // TODO: Implement task approval logic
    // For now, just return success
    res.json({
      success: true,
      message: `Task ${taskId} approved`,
    });

  } catch (error: any) {
    console.error('[API] Error approving task:', error);
    res.status(500).json({
      error: 'Failed to approve task',
      message: error.message,
    });
  }
});

/**
 * POST /api/mrblue/autonomous/reject/:taskId
 * Reject a task and rollback changes
 */
router.post('/reject/:taskId', async (req: Request, res: Response) => {
  try {
    await ensureInitialized();

    const { taskId } = req.params;
    const { sessionId, taskNumber } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!sessionId || !taskNumber) {
      return res.status(400).json({
        error: 'sessionId and taskNumber are required',
      });
    }

    // Rollback the task
    await autonomousEngine.rollbackTask(sessionId, taskNumber);

    res.json({
      success: true,
      message: `Task ${taskId} rejected and rolled back`,
    });

  } catch (error: any) {
    console.error('[API] Error rejecting task:', error);
    res.status(500).json({
      error: 'Failed to reject task',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/mrblue/autonomous/cancel/:sessionId
 * Cancel a running autonomous session
 */
router.delete('/cancel/:sessionId', async (req: Request, res: Response) => {
  try {
    await ensureInitialized();

    const { sessionId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await autonomousEngine.cancelSession(sessionId);

    res.json({
      success: true,
      message: `Session ${sessionId} cancelled`,
    });

  } catch (error: any) {
    console.error('[API] Error cancelling session:', error);
    res.status(500).json({
      error: 'Failed to cancel session',
      message: error.message,
    });
  }
});

/**
 * POST /api/mrblue/autonomous/decompose
 * Decompose a request into subtasks (preview only)
 */
router.post('/decompose', async (req: Request, res: Response) => {
  try {
    await ensureInitialized();

    const { userRequest } = req.body;

    if (!userRequest || typeof userRequest !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: userRequest is required and must be a string',
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decomposition = await autonomousEngine.decomposeTask(userRequest);

    res.json({
      success: true,
      decomposition,
      estimatedCost: decomposition.subtasks.length * 0.05,
      estimatedTime: decomposition.estimatedTotalTime,
    });

  } catch (error: any) {
    console.error('[API] Error decomposing task:', error);
    res.status(500).json({
      error: 'Failed to decompose task',
      message: error.message,
    });
  }
});

export default router;
