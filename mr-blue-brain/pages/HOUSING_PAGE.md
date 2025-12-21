# HOUSING PAGE DESIGN SPECIFICATION

**Invocation:** `use mb.md: pages:housing`
**Owner Agent:** HousingPageAgent
**Last Updated:** December 21, 2025

---

## 1. OVERVIEW

The Housing Marketplace (`/housing`) connects tango travelers with accommodation. Listings are linked to cities for integration with city pages.

**MB.MD References:**
- `use mb.md: pages:city` - City page housing tab
- `use mb.md: patterns:core` - Search patterns

---

## 2. DATA ARCHITECTURE

### Primary Table: housing_listings
| Field | Type | Purpose |
|-------|------|---------|
| id | serial | Primary key |
| title | varchar | Listing title |
| city | varchar | City name (links to city pages) |
| country | varchar | Country |
| propertyType | varchar | apartment, room, house, studio |
| pricePerNight | integer | Price in cents |
| hostId | integer | Reference to users |
| coverPhotoUrl | text | Main image |
| amenities | text[] | Array of amenity codes |
| status | varchar | active, paused, deleted |

### Data Quality Metrics (Current)
| Metric | Status |
|--------|--------|
| Total listings | Check housing_listings |
| With cover image | TBD |
| With city linked | TBD |
| Active | TBD |

---

## 3. URL ROUTING

| Route | Purpose |
|-------|---------|
| `/housing` | Browse all listings |
| `/housing/listing/:id` | Listing detail |
| `/housing/create` | Create listing wizard |
| `/housing/my` | Host's listings |
| `/cities/:slug?tab=housing` | City-filtered housing |

---

## 4. PAGE STRUCTURE

```
┌─────────────────────────────────────────────────────────────────┐
│ HERO: Find Your Perfect Tango Stay                              │
│ "Housing by dancers, for dancers"                               │
├─────────────────────────────────────────────────────────────────┤
│ SEARCH: [City Picker] [Check-in] [Check-out] [Guests] [Search] │
├─────────────────────────────────────────────────────────────────┤
│ FILTERS: Property Type | Price | Amenities | Tango-specific    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │ Listing Card     │  │ Listing Card     │  │ Listing Card   ││
│  │ [Cover Photo]    │  │ [Cover Photo]    │  │ [Cover Photo]  ││
│  │ Title            │  │ Title            │  │ Title          ││
│  │ City, Country    │  │ City, Country    │  │ City, Country  ││
│  │ $XX/night        │  │ $XX/night        │  │ $XX/night      ││
│  │ ★ 4.8 (12)       │  │ ★ 4.5 (8)        │  │ New            ││
│  │ [🎵 Dance Floor] │  │ [🔊 Sound System]│  │ [📍 Near...]   ││
│  └──────────────────┘  └──────────────────┘  └────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. TAB SPECIFICATIONS

### City Page Housing Tab
When viewing `/cities/:slug?tab=housing`:
- Filter by city automatically applied
- Show "X listings in {City}"
- Link to full housing marketplace

### Main Housing Page
- No pre-filter
- City picker prominently displayed
- "Popular cities" quick links

---

## 6. FILTERS

| Filter | Type | Options |
|--------|------|---------|
| City | Autocomplete | All cities |
| Property Type | Multi-select | apartment, room, house, studio, shared |
| Price Range | Slider | $0 - $500/night |
| Check-in/out | Date picker | Date range |
| Guests | Number | 1-10 |
| Bedrooms | Number | 1-5+ |
| Bathrooms | Number | 1-3+ |

### Tango-Specific Amenities
| Amenity | Icon | Description |
|---------|------|-------------|
| dance_floor | 💃 | Has practice space |
| sound_system | 🔊 | Quality speakers |
| near_milongas | 📍 | Walking distance to venues |
| dancer_host | 🎭 | Host is a dancer |

---

## 7. INTERACTIVE ELEMENTS

### Listing Card Actions
- Click card: Navigate to detail
- Heart icon: Save to favorites
- Share icon: Copy link

### Map View Toggle
- Grid view (default)
- Map view with markers
- Split view (list + map)

---

## 8. API ENDPOINTS

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/housing/listings` | GET | List with filters |
| `/api/housing/listings/:id` | GET | Single listing |
| `/api/housing/listings` | POST | Create listing |
| `/api/housing/listings/:id` | PATCH | Update listing |
| `/api/housing/search` | POST | Advanced search |

### Query Parameters
```
GET /api/housing/listings?city=Buenos%20Aires&propertyType=apartment&minPrice=0&maxPrice=10000
```

---

## 9. DATA SOURCES

### User-Created Listings
- Hosts create via wizard
- Photos uploaded to object storage
- Location geocoded via OpenStreetMap

### City Integration
- Listings linked to cities by `city` field
- City page Housing tab queries by city
- City stats updated on listing create/delete

---

## 10. PERMISSIONS MATRIX

| Action | Public | Logged In | Host | Admin |
|--------|--------|-----------|------|-------|
| View listings | ✅ | ✅ | ✅ | ✅ |
| View details | ✅ | ✅ | ✅ | ✅ |
| Save/favorite | ❌ | ✅ | ✅ | ✅ |
| Create listing | ❌ | ✅ | ✅ | ✅ |
| Edit listing | ❌ | ❌ | Own | ✅ |
| Delete listing | ❌ | ❌ | Own | ✅ |
| Contact host | ❌ | ✅ | ✅ | ✅ |

---

## 11. MOBILE RESPONSIVENESS

| Breakpoint | Layout |
|------------|--------|
| Mobile | Single column, bottom sheet filters |
| Tablet | 2 column grid |
| Desktop | 3 column grid + map sidebar |

---

## 12. INTERNATIONALIZATION

- Listing content: Host's language
- UI labels: 68 languages
- Prices: Multi-currency display
- Dates: Localized format

---

## 13. ANALYTICS TRACKING

| Event | Trigger |
|-------|---------|
| `housing_page_view` | Page load |
| `housing_filter_applied` | Apply filter |
| `housing_listing_click` | Click listing card |
| `housing_contact_host` | Contact action |
| `housing_listing_created` | Complete wizard |

---

## 14. RELATED PAGES

| Page | Relationship |
|------|--------------|
| City Page Housing Tab | Filtered by city |
| Listing Detail | Click listing |
| Host Profile | Click host avatar |
| Create Listing | CTA button |

---

## 15. COMPONENT FILES

| Component | Path |
|-----------|------|
| HousingMarketplacePage | `client/src/pages/HousingMarketplacePage.tsx` |
| HostHomesPage | `client/src/pages/HostHomesPage.tsx` |
| HousingSearchFilters | `client/src/components/housing/HousingSearchFilters.tsx` |
| HousingListingCard | `client/src/components/housing/HousingListingCard.tsx` |

---

## 16. TEST SCENARIOS

```markdown
1. [E2E] Housing page loads with listings
2. [E2E] Filter by city shows correct listings
3. [E2E] Price filter reduces results
4. [E2E] Click listing navigates to detail
5. [E2E] Create listing wizard completes
6. [City] Housing tab shows city-filtered listings
7. [API] GET /api/housing/listings returns paginated
8. [API] Filters correctly applied
```

---

## 17. FUTURE ENHANCEMENTS

- [ ] Booking/reservation system
- [ ] Stripe payment integration
- [ ] Reviews and ratings
- [ ] Calendar availability
- [ ] Instant booking vs. request
- [ ] Host verification badges
