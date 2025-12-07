-- ============================================================================
-- MIGRATION: Add Scraped Events and Known Tango People Tables
-- PURPOSE: Support BA event scraping infrastructure (MB.MD Phase 1)
-- DATE: 2025-12-06
-- ============================================================================

-- Create scraped_events table
-- Stores raw event data from BA tango websites before deduplication
CREATE TABLE IF NOT EXISTS scraped_events (
  id SERIAL PRIMARY KEY,
  source VARCHAR(100) NOT NULL, -- Source website: 'buenosairestango', 'tangoargentino', 'hoymilonga'
  source_event_id VARCHAR(255), -- Original ID from source website (if available)
  source_url TEXT NOT NULL, -- URL where event was scraped from
  
  -- Event data
  title TEXT NOT NULL,
  description TEXT,
  venue_name VARCHAR(255),
  venue_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Date/time fields
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Event classification
  event_type VARCHAR(50), -- 'milonga', 'class', 'festival', 'practica', etc.
  price_info TEXT,
  
  -- Raw data
  raw_html TEXT, -- Original HTML snippet for debugging
  raw_data JSONB, -- Structured data extracted from source
  
  -- Metadata
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_processed BOOLEAN DEFAULT FALSE, -- Whether it's been added to main events table
  processed_at TIMESTAMP WITH TIME ZONE,
  matched_event_id INTEGER REFERENCES events(id), -- Link to deduplicated event
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for scraped_events
CREATE INDEX idx_scraped_events_source ON scraped_events(source);
CREATE INDEX idx_scraped_events_start_date ON scraped_events(start_date);
CREATE INDEX idx_scraped_events_is_processed ON scraped_events(is_processed);
CREATE INDEX idx_scraped_events_scraped_at ON scraped_events(scraped_at);
CREATE INDEX idx_scraped_events_source_event_id ON scraped_events(source, source_event_id);
CREATE INDEX idx_scraped_events_matched_event ON scraped_events(matched_event_id);

-- Create unique constraint to prevent duplicate scrapes
CREATE UNIQUE INDEX idx_scraped_events_unique_source 
  ON scraped_events(source, source_event_id) 
  WHERE source_event_id IS NOT NULL;

-- ============================================================================
-- Create known_tango_people table
-- Stores recognized tango organizers, DJs, teachers for event claiming
-- ============================================================================

CREATE TABLE IF NOT EXISTS known_tango_people (
  id SERIAL PRIMARY KEY,
  
  -- Identity
  name VARCHAR(255) NOT NULL,
  normalized_name VARCHAR(255) NOT NULL, -- Lowercase, accent-removed for matching
  aliases TEXT[], -- Array of alternative names/spellings
  
  -- Platform links
  user_id INTEGER REFERENCES users(id), -- Linked Mundo Tango user (if claimed)
  
  -- Contact/social
  email VARCHAR(255),
  phone VARCHAR(50),
  website TEXT,
  facebook_url TEXT,
  instagram_handle VARCHAR(100),
  
  -- Professional info
  roles TEXT[], -- Array: ['organizer', 'dj', 'teacher', 'dancer']
  bio TEXT,
  profile_image_url TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_method VARCHAR(50), -- 'manual', 'email', 'claimed'
  
  -- Stats (denormalized for performance)
  events_organized_count INTEGER DEFAULT 0,
  events_dj_count INTEGER DEFAULT 0,
  events_taught_count INTEGER DEFAULT 0,
  
  -- Discovery metadata
  first_seen_source VARCHAR(100), -- Where we first discovered this person
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for known_tango_people
CREATE INDEX idx_known_tango_people_normalized_name ON known_tango_people(normalized_name);
CREATE INDEX idx_known_tango_people_user_id ON known_tango_people(user_id);
CREATE INDEX idx_known_tango_people_roles ON known_tango_people USING GIN(roles);
CREATE INDEX idx_known_tango_people_is_verified ON known_tango_people(is_verified);

-- Create unique constraint on normalized name
CREATE UNIQUE INDEX idx_known_tango_people_unique_name ON known_tango_people(normalized_name);

-- ============================================================================
-- Create trigger for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scraped_events_updated_at
  BEFORE UPDATE ON scraped_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_known_tango_people_updated_at
  BEFORE UPDATE ON known_tango_people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Add comments for documentation
-- ============================================================================

COMMENT ON TABLE scraped_events IS 'Raw event data scraped from BA tango websites before deduplication';
COMMENT ON TABLE known_tango_people IS 'Database of recognized tango professionals for event claiming and attribution';

COMMENT ON COLUMN scraped_events.source IS 'Source website identifier';
COMMENT ON COLUMN scraped_events.is_processed IS 'Whether event has been deduplicated and added to main events table';
COMMENT ON COLUMN scraped_events.matched_event_id IS 'Reference to the deduplicated event in main events table';

COMMENT ON COLUMN known_tango_people.normalized_name IS 'Lowercase name without accents for fuzzy matching';
COMMENT ON COLUMN known_tango_people.aliases IS 'Alternative names and spellings for this person';
COMMENT ON COLUMN known_tango_people.roles IS 'Array of professional roles in tango community';
