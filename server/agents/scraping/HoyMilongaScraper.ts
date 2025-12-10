/**
 * NEW SCRAPERS IMPLEMENTATION PLAN
 * 
 * Based on curated source list from TangoVida and user requirements
 * Priority order based on event volume and city importance
 */

// ====================
// PRIORITY 1: HOY MILONGA SCRAPER (CRITICAL)
// ====================
/**
 * Cities served: Buenos Aires, São Paulo, Berlin, Athens, Istanbul, 
 *                London, Miami, Montevideo
 * URL Pattern: hoy-milonga.com/{city}/en/milongas
 * 
 * Structure:
 * - Day-based calendar tabs (Mon-Sun)
 * - Event cards with: title, time, venue, neighborhood, type
 * - Hundreds of events per city
 * 
 * Example scraped data:
 * {
 *   title: "Barajando",
 *   time: "18:00 - 01:00",
 *   venue: "Lo De Celia",
 *   neighborhood: "San Cristóbal",
 *   city: "Buenos Aires",
 *   type: "MILONGA",
 *   classes: "17:00-18:00"
 * }
 */

// Priority 1A: Buenos Aires (300+ weekly events)
// Priority 1B: Berlin (200+ weekly events)
// Priority 1C: London, São Paulo, Athens, Istanbul, Miami, Montevideo

// ====================
// PRIORITY 2: TANGOMANGO SCRAPER
// ====================
/**
 * US Multi-city aggregator
 * Cities: Chicago, LA, SF, Miami, Philadelphia, Southern California
 * URL: tangomango.org/index.php?show={county},{state}
 * 
 * Structure:
 * - Geographic region filtering
 * - Comprehensive US coverage
 * - Event listings with venue details
 */

// ====================
// PRIORITY 3: SPECIALIZED PLATFORM SCRAPERS
// ====================

/**
 * 3A. TANGO CALENDAR SCRAPERS
 * - BostonTangoCalendar.com (US-Boston)
 * - SDTangoCalendar.com (US-San Diego)
 * - TorontoTango.com (Canada-Toronto)
 * - NewYorkTango.com (US-NYC)
 * - TangoEvents.au (Australia-Sydney/Melbourne)
 */

/**
 * 3B. REGIONAL AGGREGATORS
 * - TangoInfo.ch (Switzerland: Basel, Zurich, Lucerne)
 * - TangoKalender.nl (Netherlands: Amsterdam, Rotterdam)
 * - TangoArgentin.fr (France: Paris, Lyon, Bordeaux, etc)
 * - Milonga.hu (Hungary: Budapest)
 * - Milonga.be (Belgium: Brussels)
 * - Milonga.tw (Taiwan: Taipei)
 */

/**
 * 3C. CITY-SPECIFIC SCRAPERS
 * - TangoPrague.info (Czech Republic)
 * - TangoLx.com (Portugal-Lisbon)
 * - TangoToronto.com (Canada)
 * - AllVancouverTango.com (Canada)
 * - Tangopolix.com (International festivals - ALREADY EXISTS)
 * - TangoFestivals.net (International festivals - ALREADY EXISTS)
 */

// ====================
// PRIORITY 4: SOCIAL MEDIA SCRAPERS
// ====================
/**
 * Facebook Groups (100+ cities configured in seedAllSources.sql)
 * - Already implemented in socialScraper.ts
 * - Needs rate limiting and authentication handling
 */

// ====================
// PRIORITY 5: GOOGLE CALENDAR SCRAPERS
// ====================
/**
 * Cities using public Google Calendars:
 * - Nice, France
 * - Rome, Italy 
 * - Washington DC, USA
 * 
 * Requires Google Calendar API integration
 */

// ====================
// IMPLEMENTATION STRATEGY
// ====================
/**
 * Phase 1 (THIS WEEK - Critical):
 * 1. HoyMilongaScraper.ts - Buenos Aires first
 * 2. Update seedAllSources.sql with all Hoy Milonga cities
 * 3. Run scraper, verify events appear in /groups/89
 * 
 * Phase 2 (NEXT WEEK):
 * 1. TangoMangoScraper.ts for US cities
 * 2. TangoCalendarScraper.ts (generic for Boston, SD, etc)
 * 3. RegionalAggregatorScraper.ts (TangoInfo, TangoKalender, etc)
 * 
 * Phase 3 (MONTH 2):
 * 1. GoogleCalendarScraper.ts
 * 2. Deep link following for all scrapers
 * 3. WhatsApp group integration (optional)
 */

export {}; // Make this a module
