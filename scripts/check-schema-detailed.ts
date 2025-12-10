import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function check() {
  try {
    const tables = await db.execute(sql`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'users'
    `);
    console.log('=== TABLES NAMED "users" ===');
    console.log(JSON.stringify(tables.rows, null, 2));

    const publicUsers = await db.execute(sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
      LIMIT 5
    `);
    console.log('=== PUBLIC.USERS ===');
    console.log(JSON.stringify(publicUsers.rows, null, 2));

    const publicFriendships = await db.execute(sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'friendships'
      ORDER BY ordinal_position
    `);
    console.log('=== PUBLIC.FRIENDSHIPS ===');
    console.log(JSON.stringify(publicFriendships.rows, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

check();
