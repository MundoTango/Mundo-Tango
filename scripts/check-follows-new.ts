import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function check() {
  try {
    const follows = await db.execute(sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'follows'
      ORDER BY ordinal_position
    `);
    console.log('=== PUBLIC.FOLLOWS (after fix) ===');
    console.log(JSON.stringify(follows.rows, null, 2));
    
    // Also check if there are any other tables that might have UUID foreign keys to users
    const tablesWithUserRef = await db.execute(sql`
      SELECT 
        tc.table_name,
        kcu.column_name,
        c.data_type,
        c.udt_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.columns c 
        ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND c.udt_name = 'uuid'
      LIMIT 20
    `);
    console.log('=== TABLES WITH UUID COLUMNS THAT HAVE FKs ===');
    console.log(JSON.stringify(tablesWithUserRef.rows, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

check();
