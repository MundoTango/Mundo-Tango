/**
 * Groq Service Wrapper
 * Ultra-fast inference with Llama models (FREE but rate-limited)
 * 
 * PERFORMANCE:
 * - Llama 3.1 70B Versatile: 250 tokens/sec (Reasoning, Analysis)
 * - Llama 3.1 8B Instant: 877 tokens/sec (Ultra-fast chat)
 * - Llama 3.3 70B Versatile: 250 tokens/sec (Latest version)
 * 
 * RATE LIMITS:
 * - 70B: 30 req/min, 14,400 tokens/min, 14,400 req/day
 * - 8B: 30 req/min, 20,000 tokens/min, 20,000 req/day
 * 
 * PRICING: FREE (but rate-limited)
 */

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

/**
 * Model configurations with performance characteristics
 */
const MODEL_CONFIG: Record<string, {
  tokensPerSecond: number;
  context: number;
  rateLimit: { rpm: number; tpm: number; rpd: number };
  description: string;
}> = {
  'llama-3.1-70b-versatile': {
    tokensPerSecond: 250,
    context: 8000,
    rateLimit: { rpm: 30, tpm: 14_400, rpd: 14_400 },
    description: 'Fast reasoning and analysis (70B parameters)'
  },
  'llama-3.1-8b-instant': {
    tokensPerSecond: 877,
    context: 8000,
    rateLimit: { rpm: 30, tpm: 20_000, rpd: 20_000 },
    description: 'Ultra-fast chat and simple tasks (8B parameters)'
  },
  'llama-3.3-70b-versatile': {
    tokensPerSecond: 250,
    context: 8000,
    rateLimit: { rpm: 30, tpm: 14_400, rpd: 14_400 },
    description: 'Latest 70B model with improved capabilities'
  },
};

/**
 * Model aliases for easier use
 */
export const GROQ_MODELS = {
  LLAMA_70B: 'llama-3.1-70b-versatile',
  LLAMA_8B: 'llama-3.1-8b-instant',
  LLAMA_70B_LATEST: 'llama-3.3-70b-versatile',
} as const;

/**
 * Rate limiting tracker (in-memory token bucket)
 */
interface TokenBucket {
  tokens: number;
  capacity: number;
  refillRate: number;
  lastRefill: number;
}

const rateLimitBuckets: Map<string, TokenBucket> = new Map();

/**
 * Initialize rate limit bucket for a model
 */
function initRateLimitBucket(model: string): void {
  if (rateLimitBuckets.has(model)) return;

  const config = MODEL_CONFIG[model];
  if (!config) {
    console.warn(`[GroqService] Unknown model: ${model}, using default rate limits`);
    return;
  }

  rateLimitBuckets.set(model, {
    tokens: config.rateLimit.rpm,
    capacity: config.rateLimit.rpm,
    refillRate: config.rateLimit.rpm / 60, // tokens per second
    lastRefill: Date.now()
  });

  console.log(`[GroqService] Initialized rate limit bucket for ${model}: ${config.rateLimit.rpm} req/min`);
}

/**
 * Refill token bucket based on elapsed time
 */
function refillBucket(bucket: TokenBucket): void {
  const now = Date.now();
  const elapsedSeconds = (now - bucket.lastRefill) / 1000;
  const newTokens = elapsedSeconds * bucket.refillRate;

  bucket.tokens = Math.min(bucket.capacity, bucket.tokens + newTokens);
  bucket.lastRefill = now;
}

/**
 * Check and consume rate limit token
 */
async function checkRateLimit(model: string, waitIfNeeded: boolean = true): Promise<boolean> {
  initRateLimitBucket(model);
  
  const bucket = rateLimitBuckets.get(model);
  if (!bucket) return true; // No bucket = no limits (shouldn't happen)

  refillBucket(bucket);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }

  // Rate limited
  if (!waitIfNeeded) {
    return false;
  }

  // Wait for token to become available (max 5 seconds)
  const maxWaitMs = 5000;
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(resolve => setTimeout(resolve, 100));
    refillBucket(bucket);
    
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      console.log(`[GroqService] Rate limit wait successful for ${model}`);
      return true;
    }
  }

  console.warn(`[GroqService] Rate limit timeout for ${model} after ${maxWaitMs}ms`);
  return false;
}

/**
 * Validate API key is configured
 */
function validateApiKey(): void {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('[GroqService] GROQ_API_KEY environment variable is not set');
  }
}

/**
 * Validate model name
 */
function validateModel(model: string): void {
  if (!MODEL_CONFIG[model]) {
    throw new Error(
      `[GroqService] Invalid model: ${model}. Supported models: ${Object.keys(MODEL_CONFIG).join(', ')}`
    );
  }
}

/**
 * Calculate estimated response time based on tokens and model speed
 */
function estimateResponseTime(model: string, maxTokens: number): number {
  const config = MODEL_CONFIG[model];
  if (!config) return 1000; // Default 1 second

  // Response time = tokens / tokens-per-second * 1000ms
  return Math.ceil((maxTokens / config.tokensPerSecond) * 1000);
}

export interface GroqQueryParams {
  prompt: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  waitForRateLimit?: boolean;
}

export interface GroqResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: number;
  model: string;
  speed: {
    latencyMs: number;
    tokensPerSecond: number;
    estimatedMs: number;
  };
}

export interface GroqStreamChunk {
  content: string;
  isComplete: boolean;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  speed?: {
    latencyMs: number;
    tokensPerSecond: number;
  };
}

export type StreamCallback = (chunk: GroqStreamChunk) => void;

export class GroqService {
  /**
   * Standard query method with rate limiting and error handling
   */
  static async query({
    prompt,
    model = GROQ_MODELS.LLAMA_70B,
    systemPrompt = 'You are a helpful AI assistant.',
    temperature = 0.7,
    maxTokens = 1000,
    waitForRateLimit = true
  }: GroqQueryParams): Promise<GroqResponse> {
    try {
      validateApiKey();
      validateModel(model);

      // Check rate limit
      const rateLimitOk = await checkRateLimit(model, waitForRateLimit);
      if (!rateLimitOk) {
        throw new Error(`[GroqService] Rate limit exceeded for ${model}. Try again in a few seconds or use a different model.`);
      }

      const estimatedMs = estimateResponseTime(model, maxTokens);
      console.log(
        `[GroqService] Querying ${model} (max ${maxTokens} tokens, est. ${estimatedMs}ms @ ${MODEL_CONFIG[model].tokensPerSecond} tok/s)`
      );

      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: Math.max(0, Math.min(2, temperature)), // Groq supports 0-2
        max_tokens: maxTokens,
      });

      const latency = Date.now() - startTime;

      const content = completion.choices[0]?.message?.content || '';
      const usage = {
        inputTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0
      };

      // Calculate actual tokens per second
      const actualTokensPerSecond = usage.outputTokens / (latency / 1000);

      console.log(
        `[GroqService] ✅ ${model} | ${latency}ms | ${usage.totalTokens} tokens | ${actualTokensPerSecond.toFixed(0)} tok/s | FREE`
      );

      return {
        content,
        usage,
        cost: 0, // Groq is FREE
        model,
        speed: {
          latencyMs: latency,
          tokensPerSecond: actualTokensPerSecond,
          estimatedMs
        }
      };
    } catch (error: any) {
      console.error(`[GroqService] ❌ Error:`, error);

      // Enhanced error handling
      if (error?.message?.includes('GROQ_API_KEY')) {
        throw error; // Re-throw validation errors
      }

      if (error?.status === 401 || error?.error?.type === 'invalid_api_key') {
        throw new Error('[GroqService] Invalid API key. Please check GROQ_API_KEY environment variable.');
      }

      if (error?.status === 429 || error?.error?.type === 'rate_limit_exceeded') {
        throw new Error(
          `[GroqService] Rate limit exceeded for ${model}. ` +
          `Groq limits: 30 req/min. Please try again in a minute or use a fallback provider.`
        );
      }

      if (error?.status === 400 || error?.error?.type === 'invalid_request_error') {
        throw new Error(`[GroqService] Invalid request: ${error?.error?.message || error?.message || 'Bad request'}`);
      }

      if (error?.status === 500 || error?.status === 503) {
        throw new Error('[GroqService] Groq API is currently unavailable. Please try again or use a fallback provider.');
      }

      if (error?.error?.type === 'server_error') {
        throw new Error('[GroqService] Groq server error. Please try again or use a fallback model.');
      }

      // Generic error
      throw new Error(`[GroqService] Failed to query Groq: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Simple query method (for backward compatibility)
   */
  static async querySimple({
    prompt,
    model = GROQ_MODELS.LLAMA_70B,
    systemPrompt,
    temperature,
    maxTokens
  }: GroqQueryParams): Promise<GroqResponse> {
    return this.query({
      prompt,
      model,
      systemPrompt,
      temperature,
      maxTokens
    });
  }

  /**
   * Streaming query method for real-time responses
   */
  static async queryStream({
    prompt,
    model = GROQ_MODELS.LLAMA_70B,
    systemPrompt = 'You are a helpful AI assistant.',
    temperature = 0.7,
    maxTokens = 1000,
    onChunk,
    waitForRateLimit = true
  }: GroqQueryParams & { onChunk: StreamCallback }): Promise<GroqResponse> {
    try {
      validateApiKey();
      validateModel(model);

      // Check rate limit
      const rateLimitOk = await checkRateLimit(model, waitForRateLimit);
      if (!rateLimitOk) {
        throw new Error(`[GroqService] Rate limit exceeded for ${model} streaming.`);
      }

      const estimatedMs = estimateResponseTime(model, maxTokens);
      console.log(`[GroqService] Streaming ${model} (max ${maxTokens} tokens, est. ${estimatedMs}ms)`);

      const startTime = Date.now();
      let fullContent = '';
      let outputTokenCount = 0;

      const stream = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: Math.max(0, Math.min(2, temperature)),
        max_tokens: maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullContent += delta;
          outputTokenCount++;
          
          onChunk({
            content: delta,
            isComplete: false
          });
        }
      }

      const latency = Date.now() - startTime;
      
      // Estimate input tokens (rough: 1 token ≈ 4 characters)
      const inputTokens = Math.ceil((prompt.length + systemPrompt.length) / 4);
      const totalTokens = inputTokens + outputTokenCount;
      const actualTokensPerSecond = outputTokenCount / (latency / 1000);

      const usage = {
        inputTokens,
        outputTokens: outputTokenCount,
        totalTokens
      };

      const speed = {
        latencyMs: latency,
        tokensPerSecond: actualTokensPerSecond
      };

      // Send final chunk
      onChunk({
        content: '',
        isComplete: true,
        usage,
        speed
      });

      console.log(
        `[GroqService] ✅ Stream complete | ${model} | ${latency}ms | ${totalTokens} tokens | ${actualTokensPerSecond.toFixed(0)} tok/s`
      );

      return {
        content: fullContent,
        usage,
        cost: 0,
        model,
        speed: {
          latencyMs: latency,
          tokensPerSecond: actualTokensPerSecond,
          estimatedMs
        }
      };
    } catch (error: any) {
      console.error(`[GroqService] ❌ Stream error:`, error);

      if (error?.message?.includes('Rate limit exceeded')) {
        throw error;
      }

      if (error?.status === 401) {
        throw new Error('[GroqService] Invalid API key for streaming.');
      }

      if (error?.status === 429) {
        throw new Error('[GroqService] Rate limit exceeded during streaming. Please try again later.');
      }

      if (error?.status === 500 || error?.status === 503) {
        throw new Error('[GroqService] Groq API unavailable for streaming. Please try non-streaming mode.');
      }

      throw new Error(`[GroqService] Streaming failed: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Query with automatic fallback from 70B to 8B
   */
  static async queryWithFallback({
    prompt,
    systemPrompt,
    temperature,
    maxTokens,
    preferSpeed = false
  }: Omit<GroqQueryParams, 'model'> & { preferSpeed?: boolean }): Promise<GroqResponse> {
    // Speed priority: 8B first (877 tok/s), Quality priority: 70B first (250 tok/s)
    const fallbackChain = preferSpeed
      ? [GROQ_MODELS.LLAMA_8B, GROQ_MODELS.LLAMA_70B, GROQ_MODELS.LLAMA_70B_LATEST]
      : [GROQ_MODELS.LLAMA_70B, GROQ_MODELS.LLAMA_8B, GROQ_MODELS.LLAMA_70B_LATEST];

    const errors: Array<{ model: string; error: string }> = [];

    for (let i = 0; i < fallbackChain.length; i++) {
      const model = fallbackChain[i];
      const isFallback = i > 0;

      try {
        if (isFallback) {
          console.log(`[GroqService] 🔄 Trying fallback model: ${model}`);
        }

        return await this.query({
          prompt,
          model,
          systemPrompt,
          temperature,
          maxTokens,
          waitForRateLimit: !isFallback // Don't wait on fallback attempts
        });
      } catch (error: any) {
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        errors.push({ model, error: errorMsg });

        console.error(`[GroqService] ❌ ${model} failed:`, errorMsg);

        // If last model in chain, throw
        if (i === fallbackChain.length - 1) {
          throw new Error(
            `[GroqService] All Groq models failed. Errors: ${JSON.stringify(errors)}`
          );
        }
      }
    }

    throw new Error('[GroqService] Unexpected error in fallback chain');
  }

  /**
   * Get model information and performance specs
   */
  static getModelInfo(model: string = GROQ_MODELS.LLAMA_70B): {
    name: string;
    tokensPerSecond: number;
    contextWindow: number;
    rateLimit: { rpm: number; tpm: number; rpd: number };
    description: string;
    cost: string;
  } | null {
    const config = MODEL_CONFIG[model];
    if (!config) return null;

    return {
      name: model,
      tokensPerSecond: config.tokensPerSecond,
      contextWindow: config.context,
      rateLimit: config.rateLimit,
      description: config.description,
      cost: 'FREE'
    };
  }

  /**
   * Get fastest model for chat
   */
  static getFastestModel(): string {
    return GROQ_MODELS.LLAMA_8B; // 877 tokens/sec
  }

  /**
   * Get best model for quality
   */
  static getBestModel(): string {
    return GROQ_MODELS.LLAMA_70B_LATEST; // Latest 70B
  }

  /**
   * Estimate tokens from text (rough approximation)
   */
  static estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if request fits within rate limits
   */
  static async canMakeRequest(model: string = GROQ_MODELS.LLAMA_70B): Promise<boolean> {
    initRateLimitBucket(model);
    const bucket = rateLimitBuckets.get(model);
    if (!bucket) return true;

    refillBucket(bucket);
    return bucket.tokens >= 1;
  }

  /**
   * Get current rate limit status
   */
  static getRateLimitStatus(model: string = GROQ_MODELS.LLAMA_70B): {
    available: number;
    capacity: number;
    percentage: number;
  } {
    initRateLimitBucket(model);
    const bucket = rateLimitBuckets.get(model);
    
    if (!bucket) {
      return { available: 0, capacity: 0, percentage: 0 };
    }

    refillBucket(bucket);
    
    return {
      available: Math.floor(bucket.tokens),
      capacity: bucket.capacity,
      percentage: (bucket.tokens / bucket.capacity) * 100
    };
  }

  /**
   * Get list of available models with specs
   */
  static getAvailableModels(): Array<{
    id: string;
    name: string;
    tokensPerSecond: number;
    contextWindow: number;
    rateLimit: { rpm: number; tpm: number };
    description: string;
  }> {
    return Object.entries(MODEL_CONFIG).map(([id, config]) => ({
      id,
      name: id,
      tokensPerSecond: config.tokensPerSecond,
      contextWindow: config.context,
      rateLimit: {
        rpm: config.rateLimit.rpm,
        tpm: config.rateLimit.tpm
      },
      description: config.description
    }));
  }

  /**
   * Reset rate limit bucket (useful for testing)
   */
  static resetRateLimit(model?: string): void {
    if (model) {
      rateLimitBuckets.delete(model);
      console.log(`[GroqService] Reset rate limit for ${model}`);
    } else {
      rateLimitBuckets.clear();
      console.log('[GroqService] Reset all rate limits');
    }
  }
}
