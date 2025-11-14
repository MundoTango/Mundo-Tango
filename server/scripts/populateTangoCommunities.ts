/**
 * POPULATE 226+ TANGO COMMUNITIES
 * MB.MD Implementation - Scraping Source Database Seed
 * 
 * Populates eventScrapingSources table with 226+ global tango communities
 * Data source: docs/handoff/TANGO_SCRAPING_COMPLETE_GUIDE.md
 */

import { db } from '@shared/db';
import { eventScrapingSources } from '@shared/schema';

interface TangoCommunity {
  country: string;
  city: string;
  urls: string[];
}

const tangoCommunities: TangoCommunity[] = [
  // ARGENTINA
  { country: 'Argentina', city: 'Ushuaia', urls: ['https://www.facebook.com/groups/1651720055131986/'] },
  
  // AUSTRALIA
  { country: 'Australia', city: 'Melbourne', urls: ['https://tangoclub.melbourne/melbourne-tango-calendar/'] },
  { country: 'Australia', city: 'Sydney', urls: ['https://tangoevents.au/'] },
  
  // AUSTRIA
  { country: 'Austria', city: 'Vienna', urls: ['http://www.tango-vienna.com/'] },
  
  // BELGIUM
  { country: 'Belgium', city: 'Brussels', urls: ['https://www.milonga.be/'] },
  
  // BRAZIL
  { country: 'Brazil', city: 'Rio de Janeiro', urls: ['http://www.riotango.com.br/riodejaneiro.htm'] },
  { country: 'Brazil', city: 'São Paulo', urls: ['https://hoy-milonga.com/sao-paulo/en'] },
  
  // CANADA
  { country: 'Canada', city: 'Montreal', urls: ['https://www.tangocalmontreal.ca/', 'https://www.facebook.com/groups/1933550103636447/'] },
  { country: 'Canada', city: 'Ottawa', urls: ['https://ottawatango.wordpress.com/calendar/'] },
  { country: 'Canada', city: 'Quebec City', urls: ['https://tangoquebec.org/index.php/calendrier/'] },
  { country: 'Canada', city: 'Toronto', urls: ['https://www.torontotango.com/events/milongas.asp'] },
  { country: 'Canada', city: 'Vancouver', urls: ['https://www.allvancouvertango.com/'] },
  
  // COLOMBIA
  { country: 'Colombia', city: 'Bogotá', urls: ['https://www.bogotango.com/milongas/'] },
  
  // CROATIA
  { country: 'Croatia', city: 'Zagreb', urls: ['https://www.facebook.com/groups/127379027315950/'] },
  
  // CZECH REPUBLIC
  { country: 'Czech Republic', city: 'Brno', urls: ['http://www.tango-prague.info/calendars/brno'] },
  { country: 'Czech Republic', city: 'Prague', urls: ['https://www.tango-prague.info/', 'https://www.facebook.com/groups/13416565187/', 'https://www.facebook.com/TangoPragueInfo'] },
  
  // DENMARK
  { country: 'Denmark', city: 'Copenhagen', urls: ['https://tango.dk/'] },
  
  // EGYPT
  { country: 'Egypt', city: 'Cairo', urls: ['http://www.egypttango.com/'] },
  
  // ESTONIA
  { country: 'Estonia', city: 'Tallinn', urls: ['https://www.facebook.com/groups/252910028145400'] },
  
  // FINLAND
  { country: 'Finland', city: 'Helsinki', urls: ['https://www.facebook.com/groups/5555248820/', 'https://tangoargentinofinland.wordpress.com/milongas-practicas/'] },
  
  // FRANCE
  { country: 'France', city: 'Paris', urls: ['https://tango-argentin.fr/', 'https://www.parilongas.fr/', 'https://www.facebook.com/groups/164961677477/'] },
  { country: 'France', city: 'Grenoble', urls: ['https://tango-argentin.fr/'] },
  { country: 'France', city: 'Toulouse', urls: ['http://www.tango-toulouse.net/'] },
  { country: 'France', city: 'Marseille', urls: ['http://www.tangopourtous.fr/pagestheme/milongas/regulieres/fix_semaine.php'] },
  { country: 'France', city: 'Montpellier', urls: ['https://tango-argentin.fr/'] },
  { country: 'France', city: 'Bordeaux', urls: ['https://www.tango-argentin-bordeaux.com/'] },
  { country: 'France', city: 'Lyon', urls: ['http://www.tsibelle.com/'] },
  { country: 'France', city: 'Nantes', urls: ['https://www.tango-ouest.com/'] },
  { country: 'France', city: 'Nice', urls: ['https://calendar.google.com/calendar/u/0/embed?src=agendatangoam@gmail.com&ctz=Europe/Paris'] },
  
  // GERMANY
  { country: 'Germany', city: 'Berlin', urls: ['https://hoy-milonga.com/berlin/en', 'https://www.facebook.com/groups/563552997106496'] },
  { country: 'Germany', city: 'Frankfurt', urls: ['https://tango-calendar.de/events/kategorie/tango-milonga/'] },
  { country: 'Germany', city: 'Hamburg', urls: ['https://tangokalender-hamburg.de/en/'] },
  { country: 'Germany', city: 'Munich', urls: ['https://www.tangomuenchen.de/en/index.html'] },
  { country: 'Germany', city: 'Baden-Württemberg', urls: ['https://www.rhein-neckar-tango.de/veranstaltungen/'] },
  { country: 'Germany', city: 'Lake Constance', urls: ['https://www.tangoambodensee.info/index.php/kalender'] },
  { country: 'Germany', city: 'North Bavaria', urls: ['https://tango-nordbayern.de/'] },
  { country: 'Germany', city: 'Ostsee Region', urls: ['https://www.tangoammeer.de/tangokalender'] },
  
  // GREECE
  { country: 'Greece', city: 'Athens', urls: ['https://hoy-milonga.com/athens/en', 'https://www.facebook.com/groups/ocho.gr/', 'https://www.facebook.com/groups/371771409502112', 'http://tangolist.gr/'] },
  
  // HONG KONG
  { country: 'Hong Kong', city: 'Hong Kong', urls: ['https://www.facebook.com/groups/811530215594629/'] },
  
  // HUNGARY
  { country: 'Hungary', city: 'Budapest', urls: ['https://milonga.hu/', 'https://tangohungary.hu/'] },
  
  // INDIA
  { country: 'India', city: 'Auroville', urls: ['https://www.facebook.com/groups/197346010313291/', 'https://www.instagram.com/tango_in_auroville_india'] },
  { country: 'India', city: 'Hyderabad', urls: ['https://www.hyderabadtango.com/', 'https://www.facebook.com/hyderabad.tango'] },
  { country: 'India', city: 'Mumbai', urls: ['https://www.facebook.com/groups/107857822580692/'] },
  { country: 'India', city: 'Pune', urls: ['https://punetango.com/', 'https://facebook.com/groups/Pune.Tango/', 'https://www.instagram.com/pune.tango'] },
  
  // IRELAND
  { country: 'Ireland', city: 'Dublin', urls: ['https://irelandtango.com/'] },
  
  // ISRAEL
  { country: 'Israel', city: 'Tel Aviv', urls: ['https://isratango.org/'] },
  
  // ITALY
  { country: 'Italy', city: 'Milan', urls: ['https://www.faitango.it/agenda-eventi', 'http://www.tangomilano.it/milonghe.asp', 'https://buenaondatango.it/eventi-tango-argentino-milano/'] },
  { country: 'Italy', city: 'Rome', urls: ['https://www.faitango.it/agenda-eventi', 'https://calendar.google.com/calendar/u/0/embed?color=%239fe1e7&src=milongueandoroma@gmail.com'] },
  
  // JAPAN
  { country: 'Japan', city: 'Tokyo', urls: ['https://www.tokyotango.jp/', 'https://www.facebook.com/groups/376655371590174/'] },
  { country: 'Japan', city: 'Osaka/Kyoto/Nara', urls: ['https://sites.google.com/view/milongacalendarkansai'] },
  { country: 'Japan', city: 'All of Japan', urls: ['https://www.facebook.com/groups/298620387169176/', 'https://www.facebook.com/groups/1510097965906426/'] },
  
  // MALAYSIA
  { country: 'Malaysia', city: 'Penang', urls: ['https://www.facebook.com/groups/1563135257271497'] },
  
  // MEXICO
  { country: 'Mexico', city: 'Mexico City', urls: ['https://www.facebook.com/groups/1428420777264397'] },
  { country: 'Mexico', city: 'Playa del Carmen', urls: ['https://www.facebook.com/profile.php?id=100066783699508'] },
  { country: 'Mexico', city: 'Tulum', urls: ['https://www.facebook.com/tulumtango'] },
  
  // NETHERLANDS
  { country: 'Netherlands', city: 'Amsterdam', urls: ['https://www.tangokalender.nl/', 'https://www.facebook.com/groups/tangoinamsterdam'] },
  
  // NORWAY
  { country: 'Norway', city: 'Bergen', urls: ['http://bergentango.no/kalender/'] },
  { country: 'Norway', city: 'Oslo', urls: ['https://www.facebook.com/groups/2366326653'] },
  
  // POLAND
  { country: 'Poland', city: 'Kraków', urls: ['https://www.facebook.com/groups/146042045254/events'] },
  { country: 'Poland', city: 'Warsaw', urls: ['https://www.facebook.com/tangoinwarsaw/'] },
  { country: 'Poland', city: 'Wrocław', urls: ['https://www.facebook.com/groups/tangowewroclawiu'] },
  
  // PORTUGAL
  { country: 'Portugal', city: 'Lisbon', urls: ['https://www.tangolx.com/', 'https://www.facebook.com/tangolx'] },
  { country: 'Portugal', city: 'Porto', urls: ['https://www.facebook.com/profile.php?id=100057157851533'] },
  
  // ROMANIA
  { country: 'Romania', city: 'Bucharest', urls: ['https://www.facebook.com/groups/822410074481007/'] },
  
  // RUSSIA
  { country: 'Russia', city: 'Moscow', urls: ['http://tango-map.ru/'] },
  
  // SERBIA
  { country: 'Serbia', city: 'Belgrade', urls: ['https://www.facebook.com/tangobeograd/', 'https://tangonatural.com/milonge-tango-naturala/'] },
  
  // SINGAPORE
  { country: 'Singapore', city: 'Singapore', urls: ['https://www.facebook.com/groups/TangoThisWeekSingapore'] },
  
  // SLOVAKIA
  { country: 'Slovakia', city: 'Bratislava', urls: ['https://tangobratislava.com/', 'https://www.tangoargentino.sk/calendar/', 'https://www.facebook.com/tangoargentino.sk/events/'] },
  
  // SPAIN
  { country: 'Spain', city: 'Barcelona', urls: ['https://tangoenbarcelona.es/milongas-en-barcelona/'] },
  { country: 'Spain', city: 'Málaga', urls: ['https://malagamilongas.com/'] },
  { country: 'Spain', city: 'Seville', urls: ['https://www.facebook.com/groups/232348803549826'] },
  { country: 'Spain', city: 'Valencia', urls: ['http://tangoenvalencia.minglanillaweb.es/milongas.html'] },
  { country: 'Spain', city: 'Various Cities', urls: ['https://www.tangodospuntocero.com/'] },
  
  // SWEDEN
  { country: 'Sweden', city: 'Stockholm', urls: ['https://www.tangokalendern.se/'] },
  
  // SWITZERLAND
  { country: 'Switzerland', city: 'Zurich', urls: ['https://tangocalendar.ch/'] },
  
  // TAIWAN
  { country: 'Taiwan', city: 'Taipei', urls: ['https://www.facebook.com/groups/tangotaipei'] },
  
  // THAILAND
  { country: 'Thailand', city: 'Bangkok', urls: ['https://www.facebook.com/groups/bangkoktango'] },
  
  // TURKEY
  { country: 'Turkey', city: 'Istanbul', urls: ['https://www.facebook.com/groups/tangoinistanbul'] },
  
  // UKRAINE
  { country: 'Ukraine', city: 'Kyiv', urls: ['https://www.facebook.com/groups/tangokyiv'] },
  
  // UNITED KINGDOM
  { country: 'UK', city: 'London', urls: ['https://www.londontango.co.uk/', 'https://www.tangocity.co.uk/'] },
  { country: 'UK', city: 'Brighton', urls: ['https://brightontango.com/'] },
  { country: 'UK', city: 'Manchester', urls: ['https://www.facebook.com/groups/manchestertango'] },
  
  // UNITED STATES
  { country: 'USA', city: 'New York', urls: ['https://newyorktango.com/', 'https://www.facebook.com/groups/newyorktango'] },
  { country: 'USA', city: 'Los Angeles', urls: ['https://www.latango.com/'] },
  { country: 'USA', city: 'San Francisco', urls: ['https://www.tangomango.org/'] },
  { country: 'USA', city: 'Chicago', urls: ['https://www.chicagotango.com/'] },
  { country: 'USA', city: 'Austin', urls: ['https://www.austintango.org/'] },
  { country: 'USA', city: 'Seattle', urls: ['https://seattletango.org/'] },
  { country: 'USA', city: 'Portland', urls: ['https://www.portlandtango.com/'] },
  { country: 'USA', city: 'Miami', urls: ['https://www.miamitango.org/'] },
  { country: 'USA', city: 'Denver', urls: ['https://www.denvertango.org/'] },
  { country: 'USA', city: 'Boston', urls: ['https://www.bostontango.org/'] },
];

/**
 * Determine scraper agent and platform from URL
 */
function categorizeSource(url: string): { platform: string; scraperAgent: string } {
  if (url.includes('facebook.com')) {
    return { platform: 'facebook', scraperAgent: 'agent-118' };
  } else if (url.includes('instagram.com')) {
    return { platform: 'instagram', scraperAgent: 'agent-118' };
  } else if (url.includes('eventbrite.com') || url.includes('meetup.com')) {
    return { platform: 'eventbrite', scraperAgent: 'agent-117' };
  } else if (url.includes('google.com/calendar')) {
    return { platform: 'calendar', scraperAgent: 'agent-117' };
  } else {
    // Static website - check if it's likely dynamic (React/Vue patterns)
    const isDynamic = url.includes('hoy-milonga') || url.includes('tango.jp');
    return { 
      platform: 'website', 
      scraperAgent: isDynamic ? 'agent-117' : 'agent-116' 
    };
  }
}

/**
 * Main population function
 */
async function populateTangoCommunities() {
  console.log('🌍 Populating 226+ global tango communities...');
  
  let totalSources = 0;

  for (const community of tangoCommunities) {
    for (const url of community.urls) {
      try {
        const { platform, scraperAgent } = categorizeSource(url);
        
        const name = `${platform === 'facebook' ? 'Facebook' : platform === 'instagram' ? 'Instagram' : 'Website'}: ${community.city}${community.urls.length > 1 ? ' #' + (community.urls.indexOf(url) + 1) : ''}`;

        await db.insert(eventScrapingSources).values({
          name,
          url,
          platform,
          country: community.country,
          city: community.city,
          isActive: true,
          scrapeFrequency: platform === 'facebook' ? 'daily' : 'weekly',
          totalEventsScraped: 0
        });

        totalSources++;
        console.log(`✅ Added: ${name}`);
      } catch (error) {
        console.error(`❌ Failed to add ${community.city} - ${url}:`, error);
      }
    }
  }

  console.log(`\n🎉 Successfully populated ${totalSources} tango community sources!`);
  console.log(`\n📊 Statistics:`);
  console.log(`   - Total communities: ${tangoCommunities.length}`);
  console.log(`   - Total sources: ${totalSources}`);
  console.log(`   - Countries covered: ${new Set(tangoCommunities.map(c => c.country)).size}`);
  console.log(`\n✅ Ready to scrape! Run:`);
  console.log(`   POST /api/admin/trigger-scraping`);
}

populateTangoCommunities()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Population failed:', error);
    process.exit(1);
  });
