# Scraper Source Registry Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** AdminPageAgent | **Invocation:** `use mb.md: pages:sources`

---

## 1. Overview

The Scraper Source Registry manages all 244+ website sources used for event scraping. It provides CRUD operations, health monitoring, and configuration for each source.

### MB.MD References
- **Agent:** `use mb.md: agents:page` → AdminPageAgent
- **Scraping:** `use mb.md: agents:scraping` → All scrapers
- **Data:** `city_websites` table

---

## 2. Data Architecture

### 2.1 City Websites Table

```sql
city_websites (
  id: serial PRIMARY KEY,
  city: varchar(100) NOT NULL,
  country: varchar(100),
  url: text NOT NULL,
  name: varchar(255),
  description: text,
  scraper_type: varchar(50),
  is_active: boolean DEFAULT true,
  is_priority: boolean DEFAULT false,
  last_scraped: timestamp,
  last_success: timestamp,
  events_found: integer DEFAULT 0,
  success_rate: numeric(5,2),
  avg_response_time: integer,
  priority: integer DEFAULT 5,
  config: jsonb,
  notes: text,
  created_at: timestamp,
  updated_at: timestamp
)
```

### 2.2 Scraper Types

| Type | Description | Engine |
|------|-------------|--------|
| `hoymilonga` | HoyMilonga scraper | Playwright |
| `tangocat` | TangoCat multi-stage | Cheerio |
| `tangofestivals` | TangoFestivals.com | Cheerio |
| `tangomango` | TangoMango session-based | Playwright |
| `unified` | AI-powered unified | Groq + Cheerio |
| `static` | Simple HTML | Cheerio |
| `javascript` | JS-heavy sites | Playwright |
| `social` | Social media | API |
| `rss` | RSS feeds | Parser |

---

## 3. URL Routing

| Pattern | Access | Purpose |
|---------|--------|---------|
| `/admin/scraping/sources` | Admin | Source registry |
| `/admin/scraping/sources/new` | Admin | Add source |
| `/admin/scraping/sources/:id` | Admin | Edit source |
| `/admin/scraping/sources/:id/test` | Admin | Test scrape |

---

## 4. Page Structure

### 4.1 Source List View

```
┌────────────────────────────────────────────────────────────┐
│  Scraper Sources (244)                    [+ Add Source]   │
├────────────────────────────────────────────────────────────┤
│  Filters: [City ▼] [Type ▼] [Status ▼] [Search...]        │
├────────────────────────────────────────────────────────────┤
│  Source             │ City    │ Type    │ Status │ Events │
│  ───────────────────┼─────────┼─────────┼────────┼────────│
│  HoyMilonga BA      │ BA      │ priority│ ✅     │ 340    │
│  TangoCat Global    │ Global  │ priority│ ✅     │ 890    │
│  La Milonga Club    │ Berlin  │ unified │ ✅     │ 45     │
│  Tango Calendar NY  │ NYC     │ static  │ ⚠️     │ 12     │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Source Detail/Edit Form

```
┌─────────────────────────────────────────────┐
│  Edit Source: La Milonga Club               │
├─────────────────────────────────────────────┤
│  Name: [La Milonga Club            ]        │
│  URL:  [https://lamilonga.de/events]        │
│  City: [Berlin             ▼]               │
│  Country: [Germany         ▼]               │
│  Type: [unified            ▼]               │
│  Priority: [5              ] (1-10)         │
│  Active: [✓]                                │
│  Priority Source: [ ]                       │
├─────────────────────────────────────────────┤
│  Config (JSON):                             │
│  {                                          │
│    "selector": ".event-card",               │
│    "dateFormat": "DD.MM.YYYY"               │
│  }                                          │
├─────────────────────────────────────────────┤
│  Notes:                                     │
│  [German site, uses European date format]   │
├─────────────────────────────────────────────┤
│  [Test Scrape] [Save] [Delete]              │
└─────────────────────────────────────────────┘
```

---

## 5. Source Health Monitoring

### 5.1 Health Metrics

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Success Rate | >90% | 70-90% | <70% |
| Response Time | <5s | 5-10s | >10s |
| Events Found | >0 | - | 0 for 7 days |
| Last Scraped | <7 days | 7-14 days | >14 days |

### 5.2 Health Dashboard

```
┌──────────────────────────────────────────┐
│  Source Health Overview                   │
├──────────────────────────────────────────┤
│  ✅ Healthy: 198 (81%)                   │
│  ⚠️ Warning: 32 (13%)                    │
│  ❌ Critical: 14 (6%)                    │
├──────────────────────────────────────────┤
│  Top Issues:                              │
│  • 8 sources timeout frequently           │
│  • 4 sources return 0 events              │
│  • 2 sources blocked (403)                │
└──────────────────────────────────────────┘
```

---

## 6. TangoMango Sources

### 6.1 State-Based Configuration

```typescript
interface TangoMangoSource {
  state: string;
  stateCode: string;
  areaUrl: string;
  counties: {
    name: string;
    areaId: string;
    eventCount: number;
  }[];
}
```

### 6.2 Pre-configured States

| State | Code | Top Areas |
|-------|------|-----------|
| California | CA | San Francisco, Los Angeles, South Bay |
| Florida | FL | Miami-Dade, Broward, Palm Beach |
| Illinois | IL | Cook/Chicago |
| Massachusetts | MA | Suffolk/Boston |
| Pennsylvania | PA | Philadelphia |
| Arizona | AZ | Maricopa/Phoenix |
| Washington | WA | Spokane, King/Seattle |
| Nevada | NV | Washoe/Reno, Clark/Las Vegas |
| Oregon | OR | Multnomah/Portland |
| North Carolina | NC | Forsyth, Mecklenburg |

---

## 7. API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/city-websites` | List all sources |
| GET | `/api/admin/city-websites/:id` | Get single source |
| POST | `/api/admin/city-websites` | Create source |
| PUT | `/api/admin/city-websites/:id` | Update source |
| DELETE | `/api/admin/city-websites/:id` | Delete source |
| POST | `/api/admin/city-websites/:id/test` | Test scrape |
| GET | `/api/admin/city-websites/health` | Health overview |
| POST | `/api/admin/city-websites/import` | Bulk import |

---

## 8. Source Discovery

### 8.1 AI-Assisted Discovery

```
1. User enters city name
2. System searches for tango-related websites
3. AI analyzes page structure
4. Suggests scraper type and config
5. Admin reviews and approves
```

### 8.2 Discovery Sources

| Method | Description |
|--------|-------------|
| Google Search | "tango milonga {city}" |
| Facebook Events | Tango groups in city |
| Meetup.com | Tango meetups |
| Known Aggregators | TangoCat, HoyMilonga links |

---

## 9. Permissions Matrix

| Action | Admin | Super Admin |
|--------|-------|-------------|
| View sources | ✅ | ✅ |
| Add source | ✅ | ✅ |
| Edit source | ✅ | ✅ |
| Delete source | ❌ | ✅ |
| Test scrape | ✅ | ✅ |
| Bulk import | ❌ | ✅ |
| Priority toggle | ❌ | ✅ |

---

## 10. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/AdminSourcesPage.tsx` | Main page |
| `SourceCard` | Source list item |
| `SourceForm` | Add/Edit form |
| `SourceHealthBadge` | Health indicator |
| `TestScrapeModal` | Test scraping UI |

---

## 11. Test Scenarios

| Scenario | Steps |
|----------|-------|
| View sources | Login → Admin → Sources |
| Add source | Click Add → Fill form → Test → Save |
| Edit source | Click source → Edit → Save |
| Test scrape | Click Test Scrape → View results |
| View health | Navigate to Health tab |

---

## 12. Future Enhancements

- [ ] Auto-discovery of new sources
- [ ] Source quality scoring
- [ ] Duplicate source detection
- [ ] Bulk configuration updates
- [ ] Source sharing between admins

---

*244+ sources feeding the global tango calendar.*
