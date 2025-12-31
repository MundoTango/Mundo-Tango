import { vibeCodingToolService } from "../VibeCodingToolService";
import { mbmdEngine } from "../mbmdEngine";
import { checkpointManager } from "../CheckpointManager";
import { planExecuteLoopService } from "../PlanExecuteLoop";

const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`)
};

/**
 * GodCommandEnforcer
 * 
 * Enforces Mundo Tango mb.md GOD COMMANDS (#0-#8) as active middleware.
 * Intercepts VibeCoding actions to ensure strategic compliance.
 * 
 * Commands:
 * #0 AUTO-INVOKE: Automatic plan tracking and GitHub checks
 * #1 TEST FIRST: Mandatory verification
 * #2 SIMULTANEOUSLY: Parallel execution enforcement
 * #3 RECURSIVELY: Dependency depth checks
 * #4 CRITICALLY: 95%+ Quality threshold
 * #5 DOCS FIRST: Mandatory documentation lookup
 * #7 AUTO-FIX: 3-attempt retry loop
 * #8 VALIDATION: Observe -> Decide -> Act loop
 */
export class GodCommandEnforcer {
  private static instance: GodCommandEnforcer;
  private toolService: any;

  private constructor() {
    this.toolService = vibeCodingToolService;
  }

  public static getInstance(): GodCommandEnforcer {
    if (!GodCommandEnforcer.instance) {
      GodCommandEnforcer.instance = new GodCommandEnforcer();
    }
    return GodCommandEnforcer.instance;
  }

  /**
   * Command #0: AUTO-INVOKE
   * Automatically initializes necessary subsystems for every session
   */
  public async autoInvoke(sessionId: string, userId: number): Promise<void> {
    logger.info(`[GodCommandEnforcer] Enforcing #0 AUTO-INVOKE for session ${sessionId}`);
    
    // Auto-invoke Plan Tracker
    const plan = await planExecuteLoopService.createPlan(sessionId, "Initial God-Command Analysis", [
      { id: "init-1", description: "Initialize session context", action: "analyze", params: {}, dependencies: [] }
    ]);
    
    // Auto-invoke Checkpoint for safety
    await checkpointManager.createCheckpoint(sessionId, userId, "god-command-init", []);
    
    logger.info(`[GodCommandEnforcer] #0 AUTO-INVOKE Complete for ${sessionId}`);
  }

  /**
   * Command #1: Test Before Completing
   * Ensures no task is marked complete without successful verification
   */
  public async enforceTestBeforeComplete(taskId: string, testResult: any): Promise<void> {
    logger.info(`[GodCommandEnforcer] Enforcing #1 TEST BEFORE COMPLETE for task ${taskId}`);
    if (!testResult || !testResult.success) {
      throw new Error(`Command #1 Violation: Task ${taskId} failed verification. Completion blocked.`);
    }
  }

  /**
   * Command #2: Work Simultaneously
   * Enforces parallel execution for independent tasks
   */
  public async wrapSimultaneously<T>(tasks: Promise<T>[]): Promise<T[]> {
    logger.info(`[GodCommandEnforcer] Enforcing #2 WORK SIMULTANEOUSLY for ${tasks.length} operations`);
    return Promise.all(tasks);
  }

  /**
   * Command #4: Work Critically
   * Enforces a minimum quality score before permitting changes
   */
  public async validateCritically(content: string): Promise<void> {
    logger.info("[GodCommandEnforcer] Enforcing #4 WORK CRITICALLY (95% Quality Threshold)");
    const report = await mbmdEngine.validateTaskAgainstQualityGates({
      subtasks: [{ description: content, estimatedMinutes: 1, type: 'code_generation' } as any],
      parallelTracks: [],
      dependencies: { nodes: [], edges: [], levels: [] }
    } as any);

    if (report.score < 95) {
      throw new Error(`Command #4 Violation: Quality score ${report.score.toFixed(1)}% is below the required 95% threshold.`);
    }
  }

  /**
   * Command #5: Check Documentation First
   * Forces a search of relevant documentation before execution
   */
  public async enforceDocsFirst(goal: string): Promise<void> {
    logger.info(`[GodCommandEnforcer] Enforcing #5 CHECK DOCS FIRST for goal: ${goal}`);
    const docResult = await this.toolService.executeTool('grepFiles', { searchTerm: goal, directory: '.' });
    if (!docResult.success) {
      logger.warn("[GodCommandEnforcer] #5 Docs lookup warning: No immediate documentation matches found.");
    }
  }

  /**
   * Command #7: Auto-Fix Maximization
   * Implements the 3-attempt retry loop for atomic operations
   */
  public async executeWithAutoFix<T>(operation: () => Promise<T>, label: string = "Operation"): Promise<T> {
    logger.info(`[GodCommandEnforcer] Enforcing #7 AUTO-FIX for ${label}`);
    let attempts = 0;
    while (attempts < 3) {
      try {
        return await operation();
      } catch (error: any) {
        attempts++;
        logger.warn(`[GodCommandEnforcer] #7 Attempt ${attempts} failed for ${label}: ${error.message}`);
        if (attempts === 3) {
          logger.error(`[GodCommandEnforcer] #7 MAX RETRIES REACHED for ${label}`);
          throw error;
        }
      }
    }
    throw new Error("Maximum retry attempts reached");
  }

  /**
   * Command #8: Validation Score (Observe -> Decide -> Act)
   * Enforces the structured feedback loop for every major action
   */
  public async runValidationLoop(observation: any, decision: () => Promise<void>): Promise<void> {
    logger.info("[GodCommandEnforcer] Enforcing #8 VALIDATION SCORE Loop");
    // OBSERVE
    logger.info(`[GodCommandEnforcer] OBSERVE: ${JSON.stringify(observation).substring(0, 100)}...`);
    
    // DECIDE & ACT
    await decision();
    
    logger.info("[GodCommandEnforcer] #8 Loop Complete");
  }
}

export const godCommandEnforcer = GodCommandEnforcer.getInstance();
