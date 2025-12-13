// Test scraper for 5 TangoMango sources
import { db } from './server/db';
import { eventScrapingSources, events } from './server/db/schema';
import { eq, inArray } from 'drizzle-orm';

async function testScrapeFiveSources() {
  console.log('🎯 Starting incremental test scrape of 5 TangoMango sources...');
  
  try {
    // Get the 5 test sources
    const testSourceIds = [125, 171, 174, 111, 147];
    const sources = await db.query.eventScrapingSources.findMany({
      where: inArray(eventScrapingSources.id, testSourceIds)
    });
    
    console.log(`✅ Found ${sources.length} sources to scrape`);
    
    for (const source of sources) {
      console.log(`\n📍 Scraping: ${source.name} (${source.city})`);
      console.log(`   URL: ${source.url}`);
      
      // For now, insert a test event for each source to verify the flow
      const testEvent = {
        title: `Test Event from ${source.city}`,
        description: `This is a test event scraped from ${source.name}`,
        startDate: new Date('2025-12-20T19:00:00'),
        endDate: new Date('2025-12-20T23:00:00'),
        city: source.city,
        country: source.country,
        venue: `Test Venue in ${source.city}`,
        sourceUrl: source.url,
        sourceId: source.id,
        status: 'published',
        eventType: 'milonga'
      };
      
      // Insert event
      await db.insert(events).values(testEvent);
      console.log(`   ✅ Created test event: ${testEvent.title}`);
    }
    
    // Count total events
    const totalEvents = await db.select().from(events);
    console.log(`\n🎉 Test scrape complete! Total events in database: ${totalEvents.length}`);
    
  } catch (error) {
    console.error('❌ Error during test scrape:', error);
    process.exit(1);
  }
}

testScrapeFiveSources();
