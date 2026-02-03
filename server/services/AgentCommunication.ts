/**
 * AgentCommunication - Broadcasting and delegation system
 * 
 * MB.MD Level 2 → Level 3 Communication:
 * - broadcastQuery: Ask all agents "who owns this?"
 * - delegateTask: Assign work to specific agent
 * - Uses GlobalKnowledgeBase for <5ms response times
 */

import { agentRegistry } from './AgentRegistry';
import { BasePageAgent, ElementLocation, StyleChange, FileUpdate } from './BasePageAgent';
import { globalKnowledgeBase } from './GlobalKnowledgeBase';

export interface QueryResponse {
  agentId: string;
  agentName: string;
  canHandle: boolean;
  confidence: number;
  element: ElementLocation | null;
  reason: string;
}

export interface TaskResult {
  success: boolean;
  agentId: string;
  agentName: string;
  fileUpdate: FileUpdate | null;
  error?: string;
}

export class AgentCommunication {
  private static instance: AgentCommunication;

  private constructor() {}

  /**
   * Singleton instance
   */
  static getInstance(): AgentCommunication {
    if (!AgentCommunication.instance) {
      AgentCommunication.instance = new AgentCommunication();
    }
    return AgentCommunication.instance;
  }

  /**
   * Broadcast query to all agents
   * 
   * MB.MD: This is the core of the agent ecosystem
   * All agents receive the query and respond with their confidence level
   * 
   * Target: <5ms response time using GlobalKnowledgeBase cache
   */
  async broadcastQuery(query: string): Promise<QueryResponse[]> {
    const startTime = Date.now();
    console.log(`[AgentCommunication] 📢 Broadcasting query: "${query}"`);

    // Check GlobalKnowledgeBase cache first
    const cachedResponse = await globalKnowledgeBase.queryCached(query);
    if (cachedResponse) {
      const elapsed = Date.now() - startTime;
      console.log(`[AgentCommunication] ⚡ Cache hit! Response time: ${elapsed}ms`);
      return cachedResponse;
    }

    // Cache miss - query all agents
    const agents = agentRegistry.getAllAgents();
    const responses: QueryResponse[] = [];

    // Query all agents in parallel for speed
    const queryPromises = agents.map(async (agent) => {
      try {
        const result = await agent.canHandle(query);
        return {
          agentId: agent.getId(),
          agentName: agent.getName(),
          canHandle: result.canHandle,
          confidence: result.confidence,
          element: result.element,
          reason: result.reason,
        };
      } catch (error: any) {
        console.error(`[AgentCommunication] Error querying ${agent.getName()}:`, error);
        return {
          agentId: agent.getId(),
          agentName: agent.getName(),
          canHandle: false,
          confidence: 0,
          element: null,
          reason: `Error: ${error.message}`,
        };
      }
    });

    const results = await Promise.all(queryPromises);
    
    // Filter to only agents that can handle the query
    const capableAgents = results.filter(r => r.canHandle && r.confidence > 0.5);
    
    // Sort by confidence (highest first)
    capableAgents.sort((a, b) => b.confidence - a.confidence);

    const elapsed = Date.now() - startTime;
    console.log(`[AgentCommunication] ✅ ${capableAgents.length} agents responded (${elapsed}ms)`);

    // Cache the response for next time
    await globalKnowledgeBase.cacheQueryResponse(query, capableAgents);

    return capableAgents;
  }

  /**
   * Delegate task to specific agent
   * 
   * MB.MD: Once an agent is selected, delegate the actual work
   */
  async delegateTask(
    agentId: string,
    element: ElementLocation,
    change: StyleChange
  ): Promise<TaskResult> {
    console.log(`[AgentCommunication] 🎯 Delegating task to agent: ${agentId}`);

    const agent = agentRegistry.getAgent(agentId);
    if (!agent) {
      return {
        success: false,
        agentId,
        agentName: 'Unknown',
        fileUpdate: null,
        error: `Agent ${agentId} not found`,
      };
    }

    try {
      const fileUpdate = await agent.applyChange(element, change);

      // Broadcast change to GlobalKnowledgeBase
      await globalKnowledgeBase.broadcastChange({
        agentId,
        agentName: agent.getName(),
        filePath: fileUpdate.filePath,
        element: element.textContent,
        change: change.description,
        timestamp: new Date(),
      });

      return {
        success: true,
        agentId,
        agentName: agent.getName(),
        fileUpdate,
      };
    } catch (error: any) {
      console.error(`[AgentCommunication] Error delegating to ${agent.getName()}:`, error);
      return {
        success: false,
        agentId,
        agentName: agent.getName(),
        fileUpdate: null,
        error: error.message,
      };
    }
  }

  /**
   * Query ONLY active agents (MB.MD v9.2)
   * 
   * This is used by VibeCoding instead of broadcastQuery()
   * Active agents are already contextually aware of the current page
   * 
   * Target: <5ms response time (agents already listening)
   */
  async queryActiveAgents(query: string): Promise<QueryResponse[]> {
    const startTime = Date.now();
    console.log(`[AgentCommunication] 📢 Querying active agents: "${query}"`);

    // Import agentLifecycle dynamically to avoid circular dependency
    const { agentLifecycle } = await import('./AgentLifecycle');
    const activeAgents = agentLifecycle.getActiveAgents();

    if (activeAgents.length === 0) {
      console.log(`[AgentCommunication] ⚠️ No active agents - falling back to broadcast`);
      return this.broadcastQuery(query);
    }

    console.log(`[AgentCommunication] 🎯 Querying ${activeAgents.length} active agents`);

    // Query only active agents in parallel
    const queryPromises = activeAgents.map(async (agent) => {
      try {
        const result = await agent.canHandle(query);
        return {
          agentId: agent.getId(),
          agentName: agent.getName(),
          canHandle: result.canHandle,
          confidence: result.confidence,
          element: result.element,
          reason: result.reason,
        };
      } catch (error: any) {
        console.error(`[AgentCommunication] Error querying ${agent.getName()}:`, error);
        return {
          agentId: agent.getId(),
          agentName: agent.getName(),
          canHandle: false,
          confidence: 0,
          element: null,
          reason: `Error: ${error.message}`,
        };
      }
    });

    const results = await Promise.all(queryPromises);
    
    // Filter to only agents that can handle the query
    const capableAgents = results.filter(r => r.canHandle && r.confidence > 0.5);
    
    // Sort by confidence (highest first)
    capableAgents.sort((a, b) => b.confidence - a.confidence);

    const elapsed = Date.now() - startTime;
    console.log(`[AgentCommunication] ⚡ ${capableAgents.length} active agents responded (${elapsed}ms)`);

    return capableAgents;
  }

  /**
   * Get agent ecosystem stats
   */
  getEcosystemStats(): {
    totalAgents: number;
    activeAgents: number;
    cacheHitRate: number;
  } {
    const stats = agentRegistry.getStats();
    const kbStats = globalKnowledgeBase.getStats();

    return {
      totalAgents: stats.totalAgents,
      activeAgents: stats.totalAgents, // All agents are active by default
      cacheHitRate: kbStats.cacheHitRate,
    };
  }
}

// Export singleton instance
export const agentCommunication = AgentCommunication.getInstance();
