/**
 * MB.MD Session Routes
 * 
 * API endpoints for managing mb.md sessions and auto-invoke agents.
 * These routes make the Leadership Agent System actually operational.
 */

import { Router, Request, Response } from 'express';
import { mbmdSessionService } from '../services/MBMDSessionService';
import { gitHubPracticesAgent } from '../services/GitHubPracticesAgent';
import { planTrackerAgent } from '../services/PlanTrackerAgent';
import { mrBlueCommandExecutor } from '../services/MrBlueCommandExecutor';

const router = Router();

/**
 * POST /api/mbmd/session/start
 * Start a new mb.md session - triggers all auto-invoke agents
 */
router.post('/session/start', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const result = await mbmdSessionService.startSession(userId);
    
    res.json({
      success: true,
      message: 'MB.MD session started - Auto-invoke agents triggered',
      session: {
        id: result.session.id,
        startTime: result.session.startTime,
        status: result.session.status,
      },
      autoInvoke: {
        gitHubPractices: result.autoInvokeResults.gitPractices,
        planTracker: result.autoInvokeResults.planTracker,
      },
    });
  } catch (error) {
    console.error('[MBMD Routes] Session start error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start session',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/mbmd/session/end
 * End the current mb.md session
 */
router.post('/session/end', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const session = await mbmdSessionService.endSession(reason);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'No active session to end',
      });
    }

    res.json({
      success: true,
      message: 'MB.MD session ended',
      session: {
        id: session.id,
        duration: session.endTime 
          ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000)
          : 0,
        tasksStarted: session.tasksStarted.length,
        tasksCompleted: session.tasksCompleted.length,
        agentInvocations: session.agentInvocations.length,
      },
    });
  } catch (error) {
    console.error('[MBMD Routes] Session end error:', error);
    res.status(500).json({ success: false, error: 'Failed to end session' });
  }
});

/**
 * GET /api/mbmd/session/status
 * Get current session status
 */
router.get('/session/status', async (req: Request, res: Response) => {
  try {
    const status = mbmdSessionService.getSessionStatus();
    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error('[MBMD Routes] Session status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get session status' });
  }
});

/**
 * POST /api/mbmd/task/start
 * Record starting a task
 */
router.post('/task/start', async (req: Request, res: Response) => {
  try {
    const { description, agentId } = req.body;
    
    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Task description is required',
      });
    }

    const task = await mbmdSessionService.startTask(description, agentId);
    
    res.json({
      success: true,
      message: 'Task started - Plan Tracker notified',
      task,
    });
  } catch (error) {
    console.error('[MBMD Routes] Task start error:', error);
    res.status(500).json({ success: false, error: 'Failed to start task' });
  }
});

/**
 * POST /api/mbmd/task/complete
 * Record completing a task
 */
router.post('/task/complete', async (req: Request, res: Response) => {
  try {
    const { taskId, success = true } = req.body;
    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required',
      });
    }

    const task = await mbmdSessionService.completeTask(taskId, success);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task completed - GitHub Practices & Plan Tracker notified',
      task,
    });
  } catch (error) {
    console.error('[MBMD Routes] Task complete error:', error);
    res.status(500).json({ success: false, error: 'Failed to complete task' });
  }
});

/**
 * POST /api/mbmd/commit/validate
 * Validate a commit message against conventional commit format
 */
router.post('/commit/validate', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Commit message is required',
      });
    }

    const validation = gitHubPracticesAgent.validateCommitMessage(message);
    
    res.json({
      success: true,
      validation,
      suggestion: validation.valid 
        ? null 
        : 'Use format: type(scope): description',
    });
  } catch (error) {
    console.error('[MBMD Routes] Commit validate error:', error);
    res.status(500).json({ success: false, error: 'Failed to validate commit' });
  }
});

/**
 * GET /api/mbmd/git/status
 * Get current git status
 */
router.get('/git/status', async (req: Request, res: Response) => {
  try {
    const status = await gitHubPracticesAgent.getGitStatus();
    const checklist = gitHubPracticesAgent.getPreCommitChecklist();
    
    res.json({
      success: true,
      status,
      checklist,
    });
  } catch (error) {
    console.error('[MBMD Routes] Git status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get git status' });
  }
});

/**
 * GET /api/mbmd/plan/status
 * Get current plan status
 */
router.get('/plan/status', async (req: Request, res: Response) => {
  try {
    const plans = await planTrackerAgent.loadAllPlans();
    
    const totalProgress = plans.length > 0
      ? Math.round(plans.reduce((sum, p) => sum + p.progress, 0) / plans.length)
      : 0;
    
    res.json({
      success: true,
      plans: plans.map(p => ({
        name: p.name,
        file: p.file,
        status: p.status,
        progress: p.progress,
      })),
      summary: {
        totalPlans: plans.length,
        averageProgress: totalProgress,
        completedPlans: plans.filter(p => p.status === 'completed').length,
        inProgressPlans: plans.filter(p => p.status === 'in_progress').length,
      },
    });
  } catch (error) {
    console.error('[MBMD Routes] Plan status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get plan status' });
  }
});

/**
 * POST /api/mbmd/plan/update-task
 * Update a task status in a plan file
 */
router.post('/plan/update-task', async (req: Request, res: Response) => {
  try {
    const { planFile, taskDescription, status } = req.body;
    
    if (!planFile || !taskDescription || !status) {
      return res.status(400).json({
        success: false,
        error: 'planFile, taskDescription, and status are required',
      });
    }

    if (!['completed', 'in_progress', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be: completed, in_progress, or pending',
      });
    }

    const result = await planTrackerAgent.updateTaskStatus(planFile, taskDescription, status);
    
    res.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error('[MBMD Routes] Plan update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update plan' });
  }
});

/**
 * POST /api/mbmd/ask
 * Ask a leadership agent for advice
 */
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { agentId, question } = req.body;
    
    if (!agentId || !question) {
      return res.status(400).json({
        success: false,
        error: 'agentId and question are required',
      });
    }

    const answer = await mbmdSessionService.askAgent(agentId, question);
    
    res.json({
      success: true,
      agentId,
      question,
      answer,
    });
  } catch (error) {
    console.error('[MBMD Routes] Ask error:', error);
    res.status(500).json({ success: false, error: 'Failed to get answer' });
  }
});

/**
 * GET /api/mbmd/history
 * Get session history
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const history = mbmdSessionService.getSessionHistory();
    
    res.json({
      success: true,
      sessions: history.map(s => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
        tasksCompleted: s.tasksCompleted.length,
        agentInvocations: s.agentInvocations.length,
      })),
      total: history.length,
    });
  } catch (error) {
    console.error('[MBMD Routes] History error:', error);
    res.status(500).json({ success: false, error: 'Failed to get history' });
  }
});

/**
 * POST /api/mbmd/command
 * Execute a command with Mr. Blue
 * This is the main entry point for commanding Mr. Blue to do something
 */
router.post('/command', async (req: Request, res: Response) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        error: 'Command is required',
        usage: 'POST /api/mbmd/command { "command": "your instruction here" }'
      });
    }

    const userId = (req as any).user?.id;
    const result = await mrBlueCommandExecutor.executeCommand(command, userId);
    
    res.json({
      success: result.success,
      command: result.command,
      response: result.response,
      agent: result.agentUsed,
      executionTime: `${result.executionTime}ms`,
      learnings: result.learnings || []
    });
  } catch (error) {
    console.error('[MBMD Routes] Command execution error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to execute command',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/mbmd/status
 * Get Mr. Blue operational status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await mrBlueCommandExecutor.getStatus();
    const sessionStatus = mbmdSessionService.getSessionStatus();
    
    res.json({
      success: true,
      mrBlue: status,
      session: sessionStatus,
      endpoints: {
        command: 'POST /api/mbmd/command',
        session: {
          start: 'POST /api/mbmd/session/start',
          end: 'POST /api/mbmd/session/end',
          status: 'GET /api/mbmd/session/status'
        },
        git: 'GET /api/mbmd/git/status',
        plan: 'GET /api/mbmd/plan/status',
        ask: 'POST /api/mbmd/ask'
      }
    });
  } catch (error) {
    console.error('[MBMD Routes] Status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get status' });
  }
});

export default router;
