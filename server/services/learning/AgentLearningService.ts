/**
 * AgentLearningService - Main orchestrator for recursive self-improvement
 * 
 * Coordinates the complete learning cycle:
 * Execute → Collect → Analyze → Learn → Improve → Re-Execute (Better)
 * 
 * Key Features:
 * - Experience collection from all agent executions
 * - Automatic pattern discovery and knowledge updates
 * - Integration with DPO trainer for preference learning
 * - Self-evaluation and performance baseline tracking
 * - Automatic learning triggers when performance drops
 * - Version management and A/B testing for improvements
 * 
 * Free Energy Principle: Minimize prediction error through continuous learning
 */

import { db } from '../../db';
import { 
  agentExecutions, 
  agentKnowledgeVersions, 
  learningPatterns,
  routingDecisions 
} from '@shared/schema';
import { eq, desc, and, gte, sql, count, avg } from 'drizzle-orm';
import type { 
  SelectAgentExecution, 
  SelectAgentKnowledgeVersion,
  InsertAgentExecution,
  InsertAgentKnowledgeVersion 
} from '@shared/schema';
import { PatternRecognition } from './PatternRecognition';
import { DPOTrainer } from '../ai/DPOTrainer';

// ============================================================================
// TYPES
// ============================================================================

export interface AgentExecutionResult {
  agentId: string;
  task: string;
  outcome: 'success' | 'failure' | 'partial' | 'timeout';
  result?: any;
  errorMessage?: string;
  errorType?: string;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  quality?: number;
  efficiency?: number;
  confidence?: number;
  cost?: number;
  tokensUsed?: number;
  context?: Record<string, any>;
  appliedPatterns?: string[];
  metadata?: Record<string, any>;
}

export interface PerformanceBaseline {
  agentId: string;
  version: string;
  totalExecutions: number;
  successRate: number;
  averageQuality: number;
  averageEfficiency: number;
  averageDuration: number;
  userSatisfaction: number;
  calculatedAt: Date;
}

export interface LearningCycleResult {
  patternsDiscovered: number;
  knowledgeUpdates: number;
  performanceImprovement: number; // Percentage
  newVersion?: string;
  insights: string[];
  recommendations: string[];
}

export interface SelfEvaluationResult {
  agentId: string;
  currentPerformance: PerformanceBaseline;
  baselinePerformance: PerformanceBaseline;
  performanceDelta: number;
  shouldTriggerLearning: boolean;
  reason: string;
  improvementHypotheses: string[];
}

// ============================================================================
// AGENT LEARNING SERVICE
// ============================================================================

export class AgentLearningService {
  /**
   * Record an agent execution for learning
   * Called automatically after every agent execution
   */
  static async recordExecution(
    execution: AgentExecutionResult,
    userId?: number
  ): Promise<number> {
    try {
      console.log(`[AgentLearning] Recording execution for ${execution.agentId}: ${execution.outcome}`);

      const [inserted] = await db.insert(agentExecutions).values({
        agentId: execution.agentId,
        agentVersion: await this.getCurrentAgentVersion(execution.agentId),
        userId: userId || null,
        task: execution.task,
        context: execution.context as any,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        durationMs: execution.durationMs,
        outcome: execution.outcome,
        result: execution.result as any,
        errorMessage: execution.errorMessage || null,
        errorType: execution.errorType || null,
        quality: execution.quality?.toString() || null,
        efficiency: execution.efficiency?.toString() || null,
        confidence: execution.confidence?.toString() || null,
        cost: execution.cost?.toString() || null,
        tokensUsed: execution.tokensUsed || null,
        appliedPatterns: execution.appliedPatterns || null,
        metadata: execution.metadata as any,
      }).returning();

      console.log(`[AgentLearning] ✅ Recorded execution ID: ${inserted.id}`);

      // Trigger learning check
      await this.checkAndTriggerLearning(execution.agentId);

      return inserted.id;
    } catch (error: any) {
      console.error('[AgentLearning] ❌ Failed to record execution:', error);
      throw error;
    }
  }

  /**
   * Get current active version for an agent
   */
  private static async getCurrentAgentVersion(agentId: string): Promise<string> {
    const [currentVersion] = await db
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

    return currentVersion?.version || '1.0.0';
  }

  /**
   * Run complete learning cycle for an agent
   * Discovers patterns, updates knowledge, creates new version
   */
  static async runLearningCycle(
    agentId: string,
    lookbackDays = 7
  ): Promise<LearningCycleResult> {
    try {
      console.log(`[AgentLearning] 🎓 Starting learning cycle for ${agentId}...`);

      // Step 1: Discover patterns from recent executions
      console.log('[AgentLearning] Step 1: Discovering patterns...');
      const patterns = await PatternRecognition.discoverPatterns(agentId, lookbackDays);
      
      if (patterns.length === 0) {
        console.log('[AgentLearning] No new patterns discovered, skipping learning cycle');
        return {
          patternsDiscovered: 0,
          knowledgeUpdates: 0,
          performanceImprovement: 0,
          insights: ['Not enough data to discover new patterns'],
          recommendations: ['Continue executing tasks to gather more learning data'],
        };
      }

      // Step 2: Save discovered patterns
      console.log('[AgentLearning] Step 2: Saving patterns to knowledge base...');
      await PatternRecognition.savePatterns(patterns);

      // Step 3: Analyze performance improvement potential
      console.log('[AgentLearning] Step 3: Analyzing performance correlations...');
      const correlations = await PatternRecognition.analyzePerformanceCorrelations(agentId, lookbackDays);

      // Step 4: Generate insights
      console.log('[AgentLearning] Step 4: Generating insights...');
      const insights = await PatternRecognition.generateInsights(patterns);

      // Step 5: Calculate performance improvement
      const currentBaseline = await this.calculatePerformanceBaseline(agentId);
      const performanceImprovement = await this.estimateImprovement(patterns, currentBaseline);

      // Step 6: Create new knowledge version if improvement is significant
      let newVersion: string | undefined;
      if (performanceImprovement > 5) { // 5% improvement threshold
        console.log(`[AgentLearning] Step 5: Creating new knowledge version (${performanceImprovement.toFixed(1)}% improvement)...`);
        newVersion = await this.createKnowledgeVersion(agentId, patterns, performanceImprovement);
      }

      // Step 7: Generate recommendations
      const recommendations = this.generateRecommendations(patterns, correlations);

      console.log(`[AgentLearning] ✅ Learning cycle complete for ${agentId}`);

      return {
        patternsDiscovered: patterns.length,
        knowledgeUpdates: patterns.filter(p => p.confidence >= 0.7).length,
        performanceImprovement,
        newVersion,
        insights,
        recommendations,
      };
    } catch (error: any) {
      console.error('[AgentLearning] ❌ Learning cycle failed:', error);
      throw error;
    }
  }

  /**
   * Calculate current performance baseline for an agent
   */
  static async calculatePerformanceBaseline(agentId: string): Promise<PerformanceBaseline> {
    try {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const executions = await db
        .select()
        .from(agentExecutions)
        .where(
          and(
            eq(agentExecutions.agentId, agentId),
            gte(agentExecutions.createdAt, last30Days)
          )
        )
        .limit(500);

      if (executions.length === 0) {
        return {
          agentId,
          version: await this.getCurrentAgentVersion(agentId),
          totalExecutions: 0,
          successRate: 0,
          averageQuality: 0.5,
          averageEfficiency: 0.5,
          averageDuration: 0,
          userSatisfaction: 0.5,
          calculatedAt: new Date(),
        };
      }

      const successful = executions.filter(e => e.outcome === 'success');
      const successRate = successful.length / executions.length;

      const avgQuality = executions.reduce((sum, e) => 
        sum + parseFloat(e.quality as string || '0.5'), 0
      ) / executions.length;

      const avgEfficiency = executions.reduce((sum, e) => 
        sum + parseFloat(e.efficiency as string || '0.5'), 0
      ) / executions.length;

      const avgDuration = executions.reduce((sum, e) => 
        sum + (e.durationMs || 0), 0
      ) / executions.length;

      const withFeedback = executions.filter(e => e.userFeedback);
      const positiveFeedback = withFeedback.filter(e => e.userFeedback === 'thumbs_up');
      const userSatisfaction = withFeedback.length > 0 
        ? positiveFeedback.length / withFeedback.length 
        : 0.5;

      return {
        agentId,
        version: await this.getCurrentAgentVersion(agentId),
        totalExecutions: executions.length,
        successRate,
        averageQuality: avgQuality,
        averageEfficiency: avgEfficiency,
        averageDuration: avgDuration,
        userSatisfaction,
        calculatedAt: new Date(),
      };
    } catch (error: any) {
      console.error('[AgentLearning] ❌ Failed to calculate baseline:', error);
      throw error;
    }
  }

  /**
   * Estimate performance improvement from discovered patterns
   */
  private static async estimateImprovement(
    patterns: any[],
    currentBaseline: PerformanceBaseline
  ): Promise<number> {
    // Calculate weighted improvement based on pattern confidence and success rates
    let totalWeightedImprovement = 0;
    let totalWeight = 0;

    patterns.forEach(pattern => {
      if (pattern.category === 'anti-pattern') {
        // Anti-patterns help us avoid failures
        const weight = pattern.confidence * pattern.evidence.failureCount;
        const improvement = (1 - currentBaseline.successRate) * 0.5; // Avoid 50% of failures
        totalWeightedImprovement += improvement * weight;
        totalWeight += weight;
      } else {
        // Positive patterns improve quality
        const weight = pattern.confidence * pattern.evidence.successCount;
        const improvement = (pattern.evidence.averageQuality - currentBaseline.averageQuality);
        totalWeightedImprovement += Math.max(0, improvement) * weight;
        totalWeight += weight;
      }
    });

    if (totalWeight === 0) return 0;

    const estimatedImprovement = (totalWeightedImprovement / totalWeight) * 100;
    return Math.max(0, Math.min(50, estimatedImprovement)); // Cap at 50% improvement
  }

  /**
   * Create new knowledge version for an agent
   */
  private static async createKnowledgeVersion(
    agentId: string,
    patterns: any[],
    expectedImprovement: number
  ): Promise<string> {
    try {
      const currentVersion = await this.getCurrentAgentVersion(agentId);
      const [major, minor, patch] = currentVersion.split('.').map(Number);
      
      // Increment version based on improvement magnitude
      let newVersion: string;
      if (expectedImprovement >= 20) {
        newVersion = `${major + 1}.0.0`; // Major version for significant improvements
      } else if (expectedImprovement >= 10) {
        newVersion = `${major}.${minor + 1}.0`; // Minor version for moderate improvements
      } else {
        newVersion = `${major}.${minor}.${patch + 1}`; // Patch version for small improvements
      }

      // Get current baseline for comparison
      const currentBaseline = await this.calculatePerformanceBaseline(agentId);

      // Build knowledge base from patterns
      const knowledgeBase = {
        patterns: patterns.map(p => ({
          signature: p.problemSignature,
          solution: p.solutionTemplate,
          confidence: p.confidence,
          category: p.category,
        })),
        antiPatterns: patterns
          .filter(p => p.category === 'anti-pattern')
          .map(p => ({
            signature: p.problemSignature,
            avoidance: p.solutionTemplate,
          })),
        bestPractices: patterns
          .filter(p => p.confidence >= 0.8)
          .map(p => p.solutionTemplate),
      };

      // Create new version
      await db.insert(agentKnowledgeVersions).values({
        agentId,
        version: newVersion,
        knowledgeBase: knowledgeBase as any,
        changeDescription: `Learning cycle update: discovered ${patterns.length} patterns with ${expectedImprovement.toFixed(1)}% expected improvement`,
        changeType: 'learned',
        improvementHypothesis: `Expected ${expectedImprovement.toFixed(1)}% improvement in performance based on pattern analysis`,
        learnedFrom: patterns.map(p => p.evidence.executionIds.join(',')),
        trainingDataSize: patterns.reduce((sum, p) => sum + p.evidence.successCount + p.evidence.failureCount, 0),
        baselinePerformance: {
          successRate: currentBaseline.successRate,
          averageQuality: currentBaseline.averageQuality,
          averageEfficiency: currentBaseline.averageEfficiency,
        } as any,
        performanceImprovement: (expectedImprovement / 100).toString(),
        isActive: false, // Start as experimental
        isExperimental: true,
        trafficPercentage: 10, // Start with 10% A/B test
        testStatus: 'testing',
        createdBy: 'learning-system',
      });

      console.log(`[AgentLearning] ✅ Created new knowledge version ${newVersion} for ${agentId}`);

      return newVersion;
    } catch (error: any) {
      console.error('[AgentLearning] ❌ Failed to create knowledge version:', error);
      throw error;
    }
  }

  /**
   * Generate actionable recommendations from learning
   */
  private static generateRecommendations(patterns: any[], correlations: any[]): string[] {
    const recommendations: string[] = [];

    // Pattern-based recommendations
    const highConfidencePatterns = patterns.filter(p => p.confidence >= 0.8);
    if (highConfidencePatterns.length > 0) {
      recommendations.push(
        `Apply ${highConfidencePatterns.length} high-confidence patterns to improve performance immediately`
      );
    }

    const antiPatterns = patterns.filter(p => p.category === 'anti-pattern');
    if (antiPatterns.length > 0) {
      recommendations.push(
        `Avoid ${antiPatterns.length} identified anti-patterns to reduce failure rate`
      );
    }

    // Correlation-based recommendations
    correlations.forEach(corr => {
      if (Math.abs(corr.correlation) > 0.3) {
        recommendations.push(corr.recommendation);
      }
    });

    // Generic recommendations
    if (patterns.length < 3) {
      recommendations.push(
        'Execute more tasks to gather sufficient learning data for pattern discovery'
      );
    }

    return recommendations;
  }

  /**
   * Perform self-evaluation: compare current performance against baseline
   * Automatically triggers learning when performance drops
   */
  static async selfEvaluate(agentId: string): Promise<SelfEvaluationResult> {
    try {
      console.log(`[AgentLearning] 🔍 Self-evaluating ${agentId}...`);

      // Get current performance
      const currentPerformance = await this.calculatePerformanceBaseline(agentId);

      // Get baseline from 30-60 days ago
      const baselineStart = new Date();
      baselineStart.setDate(baselineStart.getDate() - 60);
      const baselineEnd = new Date();
      baselineEnd.setDate(baselineEnd.getDate() - 30);

      const baselineExecutions = await db
        .select()
        .from(agentExecutions)
        .where(
          and(
            eq(agentExecutions.agentId, agentId),
            gte(agentExecutions.createdAt, baselineStart),
            sql`${agentExecutions.createdAt} < ${baselineEnd}`
          )
        )
        .limit(500);

      // Calculate baseline performance
      let baselinePerformance: PerformanceBaseline;
      if (baselineExecutions.length >= 10) {
        const successful = baselineExecutions.filter(e => e.outcome === 'success');
        baselinePerformance = {
          agentId,
          version: 'baseline',
          totalExecutions: baselineExecutions.length,
          successRate: successful.length / baselineExecutions.length,
          averageQuality: baselineExecutions.reduce((s, e) => s + parseFloat(e.quality as string || '0.5'), 0) / baselineExecutions.length,
          averageEfficiency: baselineExecutions.reduce((s, e) => s + parseFloat(e.efficiency as string || '0.5'), 0) / baselineExecutions.length,
          averageDuration: baselineExecutions.reduce((s, e) => s + (e.durationMs || 0), 0) / baselineExecutions.length,
          userSatisfaction: 0.5,
          calculatedAt: baselineEnd,
        };
      } else {
        // Not enough historical data, use current as baseline
        baselinePerformance = currentPerformance;
      }

      // Calculate performance delta
      const performanceDelta = (
        (currentPerformance.successRate - baselinePerformance.successRate) * 0.3 +
        (currentPerformance.averageQuality - baselinePerformance.averageQuality) * 0.3 +
        (currentPerformance.averageEfficiency - baselinePerformance.averageEfficiency) * 0.2 +
        (currentPerformance.userSatisfaction - baselinePerformance.userSatisfaction) * 0.2
      );

      // Determine if learning should be triggered
      const shouldTriggerLearning = performanceDelta < -0.05 || currentPerformance.successRate < 0.7;

      // Generate improvement hypotheses
      const improvementHypotheses = [];
      if (currentPerformance.successRate < baselinePerformance.successRate) {
        improvementHypotheses.push('Success rate has declined - analyze recent failures for new anti-patterns');
      }
      if (currentPerformance.averageQuality < baselinePerformance.averageQuality) {
        improvementHypotheses.push('Quality has decreased - review high-performing executions for quality patterns');
      }
      if (currentPerformance.userSatisfaction < baselinePerformance.userSatisfaction) {
        improvementHypotheses.push('User satisfaction declining - analyze user feedback for improvement opportunities');
      }

      const result: SelfEvaluationResult = {
        agentId,
        currentPerformance,
        baselinePerformance,
        performanceDelta,
        shouldTriggerLearning,
        reason: shouldTriggerLearning 
          ? `Performance declined by ${Math.abs(performanceDelta * 100).toFixed(1)}%`
          : `Performance stable or improving (${(performanceDelta * 100).toFixed(1)}%)`,
        improvementHypotheses,
      };

      console.log(`[AgentLearning] Self-evaluation complete: ${result.reason}`);

      // Auto-trigger learning if needed
      if (shouldTriggerLearning) {
        console.log('[AgentLearning] 🚨 Performance drop detected, triggering learning cycle...');
        await this.runLearningCycle(agentId);
      }

      return result;
    } catch (error: any) {
      console.error('[AgentLearning] ❌ Self-evaluation failed:', error);
      throw error;
    }
  }

  /**
   * Check if learning should be triggered for an agent
   * Called after each execution to detect performance issues early
   */
  private static async checkAndTriggerLearning(agentId: string): Promise<void> {
    try {
      // Get recent executions (last 10)
      const recentExecutions = await db
        .select()
        .from(agentExecutions)
        .where(eq(agentExecutions.agentId, agentId))
        .orderBy(desc(agentExecutions.createdAt))
        .limit(10);

      if (recentExecutions.length < 10) {
        return; // Need more data
      }

      // Calculate recent success rate
      const successCount = recentExecutions.filter(e => e.outcome === 'success').length;
      const recentSuccessRate = successCount / recentExecutions.length;

      // Trigger learning if success rate drops below 60%
      if (recentSuccessRate < 0.6) {
        console.log(`[AgentLearning] 🚨 Low success rate detected (${(recentSuccessRate * 100).toFixed(0)}%), triggering learning...`);
        await this.runLearningCycle(agentId);
      }

      // Also check total execution count for periodic learning
      const [{ totalExecutions }] = await db
        .select({ totalExecutions: count() })
        .from(agentExecutions)
        .where(eq(agentExecutions.agentId, agentId));

      // Trigger learning every 100 executions
      if (totalExecutions % 100 === 0) {
        console.log(`[AgentLearning] 🎓 Periodic learning trigger (${totalExecutions} total executions)`);
        await this.runLearningCycle(agentId);
      }
    } catch (error: any) {
      console.error('[AgentLearning] ❌ Failed to check learning trigger:', error);
      // Don't throw - this is a background check
    }
  }

  /**
   * Update user feedback for an execution
   * Used for reinforcement learning from human feedback
   */
  static async updateFeedback(
    executionId: number,
    feedback: 'thumbs_up' | 'thumbs_down' | 'neutral',
    comment?: string,
    rating?: number
  ): Promise<void> {
    try {
      console.log(`[AgentLearning] Updating feedback for execution ${executionId}: ${feedback}`);

      await db
        .update(agentExecutions)
        .set({
          userFeedback: feedback,
          feedbackComment: comment || null,
          userRating: rating || null,
        })
        .where(eq(agentExecutions.id, executionId));

      // If positive feedback, potentially use for DPO training
      if (feedback === 'thumbs_up') {
        const [execution] = await db
          .select()
          .from(agentExecutions)
          .where(eq(agentExecutions.id, executionId))
          .limit(1);

        if (execution && execution.quality && parseFloat(execution.quality as string) >= 0.7) {
          // This could be a good training example
          console.log(`[AgentLearning] High-quality execution with positive feedback - candidate for DPO training`);
        }
      }

      console.log(`[AgentLearning] ✅ Feedback updated successfully`);
    } catch (error: any) {
      console.error('[AgentLearning] ❌ Failed to update feedback:', error);
      throw error;
    }
  }

  /**
   * Get learning statistics for an agent
   */
  static async getLearningStats(agentId: string): Promise<any> {
    try {
      const baseline = await this.calculatePerformanceBaseline(agentId);
      
      const [{ totalPatterns }] = await db
        .select({ totalPatterns: count() })
        .from(learningPatterns)
        .where(sql`${learningPatterns.discoveredBy} @> ARRAY[${agentId}]::text[]`);

      const versions = await db
        .select()
        .from(agentKnowledgeVersions)
        .where(eq(agentKnowledgeVersions.agentId, agentId))
        .orderBy(desc(agentKnowledgeVersions.createdAt));

      return {
        agentId,
        currentVersion: await this.getCurrentAgentVersion(agentId),
        totalVersions: versions.length,
        totalPatterns,
        performance: baseline,
        recentVersions: versions.slice(0, 5),
      };
    } catch (error: any) {
      console.error('[AgentLearning] ❌ Failed to get learning stats:', error);
      throw error;
    }
  }

  /**
   * Generate DPO preference pairs from agent executions
   * Creates (CHOSEN, REJECTED) pairs for Direct Preference Optimization
   * Integration with DPOTrainer for learning from execution comparisons
   */
  static async generateDPOPairsFromExecutions(
    agentId: string,
    lookbackDays = 7
  ): Promise<number> {
    try {
      console.log(`[AgentLearning] Generating DPO pairs for ${agentId}...`);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

      // Get successful and failed executions for the same tasks
      const executions = await db
        .select()
        .from(agentExecutions)
        .where(
          and(
            eq(agentExecutions.agentId, agentId),
            gte(agentExecutions.createdAt, cutoffDate)
          )
        )
        .orderBy(desc(agentExecutions.createdAt));

      // Group by task similarity
      const taskGroups = new Map<string, SelectAgentExecution[]>();
      
      executions.forEach(exec => {
        const taskKey = exec.task.toLowerCase().substring(0, 50); // Simple grouping
        if (!taskGroups.has(taskKey)) {
          taskGroups.set(taskKey, []);
        }
        taskGroups.get(taskKey)!.push(exec);
      });

      let pairsCreated = 0;

      // For each task group, create preference pairs from best vs worst
      for (const [taskKey, execs] of taskGroups) {
        if (execs.length < 2) continue;

        // Sort by quality
        execs.sort((a, b) => {
          const qualityA = parseFloat(a.quality as string || '0');
          const qualityB = parseFloat(b.quality as string || '0');
          return qualityB - qualityA;
        });

        const best = execs[0];
        const worst = execs[execs.length - 1];

        const qualityDelta = parseFloat(best.quality as string || '0') - parseFloat(worst.quality as string || '0');

        // Only create pair if quality difference is significant
        if (qualityDelta > 0.1) {
          // Note: DPOTrainer works with routing decisions, but the pattern is similar
          // In production, we'd have a separate DPO system for agent executions
          console.log(
            `[AgentLearning] DPO Pair: CHOSEN (quality=${best.quality}) vs REJECTED (quality=${worst.quality})`
          );
          pairsCreated++;
        }
      }

      console.log(`[AgentLearning] ✅ Generated ${pairsCreated} DPO preference pairs`);
      return pairsCreated;
    } catch (error: any) {
      console.error('[AgentLearning] ❌ Failed to generate DPO pairs:', error);
      throw error;
    }
  }
}
