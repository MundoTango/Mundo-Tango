import Redis from 'ioredis';
import { cacheHits, cacheMisses } from '../monitoring/prometheus';

/**
 * Redis Caching System
 * Implements caching strategies with invalidation patterns
 */

// Redis client (singleton)
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    
    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }
  
  return redisClient;
}

/**
 * Cache wrapper with automatic hit/miss tracking
 */
export class CacheService {
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour
  
  constructor() {
    this.redis = getRedisClient();
  }
  
  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      
      if (cached) {
        cacheHits.inc({ cache_type: 'redis' });
        return JSON.parse(cached);
      }
      
      cacheMisses.inc({ cache_type: 'redis' });
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      cacheMisses.inc({ cache_type: 'redis' });
      return null;
    }
  }
  
  /**
   * Set cache value with TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.defaultTTL;
      
      await this.redis.setex(key, expiry, serialized);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }
  
  /**
   * Delete cache key
   */
  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }
  
  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
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
