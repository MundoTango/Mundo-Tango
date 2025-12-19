-- ALTER cities table to add HoyMilonga-specific fields
-- Adds hoymilonga_url for tracking HoyMilonga city pages
ALTER TABLE cities ADD COLUMN IF NOT EXISTS hoymilonga_url VARCHAR(500);

-- Add hoymilonga_last_scraped for tracking scraping status
ALTER TABLE cities ADD COLUMN IF NOT EXISTS hoymilonga_last_scraped TIMESTAMP WITH TIME ZONE;

-- Add hoymilonga_event_count for statistics
ALTER TABLE cities ADD COLUMN IF NOT EXISTS hoymilonga_event_count INTEGER DEFAULT 0;

-- Add hoymilonga_poi_count for schools/shops/venues count
ALTER TABLE cities ADD COLUMN IF NOT EXISTS hoymilonga_poi_count INTEGER DEFAULT 0;

-- Add hoymilonga_metadata for additional HoyMilonga-specific data
ALTER TABLE cities ADD COLUMN IF NOT EXISTS hoymilonga_metadata JSONB DEFAULT '{}';

-- Create index for hoymilonga_url
CREATE INDEX IF NOT EXISTS idx_cities_hoymilonga_url ON cities(hoymilonga_url);

-- Create index for hoymilonga_last_scraped
CREATE INDEX IF NOT EXISTS idx_cities_hoymilonga_last_scraped ON cities(hoymilonga_last_scraped);

-- Add comments for documentation
COMMENT ON COLUMN cities.hoymilonga_url IS 'URL to the city page on HoyMilonga';
COMMENT ON COLUMN cities.hoymilonga_last_scraped IS 'Timestamp of last successful HoyMilonga scrape for this city';
COMMENT ON COLUMN cities.hoymilonga_event_count IS 'Number of events found for this city on HoyMilonga';
COMMENT ON COLUMN cities.hoymilonga_poi_count IS 'Number of POIs (schools, shops, venues) found for this city on HoyMilonga';
COMMENT ON COLUMN cities.hoymilonga_metadata IS 'Additional metadata from HoyMilonga scraping';
