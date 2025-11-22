/**
 * MR BLUE TASK PLANNER API ROUTES - AGENT #44
 * API endpoints for AI-powered task decomposition and planning
 */

import { Router, Request, Response } from 'express';
import { TaskPlanner } from '../services/mrBlue/TaskPlanner';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();
const taskPlanner = new TaskPlanner();

// Initialize service on startup
taskPlanner.initialize().catch(err => 
  console.error('[TaskPlanner Routes] Initialization error:', err)
);

/**
 * POST /api/mrblue/task-planner/decompose
 * Decompose a complex request into atomic subtasks
 */
router.post('/decompose', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userRequest } = req.body;

    if (!userRequest || typeof userRequest !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userRequest (string) is required'
      });
    }

    const decomposition = await taskPlanner.decomposeTask(userRequest);

    res.json({
      success: true,
      decomposition
    });
  } catch (error: any) {
    console.error('[TaskPlanner API] Decompose error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/task-planner/execution-order
 * Get optimal execution order for subtasks
 */
router.post('/execution-order', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { subtasks } = req.body;

    if (!Array.isArray(subtasks)) {
      return res.status(400).json({
        success: false,
        error: 'subtasks (array) is required'
      });
    }

    const orderedTasks = taskPlanner.getExecutionOrder(subtasks);

    res.json({
      success: true,
      orderedTasks,
      count: orderedTasks.length
    });
  } catch (error: any) {
    console.error('[TaskPlanner API] Execution order error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/task-planner/parallel-batches
 * Get tasks that can run in parallel
 */
router.post('/parallel-batches', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { subtasks } = req.body;

    if (!Array.isArray(subtasks)) {
      return res.status(400).json({
        success: false,
        error: 'subtasks (array) is required'
      });
    }

    const batches = taskPlanner.getParallelBatches(subtasks);

    res.json({
      success: true,
      batches,
      batchCount: batches.length
    });
  } catch (error: any) {
    console.error('[TaskPlanner API] Parallel batches error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/task-planner/dependency-graph
 * Build dependency graph for visualization
 */
router.post('/dependency-graph', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { subtasks } = req.body;

    if (!Array.isArray(subtasks)) {
      return res.status(400).json({
        success: false,
        error: 'subtasks (array) is required'
      });
    }

    const graph = taskPlanner.buildDependencyGraph(subtasks);

    res.json({
      success: true,
      graph
    });
  } catch (error: any) {
    console.error('[TaskPlanner API] Dependency graph error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
