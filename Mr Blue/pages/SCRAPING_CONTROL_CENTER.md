# Scraping Control Center Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** AdminPageAgent | **Invocation:** `use mb.md: pages:scraping`

---

## 1. Overview

The Scraping Control Center is the admin interface for managing all event scraping operations. It provides real-time monitoring, manual triggers, and configuration for the 10 scraping agents.

### MB.MD References
- **Agent:** `use mb.md: agents:page` → AdminPageAgent
- **Scraping Agents:** `use mb.md: agents:scraping` → All 10 scrapers
- **Orchestration:** `use mb.md: orchestration:parallel` → Parallel execution

---

## 2. Data Architecture

### 2.1 Core Tables

```sql
scraped_events (
  id: serial PRIMARY KEY,
  title: varchar(255),
  event_type: varchar(50),
  start_date: timestamp,
  end_date: timestamp,
  city: varchar(100),
  country: varchar(100),
  venue: varchar(255),
  address: text,
  source_url: text UNIQUE,
  source_name: varchar(100),
  source_logo: text,
  description: text,
  image_url: text,
  price_info: text,
  organizers: jsonb,
  djs: jsonb,
  teachers: jsonb,
  status: varchar(20) DEFAULT 'pending',
  created_at: timestamp,
  updated_at: timestamp
)

city_websites (
  id: serial PRIMARY KEY,
  city: varchar(100),
  country: varchar(100),
  url: text NOT NULL,
  name: varchar(255),
  scraper_type: varchar(50),
  is_active: boolean DEFAULT true,
  last_scraped: timestamp,
  events_found: integer DEFAULT 0,
  success_rate: numeric(5,2),
  priority: integer DEFAULT 5,
  config: jsonb
)

scraper_runs (
  id: serial PRIMARY KEY,
  scraper_name: varchar(100),
  started_at: timestamp,
  completed_at: timestamp,
  status: varchar(20),
  events_found: integer,
  events_new: integer,
  events_updated: integer,
  errors: jsonb,
  duration_ms: integer
)
```

---

## 3. URL Routing

| Pattern | Access | Purpose |
|---------|--------|---------|
| `/admin/scraping` | Admin Only | Main control center |
| `/admin/scraping/sources` | Admin Only | Source management |
| `/admin/scraping/events` | Admin Only | Scraped events review |
| `/admin/scraping/logs` | Admin Only | Run history |

---

## 4. Page Structure

### 4.1 Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│  Scraping Control Center                    [Run All Now]  │
├────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Sources  │ │ Pending  │ │ Approved │ │ Errors   │       │
│ │   244    │ │    57    │ │  1,234   │ │    3     │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├────────────────────────────────────────────────────────────┤
│  [Tabs: Overview | Scrapers | Sources | Queue | Logs]      │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Tab Navigation

| # | Tab | Purpose |
|---|-----|---------|
| 1 | **Overview** | Dashboard with stats and health |
| 2 | **Scrapers** | Individual scraper status and controls |
| 3 | **Sources** | City websites management |
| 4 | **Queue** | Pending events for review |
| 5 | **Logs** | Run history and errors |

---

## 5. Scrapers Tab

### 5.1 Scraper Cards

```
┌─────────────────────────────────────────────────┐
│ HoyMilongaScraper                    [Run Now]  │
│ Status: ✅ Ready | Last Run: 2h ago             │
│ Coverage: 8 cities | Events: 340                │
│ Success Rate: 98.5%                             │
├─────────────────────────────────────────────────┤
│ Cities: BA, Berlin, Athens, São Paulo...        │
└─────────────────────────────────────────────────┘
```

### 5.2 Scraper List

| Scraper | Type | Cities | Status |
|---------|------|--------|--------|
| HoyMilongaScraper | Priority | 8 | Playwright |
| TangoCatScraper | Priority | Global | Multi-stage |
| TangoFestivalsScraper | Priority | Global | Calendar |
| TangoMangoScraper | NEW | 50+ US | Session-based |
| UnifiedEventScraper | AI | Any | Groq LLM |
| StaticScraper | Basic | Any | HTML |
| JSScraper | Advanced | Any | Playwright |
| SocialScraper | Social | Any | API |

---

## 6. TangoMango Integration

### 6.1 Source Configuration

```typescript
interface TangoMangoConfig {
  baseUrl: "https://www.tangomango.org";
  stateSelectionUrl: "/choosearea.php";
  states: TangoMangoState[];
}

interface TangoMangoState {
  code: string;           // "CA", "FL", etc.
  name: string;           // "California"
  areaUrl: string;        // Full URL
  counties: TangoMangoCounty[];
}

interface TangoMangoCounty {
  name: string;           // "San Francisco"
  areaId: string;         // Form element ID
  eventCount: number;     // Historical count
}
```

### 6.2 High-Activity States

| State | URL | Top Areas |
|-------|-----|-----------|
| California | `/choosearea.php?countryid=US&stateid=CA` | San Francisco (755), LA (759), South Bay (461) |
| Florida | `/choosearea.php?countryid=US&stateid=FL` | Miami-Dade (772), Broward (271), Palm Beach (117) |
| Illinois | `/choosearea.php?countryid=US&stateid=IL` | Cook/Chicago (511) |
| Massachusetts | `/choosearea.php?countryid=US&stateid=MA` | Suffolk/Boston (233) |
| Pennsylvania | `/choosearea.php?countryid=US&stateid=PA` | Philadelphia (128) |

### 6.3 Scraping Workflow

```
1. GET state area page (/choosearea.php?stateid=XX)
2. Parse HTML for county/city form elements
3. POST to /lib/savearea.php with area IDs
4. GET calendar page with session cookie
5. Extract events from calendar
6. Map to city slugs
```

---

## 7. API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/unified-scrape` | Start scrape job |
| GET | `/api/admin/unified-scraper-status` | Get status |
| GET | `/api/admin/scraped-events` | List pending events |
| POST | `/api/admin/scraped-events/:id/approve` | Approve event |
| DELETE | `/api/admin/scraped-events/:id` | Reject event |
| GET | `/api/admin/city-websites` | List sources |
| POST | `/api/admin/city-websites` | Add source |
| PUT | `/api/admin/city-websites/:id` | Update source |

---

## 8. Permissions Matrix

| Action | Admin | Super Admin |
|--------|-------|-------------|
| View dashboard | ✅ | ✅ |
| Run individual scraper | ✅ | ✅ |
| Run all scrapers | ❌ | ✅ |
| Add/edit sources | ✅ | ✅ |
| Delete sources | ❌ | ✅ |
| Approve events | ✅ | ✅ |
| Bulk approve | ❌ | ✅ |
| View logs | ✅ | ✅ |
| Clear queue | ❌ | ✅ |

---

## 9. Mobile Responsiveness

| Screen | Layout |
|--------|--------|
| Mobile | Single column, stacked cards |
| Tablet | 2-column grid |
| Desktop | Full dashboard layout |

---

## 10. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/AdminScrapingPage.tsx` | Main page |
| `ScraperStatusCard` | Individual scraper display |
| `ScrapedEventsTable` | Event review table |
| `SourceManagement` | City websites CRUD |

---

## 11. Test Scenarios

| Scenario | Steps |
|----------|-------|
| View dashboard | Login as admin → /admin/scraping |
| Run scraper | Click "Run Now" on HoyMilonga card |
| Review events | Navigate to Queue tab → Approve/Reject |
| Add source | Sources tab → Add Website → Fill form |

---

## 12. Future Enhancements

- [ ] Scheduled scraping UI
- [ ] AI-powered source discovery
- [ ] Quality scoring visualization
- [ ] Export scraped data
- [ ] TangoMango bulk import

---

*Central command for global tango event discovery.*
