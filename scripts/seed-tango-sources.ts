/**
 * SEED TANGO SOURCES
 * Inserts all 80+ tango event sources into the database
 * and optionally profiles them to discover site structure
 * 
 * Usage:
 *   npx tsx scripts/seed-tango-sources.ts          # Insert only
 *   npx tsx scripts/seed-tango-sources.ts --profile  # Insert + profile
 */

import { db } from '../server/db';
import { eventScrapingSources } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { TANGO_SOURCES, SOURCE_STATS } from '../server/services/TangoSourceCatalog';
import { siteProfiler } from '../server/services/SiteProfiler';

const PROFILE_MODE = process.argv.includes('--profile');

async function seedTangoSources() {
  console.log('🎯 Seeding Tango Event Sources');
  console.log(`📊 Total sources: ${SOURCE_STATS.total}`);
  console.log(`   - Facebook: ${SOURCE_STATS.facebook}`);
  console.log(`   - Websites: ${SOURCE_STATS.websites}`);
  console.log(`   - Hoy Milonga: ${SOURCE_STATS.hoyMilonga}`);
  console.log(`   - Google Calendar: ${SOURCE_STATS.googleCalendar}`);
  console.log('');

  let inserted = 0;
  let skipped = 0;
  let profiledCount = 0;

  for (const source of TANGO_SOURCES) {
    // Check if already exists
    const existing = await db.query.eventScrapingSources.findFirst({
      where: eq(eventScrapingSources.url, source.url)
    });

    if (existing) {
      console.log(`⏭️  Skipping (exists): ${source.url}`);
      skipped++;
      continue;
    }

    // Determine platform from URL
    let platform = 'website';
    if (source.url.includes('facebook.com')) platform = 'facebook';
    else if (source.url.includes('instagram.com')) platform = 'instagram';
    else if (source.url.includes('calendar.google.com')) platform = 'google_calendar';
    else if (source.url.includes('hoy-milonga.com')) platform = 'hoy_milonga';

    // Extract name from URL hostname
    const hostname = new URL(source.url).hostname.replace('www.', '');
    const name = source.name || hostname;

    try {
      await db.insert(eventScrapingSources).values({
        name,
        url: source.url,
        platform,
        scraperType: platform === 'facebook' ? 'facebook' : 'static',
        priority: platform === 'hoy_milonga' ? 'high' : 'normal',
        country: source.country,
        city: source.city,
        isActive: true,
        scrapeFrequency: 'daily',
        submissionStatus: 'approved',
      });

      console.log(`✅ Inserted: ${name} (${source.city}, ${source.country})`);
      inserted++;

      // Optionally profile the site
      if (PROFILE_MODE && platform !== 'facebook') {
        try {
          const profile = await siteProfiler.profileSite(source.url, source.city, source.country);
          console.log(`   📊 Profiled: type=${profile.type}, health=${profile.healthScore}, ical=${!!profile.icalUrl}`);
          
          // Update with profile data
          await db.update(eventScrapingSources)
            .set({
              customSelectors: {
                type: profile.type,
                icalUrl: profile.icalUrl,
                apiEndpoint: profile.apiEndpoint,
                hasSchemaOrg: profile.hasSchemaOrg,
                selectors: profile.selectors,
                selectorVersion: profile.selectorVersion,
                healthScore: profile.healthScore,
              }
            })
            .where(eq(eventScrapingSources.url, source.url));
          
          profiledCount++;
        } catch (err) {
          console.log(`   ⚠️  Profile failed: ${(err as Error).message}`);
        }
      }
    } catch (err) {
      console.error(`❌ Failed to insert ${source.url}:`, (err as Error).message);
    }
  }

  console.log('');
  console.log('📊 Summary:');
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped: ${skipped}`);
  if (PROFILE_MODE) {
    console.log(`   Profiled: ${profiledCount}`);
  }
  console.log('');
  console.log('✅ Done!');
}

seedTangoSources()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
