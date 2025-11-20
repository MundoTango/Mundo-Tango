import type { WorkflowStep, WorkflowResult } from '@shared/types/a2a';
import { a2aProtocolService } from './A2AProtocolService';
import { db } from '../../db';
import { workflowExecutions } from '../../../shared/schema';

export interface LoopCondition {
  /**
   * Function that determines if loop should continue
   * Returns true to continue, false to exit
   */
  shouldContinue: (iteration: number, result: any, context: Record<string, any>) => boolean;

  /**
   * Maximum iterations to prevent infinite loops
   */
  maxIterations: number;

  /**
   * Optional: Function to modify task between iterations
   */
  improveTask?: (task: any, previousResult: any, errors: string[]) => any;
}

export class LoopOrchestrator {
  /**
   * Execute workflow step in a loop
   * Continue until success OR max iterations reached
   * Perfect for recursive improvement patterns (Gödel Agent)
   */
  async execute(
    step: WorkflowStep,
    condition: LoopCondition
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    const executionId = `loop-${Date.now()}`;
    const results: any[] = [];
    const errors: Array<{ step: string; error: string }> = [];
    let context: Record<string, any> = step.context || {};
    let iteration = 0;
    let currentTask = step.task;

    console.log(
      `[LoopOrchestrator] Starting loop execution (max ${condition.maxIterations} iterations)`
    );

    try {
      while (iteration < condition.maxIterations) {
        iteration++;
        console.log(`[LoopOrchestrator] Iteration ${iteration}/${condition.maxIterations}`);

        try {
          // Execute step via A2A Protocol
          const result = await a2aProtocolService.sendAgentToAgent(
            'loop-orchestrator',
            step.agentId,
            typeof currentTask === 'string' ? currentTask : JSON.stringify(currentTask),
            { ...context, iteration }
          );

          // Store iteration result
          results.push({
            iteration,
            stepId: step.id,
            agentId: step.agentId,
            result,
            success: true
          });

          // Update context
          context = {
            ...context,
            [`iteration_${iteration}_result`]: result,
            lastIterationSuccess: true
          };

          console.log(`[LoopOrchestrator] Iteration ${iteration} completed successfully`);

          // Check if should continue
          if (!condition.shouldContinue(iteration, result, context)) {
            console.log('[LoopOrchestrator] Success condition met, exiting loop');
            break;
          }

          // Improve task for next iteration if function provided
          if (condition.improveTask) {
            currentTask = condition.improveTask(currentTask, result, []);
            console.log('[LoopOrchestrator] Task improved for next iteration');
          }
        } catch (error: any) {
          console.error(`[LoopOrchestrator] Iteration ${iteration} failed:`, error.message);

          errors.push({
            step: `iteration_${iteration}`,
            error: error.message || 'Unknown error'
          });

          // Store failed iteration
          results.push({
            iteration,
            stepId: step.id,
            agentId: step.agentId,
            result: null,
            success: false,
            error: error.message
          });

          context.lastIterationSuccess = false;

          // Try to improve task based on error
          if (condition.improveTask && iteration < condition.maxIterations) {
            currentTask = condition.improveTask(currentTask, null, [error.message]);
            console.log('[LoopOrchestrator] Task improved after failure');
          }
        }
      }

      const duration = Date.now() - startTime;
      const successCount = results.filter(r => r.success).length;
      const success = successCount > 0 && errors.length < iteration;

      // Add iteration stats to context
      context = {
        ...context,
        totalIterations: iteration,
        successfulIterations: successCount,
        failedIterations: errors.length,
        maxIterationsReached: iteration >= condition.maxIterations
      };

      // Log execution to database
      await this.logExecution(executionId, [step], results, success, duration);

      if (iteration >= condition.maxIterations) {
        console.log(
          `[LoopOrchestrator] Max iterations reached without success (${successCount}/${iteration} successful)`
        );
      } else {
        console.log(
          `[LoopOrchestrator] Loop completed in ${iteration} iterations (${duration}ms)`
        );
      }

      return {
        success,
        results,
        errors: errors.length > 0 ? errors : undefined,
        duration,
        context
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      console.error('[LoopOrchestrator] Execution error:', error);

      await this.logExecution(executionId, [step], results, false, duration);

      return {
        success: false,
        results,
        errors: [{ step: 'orchestrator', error: error.message || 'Orchestration failed' }],
        duration,
        context
      };
    }
  }

  /**
   * Convenience method for standard validation loop (Gödel Agent pattern)
   * Retry until validation passes OR max attempts reached
   */
  async executeValidationLoop(
    validationStep: WorkflowStep,
    maxAttempts: number = 3
  ): Promise<WorkflowResult> {
    return this.execute(validationStep, {
      maxIterations: maxAttempts,
      shouldContinue: (iteration, result) => {
        // Continue if validation failed
        return result?.validation?.passed === false;
      },
      improveTask: (task, previousResult, errors) => {
        // Add previous errors to task for improvement
        return {
          ...task,
          previousErrors: errors,
          attemptNumber: (task.attemptNumber || 0) + 1
        };
      }
    });
  }

  /**
   * Log workflow execution to database
   */
  private async logExecution(
    executionId: string,
    steps: WorkflowStep[],
    results: any[],
    success: boolean,
    duration: number
  ): Promise<void> {
    try {
      await db.insert(workflowExecutions).values({
        workflowId: executionId,
        type: 'loop',
        steps: steps as any,
        results: results as any,
        success,
        duration
      });
    } catch (error) {
      console.error('[LoopOrchestrator] Failed to log execution:', error);
    }
  }
}

export const loopOrchestrator = new LoopOrchestrator();
