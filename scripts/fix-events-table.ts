import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixEvents() {
  try {
    console.log('Adding missing columns to events table...');
    
    // Add all missing columns
    await db.execute(sql`
      ALTER TABLE events
      ADD COLUMN IF NOT EXISTS slug VARCHAR,
      ADD COLUMN IF NOT EXISTS long_description TEXT,
      ADD COLUMN IF NOT EXISTS category VARCHAR,
      ADD COLUMN IF NOT EXISTS date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS start_date_time TIMESTAMP,
      ADD COLUMN IF NOT EXISTS end_date_time TIMESTAMP,
      ADD COLUMN IF NOT EXISTS recurring JSONB,
      ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,
      ADD COLUMN IF NOT EXISTS venue_name VARCHAR,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS online_link TEXT,
      ADD COLUMN IF NOT EXISTS meeting_url TEXT,
      ADD COLUMN IF NOT EXISTS media_urls TEXT[],
      ADD COLUMN IF NOT EXISTS organizer_id INTEGER,
      ADD COLUMN IF NOT EXISTS co_organizers INTEGER[],
      ADD COLUMN IF NOT EXISTS group_id INTEGER,
      ADD COLUMN IF NOT EXISTS current_attendees INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS waitlist_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS waitlist_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS ticket_url TEXT,
      ADD COLUMN IF NOT EXISTS ticket_link TEXT,
      ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR,
      ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS allow_guest_plus_one BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS allow_photos BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS music_style VARCHAR,
      ADD COLUMN IF NOT EXISTS dance_styles TEXT[],
      ADD COLUMN IF NOT EXISTS dj_name VARCHAR,
      ADD COLUMN IF NOT EXISTS tags TEXT[],
      ADD COLUMN IF NOT EXISTS dress_code VARCHAR,
      ADD COLUMN IF NOT EXISTS age_restriction VARCHAR,
      ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS parking_available BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
      ADD COLUMN IF NOT EXISTS approved_by INTEGER,
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
      ADD COLUMN IF NOT EXISTS admin_notes TEXT,
      ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS source_name VARCHAR,
      ADD COLUMN IF NOT EXISTS source_url TEXT,
      ADD COLUMN IF NOT EXISTS external_source_id VARCHAR,
      ADD COLUMN IF NOT EXISTS scraped_event_id INTEGER,
      ADD COLUMN IF NOT EXISTS organizer_text TEXT,
      ADD COLUMN IF NOT EXISTS dj_text TEXT,
      ADD COLUMN IF NOT EXISTS teacher_text TEXT,
      ADD COLUMN IF NOT EXISTS performer_text TEXT,
      ADD COLUMN IF NOT EXISTS series_id INTEGER,
      ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS parent_event_id INTEGER
    `);
    console.log('Added missing columns to events table.');

    // Also add missing columns to communities table
    console.log('Adding missing columns to communities table...');
    await db.execute(sql`
      ALTER TABLE communities
      ADD COLUMN IF NOT EXISTS slug VARCHAR,
      ADD COLUMN IF NOT EXISTS about TEXT,
      ADD COLUMN IF NOT EXISTS banner_url TEXT,
      ADD COLUMN IF NOT EXISTS website TEXT,
      ADD COLUMN IF NOT EXISTS rules TEXT[],
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'
    `);
    console.log('Added missing columns to communities.');

    // Verify
    const eventsCols = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'events'
      ORDER BY ordinal_position
    `);
    console.log('Events now has', eventsCols.rows.length, 'columns');

    console.log('✅ Events and Communities tables fixed!');
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

fixEvents();
