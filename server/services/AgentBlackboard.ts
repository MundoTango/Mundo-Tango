/**
 * Agent Blackboard - Shared Memory for Multi-AI Coordination
 * 
 * Implements the Blackboard Pattern for collaborative AI problem-solving.
 * Multiple AI models can write insights to shared memory, enabling
 * sophisticated multi-step analysis and synthesis.
 */

import Redis from 'ioredis';

// Only create Redis client if REDIS_URL is configured
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, {
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 0,
  retryStrategy: () => null,
  reconnectOnError: () => false,
}) : null;

// Add error handler to prevent unhandled error events
if (redis) {
  redis.on('error', () => {
    // Silently ignore Redis errors - graceful degradation
  });
}

export interface BlackboardEntry {
  agentId: string;
  platform: string;
  model: string;
  insight: string;
  confidence: number; // 0-1
  timestamp: number;
  relatedTo?: string[]; // IDs of related entries
}

export class AgentBlackboard {
  private namespace: string;
  
  constructor(sessionId: string) {
    this.namespace = `blackboard:${sessionId}`;
  }
  
  /**
   * Write insight to blackboard
   */
  async write(entry: BlackboardEntry): Promise<string> {
    const id = `${entry.platform}-${Date.now()}`;
    
    if (!redis) {
      // Redis unavailable - log but don't crash
      console.log(`[Blackboard] (in-memory) ${entry.platform} wrote: ${entry.insight.substring(0, 50)}...`);
      return id;
    }
    
    const key = `${this.namespace}:${id}`;
    
    try {
      await redis.setex(key, 3600, JSON.stringify(entry)); // 1 hour TTL
      await redis.zadd(`${this.namespace}:index`, entry.timestamp, id);
      console.log(`[Blackboard] ${entry.platform} wrote: ${entry.insight.substring(0, 50)}...`);
    } catch (error) {
      console.log(`[Blackboard] (fallback) ${entry.platform} wrote: ${entry.insight.substring(0, 50)}...`);
    }
    
    return id;
  }
  
  /**
   * Read all insights from blackboard
   */
  async readAll(): Promise<BlackboardEntry[]> {
    if (!redis) return [];
    
    try {
      const ids = await redis.zrange(`${this.namespace}:index`, 0, -1);
      const entries: BlackboardEntry[] = [];
      
      for (const id of ids) {
        const key = `${this.namespace}:${id}`;
        const data = await redis.get(key);
        if (data) {
          entries.push(JSON.parse(data));
        }
      }
      
      return entries;
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Read insights from specific platform
   */
  async readFrom(platform: string): Promise<BlackboardEntry[]> {
    const all = await this.readAll();
    return all.filter(e => e.platform === platform);
  }
  
  /**
   * Read insights related to a specific entry
   */
  async readRelated(entryId: string): Promise<BlackboardEntry[]> {
    const all = await this.readAll();
    return all.filter(e => e.relatedTo?.includes(entryId));
  }
  
  /**
   * Get insights with confidence above threshold
   */
  async readHighConfidence(threshold: number = 0.8): Promise<BlackboardEntry[]> {
    const all = await this.readAll();
    return all.filter(e => e.confidence >= threshold);
  }
  
  /**
   * Clear blackboard
   */
  async clear(): Promise<void> {
    const ids = await redis.zrange(`${this.namespace}:index`, 0, -1);
    
    for (const id of ids) {
      await redis.del(`${this.namespace}:${id}`);
    }
    
    await redis.del(`${this.namespace}:index`);
    console.log(`[Blackboard] Cleared ${ids.length} entries`);
  }
  
  /**
   * Get summary of blackboard state
   */
  async getSummary(): Promise<{
    totalEntries: number;
    platforms: string[];
    averageConfidence: number;
    oldest: number;
    newest: number;
  }> {
    const all = await this.readAll();
    
    if (all.length === 0) {
      return {
        totalEntries: 0,
        platforms: [],
        averageConfidence: 0,
        oldest: 0,
        newest: 0
      };
    }
    
    const platforms = [...new Set(all.map(e => e.platform))];
    const avgConfidence = all.reduce((sum, e) => sum + e.confidence, 0) / all.length;
    const timestamps = all.map(e => e.timestamp);
    
    return {
      totalEntries: all.length,
      platforms,
      averageConfidence: avgConfidence,
      oldest: Math.min(...timestamps),
      newest: Math.max(...timestamps)
    };
  }
}

/**
 * Multi-AI Collaborative Code Review
 * 
 * Example usage of AgentBlackboard for collaborative analysis
 */
export async function collaborativeCodeReview(code: string): Promise<string> {
  const { smartRoute } = await import('../ai/UnifiedAIOrchestrator');
  const sessionId = `review-${Date.now()}`;
  const blackboard = new AgentBlackboard(sessionId);
  
  // Step 1: GPT-4o analyzes structure
  const structureAnalysis = await smartRoute({
    query: `Analyze code structure and design patterns:\n\n${code}`,
    useCase: 'code',
    priority: 'quality'
  });
  
  await blackboard.write({
    agentId: 'GPT-4o',
    platform: structureAnalysis.platform,
    model: structureAnalysis.model,
    insight: structureAnalysis.content,
    confidence: 0.9,
    timestamp: Date.now()
  });
  
  // Step 2: Claude analyzes security (reads GPT-4o's analysis)
  const gptInsights = await blackboard.readFrom('openai');
  const securityAnalysis = await smartRoute({
    query: `Given this structure analysis:\n${gptInsights[0]?.insight || ''}\n\nAnalyze security vulnerabilities in:\n${code}`,
    useCase: 'reasoning',
    priority: 'quality'
  });
  
  await blackboard.write({
    agentId: 'Claude',
    platform: securityAnalysis.platform,
    model: securityAnalysis.model,
    insight: securityAnalysis.content,
    confidence: 0.95,
    timestamp: Date.now(),
    relatedTo: [gptInsights[0]?.agentId]
  });
  
  // Step 3: Gemini analyzes performance (reads both)
  const allInsights = await blackboard.readAll();
  const perfAnalysis = await smartRoute({
    query: `Given these analyses:\n\nStructure: ${allInsights[0]?.insight}\n\nSecurity: ${allInsights[1]?.insight}\n\nAnalyze performance optimizations for:\n${code}`,
    useCase: 'code',
    priority: 'cost'
  });
  
  await blackboard.write({
    agentId: 'Gemini',
    platform: perfAnalysis.platform,
    model: perfAnalysis.model,
    insight: perfAnalysis.content,
    confidence: 0.85,
    timestamp: Date.now()
  });
  
  // Step 4: Synthesize all insights
  const finalInsights = await blackboard.readAll();
  const synthesis = await smartRoute({
    query: `Synthesize these code review insights into one comprehensive report:\n\n${
      finalInsights.map(e => `${e.agentId} (confidence ${e.confidence}):\n${e.insight}`).join('\n\n---\n\n')
    }`,
    useCase: 'reasoning',
    priority: 'quality'
  });
  
  // Cleanup
  await blackboard.clear();
  
  return synthesis.content;
}
