# Events API Documentation

## Overview
Complete event management system for tango events, workshops, milongas, classes, and performances. Supports event creation, discovery, RSVP tracking, and attendee management.

**Base URL:** `/api/events`

**Authentication:** Most endpoints require JWT Bearer token authentication

**Rate Limits:**
- Create Event: 10 requests/hour
- List Events: 100 requests/minute
- RSVP: 30 requests/minute
- Other: 60 requests/minute

---

## Table of Contents
1. [Event Management](#event-management)
2. [Event Discovery](#event-discovery)
3. [RSVP System](#rsvp-system)
4. [Attendee Management](#attendee-management)
5. [Event Types](#event-types)
6. [Error Codes](#error-codes)

---

## Event Management

### Create Event
```
POST /api/events
```

Create a new tango event (milonga, workshop, class, festival, performance).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Saturday Night Milonga at El Beso",
  "description": "Join us for an authentic milonga experience with live orchestra. All levels welcome!",
  "eventType": "milonga",
  "startDate": "2025-11-15T20:00:00Z",
  "endDate": "2025-11-16T01:00:00Z",
  "location": "El Beso, Riobamba 416, Buenos Aires",
  "venue": "El Beso",
  "address": "Riobamba 416",
  "city": "Buenos Aires",
  "country": "Argentina",
  "latitude": "-34.6037",
  "longitude": "-58.3816",
  "imageUrl": "https://example.com/events/milonga-beso.jpg",
  "price": "500",
  "currency": "ARS",
  "ticketUrl": "https://tickets.example.com/event/123",
  "maxAttendees": 150,
  "isPaid": true,
  "isOnline": false,
  "tags": ["milonga", "live-orchestra", "traditional"]
}
```

**Field Descriptions:**
- `title` (required): Event title (1-200 characters)
- `description` (required): Detailed event description
- `eventType` (required): Event category - see [Event Types](#event-types)
- `startDate` (required): Event start timestamp (ISO 8601)
- `endDate` (optional): Event end timestamp (ISO 8601)
- `location` (required): Human-readable location string
- `venue` (optional): Venue name
- `city` (optional): City name (used for filtering)
- `country` (optional): Country name
- `latitude/longitude` (optional): GPS coordinates for mapping
- `price` (optional): Ticket price as string
- `currency` (optional): Currency code (USD, EUR, ARS, etc.)
- `maxAttendees` (optional): Maximum capacity
- `isPaid` (optional): Whether event requires payment
- `isOnline` (optional): Virtual event flag
- `meetingUrl` (optional): Video conference URL for online events
- `tags` (optional): Array of searchable tags

**Response (201 Created):**
```json
{
  "id": 456,
  "userId": 123,
  "title": "Saturday Night Milonga at El Beso",
  "description": "Join us for an authentic milonga experience...",
  "eventType": "milonga",
  "startDate": "2025-11-15T20:00:00.000Z",
  "endDate": "2025-11-16T01:00:00.000Z",
  "location": "El Beso, Riobamba 416, Buenos Aires",
  "venue": "El Beso",
  "city": "Buenos Aires",
  "country": "Argentina",
  "imageUrl": "https://example.com/events/milonga-beso.jpg",
  "price": "500",
  "currency": "ARS",
  "maxAttendees": 150,
  "isPaid": true,
  "isOnline": false,
  "status": "published",
  "tags": ["milonga", "live-orchestra", "traditional"],
  "createdAt": "2025-11-02T10:00:00.000Z",
  "updatedAt": "2025-11-02T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error (missing required fields)
- `401 Unauthorized` - Missing/invalid authentication token
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error`

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/events \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Saturday Night Milonga at El Beso",
    "description": "Join us for an authentic milonga experience...",
    "eventType": "milonga",
    "startDate": "2025-11-15T20:00:00Z",
    "endDate": "2025-11-16T01:00:00Z",
    "location": "El Beso, Riobamba 416, Buenos Aires",
    "city": "Buenos Aires",
    "price": "500",
    "currency": "ARS"
  }'
```

**TypeScript Example:**
```typescript
import { apiRequest } from '@/lib/queryClient';

interface CreateEventData {
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  location: string;
  city?: string;
  price?: string;
  currency?: string;
  maxAttendees?: number;
}

const createEvent = async (data: CreateEventData) => {
  const response = await apiRequest('/api/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response;
};
```

---

### Update Event
```
PUT /api/events/:id
```

Update an existing event. Only the event creator can update.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Event Title",
  "description": "Updated description",
  "price": "600",
  "maxAttendees": 200
}
```

**Response (200 OK):**
```json
{
  "id": 456,
  "title": "Updated Event Title",
  "description": "Updated description",
  "price": "600",
  "maxAttendees": 200,
  "updatedAt": "2025-11-02T11:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Not the event creator
- `404 Not Found` - Event doesn't exist
- `500 Internal Server Error`

---

### Delete Event
```
DELETE /api/events/:id
```

Delete an event. Only the event creator can delete.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

**Error Responses:**
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Not the event creator
- `404 Not Found` - Event doesn't exist
- `500 Internal Server Error`

---

## Event Discovery

### List Events
```
GET /api/events
```

Search and filter events with pagination.

**Query Parameters:**
- `city` (optional): Filter by city name
- `eventType` (optional): Filter by event type
- `startDate` (optional): Filter events starting after this date (ISO 8601)
- `endDate` (optional): Filter events starting before this date (ISO 8601)
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "events": [
    {
      "id": 456,
      "userId": 123,
      "title": "Saturday Night Milonga at El Beso",
      "description": "Join us for an authentic milonga experience...",
      "eventType": "milonga",
      "startDate": "2025-11-15T20:00:00.000Z",
      "city": "Buenos Aires",
      "venue": "El Beso",
      "imageUrl": "https://example.com/events/milonga-beso.jpg",
      "price": "500",
      "currency": "ARS",
      "maxAttendees": 150,
      "rsvpCount": 87,
      "creator": {
        "id": 123,
        "name": "Maria Rodriguez",
        "username": "maria_tango",
        "profileImage": "https://..."
      }
    }
  ],
  "total": 42
}
```

**cURL Example:**
```bash
curl -X GET "https://api.mundotango.com/api/events?city=Buenos%20Aires&eventType=milonga&limit=20&offset=0"
```

**TypeScript Example:**
```typescript
import { useQuery } from '@tanstack/react-query';

interface EventFilters {
  city?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

const useEvents = (filters: EventFilters) => {
  const params = new URLSearchParams();
  if (filters.city) params.append('city', filters.city);
  if (filters.eventType) params.append('eventType', filters.eventType);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  params.append('limit', String(filters.limit || 20));
  params.append('offset', String(filters.offset || 0));

  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => fetch(`/api/events?${params.toString()}`).then(r => r.json()),
  });
};
```

---

### Get Event Details
```
GET /api/events/:id
```

Get detailed information about a specific event.

**Response (200 OK):**
```json
{
  "id": 456,
  "userId": 123,
  "title": "Saturday Night Milonga at El Beso",
  "description": "Join us for an authentic milonga experience with live orchestra...",
  "eventType": "milonga",
  "startDate": "2025-11-15T20:00:00.000Z",
  "endDate": "2025-11-16T01:00:00.000Z",
  "location": "El Beso, Riobamba 416, Buenos Aires",
  "venue": "El Beso",
  "address": "Riobamba 416",
  "city": "Buenos Aires",
  "country": "Argentina",
  "latitude": "-34.6037",
  "longitude": "-58.3816",
  "imageUrl": "https://example.com/events/milonga-beso.jpg",
  "price": "500",
  "currency": "ARS",
  "ticketUrl": "https://tickets.example.com/event/123",
  "maxAttendees": 150,
  "isPaid": true,
  "isOnline": false,
  "status": "published",
  "tags": ["milonga", "live-orchestra", "traditional"],
  "rsvpStats": {
    "going": 72,
    "interested": 15,
    "maybe": 8,
    "total": 95
  },
  "creator": {
    "id": 123,
    "name": "Maria Rodriguez",
    "username": "maria_tango",
    "profileImage": "https://...",
    "bio": "Professional tango instructor..."
  },
  "createdAt": "2025-11-02T10:00:00.000Z",
  "updatedAt": "2025-11-02T10:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` - Event doesn't exist
- `500 Internal Server Error`

---

## RSVP System

### RSVP to Event
```
POST /api/events/:id/rsvp
```

RSVP to an event or update existing RSVP status.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "going"
}
```

**RSVP Status Values:**
- `going` - Confirmed attendance
- `interested` - Interested but not confirmed
- `maybe` - Maybe attending

**Response (201 Created):**
```json
{
  "id": 789,
  "eventId": 456,
  "userId": 123,
  "status": "going",
  "createdAt": "2025-11-02T12:00:00.000Z"
}
```

**Auto-Update Behavior:**
If user already has an RSVP, it will be updated to the new status:

**Response (200 OK):**
```json
{
  "id": 789,
  "eventId": 456,
  "userId": 123,
  "status": "interested",
  "createdAt": "2025-11-02T12:00:00.000Z",
  "updatedAt": "2025-11-02T13:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid status value
- `401 Unauthorized` - Missing/invalid token
- `404 Not Found` - Event doesn't exist
- `500 Internal Server Error`

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/events/456/rsvp \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"status": "going"}'
```

---

## Attendee Management

### Get Event Attendees
```
GET /api/events/:id/attendees
```

Get list of users who have RSVP'd to the event.

**Response (200 OK):**
```json
[
  {
    "id": 789,
    "eventId": 456,
    "userId": 123,
    "status": "going",
    "user": {
      "id": 123,
      "name": "Maria Rodriguez",
      "username": "maria_tango",
      "profileImage": "https://...",
      "city": "Buenos Aires",
      "tangoRoles": ["leader", "follower"],
      "yearsOfDancing": 5
    },
    "createdAt": "2025-11-02T12:00:00.000Z"
  },
  {
    "id": 790,
    "eventId": 456,
    "userId": 124,
    "status": "interested",
    "user": {
      "id": 124,
      "name": "Carlos Martinez",
      "username": "carlos_tango",
      "profileImage": "https://...",
      "city": "Buenos Aires"
    },
    "createdAt": "2025-11-02T12:30:00.000Z"
  }
]
```

**Error Responses:**
- `404 Not Found` - Event doesn't exist
- `500 Internal Server Error`

---

## Event Types

The platform supports the following event types:

| Type | Description | Common Duration |
|------|-------------|----------------|
| `milonga` | Social dance event | 3-5 hours |
| `workshop` | Educational workshop | 2-8 hours |
| `class` | Regular class | 1-2 hours |
| `festival` | Multi-day festival | 2-7 days |
| `performance` | Stage performance | 1-3 hours |
| `practica` | Practice session | 2-3 hours |
| `encuentro` | Marathon event | 3-4 days |
| `masterclass` | Master class | 2-4 hours |

**Event Type Schema:**
```typescript
type EventType = 
  | 'milonga'
  | 'workshop'
  | 'class'
  | 'festival'
  | 'performance'
  | 'practica'
  | 'encuentro'
  | 'masterclass';
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Validation error | Invalid request data or missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have permission for this action |
| 404 | Event not found | Event with specified ID doesn't exist |
| 409 | Conflict | Duplicate RSVP or event already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal server error | Server-side error occurred |

---

## Database Schema

**Events Table:**
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  event_type VARCHAR NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location TEXT NOT NULL,
  venue VARCHAR,
  address TEXT,
  city VARCHAR,
  country VARCHAR,
  latitude TEXT,
  longitude TEXT,
  price TEXT,
  currency VARCHAR,
  ticket_url TEXT,
  max_attendees INTEGER,
  is_paid BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  meeting_url TEXT,
  status VARCHAR DEFAULT 'published',
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX events_user_idx ON events(user_id);
CREATE INDEX events_start_date_idx ON events(start_date);
CREATE INDEX events_city_idx ON events(city);
```

**Event RSVPs Table:**
```sql
CREATE TABLE event_rsvps (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,  -- 'going' | 'interested' | 'maybe'
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)
);

CREATE INDEX event_rsvps_event_idx ON event_rsvps(event_id);
CREATE INDEX event_rsvps_user_idx ON event_rsvps(user_id);
CREATE UNIQUE INDEX unique_rsvp ON event_rsvps(event_id, user_id);
```

---

## H2AC Handoff Notes

### 🔧 Manual Configuration Required
- **Google Maps API**: Required for geocoding addresses to lat/lng coordinates
- **Image Upload**: Configure S3 or Cloudinary for event image storage
- **Email Notifications**: Set up SendGrid/Mailgun for RSVP confirmations
- **Calendar Integration**: Optional iCal/Google Calendar export

### ✅ Auto-Configured Features
- Event creation and management
- RSVP tracking with status updates
- Event discovery with filtering
- Attendee list management
- Event capacity tracking

### 🧪 Testing Recommendations
1. Create events with various types (milonga, workshop, festival)
2. Test RSVP flow (create, update status, view attendees)
3. Verify event filtering by city and date range
4. Test capacity limits (maxAttendees enforcement)
5. Verify only creators can edit/delete events

### 📊 Analytics Integration
Track these key metrics:
- Events created per user
- RSVP conversion rates
- Popular event types by city
- Average attendees per event type
- Event discovery sources (search vs browse)

### 🔒 Security Notes
- Rate limits prevent spam event creation
- RSVP updates are idempotent (can retry safely)
- Event creators have exclusive edit/delete permissions
- Soft delete recommended for historical data preservation
