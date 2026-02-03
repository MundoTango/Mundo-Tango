/**
 * BYTEZ.COM PROVIDER - 175K+ AI MODELS VIA UNIFIED API
 * Integration with Bifrost AI Gateway for Mr. Blue AI Partner
 * 
 * Features:
 * - Access to 175,000+ serverless AI models (open + closed source)
 * - Unified API interface (OpenAI-compatible format)
 * - Streaming support
 * - Auto-scaling serverless infrastructure
 * - 33+ ML tasks (chat, image generation, embeddings, multimodal, etc.)
 * - Pass-through authentication (keys never stored for closed models)
 * 
 * Documentation: https://docs.bytez.com
 * GitHub: https://github.com/Bytez-com
 */

import Bytez from 'bytez.js';

export interface BytezConfig {
  apiKey: string;
  defaultCapacity?: { min: number; max: number };
  defaultTimeout?: number; // minutes
}

export interface BytezModelRequest {
  modelId: string;
  input: string | Record<string, any>;
  streaming?: boolean;
  capacity?: { min: number; max: number };
  timeout?: number;
  params?: Record<string, any>;
}

export interface BytezModelResponse {
  success: boolean;
  output?: any;
  error?: string;
  executionTime?: number;
}

/**
 * Bytez Provider for Bifrost AI Gateway
 * Provides access to 175,000+ AI models through a unified interface
 */
export class BytezProvider {
  private client: Bytez;
  private config: BytezConfig;

  constructor(config: BytezConfig) {
    this.config = config;
    this.client = new Bytez(config.apiKey);
  }

  /**
   * Run inference on any of the 175k+ available models
   */
  async runModel(request: BytezModelRequest): Promise<BytezModelResponse> {
    const startTime = Date.now();

    try {
      const model = this.client.model(request.modelId);

      const result = await model.run(request.input, {
        streaming: request.streaming || false,
        capacity: request.capacity || this.config.defaultCapacity || { min: 1, max: 1 },
        timeout: request.timeout || this.config.defaultTimeout || 10,
        params: request.params || {}
      });

      const executionTime = Date.now() - startTime;

      if (result.error) {
        return {
          success: false,
          error: result.error,
          executionTime
        };
      }

      return {
        success: true,
        output: result.output,
        executionTime
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Chat completion (for chat models)
   * Compatible with OpenAI-style chat completions
   */
  async chatCompletion(
    modelId: string,
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      streaming?: boolean;
    }
  ): Promise<BytezModelResponse> {
    const chatInput = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    return this.runModel({
      modelId,
      input: chatInput,
      streaming: options?.streaming || false,
      params: {
        temperature: options?.temperature || 0.7,
        max_new_tokens: options?.maxTokens || 512
      }
    });
  }

  /**
   * Generate image (for text-to-image models)
   */
  async generateImage(
    modelId: string,
    prompt: string,
    options?: {
      width?: number;
      height?: number;
      numInferenceSteps?: number;
    }
  ): Promise<BytezModelResponse> {
    return this.runModel({
      modelId,
      input: prompt,
      params: {
        width: options?.width || 512,
        height: options?.height || 512,
        num_inference_steps: options?.numInferenceSteps || 20
      }
    });
  }

  /**
   * Generate embeddings (for embedding models)
   */
  async generateEmbeddings(
    modelId: string,
    texts: string[]
  ): Promise<BytezModelResponse> {
    return this.runModel({
      modelId,
      input: { texts }
    });
  }

  /**
   * List all available models
   */
  async listModels(): Promise<string[]> {
    // Bytez SDK doesn't expose listModels directly yet
    // Return common model categories
    return [
      // Chat models
      'meta-llama/Llama-3.1-8B-Instruct',
      'microsoft/Phi-3-mini-4k-instruct',
      'google/gemma-3-4b-it',
      'mistralai/Mistral-7B-Instruct-v0.3',
      
      // Image generation
      'stabilityai/stable-diffusion-xl-base-1.0',
      'runwayml/stable-diffusion-v1-5',
      
      // Embeddings
      'sentence-transformers/all-MiniLM-L6-v2',
      'BAAI/bge-small-en-v1.5'
    ];
  }

  /**
   * List all ML tasks supported by Bytez
   */
  async listTasks(): Promise<string[]> {
    try {
      const tasks = await this.client.list.tasks();
      return tasks;
    } catch (error) {
      console.error('[Bytez] Failed to list tasks:', error);
      return [
        'text-generation',
        'text2text-generation',
        'text-to-image',
        'image-to-text',
        'feature-extraction',
        'sentence-similarity',
        'fill-mask',
        'question-answering',
        'summarization',
        'translation',
        'token-classification',
        'zero-shot-classification',
        'conversational',
        'image-classification',
        'object-detection',
        'image-segmentation'
      ];
    }
  }

  /**
   * Get model info
   */
  async getModelInfo(modelId: string): Promise<Record<string, any>> {
    return {
      id: modelId,
      provider: 'bytez',
      available: true,
      message: `Access via Bytez.com unified API (175k+ models available)`
    };
  }
}

/**
 * Initialize Bytez Provider for Bifrost AI Gateway
 */
export function initializeBytezProvider(apiKey: string): BytezProvider {
  return new BytezProvider({
    apiKey,
    defaultCapacity: { min: 1, max: 5 },
    defaultTimeout: 10
  });
}
