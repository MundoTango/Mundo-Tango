/**
 * Token Bucket Rate Limiter
 * Implements token bucket algorithm for AI platform rate limiting
 */

import { RATE_LIMITS } from '../config/openai-rate-limits';

interface TokenBucket {
  tokens: number;
  capacity: number;
  refillRate: number; // tokens per second
  lastRefill: number;
}

const buckets: Map<string, TokenBucket> = new Map();

function createBucket(platform: string, model: string): TokenBucket {
  const limits = RATE_LIMITS[platform]?.[model];
  if (!limits) {
    throw new Error(`No rate limits defined for ${platform}:${model}`);
  }
  
  return {
    tokens: limits.rpm,
    capacity: limits.rpm,
    refillRate: limits.rpm / 60, // per second
    lastRefill: Date.now()
  };
}

function refillBucket(bucket: TokenBucket): void {
  const now = Date.now();
  const elapsed = (now - bucket.lastRefill) / 1000; // seconds
  const newTokens = elapsed * bucket.refillRate;
  
  bucket.tokens = Math.min(bucket.capacity, bucket.tokens + newTokens);
  bucket.lastRefill = now;
}

/**
 * Acquire a token from the bucket
 * Returns true if token acquired, false if rate limited
 */
export async function acquireToken(platform: string, model: string): Promise<boolean> {
  const key = `${platform}:${model}`;
  
  if (!buckets.has(key)) {
    buckets.set(key, createBucket(platform, model));
  }
  
  const bucket = buckets.get(key)!;
  refillBucket(bucket);
  
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true; // Token acquired
  }
  
  return false; // Rate limit exceeded
}

/**
 * Wait for a token with timeout
 */
export async function waitForToken(platform: string, model: string, maxWaitMs: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    if (await acquireToken(platform, model)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
  }
  
  return false; // Timeout
}

/**
 * Get current token count for a platform
 */
export function getTokenCount(platform: string, model: string): number {
  const key = `${platform}:${model}`;
  const bucket = buckets.get(key);
  
  if (!bucket) return 0;
  
  refillBucket(bucket);
  return Math.floor(bucket.tokens);
}

/**
 * Reset token bucket for a platform
 */
export function resetTokenBucket(platform: string, model: string): void {
  const key = `${platform}:${model}`;
  buckets.delete(key);
  console.log(`[Rate Limiter] Reset bucket for ${key}`);
}

/**
 * Get all bucket states
 */
export function getAllBucketStates(): Record<string, { tokens: number; capacity: number }> {
  const states: Record<string, { tokens: number; capacity: number }> = {};
  
  buckets.forEach((bucket, key) => {
    refillBucket(bucket);
    states[key] = {
      tokens: Math.floor(bucket.tokens),
      capacity: bucket.capacity
    };
  });
  
  return states;
}
