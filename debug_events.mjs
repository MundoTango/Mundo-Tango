import { db } from './server/db/index.js';
import { sql } from 'drizzle-orm';

console.log('🔍 Debugging events table...\n');

try {
  // Get total count
  const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM events`);
  console.log(`✅ Total events in table: ${countResult.rows[0].count}`);
  
  // Get a sample event to see structure
  const sampleResult = await db.execute(sql`SELECT * FROM events LIMIT 1`);
  console.log('\n📋 Sample event structure:');
  console.log(JSON.stringify(sampleResult.rows[0], null, 2));
  
  // Check for missing required fields
  const fieldsCheck = await db.execute(sql`
    SELECT 
      COUNT(*) FILTER (WHERE start_date IS NULL) as null_start_dates,
      COUNT(*) FILTER (WHERE title IS NULL) as null_titles,
      COUNT(*) FILTER (WHERE status IS NULL) as null_status,
      COUNT(*) FILTER (WHERE status = 'published') as published_count
    FROM events
  `);
  console.log('\n📊 Field validation:');
  console.log(fieldsCheck.rows[0]);
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
