/**
 * Anthropic Service Wrapper
 * Supports Claude 3.5 Sonnet, Haiku, Opus with cost tracking, streaming, and error handling
 * 
 * PRICING (per 1M tokens):
 * - Sonnet 3.5: $3 input / $15 output (200K context)
 * - Haiku 3.5: $0.80 input / $4 output (200K context)
 * - Opus 3: $15 input / $75 output (200K context)
 */

import Anthropic from '@anthropic-ai/sdk';
import type { MessageStreamEvent } from '@anthropic-ai/sdk/resources/messages';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL_PRICING: Record<string, { input: number; output: number; context: number }> = {
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00, context: 200000 },
  'claude-3-5-haiku-20241022': { input: 0.80, output: 4.00, context: 200000 },
  'claude-3-opus-20240229': { input: 15.00, output: 75.00, context: 200000 },
};

// Model aliases for easier use
export const CLAUDE_MODELS = {
  SONNET: 'claude-3-5-sonnet-20241022',
  HAIKU: 'claude-3-5-haiku-20241022',
  OPUS: 'claude-3-opus-20240229',
} as const;

/**
 * Calculate cost based on token usage
 */
function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    console.warn(`[AnthropicService] Unknown model pricing: ${model}, defaulting to Sonnet pricing`);
    return calculateCost(inputTokens, outputTokens, CLAUDE_MODELS.SONNET);
  }
  
  return (
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output
  );
}

/**
 * Validate API key is configured
 */
function validateApiKey(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('[AnthropicService] ANTHROPIC_API_KEY environment variable is not set');
  }
}

/**
 * Validate model name
 */
function validateModel(model: string): void {
  if (!MODEL_PRICING[model]) {
    throw new Error(
      `[AnthropicService] Invalid model: ${model}. Supported models: ${Object.keys(MODEL_PRICING).join(', ')}`
    );
  }
}

export interface AnthropicQueryParams {
  prompt: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AnthropicResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: number;
  model: string;
}

export interface AnthropicStreamChunk {
  content: string;
  isComplete: boolean;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost?: number;
}

export type StreamCallback = (chunk: AnthropicStreamChunk) => void;

export class AnthropicService {
  /**
   * Standard query method with error handling and fallback support
   */
  static async query({
    prompt,
    model = CLAUDE_MODELS.SONNET,
    systemPrompt = 'You are a helpful AI assistant.',
    temperature = 0.7,
    maxTokens = 1000
  }: AnthropicQueryParams): Promise<AnthropicResponse> {
    try {
      validateApiKey();
      validateModel(model);

      console.log(`[AnthropicService] Querying ${model} (max ${maxTokens} tokens)`);

      const startTime = Date.now();
      
      const message = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature: Math.max(0, Math.min(1, temperature)), // Clamp to 0-1
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      
      const latency = Date.now() - startTime;
      
      const content = message.content[0]?.type === 'text' ? message.content[0].text : '';
      const usage = {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        totalTokens: message.usage.input_tokens + message.usage.output_tokens
      };
      
      const cost = calculateCost(usage.inputTokens, usage.outputTokens, model);
      
      console.log(
        `[AnthropicService] ✅ ${model} | ${latency}ms | ${usage.totalTokens} tokens | $${cost.toFixed(6)}`
      );
      
      return {
        content,
        usage,
        cost,
        model
      };
    } catch (error: any) {
      console.error(`[AnthropicService] ❌ Error:`, error);

      // Enhanced error handling
      if (error?.status === 401) {
        throw new Error('[AnthropicService] Invalid API key. Please check ANTHROPIC_API_KEY environment variable.');
      }
      
      if (error?.status === 429) {
        throw new Error('[AnthropicService] Rate limit exceeded. Please try again later or use a fallback model.');
      }
      
      if (error?.status === 400) {
        throw new Error(`[AnthropicService] Invalid request: ${error?.message || 'Bad request'}`);
      }
      
      if (error?.status === 500 || error?.status === 503) {
        throw new Error('[AnthropicService] Anthropic API is currently unavailable. Please try again or use a fallback provider.');
      }

      if (error?.error?.type === 'overloaded_error') {
        throw new Error('[AnthropicService] Anthropic API is overloaded. Please try again or use a fallback model.');
      }

      // Generic error
      throw new Error(`[AnthropicService] Failed to query Claude: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Streaming query method for real-time responses
   */
  static async queryStream({
    prompt,
    model = CLAUDE_MODELS.SONNET,
    systemPrompt = 'You are a helpful AI assistant.',
    temperature = 0.7,
    maxTokens = 1000,
    onChunk
  }: AnthropicQueryParams & { onChunk: StreamCallback }): Promise<AnthropicResponse> {
    try {
      validateApiKey();
      validateModel(model);

      console.log(`[AnthropicService] Streaming ${model} (max ${maxTokens} tokens)`);

      const startTime = Date.now();
      let fullContent = '';
      let inputTokens = 0;
      let outputTokens = 0;
      
      const stream = await anthropic.messages.stream({
        model,
        max_tokens: maxTokens,
        temperature: Math.max(0, Math.min(1, temperature)),
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      // Handle streaming events
      stream.on('text', (textDelta: string) => {
        fullContent += textDelta;
        onChunk({
          content: textDelta,
          isComplete: false
        });
      });

      stream.on('message', (message) => {
        inputTokens = message.usage.input_tokens;
        outputTokens = message.usage.output_tokens;
      });

      // Wait for stream to complete
      const finalMessage = await stream.finalMessage();
      const latency = Date.now() - startTime;
      
      // Get final usage stats
      const usage = {
        inputTokens: finalMessage.usage.input_tokens,
        outputTokens: finalMessage.usage.output_tokens,
        totalTokens: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens
      };
      
      const cost = calculateCost(usage.inputTokens, usage.outputTokens, model);
      
      // Send final chunk with usage data
      onChunk({
        content: '',
        isComplete: true,
        usage,
        cost
      });
      
      console.log(
        `[AnthropicService] ✅ Stream complete | ${model} | ${latency}ms | ${usage.totalTokens} tokens | $${cost.toFixed(6)}`
      );
      
      return {
        content: fullContent,
        usage,
        cost,
        model
      };
    } catch (error: any) {
      console.error(`[AnthropicService] ❌ Stream error:`, error);

      // Enhanced error handling for streaming
      if (error?.status === 401) {
        throw new Error('[AnthropicService] Invalid API key for streaming. Please check ANTHROPIC_API_KEY.');
      }
      
      if (error?.status === 429) {
        throw new Error('[AnthropicService] Rate limit exceeded during streaming. Please try again later.');
      }
      
      if (error?.status === 500 || error?.status === 503) {
        throw new Error('[AnthropicService] Anthropic API is unavailable for streaming. Please try again or use non-streaming mode.');
      }

      throw new Error(`[AnthropicService] Streaming failed: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Query with automatic fallback to cheaper/faster models
   */
  static async queryWithFallback({
    prompt,
    systemPrompt,
    temperature,
    maxTokens,
    preferQuality = true
  }: Omit<AnthropicQueryParams, 'model'> & { preferQuality?: boolean }): Promise<AnthropicResponse> {
    const fallbackChain = preferQuality
      ? [CLAUDE_MODELS.SONNET, CLAUDE_MODELS.HAIKU]  // Quality: Sonnet → Haiku
      : [CLAUDE_MODELS.HAIKU, CLAUDE_MODELS.SONNET]; // Cost: Haiku → Sonnet

    const errors: Array<{ model: string; error: string }> = [];

    for (let i = 0; i < fallbackChain.length; i++) {
      const model = fallbackChain[i];
      const isFallback = i > 0;

      try {
        if (isFallback) {
          console.log(`[AnthropicService] 🔄 Trying fallback model: ${model}`);
        }

        return await this.query({
          prompt,
          model,
          systemPrompt,
          temperature,
          maxTokens
        });
      } catch (error: any) {
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        errors.push({ model, error: errorMsg });
        
        console.error(`[AnthropicService] ❌ ${model} failed:`, errorMsg);
        
        // If last model in chain, throw with all errors
        if (i === fallbackChain.length - 1) {
          throw new Error(
            `[AnthropicService] All Claude models failed. Errors: ${JSON.stringify(errors)}`
          );
        }
      }
    }

    throw new Error('[AnthropicService] Unexpected error in fallback chain');
  }

  /**
   * Get model information and pricing
   */
  static getModelInfo(model: string = CLAUDE_MODELS.SONNET): {
    name: string;
    pricing: { input: number; output: number };
    contextWindow: number;
  } | null {
    const pricing = MODEL_PRICING[model];
    if (!pricing) return null;

    return {
      name: model,
      pricing: {
        input: pricing.input,
        output: pricing.output
      },
      contextWindow: pricing.context
    };
  }

  /**
   * Estimate cost before making request
   */
  static estimateCost(
    inputText: string,
    expectedOutputTokens: number,
    model: string = CLAUDE_MODELS.SONNET
  ): number {
    // Rough token estimation: 1 token ≈ 4 characters
    const estimatedInputTokens = Math.ceil(inputText.length / 4);
    return calculateCost(estimatedInputTokens, expectedOutputTokens, model);
  }

  /**
   * Get list of available models
   */
  static getAvailableModels(): Array<{
    id: string;
    name: string;
    pricing: { input: number; output: number };
    contextWindow: number;
  }> {
    return Object.entries(MODEL_PRICING).map(([id, pricing]) => ({
      id,
      name: id,
      pricing: {
        input: pricing.input,
        output: pricing.output
      },
      contextWindow: pricing.context
    }));
  }
}
