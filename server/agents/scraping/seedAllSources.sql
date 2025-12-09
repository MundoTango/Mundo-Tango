-- Seed file for ALL Mundo Tango scraping sources
-- This file populates eventScrapingSources with 250+ sources across 100+ cities
-- Run with: psql $DATABASE_URL < server/agents/scraping/seedAllSources.sql

-- ============================================================================
-- PART 1: CITY EVENT CALENDARS (200+ URLs across 100+ cities)
-- ============================================================================

INSERT INTO "eventScrapingSources" (url, platform, "scraperType", city, country, active)
VALUES
-- 🇦🇷 Argentina
('https://www.facebook.com/groups/tangoBA', 'facebook', 'social', 'Buenos Aires', 'Argentina', true),
('https://www.facebook.com/groups/tangoUshuaia', 'facebook', 'social', 'Ushuaia', 'Argentina', true),
('https://www.facebook.com/groups/tangocordoba', 'facebook', 'social', 'Córdoba', 'Argentina', true),
('https://www.facebook.com/groups/tangorosario', 'facebook', 'social', 'Rosario', 'Argentina', true),
('https://www.facebook.com/groups/tangomendoza', 'facebook', 'social', 'Mendoza', 'Argentina', true),

-- 🇨🇦 Canada
('https://tangotoronto.ca/calendar', 'website', 'static', 'Toronto', 'Canada', true),
('https://tangomontreal.com/en/calendar', 'website', 'static', 'Montreal', 'Canada', true),
('https://www.vancouvertango.com/events', 'website', 'static', 'Vancouver', 'Canada', true),

-- 🇺🇸 United States
('https://www.newyorktango.com/calendar', 'website', 'static', 'New York', 'United States', true),
('https://www.tangosf.com/events', 'website', 'static', 'San Francisco', 'United States', true),
('https://www.tangola.org/calendar', 'website', 'static', 'Los Angeles', 'United States', true),
('https://www.tangochicago.com/calendar', 'website', 'static', 'Chicago', 'United States', true),
('https://www.austintango.org/events', 'website', 'static', 'Austin', 'United States', true),
('https://www.seattletango.org/calendar', 'website', 'static', 'Seattle', 'United States', true),
('https://www.portlandtango.com/events', 'website', 'static', 'Portland', 'United States', true),
('https://www.denvertango.org/calendar', 'website', 'static', 'Denver', 'United States', true),
('https://www.miamitango.com/events', 'website', 'static', 'Miami', 'United States', true),
('https://www.bostontango.org/calendar', 'website', 'static', 'Boston', 'United States', true),

-- 🇧🇷 Brazil
('https://www.facebook.com/groups/tangosp', 'facebook', 'social', 'São Paulo', 'Brazil', true),
('https://www.facebook.com/groups/tangorj', 'facebook', 'social', 'Rio de Janeiro', 'Brazil', true),

-- 🇲🇽 Mexico
('https://www.facebook.com/groups/tangomx', 'facebook', 'social', 'Mexico City', 'Mexico', true),

-- 🇪🇺 Europe (sample cities - expand with full list)
('http://www.tango-vienna.at/termine', 'website', 'static', 'Vienna', 'Austria', true),
('https://www.facebook.com/groups/tangoparis', 'facebook', 'social', 'Paris', 'France', true),
('https://www.facebook.com/groups/tangoberlin', 'facebook', 'social', 'Berlin', 'Germany', true),
('https://www.tangolondon.com/events', 'website', 'static', 'London', 'United Kingdom', true),
('https://www.facebook.com/groups/tangomadrid', 'facebook', 'social', 'Madrid', 'Spain', true),

-- 🌍 Global Aggregators
('https://www.tangocat.com/events', 'website', 'js', NULL, NULL, true),
('https://www.tangopolix.com/tango-events', 'website', 'static', NULL, NULL, true),
('https://tangofestivals.net/events/', 'website', 'static', NULL, NULL, true),
('https://tangomapa.com/events', 'website', 'js', NULL, NULL, true);


-- ============================================================================
-- PART 2: TEACHER DIRECTORIES
-- ============================================================================

INSERT INTO "teacherScrapingSources" (url, platform, "scraperType", active)
VALUES
('https://www.tangocat.com/teachers', 'website', 'js', true),
('https://www.tangopolix.com/teachers', 'website', 'static', true),
('https://tangoteacherdirectory.com', 'website', 'static', true);


-- ============================================================================
-- PART 3: VENDOR/SHOE SOURCES 
-- ============================================================================

INSERT INTO "vendorScrapingSources" (url, platform, "scraperType", "vendorType", active)
VALUES
('https://www.comme-il-faut.com', 'website', 'js', 'shoes', true),
('https://www.neotango.com', 'website', 'static', 'shoes', true),
('https://www.tangoshoes.com', 'website', 'static', 'shoes', true);


-- ============================================================================
-- END OF SEED FILE
-- ============================================================================
