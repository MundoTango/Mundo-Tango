/**
 * JOURNEY RECORDER SERVICE - PHASE 0C
 * Records all development conversations for Scott's book about building Mundo Tango
 * 
 * Features:
 * - Record all Replit Agent conversations
 * - Track Mr. Blue interactions (text/voice/video)
 * - Log development decisions and bugs
 * - Capture learning moments and milestones
 * - Store in both PostgreSQL and LanceDB for semantic search
 * - Auto-suggest book chapters based on content analysis
 * 
 * Technologies:
 * - LanceDB for vector storage and semantic search
 * - OpenAI GPT-4 for content analysis and metadata extraction
 * - PostgreSQL for structured data
 */

import { db } from '../../db';
import { journeyEntries, bookChapters, type InsertJourneyEntry, type SelectJourneyEntry } from '@shared/schema';
import { lanceDB } from '../../lib/lancedb';
import OpenAI from 'openai';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

export type JourneyCategory = 'chat' | 'code' | 'decision' | 'bug' | 'learning' | 'milestone';

interface JourneyContext {
  page?: string;
  feature?: string;
  partReference?: string;
  filePaths?: string[];
  codeSnippets?: string[];
}

interface RecordOptions {
  category: JourneyCategory;
  content: string;
  context?: JourneyContext;
  participants?: string[];
  tags?: string[];
  significance?: number; // 1-10
  emotionalTone?: string;
  gitCommitHash?: string;
}

interface AnalysisResult {
  suggestedChapter: string;
  extractedTags: string[];
  toolsUsed: string[];
  aiModelsUsed: string[];
  emotionalTone: string;
  significance: number;
  keyLearnings: string[];
}

/**
 * Journey Recorder Service
 * Main service for recording Scott's development journey
 */
export class JourneyRecorder {
  private readonly lanceTableName = 'scott_journey';
  private initialized = false;

  /**
   * Initialize the journey recording system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('[JourneyRecorder] Initializing...');

      // Initialize LanceDB table
      const stats = await lanceDB.getTableStats(this.lanceTableName);
      console.log(`[JourneyRecorder] LanceDB table stats:`, stats);

      this.initialized = true;
      console.log('[JourneyRecorder] ✅ Initialized successfully');
    } catch (error) {
      console.error('[JourneyRecorder] ❌ Initialization error:', error);
      throw error;
    }
  }

  /**
   * Record a journey entry with AI-powered analysis
   */
  async recordEntry(options: RecordOptions): Promise<{
    success: boolean;
    entryId?: string;
    error?: string;
  }> {
    try {
      await this.initialize();

      // Generate unique entry ID
      const entryId = `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // AI-powered content analysis (if OpenAI available)
      let analysis: Partial<AnalysisResult> = {};
      if (process.env.OPENAI_API_KEY) {
        analysis = await this.analyzeContent(options.content, options.category, options.context);
      }

      // Prepare searchable text
      const searchableText = this.generateSearchableText(options, analysis);

      // Store in PostgreSQL
      const entry: InsertJourneyEntry = {
        entryId,
        category: options.category,
        content: options.content,
        context: options.context as any,
        participants: options.participants || ['Scott', 'Replit Agent'],
        tags: [...(options.tags || []), ...(analysis.extractedTags || [])],
        bookChapter: analysis.suggestedChapter || null,
        significance: options.significance || analysis.significance || 5,
        toolsUsed: analysis.toolsUsed || [],
        aiModelsUsed: analysis.aiModelsUsed || [],
        relatedEntryIds: [],
        gitCommitHash: options.gitCommitHash || null,
        searchableText,
        emotionalTone: options.emotionalTone || analysis.emotionalTone || null,
      };

      const [dbEntry] = await db.insert(journeyEntries).values(entry).returning();

      // Store in LanceDB for semantic search
      await lanceDB.addMemory(this.lanceTableName, {
        id: entryId,
        content: options.content,
        metadata: {
          category: options.category,
          timestamp: Date.now(),
          participants: options.participants,
          tags: entry.tags,
          chapter: entry.bookChapter,
          significance: entry.significance,
          context: options.context,
        },
      });

      console.log(`[JourneyRecorder] ✅ Recorded entry: ${entryId} (${options.category})`);

      return {
        success: true,
        entryId,
      };
    } catch (error) {
      console.error('[JourneyRecorder] ❌ Error recording entry:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Record multiple entries in batch (more efficient)
   */
  async recordBatch(entries: RecordOptions[]): Promise<{
    success: boolean;
    recordedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let recordedCount = 0;

    for (const entry of entries) {
      const result = await this.recordEntry(entry);
      if (result.success) {
        recordedCount++;
      } else {
        errors.push(result.error || 'Unknown error');
      }
    }

    return {
      success: errors.length === 0,
      recordedCount,
      errors,
    };
  }

  /**
   * AI-powered content analysis
   */
  private async analyzeContent(
    content: string,
    category: JourneyCategory,
    context?: JourneyContext
  ): Promise<Partial<AnalysisResult>> {
    try {
      const prompt = `Analyze this development journey entry and extract metadata:

Category: ${category}
Content: ${content}
Context: ${context ? JSON.stringify(context) : 'None'}

Please provide:
1. Suggested book chapter title (max 50 chars)
2. Relevant tags (comma-separated)
3. Tools/technologies mentioned
4. AI models mentioned (GPT-4, Claude, etc.)
5. Emotional tone (excited, frustrated, confused, breakthrough, neutral)
6. Significance rating (1-10, where 10 is extremely important)
7. Key learning (one sentence)

Format as JSON:
{
  "suggestedChapter": "Chapter title",
  "extractedTags": ["tag1", "tag2"],
  "toolsUsed": ["tool1", "tool2"],
  "aiModelsUsed": ["model1"],
  "emotionalTone": "tone",
  "significance": 7,
  "keyLearnings": ["learning"]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing software development journeys and extracting metadata for book authoring.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const analysisText = response.choices[0]?.message?.content || '{}';
      const analysis = JSON.parse(analysisText);

      return analysis;
    } catch (error) {
      console.error('[JourneyRecorder] Error analyzing content:', error);
      return {
        suggestedChapter: `${category.charAt(0).toUpperCase()}${category.slice(1)} Entry`,
        extractedTags: [],
        toolsUsed: [],
        aiModelsUsed: [],
        emotionalTone: 'neutral',
        significance: 5,
        keyLearnings: [],
      };
    }
  }

  /**
   * Generate searchable text from entry data
   */
  private generateSearchableText(
    options: RecordOptions,
    analysis: Partial<AnalysisResult>
  ): string {
    const parts = [
      options.content,
      options.category,
      ...(options.participants || []),
      ...(options.tags || []),
      ...(analysis.extractedTags || []),
      ...(analysis.toolsUsed || []),
      analysis.suggestedChapter,
      options.context?.page,
      options.context?.feature,
    ];

    return parts.filter(Boolean).join(' ');
  }

  /**
   * Search journey entries using semantic search
   */
  async searchEntries(
    query: string,
    options?: {
      category?: JourneyCategory;
      tags?: string[];
      minSignificance?: number;
      limit?: number;
    }
  ): Promise<SelectJourneyEntry[]> {
    try {
      await this.initialize();

      // Build filters for LanceDB
      const filters: Record<string, any> = {};
      if (options?.category) {
        filters.category = options.category;
      }

      // Perform semantic search in LanceDB
      const vectorResults = await lanceDB.searchMemories(
        this.lanceTableName,
        query,
        options?.limit || 10,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      if (vectorResults.length === 0) {
        return [];
      }

      // Get entry IDs from vector search results
      const entryIds = vectorResults.map(r => r.id);

      // Fetch full entries from PostgreSQL
      const entries = await db
        .select()
        .from(journeyEntries)
        .where(inArray(journeyEntries.entryId, entryIds))
        .orderBy(desc(journeyEntries.timestamp));

      // Apply additional filters
      let filteredEntries = entries;

      if (options?.tags && options.tags.length > 0) {
        filteredEntries = filteredEntries.filter(entry =>
          options.tags!.some(tag => entry.tags?.includes(tag))
        );
      }

      if (options?.minSignificance) {
        filteredEntries = filteredEntries.filter(
          entry => entry.significance >= options.minSignificance!
        );
      }

      return filteredEntries;
    } catch (error) {
      console.error('[JourneyRecorder] ❌ Error searching entries:', error);
      return [];
    }
  }

  /**
   * Get entries by category
   */
  async getEntriesByCategory(
    category: JourneyCategory,
    limit = 50
  ): Promise<SelectJourneyEntry[]> {
    try {
      const entries = await db
        .select()
        .from(journeyEntries)
        .where(eq(journeyEntries.category, category))
        .orderBy(desc(journeyEntries.timestamp))
        .limit(limit);

      return entries;
    } catch (error) {
      console.error('[JourneyRecorder] ❌ Error getting entries by category:', error);
      return [];
    }
  }

  /**
   * Get entries by tags
   */
  async getEntriesByTags(tags: string[], limit = 50): Promise<SelectJourneyEntry[]> {
    try {
      const entries = await db
        .select()
        .from(journeyEntries)
        .where(
          sql`${journeyEntries.tags} && ARRAY[${sql.join(tags.map(t => sql`${t}`), sql`, `)}]::text[]`
        )
        .orderBy(desc(journeyEntries.timestamp))
        .limit(limit);

      return entries;
    } catch (error) {
      console.error('[JourneyRecorder] ❌ Error getting entries by tags:', error);
      return [];
    }
  }

  /**
   * Get timeline of entries
   */
  async getTimeline(
    startDate?: Date,
    endDate?: Date,
    limit = 100
  ): Promise<SelectJourneyEntry[]> {
    try {
      let query = db.select().from(journeyEntries);

      if (startDate && endDate) {
        query = query.where(
          and(
            sql`${journeyEntries.timestamp} >= ${startDate}`,
            sql`${journeyEntries.timestamp} <= ${endDate}`
          )
        ) as any;
      }

      const entries = await query
        .orderBy(desc(journeyEntries.timestamp))
        .limit(limit);

      return entries;
    } catch (error) {
      console.error('[JourneyRecorder] ❌ Error getting timeline:', error);
      return [];
    }
  }

  /**
   * Get statistics about journey entries
   */
  async getStats(): Promise<{
    totalEntries: number;
    byCategory: Record<JourneyCategory, number>;
    topTags: { tag: string; count: number }[];
    avgSignificance: number;
  }> {
    try {
      const allEntries = await db.select().from(journeyEntries);

      const byCategory: Record<JourneyCategory, number> = {
        chat: 0,
        code: 0,
        decision: 0,
        bug: 0,
        learning: 0,
        milestone: 0,
      };

      const tagCounts: Record<string, number> = {};
      let totalSignificance = 0;

      for (const entry of allEntries) {
        byCategory[entry.category as JourneyCategory]++;
        totalSignificance += entry.significance;

        if (entry.tags) {
          for (const tag of entry.tags) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }
      }

      const topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalEntries: allEntries.length,
        byCategory,
        topTags,
        avgSignificance: allEntries.length > 0 ? totalSignificance / allEntries.length : 0,
      };
    } catch (error) {
      console.error('[JourneyRecorder] ❌ Error getting stats:', error);
      return {
        totalEntries: 0,
        byCategory: { chat: 0, code: 0, decision: 0, bug: 0, learning: 0, milestone: 0 },
        topTags: [],
        avgSignificance: 0,
      };
    }
  }

  /**
   * Record this conversation (convenient method)
   */
  async recordConversation(
    content: string,
    context?: JourneyContext,
    significance?: number
  ): Promise<{ success: boolean; entryId?: string; error?: string }> {
    return this.recordEntry({
      category: 'chat',
      content,
      context,
      participants: ['Scott', 'Replit Agent'],
      significance,
    });
  }

  /**
   * Record a code change
   */
  async recordCodeChange(
    description: string,
    filePaths: string[],
    gitCommitHash?: string,
    significance?: number
  ): Promise<{ success: boolean; entryId?: string; error?: string }> {
    return this.recordEntry({
      category: 'code',
      content: description,
      context: { filePaths },
      gitCommitHash,
      significance,
    });
  }

  /**
   * Record a decision
   */
  async recordDecision(
    decision: string,
    context?: JourneyContext,
    significance?: number
  ): Promise<{ success: boolean; entryId?: string; error?: string }> {
    return this.recordEntry({
      category: 'decision',
      content: decision,
      context,
      significance: significance || 7, // Decisions are important
    });
  }

  /**
   * Record a bug and its solution
   */
  async recordBug(
    bugDescription: string,
    solution: string,
    context?: JourneyContext
  ): Promise<{ success: boolean; entryId?: string; error?: string }> {
    const content = `**Bug:** ${bugDescription}\n\n**Solution:** ${solution}`;
    return this.recordEntry({
      category: 'bug',
      content,
      context,
      significance: 6,
    });
  }

  /**
   * Record a learning moment
   */
  async recordLearning(
    learning: string,
    context?: JourneyContext,
    significance?: number
  ): Promise<{ success: boolean; entryId?: string; error?: string }> {
    return this.recordEntry({
      category: 'learning',
      content: learning,
      context,
      significance: significance || 7, // Learning is important
    });
  }

  /**
   * Record a milestone
   */
  async recordMilestone(
    milestone: string,
    context?: JourneyContext
  ): Promise<{ success: boolean; entryId?: string; error?: string }> {
    return this.recordEntry({
      category: 'milestone',
      content: milestone,
      context,
      significance: 9, // Milestones are very important
      emotionalTone: 'breakthrough',
    });
  }
}

// Export singleton instance
export const journeyRecorder = new JourneyRecorder();
