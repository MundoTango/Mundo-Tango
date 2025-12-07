// ============================================================================
// EVENT DEDUPLICATOR - Identifies duplicate events from multiple sources
// MB.MD Phase 1 - Deduplication logic for scraped events
// ============================================================================

import { db } from '@shared/db';
import { scrapedEvents, events } from '@shared/schema';
import { eq, and, between } from 'drizzle-orm';

interface DeduplicationResult {
  processed: number;
  duplicatesFound: number;
  newEventsCreated: number;
  errors: number;
}

export class EventDeduplicator {
  private similarityThreshold = 0.75;

  async deduplicateAll(): Promise<DeduplicationResult> {
    const result: DeduplicationResult = {
      processed: 0,
      duplicatesFound: 0,
      newEventsCreated: 0,
      errors: 0,
    };

    try {
      const unprocessed = await db
        .select()
        .from(scrapedEvents)
        .where(eq(scrapedEvents.isProcessed, false));

      console.log(`[Deduplicator] Processing ${unprocessed.length} scraped events`);

      for (const scraped of unprocessed) {
        try {
          const duplicate = await this.findDuplicate(scraped);
          
          if (duplicate) {
            await db
              .update(scrapedEvents)
              .set({ 
                isProcessed: true, 
                matchedEventId: duplicate.id,
                processedAt: new Date() 
              })
              .where(eq(scrapedEvents.id, scraped.id));
            result.duplicatesFound++;
          } else {
            const newEvent = await this.createEvent(scraped);
            await db
              .update(scrapedEvents)
              .set({ 
                isProcessed: true, 
                matchedEventId: newEvent.id,
                processedAt: new Date() 
              })
              .where(eq(scrapedEvents.id, scraped.id));
            result.newEventsCreated++;
          }
          
          result.processed++;
        } catch (error) {
          console.error(`[Deduplicator] Error processing event ${scraped.id}:`, error);
          result.errors++;
        }
      }

      console.log('[Deduplicator] Results:', result);
      return result;
    } catch (error) {
      console.error('[Deduplicator] Fatal error:', error);
      throw error;
    }
  }

  private async findDuplicate(scraped: any): Promise<any | null> {
    const dateWindow = 6 * 60 * 60 * 1000; // 6 hours
    const startWindow = new Date(scraped.startDate.getTime() - dateWindow);
    const endWindow = new Date(scraped.startDate.getTime() + dateWindow);

    const candidates = await db
      .select()
      .from(events)
      .where(
        and(
          between(events.startDate, startWindow, endWindow),
          eq(events.cityId, 1) // Buenos Aires
        )
      );

    for (const candidate of candidates) {
      const similarity = this.calculateSimilarity(scraped, candidate);
      if (similarity >= this.similarityThreshold) {
        console.log(`[Deduplicator] Duplicate found: ${scraped.title} matches ${candidate.name}`);
        return candidate;
      }
    }

    return null;
  }

  private calculateSimilarity(scraped: any, existing: any): number {
    let score = 0;
    let factors = 0;

    // Title similarity (most important)
    const titleSim = this.stringSimilarity(scraped.title || '', existing.name || '');
    score += titleSim * 0.5;
    factors += 0.5;

    // Venue similarity
    if (scraped.venueName && existing.venueName) {
      const venueSim = this.stringSimilarity(scraped.venueName, existing.venueName);
      score += venueSim * 0.3;
      factors += 0.3;
    }

    // Time proximity (within 2 hours)
    const timeDiff = Math.abs(scraped.startDate.getTime() - existing.startDate.getTime());
    const hoursDiff = timeDiff / (60 * 60 * 1000);
    if (hoursDiff <= 2) {
      score += 0.2;
    }
    factors += 0.2;

    return factors > 0 ? score / factors : 0;
  }

  private stringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1.0;
    if (s1.length < 2 || s2.length < 2) return 0;

    const pairs1 = this.letterPairs(s1);
    const pairs2 = this.letterPairs(s2);
    let intersection = 0;

    for (const pair1 of pairs1) {
      for (let j = 0; j < pairs2.length; j++) {
        if (pair1 === pairs2[j]) {
          intersection++;
          pairs2.splice(j, 1);
          break;
        }
      }
    }

    return (2.0 * intersection) / (pairs1.length + pairs2.length);
  }

  private letterPairs(str: string): string[] {
    const pairs: string[] = [];
    for (let i = 0; i < str.length - 1; i++) {
      pairs.push(str.substring(i, i + 2));
    }
    return pairs;
  }

  private async createEvent(scraped: any): Promise<any> {
    const [newEvent] = await db
      .insert(events)
      .values({
        name: scraped.title,
        description: scraped.description,
        startDate: scraped.startDate,
        endDate: scraped.endDate,
        venueName: scraped.venueName,
        address: scraped.venueAddress,
        cityId: 1, // Buenos Aires
        eventType: scraped.eventType || 'milonga',
        price: scraped.priceInfo,
      })
      .returning();

    console.log(`[Deduplicator] Created new event: ${newEvent.name}`);
    return newEvent;
  }
}
