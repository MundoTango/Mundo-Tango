import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixAll() {
  try {
    // 1. Drop tables in correct order (respect FKs)
    console.log('1. Dropping tables...');
    await db.execute(sql`DROP TABLE IF EXISTS community_members CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS subscriptions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS events CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS communities CASCADE`);
    console.log('Dropped all UUID tables.');

    // 2. Recreate events table
    console.log('2. Creating events table...');
    await db.execute(sql`
      CREATE TABLE events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_type VARCHAR(50),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        timezone VARCHAR(100),
        location TEXT,
        venue VARCHAR(255),
        city VARCHAR(100),
        country VARCHAR(100),
        latitude FLOAT,
        longitude FLOAT,
        image_url TEXT,
        cover_image TEXT,
        price NUMERIC(10,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        max_attendees INTEGER,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurrence_pattern VARCHAR(50),
        parent_event_id INTEGER,
        registration_url TEXT,
        status VARCHAR(20) DEFAULT 'active',
        visibility VARCHAR(20) DEFAULT 'public',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created events table.');

    // 3. Recreate communities table
    console.log('3. Creating communities table...');
    await db.execute(sql`
      CREATE TABLE communities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        image_url TEXT,
        cover_image TEXT,
        type VARCHAR(50) DEFAULT 'general',
        privacy VARCHAR(20) DEFAULT 'public',
        member_count INTEGER DEFAULT 0,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created communities table.');

    // 4. Recreate community_members table
    console.log('4. Creating community_members table...');
    await db.execute(sql`
      CREATE TABLE community_members (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(community_id, user_id)
      )
    `);
    console.log('Created community_members table.');

    // 5. Recreate subscriptions table
    console.log('5. Creating subscriptions table...');
    await db.execute(sql`
      CREATE TABLE subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        stripe_subscription_id VARCHAR(255),
        stripe_customer_id VARCHAR(255),
        plan_id VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created subscriptions table.');

    // 6. Recreate posts table
    console.log('6. Creating posts table...');
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
    console.log('Created posts table.');

    // 7. Create indexes
    console.log('7. Creating indexes...');
    await db.execute(sql`CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS events_start_date_idx ON events(start_date)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC)`);
    console.log('Created indexes.');

    // 8. Verify all tables
    console.log('\n=== VERIFICATION ===');
    const tables = ['events', 'communities', 'community_members', 'subscriptions', 'posts'];
    for (const table of tables) {
      const cols = await db.execute(sql.raw(`
        SELECT column_name, udt_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = '${table}'
        ORDER BY ordinal_position
        LIMIT 3
      `));
      console.log(`${table}: ${JSON.stringify(cols.rows)}`);
    }

    // 9. Test query
    console.log('\n=== TEST QUERY ===');
    const test = await db.execute(sql`
      SELECT p.id, u.id as user_id
      FROM posts p 
      LEFT JOIN users u ON p.user_id = u.id 
      LIMIT 1
    `);
    console.log('Test query success:', test.rows);

    console.log('\n✅ All UUID tables fixed successfully!');

  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

fixAll();
