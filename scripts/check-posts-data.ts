import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function check() {
  try {
    // Count posts
    const count = await db.execute(sql`SELECT COUNT(*) as count FROM public.posts`);
    console.log('Posts count:', count.rows);

    // Get sample posts if any
    const sample = await db.execute(sql`SELECT id, user_id, content FROM public.posts LIMIT 3`);
    console.log('Sample posts:', sample.rows);

    // Check related tables with UUID
    const tables = ['reactions', 'comments', 'saved_posts'];
    for (const table of tables) {
      const cols = await db.execute(sql.raw(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = '${table}'
        ORDER BY ordinal_position
        LIMIT 8
      `));
      console.log(`=== ${table.toUpperCase()} ===`);
      console.log(JSON.stringify(cols.rows, null, 2));
    }
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

check();
