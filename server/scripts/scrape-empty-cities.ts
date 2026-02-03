/**
 * Scrape sources for cities without events
 * Uses UnifiedEventScraper with stored source URLs
 */

import { unifiedEventScraper } from '../services/UnifiedEventScraper';
import { db } from '@shared/db';
import { sql } from 'drizzle-orm';

async function scrapeEmptyCitySources() {
  // Get sources for cities without events
  const sources = await db.execute(sql`
    SELECT s.id, s.name, s.url, s.city, s.country
    FROM event_scraping_sources s
    WHERE s.is_active = true 
    AND s.url IS NOT NULL 
    AND LENGTH(s.url) > 10
    AND LOWER(s.city) NOT IN (
      SELECT DISTINCT LOWER(city) FROM events WHERE city IS NOT NULL
    )
    LIMIT 30
  `);
  
  console.log('Scraping', sources.rows.length, 'sources for empty cities...');
  console.log('========================================');
  
  let totalScraped = 0;
  let successCount = 0;
  
  for (const source of sources.rows as any[]) {
    try {
      console.log(`\n[${source.name}] ${source.city} - ${source.url?.slice(0, 50)}...`);
      
      // Use scrapeSource which stores events in scraped_events table
      const count = await unifiedEventScraper.scrapeSource({
        id: source.id,
        url: source.url,
        name: source.name,
        city: source.city,
        country: source.country
      });
      
      if (count > 0) {
        console.log(`  ✅ Stored ${count} events`);
        totalScraped += count;
        successCount++;
      } else {
        console.log(`  ⚠️ No events found`);
      }
    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message?.slice(0, 60)}`);
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Success: ${successCount}/${sources.rows.length} sources`);
  console.log(`Total events scraped: ${totalScraped}`);
  
  // Check pending
  const pending = await db.execute(sql`SELECT COUNT(*) as cnt FROM scraped_events WHERE status = 'pending'`);
  console.log(`Pending scraped events: ${(pending.rows[0] as any).cnt}`);
}

scrapeEmptyCitySources().catch(console.error);
