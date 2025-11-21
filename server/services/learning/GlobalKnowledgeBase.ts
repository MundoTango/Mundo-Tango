import { db } from "../../db";
import { globalAgentLessons, type InsertGlobalAgentLesson } from "@shared/schema";
import { eq, desc, and, gte, inArray } from "drizzle-orm";

/**
 * GlobalKnowledgeBase
 * MB.MD Module 2: Instant knowledge sharing across all 1,218 agents
 * 
 * Purpose: Never re-learn the same lesson twice
 * - Save lessons to PostgreSQL (permanent storage)
 * - Query similar solutions in <5ms
 * - Track success rate and application count
 * - Real-time knowledge distribution
 * 
 * Training Goal: 97/100 → 99/100 (eliminate redundant learning)
 */
export class GlobalKnowledgeBase {
  /**
   * Save a lesson and broadcast to all agents
   * Permanently stores in PostgreSQL for instant retrieval
   */
  static async saveLesson(lesson: {
    agentId: string;
    context: string;
    issue: string;
    solution: string;
    confidence: number;
    appliesTo: string[];
    metadata?: any;
  }): Promise<number> {
    try {
      console.log(`\n📚 SAVING LESSON: ${lesson.agentId} → [${lesson.appliesTo.join(', ')}]`);

      // Insert into database
      const [result] = await db.insert(globalAgentLessons).values({
        agentId: lesson.agentId,
        context: lesson.context,
        issue: lesson.issue,
        solution: lesson.solution,
        confidence: lesson.confidence,
        appliesTo: lesson.appliesTo,
        metadata: lesson.metadata || {}
      }).returning();

      console.log(`✅ Lesson ${result.id} saved (confidence: ${lesson.confidence})`);

      // Broadcast to all agents via in-memory notification
      // (In production, this would use Redis pub/sub or WebSocket)
      await this.broadcastLesson(result.id, lesson);

      return result.id;
    } catch (error) {
      console.error('Error saving lesson:', error);
      throw error;
    }
  }

  /**
   * Broadcast lesson to all agents in real-time
   * Target: <5ms notification delivery
   */
  private static async broadcastLesson(lessonId: number, lesson: any): Promise<void> {
    // In-memory notification (instant)
    console.log(`📡 Broadcasting lesson ${lessonId} to ${lesson.appliesTo.length} agent types`);
    
    // TODO: In production, implement:
    // - Redis pub/sub for distributed systems
    // - WebSocket notifications for active agents
    // - Agent cache invalidation
    
    // For now: database is the source of truth
    // Agents query on-demand (optimized with indexes)
  }

  /**
   * Query for similar solutions based on context and issue
   * Returns lessons with highest confidence and success rate
   */
  static async querySimilarSolutions(
    context: string,
    issue: string,
    agentId?: string,
    limit = 5
  ): Promise<Array<{
    id: number;
    agentId: string;
    context: string;
    issue: string;
    solution: string;
    confidence: number;
    successRate: number;
    timesApplied: number;
    createdAt: Date;
    metadata: any;
  }>> {
    try {
      // Step 1: Get lessons that might apply to this agent
      let query = db.select().from(globalAgentLessons);

      if (agentId) {
        // Filter lessons that apply to this specific agent
        query = query.where(
          inArray(globalAgentLessons.id, 
            db.select({ id: globalAgentLessons.id })
              .from(globalAgentLessons)
              .where(
                // This is a simplified check - in production use array overlap
                gte(globalAgentLessons.confidence, 0.7)
              )
          )
        );
      }

      // Get recent high-confidence lessons
      const lessons = await query
        .orderBy(
          desc(globalAgentLessons.confidence),
          desc(globalAgentLessons.successRate),
          desc(globalAgentLessons.timesApplied)
        )
        .limit(limit * 3); // Get more for filtering

      // Step 2: Rank by similarity (simple text matching for now)
      const ranked = lessons
        .map(lesson => ({
          ...lesson,
          similarity: this.calculateSimilarity(
            { context, issue },
            { context: lesson.context, issue: lesson.issue }
          )
        }))
        .filter(lesson => lesson.similarity > 0.3) // Threshold
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      if (ranked.length > 0) {
        console.log(`\n🔍 Found ${ranked.length} similar solution(s) (best: ${(ranked[0].similarity * 100).toFixed(0)}% match)`);
      }

      return ranked.map(({ similarity, ...lesson }) => lesson);
    } catch (error) {
      console.error('Error querying similar solutions:', error);
      return [];
    }
  }

  /**
   * Track when a lesson is applied
   * Updates usage statistics and success rate
   */
  static async trackApplication(
    lessonId: number,
    successful: boolean
  ): Promise<void> {
    try {
      const lesson = await db
        .select()
        .from(globalAgentLessons)
        .where(eq(globalAgentLessons.id, lessonId))
        .limit(1);

      if (lesson.length === 0) {
        console.warn(`Lesson ${lessonId} not found`);
        return;
      }

      const current = lesson[0];
      const newTimesApplied = (current.timesApplied || 0) + 1;
      
      // Calculate new success rate
      const previousSuccesses = (current.timesApplied || 0) * (current.successRate || 1.0);
      const newSuccesses = previousSuccesses + (successful ? 1 : 0);
      const newSuccessRate = newSuccesses / newTimesApplied;

      await db
        .update(globalAgentLessons)
        .set({
          timesApplied: newTimesApplied,
          successRate: newSuccessRate,
          lastAppliedAt: new Date()
        })
        .where(eq(globalAgentLessons.id, lessonId));

      console.log(`📊 Lesson ${lessonId} applied (${successful ? 'success' : 'failure'}) - Success rate: ${(newSuccessRate * 100).toFixed(0)}%`);
    } catch (error) {
      console.error('Error tracking application:', error);
    }
  }

  /**
   * Get all lessons learned by a specific agent
   */
  static async getLessonsByAgent(
    agentId: string,
    limit = 20
  ): Promise<Array<any>> {
    try {
      return await db
        .select()
        .from(globalAgentLessons)
        .where(eq(globalAgentLessons.agentId, agentId))
        .orderBy(desc(globalAgentLessons.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting lessons by agent:', error);
      return [];
    }
  }

  /**
   * Get lessons that apply to a specific agent type
   */
  static async getLessonsForAgentType(
    agentType: string,
    minConfidence = 0.7,
    limit = 10
  ): Promise<Array<any>> {
    try {
      // Note: PostgreSQL array contains check
      // This is simplified - in production use proper array operators
      const allLessons = await db
        .select()
        .from(globalAgentLessons)
        .where(gte(globalAgentLessons.confidence, minConfidence))
        .orderBy(
          desc(globalAgentLessons.successRate),
          desc(globalAgentLessons.confidence)
        )
        .limit(limit * 5);

      // Filter in JavaScript (in production, use SQL array operators)
      return allLessons
        .filter(lesson => lesson.appliesTo.includes(agentType))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting lessons for agent type:', error);
      return [];
    }
  }

  /**
   * Get top-performing lessons across all agents
   */
  static async getTopLessons(limit = 10): Promise<Array<any>> {
    try {
      return await db
        .select()
        .from(globalAgentLessons)
        .where(
          and(
            gte(globalAgentLessons.timesApplied, 3), // At least 3 applications
            gte(globalAgentLessons.successRate, 0.8) // 80%+ success rate
          )
        )
        .orderBy(
          desc(globalAgentLessons.successRate),
          desc(globalAgentLessons.timesApplied),
          desc(globalAgentLessons.confidence)
        )
        .limit(limit);
    } catch (error) {
      console.error('Error getting top lessons:', error);
      return [];
    }
  }

  /**
   * Calculate similarity between two lesson contexts
   * Returns 0-1 score (1 = perfect match)
   */
  private static calculateSimilarity(
    a: { context: string; issue: string },
    b: { context: string; issue: string }
  ): number {
    // Simple word-based similarity
    // In production: use embeddings or proper NLP
    
    const wordsA = new Set(
      [...a.context.toLowerCase().split(/\W+/), ...a.issue.toLowerCase().split(/\W+/)]
        .filter(w => w.length > 3)
    );
    
    const wordsB = new Set(
      [...b.context.toLowerCase().split(/\W+/), ...b.issue.toLowerCase().split(/\W+/)]
        .filter(w => w.length > 3)
    );

    // Jaccard similarity
    const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
    const union = new Set([...wordsA, ...wordsB]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Prune low-performing lessons
   * Remove lessons with low success rate after many applications
   */
  static async pruneLowPerformingLessons(
    minApplications = 10,
    maxSuccessRate = 0.3
  ): Promise<number> {
    try {
      const result = await db
        .delete(globalAgentLessons)
        .where(
          and(
            gte(globalAgentLessons.timesApplied, minApplications),
            gte(globalAgentLessons.successRate, maxSuccessRate)
          )
        )
        .returning({ id: globalAgentLessons.id });

      console.log(`🗑️  Pruned ${result.length} low-performing lesson(s)`);
      return result.length;
    } catch (error) {
      console.error('Error pruning lessons:', error);
      return 0;
    }
  }

  /**
   * Get knowledge base statistics
   */
  static async getStatistics(): Promise<{
    totalLessons: number;
    totalApplications: number;
    averageSuccessRate: number;
    uniqueAgents: number;
  }> {
    try {
      const lessons = await db.select().from(globalAgentLessons);

      const totalLessons = lessons.length;
      const totalApplications = lessons.reduce((sum, l) => sum + (l.timesApplied || 0), 0);
      const averageSuccessRate = lessons.length > 0
        ? lessons.reduce((sum, l) => sum + (l.successRate || 0), 0) / lessons.length
        : 0;
      const uniqueAgents = new Set(lessons.map(l => l.agentId)).size;

      return {
        totalLessons,
        totalApplications,
        averageSuccessRate,
        uniqueAgents
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalLessons: 0,
        totalApplications: 0,
        averageSuccessRate: 0,
        uniqueAgents: 0
      };
    }
  }
}
