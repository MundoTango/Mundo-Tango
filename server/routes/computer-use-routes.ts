/**
 * COMPUTER USE API ROUTES
 * Endpoints for Anthropic Computer Use automation
 */

import { Router, Request, Response } from 'express';
import { computerUseService } from '../services/mrBlue/ComputerUseService';
import { authenticateToken, requireRoleLevel, type AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/computer-use/automate
 * Start a new computer automation task
 */
router.post('/automate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instruction, requiresApproval, maxSteps } = req.body;

    if (!instruction) {
      return res.status(400).json({ error: 'Instruction is required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const task = await computerUseService.startAutomation({
      userId: req.user.id,
      instruction,
      requiresApproval: requiresApproval !== false, // Default true
      maxSteps: maxSteps || 50
    });

    res.json({
      success: true,
      task: {
        id: task.id,
        status: task.status,
        instruction: task.instruction,
        createdAt: task.createdAt
      }
    });

  } catch (error: any) {
    console.error('[ComputerUse API] Error starting automation:', error);
    res.status(500).json({
      error: 'Failed to start automation',
      message: error.message
    });
  }
});

/**
 * GET /api/computer-use/task/:taskId
 * Get task status and results
 */
router.get('/task/:taskId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await computerUseService.getTask(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user owns this task
    if (task.userId !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      task: {
        id: task.id,
        status: task.status,
        instruction: task.instruction,
        steps: task.steps.map(s => ({
          stepNumber: s.stepNumber,
          action: s.action,
          success: s.success,
          error: s.error,
          timestamp: s.timestamp
        })),
        result: task.result,
        error: task.error,
        createdAt: task.createdAt,
        completedAt: task.completedAt
      }
    });

  } catch (error: any) {
    console.error('[ComputerUse API] Error fetching task:', error);
    res.status(500).json({
      error: 'Failed to fetch task',
      message: error.message
    });
  }
});

/**
 * POST /api/computer-use/task/:taskId/approve
 * Approve a task that requires approval
 */
router.post('/task/:taskId/approve', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await computerUseService.getTask(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user owns this task
    if (task.userId !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await computerUseService.approveTask(taskId);

    res.json({
      success: true,
      message: 'Task approved and resumed'
    });

  } catch (error: any) {
    console.error('[ComputerUse API] Error approving task:', error);
    res.status(500).json({
      error: 'Failed to approve task',
      message: error.message
    });
  }
});

/**
 * POST /api/computer-use/task/:taskId/cancel
 * Cancel a running task
 */
router.post('/task/:taskId/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await computerUseService.getTask(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user owns this task
    if (task.userId !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await computerUseService.cancelTask(taskId);

    res.json({
      success: true,
      message: 'Task cancelled'
    });

  } catch (error: any) {
    console.error('[ComputerUse API] Error cancelling task:', error);
    res.status(500).json({
      error: 'Failed to cancel task',
      message: error.message
    });
  }
});

/**
 * POST /api/computer-use/wix-extract
 * Specialized endpoint for Wix contact extraction
 */
router.post('/wix-extract', authenticateToken, requireRoleLevel(8), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Wix email and password required' });
    }

    const task = await computerUseService.extractWixContacts({ email, password });

    res.json({
      success: true,
      task: {
        id: task.id,
        status: task.status,
        message: 'Wix extraction started - requires approval before execution'
      }
    });

  } catch (error: any) {
    console.error('[ComputerUse API] Error starting Wix extraction:', error);
    res.status(500).json({
      error: 'Failed to start Wix extraction',
      message: error.message
    });
  }
});

export default router;
