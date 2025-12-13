-- Migration: Add "found user" fields to users table
-- Purpose: Support scraped profiles that can be claimed by users
-- MB.MD Phase 1: Database Foundation

-- Add user_type field to distinguish between registered and found users
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'registered';
COMMENT ON COLUMN users.user_type IS 'Type of user: registered | found | claimed_found';

-- Add found_metadata JSONB field for scraping information
ALTER TABLE users ADD COLUMN IF NOT EXISTS found_metadata jsonb;
COMMENT ON COLUMN users.found_metadata IS 'Metadata for found users: source, confidence_score, mention_count, etc.';

-- Add claiming fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS claimed_at timestamp;

-- Create index on user_type for efficient filtering
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_claimed ON users(is_claimed) WHERE user_type = 'found';

-- Update existing users to have 'registered' type
UPDATE users SET user_type = 'registered' WHERE user_type IS NULL;
