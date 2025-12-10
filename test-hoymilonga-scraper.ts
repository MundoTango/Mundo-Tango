/**
 * Quick test script to run HoyMilonga scraper for Buenos Aires
 */
import { scrapingOrchestrator } from './server/agents/scraping/masterOrchestrator';
import { db } from './server/db';

async function testHoyMilongaScraper() {
  console.log('Starting HoyMilonga scraper test...');
  
  try {
    // Run the orchestrator
    console.log('Running scraping orchestrator...');
    await scrapingOrchestrator.orchestrate();
    
    // Check scraped events for Buenos Aires (groupId = 89)
    console.log('\nChecking scraped events for Buenos Aires (groupId=89)...');
    const result = await db.query(
      'SELECT COUNT(*) as count FROM scraped_events WHERE "groupId" = 89'
    );
    
    console.log(`Found ${result.rows[0].count} events for Buenos Aires`);
    
    // Show sample events
    const sampleEvents = await db.query(
      'SELECT title, "startTime", venue, city FROM scraped_events WHERE "groupId" = 89 LIMIT 5'
    );
    
    console.log('\nSample events:');
    sampleEvents.rows.forEach((event, i) => {
      console.log(`${i + 1}. ${event.title}`);
      console.log(`   Time: ${event.startTime}`);
      console.log(`   Venue: ${event.venue}`);
      console.log(`   City: ${event.city}`);
    });
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await db.end();
  }
}

testHoyMilongaScraper();
