/**
 * RUN ALL SCRAPERS IN PARALLEL - MB.MD Pattern 7
 * Executes HoyMilonga, TangoCat, TangoMango, TangoFestivals simultaneously
 * 
 * Note: Uses services/scraping/HoyMilongaScraper (no sourceId required)
 * The agents/scraping version requires sourceId but services version doesn't
 */

import { hoyMilongaScraper } from '../services/HoyMilongaScraper';
import { TangoCatScraper } from '../agents/scraping/TangoCatScraper';
import { TangoMangoScraper } from '../agents/scraping/TangoMangoScraper';
import { TangoFestivalsScraper } from '../agents/scraping/TangoFestivalsScraper';
import { scrapedEventIngestionService } from '../services/ScrapedEventIngestionService';
import { db } from '@shared/db';
import { scrapedEvents, events, groups, eventScrapingSources } from '@shared/schema';
import { sql, ilike } from 'drizzle-orm';

async function runHoyMilonga(): Promise<number> {
  console.log('[HoyMilonga] Starting...');
  try {
    const result = await hoyMilongaScraper.scrapeAllCities();
    console.log(`[HoyMilonga] ✅ Found ${result.totalFound}, stored ${result.totalStored}`);
    return result.totalStored;
  } catch (error: any) {
    console.error('[HoyMilonga] ❌ Error:', error.message);
    return 0;
  }
}

async function runTangoCat(): Promise<number> {
  console.log('[TangoCat] Starting...');
  try {
    // Get or create source ID for TangoCat
    const source = await db.query.eventScrapingSources.findFirst({
      where: ilike(eventScrapingSources.name, '%TangoCat%')
    });
    const sourceId = source?.id || 1;
    
    const scraper = new TangoCatScraper();
    const count = await scraper.scrapeAllYears(sourceId);
    console.log(`[TangoCat] ✅ Scraped ${count} events`);
    return count;
  } catch (error: any) {
    console.error('[TangoCat] ❌ Error:', error.message);
    return 0;
  }
}

async function runTangoMango(): Promise<number> {
  console.log('[TangoMango] Starting (cities + regional multi-county)...');
  try {
    const scraper = new TangoMangoScraper();
    const count = await scraper.scrapeAll(); // Uses both city and regional configs
    console.log(`[TangoMango] ✅ Scraped ${count} events (cities + regional)`);
    return count;
  } catch (error: any) {
    console.error('[TangoMango] ❌ Error:', error.message);
    return 0;
  }
}

async function runTangoFestivals(): Promise<number> {
  console.log('[TangoFestivals] Starting...');
  try {
    // Get or create source ID for TangoFestivals
    const source = await db.query.eventScrapingSources.findFirst({
      where: ilike(eventScrapingSources.name, '%TangoFestivals%')
    });
    const sourceId = source?.id || 1;
    
    const scraper = new TangoFestivalsScraper();
    const count = await scraper.scrapeAllEvents(sourceId);
    console.log(`[TangoFestivals] ✅ Scraped ${count} events`);
    return count;
  } catch (error: any) {
    console.error('[TangoFestivals] ❌ Error:', error.message);
    return 0;
  }
}

async function main() {
  console.log('========================================');
  console.log('MB.MD PATTERN 7: PARALLEL SCRAPING');
  console.log('========================================\n');
  
  const startTime = Date.now();
  
  // Run all scrapers in parallel (MB.MD Pattern 7)
  console.log('Phase 1: Running all scrapers in parallel...\n');
  
  const results = await Promise.allSettled([
    runHoyMilonga(),
    runTangoCat(),
    runTangoMango(),
    runTangoFestivals()
  ]);
  
  const scraperResults = {
    hoyMilonga: results[0].status === 'fulfilled' ? results[0].value : 0,
    tangoCat: results[1].status === 'fulfilled' ? results[1].value : 0,
    tangoMango: results[2].status === 'fulfilled' ? results[2].value : 0,
    tangoFestivals: results[3].status === 'fulfilled' ? results[3].value : 0,
  };
  
  const totalScraped = Object.values(scraperResults).reduce((a, b) => a + b, 0);
  
  console.log('\n========================================');
  console.log('Phase 1 Complete: Scraping Results');
  console.log('========================================');
  console.log(`HoyMilonga: ${scraperResults.hoyMilonga}`);
  console.log(`TangoCat: ${scraperResults.tangoCat}`);
  console.log(`TangoMango: ${scraperResults.tangoMango}`);
  console.log(`TangoFestivals: ${scraperResults.tangoFestivals}`);
  console.log(`TOTAL SCRAPED: ${totalScraped}`);
  
  // Phase 2: Check scraped events
  console.log('\n========================================');
  console.log('Phase 2: Checking Scraped Events');
  console.log('========================================');
  
  const scrapedCountResult = await db.execute(sql`
    SELECT status, COUNT(*) as count 
    FROM scraped_events 
    GROUP BY status
  `);
  
  for (const row of scrapedCountResult.rows as any[]) {
    console.log(`${row.status}: ${row.count} events`);
  }
  
  // Phase 3: Ingest approved events
  console.log('\n========================================');
  console.log('Phase 3: Ingesting to Events Table');
  console.log('========================================');
  
  try {
    const ingestResult = await scrapedEventIngestionService.backfillApproved();
    console.log(`Ingested: ${ingestResult.ingested} events`);
    console.log(`Failed: ${ingestResult.failed} events`);
  } catch (error: any) {
    console.error('Ingestion error:', error.message);
  }
  
  // Final stats
  console.log('\n========================================');
  console.log('FINAL STATISTICS');
  console.log('========================================');
  
  const cityCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM groups WHERE type = 'city'`);
  const eventCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM events`);
  const scrapedTotalResult = await db.execute(sql`SELECT COUNT(*) as count FROM scraped_events`);
  
  console.log(`Total Cities: ${(cityCountResult.rows[0] as any)?.count}`);
  console.log(`Total Events: ${(eventCountResult.rows[0] as any)?.count}`);
  console.log(`Total Scraped Events: ${(scrapedTotalResult.rows[0] as any)?.count}`);
  
  // Cities with events
  const citiesWithEventsResult = await db.execute(sql`
    SELECT COUNT(DISTINCT city) as count FROM events WHERE city IS NOT NULL
  `);
  console.log(`Cities with Events: ${(citiesWithEventsResult.rows[0] as any)?.count}`);
  
  // Top 10 cities
  const topCities = await db.execute(sql`
    SELECT g.city, g.country, COUNT(e.id) as event_count
    FROM groups g
    LEFT JOIN events e ON e.group_id = g.id
    WHERE g.type = 'city'
    GROUP BY g.id, g.city, g.country
    HAVING COUNT(e.id) > 0
    ORDER BY event_count DESC
    LIMIT 10
  `);
  
  console.log('\nTop 10 Cities by Events:');
  for (const row of topCities.rows as any[]) {
    console.log(`  ${row.city}, ${row.country}: ${row.event_count} events`);
  }
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n⏱️ Total time: ${elapsed}s`);
}

main().catch(console.error);
