/**
 * RUN ALL SCRAPERS SCRIPT
 * MB.MD Pattern: Execute scrapers to populate events for all cities
 * 
 * Pipeline (7 steps):
 * 1. TangoMango scraper (US cities + regional)
 * 2. HoyMilonga Playwright scraper (30+ cities)
 * 3. TangoCat scraper (international festivals)
 * 4. TangoFestivals scraper
 * 5. Ingest approved scraped events
 * 6. Detect & create series from recurring events (ALL cities)
 * 7. Generate 12-month placeholders for all active series
 * 
 * IMPORTANT: HoyMilonga is a JavaScript SPA - requires Playwright scraper!
 * The HTML/Cheerio version DOES NOT WORK because events are loaded dynamically.
 */

import { HoyMilongaScraper } from '../agents/scraping/HoyMilongaScraper';  // Playwright version - 30+ cities
import { TangoMangoScraper } from '../agents/scraping/TangoMangoScraper';
import { TangoCatScraper } from '../agents/scraping/TangoCatScraper';
import { TangoFestivalsScraper } from '../agents/scraping/TangoFestivalsScraper';
import { scrapedEventIngestionService } from '../services/ScrapedEventIngestionService';
import { RecurringEventDetector } from '../services/scraping/RecurringEventDetector';
import { db } from '@shared/db';
import { scrapedEvents, events, groups, eventSeries } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
  console.log('========================================');
  console.log('RUN ALL SCRAPERS - MB.MD Pattern');
  console.log('========================================\n');
  
  // Step 1: Run TangoMango scraper (US cities + regional multi-county - most reliable)
  console.log('[1/7] Running TangoMango scraper (US cities + regional multi-county)...');
  try {
    const tangoMangoScraper = new TangoMangoScraper();
    const mangoCount = await tangoMangoScraper.scrapeAll(); // Uses both city and regional configs
    console.log(`TangoMango: Scraped ${mangoCount} events (cities + regional)`);
  } catch (error: any) {
    console.error('TangoMango error:', error.message);
  }
  
  // Step 2: Run HoyMilonga Playwright scraper (30+ cities including Buenos Aires, Berlin, Paris, Istanbul)
  // CRITICAL: HoyMilonga is a JavaScript SPA - must use Playwright, not HTML scraper
  console.log('\n[2/7] Running HoyMilonga Playwright scraper (30+ cities)...');
  try {
    const hoyMilongaScraper = new HoyMilongaScraper();
    const sourceId = 1; // HoyMilonga source ID
    const hoyCount = await hoyMilongaScraper.scrapeAllCities(sourceId);
    console.log(`HoyMilonga: Scraped ${hoyCount} events from 30+ cities`);
  } catch (error: any) {
    console.error('HoyMilonga error:', error.message);
  }
  
  // Step 3: Run TangoCat scraper (international festivals)
  console.log('\n[3/7] Running TangoCat scraper (festivals)...');
  try {
    const tangoCatScraper = new TangoCatScraper();
    const catCount = await tangoCatScraper.scrapeAllYears(1);
    console.log(`TangoCat: Scraped ${catCount} festivals`);
  } catch (error: any) {
    console.error('TangoCat error:', error.message);
  }
  
  // Step 4: Run TangoFestivals scraper
  console.log('\n[4/7] Running TangoFestivals scraper...');
  try {
    const tangoFestivalsScraper = new TangoFestivalsScraper();
    const festivalsCount = await tangoFestivalsScraper.scrapeAllEvents(1);
    console.log(`TangoFestivals: Scraped ${festivalsCount} events`);
  } catch (error: any) {
    console.error('TangoFestivals error:', error.message);
  }
  
  // Step 5: Check scraped events status and ingest
  console.log('\n[5/7] Checking and ingesting scraped events...');
  const scrapedCountResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM scraped_events WHERE status = 'pending'
  `);
  const scrapedCount = scrapedCountResult.rows[0] as any;
  console.log(`Pending scraped events: ${scrapedCount?.count || 0}`);
  
  // Auto-approve pending events
  if (scrapedCount?.count > 0) {
    await db.execute(sql`UPDATE scraped_events SET status = 'approved' WHERE status = 'pending'`);
    console.log('Auto-approved pending events for ingestion');
  }
  
  // Ingest approved events
  console.log('Ingesting approved events...');
  try {
    const ingestResult = await scrapedEventIngestionService.backfillApproved();
    console.log(`Ingested: ${ingestResult.ingested} events, Failed: ${ingestResult.failed}`);
  } catch (error: any) {
    console.error('Ingestion error:', error.message);
  }
  
  // Step 6: Detect and create series from recurring events across ALL cities
  console.log('\n[6/7] Detecting recurring events and creating series (ALL cities)...');
  try {
    const seriesResult = await RecurringEventDetector.detectAndCreateSeriesFromEvents();
    console.log(`Series detection: ${seriesResult.seriesCreated} new series, ${seriesResult.eventsLinked} events linked`);
  } catch (error: any) {
    console.error('Series detection error:', error.message);
  }
  
  // Step 7: Generate 12-month placeholders for all active series
  console.log('\n[7/7] Generating 12-month placeholders for all active series...');
  try {
    const placeholderResult = await RecurringEventDetector.generatePlaceholdersForAllActiveSeries();
    console.log(`Placeholders: ${placeholderResult.totalCreated} created, ${placeholderResult.totalSkipped} skipped`);
  } catch (error: any) {
    console.error('Placeholder generation error:', error.message);
  }
  
  // Final stats
  console.log('\n========================================');
  console.log('FINAL STATS');
  console.log('========================================');
  
  const cityCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM groups WHERE type = 'city'`);
  const eventCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM events`);
  const seriesCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM event_series WHERE is_active = true`);
  const placeholderCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM events WHERE is_placeholder = true`);
  const scrapedTotalResult = await db.execute(sql`SELECT COUNT(*) as count FROM scraped_events`);
  
  console.log(`Cities: ${(cityCountResult.rows[0] as any)?.count}`);
  console.log(`Total Events: ${(eventCountResult.rows[0] as any)?.count}`);
  console.log(`Active Series: ${(seriesCountResult.rows[0] as any)?.count}`);
  console.log(`Placeholder Events (12-month): ${(placeholderCountResult.rows[0] as any)?.count}`);
  console.log(`Scraped Events: ${(scrapedTotalResult.rows[0] as any)?.count}`);
  
  // Show cities with most events
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
  
  console.log('\nTop cities by events:');
  for (const row of topCities.rows as any[]) {
    console.log(`  ${row.city}, ${row.country}: ${row.event_count} events`);
  }
}

main().catch(console.error);
