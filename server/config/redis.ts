// ============================================================================
// REDIS CONNECTION EXPORT - Mundo Tango
// ============================================================================
// Provides redisConnection export for BullMQ workers
// Delegates to redis-optional.ts for actual Redis client management
// ============================================================================

import { getRedisClient, initializeRedis, isRedisConnected } from './redis-optional';

// Initialize Redis on module load
const redisConnection = initializeRedis();

// Export for BullMQ workers
export { redisConnection, isRedisConnected, getRedisClient };
