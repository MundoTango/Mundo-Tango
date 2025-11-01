// ============================================================================
// OPTIONAL REDIS CONFIGURATION - Mundo Tango
// ============================================================================
// Gracefully handles missing Redis connection for BullMQ workers
// ============================================================================

import Redis from 'ioredis';

let redisClient: Redis | null = null;
let isRedisAvailable = false;

// Initialize Redis connection if REDIS_URL is available
export function initializeRedis(): Redis | null {
  if (!process.env.REDIS_URL) {
    console.log('ℹ️ Redis not configured. BullMQ workers will be disabled.');
    console.log('   Set REDIS_URL to enable automation workers.');
    return null;
  }

  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('⚠️ Redis connection failed after 3 retries');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 2000); // Exponential backoff
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
      isRedisAvailable = true;
    });

    redisClient.on('error', (error) => {
      console.warn('⚠️ Redis connection error:', error.message);
      isRedisAvailable = false;
    });

    redisClient.on('close', () => {
      console.log('ℹ️ Redis connection closed');
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    return null;
  }
}

// Check if Redis is available
export function isRedisConnected(): boolean {
  return isRedisAvailable && redisClient !== null;
}

// Get Redis client (or null if unavailable)
export function getRedisClient(): Redis | null {
  return redisClient;
}

// Graceful shutdown
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    console.log('✅ Redis connection closed gracefully');
  }
}

// Export for use in BullMQ workers
export { redisClient, isRedisAvailable };
