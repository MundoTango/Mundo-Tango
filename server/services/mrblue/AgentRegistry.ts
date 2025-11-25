/**
 * AgentRegistry - Central registry for all 1,218 specialized agents
 * 
 * MB.MD Level 2: Mr. Blue uses this registry to broadcast queries
 * to the agent ecosystem and find who owns which elements/files.
 */

import { BasePageAgent } from './agents/BasePageAgent';
import { LandingPageAgent } from './agents/LandingPageAgent';
import { FeedPageAgent } from './agents/FeedPageAgent';

export class AgentRegistry {
  private agents: Map<string, BasePageAgent>;
  private static instance: AgentRegistry;

  private constructor() {
    this.agents = new Map();
    this.initializeAgents();
  }

  /**
   * Singleton instance
   */
  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  /**
   * Initialize all agents
   * 
   * MB.MD: This will eventually register all 1,218 agents
   * For now, we start with the landing page agent as proof of concept
   */
  private initializeAgents() {
    console.log('[AgentRegistry] 🚀 Initializing agent ecosystem...');

    // Phase 1: Core Page Agents with PRD Knowledge
    const landingPageAgent = new LandingPageAgent();
    this.registerAgent(landingPageAgent);

    // Phase 2: Feed Page Agent (with full PRD knowledge - knows schema, APIs, common bugs)
    const feedPageAgent = new FeedPageAgent();
    this.registerAgent(feedPageAgent);

    // TODO: Phase 3: Add more page agents with PRD knowledge
    // - ProfilePageAgent (client/src/pages/Profile.tsx)
    // - EventsPageAgent (client/src/pages/events/*.tsx)
    // - MessagesPageAgent (client/src/pages/Messages.tsx)
    // ... etc for all 1,218 agents

    console.log(`[AgentRegistry] ✅ Registered ${this.agents.size} agents`);
  }

  /**
   * Register a new agent
   */
  registerAgent(agent: BasePageAgent) {
    this.agents.set(agent.getId(), agent);
    console.log(`[AgentRegistry] Registered: ${agent.getName()} (${agent.getDomain().join(', ')})`);
  }

  /**
   * Get agent by ID
   */
  getAgent(id: string): BasePageAgent | undefined {
    return this.agents.get(id);
  }

  /**
   * Get all agents
   */
  getAllAgents(): BasePageAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Find agent that owns a specific file
   */
  findAgentByFile(filePath: string): BasePageAgent | undefined {
    for (const agent of this.agents.values()) {
      if (agent.ownsFile(filePath)) {
        return agent;
      }
    }
    return undefined;
  }

  /**
   * Get agent count
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Get registry stats
   */
  getStats(): {
    totalAgents: number;
    agentList: Array<{ id: string; name: string; domain: string[] }>;
  } {
    return {
      totalAgents: this.agents.size,
      agentList: Array.from(this.agents.values()).map(agent => ({
        id: agent.getId(),
        name: agent.getName(),
        domain: agent.getDomain(),
      })),
    };
  }
}

// Export singleton instance
export const agentRegistry = AgentRegistry.getInstance();
