/**
 * MR BLUE ORCHESTRATION ROUTES
 * Multi-agent workflow coordination API
 * 
 * Pipelines:
 * 1. Error Detection → Auto-Fix → Git Commit
 * 2. Visual Editor → Change Detection → Git Commit
 * 3. Multi-agent workflow execution
 * 
 * Features:
 * - Event bus integration
 * - Progress tracking via SSE
 * - Workflow execution and monitoring
 */

import { Router, type Request, type Response } from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { agentEventBus, type ErrorDetectedEvent } from '../services/mrBlue/AgentEventBus';
import { progressTrackingAgent } from '../services/mrBlue/ProgressTrackingAgent';
import { agentOrchestrator, type Agent } from '../services/mrBlue/AgentOrchestrator';
import { AutoFixEngine } from '../services/mrBlue/AutoFixEngine';
import { commitChanges, type CommitRequest } from '../services/mrBlue/gitCommitGenerator';
import { VibeCodingService } from '../services/mrBlue/VibeCodingService';
import { ErrorAnalysisAgent } from '../services/mrBlue/errorAnalysisAgent';
import { z } from 'zod';

const router = Router();

// Initialize services
const autoFixEngine = new AutoFixEngine();
const vibeCoding = new VibeCodingService();
const errorAnalysis = new ErrorAnalysisAgent();

// Initialize on startup
(async () => {
  try {
    await autoFixEngine.initialize();
    await vibeCoding.initialize();
    console.log('[Orchestration Routes] ✅ Services initialized');
  } catch (error) {
    console.error('[Orchestration Routes] ❌ Failed to initialize:', error);
  }
})();

// Validation schemas
const errorDetectionSchema = z.object({
  error: z.object({
    message: z.string(),
    stack: z.string().optional(),
    type: z.string(),
    context: z.any().optional(),
  }),
});

const visualChangeSchema = z.object({
  filePath: z.string(),
  changeDescription: z.string(),
  autoCommit: z.boolean().default(true),
});

const workflowExecutionSchema = z.object({
  steps: z.array(
    z.object({
      agentName: z.string(),
      input: z.any(),
      retryCount: z.number().optional(),
      timeout: z.number().optional(),
    })
  ),
  parallel: z.boolean().default(false),
});

// ==================== PIPELINE 1: ERROR DETECTION → AUTO-FIX ====================

/**
 * POST /api/mrblue/orchestration/errors
 * Pipeline 1: ProactiveErrorDetector → ErrorAnalysisAgent → AutoFixEngine → VibeCoding → Git
 */
router.post('/errors', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const body = errorDetectionSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const sessionId = `error_fix_${req.user.id}_${Date.now()}`;

    console.log(`[Orchestration] 🚨 Error detected, starting auto-fix pipeline ${sessionId}`);

    // Phase 1: Publish error:detected event
    const errorEvent = agentEventBus.createEvent<ErrorDetectedEvent>(
      'error:detected',
      'ProactiveErrorDetector',
      {
        error: body.error,
      }
    );

    await agentEventBus.publish(errorEvent);

    // Phase 2: Start progress tracking
    progressTrackingAgent.startSession(sessionId, 4);
    progressTrackingAgent.updatePhase(sessionId, 'planning', 'Analyzing error...');

    // Phase 3: Analyze error
    const categorization = await errorAnalysis.categorizeBug({
      title: body.error.type,
      description: body.error.message,
      severity: 'high',
    });

    console.log(`[Orchestration] 📊 Error categorized as ${categorization.type} (${categorization.confidence})`);

    // Publish error:analyzed event
    const analyzedEvent = agentEventBus.createEvent(
      'error:analyzed',
      'ErrorAnalysisAgent',
      {
        analysis: {
          rootCause: categorization.reasoning,
          suggestedFix: `Fix ${categorization.type} error: ${body.error.message}`,
          confidence: categorization.confidence * 100,
          affectedFiles: [],
        },
      } as any
    );

    await agentEventBus.publish(analyzedEvent);

    // Phase 4: Generate fix via Vibe Coding
    progressTrackingAgent.updatePhase(sessionId, 'execution', 'Generating code fix...');

    const vibeRequest = {
      naturalLanguage: `Fix this ${categorization.type} error: ${body.error.message}`,
      userId: req.user.id,
      sessionId,
    };

    const vibeResult = await vibeCoding.generateCode(vibeRequest);

    if (vibeResult.success) {
      // Publish code:generated event
      const codeEvent = agentEventBus.createEvent(
        'code:generated',
        'VibeCodingService',
        {
          sessionId,
          fileChanges: vibeResult.fileChanges,
        } as any
      );

      await agentEventBus.publish(codeEvent);

      // Phase 5: Validation
      progressTrackingAgent.updatePhase(sessionId, 'validation', 'Validating fix...');

      if (vibeResult.validationResults.safety && vibeResult.validationResults.syntax) {
        // Publish validation:passed event
        const validationEvent = agentEventBus.createEvent(
          'validation:passed',
          'ValidationAgent',
          {
            sessionId,
            validationResults: vibeResult.validationResults,
          } as any
        );

        await agentEventBus.publish(validationEvent);

        // Phase 6: Auto-commit (if confidence is high enough)
        const confidence = categorization.confidence * 100;

        if (confidence >= 80) {
          const files = vibeResult.fileChanges.map((fc) => fc.filePath);
          const commitResult = await commitChanges({
            files,
            description: `Auto-fix ${categorization.type} error: ${body.error.message}`,
          });

          progressTrackingAgent.completeSession(sessionId, true);

          return res.json({
            success: true,
            sessionId,
            action: 'auto-applied',
            confidence,
            vibeResult,
            commitResult,
          });
        } else {
          progressTrackingAgent.completeSession(sessionId, true);

          return res.json({
            success: true,
            sessionId,
            action: 'requires-approval',
            confidence,
            vibeResult,
            message: 'Fix generated but requires user approval (confidence < 80%)',
          });
        }
      } else {
        // Validation failed
        const failEvent = agentEventBus.createEvent(
          'validation:failed',
          'ValidationAgent',
          {
            sessionId,
            errors: vibeResult.validationResults.warnings,
          } as any
        );

        await agentEventBus.publish(failEvent);

        progressTrackingAgent.completeSession(sessionId, false);

        return res.status(400).json({
          success: false,
          error: 'Generated fix failed validation',
          validationResults: vibeResult.validationResults,
        });
      }
    } else {
      progressTrackingAgent.completeSession(sessionId, false);

      return res.status(400).json({
        success: false,
        error: 'Failed to generate fix',
        details: vibeResult.error,
      });
    }
  } catch (error: any) {
    console.error('[Orchestration] ❌ Error pipeline failed:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// ==================== PIPELINE 2: VISUAL EDITOR → GIT AUTO-COMMIT ====================

/**
 * POST /api/mrblue/orchestration/visual-change
 * Pipeline 2: Visual Editor → Event Bus → Git Auto-Commit
 */
router.post('/visual-change', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const body = visualChangeSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    console.log(`[Orchestration] 🎨 Visual change detected: ${body.filePath}`);

    // Publish visual:change event
    const changeEvent = agentEventBus.createEvent(
      'visual:change',
      'IframeInjector',
      {
        filePath: body.filePath,
        changeDescription: body.changeDescription,
      } as any
    );

    await agentEventBus.publish(changeEvent);

    // Auto-commit if requested
    if (body.autoCommit) {
      const commitResult = await commitChanges({
        files: [body.filePath],
        description: body.changeDescription,
      });

      return res.json({
        success: true,
        message: 'Visual change committed',
        commitResult,
      });
    }

    res.json({
      success: true,
      message: 'Visual change event published',
    });
  } catch (error: any) {
    console.error('[Orchestration] ❌ Visual change pipeline failed:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// ==================== MULTI-AGENT WORKFLOW EXECUTION ====================

/**
 * POST /api/mrblue/orchestration/workflow
 * Execute a multi-agent workflow
 */
router.post('/workflow', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const body = workflowExecutionSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const sessionId = `workflow_${req.user.id}_${Date.now()}`;

    console.log(`[Orchestration] 🎯 Starting workflow ${sessionId} with ${body.steps.length} steps`);

    let result;
    if (body.parallel) {
      result = await agentOrchestrator.executeParallel(sessionId, req.user.id, body.steps);
    } else {
      result = await agentOrchestrator.executeWorkflow(sessionId, req.user.id, body.steps);
    }

    res.json({
      success: result.success,
      data: result,
    });
  } catch (error: any) {
    console.error('[Orchestration] ❌ Workflow execution failed:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// ==================== PROGRESS TRACKING (SSE) ====================

/**
 * GET /api/mrblue/orchestration/progress/:sessionId
 * Stream progress updates via Server-Sent Events
 */
router.get('/progress/:sessionId', authenticateToken, (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;

  console.log(`[Orchestration] 📡 SSE connection for session ${sessionId}`);

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Register SSE callback
  const unsubscribe = progressTrackingAgent.registerSSE(sessionId, (progress) => {
    res.write(`data: ${JSON.stringify(progress)}\n\n`);
  });

  // Cleanup on disconnect
  req.on('close', () => {
    unsubscribe();
    console.log(`[Orchestration] 📡 SSE connection closed for ${sessionId}`);
  });
});

// ==================== EVENT BUS MONITORING ====================

/**
 * GET /api/mrblue/orchestration/events
 * Get recent events from the event bus
 */
router.get('/events', authenticateToken, (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const eventType = req.query.type as any;

  const events = agentEventBus.getHistory(eventType, limit);

  res.json({
    success: true,
    data: events,
  });
});

/**
 * GET /api/mrblue/orchestration/subscriptions
 * Get active event subscriptions
 */
router.get('/subscriptions', authenticateToken, (req: Request, res: Response) => {
  const subscriptions = agentEventBus.getSubscriptions();

  res.json({
    success: true,
    data: subscriptions,
  });
});

/**
 * GET /api/mrblue/orchestration/agents
 * Get registered agents
 */
router.get('/agents', authenticateToken, (req: Request, res: Response) => {
  const agents = agentOrchestrator.getAgents();

  res.json({
    success: true,
    data: agents.map((agent) => ({
      name: agent.name,
      description: agent.description,
      capabilities: agent.capabilities,
    })),
  });
});

export default router;
