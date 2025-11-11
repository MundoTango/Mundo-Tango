import { Request, Response, NextFunction } from "express";

/**
 * API Caching Middleware
 * In-memory cache for API responses with TTL support
 * Falls back to memory when Redis is unavailable
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// In-memory cache store
const cache = new Map<string, CacheEntry>();

// Cache statistics
let cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
};

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 5 minutes)
  key?: (req: Request) => string; // Custom key generator
  condition?: (req: Request) => boolean; // When to cache
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req: Request): string {
  const userId = (req as any).user?.id || "anonymous";
  return `${req.method}:${req.path}:${userId}:${JSON.stringify(req.query)}`;
}

/**
 * Cache middleware
 */
export function cacheResponse(options: CacheOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    key = generateCacheKey,
    condition = () => true,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Check condition
    if (!condition(req)) {
      return next();
    }

    const cacheKey = key(req);

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached) {
      const now = Date.now();
      const age = (now - cached.timestamp) / 1000;

      // Check if still valid
      if (age < cached.ttl) {
        cacheStats.hits++;
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Cache-Age", age.toFixed(2));
        return res.json(cached.data);
      } else {
        // Expired, delete it
        cache.delete(cacheKey);
      }
    }

    cacheStats.misses++;

    // Capture response
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      // Store in cache
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl,
      });
      cacheStats.sets++;

      res.setHeader("X-Cache", "MISS");
      return originalJson(data);
    };

    next();
  };
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCache(pattern: string | RegExp) {
  let count = 0;

  for (const [key] of cache.entries()) {
    if (typeof pattern === "string") {
      if (key.includes(pattern)) {
        cache.delete(key);
        count++;
      }
    } else {
      if (pattern.test(key)) {
        cache.delete(key);
        count++;
      }
    }
  }

  cacheStats.deletes += count;
  return count;
}

/**
 * Clear entire cache
 */
export function clearCache() {
  const count = cache.size;
  cache.clear();
  cacheStats.deletes += count;
  return count;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    ...cacheStats,
    size: cache.size,
    hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0,
  };
}

/**
 * Middleware to invalidate cache on mutations
 */
export function invalidateCacheOnMutation(patterns: (string | RegExp)[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only for mutating methods
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      return next();
    }

    // Invalidate after response
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach((pattern) => {
          invalidateCache(pattern);
        });
      }
    });

    next();
  };
}

/**
 * Cleanup expired cache entries periodically
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  let count = 0;

  for (const [key, entry] of cache.entries()) {
    const age = (now - entry.timestamp) / 1000;
    if (age >= entry.ttl) {
      cache.delete(key);
      count++;
    }
  }

  if (count > 0) {
    cacheStats.deletes += count;
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

export default cacheResponse;
