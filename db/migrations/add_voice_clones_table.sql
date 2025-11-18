-- Voice Clones Table for ElevenLabs Integration
-- Tracks user voice clones with metadata, usage, and quality metrics

CREATE TABLE IF NOT EXISTS "voice_clones" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "voice_id" VARCHAR(255) NOT NULL UNIQUE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  
  -- Status
  "status" VARCHAR(50) NOT NULL DEFAULT 'active',
  "is_default" BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Metadata
  "audio_sample_count" INTEGER DEFAULT 0,
  "total_duration" INTEGER,
  "language" VARCHAR(10) DEFAULT 'en',
  "model_id" VARCHAR(100) DEFAULT 'eleven_multilingual_v2',
  
  -- Quality metrics
  "quality_score" REAL,
  "similarity_score" REAL,
  
  -- Usage tracking
  "usage_count" INTEGER DEFAULT 0,
  "last_used_at" TIMESTAMP,
  
  -- ElevenLabs metadata
  "elevenlabs_data" JSONB,
  
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "voice_clones_user_idx" ON "voice_clones"("user_id");
CREATE INDEX IF NOT EXISTS "voice_clones_voice_id_idx" ON "voice_clones"("voice_id");
CREATE INDEX IF NOT EXISTS "voice_clones_status_idx" ON "voice_clones"("status");
CREATE INDEX IF NOT EXISTS "voice_clones_user_default_idx" ON "voice_clones"("user_id", "is_default");
CREATE INDEX IF NOT EXISTS "voice_clones_created_at_idx" ON "voice_clones"("created_at");

-- Comments
COMMENT ON TABLE "voice_clones" IS 'User voice clones created via ElevenLabs API';
COMMENT ON COLUMN "voice_clones"."voice_id" IS 'ElevenLabs voice ID';
COMMENT ON COLUMN "voice_clones"."is_default" IS 'Whether this is the user''s default voice for Mr Blue';
COMMENT ON COLUMN "voice_clones"."usage_count" IS 'Number of times this voice has been used for TTS';
COMMENT ON COLUMN "voice_clones"."elevenlabs_data" IS 'Additional metadata from ElevenLabs API';
