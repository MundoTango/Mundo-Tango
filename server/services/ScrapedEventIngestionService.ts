/**
 * SCRAPED EVENT INGESTION SERVICE
 * Promotes approved scraped_events to the main events table
 * This ensures scraped events appear on /events with full functionality
 */

import { db } from '@shared/db';
import { events, scrapedEvents, users, eventTeamMembers } from '@shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { extractParticipants } from './participant-extraction';

const SCRAPER_BOT_USERNAME = 'scraper_bot';
const SCRAPER_BOT_EMAIL = 'scraper@mundotango.app';

class ScrapedEventIngestionService {
  private scraperUserId: number | null = null;

  /**
   * Get or create the scraper bot user that owns ingested events
   */
  async getScraperUserId(): Promise<number> {
    if (this.scraperUserId) return this.scraperUserId;

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, SCRAPER_BOT_USERNAME))
      .limit(1);

    if (existing) {
      this.scraperUserId = existing.id;
      return existing.id;
    }

    const [created] = await db
      .insert(users)
      .values({
        username: SCRAPER_BOT_USERNAME,
        email: SCRAPER_BOT_EMAIL,
        name: 'Mundo Tango Events Bot',
        password: 'disabled',
        role: 'system',
        isVerified: true,
        profileImage: null
      })
      .returning({ id: users.id });

    this.scraperUserId = created.id;
    return created.id;
  }

  /**
   * Generate a URL-safe slug from title
   */
  private generateSlug(title: string, id: number): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);
    return `${base}-${id}`;
  }

  /**
   * Map scraped event to events table format
   */
  private mapToEvent(scraped: any, userId: number) {
    const eventType = this.normalizeEventType(scraped.eventType);
    
    return {
      title: scraped.title,
      slug: this.generateSlug(scraped.title, scraped.id),
      description: scraped.description || `${eventType} event`,
      eventType,
      category: this.mapCategory(eventType),
      userId,
      startDate: scraped.startDate,
      endDate: scraped.endDate || scraped.startDate,
      location: scraped.location || 'TBA',
      venue: scraped.location || 'TBA',
      address: scraped.address || scraped.location || '',
      city: this.extractCity(scraped),
      country: this.extractCountry(scraped),
      latitude: scraped.latitude ? String(scraped.latitude) : null,
      longitude: scraped.longitude ? String(scraped.longitude) : null,
      status: 'published' as const,
      groupId: scraped.groupId,
      imageUrl: scraped.imageUrl || null,
      coverImage: scraped.imageUrl || null,
      sourceUrl: scraped.sourceUrl,
      sourceName: scraped.sourceName,
      price: scraped.price || null,
      isOnline: false,
      isFree: this.isPriceFree(scraped.price),
      isPaid: !this.isPriceFree(scraped.price)
    };
  }

  /**
   * Determine if a price string indicates a free event
   * Handles multilingual variations and numeric zero values
   */
  private isPriceFree(price: string | null | undefined): boolean {
    if (!price || price.trim() === '') return true;
    
    const normalized = price.trim().toLowerCase();
    
    // Check for free indicators in multiple languages
    const freeIndicators = ['free', 'gratis', 'gratuit', 'gratuito', 'kostenlos', 'libre', 'frei'];
    if (freeIndicators.some(indicator => normalized.includes(indicator))) return true;
    
    // Check for zero values (0, 0.00, €0, $0.00, etc.)
    const numericValue = normalized.replace(/[^0-9.,]/g, '').replace(',', '.');
    if (numericValue && parseFloat(numericValue) === 0) return true;
    
    return false;
  }

  /**
   * Normalize event type to match events table enum
   */
  private normalizeEventType(type: string | null): string {
    const normalized = (type || 'milonga').toLowerCase();
    const validTypes = ['milonga', 'practica', 'workshop', 'festival', 'marathon', 'encuentro', 'class', 'social', 'performance', 'show', 'competition', 'concert'];
    return validTypes.includes(normalized) ? normalized : 'milonga';
  }

  /**
   * Map event type to category
   */
  private mapCategory(eventType: string): string {
    const categoryMap: Record<string, string> = {
      'festival': 'festivals',
      'marathon': 'marathons',
      'encuentro': 'encuentros',
      'milonga': 'milongas',
      'practica': 'practicas',
      'workshop': 'classes',
      'class': 'classes',
      'performance': 'shows',
      'show': 'shows'
    };
    return categoryMap[eventType] || 'social';
  }

  /**
   * Extract city from scraped event
   */
  private extractCity(scraped: any): string {
    if (scraped.city && scraped.city !== 'Various') return scraped.city;
    if (scraped.address) {
      const parts = scraped.address.split(',');
      if (parts.length > 0) return parts[0].trim();
    }
    return scraped.location || 'Unknown';
  }

  /**
   * Extract country from scraped event
   */
  private extractCountry(scraped: any): string {
    if (scraped.country && scraped.country !== 'Various') return scraped.country;
    if (scraped.address) {
      const parts = scraped.address.split(',');
      if (parts.length > 1) return parts[parts.length - 1].trim();
    }
    return 'Unknown';
  }

  /**
   * Extract participants from event description and create team members
   */
  private async extractAndCreateTeamMembers(eventId: number, title: string, description: string | null): Promise<void> {
    try {
      const extraction = await extractParticipants(title, description, null);
      
      if (extraction.participants.length === 0) {
        return;
      }

      console.log(`[Ingestion] 👥 Found ${extraction.participants.length} team members for event ${eventId}`);

      for (const participant of extraction.participants) {
        // Map extraction role to event_role enum
        const roleMap: Record<string, 'organizer' | 'dj' | 'teacher' | 'performer' | 'host'> = {
          'organizer': 'organizer',
          'co_organizer': 'organizer',
          'dj': 'dj',
          'teacher': 'teacher',
          'performer': 'performer',
          'photographer': 'performer',
          'host': 'host'
        };
        
        const role = roleMap[participant.role] || 'performer';

        try {
          // Only include userId if it's a valid number
          const teamMemberData: any = {
            eventId,
            role,
            displayName: participant.name,
            rawText: participant.sourceText,
            confidence: participant.confidence,
            source: 'scraped'
          };
          
          // Only set userId if there's an actual match
          if (typeof participant.matchedUserId === 'number' && participant.matchedUserId > 0) {
            teamMemberData.userId = participant.matchedUserId;
          }
          
          await db.insert(eventTeamMembers).values(teamMemberData);

          console.log(`[Ingestion]   + ${participant.name} (${role})${participant.matchedUserId ? ` → user ${participant.matchedUserId}` : ''}`);
        } catch (err: any) {
          // Skip duplicates
          if (err.code !== '23505') {
            console.error(`[Ingestion] Failed to add team member ${participant.name}:`, err.message);
          }
        }
      }
    } catch (error) {
      console.error(`[Ingestion] Error extracting team members for event ${eventId}:`, error);
    }
  }

  /**
   * Ingest a single approved scraped event into events table
   */
  async ingestEvent(scrapedEventId: number): Promise<number | null> {
    try {
      const [scraped] = await db
        .select()
        .from(scrapedEvents)
        .where(eq(scrapedEvents.id, scrapedEventId))
        .limit(1);

      if (!scraped) {
        console.log(`[Ingestion] Event ${scrapedEventId} not found`);
        return null;
      }

      if (scraped.status !== 'approved') {
        console.log(`[Ingestion] Event ${scrapedEventId} not approved (status: ${scraped.status})`);
        return null;
      }

      const userId = await this.getScraperUserId();
      const eventData = this.mapToEvent(scraped, userId);

      const [inserted] = await db
        .insert(events)
        .values(eventData)
        .returning({ id: events.id });

      // Extract participants from description and create team members
      await this.extractAndCreateTeamMembers(inserted.id, scraped.title, scraped.description);

      // Mark as ingested
      await db
        .update(scrapedEvents)
        .set({ status: 'ingested' })
        .where(eq(scrapedEvents.id, scrapedEventId));

      console.log(`[Ingestion] ✅ Ingested: ${scraped.title} → events.id=${inserted.id}`);
      return inserted.id;
    } catch (error: any) {
      if (error.code === '23505') {
        // Duplicate - already exists, mark as ingested
        await db
          .update(scrapedEvents)
          .set({ status: 'ingested' })
          .where(eq(scrapedEvents.id, scrapedEventId));
        return null;
      }
      console.error(`[Ingestion] Failed for ${scrapedEventId}:`, error.message);
      return null;
    }
  }

  /**
   * Backfill all approved scraped events that haven't been ingested
   */
  async backfillApproved(): Promise<{ ingested: number; failed: number }> {
    console.log('[Ingestion] 🔄 Starting backfill of approved scraped events...');

    const approved = await db
      .select({ id: scrapedEvents.id, title: scrapedEvents.title })
      .from(scrapedEvents)
      .where(eq(scrapedEvents.status, 'approved'));

    console.log(`[Ingestion] Found ${approved.length} approved events to ingest`);

    let ingested = 0;
    let failed = 0;

    for (const event of approved) {
      const result = await this.ingestEvent(event.id);
      if (result) {
        ingested++;
      } else {
        failed++;
      }
    }

    console.log(`[Ingestion] ✅ Backfill complete: ${ingested} ingested, ${failed} skipped/failed`);
    return { ingested, failed };
  }
}

export const scrapedEventIngestionService = new ScrapedEventIngestionService();
