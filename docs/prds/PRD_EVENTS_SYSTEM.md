# PRD: Events System

> **Version:** 1.7  
> **Created:** 2025-11-30  
> **Updated:** 2025-12-01  
> **Status:** Active  
> **Route:** `/events`, `/events/:id`, `/events/create`, `/events/calendar`  
> **PRD Method:** Pattern 39 - Reverse-Engineering Protocol  

---

## 1. Purpose

The Events system is the central hub for tango event discovery, creation, and attendance management. It provides a comprehensive platform for organizing milongas, workshops, festivals, and practicas with built-in RSVP, ticketing, check-in, and analytics capabilities.

---

## 2. Problem Solved

Before this system existed:
- Tango events were scattered across Facebook, websites, and word-of-mouth
- No unified calendar for dancers to discover events in their city or travel destinations
- No smart recommendations based on user's groups and interests
- No built-in RSVP with waitlist and capacity management
- No QR code check-in for event organizers

---

## 3. Technical Implementation

### 3.1 Core Files

| File | Purpose | Lines |
|------|---------|-------|
| `client/src/pages/EventsPage.tsx` | Main events listing with 3 views | 739 |
| `client/src/pages/EventDetailsPage.tsx` | Event details with RSVP | 633 |
| `client/src/pages/EventCreationPage.tsx` | Create new event wizard | 303 |
| `client/src/pages/EventCalendarPage.tsx` | Calendar view | ~200 |
| `client/src/pages/MyEventsPage.tsx` | User's RSVPed events | ~150 |
| `server/routes/event-routes.ts` | Events API endpoints | 1103 |
| `tests/e2e/events-page/*.spec.ts` | E2E tests (8 files) | ~400 |

### 3.2 Database Schema

#### Main Events Table (`events` - 67 columns)

```typescript
export const events = pgTable("events", {
  // Primary
  id: serial("id").primaryKey(),
  
  // Basic Information
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  
  // Event Type & Category
  eventType: varchar("event_type", { length: 50 }).notNull(), // milonga, workshop, festival, etc.
  category: varchar("category", { length: 50 }),
  
  // Date & Time
  userId: integer("user_id").references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  isRecurring: boolean("is_recurring").default(false),
  recurrenceRule: text("recurrence_rule"),
  
  // Location
  location: text("location").notNull(),
  venue: varchar("venue", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isOnline: boolean("is_online").default(false),
  onlineLink: text("online_link"),
  
  // Media
  imageUrl: text("image_url"),
  coverImage: text("cover_image"),
  mediaUrls: text("media_urls").array(),
  
  // Organizer
  organizerId: integer("organizer_id").references(() => users.id),
  coOrganizers: integer("co_organizers").array(),
  groupId: integer("group_id").references(() => groups.id),
  
  // Capacity & RSVPs
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  waitlistEnabled: boolean("waitlist_enabled").default(false),
  waitlistCount: integer("waitlist_count").default(0),
  
  // Ticketing
  isPaid: boolean("is_paid").default(false),
  isFree: boolean("is_free").default(true),
  price: text("price"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  ticketUrl: text("ticket_url"),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  
  // Visibility & Privacy
  visibility: varchar("visibility", { length: 20 }).default("public"),
  requiresApproval: boolean("requires_approval").default(false),
  
  // Features
  allowGuestPlusOne: boolean("allow_guest_plus_one").default(false),
  allowPhotos: boolean("allow_photos").default(true),
  allowComments: boolean("allow_comments").default(true),
  
  // Music & Style
  musicStyle: varchar("music_style", { length: 100 }),
  danceStyles: text("dance_styles").array(),
  djName: varchar("dj_name", { length: 255 }),
  
  // Additional Info
  tags: text("tags").array(),
  dressCode: varchar("dress_code", { length: 100 }),
  ageRestriction: varchar("age_restriction", { length: 50 }),
  wheelchairAccessible: boolean("wheelchair_accessible"),
  parkingAvailable: boolean("parking_available"),
  
  // Status
  status: varchar("status", { length: 20 }).default("published"),
  cancellationReason: text("cancellation_reason"),
  
  // Approval Workflow
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  
  // Stats
  viewCount: integer("view_count").default(0),
  shareCount: integer("share_count").default(0),
  
  // Source Tracking (scraped events)
  sourceName: varchar("source_name", { length: 255 }),
  sourceUrl: text("source_url"),
  externalSourceId: varchar("external_source_id", { length: 255 }),
  scrapedEventId: integer("scraped_event_id"),
  
  // Participant Text (for matching)
  organizerText: text("organizer_text"),
  djText: text("dj_text"),
  teacherText: text("teacher_text"),
  performerText: text("performer_text"),
  
  // Series
  seriesId: integer("series_id").references(() => eventSeries.id),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
});

// 15 indexes for performance
```

#### Event RSVPs Table (`event_rsvps` - 18 columns)

```typescript
export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  userId: integer("user_id").references(() => users.id),
  
  // Status
  status: varchar("status", { length: 20 }).default("going"), // going, maybe, interested, not_going
  
  // Guest Info
  guestCount: integer("guest_count").default(0),
  guestNames: text("guest_names").array(),
  
  // Preferences
  role: varchar("role", { length: 50 }), // leader, follower
  dietaryRestrictions: text("dietary_restrictions"),
  specialRequests: text("special_requests"),
  
  // Payment
  ticketsPurchased: integer("tickets_purchased").default(1),
  totalPaid: numeric("total_paid", { precision: 10, scale: 2 }),
  paymentStatus: varchar("payment_status", { length: 20 }),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  
  // Check-in
  checkedIn: boolean("checked_in").default(false),
  checkedInAt: timestamp("checked_in_at"),
  checkedInBy: integer("checked_in_by").references(() => users.id),
  
  // Notifications
  notificationsEnabled: boolean("notifications_enabled").default(true),
  reminderSent: boolean("reminder_sent").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  rsvpedAt: timestamp("rsvped_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### Event Photos Table (`event_photos`)

```typescript
export const eventPhotos = pgTable("event_photos", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  uploaderId: integer("uploader_id").references(() => users.id),
  photoUrl: text("photo_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  taggedUsers: integer("tagged_users").array(),
  likeCount: integer("like_count").default(0),
  visibility: varchar("visibility", { length: 20 }).default("public"),
  isApproved: boolean("is_approved").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

#### Event Comments Table (`event_comments`)

```typescript
export const eventComments = pgTable("event_comments", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  parentId: integer("parent_id"),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### Related Tables

| Table | Purpose | Key FKs |
|-------|---------|---------|
| `event_series` | Grouping recurring events | events.seriesId |
| `scraped_events` | Events from external sources | events.scrapedEventId |
| `events_profiles` | User event attendance stats | users.id |
| `facebook_events` | Imported Facebook events | events.matchedEventId |

---

## 4. API Endpoints

### 4.1 Event CRUD

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | Optional | List events with 8 filters |
| GET | `/api/events/:id` | No | Get event details |
| POST | `/api/events` | Yes (Level 3+) | Create event |
| PUT | `/api/events/:id` | Yes (owner) | Update event |
| DELETE | `/api/events/:id` | Yes (owner) | Delete event |

### 4.2 Smart/Personalized

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events/smart` | Yes | Personalized feed (user city + groups + RSVPs) |
| GET | `/api/events/search` | Optional | Advanced search with 12 filters |
| GET | `/api/events/calendar` | No | Calendar view by month/year |
| GET | `/api/events/upcoming` | No | Next 10 upcoming events |
| GET | `/api/events/my-rsvps` | Yes | User's RSVPed events |

### 4.3 Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events/analytics/popular` | No | Top events by attendance |
| GET | `/api/events/analytics/attendance` | No | Platform-wide attendance stats |

### 4.4 RSVP & Attendance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/events/:id/rsvp` | Yes | RSVP to event (going/maybe/not_going) |
| GET | `/api/events/:id/attendees` | No | List attendees |
| POST | `/api/events/:id/check-in` | Yes (organizer) | QR check-in |

### 4.5 Comments & Photos

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events/:id/comments` | No | List comments |
| POST | `/api/events/:id/comments` | Yes | Add comment |
| GET | `/api/events/:id/photos` | No | List photos |

---

## 5. Frontend Pages

### 5.1 Events Landing (`/events`)

| Element | Test ID | Description |
|---------|---------|-------------|
| Search Input | `input-search-events` | Search by title, venue, city |
| Create Button | `button-create-event` | Navigate to creation wizard |
| Filter Button | `button-open-filters` | Open advanced filters |
| List View Tab | `tab-list-view` | Card grid view |
| Calendar Tab | `tab-calendar-view` | Monthly calendar |
| Map Tab | `tab-map-view` | Leaflet map with markers |
| Event Cards | `card-event-{id}` | Individual event cards |
| Results Count | `text-results-count` | "X events found" |

**View Types:**
1. **List View** - Grid of EventCard components with image, date, venue, RSVP button
2. **Calendar View** - react-big-calendar with month/week/day toggle
3. **Map View** - Leaflet map with event markers and popups

**Categories:**
- All, Milonga, Practica, Class, Workshop, Festival, Marathon, Encuentro, Performance, Social, Online

### 5.2 Event Details (`/events/:id`)

| Element | Test ID | Description |
|---------|---------|-------------|
| Event Title | `text-event-title` | Event name |
| Event Date | `text-event-date` | Start/end datetime |
| Event Location | `text-event-location` | Venue + address |
| RSVP Button | `button-rsvp` | Mark as going/maybe |
| Cancel RSVP | `button-cancel-rsvp` | Remove RSVP |
| Attendees List | `list-attendees` | Avatar grid |
| Comments | `section-comments` | Discussion thread |
| Get Directions | `button-directions` | Google Maps link |

### 5.3 Event Creation (`/events/create`)

| Element | Test ID | Description |
|---------|---------|-------------|
| Title Input | `input-title` | Event title |
| Description | `input-description` | Rich text description |
| Event Type | `select-event-type` | Dropdown (milonga, workshop, etc.) |
| Date Picker | `input-date` | Calendar component |
| Location | Uses UnifiedLocationPicker | City/venue autocomplete |
| Price Toggle | `switch-is-paid` | Free vs paid |
| Submit | `button-submit` | Create event |

---

## 6. Advanced Search Filters

The `/api/events/search` endpoint supports 12 filters:

| Filter | Parameter | Type | Description |
|--------|-----------|------|-------------|
| Full-text | `q` | string | PostgreSQL ts_vector search |
| City | `city` | string | ILIKE city filter |
| Date From | `dateFrom` | ISO date | Start date >= |
| Date To | `dateTo` | ISO date | Start date <= |
| Event Type | `type` | string | milonga, workshop, etc. |
| Price Min | `priceMin` | number | Minimum price |
| Price Max | `priceMax` | number | Maximum price |
| Dance Style | `danceStyle` | string | Array contains |
| Skill Level | `skillLevel` | string | In tags array |
| Online Only | `online` | boolean | isOnline flag |
| Verified Organizer | `verified` | boolean | Organizer isVerified |
| Tags | `tags` | string | Comma-separated |

**Sorting:**
- `relevance` (default) - ts_rank for search queries
- `date` - Ascending by startDate
- `price` - Ascending by price

---

## 7. Smart Filtering Algorithm

The `/api/events/smart` endpoint uses intelligent filtering:

```typescript
// 1. Get user's home city
const userCity = user.city;

// 2. Get cities from groups user has joined
const groupCities = joinedGroups.map(g => g.city);

// 3. Get events user has already RSVP'd to
const rsvpEventIds = userRsvps.map(r => r.eventId);

// 4. Combine: Show events from user's city OR group cities OR already RSVP'd
WHERE events.city IN (userCity, ...groupCities) 
   OR events.id IN (...rsvpEventIds)
   AND events.startDate >= NOW()
   AND events.status = 'published'
```

---

## 8. RSVP Status Flow

```
User sees event → Clicks RSVP → Status = "going"
                             → Status = "maybe"
                             → Status = "interested"

At event → Organizer scans QR → checkedIn = true
                              → checkedInAt = timestamp
                              → checkedInBy = organizerId
```

**RSVP Statuses:**
- `going` - Confirmed attendance
- `maybe` - Tentative
- `interested` - Following (no commitment)
- `not_going` - Declined

---

## 9. Tier Enforcement

| Role Level | Can Create Events | Can Edit Any | Can Delete Any |
|------------|-------------------|--------------|----------------|
| 1-2 (Basic) | No | No | No |
| 3 (Community Leader) | Yes | Own only | Own only |
| 4+ (Admin) | Yes | Yes | Yes |

---

## 10. Cross-System Wirings

### 10.1 Groups Integration

```typescript
// Events belong to groups
events.groupId → groups.id

// Group events tab shows:
GET /api/events?groupId=${groupId}

// Group details page includes:
<GroupEventsTab groupId={group.id} />
```

### 10.2 Profile Integration

```typescript
// User's events tab shows attended/organized
GET /api/events/my-rsvps

// Profile displays:
- eventsProfiles.totalEventsAttended
- eventsProfiles.totalEventsHosted
- eventsProfiles.upcomingEvents
```

### 10.3 Notifications Integration

```typescript
// Event notifications sent:
- 24h before event (reminder)
- When someone RSVPs to your event
- When event is updated/cancelled
```

### 10.4 Marketplace Integration

```typescript
// Paid events link to Stripe
events.stripePriceId → Stripe price

// Ticket purchases tracked:
eventRsvps.stripePaymentId
eventRsvps.paymentStatus
```

### 10.5 Location Integration

```typescript
// Uses UnifiedLocationPicker
<UnifiedLocationPicker 
  value={formData.location}
  onChange={(location, coords) => {
    setFormData({ 
      ...formData, 
      location,
      city: extractCityCountry(location).city,
      country: extractCityCountry(location).country
    });
  }}
/>
```

---

## 11. E2E Test Coverage

### Test Files

| File | Tests | Coverage |
|------|-------|----------|
| `event-list.spec.ts` | 7 | Page load, search, filters, cards |
| `event-creation.spec.ts` | 3 | Form steps, submit |
| `event-calendar.spec.ts` | 3 | Calendar render, views, click |
| `events-complete.spec.ts` | 10+ | Full flow (discovery, RSVP, creation) |
| `tango/events-complete.spec.ts` | Tango-specific | Domain tests |
| `admin/events-management.spec.ts` | Admin | Management flows |
| `core-journeys/event-check-in.spec.ts` | Check-in | QR workflow |

### Key Test IDs

```typescript
// Discovery
'card-event-{id}'
'input-search-events'
'button-create-event'
'button-open-filters'
'tab-list-view'
'tab-calendar-view'
'tab-map-view'
'text-results-count'
'filter-milonga'
'filter-upcoming'

// Details
'text-event-title'
'text-event-date'
'text-event-location'
'button-rsvp'
'button-cancel-rsvp'

// Creation
'heading-create-event'
'input-title'
'input-description'
'select-event-type'
'button-submit'
```

---

## 12. Component Dependencies

```
EventsPage.tsx
├── useEvents (hooks/useEvents.ts)
├── useRSVPEvent
├── useEventAttendance
├── useEventRSVPs
├── EventFilters (components/events/EventFilters.tsx)
├── EventCard (inline)
├── react-big-calendar (Calendar view)
├── react-leaflet (Map view)
├── PageLayout
├── SelfHealingErrorBoundary
└── BannerAd

EventDetailsPage.tsx
├── useEvent
├── useRSVPEvent
├── useQuery (attendees)
├── PageLayout
├── SelfHealingErrorBoundary
└── SEO

EventCreationPage.tsx
├── useMutation
├── apiRequest
├── UnifiedLocationPicker
└── Calendar
```

---

## 13. Sample Data (Beta Fallback)

When database is empty, EventsPage returns 4 sample events:

```typescript
const sampleEvents = [
  {
    title: "Friday Night Milonga",
    city: "Buenos Aires",
    eventType: "milonga",
    // ...
  },
  {
    title: "Tango Fusion Festival 2025",
    city: "New York",
    eventType: "festival",
    // ...
  },
  // ... 2 more
];
```

---

## 14. Performance Optimizations

### Database Indexes

```sql
-- 15 indexes on events table
events_user_idx, events_start_date_idx, events_city_idx,
events_type_idx, events_status_idx, events_organizer_idx,
events_group_idx, events_slug_idx, events_city_country_idx,
events_user_start_date_idx,
-- GIN indexes for full-text search
events_title_search_idx, events_description_search_idx,
events_location_search_idx, events_search_idx
```

### Query Optimizations

- `$dynamic()` for conditional where clauses
- Subquery for attendee counts
- Pagination with limit/offset
- ts_vector for full-text search

---

## 15. Future Enhancements

- [ ] Stripe ticket purchasing integration
- [ ] QR code generation for check-in
- [ ] Recurring event series management
- [ ] Event cloning for organizers
- [ ] Integration with Google Calendar export
- [ ] Live streaming for online events

---

## 16. RSVP Cache Synchronization (Dec 01, 2025)

### Issue Fixed
RSVP status would appear stale after user RSVPs - button showed "Going" but refreshed back to "RSVP".

### Root Cause
Type mismatch in query key normalization - `eventId` was sometimes string, sometimes number:
```typescript
// Query keys didn't match due to type coercion
queryKey: ['/api/events', eventId, 'rsvp', 'me']  // string "123"
queryClient.invalidateQueries({ queryKey: ['/api/events', 123, 'rsvp'] })  // number 123
```

### Fix Applied
Type normalization in `useEvents.ts`:
```typescript
const normalizedEventId = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
queryKey: ['/api/events', normalizedEventId, 'rsvp', 'me']
```

### Validation
- RSVP updates now persist immediately across page navigations
- Cache invalidation patterns documented and tested
- E2E tests confirm 20 event cards display correctly

---

## 17. RSVP Authorization Header Fix (Dec 01, 2025)

### Issue Fixed
RSVP status and edit permissions would reset on page refresh because permission queries didn't include JWT auth.

### Root Cause
EventDetailsPage was fetching permissions without authorization headers:
```typescript
// OLD - Missing auth header
const response = await fetch(`/api/events/${eventId}/permissions/posting`);
```

### Fix Applied
Added authorization header to permission queries (lines 68-84, 379-396):
```typescript
// NEW - Includes JWT token
const response = await fetch(`/api/events/${eventId}/permissions/posting`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
```

### Files Modified
- `client/src/pages/EventDetailsPage.tsx` - Added auth headers to 2 permission fetch calls

---

## 18. React Key Prop Warning Fix (Dec 01, 2025)

### Issue Fixed
React console warning: "Each child in a list should have a unique 'key' prop".

### Root Cause
Event API returns nested structure `{event: {..., id: 123}}` but key was using `event.id` (undefined).

### Fix Applied
Extract ID from nested or flat structure with fallback:
```typescript
// List view (lines 539-544)
{events.map((event, index) => {
  const eventId = event.event?.id || event.id;
  return (
    <EventCard key={eventId || `event-${index}`} event={event} index={index} />
  );
})}

// Map view (lines 658-676)
{eventsWithCoordinates.map((event, index) => {
  const eventData = event.event || event;
  const eventId = eventData.id;
  return (
    <Marker key={eventId || `map-event-${index}`} ... />
  );
})}
```

### Files Modified
- `client/src/pages/EventsPage.tsx` - Updated list view and map view rendering

---

## 19. Event Invitations System (Dec 01, 2025)

### Feature Overview
Full invitation system allowing organizers to invite users to their events via email or user account, with tracking and response handling.

### Schema Changes (event_invitations table)
```typescript
export const eventInvitations = pgTable("event_invitations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  inviterId: integer("inviter_id").references(() => users.id),
  inviteeUserId: integer("invitee_user_id").references(() => users.id),
  invitee_email: varchar("invitee_email", { length: 255 }),
  invitee_name: varchar("invitee_name", { length: 255 }),
  status: varchar("status", { length: 20 }).default("pending"), // pending|accepted|declined|expired
  invite_code: varchar("invite_code", { length: 64 }),
  role: varchar("role", { length: 50 }), // organizer|speaker|performer|dj
  expires_at: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});
```

### API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/events/:id/invitations` | Organizer | Create invitation |
| GET | `/api/events/invitations/pending` | User | Get pending invitations |
| POST | `/api/events/invitations/:inviteId/respond` | User | Accept/decline invitation |
| GET | `/api/events/:id/invitations` | Organizer | List event invitations |

### Files Modified
- `shared/schema.ts` - Added 5 new columns to eventInvitations table
- `server/routes/event-routes.ts` - Added 4 invitation routes (lines 804-896)
- `server/services/notification-service.ts` - Added notifyEventInvitation helper

---

## 20. RSVP Capacity Enforcement (Dec 01, 2025)

### Feature Overview
RSVP system now enforces event capacity limits and returns 409 status when event is full, with waitlist availability flag.

### Implementation
```typescript
// Capacity check in RSVP route (event-routes.ts lines 1085-1118)
if (event.maxAttendees) {
  const maxCapacity = event.maxAttendees;
  const currentCount = await db.select({ count: sql`count(*)` })
    .from(eventRsvps)
    .where(and(
      eq(eventRsvps.eventId, eventId),
      eq(eventRsvps.status, "going")
    ));

  if (currentCount + totalNeeded > maxCapacity) {
    return res.status(409).json({ 
      message: "Event is at full capacity",
      capacity: maxCapacity,
      current: currentCount,
      waitlistAvailable: true
    });
  }
}
```

### API Response (409 Status)
```json
{
  "message": "Event is at full capacity",
  "capacity": 100,
  "current": 100,
  "waitlistAvailable": true
}
```

---

## 21. Event Notification Integration (Dec 01, 2025)

### Feature Overview
6 new notification helpers for event-specific notifications, integrated into event routes.

### Notification Helpers Added
```typescript
// server/services/notification-service.ts
notifyEventInvitation(userId, eventId, eventTitle, inviterName)
notifyEventRsvp(organizerId, eventId, eventTitle, rsvpUserId, status)
notifyEventUpdate(eventId, eventTitle, updateType)
notifyEventPhotoUploaded(organizerId, eventId, eventTitle, uploaderId)
notifyEventDiscussionPost(eventId, eventTitle, posterId, postContent)
notifyEventReminder(eventId, eventTitle, reminderType)
```

### Integration Points
- RSVP creation → notifies organizer
- Photo upload → notifies organizer
- Invitation sent → notifies invitee

---

## 22. PRO Tab Organizer Role Surfacing (Dec 01, 2025)

### Feature Overview
PRO tab now automatically detects and surfaces the "organizer" role based on events created by the user.

### Implementation
```typescript
// server/routes/pro.ts - Enhanced pro-stats endpoint
// Auto-detect organizer role from events table (user is event creator)
if (!roleFilter || roleFilter === 'organizer') {
  const organizedEvents = await db
    .select({ id: events.id, startDate: events.startDate })
    .from(events)
    .where(eq(events.userId, userId));

  if (organizedEvents.length > 0) {
    stats['organizer'] = {
      totalEvents: organizedEvents.length,
      upcomingEvents: organizedEvents.filter(e => new Date(e.startDate) > now).length,
      avgRating: 0,
      totalReviews: 0,
    };
  }
}
```

### API Response Example
```json
{
  "stats": {
    "organizer": {
      "totalEvents": 260,
      "upcomingEvents": 19,
      "avgRating": 0,
      "totalReviews": 0
    }
  }
}
```

### Files Modified
- `server/routes/pro.ts` - Added organizer detection in pro-stats and event-history endpoints

---

## 23. Smart Team Member Search (Dec 01, 2025)

### Feature Overview
When organizers add team members (DJs, teachers, performers, photographers) to events, the search prioritizes relevant candidates using a 4-tier ranking system based on role, collaboration history, and location.

### Search Priority Tiers
1. **Previous Collaborators** - Users who participated in the organizer's past events with matching role
2. **City Professionals** - Users in the same city with matching `tangoRoles` array
3. **Role Matches** - All users with matching `tangoRoles` anywhere
4. **General Search** - Fallback to name/username/email search

### API Endpoint

**GET** `/api/events/:id/search-team-members`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string | Yes | Participant role: `dj`, `teacher`, `performer`, `photographer`, `host`, `co_organizer` |
| `q` | string | Yes | Search query (min 2 chars) |
| `limit` | number | No | Max results (default: 15, max: 50) |

**Response:**
```json
[
  {
    "id": 42,
    "name": "Carlos DJ",
    "username": "carlos_dj",
    "profileImage": "...",
    "city": "Buenos Aires",
    "tangoRoles": ["dj", "organizer"],
    "tier": 1,
    "matchType": "previous_collaborator"
  }
]
```

### Role Mapping
Participant roles map to `tangoRoles` array values:
```typescript
const tangoRoleMapping = {
  'dj': 'dj',
  'teacher': 'teacher',
  'performer': 'performer',
  'photographer': 'photographer',
  'host': 'organizer',
  'co_organizer': 'organizer'
};
```

### Frontend Integration
```typescript
// EventParticipantManager.tsx
const { data: searchResults } = useQuery({
  queryKey: ["/api/events", eventId, "search-team-members", selectedRole, searchQuery],
  queryFn: async () => {
    const res = await fetch(
      `/api/events/${eventId}/search-team-members?role=${selectedRole}&q=${searchQuery}&limit=15`
    );
    return res.json();
  },
  enabled: searchQuery.length >= 2,
});
```

### Files Modified
- `server/routes/event-routes.ts` - Added smart search endpoint (lines 2048-2221)
- `client/src/components/events/EventParticipantManager.tsx` - Updated search query

### MB.MD Pattern Applied
**Pattern 28**: Parallel Agent Orchestration - 4 database queries execute with tiered de-duplication

---

## 24. Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-01 | 1.8 | Added Smart Team Member Search with 4-tier priority |
| 2025-12-01 | 1.7 | Added PRO tab organizer role auto-detection |
| 2025-12-01 | 1.6 | Added event notification integration (6 helpers) |
| 2025-12-01 | 1.5 | Added RSVP capacity enforcement with 409 response |
| 2025-12-01 | 1.4 | Added event invitations system (4 endpoints, schema) |
| 2025-12-01 | 1.3 | Added React key prop warning fix for nested event data |
| 2025-12-01 | 1.2 | Added RSVP authorization header fix for persistent permissions |
| 2025-12-01 | 1.1 | Added RSVP cache synchronization fix documentation |
| 2025-11-30 | 1.0 | Initial PRD created via Pattern 39 reverse-engineering |
