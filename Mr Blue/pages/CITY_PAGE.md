# City Page Design Specification

**Version:** 3.0.0 | **Updated:** December 21, 2025 | **Status:** Official Template  
**Owner Agent:** GroupsPageAgent | **Invocation:** `use mb.md: pages:city`

---

## 1. Overview

Cities are **first-class entities** in Mundo Tango. Each city page provides comprehensive tango community tools. This document is the **authoritative specification** for all city implementations.

**Template City:** Buenos Aires (ID: 9)

### MB.MD References
- **Agent:** `use mb.md: agents:page` → GroupsPageAgent
- **Scraping:** `use mb.md: agents:scraping` → Event data collection
- **Operations:** `use mb.md: operations` → 10-step workflow

---

## 2. Data Architecture

### 2.1 Cities Table (`cities`)

```sql
cities (
  id: serial PRIMARY KEY,
  name: varchar(255) NOT NULL,
  slug: varchar(255) UNIQUE NOT NULL,
  country: varchar(255),
  countryCode: varchar(10),
  region: varchar(255),
  latitude: numeric(10,7),
  longitude: numeric(10,7),
  timezone: varchar(100),
  population: integer,
  description: text,
  imageUrl: text,
  coverImage: text,
  isActive: boolean DEFAULT true,
  isFeatured: boolean DEFAULT false,
  tangoRating: integer,
  weeklyMilongas: integer,
  weeklyPracticas: integer,
  peakSeason: varchar(100),
  currency: varchar(10),
  language: varchar(50),
  legacyGroupId: integer,
  createdAt: timestamp,
  updatedAt: timestamp
)
```

### 2.2 Groups Table (`groups`)

Cities are displayed using the groups system:

```sql
groups (
  id: serial PRIMARY KEY,
  name: varchar(255) NOT NULL,
  slug: varchar(255) UNIQUE NOT NULL,
  description: text,
  longDescription: text,
  type: varchar(50) DEFAULT 'city',
  roleType: varchar(50),
  city: varchar(255),
  country: varchar(255),
  latitude: numeric(10,7),
  longitude: numeric(10,7),
  isPrivate: boolean DEFAULT false,
  visibility: varchar(20) DEFAULT 'public',
  joinApproval: boolean DEFAULT true,
  emoji: varchar(10),
  imageUrl: text,
  coverImage: text,
  memberCount: integer DEFAULT 0,
  postCount: integer DEFAULT 0,
  eventCount: integer DEFAULT 0,
  allowEvents: boolean DEFAULT true,
  allowPosts: boolean DEFAULT true,
  verified: boolean DEFAULT false,
  createdAt: timestamp,
  updatedAt: timestamp
)
```

### 2.3 Related Tables

| Table | Relationship | Purpose |
|-------|--------------|---------|
| `events` | city field | Events in this city |
| `housing_listings` | city field | Accommodations |
| `recommendations` | city field | Local tips |
| `users` | city field | Residents |
| `group_members` | groupId | City group membership |
| `posts` | groupId | City discussions |
| `city_members` | cityId | Direct city membership |
| `city_websites` | city field | Scraping sources |
| `scraped_events` | city field | Raw scraped data |

---

## 3. URL Routing

### 3.1 Primary Route (ONLY)

| Pattern | Access | Behavior |
|---------|--------|----------|
| `/cities/:slug` | Public | Full city page |
| `/cities/:slug?tab=discussion` | Public | Discussion tab (default) |
| `/cities/:slug?tab=overview` | Public | Overview/Hub tab |
| `/cities/:slug?tab=events` | Public | Events tab |
| `/cities/:slug?tab=members` | Public | Members tab |
| `/cities/:slug?tab=housing` | Public | Housing tab |
| `/cities/:slug?tab=visitors` | Public | Visitors tab |
| `/cities/:slug?tab=tips` | Public | Tips/Recommendations tab |

**IMPORTANT:** `/groups/:id` routes are DEPRECATED. All city access via `/cities/:slug` only.

### 3.2 SEO Configuration

```typescript
<title>{cityName} Tango Community | Mundo Tango</title>
<meta name="description" content="Discover tango milongas, classes, and community in {cityName}. Find events, housing, and connect with dancers." />
<meta property="og:title" content="{cityName} Tango Community" />
<meta property="og:image" content="{coverImage}" />
```

---

## 4. Page Structure

### 4.1 Header Section

```
┌────────────────────────────────────────────────────────────┐
│  [Cover Image - Full Width]                                 │
├────────────────────────────────────────────────────────────┤
│  🏙️ Buenos Aires, Argentina                               │
│  4 followers • ✓ Verified                                  │
│                                        [Follow City]       │
├────────────────────────────────────────────────────────────┤
│  About: [Scraped from city_websites sources]               │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Tab Navigation

| # | Tab | Default | Purpose |
|---|-----|---------|---------|
| 1 | **Discussion** | ✅ Yes | Community posts and engagement |
| 2 | **Overview** | No | City Hub with map and comprehensive filters |
| 3 | **Events** | No | Data from `/events` endpoint, weekday filters |
| 4 | **Members** | No | Community member grid |
| 5 | **Housing** | No | Tango-friendly accommodations |
| 6 | **Visitors** | No | Travelers arriving in city |
| 7 | **Tips** | No | Local recommendations |

---

## 5. Data Sources

### 5.1 Scraped Content

| Data | Source | Agent |
|------|--------|-------|
| About Section | `city_websites` table, scraped descriptions | UnifiedEventScraper |
| Events | `scraped_events` → `events` table | MasterOrchestrator |
| Key People | Extracted from event team data | HoyMilongaScraper |
| Venues | Extracted from event locations | All scrapers |

### 5.2 API Endpoints

| Endpoint | Data |
|----------|------|
| `/api/events?city={slug}` | City events (scraped + manual) |
| `/api/housing/listings?city={slug}` | Housing listings |
| `/api/venues/recommendations/by-city/{slug}` | Local tips |
| `/api/users/by-role?role=&city={slug}` | Key people |

---

## 6. Follow Functionality

### 6.1 Terminology

| Old Term | New Term | Behavior |
|----------|----------|----------|
| "Join Group" | "Follow City" | Adds city to user's "My Stuff" |
| "Leave Group" | "Unfollow" | Removes city from "My Stuff" |
| "Member" | "Follower" | User following this city |

### 6.2 My Stuff Integration

When user follows a city:
1. City pin added to user's world map in "My Stuff"
2. City appears in "Cities I Follow" list
3. Events from city appear in personalized feed
4. User receives notifications for city updates

---

## 7. Overview Tab (City Hub)

### 7.1 Layer Toggle Cards

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  🌐 All  │ │ 📅Events │ │ 🏠Housing│ │  ⭐ Tips │
│   234    │ │   198    │ │    36    │ │    12    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
  Primary      Red (#FF5A5F)  Teal (#00A699) Amber (#FFB400)
```

| Layer | Color | Data Source | Icon Styling |
|-------|-------|-------------|--------------|
| All Items | Primary | events + housing + tips | Mix of types |
| Events | #FF5A5F | `/api/events?city=` | Red marker, calendar icon |
| Housing | #00A699 | `/api/cities/:id/housing` | Teal marker, house icon |
| Tips | #FFB400 | `/api/cities/:id/tips` | Amber marker, lightbulb icon |

### 7.2 Map Visualization (Premium Dark Mode)
- **Tiles:** CARTO Dark All (https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png)
- **Pins:** Custom styled white circular background with drop shadow and pointer tip.
- **Interactions:** Popup showing title, venue, and "View Details" CTA.
- **Resizing:** Auto-invalidation on tab switch to prevent gray tiles.

### 7.3 Advanced Filtering (Global Filter Bar)
- **Unified Filter Bar:** Consolidated filters (Time Range, Type, Price) in a single horizontal bar above content.
- **Time Range Filter:** 
  - Presets: All Dates, Today, This Weekend.
  - Custom: Premium Date Range Picker (Popover + Calendar).
- **Type Filters:** Milongas, Classes, Practicas.
- **Housing Integration:** `AirbnbHousingView` with external filter support and map synchronization.

### 7.4 Map Synchronization
- **Invalidation:** Auto-invalidation on tab switch to ensure correct rendering.
- **Custom Icons:** Unique high-contrast pins for events (#FF5A5F), housing (#00A699), and tips (#FFB400).
- **Z-Index:** Popovers and tooltips use high z-index (200+) to remain visible over map layers.

### 7.5 Content Hierarchy
- **Primary:** Discussion & Events (highest engagement).
- **Secondary:** Overview (Map-centric navigation).
- **Tertiary:** Members, Housing, Visitors, Tips.

---

## 8. Card Design Specifications

### 8.1 Member Cards (Community Followers)
- **Avatar:** Large (16x16) with premium gradient fallback (primary theme colors).
- **Name Display:** Robust fallback (Name → Username → email prefix).
- **Badges:** 
  - PRO Ribbon: Gold/Red gradient top-right positioning.
  - Role: Primary-themed badge for platform role (Admin, Organizer, etc.).
  - Tango Roles: Outline badges for up to 2 dance roles (Leader, Follower).
- **Context:** MapPin icon + home city display.

### 8.2 Visitor Cards (Incoming Travelers)
- **Design:** Similar to member cards but with unique traveler attributes.
- **Icon Overlay:** Sky-blue Plane icon badge on avatar corner.
- **Trip Context:** 
  - "From [City]" metadata.
  - Visit Date with sky-blue calendar icon styling.
- **CTA:** Link to public profile view.

---

## 9. Events Tab Specification

### 8.1 Data Source

Events pulled from `/api/events` endpoint (includes scraped events after ingestion).

### 8.2 Weekday Filter Tabs

```
[Sun] [Mon] [Tue] [Wed] [Thu] [Fri] [Sat] [All Days]
```

**Behavior:**
- Filters events by day of week for recurring milongas
- Shows count per day: "78 Friday events"
- When filter returns 0: "{count} {DayName} events (try 'All Days')"

### 8.3 Event Limit
- **Maximum:** 250 events per city
- **Buenos Aires:** 231 events typical

---

## 9. Discussion Tab

### 9.1 Post Creator

**Requirements:**
- Visible to all followers (not just members)
- User must be authenticated
- Group must have `allowPosts: true`

**Known Issue:** Post creator not visible for Buenos Aires members - needs investigation.

---

## 10. Permissions Matrix

| Action | Public | Follower | Admin |
|--------|--------|----------|-------|
| View city page | ✅ | ✅ | ✅ |
| View events | ✅ | ✅ | ✅ |
| View housing | ✅ | ✅ | ✅ |
| View members | ✅ | ✅ | ✅ |
| Follow city | ❌ | ✅ | ✅ |
| Create post | ❌ | ✅ | ✅ |
| RSVP to event | ❌ | ✅ | ✅ |
| Contact housing | ❌ | ✅ | ✅ |
| Edit city | ❌ | ❌ | ✅ |
| Moderate posts | ❌ | ❌ | ✅ |

---

## 11. Mobile Responsiveness

| Screen | Grid | Tab Nav |
|--------|------|---------|
| Mobile (<640px) | 1 column | Scrollable tabs |
| Tablet (640-1024px) | 2 columns | All tabs visible |
| Desktop (>1024px) | 3-4 columns | All tabs visible |

---

## 12. Internationalization (i18n)

- **Supported Languages:** 68
- **City Names:** Localized where available
- **Date Formats:** Locale-aware
- **Currency:** Region-specific display

---

## 13. Analytics Tracking

| Event | Trigger |
|-------|---------|
| `city_page_view` | Page load |
| `city_tab_change` | Tab click |
| `city_filter_apply` | Filter change |
| `city_event_click` | Event card click |
| `city_housing_click` | Housing card click |
| `city_follow` | Follow button click |
| `city_rsvp` | Event RSVP |

---

## 14. Related Pages

| Page | Connection |
|------|------------|
| Events Page | City filter dropdown |
| Housing Page | City search |
| User Profile | Home city link |
| Event Detail | City badge link |

---

## 15. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/GroupDetailsPage.tsx` | Main city page |
| `GroupHubTab` | Overview tab component |
| `GroupEventsTab` | Events tab with weekday filters |
| `GroupVisitorsTab` | Visitors tab |
| `GroupTipsTab` | Recommendations tab |

---

## 16. Test Scenarios

| Scenario | Steps |
|----------|-------|
| View city page | Navigate to /cities/buenos-aires |
| Filter by event type | Select "Milonga" from dropdown |
| Follow city | Login → Click Follow |
| RSVP to event | Login → Navigate to event → RSVP |

---

## 17. Future Enhancements

- [ ] City comparison feature
- [ ] Travel planning wizard
- [ ] Festival calendar integration
- [ ] Weather widget

---

*Official city page specification for Mundo Tango. All 22+ cities must follow this template.*

---

## 🔧 DATA RECONCILIATION & DISCREPANCIES (Latest)

### World Map Stats Issue (FIXED)
**Problem:** World map showed 585 cities, 814 events, 812 people - but database had only:
- 232 city groups
- 254 unique event cities  
- 778 total events
- 1 active user

**Root Cause:** Stats API was ADDING counts instead of DEDUPLICATING:
```typescript
// WRONG: cityGroupStats (232) + userCities (?) + locationHistory (?) + scrapedEvents (254) = 585
const totalCities = stat1 + stat2 + stat3 + stat4; 
```

**Fix Applied:** Use MAX instead of SUM for city/country totals:
```typescript
// CORRECT: Pick the highest unique count
const totalCities = Math.max(cityGroups, userCities, locationHistory, scrapedEvents);
```

### Events Distribution
**Why Some Cities Have Events, Others Don't:**
- 254 unique cities WITH event data from scrapers
- Only 232 city groups created in groups table
- 22 cities have scraped events but NO corresponding city group yet
- Buenos Aires has 88 events because:
  - HoyMilonga scraper captured 52 events
  - TangoMango, TangoCat, TangoFestivals added 36 more
  - All properly linked to city name in events table

### Why CITY_PAGE.md Format Inconsistency
- Early cities were manually created with full CITY_PAGE.md spec
- Later cities auto-created from scraped event data (minimal properties)
- Not all scraped cities get full group records - they show events via `/api/events?city=`
- Solution: Auto-migrate minor cities to full city groups on demand

---
