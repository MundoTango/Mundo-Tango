import { db } from '@shared/db';
import { sql } from 'drizzle-orm';

async function updateEventCounts() {
  console.log('Updating group event counts...');

  const result = await db.execute(sql`
    UPDATE groups g
    SET event_count = (
      SELECT COUNT(*) 
      FROM events e 
      WHERE e.group_id = g.id 
        AND e.start_date >= NOW()
    )
    WHERE g.type = 'city'
  `);

  console.log(`Event counts updated for all city groups`);
  process.exit(0);
}

updateEventCounts().catch(console.error);
