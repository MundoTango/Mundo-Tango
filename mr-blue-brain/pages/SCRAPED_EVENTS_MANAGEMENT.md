# Scraped Events Management Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** AdminPageAgent | **Invocation:** `use mb.md: pages:scraped-events`

---

## 1. Overview

The Scraped Events Management page is the QA interface for reviewing, approving, and managing events collected by the scraping agents before they appear publicly on the platform.

### MB.MD References
- **Agent:** `use mb.md: agents:page` → AdminPageAgent
- **Scraping:** `use mb.md: agents:scraping` → Deduplicator, MasterOrchestrator
- **Operations:** `use mb.md: operations` → Ingestion pipeline

---

## 2. Data Architecture

### 2.1 Event Status Flow

```
Scraped → Pending → [Approved/Rejected] → [Ingested to events table]
```

### 2.2 Status Values

| Status | Description | Next Action |
|--------|-------------|-------------|
| `pending` | Awaiting review | Approve/Reject |
| `approved` | Approved for ingestion | Auto-ingest |
| `rejected` | Marked as invalid | Archive |
| `duplicate` | Duplicate detected | Auto-skip |
| `ingested` | Moved to events table | Complete |
| `error` | Processing error | Investigate |

---

## 3. URL Routing

| Pattern | Access | Purpose |
|---------|--------|---------|
| `/admin/scraping/events` | Admin | Event queue |
| `/admin/scraping/events?status=pending` | Admin | Pending only |
| `/admin/scraping/events?status=approved` | Admin | Approved only |
| `/admin/scraping/events?city=buenos-aires` | Admin | Filter by city |

---

## 4. Page Structure

### 4.1 Queue Dashboard

```
┌────────────────────────────────────────────────────────────┐
│  Scraped Events Queue                   [Bulk Actions ▼]   │
├────────────────────────────────────────────────────────────┤
│  Filters: [Status ▼] [City ▼] [Source ▼] [Date Range]     │
├────────────────────────────────────────────────────────────┤
│  ☐ │ Title          │ City   │ Date    │ Source │ Status  │
│  ──┼────────────────┼────────┼─────────┼────────┼─────────│
│  ☐ │ Milonga Sunset │ BA     │ Dec 25  │ HoyMil │ Pending │
│  ☐ │ Practica Luna  │ Berlin │ Dec 26  │ Unified│ Pending │
│  ☐ │ Workshop Tango │ Miami  │ Dec 27  │ TangoCat│ Pending │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Event Detail Panel

```
┌─────────────────────────────────────┐
│  Milonga Sunset                      │
│  📍 Buenos Aires, Argentina          │
│  📅 Dec 25, 2025 9:00 PM            │
│  🏠 Salon Canning                    │
├─────────────────────────────────────┤
│  Source: HoyMilonga                  │
│  URL: [View Original]                │
│  Scraped: 2h ago                     │
├─────────────────────────────────────┤
│  Description:                        │
│  Traditional milonga with...         │
├─────────────────────────────────────┤
│  Team:                               │
│  DJ: Maria Garcia                    │
│  Teachers: Juan & Ana               │
├─────────────────────────────────────┤
│  [Approve] [Reject] [Edit & Approve] │
└─────────────────────────────────────┘
```

---

## 5. Filters

| Filter | Type | Options |
|--------|------|---------|
| Status | Select | All, Pending, Approved, Rejected, Duplicate |
| City | Search | Autocomplete city names |
| Source | Select | HoyMilonga, TangoCat, TangoFestivals, TangoMango, Unified, etc. |
| Date Range | Date Picker | From/To |
| Event Type | Select | Milonga, Practica, Class, Workshop, etc. |
| Has Issues | Toggle | Show only events with data problems |

---

## 6. Bulk Actions

| Action | Description |
|--------|-------------|
| Bulk Approve | Approve all selected |
| Bulk Reject | Reject all selected |
| Bulk Delete | Delete all selected |
| Approve by Source | Approve all from trusted source |
| Approve by City | Approve all verified city events |

---

## 7. Deduplication

### 7.1 Detection Criteria

| Field | Weight | Match Threshold |
|-------|--------|-----------------|
| Title | 40% | 85% similarity |
| Date | 30% | Exact match |
| Venue | 20% | 80% similarity |
| City | 10% | Exact match |

### 7.2 Duplicate Resolution

```
┌─────────────────────────────────────────────┐
│  Potential Duplicate Found                   │
├─────────────────────────────────────────────┤
│  New Event         │  Existing Event         │
│  ────────────────  │  ─────────────────      │
│  Milonga Sol       │  Milonga del Sol        │
│  Dec 25, 9PM       │  Dec 25, 9PM            │
│  Salon Canning     │  Salon Canning          │
│  Source: HoyMilonga│  Source: TangoCat       │
├─────────────────────────────────────────────┤
│  [Keep New] [Keep Existing] [Merge] [Both]  │
└─────────────────────────────────────────────┘
```

---

## 8. Ingestion Pipeline

### 8.1 Process

```
1. Admin approves event
2. ScrapedEventIngestionService triggered
3. Map scraped_events fields to events table
4. Create city if not exists (auto-city creation)
5. Link to city group
6. Extract and link team members
7. Mark scraped_event as 'ingested'
8. Event appears on platform
```

### 8.2 Field Mapping

| scraped_events | events |
|----------------|--------|
| title | name |
| event_type | eventType |
| start_date | date + time |
| end_date | endDate + endTime |
| city | city |
| venue | venueName |
| address | location |
| description | description |
| source_url | sourceUrl |
| source_name | sourceName |
| image_url | imageUrl |

---

## 9. API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/scraped-events` | List with pagination |
| GET | `/api/admin/scraped-events/:id` | Get single event |
| POST | `/api/admin/scraped-events/:id/approve` | Approve event |
| POST | `/api/admin/scraped-events/:id/reject` | Reject event |
| PUT | `/api/admin/scraped-events/:id` | Edit before approve |
| DELETE | `/api/admin/scraped-events/:id` | Delete event |
| POST | `/api/admin/scraped-events/bulk-approve` | Bulk approve |
| POST | `/api/admin/scraped-events/ingest` | Trigger ingestion |

---

## 10. Permissions Matrix

| Action | Admin | Super Admin |
|--------|-------|-------------|
| View queue | ✅ | ✅ |
| Approve single | ✅ | ✅ |
| Reject single | ✅ | ✅ |
| Edit event | ✅ | ✅ |
| Bulk approve | ❌ | ✅ |
| Bulk delete | ❌ | ✅ |
| Trigger ingestion | ❌ | ✅ |

---

## 11. Quality Indicators

### 11.1 Event Health Score

| Indicator | Score | Color |
|-----------|-------|-------|
| Complete data | 100 | Green |
| Missing image | 80 | Yellow |
| Missing venue | 60 | Orange |
| Potential duplicate | 40 | Red |
| Missing date | 20 | Red |

### 11.2 Source Reliability

| Source | Trust Level | Auto-approve |
|--------|-------------|--------------|
| HoyMilonga | High | ✅ |
| TangoCat | High | ✅ |
| TangoFestivals | Medium | ❌ |
| UnifiedEventScraper | Medium | ❌ |
| Unknown | Low | ❌ |

---

## 12. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/AdminScrapedEventsPage.tsx` | Main page |
| `ScrapedEventCard` | Event preview card |
| `ScrapedEventDetail` | Full event view |
| `BulkActionsToolbar` | Bulk operations |
| `DuplicateResolver` | Duplicate handling |

---

## 13. Test Scenarios

| Scenario | Steps |
|----------|-------|
| Review pending | Login → Admin → Scraped Events → Filter pending |
| Approve event | Select event → Review details → Click Approve |
| Reject event | Select event → Click Reject → Confirm |
| Bulk approve | Select multiple → Bulk Actions → Approve All |
| Resolve duplicate | Click duplicate alert → Choose resolution |

---

## 14. Future Enhancements

- [ ] AI-assisted review suggestions
- [ ] Auto-approve rules engine
- [ ] Quality threshold auto-rejection
- [ ] Source comparison view

---

*Quality control for the global tango calendar.*
