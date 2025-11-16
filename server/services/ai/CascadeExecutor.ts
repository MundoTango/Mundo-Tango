/**
 * CascadeExecutor - Progressive Escalation Strategy
 * 
 * Executes AI requests using 3-tier cascade with automatic escalation:
 * - Tier 1: Try cheapest model → if confidence >0.8, accept; else escalate
 * - Tier 2: Try mid-tier model → if confidence >0.9, accept; else escalate  
 * - Tier 3: Try premium model → always accept (no further escalation)
 * 
 * Confidence Calculation:
 * - Response length vs expected (0-0.3 weight)
 * - Token usage efficiency (0-0.2 weight)
 * - Error-free execution (0-0.3 weight)
 * - Model quality score (0-0.2 weight)
 * 
 * Goal: 80%+ tier-1 success rate (most tasks handled by cheap models)
 */

import { GroqService } from './GroqService';
import { OpenAIService } from './OpenAIService';
import { AnthropicService } from './AnthropicService';
import { GeminiService } from './GeminiService';
import { OpenRouterService } from './OpenRouterService';
import type { ModelTier, CascadeChain } from './ModelSelector';

// ============================================================================
// TYPES
// ============================================================================

export interface CascadeExecutionResult {
  content: string;
  tierUsed: 1 | 2 | 3;
  platform: string;
  model: string;
  confidence: number;
  cost: number;
  latency: number;
  escalated: boolean;
  escalationReason?: string;
  previousTiersAttempted: Array<{
    tier: number;
    platform: string;
    model: string;
    confidence: number;
    reason: string;
  }>;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

interface ExecutionAttempt {
  tier: number;
  platform: string;
  model: string;
  content: string;
  confidence: number;
  cost: number;
  latency: number;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  reason?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const TIER1_CONFIDENCE_THRESHOLD = 0.80; // 80% confidence to accept tier 1
const TIER2_CONFIDENCE_THRESHOLD = 0.90; // 90% confidence to accept tier 2
const TIER3_ALWAYS_ACCEPT = true;        // Always accept tier 3 (no escalation)

const MODEL_QUALITY_SCORES: Record<string, number> = {
  'llama-3.1-8b-instant': 0.65,
  'llama-3.3-70b-versatile': 0.75,
  'gemini-2.5-flash-lite': 0.70,
  'gemini-1.5-flash': 0.78,
  'gemini-1.5-pro': 0.88,
  'gpt-4o-mini': 0.82,
  'gpt-4o': 0.95,
  'claude-3-5-sonnet-20241022': 0.97,
  'claude-3-haiku-20240307': 0.75,
};

// ============================================================================
// CASCADE EXECUTOR SERVICE
// ============================================================================

export class CascadeExecutor {
  /**
   * Execute cascade strategy with progressive escalation
   */
  static async execute(
    query: string,
    cascadeChain: CascadeChain,
    systemPrompt?: string,
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<CascadeExecutionResult> {
    console.log(`[CascadeExecutor] Starting cascade execution for query (${query.length} chars)`);

    const attempts: ExecutionAttempt[] = [];
    const startTime = Date.now();

    // TIER 1: Cheapest model
    try {
      const tier1Result = await this.executeTier(
        cascadeChain.tier1,
        query,
        systemPrompt,
        temperature,
        maxTokens
      );
      
      attempts.push(tier1Result);

      if (tier1Result.confidence >= TIER1_CONFIDENCE_THRESHOLD) {
        console.log(
          `[CascadeExecutor] ✅ TIER 1 SUCCESS | ${tier1Result.platform}/${tier1Result.model} | ` +
          `Confidence: ${tier1Result.confidence.toFixed(2)} | Cost: $${tier1Result.cost.toFixed(6)} | ` +
          `${tier1Result.latency}ms`
        );

        return {
          ...tier1Result,
          tierUsed: 1,
          escalated: false,
          previousTiersAttempted: [],
        };
      }

      console.log(
        `[CascadeExecutor] ⬆️  TIER 1 ESCALATE | Confidence: ${tier1Result.confidence.toFixed(2)} < ${TIER1_CONFIDENCE_THRESHOLD} | ` +
        `Escalating to Tier 2...`
      );
    } catch (error: any) {
      console.error(`[CascadeExecutor] ❌ TIER 1 FAILED: ${error.message}`);
      attempts.push({
        tier: 1,
        platform: cascadeChain.tier1.platform,
        model: cascadeChain.tier1.model,
        content: '',
        confidence: 0,
        cost: 0,
        latency: 0,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        reason: `Error: ${error.message}`,
      });
    }

    // TIER 2: Mid-tier model
    try {
      const tier2Result = await this.executeTier(
        cascadeChain.tier2,
        query,
        systemPrompt,
        temperature,
        maxTokens
      );
      
      attempts.push(tier2Result);

      if (tier2Result.confidence >= TIER2_CONFIDENCE_THRESHOLD) {
        console.log(
          `[CascadeExecutor] ✅ TIER 2 SUCCESS | ${tier2Result.platform}/${tier2Result.model} | ` +
          `Confidence: ${tier2Result.confidence.toFixed(2)} | Cost: $${tier2Result.cost.toFixed(6)} | ` +
          `${tier2Result.latency}ms`
        );

        return {
          ...tier2Result,
          tierUsed: 2,
          escalated: true,
          escalationReason: `Tier 1 confidence too low (${attempts[attempts.length - 2].confidence.toFixed(2)})`,
          previousTiersAttempted: attempts.slice(0, -1).map(a => ({
            tier: a.tier,
            platform: a.platform,
            model: a.model,
            confidence: a.confidence,
            reason: a.reason || `Confidence below threshold`,
          })),
        };
      }

      console.log(
        `[CascadeExecutor] ⬆️  TIER 2 ESCALATE | Confidence: ${tier2Result.confidence.toFixed(2)} < ${TIER2_CONFIDENCE_THRESHOLD} | ` +
        `Escalating to Tier 3 (final)...`
      );
    } catch (error: any) {
      console.error(`[CascadeExecutor] ❌ TIER 2 FAILED: ${error.message}`);
      attempts.push({
        tier: 2,
        platform: cascadeChain.tier2.platform,
        model: cascadeChain.tier2.model,
        content: '',
        confidence: 0,
        cost: 0,
        latency: 0,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        reason: `Error: ${error.message}`,
      });
    }

    // TIER 3: Premium model (always accept)
    try {
      const tier3Result = await this.executeTier(
        cascadeChain.tier3,
        query,
        systemPrompt,
        temperature,
        maxTokens
      );
      
      attempts.push(tier3Result);

      console.log(
        `[CascadeExecutor] ✅ TIER 3 FINAL | ${tier3Result.platform}/${tier3Result.model} | ` +
        `Confidence: ${tier3Result.confidence.toFixed(2)} | Cost: $${tier3Result.cost.toFixed(6)} | ` +
        `${tier3Result.latency}ms | ACCEPTED (premium tier)`
      );

      return {
        ...tier3Result,
        tierUsed: 3,
        escalated: true,
        escalationReason: `Tier 2 confidence too low, using premium model`,
        previousTiersAttempted: attempts.slice(0, -1).map(a => ({
          tier: a.tier,
          platform: a.platform,
          model: a.model,
          confidence: a.confidence,
          reason: a.reason || `Confidence below threshold`,
        })),
      };
    } catch (error: any) {
      console.error(`[CascadeExecutor] ❌ ALL TIERS FAILED: ${error.message}`);
      
      // Return last successful attempt (if any)
      const successfulAttempt = attempts.find(a => a.content.length > 0);
      if (successfulAttempt) {
        console.warn(`[CascadeExecutor] ⚠️  Returning last successful attempt (Tier ${successfulAttempt.tier})`);
        return {
          ...successfulAttempt,
          tierUsed: successfulAttempt.tier as 1 | 2 | 3,
          escalated: true,
          escalationReason: 'All higher tiers failed',
          previousTiersAttempted: [],
        };
      }

      throw new Error(`Cascade execution failed: All tiers failed. Last error: ${error.message}`);
    }
  }

  /**
   * Execute single tier
   */
  private static async executeTier(
    tier: ModelTier,
    query: string,
    systemPrompt?: string,
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<ExecutionAttempt> {
    const startTime = Date.now();
    
    let result: any;
    const { platform, model } = tier;

    // Route to appropriate service
    if (platform === 'groq') {
      result = await GroqService.query({
        prompt: query,
        model,
        systemPrompt,
        temperature,
        maxTokens,
      });
    } else if (platform === 'openai') {
      result = await OpenAIService.query({
        prompt: query,
        model,
        systemPrompt,
        temperature,
        maxTokens,
      });
    } else if (platform === 'anthropic') {
      result = await AnthropicService.query({
        prompt: query,
        model,
        systemPrompt,
        temperature,
        maxTokens,
      });
    } else if (platform === 'gemini') {
      result = await GeminiService.query({
        prompt: query,
        model,
        systemPrompt,
        temperature,
        maxTokens,
      });
    } else if (platform === 'openrouter') {
      result = await OpenRouterService.query({
        prompt: query,
        model,
        systemPrompt,
        temperature,
        maxTokens,
      });
    } else {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const latency = Date.now() - startTime;

    // Calculate confidence score
    const confidence = this.calculateConfidence({
      content: result.content,
      usage: result.usage,
      model,
      latency,
      maxTokens,
    });

    return {
      tier: tier.tier,
      platform,
      model,
      content: result.content,
      confidence,
      cost: result.cost,
      latency,
      usage: result.usage,
    };
  }

  /**
   * Calculate confidence score (0.0-1.0)
   */
  private static calculateConfidence({
    content,
    usage,
    model,
    latency,
    maxTokens,
  }: {
    content: string;
    usage: { inputTokens: number; outputTokens: number; totalTokens: number };
    model: string;
    latency: number;
    maxTokens: number;
  }): number {
    let confidenceScore = 0;

    // Factor 1: Response completeness (0-0.3 weight)
    // Check if response looks complete (not truncated)
    const outputTokenRatio = usage.outputTokens / maxTokens;
    if (outputTokenRatio < 0.9) {
      // Not hitting token limit = likely complete
      confidenceScore += 0.3;
    } else if (content.trim().endsWith('.') || content.trim().endsWith('!') || content.trim().endsWith('?')) {
      // Hitting limit but ends with punctuation = possibly complete
      confidenceScore += 0.2;
    } else {
      // Hitting limit and no ending punctuation = likely truncated
      confidenceScore += 0.1;
    }

    // Factor 2: Response length appropriateness (0-0.2 weight)
    // Neither too short nor too long
    const contentLength = content.length;
    if (contentLength >= 50 && contentLength <= 5000) {
      confidenceScore += 0.2;
    } else if (contentLength >= 20 && contentLength <= 10000) {
      confidenceScore += 0.1;
    }

    // Factor 3: Error-free content (0-0.3 weight)
    // Check for common error patterns
    const hasErrorPatterns = /error|failed|unable|cannot|sorry|apologize/i.test(content);
    if (!hasErrorPatterns) {
      confidenceScore += 0.3;
    } else {
      confidenceScore += 0.1; // Partial credit
    }

    // Factor 4: Model quality baseline (0-0.2 weight)
    const modelQuality = MODEL_QUALITY_SCORES[model] || 0.5;
    confidenceScore += modelQuality * 0.2;

    // Ensure confidence is in [0, 1] range
    return Math.max(0, Math.min(1, confidenceScore));
  }

  /**
   * Get tier 1 success rate (for analytics)
   */
  static getTier1SuccessRate(results: CascadeExecutionResult[]): number {
    if (results.length === 0) return 0;
    
    const tier1Successes = results.filter(r => r.tierUsed === 1 && !r.escalated).length;
    return (tier1Successes / results.length) * 100;
  }

  /**
   * Calculate average cost per request
   */
  static getAverageCost(results: CascadeExecutionResult[]): number {
    if (results.length === 0) return 0;
    
    const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
    return totalCost / results.length;
  }

  /**
   * Calculate cost savings vs always using premium model
   */
  static calculateSavings(results: CascadeExecutionResult[], premiumCost: number): {
    totalSavings: number;
    savingsPercentage: number;
  } {
    const actualTotalCost = results.reduce((sum, r) => sum + r.cost, 0);
    const premiumTotalCost = results.length * premiumCost;
    const totalSavings = premiumTotalCost - actualTotalCost;
    const savingsPercentage = (totalSavings / premiumTotalCost) * 100;

    return { totalSavings, savingsPercentage };
  }
}
