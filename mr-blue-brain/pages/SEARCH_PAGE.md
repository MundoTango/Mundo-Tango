# Search Page Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** SearchPageAgent | **Invocation:** `use mb.md: pages:search`

---

## 1. Overview

The Search Page provides global search functionality across all platform entities: events, users, groups, cities, housing, and content. It features real-time suggestions and faceted filtering.

**Component:** `client/src/pages/SearchPage.tsx`

### MB.MD References
- **Agent:** `use mb.md: agents:page` → SearchPageAgent
- **Operations:** `use mb.md: operations` → 10-step workflow
- **Patterns:** `use mb.md: patterns:core` → Pattern #6 (Discovery)

---

## 2. Data Architecture

### 2.1 Searchable Entities

| Entity | Table | Searchable Fields |
|--------|-------|-------------------|
| Events | `events` | title, description, city, venue |
| Users | `users` | name, username, bio, city |
| Groups | `groups` | name, description, city |
| Cities | `cities` | name, country, region |
| Housing | `housing_listings` | title, description, city |
| Posts | `posts` | content |

### 2.2 Search Index

```sql
-- Full-text search indexes
CREATE INDEX events_search_idx ON events USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX users_search_idx ON users USING GIN(to_tsvector('english', name || ' ' || COALESCE(bio, '')));
```

---

## 3. URL Routing

| Pattern | Behavior |
|---------|----------|
| `/search` | Empty search page |
| `/search?q=tango` | Search for "tango" |
| `/search?q=tango&type=events` | Events only |
| `/search?q=tango&city=Buenos+Aires` | City filter |

---

## 4. Page Structure

### 4.1 Layout Diagram

```
┌────────────────────────────────────────────────────────────┐
│  [Navbar]                                                  │
├────────────────────────────────────────────────────────────┤
│  SEARCH BAR                                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🔍 [Search for events, people, cities...______]     │ │
│  └──────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│  FILTER TABS                                               │
│  [All] [Events] [People] [Groups] [Cities] [Housing]       │
├───────────────┬────────────────────────────────────────────┤
│ FILTERS       │  RESULTS                                   │
│ ┌───────────┐ │  Showing 156 results for "milonga"         │
│ │ Category  │ │  ┌──────────────────────────────────────┐ │
│ │ ○ Events  │ │  │ EVENT RESULT                         │ │
│ │ ○ People  │ │  │ 📅 Milonga at La Catedral            │ │
│ │ ○ Groups  │ │  │ Dec 25, 2025 • Buenos Aires          │ │
│ ├───────────┤ │  └──────────────────────────────────────┘ │
│ │ Location  │ │  ┌──────────────────────────────────────┐ │
│ │ [City ▼]  │ │  │ USER RESULT                          │ │
│ ├───────────┤ │  │ 👤 Maria Gonzalez                    │ │
│ │ Date      │ │  │ Milonga organizer • Buenos Aires     │ │
│ │ [From ▼]  │ │  └──────────────────────────────────────┘ │
│ │ [To ▼]    │ │  ┌──────────────────────────────────────┐ │
│ └───────────┘ │  │ GROUP RESULT                         │ │
│               │  │ 👥 Milonga Lovers Club               │ │
│               │  │ 1.2K members • Worldwide             │ │
│               │  └──────────────────────────────────────┘ │
│               │                                            │
│               │  [Load More Results]                       │
└───────────────┴────────────────────────────────────────────┘
```

---

## 5. Search Features

### 5.1 Instant Suggestions

| Trigger | Behavior |
|---------|----------|
| 2+ characters | Show suggestions dropdown |
| Arrow keys | Navigate suggestions |
| Enter | Search or select suggestion |
| Escape | Close suggestions |

### 5.2 Suggestion Types

| Type | Icon | Format |
|------|------|--------|
| Recent | 🕐 | Previous searches |
| Popular | 🔥 | Trending searches |
| Entity | Type icon | Name + type badge |

### 5.3 Search Operators

| Operator | Example | Effect |
|----------|---------|--------|
| Quotes | "tango festival" | Exact phrase |
| OR | milonga OR practica | Either term |
| - | tango -beginner | Exclude term |
| city: | city:paris | City filter |
| type: | type:event | Type filter |

---

## 6. Result Types

### 6.1 Event Result Card

| Element | Content |
|---------|---------|
| Icon | 📅 |
| Title | Event name (highlighted) |
| Date | Event date |
| Location | City, venue |
| Type badge | Milonga/Practica/etc |

### 6.2 User Result Card

| Element | Content |
|---------|---------|
| Avatar | Profile photo |
| Name | Full name (highlighted) |
| Roles | Tango role badges |
| Location | City, country |
| Mutual | Mutual friends count |

### 6.3 Group Result Card

| Element | Content |
|---------|---------|
| Image | Group cover |
| Name | Group name (highlighted) |
| Type | City/Professional/etc |
| Members | Member count |
| Status | Joined/Follow |

### 6.4 City Result Card

| Element | Content |
|---------|---------|
| Flag | Country flag |
| Name | City name (highlighted) |
| Country | Country name |
| Stats | Events, members count |

---

## 7. Filters Sidebar

### 7.1 Filter Options

| Filter | Type | Options |
|--------|------|---------|
| Category | Radio | All, Events, People, Groups, Cities, Housing |
| Location | Select | City dropdown |
| Date Range | Date picker | From/To dates |
| Event Type | Checkbox | Milonga, Practica, Workshop, etc |
| Tango Role | Checkbox | Leader, Follower, DJ, Teacher |
| Verified | Toggle | Show verified only |

### 7.2 Active Filters

| Display | Behavior |
|---------|----------|
| Pill badges | Show active filters |
| X button | Remove single filter |
| Clear all | Reset all filters |

---

## 8. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/search` | GET | Global search |
| `/api/search/suggestions` | GET | Autocomplete |
| `/api/search/recent` | GET | Recent searches |
| `/api/search/popular` | GET | Trending searches |
| `/api/search/events` | GET | Events only |
| `/api/search/users` | GET | Users only |
| `/api/search/groups` | GET | Groups only |

### 8.1 Search Request

```typescript
GET /api/search?q=milonga&type=events&city=buenos-aires&limit=20&offset=0
```

### 8.2 Search Response

```typescript
{
  results: [
    { type: 'event', data: {...}, score: 0.95 },
    { type: 'user', data: {...}, score: 0.82 }
  ],
  total: 156,
  facets: {
    events: 89,
    users: 45,
    groups: 12,
    cities: 5,
    housing: 5
  }
}
```

---

## 9. Permissions Matrix

| Action | Visitor | Member |
|--------|---------|--------|
| Search | Yes | Yes |
| View results | Public only | All |
| Save search | No | Yes |
| View recent | No | Yes |
| Filter by role | Yes | Yes |

---

## 10. Mobile Responsiveness

| Breakpoint | Layout |
|------------|--------|
| < 640px | Full-width search, collapsible filters |
| 640-1024px | Search + filter toggle |
| > 1024px | Search + sidebar filters |

---

## 11. Internationalization

- Search placeholder translated
- Filter labels localized
- Result type names translated
- Empty state messages localized

---

## 12. Analytics Tracking

| Event | Trigger | Data |
|-------|---------|------|
| `search_query` | Search submit | query, type, filters |
| `search_result_click` | Result click | result_type, position |
| `search_filter_apply` | Filter change | filter_name, value |
| `search_suggestion_click` | Suggestion select | suggestion_type |
| `search_no_results` | Empty results | query |

---

## 13. Related Pages

| Page | Relationship |
|------|--------------|
| `/events/:id` | Event result destination |
| `/profile/:id` | User result destination |
| `/groups/:id` | Group result destination |
| `/cities/:slug` | City result destination |

---

## 14. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/SearchPage.tsx` | Main search page |
| `client/src/components/search/SearchBar.tsx` | Search input |
| `client/src/components/search/SearchSuggestions.tsx` | Autocomplete |
| `client/src/components/search/SearchFilters.tsx` | Filter sidebar |
| `client/src/components/search/ResultCard.tsx` | Result display |

---

## 15. Test Scenarios

### 15.1 E2E Tests

```
1. [New Context] Create browser context
2. [Browser] Navigate to /search
3. [Verify] Assert search bar visible
4. [Browser] Type "milonga" in search
5. [Verify] Assert suggestions appear
6. [Browser] Press Enter
7. [Verify] Assert results displayed
8. [Browser] Click "Events" filter
9. [Verify] Assert only events shown
```

---

## 16. Performance

| Metric | Target | Optimization |
|--------|--------|--------------|
| Suggestion delay | < 200ms | Debounced input |
| Search results | < 500ms | Indexed queries |
| Filter update | < 300ms | Client-side filter |

---

## 17. Future Enhancements

| Priority | Enhancement | Status |
|----------|-------------|--------|
| P1 | AI semantic search | Planned |
| P2 | Voice search | Planned |
| P2 | Saved searches | Planned |
| P3 | Search history sync | Backlog |

---

*Find anything. Find anyone. Discover tango.*
