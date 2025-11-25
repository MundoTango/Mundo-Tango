/**
 * MB.MD Auto-Approval Script
 * 
 * Automatically approves all scraped events and creates corresponding city groups.
 * This script is part of the MB.MD research workflow.
 * 
 * Flow:
 * 1. Load all pending_review scraped events
 * 2. Extract unique cities from locations
 * 3. Create city groups for any missing cities
 * 4. Convert scraped_events to real events
 * 5. Link events to their city groups
 */

import { db } from '@shared/db';
import { scrapedEvents, events, groups, eventScrapingSources } from '@shared/schema';
import { eq, sql, and, isNull } from 'drizzle-orm';
import { getCityscapeImage } from '../algorithms/cityCityscape';

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

// Extract city from location string
function extractCity(location: string | null): string {
  if (!location) return 'Unknown';
  
  // Common patterns: "Venue Name, City" or "City, Country" or just "City"
  const parts = location.split(',').map(p => p.trim());
  
  // Try to find a known city
  const knownCities = [
    'Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide',
    'Buenos Aires', 'New York', 'London', 'Paris', 'Berlin',
    'Tokyo', 'Barcelona', 'Amsterdam', 'Toronto', 'Los Angeles',
    'San Francisco', 'Chicago', 'Miami', 'Austin', 'Seattle'
  ];
  
  for (const part of parts) {
    for (const city of knownCities) {
      if (part.toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
  }
  
  // If location contains "Melbourne" anywhere
  if (location.toLowerCase().includes('melbourne')) return 'Melbourne';
  if (location.toLowerCase().includes('sydney')) return 'Sydney';
  if (location.toLowerCase().includes('buenos aires')) return 'Buenos Aires';
  
  // Return first non-empty part or Unknown
  return parts[0] || 'Unknown';
}

// Get or create city group
async function getOrCreateCityGroup(cityName: string): Promise<number> {
  // Check if city group exists
  const existing = await db.query.groups.findFirst({
    where: and(
      eq(groups.type, 'city'),
      sql`LOWER(${groups.city}) = LOWER(${cityName})`
    )
  });
  
  if (existing) {
    return existing.id;
  }
  
  // Create new city group
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
    createdById: 1, // System user
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
 * Per PRD: milonga, workshop, class, festival, marathon, practica, online, social, performance, competition
 * Analyzes title and description to determine the correct event type
 */
function detectEventType(title: string, description: string | null): string {
  const titleLower = title.toLowerCase();
  const descLower = (description || '').toLowerCase();
  const combined = `${titleLower} ${descLower}`;
  
  // ============================================================
  // FESTIVAL / MARATHON / ENCUENTRO (Multi-day special events)
  // ============================================================
  if (/festival|tango\s*week|tango\s*weekend/i.test(combined)) {
    return 'festival';
  }
  if (/marathon|maratón|marath[oó]n/i.test(combined)) {
    return 'marathon';
  }
  if (/encuentro|encounter/i.test(combined)) {
    return 'festival'; // Encuentros are festival-type
  }
  if (/circuit|circuito/i.test(combined)) {
    return 'festival';
  }

  // ============================================================
  // COMPETITION (Contests, Championships)
  // ============================================================
  if (/competition|championship|contest|campeonato|mundial|concurso/i.test(combined)) {
    return 'competition';
  }

  // ============================================================
  // PERFORMANCE / SHOW (Stage performances, demos)
  // ============================================================
  if (/show\b|shows\b|performance|perform|exhibition|exhibición|gala|concert|concierto/i.test(combined)) {
    return 'performance';
  }
  if (/demo\b|demonstration|showcase/i.test(combined)) {
    return 'performance';
  }

  // ============================================================
  // CLASS / WORKSHOP (Teaching events - differentiate by format)
  // ============================================================
  // CLASS: Regular recurring lessons with levels
  if (/\bclass\b|\bclasses\b|\blesson\b|\blessons\b/i.test(titleLower)) {
    return 'class';
  }
  if (/level\s*\d|level\s*(one|two|three|1|2|3|i|ii|iii)/i.test(titleLower)) {
    return 'class';
  }
  if (/\bbeginner\b|\bintermediate\b|\badvanced\b|\bfundamentals\b/i.test(titleLower)) {
    return 'class';
  }
  
  // WORKSHOP: Special one-time teaching events
  if (/workshop|masterclass|master\s*class|intensive|bootcamp|course|seminar|clinic/i.test(titleLower)) {
    return 'workshop';
  }
  if (/choreography|footwork|musicality|embrace|navigation|technique|tango\s*lab/i.test(titleLower)) {
    return 'workshop';
  }
  if (/stage\s*tango|escenario|vals|milonga\s*traspie/i.test(titleLower)) {
    return 'workshop';
  }

  // ============================================================
  // PRACTICA (Practice sessions)
  // ============================================================
  if (/practica|práctica|practice|pract-ilonga|practilonga/i.test(titleLower)) {
    return 'practica';
  }

  // ============================================================
  // ONLINE / VIRTUAL
  // ============================================================
  if (/online|virtual|zoom|webinar|livestream|live\s*stream|streaming/i.test(combined)) {
    return 'online';
  }

  // ============================================================
  // SOCIAL (Non-dance social gatherings)
  // ============================================================
  if (/social\s*event|dinner|lunch|brunch|picnic|meetup|meet-up|gathering|party\b(?!.*milonga)/i.test(combined)) {
    return 'social';
  }

  // ============================================================
  // MILONGA (Default - actual social dance events)
  // ============================================================
  // If title explicitly contains "milonga", it's a milonga
  if (/milonga/i.test(titleLower)) {
    return 'milonga';
  }

  // Other dance event indicators that are milongas
  if (/baile|dance\s*night|tango\s*night|friday|saturday|sunday|monday|tuesday|wednesday|thursday/i.test(titleLower)) {
    // Check it's not a class on that day
    if (!/class|lesson|workshop|course/i.test(titleLower)) {
      return 'milonga';
    }
  }

  // Default: milonga (social dance events)
  return 'milonga';
}

// Convert scraped event to real event
async function convertToEvent(scraped: ScrapedEvent, cityGroupId: number): Promise<void> {
  const city = extractCity(scraped.location);
  
  // Check for duplicates based on title and date
  const existingEvent = await db.query.events.findFirst({
    where: and(
      sql`LOWER(${events.title}) = LOWER(${scraped.title})`,
      eq(events.startDate, scraped.startDate)
    )
  });
  
  if (existingEvent) {
    console.log(`[MB.MD] Skipping duplicate event: ${scraped.title}`);
    await db.update(scrapedEvents)
      .set({ status: 'duplicate' })
      .where(eq(scrapedEvents.id, scraped.id));
    return;
  }
  
  // Detect event type intelligently from title/description
  const eventType = detectEventType(scraped.title, scraped.description);
  
  // Create the real event with ALL scraped fields
  await db.insert(events).values({
    title: scraped.title,
    description: scraped.description || `${scraped.title} - Tango event in ${city}`,
    startDate: scraped.startDate,
    endDate: scraped.endDate || scraped.startDate,
    location: scraped.location || city,
    address: scraped.address,
    city: city,
    userId: 1, // System user - organizers added but not as admins
    eventType: eventType, // INTELLIGENT DETECTION - not hardcoded!
    status: 'published',
    isPublic: true,
    price: parsePrice(scraped.price),
    imageUrl: scraped.imageUrl,
    groupId: cityGroupId,
    websiteUrl: scraped.sourceUrl, // Store original source URL
    ticketUrl: scraped.sourceUrl, // Link to original for tickets
  });
  
  // Mark scraped event as approved
  await db.update(scrapedEvents)
    .set({ status: 'approved' })
    .where(eq(scrapedEvents.id, scraped.id));
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('[MB.MD] AUTO-APPROVAL SCRIPT - Converting Scraped Events to Real Events');
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
  
  // Process events in batches
  let approved = 0;
  let duplicates = 0;
  let errors = 0;
  
  for (const scraped of pendingEvents) {
    try {
      const city = extractCity(scraped.location);
      const cityGroupId = cityGroupMap.get(city.toLowerCase()) || 
                          cityGroupMap.get('melbourne') || // Default to Melbourne for Australian events
                          1; // Fallback
      
      await convertToEvent(scraped, cityGroupId);
      approved++;
      
      if (approved % 50 === 0) {
        console.log(`[MB.MD] Progress: ${approved}/${pendingEvents.length} events processed`);
      }
    } catch (error) {
      console.error(`[MB.MD] Error processing event ${scraped.id}: ${scraped.title}`, error);
      errors++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('[MB.MD] AUTO-APPROVAL COMPLETE');
  console.log('='.repeat(80));
  console.log(`✓ Approved: ${approved} events`);
  console.log(`⊘ Duplicates: ${duplicates} events`);
  console.log(`✗ Errors: ${errors} events`);
  console.log(`Cities with groups: ${cityGroupMap.size}`);
  
  // Update source last scraped times
  await db.update(eventScrapingSources)
    .set({ lastScrapedAt: new Date() })
    .where(eq(eventScrapingSources.isActive, true));
  
  console.log('\n[MB.MD] All scraped events have been converted to real events.');
  console.log('[MB.MD] City groups created/verified for all event locations.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[MB.MD] Fatal error:', error);
    process.exit(1);
  });
