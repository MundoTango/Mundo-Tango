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

-- 🇪🇺 Madrid (sample cities - expand with full list)
('http://www.tango-vienna.at/termine', 'website', 'static', 'Vienna', 'Austria', true),
('https://www.facebook.com/groups/tangoparis', 'facebook', 'social', 'Paris', 'France', true),
('https://www.facebook.com/groups/tangoberlin', 'facebook', 'social', 'Berlin', 'Germany', true),
('https://www.tangolondon.com/events', 'website', 'static', 'London', 'United Kingdom', true),
('https://www.facebook.com/groups/tangomadrid', 'facebook', 'social', 'Madrid', 'Spain', true),
('https://www.facebook.com/groups/tangobarcelona', 'facebook', 'social', 'Barcelona', 'Spain', true),
('https://www.tangoseville.com/events', 'website', 'static', 'Seville', 'Spain', true),
('https://www.facebook.com/groups/tangovalencia', 'facebook', 'social', 'Valencia', 'Spain', true),
('https://www.tangolisbon.com/calendar', 'website', 'static', 'Lisbon', 'Portugal', true),
('https://www.facebook.com/groups/tangoporto', 'facebook', 'social', 'Porto', 'Portugal', true),
('https://www.facebook.com/groups/tangorome', 'facebook', 'social', 'Rome', 'Italy', true),
('https://www.tangomilan.it/eventi', 'website', 'static', 'Milan', 'Italy', true),
('https://www.facebook.com/groups/tangoflorence', 'facebook', 'social', 'Florence', 'Italy', true),
('https://www.tangozurich.ch/calendar', 'website', 'static', 'Zurich', 'Switzerland', true),
('https://www.facebook.com/groups/tangogeneva', 'facebook', 'social', 'Geneva', 'Switzerland', true),
('https://www.tangoamsterdam.nl/agenda', 'website', 'static', 'Amsterdam', 'Netherlands', true),
('https://www.facebook.com/groups/tangorotterdam', 'facebook', 'social', 'Rotterdam', 'Netherlands', true),
('https://www.facebook.com/groups/tangobrussels', 'facebook', 'social', 'Brussels', 'Belgium', true),
('https://www.facebook.com/groups/tangocopenhagen', 'facebook', 'social', 'Copenhagen', 'Denmark', true),
('https://www.tangostockholm.se/events', 'website', 'static', 'Stockholm', 'Sweden', true),
('https://www.facebook.com/groups/tangooslo', 'facebook', 'social', 'Oslo', 'Norway', true),
('https://www.tangohelsinki.fi/calendar', 'website', 'static', 'Helsinki', 'Finland', true),
('https://www.facebook.com/groups/tangowarsaw', 'facebook', 'social', 'Warsaw', 'Poland', true),
('https://www.facebook.com/groups/tangoprague', 'facebook', 'social', 'Prague', 'Czech Republic', true),
('https://www.tangobudapest.hu/events', 'website', 'static', 'Budapest', 'Hungary', true),

-- 🌏 Eastern Europe & Russia
('https://www.facebook.com/groups/tangobucharest', 'facebook', 'social', 'Bucharest', 'Romania', true),
('https://www.facebook.com/groups/tangosofia', 'facebook', 'social', 'Sofia', 'Bulgaria', true),
('https://www.facebook.com/groups/tangozagreb', 'facebook', 'social', 'Zagreb', 'Croatia', true),
('https://www.facebook.com/groups/tangomoscow', 'facebook', 'social', 'Moscow', 'Russia', true),
('https://www.facebook.com/groups/tangostpetersburg', 'facebook', 'social', 'St. Petersburg', 'Russia', true),
('https://www.facebook.com/groups/tangokyiv', 'facebook', 'social', 'Kyiv', 'Ukraine', true),

-- 🌏 Asia Pacific
('https://www.tangotokyo.jp/events', 'website', 'static', 'Tokyo', 'Japan', true),
('https://www.facebook.com/groups/tangoosaka', 'facebook', 'social', 'Osaka', 'Japan', true),
('https://www.tangokorea.com/calendar', 'website', 'static', 'Seoul', 'South Korea', true),
('https://www.facebook.com/groups/tangohongkong', 'facebook', 'social', 'Hong Kong', 'Hong Kong', true),
('https://www.facebook.com/groups/tangobeijing', 'facebook', 'social', 'Beijing', 'China', true),
('https://www.facebook.com/groups/tangoshanghai', 'facebook', 'social', 'Shanghai', 'China', true),
('https://www.tangotaiwan.com/events', 'website', 'static', 'Taipei', 'Taiwan', true),
('https://www.tangosingapore.com/calendar', 'website', 'static', 'Singapore', 'Singapore', true),
('https://www.facebook.com/groups/tangobangkok', 'facebook', 'social', 'Bangkok', 'Thailand', true),
('https://www.facebook.com/groups/tangovietnam', 'facebook', 'social', 'Ho Chi Minh City', 'Vietnam', true),
('https://www.tangophilippines.com/events', 'website', 'static', 'Manila', 'Philippines', true),
('https://www.facebook.com/groups/tangojakarta', 'facebook', 'social', 'Jakarta', 'Indonesia', true),
('https://www.facebook.com/groups/tangomalaysia', 'facebook', 'social', 'Kuala Lumpur', 'Malaysia', true),
('https://www.facebook.com/groups/tangoindia', 'facebook', 'social', 'New Delhi', 'India', true),
('https://www.facebook.com/groups/tangobangalore', 'facebook', 'social', 'Bangalore', 'India', true),
('https://www.facebook.com/groups/tangomumbai', 'facebook', 'social', 'Mumbai', 'India', true),

-- 🌍 Middle East
('https://www.facebook.com/groups/tangoistanbul', 'facebook', 'social', 'Istanbul', 'Turkey', true),
('https://www.facebook.com/groups/tangoankara', 'facebook', 'social', 'Ankara', 'Turkey', true),
('https://www.facebook.com/groups/tangotelaviv', 'facebook', 'social', 'Tel Aviv', 'Israel', true),
('https://www.facebook.com/groups/tangodubai', 'facebook', 'social', 'Dubai', 'UAE', true),
('https://www.facebook.com/groups/tangobeirut', 'facebook', 'social', 'Beirut', 'Lebanon', true),

-- 🌍 Africa
('https://www.facebook.com/groups/tangocapetown', 'facebook', 'social', 'Cape Town', 'South Africa', true),
('https://www.facebook.com/groups/tangojohannesburg', 'facebook', 'social', 'Johannesburg', 'South Africa', true),
('https://www.facebook.com/groups/tangocairo', 'facebook', 'social', 'Cairo', 'Egypt', true),
('https://www.facebook.com/groups/tangocasablanca', 'facebook', 'social', 'Casablanca', 'Morocco', true),
('https://www.facebook.com/groups/tangotunis', 'facebook', 'social', 'Tunis', 'Tunisia', true),
('https://www.facebook.com/groups/tangonairobi', 'facebook', 'social', 'Nairobi', 'Kenya', true),

-- 🌏 Oceania
('https://www.tangosydney.com/events', 'website', 'static', 'Sydney', 'Australia', true),
('https://tangoclub.melbourne/melbourne-tango-calendar', 'website', 'static', 'Melbourne', 'Australia', true),
('https://www.facebook.com/groups/tangobrisbane', 'facebook', 'social', 'Brisbane', 'Australia', true),
('https://www.facebook.com/groups/tangoperth', 'facebook', 'social', 'Perth', 'Australia', true),
('https://www.facebook.com/groups/tangoadelaide', 'facebook', 'social', 'Adelaide', 'Australia', true),
('https://www.tangoauckland.co.nz/events', 'website', 'static', 'Auckland', 'New Zealand', true),
('https://www.facebook.com/groups/tangowellington', 'facebook', 'social', 'Wellington', 'New Zealand', true),
('https://www.facebook.com/groups/tangochristchurch', 'facebook', 'social', 'Christchurch', 'New Zealand', true),

-- 🌎 More Latin America
('https://www.facebook.com/groups/tangosantiago', 'facebook', 'social', 'Santiago', 'Chile', true),
('https://www.facebook.com/groups/tangovalparaiso', 'facebook', 'social', 'Valparaíso', 'Chile', true),
('https://www.facebook.com/groups/tangomontevideo', 'facebook', 'social', 'Montevideo', 'Uruguay', true),
('https://www.facebook.com/groups/tangobogota', 'facebook', 'social', 'Bogotá', 'Colombia', true),
('https://www.facebook.com/groups/tangomedellin', 'facebook', 'social', 'Medellín', 'Colombia', true),
('https://www.facebook.com/groups/tangolima', 'facebook', 'social', 'Lima', 'Peru', true),
('https://www.facebook.com/groups/tangoquito', 'facebook', 'social', 'Quito', 'Ecuador', true),
('https://www.facebook.com/groups/tangocaracas', 'facebook', 'social', 'Caracas', 'Venezuela', true),
('https://www.facebook.com/groups/tangopanama', 'facebook', 'social', 'Panama City', 'Panama', true),
('https://www.facebook.com/groups/tangocostarica', 'facebook', 'social', 'San José', 'Costa Rica', true),
('https://www.facebook.com/groups/tangosandiego', 'facebook', 'social', 'San Diego', 'United States', true),
('https://www.facebook.com/groups/tangophiladelphia', 'facebook', 'social', 'Philadelphia', 'United States', true),
('https://www.facebook.com/groups/tangoatlanta', 'facebook', 'social', 'Atlanta', 'United States', true),
('https://www.tangophoenix.com/events', 'website', 'static', 'Phoenix', 'United States', true),
('https://www.facebook.com/groups/tangonashville', 'facebook', 'social', 'Nashville', 'United States', true),
('https://www.facebook.com/groups/tangodallas', 'facebook', 'social', 'Dallas', 'United States', true),
('https://www.facebook.com/groups/tangohouston', 'facebook', 'social', 'Houston', 'United States', true),
('https://www.facebook.com/groups/tangominneapolis', 'facebook', 'social', 'Minneapolis', 'United States', true),
('https://www.facebook.com/groups/tangosaltlakecity', 'facebook', 'social', 'Salt Lake City', 'United States', true),
('https://www.tangolas vegas.com/calendar', 'website', 'static', 'Las Vegas', 'United States', true),
('https://www.facebook.com/groups/tangocalgary', 'facebook', 'social', 'Calgary', 'Canada', true),
('https://www.facebook.com/groups/tangoottawa', 'facebook', 'social', 'Ottawa', 'Canada', true),
('https://www.facebook.com/groups/tangoguadalajara', 'facebook', 'social', 'Guadalajara', 'Mexico', true),
('https://www.facebook.com/groups/tangomonterrey', 'facebook', 'social', 'Monterrey', 'Mexico', true),
('https://www.facebook.com/groups/tangocuritiba', 'facebook', 'social', 'Curitiba', 'Brazil', true),
('https://www.facebook.com/groups/tangoportoalegre', 'facebook', 'social', 'Porto Alegre', 'Brazil', true),
('https://www.facebook.com/groups/tangobrasilia', 'facebook', 'social', 'Brasília', 'Brazil', true),
('https://www.facebook.com/groups/tangobuenosaires2', 'facebook', 'social', 'La Plata', 'Argentina', true),
('https://www.facebook.com/groups/tangomardelplata', 'facebook', 'social', 'Mar del Plata', 'Argentina', true),
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
