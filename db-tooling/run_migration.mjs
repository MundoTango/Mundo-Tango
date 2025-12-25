import { db } from './server/db/index.js';
import { sql } from 'drizzle-orm';

console.log('Adding missing columns to scraped_events table...');

try {
  await db.execute(sql`
    ALTER TABLE scraped_events 
    ADD COLUMN IF NOT EXISTS city VARCHAR(255),
    ADD COLUMN IF NOT EXISTS country VARCHAR(255),
    ADD COLUMN IF NOT EXISTS group_id INTEGER
  `);
  
  console.log('✅ Columns added successfully!');
  console.log('   - city VARCHAR(255)');
  console.log('   - country VARCHAR(255)');
  console.log('   - group_id INTEGER');
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
