import { db } from '../db';
import { learningPatterns, agentExecutions, agentKnowledgeVersions } from '@shared/schema';
import { eq, desc, and, gte, sql, count } from 'drizzle-orm';
import type { SelectLearningPattern, SelectAgentKnowledgeVersion } from '@shared/schema';

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

export class LearningRetentionService {
  static async recordSuccessPattern(params: {
    agentId: string;
    task: string;
    solution: string;
    validationScore: number;
    patternsUsed?: string[];
  }): Promise<void> {
    try {
      const { agentId, task, solution, validationScore, patternsUsed = [] } = params;
      console.log(`[LearningRetention] Recording success pattern for ${agentId}: ${task.substring(0, 50)}...`);

      const patternName = `Success: ${task.substring(0, 100)}`;
      const signature = task.toLowerCase().replace(/[^a-z0-9\s]/g, '').substring(0, 200);

      const existingPatterns = await db
        .select()
        .from(learningPatterns)
        .where(
          and(
            sql`${learningPatterns.discoveredBy} @> ARRAY[${agentId}]::text[]` as any,
            eq(learningPatterns.isActive, true)
          )
        );

      const existingPattern = existingPatterns.find(p => 
        p.problemSignature.toLowerCase().includes(signature.substring(0, 50))
      );

      if (existingPattern) {
        const newTimesApplied = existingPattern.timesApplied + 1;
        const newSuccessRate = (existingPattern.successRate * existingPattern.timesApplied + validationScore) / newTimesApplied;
        const newConfidence = Math.min(1, existingPattern.confidence + 0.05);

        await db
          .update(learningPatterns)
          .set({
            timesApplied: newTimesApplied,
            successRate: newSuccessRate,
            confidence: newConfidence,
            lastUsed: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(learningPatterns.id, existingPattern.id));

        console.log(`[LearningRetention] ✅ Updated existing pattern: ${existingPattern.patternName}`);
      } else {
        await db
          .insert(learningPatterns)
          .values({
            patternName,
            patternType: 'solution',
            category: 'positive-pattern',
            problemSignature: signature,
            solutionTemplate: solution || 'Auto-generated solution',
            confidence: Math.min(1, 0.5 + validationScore * 0.5),
            successRate: validationScore,
            timesApplied: 1,
            discoveredBy: [agentId],
            isActive: true,
            lastUsed: new Date(),
            tags: ['auto-learned', 'vibecoding'],
          });

        console.log(`[LearningRetention] ✅ Created new success pattern: ${patternName}`);
      }

      for (const patternId of patternsUsed) {
        try {
          await this.trackPatternUsage(parseInt(patternId), undefined as any, true);
        } catch {
        }
      }
    } catch (error: any) {
      console.error('[LearningRetention] ❌ Failed to record success pattern:', error);
    }
  }
}export const LLearningRetentionService = new LearningRetentionService();
