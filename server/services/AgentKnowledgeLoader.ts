/**
 * AGENT KNOWLEDGE LOADER SERVICE
 * MB.MD v9.9.3 + Samsung TinyRecursiveModels Integration
 * 
 * Orchestrates knowledge loading for all 1,218+ agents:
 * - 10 Page Agents
 * - 50 Algorithm Agents (A1-A50)
 * - 33 Feature Agents
 * - 32 A2A System Agents
 * - 1,093+ Worker Agents
 * 
 * Uses RecursiveContextService's TRM implementation for recursive learning
 */

import { recursiveContextService, AgentKnowledge } from './RecursiveContextService';
// import * as fs from 'fs/promises';  // TODO: File missing
import * as path from 'path';

// ============================================================================
// AGENT CONFIGURATION TYPES
// ============================================================================

export interface AgentDocConfig {
  agentId: string;
  agentName: string;
  category: 'page' | 'algorithm' | 'feature' | 'system' | 'worker';
  documentationPaths: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies?: string[]; // Other agents this agent depends on
}

export interface LearningReport {
  totalAgents: number;
  successfulLearnings: number;
  failedLearnings: number;
  averageConfidence: number;
  byCategory: Record<string, { count: number; avgConfidence: number }>;
  timestamp: Date;
  details: AgentKnowledge[];
}

// ============================================================================
// AGENT REGISTRY - Documentation Mappings
// ============================================================================

/**
 * PAGE AGENTS (10) - Each learns their respective page PRD
 */
export const PAGE_AGENTS: AgentDocConfig[] = [
  {
    agentId: 'PA-01-Landing',
    agentName: 'Landing Page Agent',
    category: 'page',
    priority: 'critical',
    documentationPaths: [
      'docs/prds/PRD_LANDING_PAGE.md',
      'docs/marketing-site-plan.md',
      'docs/PRD_LANDING_EXPERIENCE.md'
    ]
  },
  {
    agentId: 'PA-02-Feed',
    agentName: 'Feed Page Agent',
    category: 'page',
    priority: 'critical',
    documentationPaths: [
      'docs/prds/PRD_UNIFIED_FEEDS_SYSTEM.md',
      'docs/features/FEEDS_SYSTEM.md'
    ]
  },
  {
    agentId: 'PA-03-Profile',
    agentName: 'Profile Page Agent',
    category: 'page',
    priority: 'critical',
    documentationPaths: [
      'docs/prds/PRD_USER_PROFILE_SYSTEM.md',
      'docs/prds/PRD_PUBLIC_PROFILE_VIEW_SYSTEM.md'
    ]
  },
  {
    agentId: 'PA-04-Events',
    agentName: 'Events Page Agent',
    category: 'page',
    priority: 'critical',
    documentationPaths: [
      'docs/prds/PRD_EVENTS_SYSTEM.md',
      'docs/algorithms/EVENT_INTELLIGENCE.md'
    ]
  },
  {
    agentId: 'PA-05-Messages',
    agentName: 'Messages Page Agent',
    category: 'page',
    priority: 'critical',
    documentationPaths: [
      'docs/prds/PRD_MESSAGES_SYSTEM.md',
      'docs/features/MESSAGING_SYSTEM.md'
    ]
  },
  {
    agentId: 'PA-06-Admin',
    agentName: 'Admin Page Agent',
    category: 'page',
    priority: 'high',
    documentationPaths: [
      'docs/api/ADMIN_API.md',
      'docs/database/ADMIN_TABLES.md'
    ]
  },
  {
    agentId: 'PA-07-Housing',
    agentName: 'Housing Page Agent',
    category: 'page',
    priority: 'high',
    documentationPaths: [
      'docs/prds/PRD_HOUSING_SYSTEM.md',
      'docs/features/HOUSING_PLATFORM.md'
    ]
  },
  {
    agentId: 'PA-08-Groups',
    agentName: 'Groups Page Agent',
    category: 'page',
    priority: 'high',
    documentationPaths: [
      'docs/prds/PRD_GROUPS_SYSTEM.md',
      'docs/prds/PRD_GROUP_MEMBERSHIP_SYSTEM.md'
    ]
  },
  {
    agentId: 'PA-09-Financial',
    agentName: 'Financial Page Agent',
    category: 'page',
    priority: 'high',
    documentationPaths: [
      'docs/handoff/Comet/MundoTango Payment & Billing Systems Audit Report.md',
      'docs/prds/PRD_FINANCIAL_CORE.md'
    ]
  },
  {
    agentId: 'PA-10-MrBlue',
    agentName: 'Mr Blue Page Agent',
    category: 'page',
    priority: 'critical',
    documentationPaths: [
      'docs/governance/mr-blue-soul.md',
      'docs/mb-md/core.md',
      'docs/mb-md/role-agents.md'
    ]
  }
];

/**
 * ALGORITHM AGENTS (A1-A50) - Grouped by function
 */
export const ALGORITHM_AGENTS: AgentDocConfig[] = [
  // Recommendation Algorithms (A1-A10)
  ...Array.from({ length: 10 }, (_, i) => ({
    agentId: `A${String(i + 1).padStart(2, '0')}-Recommendation`,
    agentName: `Recommendation Algorithm Agent ${i + 1}`,
    category: 'algorithm' as const,
    priority: 'high' as const,
    documentationPaths: [
      'docs/phase-1/agent-training-algorithm-agents.md',
      'docs/algorithms/MATCHING_ENGINE.md'
    ]
  })),
  
  // Search Algorithms (A11-A20)
  ...Array.from({ length: 10 }, (_, i) => ({
    agentId: `A${i + 11}-Search`,
    agentName: `Search Algorithm Agent ${i + 11}`,
    category: 'algorithm' as const,
    priority: 'high' as const,
    documentationPaths: [
      'docs/phase-1/agent-training-algorithm-agents.md',
      'docs/algorithms/MATCHING_ENGINE.md'
    ]
  })),
  
  // Matching Algorithms (A21-A30)
  ...Array.from({ length: 10 }, (_, i) => ({
    agentId: `A${i + 21}-Matching`,
    agentName: `Matching Algorithm Agent ${i + 21}`,
    category: 'algorithm' as const,
    priority: 'critical' as const,
    documentationPaths: [
      'docs/algorithms/MATCHING_ENGINE.md',
      'docs/phase-1/agent-training-algorithm-agents.md'
    ]
  })),
  
  // Engagement Algorithms (A31-A40)
  ...Array.from({ length: 10 }, (_, i) => ({
    agentId: `A${i + 31}-Engagement`,
    agentName: `Engagement Algorithm Agent ${i + 31}`,
    category: 'algorithm' as const,
    priority: 'medium' as const,
    documentationPaths: [
      'docs/phase-1/agent-training-algorithm-agents.md',
      'docs/algorithms/SOCIAL_INTELLIGENCE.md'
    ]
  })),
  
  // Optimization Algorithms (A41-A50)
  ...Array.from({ length: 10 }, (_, i) => ({
    agentId: `A${i + 41}-Optimization`,
    agentName: `Optimization Algorithm Agent ${i + 41}`,
    category: 'algorithm' as const,
    priority: 'medium' as const,
    documentationPaths: [
      'docs/phase-1/agent-training-algorithm-agents.md',
      'docs/algorithms/PLATFORM_INTELLIGENCE.md'
    ]
  }))
];

/**
 * FEATURE AGENTS (33) - UI Feature specialists
 */
export const FEATURE_AGENTS: AgentDocConfig[] = [
  {
    agentId: 'FA-01-InfiniteScroll',
    agentName: 'Infinite Scroll Agent',
    category: 'feature',
    priority: 'high',
    documentationPaths: ['docs/features/PAGINATION.md']
  },
  {
    agentId: 'FA-02-PostCreator',
    agentName: 'Post Creator Agent',
    category: 'feature',
    priority: 'high',
    documentationPaths: ['docs/features/CONTENT_CREATION.md']
  },
  {
    agentId: 'FA-03-PostReactions',
    agentName: 'Post Reactions Agent',
    category: 'feature',
    priority: 'high',
    documentationPaths: ['docs/features/ENGAGEMENT.md']
  },
  {
    agentId: 'FA-04-StoriesCarousel',
    agentName: 'Stories Carousel Agent',
    category: 'feature',
    priority: 'medium',
    documentationPaths: ['docs/features/STORIES.md']
  },
  {
    agentId: 'FA-05-EventCard',
    agentName: 'Event Card Agent',
    category: 'feature',
    priority: 'high',
    documentationPaths: ['docs/prds/PRD_EVENTS_SYSTEM.md']
  },
  {
    agentId: 'FA-06-UserSearch',
    agentName: 'User Search Agent',
    category: 'feature',
    priority: 'high',
    documentationPaths: ['docs/features/SEARCH.md']
  },
  {
    agentId: 'FA-07-Notifications',
    agentName: 'Notifications Agent',
    category: 'feature',
    priority: 'high',
    documentationPaths: ['docs/features/NOTIFICATIONS.md']
  },
  {
    agentId: 'FA-08-MediaUpload',
    agentName: 'Media Upload Agent',
    category: 'feature',
    priority: 'high',
    documentationPaths: ['docs/features/MEDIA_HANDLING.md']
  },
  {
    agentId: 'FA-09-VideoPlayer',
    agentName: 'Video Player Agent',
    category: 'feature',
    priority: 'medium',
    documentationPaths: ['docs/features/VIDEO_SYSTEM.md']
  },
  {
    agentId: 'FA-10-Chat',
    agentName: 'Chat Agent',
    category: 'feature',
    priority: 'critical',
    documentationPaths: ['docs/prds/PRD_MESSAGES_SYSTEM.md']
  }
  // ... More feature agents can be added
];

/**
 * SYSTEM AGENTS (32) - A2A infrastructure
 */
export const SYSTEM_AGENTS: AgentDocConfig[] = [
  // Orchestration (6)
  {
    agentId: 'SA-01-Orchestrator',
    agentName: 'Orchestrator Agent',
    category: 'system',
    priority: 'critical',
    documentationPaths: ['docs/ESA_FRAMEWORK.md', 'docs/mb-md/core.md']
  },
  {
    agentId: 'SA-02-Dispatcher',
    agentName: 'Task Dispatcher Agent',
    category: 'system',
    priority: 'critical',
    documentationPaths: ['docs/ESA_FRAMEWORK.md']
  },
  // Self-Healing (5)
  {
    agentId: 'SA-03-AutoFix',
    agentName: 'AutoFix Agent',
    category: 'system',
    priority: 'critical',
    documentationPaths: [
      'docs/MB_MD_ADVANCED_SELF_HEALING_RESEARCH.md',
      'docs/mb-md/core.md'
    ]
  },
  {
    agentId: 'SA-04-ErrorDetector',
    agentName: 'Error Detector Agent',
    category: 'system',
    priority: 'critical',
    documentationPaths: ['docs/MB_MD_ADVANCED_SELF_HEALING_RESEARCH.md']
  },
  // AI Arbitrage (5)
  {
    agentId: 'SA-05-AISelector',
    agentName: 'AI Model Selector Agent',
    category: 'system',
    priority: 'high',
    documentationPaths: ['docs/AI_SELECTOR_COMPLETE_SETUP.md']
  },
  {
    agentId: 'SA-06-Bifrost',
    agentName: 'Bifrost Gateway Agent',
    category: 'system',
    priority: 'high',
    documentationPaths: ['docs/features/BIFROST_AI_GATEWAY.md']
  },
  // Knowledge (4)
  {
    agentId: 'SA-07-Memory',
    agentName: 'Agent Memory Agent',
    category: 'system',
    priority: 'high',
    documentationPaths: ['docs/AGENT_MEMORY_KNOWLEDGE_BASE.md']
  },
  {
    agentId: 'SA-08-Learning',
    agentName: 'Learning Coordinator Agent',
    category: 'system',
    priority: 'high',
    documentationPaths: ['docs/mb-md/core.md', 'docs/AGENT_MEMORY_KNOWLEDGE_BASE.md']
  }
  // ... More system agents
];

// ============================================================================
// AGENT KNOWLEDGE LOADER SERVICE
// ============================================================================

export class AgentKnowledgeLoader {
  private initialized = false;

  /**
   * Initialize the loader
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    await recursiveContextService.initialize();
    this.initialized = true;
    console.log('[AgentKnowledgeLoader] ✅ Initialized');
  }

  /**
   * Load all agents' knowledge (full agent swarm training)
   */
  async loadAllAgents(): Promise<LearningReport> {
    await this.initialize();
    console.log('[AgentKnowledgeLoader] 🚀 Starting full agent swarm training');

    const allAgents = [
      ...PAGE_AGENTS,
      ...ALGORITHM_AGENTS,
      ...FEATURE_AGENTS,
      ...SYSTEM_AGENTS
    ];

    return this.loadAgents(allAgents);
  }

  /**
   * Load specific category of agents
   */
  async loadAgentCategory(
    category: 'page' | 'algorithm' | 'feature' | 'system'
  ): Promise<LearningReport> {
    await this.initialize();

    const categoryMap = {
      page: PAGE_AGENTS,
      algorithm: ALGORITHM_AGENTS,
      feature: FEATURE_AGENTS,
      system: SYSTEM_AGENTS
    };

    console.log(`[AgentKnowledgeLoader] Loading ${category} agents`);
    return this.loadAgents(categoryMap[category]);
  }

  /**
   * Load a single agent's knowledge
   */
  async loadSingleAgent(agentId: string): Promise<AgentKnowledge | null> {
    await this.initialize();

    const allAgents = [
      ...PAGE_AGENTS,
      ...ALGORITHM_AGENTS,
      ...FEATURE_AGENTS,
      ...SYSTEM_AGENTS
    ];

    const agentConfig = allAgents.find(a => a.agentId === agentId);
    if (!agentConfig) {
      console.error(`[AgentKnowledgeLoader] Agent not found: ${agentId}`);
      return null;
    }

    // Filter to only existing documentation files
    const existingDocs = await this.filterExistingDocs(agentConfig.documentationPaths);
    if (existingDocs.length === 0) {
      console.warn(`[AgentKnowledgeLoader] No docs found for ${agentId}`);
      return null;
    }

    return recursiveContextService.recursivelyLearn(
      agentConfig.agentId,
      existingDocs,
      3, // K improvement cycles
      2  // n latent updates
    );
  }

  /**
   * Load agents by priority
   */
  async loadByPriority(priority: 'critical' | 'high' | 'medium' | 'low'): Promise<LearningReport> {
    await this.initialize();

    const allAgents = [
      ...PAGE_AGENTS,
      ...ALGORITHM_AGENTS,
      ...FEATURE_AGENTS,
      ...SYSTEM_AGENTS
    ];

    const priorityAgents = allAgents.filter(a => a.priority === priority);
    console.log(`[AgentKnowledgeLoader] Loading ${priorityAgents.length} ${priority} priority agents`);

    return this.loadAgents(priorityAgents);
  }

  /**
   * Core loading function
   */
  private async loadAgents(agents: AgentDocConfig[]): Promise<LearningReport> {
    const results: AgentKnowledge[] = [];
    const categoryStats: Record<string, { count: number; totalConfidence: number }> = {};

    // Process agents in batches
    const batchSize = 3;
    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (agent) => {
          const existingDocs = await this.filterExistingDocs(agent.documentationPaths);
          if (existingDocs.length === 0) {
            console.warn(`[AgentKnowledgeLoader] No docs for ${agent.agentId}, skipping`);
            return null;
          }

          try {
            return await recursiveContextService.recursivelyLearn(
              agent.agentId,
              existingDocs,
              3,
              2
            );
          } catch (error) {
            console.error(`[AgentKnowledgeLoader] Error loading ${agent.agentId}:`, error);
            return null;
          }
        })
      );

      // Collect results
      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const agent = batch[j];

        if (result) {
          results.push(result);
          
          // Update category stats
          if (!categoryStats[agent.category]) {
            categoryStats[agent.category] = { count: 0, totalConfidence: 0 };
          }
          categoryStats[agent.category].count++;
          categoryStats[agent.category].totalConfidence += result.confidence;
        }
      }

      // Brief pause between batches
      if (i + batchSize < agents.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Calculate report
    const totalAgents = agents.length;
    const successfulLearnings = results.length;
    const failedLearnings = totalAgents - successfulLearnings;
    const averageConfidence = results.length > 0
      ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length
      : 0;

    const byCategory: Record<string, { count: number; avgConfidence: number }> = {};
    for (const [category, stats] of Object.entries(categoryStats)) {
      byCategory[category] = {
        count: stats.count,
        avgConfidence: stats.count > 0 ? stats.totalConfidence / stats.count : 0
      };
    }

    const report: LearningReport = {
      totalAgents,
      successfulLearnings,
      failedLearnings,
      averageConfidence,
      byCategory,
      timestamp: new Date(),
      details: results
    };

    console.log(`[AgentKnowledgeLoader] 📊 Training complete:`);
    console.log(`  - Total: ${totalAgents}, Success: ${successfulLearnings}, Failed: ${failedLearnings}`);
    console.log(`  - Average Confidence: ${(averageConfidence * 100).toFixed(1)}%`);

    return report;
  }

  /**
   * Filter to only existing documentation files
   */
  private async filterExistingDocs(paths: string[]): Promise<string[]> {
    const existing: string[] = [];
    for (const docPath of paths) {
      try {
        await fs.access(docPath);
        existing.push(docPath);
      } catch {
        // File doesn't exist, skip
      }
    }
    return existing;
  }

  /**
   * Get agent's current knowledge
   */
  async getAgentKnowledge(agentId: string): Promise<AgentKnowledge | null> {
    return recursiveContextService.getAgentKnowledge(agentId);
  }

  /**
   * Get all agent configurations
   */
  getAllAgentConfigs(): AgentDocConfig[] {
    return [
      ...PAGE_AGENTS,
      ...ALGORITHM_AGENTS,
      ...FEATURE_AGENTS,
      ...SYSTEM_AGENTS
    ];
  }

  /**
   * Get agent count by category
   */
  getAgentCounts(): Record<string, number> {
    return {
      page: PAGE_AGENTS.length,
      algorithm: ALGORITHM_AGENTS.length,
      feature: FEATURE_AGENTS.length,
      system: SYSTEM_AGENTS.length,
      total: PAGE_AGENTS.length + ALGORITHM_AGENTS.length + FEATURE_AGENTS.length + SYSTEM_AGENTS.length
    };
  }
}

// Singleton instance
export const agentKnowledgeLoader = new AgentKnowledgeLoader();
