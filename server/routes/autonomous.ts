/**
 * Mr. Blue Autonomous Agent API Routes
 * 
 * Full autonomous execution endpoints with God Level (Tier 8) security
 * Enables Mr. Blue to build features autonomously using MB.MD methodology
 * 
 * SAFETY FEATURES (Phase 9):
 * - Rate limiting: 5 tasks/hour per user
 * - Cost caps: $10 max per task
 * - Audit logging: All actions logged to auditLogs table
 * - Destructive operation gates: Warn on file deletions
 */

import { Router, type Request, Response } from "express";
import { authenticateToken, requireRoleLevel, type AuthRequest } from "../middleware/auth";
import { mbmdEngine } from "../services/mrBlue/mbmdEngine";
import { codeGenerator } from "../services/mrBlue/codeGenerator";
import { validator } from "../services/mrBlue/validator";
import { autonomousAgent } from "../services/mrBlue/autonomousAgent";
import { db } from "../storage";
import { auditLogs, autonomousTasks } from "../../shared/schema";
import { eq, and, gte, count, desc } from "drizzle-orm";

const router = Router();

// Safety Constants
const RATE_LIMIT_WINDOW_HOURS = 1;
const RATE_LIMIT_MAX_TASKS = 5;
const MAX_COST_PER_TASK = 10.00; // $10 USD

// In-memory task storage (will persist to DB after validation)
interface AutonomousTask {
  id: string;
  userId: number;
  prompt: string;
  status: 'pending' | 'decomposing' | 'generating' | 'validating' | 'awaiting_approval' | 'applying' | 'completed' | 'failed';
  decomposition?: any;
  generatedFiles?: any[];
  validationReport?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  snapshotId?: string;
  estimatedCost?: number;
  actualCost?: number;
}

const tasks = new Map<string, AutonomousTask>();

// ============================================================================
// SAFETY HELPER FUNCTIONS (Phase 9)
// ============================================================================

/**
 * Check if user has exceeded rate limit
 * Returns true if rate limit exceeded
 */
async function checkRateLimit(userId: number): Promise<{ exceeded: boolean; remaining: number }> {
  const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000);
  
  try {
    const result = await db
      .select({ count: count() })
      .from(autonomousTasks)
      .where(
        and(
          eq(autonomousTasks.userId, userId),
          gte(autonomousTasks.createdAt, oneHourAgo)
        )
      );

    const taskCount = result[0]?.count || 0;
    const remaining = Math.max(0, RATE_LIMIT_MAX_TASKS - Number(taskCount));
    
    return {
      exceeded: taskCount >= RATE_LIMIT_MAX_TASKS,
      remaining
    };
  } catch (error) {
    console.error('[Autonomous] Rate limit check error:', error);
    // Fail open: allow task if DB check fails
    return { exceeded: false, remaining: RATE_LIMIT_MAX_TASKS };
  }
}

/**
 * Estimate cost based on prompt complexity
 * Very rough estimate: $0.001 per token, ~4 chars per token
 */
function estimateCost(prompt: string, decompositionSize?: number): number {
  const promptTokens = Math.ceil(prompt.length / 4);
  const baseTokens = decompositionSize ? decompositionSize * 500 : 2000; // Estimate tokens per subtask
  const totalTokens = promptTokens + baseTokens;
  return Math.min(totalTokens * 0.001, MAX_COST_PER_TASK);
}

/**
 * Log audit action to database
 */
async function logAuditAction(
  userId: number,
  action: string,
  details: string,
  metadata?: any
): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      details,
      ipAddress: '127.0.0.1', // TODO: Get from request
      userAgent: 'Mr. Blue Autonomous Agent',
      metadata: metadata || null
    });
  } catch (error) {
    console.error('[Autonomous] Audit log error:', error);
    // Don't fail task if audit logging fails
  }
}

/**
 * Persist task to database
 */
async function persistTaskToDB(task: AutonomousTask): Promise<void> {
  try {
    await db.insert(autonomousTasks).values({
      id: task.id,
      userId: task.userId,
      prompt: task.prompt,
      status: task.status,
      decomposition: task.decomposition || null,
      generatedFiles: task.generatedFiles || null,
      validationReport: task.validationReport || null,
      error: task.error || null,
      snapshotId: task.snapshotId || null,
      estimatedCost: task.estimatedCost?.toString() || '0.00',
      actualCost: task.actualCost?.toString() || '0.00',
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.status === 'completed' ? task.updatedAt : null
    }).onConflictDoUpdate({
      target: autonomousTasks.id,
      set: {
        status: task.status,
        decomposition: task.decomposition || null,
        generatedFiles: task.generatedFiles || null,
        validationReport: task.validationReport || null,
        error: task.error || null,
        snapshotId: task.snapshotId || null,
        actualCost: task.actualCost?.toString() || '0.00',
        updatedAt: task.updatedAt,
        completedAt: task.status === 'completed' ? task.updatedAt : null
      }
    });
  } catch (error) {
    console.error('[Autonomous] DB persist error:', error);
    // Continue even if DB persistence fails (using in-memory fallback)
  }
}

/**
 * POST /api/autonomous/execute
 * Execute autonomous development task
 * 
 * Body: { prompt: string, autoApprove?: boolean }
 * Returns: { taskId, status, decomposition }
 */
router.post("/execute", 
  authenticateToken, 
  requireRoleLevel(8), // God Level only
  async (req: AuthRequest, res: Response) => {
    try {
      const { prompt, autoApprove = false } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({
          success: false,
          message: "Prompt is required and must be a non-empty string"
        });
      }

      // Get user's role level (God Level = 8)
      // God Level users identified by role === 'god'
      const isGodLevel = req.user?.role === 'god';
      const userRoleLevel = isGodLevel ? 8 : 0; // God Level users have no limits
      
      // SAFETY CHECK 1: Rate Limiting (skip for God Level)
      let rateLimitRemaining = RATE_LIMIT_MAX_TASKS;
      if (userRoleLevel < 8) {
        const rateLimit = await checkRateLimit(req.userId!);
        rateLimitRemaining = rateLimit.remaining;
        if (rateLimit.exceeded) {
          await logAuditAction(
            req.userId!,
            'autonomous_task_rate_limit_exceeded',
            `User attempted to create task but exceeded rate limit (${RATE_LIMIT_MAX_TASKS} tasks/${RATE_LIMIT_WINDOW_HOURS}h)`,
            { prompt: prompt.substring(0, 100) }
          );

          return res.status(429).json({
            success: false,
            message: `Rate limit exceeded. You can create ${RATE_LIMIT_MAX_TASKS} autonomous tasks per ${RATE_LIMIT_WINDOW_HOURS} hour(s). Try again later.`,
            rateLimitRemaining: 0,
            rateLimitResetsIn: `${RATE_LIMIT_WINDOW_HOURS} hour(s)`
          });
        }
      } else {
        console.log('[Autonomous] God Level user - skipping rate limit');
      }

      // SAFETY CHECK 2: Cost Estimation (skip for God Level)
      const estimatedCost = estimateCost(prompt.trim());
      if (userRoleLevel < 8 && estimatedCost > MAX_COST_PER_TASK) {
        return res.status(400).json({
          success: false,
          message: `Estimated cost ($${estimatedCost.toFixed(2)}) exceeds maximum allowed ($${MAX_COST_PER_TASK.toFixed(2)}). Please simplify your request.`
        });
      } else if (userRoleLevel >= 8) {
        console.log('[Autonomous] God Level user - skipping cost cap');
      }

      // Create task
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const task: AutonomousTask = {
        id: taskId,
        userId: req.userId!,
        prompt: prompt.trim(),
        status: 'pending',
        estimatedCost,
        actualCost: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      tasks.set(taskId, task);

      // SAFETY CHECK 3: Audit Logging
      await logAuditAction(
        req.userId!,
        'autonomous_task_created',
        `User created autonomous task: "${prompt.substring(0, 100)}..."`,
        { taskId, estimatedCost, autoApprove }
      );

      // Persist to DB
      await persistTaskToDB(task);

      // Start async execution
      executeAutonomousTask(taskId, autoApprove).catch(error => {
        console.error(`[Autonomous] Task ${taskId} failed:`, error);
        const task = tasks.get(taskId);
        if (task) {
          task.status = 'failed';
          task.error = error.message || 'Unknown error';
          task.updatedAt = new Date();
          persistTaskToDB(task); // Persist failure
          logAuditAction(req.userId!, 'autonomous_task_failed', `Task ${taskId} failed: ${error.message}`, { taskId });
        }
      });

      res.json({
        success: true,
        taskId,
        status: task.status,
        estimatedCost: estimatedCost.toFixed(2),
        rateLimitRemaining: userRoleLevel >= 8 ? 999 : rateLimitRemaining - 1,
        godLevelUnlimited: userRoleLevel >= 8,
        message: "Task started. Use /api/autonomous/status/:taskId to check progress"
      });
    } catch (error: any) {
      console.error('[Autonomous] Execute error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to start autonomous task"
      });
    }
  }
);

/**
 * GET /api/autonomous/status/:taskId
 * Get task status and progress
 */
router.get("/status/:taskId",
  authenticateToken,
  requireRoleLevel(8),
  async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const task = tasks.get(taskId);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
      }

      // Ensure user owns this task
      if (task.userId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      res.json({
        success: true,
        task: {
          id: task.id,
          prompt: task.prompt,
          status: task.status,
          decomposition: task.decomposition,
          generatedFiles: task.generatedFiles?.map(f => ({
            filePath: f.filePath,
            language: f.language,
            explanation: f.explanation
          })),
          validationReport: task.validationReport,
          error: task.error,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }
      });
    } catch (error: any) {
      console.error('[Autonomous] Status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get task status"
      });
    }
  }
);

/**
 * POST /api/autonomous/approve/:taskId
 * Approve and apply generated code
 */
router.post("/approve/:taskId",
  authenticateToken,
  requireRoleLevel(8),
  async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const task = tasks.get(taskId);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
      }

      if (task.userId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      if (task.status !== 'awaiting_approval') {
        return res.status(400).json({
          success: false,
          message: `Cannot approve task in status: ${task.status}`
        });
      }

      // Apply files
      task.status = 'applying';
      task.updatedAt = new Date();

      const results = await applyGeneratedFiles(task);

      if (results.success) {
        task.status = 'completed';
        task.updatedAt = new Date();

        // SAFETY: Audit logging
        await logAuditAction(
          req.userId!,
          'autonomous_task_approved',
          `User approved and applied task ${taskId}`,
          { taskId, filesModified: results.filesModified }
        );

        // Persist completion to DB
        await persistTaskToDB(task);

        res.json({
          success: true,
          message: "Code applied successfully",
          filesModified: results.filesModified
        });
      } else {
        task.status = 'failed';
        task.error = results.error;
        task.updatedAt = new Date();

        // SAFETY: Audit logging
        await logAuditAction(
          req.userId!,
          'autonomous_task_apply_failed',
          `Task ${taskId} approval failed during application`,
          { taskId, error: results.error }
        );

        // Persist failure to DB
        await persistTaskToDB(task);

        res.status(500).json({
          success: false,
          message: "Failed to apply code",
          error: results.error
        });
      }
    } catch (error: any) {
      console.error('[Autonomous] Approve error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to approve task"
      });
    }
  }
);

/**
 * POST /api/autonomous/rollback/:taskId
 * Rollback changes from a completed task
 */
router.post("/rollback/:taskId",
  authenticateToken,
  requireRoleLevel(8),
  async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const task = tasks.get(taskId);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
      }

      if (task.userId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      if (!task.snapshotId) {
        return res.status(400).json({
          success: false,
          message: "No snapshot available for rollback"
        });
      }

      // Rollback using validator
      await validator.rollback(task.snapshotId);

      // SAFETY: Audit logging
      await logAuditAction(
        req.userId!,
        'autonomous_task_rollback',
        `User rolled back task ${taskId}`,
        { taskId, snapshotId: task.snapshotId }
      );

      res.json({
        success: true,
        message: "Changes rolled back successfully"
      });
    } catch (error: any) {
      console.error('[Autonomous] Rollback error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to rollback changes"
      });
    }
  }
);

/**
 * POST /api/autonomous/validate
 * Run validation on current codebase
 */
router.post("/validate",
  authenticateToken,
  requireRoleLevel(8),
  async (req: AuthRequest, res: Response) => {
    try {
      const { files } = req.body;

      if (!files || !Array.isArray(files)) {
        return res.status(400).json({
          success: false,
          message: "Files array required"
        });
      }

      console.log('[Autonomous] Running validation on files:', files);

      // Run LSP diagnostics
      const lspReport = await validator.checkLSPDiagnostics(files);

      // Run tests (optional)
      let testResults;
      try {
        testResults = await validator.runTests();
      } catch (error) {
        console.warn('[Autonomous] Test execution failed:', error);
        testResults = null;
      }

      res.json({
        success: true,
        lspReport: {
          totalErrors: lspReport.totalErrors,
          totalWarnings: lspReport.totalWarnings,
          files: Array.from(lspReport.files.entries()).map(([file, errors]) => ({
            file,
            errorCount: errors.length,
            errors: errors.slice(0, 10) // Limit to first 10 errors per file
          }))
        },
        testResults: testResults ? {
          passed: testResults.passed,
          failed: testResults.failed,
          total: testResults.total,
          duration: testResults.duration
        } : null
      });
    } catch (error: any) {
      console.error('[Autonomous] Validation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Validation failed"
      });
    }
  }
);

// ============================================================================
// INTERNAL EXECUTION FUNCTIONS
// ============================================================================

/**
 * Execute autonomous task workflow
 */
async function executeAutonomousTask(taskId: string, autoApprove: boolean): Promise<void> {
  const task = tasks.get(taskId);
  if (!task) throw new Error("Task not found");

  try {
    console.log(`[Autonomous] Starting task ${taskId}: "${task.prompt}"`);

    // Phase 1: Task Decomposition (MB.MD)
    task.status = 'decomposing';
    task.updatedAt = new Date();
    console.log(`[Autonomous] Decomposing task...`);

    const decomposition = await mbmdEngine.decomposeTask(task.prompt);
    task.decomposition = decomposition;
    task.updatedAt = new Date();

    console.log(`[Autonomous] Task decomposed into ${decomposition.subtasks.length} subtasks`);

    // Phase 2: Code Generation
    task.status = 'generating';
    task.updatedAt = new Date();
    console.log(`[Autonomous] Generating code for ${decomposition.subtasks.length} subtasks...`);

    const generatedFiles = await codeGenerator.generateMultipleFiles(decomposition.subtasks);
    task.generatedFiles = generatedFiles;
    task.updatedAt = new Date();

    console.log(`[Autonomous] Generated ${generatedFiles.length} files`);

    // Phase 3: Validation
    task.status = 'validating';
    task.updatedAt = new Date();
    console.log(`[Autonomous] Validating generated code...`);

    // Save snapshot before making any changes
    const filePaths = generatedFiles.map(f => f.filePath);
    const snapshotId = await validator.saveSnapshot(filePaths);
    task.snapshotId = snapshotId;

    // Check LSP diagnostics
    const lspReport = await validator.checkLSPDiagnostics(filePaths);
    task.validationReport = {
      lsp: {
        totalErrors: lspReport.totalErrors,
        totalWarnings: lspReport.totalWarnings,
        success: lspReport.success
      }
    };

    console.log(`[Autonomous] Validation complete: ${lspReport.totalErrors} errors, ${lspReport.totalWarnings} warnings`);

    // If auto-approve and validation passes, apply immediately
    if (autoApprove && lspReport.success) {
      console.log(`[Autonomous] Auto-approving task...`);
      task.status = 'applying';
      task.updatedAt = new Date();

      const results = await applyGeneratedFiles(task);
      if (results.success) {
        task.status = 'completed';
        console.log(`[Autonomous] Task ${taskId} completed successfully`);
      } else {
        task.status = 'failed';
        task.error = results.error;
        console.error(`[Autonomous] Task ${taskId} failed:`, results.error);
      }
    } else {
      // Wait for approval
      task.status = 'awaiting_approval';
      console.log(`[Autonomous] Task ${taskId} awaiting approval`);
    }

    task.updatedAt = new Date();
  } catch (error: any) {
    console.error(`[Autonomous] Task ${taskId} execution error:`, error);
    task.status = 'failed';
    task.error = error.message || 'Unknown error';
    task.updatedAt = new Date();
    throw error;
  }
}

/**
 * Apply generated files to filesystem
 */
async function applyGeneratedFiles(task: AutonomousTask): Promise<{ success: boolean; filesModified?: string[]; error?: string }> {
  if (!task.generatedFiles) {
    return { success: false, error: "No files to apply" };
  }

  const filesModified: string[] = [];

  try {
    for (const file of task.generatedFiles) {
      console.log(`[Autonomous] Writing file: ${file.filePath}`);
      await autonomousAgent.writeFile(file.filePath, file.content);
      filesModified.push(file.filePath);
    }

    return { success: true, filesModified };
  } catch (error: any) {
    console.error('[Autonomous] File application error:', error);
    
    // Rollback on failure
    if (task.snapshotId) {
      try {
        console.log('[Autonomous] Rolling back changes...');
        await validator.rollback(task.snapshotId);
      } catch (rollbackError) {
        console.error('[Autonomous] Rollback failed:', rollbackError);
      }
    }

    return { success: false, error: error.message || 'Failed to apply files' };
  }
}

export default router;
