/**
 * TaskClassifier - LLM-based Complexity Analyzer
 * 
 * Uses Llama 3 8B (free, fast) to analyze query complexity and determine routing strategy.
 * 
 * Input: User query + context
 * Output: TaskClassification {
 *   complexity: 0.0-1.0 (0=trivial, 0.5=moderate, 1.0=expert)
 *   domain: 'chat'|'code'|'reasoning'|'summarization'|'bulk'
 *   requiredQuality: 0.0-1.0 (minimum acceptable quality threshold)
 *   estimatedTokens: number
 *   budgetConstraint: number (max $ per request)
 * }
 * 
 * Complexity Scoring Guidelines:
 * - 0.0-0.3: Simple tasks (greetings, basic facts, simple summaries)
 * - 0.3-0.6: Moderate tasks (code fixes, analysis, multi-step reasoning)
 * - 0.6-1.0: Complex tasks (architecture design, research, expert advice)
 */

import { GroqService } from './GroqService';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export const TaskClassificationSchema = z.object({
  complexity: z.number().min(0).max(1),
  domain: z.enum(['chat', 'code', 'reasoning', 'summarization', 'bulk', 'analysis']),
  requiredQuality: z.number().min(0).max(1),
  estimatedTokens: z.number().int().positive(),
  budgetConstraint: z.number().positive().optional(),
  reasoning: z.string().optional(),
});

export type TaskClassification = z.infer<typeof TaskClassificationSchema>;

export interface ClassifyOptions {
  query: string;
  context?: string;
  userTier?: 'free' | 'basic' | 'pro' | 'enterprise';
  maxBudget?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CLASSIFIER_MODEL = 'llama-3.1-8b-instant'; // 877 tokens/sec, FREE
const CLASSIFICATION_TEMPERATURE = 0.3; // Lower temperature for consistent classification
const CLASSIFICATION_MAX_TOKENS = 300;

// Budget constraints per tier (USD)
const TIER_BUDGETS: Record<string, number> = {
  free: 0.01,       // $0.01 per request max
  basic: 0.05,      // $0.05 per request max
  pro: 0.15,        // $0.15 per request max
  enterprise: 1.00, // $1.00 per request max
};

// ============================================================================
// CLASSIFIER PROMPT
// ============================================================================

const CLASSIFICATION_SYSTEM_PROMPT = `You are a task complexity analyzer for an AI routing system. Analyze user queries and classify them accurately.

Your job: Given a user query (and optional context), determine:
1. Complexity (0.0-1.0 scale)
2. Domain (chat, code, reasoning, summarization, bulk, analysis)
3. Required Quality (0.0-1.0 - minimum acceptable quality)
4. Estimated Tokens (input + output)

Complexity Guidelines:
- 0.0-0.3: Simple (greetings, basic facts, simple Q&A, short summaries)
  Examples: "Hello", "What is 2+2?", "Summarize this paragraph"
- 0.3-0.6: Moderate (code fixes, multi-step reasoning, detailed explanations)
  Examples: "Debug this code", "Compare X and Y", "Explain how JWT works"
- 0.6-1.0: Complex (architecture design, research, expert analysis)
  Examples: "Design a scalable microservices system", "Analyze market trends"

Domain Guidelines:
- chat: Conversational, Q&A, general assistance
- code: Programming, debugging, code review, technical implementation
- reasoning: Logic, analysis, decision-making, comparison
- summarization: Text condensation, key points extraction
- bulk: Batch processing, repetitive tasks, data transformation
- analysis: Deep research, multi-faceted investigation

Required Quality Guidelines:
- 0.0-0.4: Low quality acceptable (casual chat, drafts)
- 0.4-0.7: Medium quality needed (code assistance, explanations)
- 0.7-1.0: High quality required (production code, critical decisions)

Token Estimation:
- Count words in query and context
- Estimate response length based on task type
- Simple: ~100-300 tokens, Moderate: ~300-800, Complex: ~800-2000

Return ONLY valid JSON (no markdown, no explanation):
{
  "complexity": <number 0.0-1.0>,
  "domain": "<chat|code|reasoning|summarization|bulk|analysis>",
  "requiredQuality": <number 0.0-1.0>,
  "estimatedTokens": <number>,
  "reasoning": "<brief 1-sentence explanation>"
}`;

// ============================================================================
// TASK CLASSIFIER SERVICE
// ============================================================================

export class TaskClassifier {
  /**
   * Classify a task using LLM-based analysis
   */
  static async classify({
    query,
    context = '',
    userTier = 'free',
    maxBudget,
  }: ClassifyOptions): Promise<TaskClassification> {
    try {
      console.log(`[TaskClassifier] Analyzing query complexity...`);
      const startTime = Date.now();

      // Build classification prompt
      const analysisPrompt = `Analyze this task:

QUERY:
${query}

${context ? `CONTEXT:\n${context}\n` : ''}

Classify and return JSON only.`;

      // Query Llama 3 8B for classification (fast, free)
      const response = await GroqService.query({
        prompt: analysisPrompt,
        model: CLASSIFIER_MODEL,
        systemPrompt: CLASSIFICATION_SYSTEM_PROMPT,
        temperature: CLASSIFICATION_TEMPERATURE,
        maxTokens: CLASSIFICATION_MAX_TOKENS,
      });

      const latency = Date.now() - startTime;

      // Parse JSON response
      let classification: TaskClassification;
      try {
        // Extract JSON from response (handle markdown code blocks if present)
        let jsonStr = response.content.trim();
        
        // Remove markdown code blocks if present
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }
        
        const parsed = JSON.parse(jsonStr);
        
        // Validate with Zod
        classification = TaskClassificationSchema.parse(parsed);
      } catch (parseError: any) {
        console.warn(`[TaskClassifier] ⚠️ Failed to parse classification JSON:`, response.content);
        console.warn(`[TaskClassifier] Parse error:`, parseError.message);
        
        // Fallback to heuristic classification
        classification = this.fallbackClassification(query, context);
      }

      // Apply budget constraint
      const budgetConstraint = maxBudget || TIER_BUDGETS[userTier] || TIER_BUDGETS.free;
      classification.budgetConstraint = budgetConstraint;

      console.log(
        `[TaskClassifier] ✅ Complexity: ${classification.complexity.toFixed(2)} | ` +
        `Domain: ${classification.domain} | Quality: ${classification.requiredQuality.toFixed(2)} | ` +
        `Tokens: ${classification.estimatedTokens} | Budget: $${budgetConstraint} | ${latency}ms`
      );

      return classification;
    } catch (error: any) {
      console.error(`[TaskClassifier] ❌ Classification failed:`, error.message);
      
      // Return fallback classification on error
      return this.fallbackClassification(query, context, userTier, maxBudget);
    }
  }

  /**
   * Heuristic fallback classification (when LLM fails)
   */
  private static fallbackClassification(
    query: string,
    context: string = '',
    userTier: string = 'free',
    maxBudget?: number
  ): TaskClassification {
    console.log(`[TaskClassifier] Using heuristic fallback classification`);

    const queryLower = query.toLowerCase();
    const combinedText = (query + ' ' + context).toLowerCase();
    const wordCount = combinedText.split(/\s+/).length;

    // Determine domain
    let domain: TaskClassification['domain'] = 'chat';
    if (/code|function|debug|implement|class|variable|syntax|error|bug/i.test(combinedText)) {
      domain = 'code';
    } else if (/analyze|compare|evaluate|reason|decide|pros.*cons|why|how/i.test(combinedText)) {
      domain = 'reasoning';
    } else if (/summarize|tldr|key points|brief|overview/i.test(combinedText)) {
      domain = 'summarization';
    } else if (/batch|bulk|process|transform|convert|multiple/i.test(combinedText)) {
      domain = 'bulk';
    } else if (/research|investigate|study|deep dive|comprehensive/i.test(combinedText)) {
      domain = 'analysis';
    }

    // Determine complexity (based on query length and keywords)
    let complexity = 0.3; // Default moderate
    if (wordCount < 10 && /^(hi|hello|hey|thanks|ok|yes|no)\b/i.test(queryLower)) {
      complexity = 0.1; // Simple greeting
    } else if (wordCount < 20) {
      complexity = 0.3; // Simple query
    } else if (wordCount < 50) {
      complexity = 0.5; // Moderate query
    } else {
      complexity = 0.7; // Complex query
    }

    // Adjust complexity based on domain
    if (domain === 'code' || domain === 'reasoning') complexity = Math.min(1.0, complexity + 0.2);
    if (domain === 'summarization' || domain === 'bulk') complexity = Math.max(0.2, complexity - 0.1);

    // Determine required quality
    let requiredQuality = 0.5; // Default medium
    if (domain === 'code') requiredQuality = 0.7; // Code needs high quality
    if (domain === 'reasoning' || domain === 'analysis') requiredQuality = 0.8;
    if (domain === 'chat' && complexity < 0.3) requiredQuality = 0.3; // Casual chat

    // Estimate tokens (rough: 1 word ≈ 1.3 tokens, output = 2-5x input)
    const inputTokens = Math.ceil(wordCount * 1.3);
    const outputTokens = Math.ceil(inputTokens * (complexity > 0.6 ? 5 : complexity > 0.3 ? 3 : 2));
    const estimatedTokens = inputTokens + outputTokens;

    // Budget constraint
    const budgetConstraint = maxBudget || TIER_BUDGETS[userTier] || TIER_BUDGETS.free;

    return {
      complexity,
      domain,
      requiredQuality,
      estimatedTokens,
      budgetConstraint,
      reasoning: `Heuristic classification: ${wordCount} words, domain=${domain}`,
    };
  }

  /**
   * Batch classify multiple queries (for DPO training dataset generation)
   */
  static async classifyBatch(queries: string[]): Promise<TaskClassification[]> {
    console.log(`[TaskClassifier] Batch classifying ${queries.length} queries...`);
    
    const results: TaskClassification[] = [];
    
    for (let i = 0; i < queries.length; i++) {
      try {
        const classification = await this.classify({ query: queries[i] });
        results.push(classification);
        
        // Rate limiting: Wait 100ms between classifications to avoid hitting Groq limits
        if (i < queries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error: any) {
        console.error(`[TaskClassifier] Failed to classify query ${i + 1}:`, error.message);
        results.push(this.fallbackClassification(queries[i]));
      }
    }
    
    console.log(`[TaskClassifier] ✅ Batch classification complete: ${results.length} results`);
    return results;
  }
}
