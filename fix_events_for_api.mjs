import { db } from './server/db/index.js';
import { sql } from 'drizzle-orm';

console.log('🔧 Fixing events to match API expectations...\n');

try {
  // Update all published events to have proper defaults
  // Set user_id to 2 (admin user from earlier logs)
  const result = await db.execute(sql`
    UPDATE events 
    SET 
      user_id = 2,
      venue = COALESCE(venue, location),
      event_type = COALESCE(event_type, 'milonga')
    WHERE status = 'published' 
    AND published_at IS NOT NULL
  `);
  
  // Get count of fixed events
  const countResult = await db.execute(sql`
    SELECT COUNT(*) as count 
    FROM events 
    WHERE status = 'published' AND published_at IS NOT NULL AND user_id IS NOT NULL
  `);
  
  console.log('✅ Events updated successfully!');
  console.log(`   Total events ready for API: ${countResult.rows[0].count}`);
  console.log('\n🎉 Try refreshing the UI now!');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
