import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixFollows() {
  try {
    console.log('Dropping old follows table with UUID columns...');
    await db.execute(sql`DROP TABLE IF EXISTS follows CASCADE`);
    console.log('Dropped follows table.');
    
    console.log('Recreating follows table with correct integer types...');
    await db.execute(sql`
      CREATE TABLE follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('Created follows table with integer columns.');
    
    console.log('Creating indexes...');
    await db.execute(sql`CREATE INDEX follows_follower_idx ON follows(follower_id)`);
    await db.execute(sql`CREATE INDEX follows_following_idx ON follows(following_id)`);
    await db.execute(sql`CREATE UNIQUE INDEX unique_follow ON follows(follower_id, following_id)`);
    console.log('Created indexes.');
    
    console.log('✅ Follows table fixed!');
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

fixFollows();
