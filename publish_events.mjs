import { db } from './server/db/index.js';
import { sql } from 'drizzle-orm';

console.log('📦 Publishing scraped events to events table...\n');

try {
  // Copy events from scraped_events to events
  const result = await db.execute(sql`
    INSERT INTO events (
      title, description, start_date, end_date, location, 
      address, organizer, price, image_url, 
      status, city, country, created_at, updated_at
    )
    SELECT 
      title, description, start_date, end_date, location,
      address, organizer, price, image_url,
      'published' as status, city, country, 
      NOW() as created_at, NOW() as updated_at
    FROM scraped_events
    WHERE title IS NOT NULL
    ON CONFLICT DO NOTHING
  `);
  
  // Get new counts
  const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM events`);
  const totalEvents = countResult.rows[0].count;
  
  console.log('✅ Events published successfully!');
  console.log(`   Total events in events table: ${totalEvents}`);
  console.log('\n🎉 Refresh your UI to see the events!');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
