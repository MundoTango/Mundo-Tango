/**
 * ORCHESTRATION API ROUTES
 * Multi-agent workflow coordination endpoints
 * 
 * Endpoints:
 * - POST /api/orchestration/workflow/execute - Execute workflow
 * - GET /api/orchestration/workflow/:id - Get workflow status
 * - GET /api/orchestration/workflows - List recent workflows
 * - GET /api/orchestration/stats - Get workflow statistics
 * - GET /api/orchestration/intelligence-cycle/metrics - Get intelligence cycle metrics
 * 
 * Workflow Types:
 * 1. Sequential - Execute agents in order
 * 2. Parallel - Execute multiple agents simultaneously
 * 3. Intelligence Cycle - Recursive 7-step learning cycle
 */

import { Router, type Response } from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { 
  workflowExecutionService, 
  type ExecuteWorkflowRequest 
} from '../services/orchestration/WorkflowExecutionService';
import { z } from 'zod';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const workflowStepSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  task: z.union([z.string(), z.any()]),
  context: z.record(z.any()).optional(),
  timeout: z.number().optional(),
  retryCount: z.number().optional()
});

const executeWorkflowSchema = z.object({
  type: z.enum(['sequential', 'parallel', 'intelligence-cycle']),
  name: z.string().optional(),
  steps: z.array(workflowStepSchema).min(1),
  metadata: z.record(z.any()).optional(),
  timeout: z.number().optional()
});

// ============================================================================
// POST /api/orchestration/workflow/execute
// Execute a multi-agent workflow
// ============================================================================

router.post('/workflow/execute', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const body = executeWorkflowSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    console.log(`[Orchestration] User ${req.user.id} executing ${body.type} workflow with ${body.steps.length} steps`);

    const request: ExecuteWorkflowRequest = {
      type: body.type,
      name: body.name,
      steps: body.steps,
      metadata: {
        ...body.metadata,
        userId: req.user.id,
        executedAt: new Date().toISOString()
      },
      timeout: body.timeout
    };

    const result = await workflowExecutionService.execute(request);

    res.json({
      success: result.success,
      data: {
        workflowId: result.workflowId,
        type: body.type,
        duration: result.duration,
        results: result.results,
        errors: result.errors,
        context: result.context
      }
    });
  } catch (error: any) {
    console.error('[Orchestration] Workflow execution failed:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Workflow execution failed'
    });
  }
});

// ============================================================================
// GET /api/orchestration/workflow/:id
// Get workflow execution status
// ============================================================================

router.get('/workflow/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: workflowId } = req.params;

    console.log(`[Orchestration] Fetching workflow: ${workflowId}`);

    const workflow = await workflowExecutionService.getWorkflowStatus(workflowId);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      data: workflow
    });
  } catch (error: any) {
    console.error('[Orchestration] Failed to fetch workflow:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch workflow'
    });
  }
});

// ============================================================================
// GET /api/orchestration/workflows
// List recent workflow executions
// ============================================================================

router.get('/workflows', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    console.log(`[Orchestration] Listing workflows (limit: ${limit}, offset: ${offset})`);

    const workflows = await workflowExecutionService.listWorkflows(limit, offset);

    res.json({
      success: true,
      data: {
        workflows,
        pagination: {
          limit,
          offset,
          count: workflows.length
        }
      }
    });
  } catch (error: any) {
    console.error('[Orchestration] Failed to list workflows:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list workflows'
    });
  }
});

// ============================================================================
// GET /api/orchestration/stats
// Get workflow execution statistics
// ============================================================================

router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log('[Orchestration] Fetching workflow statistics');

    const stats = await workflowExecutionService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('[Orchestration] Failed to fetch stats:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch statistics'
    });
  }
});

// ============================================================================
// GET /api/orchestration/intelligence-cycle/metrics
// Get intelligence cycle specific metrics
// ============================================================================

router.get('/intelligence-cycle/metrics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log('[Orchestration] Fetching intelligence cycle metrics');

    const metrics = await workflowExecutionService.getIntelligenceCycleMetrics();

    res.json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    console.error('[Orchestration] Failed to fetch intelligence cycle metrics:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch metrics'
    });
  }
});

// ============================================================================
// WORKFLOW EXAMPLES & DOCUMENTATION
// ============================================================================

/**
 * POST /api/orchestration/workflow/execute
 * 
 * EXAMPLE 1: Sequential Workflow
 * Execute agents one after another
 * 
 * ```json
 * {
 *   "type": "sequential",
 *   "name": "Health Assessment Pipeline",
 *   "steps": [
 *     {
 *       "id": "step-1",
 *       "agentId": "life-ceo-health-advisor",
 *       "task": "Analyze user's health goals and current state",
 *       "context": { "userId": 123 }
 *     },
 *     {
 *       "id": "step-2",
 *       "agentId": "life-ceo-nutrition-expert",
 *       "task": "Create personalized nutrition plan based on health analysis"
 *     },
 *     {
 *       "id": "step-3",
 *       "agentId": "life-ceo-fitness-trainer",
 *       "task": "Design workout routine aligned with nutrition plan"
 *     }
 *   ]
 * }
 * ```
 * 
 * EXAMPLE 2: Parallel Workflow
 * Execute multiple agents simultaneously
 * 
 * ```json
 * {
 *   "type": "parallel",
 *   "name": "Multi-Domain Knowledge Search",
 *   "steps": [
 *     {
 *       "id": "search-health",
 *       "agentId": "life-ceo-health-advisor",
 *       "task": "Search health knowledge base for diabetes management"
 *     },
 *     {
 *       "id": "search-nutrition",
 *       "agentId": "life-ceo-nutrition-expert",
 *       "task": "Search nutrition database for low-glycemic recipes"
 *     },
 *     {
 *       "id": "search-fitness",
 *       "agentId": "life-ceo-fitness-trainer",
 *       "task": "Find exercises suitable for diabetes patients"
 *     }
 *   ]
 * }
 * ```
 * 
 * EXAMPLE 3: Intelligence Cycle
 * Recursive learning cycle with feedback loops
 * 
 * ```json
 * {
 *   "type": "intelligence-cycle",
 *   "name": "Platform Quality Improvement Cycle",
 *   "steps": [
 *     {
 *       "id": "planner",
 *       "agentId": "orchestration-task-planner",
 *       "task": "Plan quality improvements"
 *     },
 *     {
 *       "id": "executor",
 *       "agentId": "mr-blue-autonomous",
 *       "task": "Execute improvement tasks"
 *     },
 *     {
 *       "id": "validator",
 *       "agentId": "orchestration-quality-validator",
 *       "task": "Validate changes and measure quality"
 *     },
 *     {
 *       "id": "learner",
 *       "agentId": "orchestration-learning-agent",
 *       "task": "Learn patterns and update knowledge base"
 *     }
 *   ],
 *   "timeout": 300000
 * }
 * ```
 */

export default router;
