import { db } from './server/db/index.js';
import { sql } from 'drizzle-orm';

console.log('📊 Checking event counts in both tables...\n');

try {
  // Check scraped_events table
  const scrapedResult = await db.execute(sql`SELECT COUNT(*) as count FROM scraped_events`);
  const scrapedCount = scrapedResult.rows[0].count;
  
  // Check events table
  const eventsResult = await db.execute(sql`SELECT COUNT(*) as count FROM events`);
  const eventsCount = eventsResult.rows[0].count;
  
  console.log('✅ Results:');
  console.log(`   scraped_events table: ${scrapedCount} events`);
  console.log(`   events table: ${eventsCount} events`);
  console.log();
  
  if (scrapedCount > 0 && eventsCount === 0) {
    console.log('🚨 Issue: Events are in scraped_events but not in events table!');
    console.log('   The UI reads from events table, so no events are displayed.');
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
