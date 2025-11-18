/**
 * COMPUTER USE API ROUTES
 * Endpoints for browser automation via Playwright + Anthropic Computer Use
 */

import { Router, Request, Response } from 'express';
import { computerUseService } from '../services/mrBlue/ComputerUseService';
import { browserAutomationService } from '../services/mrBlue/BrowserAutomationService';
import { authenticateToken, requireRoleLevel, type AuthRequest } from '../middleware/auth';
import { db } from '@db';
import { computerUseTasks, computerUseScreenshots } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

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
 * Specialized endpoint for Wix contact extraction using Playwright
 * Uses WIX_EMAIL and WIX_PASSWORD environment variables
 */
router.post('/wix-extract', authenticateToken, requireRoleLevel(8), async (req: AuthRequest, res: Response) => {
  try {
    // Verify Wix credentials are configured
    if (!process.env.WIX_EMAIL || !process.env.WIX_PASSWORD) {
      return res.status(400).json({ 
        error: 'Wix credentials not configured',
        message: 'Please add WIX_EMAIL and WIX_PASSWORD to environment variables'
      });
    }

    const taskId = `wix_extract_${nanoid(10)}`;
    
    console.log(`[WixExtraction] Creating task ${taskId}...`);

    // Create task record
    await db.insert(computerUseTasks).values({
      taskId,
      instruction: 'Extract all contacts from Wix',
      status: 'running',
      steps: [],
      currentStep: 0,
      maxSteps: 20,
      requiresApproval: false, // No approval needed for Wix extraction
      automationType: 'wix_extraction'
    });

    // Execute extraction in background
    (async () => {
      try {
        console.log(`[WixExtraction] Starting extraction for task ${taskId}...`);
        
        const result = await browserAutomationService.extractWixContacts(taskId);

        // Store screenshots
        if (result.screenshots && result.screenshots.length > 0) {
          for (const screenshot of result.screenshots) {
            await db.insert(computerUseScreenshots).values({
              taskId,
              stepNumber: screenshot.step,
              screenshotBase64: screenshot.base64,
              action: { description: screenshot.action }
            });
          }
        }

        // Update task with result
        await db.update(computerUseTasks)
          .set({
            status: result.success ? 'completed' : 'failed',
            currentStep: result.screenshots?.length || 0,
            result: result.data,
            error: result.error,
            steps: result.screenshots?.map(s => ({
              step: s.step,
              action: s.action
            })) || []
          })
          .where(eq(computerUseTasks.taskId, taskId));

        console.log(`[WixExtraction] Task ${taskId} completed:`, result.success ? 'SUCCESS' : 'FAILED');

      } catch (error: any) {
        console.error(`[WixExtraction] Task ${taskId} error:`, error);
        
        await db.update(computerUseTasks)
          .set({
            status: 'failed',
            error: error.message
          })
          .where(eq(computerUseTasks.taskId, taskId));
      }
    })();

    // Return immediately with task ID
    res.json({
      success: true,
      taskId,
      status: 'running',
      message: 'Wix extraction started. Poll /api/computer-use/task/:taskId for status.',
      estimatedTime: '2-3 minutes'
    });

  } catch (error: any) {
    console.error('[WixExtraction] Error starting extraction:', error);
    res.status(500).json({
      error: 'Failed to start Wix extraction',
      message: error.message
    });
  }
});

export default router;
