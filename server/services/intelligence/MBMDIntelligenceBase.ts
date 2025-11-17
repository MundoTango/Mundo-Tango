/**
 * MB-MD Intelligence Base - Central Knowledge Storage
 * LanceDB vector storage for agent learnings and knowledge
 * 
 * Features:
 * - Store all agent knowledge in vector database
 * - Semantic search across agent learnings
 * - Cross-agent pattern detection
 * - Knowledge deduplication
 * - Confidence scoring
 * - Historical tracking
 */

import { lanceDB } from '../../lib/lancedb';
import OpenAI from 'openai';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AgentKnowledge {
  agentId: string;
  agentType: string; // 'ESA' | 'LifeCEO' | 'MrBlue' | 'Algorithm' | 'Financial' | 'Marketplace'
  knowledge: {
    facts: string[];
    patterns: string[];
    improvements: string[];
    risks: string[];
    opportunities: string[];
  };
  confidence: number; // 0-1
  timestamp: Date;
  source: string; // Where knowledge came from
  metadata?: {
    page?: string;
    component?: string;
    userId?: number;
    sessionId?: string;
    [key: string]: any;
  };
}

export interface KnowledgeEntry {
  id?: string;
  agentId: string;
  agentType: string;
  category: 'fact' | 'pattern' | 'improvement' | 'risk' | 'opportunity';
  content: string;
  confidence: number;
  timestamp: number;
  source: string;
  metadata?: any;
  embedding?: number[];
}

export interface ConflictDetection {
  entries: KnowledgeEntry[];
  conflictType: 'contradiction' | 'overlap' | 'outdated';
  severity: 'low' | 'medium' | 'high';
  resolution?: string;
}

export interface PatternMatch {
  pattern: string;
  agentsReporting: string[];
  frequency: number;
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
}

// ============================================================================
// MB-MD INTELLIGENCE BASE SERVICE
// ============================================================================

export class MBMDIntelligenceBase {
  private serviceName = 'MBMDIntelligenceBase';
  private readonly KNOWLEDGE_TABLE = 'mbmd_agent_knowledge';
  private readonly PATTERNS_TABLE = 'mbmd_agent_patterns';
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.BIFROST_BASE_URL || undefined,
      });
    }
  }

  /**
   * Initialize intelligence base and LanceDB tables
   */
  async initialize(): Promise<void> {
    console.log(`[${this.serviceName}] Initializing intelligence base...`);
    try {
      await lanceDB.initialize();
      console.log(`[${this.serviceName}] ✅ Intelligence base ready`);
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Initialization failed:`, error);
      throw error;
    }
  }

  // ==========================================================================
  // 1. STORE AGENT KNOWLEDGE
  // ==========================================================================

  /**
   * Store knowledge from a single agent
   */
  async storeAgentKnowledge(knowledge: AgentKnowledge): Promise<void> {
    console.log(`[${this.serviceName}] 📝 Storing knowledge from ${knowledge.agentId}...`);
    
    try {
      // Convert knowledge into individual entries for better searchability
      const entries: KnowledgeEntry[] = [];

      // Add facts
      for (const fact of knowledge.knowledge.facts) {
        entries.push({
          agentId: knowledge.agentId,
          agentType: knowledge.agentType,
          category: 'fact',
          content: fact,
          confidence: knowledge.confidence,
          timestamp: knowledge.timestamp.getTime(),
          source: knowledge.source,
          metadata: knowledge.metadata,
        });
      }

      // Add patterns
      for (const pattern of knowledge.knowledge.patterns) {
        entries.push({
          agentId: knowledge.agentId,
          agentType: knowledge.agentType,
          category: 'pattern',
          content: pattern,
          confidence: knowledge.confidence,
          timestamp: knowledge.timestamp.getTime(),
          source: knowledge.source,
          metadata: knowledge.metadata,
        });
      }

      // Add improvements
      for (const improvement of knowledge.knowledge.improvements) {
        entries.push({
          agentId: knowledge.agentId,
          agentType: knowledge.agentType,
          category: 'improvement',
          content: improvement,
          confidence: knowledge.confidence,
          timestamp: knowledge.timestamp.getTime(),
          source: knowledge.source,
          metadata: knowledge.metadata,
        });
      }

      // Add risks
      for (const risk of knowledge.knowledge.risks) {
        entries.push({
          agentId: knowledge.agentId,
          agentType: knowledge.agentType,
          category: 'risk',
          content: risk,
          confidence: knowledge.confidence,
          timestamp: knowledge.timestamp.getTime(),
          source: knowledge.source,
          metadata: knowledge.metadata,
        });
      }

      // Add opportunities
      for (const opportunity of knowledge.knowledge.opportunities) {
        entries.push({
          agentId: knowledge.agentId,
          agentType: knowledge.agentType,
          category: 'opportunity',
          content: opportunity,
          confidence: knowledge.confidence,
          timestamp: knowledge.timestamp.getTime(),
          source: knowledge.source,
          metadata: knowledge.metadata,
        });
      }

      // Check for duplicates before storing
      const dedupedEntries = await this.deduplicateEntries(entries);
      
      // Store in LanceDB
      if (dedupedEntries.length > 0) {
        await lanceDB.addMemories(this.KNOWLEDGE_TABLE, dedupedEntries);
        console.log(`[${this.serviceName}] ✅ Stored ${dedupedEntries.length} knowledge entries from ${knowledge.agentId}`);
      } else {
        console.log(`[${this.serviceName}] ℹ️ No new knowledge to store (all duplicates)`);
      }
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Failed to store knowledge:`, error);
      throw error;
    }
  }

  /**
   * Store knowledge from multiple agents in batch
   */
  async storeBatchKnowledge(knowledgeArray: AgentKnowledge[]): Promise<void> {
    console.log(`[${this.serviceName}] 📦 Batch storing knowledge from ${knowledgeArray.length} agents...`);
    
    const results = await Promise.allSettled(
      knowledgeArray.map(k => this.storeAgentKnowledge(k))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`[${this.serviceName}] ✅ Batch complete: ${successful} successful, ${failed} failed`);
  }

  // ==========================================================================
  // 2. SEARCH & RETRIEVE KNOWLEDGE
  // ==========================================================================

  /**
   * Search for knowledge across all agents using semantic search
   */
  async searchKnowledge(
    query: string,
    options?: {
      agentId?: string;
      agentType?: string;
      category?: string;
      minConfidence?: number;
      limit?: number;
    }
  ): Promise<KnowledgeEntry[]> {
    console.log(`[${this.serviceName}] 🔍 Searching knowledge: "${query}"`);
    
    try {
      const filters: Record<string, any> = {};
      
      if (options?.agentId) {
        filters.agentId = options.agentId;
      }
      if (options?.agentType) {
        filters.agentType = options.agentType;
      }
      if (options?.category) {
        filters.category = options.category;
      }

      const results = await lanceDB.searchMemories(
        this.KNOWLEDGE_TABLE,
        query,
        options?.limit || 10,
        filters
      );

      // Filter by confidence if specified
      let filtered = results;
      if (options?.minConfidence) {
        filtered = results.filter((r: any) => r.confidence >= options.minConfidence!);
      }

      console.log(`[${this.serviceName}] ✅ Found ${filtered.length} knowledge entries`);
      return filtered as KnowledgeEntry[];
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Search failed:`, error);
      return [];
    }
  }

  /**
   * Get all knowledge from a specific agent
   */
  async getAgentKnowledge(agentId: string): Promise<KnowledgeEntry[]> {
    console.log(`[${this.serviceName}] 📋 Getting all knowledge from ${agentId}...`);
    
    try {
      const results = await lanceDB.getAllMemories(
        this.KNOWLEDGE_TABLE,
        { agentId },
        1000
      );

      console.log(`[${this.serviceName}] ✅ Retrieved ${results.length} entries for ${agentId}`);
      return results as KnowledgeEntry[];
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Failed to get agent knowledge:`, error);
      return [];
    }
  }

  /**
   * Get knowledge by category across all agents
   */
  async getKnowledgeByCategory(category: string): Promise<KnowledgeEntry[]> {
    console.log(`[${this.serviceName}] 📂 Getting ${category} knowledge...`);
    
    try {
      const results = await lanceDB.getAllMemories(
        this.KNOWLEDGE_TABLE,
        { category },
        1000
      );

      console.log(`[${this.serviceName}] ✅ Retrieved ${results.length} ${category} entries`);
      return results as KnowledgeEntry[];
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Failed to get category knowledge:`, error);
      return [];
    }
  }

  // ==========================================================================
  // 3. PATTERN DETECTION
  // ==========================================================================

  /**
   * Detect patterns across multiple agents
   */
  async detectCrossAgentPatterns(): Promise<PatternMatch[]> {
    console.log(`[${this.serviceName}] 🔍 Detecting cross-agent patterns...`);
    
    try {
      // Get all pattern entries
      const patterns = await this.getKnowledgeByCategory('pattern');
      
      // Group similar patterns using AI
      const groupedPatterns = await this.groupSimilarPatterns(patterns);
      
      console.log(`[${this.serviceName}] ✅ Detected ${groupedPatterns.length} cross-agent patterns`);
      return groupedPatterns;
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Pattern detection failed:`, error);
      return [];
    }
  }

  /**
   * Group similar patterns using semantic similarity
   */
  private async groupSimilarPatterns(patterns: KnowledgeEntry[]): Promise<PatternMatch[]> {
    const matches: PatternMatch[] = [];
    const processed = new Set<string>();

    for (const pattern of patterns) {
      if (processed.has(pattern.id || '')) continue;

      // Find similar patterns
      const similar = await lanceDB.searchMemories(
        this.KNOWLEDGE_TABLE,
        pattern.content,
        20,
        { category: 'pattern' }
      );

      // Filter for high similarity (>0.8)
      const highSimilarity = similar.filter((s: any) => 
        s.similarity > 0.8 && s.id !== pattern.id
      );

      if (highSimilarity.length > 0) {
        const agentsReporting = [pattern.agentId, ...highSimilarity.map((s: any) => s.agentId)];
        const uniqueAgents = [...new Set(agentsReporting)];

        matches.push({
          pattern: pattern.content,
          agentsReporting: uniqueAgents,
          frequency: uniqueAgents.length,
          confidence: pattern.confidence,
          firstSeen: new Date(pattern.timestamp),
          lastSeen: new Date(Math.max(...[pattern, ...highSimilarity].map((p: any) => p.timestamp))),
        });

        // Mark as processed
        processed.add(pattern.id || '');
        highSimilarity.forEach((s: any) => processed.add(s.id));
      }
    }

    return matches.sort((a, b) => b.frequency - a.frequency);
  }

  // ==========================================================================
  // 4. CONFLICT DETECTION
  // ==========================================================================

  /**
   * Detect conflicts between agent knowledge
   */
  async detectConflicts(): Promise<ConflictDetection[]> {
    console.log(`[${this.serviceName}] ⚠️ Detecting knowledge conflicts...`);
    
    const conflicts: ConflictDetection[] = [];
    
    try {
      // Get all facts
      const facts = await this.getKnowledgeByCategory('fact');
      
      // Use AI to detect contradictions
      if (this.openai && facts.length > 1) {
        const conflictGroups = await this.detectContradictions(facts);
        conflicts.push(...conflictGroups);
      }

      console.log(`[${this.serviceName}] ✅ Detected ${conflicts.length} conflicts`);
      return conflicts;
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Conflict detection failed:`, error);
      return [];
    }
  }

  /**
   * Use AI to detect contradictions in facts
   */
  private async detectContradictions(facts: KnowledgeEntry[]): Promise<ConflictDetection[]> {
    const conflicts: ConflictDetection[] = [];

    // Sample facts for AI analysis (to avoid token limits)
    const sampleSize = Math.min(facts.length, 50);
    const sampled = facts.slice(0, sampleSize);

    try {
      if (!this.openai) {
        return conflicts;
      }

      const prompt = `Analyze the following facts from different AI agents and identify any contradictions:

${sampled.map((f, i) => `${i + 1}. [${f.agentId}] ${f.content}`).join('\n')}

Return a JSON array of conflicts with format:
[
  {
    "indices": [1, 5],
    "conflictType": "contradiction",
    "severity": "high",
    "explanation": "Agent A says X but Agent B says Y"
  }
]

Only include actual contradictions, not just different perspectives.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert at detecting logical contradictions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || '[]';
      const detected = JSON.parse(content);

      for (const conflict of detected) {
        conflicts.push({
          entries: conflict.indices.map((i: number) => sampled[i - 1]),
          conflictType: conflict.conflictType,
          severity: conflict.severity,
          resolution: conflict.explanation,
        });
      }
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ AI contradiction detection failed:`, error);
    }

    return conflicts;
  }

  // ==========================================================================
  // 5. DEDUPLICATION
  // ==========================================================================

  /**
   * Deduplicate knowledge entries before storing
   */
  private async deduplicateEntries(entries: KnowledgeEntry[]): Promise<KnowledgeEntry[]> {
    const deduped: KnowledgeEntry[] = [];

    for (const entry of entries) {
      // Search for similar existing entries
      const similar = await lanceDB.searchMemories(
        this.KNOWLEDGE_TABLE,
        entry.content,
        1,
        {
          agentId: entry.agentId,
          category: entry.category,
        }
      );

      // If very similar entry exists (>0.95 similarity), skip
      if (similar.length > 0 && (similar[0] as any).similarity > 0.95) {
        console.log(`[${this.serviceName}] 🔄 Skipping duplicate entry from ${entry.agentId}`);
        continue;
      }

      deduped.push(entry);
    }

    return deduped;
  }

  // ==========================================================================
  // 6. ANALYTICS
  // ==========================================================================

  /**
   * Get intelligence base statistics
   */
  async getStatistics(): Promise<{
    totalEntries: number;
    byCategory: Record<string, number>;
    byAgentType: Record<string, number>;
    topAgents: Array<{ agentId: string; count: number }>;
    avgConfidence: number;
    recentActivity: number;
  }> {
    console.log(`[${this.serviceName}] 📊 Getting statistics...`);
    
    try {
      const stats = await lanceDB.getTableStats(this.KNOWLEDGE_TABLE);
      const allEntries = await lanceDB.getAllMemories(this.KNOWLEDGE_TABLE, {}, 10000);

      // Count by category
      const byCategory: Record<string, number> = {};
      const byAgentType: Record<string, number> = {};
      const agentCounts: Record<string, number> = {};
      let totalConfidence = 0;
      let recentCount = 0;
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      for (const entry of allEntries) {
        const e = entry as any;
        
        byCategory[e.category] = (byCategory[e.category] || 0) + 1;
        byAgentType[e.agentType] = (byAgentType[e.agentType] || 0) + 1;
        agentCounts[e.agentId] = (agentCounts[e.agentId] || 0) + 1;
        totalConfidence += e.confidence || 0;
        
        if (e.timestamp > oneDayAgo) {
          recentCount++;
        }
      }

      const topAgents = Object.entries(agentCounts)
        .map(([agentId, count]) => ({ agentId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalEntries: stats.recordCount,
        byCategory,
        byAgentType,
        topAgents,
        avgConfidence: allEntries.length > 0 ? totalConfidence / allEntries.length : 0,
        recentActivity: recentCount,
      };
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Failed to get statistics:`, error);
      return {
        totalEntries: 0,
        byCategory: {},
        byAgentType: {},
        topAgents: [],
        avgConfidence: 0,
        recentActivity: 0,
      };
    }
  }

  /**
   * Clear all knowledge (use with caution!)
   */
  async clearAllKnowledge(): Promise<void> {
    console.log(`[${this.serviceName}] 🗑️ Clearing all knowledge...`);
    
    try {
      await lanceDB.clearTable(this.KNOWLEDGE_TABLE);
      console.log(`[${this.serviceName}] ✅ All knowledge cleared`);
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Failed to clear knowledge:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const intelligenceBase = new MBMDIntelligenceBase();
