import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function checkSchema() {
  try {
    const follows = await db.execute(sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'follows'
      ORDER BY ordinal_position
    `);
    console.log('=== FOLLOWS TABLE ===');
    console.log(JSON.stringify(follows.rows, null, 2));

    const friendships = await db.execute(sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'friendships'
      ORDER BY ordinal_position
    `);
    console.log('=== FRIENDSHIPS TABLE ===');
    console.log(JSON.stringify(friendships.rows, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

checkSchema();
