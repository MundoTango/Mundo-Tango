# VENUE PAGE DESIGN SPECIFICATION

**Invocation:** `use mb.md: pages:venue`
**Owner Agent:** VenuePageAgent
**Last Updated:** December 21, 2025

---

## 1. OVERVIEW

Venue pages display tango venues extracted from scraped events. Venues are normalized from the `events.venue` field and linked to show all events at each location.

**MB.MD References:**
- `use mb.md: agents:scraping` - Venue extraction
- `use mb.md: pages:events` - Event listings

---

## 2. DATA ARCHITECTURE

### Venue Data (Current: events.venue field)
| Metric | Count |
|--------|-------|
| Unique venues | 372 |
| Normalized (lowercase/trim) | 371 |
| Duplicates detected | 1 |

### Future: venues table
```sql
CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  address TEXT,
  city VARCHAR(255),
  country VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  coverImage TEXT,
  description TEXT,
  amenities TEXT[],
  capacity INTEGER,
  eventCount INTEGER DEFAULT 0,
  averageRating DECIMAL(3, 2),
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## 3. URL ROUTING

| Route | Purpose |
|-------|---------|
| `/venues` | Browse all venues |
| `/venues/:id` | Venue detail |
| `/venues/:slug` | Venue by slug |
| `/cities/:slug/venues` | City venues |

---

## 4. PAGE STRUCTURE

```
┌─────────────────────────────────────────────────────────────────┐
│ HERO: Venue cover image with name overlay                       │
│ [La Catedral] Buenos Aires, Argentina                          │
│ ★ 4.8 (156 reviews) • 372 events                               │
├─────────────────────────────────────────────────────────────────┤
│ TABS: About | Events | Photos | Reviews                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ABOUT TAB:                                                     │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 📍 Address: Sarmiento 4006, Almagro, Buenos Aires          ││
│  │ [Get Directions]                                           ││
│  │                                                            ││
│  │ 📝 Description:                                            ││
│  │ Historic tango venue in the heart of Almagro...            ││
│  │                                                            ││
│  │ 🎵 Typical Events: Milongas, Prácticas, Classes            ││
│  │ 👥 Capacity: ~200 dancers                                  ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  EVENTS TAB:                                                    │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Upcoming Events at this Venue                              ││
│  │ [Event Card 1] [Event Card 2] [Event Card 3]               ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. TAB SPECIFICATIONS

### About Tab
- Address with map
- Description (if available)
- Amenities list
- Contact information
- Organizers who use this venue

### Events Tab
- Chronological list of events at venue
- Upcoming / Past toggle
- Filter by event type

### Photos Tab
- Photos from events at this venue
- User-uploaded venue photos

### Reviews Tab
- User reviews of venue
- Rating breakdown
- Leave a review (logged-in only)

---

## 6. VENUE NORMALIZATION SERVICE

```typescript
interface VenueNormalizationService {
  // Deduplicate venues
  normalizeVenueName(raw: string): string;
  
  // Find or create venue
  findOrCreateVenue(name: string, city: string): Venue;
  
  // Merge duplicates
  mergeVenues(keepId: number, mergeId: number): void;
  
  // Geocode address
  geocodeVenue(venue: Venue): Promise<Coordinates>;
}
```

### Normalization Rules
1. Trim whitespace
2. Lowercase for comparison
3. Remove common suffixes ("- Tango", "Milonga", etc.)
4. Fuzzy match for duplicates (Levenshtein distance)

---

## 7. API ENDPOINTS

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/venues` | GET | List venues |
| `/api/venues/:id` | GET | Venue detail |
| `/api/venues/:id/events` | GET | Events at venue |
| `/api/venues/search` | GET | Search venues |

---

## 8. DATA SOURCES

### From Scraped Events
- Venue name from `events.venue`
- Address from `events.address`
- City/country from event
- Event count aggregated

### User Contributions
- Photos uploaded
- Reviews submitted
- Corrections reported

---

## 9. PERMISSIONS MATRIX

| Action | Public | Logged In | Organizer | Admin |
|--------|--------|-----------|-----------|-------|
| View venue | ✅ | ✅ | ✅ | ✅ |
| View events | ✅ | ✅ | ✅ | ✅ |
| Leave review | ❌ | ✅ | ✅ | ✅ |
| Upload photo | ❌ | ✅ | ✅ | ✅ |
| Edit venue | ❌ | ❌ | ❌ | ✅ |
| Merge venues | ❌ | ❌ | ❌ | ✅ |

---

## 10. INTEGRATION WITH EVENTS

### Event → Venue Link
```typescript
// When displaying event detail
const venueLink = venue.slug 
  ? `/venues/${venue.slug}` 
  : null;

// Render venue as clickable if link exists
{venueLink ? (
  <Link href={venueLink}>{event.venue}</Link>
) : (
  <span>{event.venue}</span>
)}
```

### Venue Page Events Query
```sql
SELECT * FROM events 
WHERE LOWER(TRIM(venue)) = LOWER(TRIM($venueName))
AND city = $city
ORDER BY start_date DESC;
```

---

## 11. TEST SCENARIOS

```markdown
1. [E2E] Venue page shows venue name and city
2. [E2E] Events tab shows events at venue
3. [E2E] Click event navigates to event detail
4. [E2E] Address has "Get Directions" link
5. [Admin] Merge duplicate venues
6. [API] /api/venues returns paginated list
7. [Normalization] "La Catedral" matches "La Catedral - Buenos Aires"
```

---

## 12. COMPONENT FILES

| Component | Path |
|-----------|------|
| VenuePage | `client/src/pages/VenuePage.tsx` (TBD) |
| VenueCard | `client/src/components/venues/VenueCard.tsx` (TBD) |
| VenueNormalizationService | `server/services/VenueNormalizationService.ts` (TBD) |

---

## 13. FUTURE ENHANCEMENTS

- [ ] Venue claiming by organizers
- [ ] Opening hours calendar
- [ ] Floor type/quality ratings
- [ ] Accessibility information
- [ ] Parking information
- [ ] Nearby transportation
