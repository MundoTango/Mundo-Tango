import Redis from 'ioredis';
import { cacheHits, cacheMisses } from '../monitoring/prometheus';

/**
 * Redis Caching System (CONDITIONAL)
 * Implements caching with automatic in-memory fallback when Redis unavailable
 */

// Redis client (singleton)
let redisClient: Redis | null = null;
let redisAvailable = false;
let inMemoryCache = new Map<string, { value: any; expiry: number }>();

// Check if Redis should be enabled - ONLY if REDIS_URL is explicitly set
const REDIS_ENABLED = Boolean(process.env.REDIS_URL);

export function getRedisClient(): Redis | null {
  if (!REDIS_ENABLED) {
    console.log('ℹ️ Redis cache disabled (REDIS_URL not set) - using in-memory fallback');
    return null;
  }
  
  if (!redisClient) {
    try {
      redisClient = new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: 0, // No retries
        retryStrategy: () => null, // Never retry
        enableOfflineQueue: false,
        lazyConnect: true, // Don't connect until needed
        enableReadyCheck: false,
      });
      
      redisClient.on('error', (err) => {
        console.warn('⚠️ Redis cache error:', err.message);
        redisAvailable = false;
      });
      
      redisClient.on('connect', () => {
        console.log('✅ Redis cache connected');
        redisAvailable = true;
      });
    } catch (error) {
      console.log('⚠️ Redis unavailable - using in-memory cache fallback');
      return null;
    }
  }
  
  return redisClient;
}

/**
 * Cache wrapper with automatic Redis/In-Memory fallback
 */
export class CacheService {
  private redis: Redis | null;
  private defaultTTL: number = 3600; // 1 hour
  
  constructor() {
    this.redis = getRedisClient();
    if (!this.redis) {
      console.log('ℹ️ Using in-memory cache (Redis unavailable)');
    }
  }
  
  /**
   * Get cached value (Redis or in-memory)
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      if (this.redis && redisAvailable) {
        const cached = await this.redis.get(key);
        if (cached) {
          cacheHits.inc({ cache_type: 'redis' });
          return JSON.parse(cached);
        }
        cacheMisses.inc({ cache_type: 'redis' });
        return null;
      }
      
      // Fallback to in-memory
      const cached = inMemoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        cacheHits.inc({ cache_type: 'memory' });
        return cached.value;
      }
      
      cacheMisses.inc({ cache_type: 'memory' });
      return null;
    } catch (error) {
      cacheMisses.inc({ cache_type: 'redis' });
      return null;
    }
  }
  
  /**
   * Set cache value with TTL (Redis or in-memory)
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    const expiry = ttl || this.defaultTTL;
    
    try {
      // Try Redis first
      if (this.redis && redisAvailable) {
        const serialized = JSON.stringify(value);
        await this.redis.setex(key, expiry, serialized);
        return true;
      }
      
      // Fallback to in-memory
      inMemoryCache.set(key, {
        value,
        expiry: Date.now() + (expiry * 1000),
      });
      return true;
    } catch (error) {
      // Silent fallback to in-memory
      inMemoryCache.set(key, {
        value,
        expiry: Date.now() + (expiry * 1000),
      });
      return true;
    }
  }
  
  /**
   * Delete cache key (Redis or in-memory)
   */
  async del(key: string): Promise<boolean> {
    try {
      if (this.redis && redisAvailable) {
        await this.redis.del(key);
      }
      inMemoryCache.delete(key);
      return true;
    } catch (error) {
      inMemoryCache.delete(key);
      return true;
    }
  }
  
  /**
   * Delete multiple keys matching pattern (Redis or in-memory)
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      if (this.redis && redisAvailable) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        return keys.length;
      }
      
      // In-memory pattern matching
      const regex = new RegExp(pattern.replace('*', '.*'));
      let count = 0;
      for (const key of inMemoryCache.keys()) {
        if (regex.test(key)) {
          inMemoryCache.delete(key);
          count++;
        }
      }
      return count;
    } catch (error) {
      return 0;
    }
  }
  
  /**
   * Cache-aside pattern helper
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch fresh data
    const fresh = await fetchFn();
    
    // Store in cache
    await this.set(key, fresh, ttl);
    
    return fresh;
  }
}

// Export singleton instance
export const cache = new CacheService();
console.log("✅ [DEBUG] redis-cache.ts module loading complete");

/**
 * Cache invalidation patterns
 */
export const CacheKeys = {
  // User data
  user: (userId: number) => `user:${userId}`,
  userProfile: (userId: number) => `user:${userId}:profile`,
  userFeed: (userId: number, page: number) => `user:${userId}:feed:${page}`,
  
  // Events
  event: (eventId: number) => `event:${eventId}`,
  events: (page: number) => `events:list:${page}`,
  eventRsvps: (eventId: number) => `event:${eventId}:rsvps`,
  userEvents: (userId: number) => `user:${userId}:events`,
  
  // Posts
  post: (postId: number) => `post:${postId}`,
  posts: (page: number) => `posts:list:${page}`,
  postComments: (postId: number) => `post:${postId}:comments`,
  
  // Housing
  housing: (listingId: number) => `housing:${listingId}`,
  housingList: (page: number) => `housing:list:${page}`,
  housingSearch: (query: string, page: number) => `housing:search:${query}:${page}`,
  
  // Life CEO
  lifeCeoAgents: () => `life-ceo:agents`,
  lifeCeoInsights: (userId: number) => `life-ceo:insights:${userId}`,
  lifeCeoMemories: (userId: number) => `life-ceo:memories:${userId}`,
  
  // Global stats
  stats: () => `stats:global`,
  leaderboard: () => `leaderboard`,
};

/**
 * Cache invalidation helpers
 */
export async function invalidateUserCache(userId: number) {
  await cache.delPattern(`user:${userId}:*`);
}

export async function invalidateEventCache(eventId: number) {
  await cache.del(CacheKeys.event(eventId));
  await cache.delPattern('events:list:*');
}

export async function invalidatePostCache(postId: number) {
  await cache.del(CacheKeys.post(postId));
  await cache.delPattern('posts:list:*');
}

export async function invalidateHousingCache(listingId: number) {
  await cache.del(CacheKeys.housing(listingId));
  await cache.delPattern('housing:*');
}
