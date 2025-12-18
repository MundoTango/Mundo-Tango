# PRD: RSVP Architecture & Persistence System

> **Version:** 1.0  
> **Created:** 2025-11-30  
> **Last Updated:** 2025-11-30  
> **Status:** Active  
> **Purpose:** Document unified RSVP architecture across Events, Travel, and Friends features

---

## 1. Executive Summary

This PRD documents the RSVP architecture fixes implemented on November 30, 2025, resolving a critical bug where "maybe" and "not_going" RSVPs disappeared from the UI after refresh. The fix ensures all RSVP statuses persist correctly across the platform.

---

## 2. Bug Root Cause Analysis

### 2.1 Problem Statement
Users reported that after selecting "maybe" or "not going" for an event RSVP, the selection would disappear on page refresh, showing no RSVP status.

### 2.2 Root Cause
The backend endpoint `GET /api/events/:id/attendees` was filtering responses to only return RSVPs with `status='going'`. This was an intentional filter to show "who's attending" but broke the RSVP persistence check on the frontend.

```typescript
// BEFORE (Bug): Only returned 'going' RSVPs
const attendees = await db.select().from(eventRsvps)
  .where(and(
    eq(eventRsvps.eventId, id),
    eq(eventRsvps.status, 'going')  // ❌ Filtered out 'maybe' and 'not_going'
  ));
```

### 2.3 Impact
- Users thought their RSVP wasn't saved
- Event organizers couldn't see "maybe" or "not going" responses
- Data was actually stored correctly in database but not retrieved

---

## 3. Architecture Fix

### 3.1 Backend Enhancement

**File:** `server/routes/event-routes.ts`

Added `status` query parameter with `all` option:

```typescript
// AFTER (Fixed): Supports status filtering
router.get('/events/:id/attendees', async (req, res) => {
  const { id } = req.params;
  const { status = 'all' } = req.query;  // Default to 'all'
  
  let query = db.select().from(eventRsvps)
    .where(eq(eventRsvps.eventId, Number(id)));
  
  // Only filter if specific status requested (not 'all')
  if (status && status !== 'all') {
    query = query.where(eq(eventRsvps.status, status));
  }
  
  const attendees = await query;
  return res.json(attendees);
});
```

### 3.2 Frontend Hook Enhancement

**File:** `client/src/hooks/useEvents.ts`

```typescript
// Updated useEventRSVPs to request all statuses
export function useEventRSVPs(eventId: number | undefined, options?: { statusFilter?: string }) {
  const statusFilter = options?.statusFilter || 'all';
  
  return useQuery({
    queryKey: ['/api/events', eventId, 'attendees', { status: statusFilter }],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/attendees?status=${statusFilter}`);
      if (!res.ok) throw new Error('Failed to fetch attendees');
      return res.json();
    },
    enabled: !!eventId,
  });
}
```

### 3.3 Cache Invalidation Pattern

**Critical:** Query keys must include the status filter for proper cache invalidation:

```typescript
// Consistent cache invalidation
queryClient.invalidateQueries({ 
  queryKey: ['/api/events', eventId, 'attendees']  // Invalidates all status variations
});
```

---

## 4. RSVP Status Values by Feature

### 4.1 Events RSVP
| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| `going` | CheckCircle2 | Green (`text-green-500`) | Confirmed attendance |
| `maybe` | HelpCircle | Yellow (`text-yellow-500`) | Interested but uncertain |
| `not_going` | XCircle | Red (`text-red-500`) | Declined invitation |
| `interested` | Star | Blue (`text-blue-500`) | Following event updates |
| `null` | Calendar | Muted | No RSVP yet |

### 4.2 Travel Companion Requests
| Status | Description |
|--------|-------------|
| `pending` | Request sent, awaiting response |
| `accepted` | Travel companion confirmed |
| `rejected` | Request declined |

### 4.3 Friend Requests
| Status | Description |
|--------|-------------|
| `pending` | Request sent |
| `accepted` | Friends connected |
| `declined` | Request rejected |
| `cancelled` | Request withdrawn by sender |
| `snoozed` | Temporarily hidden |

---

## 5. API Endpoints

### 5.1 Events RSVP
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/events/:id/attendees?status=all` | Fetch all RSVPs (default) |
| `GET` | `/api/events/:id/attendees?status=going` | Fetch only confirmed attendees |
| `POST` | `/api/events/:id/rsvp` | Create/update RSVP |

**Request Body (POST):**
```json
{
  "status": "going" | "maybe" | "not_going" | "interested"
}
```

**Response (GET):**
```json
[
  {
    "rsvp": {
      "id": 123,
      "eventId": 456,
      "userId": 789,
      "status": "maybe",
      "createdAt": "2025-11-30T10:00:00Z",
      "updatedAt": "2025-11-30T10:00:00Z"
    },
    "user": {
      "id": 789,
      "name": "Jane Doe",
      "profileImage": "https://..."
    }
  }
]
```

### 5.2 Travel Companions
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/travel/:tripId/companions` | Fetch trip companions |
| `POST` | `/api/travel/:tripId/companions` | Send companion request |
| `PATCH` | `/api/travel/:tripId/companions/:id` | Update request status |

### 5.3 Friend Requests
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/friends/requests` | Fetch friend requests |
| `POST` | `/api/friends/request` | Send friend request |
| `PATCH` | `/api/friends/request/:id` | Accept/decline request |

---

## 6. Frontend Components

### 6.1 UnifiedRSVPButton

**File:** `client/src/components/unified/UnifiedRSVPButton.tsx`

Universal RSVP component supporting all feature types:

```typescript
interface UnifiedRSVPButtonProps {
  featureType: 'event' | 'travel' | 'friend' | 'class';
  entityId: number;
  currentStatus?: string;
  onStatusChange?: (newStatus: string) => void;
  variant?: 'dropdown' | 'buttons' | 'compact';
}
```

**Usage:**
```tsx
<UnifiedRSVPButton
  featureType="event"
  entityId={event.id}
  currentStatus={userRsvpStatus}
  variant="dropdown"
/>
```

### 6.2 Query Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useEventRSVPs` | `useEvents.ts` | Fetch event RSVPs with status filter |
| `useRSVPEvent` | `useEvents.ts` | Mutation for RSVP create/update |
| `useTravelCompanions` | `useTravel.ts` | Fetch/manage travel companions |
| `useFriendRequests` | `useFriends.ts` | Fetch/manage friend requests |

---

## 7. Database Schema

### 7.1 Event RSVPs
```sql
CREATE TABLE event_rsvps (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('going', 'maybe', 'not_going', 'interested')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

### 7.2 Indexes
```sql
CREATE INDEX idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user_id ON event_rsvps(user_id);
CREATE INDEX idx_event_rsvps_status ON event_rsvps(status);
```

---

## 8. Testing Requirements

### 8.1 Unit Tests
- [ ] Backend: `/api/events/:id/attendees?status=all` returns all statuses
- [ ] Backend: `/api/events/:id/attendees?status=going` filters correctly
- [ ] Frontend: RSVP status persists after page refresh
- [ ] Frontend: Cache invalidation works on status change

### 8.2 E2E Tests
- [ ] User can set RSVP to "going" and see it after refresh
- [ ] User can set RSVP to "maybe" and see it after refresh
- [ ] User can set RSVP to "not_going" and see it after refresh
- [ ] User can change RSVP status and see update immediately

---

## 9. Cross-References

| Related PRD | Relationship |
|-------------|--------------|
| [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) | ProfileTabEvents RSVP display |
| [PRD_PROFILE_PAGE_INDEX.md](./PRD_PROFILE_PAGE_INDEX.md) | Component index |
| [PRD_TRAVEL_PLANNING_SYSTEM.md](./PRD_TRAVEL_PLANNING_SYSTEM.md) | Travel companion requests |
| [PRD_NOTIFICATIONS_SETTINGS_TAB.md](./PRD_NOTIFICATIONS_SETTINGS_TAB.md) | RSVP notifications |

---

## 10. User Events Endpoint

### 10.1 Endpoint: `/api/users/:userId/events`

Fetches events a user has RSVP'd to, with optional status filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | `going` | Comma-separated list: `going,maybe,interested` |
| `past` | boolean | `false` | Include past events if `true` |

**Response Structure:**
```json
[
  {
    "event": {
      "id": 123,
      "title": "Milonga Night",
      "description": "Weekly milonga...",
      "startDate": "2025-12-01T19:00:00Z",
      "endDate": "2025-12-01T23:00:00Z",
      "location": "Dance Studio",
      "city": "Buenos Aires",
      "venue": "Salon Canning",
      "eventType": "milonga",
      "imageUrl": "https://...",
      "maxAttendees": 100
    },
    "rsvpStatus": "going",
    "_count": 0
  }
]
```

### 10.2 Bug Fix: Non-Existent Column Reference (Nov 30, 2025)

**Problem:** Endpoint returned 500 error due to selecting non-existent `hostLanguages` column from events table.

**Error Trace:**
```
TypeError: Cannot convert undefined or null to object
    at orderSelectedFields (drizzle-orm/utils.ts)
```

**Root Cause:** The Drizzle ORM query attempted to select `events.hostLanguages` which doesn't exist in the schema.

**Fix Applied:**
```typescript
// BEFORE (Bug): Selected non-existent column
const userEvents = await db.select({
  // ... other fields
  hostLanguages: events.hostLanguages,  // ❌ Column doesn't exist
}).from(events).innerJoin(eventRsvps, eq(events.id, eventRsvps.eventId));

// AFTER (Fixed): Removed non-existent column
const userEvents = await db.select({
  // ... other fields
  // hostLanguages removed - column doesn't exist in schema
}).from(events).innerJoin(eventRsvps, eq(events.id, eventRsvps.eventId));
```

**Lesson Learned:** Always verify schema columns exist before referencing in Drizzle ORM queries.

---

## 11. Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-11-30 | 1.1 | Fixed `/api/users/:userId/events` non-existent column bug | Replit AI |
| 2025-11-30 | 1.0 | Initial creation documenting RSVP persistence fix | Replit AI |
