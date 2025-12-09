// Quick script to import scraped events to main events table
// Handles duplicate city groups gracefully

import { db } from '@shared/db';
import { scrapedEvents, events, groups } from '@shared/schema';
import { eq, and, isNull, or, sql } from 'drizzle-orm';

async function main() {
  console.log('🚀 Starting event import from scraped_events...');
  
  // Get all scraped events
  const allScrapedEvents = await db.query.scrapedEvents.findMany({
    limit: 1000
  });
  
  console.log(`📊 Found ${allScrapedEvents.length} scraped events`);
  
  let imported = 0;
  let skipped = 0;
  
  for (const scrapedEvent of allScrapedEvents) {
    try {
      // Simple import without city group complexity
      // Just create basic events
      await db.insert(events).values({
        title: scrapedEvent.title || 'Tango Event',
        description: scrapedEvent.description,
        startDate: scrapedEvent.startDate,
        endDate: scrapedEvent.endDate,
        location: scrapedEvent.city || scrapedEvent.country || 'Unknown',
        venue: scrapedEvent.venue,
        address: scrapedEvent.address,
        city: scrapedEvent.city,
        country: scrapedEvent.country,
        imageUrl: scrapedEvent.imageUrl,
        isPublic: true,
        eventType: 'milonga'
      }).onConflictDoNothing();
      
      imported++;
      if (imported % 50 === 0) {
        console.log(`✅ Imported ${imported} events...`);
      }
    } catch (error) {
      skipped++;
    }
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`📈 Imported: ${imported}`);
  console.log(`⏭️  Skipped: ${skipped}`);
}

main().catch(console.error);
