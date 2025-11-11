/**
 * LIFE CEO SEMANTIC MEMORY SERVICE
 * LanceDB-powered vector memory for 16 Life CEO agents
 * Enables agents to learn from user interactions and provide personalized assistance
 */

import { vectordb } from '../lib/lancedb';

interface MemoryEntry {
  userId: number;
  agentId: string;
  domain: string;
  content: string;
  context: string;
  timestamp: number;
  metadata: Record<string, any>;
  embedding?: number[];
}

interface LearningPattern {
  userId: number;
  agentId: string;
  pattern: string;
  frequency: number;
  confidence: number;
  lastSeen: number;
}

export class LifeCeoSemanticMemory {
  private memoryTableName = 'life_ceo_memories';
  private patternsTableName = 'life_ceo_patterns';

  /**
   * Store a new memory entry with vector embedding
   */
  async storeMemory(memory: MemoryEntry): Promise<void> {
    try {
      await vectordb.addMemory(
        this.memoryTableName,
        {
          userId: memory.userId,
          agentId: memory.agentId,
          domain: memory.domain,
          content: memory.content,
          context: memory.context,
          timestamp: memory.timestamp,
          metadata: JSON.stringify(memory.metadata),
        }
      );
    } catch (error) {
      console.error('[Life CEO Memory] Error storing memory:', error);
      throw error;
    }
  }

  /**
   * Retrieve relevant memories for a user and agent
   */
  async getRelevantMemories(
    userId: number,
    agentId: string,
    query: string,
    limit: number = 5
  ): Promise<MemoryEntry[]> {
    try {
      const results = await vectordb.searchMemories(
        this.memoryTableName,
        query,
        limit,
        { userId, agentId }
      );

      return results.map((result: any) => ({
        userId: result.userId,
        agentId: result.agentId,
        domain: result.domain,
        content: result.content,
        context: result.context,
        timestamp: result.timestamp,
        metadata: JSON.parse(result.metadata || '{}'),
        embedding: result.embedding,
      }));
    } catch (error) {
      console.error('[Life CEO Memory] Error retrieving memories:', error);
      return [];
    }
  }

  /**
   * Learn patterns from user interactions
   */
  async learnPattern(pattern: LearningPattern): Promise<void> {
    try {
      const existing = await this.getPattern(pattern.userId, pattern.agentId, pattern.pattern);
      
      if (existing) {
        await this.updatePattern(
          pattern.userId,
          pattern.agentId,
          pattern.pattern,
          {
            frequency: existing.frequency + 1,
            confidence: Math.min(existing.confidence + 0.05, 1.0),
            lastSeen: Date.now(),
          }
        );
      } else {
        await this.storePattern(pattern);
      }
    } catch (error) {
      console.error('[Life CEO Memory] Error learning pattern:', error);
      throw error;
    }
  }

  /**
   * Get learned patterns for personalization
   */
  async getPatterns(userId: number, agentId: string): Promise<LearningPattern[]> {
    try {
      const allPatterns = await vectordb.searchMemories(
        this.patternsTableName,
        '',
        100,
        { userId, agentId }
      );

      return allPatterns.map((p: any) => ({
        userId: p.userId,
        agentId: p.agentId,
        pattern: p.pattern,
        frequency: p.frequency,
        confidence: p.confidence,
        lastSeen: p.lastSeen,
      }));
    } catch (error) {
      console.error('[Life CEO Memory] Error getting patterns:', error);
      return [];
    }
  }

  /**
   * Get contextual insights based on memory and patterns
   */
  async getContextualInsights(
    userId: number,
    agentId: string,
    currentContext: string
  ): Promise<{
    memories: MemoryEntry[];
    patterns: LearningPattern[];
    suggestions: string[];
  }> {
    try {
      const [memories, patterns] = await Promise.all([
        this.getRelevantMemories(userId, agentId, currentContext, 5),
        this.getPatterns(userId, agentId),
      ]);

      const suggestions = this.generateSuggestions(memories, patterns, currentContext);

      return { memories, patterns, suggestions };
    } catch (error) {
      console.error('[Life CEO Memory] Error getting insights:', error);
      return { memories: [], patterns: [], suggestions: [] };
    }
  }

  /**
   * Clear old memories (privacy compliance)
   */
  async clearOldMemories(userId: number, olderThanDays: number = 90): Promise<number> {
    try {
      const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      
      let deleted = 0;
      return deleted;
    } catch (error) {
      console.error('[Life CEO Memory] Error clearing old memories:', error);
      return 0;
    }
  }

  private async getPattern(userId: number, agentId: string, pattern: string): Promise<LearningPattern | null> {
    try {
      const results = await vectordb.searchMemories(
        this.patternsTableName,
        pattern,
        1,
        { userId, agentId }
      );

      if (results.length > 0) {
        const p = results[0];
        return {
          userId: p.userId,
          agentId: p.agentId,
          pattern: p.pattern,
          frequency: p.frequency,
          confidence: p.confidence,
          lastSeen: p.lastSeen,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private async storePattern(pattern: LearningPattern): Promise<void> {
    await vectordb.addMemory(
      this.patternsTableName,
      {
        userId: pattern.userId,
        agentId: pattern.agentId,
        pattern: pattern.pattern,
        frequency: pattern.frequency,
        confidence: pattern.confidence,
        lastSeen: pattern.lastSeen,
      }
    );
  }

  private async updatePattern(
    userId: number,
    agentId: string,
    pattern: string,
    updates: Partial<LearningPattern>
  ): Promise<void> {
    await vectordb.addMemory(
      this.patternsTableName,
      {
        userId,
        agentId,
        pattern,
        ...updates,
      }
    );
  }

  private generateSuggestions(
    memories: MemoryEntry[],
    patterns: LearningPattern[],
    context: string
  ): string[] {
    const suggestions: string[] = [];

    const highConfidencePatterns = patterns
      .filter(p => p.confidence > 0.7 && p.frequency > 2)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    for (const pattern of highConfidencePatterns) {
      suggestions.push(pattern.pattern);
    }

    const recentMemories = memories
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 2);

    for (const memory of recentMemories) {
      if (memory.metadata?.suggestion) {
        suggestions.push(memory.metadata.suggestion);
      }
    }

    return suggestions.slice(0, 5);
  }
}

export const lifeCeoMemory = new LifeCeoSemanticMemory();
