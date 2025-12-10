import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixPosts() {
  try {
    console.log('Dropping old posts table with UUID columns...');
    await db.execute(sql`DROP TABLE IF EXISTS posts CASCADE`);
    console.log('Dropped posts table.');
    
    console.log('Recreating posts table with correct integer types...');
    await db.execute(sql`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        rich_content JSONB,
        plain_text TEXT,
        image_url TEXT,
        video_url TEXT,
        video_thumbnail TEXT,
        media_embeds JSONB,
        media_gallery JSONB,
        mentions TEXT[] DEFAULT ARRAY[]::text[],
        hashtags TEXT[] DEFAULT ARRAY[]::text[],
        tags TEXT[] DEFAULT ARRAY[]::text[],
        location TEXT,
        visibility VARCHAR DEFAULT 'public',
        post_type VARCHAR DEFAULT 'memory',
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        type VARCHAR DEFAULT 'post'
      )
    `);
    console.log('Created posts table with integer columns.');
    
    console.log('Creating indexes...');
    await db.execute(sql`CREATE INDEX posts_user_id_idx ON posts(user_id)`);
    await db.execute(sql`CREATE INDEX posts_created_at_idx ON posts(created_at DESC)`);
    await db.execute(sql`CREATE INDEX posts_visibility_idx ON posts(visibility)`);
    console.log('Created indexes.');
    
    // Verify
    const verify = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'posts'
      ORDER BY ordinal_position
      LIMIT 5
    `);
    console.log('Verification - first 5 columns:', verify.rows);
    
    // Test query
    const testQuery = await db.execute(sql`
      SELECT p.id, u.id as user_id, u.name 
      FROM public.posts p 
      LEFT JOIN public.users u ON p.user_id = u.id 
      LIMIT 1
    `);
    console.log('Test query success:', testQuery.rows);
    
    console.log('✅ Posts table fixed!');
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

fixPosts();
