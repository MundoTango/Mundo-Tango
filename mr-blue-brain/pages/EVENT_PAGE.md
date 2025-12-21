# EVENT PAGE DESIGN SPECIFICATION

**Invocation:** `use mb.md: pages:events`
**Owner Agent:** EventsPageAgent
**Last Updated:** December 21, 2025

---

## 1. OVERVIEW

The Events Page (`/events`) displays all tango events with search, filters, and multiple views. Data is sourced from scraping (1,005 events from 245 cities) and user-created events.

**MB.MD References:**
- `use mb.md: agents:scraping` - Event data collection
- `use mb.md: patterns:core` - Data validation patterns

---

## 2. DATA ARCHITECTURE

### Primary Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `events` | Main event storage | id, title, startDate, city, coverImage, organizerText |
| `scraped_events` | Raw scraped data | source_url, status (pending/approved/rejected) |
| `event_rsvps` | User attendance | userId, eventId, status |

### Data Quality Metrics (Current)
| Metric | Count | Percentage |
|--------|-------|------------|
| Total events | 1,005 | 100% |
| With cover image | 542 | 54% |
| With organizer text | 588 | 59% |
| With DJ info | 259 | 26% |
| With teacher info | 193 | 19% |
| With venue | 1,005 | 100% |
| From scraping | 1,005 | 100% |
| Unique cities | 245 | - |

---

## 3. URL ROUTING

| Route | Purpose | Params |
|-------|---------|--------|
| `/events` | Events list/calendar | `?city=&type=&date=` |
| `/events/search` | Search results | `?q=&filters=` |
| `/events/calendar` | Calendar view | `?month=&year=` |
| `/events/create` | Create event | - |
| `/events/my` | User's events | - |

---

## 4. PAGE STRUCTURE

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: Search bar + View toggle (list/grid/calendar)          │
├─────────────────────────────────────────────────────────────────┤
│ FILTERS: City | Type | Date | Style | Price | Tags             │
├─────────────────────────────────────────────────────────────────┤
│ SORT: Date ▼ | Relevance | Distance | Popularity              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │ Event Card       │  │ Event Card       │  │ Event Card     ││
│  │ [Cover Image]    │  │ [Cover Image]    │  │ [Cover Image]  ││
│  │ Title            │  │ Title            │  │ Title          ││
│  │ Date | City      │  │ Date | City      │  │ Date | City    ││
│  │ Organizer        │  │ Organizer        │  │ Organizer      ││
│  └──────────────────┘  └──────────────────┘  └────────────────┘│
│                                                                 │
│  [Load More / Infinite Scroll]                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. TAB SPECIFICATIONS

### List View (Default)
- Grid of event cards (3 columns desktop, 2 tablet, 1 mobile)
- Each card: cover image, title, date, city, organizer badge
- Hover: shows RSVP button, share action

### Calendar View
- Monthly calendar with event dots
- Click day: shows events for that day
- Color coding by event type (milonga, class, festival)

### Map View
- Leaflet map with event markers
- Cluster markers for dense areas
- Click marker: shows event popup

---

## 6. FILTERS

| Filter | Type | Options |
|--------|------|---------|
| City | Autocomplete | All 245 cities with events |
| Event Type | Multi-select | milonga, practica, class, festival, marathon, encuentro |
| Date Range | Date picker | From/To |
| Dance Style | Multi-select | traditional, nuevo, vals, milonga, fusion |
| Price | Toggle | Free / Paid / All |
| Tags | Multi-select | live music, potluck, BYOB, etc. |
| Online | Toggle | In-person / Online / All |

---

## 7. INTERACTIVE ELEMENTS

### Event Card Actions
- Click card: Navigate to event detail
- Heart icon: Add to favorites
- Share icon: Copy link / share modal
- RSVP button: Quick RSVP (Going/Maybe/Can't Go)

### Quick Filters
- "This Weekend" pill
- "Near Me" pill (requires location)
- "Free Events" pill

---

## 8. API ENDPOINTS

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/events` | GET | List events with filters |
| `/api/events/search` | GET | Full-text search |
| `/api/events/:id` | GET | Single event |
| `/api/events` | POST | Create event |
| `/api/events/:id/rsvp` | POST | RSVP to event |

---

## 9. DATA SOURCES

| Source | Coverage | Fields |
|--------|----------|--------|
| TangoMango | 50 US states | title, date, venue, organizer |
| HoyMilonga | 8 cities | title, date, venue, DJ, teacher |
| TangoCat | International | festivals, marathons |
| User-created | Global | All fields |

### Scraper Integration Points
1. `scraped_events` → approval → `events` table
2. Cover images extracted from source pages
3. Organizer/DJ/teacher text parsed and linked to profiles

---

## 10. PERMISSIONS MATRIX

| Action | Public | Logged In | Organizer | Admin |
|--------|--------|-----------|-----------|-------|
| View events | ✅ | ✅ | ✅ | ✅ |
| RSVP | ❌ | ✅ | ✅ | ✅ |
| Create event | ❌ | ✅ | ✅ | ✅ |
| Edit event | ❌ | ❌ | ✅ | ✅ |
| Delete event | ❌ | ❌ | ✅ | ✅ |
| Approve scraped | ❌ | ❌ | ❌ | ✅ |

---

## 11. MOBILE RESPONSIVENESS

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Single column, bottom sheet filters |
| Tablet (640-1024px) | 2 column grid, side filters |
| Desktop (>1024px) | 3 column grid, top filters |

---

## 12. INTERNATIONALIZATION

- Event titles: Original language (no translation)
- UI labels: 68 languages via i18next
- Dates: Localized format per user locale
- Currencies: Show local currency when available

---

## 13. ANALYTICS TRACKING

| Event | Trigger |
|-------|---------|
| `events_page_view` | Page load |
| `event_card_click` | Click event card |
| `event_filter_applied` | Apply any filter |
| `event_rsvp` | RSVP action |
| `event_share` | Share action |

---

## 14. RELATED PAGES

| Page | Relationship |
|------|--------------|
| Event Detail | Click event → detail |
| City Page Events Tab | Filtered by city |
| Profile Events | User's created/attending events |
| Create Event | CTA from events page |

---

## 15. COMPONENT FILES

| Component | Path |
|-----------|------|
| EventSearchPage | `client/src/pages/EventSearchPage.tsx` |
| EventsPage | `client/src/pages/EventsPage.tsx` |
| EventFiltersCompact | `client/src/components/events/EventFiltersCompact.tsx` |
| EventCard | `client/src/components/events/EventCard.tsx` |

---

## 16. TEST SCENARIOS

```markdown
1. [E2E] Events page loads with cover images visible
2. [E2E] Filter by city "Buenos Aires" shows 231 events
3. [E2E] Filter by "This Weekend" shows correct date range
4. [E2E] Click event card navigates to detail page
5. [E2E] RSVP button works for logged-in user
6. [API] GET /api/events returns paginated results
7. [API] Filters correctly reduce result count
8. [Regression] No events missing after migration
```

---

## 17. FUTURE ENHANCEMENTS

- [ ] AI-powered event recommendations
- [ ] Event series grouping (recurring events)
- [ ] Ticket integration (Eventbrite, Stripe)
- [ ] Weather forecast for outdoor events
- [ ] Transportation suggestions to venue
