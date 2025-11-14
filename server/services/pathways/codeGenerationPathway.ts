import { db } from "@db";
import { visualEditorAiSuggestions } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export class CodeGenerationPathway {
  /**
   * Record feedback for an AI suggestion
   */
  async recordFeedback(suggestionId: number, wasHelpful: boolean, feedbackText?: string): Promise<void> {
    try {
      await db
        .update(visualEditorAiSuggestions)
        .set({
          wasHelpful,
          feedbackText: feedbackText || null,
        })
        .where(eq(visualEditorAiSuggestions.id, suggestionId));

      console.log(`[Code Generation Pathway] Recorded feedback for suggestion ${suggestionId}: ${wasHelpful ? 'helpful' : 'not helpful'}`);
    } catch (error) {
      console.error('[Code Generation Pathway] Error recording feedback:', error);
      throw error;
    }
  }

  /**
   * Calculate success rate of AI suggestions
   */
  async calculateSuccessRate(): Promise<number> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const suggestions = await db
        .select()
        .from(visualEditorAiSuggestions)
        .where(
          and(
            gte(visualEditorAiSuggestions.createdAt, sevenDaysAgo),
            sql`${visualEditorAiSuggestions.wasHelpful} IS NOT NULL`
          )
        );

      if (suggestions.length === 0) {
        return 0;
      }

      const helpfulCount = suggestions.filter(s => s.wasHelpful === true).length;
      return (helpfulCount / suggestions.length) * 100;
    } catch (error) {
      console.error('[Code Generation Pathway] Error calculating success rate:', error);
      return 0;
    }
  }

  /**
   * Identify patterns in unhelpful suggestions
   */
  async identifyFailurePatterns(): Promise<string[]> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const unhelpfulSuggestions = await db
        .select()
        .from(visualEditorAiSuggestions)
        .where(
          and(
            eq(visualEditorAiSuggestions.wasHelpful, false),
            gte(visualEditorAiSuggestions.createdAt, sevenDaysAgo)
          )
        );

      const patterns: string[] = [];
      const typeCount: Record<string, number> = {};

      unhelpfulSuggestions.forEach(suggestion => {
        const suggestionType = suggestion.suggestionType || 'unknown';
        typeCount[suggestionType] = (typeCount[suggestionType] || 0) + 1;
      });

      // Identify common failure patterns
      Object.entries(typeCount).forEach(([type, count]) => {
        if (count > 3) { // At least 3 unhelpful suggestions of this type
          patterns.push(`"${type}" suggestions are frequently unhelpful (${count} cases)`);
        }
      });

      // Add general patterns if any
      if (unhelpfulSuggestions.length > 10) {
        patterns.push(`High volume of unhelpful suggestions: ${unhelpfulSuggestions.length} in last 7 days`);
      }

      return patterns.length > 0 ? patterns : ['No significant failure patterns detected'];
    } catch (error) {
      console.error('[Code Generation Pathway] Error identifying failure patterns:', error);
      return ['Error analyzing failure patterns'];
    }
  }

  /**
   * Get detailed feedback statistics
   */
  async getFeedbackStatistics(days: number = 7): Promise<{
    total: number;
    helpful: number;
    unhelpful: number;
    pending: number;
    successRate: number;
    byType: Record<string, { helpful: number; unhelpful: number }>;
  }> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const suggestions = await db
        .select()
        .from(visualEditorAiSuggestions)
        .where(gte(visualEditorAiSuggestions.createdAt, since));

      const stats = {
        total: suggestions.length,
        helpful: suggestions.filter(s => s.wasHelpful === true).length,
        unhelpful: suggestions.filter(s => s.wasHelpful === false).length,
        pending: suggestions.filter(s => s.wasHelpful === null).length,
        successRate: 0,
        byType: {} as Record<string, { helpful: number; unhelpful: number }>,
      };

      const ratedSuggestions = stats.helpful + stats.unhelpful;
      stats.successRate = ratedSuggestions > 0 ? (stats.helpful / ratedSuggestions) * 100 : 0;

      // Group by type
      suggestions.forEach(suggestion => {
        const type = suggestion.suggestionType || 'unknown';
        if (!stats.byType[type]) {
          stats.byType[type] = { helpful: 0, unhelpful: 0 };
        }
        if (suggestion.wasHelpful === true) {
          stats.byType[type].helpful++;
        } else if (suggestion.wasHelpful === false) {
          stats.byType[type].unhelpful++;
        }
      });

      return stats;
    } catch (error) {
      console.error('[Code Generation Pathway] Error getting feedback statistics:', error);
      return {
        total: 0,
        helpful: 0,
        unhelpful: 0,
        pending: 0,
        successRate: 0,
        byType: {},
      };
    }
  }

  /**
   * Get recent unhelpful suggestions with feedback
   */
  async getRecentUnhelpfulSuggestions(limit: number = 10): Promise<any[]> {
    try {
      const unhelpful = await db
        .select()
        .from(visualEditorAiSuggestions)
        .where(eq(visualEditorAiSuggestions.wasHelpful, false))
        .orderBy(sql`${visualEditorAiSuggestions.createdAt} DESC`)
        .limit(limit);

      return unhelpful.map(s => ({
        id: s.id,
        suggestionType: s.suggestionType,
        feedbackText: s.feedbackText,
        createdAt: s.createdAt,
      }));
    } catch (error) {
      console.error('[Code Generation Pathway] Error getting unhelpful suggestions:', error);
      return [];
    }
  }
}

export const codeGenerationPathway = new CodeGenerationPathway();
