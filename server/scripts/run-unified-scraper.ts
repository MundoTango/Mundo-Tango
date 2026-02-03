/**
 * RUN UNIFIED EVENT SCRAPER
 * MB.MD Pattern: AI-powered scraping from all configured sources
 */

import { unifiedEventScraper } from '../services/UnifiedEventScraper';
import { scrapedEventIngestionService } from '../services/ScrapedEventIngestionService';
import { db } from '@shared/db';
import { scrapedEvents, events, groups, eventScrapingSources } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
  console.log('========================================');
  console.log('UNIFIED EVENT SCRAPER - AI-Powered');
  console.log('========================================\n');
  
  // Check sources count
  const sources = await db.query.eventScrapingSources.findMany({
    where: eq(eventScrapingSources.isActive, true)
  });
  console.log(`Active scraping sources: ${sources.length}\n`);
  
  // Step 1: Run unified scraper on all sources
  console.log('[1/3] Running AI-powered unified scraper...');
  console.log('(This may take several minutes)\n');
  
  try {
    const result = await unifiedEventScraper.scrapeAllSources();
    console.log(`\nUnified Scraper Complete:`);
    console.log(`  Total events found: ${result.total}`);
    console.log(`  Sources processed: ${result.sources}`);
  } catch (error: any) {
    console.error('Unified scraper error:', error.message);
  }
  
  // Step 2: Check scraped events
  console.log('\n[2/3] Checking scraped events...');
  const pendingCount = await db.select({ count: sql`count(*)` }).from(scrapedEvents).where(eq(scrapedEvents.status, 'pending'));
  const approvedCount = await db.select({ count: sql`count(*)` }).from(scrapedEvents).where(eq(scrapedEvents.status, 'approved'));
  console.log(`Pending: ${pendingCount[0]?.count || 0}, Approved: ${approvedCount[0]?.count || 0}`);
  
  // Step 3: Auto-approve pending events and ingest
  console.log('\n[3/3] Auto-approving and ingesting events...');
  
  // Auto-approve all pending scraped events
  const approved = await db.update(scrapedEvents)
    .set({ status: 'approved' })
    .where(eq(scrapedEvents.status, 'pending'))
    .returning({ id: scrapedEvents.id });
  console.log(`Auto-approved: ${approved.length} events`);
  
  // Ingest all approved events
  try {
    const ingestResult = await scrapedEventIngestionService.ingestAllApproved();
    console.log(`Ingested: ${ingestResult.ingested} events`);
    if (ingestResult.errors.length > 0) {
      console.log(`Ingestion errors: ${ingestResult.errors.length}`);
    }
  } catch (error: any) {
    console.error('Ingestion error:', error.message);
  }
  
  // Final stats
  console.log('\n========================================');
  console.log('FINAL STATS');
  console.log('========================================');
  
  const cityCount = await db.select({ count: sql`count(*)` }).from(groups).where(eq(groups.type, 'city'));
  const eventCount = await db.select({ count: sql`count(*)` }).from(events);
  const scrapedTotal = await db.select({ count: sql`count(*)` }).from(scrapedEvents);
  
  console.log(`Cities: ${cityCount[0]?.count}`);
  console.log(`Events: ${eventCount[0]?.count}`);
  console.log(`Total Scraped Records: ${scrapedTotal[0]?.count}`);
  
  // Show top cities
  const topCities = await db.execute(sql`
    SELECT g.city, g.country, COUNT(e.id) as event_count
    FROM groups g
    LEFT JOIN events e ON e.group_id = g.id
    WHERE g.type = 'city'
    GROUP BY g.id, g.city, g.country
    HAVING COUNT(e.id) > 0
    ORDER BY event_count DESC
    LIMIT 15
  `);
  
  console.log('\nTop cities by events:');
  for (const row of topCities.rows as any[]) {
    console.log(`  ${row.city}, ${row.country}: ${row.event_count} events`);
  }
}

main().catch(console.error);
