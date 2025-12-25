-- Create enhanced cities table with auto-creation and skyline support
-- Migration: create_cities_with_skyline.sql

CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  
  -- Auto-creation tracking
  auto_created boolean DEFAULT false,
  has_scraping_sources boolean DEFAULT false,
  event_count integer DEFAULT 0,
  
  -- Visual identity
  skyline_image_url text,
  skyline_source text, -- 'unsplash' | 'pexels' | 'user_uploaded'
  skyline_attribution text,
  
  -- Geocoding
  latitude decimal(10, 7),
  longitude decimal(10, 7),
  timezone text,
  
  -- Metadata
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(name, country)
);

CREATE INDEX IF NOT EXISTS idx_cities_auto_created ON cities(auto_created);
CREATE INDEX IF NOT EXISTS idx_cities_has_sources ON cities(has_scraping_sources);
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country);

COMMENT ON TABLE cities IS 'Cities with auto-creation support and skyline imagery for visual identity';
