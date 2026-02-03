import { EventEmitter } from 'events';

export interface TokenBucketConfig {
  requestsPerSecond: number;
  burstCapacity: number;
  tokensPerMinute?: number;
  requestsPerDay?: number;
}

export interface PlatformLimits {
  [model: string]: TokenBucketConfig;
}

export interface RateLimitConfig {
  [platform: string]: PlatformLimits;
}

export interface TokenBucket {
  tokens: number;
  capacity: number;
  burstCapacity: number;
  refillRate: number;
  lastRefill: number;
  requestsToday: number;
  dailyResetTime: number;
}

export interface QueuedRequest {
  resolve: (value: boolean) => void;
  reject: (error: Error) => void;
  timestamp: number;
  priority: number;
  platform: string;
  model: string;
}

export interface RateLimitMetrics {
  platform: string;
  model: string;
  totalRequests: number;
  successfulRequests: number;
  rateLimitedRequests: number;
  queuedRequests: number;
  averageWaitTime: number;
  burstUsage: number;
  currentTokens: number;
  capacity: number;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  openai: {
    'gpt-4o': {
      requestsPerSecond: 10,
      burstCapacity: 50,
      tokensPerMinute: 30_000,
      requestsPerDay: 10_000
    },
    'gpt-4o-mini': {
      requestsPerSecond: 10,
      burstCapacity: 50,
      tokensPerMinute: 200_000,
      requestsPerDay: 10_000
    },
    'gpt-4-turbo': {
      requestsPerSecond: 10,
      burstCapacity: 50,
      tokensPerMinute: 30_000,
      requestsPerDay: 10_000
    }
  },
  anthropic: {
    'claude-3-5-sonnet-20241022': {
      requestsPerSecond: 5,
      burstCapacity: 25,
      tokensPerMinute: 40_000,
      requestsPerDay: 5_000
    },
    'claude-3-5-haiku-20241022': {
      requestsPerSecond: 5,
      burstCapacity: 25,
      tokensPerMinute: 50_000,
      requestsPerDay: 5_000
    },
    'claude-3-opus-20240229': {
      requestsPerSecond: 5,
      burstCapacity: 25,
      tokensPerMinute: 20_000,
      requestsPerDay: 5_000
    }
  },
  groq: {
    'llama-3.1-70b-versatile': {
      requestsPerSecond: 0.5,
      burstCapacity: 10,
      tokensPerMinute: 14_400,
      requestsPerDay: 14_400
    },
    'llama-3.1-8b-instant': {
      requestsPerSecond: 0.5,
      burstCapacity: 10,
      tokensPerMinute: 20_000,
      requestsPerDay: 20_000
    },
    'mixtral-8x7b-32768': {
      requestsPerSecond: 0.5,
      burstCapacity: 10,
      tokensPerMinute: 5_000,
      requestsPerDay: 5_000
    }
  },
  gemini: {
    'gemini-1.5-flash': {
      requestsPerSecond: 1,
      burstCapacity: 100,
      tokensPerMinute: 4_000_000,
      requestsPerDay: 1_500
    },
    'gemini-2.5-flash-lite': {
      requestsPerSecond: 1,
      burstCapacity: 100,
      tokensPerMinute: 1_000_000,
      requestsPerDay: 1_500
    },
    'gemini-1.5-pro': {
      requestsPerSecond: 1,
      burstCapacity: 100,
      tokensPerMinute: 4_000_000,
      requestsPerDay: 1_000
    },
    'gemini-2.5-flash': {
      requestsPerSecond: 1,
      burstCapacity: 100,
      tokensPerMinute: 4_000_000,
      requestsPerDay: 1_500
    }
  },
  openrouter: {
    'meta-llama/llama-3-70b': {
      requestsPerSecond: 10,
      burstCapacity: 50,
      tokensPerMinute: 100_000,
      requestsPerDay: 10_000
    },
    'anthropic/claude-3-sonnet': {
      requestsPerSecond: 10,
      burstCapacity: 50,
      tokensPerMinute: 40_000,
      requestsPerDay: 10_000
    }
  }
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2
};

export class RateLimiterService extends EventEmitter {
  private buckets: Map<string, TokenBucket> = new Map();
  private queues: Map<string, QueuedRequest[]> = new Map();
  private metrics: Map<string, RateLimitMetrics> = new Map();
  private processingQueues: Set<string> = new Set();

  constructor() {
    super();
    this.startDailyResetTimer();
  }

  private getBucketKey(platform: string, model: string): string {
    return `${platform}:${model}`;
  }

  private initializeBucket(platform: string, model: string): void {
    const key = this.getBucketKey(platform, model);
    
    if (this.buckets.has(key)) {
      return;
    }

    const config = RATE_LIMIT_CONFIG[platform]?.[model];
    
    if (!config) {
      console.warn(`[RateLimiter] No config found for ${platform}:${model}, using defaults`);
      
      const defaultConfig: TokenBucketConfig = {
        requestsPerSecond: 10,
        burstCapacity: 50,
        tokensPerMinute: 100_000,
        requestsPerDay: 10_000
      };
      
      this.buckets.set(key, {
        tokens: defaultConfig.burstCapacity,
        capacity: defaultConfig.requestsPerSecond,
        burstCapacity: defaultConfig.burstCapacity,
        refillRate: defaultConfig.requestsPerSecond,
        lastRefill: Date.now(),
        requestsToday: 0,
        dailyResetTime: this.getNextMidnight()
      });

      this.initializeMetrics(platform, model);
      return;
    }

    this.buckets.set(key, {
      tokens: config.burstCapacity,
      capacity: config.requestsPerSecond,
      burstCapacity: config.burstCapacity,
      refillRate: config.requestsPerSecond,
      lastRefill: Date.now(),
      requestsToday: 0,
      dailyResetTime: this.getNextMidnight()
    });

    this.initializeMetrics(platform, model);
    
    console.log(
      `[RateLimiter] ✅ Initialized ${key} | ` +
      `Rate: ${config.requestsPerSecond} req/s | ` +
      `Burst: ${config.burstCapacity} | ` +
      `TPM: ${config.tokensPerMinute?.toLocaleString() || 'N/A'}`
    );
  }

  private initializeMetrics(platform: string, model: string): void {
    const key = this.getBucketKey(platform, model);
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        platform,
        model,
        totalRequests: 0,
        successfulRequests: 0,
        rateLimitedRequests: 0,
        queuedRequests: 0,
        averageWaitTime: 0,
        burstUsage: 0,
        currentTokens: 0,
        capacity: 0
      });
    }
  }

  private refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    const newTokens = elapsedSeconds * bucket.refillRate;

    bucket.tokens = Math.min(bucket.burstCapacity, bucket.tokens + newTokens);
    bucket.lastRefill = now;
  }

  private checkDailyLimit(bucket: TokenBucket, platform: string, model: string): boolean {
    const now = Date.now();
    
    if (now >= bucket.dailyResetTime) {
      bucket.requestsToday = 0;
      bucket.dailyResetTime = this.getNextMidnight();
      console.log(`[RateLimiter] 🔄 Daily limit reset for ${platform}:${model}`);
    }

    const config = RATE_LIMIT_CONFIG[platform]?.[model];
    const dailyLimit = config?.requestsPerDay;

    if (dailyLimit && bucket.requestsToday >= dailyLimit) {
      console.warn(`[RateLimiter] ⚠️  Daily limit reached for ${platform}:${model} (${dailyLimit} requests)`);
      return false;
    }

    return true;
  }

  private getNextMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  private updateMetrics(key: string, success: boolean, waitTime: number = 0, queued: boolean = false): void {
    const metrics = this.metrics.get(key);
    if (!metrics) return;

    metrics.totalRequests++;
    
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.rateLimitedRequests++;
    }

    if (queued) {
      metrics.queuedRequests++;
    }

    if (waitTime > 0) {
      const totalWaitTime = metrics.averageWaitTime * (metrics.totalRequests - 1) + waitTime;
      metrics.averageWaitTime = totalWaitTime / metrics.totalRequests;
    }

    const bucket = this.buckets.get(key);
    if (bucket) {
      metrics.currentTokens = bucket.tokens;
      metrics.capacity = bucket.capacity;
      metrics.burstUsage = Math.max(0, bucket.burstCapacity - bucket.tokens);
    }
  }

  public async acquireToken(
    platform: string,
    model: string,
    options: {
      priority?: number;
      maxWaitMs?: number;
      useQueue?: boolean;
    } = {}
  ): Promise<boolean> {
    const {
      priority = 0,
      maxWaitMs = 30000,
      useQueue = true
    } = options;

    this.initializeBucket(platform, model);
    
    const key = this.getBucketKey(platform, model);
    const bucket = this.buckets.get(key)!;
    const startTime = Date.now();

    this.refillBucket(bucket);

    if (!this.checkDailyLimit(bucket, platform, model)) {
      this.updateMetrics(key, false);
      return false;
    }

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      bucket.requestsToday++;
      this.updateMetrics(key, true);
      
      console.log(
        `[RateLimiter] ✅ Token acquired for ${key} | ` +
        `Remaining: ${bucket.tokens.toFixed(2)}/${bucket.burstCapacity} | ` +
        `Daily: ${bucket.requestsToday}`
      );
      
      return true;
    }

    if (!useQueue) {
      this.updateMetrics(key, false);
      console.log(`[RateLimiter] ⚠️  Rate limited ${key} (no queue)`);
      return false;
    }

    console.log(`[RateLimiter] 🔄 Queueing request for ${key} (priority: ${priority})`);
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.removeFromQueue(key, queuedRequest);
        const waitTime = Date.now() - startTime;
        this.updateMetrics(key, false, waitTime, true);
        reject(new Error(`Rate limit wait timeout after ${maxWaitMs}ms for ${key}`));
      }, maxWaitMs);

      const queuedRequest: QueuedRequest = {
        resolve: (value: boolean) => {
          clearTimeout(timeoutId);
          const waitTime = Date.now() - startTime;
          this.updateMetrics(key, value, waitTime, true);
          resolve(value);
        },
        reject: (error: Error) => {
          clearTimeout(timeoutId);
          const waitTime = Date.now() - startTime;
          this.updateMetrics(key, false, waitTime, true);
          reject(error);
        },
        timestamp: Date.now(),
        priority,
        platform,
        model
      };

      this.addToQueue(key, queuedRequest);
      this.processQueue(key);
    });
  }

  private addToQueue(key: string, request: QueuedRequest): void {
    if (!this.queues.has(key)) {
      this.queues.set(key, []);
    }

    const queue = this.queues.get(key)!;
    queue.push(request);

    queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });

    this.emit('queueUpdated', { key, queueLength: queue.length });
  }

  private removeFromQueue(key: string, request: QueuedRequest): void {
    const queue = this.queues.get(key);
    if (!queue) return;

    const index = queue.indexOf(request);
    if (index > -1) {
      queue.splice(index, 1);
    }
  }

  private async processQueue(key: string): Promise<void> {
    if (this.processingQueues.has(key)) {
      return;
    }

    this.processingQueues.add(key);

    try {
      const queue = this.queues.get(key);
      if (!queue || queue.length === 0) {
        return;
      }

      const bucket = this.buckets.get(key);
      if (!bucket) {
        return;
      }

      while (queue.length > 0) {
        this.refillBucket(bucket);

        if (bucket.tokens < 1) {
          const waitTime = (1 / bucket.refillRate) * 1000;
          await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 1000)));
          continue;
        }

        const request = queue.shift();
        if (!request) break;

        if (!this.checkDailyLimit(bucket, request.platform, request.model)) {
          request.reject(new Error(`Daily limit reached for ${key}`));
          continue;
        }

        bucket.tokens -= 1;
        bucket.requestsToday++;
        
        console.log(
          `[RateLimiter] ✅ Queue processed for ${key} | ` +
          `Queue: ${queue.length} remaining | ` +
          `Tokens: ${bucket.tokens.toFixed(2)}`
        );
        
        request.resolve(true);
        this.emit('queueProcessed', { key, remainingQueue: queue.length });
      }
    } finally {
      this.processingQueues.delete(key);
    }
  }

  public async executeWithRetry<T>(
    platform: string,
    model: string,
    operation: () => Promise<T>,
    retryConfig: Partial<RetryConfig> = {}
  ): Promise<T> {
    const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const tokenAcquired = await this.acquireToken(platform, model, {
          maxWaitMs: config.maxDelayMs,
          useQueue: true,
          priority: attempt
        });

        if (!tokenAcquired) {
          throw new Error(`Rate limit exceeded for ${platform}:${model}`);
        }

        const result = await operation();
        
        if (attempt > 0) {
          console.log(`[RateLimiter] ✅ Retry successful on attempt ${attempt + 1} for ${platform}:${model}`);
        }
        
        return result;
        
      } catch (error: any) {
        lastError = error;

        const isRateLimitError = 
          error?.status === 429 ||
          error?.message?.toLowerCase().includes('rate limit') ||
          error?.message?.toLowerCase().includes('quota exceeded');

        if (!isRateLimitError && attempt === 0) {
          throw error;
        }

        if (attempt < config.maxRetries) {
          const delay = Math.min(
            config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
            config.maxDelayMs
          );

          const jitter = Math.random() * 1000;
          const totalDelay = delay + jitter;

          console.log(
            `[RateLimiter] ⚠️  Retry attempt ${attempt + 1}/${config.maxRetries} ` +
            `for ${platform}:${model} after ${totalDelay.toFixed(0)}ms | ` +
            `Error: ${error?.message || 'Unknown'}`
          );

          await new Promise(resolve => setTimeout(resolve, totalDelay));
        }
      }
    }

    throw lastError || new Error(`Failed after ${config.maxRetries} retries for ${platform}:${model}`);
  }

  public getMetrics(platform?: string, model?: string): RateLimitMetrics[] {
    if (platform && model) {
      const key = this.getBucketKey(platform, model);
      const metrics = this.metrics.get(key);
      return metrics ? [metrics] : [];
    }

    if (platform) {
      return Array.from(this.metrics.values()).filter(m => m.platform === platform);
    }

    return Array.from(this.metrics.values());
  }

  public getQueueLength(platform: string, model: string): number {
    const key = this.getBucketKey(platform, model);
    const queue = this.queues.get(key);
    return queue ? queue.length : 0;
  }

  public getCurrentTokens(platform: string, model: string): number {
    const key = this.getBucketKey(platform, model);
    const bucket = this.buckets.get(key);
    
    if (!bucket) {
      return 0;
    }

    this.refillBucket(bucket);
    return bucket.tokens;
  }

  public resetBucket(platform: string, model: string): void {
    const key = this.getBucketKey(platform, model);
    const bucket = this.buckets.get(key);

    if (bucket) {
      bucket.tokens = bucket.burstCapacity;
      bucket.requestsToday = 0;
      bucket.lastRefill = Date.now();
      console.log(`[RateLimiter] 🔄 Reset bucket for ${key}`);
    }

    const queue = this.queues.get(key);
    if (queue) {
      queue.forEach(req => req.reject(new Error('Bucket reset')));
      this.queues.set(key, []);
    }

    const metrics = this.metrics.get(key);
    if (metrics) {
      metrics.totalRequests = 0;
      metrics.successfulRequests = 0;
      metrics.rateLimitedRequests = 0;
      metrics.queuedRequests = 0;
      metrics.averageWaitTime = 0;
    }
  }

  public getAllMetricsSummary(): {
    totalPlatforms: number;
    totalRequests: number;
    totalSuccessful: number;
    totalRateLimited: number;
    totalQueued: number;
    averageWaitTime: number;
    platformBreakdown: Record<string, {
      requests: number;
      successful: number;
      rateLimited: number;
      queued: number;
    }>;
  } {
    const allMetrics = Array.from(this.metrics.values());
    
    const platformBreakdown: Record<string, {
      requests: number;
      successful: number;
      rateLimited: number;
      queued: number;
    }> = {};

    allMetrics.forEach(m => {
      if (!platformBreakdown[m.platform]) {
        platformBreakdown[m.platform] = {
          requests: 0,
          successful: 0,
          rateLimited: 0,
          queued: 0
        };
      }

      platformBreakdown[m.platform].requests += m.totalRequests;
      platformBreakdown[m.platform].successful += m.successfulRequests;
      platformBreakdown[m.platform].rateLimited += m.rateLimitedRequests;
      platformBreakdown[m.platform].queued += m.queuedRequests;
    });

    return {
      totalPlatforms: new Set(allMetrics.map(m => m.platform)).size,
      totalRequests: allMetrics.reduce((sum, m) => sum + m.totalRequests, 0),
      totalSuccessful: allMetrics.reduce((sum, m) => sum + m.successfulRequests, 0),
      totalRateLimited: allMetrics.reduce((sum, m) => sum + m.rateLimitedRequests, 0),
      totalQueued: allMetrics.reduce((sum, m) => sum + m.queuedRequests, 0),
      averageWaitTime: allMetrics.reduce((sum, m) => sum + m.averageWaitTime, 0) / (allMetrics.length || 1),
      platformBreakdown
    };
  }

  private startDailyResetTimer(): void {
    const checkInterval = 60 * 60 * 1000;

    setInterval(() => {
      const now = Date.now();
      
      this.buckets.forEach((bucket, key) => {
        if (now >= bucket.dailyResetTime) {
          bucket.requestsToday = 0;
          bucket.dailyResetTime = this.getNextMidnight();
          console.log(`[RateLimiter] 🔄 Daily reset for ${key}`);
        }
      });
    }, checkInterval);
  }

  public isRateLimited(platform: string, model: string): boolean {
    const key = this.getBucketKey(platform, model);
    const bucket = this.buckets.get(key);

    if (!bucket) {
      return false;
    }

    this.refillBucket(bucket);

    return bucket.tokens < 1 || !this.checkDailyLimit(bucket, platform, model);
  }

  public getTimeUntilNextToken(platform: string, model: string): number {
    const key = this.getBucketKey(platform, model);
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.tokens >= 1) {
      return 0;
    }

    const tokensNeeded = 1 - bucket.tokens;
    const timeMs = (tokensNeeded / bucket.refillRate) * 1000;

    return Math.ceil(timeMs);
  }
}

export const rateLimiter = new RateLimiterService();
