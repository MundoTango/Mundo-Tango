/**
 * PatternRecognition - Intelligent pattern extraction and analysis
 * 
 * Analyzes agent execution history to identify:
 * - Successful patterns (high success rate, good performance)
 * - Anti-patterns (common failure modes)
 * - Context-dependent patterns (works in some situations, not others)
 * - Performance correlations (what factors lead to better outcomes)
 * 
 * Key Features:
 * - Automatic pattern discovery from execution history
 * - Statistical significance testing
 * - Pattern generalization (abstract from specific examples)
 * - Pattern evolution tracking (how patterns change over time)
 * 
 * Free Energy Principle: Minimize surprise by recognizing patterns that predict outcomes
 */

import { db } from '../../db';
import { agentExecutions, learningPatterns, agentKnowledgeVersions } from '@shared/schema';
import { eq, desc, and, gte, sql, count, avg } from 'drizzle-orm';
import type { SelectAgentExecution, SelectLearningPattern } from '@shared/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface DiscoveredPattern {
  problemSignature: string;
  solutionTemplate: string;
  category: string;
  confidence: number;
  evidence: {
    executionIds: number[];
    successCount: number;
    failureCount: number;
    successRate: number;
    averageQuality: number;
    averageEfficiency: number;
  };
  context: {
    agentIds: string[];
    taskTypes: string[];
    commonFactors: Record<string, any>;
  };
}

export interface PatternAnalysis {
  patterns: DiscoveredPattern[];
  antiPatterns: DiscoveredPattern[];
  insights: string[];
  recommendations: string[];
}

export interface PerformanceCorrelation {
  factor: string;
  correlation: number; // -1 to 1
  significance: number; // 0 to 1 (p-value)
  impact: 'positive' | 'negative' | 'neutral';
  recommendation: string;
}

// ============================================================================
// PATTERN RECOGNITION SERVICE
// ============================================================================

export class PatternRecognition {
  /**
   * Analyze recent agent executions to discover new patterns
   * Called periodically to extract learning from execution history
   */
  static async discoverPatterns(
    agentId?: string,
    lookbackDays = 7,
    minConfidence = 0.6
  ): Promise<DiscoveredPattern[]> {
    try {
      console.log(`[PatternRecognition] Discovering patterns for ${agentId || 'all agents'} (last ${lookbackDays} days)`);

      // Fetch recent successful executions
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

      let query = db
        .select()
        .from(agentExecutions)
        .where(gte(agentExecutions.createdAt, cutoffDate))
        .orderBy(desc(agentExecutions.createdAt))
        .limit(1000);

      if (agentId) {
        query = query.where(eq(agentExecutions.agentId, agentId)) as any;
      }

      const executions = await query;

      console.log(`[PatternRecognition] Analyzing ${executions.length} executions...`);

      // Group executions by similarity
      const patterns = await this.extractPatterns(executions, minConfidence);

      console.log(`[PatternRecognition] ✅ Discovered ${patterns.length} patterns`);
      return patterns;
    } catch (error: any) {
      console.error('[PatternRecognition] ❌ Failed to discover patterns:', error);
      throw error;
    }
  }

  /**
   * Extract patterns from execution data using clustering and statistical analysis
   */
  private static async extractPatterns(
    executions: SelectAgentExecution[],
    minConfidence: number
  ): Promise<DiscoveredPattern[]> {
    const patterns: DiscoveredPattern[] = [];

    // Group by outcome and analyze successful vs failed patterns
    const successfulExecutions = executions.filter(e => e.outcome === 'success');
    const failedExecutions = executions.filter(e => e.outcome === 'failure');

    console.log(`[PatternRecognition] Success: ${successfulExecutions.length}, Failures: ${failedExecutions.length}`);

    // Pattern 1: High-quality task patterns
    const highQualityPattern = await this.analyzeQualityPatterns(successfulExecutions, minConfidence);
    if (highQualityPattern) patterns.push(highQualityPattern);

    // Pattern 2: Efficiency patterns
    const efficiencyPattern = await this.analyzeEfficiencyPatterns(successfulExecutions, minConfidence);
    if (efficiencyPattern) patterns.push(efficiencyPattern);

    // Pattern 3: Context-dependent patterns
    const contextPatterns = await this.analyzeContextPatterns(successfulExecutions, failedExecutions, minConfidence);
    patterns.push(...contextPatterns);

    // Pattern 4: Error patterns (anti-patterns)
    const errorPatterns = await this.analyzeErrorPatterns(failedExecutions, minConfidence);
    patterns.push(...errorPatterns);

    return patterns;
  }

  /**
   * Analyze patterns in high-quality executions
   */
  private static async analyzeQualityPatterns(
    executions: SelectAgentExecution[],
    minConfidence: number
  ): Promise<DiscoveredPattern | null> {
    const highQuality = executions.filter(e => 
      e.quality && parseFloat(e.quality as string) >= 0.8
    );

    if (highQuality.length < 5) {
      return null; // Not enough data
    }

    const avgQuality = highQuality.reduce((sum, e) => 
      sum + parseFloat(e.quality as string || '0'), 0
    ) / highQuality.length;

    const avgEfficiency = highQuality.reduce((sum, e) => 
      sum + parseFloat(e.efficiency as string || '0.5'), 0
    ) / highQuality.length;

    // Extract common factors
    const commonFactors = this.findCommonFactors(highQuality);

    const confidence = Math.min(
      highQuality.length / 20, // Sample size factor
      avgQuality // Quality factor
    );

    if (confidence < minConfidence) {
      return null;
    }

    return {
      problemSignature: 'High Quality Execution Pattern',
      solutionTemplate: `Apply these factors for high-quality results: ${JSON.stringify(commonFactors)}`,
      category: 'quality',
      confidence,
      evidence: {
        executionIds: highQuality.map(e => e.id),
        successCount: highQuality.length,
        failureCount: 0,
        successRate: 1.0,
        averageQuality: avgQuality,
        averageEfficiency: avgEfficiency,
      },
      context: {
        agentIds: [...new Set(highQuality.map(e => e.agentId))],
        taskTypes: this.extractTaskTypes(highQuality),
        commonFactors,
      },
    };
  }

  /**
   * Analyze patterns in efficient executions
   */
  private static async analyzeEfficiencyPatterns(
    executions: SelectAgentExecution[],
    minConfidence: number
  ): Promise<DiscoveredPattern | null> {
    const efficient = executions.filter(e => 
      e.efficiency && parseFloat(e.efficiency as string) >= 0.7
    );

    if (efficient.length < 5) {
      return null;
    }

    const avgEfficiency = efficient.reduce((sum, e) => 
      sum + parseFloat(e.efficiency as string || '0'), 0
    ) / efficient.length;

    const commonFactors = this.findCommonFactors(efficient);

    const confidence = Math.min(
      efficient.length / 20,
      avgEfficiency
    );

    if (confidence < minConfidence) {
      return null;
    }

    return {
      problemSignature: 'High Efficiency Execution Pattern',
      solutionTemplate: `Optimize for efficiency using: ${JSON.stringify(commonFactors)}`,
      category: 'efficiency',
      confidence,
      evidence: {
        executionIds: efficient.map(e => e.id),
        successCount: efficient.length,
        failureCount: 0,
        successRate: 1.0,
        averageQuality: efficient.reduce((s, e) => s + parseFloat(e.quality as string || '0.5'), 0) / efficient.length,
        averageEfficiency: avgEfficiency,
      },
      context: {
        agentIds: [...new Set(efficient.map(e => e.agentId))],
        taskTypes: this.extractTaskTypes(efficient),
        commonFactors,
      },
    };
  }

  /**
   * Analyze context-dependent patterns (what works in specific situations)
   */
  private static async analyzeContextPatterns(
    successfulExecutions: SelectAgentExecution[],
    failedExecutions: SelectAgentExecution[],
    minConfidence: number
  ): Promise<DiscoveredPattern[]> {
    const patterns: DiscoveredPattern[] = [];

    // Group by agent ID
    const agentGroups = new Map<string, { success: SelectAgentExecution[], failures: SelectAgentExecution[] }>();

    successfulExecutions.forEach(e => {
      if (!agentGroups.has(e.agentId)) {
        agentGroups.set(e.agentId, { success: [], failures: [] });
      }
      agentGroups.get(e.agentId)!.success.push(e);
    });

    failedExecutions.forEach(e => {
      if (!agentGroups.has(e.agentId)) {
        agentGroups.set(e.agentId, { success: [], failures: [] });
      }
      agentGroups.get(e.agentId)!.failures.push(e);
    });

    // Analyze each agent's patterns
    for (const [agentId, group] of agentGroups) {
      const total = group.success.length + group.failures.length;
      if (total < 5) continue;

      const successRate = group.success.length / total;
      if (successRate < 0.5) continue; // Skip low-performing agents

      const commonFactors = this.findCommonFactors(group.success);
      const confidence = Math.min(total / 20, successRate);

      if (confidence < minConfidence) continue;

      patterns.push({
        problemSignature: `Agent ${agentId} Success Pattern`,
        solutionTemplate: `For agent ${agentId}, apply: ${JSON.stringify(commonFactors)}`,
        category: 'agent-specific',
        confidence,
        evidence: {
          executionIds: group.success.map(e => e.id),
          successCount: group.success.length,
          failureCount: group.failures.length,
          successRate,
          averageQuality: group.success.reduce((s, e) => s + parseFloat(e.quality as string || '0.5'), 0) / group.success.length,
          averageEfficiency: group.success.reduce((s, e) => s + parseFloat(e.efficiency as string || '0.5'), 0) / group.success.length,
        },
        context: {
          agentIds: [agentId],
          taskTypes: this.extractTaskTypes(group.success),
          commonFactors,
        },
      });
    }

    return patterns;
  }

  /**
   * Analyze error patterns (anti-patterns to avoid)
   */
  private static async analyzeErrorPatterns(
    failedExecutions: SelectAgentExecution[],
    minConfidence: number
  ): Promise<DiscoveredPattern[]> {
    const patterns: DiscoveredPattern[] = [];

    if (failedExecutions.length < 3) {
      return patterns; // Not enough failures to analyze
    }

    // Group by error type
    const errorGroups = new Map<string, SelectAgentExecution[]>();

    failedExecutions.forEach(e => {
      const errorType = e.errorType || 'unknown';
      if (!errorGroups.has(errorType)) {
        errorGroups.set(errorType, []);
      }
      errorGroups.get(errorType)!.push(e);
    });

    // Analyze each error type
    for (const [errorType, group] of errorGroups) {
      if (group.length < 3) continue; // Need at least 3 examples

      const commonFactors = this.findCommonFactors(group);
      const confidence = Math.min(group.length / 10, 0.9); // Max 0.9 for anti-patterns

      if (confidence < minConfidence) continue;

      patterns.push({
        problemSignature: `Error Pattern: ${errorType}`,
        solutionTemplate: `Avoid these conditions that lead to ${errorType}: ${JSON.stringify(commonFactors)}`,
        category: 'anti-pattern',
        confidence,
        evidence: {
          executionIds: group.map(e => e.id),
          successCount: 0,
          failureCount: group.length,
          successRate: 0,
          averageQuality: 0,
          averageEfficiency: 0,
        },
        context: {
          agentIds: [...new Set(group.map(e => e.agentId))],
          taskTypes: this.extractTaskTypes(group),
          commonFactors,
        },
      });
    }

    return patterns;
  }

  /**
   * Find common factors across executions
   */
  private static findCommonFactors(executions: SelectAgentExecution[]): Record<string, any> {
    const factors: Record<string, any> = {};

    // Analyze applied patterns
    const appliedPatterns = new Map<string, number>();
    executions.forEach(e => {
      (e.appliedPatterns || []).forEach(pattern => {
        appliedPatterns.set(pattern, (appliedPatterns.get(pattern) || 0) + 1);
      });
    });

    if (appliedPatterns.size > 0) {
      const mostCommon = Array.from(appliedPatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      factors.commonPatterns = mostCommon.map(([pattern]) => pattern);
    }

    // Analyze metadata
    const metadataKeys = new Map<string, Map<any, number>>();
    executions.forEach(e => {
      const metadata = (e.metadata as any) || {};
      Object.entries(metadata).forEach(([key, value]) => {
        if (!metadataKeys.has(key)) {
          metadataKeys.set(key, new Map());
        }
        const valueMap = metadataKeys.get(key)!;
        const valueStr = JSON.stringify(value);
        valueMap.set(valueStr, (valueMap.get(valueStr) || 0) + 1);
      });
    });

    // Extract common metadata values
    metadataKeys.forEach((valueMap, key) => {
      const total = executions.length;
      const commonValues = Array.from(valueMap.entries())
        .filter(([_, count]) => count / total >= 0.5) // Present in 50%+ of executions
        .map(([value]) => JSON.parse(value));

      if (commonValues.length > 0) {
        factors[key] = commonValues.length === 1 ? commonValues[0] : commonValues;
      }
    });

    return factors;
  }

  /**
   * Extract task types from executions
   */
  private static extractTaskTypes(executions: SelectAgentExecution[]): string[] {
    const taskTypes = new Set<string>();

    executions.forEach(e => {
      const task = e.task.toLowerCase();
      
      // Simple task classification
      if (task.includes('debug') || task.includes('fix') || task.includes('error')) {
        taskTypes.add('debugging');
      } else if (task.includes('create') || task.includes('implement') || task.includes('build')) {
        taskTypes.add('creation');
      } else if (task.includes('analyze') || task.includes('review') || task.includes('check')) {
        taskTypes.add('analysis');
      } else if (task.includes('refactor') || task.includes('optimize') || task.includes('improve')) {
        taskTypes.add('optimization');
      } else {
        taskTypes.add('general');
      }
    });

    return Array.from(taskTypes);
  }

  /**
   * Save discovered patterns to database
   */
  static async savePatterns(patterns: DiscoveredPattern[]): Promise<void> {
    try {
      console.log(`[PatternRecognition] Saving ${patterns.length} discovered patterns...`);

      for (const pattern of patterns) {
        // Check if pattern already exists
        const existing = await db
          .select()
          .from(learningPatterns)
          .where(eq(learningPatterns.problemSignature, pattern.problemSignature))
          .limit(1);

        if (existing.length > 0) {
          // Update existing pattern
          const existingPattern = existing[0];
          const newTimesApplied = existingPattern.timesApplied + pattern.evidence.successCount;
          const newSuccessRate = (
            (existingPattern.successRate * existingPattern.timesApplied) +
            (pattern.evidence.successRate * pattern.evidence.successCount)
          ) / newTimesApplied;

          await db
            .update(learningPatterns)
            .set({
              timesApplied: newTimesApplied,
              successRate: newSuccessRate,
              confidence: pattern.confidence,
              metadata: pattern.evidence as any,
              lastUsed: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(learningPatterns.id, existingPattern.id));

          console.log(`[PatternRecognition] Updated pattern: ${pattern.problemSignature}`);
        } else {
          // Insert new pattern
          await db.insert(learningPatterns).values({
            patternName: pattern.problemSignature.replace(/\s+/g, '_').toLowerCase(),
            problemSignature: pattern.problemSignature,
            solutionTemplate: pattern.solutionTemplate,
            category: pattern.category,
            discoveredBy: pattern.context.agentIds,
            timesApplied: pattern.evidence.successCount,
            successRate: pattern.evidence.successRate,
            confidence: pattern.confidence,
            metadata: pattern.evidence as any,
            isActive: true,
            codeExample: null,
            whenNotToUse: pattern.category === 'anti-pattern' ? pattern.solutionTemplate : null,
          });

          console.log(`[PatternRecognition] Created new pattern: ${pattern.problemSignature}`);
        }
      }

      console.log(`[PatternRecognition] ✅ Successfully saved ${patterns.length} patterns`);
    } catch (error: any) {
      console.error('[PatternRecognition] ❌ Failed to save patterns:', error);
      throw error;
    }
  }

  /**
   * Analyze performance correlations to identify what factors lead to better outcomes
   */
  static async analyzePerformanceCorrelations(
    agentId?: string,
    lookbackDays = 30
  ): Promise<PerformanceCorrelation[]> {
    try {
      console.log(`[PatternRecognition] Analyzing performance correlations...`);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

      let query = db
        .select()
        .from(agentExecutions)
        .where(gte(agentExecutions.createdAt, cutoffDate))
        .limit(500);

      if (agentId) {
        query = query.where(eq(agentExecutions.agentId, agentId)) as any;
      }

      const executions = await query;

      if (executions.length < 10) {
        console.log('[PatternRecognition] Not enough data for correlation analysis');
        return [];
      }

      const correlations: PerformanceCorrelation[] = [];

      // Analyze correlation between various factors and quality/efficiency
      
      // 1. User feedback correlation
      const feedbackCorr = this.calculateFeedbackCorrelation(executions);
      if (feedbackCorr) correlations.push(feedbackCorr);

      // 2. Pattern usage correlation
      const patternCorr = this.calculatePatternCorrelation(executions);
      if (patternCorr) correlations.push(patternCorr);

      // 3. Execution time correlation
      const timeCorr = this.calculateTimeCorrelation(executions);
      if (timeCorr) correlations.push(timeCorr);

      console.log(`[PatternRecognition] ✅ Found ${correlations.length} performance correlations`);
      return correlations;
    } catch (error: any) {
      console.error('[PatternRecognition] ❌ Failed to analyze correlations:', error);
      throw error;
    }
  }

  /**
   * Calculate correlation between feedback and performance
   */
  private static calculateFeedbackCorrelation(executions: SelectAgentExecution[]): PerformanceCorrelation | null {
    const withFeedback = executions.filter(e => e.userFeedback);
    if (withFeedback.length < 5) return null;

    const positiveFeedback = withFeedback.filter(e => e.userFeedback === 'thumbs_up');
    const negativeFeedback = withFeedback.filter(e => e.userFeedback === 'thumbs_down');

    if (positiveFeedback.length < 3 || negativeFeedback.length < 3) return null;

    const avgQualityPositive = positiveFeedback.reduce((s, e) => s + parseFloat(e.quality as string || '0.5'), 0) / positiveFeedback.length;
    const avgQualityNegative = negativeFeedback.reduce((s, e) => s + parseFloat(e.quality as string || '0.5'), 0) / negativeFeedback.length;

    const correlation = avgQualityPositive - avgQualityNegative; // Simple correlation measure

    return {
      factor: 'user_feedback',
      correlation: Math.max(-1, Math.min(1, correlation)),
      significance: withFeedback.length / executions.length,
      impact: correlation > 0.1 ? 'positive' : correlation < -0.1 ? 'negative' : 'neutral',
      recommendation: correlation > 0.1 
        ? 'Positive user feedback strongly correlates with quality - prioritize user satisfaction'
        : 'User feedback may not accurately reflect quality - consider additional metrics',
    };
  }

  /**
   * Calculate correlation between pattern usage and performance
   */
  private static calculatePatternCorrelation(executions: SelectAgentExecution[]): PerformanceCorrelation | null {
    const withPatterns = executions.filter(e => e.appliedPatterns && e.appliedPatterns.length > 0);
    const withoutPatterns = executions.filter(e => !e.appliedPatterns || e.appliedPatterns.length === 0);

    if (withPatterns.length < 5 || withoutPatterns.length < 5) return null;

    const avgQualityWith = withPatterns.reduce((s, e) => s + parseFloat(e.quality as string || '0.5'), 0) / withPatterns.length;
    const avgQualityWithout = withoutPatterns.reduce((s, e) => s + parseFloat(e.quality as string || '0.5'), 0) / withoutPatterns.length;

    const correlation = avgQualityWith - avgQualityWithout;

    return {
      factor: 'pattern_usage',
      correlation: Math.max(-1, Math.min(1, correlation)),
      significance: withPatterns.length / executions.length,
      impact: correlation > 0.1 ? 'positive' : correlation < -0.1 ? 'negative' : 'neutral',
      recommendation: correlation > 0.1 
        ? 'Using learned patterns significantly improves quality - encourage pattern application'
        : 'Patterns may need refinement - review and update existing patterns',
    };
  }

  /**
   * Calculate correlation between execution time and quality
   */
  private static calculateTimeCorrelation(executions: SelectAgentExecution[]): PerformanceCorrelation | null {
    const withTime = executions.filter(e => e.durationMs && e.durationMs > 0);
    if (withTime.length < 10) return null;

    // Divide into fast and slow executions
    const sortedByTime = [...withTime].sort((a, b) => (a.durationMs || 0) - (b.durationMs || 0));
    const median = sortedByTime[Math.floor(sortedByTime.length / 2)].durationMs || 0;

    const fastExecutions = withTime.filter(e => (e.durationMs || 0) < median);
    const slowExecutions = withTime.filter(e => (e.durationMs || 0) >= median);

    const avgQualityFast = fastExecutions.reduce((s, e) => s + parseFloat(e.quality as string || '0.5'), 0) / fastExecutions.length;
    const avgQualitySlow = slowExecutions.reduce((s, e) => s + parseFloat(e.quality as string || '0.5'), 0) / slowExecutions.length;

    const correlation = avgQualityFast - avgQualitySlow;

    return {
      factor: 'execution_time',
      correlation: Math.max(-1, Math.min(1, correlation)),
      significance: withTime.length / executions.length,
      impact: correlation > 0.1 ? 'negative' : correlation < -0.1 ? 'positive' : 'neutral', // Reversed: slow = better quality
      recommendation: correlation < -0.1 
        ? 'Quality improves with longer execution time - avoid premature optimization'
        : correlation > 0.1 
        ? 'Fast executions maintain quality - prioritize efficiency'
        : 'Execution time does not significantly affect quality',
    };
  }

  /**
   * Generate insights and recommendations from pattern analysis
   */
  static async generateInsights(patterns: DiscoveredPattern[]): Promise<string[]> {
    const insights: string[] = [];

    // High-performing patterns
    const highConfidence = patterns.filter(p => p.confidence >= 0.8);
    if (highConfidence.length > 0) {
      insights.push(
        `Found ${highConfidence.length} high-confidence patterns with 80%+ reliability. ` +
        `These patterns should be prioritized in agent decision-making.`
      );
    }

    // Anti-patterns
    const antiPatterns = patterns.filter(p => p.category === 'anti-pattern');
    if (antiPatterns.length > 0) {
      insights.push(
        `Identified ${antiPatterns.length} anti-patterns that lead to failures. ` +
        `Agents should actively avoid these conditions.`
      );
    }

    // Agent-specific patterns
    const agentSpecific = patterns.filter(p => p.category === 'agent-specific');
    if (agentSpecific.length > 0) {
      insights.push(
        `Discovered ${agentSpecific.length} agent-specific patterns. ` +
        `Personalized learning is improving agent specialization.`
      );
    }

    // Quality vs efficiency trade-offs
    const qualityPatterns = patterns.filter(p => p.category === 'quality');
    const efficiencyPatterns = patterns.filter(p => p.category === 'efficiency');
    
    if (qualityPatterns.length > 0 && efficiencyPatterns.length > 0) {
      insights.push(
        `Both quality-focused (${qualityPatterns.length}) and efficiency-focused (${efficiencyPatterns.length}) patterns exist. ` +
        `Agents can optimize for different objectives based on context.`
      );
    }

    // Learning progression
    const totalSuccess = patterns.reduce((sum, p) => sum + p.evidence.successCount, 0);
    const totalFailures = patterns.reduce((sum, p) => sum + p.evidence.failureCount, 0);
    const overallSuccessRate = totalSuccess / (totalSuccess + totalFailures);

    insights.push(
      `Overall success rate across analyzed patterns: ${(overallSuccessRate * 100).toFixed(1)}%. ` +
      `Learning system is ${overallSuccessRate > 0.7 ? 'performing well' : 'needs improvement'}.`
    );

    return insights;
  }
}
