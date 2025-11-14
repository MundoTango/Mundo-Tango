-- Migration: Merge Stories into Posts System
-- Created: 2025-01-14
-- Purpose: Consolidate stories and posts into a single table with type field

-- Step 1: Add new columns to posts table (if not already added by Drizzle)
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'post',
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Step 2: Add index for efficient story queries
CREATE INDEX IF NOT EXISTS idx_posts_type_expires ON posts(type, expires_at) 
  WHERE type = 'story' AND expires_at > NOW();

-- Step 3: Migrate existing stories data to posts table
INSERT INTO posts (
  user_id, 
  content, 
  image_url,
  video_url,
  type, 
  expires_at, 
  created_at,
  updated_at,
  visibility
)
SELECT 
  user_id,
  COALESCE(caption, '') AS content,
  CASE WHEN media_type = 'image' THEN media_url ELSE NULL END AS image_url,
  CASE WHEN media_type = 'video' THEN media_url ELSE NULL END AS video_url,
  'story' AS type,
  expires_at,
  created_at,
  created_at AS updated_at,
  'public' AS visibility
FROM stories
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE posts.user_id = stories.user_id AND posts.created_at = stories.created_at
)
ON CONFLICT DO NOTHING;

-- Step 4: Drop story_views table (foreign key dependency)
DROP TABLE IF EXISTS story_views CASCADE;

-- Step 5: Drop stories table
DROP TABLE IF EXISTS stories CASCADE;

-- Step 6: Add comment for documentation
COMMENT ON COLUMN posts.type IS 'Type of post: post (permanent) or story (24h expiration)';
COMMENT ON COLUMN posts.expires_at IS 'Expiration timestamp for stories (NULL for regular posts)';
