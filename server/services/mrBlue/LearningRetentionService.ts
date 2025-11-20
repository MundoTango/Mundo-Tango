/**
 * LearningRetentionService - Knowledge retention and application
 * 
 * Ensures learned knowledge is retained and actively applied during execution:
 * - Retrieve relevant patterns for current task
 * - Apply learned patterns to decision-making
 * - Track pattern effectiveness over time
 * - Manage knowledge decay (fade unused patterns)
 * - Cross-agent knowledge sharing
 * 
 * Free Energy Principle: Use learned patterns to reduce prediction error
 */

import { db } from '../../db';
import { learningPatterns, agentExecutions, agentKnowledgeVersions } from '@shared/schema';
import { eq, desc, and, gte, sql, count } from 'drizzle-orm';
import type { SelectLearningPattern, SelectAgentKnowledgeVersion } from '@shared/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface TaskContext {
  agentId: string;
  task: string;
  taskType?: string;
  metadata?: Record<string, any>;
}

export interface RelevantPattern {
  pattern: SelectLearningPattern;
  relevanceScore: number;
  reason: string;
}

export interface AppliedKnowledge {
  patterns: RelevantPattern[];
  recommendations: string[];
  warnings: string[];
  confidence: number;
}

// ============================================================================
// LEARNING RETENTION SERVICE
// ============================================================================

export class LearningRetentionService {
  /**
   * Get relevant patterns for a task
   * Returns learned patterns that apply to the current context
   */
  static async getRelevantPatterns(context: TaskContext): Promise<RelevantPattern[]> {
    try {
      console.log(`[LearningRetention] Finding relevant patterns for ${context.agentId}: ${context.task}`);

      // Fetch all active patterns
      const allPatterns = await db
        .select()
        .from(learningPatterns)
        .where(eq(learningPatterns.isActive, true))
        .orderBy(desc(learningPatterns.confidence));

      if (allPatterns.length === 0) {
        console.log('[LearningRetention] No patterns available yet');
        return [];
      }

      // Score patterns by relevance to current task
      const scoredPatterns: RelevantPattern[] = [];

      for (const pattern of allPatterns) {
        const score = this.calculateRelevance(pattern, context);
        
        if (score > 0.3) { // Only return patterns with >30% relevance
          scoredPatterns.push({
            pattern,
            relevanceScore: score,
            reason: this.explainRelevance(pattern, context, score),
          });
        }
      }

      // Sort by relevance score
      scoredPatterns.sort((a, b) => b.relevanceScore - a.relevanceScore);

      console.log(`[LearningRetention] Found ${scoredPatterns.length} relevant patterns`);

      return scoredPatterns.slice(0, 5); // Return top 5 most relevant
    } catch (error: any) {
      console.error('[LearningRetention] ❌ Failed to get relevant patterns:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score for a pattern given a task context
   */
  private static calculateRelevance(
    pattern: SelectLearningPattern,
    context: TaskContext
  ): number {
    let score = 0;

    // 1. Agent match (40% weight)
    if (pattern.discoveredBy.includes(context.agentId)) {
      score += 0.4;
    } else if (pattern.discoveredBy.some(id => id.startsWith(context.agentId.split('-')[0]))) {
      // Same agent family (e.g., mr-blue-*)
      score += 0.2;
    }

    // 2. Task similarity (30% weight)
    const taskLower = context.task.toLowerCase();
    const signatureLower = pattern.problemSignature.toLowerCase();
    
    // Check for keyword overlap
    const taskWords = taskLower.split(/\s+/).filter(w => w.length > 3);
    const signatureWords = signatureLower.split(/\s+/).filter(w => w.length > 3);
    const commonWords = taskWords.filter(w => signatureWords.includes(w));
    
    if (commonWords.length > 0) {
      const overlapRatio = commonWords.length / Math.max(taskWords.length, signatureWords.length);
      score += 0.3 * overlapRatio;
    }

    // 3. Pattern confidence (20% weight)
    score += 0.2 * pattern.confidence;

    // 4. Recent usage (10% weight)
    if (pattern.lastUsed) {
      const daysSinceUse = (Date.now() - new Date(pattern.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 1 - daysSinceUse / 30); // Decay over 30 days
      score += 0.1 * recencyScore;
    }

    return Math.min(1, score); // Cap at 1.0
  }

  /**
   * Explain why a pattern is relevant
   */
  private static explainRelevance(
    pattern: SelectLearningPattern,
    context: TaskContext,
    score: number
  ): string {
    const reasons: string[] = [];

    if (pattern.discoveredBy.includes(context.agentId)) {
      reasons.push('discovered by this agent');
    }

    if (score > 0.7) {
      reasons.push('high confidence match');
    }

    if (pattern.successRate > 0.8) {
      reasons.push(`${(pattern.successRate * 100).toFixed(0)}% success rate`);
    }

    if (pattern.lastUsed) {
      const daysSinceUse = (Date.now() - new Date(pattern.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUse < 7) {
        reasons.push('recently used');
      }
    }

    return reasons.join(', ') || 'general pattern match';
  }

  /**
   * Apply learned knowledge to a task
   * Returns recommendations, warnings, and patterns to use
   */
  static async applyKnowledge(context: TaskContext): Promise<AppliedKnowledge> {
    try {
      console.log(`[LearningRetention] Applying learned knowledge to ${context.agentId}`);

      // Get relevant patterns
      const relevantPatterns = await this.getRelevantPatterns(context);

      if (relevantPatterns.length === 0) {
        return {
          patterns: [],
          recommendations: ['No learned patterns available - this will be a learning opportunity'],
          warnings: [],
          confidence: 0.5,
        };
      }

      // Generate recommendations from positive patterns
      const recommendations: string[] = [];
      const warnings: string[] = [];

      relevantPatterns.forEach(({ pattern, relevanceScore }) => {
        if (pattern.category === 'anti-pattern') {
          // Anti-patterns become warnings
          warnings.push(
            `⚠️ Avoid: ${pattern.solutionTemplate} (confidence: ${(pattern.confidence * 100).toFixed(0)}%)`
          );
        } else {
          // Positive patterns become recommendations
          recommendations.push(
            `✓ Recommend: ${pattern.solutionTemplate} (confidence: ${(pattern.confidence * 100).toFixed(0)}%)`
          );
        }
      });

      // Calculate overall confidence
      const avgConfidence = relevantPatterns.reduce((sum, rp) => 
        sum + (rp.relevanceScore * rp.pattern.confidence), 0
      ) / relevantPatterns.length;

      console.log(`[LearningRetention] Applied ${relevantPatterns.length} patterns with ${(avgConfidence * 100).toFixed(0)}% confidence`);

      return {
        patterns: relevantPatterns,
        recommendations,
        warnings,
        confidence: avgConfidence,
      };
    } catch (error: any) {
      console.error('[LearningRetention] ❌ Failed to apply knowledge:', error);
      return {
        patterns: [],
        recommendations: [],
        warnings: [],
        confidence: 0.5,
      };
    }
  }

  /**
   * Track pattern usage
   * Called when a pattern is applied to an execution
   */
  static async trackPatternUsage(
    patternId: number,
    executionId: number,
    wasSuccessful: boolean
  ): Promise<void> {
    try {
      console.log(`[LearningRetention] Tracking pattern ${patternId} usage in execution ${executionId}`);

      // Get current pattern stats
      const [pattern] = await db
        .select()
        .from(learningPatterns)
        .where(eq(learningPatterns.id, patternId))
        .limit(1);

      if (!pattern) {
        console.warn(`[LearningRetention] Pattern ${patternId} not found`);
        return;
      }

      // Update usage stats
      const newTimesApplied = pattern.timesApplied + 1;
      const successCount = wasSuccessful 
        ? Math.round(pattern.successRate * pattern.timesApplied) + 1
        : Math.round(pattern.successRate * pattern.timesApplied);
      const newSuccessRate = successCount / newTimesApplied;

      await db
        .update(learningPatterns)
        .set({
          timesApplied: newTimesApplied,
          successRate: newSuccessRate,
          lastUsed: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(learningPatterns.id, patternId));

      console.log(
        `[LearningRetention] ✅ Pattern ${patternId} updated: ` +
        `${newTimesApplied} uses, ${(newSuccessRate * 100).toFixed(0)}% success rate`
      );

      // Link pattern to execution
      await db
        .update(agentExecutions)
        .set({
          patternId,
        })
        .where(eq(agentExecutions.id, executionId));
    } catch (error: any) {
      console.error('[LearningRetention] ❌ Failed to track pattern usage:', error);
    }
  }

  /**
   * Get agent's current knowledge version
   */
  static async getActiveKnowledgeVersion(agentId: string): Promise<SelectAgentKnowledgeVersion | null> {
    try {
      const [version] = await db
        .select()
        .from(agentKnowledgeVersions)
        .where(
          and(
            eq(agentKnowledgeVersions.agentId, agentId),
            eq(agentKnowledgeVersions.isActive, true)
          )
        )
        .orderBy(desc(agentKnowledgeVersions.createdAt))
        .limit(1);

      return version || null;
    } catch (error: any) {
      console.error('[LearningRetention] ❌ Failed to get knowledge version:', error);
      return null;
    }
  }

  /**
   * Manage knowledge decay - deactivate unused patterns
   * Called periodically to clean up stale knowledge
   */
  static async manageKnowledgeDecay(decayThresholdDays = 90): Promise<void> {
    try {
      console.log(`[LearningRetention] Managing knowledge decay (${decayThresholdDays} day threshold)...`);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - decayThresholdDays);

      // Deactivate patterns that haven't been used in X days
      const result = await db
        .update(learningPatterns)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(learningPatterns.isActive, true),
            sql`${learningPatterns.lastUsed} < ${cutoffDate}` as any
          )
        );

      console.log(`[LearningRetention] ✅ Deactivated ${result.rowCount || 0} stale patterns`);
    } catch (error: any) {
      console.error('[LearningRetention] ❌ Failed to manage knowledge decay:', error);
    }
  }

  /**
   * Share knowledge across agents
   * Transfer successful patterns from one agent to similar agents
   */
  static async shareKnowledge(
    sourceAgentId: string,
    targetAgentIds: string[],
    minConfidence = 0.7
  ): Promise<void> {
    try {
      console.log(`[LearningRetention] Sharing knowledge from ${sourceAgentId} to ${targetAgentIds.length} agents...`);

      // Get high-confidence patterns from source agent
      const sourcePatterns = await db
        .select()
        .from(learningPatterns)
        .where(
          and(
            sql`${learningPatterns.discoveredBy} @> ARRAY[${sourceAgentId}]::text[]` as any,
            sql`${learningPatterns.confidence} >= ${minConfidence}` as any,
            eq(learningPatterns.isActive, true)
          )
        );

      console.log(`[LearningRetention] Found ${sourcePatterns.length} high-confidence patterns to share`);

      // Share each pattern with target agents
      for (const pattern of sourcePatterns) {
        for (const targetAgentId of targetAgentIds) {
          if (!pattern.discoveredBy.includes(targetAgentId)) {
            // Add target agent to discoveredBy list
            await db
              .update(learningPatterns)
              .set({
                discoveredBy: [...pattern.discoveredBy, targetAgentId],
                updatedAt: new Date(),
              })
              .where(eq(learningPatterns.id, pattern.id));

            console.log(`[LearningRetention] Shared pattern "${pattern.patternName}" with ${targetAgentId}`);
          }
        }
      }

      console.log(`[LearningRetention] ✅ Knowledge sharing complete`);
    } catch (error: any) {
      console.error('[LearningRetention] ❌ Failed to share knowledge:', error);
    }
  }

  /**
   * Get knowledge summary for an agent
   */
  static async getKnowledgeSummary(agentId: string): Promise<any> {
    try {
      // Get all patterns for this agent
      const patterns = await db
        .select()
        .from(learningPatterns)
        .where(
          and(
            sql`${learningPatterns.discoveredBy} @> ARRAY[${agentId}]::text[]` as any,
            eq(learningPatterns.isActive, true)
          )
        );

      // Get active knowledge version
      const activeVersion = await this.getActiveKnowledgeVersion(agentId);

      // Categorize patterns
      const positivePatterns = patterns.filter(p => p.category !== 'anti-pattern');
      const antiPatterns = patterns.filter(p => p.category === 'anti-pattern');
      const highConfidence = patterns.filter(p => p.confidence >= 0.8);

      // Calculate average metrics
      const avgSuccessRate = patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length;
      const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
      const totalApplications = patterns.reduce((sum, p) => sum + p.timesApplied, 0);

      return {
        agentId,
        activeVersion: activeVersion?.version || '1.0.0',
        totalPatterns: patterns.length,
        positivePatterns: positivePatterns.length,
        antiPatterns: antiPatterns.length,
        highConfidencePatterns: highConfidence.length,
        metrics: {
          averageSuccessRate: avgSuccessRate,
          averageConfidence: avgConfidence,
          totalApplications,
        },
        topPatterns: patterns
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 5)
          .map(p => ({
            name: p.patternName,
            confidence: p.confidence,
            successRate: p.successRate,
            timesApplied: p.timesApplied,
          })),
      };
    } catch (error: any) {
      console.error('[LearningRetention] ❌ Failed to get knowledge summary:', error);
      return null;
    }
  }
}
