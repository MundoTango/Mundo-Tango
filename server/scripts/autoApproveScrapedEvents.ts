/**
 * MB.MD Auto-Approval Script v2
 * 
 * Enhanced script that:
 * 1. Deduplicates events across multiple sources (same event on different websites)
 * 2. Tracks ALL sources where an event appears
 * 3. Extracts participants (organizers, DJs, teachers, performers)
 * 4. Creates event_participants records for profile matching
 * 5. Creates city groups for events
 * 
 * Protocol: Replit AI → Mr. Blue → AGENT_SCRAPE_1
 */

import { db } from '@shared/db';
import { scrapedEvents, events, groups, eventScrapingSources, scrapedProfiles, eventSeries } from '@shared/schema';
import { eventParticipants } from '@shared/eventRolesSchemas';
import { eq, sql, and, ilike, desc, gte, lte } from 'drizzle-orm';
import { getCityscapeImage } from '../algorithms/cityCityscape';
import { extractParticipants, createScrapedProfile, type ExtractedParticipant } from '../services/participant-extraction';

interface ScrapedEvent {
  id: number;
  sourceUrl: string;
  sourceName: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  address: string | null;
  organizer: string | null;
  price: string | null;
  imageUrl: string | null;
  externalId: string | null;
  status: string;
}

interface SourceInfo {
  url: string;
  name: string;
  scrapedAt: string;
  externalId?: string;
}

// Extract city from location string
function extractCity(location: string | null): string {
  if (!location) return 'Unknown';
  
  const parts = location.split(',').map(p => p.trim());
  
  const knownCities = [
    'Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide',
    'Buenos Aires', 'New York', 'London', 'Paris', 'Berlin',
    'Tokyo', 'Barcelona', 'Amsterdam', 'Toronto', 'Los Angeles',
    'San Francisco', 'Chicago', 'Miami', 'Austin', 'Seattle',
    'Canberra', 'Hobart', 'Darwin', 'Geelong', 'Newcastle'
  ];
  
  for (const part of parts) {
    for (const city of knownCities) {
      if (part.toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
  }
  
  if (location.toLowerCase().includes('melbourne')) return 'Melbourne';
  if (location.toLowerCase().includes('sydney')) return 'Sydney';
  if (location.toLowerCase().includes('buenos aires')) return 'Buenos Aires';
  
  return parts[0] || 'Unknown';
}

// Get or create city group
async function getOrCreateCityGroup(cityName: string): Promise<number> {
  const existing = await db.query.groups.findFirst({
    where: and(
      eq(groups.type, 'city'),
      sql`LOWER(${groups.city}) = LOWER(${cityName})`
    )
  });
  
  if (existing) {
    return existing.id;
  }
  
  console.log(`[MB.MD] Creating new city group: ${cityName}`);
  
  const coverImage = getCityscapeImage(cityName).url;
  const slug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const [newGroup] = await db.insert(groups).values({
    name: cityName,
    slug: slug,
    description: `Connect with tango dancers in ${cityName}. Share events, find milongas, and grow the local tango community.`,
    type: 'city',
    city: cityName,
    coverImage: coverImage,
    isPublic: true,
    memberCount: 0,
    createdById: 1,
  }).returning();
  
  console.log(`[MB.MD] Created city group: ${cityName} (ID: ${newGroup.id})`);
  return newGroup.id;
}

// Parse price from string
function parsePrice(priceStr: string | null): number | null {
  if (!priceStr) return null;
  const match = priceStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

/**
 * Comprehensive Event Type Detection
 */
function detectEventType(title: string, description: string | null): string {
  const titleLower = title.toLowerCase();
  const descLower = (description || '').toLowerCase();
  const combined = `${titleLower} ${descLower}`;
  
  if (/festival|tango\s*week|tango\s*weekend/i.test(combined)) return 'festival';
  if (/marathon|maratón|marath[oó]n/i.test(combined)) return 'marathon';
  if (/encuentro|encounter/i.test(combined)) return 'festival';
  if (/circuit|circuito/i.test(combined)) return 'festival';
  if (/competition|championship|contest|campeonato|mundial|concurso/i.test(combined)) return 'competition';
  if (/show\b|shows\b|performance|perform|exhibition|exhibición|gala|concert|concierto/i.test(combined)) return 'performance';
  if (/demo\b|demonstration|showcase/i.test(combined)) return 'performance';
  if (/\bclass\b|\bclasses\b|\blesson\b|\blessons\b/i.test(titleLower)) return 'class';
  if (/level\s*\d|level\s*(one|two|three|1|2|3|i|ii|iii)/i.test(titleLower)) return 'class';
  if (/\bbeginner\b|\bintermediate\b|\badvanced\b|\bfundamentals\b/i.test(titleLower)) return 'class';
  if (/workshop|masterclass|master\s*class|intensive|bootcamp|course|seminar|clinic/i.test(titleLower)) return 'workshop';
  if (/choreography|footwork|musicality|embrace|navigation|technique|tango\s*lab/i.test(titleLower)) return 'workshop';
  if (/practica|práctica|practice|pract-ilonga|practilonga/i.test(titleLower)) return 'practica';
  if (/online|virtual|zoom|webinar|livestream|live\s*stream|streaming/i.test(combined)) return 'online';
  if (/social\s*event|dinner|lunch|brunch|picnic|meetup|meet-up|gathering|party\b(?!.*milonga)/i.test(combined)) return 'social';
  if (/milonga/i.test(titleLower)) return 'milonga';
  if (/baile|dance\s*night|tango\s*night|friday|saturday|sunday|monday|tuesday|wednesday|thursday/i.test(titleLower)) {
    if (!/class|lesson|workshop|course/i.test(titleLower)) return 'milonga';
  }
  
  return 'milonga';
}

/**
 * Normalize title for duplicate detection
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Find existing event by title and date (fuzzy match)
 */
async function findExistingEvent(title: string, startDate: Date): Promise<{ id: number; sourceUrl: string | null } | null> {
  const normalizedTitle = normalizeTitle(title);
  
  // First try exact match
  const exactMatch = await db.query.events.findFirst({
    where: and(
      sql`LOWER(${events.title}) = LOWER(${title})`,
      eq(events.startDate, startDate)
    )
  });
  
  if (exactMatch) {
    return { id: exactMatch.id, sourceUrl: exactMatch.sourceUrl };
  }
  
  // Try fuzzy match on same day
  const sameDayEvents = await db.query.events.findMany({
    where: eq(events.startDate, startDate)
  });
  
  for (const event of sameDayEvents) {
    const existingNormalized = normalizeTitle(event.title);
    
    // Check if titles are similar (>80% overlap)
    if (existingNormalized === normalizedTitle) {
      return { id: event.id, sourceUrl: event.sourceUrl };
    }
    
    // Check if one contains the other
    if (existingNormalized.includes(normalizedTitle) || normalizedTitle.includes(existingNormalized)) {
      return { id: event.id, sourceUrl: event.sourceUrl };
    }
  }
  
  return null;
}

/**
 * Parse existing sources from sourceUrl field
 */
function parseSources(sourceUrl: string | null): SourceInfo[] {
  if (!sourceUrl) return [];
  
  try {
    // Try to parse as JSON array
    if (sourceUrl.startsWith('[')) {
      return JSON.parse(sourceUrl);
    }
    // Single URL - convert to array format
    return [{ url: sourceUrl, name: 'Unknown', scrapedAt: new Date().toISOString() }];
  } catch {
    return [{ url: sourceUrl, name: 'Unknown', scrapedAt: new Date().toISOString() }];
  }
}

/**
 * Merge sources - add new source if not already present
 */
function mergeSources(existing: SourceInfo[], newSource: SourceInfo): SourceInfo[] {
  // Check if this source URL already exists
  const existingUrls = existing.map(s => s.url.toLowerCase());
  if (existingUrls.includes(newSource.url.toLowerCase())) {
    return existing;
  }
  return [...existing, newSource];
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday) - UTC based for consistency
 */
function getDayOfWeek(date: Date): number {
  return date.getUTCDay();
}

/**
 * Get day of month (1-31)
 */
function getDayOfMonth(date: Date): number {
  return date.getDate();
}

/**
 * Detect recurrence pattern from a list of dates
 * Returns 'weekly' if events occur on the same day of week
 * Returns 'monthly' if events occur on the same day of month
 * Returns 'yearly' if events occur on the same date each year
 * Returns null if no pattern is detected
 */
function detectRecurrencePattern(dates: Date[]): 'weekly' | 'monthly' | 'yearly' | null {
  if (dates.length < 2) {
    return null;
  }

  // Sort dates chronologically
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());

  // Check for weekly pattern (same day of week)
  const daysOfWeek = sortedDates.map(d => getDayOfWeek(d));
  const uniqueDaysOfWeek = new Set(daysOfWeek);
  if (uniqueDaysOfWeek.size === 1) {
    // All events are on the same day of week - likely weekly
    // Verify by checking date differences
    const dayDiffs: number[] = [];
    for (let i = 1; i < sortedDates.length; i++) {
      const diffDays = Math.round((sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24));
      dayDiffs.push(diffDays);
    }
    // If most differences are ~7 days (allow for 1-2 day variance), it's weekly
    const weeklyDiffs = dayDiffs.filter(d => d >= 5 && d <= 9);
    if (weeklyDiffs.length >= dayDiffs.length * 0.7) {
      return 'weekly';
    }
  }

  // Check for monthly pattern (same day of month, roughly 28-31 days apart)
  const daysOfMonth = sortedDates.map(d => getDayOfMonth(d));
  const uniqueDaysOfMonth = new Set(daysOfMonth);
  if (uniqueDaysOfMonth.size === 1 || uniqueDaysOfMonth.size <= 2) {
    // Same or very close day of month
    const dayDiffs: number[] = [];
    for (let i = 1; i < sortedDates.length; i++) {
      const diffDays = Math.round((sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24));
      dayDiffs.push(diffDays);
    }
    // Monthly should have differences around 28-31 days
    const monthlyDiffs = dayDiffs.filter(d => d >= 26 && d <= 35);
    if (monthlyDiffs.length >= dayDiffs.length * 0.6) {
      return 'monthly';
    }
  }

  // Check for yearly pattern
  const monthDayPairs = sortedDates.map(d => `${d.getMonth()}-${d.getDate()}`);
  const uniquePairs = new Set(monthDayPairs);
  if (uniquePairs.size === 1) {
    return 'yearly';
  }

  // Default to weekly if same day of week (most common for milongas)
  if (uniqueDaysOfWeek.size === 1) {
    return 'weekly';
  }

  return null;
}

/**
 * Generate a slug from a name
 */
function generateSeriesSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Find existing series by normalized name and venue/location
 */
async function findExistingSeries(
  normalizedName: string, 
  city: string, 
  venueAddress: string | null
): Promise<{ id: number; name: string } | null> {
  // Try to find by similar name and city
  const seriesList = await db.query.eventSeries.findMany({
    where: and(
      eq(eventSeries.isActive, true),
      sql`LOWER(${eventSeries.city}) = LOWER(${city})`
    ),
    limit: 50
  });

  for (const series of seriesList) {
    const existingNormalized = normalizeTitle(series.name);
    // Exact match or one contains the other
    if (existingNormalized === normalizedName || 
        existingNormalized.includes(normalizedName) || 
        normalizedName.includes(existingNormalized)) {
      return { id: series.id, name: series.name };
    }
  }

  return null;
}

/**
 * Create or find an event series based on event data
 * Returns the series ID
 */
async function createOrFindSeries(
  eventTitle: string,
  city: string,
  venueAddress: string | null,
  recurrenceType: 'weekly' | 'monthly' | 'yearly',
  recurrenceDay: number,
  organizerText: string | null
): Promise<number> {
  const normalizedName = normalizeTitle(eventTitle);
  
  // Check for existing series
  const existingSeries = await findExistingSeries(normalizedName, city, venueAddress);
  if (existingSeries) {
    console.log(`[MB.MD] Found existing series: ${existingSeries.name} (ID: ${existingSeries.id})`);
    return existingSeries.id;
  }

  // Create new series
  const slug = generateSeriesSlug(eventTitle);
  
  // Check if slug already exists and make unique if needed
  const existingSlug = await db.query.eventSeries.findFirst({
    where: eq(eventSeries.slug, slug)
  });
  
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  const [newSeries] = await db.insert(eventSeries).values({
    name: eventTitle,
    slug: finalSlug,
    description: `Recurring ${recurrenceType} tango event in ${city}`,
    recurrenceType: recurrenceType,
    recurrenceDay: recurrenceDay,
    city: city,
    isClaimed: false,
    isActive: true
  }).returning();

  console.log(`[MB.MD] Created new event series: ${eventTitle} (ID: ${newSeries.id}, ${recurrenceType})`);
  return newSeries.id;
}

/**
 * Find events with similar title in same location to detect series patterns
 */
async function findEventsWithSimilarTitle(
  title: string,
  city: string,
  excludeEventId?: number
): Promise<{ id: number; title: string; startDate: Date; seriesId: number | null; location: string | null }[]> {
  const normalizedTitle = normalizeTitle(title);
  
  // Find events in the same city
  const cityEvents = await db.query.events.findMany({
    where: and(
      sql`LOWER(${events.city}) = LOWER(${city})`,
      excludeEventId ? sql`${events.id} != ${excludeEventId}` : sql`1=1`
    ),
    orderBy: desc(events.startDate),
    limit: 100
  });

  // Filter to events with similar titles
  return cityEvents.filter(event => {
    const existingNormalized = normalizeTitle(event.title);
    return existingNormalized === normalizedTitle || 
           existingNormalized.includes(normalizedTitle) || 
           normalizedTitle.includes(existingNormalized);
  }).map(e => ({
    id: e.id,
    title: e.title,
    startDate: e.startDate,
    seriesId: e.seriesId,
    location: e.location
  }));
}

/**
 * Check and create series for events with same venue + same day of week pattern
 */
async function checkAndCreateSeries(
  eventId: number,
  eventTitle: string,
  eventStartDate: Date,
  city: string,
  location: string | null,
  organizerText: string | null
): Promise<number | null> {
  // Find similar events
  const similarEvents = await findEventsWithSimilarTitle(eventTitle, city, eventId);
  
  if (similarEvents.length === 0) {
    return null;
  }

  // Check if any already have a series
  const existingSeriesId = similarEvents.find(e => e.seriesId !== null)?.seriesId;
  if (existingSeriesId) {
    console.log(`[MB.MD] Found existing series ID ${existingSeriesId} for similar event`);
    return existingSeriesId;
  }

  // Collect all dates including the current event
  const allDates = [eventStartDate, ...similarEvents.map(e => e.startDate)];
  
  // Detect recurrence pattern
  const recurrenceType = detectRecurrencePattern(allDates);
  
  if (!recurrenceType) {
    console.log(`[MB.MD] No recurrence pattern detected for ${eventTitle}`);
    return null;
  }

  // Get recurrence day based on pattern type
  const recurrenceDay = recurrenceType === 'weekly' 
    ? getDayOfWeek(eventStartDate)
    : getDayOfMonth(eventStartDate);

  // Create or find the series
  const seriesId = await createOrFindSeries(
    eventTitle,
    city,
    location,
    recurrenceType,
    recurrenceDay,
    organizerText
  );

  // Update all similar events to belong to this series
  for (const similarEvent of similarEvents) {
    if (!similarEvent.seriesId) {
      await db.update(events)
        .set({ seriesId: seriesId, updatedAt: new Date() })
        .where(eq(events.id, similarEvent.id));
      console.log(`[MB.MD] Linked event ${similarEvent.id} to series ${seriesId}`);
    }
  }

  return seriesId;
}

/**
 * Create event participants from extracted data
 */
async function createEventParticipants(
  eventId: number, 
  participants: ExtractedParticipant[],
  sourceId: number | null
): Promise<number> {
  let created = 0;
  
  // Valid roles in the enum
  const validRoles = ['organizer', 'co_organizer', 'dj', 'teacher', 'performer', 'photographer', 'volunteer', 'host', 'sponsor', 'attendee'] as const;
  type ValidRole = typeof validRoles[number];
  
  for (const participant of participants) {
    try {
      // Create or get scraped profile
      let profileId: number | undefined;
      if (!participant.matchedUserId) {
        profileId = await createScrapedProfile(
          participant.name,
          participant.role,
          sourceId,
          participant.socialLinks
        );
      }
      
      // Map role to valid event role enum value
      const roleMap: Record<string, ValidRole> = {
        'organizer': 'organizer',
        'co_organizer': 'co_organizer',
        'dj': 'dj',
        'teacher': 'teacher',
        'performer': 'performer',
        'photographer': 'photographer',
        'host': 'host',
        'assistant_teacher': 'teacher',
        'special_guest': 'performer',
        'volunteer': 'volunteer'
      };
      
      const eventRole: ValidRole = roleMap[participant.role] || 'attendee';
      
      // Check if participant already exists for this event by name
      const existing = await db
        .select()
        .from(eventParticipants)
        .where(
          and(
            eq(eventParticipants.eventId, eventId),
            ilike(eventParticipants.displayName, participant.name)
          )
        )
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(eventParticipants).values({
          eventId,
          userId: participant.matchedUserId || null,
          scrapedProfileId: profileId || null,
          role: eventRole,
          displayName: participant.name,
          status: 'confirmed',
          notes: participant.sourceText,
          isPubliclyListed: true,
          displayOrder: participant.role === 'organizer' ? 0 : 10
        });
        created++;
      }
    } catch (error) {
      console.error(`[MB.MD] Error creating participant ${participant.name}:`, error);
    }
  }
  
  return created;
}

/**
 * Convert scraped event to real event (or merge if duplicate)
 */
async function processScrapedEvent(
  scraped: ScrapedEvent, 
  cityGroupId: number
): Promise<{ action: 'created' | 'merged' | 'error'; eventId?: number }> {
  const city = extractCity(scraped.location);
  
  // Check for existing event
  const existingEvent = await findExistingEvent(scraped.title, scraped.startDate);
  
  const newSource: SourceInfo = {
    url: scraped.sourceUrl,
    name: scraped.sourceName,
    scrapedAt: new Date().toISOString(),
    externalId: scraped.externalId || undefined
  };
  
  // Extract participants from description
  const extraction = await extractParticipants(
    scraped.title,
    scraped.description,
    scraped.organizer
  );
  
  if (existingEvent) {
    // DUPLICATE FOUND - Merge sources
    console.log(`[MB.MD] Merging source for: ${scraped.title}`);
    
    const existingSources = parseSources(existingEvent.sourceUrl);
    const mergedSources = mergeSources(existingSources, newSource);
    
    // Check and create series for duplicate events (same venue + same day of week pattern)
    // This is a key indicator that events belong to a recurring series
    const seriesId = await checkAndCreateSeries(
      existingEvent.id,
      scraped.title,
      scraped.startDate,
      city,
      scraped.location,
      extraction.organizerText
    );
    
    // Update event with merged sources and series_id if detected
    const updateData: { sourceUrl: string; updatedAt: Date; seriesId?: number } = {
      sourceUrl: JSON.stringify(mergedSources),
      updatedAt: new Date()
    };
    
    if (seriesId) {
      updateData.seriesId = seriesId;
      console.log(`[MB.MD] Linked merged event ${existingEvent.id} to series ${seriesId}`);
    }
    
    await db.update(events)
      .set(updateData)
      .where(eq(events.id, existingEvent.id));
    
    // Add any new participants
    await createEventParticipants(existingEvent.id, extraction.participants, null);
    
    // Mark scraped event as merged
    await db.update(scrapedEvents)
      .set({ status: 'merged' })
      .where(eq(scrapedEvents.id, scraped.id));
    
    return { action: 'merged', eventId: existingEvent.id };
  }
  
  // NEW EVENT - Create it
  const eventType = detectEventType(scraped.title, scraped.description);
  
  // Check if there's an existing series this event should belong to
  // (This catches events that match previously created series patterns)
  const similarEvents = await findEventsWithSimilarTitle(scraped.title, city);
  let initialSeriesId: number | null = null;
  
  if (similarEvents.length > 0) {
    // Check if any similar events already have a series
    const existingSeriesEvent = similarEvents.find(e => e.seriesId !== null);
    if (existingSeriesEvent?.seriesId) {
      initialSeriesId = existingSeriesEvent.seriesId;
      console.log(`[MB.MD] New event matches existing series ${initialSeriesId}`);
    } else {
      // Check for recurrence pattern
      const allDates = [scraped.startDate, ...similarEvents.map(e => e.startDate)];
      const recurrenceType = detectRecurrencePattern(allDates);
      
      if (recurrenceType) {
        const recurrenceDay = recurrenceType === 'weekly' 
          ? getDayOfWeek(scraped.startDate)
          : getDayOfMonth(scraped.startDate);
          
        initialSeriesId = await createOrFindSeries(
          scraped.title,
          city,
          scraped.location,
          recurrenceType,
          recurrenceDay,
          extraction.organizerText
        );
        
        // Link all similar events to this series
        for (const similar of similarEvents) {
          if (!similar.seriesId) {
            await db.update(events)
              .set({ seriesId: initialSeriesId, updatedAt: new Date() })
              .where(eq(events.id, similar.id));
            console.log(`[MB.MD] Linked existing event ${similar.id} to new series ${initialSeriesId}`);
          }
        }
      }
    }
  }
  
  const [newEvent] = await db.insert(events).values({
    title: scraped.title,
    description: scraped.description || `${scraped.title} - Tango event in ${city}`,
    startDate: scraped.startDate,
    endDate: scraped.endDate || scraped.startDate,
    location: scraped.location || city,
    address: scraped.address,
    city: city,
    userId: 1,
    eventType: eventType,
    status: 'published',
    isPublic: true,
    price: parsePrice(scraped.price),
    imageUrl: scraped.imageUrl,
    groupId: cityGroupId,
    websiteUrl: scraped.sourceUrl,
    ticketUrl: scraped.sourceUrl,
    // New source tracking fields
    sourceName: scraped.sourceName,
    sourceUrl: JSON.stringify([newSource]),
    externalSourceId: scraped.externalId,
    scrapedEventId: scraped.id,
    // Participant text fields
    organizerText: extraction.organizerText,
    djText: extraction.djText,
    teacherText: extraction.teacherText,
    performerText: extraction.performerText,
    // Metadata
    musicStyle: extraction.extractedMetadata.musicStyle,
    dressCode: extraction.extractedMetadata.dressCode,
    // Series ID if detected
    seriesId: initialSeriesId,
  }).returning();
  
  // Create event participants
  await createEventParticipants(newEvent.id, extraction.participants, null);
  
  // Mark scraped event as approved
  await db.update(scrapedEvents)
    .set({ status: 'approved' })
    .where(eq(scrapedEvents.id, scraped.id));
  
  if (initialSeriesId) {
    console.log(`[MB.MD] Created event ${newEvent.id} linked to series ${initialSeriesId}`);
  }
  
  return { action: 'created', eventId: newEvent.id };
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('[MB.MD] AUTO-APPROVAL SCRIPT v2 - Multi-Source Deduplication');
  console.log('='.repeat(80) + '\n');
  
  // Get all pending scraped events
  const pendingEvents = await db.query.scrapedEvents.findMany({
    where: eq(scrapedEvents.status, 'pending_review')
  }) as ScrapedEvent[];
  
  console.log(`[MB.MD] Found ${pendingEvents.length} pending events to process`);
  
  if (pendingEvents.length === 0) {
    console.log('[MB.MD] No pending events to process');
    return;
  }
  
  // Extract unique cities
  const citiesSet = new Set<string>();
  for (const event of pendingEvents) {
    const city = extractCity(event.location);
    if (city !== 'Unknown') {
      citiesSet.add(city);
    }
  }
  
  console.log(`[MB.MD] Unique cities found: ${Array.from(citiesSet).join(', ')}`);
  
  // Create city groups if needed
  const cityGroupMap = new Map<string, number>();
  for (const city of citiesSet) {
    const groupId = await getOrCreateCityGroup(city);
    cityGroupMap.set(city.toLowerCase(), groupId);
  }
  
  // Process events
  let created = 0;
  let merged = 0;
  let errors = 0;
  
  for (const scraped of pendingEvents) {
    try {
      const city = extractCity(scraped.location);
      const cityGroupId = cityGroupMap.get(city.toLowerCase()) || 
                          cityGroupMap.get('melbourne') || 
                          1;
      
      const result = await processScrapedEvent(scraped, cityGroupId);
      
      if (result.action === 'created') {
        created++;
        console.log(`[MB.MD] ✓ Created: ${scraped.title.substring(0, 50)}...`);
      } else if (result.action === 'merged') {
        merged++;
        console.log(`[MB.MD] ↔ Merged:  ${scraped.title.substring(0, 50)}... (source: ${scraped.sourceName})`);
      }
      
      if ((created + merged) % 50 === 0) {
        console.log(`[MB.MD] Progress: ${created + merged}/${pendingEvents.length} events processed`);
      }
    } catch (error) {
      console.error(`[MB.MD] ✗ Error processing event ${scraped.id}: ${scraped.title}`, error);
      errors++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('[MB.MD] AUTO-APPROVAL COMPLETE');
  console.log('='.repeat(80));
  console.log(`✓ Created: ${created} new events`);
  console.log(`↔ Merged:  ${merged} events (sources added to existing)`);
  console.log(`✗ Errors:  ${errors} events`);
  console.log(`🏙 Cities:  ${cityGroupMap.size}`);
  
  // Update source last scraped times
  await db.update(eventScrapingSources)
    .set({ lastScrapedAt: new Date() })
    .where(eq(eventScrapingSources.isActive, true));
  
  console.log('\n[MB.MD] All events processed with multi-source tracking.');
  console.log('[MB.MD] Duplicate events now show all sources where they appear.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[MB.MD] Fatal error:', error);
    process.exit(1);
  });
