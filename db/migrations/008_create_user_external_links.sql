-- Create user_external_links table for teacher sites and external profiles
CREATE TABLE user_external_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  link_type VARCHAR(50) NOT NULL CHECK (link_type IN ('website', 'facebook', 'instagram', 'youtube', 'tiktok', 'teaching_site', 'event_site', 'other')),
  url VARCHAR(500) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  verified BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_external_links_user_id ON user_external_links(user_id);
CREATE INDEX idx_user_external_links_link_type ON user_external_links(link_type);
CREATE INDEX idx_user_external_links_verified ON user_external_links(verified);
CREATE INDEX idx_user_external_links_primary ON user_external_links(is_primary);

-- Create trigger for updated_at
CREATE TRIGGER update_user_external_links_updated_at
  BEFORE UPDATE ON user_external_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
