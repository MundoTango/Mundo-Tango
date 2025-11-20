/**
 * KNOWLEDGE AUTO-SAVER SERVICE
 * Automatically captures and stores learned patterns after successful tasks
 * 
 * Features:
 * - Auto-save patterns after code generation, error fixes, deployments
 * - AI-powered pattern extraction and generalization
 * - Semantic search using LanceDB for pattern matching
 * - A2A protocol integration for agent-to-agent learning
 * - Confidence scoring for pattern reliability
 */

import { db } from '../../db';
import { learningPatterns } from '../../../shared/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { lanceDB } from '../../lib/lancedb';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

export interface LearningParams {
  taskType: string;
  context: any;
  solution: any;
  outcome: 'success' | 'failure';
  agentId?: string;
  metadata?: Record<string, any>;
}

export interface ExtractedPattern {
  patternName: string;
  category: string;
  problemSignature: string;
  solutionTemplate: string;
  confidence: number;
  discoveredBy: string[];
  codeExample?: string;
  whenNotToUse?: string;
  variations?: any;
  metadata: Record<string, any>;
}

export interface SimilarPattern {
  id: number;
  patternName: string;
  category: string;
  problemSignature: string;
  solutionTemplate: string;
  successRate: number;
  timesApplied: number;
  similarity: number;
  confidence: number;
}

export class KnowledgeAutoSaver {
  private vectorTableName = 'learned_patterns_vectors';
  private minConfidenceThreshold = 0.6;

  /**
   * Save learning after successful task completion
   */
  async saveLearning(params: LearningParams): Promise<number | null> {
    try {
      console.log(`[KnowledgeAutoSaver] 💾 Saving learning for task: ${params.taskType}`);

      // Only save successful patterns by default
      if (params.outcome === 'failure') {
        console.log('[KnowledgeAutoSaver] Skipping failure pattern (can be enabled for error patterns)');
        return null;
      }

      // Extract reusable pattern using AI
      const pattern = await this.extractPattern(params);

      // Check if pattern confidence meets threshold
      if (pattern.confidence < this.minConfidenceThreshold) {
        console.log(`[KnowledgeAutoSaver] ⚠️ Pattern confidence too low: ${pattern.confidence}`);
        return null;
      }

      // Check for duplicate patterns
      const isDuplicate = await this.isDuplicatePattern(pattern.patternName, pattern.solution);
      if (isDuplicate) {
        console.log('[KnowledgeAutoSaver] Pattern already exists, incrementing usage count');
        return await this.incrementPatternUsage(pattern.patternName);
      }

      // Save to database
      const [inserted] = await db.insert(learningPatterns).values({
        patternName: pattern.patternName,
        category: pattern.category,
        problemSignature: pattern.problemSignature,
        solutionTemplate: pattern.solutionTemplate,
        discoveredBy: pattern.discoveredBy,
        timesApplied: 1,
        successRate: 1.0,
        confidence: pattern.confidence,
        codeExample: pattern.codeExample,
        whenNotToUse: pattern.whenNotToUse,
        variations: pattern.variations,
        metadata: {
          ...pattern.metadata,
          agentId: params.agentId,
          taskType: params.taskType,
          createdFrom: 'auto_save',
        },
        isActive: true,
      }).returning();

      console.log(`[KnowledgeAutoSaver] ✅ Pattern saved: ${pattern.patternName} (ID: ${inserted.id})`);

      // Add to vector database for semantic search (async, don't wait)
      this.addToVectorDB(inserted).catch(err => {
        console.error('[KnowledgeAutoSaver] Failed to add to vector DB:', err.message);
      });

      return inserted.id;
    } catch (error: any) {
      console.error('[KnowledgeAutoSaver] ❌ Failed to save learning:', error.message);
      return null;
    }
  }

  /**
   * Extract reusable pattern from task using AI
   */
  private async extractPattern(params: LearningParams): Promise<ExtractedPattern> {
    try {
      const prompt = `Analyze this completed task and extract a reusable pattern.

Task Type: ${params.taskType}
Context: ${JSON.stringify(params.context, null, 2)}
Solution: ${JSON.stringify(params.solution, null, 2)}
Outcome: ${params.outcome}

Extract a generalized, reusable pattern that can help with similar tasks in the future.

Return JSON with this structure:
{
  "patternName": "Descriptive name (e.g., 'API Error Handling with Retry Logic')",
  "category": "One of: code_generation, error_handling, deployment, refactoring, testing, optimization, integration",
  "problemSignature": "Clear description of the problem this pattern solves",
  "solutionTemplate": "Step-by-step solution template with placeholders",
  "confidence": 0.0-1.0 (how confident you are this pattern is reusable),
  "discoveredBy": ["agent-id or name who discovered this"],
  "codeExample": "Code example showing how to use this pattern",
  "whenNotToUse": "Situations where this pattern should NOT be used",
  "variations": {} (object with pattern variations if any)
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert at identifying and extracting reusable software patterns from completed tasks. Always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content || '{}';
      const extracted = JSON.parse(content);

      // Validate and return with defaults
      return {
        patternName: extracted.patternName || `Pattern-${Date.now()}`,
        category: extracted.category || 'code_generation',
        problemSignature: extracted.problemSignature || `Problem from ${params.taskType}`,
        solutionTemplate: extracted.solutionTemplate || JSON.stringify(params.solution),
        confidence: Math.min(1.0, Math.max(0.0, extracted.confidence || 0.7)),
        discoveredBy: extracted.discoveredBy || [params.agentId || 'auto-saver'],
        codeExample: extracted.codeExample,
        whenNotToUse: extracted.whenNotToUse,
        variations: extracted.variations,
        metadata: params.metadata || {},
      };
    } catch (error: any) {
      console.error('[KnowledgeAutoSaver] Pattern extraction failed:', error.message);
      
      // Fallback to basic pattern
      return {
        patternName: `${params.taskType}-${Date.now()}`,
        category: 'code_generation',
        problemSignature: `Problem from ${params.taskType}`,
        solutionTemplate: JSON.stringify(params.solution),
        confidence: 0.5,
        discoveredBy: [params.agentId || 'auto-saver'],
        metadata: params.metadata || {},
      };
    }
  }

  /**
   * Find similar patterns for a new task
   */
  async findSimilarPatterns(
    task: string,
    category?: string,
    limit: number = 5
  ): Promise<SimilarPattern[]> {
    try {
      console.log(`[KnowledgeAutoSaver] 🔍 Searching for patterns similar to: "${task}"`);

      // Search using vector similarity
      const vectorResults = await lanceDB.searchMemories(
        this.vectorTableName,
        task,
        limit * 2, // Get more for filtering
        category ? { category } : undefined
      );

      // Get pattern IDs from vector search
      const patternIds = vectorResults
        .map(r => r.metadata?.patternId)
        .filter(Boolean);

      if (patternIds.length === 0) {
        console.log('[KnowledgeAutoSaver] No similar patterns found');
        return [];
      }

      // Fetch full patterns from database
      const patterns = await db
        .select()
        .from(learningPatterns)
        .where(
          and(
            eq(learningPatterns.isActive, true),
            // Note: Using IN clause requires custom SQL or multiple queries
          )
        )
        .orderBy(desc(learningPatterns.successRate), desc(learningPatterns.usageCount))
        .limit(limit);

      // Map with similarity scores
      const results: SimilarPattern[] = patterns.map(pattern => {
        const vectorResult = vectorResults.find(
          v => v.metadata?.patternId === pattern.id
        );

        return {
          id: pattern.id,
          patternName: pattern.patternName,
          category: pattern.category,
          problemSignature: pattern.problemSignature,
          solutionTemplate: pattern.solutionTemplate,
          successRate: pattern.successRate,
          timesApplied: pattern.timesApplied,
          confidence: pattern.confidence,
          similarity: vectorResult?.similarity || 0,
        };
      }).sort((a, b) => b.similarity - a.similarity);

      console.log(`[KnowledgeAutoSaver] ✅ Found ${results.length} similar patterns`);
      return results.slice(0, limit);
    } catch (error: any) {
      console.error('[KnowledgeAutoSaver] ❌ Search failed:', error.message);
      return [];
    }
  }

  /**
   * Record pattern usage and update success rate
   */
  async recordPatternUsage(patternId: number, wasSuccessful: boolean): Promise<void> {
    try {
      const [pattern] = await db
        .select()
        .from(learningPatterns)
        .where(eq(learningPatterns.id, patternId));

      if (!pattern) {
        console.warn(`[KnowledgeAutoSaver] Pattern ${patternId} not found`);
        return;
      }

      // Calculate new success rate
      const totalUses = pattern.timesApplied + 1;
      const successfulUses = Math.round(pattern.successRate * pattern.timesApplied) + (wasSuccessful ? 1 : 0);
      const newSuccessRate = successfulUses / totalUses;

      // Update pattern
      await db
        .update(learningPatterns)
        .set({
          timesApplied: totalUses,
          successRate: newSuccessRate,
          lastUsed: new Date(),
        })
        .where(eq(learningPatterns.id, patternId));

      console.log(`[KnowledgeAutoSaver] ✅ Updated pattern usage: ${pattern.patternName}`);
    } catch (error: any) {
      console.error('[KnowledgeAutoSaver] Failed to record usage:', error.message);
    }
  }

  /**
   * Get pattern statistics
   */
  async getStats(): Promise<{
    totalPatterns: number;
    activePatterns: number;
    averageSuccessRate: number;
    topPatterns: Array<{ name: string; timesApplied: number; successRate: number }>;
  }> {
    try {
      const allPatterns = await db.select().from(learningPatterns);
      const activePatterns = allPatterns.filter(p => p.isActive);

      const avgSuccessRate = activePatterns.length > 0
        ? activePatterns.reduce((sum, p) => sum + p.successRate, 0) / activePatterns.length
        : 0;

      const topPatterns = allPatterns
        .sort((a, b) => b.timesApplied - a.timesApplied)
        .slice(0, 10)
        .map(p => ({
          name: p.patternName,
          timesApplied: p.timesApplied,
          successRate: p.successRate,
        }));

      return {
        totalPatterns: allPatterns.length,
        activePatterns: activePatterns.length,
        averageSuccessRate: avgSuccessRate,
        topPatterns,
      };
    } catch (error: any) {
      console.error('[KnowledgeAutoSaver] Failed to get stats:', error.message);
      return {
        totalPatterns: 0,
        activePatterns: 0,
        averageSuccessRate: 0,
        topPatterns: [],
      };
    }
  }

  /**
   * Check if pattern already exists
   */
  private async isDuplicatePattern(patternName: string, solution: string): Promise<boolean> {
    try {
      const existing = await db
        .select()
        .from(learningPatterns)
        .where(eq(learningPatterns.patternName, patternName));

      return existing.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Increment usage count for existing pattern
   */
  private async incrementPatternUsage(patternName: string): Promise<number> {
    const [pattern] = await db
      .select()
      .from(learningPatterns)
      .where(eq(learningPatterns.patternName, patternName));

    if (pattern) {
      await db
        .update(learningPatterns)
        .set({
          timesApplied: pattern.timesApplied + 1,
          lastUsed: new Date(),
        })
        .where(eq(learningPatterns.id, pattern.id));

      return pattern.id;
    }

    return 0;
  }

  /**
   * Add pattern to vector database for semantic search
   */
  private async addToVectorDB(pattern: any): Promise<void> {
    try {
      const searchableText = `${pattern.patternName}\n${pattern.problemSignature}\n${pattern.solutionTemplate}`;

      await lanceDB.addMemory(this.vectorTableName, {
        id: `pattern_${pattern.id}`,
        content: searchableText,
        metadata: {
          patternId: pattern.id,
          category: pattern.category,
          confidence: pattern.confidence,
          successRate: pattern.successRate,
        },
        timestamp: Date.now(),
      });

      console.log(`[KnowledgeAutoSaver] ✅ Added pattern to vector DB: ${pattern.patternName}`);
    } catch (error: any) {
      console.error('[KnowledgeAutoSaver] Failed to add to vector DB:', error.message);
      throw error;
    }
  }
}

export const knowledgeAutoSaver = new KnowledgeAutoSaver();
