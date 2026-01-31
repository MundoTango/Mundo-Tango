# MB.MD RESEARCH PLAN - Comprehensive Data Quality Analysis
**Date**: November 25, 2025  
**Mode**: RESEARCH ONLY - No Building Until Approved  
**Protocol**: Replit AI → Mr. Blue → 1,218 Agents

---

## EXECUTIVE SUMMARY

### Critical Issues Identified

| Issue | Severity | Root Cause | PRD Violation |
|-------|----------|------------|---------------|
| All events labeled "milonga" | 🔴 CRITICAL | Hard-coded in autoApproveScrapedEvents.ts:142 | Yes - EVENT_TABLES.md specifies 6 types |
| Group About sections empty | 🔴 CRITICAL | `scraped_community_data` table doesn't exist | Yes - city-group-data-ingestion.ts requires it |
| Events showing October dates | 🟡 HIGH | Frontend date filtering/sorting broken | Yes - should show upcoming events |
| Event details missing scraped data | 🔴 CRITICAL | Only 5 of 18 scraped fields transferred | Yes - EVENTS_SYSTEM.md comprehensive spec |
| RSVP not unified | 🟡 HIGH | No cross-instance sync logic exists | Yes - unified RSVP requirement |

---

## 1. EVENT TYPE DETECTION ANALYSIS

### Current State (BROKEN)
```typescript
// server/scripts/autoApproveScrapedEvents.ts - Line 142
eventType: 'milonga',  // HARD-CODED! No intelligence
```

### Database Evidence
```sql
SELECT DISTINCT event_type, COUNT(*) FROM events GROUP BY event_type;
-- Result: milonga: 268, festival: 2, competition: 1, practica: 1, workshop: 1
```

### Events WRONGLY Classified as "milonga"
| Event Title | Should Be |
|-------------|-----------|
| "Robles Intermediate/Advanced Class" | workshop |
| "Tango Rebels Saturday Practica" | practica |
| "TangoMelbourne Classes – 1, 1.5 & 2" | workshop |
| "La Practica" | practica |
| "MST Practica @ Mark St" | practica |
| "Robles Stage Choreography Class" | workshop |
| "Argentine Tango Classes with Jarny" | workshop |

### PRD Specification (docs/features/EVENTS_SYSTEM.md)
```typescript
enum EventType {
  MILONGA = 'milonga',       // Social dance event
  WORKSHOP = 'workshop',     // Teaching session
  FESTIVAL = 'festival',     // Multi-day event
  ONLINE = 'online',         // Virtual event
  SOCIAL = 'social',         // Other social gatherings
  PRACTICE = 'practica'      // Practice sessions (should be 'practica' not 'practice')
}
```

### Required Intelligence: Title-Based Detection
```typescript
function detectEventType(title: string, description: string): string {
  const titleLower = title.toLowerCase();
  const descLower = (description || '').toLowerCase();
  
  // Priority order for detection
  if (/festival|circuit|marathon|encuentro/i.test(titleLower)) return 'festival';
  if (/class|lesson|level\s*\d|beginner|intermediate|advanced/i.test(titleLower)) return 'workshop';
  if (/practica|practice session/i.test(titleLower)) return 'practica';
  if (/workshop|masterclass|intensive/i.test(titleLower)) return 'workshop';
  if (/online|virtual|zoom|webinar/i.test(titleLower)) return 'online';
  
  // Default to milonga for actual social dance events
  return 'milonga';
}
```

---

## 2. GROUP ABOUT SECTION ANALYSIS

### Current State (BROKEN)
```sql
SELECT long_description FROM groups WHERE city = 'Melbourne';
-- Result: NULL
```

### Root Cause
```sql
SELECT * FROM scraped_community_data WHERE city_group_id = 21;
-- ERROR: relation "scraped_community_data" does not exist
```

The `CityGroupDataIngestionService` (server/services/city-group-data-ingestion.ts) depends on `scraped_community_data` table which DOESN'T EXIST.

### What Should Exist (Per city-group-data-ingestion.ts)
```typescript
interface ScrapedCommunityData {
  id: number;
  cityGroupId: number;
  communityName: string;
  description: string;
  history: string;
  culture: string;
  dressCode: string;
  approved: boolean;
}
```

### GroupDetailsPage About Section (Currently Empty)
Location: `client/src/pages/GroupDetailsPage.tsx:374`
```tsx
<CardTitle className="text-2xl font-serif">About This Group</CardTitle>
// Shows only: group.description (basic)
// Missing: group.longDescription (rich content)
```

### Required Data for Rich About Section
1. **City Description** - Scraped from local tango websites
2. **History** - When tango started in this city
3. **Culture/Etiquette** - Local tango customs
4. **Dress Code** - What to wear
5. **Venues List** - Popular milonga locations
6. **Community Stats** - Active members, events per month
7. **Rules** - Community guidelines

---

## 3. EVENTS DATE/ORDERING ANALYSIS

### Database State (CORRECT)
```sql
SELECT MIN(start_date), MAX(start_date), COUNT(*) FROM events WHERE status = 'published';
-- earliest: 2025-10-27, latest: 2025-12-02, total: 260
```

### Frontend Issue
Events showing October dates when we're in November. The `/api/events` endpoint is NOT filtering by `startDate >= NOW()` for the default view.

### GET /api/events Route Analysis
Location: `server/routes/event-routes.ts` and `server/storage.ts:2912`
```typescript
async getEvents(params) {
  // NO DEFAULT date filter - returns ALL events including past
  // Frontend may be sorting incorrectly
}
```

### Required Fix
1. Add `status = 'published'` filter (already done)
2. Add `startDate >= NOW()` for default "upcoming" view
3. Sort by `startDate ASC` to show nearest events first

---

## 4. EVENT DETAILS PAGE ANALYSIS

### Current Fields Displayed
| Field | Shown | Source |
|-------|-------|--------|
| title | ✅ | events.title |
| date/time | ✅ | events.startDate |
| location | ✅ | events.location |
| description | ✅ | events.description |
| price | ✅ | events.price (but as "Free") |
| attendees | ✅ | Count from event_rsvps |

### Missing Fields (From scraped_events)
| Field | Available | Status |
|-------|-----------|--------|
| source_url | ✅ scraped_events | NOT TRANSFERRED |
| source_name | ✅ scraped_events | NOT TRANSFERRED |
| organizer | ✅ scraped_events | NOT TRANSFERRED |
| venue_name | ✅ events.venue_name | NOT DISPLAYED |
| address | ✅ events.address | NOT DISPLAYED |
| ticket_url | ✅ events.ticket_url | NOT DISPLAYED |
| website_url | ✅ events.website_url | NOT DISPLAYED |
| tags | ✅ events.tags | NOT DISPLAYED |
| music_style | ✅ events.music_style | NOT DISPLAYED |
| level | ✅ events.level | NOT DISPLAYED |
| dress_code | ✅ events.dress_code | NOT DISPLAYED |
| dj_name | ✅ events.dj_name | NOT DISPLAYED |

### EventDetailsPage.tsx Current Structure
```tsx
// Line 168-300: Only shows basic Event Details card
// Missing comprehensive sections for:
// - Full venue info with map
// - Original source link
// - Organizer contact
// - Ticket purchase
// - What to expect (dress code, level, music)
// - Tags
```

---

## 5. RSVP UNIFICATION ANALYSIS

### Current RSVP System
```typescript
// event_rsvps table: eventId + userId = unique
// Each RSVP is per-event, no cross-linking
```

### User Requirement
> "If I click going for Melbourne Tango Circuit 2025 that updates the event and all other locations that the rsvp is connected to"

### Conceptual Model Needed
```
Event Series: "Melbourne Tango Circuit 2025"
├── Instance 1: Main page (/events/1270)
├── Instance 2: City group card (/groups/21)
├── Instance 3: Events listing page (/events)
└── Instance 4: Calendar view

RSVP on ANY instance → updates ALL instances
```

### Current Implementation Gap
1. No "event series" concept
2. No RSVP broadcast/sync mechanism
3. UI components don't share RSVP state

### Solution Architecture
```typescript
// Option A: Single source of truth with cache invalidation
// When RSVP changes:
1. Update event_rsvps table (already happens)
2. Invalidate all queryKeys containing this eventId
3. All UI components refetch automatically

// Current: queryKey: ["/api/events", eventId]
// All event displays should use same queryKey pattern
```

---

## 6. DATA FLOW AUDIT

### Scraping → Database Flow
```
1. Scraper collects events from 200+ sources
   ↓
2. Stored in scraped_events table (18 fields)
   ↓
3. autoApproveScrapedEvents.ts processes
   ↓
4. Creates events with ONLY 8 fields (loses 10 fields!)
   ↓
5. Frontend displays 5 of those 8 fields
```

### Fields Lost in Transfer
| scraped_events | events table | Transferred? |
|----------------|--------------|--------------|
| source_url | (not exists) | ❌ |
| source_name | (not exists) | ❌ |
| organizer | (not exists) | ❌ |
| external_id | (not exists) | ❌ |
| description | description | ✅ |
| start_date | start_date | ✅ |
| end_date | end_date | ✅ |
| location | location | ✅ |
| address | address | ✅ |
| price | price | ✅ |
| image_url | image_url | ✅ |
| title | title | ✅ |

### Missing in events Table
The events table HAS these columns but they're NOT being populated:
- venue_name, venue
- website_url, facebook_url, instagram_url
- tags
- music_style, level, dress_code
- dj_name
- ticket_url, ticket_link

---

## 7. AGENT ASSIGNMENT MATRIX

### Phase 1: Data Quality Fix (Mr. Blue → Agents)
| Agent ID | Task | Files |
|----------|------|-------|
| AGENT_DATA_1 | Implement intelligent event type detection | autoApproveScrapedEvents.ts |
| AGENT_DATA_2 | Create scraped_community_data table migration | shared/schema.ts |
| AGENT_DATA_3 | Transfer ALL scraped_events fields to events | autoApproveScrapedEvents.ts |
| AGENT_DATA_4 | Fix events API date filtering | event-routes.ts |

### Phase 2: Frontend Display (Mr. Blue → Agents)
| Agent ID | Task | Files |
|----------|------|-------|
| AGENT_UI_1 | Enhance EventDetailsPage with all fields | EventDetailsPage.tsx |
| AGENT_UI_2 | Enhance GroupDetailsPage About section | GroupDetailsPage.tsx |
| AGENT_UI_3 | Fix EventsPage date sorting | EventsPage.tsx |
| AGENT_UI_4 | Unify RSVP across all event displays | useEvents.ts |

### Phase 3: RSVP Unification (Mr. Blue → Agents)
| Agent ID | Task | Files |
|----------|------|-------|
| AGENT_RSVP_1 | Standardize RSVP queryKey patterns | queryClient.ts |
| AGENT_RSVP_2 | Add RSVP cache invalidation broadcast | useEvents.ts |
| AGENT_RSVP_3 | Update all event card components | EventCard.tsx |

---

## 8. RECOMMENDED EXECUTION ORDER

### Priority 1: Critical Data Fixes
1. **Event Type Detection** - Fix autoApproveScrapedEvents.ts to detect types from titles
2. **Field Transfer** - Transfer all 18 scraped_events fields to events table
3. **Re-run Scraper** - Update all 260 existing events with correct types

### Priority 2: UI Fixes  
4. **EventDetailsPage** - Display all available fields
5. **GroupDetailsPage** - Show rich About section (even with fallback data)
6. **EventsPage** - Fix date filtering to show upcoming first

### Priority 3: System Integration
7. **RSVP Unification** - Single cache key pattern
8. **scraped_community_data** - Create table and ingestion
9. **City Group Enrichment** - Run enrichment for all cities

---

## 9. VALIDATION CHECKLIST

### Before Building, Verify:
- [ ] Event type detection logic approved
- [ ] All scraped fields mapping approved
- [ ] RSVP unification pattern approved
- [ ] About section content structure approved
- [ ] Date filtering logic approved

### After Building, Test:
- [ ] Events show correct types (class, practica, festival, etc.)
- [ ] Event details page shows source URL, organizer, venue
- [ ] Group About section shows rich content
- [ ] Events listing shows November/December first
- [ ] RSVP on any card updates all instances

---

## 10. QUESTIONS FOR USER

1. **Event Type Detection**: Should we run a one-time update to fix the 268 incorrectly labeled "milonga" events?

2. **About Section Content**: Until we have scraped community data, should we generate city-specific content using AI based on known tango facts?

3. **RSVP Scope**: When you say "all other locations that the rsvp is connected to" - do you mean:
   - A) All displays of the SAME event (just UI sync)?
   - B) All events in a SERIES (like multi-day festival)?
   - C) Something else?

4. **Source URL Display**: How prominently should we show "View Original Event Source" - small link or major button?

---

*This research plan was generated following the MB.MD Protocol.*
*Awaiting user approval before any building commences.*
