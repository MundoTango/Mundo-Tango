/**
 * AGENT #119: AI-POWERED EVENT DEDUPLICATION
 * MB.MD Implementation - Full Deduplication
 * 
 * Matches scraped events to existing events by:
 * 1. Normalized title + venue + date (exact match)
 * 2. Fuzzy title matching within same city/date range
 * 3. Updates existing events instead of creating duplicates
 * 4. Converts placeholders to real events when matched
 */

import { db } from '@shared/db';
import { scrapedEvents, events } from '@shared/schema';
import { eq, and, ilike, sql, gte, lte } from 'drizzle-orm';

interface DeduplicationResult {
  processed: number;
  duplicatesFound: number;
  updated: number;
  placeholdersConverted: number;
  newEvents: number;
}

interface MatchResult {
  existingEventId: number | null;
  isPlaceholder: boolean;
  matchConfidence: number;
  matchReason: string;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeVenue(venue: string | null | undefined): string {
  if (!venue) return '';
  return venue
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const s1 = normalizeTitle(str1);
  const s2 = normalizeTitle(str2);
  
  if (s1 === s2) return 100;
  
  const words1 = new Set(s1.split(' ').filter(w => w.length > 2));
  const words2 = new Set(s2.split(' ').filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  
  return Math.round((intersection / union) * 100);
}

export class Deduplicator {
  private minMatchConfidence = 70;

  async findExistingEvent(
    title: string,
    city: string | null,
    startDate: Date,
    venue?: string | null
  ): Promise<MatchResult> {
    const normalizedTitle = normalizeTitle(title);
    const normalizedVenue = normalizeVenue(venue);
    
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conditions = [
      sql`${events.startDate} >= ${startOfDay}`,
      sql`${events.startDate} <= ${endOfDay}`
    ];

    if (city) {
      conditions.push(ilike(events.city, city));
    }

    const candidates = await db
      .select({
        id: events.id,
        title: events.title,
        venue: events.venue,
        isPlaceholder: events.isPlaceholder,
      })
      .from(events)
      .where(and(...conditions))
      .limit(20);

    for (const candidate of candidates) {
      const candidateNormalizedTitle = normalizeTitle(candidate.title);
      const candidateNormalizedVenue = normalizeVenue(candidate.venue);
      
      if (candidateNormalizedTitle === normalizedTitle) {
        return {
          existingEventId: candidate.id,
          isPlaceholder: candidate.isPlaceholder || false,
          matchConfidence: 100,
          matchReason: 'Exact title match on same date'
        };
      }

      if (normalizedVenue && candidateNormalizedVenue === normalizedVenue) {
        const titleSimilarity = calculateSimilarity(title, candidate.title);
        if (titleSimilarity >= 60) {
          return {
            existingEventId: candidate.id,
            isPlaceholder: candidate.isPlaceholder || false,
            matchConfidence: Math.min(95, titleSimilarity + 20),
            matchReason: `Same venue with ${titleSimilarity}% title similarity`
          };
        }
      }

      const similarity = calculateSimilarity(title, candidate.title);
      if (similarity >= this.minMatchConfidence) {
        return {
          existingEventId: candidate.id,
          isPlaceholder: candidate.isPlaceholder || false,
          matchConfidence: similarity,
          matchReason: `Fuzzy title match: ${similarity}% similarity`
        };
      }
    }

    return {
      existingEventId: null,
      isPlaceholder: false,
      matchConfidence: 0,
      matchReason: 'No match found'
    };
  }

  async deduplicate(): Promise<DeduplicationResult> {
    console.log('[Agent #119] 🔍 Starting real deduplication...');
    
    const result: DeduplicationResult = {
      processed: 0,
      duplicatesFound: 0,
      updated: 0,
      placeholdersConverted: 0,
      newEvents: 0
    };

    const pending = await db.query.scrapedEvents.findMany({
      where: eq(scrapedEvents.status, 'pending_review')
    });

    console.log(`[Agent #119] Found ${pending.length} pending events to process`);

    for (const scraped of pending) {
      result.processed++;

      if (!scraped.startDate) {
        console.log(`[Agent #119] Skipping event without date: ${scraped.title}`);
        continue;
      }

      const match = await this.findExistingEvent(
        scraped.title,
        scraped.city,
        scraped.startDate,
        scraped.venue
      );

      if (match.existingEventId && match.matchConfidence >= this.minMatchConfidence) {
        result.duplicatesFound++;

        if (match.isPlaceholder) {
          await db
            .update(events)
            .set({
              title: scraped.title,
              description: scraped.description || undefined,
              venue: scraped.venue || undefined,
              address: scraped.address || undefined,
              startDate: scraped.startDate,
              endDate: scraped.endDate || undefined,
              ticketUrl: scraped.ticketUrl || undefined,
              sourceUrl: scraped.sourceUrl || undefined,
              sourceName: scraped.sourceName || undefined,
              coverImage: scraped.coverImage || undefined,
              isPlaceholder: false,
              updatedAt: new Date(),
            })
            .where(eq(events.id, match.existingEventId));

          result.placeholdersConverted++;
          console.log(`[Agent #119] ✨ Converted placeholder to real: ${scraped.title} (${match.matchReason})`);
        } else {
          await db
            .update(events)
            .set({
              description: scraped.description || undefined,
              venue: scraped.venue || undefined,
              address: scraped.address || undefined,
              ticketUrl: scraped.ticketUrl || undefined,
              sourceUrl: scraped.sourceUrl || undefined,
              sourceName: scraped.sourceName || undefined,
              coverImage: scraped.coverImage || undefined,
              sourceUpdatedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(events.id, match.existingEventId));

          result.updated++;
          console.log(`[Agent #119] 🔄 Updated existing event: ${scraped.title} (${match.matchReason})`);
        }

        await db
          .update(scrapedEvents)
          .set({ status: 'matched', updatedAt: new Date() })
          .where(eq(scrapedEvents.id, scraped.id));
      } else {
        result.newEvents++;
        console.log(`[Agent #119] ➕ New event (no match): ${scraped.title}`);
      }
    }

    console.log('\n[Agent #119] ========== DEDUPLICATION SUMMARY ==========');
    console.log(`[Agent #119] Processed: ${result.processed}`);
    console.log(`[Agent #119] Duplicates found: ${result.duplicatesFound}`);
    console.log(`[Agent #119] Events updated: ${result.updated}`);
    console.log(`[Agent #119] Placeholders converted: ${result.placeholdersConverted}`);
    console.log(`[Agent #119] New events: ${result.newEvents}`);
    console.log('[Agent #119] ================================================\n');

    return result;
  }

  async deduplicateSingle(
    title: string,
    city: string | null,
    startDate: Date,
    venue?: string | null
  ): Promise<MatchResult> {
    return this.findExistingEvent(title, city, startDate, venue);
  }
}

export const deduplicator = new Deduplicator();
