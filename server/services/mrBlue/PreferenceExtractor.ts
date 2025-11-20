/**
 * MR BLUE PREFERENCE EXTRACTOR - PHASE 3
 * Extracts user preferences from conversations
 * 
 * Week 1, Day 1 Implementation - MB.MD v7.1
 * 
 * Features:
 * - Pattern-based preference extraction (regex + semantic)
 * - Confidence scoring (0-1 scale)
 * - Automatic preference storage
 * - Category classification
 * - De-duplication (updates existing preferences)
 */

import { storage } from '../../storage';

export interface PreferencePattern {
  regex: RegExp;
  category: string;
  confidenceMultiplier: number; // 0-1, multiplies base confidence
  extractValue: (match: RegExpMatchArray) => string;
}

export interface ExtractedPreference {
  userId: number;
  preferenceKey: string;
  preferenceValue: string;
  category: string;
  confidence: number;
  extractedFrom: string;
  metadata?: Record<string, any>;
}

export class PreferenceExtractor {
  /**
   * Preference extraction patterns
   * Ordered by confidence (most explicit first)
   */
  private patterns: PreferencePattern[] = [
    // EXPLICIT PREFERENCES (high confidence: 0.9-1.0)
    {
      regex: /I (?:always|only) (?:use|prefer|like|want) ([\w\s-]+?)(?:\s+(?:for|when|in|over|instead)|\.|,|$)/i,
      category: 'explicit_preference',
      confidenceMultiplier: 1.0,
      extractValue: (match) => match[1].trim(),
    },
    {
      regex: /I prefer ([\w\s-]+) over ([\w\s-]+)/i,
      category: 'comparative_preference',
      confidenceMultiplier: 0.95,
      extractValue: (match) => `${match[1].trim()} (over ${match[2].trim()})`,
    },
    {
      regex: /Always use ([\w\s-]+?)(?:\s+(?:for|when|in)|\.|,|$)/i,
      category: 'coding_style',
      confidenceMultiplier: 0.95,
      extractValue: (match) => match[1].trim(),
    },
    {
      regex: /Never use ([\w\s-]+?)(?:\s+(?:for|when|in)|\.|,|$)/i,
      category: 'coding_avoid',
      confidenceMultiplier: 0.95,
      extractValue: (match) => `avoid_${match[1].trim()}`,
    },
    
    // STRONG PREFERENCES (medium-high confidence: 0.7-0.9)
    {
      regex: /I (?:really |definitely )?like ([\w\s-]+?)(?:\s+style|\s+approach|\.|,|$)/i,
      category: 'style_preference',
      confidenceMultiplier: 0.85,
      extractValue: (match) => match[1].trim(),
    },
    {
      regex: /Make (?:it|this|everything) ([\w\s-]+?)(?:\s+style|\.|,|$)/i,
      category: 'design_directive',
      confidenceMultiplier: 0.8,
      extractValue: (match) => match[1].trim(),
    },
    {
      regex: /Use ([\w\s-]+) for (?:all |the )?([\w\s-]+)/i,
      category: 'tool_preference',
      confidenceMultiplier: 0.85,
      extractValue: (match) => `${match[1].trim()} for ${match[2].trim()}`,
    },
    
    // IMPLICIT PREFERENCES (medium confidence: 0.5-0.7)
    {
      regex: /I (?:think|feel) ([\w\s-]+) (?:is|are) (?:better|cleaner|easier|simpler)/i,
      category: 'opinion',
      confidenceMultiplier: 0.6,
      extractValue: (match) => match[1].trim(),
    },
    {
      regex: /(?:Can you |Please )(?:use|make it) ([\w\s-]+)/i,
      category: 'request',
      confidenceMultiplier: 0.65,
      extractValue: (match) => match[1].trim(),
    },
    
    // TECHNOLOGY PREFERENCES (auto-categorized by keywords)
    {
      regex: /(?:TypeScript|JavaScript|Python|React|Vue|Angular|Tailwind|Bootstrap|CSS)/i,
      category: 'tech_stack',
      confidenceMultiplier: 0.7,
      extractValue: (match) => match[0],
    },
  ];

  /**
   * Extract preferences from a message
   */
  async extractFromMessage(
    userId: number,
    message: string,
    conversationId?: number
  ): Promise<ExtractedPreference[]> {
    const extracted: ExtractedPreference[] = [];
    
    console.log(`[PreferenceExtractor] Scanning message for user ${userId}...`);

    for (const pattern of this.patterns) {
      const matches = message.match(pattern.regex);
      
      if (matches) {
        const value = pattern.extractValue(matches);
        
        // Skip if value is too short or generic
        if (value.length < 2 || ['it', 'this', 'that'].includes(value.toLowerCase())) {
          continue;
        }

        // Generate preference key (lowercase, underscored)
        const key = `${pattern.category}:${value.toLowerCase().replace(/\s+/g, '_')}`;
        
        const preference: ExtractedPreference = {
          userId,
          preferenceKey: key,
          preferenceValue: value,
          category: pattern.category,
          confidence: pattern.confidenceMultiplier * 0.8, // Base confidence 0.8
          extractedFrom: message.substring(0, 200), // First 200 chars
          metadata: {
            conversationId,
            extractedAt: new Date().toISOString(),
            pattern: pattern.regex.source,
          },
        };

        extracted.push(preference);
        console.log(`[PreferenceExtractor] ✅ Found preference: ${key} = ${value} (confidence: ${preference.confidence.toFixed(2)})`);
      }
    }

    return extracted;
  }

  /**
   * Extract and save preferences from a message
   */
  async extractAndSave(
    userId: number,
    message: string,
    conversationId?: number
  ): Promise<number> {
    const preferences = await this.extractFromMessage(userId, message, conversationId);
    
    let savedCount = 0;
    for (const pref of preferences) {
      try {
        await storage.saveUserPreference(pref);
        savedCount++;
      } catch (error: any) {
        console.error(`[PreferenceExtractor] Failed to save preference:`, error.message);
      }
    }

    if (savedCount > 0) {
      console.log(`[PreferenceExtractor] 💾 Saved ${savedCount} preferences for user ${userId}`);
    }

    return savedCount;
  }

  /**
   * Build preference context string for code generation
   * Returns a formatted string of user preferences to inject into prompts
   */
  async buildPreferenceContext(userId: number): Promise<string> {
    const preferences = await storage.getUserPreferences(userId);
    
    if (preferences.length === 0) {
      return '';
    }

    // Group by category
    const grouped: Record<string, any[]> = {};
    for (const pref of preferences) {
      const category = this.getCategoryFromKey(pref.preferenceKey);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(pref);
    }

    // Build context string
    let context = '\n\n## USER PREFERENCES (apply these automatically):\n';
    
    for (const [category, prefs] of Object.entries(grouped)) {
      context += `\n### ${this.formatCategory(category)}:\n`;
      
      // Sort by confidence (highest first)
      prefs.sort((a, b) => b.confidence - a.confidence);
      
      for (const pref of prefs.slice(0, 5)) { // Top 5 per category
        context += `- ${pref.preferenceValue} (confidence: ${(pref.confidence * 100).toFixed(0)}%)\n`;
      }
    }

    return context;
  }

  /**
   * Extract category from preference key (e.g., 'coding_style:typescript' -> 'coding_style')
   */
  private getCategoryFromKey(key: string): string {
    const parts = key.split(':');
    return parts[0] || 'general';
  }

  /**
   * Format category for display
   */
  private formatCategory(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get specific preference by key
   */
  async getPreference(userId: number, key: string): Promise<string | null> {
    const pref = await storage.getUserPreferenceByKey(userId, key);
    return pref ? pref.preferenceValue : null;
  }

  /**
   * Check if user has a specific preference
   */
  async hasPreference(userId: number, category: string, value: string): Promise<boolean> {
    const key = `${category}:${value.toLowerCase().replace(/\s+/g, '_')}`;
    const pref = await storage.getUserPreferenceByKey(userId, key);
    return !!pref;
  }
}

export const preferenceExtractor = new PreferenceExtractor();
