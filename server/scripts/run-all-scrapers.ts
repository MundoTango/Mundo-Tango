/**
 * RUN ALL SCRAPERS SCRIPT
 * MB.MD Pattern: Execute scrapers to populate events for all cities
 */

import { hoyMilongaScraper } from '../services/scraping/HoyMilongaScraper';
import { scrapedEventIngestionService } from '../services/ScrapedEventIngestionService';
import { db } from '@shared/db';
import { scrapedEvents, events, groups } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
  console.log('========================================');
  console.log('RUN ALL SCRAPERS - MB.MD Pattern');
  console.log('========================================\n');
  
  // Step 1: Run HoyMilonga scraper
  console.log('[1/3] Running HoyMilonga scraper...');
  try {
    const hoyResult = await hoyMilongaScraper.scrapeAllCities();
    console.log(`HoyMilonga: Found ${hoyResult.totalFound} events, stored ${hoyResult.totalStored}`);
  } catch (error: any) {
    console.error('HoyMilonga error:', error.message);
  }
  
  // Step 2: Check scraped events status
  console.log('\n[2/3] Checking scraped events...');
  const [scrapedCount] = await db.execute(sql`
    SELECT COUNT(*) as count FROM scraped_events WHERE status = 'pending'
  `);
  console.log(`Pending scraped events: ${(scrapedCount as any).count || 0}`);
  
  // Step 3: Ingest approved/pending scraped events
  console.log('\n[3/3] Ingesting scraped events to main events table...');
  try {
    const ingestResult = await scrapedEventIngestionService.ingestAllApproved();
    console.log(`Ingested: ${ingestResult.ingested} events`);
    if (ingestResult.errors.length > 0) {
      console.log(`Errors: ${ingestResult.errors.length}`);
    }
  } catch (error: any) {
    console.error('Ingestion error:', error.message);
  }
  
  // Final stats
  console.log('\n========================================');
  console.log('FINAL STATS');
  console.log('========================================');
  
  const [cityCount] = await db.execute(sql`SELECT COUNT(*) as count FROM groups WHERE type = 'city'`);
  const [eventCount] = await db.execute(sql`SELECT COUNT(*) as count FROM events`);
  const [scrapedTotal] = await db.execute(sql`SELECT COUNT(*) as count FROM scraped_events`);
  
  console.log(`Cities: ${(cityCount as any).count}`);
  console.log(`Events: ${(eventCount as any).count}`);
  console.log(`Scraped Events: ${(scrapedTotal as any).count}`);
  
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
