import { db } from "@db";
import { sessionBugsFound } from "@shared/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// ERROR ANALYSIS AGENT - Agent #207
// ============================================================================

export class ErrorAnalysisAgent {
  /**
   * Categorize a bug by type (UI, API, data, logic)
   */
  async categorizeBug(bug: any): Promise<{
    type: 'UI' | 'API' | 'data' | 'logic' | 'unknown';
    confidence: number;
    reasoning: string;
  }> {
    try {
      const bugDescription = `
Title: ${bug.title}
Description: ${bug.description}
Severity: ${bug.severity}
      `.trim();

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a bug categorization expert. Analyze the bug and categorize it as one of:
- UI (user interface issues, styling, layout, rendering)
- API (backend API errors, network requests, endpoints)
- data (data validation, database issues, data format)
- logic (business logic errors, incorrect calculations, flow issues)
- unknown (cannot determine)

Respond in JSON format: {"type": "...", "confidence": 0.0-1.0, "reasoning": "..."}`,
          },
          {
            role: "user",
            content: bugDescription,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
      
      return {
        type: result.type || 'unknown',
        confidence: result.confidence || 0.5,
        reasoning: result.reasoning || 'No reasoning provided',
      };
    } catch (error) {
      console.error('[Error Analysis Agent] Error categorizing bug:', error);
      return {
        type: 'unknown',
        confidence: 0.0,
        reasoning: 'Error during categorization',
      };
    }
  }

  /**
   * Find similar bugs using semantic search with embeddings
   */
  async findSimilarBugs(bugId: number): Promise<Array<{
    bug: any;
    similarity: number;
  }>> {
    try {
      // Get the target bug
      const [targetBug] = await db
        .select()
        .from(sessionBugsFound)
        .where(eq(sessionBugsFound.id, bugId));

      if (!targetBug) {
        throw new Error(`Bug ${bugId} not found`);
      }

      // Create embedding for target bug
      const targetText = `${targetBug.title}\n${targetBug.description}`;
      const targetEmbedding = await this.createEmbedding(targetText);

      // Get all other bugs
      const allBugs = await db
        .select()
        .from(sessionBugsFound);

      // Calculate similarity scores
      const similarities = await Promise.all(
        allBugs
          .filter((b: any) => b.id !== bugId)
          .map(async (bug: any) => {
            const bugText = `${bug.title}\n${bug.description}`;
            const bugEmbedding = await this.createEmbedding(bugText);
            const similarity = this.cosineSimilarity(targetEmbedding, bugEmbedding);

            return {
              bug,
              similarity,
            };
          })
      );

      // Sort by similarity and return top 5
      return similarities
        .sort((a: any, b: any) => b.similarity - a.similarity)
        .slice(0, 5)
        .filter((s: any) => s.similarity > 0.7); // Only return highly similar bugs
    } catch (error) {
      console.error('[Error Analysis Agent] Error finding similar bugs:', error);
      return [];
    }
  }

  /**
   * Predict bug severity using AI classification
   */
  async predictSeverity(description: string): Promise<'critical' | 'major' | 'minor'> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a bug severity classifier. Analyze the bug description and classify it as:
- critical: System crashes, data loss, security issues, blocking functionality
- major: Significant feature broken, poor UX, frequent errors
- minor: Small UI issues, cosmetic problems, edge cases

Respond with ONLY one word: critical, major, or minor`,
          },
          {
            role: "user",
            content: description,
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      });

      const severity = completion.choices[0]?.message?.content?.trim().toLowerCase() || 'minor';
      
      if (severity === 'critical' || severity === 'major' || severity === 'minor') {
        return severity;
      }
      
      return 'minor'; // Default
    } catch (error) {
      console.error('[Error Analysis Agent] Error predicting severity:', error);
      return 'minor';
    }
  }

  /**
   * Analyze bug patterns across multiple bugs
   */
  async analyzeBugPatterns(bugs: any[]): Promise<{
    patterns: Array<{
      pattern: string;
      count: number;
      examples: string[];
    }>;
    recommendations: string[];
  }> {
    try {
      const bugSummaries = bugs.map(b => 
        `- ${b.title}: ${b.description.substring(0, 100)}...`
      ).join('\n');

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Analyze these bugs and identify common patterns. Return JSON with:
{
  "patterns": [{"pattern": "description", "count": number, "examples": ["bug1", "bug2"]}],
  "recommendations": ["recommendation1", "recommendation2"]
}`,
          },
          {
            role: "user",
            content: `Bugs:\n${bugSummaries}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      return JSON.parse(completion.choices[0]?.message?.content || '{"patterns": [], "recommendations": []}');
    } catch (error) {
      console.error('[Error Analysis Agent] Error analyzing patterns:', error);
      return {
        patterns: [],
        recommendations: [],
      };
    }
  }

  /**
   * Get bug statistics and trends
   */
  async getBugStatistics(): Promise<{
    total: number;
    bySeverity: { critical: number; major: number; minor: number };
    byStatus: Record<string, number>;
    avgResolutionTime: number;
  }> {
    try {
      const allBugs = await db.select().from(sessionBugsFound);

      const bySeverity = {
        critical: allBugs.filter((b: any) => b.severity === 'critical').length,
        major: allBugs.filter((b: any) => b.severity === 'major').length,
        minor: allBugs.filter((b: any) => b.severity === 'minor').length,
      };

      const byStatus: Record<string, number> = {};
      allBugs.forEach((bug: any) => {
        const status = bug.status || 'unknown';
        byStatus[status] = (byStatus[status] || 0) + 1;
      });

      // Calculate avg resolution time (for resolved bugs)
      const resolvedBugs = allBugs.filter((b: any) => 
        b.status === 'resolved' && b.createdAt && b.updatedAt
      );
      
      let avgResolutionTime = 0;
      if (resolvedBugs.length > 0) {
        const totalTime = resolvedBugs.reduce((sum: number, bug: any) => {
          const created = new Date(bug.createdAt!).getTime();
          const updated = new Date(bug.updatedAt!).getTime();
          return sum + (updated - created);
        }, 0);
        avgResolutionTime = totalTime / resolvedBugs.length / (1000 * 60 * 60); // Convert to hours
      }

      return {
        total: allBugs.length,
        bySeverity,
        byStatus,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      };
    } catch (error) {
      console.error('[Error Analysis Agent] Error getting statistics:', error);
      return {
        total: 0,
        bySeverity: { critical: 0, major: 0, minor: 0 },
        byStatus: {},
        avgResolutionTime: 0,
      };
    }
  }

  // Helper methods
  private async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.substring(0, 8000), // Limit length
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('[Error Analysis Agent] Error creating embedding:', error);
      // Return zero vector as fallback
      return new Array(1536).fill(0);
    }
  }

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
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
}

export const errorAnalysisAgent = new ErrorAnalysisAgent();
