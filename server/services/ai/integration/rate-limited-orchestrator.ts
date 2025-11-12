import { rateLimiter } from '../RateLimiterService';
import { OpenAIService } from '../OpenAIService';
import { AnthropicService } from '../AnthropicService';
import { GroqService } from '../GroqService';
import { GeminiService } from '../GeminiService';
import { OpenRouterService } from '../OpenRouterService';

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  platform: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: number;
  latency: number;
  rateLimited: boolean;
  retried: boolean;
}

export class RateLimitedAIOrchestrator {
  async queryWithRateLimit(
    platform: string,
    model: string,
    request: AIRequest,
    options: {
      priority?: number;
      maxWaitMs?: number;
      enableRetry?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<AIResponse> {
    const {
      priority = 0,
      maxWaitMs = 30000,
      enableRetry = true,
      maxRetries = 3
    } = options;

    const startTime = Date.now();

    if (enableRetry) {
      return this.executeWithRateLimit(platform, model, request, {
        priority,
        maxWaitMs,
        maxRetries,
        retried: false
      });
    }

    const tokenAcquired = await rateLimiter.acquireToken(platform, model, {
      priority,
      maxWaitMs,
      useQueue: true
    });

    if (!tokenAcquired) {
      throw new Error(`Rate limit exceeded for ${platform}:${model} and max wait time reached`);
    }

    const response = await this.executePlatformRequest(platform, model, request);
    const latency = Date.now() - startTime;

    return {
      ...response,
      latency,
      rateLimited: false,
      retried: false
    };
  }

  private async executeWithRateLimit(
    platform: string,
    model: string,
    request: AIRequest,
    options: {
      priority: number;
      maxWaitMs: number;
      maxRetries: number;
      retried: boolean;
    }
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const response = await rateLimiter.executeWithRetry(
        platform,
        model,
        async () => {
          return await this.executePlatformRequest(platform, model, request);
        },
        {
          maxRetries: options.maxRetries,
          initialDelayMs: 1000,
          maxDelayMs: options.maxWaitMs,
          backoffMultiplier: 2
        }
      );

      const latency = Date.now() - startTime;

      return {
        ...response,
        latency,
        rateLimited: false,
        retried: options.retried
      };
    } catch (error: any) {
      const isRateLimitError = 
        error?.status === 429 ||
        error?.message?.toLowerCase().includes('rate limit');

      throw new Error(
        `Failed to execute AI request for ${platform}:${model}: ${error.message} ` +
        `(Rate Limited: ${isRateLimitError})`
      );
    }
  }

  private async executePlatformRequest(
    platform: string,
    model: string,
    request: AIRequest
  ): Promise<Omit<AIResponse, 'latency' | 'rateLimited' | 'retried'>> {
    const { prompt, systemPrompt, temperature, maxTokens } = request;

    let response: any;

    switch (platform) {
      case 'openai':
        response = await OpenAIService.query({
          prompt,
          model,
          systemPrompt,
          temperature,
          maxTokens
        });
        break;

      case 'anthropic':
        response = await AnthropicService.query({
          prompt,
          model,
          systemPrompt,
          temperature,
          maxTokens
        });
        break;

      case 'groq':
        response = await GroqService.querySimple({
          prompt,
          model,
          systemPrompt,
          temperature,
          maxTokens
        });
        break;

      case 'gemini':
        response = await GeminiService.query({
          prompt,
          model: model as any,
          systemPrompt,
          temperature,
          maxTokens
        });
        break;

      case 'openrouter':
        response = await OpenRouterService.query({
          prompt,
          model,
          systemPrompt,
          temperature,
          maxTokens
        });
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return {
      content: response.content,
      platform,
      model: response.model || model,
      usage: response.usage,
      cost: response.cost
    };
  }

  async smartRoute(
    request: AIRequest,
    options: {
      useCase?: 'chat' | 'code' | 'reasoning' | 'bulk';
      priority?: 'speed' | 'cost' | 'quality';
      maxWaitMs?: number;
    } = {}
  ): Promise<AIResponse> {
    const { useCase = 'chat', priority = 'balanced', maxWaitMs = 30000 } = options;

    const fallbackChains: Record<string, Array<{ platform: string; model: string }>> = {
      chat_speed: [
        { platform: 'groq', model: 'llama-3.1-70b-versatile' },
        { platform: 'gemini', model: 'gemini-1.5-flash' },
        { platform: 'openai', model: 'gpt-4o-mini' }
      ],
      chat_cost: [
        { platform: 'gemini', model: 'gemini-2.5-flash-lite' },
        { platform: 'groq', model: 'llama-3.1-8b-instant' },
        { platform: 'openai', model: 'gpt-4o-mini' }
      ],
      code_quality: [
        { platform: 'openai', model: 'gpt-4o' },
        { platform: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
        { platform: 'gemini', model: 'gemini-1.5-pro' }
      ],
      reasoning: [
        { platform: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
        { platform: 'openai', model: 'gpt-4o' },
        { platform: 'gemini', model: 'gemini-1.5-pro' }
      ],
      bulk: [
        { platform: 'gemini', model: 'gemini-2.5-flash-lite' },
        { platform: 'groq', model: 'llama-3.1-8b-instant' },
        { platform: 'openai', model: 'gpt-4o-mini' }
      ]
    };

    let chain: Array<{ platform: string; model: string }>;

    if (useCase === 'chat') {
      chain = priority === 'cost' ? fallbackChains.chat_cost : fallbackChains.chat_speed;
    } else if (useCase === 'code') {
      chain = fallbackChains.code_quality;
    } else if (useCase === 'reasoning') {
      chain = fallbackChains.reasoning;
    } else {
      chain = fallbackChains.bulk;
    }

    const errors: Array<{ platform: string; model: string; error: string }> = [];

    for (let i = 0; i < chain.length; i++) {
      const { platform, model } = chain[i];

      try {
        console.log(`[RateLimitedOrchestrator] Trying ${platform}:${model} (attempt ${i + 1}/${chain.length})`);

        const response = await this.queryWithRateLimit(
          platform,
          model,
          request,
          {
            priority: i,
            maxWaitMs,
            enableRetry: true,
            maxRetries: 2
          }
        );

        if (i > 0) {
          console.log(`[RateLimitedOrchestrator] ✅ Fallback successful using ${platform}:${model}`);
        }

        return response;
      } catch (error: any) {
        errors.push({
          platform,
          model,
          error: error.message
        });

        console.error(`[RateLimitedOrchestrator] ❌ ${platform}:${model} failed: ${error.message}`);

        if (i === chain.length - 1) {
          throw new Error(
            `All platforms failed for ${useCase} use case. Errors: ${JSON.stringify(errors)}`
          );
        }
      }
    }

    throw new Error('No platforms available');
  }

  async getServiceHealth(): Promise<{
    platform: string;
    model: string;
    status: 'healthy' | 'rate_limited' | 'degraded';
    currentTokens: number;
    queueLength: number;
    metrics: {
      successRate: number;
      avgWaitTime: number;
    };
  }[]> {
    const allMetrics = rateLimiter.getMetrics();

    return allMetrics.map(metric => {
      const successRate = metric.totalRequests > 0
        ? (metric.successfulRequests / metric.totalRequests) * 100
        : 100;

      const isRateLimited = rateLimiter.isRateLimited(metric.platform, metric.model);
      const queueLength = rateLimiter.getQueueLength(metric.platform, metric.model);

      let status: 'healthy' | 'rate_limited' | 'degraded' = 'healthy';
      if (isRateLimited) {
        status = 'rate_limited';
      } else if (successRate < 90 || queueLength > 10) {
        status = 'degraded';
      }

      return {
        platform: metric.platform,
        model: metric.model,
        status,
        currentTokens: metric.currentTokens,
        queueLength,
        metrics: {
          successRate,
          avgWaitTime: metric.averageWaitTime
        }
      };
    });
  }
}

export const rateLimitedOrchestrator = new RateLimitedAIOrchestrator();
