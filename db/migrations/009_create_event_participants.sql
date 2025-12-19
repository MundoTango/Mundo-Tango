-- Create event_participants table for event team members
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  participant_type VARCHAR(50) NOT NULL CHECK (participant_type IN ('organizer', 'dj', 'teacher', 'performer', 'host', 'volunteer', 'other')),
  name VARCHAR(255) NOT NULL,
  role_description TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX idx_event_participants_type ON event_participants(participant_type);
CREATE INDEX idx_event_participants_primary ON event_participants(is_primary);

-- Create unique constraint for primary participants per event
CREATE UNIQUE INDEX idx_event_participants_primary_per_event 
  ON event_participants(event_id) 
  WHERE is_primary = TRUE;

-- Create trigger for updated_at
CREATE TRIGGER update_event_participants_updated_at
  BEFORE UPDATE ON event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
