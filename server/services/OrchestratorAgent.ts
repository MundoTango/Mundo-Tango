import type { WorkflowStep, OrchestrationType } from '@shared/types/a2a';
import { agentCardRegistry } from './AgentCardRegistry';
import { sequentialOrchestrator } from './SequentialOrchestrator';
import { parallelOrchestrator } from './ParallelOrchestrator';
import { loopOrchestrator } from './LoopOrchestrator';
import { workflowOrchestrator } from './WorkflowOrchestrator';
import { a2aProtocolService } from './A2AProtocolService';

export interface UserRequest {
  message: string;
  context?: Record<string, any>;
  orchestrationType?: OrchestrationType;
  userId?: number;
}

export class OrchestratorAgent {
  /**
   * Main entry point - route user request to appropriate workflow
   */
  async routeRequest(request: UserRequest): Promise<any> {
    console.log('[OrchestratorAgent] Routing request:', request.message.substring(0, 100));

    try {
      // Determine orchestration type if not specified
      const orchestrationType = request.orchestrationType || this.inferOrchestrationType(request);

      console.log(`[OrchestratorAgent] Using orchestration: ${orchestrationType}`);

      // Execute based on orchestration type
      switch (orchestrationType) {
        case 'sequential':
          return await this.executeSequential(request);

        case 'parallel':
          return await this.executeParallel(request);

        case 'loop':
          return await this.executeLoop(request);

        case 'workflow':
          return await this.executeWorkflow(request);

        case 'task':
          return await this.executeTask(request);

        default:
          // Default to sequential for simple requests
          return await this.executeTask(request);
      }
    } catch (error: any) {
      console.error('[OrchestratorAgent] Routing error:', error);
      throw new Error(`Request routing failed: ${error.message}`);
    }
  }

  /**
   * Infer orchestration type from request
   */
  private inferOrchestrationType(request: UserRequest): OrchestrationType {
    const message = request.message.toLowerCase();

    // Keywords that suggest orchestration type
    if (message.includes('workflow') || message.includes('multi-step')) {
      return 'workflow';
    }

    if (
      message.includes('parallel') ||
      message.includes('simultaneously') ||
      message.includes('all at once')
    ) {
      return 'parallel';
    }

    if (
      message.includes('loop') ||
      message.includes('retry') ||
      message.includes('until') ||
      message.includes('recursive')
    ) {
      return 'loop';
    }

    if (
      message.includes('then') ||
      message.includes('after that') ||
      message.includes('first') ||
      message.includes('next')
    ) {
      return 'sequential';
    }

    // Default to task for simple requests
    return 'task';
  }

  /**
   * Execute sequential workflow
   */
  private async executeSequential(request: UserRequest): Promise<any> {
    // Example: Parse request into steps
    // For now, use autonomous workflow
    const steps: WorkflowStep[] = [
      {
        id: 'clarify',
        agentId: 'clarification',
        task: request.message,
        context: request.context
      },
      {
        id: 'generate',
        agentId: 'vibe-coding',
        task: request.message,
        context: request.context
      }
    ];

    return await sequentialOrchestrator.execute(steps);
  }

  /**
   * Execute parallel workflow
   */
  private async executeParallel(request: UserRequest): Promise<any> {
    // Example: Parse request into parallel tasks
    const steps: WorkflowStep[] = [
      {
        id: 'task1',
        agentId: 'vibe-coding',
        task: request.message,
        context: request.context
      },
      {
        id: 'task2',
        agentId: 'error-analysis',
        task: request.message,
        context: request.context
      }
    ];

    return await parallelOrchestrator.execute(steps);
  }

  /**
   * Execute loop workflow
   */
  private async executeLoop(request: UserRequest): Promise<any> {
    const step: WorkflowStep = {
      id: 'validation-loop',
      agentId: 'quality-validator',
      task: request.message,
      context: request.context
    };

    return await loopOrchestrator.executeValidationLoop(step, 3);
  }

  /**
   * Execute LangGraph workflow
   */
  private async executeWorkflow(request: UserRequest): Promise<any> {
    // Use autonomous workflow
    const workflowId = 'autonomous-workflow';
    const input = {
      userRequest: request.message,
      ...request.context
    };

    return await workflowOrchestrator.execute(workflowId, input);
  }

  /**
   * Execute simple task (single agent)
   */
  private async executeTask(request: UserRequest): Promise<any> {
    // Select best agent for task
    const agentId = await this.selectAgent(request);

    console.log(`[OrchestratorAgent] Selected agent: ${agentId}`);

    // Delegate to agent via A2A
    return await a2aProtocolService.sendAgentToAgent(
      'orchestrator',
      agentId,
      request.message,
      request.context
    );
  }

  /**
   * Select best agent for task
   */
  async selectAgent(request: UserRequest): Promise<string> {
    const message = request.message.toLowerCase();

    // Keyword-based agent selection
    if (message.includes('code') || message.includes('generate') || message.includes('vibe')) {
      return 'vibe-coding';
    }

    if (message.includes('error') || message.includes('fix') || message.includes('debug')) {
      return 'error-analysis';
    }

    if (message.includes('validate') || message.includes('check') || message.includes('quality')) {
      return 'quality-validator';
    }

    if (message.includes('knowledge') || message.includes('how does') || message.includes('explain')) {
      return 'knowledge-base';
    }

    // Default to vibe-coding for general requests
    return 'vibe-coding';
  }

  /**
   * Get orchestrator statistics
   */
  async getStats(): Promise<any> {
    const agentCount = agentCardRegistry.getAgentCount();
    const workflows = workflowOrchestrator.listWorkflows();

    return {
      totalAgents: agentCount,
      totalWorkflows: workflows.length,
      workflows
    };
  }
}

export const orchestratorAgent = new OrchestratorAgent();
