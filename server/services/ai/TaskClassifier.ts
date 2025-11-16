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
 * 
 * ENHANCEMENTS:
 * - Learning #17: Semantic caching for 30-50% cache hit rate
 * - Learning #13: Historical learning from classification patterns
 * - Learning #11: 4 new complexity signals (length, tech density, questions, code)
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

// Enhancement #17: Semantic Cache Configuration
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 10000; // Maximum cache entries

// Enhancement #13: Historical Learning Configuration
const MAX_HISTORY_SIZE = 1000; // Last 1000 classifications
const HISTORY_LEARNING_THRESHOLD = 50; // Min samples before adjusting

// Enhancement #11: Technical Terms for Density Analysis
const TECHNICAL_TERMS = [
  'algorithm', 'api', 'array', 'async', 'await', 'backend', 'class', 'component',
  'database', 'debug', 'deploy', 'error', 'function', 'implement', 'interface',
  'method', 'optimize', 'query', 'refactor', 'schema', 'server', 'syntax',
  'variable', 'webpack', 'authentication', 'authorization', 'cache', 'cluster',
  'compiler', 'container', 'dependency', 'docker', 'encryption', 'frontend',
  'git', 'kubernetes', 'microservice', 'middleware', 'npm', 'orm', 'promise',
  'react', 'redux', 'repository', 'rest', 'scalable', 'typescript', 'webpack',
];

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
// CACHE & HISTORY INTERFACES
// ============================================================================

interface CacheEntry {
  classification: TaskClassification;
  timestamp: number;
}

interface HistoryEntry {
  query: string;
  classification: TaskClassification;
  timestamp: number;
  success: boolean; // Was classification successful (not fallback)
}

interface HistoryStats {
  totalClassifications: number;
  successRate: number;
  domainDistribution: Record<string, number>;
  averageComplexity: number;
  commonPatterns: string[];
}

// ============================================================================
// TASK CLASSIFIER SERVICE
// ============================================================================

export class TaskClassifier {
  // Enhancement #17: Semantic Cache
  private static cache = new Map<string, CacheEntry>();
  private static cacheHits = 0;
  private static cacheMisses = 0;

  // Enhancement #13: Historical Learning
  private static history: HistoryEntry[] = [];
  private static historyStats: HistoryStats = {
    totalClassifications: 0,
    successRate: 0,
    domainDistribution: {},
    averageComplexity: 0,
    commonPatterns: [],
  };

  /**
   * Enhancement #17: Normalize query for cache key
   */
  private static normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Enhancement #17: Get cached classification if valid
   */
  private static getCached(query: string): TaskClassification | null {
    const normalized = this.normalizeQuery(query);
    const entry = this.cache.get(normalized);

    if (!entry) {
      this.cacheMisses++;
      return null;
    }

    // Check if cache entry is expired (> 1 hour)
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL_MS) {
      this.cache.delete(normalized);
      this.cacheMisses++;
      return null;
    }

    this.cacheHits++;
    return entry.classification;
  }

  /**
   * Enhancement #17: Store classification in cache
   */
  private static setCache(query: string, classification: TaskClassification): void {
    const normalized = this.normalizeQuery(query);

    // Evict oldest entries if cache is full
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(normalized, {
      classification,
      timestamp: Date.now(),
    });
  }

  /**
   * Enhancement #17: Evict expired cache entries
   */
  private static evictExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[TaskClassifier] 🗑️ Evicted ${keysToDelete.length} expired cache entries`);
    }
  }

  /**
   * Enhancement #17: Get cache statistics
   */
  static getCacheStats() {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;

    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: hitRate.toFixed(1) + '%',
      size: this.cache.size,
      maxSize: MAX_CACHE_SIZE,
    };
  }

  /**
   * Enhancement #13: Add classification to history
   */
  private static addToHistory(
    query: string,
    classification: TaskClassification,
    success: boolean
  ): void {
    // Add to history
    this.history.push({
      query,
      classification,
      timestamp: Date.now(),
      success,
    });

    // Keep only last 1000 entries
    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history.shift();
    }

    // Update statistics
    this.updateHistoryStats();
  }

  /**
   * Enhancement #13: Update historical statistics
   */
  private static updateHistoryStats(): void {
    if (this.history.length === 0) return;

    const successfulClassifications = this.history.filter(h => h.success);
    const totalComplexity = this.history.reduce((sum, h) => sum + h.classification.complexity, 0);

    // Calculate domain distribution
    const domainCounts: Record<string, number> = {};
    this.history.forEach(h => {
      const domain = h.classification.domain;
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });

    // Find common patterns (queries with similar complexity/domain)
    const patterns: string[] = [];
    const domainComplexityMap: Record<string, number[]> = {};
    this.history.forEach(h => {
      const domain = h.classification.domain;
      if (!domainComplexityMap[domain]) {
        domainComplexityMap[domain] = [];
      }
      domainComplexityMap[domain].push(h.classification.complexity);
    });

    // Create pattern descriptions
    for (const [domain, complexities] of Object.entries(domainComplexityMap)) {
      const avg = complexities.reduce((a, b) => a + b, 0) / complexities.length;
      patterns.push(`${domain}: avg complexity ${avg.toFixed(2)}`);
    }

    this.historyStats = {
      totalClassifications: this.history.length,
      successRate: (successfulClassifications.length / this.history.length) * 100,
      domainDistribution: domainCounts,
      averageComplexity: totalComplexity / this.history.length,
      commonPatterns: patterns,
    };
  }

  /**
   * Enhancement #13: Get historical statistics
   */
  static getHistoryStats(): HistoryStats {
    return { ...this.historyStats };
  }

  /**
   * Enhancement #13: Adjust complexity based on historical patterns
   */
  private static adjustComplexityFromHistory(
    baseComplexity: number,
    domain: TaskClassification['domain']
  ): number {
    if (this.history.length < HISTORY_LEARNING_THRESHOLD) {
      return baseComplexity; // Not enough data yet
    }

    // Find historical average for this domain
    const domainHistory = this.history.filter(h => h.classification.domain === domain);
    if (domainHistory.length === 0) {
      return baseComplexity;
    }

    const historicalAvg =
      domainHistory.reduce((sum, h) => sum + h.classification.complexity, 0) /
      domainHistory.length;

    // Blend base complexity with historical average (70% base, 30% history)
    return baseComplexity * 0.7 + historicalAvg * 0.3;
  }

  /**
   * Enhancement #11: Calculate query length signal (0.0-1.0)
   */
  private static calculateLengthSignal(query: string): number {
    const wordCount = query.split(/\s+/).length;
    
    // 0-10 words = 0.0, 10-50 = 0.0-0.5, 50-100 = 0.5-0.8, 100+ = 0.8-1.0
    if (wordCount <= 10) return 0.0;
    if (wordCount <= 50) return (wordCount - 10) / 80; // 0.0-0.5
    if (wordCount <= 100) return 0.5 + ((wordCount - 50) / 166.67); // 0.5-0.8
    return Math.min(1.0, 0.8 + ((wordCount - 100) / 500)); // 0.8-1.0
  }

  /**
   * Enhancement #11: Calculate technical term density (0.0-1.0)
   */
  private static calculateTechDensity(query: string, context: string = ''): number {
    const combinedText = (query + ' ' + context).toLowerCase();
    const words = combinedText.split(/\s+/);
    
    if (words.length === 0) return 0.0;

    const techWordCount = words.filter(word => 
      TECHNICAL_TERMS.some(term => word.includes(term))
    ).length;

    const density = techWordCount / words.length;
    
    // 0-10% = 0.0-0.3, 10-30% = 0.3-0.7, 30%+ = 0.7-1.0
    if (density <= 0.1) return density * 3; // 0.0-0.3
    if (density <= 0.3) return 0.3 + ((density - 0.1) * 2); // 0.3-0.7
    return Math.min(1.0, 0.7 + ((density - 0.3) * 1.5)); // 0.7-1.0
  }

  /**
   * Enhancement #11: Calculate question complexity (0.0-1.0)
   */
  private static calculateQuestionComplexity(query: string): number {
    const questionMarkers = query.match(/[?]/g);
    const questionCount = questionMarkers ? questionMarkers.length : 0;

    // Count question words
    const questionWords = ['how', 'why', 'what', 'when', 'where', 'which', 'who'];
    const queryLower = query.toLowerCase();
    const questionWordCount = questionWords.filter(word => 
      queryLower.includes(word)
    ).length;

    // Check for comparison/analysis keywords
    const complexQuestionWords = ['compare', 'analyze', 'evaluate', 'explain', 'describe'];
    const hasComplexQuestion = complexQuestionWords.some(word => 
      queryLower.includes(word)
    );

    // 0 questions = 0.0, 1 simple = 0.3, 1 complex = 0.6, 2+ = 0.8-1.0
    if (questionCount === 0 && questionWordCount === 0) return 0.0;
    if (hasComplexQuestion) return 0.6;
    if (questionCount === 1 || questionWordCount === 1) return 0.3;
    return Math.min(1.0, 0.8 + (questionCount * 0.1));
  }

  /**
   * Enhancement #11: Detect code block presence (0.0 or 0.7)
   */
  private static detectCodeBlocks(query: string, context: string = ''): number {
    const combinedText = query + ' ' + context;
    
    // Check for code block markers
    const hasCodeBlock = /```|`{3,}/.test(combinedText);
    const hasInlineCode = /`[^`]+`/.test(combinedText);
    const hasCodeKeywords = /function\s*\(|const\s+\w+\s*=|class\s+\w+|import\s+\w+/.test(combinedText);

    if (hasCodeBlock) return 0.7;
    if (hasInlineCode && hasCodeKeywords) return 0.5;
    if (hasInlineCode || hasCodeKeywords) return 0.3;
    return 0.0;
  }

  /**
   * Enhancement #11: Combine complexity signals
   */
  private static combineComplexitySignals(
    query: string,
    context: string = '',
    baseDomain: TaskClassification['domain']
  ): number {
    // Calculate all 4 new signals
    const lengthSignal = this.calculateLengthSignal(query);
    const techDensity = this.calculateTechDensity(query, context);
    const questionComplexity = this.calculateQuestionComplexity(query);
    const codeSignal = this.detectCodeBlocks(query, context);

    // Weighted combination (different signals have different importance)
    let combined = 
      lengthSignal * 0.2 +
      techDensity * 0.3 +
      questionComplexity * 0.25 +
      codeSignal * 0.25;

    // Domain-specific adjustments
    if (baseDomain === 'code') {
      combined = Math.min(1.0, combined + 0.15); // Code tasks tend to be more complex
    } else if (baseDomain === 'chat' && questionComplexity < 0.3) {
      combined = Math.max(0.1, combined - 0.1); // Simple chat is less complex
    }

    return Math.min(1.0, Math.max(0.0, combined));
  }

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
      // Enhancement #17: Check cache first
      const cached = this.getCached(query);
      if (cached) {
        const stats = this.getCacheStats();
        console.log(`[TaskClassifier] 🎯 Cache HIT (${stats.hitRate}) - returning cached result`);
        return cached;
      }

      // Enhancement #17: Evict expired entries periodically
      if (Math.random() < 0.1) { // 10% chance to trigger cleanup
        this.evictExpiredCache();
      }

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

      // Enhancement #11: Calculate complexity signals and blend
      const signalComplexity = this.combineComplexitySignals(query, context, classification.domain);
      
      // Blend LLM complexity with signal complexity (60% LLM, 40% signals)
      const blendedComplexity = classification.complexity * 0.6 + signalComplexity * 0.4;
      
      // Enhancement #13: Adjust based on historical patterns
      const finalComplexity = this.adjustComplexityFromHistory(blendedComplexity, classification.domain);
      classification.complexity = Math.min(1.0, Math.max(0.0, finalComplexity));

      // Enhancement #17: Cache the result
      this.setCache(query, classification);

      // Enhancement #13: Add to history
      this.addToHistory(query, classification, true);

      const cacheStats = this.getCacheStats();
      console.log(
        `[TaskClassifier] ✅ Complexity: ${classification.complexity.toFixed(2)} | ` +
        `Domain: ${classification.domain} | Quality: ${classification.requiredQuality.toFixed(2)} | ` +
        `Tokens: ${classification.estimatedTokens} | Budget: $${budgetConstraint} | ` +
        `Cache: ${cacheStats.hitRate} | ${latency}ms`
      );

      return classification;
    } catch (error: any) {
      console.error(`[TaskClassifier] ❌ Classification failed:`, error.message);
      
      // Return fallback classification on error
      const fallback = this.fallbackClassification(query, context, userTier, maxBudget);
      
      // Enhancement #13: Track failure in history
      this.addToHistory(query, fallback, false);
      
      return fallback;
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

    // Enhancement #11: Use new complexity signals for fallback
    const signalComplexity = this.combineComplexitySignals(query, context, domain);
    
    // Determine base complexity (based on query length and keywords)
    let baseComplexity = 0.3; // Default moderate
    if (wordCount < 10 && /^(hi|hello|hey|thanks|ok|yes|no)\b/i.test(queryLower)) {
      baseComplexity = 0.1; // Simple greeting
    } else if (wordCount < 20) {
      baseComplexity = 0.3; // Simple query
    } else if (wordCount < 50) {
      baseComplexity = 0.5; // Moderate query
    } else {
      baseComplexity = 0.7; // Complex query
    }

    // Adjust complexity based on domain
    if (domain === 'code' || domain === 'reasoning') baseComplexity = Math.min(1.0, baseComplexity + 0.2);
    if (domain === 'summarization' || domain === 'bulk') baseComplexity = Math.max(0.2, baseComplexity - 0.1);

    // Blend base with signals (50/50 in fallback mode)
    let complexity = baseComplexity * 0.5 + signalComplexity * 0.5;
    
    // Enhancement #13: Adjust based on historical patterns
    complexity = this.adjustComplexityFromHistory(complexity, domain);

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
