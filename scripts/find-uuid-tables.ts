import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function findUuidTables() {
  try {
    // Find all tables in public schema with UUID id columns
    const uuidTables = await db.execute(sql`
      SELECT table_name, column_name, udt_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND column_name = 'id'
        AND udt_name = 'uuid'
      ORDER BY table_name
    `);
    console.log('=== TABLES WITH UUID ID COLUMNS ===');
    console.log(JSON.stringify(uuidTables.rows, null, 2));

    // Find all tables in public schema with UUID user_id columns
    const uuidUserIdTables = await db.execute(sql`
      SELECT table_name, column_name, udt_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND column_name = 'user_id'
        AND udt_name = 'uuid'
      ORDER BY table_name
    `);
    console.log('=== TABLES WITH UUID USER_ID COLUMNS ===');
    console.log(JSON.stringify(uuidUserIdTables.rows, null, 2));

  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

findUuidTables();
