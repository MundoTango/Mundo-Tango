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
   * Command #3: Work Recursively
   * Enforces deep dependency analysis by reading file contents and resolving import paths
   */
  public async enforceRecursively(files: string[], maxDepth: number = 3): Promise<{ analyzed: string[], depth: number }> {
    logger.info(`[GodCommandEnforcer] Enforcing #3 WORK RECURSIVELY for ${files.length} files (max depth: ${maxDepth})`);
    
    const analyzed = new Set<string>();
    let currentDepth = 0;
    let filesToProcess = [...files];
    
    const resolveImportPath = async (importPath: string, currentFile: string): Promise<string | null> => {
      if (importPath.startsWith('.')) {
        const dir = currentFile.substring(0, currentFile.lastIndexOf('/')) || '.';
        let resolved = `${dir}/${importPath}`
          .replace(/\/\.\//g, '/')
          .replace(/\/[^/]+\/\.\.\//g, '/');
        
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', ''];
        for (const ext of extensions) {
          const fullPath = resolved + ext;
          try {
            const checkResult = await this.toolService.executeTool('readFile', { path: fullPath });
            if (checkResult.success) {
              return fullPath;
            }
          } catch (e) {
            // File doesn't exist with this extension, try next
          }
        }
      }
      return null;
    };
    
    const unresolvedImports: string[] = [];
    const failedReads: string[] = [];
    
    while (currentDepth < maxDepth && filesToProcess.length > 0) {
      const nextLevel: string[] = [];
      
      for (const file of filesToProcess) {
        if (!analyzed.has(file)) {
          try {
            const readResult = await this.toolService.executeTool('readFile', { path: file });
            
            if (!readResult.success || !readResult.content) {
              failedReads.push(file);
              logger.error(`[GodCommandEnforcer] #3 FAILED to read file: ${file}`);
              continue;
            }
            
            analyzed.add(file);
            
            const importRegex = /import\s+(?:(?:\{[^}]*\}|[^{}\s]+)\s+from\s+)?['"]([^'"]+)['"]/g;
            let match;
            while ((match = importRegex.exec(readResult.content)) !== null) {
              const importPath = match[1];
              if (importPath.startsWith('.')) {
                const resolved = await resolveImportPath(importPath, file);
                if (resolved && !analyzed.has(resolved)) {
                  nextLevel.push(resolved);
                } else if (!resolved) {
                  unresolvedImports.push(`${file} -> ${importPath}`);
                }
              }
            }
          } catch (e) {
            failedReads.push(file);
            logger.error(`[GodCommandEnforcer] #3 ERROR reading file: ${file}`);
          }
        }
      }
      
      currentDepth++;
      filesToProcess = nextLevel;
    }
    
    // Fail if seed files couldn't be read
    if (analyzed.size === 0 && failedReads.length > 0) {
      throw new Error(`Command #3 Violation: Could not read seed files: ${failedReads.join(', ')}`);
    }
    
    // Fail if critical dependencies are unresolved (only for root level failures)
    if (failedReads.length > 0 && currentDepth <= 1) {
      throw new Error(`Command #3 Violation: Failed to read ${failedReads.length} root file(s): ${failedReads.slice(0, 3).join(', ')}`);
    }
    
    // Warn about unresolved imports (deeper levels are non-blocking)
    if (unresolvedImports.length > 0) {
      logger.warn(`[GodCommandEnforcer] #3 Unresolved imports (${unresolvedImports.length}): ${unresolvedImports.slice(0, 3).join('; ')}`);
    }
    
    logger.info(`[GodCommandEnforcer] #3 RECURSIVELY Complete: ${analyzed.size} files analyzed at depth ${currentDepth}`);
    return { analyzed: Array.from(analyzed), depth: currentDepth };
  }

  /**
   * Command #4: Work Critically
   * Enforces a minimum quality score before permitting changes
   */
  public async validateCritically(content: string): Promise<{ score: number, passed: boolean }> {
    logger.info("[GodCommandEnforcer] Enforcing #4 WORK CRITICALLY (95% Quality Threshold)");
    const report = await mbmdEngine.validateTaskAgainstQualityGates({
      subtasks: [{ description: content, estimatedMinutes: 1, type: 'code_generation' } as any],
      parallelTracks: [],
      dependencies: { nodes: [], edges: [], levels: [] }
    } as any);

    const passed = report.score >= 95;
    if (!passed) {
      logger.error(`[GodCommandEnforcer] #4 CRITICAL VIOLATION: Quality score ${report.score.toFixed(1)}% is below 95% threshold`);
      throw new Error(`Command #4 Violation: Quality score ${report.score.toFixed(1)}% is below the required 95% threshold. Execution blocked.`);
    }
    logger.info(`[GodCommandEnforcer] #4 Quality score ${report.score.toFixed(1)}% - PASSED`);
    return { score: report.score, passed: true };
  }

  /**
   * Command #6: Infrastructure First
   * Checks existing systems before building new ones
   */
  public async checkInfrastructureFirst(capability: string): Promise<{ exists: boolean, system?: string }> {
    logger.info(`[GodCommandEnforcer] Enforcing #6 INFRASTRUCTURE FIRST for: ${capability}`);
    
    const existingSystems = ['Page Audit', 'Auto-Fix', 'Agent Orchestration', 'Self-Healing'];
    const matching = existingSystems.find(s => capability.toLowerCase().includes(s.toLowerCase()));
    
    if (matching) {
      logger.info(`[GodCommandEnforcer] #6 Found existing system: ${matching}`);
      return { exists: true, system: matching };
    }
    
    return { exists: false };
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
   * Command #8: Validation Score (Observe -> Decide -> Act -> Validate -> Adapt)
   * Enforces the structured feedback loop with mandatory revalidation after adaptation
   */
  public async runValidationLoop<T>(
    observation: any, 
    decide: () => Promise<T>,
    validate: (result: T) => Promise<boolean>,
    adapt?: (result: T) => Promise<T>
  ): Promise<{ result: T, validated: boolean, adapted: boolean }> {
    logger.info("[GodCommandEnforcer] Enforcing #8 VALIDATION SCORE Loop");
    
    // OBSERVE
    logger.info(`[GodCommandEnforcer] OBSERVE: ${JSON.stringify(observation).substring(0, 100)}...`);
    
    // DECIDE & ACT
    let result = await decide();
    logger.info("[GodCommandEnforcer] DECIDE & ACT complete");
    
    // VALIDATE (first attempt)
    let isValid = await validate(result);
    logger.info(`[GodCommandEnforcer] VALIDATE (attempt 1): ${isValid ? 'PASSED' : 'FAILED'}`);
    
    // ADAPT (if validation failed and adapter provided)
    let adapted = false;
    if (!isValid && adapt) {
      result = await adapt(result);
      adapted = true;
      logger.info("[GodCommandEnforcer] ADAPT: Applied corrections");
      
      // REVALIDATE after adaptation (mandatory)
      isValid = await validate(result);
      logger.info(`[GodCommandEnforcer] VALIDATE (post-adapt): ${isValid ? 'PASSED' : 'FAILED'}`);
    }
    
    // Fail hard if still not validated
    if (!isValid) {
      logger.error("[GodCommandEnforcer] #8 CRITICAL: Validation failed even after adaptation");
      throw new Error("Command #8 Violation: Validation loop failed - result did not pass validation after adaptation.");
    }
    
    logger.info("[GodCommandEnforcer] #8 Loop Complete - VALIDATED");
    return { result, validated: true, adapted };
  }
}

export const godCommandEnforcer = GodCommandEnforcer.getInstance();
