/**
 * RUN ALL SCRAPERS SCRIPT
 * MB.MD Pattern: Execute scrapers to populate events for all cities
 * 
 * Includes: HoyMilonga, TangoMango, TangoCat, TangoFestivals
 */

import { hoyMilongaScraper } from '../services/scraping/HoyMilongaScraper';
import { TangoMangoScraper } from '../agents/scraping/TangoMangoScraper';
import { TangoCatScraper } from '../agents/scraping/TangoCatScraper';
import { TangoFestivalsScraper } from '../agents/scraping/TangoFestivalsScraper';
import { scrapedEventIngestionService } from '../services/ScrapedEventIngestionService';
import { db } from '@shared/db';
import { scrapedEvents, events, groups } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
  console.log('========================================');
  console.log('RUN ALL SCRAPERS - MB.MD Pattern');
  console.log('========================================\n');
  
  // Step 1: Run TangoMango scraper (US cities - most reliable)
  console.log('[1/5] Running TangoMango scraper (US cities)...');
  try {
    const tangoMangoScraper = new TangoMangoScraper();
    const mangoCount = await tangoMangoScraper.scrapeAllCities();
    console.log(`TangoMango: Scraped ${mangoCount} events`);
  } catch (error: any) {
    console.error('TangoMango error:', error.message);
  }
  
  // Step 2: Run HoyMilonga scraper
  console.log('\n[2/5] Running HoyMilonga scraper...');
  try {
    const hoyResult = await hoyMilongaScraper.scrapeAllCities();
    console.log(`HoyMilonga: Found ${hoyResult.totalFound} events, stored ${hoyResult.totalStored}`);
  } catch (error: any) {
    console.error('HoyMilonga error:', error.message);
  }
  
  // Step 3: Run TangoCat scraper (international festivals)
  console.log('\n[3/5] Running TangoCat scraper (festivals)...');
  try {
    const tangoCatScraper = new TangoCatScraper();
    const catCount = await tangoCatScraper.scrapeAllYears(1);
    console.log(`TangoCat: Scraped ${catCount} festivals`);
  } catch (error: any) {
    console.error('TangoCat error:', error.message);
  }
  
  // Step 4: Run TangoFestivals scraper
  console.log('\n[4/5] Running TangoFestivals scraper...');
  try {
    const tangoFestivalsScraper = new TangoFestivalsScraper();
    const festivalsCount = await tangoFestivalsScraper.scrapeAllEvents(1);
    console.log(`TangoFestivals: Scraped ${festivalsCount} events`);
  } catch (error: any) {
    console.error('TangoFestivals error:', error.message);
  }
  
  // Step 5: Check scraped events status and ingest
  console.log('\n[5/5] Checking and ingesting scraped events...');
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
  
  // Final stats
  console.log('\n========================================');
  console.log('FINAL STATS');
  console.log('========================================');
  
  const cityCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM groups WHERE type = 'city'`);
  const eventCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM events`);
  const scrapedTotalResult = await db.execute(sql`SELECT COUNT(*) as count FROM scraped_events`);
  
  console.log(`Cities: ${(cityCountResult.rows[0] as any)?.count}`);
  console.log(`Events: ${(eventCountResult.rows[0] as any)?.count}`);
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
