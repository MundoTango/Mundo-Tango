/**
 * Redis Cache Implementation for AI Responses
 * Provides semantic caching to reduce API costs by 60-90%
 */

import Redis from 'ioredis';
import type { AIResponse } from '../ai/UnifiedAIOrchestrator';

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

// Cache statistics
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Get cached AI response
 */
export async function getCachedAIResponse(cacheKey: string): Promise<AIResponse | null> {
  if (!redis) {
    cacheMisses++;
    return null;
  }
  
  try {
    const cached = await redis.get(cacheKey);
    if (!cached) {
      cacheMisses++;
      return null;
    }
    
    const parsed = JSON.parse(cached);
    cacheHits++;
    console.log(`[Cache HIT] ${cacheKey}`);
    return parsed;
  } catch (error) {
    cacheMisses++;
    return null;
  }
}

/**
 * Cache AI response with TTL
 */
export async function cacheAIResponse(
  cacheKey: string, 
  response: AIResponse,
  ttl: number = 86400 // 24 hours default
): Promise<void> {
  if (!redis) return;
  
  try {
    await redis.setex(cacheKey, ttl, JSON.stringify(response));
    console.log(`[Cache SET] ${cacheKey} (TTL: ${ttl}s)`);
  } catch (error) {
    // Silently fail - caching is optional
  }
}

/**
 * Invalidate cached response
 */
export async function invalidateCachedResponse(cacheKey: string): Promise<void> {
  if (!redis) return;
  
  try {
    await redis.del(cacheKey);
    console.log(`[Cache DEL] ${cacheKey}`);
  } catch (error) {
    // Silently fail
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const total = cacheHits + cacheMisses;
  const hitRate = total > 0 ? (cacheHits / total) * 100 : 0;
  
  return {
    hits: cacheHits,
    misses: cacheMisses,
    total,
    hitRate: `${hitRate.toFixed(2)}%`,
    estimatedSavings: `$${(cacheHits * 0.001).toFixed(3)}` // Average $0.001 saved per hit
  };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Clear all AI cache
 */
export async function clearAllAICache(): Promise<void> {
  if (!redis) return;
  
  try {
    const keys = await redis.keys('ai:cache:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Cache] Cleared ${keys.length} cached responses`);
    }
  } catch (error) {
    console.error('[Cache Error]', error);
  }
}
