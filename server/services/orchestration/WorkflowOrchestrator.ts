import { StateGraph, END } from '@langchain/langgraph';
import type { WorkflowStep, WorkflowResult } from '@shared/types/a2a';
import { a2aProtocolService } from './A2AProtocolService';
import { db } from '../../db';
import { workflowExecutions } from '../../../shared/schema';

export interface WorkflowNode {
  id: string;
  agentId: string;
  function: (state: Record<string, any>) => Promise<Record<string, any>>;
}

export interface WorkflowEdge {
  from: string;
  to: string | typeof END;
  condition?: (state: Record<string, any>) => string | typeof END;
  mapping?: Record<string, string>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  state: Record<string, any>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  entrypoint: string;
}

export class WorkflowOrchestrator {
  private workflows = new Map<string, any>();

  /**
   * Create workflow from definition using LangGraph
   */
  async createWorkflow(definition: WorkflowDefinition): Promise<string> {
    console.log(`[WorkflowOrchestrator] Creating workflow: ${definition.name}`);

    try {
      // Initialize StateGraph with state schema
      const graph = new StateGraph({
        channels: definition.state
      });

      // Add nodes (agents)
      for (const node of definition.nodes) {
        graph.addNode(node.id, async (state: Record<string, any>) => {
          console.log(`[WorkflowOrchestrator] Executing node: ${node.id}`);

          try {
            // Execute via A2A Protocol
            const result = await a2aProtocolService.sendAgentToAgent(
              'workflow-orchestrator',
              node.agentId,
              JSON.stringify(state),
              state
            );

            // Return updated state
            return {
              ...state,
              [`node_${node.id}_result`]: result,
              lastNodeSuccess: true
            };
          } catch (error: any) {
            console.error(`[WorkflowOrchestrator] Node ${node.id} failed:`, error.message);

            return {
              ...state,
              [`node_${node.id}_error`]: error.message,
              lastNodeSuccess: false
            };
          }
        });
      }

      // Add edges (transitions)
      for (const edge of definition.edges) {
        if (edge.condition && edge.mapping) {
          // Conditional edge with routing
          graph.addConditionalEdges(edge.from, edge.condition, edge.mapping);
        } else if (edge.condition) {
          // Conditional edge (returns next node or END)
          graph.addConditionalEdges(edge.from, edge.condition);
        } else {
          // Simple edge
          graph.addEdge(edge.from, edge.to as string);
        }
      }

      // Set entrypoint
      graph.setEntryPoint(definition.entrypoint);

      // Compile workflow
      const compiledWorkflow = graph.compile();

      // Store workflow
      this.workflows.set(definition.id, compiledWorkflow);

      console.log(`[WorkflowOrchestrator] Workflow ${definition.name} created successfully`);

      return definition.id;
    } catch (error: any) {
      console.error('[WorkflowOrchestrator] Failed to create workflow:', error);
      throw new Error(`Workflow creation failed: ${error.message}`);
    }
  }

  /**
   * Execute workflow by ID
   */
  async execute(workflowId: string, input: Record<string, any>): Promise<WorkflowResult> {
    const startTime = Date.now();

    console.log(`[WorkflowOrchestrator] Executing workflow: ${workflowId}`);

    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      // Execute workflow
      const result = await workflow.invoke(input);

      const duration = Date.now() - startTime;
      const success = !result.lastNodeSuccess === false; // Success if last node didn't fail

      // Log execution
      await this.logExecution(workflowId, [], [result], success, duration);

      console.log(
        `[WorkflowOrchestrator] Workflow ${workflowId} ${success ? 'completed' : 'failed'} in ${duration}ms`
      );

      return {
        success,
        results: [result],
        duration,
        context: result
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      console.error('[WorkflowOrchestrator] Execution error:', error);

      await this.logExecution(workflowId, [], [], false, duration);

      return {
        success: false,
        results: [],
        errors: [{ step: 'workflow', error: error.message || 'Workflow execution failed' }],
        duration,
        context: {}
      };
    }
  }

  /**
   * Create standard autonomous workflow
   * (Clarify → Generate → Validate → Commit → Deploy)
   */
  async createAutonomousWorkflow(): Promise<string> {
    const definition: WorkflowDefinition = {
      id: 'autonomous-workflow',
      name: 'Autonomous Development Workflow',
      description: 'Complete workflow: Clarify → Generate → Validate → Commit → Deploy',
      state: {
        userRequest: null,
        clarified: false,
        generated: false,
        validated: false,
        committed: false,
        deployed: false
      },
      nodes: [
        {
          id: 'clarify',
          agentId: 'clarification',
          function: async (state) => state
        },
        {
          id: 'generate',
          agentId: 'vibe-coding',
          function: async (state) => state
        },
        {
          id: 'validate',
          agentId: 'quality-validator',
          function: async (state) => state
        },
        {
          id: 'commit',
          agentId: 'git-service',
          function: async (state) => state
        },
        {
          id: 'deploy-check',
          agentId: 'deployment-readiness',
          function: async (state) => state
        }
      ],
      edges: [
        {
          from: 'clarify',
          to: 'generate',
          condition: (state) => (state.clarified ? 'generate' : END)
        },
        { from: 'generate', to: 'validate' },
        {
          from: 'validate',
          to: 'commit',
          condition: (state) => (state.validated ? 'commit' : 'generate'),
          mapping: {
            valid: 'commit',
            invalid: 'generate' // Retry generation if validation fails
          }
        },
        { from: 'commit', to: 'deploy-check' },
        { from: 'deploy-check', to: END }
      ],
      entrypoint: 'clarify'
    };

    return this.createWorkflow(definition);
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): any {
    return this.workflows.get(workflowId);
  }

  /**
   * List all workflows
   */
  listWorkflows(): string[] {
    return Array.from(this.workflows.keys());
  }

  /**
   * Log workflow execution to database
   */
  private async logExecution(
    workflowId: string,
    steps: WorkflowStep[],
    results: any[],
    success: boolean,
    duration: number
  ): Promise<void> {
    try {
      await db.insert(workflowExecutions).values({
        workflowId,
        type: 'workflow',
        steps: steps as any,
        results: results as any,
        success,
        duration
      });
    } catch (error) {
      console.error('[WorkflowOrchestrator] Failed to log execution:', error);
    }
  }
}

export const workflowOrchestrator = new WorkflowOrchestrator();

// Initialize autonomous workflow on module load
workflowOrchestrator.createAutonomousWorkflow().catch(console.error);
