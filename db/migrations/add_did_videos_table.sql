-- Create did_videos table for D-ID talking avatar video generation
-- Migration created: 2025-11-18

CREATE TABLE IF NOT EXISTS did_videos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- D-ID video ID
  did_video_id VARCHAR(255) NOT NULL UNIQUE,
  
  -- Avatar configuration
  avatar_url TEXT NOT NULL,
  avatar_preset VARCHAR(100),
  
  -- Script & voice
  script TEXT NOT NULL,
  voice VARCHAR(100) NOT NULL,
  voice_provider VARCHAR(50) DEFAULT 'd-id' NOT NULL,
  elevenlabs_voice_id VARCHAR(255),
  
  -- Video output
  video_url TEXT,
  cloudinary_url TEXT,
  cloudinary_public_id VARCHAR(255),
  thumbnail_url TEXT,
  
  -- Status & metadata
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  duration INTEGER,
  width INTEGER,
  height INTEGER,
  failure_reason TEXT,
  
  -- Cost tracking
  estimated_cost NUMERIC(10, 4),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS did_videos_user_idx ON did_videos(user_id);
CREATE INDEX IF NOT EXISTS did_videos_status_idx ON did_videos(status);
CREATE INDEX IF NOT EXISTS did_videos_created_at_idx ON did_videos(created_at);
CREATE INDEX IF NOT EXISTS did_videos_did_video_id_idx ON did_videos(did_video_id);

-- Add comment
COMMENT ON TABLE did_videos IS 'D-ID talking avatar video generations for Mr. Blue AI assistant';
