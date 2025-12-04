/**
 * ADD COMPETITOR PLATFORMS SCRIPT
 * MB.MD Implementation
 * 
 * Adds 15 additional competitor platforms to the event scraping sources
 * These platforms are known tango event aggregators globally
 */

import { db } from '../server/db';
import { eventScrapingSources } from '../shared/schema';

interface CompetitorPlatform {
  name: string;
  url: string;
  platform: 'website' | 'facebook' | 'instagram';
  scraperType: 'static' | 'js';
  city?: string;
  country?: string;
  region?: string;
  priority: number;
  customSelectors?: any;
}

const COMPETITOR_PLATFORMS: CompetitorPlatform[] = [
  {
    name: 'TangoVida',
    url: 'https://tangovida.org',
    platform: 'website',
    scraperType: 'js',
    country: 'International',
    priority: 8,
    customSelectors: {
      eventList: ['.event-card', '.tango-event'],
      title: ['h2', '.event-title'],
      date: ['.event-date', 'time'],
      location: ['.venue', '.location']
    }
  },
  {
    name: 'El Recodo',
    url: 'https://el-recodo.com',
    platform: 'website',
    scraperType: 'static',
    country: 'International',
    priority: 7,
    customSelectors: {
      eventList: ['.listing-item', '.event'],
      title: ['h3', '.title'],
      date: ['.date'],
      location: ['.place']
    }
  },
  {
    name: 'MercadoTango',
    url: 'https://mercadotango.com',
    platform: 'website',
    scraperType: 'js',
    city: 'Buenos Aires',
    country: 'Argentina',
    priority: 9,
    customSelectors: {
      eventList: ['.milonga-card', '.event-item'],
      title: ['.milonga-name', 'h3'],
      date: ['.fecha', '.date'],
      location: ['.direccion', '.address']
    }
  },
  {
    name: 'TangoApp.ar',
    url: 'https://tangoapp.ar',
    platform: 'website',
    scraperType: 'js',
    city: 'Buenos Aires',
    country: 'Argentina',
    priority: 8,
    customSelectors: {
      eventList: ['.evento', '.event-card'],
      title: ['.nombre', 'h2'],
      date: ['.horario', '.fecha'],
      location: ['.lugar']
    }
  },
  {
    name: 'TangoPartner',
    url: 'https://tangopartner.com',
    platform: 'website',
    scraperType: 'js',
    country: 'International',
    priority: 6,
    customSelectors: {
      eventList: ['.partner-event', '.event'],
      title: ['h3', '.event-name'],
      date: ['.event-time'],
      location: ['.event-venue']
    }
  },
  {
    name: 'PointsOfTango',
    url: 'https://pointsoftango.app',
    platform: 'website',
    scraperType: 'js',
    country: 'International',
    priority: 8,
    customSelectors: {
      eventList: ['.point-card', '.event-marker'],
      title: ['.point-name', 'h3'],
      date: ['.point-date'],
      location: ['.point-address']
    }
  },
  {
    name: 'TangoCat',
    url: 'https://tangocat.net',
    platform: 'website',
    scraperType: 'static',
    city: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    priority: 7,
    customSelectors: {
      eventList: ['.milonga-listing', '.evento'],
      title: ['.nom', 'h3'],
      date: ['.data', '.fecha'],
      location: ['.lloc', '.lugar']
    }
  },
  {
    name: 'TangoMeet',
    url: 'https://tangomeet.com',
    platform: 'website',
    scraperType: 'static',
    country: 'International',
    priority: 5,
    customSelectors: {
      eventList: ['.meet-event', '.gathering'],
      title: ['.meet-title'],
      date: ['.meet-when'],
      location: ['.meet-where']
    }
  },
  {
    name: 'TangoMarathons',
    url: 'https://tangomarathons.com',
    platform: 'website',
    scraperType: 'static',
    country: 'International',
    priority: 9,
    customSelectors: {
      eventList: ['.marathon-card', '.festival-item'],
      title: ['h2', '.marathon-name'],
      date: ['.marathon-dates', '.dates'],
      location: ['.marathon-city', '.location']
    }
  },
  {
    name: 'Demilongas',
    url: 'https://demilongas.com',
    platform: 'website',
    scraperType: 'js',
    country: 'International',
    priority: 6,
    customSelectors: {
      eventList: ['.demilonga', '.practica'],
      title: ['.demilonga-name'],
      date: ['.horario'],
      location: ['.direccion']
    }
  },
  {
    name: 'TangoMacao',
    url: 'https://tangomacao.com',
    platform: 'website',
    scraperType: 'static',
    city: 'Macao',
    country: 'China',
    region: 'Asia',
    priority: 6,
    customSelectors: {
      eventList: ['.event-listing', '.tango-event'],
      title: ['.event-title'],
      date: ['.event-date'],
      location: ['.event-venue']
    }
  },
  {
    name: 'HumansOfTango',
    url: 'https://humansoftango.com',
    platform: 'website',
    scraperType: 'static',
    country: 'International',
    priority: 5,
    customSelectors: {
      eventList: ['.human-event', '.gathering'],
      title: ['.event-name', 'h3'],
      date: ['.event-when'],
      location: ['.event-location']
    }
  },
  {
    name: 'TangoDJConnect',
    url: 'https://tangodjconnect.com',
    platform: 'website',
    scraperType: 'static',
    country: 'International',
    priority: 4,
    customSelectors: {
      eventList: ['.dj-gig', '.event'],
      title: ['.gig-name'],
      date: ['.gig-date'],
      location: ['.gig-venue']
    }
  },
  {
    name: 'Abrazo App',
    url: 'https://abrazo.app',
    platform: 'website',
    scraperType: 'js',
    country: 'International',
    priority: 7,
    customSelectors: {
      eventList: ['.abrazo-event', '.milonga-card'],
      title: ['.event-name', 'h3'],
      date: ['.event-datetime'],
      location: ['.event-place']
    }
  },
  {
    name: 'Tanguear',
    url: 'https://tanguear.com',
    platform: 'website',
    scraperType: 'js',
    city: 'Buenos Aires',
    country: 'Argentina',
    priority: 8,
    customSelectors: {
      eventList: ['.tanguear-milonga', '.evento'],
      title: ['.nombre-milonga', 'h2'],
      date: ['.dia-hora', '.horario'],
      location: ['.direccion', '.barrio']
    }
  }
];

async function addCompetitorPlatforms(): Promise<void> {
  console.log('🚀 Adding 15 competitor platforms to scraping sources...\n');

  let added = 0;
  let skipped = 0;

  for (const platform of COMPETITOR_PLATFORMS) {
    try {
      // Check if already exists
      const existing = await db.query.eventScrapingSources.findFirst({
        where: (sources, { eq }) => eq(sources.url, platform.url)
      });

      if (existing) {
        console.log(`⏭️  Skipping ${platform.name} - already exists`);
        skipped++;
        continue;
      }

      // Insert new source
      await db.insert(eventScrapingSources).values({
        name: platform.name,
        url: platform.url,
        platform: platform.platform,
        scraperType: platform.scraperType,
        city: platform.city,
        country: platform.country,
        region: platform.region,
        priority: platform.priority,
        customSelectors: platform.customSelectors,
        isActive: true,
        lastScrapedAt: null,
        totalEventsScraped: 0,
        scrapeFrequency: 'daily',
        status: 'active',
        notes: `Competitor platform added via MB.MD scraping system`
      });

      console.log(`✅ Added: ${platform.name} (${platform.url})`);
      added++;

    } catch (error) {
      console.error(`❌ Failed to add ${platform.name}:`, error);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Added: ${added}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${COMPETITOR_PLATFORMS.length}`);
}

// Run if executed directly
if (require.main === module) {
  addCompetitorPlatforms()
    .then(() => {
      console.log('\n✅ Competitor platforms script complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { addCompetitorPlatforms, COMPETITOR_PLATFORMS };
