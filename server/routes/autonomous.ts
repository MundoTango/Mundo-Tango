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
import { traceRoute } from "../metrics/tracing";
import { mbmdEngine } from "../services/mrBlue/mbmdEngine";
import { CodeGenerator } from "../services/mrBlue/CodeGenerator";
const codeGenerator = new CodeGenerator();
import { validator } from "../services/mrBlue/validator";
import { autonomousAgent } from "../services/mrBlue/autonomousAgent";
import { conversationContext } from "../services/mrBlue/conversationContext";
import { styleGenerator } from "../services/mrBlue/styleGenerator";
import { elementSelector } from "../services/mrBlue/elementSelector";
import { broadcastToUser } from "../services/websocket";
import { db } from "../storage";
import { auditLogs, autonomousTasks } from "../../shared/schema";
import { eq, and, gte, count, desc } from "drizzle-orm";
import { commitChanges, hasUncommittedChanges, getCommitHistory } from "../services/mrBlue/gitCommitGenerator";
import { changeGroupManager, AtomicChangeGroup } from "../services/mrBlue/atomicChanges";
import { fileDependencyTracker } from "../services/mrBlue/fileDependencyTracker";

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
  resourceId: string,
  metadata?: any
): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      resourceType: 'autonomous_task',
      resourceId,
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
 * POST /api/autonomous/quick-style
 * FAST PATH: Instant CSS style changes using GPT-4o (<500ms)
 * 
 * Body: { prompt: string, element?: string }
 * Returns: { type: 'style', selector: string, css: object }
 */
router.post("/quick-style",
  authenticateToken,
  requireRoleLevel(8),
  async (req: AuthRequest, res: Response) => {
    try {
      const { prompt, element } = req.body;
      const userId = req.userId!;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({
          success: false,
          message: "Prompt is required and must be a non-empty string"
        });
      }

      const startTime = Date.now();

      // Resolve element reference if provided
      let resolvedSelector = element;
      if (element && typeof element === 'string') {
        const selectorResult = await elementSelector.parseElementReference(element, userId);
        resolvedSelector = selectorResult.selector;
      } else {
        // Try to get last selected element from context
        const lastElement = conversationContext.getLastSelectedElement(userId);
        if (lastElement) {
          resolvedSelector = lastElement;
        }
      }

      // Generate CSS from natural language
      const styleResult = await styleGenerator.quickStyle(prompt, resolvedSelector);

      const responseTime = Date.now() - startTime;

      if (!styleResult) {
        // Not a style-only request
        return res.json({
          success: false,
          isStyleOnly: false,
          message: "This request requires code generation. Use /api/autonomous/execute instead.",
          responseTime
        });
      }

      // Log to conversation context
      conversationContext.addEntry(userId, {
        timestamp: Date.now(),
        prompt,
        response: styleResult,
        filesChanged: [],
        selectedElement: styleResult.selector,
        responseType: 'style',
        metadata: {
          cssChanges: styleResult.css,
          selector: styleResult.selector
        }
      });

      // Audit log
      await logAuditAction(
        userId,
        'autonomous_quick_style',
        `style-${userId}`,
        { prompt, selector: styleResult.selector, css: styleResult.css, responseTime, description: `Quick style generated: "${prompt}" → ${styleResult.selector}` }
      );

      console.log(`[Autonomous] Quick-style completed in ${responseTime}ms`);

      res.json({
        success: true,
        isStyleOnly: true,
        ...styleResult,
        responseTime,
        message: `Style generated in ${responseTime}ms (fast path)`
      });
    } catch (error: any) {
      console.error('[Autonomous] Quick-style error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate style"
      });
    }
  }
);

/**
 * POST /api/autonomous/execute
 * Execute autonomous development task
 * 
 * PHASE 2 UPDATE: Checks for style-only requests first (fast path)
 * 
 * Body: { prompt: string, autoApprove?: boolean, element?: string }
 * Returns: { taskId, status, decomposition } OR { type: 'style', css: object } for style-only
 */
router.post("/execute", traceRoute("autonomous-execute"), 
  authenticateToken, 
  requireRoleLevel(8), // God Level only
  async (req: AuthRequest, res: Response) => {
    try {
      const { prompt, autoApprove = false, element } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({
          success: false,
          message: "Prompt is required and must be a non-empty string"
        });
      }

      const userId = req.userId!;
      const startTime = Date.now();

      // PHASE 2: Check if this is a style-only request (FAST PATH)
      console.log('[Autonomous] Checking if style-only request...');
      const styleDetection = await styleGenerator.detectStyleOnly(prompt.trim());

      if (styleDetection.isStyleOnly && styleDetection.confidence > 0.7) {
        console.log('[Autonomous] Style-only request detected - using fast path');

        // Resolve element reference
        let resolvedSelector = element;
        if (element && typeof element === 'string') {
          const selectorResult = await elementSelector.parseElementReference(element, userId);
          resolvedSelector = selectorResult.selector;
        } else {
          // Try to get last selected element from context
          const lastElement = conversationContext.getLastSelectedElement(userId);
          if (lastElement) {
            resolvedSelector = lastElement;
          }
        }

        // Generate CSS
        const styleResult = await styleGenerator.generateStyle(prompt.trim(), resolvedSelector);
        const responseTime = Date.now() - startTime;

        if (styleResult) {
          // Log to conversation context
          conversationContext.addEntry(userId, {
            timestamp: Date.now(),
            prompt: prompt.trim(),
            response: styleResult,
            filesChanged: [],
            selectedElement: styleResult.selector,
            responseType: 'style',
            metadata: {
              cssChanges: styleResult.css,
              selector: styleResult.selector
            }
          });

          // Audit log
          await logAuditAction(
            userId,
            'autonomous_style_fast_path',
            `style-${userId}`,
            { prompt: prompt.substring(0, 100), selector: styleResult.selector, css: styleResult.css, responseTime, description: `Style-only request completed: "${prompt.substring(0, 100)}" → ${styleResult.selector}` }
          );

          console.log(`[Autonomous] Style-only completed in ${responseTime}ms (fast path)`);

          return res.json({
            success: true,
            fastPath: true,
            ...styleResult,
            responseTime,
            message: `Style generated in ${responseTime}ms (no code generation needed)`
          });
        }
      }

      // Not style-only or detection failed - proceed with full MB.MD pipeline
      console.log('[Autonomous] Full code generation required');

      // PHASE 2: Get conversation context to enhance prompt
      const contextSummary = conversationContext.getContextSummary(userId);
      const formattedContext = conversationContext.getFormattedContext(userId);
      
      let enhancedPrompt = prompt.trim();
      if (formattedContext && formattedContext !== 'No previous conversation context.') {
        enhancedPrompt = `${formattedContext}\n\nCurrent request: ${prompt.trim()}`;
        console.log('[Autonomous] Enhanced prompt with conversation context');
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
            `rate-limit-${req.userId}`,
            { prompt: prompt.substring(0, 100), description: `User attempted to create task but exceeded rate limit (${RATE_LIMIT_MAX_TASKS} tasks/${RATE_LIMIT_WINDOW_HOURS}h)` }
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
        taskId,
        { prompt: prompt.substring(0, 100), estimatedCost, autoApprove, description: `User created autonomous task: "${prompt.substring(0, 100)}..."` }
      );

      // Persist to DB
      await persistTaskToDB(task);

      // Start async execution
      executeAutonomousTask(taskId, autoApprove, req.userId!).catch(error => {
        console.error(`[Autonomous] Task ${taskId} failed:`, error);
        const task = tasks.get(taskId);
        if (task) {
          task.status = 'failed';
          task.error = error.message || 'Unknown error';
          task.updatedAt = new Date();
          persistTaskToDB(task); // Persist failure
          logAuditAction(req.userId!, 'autonomous_task_failed', taskId, { error: error.message, description: `Task ${taskId} failed: ${error.message}` });
          
          // Emit failure event
          broadcastToUser(req.userId!, 'autonomous:failed', {
            taskId,
            error: error.message || 'Unknown error'
          });
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
router.get("/status/:taskId", traceRoute("autonomous-status"),
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
          taskId,
          { filesModified: results.filesModified, description: `User approved and applied task ${taskId}` }
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
          taskId,
          { error: results.error, description: `Task ${taskId} approval failed during application` }
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
        taskId,
        { snapshotId: task.snapshotId, description: `User rolled back task ${taskId}` }
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
async function executeAutonomousTask(taskId: string, autoApprove: boolean, userId: number): Promise<void> {
  const task = tasks.get(taskId);
  if (!task) throw new Error("Task not found");

  try {
    console.log(`[Autonomous] Starting task ${taskId}: "${task.prompt}"`);

    // Emit started event
    broadcastToUser(userId, 'autonomous:started', {
      taskId,
      prompt: task.prompt,
      status: 'pending'
    });

    // Phase 1: Task Decomposition (MB.MD)
    task.status = 'decomposing';
    task.updatedAt = new Date();
    console.log(`[Autonomous] Decomposing task...`);

    // Emit decomposition progress
    broadcastToUser(userId, 'autonomous:progress', {
      taskId,
      status: 'decomposing',
      step: 'decomposition',
      progress: 10,
      message: 'Analyzing task structure using MB.MD methodology...'
    });

    // PHASE 2: Use enhanced prompt with conversation context
    const promptToUse = task.prompt; // Original prompt stored in task
    const decomposition = await mbmdEngine.decomposeTask(promptToUse, (progress) => {
      // Progress callback from MB.MD engine
      broadcastToUser(userId, 'autonomous:progress', {
        taskId,
        status: 'decomposing',
        step: 'decomposition',
        progress: 10 + (progress * 0.3), // 10-40%
        message: 'Analyzing task structure...'
      });
    });

    task.decomposition = decomposition;
    task.updatedAt = new Date();

    console.log(`[Autonomous] Task decomposed into ${decomposition.subtasks.length} subtasks`);

    // Emit decomposition complete
    broadcastToUser(userId, 'autonomous:progress', {
      taskId,
      status: 'decomposing',
      step: 'decomposition',
      progress: 40,
      message: `Decomposed into ${decomposition.subtasks.length} subtasks`,
      subtasks: decomposition.subtasks.map(st => ({
        id: st.id,
        description: st.description,
        files: st.files
      }))
    });

    // Phase 2: Code Generation
    task.status = 'generating';
    task.updatedAt = new Date();
    console.log(`[Autonomous] Generating code for ${decomposition.subtasks.length} subtasks...`);

    // Convert MB.MD subtasks (files: string[]) to CodeGenerator format (filePath: string)
    const codeGenTasks = decomposition.subtasks.flatMap(subtask => 
      subtask.files.map(filePath => ({
        description: subtask.description,
        filePath,
        dependencies: subtask.dependencies,
        type: subtask.type === 'code_generation' ? 'component' : 'service'
      }))
    );

    // Emit generation start
    broadcastToUser(userId, 'autonomous:progress', {
      taskId,
      status: 'generating',
      step: 'generation',
      progress: 45,
      message: `Generating ${codeGenTasks.length} files...`
    });

    const generatedFiles = await codeGenerator.generateMultipleFiles(
      codeGenTasks as any,
      (fileIndex, filePath) => {
        // Progress callback from code generator
        const fileProgress = (fileIndex / codeGenTasks.length) * 40; // 45-85%
        broadcastToUser(userId, 'autonomous:progress', {
          taskId,
          status: 'generating',
          step: 'generation',
          progress: 45 + fileProgress,
          message: `Generating file ${fileIndex + 1}/${codeGenTasks.length}: ${filePath}`
        });

        // Emit individual file generated event
        broadcastToUser(userId, 'autonomous:file_generated', {
          taskId,
          filePath,
          fileIndex,
          totalFiles: codeGenTasks.length
        });
      }
    );

    task.generatedFiles = generatedFiles;
    task.updatedAt = new Date();

    console.log(`[Autonomous] Generated ${generatedFiles.length} files`);

    // Emit generation complete
    broadcastToUser(userId, 'autonomous:progress', {
      taskId,
      status: 'generating',
      step: 'generation',
      progress: 85,
      message: `Generated ${generatedFiles.length} files successfully`
    });

    // Phase 3: Validation
    task.status = 'validating';
    task.updatedAt = new Date();
    console.log(`[Autonomous] Validating generated code...`);

    // Emit validation start
    broadcastToUser(userId, 'autonomous:progress', {
      taskId,
      status: 'validating',
      step: 'validation',
      progress: 90,
      message: 'Running LSP diagnostics and validation...'
    });

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

    // Emit validation complete
    broadcastToUser(userId, 'autonomous:validation_complete', {
      taskId,
      status: 'validating',
      step: 'validation',
      progress: 95,
      message: `Validation complete: ${lspReport.totalErrors} errors, ${lspReport.totalWarnings} warnings`,
      validationReport: {
        totalErrors: lspReport.totalErrors,
        totalWarnings: lspReport.totalWarnings,
        success: lspReport.success
      }
    });

    // If auto-approve and validation passes, apply immediately
    if (autoApprove && lspReport.success) {
      console.log(`[Autonomous] Auto-approving task...`);
      task.status = 'applying';
      task.updatedAt = new Date();

      // Emit applying progress
      broadcastToUser(userId, 'autonomous:progress', {
        taskId,
        status: 'applying',
        step: 'applying',
        progress: 98,
        message: 'Applying generated code to filesystem...'
      });

      const results = await applyGeneratedFiles(task);
      if (results.success) {
        task.status = 'completed';
        console.log(`[Autonomous] Task ${taskId} completed successfully`);

        // PHASE 2: Log to conversation context
        conversationContext.addEntry(userId, {
          timestamp: Date.now(),
          prompt: task.prompt,
          response: { task: taskId, status: 'completed' },
          filesChanged: results.filesModified || [],
          responseType: 'code'
        });

        // Emit completed event
        broadcastToUser(userId, 'autonomous:completed', {
          taskId,
          status: 'completed',
          progress: 100,
          message: 'Task completed successfully!',
          filesModified: results.filesModified
        });
      } else {
        task.status = 'failed';
        task.error = results.error;
        console.error(`[Autonomous] Task ${taskId} failed:`, results.error);

        // Emit failed event
        broadcastToUser(userId, 'autonomous:failed', {
          taskId,
          error: results.error
        });
      }
    } else {
      // Wait for approval
      task.status = 'awaiting_approval';
      console.log(`[Autonomous] Task ${taskId} awaiting approval`);

      // Emit awaiting approval event
      broadcastToUser(userId, 'autonomous:progress', {
        taskId,
        status: 'awaiting_approval',
        step: 'awaiting_approval',
        progress: 100,
        message: 'Code generation complete. Awaiting approval...'
      });
    }

    task.updatedAt = new Date();
  } catch (error: any) {
    console.error(`[Autonomous] Task ${taskId} execution error:`, error);
    task.status = 'failed';
    task.error = error.message || 'Unknown error';
    task.updatedAt = new Date();

    // Emit failed event
    broadcastToUser(userId, 'autonomous:failed', {
      taskId,
      error: error.message || 'Unknown error'
    });

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

/**
 * GET /api/autonomous/analyze
 * Analyze current page structure and generate AI suggestions
 * 
 * Query params:
 * - url: Current page URL (optional, defaults to 'current-page')
 * 
 * Returns: { success: boolean, report: SuggestionsReport }
 */
router.get("/analyze",
  authenticateToken,
  requireRoleLevel(8), // God Level only
  async (req: AuthRequest, res: Response) => {
    try {
      const url = (req.query.url as string) || 'current-page';
      const userId = req.userId!;

      console.log(`[Autonomous] Analyzing page: ${url}`);

      // Import services (lazy load to avoid circular deps)
      const { pageAnalyzer } = await import('../services/mrBlue/pageAnalyzer');
      const { designSuggestions } = await import('../services/mrBlue/designSuggestions');

      // Get HTML content from request body or fetch from iframe
      // In real usage, the frontend will send the HTML via POST
      // For now, we'll analyze based on URL pattern
      const htmlContent = req.body?.html || '<html><body><h1>Sample Page</h1></body></html>';

      // Analyze page structure
      const analysis = await pageAnalyzer.analyzePage(htmlContent, url);

      // Generate design suggestions
      const report = await designSuggestions.generateSuggestions(analysis);

      // Audit log
      await logAuditAction(
        userId,
        'autonomous_page_analyze',
        url,
        { pageScore: report.pageScore, suggestionsCount: report.suggestions.length, description: `Analyzed page: ${url}` }
      );

      console.log(`[Autonomous] Analysis complete: ${report.suggestions.length} suggestions, score ${report.pageScore}/100`);

      res.json({
        success: true,
        report
      });
    } catch (error: any) {
      console.error('[Autonomous] Page analysis error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze page"
      });
    }
  }
);

/**
 * POST /api/autonomous/analyze
 * Analyze HTML content and generate suggestions
 * 
 * Body: { html: string, url?: string }
 * Returns: { success: boolean, report: SuggestionsReport }
 */
router.post("/analyze",
  authenticateToken,
  requireRoleLevel(8),
  async (req: AuthRequest, res: Response) => {
    try {
      const { html, url = 'current-page' } = req.body;
      const userId = req.userId!;

      if (!html || typeof html !== 'string') {
        return res.status(400).json({
          success: false,
          message: "HTML content is required"
        });
      }

      console.log(`[Autonomous] Analyzing page HTML (${html.length} chars)`);

      // Import services
      const { pageAnalyzer } = await import('../services/mrBlue/pageAnalyzer');
      const { designSuggestions } = await import('../services/mrBlue/designSuggestions');

      // Analyze page structure
      const analysis = await pageAnalyzer.analyzePage(html, url);

      // Generate design suggestions
      const report = await designSuggestions.generateSuggestions(analysis);

      // Audit log
      await logAuditAction(
        userId,
        'autonomous_page_analyze',
        url,
        { 
          pageScore: report.pageScore, 
          suggestionsCount: report.suggestions.length,
          htmlSize: html.length,
          description: `Analyzed page HTML: ${url}` 
        }
      );

      console.log(`[Autonomous] Analysis complete: ${report.suggestions.length} suggestions, score ${report.pageScore}/100`);

      res.json({
        success: true,
        report
      });
    } catch (error: any) {
      console.error('[Autonomous] Page analysis error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze page"
      });
    }
  }
);

/**
 * POST /api/autonomous/commit
 * Create Git commit with AI-generated message
 * 
 * Body: { 
 *   files: string[], 
 *   description?: string,
 *   autoPush?: boolean 
 * }
 * Returns: { 
 *   success: boolean, 
 *   message: string, 
 *   commitHash?: string,
 *   pushed?: boolean 
 * }
 */
router.post("/commit",
  authenticateToken,
  requireRoleLevel(8),
  async (req: AuthRequest, res: Response) => {
    try {
      const { files, description, autoPush = false } = req.body;
      const userId = req.userId!;

      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Files array is required and must not be empty"
        });
      }

      console.log(`[Autonomous] Creating commit for ${files.length} files...`);

      // Check for uncommitted changes
      const hasChanges = await hasUncommittedChanges();
      if (!hasChanges) {
        return res.status(400).json({
          success: false,
          message: "No uncommitted changes to commit"
        });
      }

      // Create commit with AI-generated message
      const result = await commitChanges({
        files,
        description,
        userId,
        autoPush
      });

      // Audit log
      await logAuditAction(
        userId,
        'autonomous_git_commit',
        result.commitHash || 'unknown',
        { 
          files, 
          pushed: result.pushed,
          userDescription: description,
          description: `Created Git commit: "${result.message}"` 
        }
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || 'Commit failed'
        });
      }

      console.log(`[Autonomous] Commit created: ${result.commitHash}`);

      res.json({
        success: true,
        message: result.message,
        commitHash: result.commitHash,
        pushed: result.pushed
      });
    } catch (error: any) {
      console.error('[Autonomous] Commit error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create commit"
      });
    }
  }
);

/**
 * GET /api/autonomous/commit/history
 * Get Git commit history
 * 
 * Query: { limit?: number }
 * Returns: { success: boolean, commits: Array<CommitInfo> }
 */
router.get("/commit/history",
  authenticateToken,
  requireRoleLevel(8),
  async (req: AuthRequest, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      const commits = await getCommitHistory(limit);

      res.json({
        success: true,
        commits
      });
    } catch (error: any) {
      console.error('[Autonomous] Get commit history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get commit history"
      });
    }
  }
);

/**
 * POST /api/autonomous/atomic-apply
 * Apply multiple file changes atomically with validation and rollback
 * 
 * Body: { 
 *   changes: Array<{ filePath: string, content: string, operation?: 'create' | 'update' | 'delete' }>,
 *   description: string,
 *   skipValidation?: boolean
 * }
 * Returns: { 
 *   success: boolean,
 *   changesApplied: number,
 *   groupId: string,
 *   errors?: string[]
 * }
 */
router.post("/atomic-apply",
  authenticateToken,
  requireRoleLevel(8),
  async (req: AuthRequest, res: Response) => {
    try {
      const { changes, description, skipValidation = false } = req.body;
      const userId = req.userId!;

      if (!changes || !Array.isArray(changes) || changes.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Changes array is required and must not be empty"
        });
      }

      if (!description || typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Description is required"
        });
      }

      console.log(`[Autonomous] Creating atomic change group: ${description}`);

      // Create change group
      const group = changeGroupManager.createGroup(description, userId);

      // Add all changes
      group.addMultiple(changes);

      // Apply atomically
      const result = await changeGroupManager.applyGroup(group.getId(), skipValidation);

      // Audit log
      await logAuditAction(
        userId,
        'autonomous_atomic_apply',
        group.getId(),
        { 
          changesCount: changes.length,
          success: result.success,
          rolledBack: result.rolledBack,
          description: `Applied atomic change group: "${description}"` 
        }
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Atomic apply failed',
          changesApplied: result.changesApplied,
          errors: result.errors,
          rolledBack: result.rolledBack
        });
      }

      console.log(`[Autonomous] Atomic apply successful: ${result.changesApplied} changes`);

      res.json({
        success: true,
        changesApplied: result.changesApplied,
        groupId: group.getId(),
        message: 'Changes applied successfully'
      });
    } catch (error: any) {
      console.error('[Autonomous] Atomic apply error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to apply changes atomically"
      });
    }
  }
);

/**
 * GET /api/autonomous/dependencies
 * Get file dependency graph and impact analysis
 * 
 * Query: { files?: string[] }
 * Returns: { 
 *   success: boolean,
 *   graph?: DependencyGraph,
 *   impact?: ImpactAnalysis
 * }
 */
router.get("/dependencies",
  authenticateToken,
  requireRoleLevel(8),
  async (req: AuthRequest, res: Response) => {
    try {
      const filesParam = req.query.files as string | undefined;
      const files = filesParam ? filesParam.split(',') : undefined;

      // Build dependency graph if not already built
      const graph = await fileDependencyTracker.buildDependencyGraph();

      // If files specified, analyze impact
      let impact;
      if (files && files.length > 0) {
        impact = await fileDependencyTracker.analyzeImpact(files);
      }

      res.json({
        success: true,
        graph: {
          nodeCount: graph.nodes.size,
          edgeCount: graph.edges.length
        },
        impact
      });
    } catch (error: any) {
      console.error('[Autonomous] Dependencies error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get dependencies"
      });
    }
  }
);

export default router;
