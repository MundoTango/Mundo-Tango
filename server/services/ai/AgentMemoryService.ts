/**
 * MB.MD v9.3: SOAR-Inspired Agent Memory System (Phase 3)
 * 
 * Implements three memory types from SOAR cognitive architecture:
 * 1. Episodic Memory: Past experiences with surprise signals
 * 2. Semantic Memory: Generalized patterns learned from episodes
 * 3. Procedural Memory: Production rules and skills
 * 
 * Key Features:
 * - Chunking: Automatically generalizes patterns from episodes
 * - Mental Simulation: Test rules before applying
 * - Memory Decay: Frequently recalled memories stay fresh
 * - Adaptive Learning: Rules improve via RL-style reward signals
 */

import { db } from "@db";
import { 
  agentEpisodicMemory, 
  agentSemanticMemory, 
  agentProceduralMemory,
  type InsertAgentEpisodicMemory,
  type InsertAgentSemanticMemory,
  type InsertAgentProceduralMemory,
  type SelectAgentEpisodicMemory,
  type SelectAgentSemanticMemory,
  type SelectAgentProceduralMemory
} from "@shared/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";

interface ChunkingConfig {
  minEpisodes: number; // Minimum episodes to generalize
  confidenceThreshold: number; // Minimum confidence to create semantic memory
  similarityThreshold: number; // How similar must episodes be?
}

interface MentalSimulationResult {
  success: boolean;
  confidence: number;
  reasoning: string;
  simulatedOutcome: any;
}

export class AgentMemoryService {
  private static readonly DEFAULT_CHUNKING_CONFIG: ChunkingConfig = {
    minEpisodes: 3,
    confidenceThreshold: 0.6,
    similarityThreshold: 0.7
  };

  // ============================================================================
  // EPISODIC MEMORY: Past Experiences
  // ============================================================================

  /**
   * Record a new episodic memory with surprise signal
   */
  static async recordEpisode(
    agentId: string,
    pageId: string,
    eventType: string,
    context: any,
    outcome: 'success' | 'failure' | 'partial',
    surpriseScore?: number
  ): Promise<SelectAgentEpisodicMemory> {
    const [episode] = await db
      .insert(agentEpisodicMemory)
      .values({
        agentId,
        pageId,
        eventType,
        context,
        outcome,
        surpriseScore: surpriseScore ?? 0.5,
        emotionalValence: outcome === 'success' ? 1.0 : outcome === 'failure' ? -1.0 : 0.0,
        salience: surpriseScore && surpriseScore > 0.7 ? 1.0 : 0.5
      })
      .returning();

    // Trigger chunking if enough episodes exist
    await this.attemptChunking(agentId, eventType);

    return episode;
  }

  /**
   * Recall past episodes (with retrieval tracking)
   */
  static async recallEpisodes(
    agentId: string,
    filters?: {
      pageId?: string;
      eventType?: string;
      minSurprise?: number;
      limit?: number;
    }
  ): Promise<SelectAgentEpisodicMemory[]> {
    let query = db
      .select()
      .from(agentEpisodicMemory)
      .where(eq(agentEpisodicMemory.agentId, agentId));

    if (filters?.pageId) {
      query = query.where(eq(agentEpisodicMemory.pageId, filters.pageId));
    }
    if (filters?.eventType) {
      query = query.where(eq(agentEpisodicMemory.eventType, filters.eventType));
    }
    if (filters?.minSurprise) {
      query = query.where(gte(agentEpisodicMemory.surpriseScore, filters.minSurprise));
    }

    const episodes = await query
      .orderBy(desc(agentEpisodicMemory.timestamp))
      .limit(filters?.limit ?? 50);

    // Update retrieval count for recalled episodes
    const episodeIds = episodes.map(e => e.id);
    if (episodeIds.length > 0) {
      await db
        .update(agentEpisodicMemory)
        .set({ 
          retrievalCount: sql`${agentEpisodicMemory.retrievalCount} + 1`,
          lastRetrievedAt: new Date()
        })
        .where(sql`${agentEpisodicMemory.id} = ANY(${episodeIds})`);
    }

    return episodes;
  }

  // ============================================================================
  // SEMANTIC MEMORY: Generalized Patterns
  // ============================================================================

  /**
   * Chunking: Generalize patterns from similar episodes
   */
  private static async attemptChunking(
    agentId: string,
    eventType: string,
    config: ChunkingConfig = this.DEFAULT_CHUNKING_CONFIG
  ): Promise<void> {
    // Find recent successful episodes of this type
    const recentEpisodes = await db
      .select()
      .from(agentEpisodicMemory)
      .where(
        and(
          eq(agentEpisodicMemory.agentId, agentId),
          eq(agentEpisodicMemory.eventType, eventType),
          eq(agentEpisodicMemory.outcome, 'success')
        )
      )
      .orderBy(desc(agentEpisodicMemory.timestamp))
      .limit(config.minEpisodes * 2);

    if (recentEpisodes.length < config.minEpisodes) {
      return; // Not enough episodes to generalize
    }

    // Extract common patterns (simplified similarity check)
    const patterns = this.extractCommonPatterns(recentEpisodes, config.similarityThreshold);

    for (const pattern of patterns) {
      // Check if semantic memory already exists
      const existing = await db
        .select()
        .from(agentSemanticMemory)
        .where(
          and(
            eq(agentSemanticMemory.agentId, agentId),
            eq(agentSemanticMemory.concept, pattern.concept)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing semantic memory
        await db
          .update(agentSemanticMemory)
          .set({
            confidence: Math.min(existing[0].confidence + 0.1, 0.95),
            learnedFromCount: existing[0].learnedFromCount + pattern.episodeIds.length,
            episodeIds: [...(existing[0].episodeIds || []), ...pattern.episodeIds],
            updatedAt: new Date()
          })
          .where(eq(agentSemanticMemory.id, existing[0].id));
      } else if (pattern.confidence >= config.confidenceThreshold) {
        // Create new semantic memory
        await db
          .insert(agentSemanticMemory)
          .values({
            agentId,
            concept: pattern.concept,
            pattern: pattern.pattern,
            confidence: pattern.confidence,
            learnedFromCount: pattern.episodeIds.length,
            episodeIds: pattern.episodeIds
          });
      }
    }
  }

  /**
   * Extract common patterns from episodes (simplified)
   */
  private static extractCommonPatterns(
    episodes: SelectAgentEpisodicMemory[],
    similarityThreshold: number
  ): Array<{ concept: string; pattern: any; confidence: number; episodeIds: number[] }> {
    const patterns: Array<{ concept: string; pattern: any; confidence: number; episodeIds: number[] }> = [];

    // Group by page_id (simple pattern extraction)
    const pageGroups = new Map<string, SelectAgentEpisodicMemory[]>();
    for (const episode of episodes) {
      const group = pageGroups.get(episode.pageId) || [];
      group.push(episode);
      pageGroups.set(episode.pageId, group);
    }

    // Create patterns for groups with enough episodes
    for (const [pageId, group] of pageGroups) {
      if (group.length >= 3) {
        patterns.push({
          concept: `${group[0].eventType}_pattern_${pageId}`,
          pattern: {
            pageId,
            eventType: group[0].eventType,
            commonContext: this.mergeContexts(group.map(e => e.context))
          },
          confidence: Math.min(group.length / 10, 0.9),
          episodeIds: group.map(e => e.id)
        });
      }
    }

    return patterns;
  }

  private static mergeContexts(contexts: any[]): any {
    // Simplified: return intersection of keys
    if (contexts.length === 0) return {};
    const merged: any = {};
    const firstContext = contexts[0] || {};
    for (const key of Object.keys(firstContext)) {
      if (contexts.every(c => c && key in c)) {
        merged[key] = firstContext[key];
      }
    }
    return merged;
  }

  /**
   * Query semantic memory
   */
  static async querySemanticMemory(
    agentId: string,
    concept?: string,
    minConfidence?: number
  ): Promise<SelectAgentSemanticMemory[]> {
    let query = db
      .select()
      .from(agentSemanticMemory)
      .where(eq(agentSemanticMemory.agentId, agentId));

    if (concept) {
      query = query.where(eq(agentSemanticMemory.concept, concept));
    }
    if (minConfidence) {
      query = query.where(gte(agentSemanticMemory.confidence, minConfidence));
    }

    return await query.orderBy(desc(agentSemanticMemory.confidence));
  }

  // ============================================================================
  // PROCEDURAL MEMORY: Skills and Rules
  // ============================================================================

  /**
   * Create or update a procedural rule
   */
  static async createProceduralRule(
    agentId: string,
    ruleName: string,
    condition: any,
    action: any,
    description?: string
  ): Promise<SelectAgentProceduralMemory> {
    const existing = await db
      .select()
      .from(agentProceduralMemory)
      .where(eq(agentProceduralMemory.ruleName, ruleName))
      .limit(1);

    if (existing.length > 0) {
      // Update existing rule
      const [updated] = await db
        .update(agentProceduralMemory)
        .set({ condition, action, description, updatedAt: new Date() })
        .where(eq(agentProceduralMemory.id, existing[0].id))
        .returning();
      return updated;
    }

    // Create new rule
    const [rule] = await db
      .insert(agentProceduralMemory)
      .values({ agentId, ruleName, condition, action, description })
      .returning();
    return rule;
  }

  /**
   * Mental Simulation: Test rule before applying
   */
  static async mentalSimulation(
    ruleId: number,
    currentState: any
  ): Promise<MentalSimulationResult> {
    const [rule] = await db
      .select()
      .from(agentProceduralMemory)
      .where(eq(agentProceduralMemory.id, ruleId))
      .limit(1);

    if (!rule) {
      return {
        success: false,
        confidence: 0,
        reasoning: 'Rule not found',
        simulatedOutcome: null
      };
    }

    // Simplified simulation: Check if condition matches
    const conditionMatches = this.evaluateCondition(rule.condition, currentState);

    // Update simulation count
    await db
      .update(agentProceduralMemory)
      .set({
        mentalSimulationCount: rule.mentalSimulationCount + 1,
        updatedAt: new Date()
      })
      .where(eq(agentProceduralMemory.id, ruleId));

    return {
      success: conditionMatches,
      confidence: rule.successRate || 0.5,
      reasoning: conditionMatches 
        ? `Condition matches, expected success rate: ${rule.successRate}` 
        : 'Condition does not match current state',
      simulatedOutcome: conditionMatches ? rule.action : null
    };
  }

  private static evaluateCondition(condition: any, state: any): boolean {
    // Simplified: Check if all keys in condition exist in state
    if (!condition || !state) return false;
    for (const key of Object.keys(condition)) {
      if (!(key in state)) return false;
    }
    return true;
  }

  /**
   * Update rule success rate (RL-style learning)
   */
  static async updateRulePerformance(
    ruleId: number,
    outcome: 'success' | 'failure'
  ): Promise<void> {
    const [rule] = await db
      .select()
      .from(agentProceduralMemory)
      .where(eq(agentProceduralMemory.id, ruleId))
      .limit(1);

    if (!rule) return;

    // Adaptive success rate update (exponential moving average)
    const learningRate = rule.learningRate || 0.1;
    const reward = outcome === 'success' ? 1.0 : 0.0;
    const newSuccessRate = rule.successRate + learningRate * (reward - rule.successRate);

    await db
      .update(agentProceduralMemory)
      .set({
        successRate: newSuccessRate,
        applicationCount: rule.applicationCount + 1,
        lastApplicationOutcome: outcome,
        updatedAt: new Date()
      })
      .where(eq(agentProceduralMemory.id, ruleId));
  }

  /**
   * Get best rules for current context (sorted by priority and success rate)
   */
  static async getBestRules(
    agentId: string,
    currentState: any,
    limit: number = 5
  ): Promise<SelectAgentProceduralMemory[]> {
    const allRules = await db
      .select()
      .from(agentProceduralMemory)
      .where(
        and(
          eq(agentProceduralMemory.agentId, agentId),
          eq(agentProceduralMemory.enabled, true)
        )
      )
      .orderBy(
        desc(agentProceduralMemory.priority),
        desc(agentProceduralMemory.successRate)
      );

    // Filter rules that match current state
    const matchingRules = allRules.filter(rule => 
      this.evaluateCondition(rule.condition, currentState)
    );

    return matchingRules.slice(0, limit);
  }
}
