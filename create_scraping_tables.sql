-- Scraping System Database Schema
-- Creates tables for event scraping sources and scraped data

-- Table 1: eventScrapingSources - stores URLs and config for sources to scrape
CREATE TABLE IF NOT EXISTS "eventScrapingSources" (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('website', 'facebook', 'instagram', 'eventbrite', 'meetup', 'rss')),
  "scraperType" TEXT NOT NULL CHECK ("scraperType" IN ('static', 'js', 'social', 'rss')),
  city TEXT,
  country TEXT,
  active BOOLEAN DEFAULT true,
  "lastScraped" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Table 2: scrapedEvents - stores raw scraped event data
CREATE TABLE IF NOT EXISTS "scrapedEvents" (
  id SERIAL PRIMARY KEY,
  "sourceId" INTEGER REFERENCES "eventScrapingSources"(id) ON DELETE CASCADE,
  "externalId" TEXT,
  title TEXT NOT NULL,
  description TEXT,
  "startDate" TIMESTAMP,
  "endDate" TIMESTAMP,
  venue TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  "imageUrl" TEXT,
  "sourceUrl" TEXT,
  "rawData" JSONB,
  "scrapedAt" TIMESTAMP DEFAULT NOW(),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("sourceId", "externalId")
);

-- Table 3: teacherScrapingSources - stores teacher directory sources
CREATE TABLE IF NOT EXISTS "teacherScrapingSources" (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL,
  "scraperType" TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  "lastScraped" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Table 4: vendorScrapingSources - stores vendor/shoe sources  
CREATE TABLE IF NOT EXISTS "vendorScrapingSources" (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL,
  "scraperType" TEXT NOT NULL,
  "vendorType" TEXT,
  active BOOLEAN DEFAULT true,
  "lastScraped" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_sources_active ON "eventScrapingSources"(active);
CREATE INDEX IF NOT EXISTS idx_event_sources_city ON "eventScrapingSources"(city);
CREATE INDEX IF NOT EXISTS idx_scraped_events_source ON "scrapedEvents"("sourceId");
CREATE INDEX IF NOT EXISTS idx_scraped_events_date ON "scrapedEvents"("startDate");
CREATE INDEX IF NOT EXISTS idx_scraped_events_city ON "scrapedEvents"(city);

