/**
 * WORKFLOW EXECUTION SERVICE
 * Production-ready multi-agent orchestration system
 * 
 * Features:
 * - Sequential workflows: Execute agents in order
 * - Parallel workflows: Execute multiple agents simultaneously  
 * - Intelligence Cycle: Recursive feedback loops (Plan → Execute → Review → Learn)
 * - State tracking and persistence
 * - Error handling and recovery
 * - Timeout management
 * - Database logging via workflow_executions table
 * 
 * Supports all 91 agents via A2A Protocol
 */

import type { WorkflowStep, WorkflowResult, WorkflowDefinition } from '@shared/types/a2a';
import { sequentialOrchestrator } from './SequentialOrchestrator';
import { parallelOrchestrator } from './ParallelOrchestrator';
import { 
  startCycle, 
  getCycleStatus, 
  getCycleMetrics 
} from './intelligenceCycleOrchestrator';
import { db } from '../../db';
import { workflowExecutions } from '../../../shared/schema';
import { eq, desc } from 'drizzle-orm';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type WorkflowType = 'sequential' | 'parallel' | 'intelligence-cycle';

export interface ExecuteWorkflowRequest {
  type: WorkflowType;
  name?: string;
  steps: WorkflowStep[];
  metadata?: Record<string, any>;
  timeout?: number;
}

export interface WorkflowExecution {
  id: number;
  workflowId: string;
  type: WorkflowType;
  steps: WorkflowStep[];
  results: any[];
  success: boolean;
  duration: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface WorkflowStats {
  total: number;
  successful: number;
  failed: number;
  avgDuration: number;
  byType: {
    sequential: number;
    parallel: number;
    'intelligence-cycle': number;
  };
}

// ============================================================================
// WORKFLOW EXECUTION SERVICE
// ============================================================================

export class WorkflowExecutionService {
  /**
   * Execute a workflow based on type
   */
  async execute(request: ExecuteWorkflowRequest): Promise<WorkflowResult & { workflowId: string }> {
    const workflowId = this.generateWorkflowId(request.type);
    const startTime = Date.now();

    console.log(`[WorkflowExecution] Starting ${request.type} workflow: ${workflowId}`);

    try {
      let result: WorkflowResult;

      switch (request.type) {
        case 'sequential':
          result = await this.executeSequential(request.steps);
          break;

        case 'parallel':
          result = await this.executeParallel(request.steps);
          break;

        case 'intelligence-cycle':
          result = await this.executeIntelligenceCycle(request);
          break;

        default:
          throw new Error(`Unknown workflow type: ${request.type}`);
      }

      const duration = Date.now() - startTime;

      // Log to database
      await this.logExecution({
        workflowId,
        type: request.type,
        steps: request.steps,
        results: result.results || [],
        success: result.success,
        duration
      });

      console.log(
        `[WorkflowExecution] ${request.type} workflow ${result.success ? 'completed' : 'failed'} in ${duration}ms`
      );

      return {
        ...result,
        workflowId,
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      console.error(`[WorkflowExecution] Workflow failed:`, error);

      // Log failure to database
      await this.logExecution({
        workflowId,
        type: request.type,
        steps: request.steps,
        results: [],
        success: false,
        duration
      });

      throw error;
    }
  }

  /**
   * Execute sequential workflow
   * Steps run one after another, each receiving previous results
   */
  private async executeSequential(steps: WorkflowStep[]): Promise<WorkflowResult> {
    console.log(`[WorkflowExecution] Sequential: ${steps.length} steps`);
    return await sequentialOrchestrator.execute(steps);
  }

  /**
   * Execute parallel workflow
   * All steps run simultaneously, results aggregated
   */
  private async executeParallel(steps: WorkflowStep[]): Promise<WorkflowResult> {
    console.log(`[WorkflowExecution] Parallel: ${steps.length} steps`);
    return await parallelOrchestrator.execute(steps);
  }

  /**
   * Execute intelligence cycle workflow
   * 7-step recursive cycle: LEARN → TEST → ANALYZE → COLLABORATE → BUILD → TEST → REPORT
   */
  private async executeIntelligenceCycle(request: ExecuteWorkflowRequest): Promise<WorkflowResult> {
    console.log(`[WorkflowExecution] Intelligence Cycle: ${request.name || 'Unnamed cycle'}`);

    // Convert workflow steps to intelligence cycle participants
    const participatingAgents = request.steps.map(step => step.agentId);

    const cycle = await startCycle({
      cycleName: request.name || `Auto-cycle ${Date.now()}`,
      cycleType: 'standard',
      participatingAgents,
      leadAgent: participatingAgents[0],
      cycleDescription: request.metadata?.description
    });

    // Poll for cycle completion (intelligence cycles run asynchronously)
    const maxWaitTime = request.timeout || 300000; // 5 minutes default
    const pollInterval = 2000; // 2 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const status = await getCycleStatus(cycle.cycleId);

      if (status.cycle.status === 'completed') {
        return {
          success: true,
          results: [{
            cycleId: cycle.cycleId,
            metrics: status.metrics,
            progress: status.currentProgress
          }],
          duration: status.metrics.totalDuration || (Date.now() - startTime),
          context: status.cycle.stepResults as any
        };
      }

      if (status.cycle.status === 'failed') {
        return {
          success: false,
          results: [{
            cycleId: cycle.cycleId,
            error: status.cycle.failureReason
          }],
          errors: [{
            step: 'intelligence-cycle',
            error: status.cycle.failureReason || 'Cycle failed'
          }],
          duration: Date.now() - startTime,
          context: {}
        };
      }

      // Still running, wait and poll again
      await this.sleep(pollInterval);
    }

    // Timeout
    return {
      success: false,
      results: [{
        cycleId: cycle.cycleId,
        error: 'Timeout waiting for cycle completion'
      }],
      errors: [{
        step: 'intelligence-cycle',
        error: 'Workflow timeout exceeded'
      }],
      duration: Date.now() - startTime,
      context: {}
    };
  }

  /**
   * Get workflow execution status
   */
  async getWorkflowStatus(workflowId: string): Promise<WorkflowExecution | null> {
    const executions = await db
      .select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.workflowId, workflowId))
      .limit(1);

    if (executions.length === 0) {
      return null;
    }

    const execution = executions[0];

    return {
      id: execution.id,
      workflowId: execution.workflowId,
      type: execution.type as WorkflowType,
      steps: execution.steps as any,
      results: execution.results as any,
      success: execution.success,
      duration: execution.duration,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt || undefined
    };
  }

  /**
   * List recent workflows with pagination
   */
  async listWorkflows(limit = 20, offset = 0): Promise<WorkflowExecution[]> {
    const executions = await db
      .select()
      .from(workflowExecutions)
      .orderBy(desc(workflowExecutions.startedAt))
      .limit(limit)
      .offset(offset);

    return executions.map(execution => ({
      id: execution.id,
      workflowId: execution.workflowId,
      type: execution.type as WorkflowType,
      steps: execution.steps as any,
      results: execution.results as any,
      success: execution.success,
      duration: execution.duration,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt || undefined
    }));
  }

  /**
   * Get workflow statistics
   */
  async getStats(): Promise<WorkflowStats> {
    const allExecutions = await db
      .select()
      .from(workflowExecutions)
      .limit(1000);

    const total = allExecutions.length;
    const successful = allExecutions.filter(e => e.success).length;
    const failed = total - successful;

    const avgDuration = total > 0
      ? allExecutions.reduce((sum, e) => sum + e.duration, 0) / total
      : 0;

    const byType = {
      sequential: allExecutions.filter(e => e.type === 'sequential').length,
      parallel: allExecutions.filter(e => e.type === 'parallel').length,
      'intelligence-cycle': allExecutions.filter(e => e.type === 'intelligence-cycle').length
    };

    return {
      total,
      successful,
      failed,
      avgDuration,
      byType
    };
  }

  /**
   * Get intelligence cycle metrics
   */
  async getIntelligenceCycleMetrics() {
    return await getCycleMetrics();
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Generate unique workflow ID
   */
  private generateWorkflowId(type: WorkflowType): string {
    const prefix = type === 'sequential' ? 'seq' 
                 : type === 'parallel' ? 'par' 
                 : 'cycle';
    
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log workflow execution to database
   */
  private async logExecution(execution: {
    workflowId: string;
    type: WorkflowType;
    steps: WorkflowStep[];
    results: any[];
    success: boolean;
    duration: number;
  }): Promise<void> {
    try {
      await db.insert(workflowExecutions).values({
        workflowId: execution.workflowId,
        type: execution.type,
        steps: execution.steps as any,
        results: execution.results as any,
        success: execution.success,
        duration: execution.duration,
        completedAt: new Date()
      });
    } catch (error) {
      console.error('[WorkflowExecution] Failed to log execution:', error);
    }
  }

  /**
   * Sleep utility for polling
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const workflowExecutionService = new WorkflowExecutionService();
