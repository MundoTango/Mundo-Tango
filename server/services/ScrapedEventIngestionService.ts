/**
 * SCRAPED EVENT INGESTION SERVICE
 * Promotes approved scraped_events to the main events table
 * This ensures scraped events appear on /events with full functionality
 */

import { db } from '@shared/db';
import { events, scrapedEvents, users, eventTeamMembers, groups } from '@shared/schema';
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
   * Look up the city group ID by city and country
   * Returns the matching group ID or null if no match found
   */
  private async resolveCityGroupId(city: string | null, country: string | null): Promise<number | null> {
    if (!city) return null;
    
    // Skip placeholder city values
    const placeholders = ['unknown', 'tba', 'various', 'online', 'virtual', 'tbd', 'n/a'];
    if (placeholders.includes(city.toLowerCase().trim())) {
      return null;
    }

    try {
      // First try exact city match with type='city'
      const [exactMatch] = await db
        .select({ id: groups.id })
        .from(groups)
        .where(and(
          eq(groups.type, 'city'),
          ilike(groups.city, city)
        ))
        .limit(1);

      if (exactMatch) {
        return exactMatch.id;
      }

      // Try matching with country too for more precision
      if (country) {
        const [countryMatch] = await db
          .select({ id: groups.id })
          .from(groups)
          .where(and(
            eq(groups.type, 'city'),
            ilike(groups.city, city),
            ilike(groups.country, country)
          ))
          .limit(1);

        if (countryMatch) {
          return countryMatch.id;
        }
      }

      // Try fuzzy match on group name (e.g., "Buenos Aires Tango Community")
      const [nameMatch] = await db
        .select({ id: groups.id })
        .from(groups)
        .where(and(
          eq(groups.type, 'city'),
          ilike(groups.name, `%${city}%`)
        ))
        .limit(1);

      return nameMatch?.id || null;
    } catch (error) {
      console.warn(`[Ingestion] Failed to resolve group for ${city}:`, error);
      return null;
    }
  }

  /**
   * Map scraped event to events table format
   * Cleans HTML entities and normalizes text data
   * Now accepts optional resolved groupId parameter
   */
  private mapToEvent(scraped: any, userId: number, resolvedGroupId?: number | null) {
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
      city: cleanHtmlEntities(this.extractCity(scraped)) || null,
      country: this.extractCountry(scraped),
      latitude: scraped.latitude ? String(scraped.latitude) : null,
      longitude: scraped.longitude ? String(scraped.longitude) : null,
      status: 'published' as const,
      groupId: resolvedGroupId ?? scraped.groupId ?? null,
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
    return scraped.location || null;
  }

  /**
   * Extract and normalize country from scraped event
   */
  private extractCountry(scraped: any): string | null {
    let country: string | null = null;
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
  private normalizeCountryName(country: string | null): string | null {
    if (!country) return null;
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
   * Ensure a city group exists for the event's city
   * Auto-creates the group if it doesn't exist WITH GEOCODING
   * Skips placeholder values like "Unknown", "TBA", "Various"
   */
  private async ensureCityGroup(city: string | null, country: string | null): Promise<void> {
    if (!city) return;
    
    // Skip placeholder city values
    const placeholders = ['unknown', 'tba', 'various', 'online', 'virtual', 'tbd', 'n/a'];
    if (placeholders.includes(city.toLowerCase().trim())) {
      return;
    }

    try {
      // Check if city group already exists
      const [existing] = await db
        .select({ id: groups.id })
        .from(groups)
        .where(and(
          eq(groups.type, 'city'),
          ilike(groups.city, city)
        ))
        .limit(1);

      if (existing) return;

      // Generate slug
      const slug = city.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-tango';

      // Geocode the city BEFORE creating the group
      let latitude: string | null = null;
      let longitude: string | null = null;
      
      try {
        const { geocodingService } = await import('./GeocodingService');
        const geocodeResult = await geocodingService.geocodeCity(city, country || undefined);
        if (geocodeResult) {
          latitude = String(geocodeResult.lat);
          longitude = String(geocodeResult.lng);
          console.log(`[Ingestion] 📍 Geocoded ${city}: (${latitude}, ${longitude})`);
        }
      } catch (geoError) {
        console.warn(`[Ingestion] Geocoding failed for ${city}:`, geoError);
      }

      // Create city group WITH coordinates
      await db.insert(groups).values({
        name: `${city} Tango Community`,
        slug,
        city,
        country: country || null,
        type: 'city',
        description: `Discover tango in ${city}${country ? ` in ${country}` : ''}. Connect with dancers who share your passion for Argentine tango.`,
        visibility: 'public',
        isPrivate: false,
        joinApproval: false,
        eventCount: 1,
        latitude,
        longitude,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`[Ingestion] 🏙️ Auto-created city group: ${city} with coords: (${latitude}, ${longitude})`);
    } catch (error: any) {
      // Ignore duplicate key errors (race condition)
      if (error.code !== '23505') {
        console.warn(`[Ingestion] Failed to create city group for ${city}:`, error.message);
      }
    }
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
   * Uses transaction to ensure atomicity - if any core operation fails, all are rolled back
   */
  async ingestEvent(scrapedEventId: number): Promise<{ eventId: number } | null> {
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
      
      // Extract city/country from scraped event
      const city = cleanHtmlEntities(this.extractCity(scraped));
      const country = this.extractCountry(scraped);
      
      // Resolve group ID by city/country lookup (if not already set)
      let resolvedGroupId = scraped.groupId;
      if (!resolvedGroupId && city) {
        // First ensure the city group exists
        await this.ensureCityGroup(city, country);
        // Then look up its ID
        resolvedGroupId = await this.resolveCityGroupId(city, country);
        if (resolvedGroupId) {
          console.log(`[Ingestion] 🔗 Resolved ${city} → group ${resolvedGroupId}`);
        }
      }
      
      const eventData = this.mapToEvent(scraped, userId, resolvedGroupId);

      // Insert event (no transaction - Neon HTTP driver doesn't support them)
      const [inserted] = await db
        .insert(events)
        .values(eventData)
        .returning({ id: events.id });

      // Mark as ingested
      await db
        .update(scrapedEvents)
        .set({ status: 'ingested' })
        .where(eq(scrapedEvents.id, scrapedEventId));

      const result = { eventId: inserted.id };

      // Team member extraction is non-critical - done outside transaction
      // If this fails, the event is still ingested, just without team links
      try {
        await this.extractAndCreateTeamMembers(
          result.eventId, 
          scraped.title, 
          scraped.description,
          eventData.city || undefined,
          eventData.country || undefined
        );
      } catch (teamError) {
        console.warn(`[Ingestion] Team member extraction failed for event ${result.eventId}, continuing anyway`);
      }

      console.log(`[Ingestion] ✅ Ingested: ${scraped.title} → events.id=${result.eventId}${resolvedGroupId ? ` (group ${resolvedGroupId})` : ''}`);
      return result;
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
      throw error; // Re-throw so caller can handle appropriately
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
      try {
        const result = await this.ingestEvent(event.id);
        if (result && result.eventId) {
          ingested++;
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
      }
    }

    console.log(`[Ingestion] ✅ Backfill complete: ${ingested} ingested, ${failed} skipped/failed`);
    return { ingested, failed };
  }

  /**
   * Backfill group_id for existing orphan events in the events table
   * Matches events without group_id to city groups by city/country
   */
  async backfillOrphanEvents(): Promise<{ updated: number; skipped: number }> {
    console.log('[Ingestion] 🔄 Starting orphan event groupId backfill...');

    // Find all events without a group_id that have a city
    const orphanEvents = await db
      .select({ 
        id: events.id, 
        title: events.title,
        city: events.city, 
        country: events.country 
      })
      .from(events)
      .where(and(
        isNull(events.groupId),
        sql`${events.city} IS NOT NULL`,
        sql`${events.city} != ''`
      ));

    console.log(`[Ingestion] Found ${orphanEvents.length} orphan events to process`);

    let updated = 0;
    let skipped = 0;

    for (const event of orphanEvents) {
      try {
        // First ensure the city group exists
        await this.ensureCityGroup(event.city, event.country);
        
        // Resolve the group ID
        const groupId = await this.resolveCityGroupId(event.city, event.country);
        
        if (groupId) {
          await db
            .update(events)
            .set({ groupId })
            .where(eq(events.id, event.id));
          
          updated++;
          if (updated % 50 === 0) {
            console.log(`[Ingestion] Progress: ${updated} events updated...`);
          }
        } else {
          skipped++;
        }
      } catch (err) {
        skipped++;
      }
    }

    console.log(`[Ingestion] ✅ Orphan backfill complete: ${updated} updated, ${skipped} skipped`);
    return { updated, skipped };
  }

  /**
   * Sync cover images from events to groups
   * For groups without cover images, use the best event image from their events
   */
  async syncGroupCoverImages(): Promise<{ updated: number }> {
    console.log('[Ingestion] 🔄 Syncing cover images to groups...');

    // Find groups without cover images that have events with images
    const groupsNeedingImages = await db.execute(sql`
      SELECT DISTINCT g.id as group_id, g.name, g.city,
        (SELECT e.cover_image 
         FROM events e 
         WHERE e.group_id = g.id 
           AND e.cover_image IS NOT NULL 
           AND e.cover_image != ''
         ORDER BY e.start_date DESC
         LIMIT 1
        ) as best_image
      FROM groups g
      WHERE g.type = 'city'
        AND (g.cover_image IS NULL OR g.cover_image = '')
        AND EXISTS (
          SELECT 1 FROM events e 
          WHERE e.group_id = g.id 
            AND e.cover_image IS NOT NULL 
            AND e.cover_image != ''
        )
    `);

    let updated = 0;

    for (const row of groupsNeedingImages.rows as any[]) {
      if (row.best_image) {
        await db
          .update(groups)
          .set({ coverImage: row.best_image })
          .where(eq(groups.id, row.group_id));
        
        console.log(`[Ingestion] 🖼️ Updated cover for ${row.city || row.name}`);
        updated++;
      }
    }

    console.log(`[Ingestion] ✅ Cover image sync complete: ${updated} groups updated`);
    return { updated };
  }

  /**
   * Update event counts for all city groups based on actual event data
   */
  async updateGroupEventCounts(): Promise<{ updated: number }> {
    console.log('[Ingestion] 🔄 Updating group event counts...');

    const result = await db.execute(sql`
      UPDATE groups g
      SET event_count = (
        SELECT COUNT(*) 
        FROM events e 
        WHERE e.group_id = g.id 
          AND e.start_date >= NOW()
      )
      WHERE g.type = 'city'
    `);

    console.log(`[Ingestion] ✅ Event counts updated for all city groups`);
    return { updated: result.rowCount || 0 };
  }
}

export const scrapedEventIngestionService = new ScrapedEventIngestionService();
