-- Add source tracking and event team member tables
-- Migration: add_event_source_tracking_and_team_members

-- 1. Add scrapedAt timestamp to events table for source tracking
ALTER TABLE events ADD COLUMN IF NOT EXISTS scraped_at timestamp DEFAULT NOW();

COMMENT ON COLUMN events.scraped_at IS 'Timestamp when event was last scraped from source website';

-- 2. Create event_role enum for team member types
DO $$ BEGIN
  CREATE TYPE event_role AS ENUM (
    'organizer',
    'dj',
    'teacher',
    'performer',
    'host',
    'volunteer'
  );
EXCEPT
  WHEN duplicate_object THEN null;
END $$;

-- 3. Create event_team_members junction table
CREATE TABLE IF NOT EXISTS event_team_members (
  id serial PRIMARY KEY,
  event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id integer REFERENCES users(id) ON DELETE SET NULL,
  role event_role NOT NULL,
  display_name text NOT NULL,
  raw_text text,
  confidence real DEFAULT 0.8,
  source text,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_team_members_event_id ON event_team_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_team_members_user_id ON event_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_event_team_members_role ON event_team_members(role);
CREATE INDEX IF NOT EXISTS idx_events_scraped_at ON events(scraped_at);

COMMENT ON TABLE event_team_members IS 'Links events to team members (organizers, DJs, teachers, etc) with role classification';
COMMENT ON COLUMN event_team_members.display_name IS 'Name to display (from scraped text or user profile)';
COMMENT ON COLUMN event_team_members.raw_text IS 'Original text from scraped source before parsing';
COMMENT ON COLUMN event_team_members.confidence IS 'ML confidence score for role classification (0-1)';
COMMENT ON COLUMN event_team_members.source IS 'Field source: organizerText, djText, teacherText, etc';

-- 4. Create helper function to extract team members from event text fields
CREATE OR REPLACE FUNCTION extract_event_team_members(event_id_param integer)
RETURNS void AS $$
DECLARE
  event_record RECORD;
  name_part text;
  names_array text[];
BEGIN
  -- Get event data
  SELECT * INTO event_record FROM events WHERE id = event_id_param;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Extract organizers from organizerText
  IF event_record.organizer_text IS NOT NULL AND event_record.organizer_text != '' THEN
    -- Split by common delimiters: comma, ampersand, 'and', newlines
    names_array := regexp_split_to_array(event_record.organizer_text, '\s*(?:,|&|\band\b|\n)\s*');
    FOREACH name_part IN ARRAY names_array
    LOOP
      IF length(trim(name_part)) > 0 THEN
        INSERT INTO event_team_members (event_id, role, display_name, raw_text, source)
        VALUES (event_id_param, 'organizer', trim(name_part), event_record.organizer_text, 'organizerText')
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  
  -- Extract DJs from djText
  IF event_record.dj_text IS NOT NULL AND event_record.dj_text != '' THEN
    names_array := regexp_split_to_array(event_record.dj_text, '\s*(?:,|&|\band\b|\n)\s*');
    FOREACH name_part IN ARRAY names_array
    LOOP
      IF length(trim(name_part)) > 0 THEN
        INSERT INTO event_team_members (event_id, role, display_name, raw_text, source)
        VALUES (event_id_param, 'dj', trim(name_part), event_record.dj_text, 'djText')
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  
  -- Extract teachers from teacherText
  IF event_record.teacher_text IS NOT NULL AND event_record.teacher_text != '' THEN
    names_array := regexp_split_to_array(event_record.teacher_text, '\s*(?:,|&|\band\b|\n)\s*');
    FOREACH name_part IN ARRAY names_array
    LOOP
      IF length(trim(name_part)) > 0 THEN
        INSERT INTO event_team_members (event_id, role, display_name, raw_text, source)
        VALUES (event_id_param, 'teacher', trim(name_part), event_record.teacher_text, 'teacherText')
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  
  -- Extract performers from performerText
  IF event_record.performer_text IS NOT NULL AND event_record.performer_text != '' THEN
    names_array := regexp_split_to_array(event_record.performer_text, '\s*(?:,|&|\band\b|\n)\s*');
    FOREACH name_part IN ARRAY names_array
    LOOP
      IF length(trim(name_part)) > 0 THEN
        INSERT INTO event_team_members (event_id, role, display_name, raw_text, source)
        VALUES (event_id_param, 'performer', trim(name_part), event_record.performer_text, 'performerText')
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION extract_event_team_members IS 'Parses event text fields to populate event_team_members table';

-- 5. Backfill existing events
-- Run extraction for all existing events that have team text fields
DO $$
DECLARE
  event_rec RECORD;
BEGIN
  FOR event_rec IN 
    SELECT id FROM events 
    WHERE organizer_text IS NOT NULL 
       OR dj_text IS NOT NULL 
       OR teacher_text IS NOT NULL 
       OR performer_text IS NOT NULL
  LOOP
    PERFORM extract_event_team_members(event_rec.id);
  END LOOP;
END $$;
