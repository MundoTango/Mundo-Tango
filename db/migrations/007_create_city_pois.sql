-- Create city_pois table for schools, shops, and venue rentals
CREATE TABLE city_pois (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  poi_type VARCHAR(50) NOT NULL CHECK (poi_type IN ('school', 'shop', 'venue_rental')),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  social_media JSONB DEFAULT '{}',
  business_hours JSONB,
  amenities TEXT[],
  price_range VARCHAR(20),
  images JSONB DEFAULT '[]',
  verified BOOLEAN DEFAULT FALSE,
  claimed_by_user_id UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_city_pois_city_id ON city_pois(city_id);
CREATE INDEX idx_city_pois_poi_type ON city_pois(poi_type);
CREATE INDEX idx_city_pois_slug ON city_pois(slug);
CREATE INDEX idx_city_pois_verified ON city_pois(verified);
CREATE INDEX idx_city_pois_claimed_by_user ON city_pois(claimed_by_user_id);
CREATE INDEX idx_city_pois_search ON city_pois USING gin(search_vector);
CREATE INDEX idx_city_pois_location ON city_pois(latitude, longitude);

-- Create unique constraint for slug within city
CREATE UNIQUE INDEX idx_city_pois_city_slug ON city_pois(city_id, slug);

-- Create trigger for updated_at
CREATE TRIGGER update_city_pois_updated_at
  BEFORE UPDATE ON city_pois
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for search_vector
CREATE TRIGGER update_city_pois_search_vector
  BEFORE INSERT OR UPDATE ON city_pois
  FOR EACH ROW
  EXECUTE FUNCTION tsvector_update_trigger(search_vector, 'pg_catalog.english', name, description, address);
