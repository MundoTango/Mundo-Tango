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

export interface AcquireTokenOptions {
  priority?: number;
  maxWaitMs?: number;
  useQueue?: boolean;
}

export interface MetricsSummary {
  totalPlatforms: number;
  totalRequests: number;
  totalSuccessful: number;
  totalRateLimited: number;
  totalQueued: number;
  averageWaitTime: number;
  platformBreakdown: Record<string, PlatformMetrics>;
}

export interface PlatformMetrics {
  requests: number;
  successful: number;
  rateLimited: number;
  queued: number;
}

export interface RateLimitStatus {
  platform: string;
  model: string;
  isLimited: boolean;
  currentTokens: number;
  capacity: number;
  burstCapacity: number;
  queueLength: number;
  timeUntilNextToken: number;
  dailyUsage: number;
  dailyLimit?: number;
}

export type AIPlatform = 'openai' | 'anthropic' | 'groq' | 'gemini' | 'openrouter';

export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo';
export type AnthropicModel = 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022' | 'claude-3-opus-20240229';
export type GroqModel = 'llama-3.1-70b-versatile' | 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768';
export type GeminiModel = 'gemini-1.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-1.5-pro' | 'gemini-2.5-flash';
export type OpenRouterModel = 'meta-llama/llama-3-70b' | 'anthropic/claude-3-sonnet';

export type AIModel = OpenAIModel | AnthropicModel | GroqModel | GeminiModel | OpenRouterModel;

export interface RateLimiterEvents {
  'queueUpdated': (data: { key: string; queueLength: number }) => void;
  'queueProcessed': (data: { key: string; remainingQueue: number }) => void;
  'bucketRefilled': (data: { key: string; tokens: number }) => void;
  'dailyReset': (data: { key: string; timestamp: number }) => void;
  'rateLimitExceeded': (data: { key: string; platform: string; model: string }) => void;
}

export interface RateLimitError extends Error {
  platform: string;
  model: string;
  retryAfter?: number;
  dailyLimitReached?: boolean;
}
