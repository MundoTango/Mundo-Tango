import { db } from "@db";
import {
  sessionInteractions,
  sessionUxPatterns,
  insertSessionUxPatternSchema,
  type SelectSessionInteraction,
  type InsertSessionUxPattern,
  type SelectSessionUxPattern,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

interface UxPattern {
  patternType: string;
  confidence: number;
  description: string;
  timestamp: Date;
  elementPath: string;
  suggestedFix: string;
}

type EmotionState = "confusion" | "delight" | "frustration" | "flow";

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}

/**
 * Agent #166: UX Pattern Recognizer
 * 
 * Uses AI to recognize UX patterns and emotional states from user interactions
 */
export class UxPatternAgent {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not set");
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Detect UX patterns in a session
   */
  async detectPattern(sessionId: number): Promise<UxPattern[]> {
    try {
      const interactions = await db
        .select()
        .from(sessionInteractions)
        .where(eq(sessionInteractions.sessionId, sessionId))
        .orderBy(sessionInteractions.timestamp);

      if (interactions.length === 0) {
        return [];
      }

      const patterns: UxPattern[] = [];

      // Analyze with GPT-4o
      const interactionSummary = interactions
        .map((i, idx) => {
          return `${idx + 1}. ${i.interactionType} on "${i.elementText || i.elementSelector}"`;
        })
        .join("\n");

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a UX pattern recognition expert. Analyze user interactions and identify UX patterns, usability issues, and opportunities for improvement.`,
          },
          {
            role: "user",
            content: `Analyze these user interactions and identify UX patterns:

${interactionSummary}

For each pattern identified, provide:
1. Pattern type (e.g., "navigation_confusion", "successful_flow", "friction_point")
2. Confidence (0-1)
3. Description
4. Suggested fix

Respond in JSON format as an array of patterns.`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (content) {
        const result = JSON.parse(content);
        
        if (result.patterns && Array.isArray(result.patterns)) {
          for (const pattern of result.patterns) {
            patterns.push({
              patternType: pattern.pattern_type || "unknown",
              confidence: pattern.confidence || 0.5,
              description: pattern.description || "",
              timestamp: new Date(),
              elementPath: pattern.element_path || "",
              suggestedFix: pattern.suggested_fix || "",
            });
          }
        }
      }

      // Save patterns to database
      for (const pattern of patterns) {
        await this.savePattern(sessionId, pattern);
      }

      return patterns;
    } catch (error) {
      console.error("Error detecting patterns:", error);
      throw error;
    }
  }

  /**
   * Classify user's emotional state based on interactions
   */
  async classifyEmotion(
    interactions: SelectSessionInteraction[]
  ): Promise<EmotionState> {
    try {
      if (interactions.length === 0) {
        return "flow";
      }

      // Heuristic-based emotion classification
      const recentInteractions = interactions.slice(-10);
      
      // Count interaction patterns
      const rapidClicks = recentInteractions.filter(
        (i, idx, arr) => {
          if (idx === 0) return false;
          const timeDiff = new Date(i.timestamp).getTime() - 
                          new Date(arr[idx - 1].timestamp).getTime();
          return timeDiff < 500 && i.interactionType === "click";
        }
      ).length;

      const longPauses = recentInteractions.filter(
        (i, idx, arr) => {
          if (idx === 0) return false;
          const timeDiff = new Date(i.timestamp).getTime() - 
                          new Date(arr[idx - 1].timestamp).getTime();
          return timeDiff > 10000;
        }
      ).length;

      const backNavigation = recentInteractions.filter(
        (i) => i.interactionType === "navigation" && 
               i.elementText?.toLowerCase().includes("back")
      ).length;

      // Classify emotion
      if (rapidClicks >= 3) {
        return "frustration";
      } else if (longPauses >= 2) {
        return "confusion";
      } else if (backNavigation >= 2) {
        return "confusion";
      } else if (interactions.length >= 5 && rapidClicks === 0 && longPauses === 0) {
        return "flow";
      }

      return "flow";
    } catch (error) {
      console.error("Error classifying emotion:", error);
      return "flow";
    }
  }

  /**
   * Generate heatmap data from session interactions
   */
  async generateHeatmap(sessionId: number): Promise<HeatmapPoint[]> {
    try {
      const interactions = await db
        .select()
        .from(sessionInteractions)
        .where(eq(sessionInteractions.sessionId, sessionId))
        .orderBy(sessionInteractions.timestamp);

      const heatmapData: Map<string, HeatmapPoint> = new Map();

      // Process interactions to create heatmap
      for (const interaction of interactions) {
        if (
          interaction.metadata &&
          typeof interaction.metadata === "object" &&
          "coordinates" in interaction.metadata
        ) {
          const coords = interaction.metadata.coordinates as any;
          if (coords.x !== undefined && coords.y !== undefined) {
            const key = `${Math.floor(coords.x / 10)},${Math.floor(coords.y / 10)}`;
            
            const existing = heatmapData.get(key);
            if (existing) {
              existing.intensity += 1;
            } else {
              heatmapData.set(key, {
                x: Math.floor(coords.x / 10) * 10,
                y: Math.floor(coords.y / 10) * 10,
                intensity: 1,
              });
            }
          }
        }
      }

      return Array.from(heatmapData.values());
    } catch (error) {
      console.error("Error generating heatmap:", error);
      return [];
    }
  }

  /**
   * Suggest improvement for a specific pattern
   */
  async suggestImprovement(patternId: number): Promise<string> {
    try {
      const [pattern] = await db
        .select()
        .from(sessionUxPatterns)
        .where(eq(sessionUxPatterns.id, patternId));

      if (!pattern) {
        throw new Error("Pattern not found");
      }

      // Use GPT-4o to generate detailed improvement suggestions
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a UX improvement consultant. Provide actionable, specific recommendations for improving user experiences.`,
          },
          {
            role: "user",
            content: `Pattern detected: ${pattern.patternType}
Description: ${pattern.description}
Element: ${pattern.elementPath}

Provide 3-5 specific, actionable improvement recommendations for this UX pattern.`,
          },
        ],
      });

      return response.choices[0].message.content || pattern.suggestedFix || "No suggestions available";
    } catch (error) {
      console.error("Error suggesting improvement:", error);
      throw error;
    }
  }

  /**
   * Save a pattern to the database
   */
  private async savePattern(
    sessionId: number,
    pattern: UxPattern
  ): Promise<void> {
    try {
      const patternData: InsertSessionUxPattern = {
        sessionId,
        patternType: pattern.patternType,
        confidence: pattern.confidence,
        description: pattern.description,
        timestamp: pattern.timestamp,
        elementPath: pattern.elementPath,
        suggestedFix: pattern.suggestedFix,
      };

      await db.insert(sessionUxPatterns).values(patternData);
    } catch (error) {
      console.error("Error saving pattern:", error);
      throw error;
    }
  }

  /**
   * Get all patterns for a session
   */
  async getSessionPatterns(sessionId: number): Promise<SelectSessionUxPattern[]> {
    try {
      return await db
        .select()
        .from(sessionUxPatterns)
        .where(eq(sessionUxPatterns.sessionId, sessionId));
    } catch (error) {
      console.error("Error getting session patterns:", error);
      return [];
    }
  }
}
