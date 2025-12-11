-- ============================================================================
-- MUNDO TANGO SUPABASE MIGRATION SCRIPT
-- Generated: December 7, 2025
-- Purpose: Sync development schema to production Supabase database
-- ============================================================================

-- Note: Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================================================
-- TABLE: scraped_community_data
-- Purpose: Store scraped tango community information from various sources
-- ============================================================================
CREATE TABLE IF NOT EXISTS scraped_community_data (
    id SERIAL PRIMARY KEY,
    source_id INTEGER NOT NULL REFERENCES event_scraping_sources(id) ON DELETE CASCADE,
    community_name TEXT,
    description TEXT,
    history TEXT,
    culture TEXT,
    rules TEXT[],
    dress_code TEXT,
    etiquette TEXT[],
    organizers JSONB,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    facebook_url TEXT,
    facebook_group_id VARCHAR(100),
    instagram_url TEXT,
    youtube_url TEXT,
    whatsapp_group_link TEXT,
    website_url TEXT,
    member_count INTEGER,
    founded_year INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    cover_photo_url TEXT,
    logo_url TEXT,
    gallery_photos TEXT[],
    data_quality INTEGER NOT NULL DEFAULT 0,
    scraped_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMP,
    city_group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
    approved BOOLEAN NOT NULL DEFAULT false,
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for scraped_community_data
CREATE INDEX IF NOT EXISTS scraped_community_source_idx ON scraped_community_data(source_id);
CREATE INDEX IF NOT EXISTS scraped_community_group_idx ON scraped_community_data(city_group_id);
CREATE INDEX IF NOT EXISTS scraped_community_approved_idx ON scraped_community_data(approved);

-- ============================================================================
-- TABLE: a2a_messages (Agent-to-Agent Communication)
-- Purpose: Store messages between AI agents following A2A protocol
-- ============================================================================
CREATE TABLE IF NOT EXISTS a2a_messages (
    id SERIAL PRIMARY KEY,
    sender_agent_id VARCHAR(100) NOT NULL,
    receiver_agent_id VARCHAR(100) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    priority INTEGER NOT NULL DEFAULT 5,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP,
    response JSONB,
    error TEXT
);

CREATE INDEX IF NOT EXISTS a2a_messages_sender_idx ON a2a_messages(sender_agent_id);
CREATE INDEX IF NOT EXISTS a2a_messages_receiver_idx ON a2a_messages(receiver_agent_id);
CREATE INDEX IF NOT EXISTS a2a_messages_status_idx ON a2a_messages(status);

-- ============================================================================
-- Verify existing tables have required columns
-- ============================================================================

-- Ensure scraped_events has all required columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'scraped_events' AND column_name = 'city') THEN
        ALTER TABLE scraped_events ADD COLUMN city VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'scraped_events' AND column_name = 'source_url') THEN
        ALTER TABLE scraped_events ADD COLUMN source_url TEXT;
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these after migration to verify success
-- ============================================================================
-- SELECT COUNT(*) FROM scraped_community_data;
-- SELECT COUNT(*) FROM a2a_messages;
-- \d scraped_community_data
-- \d a2a_messages
