/**
 * OpenRouter Service Wrapper
 * 
 * Multi-LLM Gateway providing access to 70+ models from various AI providers:
 * - Meta Llama models (3, 3.1, 3.2, 3.3)
 * - Anthropic Claude models (Sonnet, Opus, Haiku)
 * - OpenAI GPT models (GPT-4, GPT-4o, GPT-3.5)
 * - Google Gemini models
 * - Mistral models
 * - And many more...
 * 
 * OpenRouter acts as a unified API gateway, handling:
 * - Model routing and load balancing
 * - Automatic fallbacks
 * - Cost optimization
 * - Rate limit management across providers
 * 
 * PRICING:
 * - Meta Llama 3 70B: $0.52 input / $0.75 output per 1M tokens
 * - Anthropic Claude Sonnet: $3 input / $15 output per 1M tokens
 * - OpenAI GPT-4o: $3 input / $10 output per 1M tokens
 * - Mistral Large: $2 input / $6 output per 1M tokens
 * 
 * FEATURES:
 * - Unified interface for 70+ models
 * - Automatic fallback support
 * - Streaming responses
 * - Cost tracking per model
 * - Token counting and estimation
 * - Comprehensive error handling
 * 
 * @see https://openrouter.ai/docs for full API documentation
 * @see MULTI-AI-ORCHESTRATION document for integration guide
 */

import OpenAI from 'openai';

/**
 * Initialize OpenRouter client using OpenAI SDK
 * OpenRouter is compatible with OpenAI's API interface
 */
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL || 'https://mundotango.com',
    'X-Title': 'Mundo Tango Platform'
  }
});

/**
 * Model pricing structure
 * All prices are per 1M tokens
 */
interface ModelPricing {
  input: number;    // Cost per 1M input tokens
  output: number;   // Cost per 1M output tokens
  context: number;  // Maximum context window in tokens
  provider: string; // Original provider (Meta, Anthropic, OpenAI, etc.)
}

/**
 * Comprehensive pricing table for all supported OpenRouter models
 * 
 * Categories:
 * - Meta Llama: Open-source models, cost-effective
 * - Anthropic Claude: Best for reasoning and analysis
 * - OpenAI GPT: Best for general purpose and code
 * - Google Gemini: Large context windows
 * - Mistral: Fast European models
 * - Free Models: Community-hosted, rate-limited
 */
const MODEL_PRICING: Record<string, ModelPricing> = {
  // ========================================
  // META LLAMA MODELS (Cost-effective, open-source)
  // ========================================
  'meta-llama/llama-3-70b': {
    input: 0.52,
    output: 0.75,
    context: 8000,
    provider: 'Meta'
  },
  'meta-llama/llama-3-70b-instruct': {
    input: 0.52,
    output: 0.75,
    context: 8000,
    provider: 'Meta'
  },
  'meta-llama/llama-3.1-70b-instruct': {
    input: 0.52,
    output: 0.75,
    context: 131072, // 128K context
    provider: 'Meta'
  },
  'meta-llama/llama-3.1-8b-instruct': {
    input: 0.06,
    output: 0.06,
    context: 131072,
    provider: 'Meta'
  },
  'meta-llama/llama-3.2-1b-instruct': {
    input: 0.04,
    output: 0.04,
    context: 131072,
    provider: 'Meta'
  },
  'meta-llama/llama-3.2-3b-instruct': {
    input: 0.06,
    output: 0.06,
    context: 131072,
    provider: 'Meta'
  },
  'meta-llama/llama-3.3-70b-instruct': {
    input: 0.52,
    output: 0.75,
    context: 131072,
    provider: 'Meta'
  },
  'meta-llama/llama-3.2-90b-vision-instruct': {
    input: 0.90,
    output: 0.90,
    context: 131072,
    provider: 'Meta'
  },

  // ========================================
  // ANTHROPIC CLAUDE MODELS (Best reasoning)
  // ========================================
  'anthropic/claude-3-opus': {
    input: 15.00,
    output: 75.00,
    context: 200000,
    provider: 'Anthropic'
  },
  'anthropic/claude-3-sonnet': {
    input: 3.00,
    output: 15.00,
    context: 200000,
    provider: 'Anthropic'
  },
  'anthropic/claude-3.5-sonnet': {
    input: 3.00,
    output: 15.00,
    context: 200000,
    provider: 'Anthropic'
  },
  'anthropic/claude-3-haiku': {
    input: 0.25,
    output: 1.25,
    context: 200000,
    provider: 'Anthropic'
  },
  'anthropic/claude-3.5-haiku': {
    input: 0.80,
    output: 4.00,
    context: 200000,
    provider: 'Anthropic'
  },
  'anthropic/claude-2.1': {
    input: 8.00,
    output: 24.00,
    context: 200000,
    provider: 'Anthropic'
  },

  // ========================================
  // OPENAI GPT MODELS (General purpose)
  // ========================================
  'openai/gpt-4o': {
    input: 3.00,
    output: 10.00,
    context: 128000,
    provider: 'OpenAI'
  },
  'openai/gpt-4o-mini': {
    input: 0.15,
    output: 0.60,
    context: 128000,
    provider: 'OpenAI'
  },
  'openai/gpt-4-turbo': {
    input: 10.00,
    output: 30.00,
    context: 128000,
    provider: 'OpenAI'
  },
  'openai/gpt-4': {
    input: 30.00,
    output: 60.00,
    context: 8192,
    provider: 'OpenAI'
  },
  'openai/gpt-3.5-turbo': {
    input: 0.50,
    output: 1.50,
    context: 16385,
    provider: 'OpenAI'
  },
  'openai/gpt-3.5-turbo-16k': {
    input: 3.00,
    output: 4.00,
    context: 16385,
    provider: 'OpenAI'
  },

  // ========================================
  // GOOGLE GEMINI MODELS (Large context)
  // ========================================
  'google/gemini-pro': {
    input: 0.50,
    output: 1.50,
    context: 1000000, // 1M context!
    provider: 'Google'
  },
  'google/gemini-pro-1.5': {
    input: 1.25,
    output: 5.00,
    context: 2000000, // 2M context!
    provider: 'Google'
  },
  'google/gemini-flash-1.5': {
    input: 0.075,
    output: 0.30,
    context: 1000000,
    provider: 'Google'
  },
  'google/gemini-flash-1.5-8b': {
    input: 0.038,
    output: 0.15,
    context: 1000000,
    provider: 'Google'
  },

  // ========================================
  // MISTRAL MODELS (Fast, European)
  // ========================================
  'mistralai/mistral-large': {
    input: 2.00,
    output: 6.00,
    context: 128000,
    provider: 'Mistral'
  },
  'mistralai/mistral-medium': {
    input: 2.70,
    output: 8.10,
    context: 32000,
    provider: 'Mistral'
  },
  'mistralai/mistral-small': {
    input: 0.20,
    output: 0.60,
    context: 32000,
    provider: 'Mistral'
  },
  'mistralai/mistral-7b-instruct': {
    input: 0.07,
    output: 0.07,
    context: 32000,
    provider: 'Mistral'
  },
  'mistralai/mixtral-8x7b-instruct': {
    input: 0.24,
    output: 0.24,
    context: 32000,
    provider: 'Mistral'
  },
  'mistralai/mixtral-8x22b-instruct': {
    input: 0.65,
    output: 0.65,
    context: 65536,
    provider: 'Mistral'
  },

  // ========================================
  // COHERE MODELS
  // ========================================
  'cohere/command-r': {
    input: 0.50,
    output: 1.50,
    context: 128000,
    provider: 'Cohere'
  },
  'cohere/command-r-plus': {
    input: 3.00,
    output: 15.00,
    context: 128000,
    provider: 'Cohere'
  },

  // ========================================
  // DEEPSEEK MODELS (Code specialized)
  // ========================================
  'deepseek/deepseek-coder': {
    input: 0.14,
    output: 0.28,
    context: 16000,
    provider: 'DeepSeek'
  },
  'deepseek/deepseek-chat': {
    input: 0.14,
    output: 0.28,
    context: 32000,
    provider: 'DeepSeek'
  },

  // ========================================
  // PERPLEXITY MODELS (Search-augmented)
  // ========================================
  'perplexity/llama-3.1-sonar-large-128k-online': {
    input: 1.00,
    output: 1.00,
    context: 127072,
    provider: 'Perplexity'
  },
  'perplexity/llama-3.1-sonar-small-128k-online': {
    input: 0.20,
    output: 0.20,
    context: 127072,
    provider: 'Perplexity'
  },

  // ========================================
  // FREE MODELS (Community-hosted, rate-limited)
  // ========================================
  'meta-llama/llama-3-8b-instruct:free': {
    input: 0,
    output: 0,
    context: 8000,
    provider: 'Meta (Free)'
  },
  'mistralai/mistral-7b-instruct:free': {
    input: 0,
    output: 0,
    context: 32000,
    provider: 'Mistral (Free)'
  },
  'google/gemma-7b-it:free': {
    input: 0,
    output: 0,
    context: 8192,
    provider: 'Google (Free)'
  },
};

/**
 * Model aliases for easier access
 */
export const OPENROUTER_MODELS = {
  // Recommended models per use case
  LLAMA_70B: 'meta-llama/llama-3.3-70b-instruct',          // Latest Llama
  LLAMA_8B: 'meta-llama/llama-3.1-8b-instruct',            // Small Llama
  CLAUDE_SONNET: 'anthropic/claude-3.5-sonnet',            // Best reasoning
  CLAUDE_HAIKU: 'anthropic/claude-3.5-haiku',              // Fast Claude
  CLAUDE_OPUS: 'anthropic/claude-3-opus',                  // Premium Claude
  GPT_4O: 'openai/gpt-4o',                                 // Latest GPT
  GPT_4O_MINI: 'openai/gpt-4o-mini',                       // Cheap GPT
  GEMINI_PRO: 'google/gemini-pro-1.5',                     // Large context
  GEMINI_FLASH: 'google/gemini-flash-1.5',                 // Fast Gemini
  MISTRAL_LARGE: 'mistralai/mistral-large',                // European
  
  // Free models
  FREE_LLAMA: 'meta-llama/llama-3-8b-instruct:free',
  FREE_MISTRAL: 'mistralai/mistral-7b-instruct:free',
  FREE_GEMMA: 'google/gemma-7b-it:free',
} as const;

/**
 * Calculate the cost of an OpenRouter API call
 * 
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @param model - OpenRouter model identifier
 * @returns Total cost in USD
 */
function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    console.warn(`[OpenRouterService] Unknown model pricing: ${model}, returning $0`);
    return 0;
  }
  
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  
  return inputCost + outputCost;
}

/**
 * Estimate token count from text
 * Rule of thumb: 1 token ≈ 4 characters for English text
 * 
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Validate API key is configured
 */
function validateApiKey(): void {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      '[OpenRouterService] OPENROUTER_API_KEY environment variable is not set. ' +
      'Get your key at https://openrouter.ai/keys'
    );
  }
}

/**
 * Validate model identifier
 * 
 * @param model - Model to validate
 * @throws Error if model is not supported
 */
function validateModel(model: string): void {
  if (!MODEL_PRICING[model]) {
    const availableModels = Object.keys(MODEL_PRICING);
    throw new Error(
      `[OpenRouterService] Unsupported model: ${model}. ` +
      `Available models: ${availableModels.slice(0, 10).join(', ')}... (and ${availableModels.length - 10} more). ` +
      `See https://openrouter.ai/docs#models for full list.`
    );
  }
}

/**
 * Token usage statistics
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * Query parameters for OpenRouter API
 */
export interface OpenRouterQueryParams {
  prompt: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;      // 0-2, controls randomness
  maxTokens?: number;        // Max output tokens
  topP?: number;            // Nucleus sampling (0-1)
  topK?: number;            // Top-k sampling
  frequencyPenalty?: number; // -2 to 2
  presencePenalty?: number;  // -2 to 2
  stopSequences?: string[]; // Stop generation at these sequences
}

/**
 * Complete response from OpenRouter API
 */
export interface OpenRouterResponse {
  content: string;
  usage: TokenUsage;
  cost: number;
  model: string;
  provider: string;
  finishReason?: string;
}

/**
 * Streaming chunk from OpenRouter API
 */
export interface OpenRouterStreamChunk {
  content: string;
  done: boolean;
  usage?: Partial<TokenUsage>;
  cost?: number;
}

/**
 * Callback for streaming chunks
 */
export type StreamCallback = (chunk: OpenRouterStreamChunk) => void;

/**
 * OpenRouter AI Service
 * 
 * Multi-LLM gateway providing access to 70+ models from various providers
 * through a single unified API interface.
 */
export class OpenRouterService {
  /**
   * Send a query to OpenRouter and get a complete response
   * 
   * @param params - Query parameters
   * @returns Complete response with content, usage, and cost
   * 
   * @example
   * ```typescript
   * const response = await OpenRouterService.query({
   *   prompt: "What is the capital of France?",
   *   model: OPENROUTER_MODELS.LLAMA_70B,
   *   temperature: 0.7,
   *   maxTokens: 500
   * });
   * 
   * console.log(response.content); // "Paris"
   * console.log(response.cost);    // $0.000015 (approximately)
   * ```
   */
  static async query({
    prompt,
    model = OPENROUTER_MODELS.LLAMA_70B,
    systemPrompt = 'You are a helpful AI assistant.',
    temperature = 0.7,
    maxTokens = 1000,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    stopSequences
  }: OpenRouterQueryParams): Promise<OpenRouterResponse> {
    try {
      validateApiKey();
      validateModel(model);

      console.log(`[OpenRouterService] Querying ${model} (max ${maxTokens} tokens)`);

      const startTime = Date.now();

      const completion = await openrouter.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: Math.max(0, Math.min(2, temperature)), // OpenRouter supports 0-2
        max_tokens: maxTokens,
        ...(topP !== undefined && { top_p: topP }),
        ...(topK !== undefined && { top_k: topK }),
        ...(frequencyPenalty !== undefined && { frequency_penalty: frequencyPenalty }),
        ...(presencePenalty !== undefined && { presence_penalty: presencePenalty }),
        ...(stopSequences && { stop: stopSequences })
      });

      const latency = Date.now() - startTime;

      const content = completion.choices[0]?.message?.content || '';
      const usage: TokenUsage = {
        inputTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0
      };

      const cost = calculateCost(usage.inputTokens, usage.outputTokens, model);
      const provider = MODEL_PRICING[model]?.provider || 'Unknown';
      const finishReason = completion.choices[0]?.finish_reason;

      console.log(
        `[OpenRouterService] ✅ ${model} (${provider}) | ${latency}ms | ` +
        `${usage.totalTokens} tokens | $${cost.toFixed(6)}`
      );

      return {
        content,
        usage,
        cost,
        model,
        provider,
        finishReason
      };

    } catch (error: any) {
      console.error(`[OpenRouterService] ❌ Error:`, error);

      // Enhanced error handling
      if (error?.message?.includes('OPENROUTER_API_KEY')) {
        throw error; // Re-throw validation errors
      }

      if (error?.status === 401 || error?.error?.code === 'invalid_api_key') {
        throw new Error(
          '[OpenRouterService] Invalid API key. Please check OPENROUTER_API_KEY environment variable. ' +
          'Get your key at https://openrouter.ai/keys'
        );
      }

      if (error?.status === 429 || error?.error?.code === 'rate_limit_exceeded') {
        throw new Error(
          `[OpenRouterService] Rate limit exceeded for ${model}. ` +
          `Please try again later or use a different model.`
        );
      }

      if (error?.status === 400 || error?.error?.code === 'invalid_request_error') {
        throw new Error(
          `[OpenRouterService] Invalid request: ${error?.error?.message || error?.message || 'Bad request'}`
        );
      }

      if (error?.status === 402 || error?.error?.code === 'insufficient_credits') {
        throw new Error(
          '[OpenRouterService] Insufficient credits. Please add credits at https://openrouter.ai/credits'
        );
      }

      if (error?.status === 500 || error?.status === 503) {
        throw new Error(
          `[OpenRouterService] OpenRouter API is currently unavailable. ` +
          `Please try again later or use a fallback provider.`
        );
      }

      // Model-specific errors
      if (error?.error?.message?.includes('not found')) {
        throw new Error(
          `[OpenRouterService] Model ${model} not found on OpenRouter. ` +
          `Check available models at https://openrouter.ai/docs#models`
        );
      }

      // Generic error
      throw new Error(
        `[OpenRouterService] Failed to query OpenRouter: ${error?.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Stream a response from OpenRouter token by token
   * 
   * @param params - Query parameters
   * @param onChunk - Callback for each content chunk
   * @returns Final complete response with full content and usage
   * 
   * @example
   * ```typescript
   * const response = await OpenRouterService.queryStream({
   *   prompt: "Write a short story",
   *   model: OPENROUTER_MODELS.CLAUDE_SONNET
   * }, (chunk) => {
   *   process.stdout.write(chunk.content); // Stream to console
   * });
   * 
   * console.log('\nTotal cost:', response.cost);
   * ```
   */
  static async queryStream(
    params: OpenRouterQueryParams,
    onChunk: StreamCallback
  ): Promise<OpenRouterResponse> {
    try {
      const {
        prompt,
        model = OPENROUTER_MODELS.LLAMA_70B,
        systemPrompt = 'You are a helpful AI assistant.',
        temperature = 0.7,
        maxTokens = 1000,
        topP,
        topK,
        frequencyPenalty,
        presencePenalty,
        stopSequences
      } = params;

      validateApiKey();
      validateModel(model);

      console.log(`[OpenRouterService] Streaming ${model} (max ${maxTokens} tokens)`);

      const startTime = Date.now();
      let fullContent = '';
      let outputTokens = 0;

      const stream = await openrouter.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: Math.max(0, Math.min(2, temperature)),
        max_tokens: maxTokens,
        stream: true,
        ...(topP !== undefined && { top_p: topP }),
        ...(topK !== undefined && { top_k: topK }),
        ...(frequencyPenalty !== undefined && { frequency_penalty: frequencyPenalty }),
        ...(presencePenalty !== undefined && { presence_penalty: presencePenalty }),
        ...(stopSequences && { stop: stopSequences })
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullContent += delta;
          outputTokens = estimateTokenCount(fullContent);

          onChunk({
            content: delta,
            done: false,
            usage: { outputTokens }
          });
        }
      }

      const latency = Date.now() - startTime;

      // Estimate input tokens
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const inputTokens = estimateTokenCount(fullPrompt);

      const usage: TokenUsage = {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      };

      const cost = calculateCost(usage.inputTokens, usage.outputTokens, model);
      const provider = MODEL_PRICING[model]?.provider || 'Unknown';

      // Send final chunk
      onChunk({
        content: '',
        done: true,
        usage,
        cost
      });

      console.log(
        `[OpenRouterService] ✅ Stream complete | ${model} (${provider}) | ` +
        `${latency}ms | ${usage.totalTokens} tokens | $${cost.toFixed(6)}`
      );

      return {
        content: fullContent,
        usage,
        cost,
        model,
        provider
      };

    } catch (error: any) {
      console.error(`[OpenRouterService] ❌ Stream error:`, error);

      if (error?.message?.includes('OPENROUTER_API_KEY')) {
        throw error;
      }

      if (error?.status === 401) {
        throw new Error('[OpenRouterService] Invalid API key for streaming.');
      }

      if (error?.status === 429) {
        throw new Error(
          '[OpenRouterService] Rate limit exceeded during streaming. Please try again later.'
        );
      }

      if (error?.status === 500 || error?.status === 503) {
        throw new Error(
          '[OpenRouterService] OpenRouter API unavailable for streaming. Please try non-streaming mode.'
        );
      }

      throw new Error(
        `[OpenRouterService] Streaming failed: ${error?.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Query with automatic fallback across multiple models
   * 
   * @param params - Query parameters (without model)
   * @param fallbackChain - Array of models to try in order
   * @returns Response from the first successful model
   * 
   * @example
   * ```typescript
   * const response = await OpenRouterService.queryWithFallback({
   *   prompt: "Explain quantum computing",
   *   temperature: 0.7
   * }, [
   *   OPENROUTER_MODELS.CLAUDE_SONNET,
   *   OPENROUTER_MODELS.GPT_4O,
   *   OPENROUTER_MODELS.LLAMA_70B
   * ]);
   * ```
   */
  static async queryWithFallback(
    params: Omit<OpenRouterQueryParams, 'model'>,
    fallbackChain: string[] = [
      OPENROUTER_MODELS.LLAMA_70B,
      OPENROUTER_MODELS.CLAUDE_SONNET,
      OPENROUTER_MODELS.GPT_4O_MINI
    ]
  ): Promise<OpenRouterResponse> {
    const errors: Array<{ model: string; error: string }> = [];

    for (let i = 0; i < fallbackChain.length; i++) {
      const model = fallbackChain[i];
      const isFallback = i > 0;

      try {
        if (isFallback) {
          console.log(`[OpenRouterService] 🔄 Trying fallback model: ${model}`);
        }

        return await this.query({
          ...params,
          model
        });

      } catch (error: any) {
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        errors.push({ model, error: errorMsg });

        console.error(`[OpenRouterService] ❌ ${model} failed:`, errorMsg);

        // If last model in chain, throw
        if (i === fallbackChain.length - 1) {
          throw new Error(
            `[OpenRouterService] All models in fallback chain failed. ` +
            `Errors: ${JSON.stringify(errors)}`
          );
        }
      }
    }

    throw new Error('[OpenRouterService] Unexpected error in fallback chain');
  }

  /**
   * Get model information and pricing
   * 
   * @param model - Model identifier
   * @returns Model information or null if not found
   */
  static getModelInfo(model: string): {
    name: string;
    pricing: { input: number; output: number };
    contextWindow: number;
    provider: string;
  } | null {
    const pricing = MODEL_PRICING[model];
    if (!pricing) return null;

    return {
      name: model,
      pricing: {
        input: pricing.input,
        output: pricing.output
      },
      contextWindow: pricing.context,
      provider: pricing.provider
    };
  }

  /**
   * Get all available models with pricing information
   * 
   * @returns Array of all models with their details
   */
  static getAllModels(): Array<{
    id: string;
    name: string;
    pricing: { input: number; output: number };
    contextWindow: number;
    provider: string;
  }> {
    return Object.entries(MODEL_PRICING).map(([id, pricing]) => ({
      id,
      name: id,
      pricing: {
        input: pricing.input,
        output: pricing.output
      },
      contextWindow: pricing.context,
      provider: pricing.provider
    }));
  }

  /**
   * Get models by provider
   * 
   * @param provider - Provider name (Meta, Anthropic, OpenAI, Google, Mistral, etc.)
   * @returns Array of models from that provider
   */
  static getModelsByProvider(provider: string): string[] {
    return Object.entries(MODEL_PRICING)
      .filter(([_, pricing]) => pricing.provider.toLowerCase().includes(provider.toLowerCase()))
      .map(([id]) => id);
  }

  /**
   * Get cheapest model for a given use case
   * 
   * @param estimatedOutputTokens - Expected output size
   * @returns Cheapest model that fits the use case
   */
  static getCheapestModel(estimatedOutputTokens: number = 500): string {
    // For small tasks, use free models
    if (estimatedOutputTokens <= 500) {
      return OPENROUTER_MODELS.FREE_LLAMA;
    }

    // For medium tasks, use cheap paid models
    if (estimatedOutputTokens <= 2000) {
      return OPENROUTER_MODELS.LLAMA_8B;
    }

    // For larger tasks, use Llama 70B (good quality, low cost)
    return OPENROUTER_MODELS.LLAMA_70B;
  }

  /**
   * Get best model for a specific use case
   * 
   * @param useCase - Type of task
   * @returns Recommended model for the use case
   */
  static getModelForUseCase(
    useCase: 'chat' | 'code' | 'reasoning' | 'analysis' | 'bulk' | 'long-context'
  ): string {
    switch (useCase) {
      case 'chat':
        return OPENROUTER_MODELS.LLAMA_70B; // Good quality, low cost
      case 'code':
        return OPENROUTER_MODELS.GPT_4O; // Best for code generation
      case 'reasoning':
        return OPENROUTER_MODELS.CLAUDE_SONNET; // Best reasoning
      case 'analysis':
        return OPENROUTER_MODELS.CLAUDE_SONNET; // Deep analysis
      case 'bulk':
        return OPENROUTER_MODELS.LLAMA_8B; // Cheap for bulk
      case 'long-context':
        return OPENROUTER_MODELS.GEMINI_PRO; // 2M context window
      default:
        return OPENROUTER_MODELS.LLAMA_70B; // Default
    }
  }

  /**
   * Estimate cost before making a request
   * 
   * @param prompt - User prompt
   * @param systemPrompt - System prompt
   * @param model - Model to use
   * @param estimatedOutputTokens - Expected output size
   * @returns Estimated cost in USD
   */
  static estimateCost(
    prompt: string,
    systemPrompt: string = '',
    model: string = OPENROUTER_MODELS.LLAMA_70B,
    estimatedOutputTokens: number = 500
  ): number {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const inputTokens = estimateTokenCount(fullPrompt);

    return calculateCost(inputTokens, estimatedOutputTokens, model);
  }

  /**
   * Count tokens in a text string
   * 
   * @param text - Text to count tokens for
   * @returns Estimated token count
   */
  static countTokens(text: string): number {
    return estimateTokenCount(text);
  }

  /**
   * Get free models (community-hosted)
   * 
   * @returns Array of free model identifiers
   */
  static getFreeModels(): string[] {
    return Object.entries(MODEL_PRICING)
      .filter(([_, pricing]) => pricing.input === 0 && pricing.output === 0)
      .map(([id]) => id);
  }

  /**
   * Get models under a certain price threshold
   * 
   * @param maxInputPrice - Maximum input price per 1M tokens
   * @param maxOutputPrice - Maximum output price per 1M tokens
   * @returns Array of affordable models
   */
  static getAffordableModels(
    maxInputPrice: number = 1.0,
    maxOutputPrice: number = 2.0
  ): string[] {
    return Object.entries(MODEL_PRICING)
      .filter(([_, pricing]) => 
        pricing.input <= maxInputPrice && pricing.output <= maxOutputPrice
      )
      .map(([id]) => id);
  }
}

/**
 * Export pricing information for external use
 */
export { MODEL_PRICING, ModelPricing };

/**
 * Default export
 */
export default OpenRouterService;
