import { db } from '../../shared/db';
import { eventScrapingSources } from '../../shared/schema';
import { sql } from 'drizzle-orm';

interface SourceData {
  name: string;
  url: string;
  platform: string;
  city: string | null;
  country: string | null;
}

const sources: SourceData[] = [
  // Argentina
  { name: 'Tango Buenos Aires FB', url: 'https://www.facebook.com/groups/tangoBA', platform: 'facebook', city: 'Buenos Aires', country: 'Argentina' },
  { name: 'Tango Ushuaia FB', url: 'https://www.facebook.com/groups/tangoUshuaia', platform: 'facebook', city: 'Ushuaia', country: 'Argentina' },
  { name: 'Tango Córdoba FB', url: 'https://www.facebook.com/groups/tangocordoba', platform: 'facebook', city: 'Córdoba', country: 'Argentina' },
  { name: 'Tango Rosario FB', url: 'https://www.facebook.com/groups/tangorosario', platform: 'facebook', city: 'Rosario', country: 'Argentina' },
  { name: 'Tango Mendoza FB', url: 'https://www.facebook.com/groups/tangomendoza', platform: 'facebook', city: 'Mendoza', country: 'Argentina' },
  
  // Canada
  { name: 'Tango Toronto Calendar', url: 'https://tangotoronto.ca/calendar', platform: 'website', city: 'Toronto', country: 'Canada' },
  { name: 'Tango Montreal Calendar', url: 'https://tangomontreal.com/en/calendar', platform: 'website', city: 'Montreal', country: 'Canada' },
  { name: 'Vancouver Tango Events', url: 'https://www.vancouvertango.com/events', platform: 'website', city: 'Vancouver', country: 'Canada' },
  
  // USA
  { name: 'New York Tango Calendar', url: 'https://www.newyorktango.com/calendar', platform: 'website', city: 'New York', country: 'United States' },
  { name: 'San Francisco Tango Events', url: 'https://www.tangosf.com/events', platform: 'website', city: 'San Francisco', country: 'United States' },
  { name: 'Los Angeles Tango Calendar', url: 'https://www.tangola.org/calendar', platform: 'website', city: 'Los Angeles', country: 'United States' },
  { name: 'Chicago Tango Calendar', url: 'https://www.tangochicago.com/calendar', platform: 'website', city: 'Chicago', country: 'United States' },
  { name: 'Austin Tango Events', url: 'https://www.austintango.org/events', platform: 'website', city: 'Austin', country: 'United States' },
  { name: 'Seattle Tango Calendar', url: 'https://www.seattletango.org/calendar', platform: 'website', city: 'Seattle', country: 'United States' },
  { name: 'Portland Tango Events', url: 'https://www.portlandtango.com/events', platform: 'website', city: 'Portland', country: 'United States' },
  { name: 'Denver Tango Calendar', url: 'https://www.denvertango.org/calendar', platform: 'website', city: 'Denver', country: 'United States' },
  { name: 'Miami Tango Events', url: 'https://www.miamitango.com/events', platform: 'website', city: 'Miami', country: 'United States' },
  { name: 'Boston Tango Calendar', url: 'https://www.bostontango.org/calendar', platform: 'website', city: 'Boston', country: 'United States' },
  
  // Brazil & Mexico
  { name: 'Tango São Paulo FB', url: 'https://www.facebook.com/groups/tangosp', platform: 'facebook', city: 'São Paulo', country: 'Brazil' },
  { name: 'Tango Rio de Janeiro FB', url: 'https://www.facebook.com/groups/tangorj', platform: 'facebook', city: 'Rio de Janeiro', country: 'Brazil' },
  { name: 'Tango Mexico City FB', url: 'https://www.facebook.com/groups/tangomx', platform: 'facebook', city: 'Mexico City', country: 'Mexico' },
  
  // Europe
  { name: 'Tango Vienna Calendar', url: 'http://www.tango-vienna.at/termine', platform: 'website', city: 'Vienna', country: 'Austria' },
  { name: 'Tango Paris FB', url: 'https://www.facebook.com/groups/tangoparis', platform: 'facebook', city: 'Paris', country: 'France' },
  { name: 'Tango Berlin FB', url: 'https://www.facebook.com/groups/tangoberlin', platform: 'facebook', city: 'Berlin', country: 'Germany' },
  { name: 'Tango London Events', url: 'https://www.tangolondon.com/events', platform: 'website', city: 'London', country: 'United Kingdom' },
  { name: 'Tango Madrid FB', url: 'https://www.facebook.com/groups/tangomadrid', platform: 'facebook', city: 'Madrid', country: 'Spain' },
  { name: 'Tango Barcelona FB', url: 'https://www.facebook.com/groups/tangobarcelona', platform: 'facebook', city: 'Barcelona', country: 'Spain' },
  { name: 'Tango Seville Events', url: 'https://www.tangoseville.com/events', platform: 'website', city: 'Seville', country: 'Spain' },
  { name: 'Tango Valencia FB', url: 'https://www.facebook.com/groups/tangovalencia', platform: 'facebook', city: 'Valencia', country: 'Spain' },
  { name: 'Tango Lisbon Calendar', url: 'https://www.tangolisbon.com/calendar', platform: 'website', city: 'Lisbon', country: 'Portugal' },
  { name: 'Tango Porto FB', url: 'https://www.facebook.com/groups/tangoporto', platform: 'facebook', city: 'Porto', country: 'Portugal' },
  { name: 'Tango Rome FB', url: 'https://www.facebook.com/groups/tangorome', platform: 'facebook', city: 'Rome', country: 'Italy' },
  { name: 'Tango Milan Events', url: 'https://www.tangomilan.it/eventi', platform: 'website', city: 'Milan', country: 'Italy' },
  { name: 'Tango Florence FB', url: 'https://www.facebook.com/groups/tangoflorence', platform: 'facebook', city: 'Florence', country: 'Italy' },
  { name: 'Tango Zurich Calendar', url: 'https://www.tangozurich.ch/calendar', platform: 'website', city: 'Zurich', country: 'Switzerland' },
  { name: 'Tango Geneva FB', url: 'https://www.facebook.com/groups/tangogeneva', platform: 'facebook', city: 'Geneva', country: 'Switzerland' },
  { name: 'Tango Amsterdam Agenda', url: 'https://www.tangoamsterdam.nl/agenda', platform: 'website', city: 'Amsterdam', country: 'Netherlands' },
  { name: 'Tango Rotterdam FB', url: 'https://www.facebook.com/groups/tangorotterdam', platform: 'facebook', city: 'Rotterdam', country: 'Netherlands' },
  { name: 'Tango Brussels FB', url: 'https://www.facebook.com/groups/tangobrussels', platform: 'facebook', city: 'Brussels', country: 'Belgium' },
  { name: 'Tango Copenhagen FB', url: 'https://www.facebook.com/groups/tangocopenhagen', platform: 'facebook', city: 'Copenhagen', country: 'Denmark' },
  { name: 'Tango Stockholm Events', url: 'https://www.tangostockholm.se/events', platform: 'website', city: 'Stockholm', country: 'Sweden' },
  { name: 'Tango Oslo FB', url: 'https://www.facebook.com/groups/tangooslo', platform: 'facebook', city: 'Oslo', country: 'Norway' },
  { name: 'Tango Helsinki Calendar', url: 'https://www.tangohelsinki.fi/calendar', platform: 'website', city: 'Helsinki', country: 'Finland' },
  { name: 'Tango Warsaw FB', url: 'https://www.facebook.com/groups/tangowarsaw', platform: 'facebook', city: 'Warsaw', country: 'Poland' },
  { name: 'Tango Prague FB', url: 'https://www.facebook.com/groups/tangoprague', platform: 'facebook', city: 'Prague', country: 'Czech Republic' },
  { name: 'Tango Budapest Events', url: 'https://www.tangobudapest.hu/events', platform: 'website', city: 'Budapest', country: 'Hungary' },
  
  // Eastern Europe
  { name: 'Tango Bucharest FB', url: 'https://www.facebook.com/groups/tangobucharest', platform: 'facebook', city: 'Bucharest', country: 'Romania' },
  { name: 'Tango Sofia FB', url: 'https://www.facebook.com/groups/tangosofia', platform: 'facebook', city: 'Sofia', country: 'Bulgaria' },
  { name: 'Tango Zagreb FB', url: 'https://www.facebook.com/groups/tangozagreb', platform: 'facebook', city: 'Zagreb', country: 'Croatia' },
  { name: 'Tango Moscow FB', url: 'https://www.facebook.com/groups/tangomoscow', platform: 'facebook', city: 'Moscow', country: 'Russia' },
  { name: 'Tango St Petersburg FB', url: 'https://www.facebook.com/groups/tangostpetersburg', platform: 'facebook', city: 'St. Petersburg', country: 'Russia' },
  { name: 'Tango Kyiv FB', url: 'https://www.facebook.com/groups/tangokyiv', platform: 'facebook', city: 'Kyiv', country: 'Ukraine' },
  
  // Asia Pacific
  { name: 'Tango Tokyo Events', url: 'https://www.tangotokyo.jp/events', platform: 'website', city: 'Tokyo', country: 'Japan' },
  { name: 'Tango Osaka FB', url: 'https://www.facebook.com/groups/tangoosaka', platform: 'facebook', city: 'Osaka', country: 'Japan' },
  { name: 'Tango Korea Calendar', url: 'https://www.tangokorea.com/calendar', platform: 'website', city: 'Seoul', country: 'South Korea' },
  { name: 'Tango Hong Kong FB', url: 'https://www.facebook.com/groups/tangohongkong', platform: 'facebook', city: 'Hong Kong', country: 'Hong Kong' },
  { name: 'Tango Beijing FB', url: 'https://www.facebook.com/groups/tangobeijing', platform: 'facebook', city: 'Beijing', country: 'China' },
  { name: 'Tango Shanghai FB', url: 'https://www.facebook.com/groups/tangoshanghai', platform: 'facebook', city: 'Shanghai', country: 'China' },
  { name: 'Tango Taiwan Events', url: 'https://www.tangotaiwan.com/events', platform: 'website', city: 'Taipei', country: 'Taiwan' },
  { name: 'Tango Singapore Calendar', url: 'https://www.tangosingapore.com/calendar', platform: 'website', city: 'Singapore', country: 'Singapore' },
  { name: 'Tango Bangkok FB', url: 'https://www.facebook.com/groups/tangobangkok', platform: 'facebook', city: 'Bangkok', country: 'Thailand' },
  { name: 'Tango Vietnam FB', url: 'https://www.facebook.com/groups/tangovietnam', platform: 'facebook', city: 'Ho Chi Minh City', country: 'Vietnam' },
  { name: 'Tango Philippines Events', url: 'https://www.tangophilippines.com/events', platform: 'website', city: 'Manila', country: 'Philippines' },
  { name: 'Tango Jakarta FB', url: 'https://www.facebook.com/groups/tangojakarta', platform: 'facebook', city: 'Jakarta', country: 'Indonesia' },
  { name: 'Tango Malaysia FB', url: 'https://www.facebook.com/groups/tangomalaysia', platform: 'facebook', city: 'Kuala Lumpur', country: 'Malaysia' },
  { name: 'Tango India FB', url: 'https://www.facebook.com/groups/tangoindia', platform: 'facebook', city: 'New Delhi', country: 'India' },
  { name: 'Tango Bangalore FB', url: 'https://www.facebook.com/groups/tangobangalore', platform: 'facebook', city: 'Bangalore', country: 'India' },
  { name: 'Tango Mumbai FB', url: 'https://www.facebook.com/groups/tangomumbai', platform: 'facebook', city: 'Mumbai', country: 'India' },
  
  // Middle East
  { name: 'Tango Istanbul FB', url: 'https://www.facebook.com/groups/tangoistanbul', platform: 'facebook', city: 'Istanbul', country: 'Turkey' },
  { name: 'Tango Ankara FB', url: 'https://www.facebook.com/groups/tangoankara', platform: 'facebook', city: 'Ankara', country: 'Turkey' },
  { name: 'Tango Tel Aviv FB', url: 'https://www.facebook.com/groups/tangotelaviv', platform: 'facebook', city: 'Tel Aviv', country: 'Israel' },
  { name: 'Tango Dubai FB', url: 'https://www.facebook.com/groups/tangodubai', platform: 'facebook', city: 'Dubai', country: 'UAE' },
  { name: 'Tango Beirut FB', url: 'https://www.facebook.com/groups/tangobeirut', platform: 'facebook', city: 'Beirut', country: 'Lebanon' },
  
  // Australia & NZ
  { name: 'Tango Sydney Events', url: 'https://tangosydney.com.au/events', platform: 'website', city: 'Sydney', country: 'Australia' },
  { name: 'Tango Melbourne Calendar', url: 'https://tangomelbourne.com.au/calendar', platform: 'website', city: 'Melbourne', country: 'Australia' },
  { name: 'Tango New Zealand Events', url: 'https://www.tangonz.co.nz/events', platform: 'website', city: 'Auckland', country: 'New Zealand' },
  
  // Africa
  { name: 'Tango Cape Town FB', url: 'https://www.facebook.com/groups/tangocapetown', platform: 'facebook', city: 'Cape Town', country: 'South Africa' },
  { name: 'Tango Cairo FB', url: 'https://www.facebook.com/groups/tangocairo', platform: 'facebook', city: 'Cairo', country: 'Egypt' },
  
  // Hoy Milonga (priority sources)
  { name: 'Hoy Milonga Buenos Aires', url: 'https://hoy-milonga.com/buenos-aires/es/milongas', platform: 'hoy-milonga', city: 'Buenos Aires', country: 'Argentina' },
  { name: 'Hoy Milonga São Paulo', url: 'https://hoy-milonga.com/sao-paulo/es/milongas', platform: 'hoy-milonga', city: 'São Paulo', country: 'Brazil' },
  { name: 'Hoy Milonga Berlin', url: 'https://hoy-milonga.com/berlin/en/milongas', platform: 'hoy-milonga', city: 'Berlin', country: 'Germany' },
  { name: 'Hoy Milonga Athens', url: 'https://hoy-milonga.com/athens/en/milongas', platform: 'hoy-milonga', city: 'Athens', country: 'Greece' },
  { name: 'Hoy Milonga Istanbul', url: 'https://hoy-milonga.com/istanbul/en/milongas', platform: 'hoy-milonga', city: 'Istanbul', country: 'Turkey' },
  { name: 'Hoy Milonga London', url: 'https://hoy-milonga.com/london/en/milongas', platform: 'hoy-milonga', city: 'London', country: 'United Kingdom' },
  { name: 'Hoy Milonga Miami', url: 'https://hoy-milonga.com/miami/en/milongas', platform: 'hoy-milonga', city: 'Miami', country: 'United States' },
  { name: 'Hoy Milonga Montevideo', url: 'https://hoy-milonga.com/montevideo/es/milongas', platform: 'hoy-milonga', city: 'Montevideo', country: 'Uruguay' },
  
  // Global calendars
  { name: 'Tangopolix Events', url: 'https://www.tangopolix.com/events', platform: 'tangopolix', city: null, country: null },
  { name: 'TangoMapa Events', url: 'https://tangomapa.com/events', platform: 'tangomapa', city: null, country: null },
];

async function main() {
  console.log(`Seeding ${sources.length} scraping sources...`);
  let inserted = 0;
  let skipped = 0;
  
  for (const src of sources) {
    try {
      const result = await db.insert(eventScrapingSources).values({
        name: src.name,
        url: src.url,
        platform: src.platform,
        city: src.city,
        country: src.country,
        isActive: true,
        scrapeFrequency: 'daily',
      }).onConflictDoNothing();
      
      if (result.rowCount && result.rowCount > 0) {
        inserted++;
      } else {
        skipped++;
      }
    } catch (e: any) {
      console.error(`Error inserting ${src.name}:`, e.message);
    }
  }
  
  const count = await db.select({ count: sql`count(*)` }).from(eventScrapingSources);
  console.log(`Done! Inserted ${inserted} new sources, skipped ${skipped} duplicates.`);
  console.log(`Total sources in database: ${count[0]?.count}`);
  process.exit(0);
}

main().catch(console.error);
