import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function addMissingCols() {
  try {
    // Add missing columns to posts table
    console.log('Adding missing columns to posts...');
    await db.execute(sql`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS coordinates TEXT,
      ADD COLUMN IF NOT EXISTS place_id TEXT,
      ADD COLUMN IF NOT EXISTS formatted_address TEXT,
      ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'published',
      ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP,
      ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0
    `);
    console.log('Added missing posts columns.');

    // Add missing column to prediction_cache
    console.log('Adding missing columns to prediction_cache...');
    await db.execute(sql`
      ALTER TABLE prediction_cache 
      ADD COLUMN IF NOT EXISTS cache_warmed_at TIMESTAMP
    `);
    console.log('Added cache_warmed_at column.');

    // Verify posts columns
    const postsCols = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'posts'
      ORDER BY ordinal_position
    `);
    console.log('Posts columns:', postsCols.rows.map((r: any) => r.column_name).join(', '));

    console.log('✅ All missing columns added!');
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

addMissingCols();
