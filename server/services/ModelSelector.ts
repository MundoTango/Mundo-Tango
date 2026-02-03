/**
 * ModelSelector - Cost-Aware Model Selection & Cascade Chain Builder
 * 
 * Queries model registry from UnifiedAIOrchestrator FALLBACK_CHAINS,
 * filters by quality threshold, sorts by cost (cheapest first),
 * and builds 3-tier cascade chain for progressive escalation.
 * 
 * Architecture:
 * - Tier 1 (Cheapest): Groq Llama 3 8B, Gemini Flash Lite ($0.00-0.02/1K)
 * - Tier 2 (Mid-tier): Gemini Flash, GPT-4o-mini ($0.08-0.60/1K)
 * - Tier 3 (Premium): GPT-4o, Claude Sonnet ($3-10/1K)
 */

import type { TaskClassification } from './TaskClassifier';

// ============================================================================
// TYPES
// ============================================================================

export interface ModelDefinition {
  platform: string;
  model: string;
  costPer1KInput: number;  // USD
  costPer1KOutput: number; // USD
  qualityScore: number;    // 0.0-1.0
  speedScore: number;      // 0.0-1.0 (relative)
  contextWindow: number;   // tokens
  specialties: string[];   // domains where model excels
}

export interface ModelTier {
  tier: 1 | 2 | 3;
  platform: string;
  model: string;
  estimatedCost: number;
  qualityScore: number;
  reason: string;
}

export interface CascadeChain {
  tier1: ModelTier;
  tier2: ModelTier;
  tier3: ModelTier;
  totalEstimatedCost: number; // If all tiers executed
  classification: TaskClassification;
}

// ============================================================================
// MODEL REGISTRY
// ============================================================================

/**
 * Comprehensive model registry with cost and quality metrics
 * Costs updated as of November 2025
 */
const MODEL_REGISTRY: ModelDefinition[] = [
  // GROQ (FREE but rate-limited)
  {
    platform: 'groq',
    model: 'llama-3.1-8b-instant',
    costPer1KInput: 0.00,
    costPer1KOutput: 0.00,
    qualityScore: 0.65,
    speedScore: 1.00, // 877 tok/s
    contextWindow: 8000,
    specialties: ['chat', 'summarization', 'bulk'],
  },
  {
    platform: 'groq',
    model: 'llama-3.3-70b-versatile',
    costPer1KInput: 0.00,
    costPer1KOutput: 0.00,
    qualityScore: 0.75,
    speedScore: 0.85, // 250 tok/s
    contextWindow: 8000,
    specialties: ['chat', 'reasoning', 'code'],
  },
  
  // GEMINI (Cheapest paid options)
  {
    platform: 'gemini',
    model: 'gemini-2.5-flash-lite',
    costPer1KInput: 0.02,
    costPer1KOutput: 0.08,
    qualityScore: 0.70,
    speedScore: 0.90,
    contextWindow: 32000,
    specialties: ['chat', 'summarization', 'bulk'],
  },
  {
    platform: 'gemini',
    model: 'gemini-1.5-flash',
    costPer1KInput: 0.075,
    costPer1KOutput: 0.30,
    qualityScore: 0.78,
    speedScore: 0.85,
    contextWindow: 128000,
    specialties: ['chat', 'code', 'analysis'],
  },
  {
    platform: 'gemini',
    model: 'gemini-1.5-pro',
    costPer1KInput: 1.25,
    costPer1KOutput: 5.00,
    qualityScore: 0.88,
    speedScore: 0.70,
    contextWindow: 128000,
    specialties: ['reasoning', 'code', 'analysis'],
  },
  
  // OPENAI
  {
    platform: 'openai',
    model: 'gpt-4o-mini',
    costPer1KInput: 0.15,
    costPer1KOutput: 0.60,
    qualityScore: 0.82,
    speedScore: 0.80,
    contextWindow: 128000,
    specialties: ['chat', 'code', 'reasoning'],
  },
  {
    platform: 'openai',
    model: 'gpt-4o',
    costPer1KInput: 3.00,
    costPer1KOutput: 10.00,
    qualityScore: 0.95,
    speedScore: 0.75,
    contextWindow: 128000,
    specialties: ['code', 'reasoning', 'analysis'],
  },
  
  // ANTHROPIC
  {
    platform: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    costPer1KInput: 3.00,
    costPer1KOutput: 15.00,
    qualityScore: 0.97,
    speedScore: 0.70,
    contextWindow: 200000,
    specialties: ['reasoning', 'code', 'analysis'],
  },
  {
    platform: 'anthropic',
    model: 'claude-3-haiku-20240307',
    costPer1KInput: 0.25,
    costPer1KOutput: 1.25,
    qualityScore: 0.75,
    speedScore: 0.88,
    contextWindow: 200000,
    specialties: ['chat', 'summarization'],
  },
];

// ============================================================================
// MODEL SELECTOR SERVICE
// ============================================================================

export class ModelSelector {
  /**
   * Select optimal model cascade chain based on task classification
   */
  static selectCascadeChain(classification: TaskClassification): CascadeChain {
    console.log(`[ModelSelector] Building cascade chain for domain: ${classification.domain}, complexity: ${classification.complexity.toFixed(2)}`);

    const { domain, complexity, requiredQuality, estimatedTokens, budgetConstraint } = classification;

    // Filter models by domain specialty and quality threshold
    const suitableModels = MODEL_REGISTRY.filter(model => {
      const matchesDomain = model.specialties.includes(domain);
      const meetsQuality = model.qualityScore >= requiredQuality * 0.9; // 10% tolerance
      const fitsContext = model.contextWindow >= estimatedTokens;
      
      return (matchesDomain || domain === 'chat') && meetsQuality && fitsContext;
    });

    if (suitableModels.length === 0) {
      console.warn(`[ModelSelector] ⚠️ No suitable models found, using fallback chain`);
      return this.buildFallbackChain(classification);
    }

    // Calculate estimated cost for each model
    const modelsWithCost = suitableModels.map(model => {
      const inputCost = (estimatedTokens * 0.4 / 1000) * model.costPer1KInput;  // 40% input
      const outputCost = (estimatedTokens * 0.6 / 1000) * model.costPer1KOutput; // 60% output
      const totalCost = inputCost + outputCost;
      
      return { ...model, estimatedCost: totalCost };
    });

    // Sort by cost (cheapest first)
    const sortedByCost = [...modelsWithCost].sort((a, b) => a.estimatedCost - b.estimatedCost);

    // Build 3-tier cascade
    const tier1Model = sortedByCost[0]; // Cheapest
    const tier2Model = sortedByCost[Math.floor(sortedByCost.length / 2)] || sortedByCost[1] || tier1Model; // Mid-tier
    const tier3Model = sortedByCost[sortedByCost.length - 1] || tier2Model; // Most expensive

    const tier1: ModelTier = {
      tier: 1,
      platform: tier1Model.platform,
      model: tier1Model.model,
      estimatedCost: tier1Model.estimatedCost,
      qualityScore: tier1Model.qualityScore,
      reason: `Cheapest option ($${tier1Model.estimatedCost.toFixed(6)})`,
    };

    const tier2: ModelTier = {
      tier: 2,
      platform: tier2Model.platform,
      model: tier2Model.model,
      estimatedCost: tier2Model.estimatedCost,
      qualityScore: tier2Model.qualityScore,
      reason: `Mid-tier balance ($${tier2Model.estimatedCost.toFixed(6)})`,
    };

    const tier3: ModelTier = {
      tier: 3,
      platform: tier3Model.platform,
      model: tier3Model.model,
      estimatedCost: tier3Model.estimatedCost,
      qualityScore: tier3Model.qualityScore,
      reason: `Premium quality ($${tier3Model.estimatedCost.toFixed(6)})`,
    };

    const totalEstimatedCost = tier1.estimatedCost + tier2.estimatedCost + tier3.estimatedCost;

    console.log(
      `[ModelSelector] ✅ Cascade chain built:\n` +
      `  Tier 1: ${tier1.platform}/${tier1.model} ($${tier1.estimatedCost.toFixed(6)})\n` +
      `  Tier 2: ${tier2.platform}/${tier2.model} ($${tier2.estimatedCost.toFixed(6)})\n` +
      `  Tier 3: ${tier3.platform}/${tier3.model} ($${tier3.estimatedCost.toFixed(6)})`
    );

    return {
      tier1,
      tier2,
      tier3,
      totalEstimatedCost,
      classification,
    };
  }

  /**
   * Build fallback cascade chain (when no suitable models found)
   */
  private static buildFallbackChain(classification: TaskClassification): CascadeChain {
    console.log(`[ModelSelector] Building fallback chain`);

    const estimatedTokens = classification.estimatedTokens;

    // Use proven chains from UnifiedAIOrchestrator
    const tier1: ModelTier = {
      tier: 1,
      platform: 'groq',
      model: 'llama-3.1-8b-instant',
      estimatedCost: 0.00,
      qualityScore: 0.65,
      reason: 'Fallback: Free Groq model',
    };

    const tier2: ModelTier = {
      tier: 2,
      platform: 'gemini',
      model: 'gemini-1.5-flash',
      estimatedCost: (estimatedTokens / 1000) * 0.075,
      qualityScore: 0.78,
      reason: 'Fallback: Cost-effective Gemini',
    };

    const tier3: ModelTier = {
      tier: 3,
      platform: 'openai',
      model: 'gpt-4o',
      estimatedCost: (estimatedTokens / 1000) * 3.00,
      qualityScore: 0.95,
      reason: 'Fallback: Premium OpenAI',
    };

    return {
      tier1,
      tier2,
      tier3,
      totalEstimatedCost: tier1.estimatedCost + tier2.estimatedCost + tier3.estimatedCost,
      classification,
    };
  }

  /**
   * Get best model for a specific domain (no cascade, direct selection)
   */
  static getBestModelForDomain(domain: string, budgetConstraint?: number): ModelDefinition | null {
    const domainModels = MODEL_REGISTRY.filter(m => m.specialties.includes(domain));
    
    if (domainModels.length === 0) return null;

    // If budget constraint, filter by cost
    let filtered = domainModels;
    if (budgetConstraint) {
      filtered = domainModels.filter(m => {
        const avgCost = (m.costPer1KInput + m.costPer1KOutput) / 2;
        return avgCost <= budgetConstraint;
      });
    }

    // Sort by quality score (highest first)
    const sorted = filtered.sort((a, b) => b.qualityScore - a.qualityScore);
    
    return sorted[0] || null;
  }

  /**
   * Get cheapest model meeting quality threshold
   */
  static getCheapestModel(minQuality: number = 0.5): ModelDefinition {
    const suitableModels = MODEL_REGISTRY.filter(m => m.qualityScore >= minQuality);
    
    const sorted = suitableModels.sort((a, b) => {
      const aCost = (a.costPer1KInput + a.costPer1KOutput) / 2;
      const bCost = (b.costPer1KInput + b.costPer1KOutput) / 2;
      return aCost - bCost;
    });

    return sorted[0] || MODEL_REGISTRY[0]; // Fallback to first model if none found
  }

  /**
   * Get all available models (for admin/analytics)
   */
  static getAllModels(): ModelDefinition[] {
    return [...MODEL_REGISTRY];
  }

  /**
   * Calculate cost for specific model and token count
   */
  static calculateCost(platform: string, model: string, tokens: number): number {
    const modelDef = MODEL_REGISTRY.find(m => m.platform === platform && m.model === model);
    
    if (!modelDef) {
      console.warn(`[ModelSelector] Model not found in registry: ${platform}/${model}`);
      return 0;
    }

    // Assume 40% input, 60% output (rough average)
    const inputCost = (tokens * 0.4 / 1000) * modelDef.costPer1KInput;
    const outputCost = (tokens * 0.6 / 1000) * modelDef.costPer1KOutput;
    
    return inputCost + outputCost;
  }
}
