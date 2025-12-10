import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function checkData() {
  try {
    const tables = ['events', 'communities', 'community_members', 'subscriptions'];
    
    for (const table of tables) {
      const count = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM public.${table}`));
      console.log(`${table}: ${count.rows[0].count} rows`);
    }

    // Check if posts table still exists
    const postsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'posts'
      ) as exists
    `);
    console.log('posts table exists:', postsExists.rows[0].exists);

  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

checkData();
