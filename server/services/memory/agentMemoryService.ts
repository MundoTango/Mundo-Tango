/**
 * AGENT MEMORY SERVICE - TRACK 1 BATCH 6
 * Semantic memory system with LanceDB integration for 927+ agents
 * 
 * Features:
 * - LanceDB vector storage with OpenAI embeddings
 * - Context-aware memory retrieval
 * - Confidence scoring and tracking
 * - Cross-session context preservation
 * - Auto-expiration policies
 * - PostgreSQL + LanceDB hybrid storage
 * 
 * Architecture:
 * - PostgreSQL: Structured metadata, relationships, audit trail
 * - LanceDB: Vector embeddings for semantic search
 * - Dual-write: All memories stored in both systems
 * 
 * Agent Coverage:
 * - All 927+ agents (ESA, Life CEO, Algorithm, Mr Blue)
 * - Agent #0 (CEO) to Agent #104 (ESA)
 * - Agent #73-80 (Mr Blue agents)
 * - A1-A30 (Algorithm agents)
 * - 16 Life CEO agents
 */

import { lanceDB } from '../../lib/lancedb';
import { db } from '../../../shared/db';
import { agentMemories, agentKnowledge } from '../../../shared/schema';
import type { 
  InsertAgentMemory, 
  SelectAgentMemory,
  InsertAgentKnowledge,
  SelectAgentKnowledge 
} from '../../../shared/schema';
import { eq, and, desc, sql, gte, lte, inArray } from 'drizzle-orm';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MemoryEntry {
  agentId: string;
  memoryType: 'experience' | 'learning' | 'interaction' | 'pattern' | 'error' | 'success';
  content: string;
  metadata?: {
    userId?: number;
    page?: string;
    component?: string;
    action?: string;
    result?: any;
    tags?: string[];
    [key: string]: any;
  };
  confidence?: number; // 0-1
  context?: {
    sessionId?: string;
    timestamp?: number;
    relatedMemories?: number[];
    environment?: 'development' | 'production';
    [key: string]: any;
  };
}

export interface KnowledgeEntry {
  agentId: string;
  topic: string;
  content: string;
  confidence?: number;
  sourceMemoryId?: number;
  tags?: string[];
}

export interface MemorySearchOptions {
  agentId?: string;
  memoryType?: string;
  minConfidence?: number;
  tags?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  limit?: number;
}

export interface ContextWindow {
  agentId: string;
  sessionId?: string;
  timeWindowMs?: number;
  maxMemories?: number;
}

export interface ConfidenceUpdate {
  memoryId: number;
  newConfidence: number;
  reason?: string;
}

export interface MemoryAnalytics {
  totalMemories: number;
  byType: Record<string, number>;
  avgConfidence: number;
  recentActivity: number; // last 24h
  topAgents: Array<{ agentId: string; count: number }>;
}

// ============================================================================
// AGENT MEMORY SERVICE
// ============================================================================

export class AgentMemoryService {
  private serviceName = 'AgentMemoryService';
  private readonly LANCE_TABLE_MEMORIES = 'agent_memories_vectors';
  private readonly LANCE_TABLE_KNOWLEDGE = 'agent_knowledge_vectors';
  
  // Auto-expiration settings
  private readonly DEFAULT_EXPIRATION_DAYS = 90;
  private readonly LOW_CONFIDENCE_EXPIRATION_DAYS = 30; // Expire low confidence faster
  
  /**
   * Initialize the service and LanceDB tables
   */
  async initialize(): Promise<void> {
    console.log(`[${this.serviceName}] Initializing...`);
    try {
      await lanceDB.initialize();
      console.log(`[${this.serviceName}] ✅ Initialized successfully`);
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Initialization failed:`, error);
      throw error;
    }
  }

  /**
   * CORE METHOD 1: Store Memory
   * Dual-write to PostgreSQL + LanceDB
   */
  async storeMemory(memory: MemoryEntry): Promise<number> {
    console.log(`[${this.serviceName}] 📝 Storing memory for ${memory.agentId}...`);
    
    try {
      // Validate confidence
      const confidence = this.validateConfidence(memory.confidence);
      
      // 1. Store in PostgreSQL
      const [pgMemory] = await db.insert(agentMemories).values({
        agentId: memory.agentId,
        memoryType: memory.memoryType,
        content: memory.content,
        metadata: memory.metadata || {},
        confidence,
        context: memory.context || {}
      }).returning();

      // 2. Store in LanceDB for semantic search
      await lanceDB.addMemory(this.LANCE_TABLE_MEMORIES, {
        id: `pg_${pgMemory.id}`,
        content: memory.content,
        metadata: {
          pgId: pgMemory.id,
          agentId: memory.agentId,
          memoryType: memory.memoryType,
          confidence,
          timestamp: Date.now(),
          ...memory.metadata
        }
      });

      console.log(`[${this.serviceName}] ✅ Memory stored: ID ${pgMemory.id}`);
      return pgMemory.id;
      
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Error storing memory:`, error);
      throw error;
    }
  }

  /**
   * CORE METHOD 2: Retrieve Memory (Context-Aware)
   * Retrieves memories with contextual relevance
   */
  async retrieveMemory(
    agentId: string,
    query: string,
    options: MemorySearchOptions = {}
  ): Promise<SelectAgentMemory[]> {
    console.log(`[${this.serviceName}] 🔍 Retrieving memories for ${agentId}...`);
    
    try {
      const limit = options.limit || 10;
      
      // 1. Semantic search in LanceDB
      const vectorResults = await lanceDB.searchMemories(
        this.LANCE_TABLE_MEMORIES,
        query,
        limit * 2, // Get more candidates for filtering
        { agentId }
      );

      // Extract PostgreSQL IDs
      const pgIds = vectorResults
        .map(r => r.metadata?.pgId)
        .filter(Boolean) as number[];

      if (pgIds.length === 0) {
        console.log(`[${this.serviceName}] ℹ️ No memories found for ${agentId}`);
        return [];
      }

      // 2. Fetch full records from PostgreSQL
      let query_builder = db
        .select()
        .from(agentMemories)
        .where(
          and(
            eq(agentMemories.agentId, agentId),
            inArray(agentMemories.id, pgIds)
          )
        );

      // Apply filters
      if (options.memoryType) {
        query_builder = query_builder.where(eq(agentMemories.memoryType, options.memoryType)) as any;
      }

      if (options.minConfidence !== undefined) {
        query_builder = query_builder.where(gte(agentMemories.confidence, options.minConfidence)) as any;
      }

      if (options.dateRange?.start) {
        query_builder = query_builder.where(gte(agentMemories.createdAt, options.dateRange.start)) as any;
      }

      if (options.dateRange?.end) {
        query_builder = query_builder.where(lte(agentMemories.createdAt, options.dateRange.end)) as any;
      }

      const memories = await query_builder.limit(limit);

      // Sort by vector similarity (maintain LanceDB order)
      const sortedMemories = memories.sort((a, b) => {
        const indexA = pgIds.indexOf(a.id);
        const indexB = pgIds.indexOf(b.id);
        return indexA - indexB;
      });

      console.log(`[${this.serviceName}] ✅ Retrieved ${sortedMemories.length} memories`);
      return sortedMemories;
      
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Error retrieving memories:`, error);
      return [];
    }
  }

  /**
   * CORE METHOD 3: Semantic Search
   * Pure vector similarity search across all agents
   */
  async semanticSearch(
    query: string,
    options: {
      agentId?: string;
      limit?: number;
      minSimilarity?: number;
    } = {}
  ): Promise<Array<SelectAgentMemory & { similarity: number }>> {
    console.log(`[${this.serviceName}] 🔎 Semantic search: "${query.slice(0, 50)}..."`);
    
    try {
      const limit = options.limit || 10;
      const minSimilarity = options.minSimilarity || 0.7;

      // Search in LanceDB
      const filters = options.agentId ? { agentId: options.agentId } : undefined;
      const vectorResults = await lanceDB.searchMemories(
        this.LANCE_TABLE_MEMORIES,
        query,
        limit * 2,
        filters
      );

      // Filter by similarity threshold
      const relevantResults = vectorResults.filter(
        r => r.similarity && r.similarity >= minSimilarity
      );

      // Get PostgreSQL IDs
      const pgIds = relevantResults
        .map(r => r.metadata?.pgId)
        .filter(Boolean) as number[];

      if (pgIds.length === 0) {
        return [];
      }

      // Fetch from PostgreSQL
      const memories = await db
        .select()
        .from(agentMemories)
        .where(inArray(agentMemories.id, pgIds))
        .limit(limit);

      // Attach similarity scores
      const resultsWithSimilarity = memories.map(memory => {
        const vectorResult = relevantResults.find(
          r => r.metadata?.pgId === memory.id
        );
        return {
          ...memory,
          similarity: vectorResult?.similarity || 0
        };
      });

      // Sort by similarity
      resultsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

      console.log(`[${this.serviceName}] ✅ Found ${resultsWithSimilarity.length} semantically similar memories`);
      return resultsWithSimilarity;
      
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Error in semantic search:`, error);
      return [];
    }
  }

  /**
   * CORE METHOD 4: Update Confidence
   * Updates confidence score for a memory
   */
  async updateConfidence(update: ConfidenceUpdate): Promise<boolean> {
    console.log(`[${this.serviceName}] 📊 Updating confidence for memory ${update.memoryId}...`);
    
    try {
      const newConfidence = this.validateConfidence(update.newConfidence);

      // Update in PostgreSQL
      const result = await db
        .update(agentMemories)
        .set({ 
          confidence: newConfidence,
          context: sql`${agentMemories.context} || jsonb_build_object('confidenceUpdated', ${new Date().toISOString()}, 'updateReason', ${update.reason || 'manual'})`
        })
        .where(eq(agentMemories.id, update.memoryId))
        .returning();

      if (result.length === 0) {
        console.warn(`[${this.serviceName}] ⚠️ Memory ${update.memoryId} not found`);
        return false;
      }

      // Note: LanceDB embeddings don't need updating for confidence changes
      // Metadata can be updated if needed in future

      console.log(`[${this.serviceName}] ✅ Confidence updated to ${newConfidence}`);
      return true;
      
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Error updating confidence:`, error);
      return false;
    }
  }

  /**
   * CORE METHOD 5: Preserve Context (Cross-Session)
   * Maintains context window for continuous learning
   */
  async preserveContext(contextWindow: ContextWindow): Promise<SelectAgentMemory[]> {
    console.log(`[${this.serviceName}] 🔄 Preserving context for ${contextWindow.agentId}...`);
    
    try {
      const timeWindowMs = contextWindow.timeWindowMs || 24 * 60 * 60 * 1000; // 24 hours default
      const maxMemories = contextWindow.maxMemories || 20;
      const cutoffTime = new Date(Date.now() - timeWindowMs);

      // Build query
      let query_builder = db
        .select()
        .from(agentMemories)
        .where(
          and(
            eq(agentMemories.agentId, contextWindow.agentId),
            gte(agentMemories.createdAt, cutoffTime)
          )
        )
        .orderBy(desc(agentMemories.createdAt))
        .limit(maxMemories);

      // Additional filter by session if provided
      if (contextWindow.sessionId) {
        query_builder = query_builder.where(
          sql`${agentMemories.context}->>'sessionId' = ${contextWindow.sessionId}`
        ) as any;
      }

      const contextMemories = await query_builder;

      console.log(`[${this.serviceName}] ✅ Preserved ${contextMemories.length} context memories`);
      return contextMemories;
      
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Error preserving context:`, error);
      return [];
    }
  }

  /**
   * Store Knowledge (Distilled from Memories)
   * Converts raw memories into structured knowledge
   */
  async storeKnowledge(knowledge: KnowledgeEntry): Promise<number> {
    console.log(`[${this.serviceName}] 📚 Storing knowledge for ${knowledge.agentId}...`);
    
    try {
      const confidence = this.validateConfidence(knowledge.confidence);

      // Store in PostgreSQL
      const [pgKnowledge] = await db.insert(agentKnowledge).values({
        agentId: knowledge.agentId,
        topic: knowledge.topic,
        content: knowledge.content,
        confidence,
        sourceMemoryId: knowledge.sourceMemoryId,
        tags: knowledge.tags || []
      }).returning();

      // Store in LanceDB
      await lanceDB.addMemory(this.LANCE_TABLE_KNOWLEDGE, {
        id: `pg_${pgKnowledge.id}`,
        content: `${knowledge.topic}: ${knowledge.content}`,
        metadata: {
          pgId: pgKnowledge.id,
          agentId: knowledge.agentId,
          topic: knowledge.topic,
          confidence,
          tags: knowledge.tags || [],
          timestamp: Date.now()
        }
      });

      console.log(`[${this.serviceName}] ✅ Knowledge stored: ID ${pgKnowledge.id}`);
      return pgKnowledge.id;
      
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Error storing knowledge:`, error);
      throw error;
    }
  }

  /**
   * Retrieve Knowledge
   * Semantic search through knowledge base
   */
  async retrieveKnowledge(
    agentId: string,
    topic: string,
    limit: number = 5
  ): Promise<SelectAgentKnowledge[]> {
    console.log(`[${this.serviceName}] 📖 Retrieving knowledge for ${agentId} on "${topic}"...`);
    
    try {
      // Semantic search in LanceDB
      const vectorResults = await lanceDB.searchMemories(
        this.LANCE_TABLE_KNOWLEDGE,
        topic,
        limit * 2,
        { agentId }
      );

      const pgIds = vectorResults
        .map(r => r.metadata?.pgId)
        .filter(Boolean) as number[];

      if (pgIds.length === 0) {
        return [];
      }

      // Fetch from PostgreSQL
      const knowledge = await db
        .select()
        .from(agentKnowledge)
        .where(
          and(
            eq(agentKnowledge.agentId, agentId),
            inArray(agentKnowledge.id, pgIds)
          )
        )
        .limit(limit);

      console.log(`[${this.serviceName}] ✅ Retrieved ${knowledge.length} knowledge entries`);
      return knowledge;
      
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Error retrieving knowledge:`, error);
      return [];
    }
  }

  /**
   * Auto-Expiration: Delete Old Memories
   * Implements retention policies
   */
  async autoExpireMemories(): Promise<number> {
    console.log(`[${this.serviceName}] 🗑️ Running auto-expiration...`);
    
    try {
      const defaultCutoff = new Date(Date.now() - this.DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
      const lowConfidenceCutoff = new Date(Date.now() - this.LOW_CONFIDENCE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

      // Delete old low-confidence memories
      const lowConfidenceDeleted = await db
        .delete(agentMemories)
        .where(
          and(
            lte(agentMemories.createdAt, lowConfidenceCutoff),
            lte(agentMemories.confidence, 0.5)
          )
        )
        .returning();

      // Delete very old memories
      const oldDeleted = await db
        .delete(agentMemories)
        .where(lte(agentMemories.createdAt, defaultCutoff))
        .returning();

      const totalDeleted = lowConfidenceDeleted.length + oldDeleted.length;

      // Clean up LanceDB (by timestamp)
      await lanceDB.deleteOldMemories(
        this.LANCE_TABLE_MEMORIES,
        this.DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
      );

      console.log(`[${this.serviceName}] ✅ Auto-expired ${totalDeleted} memories`);
      return totalDeleted;
      
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Error in auto-expiration:`, error);
      return 0;
    }
  }

  /**
   * Get Memory Analytics
   * Provides insights into memory storage
   */
  async getAnalytics(): Promise<MemoryAnalytics> {
    console.log(`[${this.serviceName}] 📊 Generating analytics...`);
    
    try {
      // Total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(agentMemories);
      const totalMemories = Number(totalResult[0]?.count || 0);

      // By type
      const byTypeResult = await db
        .select({
          memoryType: agentMemories.memoryType,
          count: sql<number>`count(*)`
        })
        .from(agentMemories)
        .groupBy(agentMemories.memoryType);

      const byType: Record<string, number> = {};
      byTypeResult.forEach(row => {
        byType[row.memoryType] = Number(row.count);
      });

      // Average confidence
      const avgResult = await db
        .select({ avg: sql<number>`avg(${agentMemories.confidence})` })
        .from(agentMemories);
      const avgConfidence = Number(avgResult[0]?.avg || 0);

      // Recent activity (last 24h)
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(agentMemories)
        .where(gte(agentMemories.createdAt, last24h));
      const recentActivity = Number(recentResult[0]?.count || 0);

      // Top agents
      const topAgentsResult = await db
        .select({
          agentId: agentMemories.agentId,
          count: sql<number>`count(*)`
        })
        .from(agentMemories)
        .groupBy(agentMemories.agentId)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      const topAgents = topAgentsResult.map(row => ({
        agentId: row.agentId,
        count: Number(row.count)
      }));

      const analytics: MemoryAnalytics = {
        totalMemories,
        byType,
        avgConfidence,
        recentActivity,
        topAgents
      };

      console.log(`[${this.serviceName}] ✅ Analytics generated:`, analytics);
      return analytics;
      
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Error generating analytics:`, error);
      return {
        totalMemories: 0,
        byType: {},
        avgConfidence: 0,
        recentActivity: 0,
        topAgents: []
      };
    }
  }

  /**
   * Batch Store Memories (Efficient)
   * For bulk operations
   */
  async batchStoreMemories(memories: MemoryEntry[]): Promise<number[]> {
    console.log(`[${this.serviceName}] 📦 Batch storing ${memories.length} memories...`);
    
    try {
      // Validate all confidences
      const validatedMemories = memories.map(m => ({
        ...m,
        confidence: this.validateConfidence(m.confidence)
      }));

      // Insert into PostgreSQL
      const pgMemories = await db.insert(agentMemories).values(
        validatedMemories.map(m => ({
          agentId: m.agentId,
          memoryType: m.memoryType,
          content: m.content,
          metadata: m.metadata || {},
          confidence: m.confidence,
          context: m.context || {}
        }))
      ).returning();

      // Batch insert into LanceDB
      await lanceDB.addMemories(
        this.LANCE_TABLE_MEMORIES,
        pgMemories.map((pg, idx) => ({
          id: `pg_${pg.id}`,
          content: validatedMemories[idx].content,
          metadata: {
            pgId: pg.id,
            agentId: pg.agentId,
            memoryType: pg.memoryType,
            confidence: pg.confidence,
            timestamp: Date.now(),
            ...validatedMemories[idx].metadata
          }
        }))
      );

      const ids = pgMemories.map(m => m.id);
      console.log(`[${this.serviceName}] ✅ Batch stored ${ids.length} memories`);
      return ids;
      
    } catch (error) {
      console.error(`[${this.serviceName}] ❌ Error in batch store:`, error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Validate and normalize confidence score (0-1)
   */
  private validateConfidence(confidence?: number): number {
    if (confidence === undefined || confidence === null) {
      return 0.8; // Default confidence
    }
    return Math.max(0, Math.min(1, confidence));
  }
}

// Export singleton instance
export const agentMemoryService = new AgentMemoryService();
