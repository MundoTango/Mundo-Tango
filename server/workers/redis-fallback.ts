/**
 * REDIS FALLBACK SYSTEM
 * Provides in-memory queue when Redis is unavailable
 * MB.MD Wave 1.1: Fix Redis ECONNREFUSED
 */

import { Worker, Job, Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");

// In-memory queue fallback
class InMemoryQueue {
  private jobs: Map<string, any[]> = new Map();
  private handlers: Map<string, (job: any) => Promise<void>> = new Map();
  
  constructor(private name: string) {
    this.jobs.set(name, []);
  }

  async add(jobName: string, data: any) {
    const job = {
      id: `${Date.now()}-${Math.random()}`,
      name: jobName,
      data,
      timestamp: new Date(),
    };
    
    const queue = this.jobs.get(this.name) || [];
    queue.push(job);
    this.jobs.set(this.name, queue);
    
    console.log(`📥 [IN-MEMORY QUEUE ${this.name}] Added job: ${jobName}`);
    
    // Process immediately
    setTimeout(() => this.processNext(), 10);
    
    return job;
  }

  async processNext() {
    const queue = this.jobs.get(this.name) || [];
    if (queue.length === 0) return;
    
    const job = queue.shift()!;
    this.jobs.set(this.name, queue);
    
    const handler = this.handlers.get(this.name);
    if (handler) {
      try {
        await handler(job);
        console.log(`✅ [IN-MEMORY QUEUE ${this.name}] Completed: ${job.name}`);
      } catch (error: any) {
        console.error(`❌ [IN-MEMORY QUEUE ${this.name}] Failed: ${job.name}`, error.message);
      }
    }
  }

  setHandler(handler: (job: any) => Promise<void>) {
    this.handlers.set(this.name, handler);
  }
}

// Redis connection with fallback
let redis: IORedis | null = null;
let redisAvailable = false;
const inMemoryQueues = new Map<string, InMemoryQueue>();

async function testRedisConnection(): Promise<boolean> {
  try {
    const testClient = new IORedis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't retry
      enableOfflineQueue: false,
      lazyConnect: true, // Don't connect immediately
    });

    // Add error handler to prevent unhandled error events
    testClient.on('error', (err) => {
      // Silently ignore errors during connection test
    });

    await testClient.connect();
    await testClient.ping();
    await testClient.quit();
    return true;
  } catch (error) {
    return false;
  }
}

export async function initializeRedis() {
  console.log(`🔍 Testing Redis connection at ${REDIS_HOST}:${REDIS_PORT}...`);
  
  redisAvailable = await testRedisConnection();
  
  if (redisAvailable) {
    console.log("✅ Redis available - using BullMQ with Redis");
    redis = new IORedis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      maxRetriesPerRequest: 3,
    });

    // Add error handler to prevent crashes
    redis.on('error', (err) => {
      console.error('⚠️  Redis connection error:', err.message);
      redisAvailable = false;
    });

    redis.on('close', () => {
      console.log('ℹ️  Redis connection closed');
      redisAvailable = false;
    });
  } else {
    console.log("⚠️  Redis unavailable - using IN-MEMORY queue fallback");
    console.log("⚠️  Note: Jobs will not persist across restarts");
    redis = null;
  }
}

export function getRedisConnection(): IORedis | null {
  return redis;
}

export function isRedisAvailable(): boolean {
  return redisAvailable;
}

// Queue factory with automatic fallback
export function createQueue(name: string): Queue | InMemoryQueue {
  if (redisAvailable && redis) {
    return new Queue(name, { connection: redis });
  } else {
    let queue = inMemoryQueues.get(name);
    if (!queue) {
      queue = new InMemoryQueue(name);
      inMemoryQueues.set(name, queue);
    }
    return queue as any;
  }
}

// Worker factory with automatic fallback
export function createWorker(
  name: string,
  processor: (job: Job) => Promise<void>,
  options?: any
): Worker | InMemoryQueue {
  if (redisAvailable && redis) {
    return new Worker(name, processor, {
      ...options,
      connection: redis,
    });
  } else {
    let queue = inMemoryQueues.get(name);
    if (!queue) {
      queue = new InMemoryQueue(name);
      inMemoryQueues.set(name, queue);
    }
    queue.setHandler(processor);
    return queue as any;
  }
}

// Initialize on module load (with proper async handling)
initializeRedis().catch((error) => {
  console.error('⚠️  Failed to initialize Redis:', error.message);
  console.log('⚠️  Continuing with in-memory queue fallback');
  redisAvailable = false;
  redis = null;
});
