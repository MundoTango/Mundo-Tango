import { db } from './server/db/index.js';
import { sql } from 'drizzle-orm';

console.log('🔧 Fixing published_at timestamps...\n');

try {
  // Update all published events to have published_at timestamp
  const result = await db.execute(sql`
    UPDATE events 
    SET published_at = NOW()
    WHERE status = 'published' AND published_at IS NULL
  `);
  
  console.log('✅ Fixed published_at for all published events!');
  
  // Get count
  const countResult = await db.execute(sql`
    SELECT COUNT(*) as count 
    FROM events 
    WHERE status = 'published' AND published_at IS NOT NULL
  `);
  
  console.log(`   Total published events with published_at: ${countResult.rows[0].count}`);
  console.log('\n🎉 Events should now appear in the UI!');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
