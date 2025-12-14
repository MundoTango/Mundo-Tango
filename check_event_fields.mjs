import { db } from './server/db/index.js';
import { sql } from 'drizzle-orm';

console.log('🔍 Checking event fields that UI might need...\n');

try {
  // Get column names from events table
  const columnsResult = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'events'
    ORDER BY ordinal_position
  `);
  
  console.log('📊 Events table columns:');
  columnsResult.rows.forEach(row => console.log(`  - ${row.column_name}`));
  
  // Check if event_date column exists
  const hasEventDate = columnsResult.rows.some(r => r.column_name === 'event_date');
  console.log(`\nℹ️  event_date column exists: ${hasEventDate}`);
  
  // Get sample published event with all fields
  const sampleResult = await db.execute(sql`
    SELECT id, title, start_date, end_date, location, city, country, 
           status, published_at, visibility
    FROM events 
    WHERE status = 'published' AND published_at IS NOT NULL
    LIMIT 1
  `);
  
  console.log('\n📋 Sample published event:');
  console.log(JSON.stringify(sampleResult.rows[0], null, 2));
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
