import type { WorkflowStep, WorkflowResult } from '@shared/types/a2a';
import { a2aProtocolService } from './A2AProtocolService';
import { db } from '../../db';
import { workflowExecutions } from '../../../shared/schema';

export class SequentialOrchestrator {
  /**
   * Execute workflow steps in sequential order
   * Each step waits for previous to complete
   * Halt on failure, continue on success
   */
  async execute(steps: WorkflowStep[]): Promise<WorkflowResult> {
    const startTime = Date.now();
    const executionId = `seq-${Date.now()}`;
    const results: any[] = [];
    const errors: Array<{ step: string; error: string }> = [];
    let context: Record<string, any> = {};

    console.log(`[SequentialOrchestrator] Starting execution: ${steps.length} steps`);

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        console.log(`[SequentialOrchestrator] Step ${i + 1}/${steps.length}: ${step.agentId}`);

        try {
          // Merge step context with accumulated context
          const stepContext = { ...context, ...step.context };

          // Execute step via A2A Protocol
          const result = await a2aProtocolService.sendAgentToAgent(
            'sequential-orchestrator',
            step.agentId,
            typeof step.task === 'string' ? step.task : JSON.stringify(step.task),
            stepContext
          );

          // Store result
          results.push({
            stepId: step.id,
            agentId: step.agentId,
            result,
            success: true
          });

          // Update context with step result
          context = {
            ...context,
            [`step_${step.id}_result`]: result,
            lastStepSuccess: true
          };

          console.log(`[SequentialOrchestrator] Step ${i + 1} completed successfully`);
        } catch (error: any) {
          console.error(`[SequentialOrchestrator] Step ${i + 1} failed:`, error.message);

          errors.push({
            step: step.id,
            error: error.message || 'Unknown error'
          });

          // HALT on failure (sequential pattern)
          context.lastStepSuccess = false;
          break;
        }
      }

      const duration = Date.now() - startTime;
      const success = errors.length === 0 && results.length === steps.length;

      // Log execution to database
      await this.logExecution(executionId, steps, results, success, duration);

      console.log(
        `[SequentialOrchestrator] Execution ${success ? 'completed' : 'failed'} in ${duration}ms`
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

      console.error('[SequentialOrchestrator] Execution error:', error);

      await this.logExecution(executionId, steps, results, false, duration);

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
        type: 'sequential',
        steps: steps as any,
        results: results as any,
        success,
        duration
      });
    } catch (error) {
      console.error('[SequentialOrchestrator] Failed to log execution:', error);
    }
  }
}

export const sequentialOrchestrator = new SequentialOrchestrator();
