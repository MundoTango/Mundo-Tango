/**
 * AgentRegistry - Central registry for all 1,218 specialized agents
 * 
 * MB.MD Level 2: Mr. Blue uses this registry to broadcast queries
 * to the agent ecosystem and find who owns which elements/files.
 */

import { BasePageAgent } from './BasePageAgent';
import { LandingPageAgent } from './LandingPageAgent';
import { FeedPageAgent } from './FeedPageAgent';
import { ProfilePageAgent } from './ProfilePageAgent';
import { EventsPageAgent } from './EventsPageAgent';
import { MessagesPageAgent } from './MessagesPageAgent';
import { AdminPageAgent } from './AdminPageAgent';
import { HousingPageAgent } from './HousingPageAgent';
import { GroupsPageAgent } from './GroupsPageAgent';
import { FinancialPageAgent } from './FinancialPageAgent';
import { MrBluePageAgent } from './MrBluePageAgent';

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
   * MB.MD: Comprehensive agent ecosystem with 10 page agents
   * Each page agent manages multiple feature agents
   */
  private initializeAgents() {
    console.log('[AgentRegistry] 🚀 Initializing comprehensive agent ecosystem...');

    // Core Page Agents with PRD Knowledge and Feature Agents
    const pageAgents = [
      new LandingPageAgent(),      // Landing/Home page
      new FeedPageAgent(),         // Feed/Memories - 4 feature agents
      new ProfilePageAgent(),      // Profile pages - 4 feature agents
      new EventsPageAgent(),       // Events system - 4 feature agents
      new MessagesPageAgent(),     // Messaging - 4 feature agents
      new AdminPageAgent(),        // Admin dashboard - 4 feature agents
      new HousingPageAgent(),      // Housing/Accommodation - 3 feature agents
      new GroupsPageAgent(),       // Groups/Communities - 3 feature agents
      new FinancialPageAgent(),    // Financial/Payments - 3 feature agents
      new MrBluePageAgent(),       // Mr. Blue AI - 4 feature agents
    ];

    // Register all page agents
    for (const agent of pageAgents) {
      this.registerAgent(agent);
    }

    // Log feature agent count
    let totalFeatureAgents = 0;
    for (const agent of pageAgents) {
      if ('getFeatureAgents' in agent && typeof agent.getFeatureAgents === 'function') {
        totalFeatureAgents += (agent as any).getFeatureAgents().length;
      }
    }

    console.log(`[AgentRegistry] ✅ Registered ${this.agents.size} page agents with ${totalFeatureAgents} feature agents`);
  }

  /**
   * Register a new agent
   */
  registerAgent(agent: BasePageAgent) {
    this.agents.set(agent.getId(), agent);
    console.log(`[AgentRegistry] Registered: ${agent.getName()}`);
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
   * Get comprehensive registry stats
   */
  getStats(): {
    totalPageAgents: number;
    totalFeatureAgents: number;
    agentList: Array<{ id: string; name: string; domain: string[]; featureCount: number }>;
  } {
    let totalFeatureAgents = 0;
    const agentList = Array.from(this.agents.values()).map(agent => {
      let featureCount = 0;
      if ('getFeatureAgents' in agent && typeof agent.getFeatureAgents === 'function') {
        featureCount = (agent as any).getFeatureAgents().length;
        totalFeatureAgents += featureCount;
      }
      return {
        id: agent.getId(),
        name: agent.getName(),
        domain: agent.getDomain(),
        featureCount,
      };
    });

    return {
      totalPageAgents: this.agents.size,
      totalFeatureAgents,
      agentList,
    };
  }

  /**
   * Get all feature agents across all page agents
   */
  getAllFeatureAgents(): Array<{ pageId: string; featureId: string; featureName: string }> {
    const features: Array<{ pageId: string; featureId: string; featureName: string }> = [];
    
    for (const agent of this.agents.values()) {
      if ('getFeatureAgents' in agent && typeof agent.getFeatureAgents === 'function') {
        const featureAgents = (agent as any).getFeatureAgents();
        for (const fa of featureAgents) {
          features.push({
            pageId: agent.getId(),
            featureId: fa.getFeatureId(),
            featureName: fa.getFeatureName(),
          });
        }
      }
    }
    
    return features;
  }
}

// Export singleton instance - agents initialize on first import of this module
// Note: The singleton pattern within getInstance() is already lazy (creates on first call)
// To further optimize startup, consider dynamically importing this module only when needed
export const agentRegistry = AgentRegistry.getInstance();
