import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function checkUsers() {
  try {
    const users = await db.execute(sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
      LIMIT 5
    `);
    console.log('=== USERS TABLE (first 5 cols) ===');
    console.log(JSON.stringify(users.rows, null, 2));

    const friendRequests = await db.execute(sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'friend_requests'
      ORDER BY ordinal_position
      LIMIT 10
    `);
    console.log('=== FRIEND_REQUESTS TABLE ===');
    console.log(JSON.stringify(friendRequests.rows, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

checkUsers();
