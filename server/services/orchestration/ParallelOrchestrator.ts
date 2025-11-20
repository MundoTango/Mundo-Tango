import type { WorkflowStep, WorkflowResult } from '@shared/types/a2a';
import { a2aProtocolService } from './A2AProtocolService';
import { db } from '../../db';
import { workflowExecutions } from '../../../shared/schema';

export class ParallelOrchestrator {
  /**
   * Execute workflow steps in parallel
   * Wait for ALL to complete (Promise.all)
   * Aggregate results from all steps
   * Handle partial failures gracefully
   */
  async execute(steps: WorkflowStep[]): Promise<WorkflowResult> {
    const startTime = Date.now();
    const executionId = `par-${Date.now()}`;
    const errors: Array<{ step: string; error: string }> = [];

    console.log(`[ParallelOrchestrator] Starting parallel execution: ${steps.length} steps`);

    try {
      // Execute all steps in parallel
      const stepPromises = steps.map(async (step, index) => {
        try {
          console.log(
            `[ParallelOrchestrator] Starting step ${index + 1}/${steps.length}: ${step.agentId}`
          );

          const result = await a2aProtocolService.sendAgentToAgent(
            'parallel-orchestrator',
            step.agentId,
            typeof step.task === 'string' ? step.task : JSON.stringify(step.task),
            step.context
          );

          console.log(`[ParallelOrchestrator] Step ${index + 1} completed`);

          return {
            stepId: step.id,
            agentId: step.agentId,
            result,
            success: true
          };
        } catch (error: any) {
          console.error(
            `[ParallelOrchestrator] Step ${index + 1} (${step.agentId}) failed:`,
            error.message
          );

          errors.push({
            step: step.id,
            error: error.message || 'Unknown error'
          });

          return {
            stepId: step.id,
            agentId: step.agentId,
            result: null,
            success: false,
            error: error.message
          };
        }
      });

      // Wait for ALL steps to complete
      const results = await Promise.all(stepPromises);

      const duration = Date.now() - startTime;
      const successCount = results.filter(r => r.success).length;
      const success = errors.length === 0 && successCount === steps.length;

      // Aggregate context from all results
      const context: Record<string, any> = {
        totalSteps: steps.length,
        successfulSteps: successCount,
        failedSteps: errors.length
      };

      results.forEach(result => {
        if (result.success) {
          context[`step_${result.stepId}_result`] = result.result;
        }
      });

      // Log execution to database
      await this.logExecution(executionId, steps, results, success, duration);

      console.log(
        `[ParallelOrchestrator] Execution completed: ${successCount}/${steps.length} successful in ${duration}ms`
      );

      return {
        success,
        results,
        errors: errors.length > 0 ? errors : undefined,
        duration,
        context
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      console.error('[ParallelOrchestrator] Execution error:', error);

      await this.logExecution(executionId, steps, [], false, duration);

      return {
        success: false,
        results: [],
        errors: [{ step: 'orchestrator', error: error.message || 'Orchestration failed' }],
        duration,
        context: {}
      };
    }
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
        type: 'parallel',
        steps: steps as any,
        results: results as any,
        success,
        duration
      });
    } catch (error) {
      console.error('[ParallelOrchestrator] Failed to log execution:', error);
    }
  }
}

export const parallelOrchestrator = new ParallelOrchestrator();
