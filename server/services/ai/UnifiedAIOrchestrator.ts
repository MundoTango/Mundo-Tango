/**
 * UnifiedAIOrchestrator - Multi-AI Orchestration Service
 * 
 * Routes AI requests across 5 platforms with smart fallback chains:
 * - OpenAI (GPT-4o, GPT-4o-mini)
 * - Anthropic (Claude 3.5 Sonnet, Haiku)
 * - Groq (Llama 3.1 70B/8B - FREE)
 * - Gemini (Flash, Flash Lite, Pro)
 * - OpenRouter (Multi-LLM gateway)
 * 
 * Features:
 * - Smart routing based on use case (chat/code/reasoning/bulk)
 * - 3-tier fallback chains
 * - Cost optimization
 * - Circuit breaker protection
 * - Token bucket rate limiting
 * - Semantic caching with Redis
 * - Real-time cost tracking
 */

import { OpenAIService } from './OpenAIService';
import { AnthropicService } from './AnthropicService';
import { GroqService } from './GroqService';
import { GeminiService } from './GeminiService';
import { OpenRouterService } from './OpenRouterService';
import { canExecute, recordSuccess, recordFailure, initCircuitBreaker } from '../../utils/circuit-breaker';
import { generateAICacheKey } from '../caching/CacheKeys';
import { getCachedAIResponse, cacheAIResponse } from '../caching/RedisCache';

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
  fallbackUsed: boolean;
  cached?: boolean;
}

// FALLBACK_CHAINS - 3-tier redundancy per use case
const FALLBACK_CHAINS: Record<string, Array<{ platform: string; model: string }>> = {
  // CHAT: Speed priority → Groq first (fastest)
  chat_speed: [
    { platform: 'groq', model: 'llama-3.1-70b-versatile' },      // 250 T/s, FREE
    { platform: 'gemini', model: 'gemini-1.5-flash' },           // $0.075/$0.30
    { platform: 'openrouter', model: 'meta-llama/llama-3-70b' }  // $0.52/$0.75
  ],
  
  // CHAT: Cost priority → Gemini Flash Lite (cheapest)
  chat_cost: [
    { platform: 'gemini', model: 'gemini-2.5-flash-lite' },      // $0.02/$0.08 ⭐
    { platform: 'openrouter', model: 'meta-llama/llama-3-70b' }, // $0.52/$0.75
    { platform: 'groq', model: 'llama-3.1-8b-instant' }          // 877 T/s, FREE
  ],
  
  // CODE: Quality priority → GPT-4o best for code generation
  code_quality: [
    { platform: 'openai', model: 'gpt-4o' },                     // $3/$10 ⭐
    { platform: 'anthropic', model: 'claude-3-5-sonnet-20241022' },       // $3/$15
    { platform: 'gemini', model: 'gemini-1.5-pro' }              // $1.25/$5
  ],
  
  // CODE: Cost priority → Gemini Flash
  code_cost: [
    { platform: 'gemini', model: 'gemini-1.5-flash' },           // $0.075/$0.30
    { platform: 'groq', model: 'llama-3.1-70b-versatile' },      // FREE
    { platform: 'openai', model: 'gpt-4o-mini' }                 // $0.15/$0.60
  ],
  
  // REASONING: Claude Sonnet best for complex logic
  reasoning: [
    { platform: 'anthropic', model: 'claude-3-5-sonnet-20241022' },       // $3/$15 ⭐
    { platform: 'openai', model: 'gpt-4o' },                     // $3/$10
    { platform: 'openrouter', model: 'anthropic/claude-3-sonnet'} // $3/$15
  ],
  
  // BULK: Cheapest for high-volume tasks
  bulk: [
    { platform: 'gemini', model: 'gemini-2.5-flash-lite' },      // $0.02/$0.08 ⭐
    { platform: 'openrouter', model: 'meta-llama/llama-3-70b' }, // $0.52/$0.75
    { platform: 'groq', model: 'llama-3.1-8b-instant' }          // FREE
  ]
};

/**
 * Execute AI request with fallback chain
 */
async function executeWithFallback(
  chain: Array<{ platform: string; model: string }>,
  query: string,
  systemPrompt?: string,
  temperature?: number,
  maxTokens?: number
): Promise<AIResponse> {
  const errors: Array<{ platform: string; error: string }> = [];
  
  for (let i = 0; i < chain.length; i++) {
    const { platform, model } = chain[i];
    const isFallback = i > 0;
    const platformKey = `${platform}:${model}`;
    
    // Initialize circuit breaker
    initCircuitBreaker(platformKey);
    
    // Check circuit breaker
    if (!canExecute(platformKey)) {
      console.log(`[Orchestrator] ⚠️ Circuit breaker OPEN for ${platformKey}, skipping...`);
      errors.push({ platform, error: 'Circuit breaker open' });
      continue;
    }
    
    try {
      const startTime = Date.now();
      let result: any;
      
      // Route to appropriate service
      if (platform === 'groq') {
        result = await GroqService.query({ prompt: query, model, systemPrompt, temperature, maxTokens });
      } else if (platform === 'openai') {
        result = await OpenAIService.query({ prompt: query, model, systemPrompt, temperature, maxTokens });
      } else if (platform === 'anthropic') {
        result = await AnthropicService.query({ prompt: query, model, systemPrompt, temperature, maxTokens });
      } else if (platform === 'gemini') {
        result = await GeminiService.query({ prompt: query, model, systemPrompt, temperature, maxTokens });
      } else if (platform === 'openrouter') {
        result = await OpenRouterService.query({ prompt: query, model, systemPrompt, temperature, maxTokens });
      } else {
        throw new Error(`Unknown platform: ${platform}`);
      }
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // Record success in circuit breaker
      recordSuccess(platformKey);
      
      console.log(`[Orchestrator] ✅ ${platform} ${model} | ${latency}ms | $${result.cost.toFixed(6)}${isFallback ? ' (FALLBACK)' : ''}`);
      
      return {
        content: result.content,
        platform,
        model,
        usage: result.usage,
        cost: result.cost,
        latency,
        fallbackUsed: isFallback
      };
      
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || 'Unknown error';
      errors.push({ platform, error: errorMsg });
      
      // Record failure in circuit breaker
      recordFailure(platformKey);
      
      console.error(`[Orchestrator] ❌ ${platform} failed: ${errorMsg}`);
      
      // If last option, throw
      if (i === chain.length - 1) {
        throw new Error(`All AI providers failed. Errors: ${JSON.stringify(errors)}`);
      }
      
      // Try next in chain
      console.log(`[Orchestrator] 🔄 Trying fallback ${i + 1}/${chain.length - 1}...`);
    }
  }
  
  throw new Error('No AI providers available');
}

/**
 * Smart route AI request based on use case and priority
 */
export async function smartRoute({
  query,
  useCase = 'chat',
  priority = 'balanced',
  systemPrompt,
  temperature = 0.7,
  maxTokens = 1000
}: {
  query: string;
  useCase?: 'chat' | 'code' | 'analysis' | 'bulk' | 'reasoning';
  priority?: 'speed' | 'cost' | 'quality' | 'balanced';
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<AIResponse> {
  
  console.log(`[Orchestrator] UseCase: ${useCase}, Priority: ${priority}`);
  
  // Determine fallback chain based on use case and priority
  let chain: Array<{ platform: string; model: string }>;
  
  if (useCase === 'chat') {
    chain = priority === 'cost' ? FALLBACK_CHAINS.chat_cost : FALLBACK_CHAINS.chat_speed;
  } else if (useCase === 'code') {
    chain = priority === 'cost' ? FALLBACK_CHAINS.code_cost : FALLBACK_CHAINS.code_quality;
  } else if (useCase === 'reasoning' || useCase === 'analysis') {
    chain = FALLBACK_CHAINS.reasoning; // Always Claude first for reasoning
  } else if (useCase === 'bulk') {
    chain = FALLBACK_CHAINS.bulk; // Always cheapest
  } else {
    chain = FALLBACK_CHAINS.chat_speed; // Default
  }
  
  // Generate cache key
  const cacheKey = generateAICacheKey(query, chain[0].model, temperature, maxTokens);
  
  // Check cache first
  const cached = await getCachedAIResponse(cacheKey);
  if (cached) {
    console.log(`[Orchestrator] 💾 Cache HIT - saved $${cached.cost.toFixed(6)}`);
    return {
      ...cached,
      cached: true
    };
  }
  
  // Execute with fallback
  const response = await executeWithFallback(chain, query, systemPrompt, temperature, maxTokens);
  
  // Cache response (24 hour TTL)
  await cacheAIResponse(cacheKey, response, 86400);
  
  return response;
}

/**
 * Multi-AI collaborative analysis using Agent Blackboard pattern
 */
export async function collaborativeAnalysis({
  query,
  analysisType = 'comprehensive'
}: {
  query: string;
  analysisType?: 'code-review' | 'security' | 'performance' | 'comprehensive';
}): Promise<string> {
  const sessionId = `analysis-${Date.now()}`;
  
  console.log(`[Orchestrator] Starting collaborative analysis: ${analysisType}`);
  
  // Step 1: Initial analysis with GPT-4o
  const step1 = await smartRoute({
    query: `Analyze the following and provide initial insights:\n\n${query}`,
    useCase: 'reasoning',
    priority: 'quality'
  });
  
  // Step 2: Deep dive with Claude (reads GPT-4o's analysis)
  const step2 = await smartRoute({
    query: `Given this initial analysis:\n\n${step1.content}\n\nProvide a deeper analysis of:\n${query}`,
    useCase: 'reasoning',
    priority: 'quality'
  });
  
  // Step 3: Synthesize insights
  const synthesis = await smartRoute({
    query: `Synthesize these analyses into a comprehensive report:\n\nAnalysis 1 (${step1.platform}):\n${step1.content}\n\nAnalysis 2 (${step2.platform}):\n${step2.content}`,
    useCase: 'reasoning',
    priority: 'quality'
  });
  
  console.log(`[Orchestrator] Collaborative analysis complete. Total cost: $${(step1.cost + step2.cost + synthesis.cost).toFixed(6)}`);
  
  return synthesis.content;
}

/**
 * Get cost statistics
 */
export function getCostStats() {
  return {
    message: 'Cost tracking integrated with FinOps system',
    note: 'See agentTokenUsage and aiMetrics tables for detailed cost data'
  };
}

/**
 * Export services for direct access
 */
export {
  OpenAIService,
  AnthropicService,
  GroqService,
  GeminiService,
  OpenRouterService
};
