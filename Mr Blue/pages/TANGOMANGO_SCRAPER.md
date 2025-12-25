# TangoMango Scraper Integration Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** MasterOrchestrator | **Invocation:** `use mb.md: pages:tangomango`

---

## 1. Overview

TangoMango.org is a major US-based tango event aggregator covering 50+ states with session-based area selection. This scraper integrates TangoMango data into the Mundo Tango platform.

### MB.MD References
- **Agent:** `use mb.md: agents:scraping` → MasterOrchestrator, JSScraper
- **Operations:** `use mb.md: operations` → 10-step workflow
- **Orchestration:** `use mb.md: orchestration:parallel` → State parallelization

---

## 2. System Architecture

### 2.1 Session-Based Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  TangoMango Scraping Flow                    │
├─────────────────────────────────────────────────────────────┤
│  1. GET choosearea.php?stateid=XX                           │
│     ↓                                                        │
│  2. Parse HTML for county/city form elements                │
│     ↓                                                        │
│  3. POST /lib/savearea.php with area IDs (session cookie)   │
│     ↓                                                        │
│  4. GET calendar with session cookie                        │
│     ↓                                                        │
│  5. Extract events from calendar HTML                       │
│     ↓                                                        │
│  6. Map to city slugs and store                            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 URL Patterns

| Pattern | Purpose |
|---------|---------|
| `tangomango.org/choosearea.php?countryid=US&stateid={STATE}` | Area selection |
| `tangomango.org/lib/savearea.php` | Save selected areas (POST) |
| `tangomango.org/index.php` | Calendar view (with session) |

---

## 3. State Configuration

### 3.1 High-Activity States (Priority)

| State | Code | URL | Top Areas (Event Count) |
|-------|------|-----|------------------------|
| California | CA | `/choosearea.php?countryid=US&stateid=CA` | San Francisco (755), Los Angeles (759), Santa Clara (461) |
| Florida | FL | `/choosearea.php?countryid=US&stateid=FL` | Miami-Dade (772), Broward (271), Palm Beach (117) |
| Illinois | IL | `/choosearea.php?countryid=US&stateid=IL` | Cook/Chicago (511) |
| Massachusetts | MA | `/choosearea.php?countryid=US&stateid=MA` | Suffolk/Boston (233), Hampshire (46) |
| Pennsylvania | PA | `/choosearea.php?countryid=US&stateid=PA` | Philadelphia (128), Montgomery (91) |

### 3.2 Medium-Activity States

| State | Code | Top Areas |
|-------|------|-----------|
| Arizona | AZ | Maricopa/Phoenix (99), Pima/Tucson |
| Washington | WA | Spokane (89), Benton (30), King/Seattle |
| Nevada | NV | Washoe/Reno (68), Clark/Las Vegas (39) |
| Oregon | OR | Multnomah/Portland, Deschutes (29) |
| North Carolina | NC | Forsyth (23), Mecklenburg (16), Durham (16) |

### 3.3 All States (Complete List)

```
AL, AK, AZ, AR, CA, CO, CT, DE, DC, FL, GA, HI, ID, IL, IN, IA, 
KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, 
NY, NC, ND, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, 
WV, WI, WY
```

---

## 4. Scraper Implementation

### 4.1 TypeScript Interface

```typescript
interface TangoMangoScraper {
  name: "TangoMangoScraper";
  type: "session-based";
  engine: "playwright";
  
  // Configuration
  baseUrl: "https://www.tangomango.org";
  states: TangoMangoState[];
  
  // Methods
  scrapeState(stateCode: string): Promise<ScrapedEvent[]>;
  scrapeAllStates(): Promise<ScrapedEvent[]>;
  parseAreaSelection(html: string): AreaOption[];
  extractCalendarEvents(html: string): RawEvent[];
}

interface TangoMangoState {
  code: string;
  name: string;
  priority: number;
  counties: TangoMangoCounty[];
}

interface TangoMangoCounty {
  name: string;
  areaId: string;
  mappedCity: string;  // Our city slug
  eventCount: number;
}
```

### 4.2 Playwright Session Management

```typescript
async function scrapeTangoMangoState(stateCode: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 1. Visit area selection
  await page.goto(`${BASE_URL}/choosearea.php?countryid=US&stateid=${stateCode}`);
  
  // 2. Parse available areas
  const areas = await page.$$eval('input[name="area[]"]', inputs => 
    inputs.map(i => ({ id: i.value, label: i.nextSibling?.textContent }))
  );
  
  // 3. Select all areas
  for (const area of areas) {
    await page.check(`input[value="${area.id}"]`);
  }
  
  // 4. Submit form
  await page.click('input[type="submit"]');
  await page.waitForNavigation();
  
  // 5. Extract events from calendar
  const events = await extractCalendarEvents(page);
  
  await browser.close();
  return events;
}
```

---

## 5. City Mapping

### 5.1 County to City Slug Mapping

```typescript
const COUNTY_TO_CITY: Record<string, string> = {
  // California
  "San Francisco": "san-francisco",
  "Los Angeles": "los-angeles",
  "Santa Clara": "san-jose",
  "Alameda": "oakland",
  "San Diego": "san-diego",
  
  // Florida
  "Miami-Dade": "miami",
  "Broward": "fort-lauderdale",
  "Palm Beach": "west-palm-beach",
  
  // Illinois
  "Cook": "chicago",
  
  // Massachusetts
  "Suffolk": "boston",
  
  // Pennsylvania
  "Philadelphia": "philadelphia",
  
  // Arizona
  "Maricopa": "phoenix",
  "Pima": "tucson",
  
  // Washington
  "King": "seattle",
  "Spokane": "spokane",
  
  // Nevada
  "Clark": "las-vegas",
  "Washoe": "reno",
  
  // Oregon
  "Multnomah": "portland"
};
```

### 5.2 Auto-City Creation

When a new county is found without mapping:
1. Create city with county name
2. Geocode using OpenStreetMap
3. Create city group
4. Link to state

---

## 6. Event Extraction

### 6.1 Calendar HTML Structure

```html
<div class="calendar-event">
  <span class="event-date">Dec 25</span>
  <span class="event-time">8:00 PM</span>
  <a class="event-title" href="/event.php?id=123">Milonga Name</a>
  <span class="event-venue">Venue Name</span>
  <span class="event-city">San Francisco, CA</span>
</div>
```

### 6.2 Field Mapping

| TangoMango Field | scraped_events Field |
|------------------|---------------------|
| event-title | title |
| event-date + event-time | start_date |
| event-venue | venue |
| event-city | city, country |
| Event detail page | description, source_url |

---

## 7. Scheduling

### 7.1 Run Schedule

| Priority | States | Frequency | Time (UTC) |
|----------|--------|-----------|------------|
| High | CA, FL, IL | Daily | 5:00 AM |
| Medium | MA, PA, AZ, WA, NV, OR, NC | Every 3 days | 5:30 AM |
| Low | All other states | Weekly | 6:00 AM |

### 7.2 Parallel Execution

```
┌──────────────────────────────────────────┐
│  TangoMango Parallel Scraping            │
├──────────────────────────────────────────┤
│  Thread 1: CA, FL, IL (priority)         │
│  Thread 2: MA, PA, AZ                    │
│  Thread 3: WA, NV, OR                    │
│  Thread 4: NC + remaining states         │
└──────────────────────────────────────────┘
```

---

## 8. API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/scrape/tangomango` | Start TangoMango scrape |
| POST | `/api/admin/scrape/tangomango/state/:code` | Scrape single state |
| GET | `/api/admin/scrape/tangomango/status` | Get scraper status |
| GET | `/api/admin/scrape/tangomango/states` | List configured states |
| PUT | `/api/admin/scrape/tangomango/states/:code` | Update state config |

---

## 9. Error Handling

### 9.1 Common Issues

| Issue | Detection | Resolution |
|-------|-----------|------------|
| Session expired | 403 response | Re-authenticate |
| CAPTCHA | "captcha" in HTML | Flag for manual |
| Rate limited | 429 response | Exponential backoff |
| Site down | Connection error | Retry after 1 hour |
| HTML changed | Selector fails | Alert admin |

### 9.2 Fallback Strategy

```
1. First attempt: Full Playwright scrape
2. If failed: Retry with fresh session
3. If failed: Try single county at a time
4. If failed: Mark state as blocked, alert admin
```

---

## 10. Database Integration

### 10.1 Source Registry Entry

```sql
INSERT INTO city_websites (
  city, country, url, name, scraper_type, config
) VALUES (
  'san-francisco', 'USA',
  'https://www.tangomango.org/choosearea.php?countryid=US&stateid=CA',
  'TangoMango California',
  'tangomango',
  '{"stateCode": "CA", "counties": ["San Francisco", "Alameda", "Santa Clara"]}'
);
```

### 10.2 Scraped Event Entry

```sql
INSERT INTO scraped_events (
  title, event_type, start_date, city, country,
  venue, source_url, source_name, status
) VALUES (
  'Milonga at El Rio', 'milonga',
  '2025-12-25 21:00:00', 'san-francisco', 'USA',
  'El Rio', 'https://tangomango.org/event.php?id=123',
  'TangoMango', 'pending'
);
```

---

## 11. Metrics & Monitoring

### 11.1 KPIs

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Events per scrape | >500 | <100 |
| Success rate | >95% | <80% |
| Avg scrape time | <10 min | >30 min |
| New events found | >20/day | <5/day |

### 11.2 Dashboard Widget

```
┌──────────────────────────────────────────┐
│  TangoMango Scraper Status               │
├──────────────────────────────────────────┤
│  Last Run: 2h ago                        │
│  States Scraped: 50/50 ✅                │
│  Events Found: 2,847                     │
│  New Events: 156                         │
│  Duplicates Skipped: 2,691               │
│  Errors: 0                               │
└──────────────────────────────────────────┘
```

---

## 12. Component Files

| File | Purpose |
|------|---------|
| `server/services/scrapers/TangoMangoScraper.ts` | Main scraper |
| `server/services/scrapers/tangoMangoConfig.ts` | State configuration |
| `server/routes/admin/tangomango-routes.ts` | API endpoints |
| `client/src/components/admin/TangoMangoStatus.tsx` | Dashboard widget |

---

## 13. Test Scenarios

| Scenario | Steps |
|----------|-------|
| Full scrape | Admin → Scraping → TangoMango → Run All |
| Single state | Admin → TangoMango → Select CA → Run |
| View results | Admin → Scraped Events → Filter by TangoMango |
| Monitor health | Admin → Scraping → TangoMango status card |

---

## 14. Future Enhancements

- [ ] Event detail page scraping
- [ ] Teacher/DJ extraction
- [ ] Venue geocoding
- [ ] Historical event analysis
- [ ] Weekend vs weekday patterns

---

*Covering 50 US states for complete tango event discovery.*
