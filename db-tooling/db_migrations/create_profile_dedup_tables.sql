-- Create tables for profile deduplication

-- Table to track profile claim requests
CREATE TABLE IF NOT EXISTS profile_claim_requests (
  id SERIAL PRIMARY KEY,
  found_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  claiming_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  claim_method VARCHAR(50) NOT NULL, -- 'email', 'facebook', 'instagram', 'name_city'
  evidence JSONB, -- Store verification data
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(found_user_id, claiming_user_id)
);

-- Table to track user merge history
CREATE TABLE IF NOT EXISTS user_merge_history (
  id SERIAL PRIMARY KEY,
  primary_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  merged_user_id INTEGER NOT NULL, -- Not FK since user may be deleted
  merge_method VARCHAR(50) NOT NULL,
  merge_confidence DECIMAL(3,2),
  merged_data JSONB, -- Store data from merged profile
  merged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  merged_by INTEGER REFERENCES users(id) -- Admin or system
);

-- Table to track user aliases for matching
CREATE TABLE IF NOT EXISTS user_aliases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  alias VARCHAR(255) NOT NULL,
  alias_type VARCHAR(50) NOT NULL, -- 'name', 'email', 'social_handle'
  confidence DECIMAL(3,2),
  source VARCHAR(100), -- Where alias was found
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, alias, alias_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_claim_requests_found_user ON profile_claim_requests(found_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_claim_requests_claiming_user ON profile_claim_requests(claiming_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_claim_requests_status ON profile_claim_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_merge_history_primary_user ON user_merge_history(primary_user_id);
CREATE INDEX IF NOT EXISTS idx_user_merge_history_merged_user ON user_merge_history(merged_user_id);
CREATE INDEX IF NOT EXISTS idx_user_aliases_user ON user_aliases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_aliases_alias ON user_aliases(alias);
