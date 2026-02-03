/**
 * GlobalKnowledgeBase - <5ms knowledge propagation system
 * 
 * MB.MD Level 1: All agents share knowledge through this system
 * - Caches query responses for instant retrieval
 * - Broadcasts changes to all 1,218 agents
 * - Stores in PostgreSQL for persistence (future)
 */

import { QueryResponse } from './AgentCommunication';

interface ChangeEvent {
  agentId: string;
  agentName: string;
  filePath: string;
  element: string;
  change: string;
  timestamp: Date;
}

export class GlobalKnowledgeBase {
  private static instance: GlobalKnowledgeBase;
  private queryCache: Map<string, QueryResponse[]>;
  private changeHistory: ChangeEvent[];
  private cacheHits: number;
  private cacheMisses: number;

  private constructor() {
    this.queryCache = new Map();
    this.changeHistory = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;

    console.log('[GlobalKnowledgeBase] 🧠 Initialized knowledge propagation system');
  }

  /**
   * Singleton instance
   */
  static getInstance(): GlobalKnowledgeBase {
    if (!GlobalKnowledgeBase.instance) {
      GlobalKnowledgeBase.instance = new GlobalKnowledgeBase();
    }
    return GlobalKnowledgeBase.instance;
  }

  /**
   * Query cached responses
   * Target: <5ms response time
   */
  async queryCached(query: string): Promise<QueryResponse[] | null> {
    const normalizedQuery = this.normalizeQuery(query);
    
    if (this.queryCache.has(normalizedQuery)) {
      this.cacheHits++;
      console.log(`[GlobalKnowledgeBase] ⚡ Cache HIT for "${query}"`);
      return this.queryCache.get(normalizedQuery) || null;
    }

    this.cacheMisses++;
    console.log(`[GlobalKnowledgeBase] ❌ Cache MISS for "${query}"`);
    return null;
  }

  /**
   * Cache query response
   */
  async cacheQueryResponse(query: string, response: QueryResponse[]): Promise<void> {
    const normalizedQuery = this.normalizeQuery(query);
    this.queryCache.set(normalizedQuery, response);
    console.log(`[GlobalKnowledgeBase] 💾 Cached response for "${query}"`);

    // TODO: Persist to PostgreSQL mr_blue_messages table
    // This will enable knowledge to survive server restarts
  }

  /**
   * Broadcast change to all agents
   * This invalidates relevant cache entries and notifies agents
   */
  async broadcastChange(change: ChangeEvent): Promise<void> {
    console.log(`[GlobalKnowledgeBase] 📡 Broadcasting change: ${change.filePath} - ${change.change}`);

    // Add to history
    this.changeHistory.push(change);

    // Invalidate cache entries related to this file/element
    this.invalidateRelatedCache(change);

    // TODO: Broadcast to all agents via event system
    // This will enable agents to update their internal knowledge

    // TODO: Store in PostgreSQL for audit trail
  }

  /**
   * Invalidate cache entries related to a change
   */
  private invalidateRelatedCache(change: ChangeEvent): void {
    let invalidated = 0;

    // Find cache entries that might be affected by this change
    for (const [query, responses] of this.queryCache.entries()) {
      // Check if any response is from the agent that made the change
      const isAffected = responses.some(r => 
        r.agentId === change.agentId || 
        r.element?.filePath === change.filePath
      );

      if (isAffected) {
        this.queryCache.delete(query);
        invalidated++;
      }
    }

    if (invalidated > 0) {
      console.log(`[GlobalKnowledgeBase] 🗑️ Invalidated ${invalidated} cache entries`);
    }
  }

  /**
   * Normalize query for consistent caching
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s]/g, ''); // Remove punctuation
  }

  /**
   * Get recent changes
   */
  getRecentChanges(limit: number = 10): ChangeEvent[] {
    return this.changeHistory.slice(-limit);
  }

  /**
   * Get statistics
   */
  getStats(): {
    cacheSize: number;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRate: number;
    changeCount: number;
  } {
    const total = this.cacheHits + this.cacheMisses;
    const hitRate = total > 0 ? this.cacheHits / total : 0;

    return {
      cacheSize: this.queryCache.size,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      cacheHitRate: Math.round(hitRate * 100) / 100,
      changeCount: this.changeHistory.length,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.queryCache.clear();
    console.log('[GlobalKnowledgeBase] 🗑️ Cache cleared');
  }
}

// Export singleton instance
export const globalKnowledgeBase = GlobalKnowledgeBase.getInstance();
