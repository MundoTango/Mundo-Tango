# Page Design Documents

**Invocation:** `use mb.md: pages`

---

## 📄 PAGE DESIGN DOCUMENTATION METHODOLOGY

Every visible UI page in Mundo Tango must have a comprehensive design document following the 17-section template.

---

## 🎯 17-SECTION TEMPLATE

| # | Section | Purpose |
|---|---------|---------|
| 1 | Overview | Page purpose, template reference |
| 2 | Data Architecture | Database tables, relationships |
| 3 | URL Routing | Routes, params, redirects |
| 4 | Page Structure | Header, tabs, layout |
| 5 | Tab Specifications | Each tab's detailed spec |
| 6 | Filters | All filter controls |
| 7 | Interactive Elements | Maps, modals, popovers |
| 8 | API Endpoints | All API calls |
| 9 | Data Sources | Where data comes from (scraping, API, etc.) |
| 10 | Permissions Matrix | Public/Member/Admin access |
| 11 | Mobile Responsiveness | Breakpoints, sizing |
| 12 | Internationalization | Languages, localization |
| 13 | Analytics Tracking | Events to track |
| 14 | Related Pages | Connected pages |
| 15 | Component Files | Source code locations |
| 16 | Test Scenarios | E2E test cases |
| 17 | Future Enhancements | Roadmap items |

---

## 📂 PAGE DOCUMENTS INDEX

### Core Platform Pages

| Page | Document | Status | Agent |
|------|----------|--------|-------|
| City Page | [CITY_PAGE.md](CITY_PAGE.md) | ✅ Active | GroupsPageAgent |
| Events Page | [EVENTS_PAGE.md](EVENTS_PAGE.md) | 📝 Draft | EventsPageAgent |
| Housing Page | [HOUSING_PAGE.md](HOUSING_PAGE.md) | 📝 Draft | HousingPageAgent |
| Landing Page | LANDING_PAGE.md | ⏳ Planned | LandingPageAgent |
| Feed Page | FEED_PAGE.md | ⏳ Planned | FeedPageAgent |
| Profile Page | PROFILE_PAGE.md | ⏳ Planned | ProfilePageAgent |
| Messages Page | MESSAGES_PAGE.md | ⏳ Planned | MessagesPageAgent |

### Scraping-Related Pages (Priority)

| Page | Document | Status | Agent |
|------|----------|--------|-------|
| Scraping Control Center | [SCRAPING_CONTROL_CENTER.md](SCRAPING_CONTROL_CENTER.md) | ✅ Active | AdminPageAgent |
| Scraped Events Management | [SCRAPED_EVENTS_MANAGEMENT.md](SCRAPED_EVENTS_MANAGEMENT.md) | ✅ Active | AdminPageAgent |
| Scraper Source Registry | [SCRAPER_SOURCE_REGISTRY.md](SCRAPER_SOURCE_REGISTRY.md) | ✅ Active | AdminPageAgent |
| TangoMango Integration | [TANGOMANGO_SCRAPER.md](TANGOMANGO_SCRAPER.md) | ✅ Active | MasterOrchestrator |

### Admin Pages

| Page | Document | Status | Agent |
|------|----------|--------|-------|
| Admin Dashboard | ADMIN_DASHBOARD.md | ⏳ Planned | AdminPageAgent |
| User Management | USER_MANAGEMENT.md | ⏳ Planned | AdminPageAgent |
| Financial Dashboard | FINANCIAL_DASHBOARD.md | ⏳ Planned | FinancialPageAgent |

---

## 🔀 INVOCATION SYNTAX

```markdown
use mb.md: pages                    → This index
use mb.md: pages:city               → City page spec
use mb.md: pages:events             → Events page spec
use mb.md: pages:housing            → Housing page spec
use mb.md: pages:scraping           → Scraping control center
use mb.md: pages:scraped-events     → Scraped events management
use mb.md: pages:sources            → Scraper source registry
use mb.md: pages:tangomango         → TangoMango scraper spec
```

---

## 🔧 DOCUMENT LIFECYCLE

```
1. CREATE   → New page added → Create design doc using template
2. UPDATE   → Page changed → Update doc with changes
3. REVIEW   → Monthly → Audit doc against live page
4. ARCHIVE  → Page removed → Move doc to /archived/
```

---

## 👥 AGENT RESPONSIBILITIES

| Agent | Documents Owned |
|-------|-----------------|
| GroupsPageAgent | CITY_PAGE.md |
| EventsPageAgent | EVENTS_PAGE.md |
| HousingPageAgent | HOUSING_PAGE.md |
| AdminPageAgent | SCRAPING_*.md, ADMIN_*.md |
| LandingPageAgent | LANDING_PAGE.md |
| FeedPageAgent | FEED_PAGE.md |
| ProfilePageAgent | PROFILE_PAGE.md |
| MessagesPageAgent | MESSAGES_PAGE.md |
| FinancialPageAgent | FINANCIAL_DASHBOARD.md |

---

## 🔗 CROSS-REFERENCES

| Reference | Path |
|-----------|------|
| Page Agents | `mr-blue-brain/agents/page-agents/` |
| Scraping Agents | `mr-blue-brain/agents/scraping/` |
| Operations Workflow | `mr-blue-brain/operations/` |
| Patterns | `mr-blue-brain/patterns/` |

---

*Every page. Every spec. Complete documentation.*
