-- Create event merge history table
CREATE TABLE IF NOT EXISTS event_merge_history (
  id SERIAL PRIMARY KEY,
  primary_event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  merged_event_id INTEGER NOT NULL,
  merge_reason VARCHAR(255),
  merged_data JSONB,
  merged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  merged_by INTEGER REFERENCES users(id)
);

-- Add is_duplicate flag to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS merged_into_event_id INTEGER REFERENCES events(id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_event_merge_history_primary ON event_merge_history(primary_event_id);
CREATE INDEX IF NOT EXISTS idx_event_merge_history_merged ON event_merge_history(merged_event_id);
CREATE INDEX IF NOT EXISTS idx_events_is_duplicate ON events(is_duplicate);
CREATE INDEX IF NOT EXISTS idx_events_merged_into ON events(merged_into_event_id);
