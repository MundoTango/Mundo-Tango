/**
 * Fix City Group Mapping
 * 
 * Properly maps scraped events to their actual cities based on:
 * 1. Title patterns (e.g., "TangoMelbourne" → Melbourne)
 * 2. Known venue-to-city mappings
 * 3. Source URL patterns
 */

import { db } from '@shared/db';
import { scrapedEvents, events, groups } from '@shared/schema';
import { eq, sql, and } from 'drizzle-orm';
import { getCityscapeImage } from '../algorithms/cityCityscape';

// Venue to City mappings (known venues)
const VENUE_TO_CITY: Record<string, string> = {
  // Melbourne venues
  'i.am.dance studio': 'Melbourne',
  'tango esencia': 'Melbourne',
  'robles dance': 'Melbourne',
  'studio take care': 'Melbourne',
  'brunswick uniting church': 'Melbourne',
  'kensington town hall': 'Melbourne',
  'mount martha house community centre': 'Melbourne',
  'south yarra baptist church': 'Melbourne',
  'mark st community hal': 'Melbourne',
  'forever dance studio': 'Melbourne',
  'bluestone church arts space': 'Melbourne',
  'the aces bar': 'Melbourne',
  'buxton hall': 'Melbourne',
  
  // São Paulo venues
  'espaço cultural luciana mayumi': 'São Paulo',
  'studio simo e carol tango': 'São Paulo',
  'nossa casa arte & dança': 'São Paulo',
  'new opera': 'São Paulo',
  'espaço dyr': 'São Paulo',
  'espaço coletivo': 'São Paulo',
  
  // Berlin venues
  'büroetage aussichtsreich': 'Berlin',
  'bewegungsraum': 'Berlin',
  'phynix tanzt': 'Berlin',
  'tangogarten weissensee': 'Berlin',
  'ballhaus wedding': 'Berlin',
  'tangotanzen macht schön': 'Berlin',
  'auferstehungskirche @la catedral': 'Berlin',
  'tango baires': 'Berlin',
  'roter salon': 'Berlin',
  'kunstlabor': 'Berlin',
  'club schalasch': 'Berlin',
  'mala junta': 'Berlin',
  'kreativhaus': 'Berlin',
  'werk36': 'Berlin',
  'tangopolis': 'Berlin',
  'basecamp': 'Berlin',
  'villa kreuzberg': 'Berlin',
  'alte bahnhofshalle': 'Berlin',
  'ballhaus maxixe': 'Berlin',
  'ballhaus walzerlinksgestrickt': 'Berlin',
  'tangoloft': 'Berlin',
  'la caminada tanzstudio': 'Berlin',
  'haus am lietzensee': 'Berlin',
  'practicamos juntos': 'Berlin',
  'kitkatclub': 'Berlin',
  'dassportstudio': 'Berlin',
  'nostizsaal': 'Berlin',
  'zbk': 'Berlin',
  'rathaus schöneberg': 'Berlin',
  'noir café': 'Berlin',
  
  // Athens venues
  'χοροποίηση': 'Athens',
  'casa argentina athens': 'Athens',
  'tangosteps': 'Athens',
  'tango atelier': 'Athens',
  'tangofix': 'Athens',
  'tangravity studio of arts': 'Athens',
  'academia del tango en grecia': 'Athens',
  'el abrazo': 'Athens',
  'libertango dance studio': 'Athens',
  'tangart': 'Athens',
  'tango fusion': 'Athens',
  'tango home': 'Athens',
  'tango notturno': 'Athens',
  'tango mas': 'Athens',
  'poema escuela de tango': 'Athens',
  'danzarin': 'Athens',
  'k.o.t.e.s.': 'Athens',
  
  // Buenos Aires venues
  'salon canning': 'Buenos Aires',
  'la viruta': 'Buenos Aires',
  'la catedral': 'Buenos Aires',
  'milonga parakultural': 'Buenos Aires',
};

// Title patterns to city
const TITLE_PATTERNS: { pattern: RegExp; city: string }[] = [
  { pattern: /tangomelbourne|melbourne tango/i, city: 'Melbourne' },
  { pattern: /sydney tango|tangosydney/i, city: 'Sydney' },
  { pattern: /buenos aires|milonga porteña/i, city: 'Buenos Aires' },
  { pattern: /berlin tango|tangoberlin/i, city: 'Berlin' },
  { pattern: /paris tango|tangoparis/i, city: 'Paris' },
  { pattern: /london tango|tangolondon/i, city: 'London' },
  { pattern: /new york tango|tangony/i, city: 'New York' },
  { pattern: /tokyo tango|tangotokyo/i, city: 'Tokyo' },
  { pattern: /barcelona tango|tangobcn/i, city: 'Barcelona' },
  { pattern: /amsterdam tango/i, city: 'Amsterdam' },
  { pattern: /athens tango|tangoathens/i, city: 'Athens' },
  { pattern: /são paulo tango|tangosp/i, city: 'São Paulo' },
];

// Address patterns to city (street name patterns)
const ADDRESS_PATTERNS: { pattern: RegExp; city: string }[] = [
  // German addresses (Berlin)
  { pattern: /straße|platz|allee|damm|weg.*berlin|berlin/i, city: 'Berlin' },
  { pattern: /Kaiser-Friedrich|Kolonnenstraße|Pfuelstraße|Hasenheide|Ackerstraße|Antwerpener|Belziger|Chausseestraße|Herbartstraße|Rosa-Luxemburg/i, city: 'Berlin' },
  
  // Greek addresses (Athens)
  { pattern: /athina|athens|leoforos|agios|plateia/i, city: 'Athens' },
  { pattern: /Antisthenous|Vouliagmenis|Germanou|Ithomis|Dimitrakopoulou|Agatharchou|Keiriadon|Diliados|Nakou|Filis|Venizelou|Kolokotroni|Paggeou|Doxara/i, city: 'Athens' },
  
  // Brazilian addresses (São Paulo)
  { pattern: /avenida|rua.*são paulo|são paulo|sp\s*\d{5}/i, city: 'São Paulo' },
  { pattern: /Avenida da Liberdade|Conselheiro Furtado/i, city: 'São Paulo' },
  
  // Australian addresses (Melbourne)
  { pattern: /melbourne|vic\s*\d{4}|victoria/i, city: 'Melbourne' },
  { pattern: /Bellair Street|Kensington|Fitzroy|Brunswick|South Yarra|Toorak|Smith Street/i, city: 'Melbourne' },
  
  // Buenos Aires
  { pattern: /buenos aires|caba|capital federal/i, city: 'Buenos Aires' },
];

// Extract city from scraped event data
function extractCity(title: string, location: string | null, address: string | null): string {
  // 1. Check address patterns first (most accurate)
  if (address) {
    for (const { pattern, city } of ADDRESS_PATTERNS) {
      if (pattern.test(address)) {
        return city;
      }
    }
  }
  
  // 2. Check title patterns
  for (const { pattern, city } of TITLE_PATTERNS) {
    if (pattern.test(title)) {
      return city;
    }
  }
  
  // 3. Check venue mapping
  if (location) {
    const locationLower = location.toLowerCase().trim();
    for (const [venue, city] of Object.entries(VENUE_TO_CITY)) {
      if (locationLower.includes(venue)) {
        return city;
      }
    }
  }
  
  // 4. Check location for address patterns too
  if (location) {
    for (const { pattern, city } of ADDRESS_PATTERNS) {
      if (pattern.test(location)) {
        return city;
      }
    }
  }
  
  // 5. Check if title contains a known city name directly
  const knownCities = ['Melbourne', 'Sydney', 'Buenos Aires', 'Berlin', 'Paris', 'London', 'Athens', 'São Paulo'];
  for (const city of knownCities) {
    if (title.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }
  
  // 6. Default to Melbourne for Australian-looking events (these came from tangoclub.melbourne)
  if (location && (
    location.includes('Studio') || 
    location.includes('Church') || 
    location.includes('Hall') ||
    location.includes('Centre')
  )) {
    return 'Melbourne'; // Default for this scrape batch
  }
  
  return 'Unknown';
}

// Get or create city group
async function getOrCreateCityGroup(cityName: string): Promise<number | null> {
  if (cityName === 'Unknown') return null;
  
  // Check if city group exists
  const existing = await db.query.groups.findFirst({
    where: and(
      eq(groups.type, 'city'),
      sql`LOWER(${groups.name}) = LOWER(${cityName})`
    )
  });
  
  if (existing) {
    console.log(`  ✓ Using existing city group: ${cityName} (ID: ${existing.id})`);
    return existing.id;
  }
  
  // Create new city group
  console.log(`  + Creating city group: ${cityName}`);
  
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
  
  return newGroup.id;
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('FIX CITY GROUP MAPPING');
  console.log('='.repeat(80) + '\n');
  
  // Get all pending scraped events
  const pendingEvents = await db.query.scrapedEvents.findMany({
    where: eq(scrapedEvents.status, 'pending_review')
  });
  
  console.log(`Found ${pendingEvents.length} pending events to process\n`);
  
  // Group events by city
  const cityEvents = new Map<string, typeof pendingEvents>();
  
  for (const event of pendingEvents) {
    const city = extractCity(event.title, event.location, event.address);
    if (!cityEvents.has(city)) {
      cityEvents.set(city, []);
    }
    cityEvents.get(city)!.push(event);
  }
  
  console.log('City Distribution:');
  for (const [city, events] of cityEvents) {
    console.log(`  ${city}: ${events.length} events`);
  }
  console.log();
  
  // Process each city
  let approved = 0;
  let duplicates = 0;
  let errors = 0;
  
  for (const [city, cityEventList] of cityEvents) {
    if (city === 'Unknown') {
      console.log(`Skipping ${cityEventList.length} events with unknown city`);
      continue;
    }
    
    const groupId = await getOrCreateCityGroup(city);
    if (!groupId) continue;
    
    console.log(`\nProcessing ${cityEventList.length} ${city} events...`);
    
    for (const scraped of cityEventList) {
      try {
        // Check for duplicates
        const existingEvent = await db.query.events.findFirst({
          where: and(
            sql`LOWER(${events.title}) = LOWER(${scraped.title})`,
            eq(events.startDate, scraped.startDate)
          )
        });
        
        if (existingEvent) {
          duplicates++;
          await db.update(scrapedEvents)
            .set({ status: 'duplicate' })
            .where(eq(scrapedEvents.id, scraped.id));
          continue;
        }
        
        // Create real event
        await db.insert(events).values({
          title: scraped.title,
          description: scraped.description || `${scraped.title} - Tango event in ${city}`,
          startDate: scraped.startDate,
          endDate: scraped.endDate || scraped.startDate,
          location: scraped.location || city,
          address: scraped.address,
          city: city,
          userId: 1,
          eventType: 'milonga',
          status: 'published',
          isPublic: true,
          imageUrl: scraped.imageUrl,
          groupId: groupId,
        });
        
        await db.update(scrapedEvents)
          .set({ status: 'approved' })
          .where(eq(scrapedEvents.id, scraped.id));
        
        approved++;
      } catch (error) {
        errors++;
        console.error(`  Error: ${scraped.title}`, error);
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('CITY GROUP MAPPING COMPLETE');
  console.log('='.repeat(80));
  console.log(`✓ Approved: ${approved} events`);
  console.log(`⊘ Duplicates: ${duplicates} events`);
  console.log(`✗ Errors: ${errors} events`);
  
  // Show final city group counts
  const finalGroups = await db.query.groups.findMany({
    where: eq(groups.type, 'city')
  });
  
  console.log('\nCity Groups:');
  for (const group of finalGroups) {
    const eventCount = await db.select({ count: sql`count(*)` })
      .from(events)
      .where(eq(events.groupId, group.id));
    console.log(`  ${group.name}: ${eventCount[0].count} events`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
