# Scraping Agents

**Invocation:** `use mb.md: agents:scraping`
**Script:** `npx tsx server/scripts/run-all-scrapers.ts`

---

## 🕷️ SCRAPER INVENTORY

Event data collection from global tango sources.

| Scraper | Source | Type | Cities | Status |
|---------|--------|------|--------|--------|
| HoyMilongaScraper | hoy-milonga.com | Playwright | 30+ | ✅ Active |
| TangoMangoScraper | tangomango.org | HTML | 37 US | ✅ Active |
| TangoCatScraper | tangocat.net | HTML+AI | Global | ✅ Active |
| TangoFestivalsScraper | tango-festivals.com | HTML | Global | ✅ Active |
| UnifiedEventScraper | Various | AI | 50+ | ✅ Active |

---

### 1. HoyMilongaScraper (PRIORITY 1)

**Source:** hoy-milonga.com
**File:** `server/agents/scraping/HoyMilongaScraper.ts`
**Type:** Playwright (JavaScript SPA - REQUIRES BROWSER!)

**CRITICAL:** HoyMilonga is a JavaScript SPA. The HTML/Cheerio scraper in 
`server/services/scraping/HoyMilongaScraper.ts` DOES NOT WORK - events are loaded dynamically!
Always use the Playwright version in `server/agents/scraping/HoyMilongaScraper.ts`

**Coverage:** 30+ cities including:
- Buenos Aires, São Paulo, Berlin, Athens, Istanbul, London, Miami, Montevideo
- Paris, Rome, Madrid, Barcelona, Lisbon, Vienna, Munich, Hamburg
- Amsterdam, Copenhagen, Brussels, Prague, Warsaw, Moscow
- Tokyo, Sydney, Melbourne, New York, Los Angeles, San Francisco, Chicago

**Features:**
- Weekly milonga/practica schedules
- Venue and neighborhood data
- Team extraction (DJs, teachers, orchestras)
- Detail page enrichment

---

### 2. TangoMangoScraper (PRIORITY 1)

**Source:** tangomango.org
**File:** `server/agents/scraping/TangoMangoScraper.ts`
**Type:** HTML/Cheerio

**Coverage:** 37 US cities:
San Francisco, New York, Los Angeles, Chicago, Seattle, Boston, Miami, 
Denver, Austin, Portland, San Diego, Washington DC, Atlanta, Philadelphia,
Dallas, Houston, Phoenix, Minneapolis, Detroit, Cleveland, Pittsburgh,
Las Vegas, Salt Lake City, Nashville, New Orleans, Raleigh, Sacramento,
St. Louis, Tampa, Orlando, Charlotte, San Antonio, Tucson, Boulder, Buffalo, San Jose, Spokane

**Features:**
- Calendar and event detail extraction
- Price and contact info
- Event type classification

---

### 3. TangoCatScraper

**Source:** tangocat.net
**File:** `server/agents/scraping/TangoCatScraper.ts`
**Type:** HTML + AI enrichment

**Coverage:** International festivals, marathons, encuentros (2025-2026)

**Features:**
- Multi-stage scraping (aggregator → source)
- Link-following to actual event sites
- Team extraction from subpages (multi-language)
- Automatic city matching and group creation

---

### 4. TangoFestivalsScraper

**Source:** tango-festivals.com
**File:** `server/agents/scraping/TangoFestivalsScraper.ts`
**Type:** HTML

**Coverage:** Global festival calendar

**Features:**
- Calendar aggregation
- Date range extraction
- Location parsing
- Price information

---

### 5. UnifiedEventScraper

**File:** `server/services/scraping/UnifiedEventScraper.ts`
**Type:** AI-powered generic scraper

**Uses:** Groq llama-3.3-70b-versatile
**Coverage:** ~50+ direct calendar sites

---

### 6-10. Supporting Scrapers

| Scraper | File | Purpose |
|---------|------|---------|
| StaticScraper | `server/agents/scraping/staticScraper.ts` | Simple HTML sites |
| JSScraper | `server/agents/scraping/jsScraper.ts` | Playwright for SPAs |
| SocialScraper | `server/agents/scraping/socialScraper.ts` | Facebook/Instagram |
| SubpageDiscovery | `server/agents/scraping/subpageDiscovery.ts` | Find team pages |
| VenueScraper | `server/agents/scraping/VenueScraper.ts` | Venue details |

---

## 📊 EVENT TYPE CLASSIFICATION

14 event types detected:

| Type | Description |
|------|-------------|
| milonga | Social dance |
| practica | Practice session |
| workshop | Teaching session |
| festival | Multi-day event |
| marathon | Extended dancing |
| encuentro | Invitation event |
| class | Regular class |
| social | Informal gathering |
| performance | Show/demo |
| show | Stage production |
| competition | Contest |
| online | Virtual event |
| concert | Music only |
| private | Invite only |

---

## 🔧 DATABASE SCHEMA

```sql
CREATE TABLE scraped_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  event_type VARCHAR(50),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  city VARCHAR(100),
  country VARCHAR(100),
  venue VARCHAR(255),
  source_url TEXT,
  source_name VARCHAR(100),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending'
);
```

---

## 📤 API ENDPOINTS

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/unified-scrape` | POST | Start scrape |
| `/api/admin/unified-scraper-status` | GET | Get status |
| `/api/admin/scraped-events` | GET | List events |
| `/api/admin/scraped-events/:id/approve` | POST | Approve |

---

## 🎯 INGESTION PIPELINE

```
Scrape → Store in scraped_events → Admin Review → Approve → Move to events table → Display
```

---

*Find every tango event worldwide.*
