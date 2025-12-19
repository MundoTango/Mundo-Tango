-- ALTER users table to add Professional tier features
-- Adds pro_tier for automatically assigned professional roles
ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_tier VARCHAR(50) CHECK (pro_tier IN ('school_owner', 'shop_owner', 'venue_owner', 'organizer', 'teacher', 'dj', 'performer', null));

-- Add pro_verified flag for verification status
ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_verified BOOLEAN DEFAULT FALSE;

-- Add pro_auto_assigned timestamp for tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_auto_assigned_at TIMESTAMP WITH TIME ZONE;

-- Add pro_metadata for additional professional information
ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_metadata JSONB DEFAULT '{}';

-- Create index for pro_tier
CREATE INDEX IF NOT EXISTS idx_users_pro_tier ON users(pro_tier);

-- Create index for pro_verified
CREATE INDEX IF NOT EXISTS idx_users_pro_verified ON users(pro_verified);

-- Add comments for documentation
COMMENT ON COLUMN users.pro_tier IS 'Automatically assigned professional tier based on scraped data';
COMMENT ON COLUMN users.pro_verified IS 'Whether the professional status has been verified';
COMMENT ON COLUMN users.pro_auto_assigned_at IS 'When the professional tier was automatically assigned';
COMMENT ON COLUMN users.pro_metadata IS 'Additional metadata for professional features';
