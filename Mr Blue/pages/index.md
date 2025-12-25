# Page Design Documents

**Invocation:** `use mb.md: pages`  
**Updated:** December 21, 2025 | **Documents:** 20 Active

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

| Page | Document | Status | Agent | Invocation |
|------|----------|--------|-------|------------|
| City Page | [CITY_PAGE.md](CITY_PAGE.md) | ✅ Active | GroupsPageAgent | `use mb.md: pages:city` |
| Events Page | [EVENT_PAGE.md](EVENT_PAGE.md) | ✅ Active | EventsPageAgent | `use mb.md: pages:events` |
| Event Detail | [EVENT_DETAIL_PAGE.md](EVENT_DETAIL_PAGE.md) | ✅ Active | EventsPageAgent | `use mb.md: pages:event-detail` |
| Housing Page | [HOUSING_PAGE.md](HOUSING_PAGE.md) | ✅ Active | HousingPageAgent | `use mb.md: pages:housing` |
| Venue Page | [VENUE_PAGE.md](VENUE_PAGE.md) | ✅ Active | VenuePageAgent | `use mb.md: pages:venue` |
| Community Map | [COMMUNITY_MAP.md](COMMUNITY_MAP.md) | ✅ Active | MapPageAgent | `use mb.md: pages:map` |
| Found People | [FOUND_PEOPLE.md](FOUND_PEOPLE.md) | ✅ Active | ProfileLinkingAgent | `use mb.md: pages:found-people` |

### User Experience Pages (NEW)

| Page | Document | Status | Agent | Invocation |
|------|----------|--------|-------|------------|
| Landing Page | [LANDING_PAGE.md](LANDING_PAGE.md) | ✅ Active | LandingPageAgent | `use mb.md: pages:landing` |
| Profile Page | [PROFILE_PAGE.md](PROFILE_PAGE.md) | ✅ Active | ProfilePageAgent | `use mb.md: pages:profile` |
| Feed Page | [FEED_PAGE.md](FEED_PAGE.md) | ✅ Active | FeedPageAgent | `use mb.md: pages:feed` |
| Messages Page | [MESSAGES_PAGE.md](MESSAGES_PAGE.md) | ✅ Active | MessagesPageAgent | `use mb.md: pages:messages` |
| Groups Page | [GROUPS_PAGE.md](GROUPS_PAGE.md) | ✅ Active | GroupsPageAgent | `use mb.md: pages:groups` |
| Friends Page | [FRIENDS_PAGE.md](FRIENDS_PAGE.md) | ✅ Active | FriendsPageAgent | `use mb.md: pages:friends` |
| Search Page | [SEARCH_PAGE.md](SEARCH_PAGE.md) | ✅ Active | SearchPageAgent | `use mb.md: pages:search` |

### Authentication & Onboarding (NEW)

| Page | Document | Status | Agent | Invocation |
|------|----------|--------|-------|------------|
| Auth Pages | [AUTH_PAGES.md](AUTH_PAGES.md) | ✅ Active | AuthPageAgent | `use mb.md: pages:auth` |
| Onboarding | [ONBOARDING_PAGES.md](ONBOARDING_PAGES.md) | ✅ Active | OnboardingPageAgent | `use mb.md: pages:onboarding` |

### Admin & Scraping Pages

| Page | Document | Status | Agent | Invocation |
|------|----------|--------|-------|------------|
| Admin Dashboard | [ADMIN_DASHBOARD.md](ADMIN_DASHBOARD.md) | ✅ Active | AdminPageAgent | `use mb.md: pages:admin` |
| Scraping Control | [SCRAPING_CONTROL_CENTER.md](SCRAPING_CONTROL_CENTER.md) | ✅ Active | AdminPageAgent | `use mb.md: pages:scraping` |
| Scraped Events | [SCRAPED_EVENTS_MANAGEMENT.md](SCRAPED_EVENTS_MANAGEMENT.md) | ✅ Active | AdminPageAgent | `use mb.md: pages:scraped-events` |
| Source Registry | [SCRAPER_SOURCE_REGISTRY.md](SCRAPER_SOURCE_REGISTRY.md) | ✅ Active | AdminPageAgent | `use mb.md: pages:sources` |
| TangoMango | [TANGOMANGO_SCRAPER.md](TANGOMANGO_SCRAPER.md) | ✅ Active | MasterOrchestrator | `use mb.md: pages:tangomango` |

---

## 📊 DOCUMENTATION COVERAGE

### Completed: 20 Pages (Core Platform)

```
┌────────────────────────────────────────────────────────────┐
│ CORE PLATFORM                                    ████████ │
│ City, Events, Housing, Venue, Map, Found People  7 docs   │
├────────────────────────────────────────────────────────────┤
│ USER EXPERIENCE                                  ████████ │
│ Landing, Profile, Feed, Messages, Groups,        7 docs   │
│ Friends, Search                                            │
├────────────────────────────────────────────────────────────┤
│ AUTH & ONBOARDING                                ██████   │
│ Auth Pages, Onboarding                           2 docs   │
├────────────────────────────────────────────────────────────┤
│ ADMIN & SCRAPING                                 ████████ │
│ Admin, Scraping, Sources, TangoMango             5 docs   │
└────────────────────────────────────────────────────────────┘
```

### Planned: Priority 2-6 Pages

| Category | Estimated Docs | Status |
|----------|----------------|--------|
| Marketing Pages | 5 | ⏳ Planned |
| Settings Pages | 3 | ⏳ Planned |
| Life CEO Pages | 5 | ⏳ Planned |
| Financial Pages | 3 | ⏳ Planned |
| Marketplace Pages | 4 | ⏳ Planned |

---

## 🔀 QUICK INVOCATION SYNTAX

```markdown
# Core Pages
use mb.md: pages:city               → City page spec
use mb.md: pages:events             → Events page spec
use mb.md: pages:housing            → Housing page spec
use mb.md: pages:venue              → Venue page spec
use mb.md: pages:map                → Community map spec
use mb.md: pages:found-people       → Found people spec

# User Experience
use mb.md: pages:landing            → Landing page spec
use mb.md: pages:profile            → Profile page spec
use mb.md: pages:feed               → Feed page spec
use mb.md: pages:messages           → Messages page spec
use mb.md: pages:groups             → Groups page spec
use mb.md: pages:friends            → Friends page spec
use mb.md: pages:search             → Search page spec

# Auth & Onboarding
use mb.md: pages:auth               → Auth pages spec
use mb.md: pages:onboarding         → Onboarding spec

# Admin & Scraping
use mb.md: pages:admin              → Admin dashboard spec
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
| GroupsPageAgent | CITY_PAGE.md, GROUPS_PAGE.md |
| EventsPageAgent | EVENT_PAGE.md, EVENT_DETAIL_PAGE.md |
| HousingPageAgent | HOUSING_PAGE.md |
| VenuePageAgent | VENUE_PAGE.md |
| MapPageAgent | COMMUNITY_MAP.md |
| ProfileLinkingAgent | FOUND_PEOPLE.md |
| LandingPageAgent | LANDING_PAGE.md |
| ProfilePageAgent | PROFILE_PAGE.md |
| FeedPageAgent | FEED_PAGE.md |
| MessagesPageAgent | MESSAGES_PAGE.md |
| FriendsPageAgent | FRIENDS_PAGE.md |
| SearchPageAgent | SEARCH_PAGE.md |
| AuthPageAgent | AUTH_PAGES.md |
| OnboardingPageAgent | ONBOARDING_PAGES.md |
| AdminPageAgent | ADMIN_DASHBOARD.md, SCRAPING_*.md |
| MasterOrchestrator | TANGOMANGO_SCRAPER.md |

---

## 🔗 CROSS-REFERENCES

| Reference | Path |
|-----------|------|
| Page Agents | `mr-blue-brain/agents/page-agents/` |
| Scraping Agents | `mr-blue-brain/agents/scraping/` |
| Operations Workflow | `mr-blue-brain/operations/` |
| Patterns | `mr-blue-brain/patterns/` |
| MB.MD Core | `mb.md` |

---

## 📈 DOCUMENTATION METRICS

| Metric | Value |
|--------|-------|
| Total Documents | 20 |
| Core Platform | 7 |
| User Experience | 7 |
| Auth/Onboarding | 2 |
| Admin/Scraping | 5 |
| Avg. Sections | 17 |
| Last Updated | December 21, 2025 |

---

*Every page. Every spec. Complete documentation.*
