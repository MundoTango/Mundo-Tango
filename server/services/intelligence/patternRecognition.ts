/**
 * Pattern Recognition Engine
 * TRACK 2 BATCH 8: Cross-Agent Pattern Detection & Solution Reuse
 * 
 * Bridges Agent #79 (Quality Validator) and Agent #80 (Learning Coordinator)
 * to provide intelligent pattern matching, solution recommendations, and
 * collaborative learning across the entire ESA agent network.
 * 
 * Key Features:
 * - Regex-based problem signature matching
 * - Semantic similarity matching with OpenAI embeddings
 * - Solution template application with confidence scoring
 * - Pattern reuse tracking and success rate monitoring
 * - Auto-fix recommendations from proven patterns
 * - Pattern library growth and evolution
 * - Cross-agent pattern discovery
 * - When-not-to-use rules for edge cases
 * 
 * Integration:
 * - Agent #79: Uses pattern matching for validation suggestions
 * - Agent #80: Feeds patterns for knowledge distribution
 */

import OpenAI from 'openai';
import { db } from "../../../shared/db";
import { 
  learningPatterns, 
  agentLearnings,
  type InsertLearningPattern, 
  type SelectLearningPattern,
  type SelectAgentLearning
} from "../../../shared/schema";
import { eq, desc, sql, and, gte, lte, or, ilike, inArray } from "drizzle-orm";

// ============================================================================
// CONFIGURATION
// ============================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

const EMBEDDING_MODEL = "text-embedding-3-small";
const SIMILARITY_THRESHOLD = 0.75; // Minimum similarity for pattern match
const HIGH_CONFIDENCE_THRESHOLD = 0.98; // Proven pattern threshold
const MIN_APPLICATIONS_FOR_PROVEN = 3; // Minimum uses to be "proven"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProblemSignature {
  category: 'bug_fix' | 'optimization' | 'feature' | 'refactor' | 'pattern' | 'architecture';
  domain: string; // e.g., 'mobile', 'performance', 'ui', 'backend'
  problem: string;
  context?: {
    page?: string;
    component?: string;
    errorMessage?: string;
    stackTrace?: string;
    browserType?: string;
    deviceType?: string;
  };
  severity?: 'critical' | 'high' | 'medium' | 'low';
  fingerprint?: string; // Unique hash of the problem
}

export interface SolutionMatch {
  patternId: number;
  patternName: string;
  problemSignature: string;
  solutionTemplate: string;
  confidence: number; // 0-1, based on similarity + success rate
  successRate: number;
  timesApplied: number;
  discoveredBy: string[];
  codeExample?: string;
  whenNotToUse?: string;
  variations?: Record<string, any>;
  applicability: 'exact' | 'high' | 'moderate' | 'low';
  reasoning: string;
}

export interface PatternDetectionResult {
  isRecurring: boolean;
  matchedPattern?: SolutionMatch;
  similarPatterns: SolutionMatch[];
  recommendation: 'apply_proven_pattern' | 'create_new_pattern' | 'combine_patterns' | 'manual_investigation';
  confidence: number;
  reasoning: string;
}

export interface PatternApplicationResult {
  success: boolean;
  patternId: number;
  patternName: string;
  appliedBy: string;
  outcome?: {
    timeSaved?: string;
    metricsImproved?: Record<string, number>;
    issuesResolved?: number;
  };
  feedback?: string;
}

export interface PatternEvolution {
  patternId: number;
  patternName: string;
  evolutionType: 'refinement' | 'generalization' | 'specialization' | 'deprecation';
  changes: {
    beforeSignature: string;
    afterSignature: string;
    beforeSolution: string;
    afterSolution: string;
  };
  reason: string;
  triggeredBy: string[];
}

// ============================================================================
// PATTERN RECOGNITION ENGINE CLASS
// ============================================================================

export class PatternRecognitionEngine {
  private agentId = "Pattern Recognition Engine";
  private embeddingCache = new Map<string, number[]>();
  
  // ==========================================================================
  // 1. DETECT PATTERN - Core pattern detection method
  // ==========================================================================
  
  /**
   * Detects if a problem matches existing patterns in the library
   * Returns proven solutions with confidence scores
   */
  async detectPattern(signature: ProblemSignature): Promise<PatternDetectionResult> {
    console.log(`[${this.agentId}] 🔍 Detecting pattern for: ${signature.problem.slice(0, 60)}...`);
    
    try {
      // Step 1: Generate problem fingerprint
      const fingerprint = this.generateFingerprint(signature);
      signature.fingerprint = fingerprint;
      
      // Step 2: Search for exact match first
      const exactMatch = await this.findExactMatch(fingerprint);
      if (exactMatch) {
        console.log(`[${this.agentId}] ✅ Exact pattern match found: ${exactMatch.patternName}`);
        return {
          isRecurring: true,
          matchedPattern: exactMatch,
          similarPatterns: [],
          recommendation: 'apply_proven_pattern',
          confidence: exactMatch.confidence,
          reasoning: `Exact match found with ${exactMatch.timesApplied} successful applications`
        };
      }
      
      // Step 3: Semantic search for similar patterns
      const similarPatterns = await this.findSimilarPatterns(signature);
      
      if (similarPatterns.length === 0) {
        console.log(`[${this.agentId}] ℹ️ No similar patterns found - this is a new problem`);
        return {
          isRecurring: false,
          similarPatterns: [],
          recommendation: 'create_new_pattern',
          confidence: 0.0,
          reasoning: 'No similar patterns in library - manual investigation required'
        };
      }
      
      // Step 4: Rank patterns by confidence
      const topMatch = similarPatterns[0];
      
      // Step 5: Determine recommendation based on confidence
      let recommendation: PatternDetectionResult['recommendation'];
      if (topMatch.confidence >= HIGH_CONFIDENCE_THRESHOLD && topMatch.timesApplied >= MIN_APPLICATIONS_FOR_PROVEN) {
        recommendation = 'apply_proven_pattern';
      } else if (similarPatterns.length >= 2 && similarPatterns[0].confidence > 0.85) {
        recommendation = 'combine_patterns';
      } else if (topMatch.confidence >= 0.75) {
        recommendation = 'apply_proven_pattern';
      } else {
        recommendation = 'manual_investigation';
      }
      
      console.log(`[${this.agentId}] 📊 Found ${similarPatterns.length} similar patterns, top confidence: ${Math.round(topMatch.confidence * 100)}%`);
      
      return {
        isRecurring: true,
        matchedPattern: topMatch,
        similarPatterns: similarPatterns.slice(1, 4), // Top 3 alternates
        recommendation,
        confidence: topMatch.confidence,
        reasoning: this.generateRecommendationReasoning(topMatch, similarPatterns, recommendation)
      };
      
    } catch (error) {
      console.error(`[${this.agentId}] ❌ Error detecting pattern:`, error);
      return {
        isRecurring: false,
        similarPatterns: [],
        recommendation: 'manual_investigation',
        confidence: 0.0,
        reasoning: 'Pattern detection failed - manual investigation required'
      };
    }
  }
  
  // ==========================================================================
  // 2. MATCH SOLUTION - Find proven solutions for a problem
  // ==========================================================================
  
  /**
   * Matches a problem to proven solutions with confidence scoring
   * Returns ranked list of applicable solutions
   */
  async matchSolution(signature: ProblemSignature, limit: number = 5): Promise<SolutionMatch[]> {
    console.log(`[${this.agentId}] 🎯 Matching solutions for: ${signature.problem.slice(0, 60)}...`);
    
    try {
      // Get all high-quality patterns
      const patterns = await db
        .select()
        .from(learningPatterns)
        .where(gte(learningPatterns.successRate, 0.7))
        .orderBy(desc(learningPatterns.successRate), desc(learningPatterns.timesApplied))
        .limit(50);
      
      if (patterns.length === 0) {
        console.log(`[${this.agentId}] ℹ️ No patterns in library yet`);
        return [];
      }
      
      // Calculate semantic similarity for each pattern
      const problemEmbedding = await this.generateEmbedding(
        `${signature.problem} ${signature.domain} ${signature.category}`
      );
      
      const matches: SolutionMatch[] = [];
      
      for (const pattern of patterns) {
        const patternEmbedding = await this.generateEmbedding(
          `${pattern.problemSignature} ${pattern.solutionTemplate}`
        );
        
        const similarity = this.cosineSimilarity(problemEmbedding, patternEmbedding);
        
        if (similarity >= SIMILARITY_THRESHOLD) {
          const confidence = this.calculateConfidence(pattern, similarity);
          const applicability = this.determineApplicability(similarity, confidence);
          
          matches.push({
            patternId: pattern.id,
            patternName: pattern.patternName,
            problemSignature: pattern.problemSignature,
            solutionTemplate: pattern.solutionTemplate,
            confidence,
            successRate: pattern.successRate,
            timesApplied: pattern.timesApplied,
            discoveredBy: pattern.discoveredBy,
            codeExample: pattern.codeExample || undefined,
            whenNotToUse: pattern.whenNotToUse || undefined,
            variations: pattern.variations as Record<string, any> || undefined,
            applicability,
            reasoning: this.generateMatchReasoning(pattern, similarity, confidence)
          });
        }
      }
      
      // Sort by confidence (descending)
      matches.sort((a, b) => b.confidence - a.confidence);
      
      console.log(`[${this.agentId}] ✅ Found ${matches.length} matching solutions`);
      
      return matches.slice(0, limit);
      
    } catch (error) {
      console.error(`[${this.agentId}] ❌ Error matching solutions:`, error);
      return [];
    }
  }
  
  // ==========================================================================
  // 3. CALCULATE CONFIDENCE - Advanced confidence scoring
  // ==========================================================================
  
  /**
   * Calculates confidence score for a pattern match
   * Factors: semantic similarity, success rate, application count, recency
   */
  calculateConfidence(pattern: SelectLearningPattern, similarity: number): number {
    // Weight factors
    const SIMILARITY_WEIGHT = 0.4;
    const SUCCESS_RATE_WEIGHT = 0.3;
    const APPLICATION_COUNT_WEIGHT = 0.2;
    const RECENCY_WEIGHT = 0.1;
    
    // Similarity score (0-1)
    const similarityScore = similarity;
    
    // Success rate score (0-1)
    const successRateScore = pattern.successRate;
    
    // Application count score (0-1, capped at 10 applications)
    const applicationScore = Math.min(pattern.timesApplied / 10, 1.0);
    
    // Recency score (0-1, patterns used in last 30 days score higher)
    const daysSinceUpdate = pattern.updatedAt 
      ? Math.floor((Date.now() - new Date(pattern.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const recencyScore = Math.max(0, 1 - (daysSinceUpdate / 30));
    
    // Weighted confidence score
    const confidence = 
      (similarityScore * SIMILARITY_WEIGHT) +
      (successRateScore * SUCCESS_RATE_WEIGHT) +
      (applicationScore * APPLICATION_COUNT_WEIGHT) +
      (recencyScore * RECENCY_WEIGHT);
    
    return Math.min(confidence, 1.0);
  }
  
  // ==========================================================================
  // 4. TRACK REUSE - Monitor pattern application and outcomes
  // ==========================================================================
  
  /**
   * Tracks when a pattern is applied and records the outcome
   * Updates pattern statistics and success rates
   */
  async trackReuse(application: PatternApplicationResult): Promise<void> {
    console.log(`[${this.agentId}] 📈 Tracking pattern reuse: ${application.patternName}`);
    
    try {
      // Get current pattern
      const pattern = await db
        .select()
        .from(learningPatterns)
        .where(eq(learningPatterns.id, application.patternId))
        .limit(1);
      
      if (pattern.length === 0) {
        throw new Error(`Pattern not found: ${application.patternId}`);
      }
      
      const currentPattern = pattern[0];
      
      // Update application count
      const newTimesApplied = currentPattern.timesApplied + 1;
      
      // Recalculate success rate
      const successValue = application.success ? 1 : 0;
      const newSuccessRate = 
        ((currentPattern.successRate * currentPattern.timesApplied) + successValue) / newTimesApplied;
      
      // Add variation if provided
      const variations = (currentPattern.variations as Record<string, any>) || {};
      if (application.appliedBy) {
        variations[`application_${Date.now()}`] = {
          appliedBy: application.appliedBy,
          success: application.success,
          outcome: application.outcome,
          feedback: application.feedback,
          timestamp: new Date().toISOString()
        };
      }
      
      // Update pattern
      await db
        .update(learningPatterns)
        .set({
          timesApplied: newTimesApplied,
          successRate: newSuccessRate,
          variations,
          updatedAt: new Date()
        })
        .where(eq(learningPatterns.id, application.patternId));
      
      console.log(`[${this.agentId}] ✅ Pattern stats updated: ${newTimesApplied} applications, ${Math.round(newSuccessRate * 100)}% success rate`);
      
      // Check if pattern should be evolved or deprecated
      await this.evaluatePatternEvolution(application.patternId, newSuccessRate, newTimesApplied);
      
    } catch (error) {
      console.error(`[${this.agentId}] ❌ Error tracking reuse:`, error);
      throw error;
    }
  }
  
  // ==========================================================================
  // 5. UPDATE LIBRARY - Add new patterns or update existing ones
  // ==========================================================================
  
  /**
   * Updates the pattern library with new learnings
   * Handles pattern creation, updates, merging, and deprecation
   */
  async updateLibrary(signature: ProblemSignature, solution: string, metadata: {
    discoveredBy: string;
    codeExample?: string;
    whenNotToUse?: string;
    initialSuccessRate?: number;
  }): Promise<{ patternId: number; patternName: string; action: 'created' | 'updated' | 'merged' }> {
    console.log(`[${this.agentId}] 📚 Updating pattern library...`);
    
    try {
      // Check if similar pattern exists
      const existingPatterns = await this.findSimilarPatterns(signature, 0.9); // High threshold
      
      if (existingPatterns.length > 0) {
        // Update existing pattern with variation
        const existingPattern = existingPatterns[0];
        
        const variations = (existingPattern.variations as Record<string, any>) || {};
        variations[metadata.discoveredBy] = {
          problem: signature.problem,
          solution,
          context: signature.context,
          timestamp: new Date().toISOString()
        };
        
        // Update discovered_by array
        const discoveredBy = existingPattern.discoveredBy;
        if (!discoveredBy.includes(metadata.discoveredBy)) {
          discoveredBy.push(metadata.discoveredBy);
        }
        
        await db
          .update(learningPatterns)
          .set({
            variations,
            discoveredBy,
            updatedAt: new Date()
          })
          .where(eq(learningPatterns.id, existingPattern.patternId));
        
        console.log(`[${this.agentId}] ✅ Updated existing pattern: ${existingPattern.patternName}`);
        
        return {
          patternId: existingPattern.patternId,
          patternName: existingPattern.patternName,
          action: 'updated'
        };
      }
      
      // Create new pattern
      const patternName = this.generatePatternName(signature);
      
      const newPattern = await db
        .insert(learningPatterns)
        .values({
          patternName,
          problemSignature: signature.problem,
          solutionTemplate: solution,
          discoveredBy: [metadata.discoveredBy],
          timesApplied: 0,
          successRate: metadata.initialSuccessRate || 0.85,
          variations: {
            [metadata.discoveredBy]: {
              problem: signature.problem,
              solution,
              context: signature.context,
              timestamp: new Date().toISOString()
            }
          },
          whenNotToUse: metadata.whenNotToUse || null,
          codeExample: metadata.codeExample || null,
        })
        .returning();
      
      console.log(`[${this.agentId}] ✅ Created new pattern: ${patternName}`);
      
      return {
        patternId: newPattern[0].id,
        patternName: newPattern[0].patternName,
        action: 'created'
      };
      
    } catch (error) {
      console.error(`[${this.agentId}] ❌ Error updating library:`, error);
      throw error;
    }
  }
  
  // ==========================================================================
  // 6. REGEX PATTERN MATCHING - Regex-based problem signature matching
  // ==========================================================================
  
  /**
   * Matches problem against regex patterns in the library
   * Faster than semantic search for known issue patterns
   */
  async matchRegexPatterns(signature: ProblemSignature): Promise<SolutionMatch[]> {
    console.log(`[${this.agentId}] 🔎 Regex pattern matching for: ${signature.problem.slice(0, 60)}...`);
    
    try {
      // Get patterns with regex signatures
      const patterns = await db
        .select()
        .from(learningPatterns)
        .where(and(
          eq(learningPatterns.isActive, true),
          gte(learningPatterns.successRate, 0.7)
        ))
        .orderBy(desc(learningPatterns.successRate));
      
      const matches: SolutionMatch[] = [];
      
      for (const pattern of patterns) {
        // Check if problemSignature contains regex pattern (indicated by special chars)
        if (this.isRegexPattern(pattern.problemSignature)) {
          try {
            const regex = new RegExp(pattern.problemSignature, 'i');
            const problemText = `${signature.problem} ${signature.context?.errorMessage || ''}`;
            
            if (regex.test(problemText)) {
              const confidence = this.calculateConfidence(pattern, 0.95); // High confidence for regex match
              
              matches.push({
                patternId: pattern.id,
                patternName: pattern.patternName,
                problemSignature: pattern.problemSignature,
                solutionTemplate: pattern.solutionTemplate,
                confidence,
                successRate: pattern.successRate,
                timesApplied: pattern.timesApplied,
                discoveredBy: pattern.discoveredBy,
                codeExample: pattern.codeExample || undefined,
                whenNotToUse: pattern.whenNotToUse || undefined,
                variations: pattern.variations as Record<string, any> || undefined,
                applicability: 'exact',
                reasoning: `Exact regex match (${Math.round(pattern.successRate * 100)}% success rate, ${pattern.timesApplied} applications)`
              });
            }
          } catch (error) {
            console.warn(`[${this.agentId}] Invalid regex pattern: ${pattern.problemSignature}`);
          }
        }
      }
      
      console.log(`[${this.agentId}] ✅ Found ${matches.length} regex pattern matches`);
      
      return matches.sort((a, b) => b.confidence - a.confidence);
      
    } catch (error) {
      console.error(`[${this.agentId}] ❌ Regex matching error:`, error);
      return [];
    }
  }
  
  /**
   * Check if a string is a regex pattern
   */
  private isRegexPattern(signature: string): boolean {
    // Check for common regex special characters
    const regexIndicators = /[.*+?^${}()|[\]\\]/;
    return regexIndicators.test(signature);
  }
  
  // ==========================================================================
  // 7. CROSS-AGENT PATTERN DISCOVERY - Discover patterns from agent learnings
  // ==========================================================================
  
  /**
   * Analyzes agent learnings to discover recurring patterns
   * Automatically creates patterns when 3+ similar issues are solved
   */
  async discoverPatternsFromLearnings(options: {
    minOccurrences?: number;
    minSimilarity?: number;
    agentIds?: string[];
    category?: string;
    domain?: string;
  } = {}): Promise<{ 
    patternsDiscovered: number; 
    patterns: Array<{ patternName: string; occurrences: number; agentIds: string[] }> 
  }> {
    const minOccurrences = options.minOccurrences || 3;
    const minSimilarity = options.minSimilarity || 0.85;
    
    console.log(`[${this.agentId}] 🔍 Discovering patterns from agent learnings...`);
    console.log(`[${this.agentId}]    Min occurrences: ${minOccurrences}, Min similarity: ${minSimilarity}`);
    
    try {
      // Get recent learnings
      let query = db.select().from(agentLearnings);
      
      const conditions = [];
      if (options.category) {
        conditions.push(eq(agentLearnings.category, options.category));
      }
      if (options.domain) {
        conditions.push(eq(agentLearnings.domain, options.domain));
      }
      if (options.agentIds && options.agentIds.length > 0) {
        conditions.push(inArray(agentLearnings.agentId, options.agentIds));
      }
      
      const learnings = conditions.length > 0 
        ? await query.where(and(...conditions)).orderBy(desc(agentLearnings.createdAt)).limit(100)
        : await query.orderBy(desc(agentLearnings.createdAt)).limit(100);
      
      if (learnings.length < minOccurrences) {
        console.log(`[${this.agentId}] ℹ️ Not enough learnings for pattern discovery (${learnings.length} found)`);
        return { patternsDiscovered: 0, patterns: [] };
      }
      
      // Group similar learnings
      const clusters = await this.clusterSimilarLearnings(learnings, minSimilarity);
      
      // Create patterns for clusters with enough occurrences
      const discoveredPatterns = [];
      let patternsCreated = 0;
      
      for (const cluster of clusters) {
        if (cluster.learnings.length >= minOccurrences) {
          // Check if pattern already exists
          const existingPattern = await this.findPatternBySignature(cluster.commonProblem);
          
          if (!existingPattern) {
            // Create new pattern
            const patternName = this.generatePatternNameFromCluster(cluster);
            const regex = this.generateRegexFromCluster(cluster);
            
            const [newPattern] = await db.insert(learningPatterns).values({
              patternName,
              problemSignature: regex,
              solutionTemplate: cluster.commonSolution,
              category: cluster.category,
              discoveredBy: cluster.agentIds,
              timesApplied: 0,
              successRate: this.calculateClusterSuccessRate(cluster),
              confidence: cluster.similarity,
              metadata: {
                autoDiscovered: true,
                discoveryDate: new Date().toISOString(),
                clusterSize: cluster.learnings.length,
                source: 'pattern_discovery_engine'
              },
              variations: this.buildVariationsFromCluster(cluster)
            }).returning();
            
            discoveredPatterns.push({
              patternName: newPattern.patternName,
              occurrences: cluster.learnings.length,
              agentIds: cluster.agentIds
            });
            
            patternsCreated++;
            
            console.log(`[${this.agentId}] ✨ New pattern discovered: ${patternName} (${cluster.learnings.length} occurrences)`);
          } else {
            console.log(`[${this.agentId}] ℹ️ Pattern already exists: ${existingPattern.patternName}`);
          }
        }
      }
      
      console.log(`[${this.agentId}] ✅ Pattern discovery complete: ${patternsCreated} new patterns created`);
      
      return {
        patternsDiscovered: patternsCreated,
        patterns: discoveredPatterns
      };
      
    } catch (error) {
      console.error(`[${this.agentId}] ❌ Pattern discovery error:`, error);
      return { patternsDiscovered: 0, patterns: [] };
    }
  }
  
  /**
   * Cluster similar learnings using semantic similarity
   */
  private async clusterSimilarLearnings(
    learnings: SelectAgentLearning[], 
    minSimilarity: number
  ): Promise<Array<{
    commonProblem: string;
    commonSolution: string;
    category: string;
    domain: string;
    similarity: number;
    agentIds: string[];
    learnings: SelectAgentLearning[];
  }>> {
    const clusters: Array<{
      commonProblem: string;
      commonSolution: string;
      category: string;
      domain: string;
      similarity: number;
      agentIds: string[];
      learnings: SelectAgentLearning[];
    }> = [];
    
    const processed = new Set<number>();
    
    for (let i = 0; i < learnings.length; i++) {
      if (processed.has(i)) continue;
      
      const learning1 = learnings[i];
      const cluster = {
        commonProblem: learning1.problem,
        commonSolution: learning1.solution,
        category: learning1.category,
        domain: learning1.domain || 'general',
        similarity: 1.0,
        agentIds: [learning1.agentId || 'unknown'],
        learnings: [learning1]
      };
      
      processed.add(i);
      
      // Find similar learnings
      for (let j = i + 1; j < learnings.length; j++) {
        if (processed.has(j)) continue;
        
        const learning2 = learnings[j];
        
        // Must be same category and domain
        if (learning1.category !== learning2.category) continue;
        
        // Calculate similarity
        const similarity = await this.calculateLearningSimilarity(learning1, learning2);
        
        if (similarity >= minSimilarity) {
          cluster.learnings.push(learning2);
          if (learning2.agentId && !cluster.agentIds.includes(learning2.agentId)) {
            cluster.agentIds.push(learning2.agentId);
          }
          cluster.similarity = Math.min(cluster.similarity, similarity);
          processed.add(j);
        }
      }
      
      if (cluster.learnings.length >= 2) {
        clusters.push(cluster);
      }
    }
    
    return clusters;
  }
  
  /**
   * Calculate similarity between two learnings
   */
  private async calculateLearningSimilarity(
    learning1: SelectAgentLearning,
    learning2: SelectAgentLearning
  ): Promise<number> {
    try {
      const text1 = `${learning1.problem} ${learning1.solution}`;
      const text2 = `${learning2.problem} ${learning2.solution}`;
      
      const embedding1 = await this.generateEmbedding(text1);
      const embedding2 = await this.generateEmbedding(text2);
      
      return this.cosineSimilarity(embedding1, embedding2);
    } catch (error) {
      console.error(`[${this.agentId}] Similarity calculation error:`, error);
      return 0;
    }
  }
  
  /**
   * Generate pattern name from cluster
   */
  private generatePatternNameFromCluster(cluster: {
    category: string;
    domain: string;
    learnings: SelectAgentLearning[];
  }): string {
    const category = cluster.category.toLowerCase().replace(/\s+/g, '_');
    const domain = cluster.domain.toLowerCase().replace(/\s+/g, '_');
    const timestamp = Date.now();
    return `${domain}_${category}_pattern_${timestamp}`;
  }
  
  /**
   * Generate regex pattern from cluster
   */
  private generateRegexFromCluster(cluster: { learnings: SelectAgentLearning[] }): string {
    // Extract common keywords from problems
    const problems = cluster.learnings.map(l => l.problem);
    const commonWords = this.extractCommonKeywords(problems);
    
    // Build regex pattern
    if (commonWords.length > 0) {
      return commonWords.map(w => `(?=.*${this.escapeRegex(w)})`).join('') + '.*';
    }
    
    // Fallback: use first problem as template
    return this.escapeRegex(problems[0]);
  }
  
  /**
   * Extract common keywords from problems
   */
  private extractCommonKeywords(problems: string[]): string[] {
    const wordFrequency = new Map<string, number>();
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were']);
    
    for (const problem of problems) {
      const words = problem.toLowerCase().match(/\b\w+\b/g) || [];
      for (const word of words) {
        if (!stopWords.has(word) && word.length > 3) {
          wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
      }
    }
    
    // Get words that appear in at least 50% of problems
    const threshold = Math.ceil(problems.length / 2);
    return Array.from(wordFrequency.entries())
      .filter(([_, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word, _]) => word);
  }
  
  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Calculate success rate from cluster
   */
  private calculateClusterSuccessRate(cluster: { learnings: SelectAgentLearning[] }): number {
    const successCount = cluster.learnings.filter(l => {
      const outcome = l.outcome as { success?: boolean } | null;
      return outcome?.success === true;
    }).length;
    
    return successCount / cluster.learnings.length;
  }
  
  /**
   * Build variations object from cluster
   */
  private buildVariationsFromCluster(cluster: { learnings: SelectAgentLearning[] }): Record<string, any> {
    const variations: Record<string, any> = {};
    
    cluster.learnings.forEach((learning, index) => {
      variations[`variation_${index + 1}`] = {
        problem: learning.problem,
        solution: learning.solution,
        agentId: learning.agentId,
        outcome: learning.outcome,
        timestamp: learning.createdAt?.toISOString()
      };
    });
    
    return variations;
  }
  
  /**
   * Find pattern by signature (exact or similar)
   */
  private async findPatternBySignature(signature: string): Promise<SelectLearningPattern | null> {
    const patterns = await db
      .select()
      .from(learningPatterns)
      .where(ilike(learningPatterns.problemSignature, `%${signature.slice(0, 50)}%`))
      .limit(1);
    
    return patterns.length > 0 ? patterns[0] : null;
  }
  
  // ==========================================================================
  // 8. GET PATTERN STATISTICS - Analytics for pattern library
  // ==========================================================================
  
  /**
   * Get comprehensive statistics about the pattern library
   */
  async getPatternStatistics(options: {
    category?: string;
    minSuccessRate?: number;
  } = {}): Promise<{
    totalPatterns: number;
    activePatterns: number;
    provenPatterns: number;
    averageSuccessRate: number;
    totalApplications: number;
    topPerformingPatterns: Array<{
      patternName: string;
      successRate: number;
      timesApplied: number;
      discoveredBy: string[];
    }>;
    categoryBreakdown: Record<string, number>;
  }> {
    try {
      let query = db.select().from(learningPatterns);
      
      const conditions = [];
      if (options.category) {
        conditions.push(eq(learningPatterns.category, options.category));
      }
      if (options.minSuccessRate) {
        conditions.push(gte(learningPatterns.successRate, options.minSuccessRate));
      }
      
      const patterns = conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;
      
      const activePatterns = patterns.filter(p => p.isActive);
      const provenPatterns = patterns.filter(p => p.timesApplied >= MIN_APPLICATIONS_FOR_PROVEN && p.successRate >= 0.9);
      
      const totalApplications = patterns.reduce((sum, p) => sum + p.timesApplied, 0);
      const averageSuccessRate = patterns.length > 0
        ? patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length
        : 0;
      
      // Category breakdown
      const categoryBreakdown: Record<string, number> = {};
      patterns.forEach(p => {
        const cat = p.category || 'uncategorized';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
      });
      
      // Top performing patterns
      const topPerformingPatterns = patterns
        .filter(p => p.timesApplied > 0)
        .sort((a, b) => {
          const scoreA = a.successRate * Math.log10(a.timesApplied + 1);
          const scoreB = b.successRate * Math.log10(b.timesApplied + 1);
          return scoreB - scoreA;
        })
        .slice(0, 10)
        .map(p => ({
          patternName: p.patternName,
          successRate: p.successRate,
          timesApplied: p.timesApplied,
          discoveredBy: p.discoveredBy
        }));
      
      return {
        totalPatterns: patterns.length,
        activePatterns: activePatterns.length,
        provenPatterns: provenPatterns.length,
        averageSuccessRate,
        totalApplications,
        topPerformingPatterns,
        categoryBreakdown
      };
      
    } catch (error) {
      console.error(`[${this.agentId}] ❌ Statistics error:`, error);
      return {
        totalPatterns: 0,
        activePatterns: 0,
        provenPatterns: 0,
        averageSuccessRate: 0,
        totalApplications: 0,
        topPerformingPatterns: [],
        categoryBreakdown: {}
      };
    }
  }
  
  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  
  /**
   * Generate unique problem fingerprint for exact matching
   */
  private generateFingerprint(signature: ProblemSignature): string {
    const normalized = `${signature.category}:${signature.domain}:${signature.problem}`
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `fp_${Math.abs(hash).toString(16)}`;
  }
  
  /**
   * Find exact pattern match by fingerprint
   */
  private async findExactMatch(fingerprint: string): Promise<SolutionMatch | null> {
    // In production, store fingerprints in variations metadata
    // For now, return null (semantic search will handle it)
    return null;
  }
  
  /**
   * Find similar patterns using semantic search
   */
  private async findSimilarPatterns(
    signature: ProblemSignature, 
    minSimilarity: number = SIMILARITY_THRESHOLD
  ): Promise<SolutionMatch[]> {
    const patterns = await db
      .select()
      .from(learningPatterns)
      .orderBy(desc(learningPatterns.successRate))
      .limit(50);
    
    if (patterns.length === 0) return [];
    
    const problemText = `${signature.problem} ${signature.domain} ${signature.category}`;
    const problemEmbedding = await this.generateEmbedding(problemText);
    
    const matches: SolutionMatch[] = [];
    
    for (const pattern of patterns) {
      const patternText = `${pattern.problemSignature} ${pattern.solutionTemplate}`;
      const patternEmbedding = await this.generateEmbedding(patternText);
      
      const similarity = this.cosineSimilarity(problemEmbedding, patternEmbedding);
      
      if (similarity >= minSimilarity) {
        const confidence = this.calculateConfidence(pattern, similarity);
        const applicability = this.determineApplicability(similarity, confidence);
        
        matches.push({
          patternId: pattern.id,
          patternName: pattern.patternName,
          problemSignature: pattern.problemSignature,
          solutionTemplate: pattern.solutionTemplate,
          confidence,
          successRate: pattern.successRate,
          timesApplied: pattern.timesApplied,
          discoveredBy: pattern.discoveredBy,
          codeExample: pattern.codeExample || undefined,
          whenNotToUse: pattern.whenNotToUse || undefined,
          variations: pattern.variations as Record<string, any> || undefined,
          applicability,
          reasoning: this.generateMatchReasoning(pattern, similarity, confidence)
        });
      }
    }
    
    matches.sort((a, b) => b.confidence - a.confidence);
    
    return matches;
  }
  
  /**
   * Generate OpenAI embedding for semantic search
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }
    
    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
      });
      
      const embedding = response.data[0].embedding;
      this.embeddingCache.set(text, embedding);
      
      return embedding;
    } catch (error) {
      console.error(`[${this.agentId}] ❌ Embedding error:`, error);
      return new Array(1536).fill(0);
    }
  }
  
  /**
   * Calculate cosine similarity between embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    
    if (magnitude === 0) return 0;
    
    return dotProduct / magnitude;
  }
  
  /**
   * Determine pattern applicability level
   */
  private determineApplicability(
    similarity: number, 
    confidence: number
  ): 'exact' | 'high' | 'moderate' | 'low' {
    if (similarity >= 0.95 && confidence >= HIGH_CONFIDENCE_THRESHOLD) return 'exact';
    if (similarity >= 0.85 && confidence >= 0.9) return 'high';
    if (similarity >= 0.75 && confidence >= 0.8) return 'moderate';
    return 'low';
  }
  
  /**
   * Generate reasoning for pattern match
   */
  private generateMatchReasoning(
    pattern: SelectLearningPattern,
    similarity: number,
    confidence: number
  ): string {
    const reasons: string[] = [];
    
    if (similarity >= 0.95) {
      reasons.push('Very high semantic similarity');
    } else if (similarity >= 0.85) {
      reasons.push('High semantic similarity');
    } else {
      reasons.push('Moderate semantic similarity');
    }
    
    if (pattern.timesApplied >= MIN_APPLICATIONS_FOR_PROVEN) {
      reasons.push(`Proven pattern (${pattern.timesApplied} successful applications)`);
    }
    
    if (pattern.successRate >= 0.95) {
      reasons.push(`Excellent success rate (${Math.round(pattern.successRate * 100)}%)`);
    } else if (pattern.successRate >= 0.8) {
      reasons.push(`Good success rate (${Math.round(pattern.successRate * 100)}%)`);
    }
    
    if (pattern.discoveredBy.length > 1) {
      reasons.push(`Validated by ${pattern.discoveredBy.length} agents`);
    }
    
    return reasons.join('; ');
  }
  
  /**
   * Generate reasoning for detection recommendation
   */
  private generateRecommendationReasoning(
    topMatch: SolutionMatch,
    similarPatterns: SolutionMatch[],
    recommendation: string
  ): string {
    switch (recommendation) {
      case 'apply_proven_pattern':
        return `Strong match found (${Math.round(topMatch.confidence * 100)}% confidence) with proven track record (${topMatch.timesApplied} applications, ${Math.round(topMatch.successRate * 100)}% success rate)`;
      
      case 'combine_patterns':
        return `Multiple similar patterns found (${similarPatterns.length}), consider combining solutions for best results`;
      
      case 'manual_investigation':
        return `Low confidence match (${Math.round(topMatch.confidence * 100)}%), recommend manual investigation before applying`;
      
      case 'create_new_pattern':
        return 'No similar patterns found in library, this is a new problem requiring manual solution';
      
      default:
        return 'Pattern analysis complete';
    }
  }
  
  /**
   * Generate unique pattern name
   */
  private generatePatternName(signature: ProblemSignature): string {
    const timestamp = Date.now();
    const domain = signature.domain.toLowerCase().replace(/\s+/g, '_');
    const category = signature.category.toLowerCase().replace(/\s+/g, '_');
    return `${domain}_${category}_${timestamp}`;
  }
  
  /**
   * Evaluate if pattern should evolve or be deprecated
   */
  private async evaluatePatternEvolution(
    patternId: number,
    successRate: number,
    timesApplied: number
  ): Promise<void> {
    // Deprecate if success rate drops below 60% after 5+ applications
    if (timesApplied >= 5 && successRate < 0.6) {
      console.log(`[${this.agentId}] ⚠️ Pattern #${patternId} has low success rate (${Math.round(successRate * 100)}%), consider deprecation`);
      // In production, mark pattern as deprecated or archive it
    }
    
    // Promote to "best practice" if 95%+ success after 10+ applications
    if (timesApplied >= 10 && successRate >= 0.95) {
      console.log(`[${this.agentId}] ⭐ Pattern #${patternId} promoted to best practice (${Math.round(successRate * 100)}% success rate)`);
      // In production, mark as best practice for Agent #80 to broadcast
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const patternRecognition = new PatternRecognitionEngine();
