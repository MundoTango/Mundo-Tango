/**
 * AGENT #119: AI-POWERED EVENT DEDUPLICATION
 * MB.MD Implementation
 * 
 * Responsibilities:
 * - Deduplicate events from multiple sources
 * - AI-powered fuzzy matching (OpenAI embeddings)
 * - Merge event data from multiple sources
 * - Create canonical events in main events table
 * - Track source attribution ("Found on 3 sites")
 */

import { db } from '@shared/db';
import { scrapedEvents, events } from '@shared/schema';
import { eq, and, gte } from 'drizzle-orm';
import OpenAI from 'openai';

interface EventMatch {
  event1: any;
  event2: any;
  similarity: number;
  method: 'exact' | 'fuzzy' | 'ai';
}

export class Deduplicator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    });
  }

  /**
   * Main deduplication workflow
   */
  async deduplicate(): Promise<void> {
    console.log('[Agent #119] 🔍 Starting event deduplication...');

    try {
      // Step 1: Get all unprocessed scraped events
      const unprocessedEvents = await db.query.scrapedEvents.findMany({
        where: and(
          eq(scrapedEvents.status, 'pending_review'),
          eq(scrapedEvents.processed, false)
        )
      });

      console.log(`[Agent #119] Found ${unprocessedEvents.length} events to process`);

      // Step 2: Find duplicates using multiple strategies
      const matches = await this.findMatches(unprocessedEvents);
      
      console.log(`[Agent #119] Found ${matches.length} potential duplicate pairs`);

      // Step 3: Merge matched events
      await this.mergeMatches(matches);

      // Step 4: Create new canonical events from unmatched
      await this.createCanonicalEvents(unprocessedEvents);

      console.log('[Agent #119] ✅ Deduplication complete');

    } catch (error) {
      console.error('[Agent #119] ❌ Deduplication failed:', error);
      throw error;
    }
  }

  /**
   * Find duplicate events using multiple matching strategies
   */
  private async findMatches(scrapedEvents: any[]): Promise<EventMatch[]> {
    const matches: EventMatch[] = [];

    // Strategy 1: Exact title + date matching
    const exactMatches = this.findExactMatches(scrapedEvents);
    matches.push(...exactMatches);

    // Strategy 2: Fuzzy string matching (Levenshtein distance)
    const fuzzyMatches = this.findFuzzyMatches(scrapedEvents);
    matches.push(...fuzzyMatches);

    // Strategy 3: AI-powered semantic matching (if OpenAI key available)
    if (process.env.OPENAI_API_KEY) {
      const aiMatches = await this.findAIMatches(scrapedEvents);
      matches.push(...aiMatches);
    }

    // Remove duplicates and sort by confidence
    return this.deduplicateMatches(matches);
  }

  /**
   * Exact matching: Same title + same date
   */
  private findExactMatches(events: any[]): EventMatch[] {
    const matches: EventMatch[] = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const e1 = events[i];
        const e2 = events[j];

        const titleMatch = this.normalizeTitle(e1.title) === this.normalizeTitle(e2.title);
        const dateMatch = this.isSameDay(e1.startDate, e2.startDate);

        if (titleMatch && dateMatch) {
          matches.push({
            event1: e1,
            event2: e2,
            similarity: 100,
            method: 'exact'
          });
        }
      }
    }

    return matches;
  }

  /**
   * Fuzzy matching: Similar titles + close dates
   */
  private findFuzzyMatches(events: any[]): EventMatch[] {
    const matches: EventMatch[] = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const e1 = events[i];
        const e2 = events[j];

        const titleSimilarity = this.calculateLevenshtein(
          this.normalizeTitle(e1.title),
          this.normalizeTitle(e2.title)
        );

        const dateMatch = this.isSameDay(e1.startDate, e2.startDate);

        // Match if title similarity > 80% and same date
        if (titleSimilarity > 0.8 && dateMatch) {
          matches.push({
            event1: e1,
            event2: e2,
            similarity: titleSimilarity * 100,
            method: 'fuzzy'
          });
        }
      }
    }

    return matches;
  }

  /**
   * AI-powered semantic matching using OpenAI embeddings
   */
  private async findAIMatches(events: any[]): Promise<EventMatch[]> {
    console.log('[Agent #119] 🤖 Using AI embeddings for semantic matching...');
    
    const matches: EventMatch[] = [];

    // Generate embeddings for all events (batch API call)
    const eventTexts = events.map(e => 
      `${e.title}\n${e.description || ''}\n${e.location || ''}`
    );

    try {
      // Note: In production, batch these to avoid rate limits
      const embeddings = await Promise.all(
        eventTexts.map(text => this.getEmbedding(text))
      );

      // Compare embeddings using cosine similarity
      for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
          const similarity = this.cosineSimilarity(embeddings[i], embeddings[j]);
          
          // Match if similarity > 90% and same date
          if (similarity > 0.9 && this.isSameDay(events[i].startDate, events[j].startDate)) {
            matches.push({
              event1: events[i],
              event2: events[j],
              similarity: similarity * 100,
              method: 'ai'
            });
          }
        }
      }
    } catch (error) {
      console.error('[Agent #119] AI matching failed:', error);
    }

    return matches;
  }

  /**
   * Get OpenAI embedding for text
   */
  private async getEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000) // Limit to 8K tokens
    });

    return response.data[0].embedding;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (mag1 * mag2);
  }

  /**
   * Calculate Levenshtein distance (string similarity)
   */
  private calculateLevenshtein(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return 1 - (distance / maxLen);
  }

  /**
   * Normalize title for comparison
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Remove duplicate matches
   */
  private deduplicateMatches(matches: EventMatch[]): EventMatch[] {
    const seen = new Set<string>();
    const unique: EventMatch[] = [];

    for (const match of matches) {
      const key = [match.event1.id, match.event2.id].sort().join('-');
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(match);
      }
    }

    return unique.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Merge matched events
   */
  private async mergeMatches(matches: EventMatch[]): Promise<void> {
    for (const match of matches) {
      try {
        // Create canonical event if doesn't exist
        const canonicalEvent = await this.createOrUpdateCanonicalEvent(match);

        // Link both scraped events to canonical event
        await db.update(scrapedEvents)
          .set({ 
            finalEventId: canonicalEvent.id, 
            processed: true 
          })
          .where(eq(scrapedEvents.id, match.event1.id));

        await db.update(scrapedEvents)
          .set({ 
            finalEventId: canonicalEvent.id, 
            processed: true 
          })
          .where(eq(scrapedEvents.id, match.event2.id));

        console.log(`[Agent #119] ✅ Merged: "${match.event1.title}" (${match.similarity.toFixed(1)}% match)`);
      } catch (error) {
        console.error('[Agent #119] Failed to merge events:', error);
      }
    }
  }

  /**
   * Create or update canonical event from matched pair
   */
  private async createOrUpdateCanonicalEvent(match: EventMatch): Promise<any> {
    // Merge data from both sources (prefer more complete data)
    const mergedData = {
      title: match.event1.title || match.event2.title,
      description: this.pickBestDescription(match.event1.description, match.event2.description),
      startDate: match.event1.startDate || match.event2.startDate,
      endDate: match.event1.endDate || match.event2.endDate,
      location: match.event1.location || match.event2.location,
      address: match.event1.address || match.event2.address,
      imageUrl: match.event1.imageUrl || match.event2.imageUrl,
      price: match.event1.price ?? match.event2.price,
      isScraped: true
    };

    // Create canonical event
    const [canonicalEvent] = await db.insert(events)
      .values(mergedData)
      .returning();

    // Mark both scraped events as processed
    await db.update(scrapedEvents)
      .set({ finalEventId: canonicalEvent.id, processed: true })
      .where(eq(scrapedEvents.id, match.event1.id));
    
    await db.update(scrapedEvents)
      .set({ finalEventId: canonicalEvent.id, processed: true })
      .where(eq(scrapedEvents.id, match.event2.id));

    return canonicalEvent;
  }

  /**
   * Pick the best description (longest with most detail)
   */
  private pickBestDescription(desc1?: string, desc2?: string): string {
    if (!desc1) return desc2 || '';
    if (!desc2) return desc1;
    return desc1.length > desc2.length ? desc1 : desc2;
  }

  /**
   * Create canonical events from unmatched scraped events
   */
  private async createCanonicalEvents(scrapedEvents: any[]): Promise<void> {
    const unmatched = scrapedEvents.filter(e => !e.finalEventId);

    for (const event of unmatched) {
      try {
        const [canonicalEvent] = await db.insert(events)
          .values({
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            address: event.address,
            imageUrl: event.imageUrl,
            price: event.price,
            isScraped: true
          })
          .returning();

        await db.update(scrapedEvents)
          .set({ 
            finalEventId: canonicalEvent.id, 
            processed: true 
          })
          .where(eq(scrapedEvents.id, event.id));

      } catch (error) {
        console.error('[Agent #119] Failed to create canonical event:', error);
      }
    }
  }
}

export const deduplicator = new Deduplicator();
