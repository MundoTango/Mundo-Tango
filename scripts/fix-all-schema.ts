import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixAll() {
  try {
    // Check current search path
    const searchPath = await db.execute(sql`SHOW search_path`);
    console.log('Current search_path:', searchPath.rows);

    // Set search path to public explicitly
    await db.execute(sql`SET search_path TO public`);
    console.log('Set search_path to public');

    // Check if prediction_cache table exists and its structure
    const predCache = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'prediction_cache'
    `);
    console.log('prediction_cache columns:', predCache.rows);

    // If prediction_cache exists but missing confidence_scores, add it
    if (predCache.rows.length > 0) {
      const hasConfidenceScores = predCache.rows.some((r: any) => r.column_name === 'confidence_scores');
      if (!hasConfidenceScores) {
        console.log('Adding missing confidence_scores column...');
        await db.execute(sql`
          ALTER TABLE prediction_cache 
          ADD COLUMN IF NOT EXISTS confidence_scores JSONB DEFAULT '{}'::jsonb
        `);
        console.log('Added confidence_scores column.');
      }
    }

    // Try a simple query to test
    const testQuery = await db.execute(sql`
      SELECT p.id, u.id as user_id, u.name 
      FROM public.posts p 
      LEFT JOIN public.users u ON p.user_id = u.id 
      LIMIT 1
    `);
    console.log('Test query result:', testQuery.rows);

  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

fixAll();
