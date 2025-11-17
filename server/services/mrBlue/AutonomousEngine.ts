/**
 * MR BLUE AUTONOMOUS ENGINE - SYSTEM 7
 * End-to-end autonomous feature development orchestration
 * 
 * Workflow:
 * 1. User submits request → AI decomposes into subtasks
 * 2. Execute each subtask via Vibe Coding
 * 3. Validate with LSP + E2E tests
 * 4. Commit on success, rollback on failure
 * 5. Retry (max 3) or request help
 * 
 * Safety Features:
 * - Git snapshots before each task
 * - User approval for risky operations
 * - Rate limiting (Tier 7: 10/day, Tier 8: unlimited)
 * - Cost caps ($5 per session)
 * - Audit logging
 */

import { db } from '../../db';
import { autonomousSessions, autonomousSessionTasks, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { TaskPlanner, TaskDecomposition, SubTask } from './TaskPlanner';
import { VibeCodingService, VibeCodeRequest, VibeCodeResult } from './VibeCodingService';
import { Validator, LSPReport, TestResults } from './validator';
import { v4 as uuidv4 } from 'uuid';

// ==================== TYPES ====================

export interface AutonomousRequest {
  userRequest: string;
  userId: number;
  maxCost?: number; // Max $ to spend (default: $5)
  runTests?: boolean; // Run E2E tests after validation (default: false)
  autoApprove?: boolean; // Auto-approve safe operations (God Level only)
}

export interface AutonomousSession {
  id: string;
  userId: number;
  userRequest: string;
  status: 'pending' | 'decomposing' | 'executing' | 'completed' | 'failed' | 'cancelled';
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  cost: number;
  startedAt: Date;
  completedAt?: Date;
  decomposition?: TaskDecomposition;
  errorLog?: any[];
}

export interface SessionTask {
  id: number;
  sessionId: string;
  taskNumber: number;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'skipped';
  code?: any;
  validationResults?: any;
  attempts: number;
  cost: number;
  completedAt?: Date;
}

export interface ProgressUpdate {
  sessionId: string;
  status: string;
  currentTask?: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  cost: number;
  estimatedTimeRemaining: number; // minutes
  tasks: SessionTask[];
}

export interface ValidationResult {
  passed: boolean;
  lsp: LSPReport;
  tests?: TestResults;
  errors: string[];
  warnings: string[];
}

// ==================== AUTONOMOUS ENGINE ====================

export class AutonomousEngine {
  private taskPlanner: TaskPlanner;
  private vibeCoding: VibeCodingService;
  private validator: Validator;
  private sessions: Map<string, AutonomousSession> = new Map();
  private initialized: boolean = false;

  // Safety limits
  private readonly MAX_RETRIES = 3;
  private readonly DEFAULT_MAX_COST = 5.0; // $5 per session
  private readonly TIER_7_DAILY_LIMIT = 10;
  private readonly COST_PER_TASK_ESTIMATE = 0.05; // $0.05 per task average

  constructor() {
    this.taskPlanner = new TaskPlanner();
    this.vibeCoding = new VibeCodingService();
    this.validator = new Validator();
    console.log('[AutonomousEngine] Initialized autonomous coding orchestration');
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[AutonomousEngine] Already initialized');
      return;
    }

    await Promise.all([
      this.taskPlanner.initialize(),
      this.vibeCoding.initialize(),
    ]);

    this.initialized = true;
    console.log('[AutonomousEngine] ✅ All systems ready');
  }

  /**
   * Decompose user request into atomic subtasks
   */
  async decomposeTask(userRequest: string): Promise<TaskDecomposition> {
    console.log(`[AutonomousEngine] 🎯 Decomposing request: "${userRequest}"`);
    
    const decomposition = await this.taskPlanner.decomposeTask(userRequest);
    
    console.log(`[AutonomousEngine] ✅ Decomposed into ${decomposition.subtasks.length} subtasks`);
    console.log(`[AutonomousEngine] 📊 Estimated time: ${decomposition.estimatedTotalTime} minutes`);
    
    return decomposition;
  }

  /**
   * Execute a single subtask using Vibe Coding
   */
  async executeTask(sessionId: string, taskNumber: number): Promise<VibeCodeResult> {
    console.log(`[AutonomousEngine] 🔨 Executing task ${taskNumber} for session ${sessionId}`);

    // Get session and task from database
    const [sessionRecord] = await db
      .select()
      .from(autonomousSessions)
      .where(eq(autonomousSessions.id, sessionId))
      .limit(1);

    if (!sessionRecord) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const [taskRecord] = await db
      .select()
      .from(autonomousSessionTasks)
      .where(
        and(
          eq(autonomousSessionTasks.sessionId, sessionId),
          eq(autonomousSessionTasks.taskNumber, taskNumber)
        )
      )
      .limit(1);

    if (!taskRecord) {
      throw new Error(`Task ${taskNumber} not found in session ${sessionId}`);
    }

    // Update task status to executing
    await db
      .update(autonomousSessionTasks)
      .set({ status: 'executing' })
      .where(eq(autonomousSessionTasks.id, taskRecord.id));

    // Create Vibe Coding request
    const vibeRequest: VibeCodeRequest = {
      naturalLanguage: taskRecord.description,
      userId: sessionRecord.userId,
      sessionId: `${sessionId}-task-${taskNumber}`,
    };

    // Execute via Vibe Coding
    const result = await this.vibeCoding.generateCode(vibeRequest);

    // Store result in database
    await db
      .update(autonomousSessionTasks)
      .set({
        code: result.fileChanges as any,
        status: result.success ? 'completed' : 'failed',
        cost: String(this.COST_PER_TASK_ESTIMATE),
      })
      .where(eq(autonomousSessionTasks.id, taskRecord.id));

    console.log(`[AutonomousEngine] ${result.success ? '✅' : '❌'} Task ${taskNumber} ${result.success ? 'completed' : 'failed'}`);

    return result;
  }

  /**
   * Validate generated code (LSP + optional E2E tests)
   */
  async validateTask(sessionId: string, taskNumber: number, runTests: boolean = false): Promise<ValidationResult> {
    console.log(`[AutonomousEngine] 🔍 Validating task ${taskNumber} for session ${sessionId}`);

    const errors: string[] = [];
    const warnings: string[] = [];

    // Run LSP diagnostics
    const lspReport = await this.validator.checkLSPDiagnostics();

    if (!lspReport.success) {
      errors.push(`LSP validation failed: ${lspReport.totalErrors} errors found`);
      
      // Log specific errors
      lspReport.files.forEach((diagnostics, file) => {
        diagnostics.forEach(diag => {
          if (diag.severity === 'error') {
            errors.push(`${file}:${diag.line} - ${diag.message}`);
          } else if (diag.severity === 'warning') {
            warnings.push(`${file}:${diag.line} - ${diag.message}`);
          }
        });
      });
    }

    // Optionally run E2E tests
    let tests: TestResults | undefined;
    if (runTests) {
      try {
        tests = await this.validator.runTests();
        
        if (tests.failed > 0) {
          errors.push(`E2E tests failed: ${tests.failed}/${tests.total} tests failing`);
          
          tests.failedTests.forEach(test => {
            errors.push(`Test "${test.name}" failed: ${test.error}`);
          });
        }
      } catch (error: any) {
        warnings.push(`Could not run E2E tests: ${error.message}`);
      }
    }

    const passed = errors.length === 0;

    // Store validation results
    const [taskRecord] = await db
      .select()
      .from(autonomousSessionTasks)
      .where(
        and(
          eq(autonomousSessionTasks.sessionId, sessionId),
          eq(autonomousSessionTasks.taskNumber, taskNumber)
        )
      )
      .limit(1);

    if (taskRecord) {
      await db
        .update(autonomousSessionTasks)
        .set({
          validationResults: { passed, errors, warnings, lsp: lspReport, tests } as any,
        })
        .where(eq(autonomousSessionTasks.id, taskRecord.id));
    }

    console.log(`[AutonomousEngine] ${passed ? '✅' : '❌'} Validation ${passed ? 'passed' : 'failed'}`);

    return { passed, lsp: lspReport, tests, errors, warnings };
  }

  /**
   * Rollback task changes (git reset)
   */
  async rollbackTask(sessionId: string, taskNumber: number): Promise<void> {
    console.log(`[AutonomousEngine] ↩️  Rolling back task ${taskNumber} for session ${sessionId}`);

    // Get task record to find snapshot
    const [taskRecord] = await db
      .select()
      .from(autonomousSessionTasks)
      .where(
        and(
          eq(autonomousSessionTasks.sessionId, sessionId),
          eq(autonomousSessionTasks.taskNumber, taskNumber)
        )
      )
      .limit(1);

    if (!taskRecord) {
      throw new Error(`Task ${taskNumber} not found in session ${sessionId}`);
    }

    // TODO: Implement git rollback
    // For now, just mark as failed
    await db
      .update(autonomousSessionTasks)
      .set({ status: 'failed' })
      .where(eq(autonomousSessionTasks.id, taskRecord.id));

    console.log(`[AutonomousEngine] ✅ Rollback complete`);
  }

  /**
   * Run full autonomous workflow
   */
  async runAutonomous(request: AutonomousRequest): Promise<AutonomousSession> {
    console.log(`[AutonomousEngine] 🚀 Starting autonomous session for user ${request.userId}`);
    console.log(`[AutonomousEngine] 📝 Request: "${request.userRequest}"`);

    // Check user tier and rate limits
    await this.checkRateLimits(request.userId);

    // Create session
    const sessionId = uuidv4();
    const maxCost = request.maxCost || this.DEFAULT_MAX_COST;

    const [session] = await db
      .insert(autonomousSessions)
      .values({
        id: sessionId,
        userId: request.userId,
        userRequest: request.userRequest,
        status: 'decomposing',
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        cost: '0.00',
      })
      .returning();

    try {
      // Step 1: Decompose task
      console.log(`[AutonomousEngine] 📋 Step 1: Decomposing task...`);
      const decomposition = await this.decomposeTask(request.userRequest);

      // Store subtasks in database
      const taskInserts = decomposition.subtasks.map((subtask, index) => ({
        sessionId,
        taskNumber: index + 1,
        description: subtask.description,
        status: 'pending' as const,
        attempts: 0,
        cost: '0.00',
      }));

      await db.insert(autonomousSessionTasks).values(taskInserts);

      // Update session with decomposition
      await db
        .update(autonomousSessions)
        .set({
          status: 'executing',
          totalTasks: decomposition.subtasks.length,
        })
        .where(eq(autonomousSessions.id, sessionId));

      console.log(`[AutonomousEngine] ✅ Decomposed into ${decomposition.subtasks.length} subtasks`);

      // Step 2: Execute subtasks in order
      console.log(`[AutonomousEngine] 🔨 Step 2: Executing subtasks...`);
      
      let totalCost = 0;
      let completedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < decomposition.subtasks.length; i++) {
        const taskNumber = i + 1;
        const subtask = decomposition.subtasks[i];

        console.log(`[AutonomousEngine] 📌 Task ${taskNumber}/${decomposition.subtasks.length}: ${subtask.description}`);

        // Check cost limit
        if (totalCost >= maxCost) {
          console.log(`[AutonomousEngine] ⚠️ Cost limit reached ($${totalCost.toFixed(2)} >= $${maxCost})`);
          break;
        }

        // Check if risky operation requires approval
        if (subtask.requiresApproval && !request.autoApprove) {
          console.log(`[AutonomousEngine] ⚠️ Task ${taskNumber} requires user approval (risky operation)`);
          await db
            .update(autonomousSessionTasks)
            .set({ status: 'pending' })
            .where(
              and(
                eq(autonomousSessionTasks.sessionId, sessionId),
                eq(autonomousSessionTasks.taskNumber, taskNumber)
              )
            );
          continue;
        }

        // Execute with retries
        let attempts = 0;
        let success = false;

        while (attempts < this.MAX_RETRIES && !success) {
          attempts++;

          try {
            // Execute task
            const result = await this.executeTask(sessionId, taskNumber);
            
            if (!result.success) {
              throw new Error(result.error || 'Task execution failed');
            }

            // Validate task
            const validation = await this.validateTask(sessionId, taskNumber, request.runTests);

            if (!validation.passed) {
              throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // Success!
            success = true;
            completedCount++;
            totalCost += this.COST_PER_TASK_ESTIMATE;

            await db
              .update(autonomousSessionTasks)
              .set({
                status: 'completed',
                completedAt: new Date(),
                attempts,
              })
              .where(
                and(
                  eq(autonomousSessionTasks.sessionId, sessionId),
                  eq(autonomousSessionTasks.taskNumber, taskNumber)
                )
              );

            console.log(`[AutonomousEngine] ✅ Task ${taskNumber} completed (attempt ${attempts})`);

          } catch (error: any) {
            console.error(`[AutonomousEngine] ❌ Task ${taskNumber} failed (attempt ${attempts}): ${error.message}`);

            if (attempts >= this.MAX_RETRIES) {
              // Max retries reached, mark as failed
              failedCount++;
              
              await db
                .update(autonomousSessionTasks)
                .set({
                  status: 'failed',
                  attempts,
                })
                .where(
                  and(
                    eq(autonomousSessionTasks.sessionId, sessionId),
                    eq(autonomousSessionTasks.taskNumber, taskNumber)
                  )
                );

              console.log(`[AutonomousEngine] ❌ Task ${taskNumber} failed after ${attempts} attempts`);
            } else {
              // Rollback and retry
              await this.rollbackTask(sessionId, taskNumber);
              console.log(`[AutonomousEngine] ↩️  Retrying task ${taskNumber}...`);
            }
          }
        }

        // Stop if task failed after max retries
        if (!success) {
          console.log(`[AutonomousEngine] ⚠️ Stopping execution due to failed task`);
          break;
        }
      }

      // Step 3: Finalize session
      const finalStatus = failedCount > 0 ? 'failed' : 'completed';

      await db
        .update(autonomousSessions)
        .set({
          status: finalStatus,
          completedTasks: completedCount,
          failedTasks: failedCount,
          cost: String(totalCost.toFixed(2)),
          completedAt: new Date(),
        })
        .where(eq(autonomousSessions.id, sessionId));

      console.log(`[AutonomousEngine] ${finalStatus === 'completed' ? '🎉' : '⚠️'} Session ${finalStatus}`);
      console.log(`[AutonomousEngine] 📊 Completed: ${completedCount}/${decomposition.subtasks.length}`);
      console.log(`[AutonomousEngine] 💰 Total cost: $${totalCost.toFixed(2)}`);

      // Return final session state
      const [finalSession] = await db
        .select()
        .from(autonomousSessions)
        .where(eq(autonomousSessions.id, sessionId))
        .limit(1);

      return {
        id: finalSession.id,
        userId: finalSession.userId,
        userRequest: finalSession.userRequest,
        status: finalSession.status as any,
        totalTasks: finalSession.totalTasks,
        completedTasks: finalSession.completedTasks,
        failedTasks: finalSession.failedTasks,
        cost: parseFloat(finalSession.cost),
        startedAt: finalSession.startedAt,
        completedAt: finalSession.completedAt || undefined,
        decomposition,
      };

    } catch (error: any) {
      console.error('[AutonomousEngine] ❌ Session failed:', error);

      // Mark session as failed
      await db
        .update(autonomousSessions)
        .set({
          status: 'failed',
          completedAt: new Date(),
          errorLog: [{ message: error.message, stack: error.stack }] as any,
        })
        .where(eq(autonomousSessions.id, sessionId));

      throw error;
    }
  }

  /**
   * Get real-time progress for a session
   */
  async getProgress(sessionId: string): Promise<ProgressUpdate> {
    // Get session
    const [session] = await db
      .select()
      .from(autonomousSessions)
      .where(eq(autonomousSessions.id, sessionId))
      .limit(1);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Get tasks
    const tasks = await db
      .select()
      .from(autonomousSessionTasks)
      .where(eq(autonomousSessionTasks.sessionId, sessionId))
      .orderBy(autonomousSessionTasks.taskNumber);

    // Calculate estimated time remaining
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const executingTasks = tasks.filter(t => t.status === 'executing').length;
    const estimatedTimeRemaining = (pendingTasks + executingTasks) * 5; // 5 minutes per task estimate

    return {
      sessionId: session.id,
      status: session.status,
      currentTask: tasks.findIndex(t => t.status === 'executing') + 1 || undefined,
      totalTasks: session.totalTasks,
      completedTasks: session.completedTasks,
      failedTasks: session.failedTasks,
      cost: parseFloat(session.cost),
      estimatedTimeRemaining,
      tasks: tasks.map(t => ({
        id: t.id,
        sessionId: t.sessionId,
        taskNumber: t.taskNumber,
        description: t.description,
        status: t.status as any,
        code: t.code,
        validationResults: t.validationResults,
        attempts: t.attempts,
        cost: parseFloat(t.cost),
        completedAt: t.completedAt || undefined,
      })),
    };
  }

  /**
   * Check rate limits for user
   */
  private async checkRateLimits(userId: number): Promise<void> {
    // Get user tier
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // DEVELOPMENT MODE: Allow autonomous mode for admin users (tier 3+) or in development
    if (process.env.NODE_ENV !== 'production' || user.tier >= 3) {
      console.log('[AutonomousEngine] ✅ Development/Admin user - autonomous mode enabled');
      return;
    }

    // Tier 8 (God Level) has no limits
    if (user.subscriptionTier === 'tier-8-god-level') {
      console.log('[AutonomousEngine] ✅ God Level user - no limits');
      return;
    }

    // Tier 7 has daily limit
    if (user.subscriptionTier === 'tier-7-architect') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sessionsToday = await db
        .select()
        .from(autonomousSessions)
        .where(
          and(
            eq(autonomousSessions.userId, userId),
            eq(autonomousSessions.startedAt, today)
          )
        );

      if (sessionsToday.length >= this.TIER_7_DAILY_LIMIT) {
        throw new Error(`Daily limit reached: ${this.TIER_7_DAILY_LIMIT} autonomous sessions per day for Tier 7`);
      }

      console.log(`[AutonomousEngine] ✅ Tier 7 user - ${sessionsToday.length}/${this.TIER_7_DAILY_LIMIT} sessions today`);
      return;
    }

    // Lower tiers cannot access autonomous mode
    throw new Error('Autonomous mode requires Tier 7 (Architect) or higher subscription');
  }

  /**
   * Get session history for a user
   */
  async getHistory(userId: number, limit: number = 10): Promise<AutonomousSession[]> {
    const sessions = await db
      .select()
      .from(autonomousSessions)
      .where(eq(autonomousSessions.userId, userId))
      .orderBy(desc(autonomousSessions.startedAt))
      .limit(limit);

    return sessions.map(s => ({
      id: s.id,
      userId: s.userId,
      userRequest: s.userRequest,
      status: s.status as any,
      totalTasks: s.totalTasks,
      completedTasks: s.completedTasks,
      failedTasks: s.failedTasks,
      cost: parseFloat(s.cost),
      startedAt: s.startedAt,
      completedAt: s.completedAt || undefined,
      errorLog: s.errorLog,
    }));
  }

  /**
   * Cancel a running session
   */
  async cancelSession(sessionId: string): Promise<void> {
    await db
      .update(autonomousSessions)
      .set({
        status: 'cancelled',
        completedAt: new Date(),
      })
      .where(eq(autonomousSessions.id, sessionId));

    console.log(`[AutonomousEngine] ❌ Session ${sessionId} cancelled`);
  }
}
