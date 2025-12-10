import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function check() {
  try {
    const posts = await db.execute(sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'posts'
      ORDER BY ordinal_position
      LIMIT 10
    `);
    console.log('=== PUBLIC.POSTS ===');
    console.log(JSON.stringify(posts.rows, null, 2));

  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

check();
