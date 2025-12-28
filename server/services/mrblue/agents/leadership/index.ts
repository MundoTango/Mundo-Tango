/**
 * Leadership Agents Index
 * 
 * Exports all leadership agents and provides registration
 * with the Agent Orchestrator.
 */

import { BaseLeadershipAgent } from './BaseLeadershipAgent';
import { ctoAgent, CTOAgent } from './CTOAgent';
import { ceoAgent, CEOAgent } from './CEOAgent';

// Export base class
export { BaseLeadershipAgent } from './BaseLeadershipAgent';
export type { 
  LeadershipKnowledge, 
  LearningEntry, 
  GodCommand,
  LeadershipDecision,
  LeadershipTask 
} from './BaseLeadershipAgent';

// Export agent classes
export { CTOAgent, ctoAgent };
export { CEOAgent, ceoAgent };

// Leadership agent registry
const leadershipAgents: Map<string, BaseLeadershipAgent> = new Map();

// Register all leadership agents
leadershipAgents.set('cto-agent', ctoAgent);
leadershipAgents.set('ceo-agent', ceoAgent);

/**
 * Get a leadership agent by ID
 */
export function getLeadershipAgent(agentId: string): BaseLeadershipAgent | undefined {
  return leadershipAgents.get(agentId);
}

/**
 * Get all leadership agents
 */
export function getAllLeadershipAgents(): BaseLeadershipAgent[] {
  return Array.from(leadershipAgents.values());
}

/**
 * Route a task to the appropriate leadership agent
 */
export async function routeToLeadershipAgent(
  taskDescription: string,
  priority: 'urgent' | 'high' | 'normal' | 'low' = 'normal'
): Promise<{
  agent: BaseLeadershipAgent;
  confidence: number;
  reason: string;
} | null> {
  const task = {
    id: `task-${Date.now()}`,
    description: taskDescription,
    priority,
    domain: 'leadership',
    requiredKnowledge: [],
  };

  let bestMatch: {
    agent: BaseLeadershipAgent;
    confidence: number;
    reason: string;
  } | null = null;

  for (const agent of leadershipAgents.values()) {
    const result = await agent.canHandle(task);
    
    if (result.canHandle && (!bestMatch || result.confidence > bestMatch.confidence)) {
      bestMatch = {
        agent,
        confidence: result.confidence,
        reason: result.reason,
      };
    }
  }

  return bestMatch;
}

/**
 * Initialize all leadership agents (load knowledge)
 */
export async function initializeLeadershipAgents(): Promise<void> {
  console.log('[LeadershipAgents] Initializing all leadership agents...');
  
  for (const [id, agent] of leadershipAgents) {
    try {
      await agent.loadKnowledge();
      console.log(`[LeadershipAgents] ✅ ${agent.getName()} online`);
    } catch (error) {
      console.error(`[LeadershipAgents] ❌ Failed to initialize ${id}:`, error);
    }
  }

  console.log(`[LeadershipAgents] ${leadershipAgents.size} leadership agents ready`);
}

/**
 * Get leadership agent hierarchy
 */
export function getLeadershipHierarchy(): {
  cSuite: BaseLeadershipAgent[];
  vpLevel: BaseLeadershipAgent[];
  headLevel: BaseLeadershipAgent[];
} {
  const agents = getAllLeadershipAgents();
  
  return {
    cSuite: agents.filter(a => a.getReportsTo() === null || a.getReportsTo() === 'ceo-agent'),
    vpLevel: agents.filter(a => a.getRole().includes('VP')),
    headLevel: agents.filter(a => a.getRole().includes('Head')),
  };
}

// Initialize on module load
initializeLeadershipAgents().catch(console.error);

console.log('[LeadershipAgents] Module loaded');
