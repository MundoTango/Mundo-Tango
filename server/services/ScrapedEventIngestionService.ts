/**
 * SCRAPED EVENT INGESTION SERVICE
 * Promotes approved scraped_events to the main events table
 * This ensures scraped events appear on /events with full functionality
 */

import { db } from '@shared/db';
import { events, scrapedEvents, users, eventTeamMembers } from '@shared/schema';
import { eq, and, isNull, ilike, or, sql } from 'drizzle-orm';
import { extractParticipants } from './participant-extraction';

const SCRAPER_BOT_USERNAME = 'scraper_bot';

/**
 * Clean HTML entities and normalize text from scraped content
 * Handles: &nbsp; &amp; &quot; numeric entities, etc.
 */
function cleanHtmlEntities(text: string | null | undefined): string | null {
  if (!text) return null;
  
  return text
    // Common HTML entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Fix common scraping artifacts
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim() || null;
}
const SCRAPER_BOT_EMAIL = 'scraper@mundotango.app';

/**
 * Map extraction roles to tangoRoles array values
 */
const TANGO_ROLE_MAP: Record<string, string> = {
  'organizer': 'organizer',
  'co_organizer': 'organizer',
  'dj': 'dj',
  'teacher': 'teacher',
  'performer': 'performer',
  'photographer': 'performer',
  'host': 'organizer'
};

/**
 * Deduplicate names in participant text fields
 * Handles multiple delimiters: comma, semicolon, ampersand
 * Normalizes whitespace and case-folds for comparison
 * E.g., "Paula Crosa, Paula Crosa" -> "Paula Crosa"
 * E.g., "DJ Max; dj max & Other" -> "DJ Max, Other"
 */
function deduplicateParticipantText(text: string | null | undefined): string | null {
  if (!text) return null;
  
  const names = text
    .split(/[,;&]/)
    .map(n => n.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  
  const seen = new Set<string>();
  const unique: string[] = [];
  
  for (const name of names) {
    const normalized = name.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(name);
    }
  }
  
  return unique.length > 0 ? unique.join(', ') : null;
}

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
   * Generate a unique username from a participant name
   * Format: firstname_lastname_N where N is a unique suffix if needed
   */
  private async generateUniqueUsername(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .slice(0, 25);
    
    if (!base) return `tango_artist_${Date.now()}`;
    
    // Check if base username exists
    const [existing] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.username, base))
      .limit(1);
    
    if (!existing) return base;
    
    // Add numeric suffix
    for (let i = 2; i <= 100; i++) {
      const candidate = `${base}_${i}`;
      const [found] = await db
        .select({ username: users.username })
        .from(users)
        .where(eq(users.username, candidate))
        .limit(1);
      
      if (!found) return candidate;
    }
    
    return `${base}_${Date.now()}`;
  }

  /**
   * Create a new user account for an extracted participant
   * These users appear in admin/users and have clickable profiles
   */
  private async createParticipantUser(
    name: string,
    role: string,
    city?: string,
    country?: string
  ): Promise<number> {
    const username = await this.generateUniqueUsername(name);
    const email = `${username}@discovered.mundotango.app`;
    const tangoRole = TANGO_ROLE_MAP[role] || 'performer';
    
    try {
      const [created] = await db
        .insert(users)
        .values({
          name,
          username,
          email,
          password: 'discovered', // Non-functional password - user must claim account
          role: 'user',
          isVerified: false,
          isActive: true,
          tangoRoles: [tangoRole],
          city: city || null,
          country: country || null,
          bio: `Discovered tango ${tangoRole} from event listings. Claim this profile to update your information.`,
        })
        .returning({ id: users.id });
      
      console.log(`[Ingestion] 👤 Created user account: ${name} (@${username}) as ${tangoRole}`);
      return created.id;
    } catch (err: any) {
      // Handle duplicate email (edge case)
      if (err.code === '23505') {
        console.log(`[Ingestion] User already exists for: ${name}`);
        // Try to find existing user
        const [existing] = await db
          .select({ id: users.id })
          .from(users)
          .where(or(
            ilike(users.name, name),
            ilike(users.username, username)
          ))
          .limit(1);
        return existing?.id || 0;
      }
      throw err;
    }
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
   * Cleans HTML entities and normalizes text data
   */
  private mapToEvent(scraped: any, userId: number) {
    const eventType = this.normalizeEventType(scraped.eventType);
    const cleanTitle = cleanHtmlEntities(scraped.title) || 'Untitled Event';
    const cleanDescription = cleanHtmlEntities(scraped.description) || `${eventType} event`;
    
    return {
      title: cleanTitle,
      slug: this.generateSlug(cleanTitle, scraped.id),
      description: cleanDescription,
      eventType,
      category: this.mapCategory(eventType),
      userId,
      startDate: scraped.startDate,
      endDate: scraped.endDate || scraped.startDate,
      location: cleanHtmlEntities(scraped.location) || 'TBA',
      venue: cleanHtmlEntities(scraped.location) || 'TBA',
      address: cleanHtmlEntities(scraped.address || scraped.location) || '',
      city: cleanHtmlEntities(this.extractCity(scraped)) || 'Unknown',
      country: this.extractCountry(scraped),
      latitude: scraped.latitude ? String(scraped.latitude) : null,
      longitude: scraped.longitude ? String(scraped.longitude) : null,
      status: 'published' as const,
      groupId: scraped.groupId,
      imageUrl: scraped.imageUrl || null,
      coverImage: scraped.imageUrl || null,
      sourceUrl: scraped.sourceUrl,
      sourceName: scraped.sourceName,
      price: cleanHtmlEntities(scraped.price),
      isOnline: false,
      isFree: this.isPriceFree(scraped.price),
      isPaid: !this.isPriceFree(scraped.price),
      djText: deduplicateParticipantText(cleanHtmlEntities(scraped.djText)),
      teacherText: deduplicateParticipantText(cleanHtmlEntities(scraped.teacherText)),
      performerText: deduplicateParticipantText(cleanHtmlEntities(scraped.performerText)),
      organizerText: deduplicateParticipantText(cleanHtmlEntities(scraped.organizerText))
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
   * Address format: "Street Address, City, Country" - extract middle part
   */
  private extractCity(scraped: any): string {
    if (scraped.city && scraped.city !== 'Various') return scraped.city;
    if (scraped.address) {
      const parts = scraped.address.split(',').map((p: string) => p.trim());
      // Format: "Street Address, City, Country" - take middle part
      if (parts.length >= 3) return parts[parts.length - 2];
      if (parts.length === 2) return parts[0];
    }
    return scraped.location || 'Unknown';
  }

  /**
   * Extract and normalize country from scraped event
   */
  private extractCountry(scraped: any): string {
    let country = 'Unknown';
    if (scraped.country && scraped.country !== 'Various') {
      country = scraped.country;
    } else if (scraped.address) {
      const parts = scraped.address.split(',');
      if (parts.length > 1) country = parts[parts.length - 1].trim();
    }
    return this.normalizeCountryName(country);
  }

  /**
   * Normalize country names to canonical English spelling
   */
  private normalizeCountryName(country: string): string {
    const normalized = country.trim();
    const countryMap: Record<string, string> = {
      // French/Spanish variants
      'argentine': 'Argentina',
      'brésil': 'Brazil',
      'brasil': 'Brazil',
      'allemagne': 'Germany',
      'alemania': 'Germany',
      'espagne': 'Spain',
      'españa': 'Spain',
      'états-unis': 'United States',
      'estados unidos': 'United States',
      'royaume-uni': 'United Kingdom',
      'reino unido': 'United Kingdom',
      'pays-bas': 'Netherlands',
      'países bajos': 'Netherlands',
      'grèce': 'Greece',
      'grecia': 'Greece',
      'turquie': 'Turkey',
      'turquía': 'Turkey',
      'italie': 'Italy',
      'italia': 'Italy',
      'pologne': 'Poland',
      'polonia': 'Poland',
      'russie': 'Russia',
      'rusia': 'Russia',
      'japon': 'Japan',
      'japón': 'Japan',
      'chine': 'China',
      'corée du sud': 'South Korea',
      'corea del sur': 'South Korea',
    };
    return countryMap[normalized.toLowerCase()] || normalized;
  }

  /**
   * Extract participants from event description and create team members
   * NEW: Creates actual user accounts for discovered participants (visible in admin/users)
   */
  private async extractAndCreateTeamMembers(
    eventId: number, 
    title: string, 
    description: string | null,
    city?: string,
    country?: string
  ): Promise<void> {
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
        let userId: number | null = null;

        try {
          // Check if we have an existing match
          if (typeof participant.matchedUserId === 'number' && participant.matchedUserId > 0) {
            userId = participant.matchedUserId;
            console.log(`[Ingestion]   ✓ ${participant.name} (${role}) → matched user ${userId}`);
          } else {
            // CREATE NEW USER ACCOUNT for discovered participant
            // This makes them visible in admin/users with clickable profiles
            userId = await this.createParticipantUser(
              participant.name,
              participant.role,
              city,
              country
            );
            
            if (userId > 0) {
              console.log(`[Ingestion]   + ${participant.name} (${role}) → NEW user ${userId}`);
            }
          }
          
          // Create team member entry with user link
          const teamMemberData: any = {
            eventId,
            role,
            displayName: participant.name,
            rawText: participant.sourceText,
            confidence: participant.confidence,
            source: 'scraped'
          };
          
          if (userId && userId > 0) {
            teamMemberData.userId = userId;
          }
          
          await db.insert(eventTeamMembers).values(teamMemberData);
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

      // Allow all scraped events except rejected ones (immediate visibility without approval)
      if (scraped.status === 'rejected') {
        console.log(`[Ingestion] Event ${scrapedEventId} rejected, skipping`);
        return null;
      }

      const userId = await this.getScraperUserId();
      const eventData = this.mapToEvent(scraped, userId);

      const [inserted] = await db
        .insert(events)
        .values(eventData)
        .returning({ id: events.id });

      // Extract participants from description and create team members + user accounts
      await this.extractAndCreateTeamMembers(
        inserted.id, 
        scraped.title, 
        scraped.description,
        eventData.city || undefined,
        eventData.country || undefined
      );

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
   * Backfill all scraped events that haven't been ingested (except rejected)
   */
  async backfillApproved(): Promise<{ ingested: number; failed: number }> {
    console.log('[Ingestion] 🔄 Starting backfill of scraped events...');

    const toIngest = await db
      .select({ id: scrapedEvents.id, title: scrapedEvents.title })
      .from(scrapedEvents)
      .where(and(
        sql`${scrapedEvents.status} != 'rejected'`,
        sql`${scrapedEvents.status} != 'ingested'`
      ));

    console.log(`[Ingestion] Found ${toIngest.length} events to ingest`);

    let ingested = 0;
    let failed = 0;

    for (const event of toIngest) {
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
