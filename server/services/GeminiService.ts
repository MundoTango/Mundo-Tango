/**
 * Gemini Service Wrapper
 * 
 * Implements Google's Gemini AI models with comprehensive cost tracking and token counting.
 * Supports 4 models optimized for different use cases:
 * 
 * - gemini-2.5-flash-lite: CHEAPEST ($0.02/$0.08 per 1M tokens) - Best for bulk operations
 * - gemini-1.5-flash: Fast & affordable ($0.075/$0.30 per 1M tokens) - General purpose
 * - gemini-1.5-pro: High quality ($1.25/$5 per 1M tokens) - Complex reasoning
 * - gemini-2.5-flash: Balanced ($0.10/$0.40 per 1M tokens) - Latest Flash model
 * 
 * Context Support: 1M-2M tokens (largest in industry)
 * 
 * @see MULTI-AI-ORCHESTRATION document for integration with unified orchestrator
 */

import { GoogleGenerativeAI, GenerativeModel, GenerateContentResult } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Pricing structure for each Gemini model
 * All prices are per 1M tokens
 */
interface ModelPricing {
  input: number;    // Cost per 1M input tokens
  output: number;   // Cost per 1M output tokens
  context: number;  // Maximum context window in tokens
}

/**
 * Comprehensive pricing table for all Gemini models
 */
const MODEL_PRICING: Record<string, ModelPricing> = {
  'gemini-2.5-flash-lite': { 
    input: 0.02,      // CHEAPEST - Best for bulk operations
    output: 0.08, 
    context: 1_000_000 
  },
  'gemini-1.5-flash': { 
    input: 0.075,     // Fast general-purpose model
    output: 0.30, 
    context: 1_000_000 
  },
  'gemini-1.5-pro': { 
    input: 1.25,      // High-quality reasoning
    output: 5.00, 
    context: 2_000_000  // 2M context window!
  },
  'gemini-2.5-flash': { 
    input: 0.10,      // Latest Flash model
    output: 0.40, 
    context: 1_000_000 
  },
};

/**
 * Supported Gemini model identifiers
 */
export type GeminiModel = 
  | 'gemini-2.5-flash-lite'  // Cheapest - bulk operations
  | 'gemini-1.5-flash'       // General purpose
  | 'gemini-1.5-pro'         // Complex reasoning
  | 'gemini-2.5-flash';      // Latest Flash

/**
 * Query parameters for Gemini API
 */
export interface GeminiQueryParams {
  prompt: string;
  model?: GeminiModel;
  systemPrompt?: string;
  temperature?: number;      // 0-1, controls randomness
  maxTokens?: number;        // Max output tokens
  topP?: number;            // Nucleus sampling (0-1)
  topK?: number;            // Top-k sampling
  stopSequences?: string[]; // Stop generation at these sequences
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
 * Complete response from Gemini API
 */
export interface GeminiResponse {
  content: string;
  usage: TokenUsage;
  cost: number;
  model: string;
  finishReason?: string;
}

/**
 * Streaming chunk from Gemini API
 */
export interface GeminiStreamChunk {
  content: string;
  done: boolean;
  usage?: Partial<TokenUsage>;
}

/**
 * Calculate the cost of a Gemini API call
 * 
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @param model - Gemini model identifier
 * @returns Total cost in USD
 */
function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    console.warn(`[Gemini] Unknown model pricing: ${model}, returning $0`);
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
 * Validate model identifier
 * 
 * @param model - Model to validate
 * @throws Error if model is not supported
 */
function validateModel(model: string): asserts model is GeminiModel {
  if (!MODEL_PRICING[model]) {
    throw new Error(
      `Unsupported Gemini model: ${model}. ` +
      `Supported models: ${Object.keys(MODEL_PRICING).join(', ')}`
    );
  }
}

/**
 * Get model pricing information
 * 
 * @param model - Gemini model identifier
 * @returns Pricing information for the model
 */
export function getModelPricing(model: GeminiModel): ModelPricing {
  return MODEL_PRICING[model];
}

/**
 * Get all available Gemini models with their pricing
 * 
 * @returns Map of model names to pricing information
 */
export function getAllModels(): Record<string, ModelPricing> {
  return { ...MODEL_PRICING };
}

/**
 * Gemini AI Service
 * 
 * Provides methods for interacting with Google's Gemini models.
 * Includes cost tracking, token counting, and streaming support.
 */
export class GeminiService {
  /**
   * Send a query to Gemini and get a complete response
   * 
   * @param params - Query parameters
   * @returns Complete response with content, usage, and cost
   * 
   * @example
   * ```typescript
   * const response = await GeminiService.query({
   *   prompt: "Translate 'hello' to Spanish",
   *   model: 'gemini-2.5-flash-lite', // Cheapest option
   *   temperature: 0.3,
   *   maxTokens: 100
   * });
   * 
   * console.log(response.content); // "Hola"
   * console.log(response.cost);    // $0.000006 (approximately)
   * ```
   */
  static async query({
    prompt,
    model = 'gemini-1.5-flash',
    systemPrompt = 'You are a helpful AI assistant.',
    temperature = 0.7,
    maxTokens = 1000,
    topP,
    topK,
    stopSequences
  }: GeminiQueryParams): Promise<GeminiResponse> {
    try {
      // Validate model
      validateModel(model);
      
      // Initialize model with configuration
      const genModel: GenerativeModel = genAI.getGenerativeModel({ 
        model,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          ...(topP !== undefined && { topP }),
          ...(topK !== undefined && { topK }),
          ...(stopSequences && { stopSequences })
        }
      });
      
      // Combine system prompt with user prompt
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      
      // Generate content
      const result: GenerateContentResult = await genModel.generateContent(fullPrompt);
      const response = await result.response;
      
      // Extract content
      const content = response.text();
      
      // Get token usage (with fallback estimation)
      const usage: TokenUsage = {
        inputTokens: response.usageMetadata?.promptTokenCount || estimateTokenCount(fullPrompt),
        outputTokens: response.usageMetadata?.candidatesTokenCount || estimateTokenCount(content),
        totalTokens: response.usageMetadata?.totalTokenCount || estimateTokenCount(fullPrompt + content)
      };
      
      // Calculate cost
      const cost = calculateCost(usage.inputTokens, usage.outputTokens, model);
      
      // Get finish reason
      const finishReason = response.candidates?.[0]?.finishReason;
      
      // Log request details
      console.log(
        `[Gemini] ${model} | Input: ${usage.inputTokens}t | ` +
        `Output: ${usage.outputTokens}t | Cost: $${cost.toFixed(6)}`
      );
      
      return {
        content,
        usage,
        cost,
        model,
        finishReason
      };
      
    } catch (error: any) {
      console.error('[Gemini] Query failed:', error.message);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Stream a response from Gemini token by token
   * 
   * @param params - Query parameters
   * @param onChunk - Callback for each content chunk
   * @returns Final complete response with full content and usage
   * 
   * @example
   * ```typescript
   * const response = await GeminiService.queryStream({
   *   prompt: "Write a short story",
   *   model: 'gemini-1.5-flash'
   * }, (chunk) => {
   *   process.stdout.write(chunk.content); // Stream to console
   * });
   * 
   * console.log('\nTotal cost:', response.cost);
   * ```
   */
  static async queryStream(
    params: GeminiQueryParams,
    onChunk: (chunk: GeminiStreamChunk) => void
  ): Promise<GeminiResponse> {
    try {
      const {
        prompt,
        model = 'gemini-1.5-flash',
        systemPrompt = 'You are a helpful AI assistant.',
        temperature = 0.7,
        maxTokens = 1000,
        topP,
        topK,
        stopSequences
      } = params;
      
      // Validate model
      validateModel(model);
      
      // Initialize model
      const genModel: GenerativeModel = genAI.getGenerativeModel({ 
        model,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          ...(topP !== undefined && { topP }),
          ...(topK !== undefined && { topK }),
          ...(stopSequences && { stopSequences })
        }
      });
      
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      
      // Generate content stream
      const result = await genModel.generateContentStream(fullPrompt);
      
      let fullContent = '';
      let outputTokens = 0;
      
      // Process each chunk
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullContent += chunkText;
        
        // Estimate tokens in this chunk
        const chunkTokens = estimateTokenCount(chunkText);
        outputTokens += chunkTokens;
        
        // Call chunk callback
        onChunk({
          content: chunkText,
          done: false,
          usage: { outputTokens }
        });
      }
      
      // Final chunk to signal completion
      onChunk({
        content: '',
        done: true
      });
      
      // Get final response for metadata
      const response = await result.response;
      
      // Calculate final usage
      const usage: TokenUsage = {
        inputTokens: response.usageMetadata?.promptTokenCount || estimateTokenCount(fullPrompt),
        outputTokens: response.usageMetadata?.candidatesTokenCount || outputTokens,
        totalTokens: response.usageMetadata?.totalTokenCount || estimateTokenCount(fullPrompt + fullContent)
      };
      
      const cost = calculateCost(usage.inputTokens, usage.outputTokens, model);
      const finishReason = response.candidates?.[0]?.finishReason;
      
      console.log(
        `[Gemini Stream] ${model} | Input: ${usage.inputTokens}t | ` +
        `Output: ${usage.outputTokens}t | Cost: $${cost.toFixed(6)}`
      );
      
      return {
        content: fullContent,
        usage,
        cost,
        model,
        finishReason
      };
      
    } catch (error: any) {
      console.error('[Gemini] Stream failed:', error.message);
      throw new Error(`Gemini streaming error: ${error.message}`);
    }
  }

  /**
   * Count tokens in a text string
   * 
   * Uses Gemini's token counting API when available, falls back to estimation
   * 
   * @param text - Text to count tokens for
   * @param model - Model to use for token counting
   * @returns Token count
   */
  static async countTokens(text: string, model: GeminiModel = 'gemini-1.5-flash'): Promise<number> {
    try {
      validateModel(model);
      
      const genModel = genAI.getGenerativeModel({ model });
      const result = await genModel.countTokens(text);
      
      return result.totalTokens;
    } catch (error) {
      // Fallback to estimation if API fails
      console.warn('[Gemini] Token counting API failed, using estimation');
      return estimateTokenCount(text);
    }
  }

  /**
   * Get the cheapest model suitable for a given task
   * 
   * @param estimatedOutputTokens - Expected output size
   * @returns Recommended model for cost optimization
   */
  static getCheapestModel(estimatedOutputTokens: number = 500): GeminiModel {
    // For most use cases, Flash Lite is cheapest
    if (estimatedOutputTokens <= 1000) {
      return 'gemini-2.5-flash-lite';
    }
    
    // For longer outputs, Flash is more reliable
    return 'gemini-1.5-flash';
  }

  /**
   * Get the best model for a given use case
   * 
   * @param useCase - Type of task
   * @returns Recommended model
   */
  static getModelForUseCase(
    useCase: 'bulk' | 'chat' | 'code' | 'reasoning' | 'long-context'
  ): GeminiModel {
    switch (useCase) {
      case 'bulk':
        return 'gemini-2.5-flash-lite'; // Cheapest
      case 'chat':
        return 'gemini-1.5-flash'; // Fast & affordable
      case 'code':
        return 'gemini-1.5-flash'; // Good code generation
      case 'reasoning':
        return 'gemini-1.5-pro'; // Best quality
      case 'long-context':
        return 'gemini-1.5-pro'; // 2M context window
      default:
        return 'gemini-1.5-flash'; // Default
    }
  }

  /**
   * Estimate cost for a query before making it
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
    model: GeminiModel = 'gemini-1.5-flash',
    estimatedOutputTokens: number = 500
  ): number {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const inputTokens = estimateTokenCount(fullPrompt);
    
    return calculateCost(inputTokens, estimatedOutputTokens, model);
  }
}

/**
 * Export pricing information for external use
 */
export { MODEL_PRICING, ModelPricing };

/**
 * Default export
 */
export default GeminiService;
