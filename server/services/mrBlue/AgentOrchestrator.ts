/**
 * AGENT ORCHESTRATOR
 * Multi-agent workflow coordination using LangChain.js
 * 
 * Purpose: Coordinate multiple agents working together on complex tasks
 * 
 * Key Features:
 * - Multi-agent workflow execution
 * - Progress tracking across agents
 * - Error handling with retry logic
 * - Agent-to-agent communication via event bus
 * - Task decomposition and parallel execution
 * 
 * Workflow Pattern:
 * 1. User request → Task decomposition
 * 2. Create agent chain for execution
 * 3. Monitor progress via event bus
 * 4. Handle errors and retries
 * 5. Aggregate results
 */

import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { agentEventBus, type AgentEvent } from './AgentEventBus';
import { progressTrackingAgent, type TaskProgress } from './ProgressTrackingAgent';

// ==================== TYPES ====================

export interface Agent {
  name: string;
  description: string;
  capabilities: string[];
  execute: (input: any, context: WorkflowContext) => Promise<any>;
}

export interface WorkflowContext {
  sessionId: string;
  userId: number;
  data: Map<string, any>;
  eventBus: typeof agentEventBus;
  progressAgent: typeof progressTrackingAgent;
}

export interface WorkflowStep {
  agentName: string;
  input: any;
  retryCount?: number;
  timeout?: number;
}

export interface WorkflowResult {
  success: boolean;
  sessionId: string;
  results: Map<string, any>;
  errors: string[];
  completedSteps: number;
  totalSteps: number;
  duration: number;
}

export interface OrchestratorConfig {
  maxRetries?: number;
  stepTimeout?: number;
  parallelExecutionLimit?: number;
}

// ==================== AGENT ORCHESTRATOR ====================

export class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private config: Required<OrchestratorConfig>;
  private activeWorkflows: Map<string, WorkflowContext> = new Map();

  constructor(config: OrchestratorConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      stepTimeout: config.stepTimeout ?? 300000, // 5 minutes
      parallelExecutionLimit: config.parallelExecutionLimit ?? 5,
    };

    console.log('[AgentOrchestrator] Initialized multi-agent orchestration');
  }

  /**
   * Register an agent
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.name, agent);
    console.log(`[AgentOrchestrator] ✅ Registered agent: ${agent.name}`);

    // Publish agent ready event
    const event = agentEventBus.createEvent(
      'agent:ready',
      'AgentOrchestrator',
      {
        agentName: agent.name,
        capabilities: agent.capabilities,
      } as any
    );
    agentEventBus.publish(event);
  }

  /**
   * Execute a multi-step workflow
   */
  async executeWorkflow(
    sessionId: string,
    userId: number,
    steps: WorkflowStep[]
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    const context: WorkflowContext = {
      sessionId,
      userId,
      data: new Map(),
      eventBus: agentEventBus,
      progressAgent: progressTrackingAgent,
    };

    this.activeWorkflows.set(sessionId, context);

    // Initialize progress tracking
    progressTrackingAgent.startSession(sessionId, steps.length);

    // Publish workflow started event
    const startEvent = agentEventBus.createEvent(
      'workflow:started',
      'AgentOrchestrator',
      {
        workflowId: sessionId,
        workflowName: 'Multi-Agent Workflow',
      } as any
    );
    await agentEventBus.publish(startEvent);

    const results: Map<string, any> = new Map();
    const errors: string[] = [];
    let completedSteps = 0;

    console.log(
      `[AgentOrchestrator] 🎯 Starting workflow ${sessionId} with ${steps.length} steps`
    );

    // Phase 1: Planning
    progressTrackingAgent.updatePhase(
      sessionId,
      'planning',
      'Analyzing workflow steps...'
    );

    // Phase 2: Execution
    progressTrackingAgent.updatePhase(
      sessionId,
      'execution',
      'Executing agent tasks...'
    );

    try {
      // Execute steps sequentially
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const agent = this.agents.get(step.agentName);

        if (!agent) {
          const error = `Agent ${step.agentName} not found`;
          errors.push(error);
          console.error(`[AgentOrchestrator] ❌ ${error}`);
          continue;
        }

        // Add subtask for tracking
        const subtaskId = `step_${i}`;
        progressTrackingAgent.addSubtask(
          sessionId,
          subtaskId,
          `${agent.name}: ${step.input?.description || 'Running'}`
        );

        // Publish task started event
        const taskStartEvent = agentEventBus.createEvent(
          'task:started',
          agent.name,
          {
            taskId: subtaskId,
            sessionId,
            taskDescription: step.input?.description,
          } as any
        );
        await agentEventBus.publish(taskStartEvent);

        // Execute with retry logic
        const result = await this.executeStepWithRetry(
          agent,
          step,
          context,
          subtaskId
        );

        if (result.success) {
          results.set(agent.name, result.data);
          context.data.set(agent.name, result.data);
          completedSteps++;

          // Update subtask as completed
          progressTrackingAgent.updateSubtask(sessionId, subtaskId, 'completed', 100);

          // Publish task completed event
          const taskCompleteEvent = agentEventBus.createEvent(
            'task:completed',
            agent.name,
            {
              taskId: subtaskId,
              sessionId,
              result: result.data,
            } as any
          );
          await agentEventBus.publish(taskCompleteEvent);

          console.log(
            `[AgentOrchestrator] ✅ Step ${i + 1}/${steps.length} completed: ${agent.name}`
          );
        } else {
          errors.push(`${agent.name}: ${result.error}`);

          // Update subtask as failed
          progressTrackingAgent.updateSubtask(sessionId, subtaskId, 'failed', 0);

          // Publish task failed event
          const taskFailEvent = agentEventBus.createEvent(
            'task:failed',
            agent.name,
            {
              taskId: subtaskId,
              sessionId,
              error: result.error,
            } as any
          );
          await agentEventBus.publish(taskFailEvent);

          console.error(
            `[AgentOrchestrator] ❌ Step ${i + 1}/${steps.length} failed: ${agent.name}`
          );
        }
      }

      // Phase 3: Validation (if all succeeded)
      if (errors.length === 0) {
        progressTrackingAgent.updatePhase(
          sessionId,
          'validation',
          'Validating workflow results...'
        );
      }

      // Phase 4: Complete
      const success = errors.length === 0;
      progressTrackingAgent.completeSession(sessionId, success);

      const duration = Date.now() - startTime;

      const workflowResult: WorkflowResult = {
        success,
        sessionId,
        results,
        errors,
        completedSteps,
        totalSteps: steps.length,
        duration,
      };

      // Publish workflow completed event
      const completeEvent = agentEventBus.createEvent(
        'workflow:completed',
        'AgentOrchestrator',
        {
          workflowId: sessionId,
          workflowName: 'Multi-Agent Workflow',
        } as any
      );
      await agentEventBus.publish(completeEvent);

      console.log(
        `[AgentOrchestrator] ${
          success ? '✅' : '❌'
        } Workflow ${sessionId} completed in ${(duration / 1000).toFixed(2)}s`
      );

      return workflowResult;
    } catch (error: any) {
      console.error(`[AgentOrchestrator] ❌ Workflow ${sessionId} failed:`, error);

      progressTrackingAgent.completeSession(sessionId, false);

      return {
        success: false,
        sessionId,
        results,
        errors: [...errors, error.message],
        completedSteps,
        totalSteps: steps.length,
        duration: Date.now() - startTime,
      };
    } finally {
      this.activeWorkflows.delete(sessionId);
    }
  }

  /**
   * Execute a workflow step with retry logic
   */
  private async executeStepWithRetry(
    agent: Agent,
    step: WorkflowStep,
    context: WorkflowContext,
    subtaskId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const maxRetries = step.retryCount ?? this.config.maxRetries;
    const timeout = step.timeout ?? this.config.stepTimeout;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `[AgentOrchestrator] 🔄 Executing ${agent.name} (attempt ${attempt}/${maxRetries})`
        );

        // Execute with timeout
        const result = await Promise.race([
          agent.execute(step.input, context),
          this.createTimeoutPromise(timeout),
        ]);

        return { success: true, data: result };
      } catch (error: any) {
        console.error(
          `[AgentOrchestrator] ❌ ${agent.name} attempt ${attempt} failed:`,
          error.message
        );

        if (attempt === maxRetries) {
          return { success: false, error: error.message };
        }

        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await this.sleep(delay);
      }
    }

    return { success: false, error: 'Max retries exceeded' };
  }

  /**
   * Create a timeout promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Step execution timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute steps in parallel (for independent tasks)
   */
  async executeParallel(
    sessionId: string,
    userId: number,
    steps: WorkflowStep[]
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    const context: WorkflowContext = {
      sessionId,
      userId,
      data: new Map(),
      eventBus: agentEventBus,
      progressAgent: progressTrackingAgent,
    };

    this.activeWorkflows.set(sessionId, context);
    progressTrackingAgent.startSession(sessionId, steps.length);

    const results: Map<string, any> = new Map();
    const errors: string[] = [];

    console.log(
      `[AgentOrchestrator] 🎯 Starting parallel execution ${sessionId} with ${steps.length} steps`
    );

    try {
      // Execute in batches to respect parallel limit
      const batches: WorkflowStep[][] = [];
      for (
        let i = 0;
        i < steps.length;
        i += this.config.parallelExecutionLimit
      ) {
        batches.push(steps.slice(i, i + this.config.parallelExecutionLimit));
      }

      for (const batch of batches) {
        const batchPromises = batch.map(async (step, index) => {
          const agent = this.agents.get(step.agentName);
          if (!agent) {
            return { success: false, error: `Agent ${step.agentName} not found` };
          }

          const subtaskId = `step_parallel_${index}`;
          progressTrackingAgent.addSubtask(sessionId, subtaskId, agent.name);

          return this.executeStepWithRetry(agent, step, context, subtaskId);
        });

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach((result, index) => {
          const step = batch[index];
          if (result.success) {
            results.set(step.agentName, result.data);
          } else {
            errors.push(`${step.agentName}: ${result.error}`);
          }
        });
      }

      const success = errors.length === 0;
      progressTrackingAgent.completeSession(sessionId, success);

      return {
        success,
        sessionId,
        results,
        errors,
        completedSteps: steps.length - errors.length,
        totalSteps: steps.length,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error(
        `[AgentOrchestrator] ❌ Parallel workflow ${sessionId} failed:`,
        error
      );

      progressTrackingAgent.completeSession(sessionId, false);

      return {
        success: false,
        sessionId,
        results,
        errors: [...errors, error.message],
        completedSteps: 0,
        totalSteps: steps.length,
        duration: Date.now() - startTime,
      };
    } finally {
      this.activeWorkflows.delete(sessionId);
    }
  }

  /**
   * Get registered agents
   */
  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by name
   */
  getAgent(name: string): Agent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get active workflow context
   */
  getWorkflowContext(sessionId: string): WorkflowContext | undefined {
    return this.activeWorkflows.get(sessionId);
  }

  /**
   * Cancel a workflow
   */
  cancelWorkflow(sessionId: string): boolean {
    const context = this.activeWorkflows.get(sessionId);
    if (context) {
      progressTrackingAgent.completeSession(sessionId, false);
      this.activeWorkflows.delete(sessionId);
      console.log(`[AgentOrchestrator] 🛑 Cancelled workflow ${sessionId}`);
      return true;
    }
    return false;
  }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator({
  maxRetries: 3,
  stepTimeout: 300000, // 5 minutes
  parallelExecutionLimit: 5,
});
