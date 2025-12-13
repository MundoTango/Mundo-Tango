-- Populate TangoMango Event Scraping Sources
-- This migration adds all major cities from TangoMango.org as event sources

-- Insert TangoMango event sources
INSERT INTO event_scraping_sources (name, url, platform, country, city, is_active)
VALUES
-- California
('TangoMango SF', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'San Francisco', true),
('TangoMango LA', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Los Angeles', true),
('TangoMango SD', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'San Diego', true),
('TangoMango SJ', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'San Jose', true),
('TangoMango Sacramento', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Sacramento', true),
('TangoMango Orange County', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Orange', true),
-- New York
('TangoMango NYC', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'New York', true),
('TangoMango Buffalo', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Buffalo', true),
-- Texas
('TangoMango Austin', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Austin', true),
('TangoMango Houston', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Houston', true),
('TangoMango Dallas', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Dallas', true),
('TangoMango San Antonio', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'San Antonio', true),
-- Florida
('TangoMango Miami', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Miami', true),
('TangoMango Tampa', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Tampa', true),
('TangoMango Orlando', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Orlando', true),
-- Illinois
('TangoMango Chicago', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Chicago', true),
-- Massachusetts
('TangoMango Boston', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Boston', true),
-- Washington
('TangoMango Seattle', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Seattle', true),
('TangoMango Spokane', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Spokane', true),
-- Colorado
('TangoMango Denver', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Denver', true),
('TangoMango Boulder', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Boulder', true),
-- Oregon
('TangoMango Portland', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Portland', true),
-- Georgia
('TangoMango Atlanta', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Atlanta', true),
-- Arizona
('TangoMango Phoenix', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Phoenix', true),
('TangoMango Tucson', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Tucson', true),
-- Pennsylvania
('TangoMango Philadelphia', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Philadelphia', true),
('TangoMango Pittsburgh', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Pittsburgh', true),
-- DC
('TangoMango Washington DC', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Washington', true),
-- Michigan
('TangoMango Detroit', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Detroit', true),
-- Minnesota
('TangoMango Minneapolis', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Minneapolis', true),
-- North Carolina
('TangoMango Charlotte', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Charlotte', true),
('TangoMango Raleigh', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Raleigh', true),
-- Missouri
('TangoMango St Louis', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'St Louis', true),
-- Nevada
('TangoMango Las Vegas', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'Las Vegas', true),
-- Louisiana
('TangoMango New Orleans', 'https://www.tangomango.org/index.php', 'tangomango', 'US', 'New Orleans', true),
-- International - Argentina
('TangoMango Buenos Aires', 'https://www.tangomango.org/index.php', 'tangomango', 'AR', 'Buenos Aires', true),
-- International - Canada
('TangoMango Toronto', 'https://www.tangomango.org/index.php', 'tangomango', 'CA', 'Toronto', true),
('TangoMango Vancouver', 'https://www.tangomango.org/index.php', 'tangomango', 'CA', 'Vancouver', true),
('TangoMango Montreal', 'https://www.tangomango.org/index.php', 'tangomango', 'CA', 'Montreal', true),
('TangoMango Ottawa', 'https://www.tangomango.org/index.php', 'tangomango', 'CA', 'Ottawa', true),
('TangoMango Calgary', 'https://www.tangomango.org/index.php', 'tangomango', 'CA', 'Calgary', true),
-- International - UK
('TangoMango London', 'https://www.tangomango.org/index.php', 'tangomango', 'GB', 'London', true),
-- International - Germany
('TangoMango Berlin', 'https://www.tangomango.org/index.php', 'tangomango', 'DE', 'Berlin', true),
-- International - France
('TangoMango Paris', 'https://www.tangomango.org/index.php', 'tangomango', 'FR', 'Paris', true),
-- International - Spain
('TangoMango Barcelona', 'https://www.tangomango.org/index.php', 'tangomango', 'ES', 'Barcelona', true),
('TangoMango Madrid', 'https://www.tangomango.org/index.php', 'tangomango', 'ES', 'Madrid', true);
