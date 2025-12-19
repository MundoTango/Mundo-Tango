# Scraping Agents

**Invocation:** `use mb.md: agents:scraping`

---

## 🕷️ 10 SCRAPING AGENTS

Event data collection from global tango sources.

---

### 1. MasterOrchestrator

**Function:** Coordinates all scrapers

```typescript
interface MasterOrchestrator {
  runAll(): Promise<ScrapeResult[]>;
  runPriority(): Promise<ScrapeResult[]>;
  schedule(cron: string): void;
  getStatus(): OrchestratorStatus;
}
```

**Schedule:** Daily at 4 AM UTC
**Coordinates:** All scrapers in parallel

---

### 2. HoyMilongaScraper

**Source:** HoyMilonga.com
**Coverage:** ~8 cities
- Buenos Aires
- São Paulo
- Berlin
- Athens
- Istanbul
- London
- Miami
- Montevideo

**Features:**
- Uses Playwright (SPA requires JS)
- Weekly milonga/practica schedules
- Venue and neighborhood data
- Team extraction (DJs, teachers, orchestras)

---

### 3. TangoCatScraper

**Source:** TangoCat.net
**Coverage:** International festivals, marathons, encuentros

**Features:**
- Multi-stage scraping (aggregator → source)
- Link-following to actual event sites
- Festival/marathon/encuentro detection
- Builds ID→URL map from JSON

---

### 4. TangoFestivalsScraper

**Source:** Tango-Festivals.com
**Coverage:** Global festival calendar

**Features:**
- Calendar aggregation
- Date range extraction
- Location parsing
- Price information

---

### 5. UnifiedEventScraper

**Function:** AI-powered generic scraper

```typescript
interface UnifiedEventScraper {
  scrape(url: string): Promise<Event[]>;
  configureForSite(config: SiteConfig): void;
  learnFromFeedback(feedback: ScrapeFeedback): void;
}
```

**Uses:** Groq llama-3.3-70b-versatile
**Coverage:** ~50+ direct calendar sites

---

### 6. StaticScraper

**Function:** Simple HTML sites

**Best for:**
- Static event listings
- Basic calendars
- No JavaScript required

---

### 7. JSScraper

**Function:** JavaScript-heavy sites

**Uses:** Playwright browser automation
**Best for:**
- SPAs
- Dynamic content
- Lazy-loaded data

---

### 8. SocialScraper

**Function:** Social media events

**Platforms:**
- Facebook Events
- Instagram posts
- Meetup.com

---

### 9. SubpageDiscovery

**Function:** Finds event subpages

**Discovers:**
- /djs, /teachers, /maestros
- /performers, /artists
- /schedule, /program

---

### 10. Deduplicator

**Function:** Removes duplicate events

**Logic:**
- Title similarity
- Date matching
- Venue matching
- Source preference

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
