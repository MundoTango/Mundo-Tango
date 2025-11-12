/**
 * Agent #80: Learning Coordinator Service
 * ESA Collaborative Intelligence System
 * 
 * Builds collective intelligence network - all agents learn from all agents
 * Features:
 * - Captures learnings from all 105 ESA agents
 * - Distributes knowledge UP to Agent #0 (CEO)
 * - Distributes knowledge ACROSS to peer agents
 * - Distributes knowledge DOWN to all agents
 * - Synthesizes patterns from multiple learnings
 * - Semantic search with OpenAI embeddings
 * - Tracks solution reuse & success rates
 * - Prevents duplicate problem-solving
 * - Compounds intelligence over time
 */

import OpenAI from 'openai';
import { db } from "../../../shared/db";
import { learningPatterns, type InsertLearningPattern, type SelectLearningPattern } from "../../../shared/schema";
import { eq, desc, sql, and, gte, inArray } from "drizzle-orm";
import { logInfo, logError, logDebug } from "../../../server/middleware/logger";

// OpenAI client with Bifrost gateway support
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Learning {
  agentId: string;
  category: 'bug_fix' | 'optimization' | 'feature' | 'refactor' | 'pattern' | 'architecture';
  domain: string; // e.g., 'mobile', 'desktop', 'performance', 'ui', 'backend', 'database'
  problem: string;
  solution: string;
  outcome: {
    success: boolean;
    impact: 'low' | 'medium' | 'high';
    timeSaved?: string;
    metricsImproved?: Record<string, number>;
  };
  confidence?: number; // 0-1, how confident the agent is in this solution
  context?: {
    page?: string;
    component?: string;
    stackTrace?: string;
    relatedAgents?: string[];
  };
  codeExample?: string;
  whenNotToUse?: string;
  tags?: string[];
}

interface PatternVariation {
  problem: string;
  solution: string;
  outcome: Learning['outcome'];
  context?: Learning['context'];
  timestamp: string;
}

export interface KnowledgeSearchResult {
  pattern: SelectLearningPattern;
  relevanceScore: number;
  embedding?: number[];
}

export interface PatternSynthesis {
  synthesizedPatternName: string;
  sourcePatterns: string[];
  combinedSignature: string;
  combinedSolution: string;
  confidence: number;
  applicability: string;
}

export interface DistributionReport {
  direction: 'UP' | 'ACROSS' | 'DOWN';
  recipients: string[];
  messageType: 'strategic_insight' | 'tactical_solution' | 'best_practice';
  content: string;
  timestamp: Date;
}

// ============================================================================
// LEARNING COORDINATOR SERVICE
// ============================================================================

export class LearningCoordinatorService {
  private agentId = "Agent #80";
  private embeddingModel = "text-embedding-3-small";
  private embeddingCache = new Map<string, number[]>();

  /**
   * Core Method 1: Capture Learning from an Agent
   * Stores agent experiences in the pattern library
   */
  async captureLearning(learning: Learning): Promise<void> {
    logInfo(`[${this.agentId}] Capturing learning from ${learning.agentId}`, { 
      agentId: learning.agentId,
      category: learning.category,
      domain: learning.domain
    });
    
    try {
      // Generate pattern name (unique, descriptive)
      const patternName = this.generatePatternName(learning);
      
      // Check if similar pattern exists
      const existingPatterns = await this.findSimilarPatterns(learning.problem, 0.85);
      
      if (existingPatterns.length > 0) {
        // Update existing pattern with new variation
        logDebug(`[${this.agentId}] Similar pattern exists, updating with variation`, { 
          patternName: existingPatterns[0].pattern.patternName 
        });
        await this.addPatternVariation(existingPatterns[0].pattern, learning);
      } else {
        // Create new pattern
        const embedding = await this.generateEmbedding(
          `${learning.problem} ${learning.solution} ${learning.domain}`
        );
        
        await db.insert(learningPatterns).values({
          patternName,
          problemSignature: learning.problem,
          solutionTemplate: learning.solution,
          discoveredBy: [learning.agentId],
          timesApplied: 0,
          successRate: learning.confidence || 0.9,
          variations: {
            [learning.agentId]: {
              problem: learning.problem,
              solution: learning.solution,
              outcome: learning.outcome,
              context: learning.context,
              timestamp: new Date().toISOString()
            }
          },
          whenNotToUse: learning.whenNotToUse || null,
          codeExample: learning.codeExample || null,
        });
        
        logInfo(`[${this.agentId}] New pattern created`, { patternName });
      }
      
      // Distribute knowledge based on impact
      await this.distributeKnowledge(learning);
      
      // Check if patterns can be synthesized
      await this.checkForPatternSynthesis(learning.domain, learning.category);
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Capture learning', learningAgentId: learning.agentId });
      throw error;
    }
  }

  /**
   * Core Method 2: Distribute Knowledge UP (to CEO Agent #0)
   * Escalate strategic insights to leadership
   */
  async distributeUP(learning: Learning): Promise<DistributionReport> {
    logDebug(`[${this.agentId}] Distributing UP to Agent #0 (CEO)`, { category: learning.category, impact: learning.outcome.impact });
    
    try {
      // Analyze if this learning has strategic value
      const strategicValue = this.assessStrategicValue(learning);
      
      if (strategicValue.isStrategic) {
        const insight = {
          from: learning.agentId,
          to: 'Agent #0',
          type: 'strategic_insight' as const,
          priority: strategicValue.priority,
          summary: strategicValue.summary,
          recommendation: strategicValue.recommendation,
          impact: learning.outcome.impact,
          timestamp: new Date()
        };
        
        // Log distribution (in real system, this would trigger notification)
        logInfo(`[${this.agentId}] Strategic insight sent to CEO`, { 
          priority: strategicValue.priority, 
          summary: insight.summary 
        });
        
        return {
          direction: 'UP',
          recipients: ['Agent #0'],
          messageType: 'strategic_insight',
          content: JSON.stringify(insight),
          timestamp: new Date()
        };
      }
      
      logDebug(`[${this.agentId}] Learning not strategic enough for CEO escalation`);
      return {
        direction: 'UP',
        recipients: [],
        messageType: 'strategic_insight',
        content: '',
        timestamp: new Date()
      };
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Distribute UP' });
      throw error;
    }
  }

  /**
   * Core Method 3: Distribute Knowledge ACROSS (to peer agents)
   * Share tactical solutions with peers in same domain
   */
  async distributeACROSS(learning: Learning): Promise<DistributionReport> {
    logDebug(`[${this.agentId}] Distributing ACROSS to peer agents`, { domain: learning.domain });
    
    try {
      // Find peer agents in same domain
      const peerAgents = this.identifyPeerAgents(learning.agentId, learning.domain);
      
      if (peerAgents.length > 0) {
        const tacticalSolution = {
          from: learning.agentId,
          to: peerAgents,
          type: 'tactical_solution' as const,
          domain: learning.domain,
          category: learning.category,
          problem: learning.problem,
          solution: learning.solution,
          confidence: learning.confidence,
          codeExample: learning.codeExample,
          impact: learning.outcome.impact,
          timestamp: new Date()
        };
        
        logInfo(`[${this.agentId}] Tactical solution shared with peers`, { 
          peerCount: peerAgents.length, 
          peers: peerAgents.join(', ') 
        });
        
        return {
          direction: 'ACROSS',
          recipients: peerAgents,
          messageType: 'tactical_solution',
          content: JSON.stringify(tacticalSolution),
          timestamp: new Date()
        };
      }
      
      logDebug(`[${this.agentId}] No peer agents found for distribution`);
      return {
        direction: 'ACROSS',
        recipients: [],
        messageType: 'tactical_solution',
        content: '',
        timestamp: new Date()
      };
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Distribute ACROSS' });
      throw error;
    }
  }

  /**
   * Core Method 4: Distribute Knowledge DOWN (to all agents)
   * Broadcast best practices to entire agent network
   */
  async distributeDOWN(patternName: string): Promise<DistributionReport> {
    logDebug(`[${this.agentId}] Broadcasting best practice to all agents`, { patternName });
    
    try {
      const pattern = await db
        .select()
        .from(learningPatterns)
        .where(eq(learningPatterns.patternName, patternName))
        .limit(1);
      
      if (pattern.length === 0) {
        throw new Error(`Pattern not found: ${patternName}`);
      }
      
      const patternData = pattern[0];
      
      // Only broadcast if pattern has proven success
      if (patternData.timesApplied >= 3 && patternData.successRate >= 0.9) {
        const allAgents = this.getAllAgentIds();
        
        const bestPractice = {
          type: 'best_practice' as const,
          patternName: patternData.patternName,
          problem: patternData.problemSignature,
          solution: patternData.solutionTemplate,
          successRate: patternData.successRate,
          timesApplied: patternData.timesApplied,
          codeExample: patternData.codeExample,
          whenNotToUse: patternData.whenNotToUse,
          timestamp: new Date()
        };
        
        logInfo(`[${this.agentId}] Best practice broadcast to all agents`, { 
          patternName, 
          recipientCount: allAgents.length,
          successRate: patternData.successRate
        });
        
        return {
          direction: 'DOWN',
          recipients: allAgents,
          messageType: 'best_practice',
          content: JSON.stringify(bestPractice),
          timestamp: new Date()
        };
      }
      
      logDebug(`[${this.agentId}] Pattern not ready for broadcast`, { 
        patternName, 
        timesApplied: patternData.timesApplied,
        successRate: patternData.successRate 
      });
      return {
        direction: 'DOWN',
        recipients: [],
        messageType: 'best_practice',
        content: '',
        timestamp: new Date()
      };
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Distribute DOWN', patternName });
      throw error;
    }
  }

  /**
   * Core Method 5: Synthesize Patterns
   * Combine multiple learnings into higher-level patterns
   */
  async synthesizePatterns(domain: string, category: string): Promise<PatternSynthesis | null> {
    logDebug(`[${this.agentId}] Synthesizing patterns`, { domain, category });
    
    try {
      // Find patterns in same domain/category
      const patterns = await db
        .select()
        .from(learningPatterns)
        .where(
          and(
            sql`LOWER(${learningPatterns.problemSignature}) LIKE ${`%${domain.toLowerCase()}%`}`,
            gte(learningPatterns.timesApplied, 2)
          )
        )
        .limit(10);
      
      if (patterns.length < 2) {
        logDebug(`[${this.agentId}] Not enough patterns to synthesize`, { patternCount: patterns.length });
        return null;
      }
      
      // Use OpenAI to identify common patterns
      const synthesis = await this.aiPatternSynthesis(patterns);
      
      if (synthesis) {
        // Create synthesized pattern
        const synthesizedPatternName = `${domain}_${category}_synthesized_${Date.now()}`;
        
        await db.insert(learningPatterns).values({
          patternName: synthesizedPatternName,
          problemSignature: synthesis.combinedSignature,
          solutionTemplate: synthesis.combinedSolution,
          discoveredBy: patterns.flatMap(p => p.discoveredBy),
          timesApplied: 0,
          successRate: synthesis.confidence,
          variations: {
            synthesized: true,
            sourcePatterns: synthesis.sourcePatterns,
            generatedAt: new Date().toISOString()
          },
          whenNotToUse: null,
          codeExample: null,
        });
        
        logInfo(`[${this.agentId}] Synthesized new pattern`, { 
          synthesizedPatternName, 
          sourcePatternCount: patterns.length,
          confidence: synthesis.confidence 
        });
        
        return synthesis;
      }
      
      return null;
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Synthesize patterns', domain, category });
      return null;
    }
  }

  /**
   * Core Method 6: Search Knowledge (with semantic embeddings)
   * Semantic search through pattern library
   */
  async searchKnowledge(query: string, limit: number = 5): Promise<KnowledgeSearchResult[]> {
    logDebug(`[${this.agentId}] Searching knowledge`, { query, limit });
    
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Get all patterns
      const patterns = await db
        .select()
        .from(learningPatterns)
        .orderBy(desc(learningPatterns.successRate))
        .limit(50);
      
      // Calculate semantic similarity
      const results: KnowledgeSearchResult[] = [];
      
      for (const pattern of patterns) {
        const patternText = `${pattern.problemSignature} ${pattern.solutionTemplate}`;
        const patternEmbedding = await this.generateEmbedding(patternText);
        
        const similarity = this.cosineSimilarity(queryEmbedding, patternEmbedding);
        
        if (similarity > 0.7) {
          results.push({
            pattern,
            relevanceScore: similarity,
            embedding: patternEmbedding
          });
        }
      }
      
      // Sort by relevance
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      logInfo(`[${this.agentId}] Found relevant patterns`, { resultCount: results.length });
      
      return results.slice(0, limit);
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Search knowledge', query });
      
      // Fallback to text search
      logDebug(`[${this.agentId}] Falling back to text search`);
      return await this.fallbackTextSearch(query, limit);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Generate OpenAI embedding for semantic search
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Check cache
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }
    
    try {
      const response = await openai.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });
      
      const embedding = response.data[0].embedding;
      
      // Cache for reuse
      this.embeddingCache.set(text, embedding);
      
      return embedding;
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Generate embedding' });
      // Return zero vector on error
      return new Array(1536).fill(0);
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
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
   * Generate unique pattern name
   */
  private generatePatternName(learning: Learning): string {
    const timestamp = Date.now();
    const domain = learning.domain.toLowerCase().replace(/\s+/g, '_');
    const category = learning.category.toLowerCase().replace(/\s+/g, '_');
    return `${domain}_${category}_${timestamp}`;
  }

  /**
   * Find similar patterns using semantic search
   */
  private async findSimilarPatterns(problem: string, threshold: number = 0.8): Promise<KnowledgeSearchResult[]> {
    const results = await this.searchKnowledge(problem, 3);
    return results.filter(r => r.relevanceScore >= threshold);
  }

  /**
   * Add variation to existing pattern
   */
  private async addPatternVariation(pattern: SelectLearningPattern, learning: Learning): Promise<void> {
    const variations = (pattern.variations as Record<string, PatternVariation>) || {};
    variations[learning.agentId] = {
      problem: learning.problem,
      solution: learning.solution,
      outcome: learning.outcome,
      context: learning.context,
      timestamp: new Date().toISOString()
    };
    
    // Update discovered_by array
    const discoveredBy = pattern.discoveredBy || [];
    if (!discoveredBy.includes(learning.agentId)) {
      discoveredBy.push(learning.agentId);
    }
    
    // Recalculate success rate
    const newSuccessRate = this.calculateAverageSuccessRate(variations);
    
    await db
      .update(learningPatterns)
      .set({
        variations,
        discoveredBy,
        successRate: newSuccessRate,
        updatedAt: new Date()
      })
      .where(eq(learningPatterns.id, pattern.id));
  }

  /**
   * Calculate average success rate from variations
   */
  private calculateAverageSuccessRate(variations: Record<string, PatternVariation>): number {
    const rates = Object.values(variations)
      .filter((v): v is PatternVariation => typeof v === 'object' && !!v.outcome)
      .map((v) => v.outcome.success ? 1 : 0);
    
    if (rates.length === 0) return 0.9;
    
    return rates.reduce((sum, r) => sum + r, 0) / rates.length;
  }

  /**
   * Distribute knowledge based on learning impact
   */
  private async distributeKnowledge(learning: Learning): Promise<void> {
    // Distribute UP if high impact
    if (learning.outcome.impact === 'high') {
      await this.distributeUP(learning);
    }
    
    // Always distribute ACROSS to peers
    await this.distributeACROSS(learning);
  }

  /**
   * Check if patterns can be synthesized
   */
  private async checkForPatternSynthesis(domain: string, category: string): Promise<void> {
    // Count patterns in this domain/category
    const patterns = await db
      .select()
      .from(learningPatterns)
      .where(sql`LOWER(${learningPatterns.problemSignature}) LIKE ${`%${domain.toLowerCase()}%`}`)
      .limit(10);
    
    // Synthesize if we have 3+ patterns
    if (patterns.length >= 3) {
      await this.synthesizePatterns(domain, category);
    }
  }

  /**
   * Assess strategic value of learning
   */
  private assessStrategicValue(learning: Learning): {
    isStrategic: boolean;
    priority: 'low' | 'medium' | 'high';
    summary: string;
    recommendation: string;
  } {
    const isStrategic = 
      learning.outcome.impact === 'high' ||
      learning.category === 'architecture' ||
      (learning.outcome.timeSaved && parseFloat(learning.outcome.timeSaved) > 2);
    
    if (!isStrategic) {
      return {
        isStrategic: false,
        priority: 'low',
        summary: '',
        recommendation: ''
      };
    }
    
    return {
      isStrategic: true,
      priority: learning.outcome.impact === 'high' ? 'high' : 'medium',
      summary: `${learning.agentId} discovered ${learning.category} pattern in ${learning.domain}: ${learning.problem.slice(0, 100)}`,
      recommendation: `Consider adopting this pattern platform-wide. Success rate: ${(learning.confidence || 0.9) * 100}%`
    };
  }

  /**
   * Identify peer agents in same domain
   */
  private identifyPeerAgents(agentId: string, domain: string): string[] {
    // Agent groupings by domain
    const agentDomains: Record<string, string[]> = {
      'mobile': ['Agent #73', 'Agent #74', 'Agent #78'],
      'frontend': ['Agent #73', 'Agent #74', 'Agent #75', 'Agent #76', 'Agent #77', 'Agent #78'],
      'backend': ['Agent #72', 'Agent #79', 'Agent #80'],
      'ui': ['Agent #73', 'Agent #74', 'Agent #78'],
      'performance': ['Agent #73', 'Agent #74', 'Agent #75', 'Agent #78'],
      'subscription': ['Agent #75'],
      'visual-editor': ['Agent #78'],
      'admin': ['Agent #76'],
    };
    
    const peers = agentDomains[domain.toLowerCase()] || [];
    
    // Remove self from peers
    return peers.filter(p => p !== agentId);
  }

  /**
   * Get all agent IDs (Agent #0 through #104)
   */
  private getAllAgentIds(): string[] {
    const agents = ['Agent #0']; // CEO
    
    // Add all 104 functional agents
    for (let i = 1; i <= 104; i++) {
      agents.push(`Agent #${i}`);
    }
    
    return agents;
  }

  /**
   * AI-powered pattern synthesis
   */
  private async aiPatternSynthesis(patterns: SelectLearningPattern[]): Promise<PatternSynthesis | null> {
    try {
      const patternDescriptions = patterns.map(p => 
        `Problem: ${p.problemSignature}\nSolution: ${p.solutionTemplate}`
      ).join('\n\n---\n\n');
      
      const prompt = `Analyze these ${patterns.length} related patterns and synthesize them into a single higher-level pattern:

${patternDescriptions}

Provide:
1. A combined problem signature that covers all patterns
2. A combined solution that generalizes across all patterns
3. Confidence score (0-1)
4. When this pattern is applicable

Respond in JSON format:
{
  "combinedSignature": "...",
  "combinedSolution": "...",
  "confidence": 0.95,
  "applicability": "..."
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert at pattern recognition and synthesis.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });
      
      const response = completion.choices[0]?.message?.content;
      
      if (!response) return null;
      
      const synthesis = JSON.parse(response);
      
      return {
        synthesizedPatternName: `synthesized_${Date.now()}`,
        sourcePatterns: patterns.map(p => p.patternName),
        combinedSignature: synthesis.combinedSignature,
        combinedSolution: synthesis.combinedSolution,
        confidence: synthesis.confidence || 0.8,
        applicability: synthesis.applicability || 'General use'
      };
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'AI pattern synthesis' });
      return null;
    }
  }

  /**
   * Fallback text search (when embeddings fail)
   */
  private async fallbackTextSearch(query: string, limit: number): Promise<KnowledgeSearchResult[]> {
    const patterns = await db
      .select()
      .from(learningPatterns)
      .where(sql`LOWER(${learningPatterns.problemSignature}) LIKE ${`%${query.toLowerCase()}%`}`)
      .orderBy(desc(learningPatterns.successRate))
      .limit(limit);
    
    return patterns.map(pattern => ({
      pattern,
      relevanceScore: 0.7, // Default score for text match
    }));
  }

  /**
   * Track solution reuse
   */
  async trackSolutionReuse(patternName: string, success: boolean): Promise<void> {
    try {
      const pattern = await db
        .select()
        .from(learningPatterns)
        .where(eq(learningPatterns.patternName, patternName))
        .limit(1);
      
      if (pattern.length === 0) return;
      
      const currentPattern = pattern[0];
      const newTimesApplied = currentPattern.timesApplied + 1;
      
      // Recalculate success rate
      const currentSuccesses = Math.round(currentPattern.successRate * currentPattern.timesApplied);
      const newSuccesses = currentSuccesses + (success ? 1 : 0);
      const newSuccessRate = newSuccesses / newTimesApplied;
      
      await db
        .update(learningPatterns)
        .set({
          timesApplied: newTimesApplied,
          successRate: newSuccessRate,
          updatedAt: new Date()
        })
        .where(eq(learningPatterns.patternName, patternName));
      
      logInfo(`[${this.agentId}] Solution reuse tracked`, { 
        patternName, 
        timesApplied: newTimesApplied, 
        successRate: newSuccessRate 
      });
      
      // Broadcast if pattern becomes proven
      if (newTimesApplied === 3 && newSuccessRate >= 0.9) {
        await this.distributeDOWN(patternName);
      }
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Track solution reuse', patternName });
    }
  }

  /**
   * Get metrics for compound intelligence
   */
  async getIntelligenceMetrics(): Promise<{
    totalPatterns: number;
    averageSuccessRate: number;
    totalApplications: number;
    topPatterns: SelectLearningPattern[];
    knowledgeGrowthRate: number;
  }> {
    try {
      const patterns = await db
        .select()
        .from(learningPatterns)
        .orderBy(desc(learningPatterns.timesApplied));
      
      const totalPatterns = patterns.length;
      const averageSuccessRate = patterns.reduce((sum, p) => sum + p.successRate, 0) / totalPatterns || 0;
      const totalApplications = patterns.reduce((sum, p) => sum + p.timesApplied, 0);
      const topPatterns = patterns.slice(0, 10);
      
      // Calculate growth rate (patterns created in last 7 days vs previous 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      const recentPatterns = patterns.filter(p => new Date(p.createdAt) >= sevenDaysAgo).length;
      const previousPatterns = patterns.filter(p => 
        new Date(p.createdAt) >= fourteenDaysAgo && new Date(p.createdAt) < sevenDaysAgo
      ).length;
      
      const knowledgeGrowthRate = previousPatterns > 0 
        ? ((recentPatterns - previousPatterns) / previousPatterns) * 100 
        : recentPatterns * 100;
      
      logDebug(`[${this.agentId}] Intelligence metrics calculated`, {
        totalPatterns,
        averageSuccessRate,
        totalApplications,
        knowledgeGrowthRate
      });
      
      return {
        totalPatterns,
        averageSuccessRate,
        totalApplications,
        topPatterns,
        knowledgeGrowthRate
      };
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Get intelligence metrics' });
      return {
        totalPatterns: 0,
        averageSuccessRate: 0,
        totalApplications: 0,
        topPatterns: [],
        knowledgeGrowthRate: 0
      };
    }
  }
}

// Export singleton instance
export const learningCoordinator = new LearningCoordinatorService();
