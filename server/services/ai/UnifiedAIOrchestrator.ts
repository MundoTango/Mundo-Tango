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
 * AI ARBITRAGE - Intelligent Routing with Cascade Execution
 * 
 * Complete end-to-end intelligent routing:
 * 1. Classify query complexity using TaskClassifier (Llama 3 8B)
 * 2. Select 3-tier cascade using ModelSelector
 * 3. Execute with progressive escalation using CascadeExecutor
 * 4. Track spend and budget using CostTracker
 * 5. Record routing decision for DPO training
 * 
 * Goal: 50-90% cost savings vs always using premium models
 */

import { TaskClassifier } from './TaskClassifier';
import { ModelSelector } from './ModelSelector';
import { CascadeExecutor } from './CascadeExecutor';
import { CostTracker } from './CostTracker';
import { db } from '../../db';
import { routingDecisions } from '@shared/schema';

export interface ArbitrageQueryOptions {
  query: string;
  context?: string;
  userId: number;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  userTier?: 'free' | 'basic' | 'pro' | 'enterprise';
}

export interface ArbitrageQueryResult {
  content: string;
  tierUsed: 1 | 2 | 3;
  platform: string;
  model: string;
  confidence: number;
  cost: number;
  latency: number;
  escalated: boolean;
  escalationReason?: string;
  classification: any;
  budgetStatus: any;
  routingDecisionId: number;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

/**
 * Execute AI query with full arbitrage pipeline
 */
export async function queryWithArbitrage(options: ArbitrageQueryOptions): Promise<ArbitrageQueryResult> {
  const {
    query,
    context = '',
    userId,
    systemPrompt,
    temperature = 0.7,
    maxTokens = 1000,
    userTier = 'free',
  } = options;

  console.log(`\n========================================`);
  console.log(`[Arbitrage] Starting intelligent routing for user ${userId}`);
  console.log(`[Arbitrage] Query: "${query.slice(0, 100)}${query.length > 100 ? '...' : ''}"`);
  console.log(`========================================\n`);

  const pipelineStartTime = Date.now();

  try {
    // STEP 1: Check budget before execution
    console.log(`[Arbitrage] STEP 1: Budget Check`);
    const budgetStatus = await CostTracker.checkBudget(userId, 0.10); // Estimate $0.10 max

    if (budgetStatus.isOverBudget) {
      throw new Error(
        `Budget exceeded: ${budgetStatus.percentageUsed.toFixed(1)}% used ` +
        `($${budgetStatus.currentSpend.toFixed(2)}/$${budgetStatus.monthlyLimit.toFixed(2)}). ` +
        `Please upgrade your plan to continue using AI features.`
      );
    }

    if (budgetStatus.isNearingLimit) {
      console.warn(`[Arbitrage] ⚠️  ${budgetStatus.alertMessage}`);
    }

    // STEP 2: Classify query complexity
    console.log(`[Arbitrage] STEP 2: Task Classification`);
    const classification = await TaskClassifier.classify({
      query,
      context,
      userTier,
      maxBudget: budgetStatus.remaining,
    });

    console.log(
      `[Arbitrage] Classification: Complexity=${classification.complexity.toFixed(2)} | ` +
      `Domain=${classification.domain} | Quality=${classification.requiredQuality.toFixed(2)} | ` +
      `Tokens=${classification.estimatedTokens} | Budget=$${classification.budgetConstraint}`
    );

    // STEP 3: Select cascade chain
    console.log(`[Arbitrage] STEP 3: Model Selection`);
    const cascadeChain = ModelSelector.selectCascadeChain(classification);

    // STEP 4: Execute cascade with progressive escalation
    console.log(`[Arbitrage] STEP 4: Cascade Execution`);
    const executionResult = await CascadeExecutor.execute(
      query,
      cascadeChain,
      systemPrompt,
      temperature,
      maxTokens
    );

    // STEP 5: Track spend
    console.log(`[Arbitrage] STEP 5: Spend Tracking`);
    await CostTracker.trackSpend({
      userId,
      platform: executionResult.platform,
      model: executionResult.model,
      cost: executionResult.cost,
      tokens: executionResult.usage.totalTokens,
      inputTokens: executionResult.usage.inputTokens,
      outputTokens: executionResult.usage.outputTokens,
      requestType: classification.domain,
      useCase: 'ai_arbitrage',
    });

    // STEP 6: Record routing decision for DPO training
    console.log(`[Arbitrage] STEP 6: Recording Decision`);
    
    // Calculate savings vs premium model (tier 3)
    const premiumCost = cascadeChain.tier3.estimatedCost;
    const actualCost = executionResult.cost;
    const savingsAmount = premiumCost - actualCost;
    const savingsPercentage = (savingsAmount / premiumCost) * 100;

    const recorded = await db
      .insert(routingDecisions)
      .values({
        userId,
        query,
        context: context || null,
        classification: classification as any,
        modelUsed: executionResult.model,
        platform: executionResult.platform,
        tierUsed: executionResult.tierUsed,
        cost: executionResult.cost.toString(),
        latency: executionResult.latency,
        confidence: executionResult.confidence.toString(),
        quality: null, // Will be set by user feedback
        escalated: executionResult.escalated,
        escalationReason: executionResult.escalationReason || null,
        previousTiersAttempted: executionResult.previousTiersAttempted as any,
        userFeedback: null,
        feedbackComment: null,
        savingsAmount: savingsAmount.toString(),
        savingsPercentage: savingsPercentage.toString(),
      })
      .returning({ id: routingDecisions.id });

    const routingDecisionId = recorded[0].id;

    const pipelineTotalTime = Date.now() - pipelineStartTime;

    console.log(`\n========================================`);
    console.log(`[Arbitrage] ✅ PIPELINE COMPLETE`);
    console.log(`[Arbitrage] Tier Used: ${executionResult.tierUsed} (${executionResult.platform}/${executionResult.model})`);
    console.log(`[Arbitrage] Confidence: ${executionResult.confidence.toFixed(2)}`);
    console.log(`[Arbitrage] Cost: $${executionResult.cost.toFixed(6)}`);
    console.log(`[Arbitrage] Savings: $${savingsAmount.toFixed(6)} (${savingsPercentage.toFixed(1)}%)`);
    console.log(`[Arbitrage] Latency: ${executionResult.latency}ms (execution) + ${pipelineTotalTime - executionResult.latency}ms (overhead)`);
    console.log(`[Arbitrage] Total Time: ${pipelineTotalTime}ms`);
    console.log(`========================================\n`);

    return {
      ...executionResult,
      classification,
      budgetStatus,
      routingDecisionId,
    };
  } catch (error: any) {
    console.error(`[Arbitrage] ❌ Pipeline failed:`, error.message);
    throw error;
  }
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
