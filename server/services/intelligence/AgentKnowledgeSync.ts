/**
 * Agent Knowledge Sync - Main Rollup Coordinator
 * Syncs knowledge across all 62+ agents in the system
 * 
 * Features:
 * - Collect knowledge from all agents
 * - Merge and deduplicate learnings
 * - Detect conflicts between agents
 * - Resolve via AI consensus
 * - Update central intelligence base
 * - Sync back to all agents
 * 
 * Trigger Points:
 * - On new information discovered
 * - On page completion
 * - On critical events
 * - Manual trigger via API
 */

import { intelligenceBase, AgentKnowledge } from './MBMDIntelligenceBase';
import { AgentMemoryService } from '../memory/agentMemoryService';
import { AgentCollaborationService } from '../collaboration/agentCollaborationService';
import { a2aProtocol } from '../communication/a2aProtocol';
import OpenAI from 'openai';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RollupTrigger {
  type: 'discovery' | 'page_completion' | 'critical_event' | 'manual';
  source: string;
  metadata?: {
    page?: string;
    userId?: number;
    event?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    [key: string]: any;
  };
}

export interface RollupResult {
  triggeredAt: Date;
  completedAt: Date;
  agentsProcessed: number;
  knowledgeCollected: number;
  conflictsDetected: number;
  conflictsResolved: number;
  patternsFound: number;
  syncedToAgents: number;
  duration: number; // ms
  summary: string;
  errors?: string[];
}

export interface AgentSnapshot {
  agentId: string;
  agentType: string;
  lastActive?: Date;
  knowledgeCount: number;
  recentLearnings: string[];
}

export interface ConflictResolution {
  conflict: any;
  resolution: string;
  reasoning: string;
  confidence: number;
  consensusAgents: string[];
}

// ============================================================================
// AGENT KNOWLEDGE SYNC SERVICE
// ============================================================================

export class AgentKnowledgeSync {
  private serviceName = 'AgentKnowledgeSync';
  private memoryService: AgentMemoryService;
  private collaborationService: AgentCollaborationService;
  private openai: OpenAI | null = null;
  
  // Track rollup status
  private isRollupInProgress = false;
  private lastRollupTime: Date | null = null;
  
  // Known agent registry (62+ agents)
  private readonly AGENT_REGISTRY = [
    // ESA Agents (Agent #0 - #104)
    'AGENT_0', 'AGENT_1', 'AGENT_2', 'AGENT_3', 'AGENT_4', 'AGENT_5', 'AGENT_6',
    'AGENT_7', 'AGENT_8', 'AGENT_9', 'AGENT_10', 'AGENT_11', 'AGENT_12', 'AGENT_13',
    'AGENT_14', 'AGENT_15', 'AGENT_16', 'AGENT_17', 'AGENT_18', 'AGENT_19', 'AGENT_20',
    'AGENT_21', 'AGENT_22', 'AGENT_23', 'AGENT_24', 'AGENT_25', 'AGENT_26', 'AGENT_27',
    'AGENT_28', 'AGENT_29', 'AGENT_30', 'AGENT_31', 'AGENT_32', 'AGENT_33', 'AGENT_34',
    'AGENT_35', 'AGENT_36', 'AGENT_37', 'AGENT_38', 'AGENT_39', 'AGENT_40', 'AGENT_41',
    'AGENT_42', 'AGENT_43', 'AGENT_44', 'AGENT_45', 'AGENT_46', 'AGENT_47', 'AGENT_48',
    'AGENT_49', 'AGENT_50', 'AGENT_51', 'AGENT_52', 'AGENT_53', 'AGENT_54', 'AGENT_55',
    'AGENT_56', 'AGENT_57', 'AGENT_58', 'AGENT_59', 'AGENT_60', 'AGENT_61', 'AGENT_62',
    'AGENT_63', 'AGENT_64', 'AGENT_65', 'AGENT_66', 'AGENT_67', 'AGENT_68', 'AGENT_69',
    'AGENT_70', 'AGENT_71', 'AGENT_72',
    
    // Mr Blue Agents (Agent #73-80)
    'Agent #73', 'Agent #74', 'Agent #75', 'Agent #76', 'Agent #77', 'Agent #78',
    'Agent #79', 'Agent #80',
    
    // Life CEO Agents
    'LifeCEO_Career', 'LifeCEO_Health', 'LifeCEO_Relationships', 'LifeCEO_Finance',
    'LifeCEO_Learning', 'LifeCEO_Wellness', 'LifeCEO_Goals', 'LifeCEO_Habits',
    'LifeCEO_Time', 'LifeCEO_Energy', 'LifeCEO_Focus', 'LifeCEO_Growth',
    'LifeCEO_Balance', 'LifeCEO_Mindfulness', 'LifeCEO_Purpose', 'LifeCEO_Legacy',
    
    // Financial Agents (Agent #105+)
    'Agent105_MasterOrchestrator', 'Agent73_CapitalManager', 'Agent74_TaxOptimizer',
    'Agent75_FeeMinimizer', 'Agent76_SlippageAnalyzer', 'Agent77_LatencyMonitor',
    'Agent78_DataQualityChecker', 'Agent79_BackupSystem', 'Agent80_EmergencyShutdown',
    'Agent102_PerformanceMonitor', 'Agent103_AlertGenerator', 'Agent104_ReportGenerator',
    
    // Marketplace Agents
    'ReviewAnalyzer', 'QualityAssurance', 'TransactionMonitor', 'SellerSupport',
    'DynamicPricing', 'InventoryManager', 'FraudDetection',
    
    // Crowdfunding Agents
    'FraudDetection', 'DonorEngagement', 'CampaignOptimizer', 'CampaignPredictor',
    
    // User Testing Agents
    'UxPattern', 'BugDetector', 'LiveObserver', 'SessionScheduler',
    
    // Mr Blue Specialized
    'ErrorAnalysis', 'SolutionSuggester', 'Subscription', 'TourGuide',
    'Avatar', 'RoleAdapter', 'QualityValidator',
  ];

  constructor() {
    this.memoryService = new AgentMemoryService();
    this.collaborationService = new AgentCollaborationService();
    
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.BIFROST_BASE_URL || undefined,
      });
    }
  }

  /**
   * Initialize the sync service
   */
  async initialize(): Promise<void> {
    console.log(`[${this.serviceName}] Initializing...`);
    try {
      await intelligenceBase.initialize();
      await this.memoryService.initialize();
      console.log(`[${this.serviceName}] ✅ Sync service ready`);
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Initialization failed:`, error);
      throw error;
    }
  }

  // ==========================================================================
  // 1. TRIGGER ROLLUP
  // ==========================================================================

  /**
   * Trigger a knowledge rollup across all agents
   */
  async triggerRollup(trigger: RollupTrigger): Promise<RollupResult> {
    console.log(`[${this.serviceName}] 🚀 ROLLUP TRIGGERED: ${trigger.type} from ${trigger.source}`);
    
    if (this.isRollupInProgress) {
      throw new Error('Rollup already in progress');
    }

    const startTime = Date.now();
    const result: RollupResult = {
      triggeredAt: new Date(),
      completedAt: new Date(),
      agentsProcessed: 0,
      knowledgeCollected: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      patternsFound: 0,
      syncedToAgents: 0,
      duration: 0,
      summary: '',
      errors: [],
    };

    try {
      this.isRollupInProgress = true;

      // Step 1: Collect knowledge from all agents
      console.log(`[${this.serviceName}] 📥 Step 1: Collecting knowledge from all agents...`);
      const knowledgeCollection = await this.collectAllAgentKnowledge();
      result.agentsProcessed = knowledgeCollection.length;
      result.knowledgeCollected = knowledgeCollection.reduce(
        (sum, k) => sum + this.countKnowledgeItems(k), 0
      );

      // Step 2: Merge and deduplicate
      console.log(`[${this.serviceName}] 🔄 Step 2: Merging and deduplicating...`);
      await intelligenceBase.storeBatchKnowledge(knowledgeCollection);

      // Step 3: Detect conflicts
      console.log(`[${this.serviceName}] ⚠️ Step 3: Detecting conflicts...`);
      const conflicts = await intelligenceBase.detectConflicts();
      result.conflictsDetected = conflicts.length;

      // Step 4: Resolve conflicts via AI consensus
      if (conflicts.length > 0) {
        console.log(`[${this.serviceName}] 🤝 Step 4: Resolving ${conflicts.length} conflicts...`);
        const resolutions = await this.resolveConflicts(conflicts);
        result.conflictsResolved = resolutions.filter(r => r.resolution).length;
      }

      // Step 5: Detect cross-agent patterns
      console.log(`[${this.serviceName}] 🔍 Step 5: Detecting cross-agent patterns...`);
      const patterns = await intelligenceBase.detectCrossAgentPatterns();
      result.patternsFound = patterns.length;

      // Step 6: Sync knowledge back to agents
      console.log(`[${this.serviceName}] 📤 Step 6: Syncing knowledge back to agents...`);
      const syncCount = await this.syncKnowledgeToAgents(patterns);
      result.syncedToAgents = syncCount;

      // Calculate duration
      result.completedAt = new Date();
      result.duration = Date.now() - startTime;

      // Generate summary
      result.summary = this.generateRollupSummary(result, patterns);

      console.log(`[${this.serviceName}] ✅ ROLLUP COMPLETE in ${result.duration}ms`);
      console.log(`[${this.serviceName}] Summary:\n${result.summary}`);

      this.lastRollupTime = new Date();
      
      return result;
    } catch (error: any) {
      console.error(`[${this.serviceName}] ❌ Rollup failed:`, error);
      result.errors = [error.message];
      return result;
    } finally {
      this.isRollupInProgress = false;
    }
  }

  // ==========================================================================
  // 2. COLLECT KNOWLEDGE
  // ==========================================================================

  /**
   * Collect knowledge from all registered agents
   */
  private async collectAllAgentKnowledge(): Promise<AgentKnowledge[]> {
    const knowledgeCollection: AgentKnowledge[] = [];
    
    for (const agentId of this.AGENT_REGISTRY) {
      try {
        const knowledge = await this.collectAgentKnowledge(agentId);
        if (knowledge) {
          knowledgeCollection.push(knowledge);
        }
      } catch (error) {
        console.error(`[${this.serviceName}] ⚠️ Failed to collect from ${agentId}:`, error);
      }
    }

    console.log(`[${this.serviceName}] ✅ Collected knowledge from ${knowledgeCollection.length} agents`);
    return knowledgeCollection;
  }

  /**
   * Collect knowledge from a single agent
   */
  private async collectAgentKnowledge(agentId: string): Promise<AgentKnowledge | null> {
    try {
      // Get recent memories from agent
      const memories = await this.memoryService.getMemoriesByAgent(agentId, { limit: 50 });
      
      if (memories.length === 0) {
        return null;
      }

      // Determine agent type
      const agentType = this.determineAgentType(agentId);

      // Extract knowledge from memories
      const knowledge = await this.extractKnowledgeFromMemories(agentId, memories);

      return {
        agentId,
        agentType,
        knowledge,
        confidence: this.calculateConfidence(memories),
        timestamp: new Date(),
        source: 'memory_extraction',
        metadata: {
          memoryCount: memories.length,
          extractedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error(`[${this.serviceName}] Error collecting from ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Extract structured knowledge from raw memories
   */
  private async extractKnowledgeFromMemories(
    agentId: string,
    memories: any[]
  ): Promise<AgentKnowledge['knowledge']> {
    const knowledge = {
      facts: [] as string[],
      patterns: [] as string[],
      improvements: [] as string[],
      risks: [] as string[],
      opportunities: [] as string[],
    };

    // Use AI to categorize and extract knowledge
    if (this.openai && memories.length > 0) {
      try {
        const memorySample = memories.slice(0, 20).map(m => m.content).join('\n');
        
        const prompt = `Analyze these agent memories and extract structured knowledge:

Agent: ${agentId}
Memories:
${memorySample}

Extract:
1. Facts: Clear, verifiable statements
2. Patterns: Recurring behaviors or trends
3. Improvements: Suggested optimizations
4. Risks: Potential issues or concerns
5. Opportunities: Areas for enhancement

Return JSON:
{
  "facts": ["fact1", "fact2"],
  "patterns": ["pattern1"],
  "improvements": ["improvement1"],
  "risks": ["risk1"],
  "opportunities": ["opportunity1"]
}`;

        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You extract structured knowledge from agent memories.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
        });

        const extracted = JSON.parse(response.choices[0].message.content || '{}');
        return {
          facts: extracted.facts || [],
          patterns: extracted.patterns || [],
          improvements: extracted.improvements || [],
          risks: extracted.risks || [],
          opportunities: extracted.opportunities || [],
        };
      } catch (error) {
        console.error(`[${this.serviceName}] AI extraction failed for ${agentId}:`, error);
      }
    }

    // Fallback: Simple extraction from memory types
    for (const memory of memories) {
      if (memory.memoryType === 'learning') {
        knowledge.facts.push(memory.content);
      } else if (memory.memoryType === 'pattern') {
        knowledge.patterns.push(memory.content);
      } else if (memory.memoryType === 'error') {
        knowledge.risks.push(memory.content);
      } else if (memory.memoryType === 'success') {
        knowledge.opportunities.push(memory.content);
      }
    }

    return knowledge;
  }

  // ==========================================================================
  // 3. CONFLICT RESOLUTION
  // ==========================================================================

  /**
   * Resolve conflicts using AI consensus
   */
  private async resolveConflicts(conflicts: any[]): Promise<ConflictResolution[]> {
    const resolutions: ConflictResolution[] = [];

    for (const conflict of conflicts) {
      try {
        const resolution = await this.resolveConflictWithAI(conflict);
        resolutions.push(resolution);
      } catch (error) {
        console.error(`[${this.serviceName}] Failed to resolve conflict:`, error);
      }
    }

    return resolutions;
  }

  /**
   * Use AI to find consensus resolution for conflict
   */
  private async resolveConflictWithAI(conflict: any): Promise<ConflictResolution> {
    if (!this.openai) {
      return {
        conflict,
        resolution: 'Unable to resolve (no AI available)',
        reasoning: 'AI service not configured',
        confidence: 0,
        consensusAgents: [],
      };
    }

    try {
      const entries = conflict.entries.map((e: any) => 
        `[${e.agentId}] ${e.content}`
      ).join('\n');

      const prompt = `Resolve this conflict between agent knowledge:

Conflict Type: ${conflict.conflictType}
Severity: ${conflict.severity}

Conflicting Statements:
${entries}

Analyze and determine:
1. What is the most accurate/current information?
2. Which agents are correct?
3. What is the consensus resolution?

Return JSON:
{
  "resolution": "The accurate statement",
  "reasoning": "Why this is correct",
  "confidence": 0.9,
  "correctAgents": ["AGENT_1", "AGENT_2"]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You resolve conflicts in agent knowledge using logic and evidence.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        conflict,
        resolution: result.resolution || 'Unable to determine',
        reasoning: result.reasoning || '',
        confidence: result.confidence || 0.5,
        consensusAgents: result.correctAgents || [],
      };
    } catch (error) {
      console.error(`[${this.serviceName}] AI resolution failed:`, error);
      return {
        conflict,
        resolution: 'Resolution failed',
        reasoning: 'AI analysis error',
        confidence: 0,
        consensusAgents: [],
      };
    }
  }

  // ==========================================================================
  // 4. SYNC TO AGENTS
  // ==========================================================================

  /**
   * Sync discovered patterns back to all agents
   */
  private async syncKnowledgeToAgents(patterns: any[]): Promise<number> {
    let syncCount = 0;

    // Get high-confidence patterns (>3 agents reporting)
    const significantPatterns = patterns.filter(p => p.frequency >= 3 && p.confidence > 0.7);

    if (significantPatterns.length === 0) {
      console.log(`[${this.serviceName}] No significant patterns to sync`);
      return 0;
    }

    // Broadcast via A2A protocol
    for (const pattern of significantPatterns) {
      try {
        await a2aProtocol.shareKnowledge({
          from: 'AgentKnowledgeSync',
          knowledgeType: 'best_practice',
          title: 'Cross-Agent Pattern Detected',
          content: pattern.pattern,
          relevantAgents: this.AGENT_REGISTRY,
          tags: ['rollup', 'pattern', 'cross-agent'],
        });
        
        syncCount++;
      } catch (error) {
        console.error(`[${this.serviceName}] Failed to sync pattern:`, error);
      }
    }

    console.log(`[${this.serviceName}] ✅ Synced ${syncCount} patterns to all agents`);
    return syncCount;
  }

  // ==========================================================================
  // 5. UTILITIES
  // ==========================================================================

  /**
   * Determine agent type from ID
   */
  private determineAgentType(agentId: string): string {
    if (agentId.startsWith('AGENT_')) return 'ESA';
    if (agentId.startsWith('Agent #')) return 'MrBlue';
    if (agentId.startsWith('LifeCEO_')) return 'LifeCEO';
    if (agentId.startsWith('Agent1')) return 'Financial';
    if (['ReviewAnalyzer', 'QualityAssurance', 'TransactionMonitor', 'SellerSupport', 
         'DynamicPricing', 'InventoryManager', 'FraudDetection'].includes(agentId)) {
      return 'Marketplace';
    }
    if (['DonorEngagement', 'CampaignOptimizer', 'CampaignPredictor'].includes(agentId)) {
      return 'Crowdfunding';
    }
    if (['UxPattern', 'BugDetector', 'LiveObserver', 'SessionScheduler'].includes(agentId)) {
      return 'UserTesting';
    }
    return 'Unknown';
  }

  /**
   * Calculate overall confidence from memories
   */
  private calculateConfidence(memories: any[]): number {
    if (memories.length === 0) return 0;
    
    const avgConfidence = memories.reduce((sum, m) => sum + (m.confidence || 0.5), 0) / memories.length;
    const recencyBoost = memories[0]?.createdAt ? 0.1 : 0; // Boost if recent
    
    return Math.min(1, avgConfidence + recencyBoost);
  }

  /**
   * Count total knowledge items
   */
  private countKnowledgeItems(knowledge: AgentKnowledge): number {
    return (
      knowledge.knowledge.facts.length +
      knowledge.knowledge.patterns.length +
      knowledge.knowledge.improvements.length +
      knowledge.knowledge.risks.length +
      knowledge.knowledge.opportunities.length
    );
  }

  /**
   * Generate human-readable rollup summary
   */
  private generateRollupSummary(result: RollupResult, patterns: any[]): string {
    const topPatterns = patterns.slice(0, 5).map((p, i) => 
      `${i + 1}. ${p.pattern} (${p.frequency} agents)`
    ).join('\n');

    return `
=== AGENT KNOWLEDGE ROLLUP SUMMARY ===

⏱️  Duration: ${result.duration}ms
🤖 Agents Processed: ${result.agentsProcessed}
📚 Knowledge Collected: ${result.knowledgeCollected} items
⚠️  Conflicts Detected: ${result.conflictsDetected}
✅ Conflicts Resolved: ${result.conflictsResolved}
🔍 Patterns Found: ${result.patternsFound}
📤 Synced to Agents: ${result.syncedToAgents}

Top Cross-Agent Patterns:
${topPatterns || 'None detected'}

Status: ${result.errors && result.errors.length > 0 ? '⚠️ Completed with errors' : '✅ Success'}
`;
  }

  /**
   * Get sync service status
   */
  getStatus(): {
    isRollupInProgress: boolean;
    lastRollupTime: Date | null;
    registeredAgents: number;
  } {
    return {
      isRollupInProgress: this.isRollupInProgress,
      lastRollupTime: this.lastRollupTime,
      registeredAgents: this.AGENT_REGISTRY.length,
    };
  }

  /**
   * Get agent snapshots (for monitoring)
   */
  async getAgentSnapshots(): Promise<AgentSnapshot[]> {
    const snapshots: AgentSnapshot[] = [];

    for (const agentId of this.AGENT_REGISTRY.slice(0, 20)) { // Sample first 20
      try {
        const memories = await this.memoryService.getMemoriesByAgent(agentId, { limit: 10 });
        const knowledge = await intelligenceBase.getAgentKnowledge(agentId);
        
        snapshots.push({
          agentId,
          agentType: this.determineAgentType(agentId),
          lastActive: memories[0]?.createdAt,
          knowledgeCount: knowledge.length,
          recentLearnings: memories.slice(0, 3).map(m => m.content),
        });
      } catch (error) {
        // Skip on error
      }
    }

    return snapshots;
  }
}

// Export singleton instance
export const agentKnowledgeSync = new AgentKnowledgeSync();
