/**
 * BOOK CHAPTER GENERATOR - PHASE 0C
 * AI-powered book chapter generation from journey entries
 * 
 * Features:
 * - Analyze journey entries to suggest book chapters
 * - Group related entries by topic, timeline, or theme
 * - Generate chapter summaries, key learnings, and challenges
 * - Create cohesive narrative structure for the book
 * - Track chapter progress and completion
 * 
 * Technologies:
 * - OpenAI GPT-4 for content analysis and generation
 * - PostgreSQL for structured chapter data
 * - Natural language processing for clustering entries
 */

import { db } from '../../db';
import { journeyEntries, bookChapters, type InsertBookChapter, type SelectBookChapter, type SelectJourneyEntry } from '@shared/schema';
import OpenAI from 'openai';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

interface ChapterSuggestion {
  title: string;
  description: string;
  entryIds: string[];
  startDate: Date;
  endDate: Date;
  themes: string[];
  estimatedWordCount: number;
}

interface ChapterAnalysis {
  summary: string;
  keyLearnings: string[];
  challenges: string[];
  breakthroughs: string[];
  recommendedLength: number;
}

/**
 * Book Chapter Generator Service
 * Analyzes journey entries and generates book chapters
 */
export class BookChapterGenerator {
  /**
   * Suggest chapters based on journey entries
   */
  async suggestChapters(options?: {
    minEntriesPerChapter?: number;
    maxChapters?: number;
    timeBasedClustering?: boolean;
  }): Promise<ChapterSuggestion[]> {
    try {
      const minEntries = options?.minEntriesPerChapter || 10;
      const maxChapters = options?.maxChapters || 20;

      // Get all journey entries
      const entries = await db
        .select()
        .from(journeyEntries)
        .orderBy(journeyEntries.timestamp);

      if (entries.length === 0) {
        return [];
      }

      // Use AI to cluster entries into chapters
      const suggestions = await this.clusterEntriesIntoChapters(
        entries,
        minEntries,
        maxChapters,
        options?.timeBasedClustering
      );

      return suggestions;
    } catch (error) {
      console.error('[BookChapterGenerator] ❌ Error suggesting chapters:', error);
      return [];
    }
  }

  /**
   * Use AI to cluster entries into meaningful chapters
   */
  private async clusterEntriesIntoChapters(
    entries: SelectJourneyEntry[],
    minEntries: number,
    maxChapters: number,
    timeBasedClustering?: boolean
  ): Promise<ChapterSuggestion[]> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.warn('[BookChapterGenerator] OpenAI API key not configured, using simple clustering');
        return this.simpleClusterByCategory(entries, minEntries);
      }

      // Prepare entry summaries for AI analysis
      const entrySummaries = entries.map((entry, idx) => ({
        index: idx,
        id: entry.entryId,
        category: entry.category,
        timestamp: entry.timestamp,
        content: entry.content.substring(0, 200), // First 200 chars
        tags: entry.tags,
        chapter: entry.bookChapter,
        significance: entry.significance,
      }));

      const prompt = `Analyze these software development journey entries and suggest book chapters.

Total entries: ${entries.length}
Min entries per chapter: ${minEntries}
Max chapters: ${maxChapters}

Entry summaries:
${JSON.stringify(entrySummaries.slice(0, 50), null, 2)}

Please suggest logical book chapters that:
1. Group related topics and themes
2. Tell a coherent story
3. Have clear learning progressions
4. Highlight major milestones and challenges
${timeBasedClustering ? '5. Consider chronological flow' : ''}

Return JSON array with this structure:
[
  {
    "title": "Chapter title (50 chars max)",
    "description": "Brief description",
    "entryIndices": [0, 1, 2], // Array of entry indices to include
    "themes": ["theme1", "theme2"],
    "estimatedWordCount": 3000
  }
]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert book editor specializing in technical narratives and software development stories.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 2000,
      });

      const suggestionsText = response.choices[0]?.message?.content || '[]';
      const aiSuggestions = JSON.parse(suggestionsText);

      // Convert AI suggestions to ChapterSuggestion format
      const chapters: ChapterSuggestion[] = aiSuggestions.map((suggestion: any) => {
        const chapterEntries = suggestion.entryIndices.map((idx: number) => entries[idx]);
        const entryIds = chapterEntries.map((e: SelectJourneyEntry) => e.entryId);
        const timestamps = chapterEntries.map((e: SelectJourneyEntry) => new Date(e.timestamp));

        return {
          title: suggestion.title,
          description: suggestion.description,
          entryIds,
          startDate: new Date(Math.min(...timestamps.map(t => t.getTime()))),
          endDate: new Date(Math.max(...timestamps.map(t => t.getTime()))),
          themes: suggestion.themes,
          estimatedWordCount: suggestion.estimatedWordCount || 3000,
        };
      });

      return chapters;
    } catch (error) {
      console.error('[BookChapterGenerator] Error in AI clustering:', error);
      // Fallback to simple clustering
      return this.simpleClusterByCategory(entries, minEntries);
    }
  }

  /**
   * Simple clustering by category (fallback when AI unavailable)
   */
  private simpleClusterByCategory(
    entries: SelectJourneyEntry[],
    minEntries: number
  ): ChapterSuggestion[] {
    const categoryGroups: Record<string, SelectJourneyEntry[]> = {};

    for (const entry of entries) {
      if (!categoryGroups[entry.category]) {
        categoryGroups[entry.category] = [];
      }
      categoryGroups[entry.category].push(entry);
    }

    const chapters: ChapterSuggestion[] = [];

    for (const [category, groupEntries] of Object.entries(categoryGroups)) {
      if (groupEntries.length >= minEntries) {
        const timestamps = groupEntries.map(e => new Date(e.timestamp));
        const title = this.getCategoryTitle(category);

        chapters.push({
          title,
          description: `Collection of ${category} entries from the development journey`,
          entryIds: groupEntries.map(e => e.entryId),
          startDate: new Date(Math.min(...timestamps.map(t => t.getTime()))),
          endDate: new Date(Math.max(...timestamps.map(t => t.getTime()))),
          themes: [category],
          estimatedWordCount: groupEntries.length * 200,
        });
      }
    }

    return chapters;
  }

  /**
   * Get user-friendly title for category
   */
  private getCategoryTitle(category: string): string {
    const titles: Record<string, string> = {
      chat: 'Conversations and Collaboration',
      code: 'Building the Foundation',
      decision: 'Critical Decisions',
      bug: 'Debugging and Problem Solving',
      learning: 'Learning and Discovery',
      milestone: 'Major Milestones',
    };
    return titles[category] || category;
  }

  /**
   * Create a book chapter from entries
   */
  async createChapter(
    chapterNumber: number,
    title: string,
    entryIds: string[],
    description?: string
  ): Promise<{ success: boolean; chapterId?: string; error?: string }> {
    try {
      const chapterId = `chapter_${chapterNumber}_${Date.now()}`;

      // Get all entries for this chapter
      const entries = await db
        .select()
        .from(journeyEntries)
        .where(inArray(journeyEntries.entryId, entryIds));

      if (entries.length === 0) {
        return { success: false, error: 'No entries found' };
      }

      // Analyze chapter content with AI
      const analysis = await this.analyzeChapterContent(entries);

      // Calculate dates
      const timestamps = entries.map(e => new Date(e.timestamp));
      const startDate = new Date(Math.min(...timestamps.map(t => t.getTime())));
      const endDate = new Date(Math.max(...timestamps.map(t => t.getTime())));

      // Create chapter
      const chapter: InsertBookChapter = {
        chapterId,
        chapterNumber,
        title,
        description: description || analysis.summary.substring(0, 500),
        entryCount: entries.length,
        startDate,
        endDate,
        summary: analysis.summary,
        keyLearnings: analysis.keyLearnings,
        challenges: analysis.challenges,
        breakthroughs: analysis.breakthroughs,
        status: 'draft',
        wordCount: analysis.recommendedLength,
      };

      await db.insert(bookChapters).values(chapter);

      // Update entries to reference this chapter
      await db
        .update(journeyEntries)
        .set({ bookChapter: title })
        .where(inArray(journeyEntries.entryId, entryIds));

      console.log(`[BookChapterGenerator] ✅ Created chapter: ${title}`);

      return { success: true, chapterId };
    } catch (error) {
      console.error('[BookChapterGenerator] ❌ Error creating chapter:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Analyze chapter content with AI
   */
  private async analyzeChapterContent(
    entries: SelectJourneyEntry[]
  ): Promise<ChapterAnalysis> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return this.simpleAnalysis(entries);
      }

      const contentSummary = entries
        .map(
          (e, idx) =>
            `Entry ${idx + 1} (${e.category}, significance: ${e.significance}):\n${e.content.substring(0, 300)}`
        )
        .join('\n\n');

      const prompt = `Analyze this book chapter content from a software development journey:

${contentSummary}

Provide:
1. A compelling chapter summary (200-300 words)
2. Key learnings (3-5 bullet points)
3. Major challenges faced (2-4 bullet points)
4. Breakthrough moments (1-3 bullet points)
5. Recommended chapter length in words

Return as JSON:
{
  "summary": "Chapter summary...",
  "keyLearnings": ["learning 1", "learning 2"],
  "challenges": ["challenge 1", "challenge 2"],
  "breakthroughs": ["breakthrough 1"],
  "recommendedLength": 3500
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert book editor analyzing technical content for narrative structure.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      });

      const analysisText = response.choices[0]?.message?.content || '{}';
      const analysis = JSON.parse(analysisText);

      return analysis;
    } catch (error) {
      console.error('[BookChapterGenerator] Error analyzing chapter:', error);
      return this.simpleAnalysis(entries);
    }
  }

  /**
   * Simple analysis (fallback)
   */
  private simpleAnalysis(entries: SelectJourneyEntry[]): ChapterAnalysis {
    const categories = new Set(entries.map(e => e.category));
    const avgSignificance =
      entries.reduce((sum, e) => sum + e.significance, 0) / entries.length;

    return {
      summary: `This chapter covers ${entries.length} entries spanning ${Array.from(categories).join(', ')} activities in the development journey.`,
      keyLearnings: entries
        .filter(e => e.category === 'learning')
        .slice(0, 5)
        .map(e => e.content.substring(0, 100)),
      challenges: entries
        .filter(e => e.category === 'bug')
        .slice(0, 4)
        .map(e => e.content.substring(0, 100)),
      breakthroughs: entries
        .filter(e => e.category === 'milestone')
        .slice(0, 3)
        .map(e => e.content.substring(0, 100)),
      recommendedLength: entries.length * 250,
    };
  }

  /**
   * Get all book chapters
   */
  async getAllChapters(): Promise<SelectBookChapter[]> {
    try {
      const chapters = await db
        .select()
        .from(bookChapters)
        .orderBy(bookChapters.chapterNumber);

      return chapters;
    } catch (error) {
      console.error('[BookChapterGenerator] ❌ Error getting chapters:', error);
      return [];
    }
  }

  /**
   * Get chapter by ID
   */
  async getChapter(chapterId: string): Promise<SelectBookChapter | null> {
    try {
      const [chapter] = await db
        .select()
        .from(bookChapters)
        .where(eq(bookChapters.chapterId, chapterId));

      return chapter || null;
    } catch (error) {
      console.error('[BookChapterGenerator] ❌ Error getting chapter:', error);
      return null;
    }
  }

  /**
   * Update chapter status
   */
  async updateChapterStatus(
    chapterId: string,
    status: 'draft' | 'in_progress' | 'completed'
  ): Promise<boolean> {
    try {
      await db
        .update(bookChapters)
        .set({ status, updatedAt: new Date() })
        .where(eq(bookChapters.chapterId, chapterId));

      return true;
    } catch (error) {
      console.error('[BookChapterGenerator] ❌ Error updating chapter status:', error);
      return false;
    }
  }

  /**
   * Generate table of contents
   */
  async generateTableOfContents(): Promise<{
    chapters: Array<{
      number: number;
      title: string;
      description: string;
      entryCount: number;
      status: string;
    }>;
    totalWordCount: number;
    completionPercentage: number;
  }> {
    try {
      const chapters = await this.getAllChapters();

      const toc = chapters.map(ch => ({
        number: ch.chapterNumber,
        title: ch.title,
        description: ch.description || '',
        entryCount: ch.entryCount,
        status: ch.status,
      }));

      const totalWordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
      const completedChapters = chapters.filter(ch => ch.status === 'completed').length;
      const completionPercentage =
        chapters.length > 0 ? (completedChapters / chapters.length) * 100 : 0;

      return {
        chapters: toc,
        totalWordCount,
        completionPercentage,
      };
    } catch (error) {
      console.error('[BookChapterGenerator] ❌ Error generating TOC:', error);
      return {
        chapters: [],
        totalWordCount: 0,
        completionPercentage: 0,
      };
    }
  }

  /**
   * Get entries for a specific chapter
   */
  async getChapterEntries(chapterTitle: string): Promise<SelectJourneyEntry[]> {
    try {
      const entries = await db
        .select()
        .from(journeyEntries)
        .where(eq(journeyEntries.bookChapter, chapterTitle))
        .orderBy(journeyEntries.timestamp);

      return entries;
    } catch (error) {
      console.error('[BookChapterGenerator] ❌ Error getting chapter entries:', error);
      return [];
    }
  }

  /**
   * Auto-generate chapters from all entries
   */
  async autoGenerateChapters(): Promise<{
    success: boolean;
    chaptersCreated: number;
    error?: string;
  }> {
    try {
      // Get chapter suggestions
      const suggestions = await this.suggestChapters({
        minEntriesPerChapter: 5,
        maxChapters: 15,
        timeBasedClustering: true,
      });

      let chaptersCreated = 0;

      for (let i = 0; i < suggestions.length; i++) {
        const suggestion = suggestions[i];
        const result = await this.createChapter(
          i + 1,
          suggestion.title,
          suggestion.entryIds,
          suggestion.description
        );

        if (result.success) {
          chaptersCreated++;
        }
      }

      return {
        success: true,
        chaptersCreated,
      };
    } catch (error) {
      console.error('[BookChapterGenerator] ❌ Error auto-generating chapters:', error);
      return {
        success: false,
        chaptersCreated: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const bookChapterGenerator = new BookChapterGenerator();
