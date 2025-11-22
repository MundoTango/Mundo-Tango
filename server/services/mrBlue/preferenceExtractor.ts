/**
 * PREFERENCE EXTRACTOR - AGENT #42
 * Automatically extract and store user preferences from conversations
 * 
 * Features:
 * - Pattern-based preference detection (16 regex patterns)
 * - Confidence scoring (0-1 scale)
 * - Category classification (coding_style, tech_stack, design, etc.)
 * - De-duplication via unique keys
 * - Context injection for code generation
 */

import { db } from '@db';
import { mrBlueUserPreferences } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// ==================== TYPES ====================

export interface DetectedPreference {
  userId: number;
  category: PreferenceCategory;
  key: string; // Unique identifier for de-duplication
  value: string;
  confidence: number; // 0-1
  extractedFrom: string; // Original message
  timestamp: Date;
}

export type PreferenceCategory =
  | 'coding_style'
  | 'tech_stack'
  | 'design_preference'
  | 'naming_convention'
  | 'architecture'
  | 'testing'
  | 'documentation'
  | 'accessibility'
  | 'performance'
  | 'security'
  | 'deployment'
  | 'collaboration'
  | 'other';

// ==================== PREFERENCE PATTERNS ====================

interface PreferencePattern {
  category: PreferenceCategory;
  pattern: RegExp;
  keyExtractor: (match: RegExpMatchArray) => string;
  valueExtractor: (match: RegExpMatchArray) => string;
  confidence: number;
}

const PREFERENCE_PATTERNS: PreferencePattern[] = [
  // Coding Style
  {
    category: 'coding_style',
    pattern: /I (prefer|like|love|always use) (tabs|spaces|semicolons|arrow functions|async\/await)/gi,
    keyExtractor: (m) => `coding_style_${m[2].toLowerCase().replace(/\s+/g, '_')}`,
    valueExtractor: (m) => m[2],
    confidence: 0.9,
  },
  {
    category: 'coding_style',
    pattern: /don't (use|like|want) (var|let|const|semicolons|callbacks)/gi,
    keyExtractor: (m) => `avoid_${m[2].toLowerCase().replace(/\s+/g, '_')}`,
    valueExtractor: (m) => `avoid ${m[2]}`,
    confidence: 0.85,
  },

  // Tech Stack
  {
    category: 'tech_stack',
    pattern: /I (use|prefer|work with) (React|Vue|Angular|Next\.js|TypeScript|JavaScript|Python|Node\.js)/gi,
    keyExtractor: (m) => `tech_${m[2].toLowerCase().replace(/\./g, '_')}`,
    valueExtractor: (m) => m[2],
    confidence: 0.95,
  },
  {
    category: 'tech_stack',
    pattern: /my (stack|setup) (is|includes) ([^.]+)/gi,
    keyExtractor: () => 'tech_stack',
    valueExtractor: (m) => m[3].trim(),
    confidence: 0.8,
  },

  // Design Preferences
  {
    category: 'design_preference',
    pattern: /I (like|prefer|want) (dark mode|light mode|minimalist|modern|colorful) (designs?|themes?|UI)/gi,
    keyExtractor: (m) => `design_${m[2].toLowerCase().replace(/\s+/g, '_')}`,
    valueExtractor: (m) => m[2],
    confidence: 0.85,
  },
  {
    category: 'design_preference',
    pattern: /use (Tailwind|Bootstrap|Material UI|shadcn|CSS modules)/gi,
    keyExtractor: (m) => `design_framework_${m[1].toLowerCase().replace(/\s+/g, '_')}`,
    valueExtractor: (m) => m[1],
    confidence: 0.9,
  },

  // Naming Conventions
  {
    category: 'naming_convention',
    pattern: /I (name|call) (components|files|functions|variables) (in )?(camelCase|PascalCase|snake_case|kebab-case)/gi,
    keyExtractor: (m) => `naming_${m[2].toLowerCase()}_${m[4].toLowerCase()}`,
    valueExtractor: (m) => m[4],
    confidence: 0.9,
  },

  // Architecture
  {
    category: 'architecture',
    pattern: /I (organize|structure|arrange) (code|files|components) (using|with|in) ([^.]+)/gi,
    keyExtractor: () => 'code_organization',
    valueExtractor: (m) => m[4].trim(),
    confidence: 0.75,
  },
  {
    category: 'architecture',
    pattern: /(monorepo|microservices|serverless|MVC|MVVM|clean architecture)/gi,
    keyExtractor: (m) => `architecture_${m[1].toLowerCase().replace(/\s+/g, '_')}`,
    valueExtractor: (m) => m[1],
    confidence: 0.8,
  },

  // Testing
  {
    category: 'testing',
    pattern: /I (use|prefer|test with) (Jest|Vitest|Mocha|Playwright|Cypress)/gi,
    keyExtractor: (m) => `testing_framework_${m[2].toLowerCase()}`,
    valueExtractor: (m) => m[2],
    confidence: 0.9,
  },

  // Documentation
  {
    category: 'documentation',
    pattern: /I (like|prefer|use) (JSDoc|TypeDoc|comments|inline docs)/gi,
    keyExtractor: (m) => `documentation_style_${m[2].toLowerCase().replace(/\s+/g, '_')}`,
    valueExtractor: (m) => m[2],
    confidence: 0.85,
  },

  // Accessibility
  {
    category: 'accessibility',
    pattern: /(WCAG|accessibility|a11y|screen readers?) (is|are) (important|priority)/gi,
    keyExtractor: () => 'accessibility_priority',
    valueExtractor: () => 'high priority',
    confidence: 0.9,
  },

  // Performance
  {
    category: 'performance',
    pattern: /focus on (performance|speed|optimization)/gi,
    keyExtractor: () => 'performance_focus',
    valueExtractor: () => 'high priority',
    confidence: 0.85,
  },

  // Security
  {
    category: 'security',
    pattern: /(security|auth|authentication) (is|should be) (important|priority|key)/gi,
    keyExtractor: () => 'security_priority',
    valueExtractor: () => 'high priority',
    confidence: 0.9,
  },

  // Deployment
  {
    category: 'deployment',
    pattern: /I (deploy|host|use) (Vercel|Netlify|AWS|GCP|Azure|Railway|Fly\.io)/gi,
    keyExtractor: (m) => `deployment_platform_${m[2].toLowerCase().replace(/\./g, '_')}`,
    valueExtractor: (m) => m[2],
    confidence: 0.9,
  },
];

// ==================== PREFERENCE EXTRACTOR ====================

export class PreferenceExtractor {
  private initialized: boolean = false;

  constructor() {
    console.log('[PreferenceExtractor] Initialized auto-learning system');
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    console.log('[PreferenceExtractor] ✅ Ready to extract preferences');
  }

  /**
   * Extract preferences from a user message
   */
  async extractPreferences(message: string): Promise<DetectedPreference[]> {
    const detected: DetectedPreference[] = [];

    for (const pattern of PREFERENCE_PATTERNS) {
      const matches = message.matchAll(pattern.pattern);

      for (const match of matches) {
        try {
          const key = pattern.keyExtractor(match);
          const value = pattern.valueExtractor(match);

          detected.push({
            userId: 0, // Will be set by caller
            category: pattern.category,
            key,
            value,
            confidence: pattern.confidence,
            extractedFrom: message.substring(0, 200), // First 200 chars for context
            timestamp: new Date(),
          });
        } catch (error) {
          console.error('[PreferenceExtractor] Error extracting preference:', error);
        }
      }
    }

    return detected;
  }

  /**
   * Extract and save preferences to database
   */
  async extractAndSave(
    userId: number,
    message: string,
    conversationId: number
  ): Promise<DetectedPreference[]> {
    console.log(`[PreferenceExtractor] Analyzing message for user ${userId}...`);

    const detected = await this.extractPreferences(message);

    if (detected.length === 0) {
      return [];
    }

    console.log(`[PreferenceExtractor] 🎯 Found ${detected.length} preferences`);

    // Save to database (de-duplicate by userId + key)
    for (const pref of detected) {
      try {
        // Check if preference already exists
        const existing = await db.query.mrBlueUserPreferences.findFirst({
          where: and(
            eq(mrBlueUserPreferences.userId, userId),
            eq(mrBlueUserPreferences.preferenceKey, pref.key)
          ),
        });

        if (existing) {
          // Update confidence if new detection has higher confidence
          if (pref.confidence > existing.confidence) {
            await db
              .update(mrBlueUserPreferences)
              .set({
                preferenceValue: pref.value,
                confidence: pref.confidence,
                extractedFrom: pref.extractedFrom,
                lastDetectedAt: new Date(),
              })
              .where(eq(mrBlueUserPreferences.id, existing.id));

            console.log(`[PreferenceExtractor] ✅ Updated preference: ${pref.key}`);
          }
        } else {
          // Insert new preference
          await db.insert(mrBlueUserPreferences).values({
            userId,
            category: pref.category,
            preferenceKey: pref.key,
            preferenceValue: pref.value,
            confidence: pref.confidence,
            extractedFrom: pref.extractedFrom,
            detectedAt: new Date(),
            lastDetectedAt: new Date(),
          });

          console.log(`[PreferenceExtractor] ✅ Saved new preference: ${pref.key} = ${pref.value}`);
        }
      } catch (error) {
        console.error('[PreferenceExtractor] Failed to save preference:', error);
      }
    }

    return detected;
  }

  /**
   * Get all preferences for a user
   */
  async getUserPreferences(userId: number): Promise<Array<{
    category: string;
    key: string;
    value: string;
    confidence: number;
  }>> {
    const preferences = await db.query.mrBlueUserPreferences.findMany({
      where: eq(mrBlueUserPreferences.userId, userId),
    });

    return preferences.map((p) => ({
      category: p.category,
      key: p.preferenceKey,
      value: p.preferenceValue,
      confidence: p.confidence,
    }));
  }

  /**
   * Build preference context for code generation
   * This gets injected into AI prompts
   */
  async buildPreferenceContext(userId: number): Promise<string> {
    const preferences = await this.getUserPreferences(userId);

    if (preferences.length === 0) {
      return '';
    }

    // Group by category
    const byCategory = preferences.reduce((acc, pref) => {
      if (!acc[pref.category]) {
        acc[pref.category] = [];
      }
      acc[pref.category].push(pref);
      return {};
    }, {} as Record<string, typeof preferences>);

    // Build context string
    let context = '\n\n**USER PREFERENCES:**\n';

    for (const [category, prefs] of Object.entries(byCategory)) {
      context += `\n${category.replace(/_/g, ' ').toUpperCase()}:\n`;
      for (const pref of prefs) {
        if (pref.confidence >= 0.7) {
          // Only include high-confidence preferences
          context += `- ${pref.value}\n`;
        }
      }
    }

    console.log(`[PreferenceExtractor] 📚 Built context with ${preferences.length} preferences`);

    return context;
  }

  /**
   * Delete a specific preference
   */
  async deletePreference(userId: number, key: string): Promise<void> {
    await db
      .delete(mrBlueUserPreferences)
      .where(
        and(
          eq(mrBlueUserPreferences.userId, userId),
          eq(mrBlueUserPreferences.preferenceKey, key)
        )
      );

    console.log(`[PreferenceExtractor] 🗑️ Deleted preference: ${key}`);
  }

  /**
   * Clear all preferences for a user
   */
  async clearAllPreferences(userId: number): Promise<void> {
    await db
      .delete(mrBlueUserPreferences)
      .where(eq(mrBlueUserPreferences.userId, userId));

    console.log(`[PreferenceExtractor] 🗑️ Cleared all preferences for user ${userId}`);
  }
}

// Singleton instance
export const preferenceExtractor = new PreferenceExtractor();
