# COMMUNITY MAP DESIGN SPECIFICATION

**Invocation:** `use mb.md: pages:map`
**Owner Agent:** MapPageAgent
**Last Updated:** December 21, 2025

---

## 1. OVERVIEW

The Community Map (`/map` or `/community`) displays all tango cities worldwide with interactive exploration. Cities are sourced from the `groups` table (city type) and events data.

**MB.MD References:**
- `use mb.md: pages:city` - City page navigation
- `use mb.md: agents:scraping` - City discovery

---

## 2. DATA ARCHITECTURE

### City Sources
| Source | Count | Notes |
|--------|-------|-------|
| City groups | 24 | Manually created |
| Unique event cities | 245 | From scraped events |
| Gap | 221 | Cities with events but no group |

### Map Data Structure
```typescript
interface MapCity {
  id: number;
  name: string;
  slug: string;
  country: string;
  latitude: number;
  longitude: number;
  eventCount: number;
  memberCount: number;
  coverImage?: string;
}
```

---

## 3. URL ROUTING

| Route | Purpose |
|-------|---------|
| `/map` | World map view |
| `/community` | Alias for map |
| `/map?city=buenos-aires` | Zoom to city |
| `/map?country=argentina` | Zoom to country |

---

## 4. PAGE STRUCTURE

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: Explore the Global Tango Community                      │
│ [Search City] [Filter: Has Events / Has Members / All]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │                    WORLD MAP                               │ │
│  │                                                            │ │
│  │       [●] Buenos Aires (231)                               │ │
│  │                                    [●] Berlin (34)         │ │
│  │    [●] San Francisco (94)                                  │ │
│  │                              [●] Athens (37)               │ │
│  │                                                            │ │
│  │  Click city for popup:                                     │ │
│  │  ┌──────────────────────┐                                  │ │
│  │  │ Buenos Aires 🇦🇷      │                                  │ │
│  │  │ 231 events           │                                  │ │
│  │  │ 156 members          │                                  │ │
│  │  │ [View City →]        │                                  │ │
│  │  └──────────────────────┘                                  │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ BOTTOM: Top Cities Carousel                                     │
│ [Buenos Aires] [SF] [Berlin] [Athens] [Istanbul] [→]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. MAP FEATURES

### Markers
| Type | Size | Color |
|------|------|-------|
| Small city (<10 events) | 12px | Blue |
| Medium city (10-50 events) | 18px | Purple |
| Large city (50+ events) | 24px | Gold |

### Clustering
- Cluster when zoomed out
- Show count in cluster
- Click cluster to zoom in

### City Popup
- City name with country flag
- Event count
- Member count
- "View City" button → `/cities/:slug`

---

## 6. FILTERS

| Filter | Type | Options |
|--------|------|---------|
| Search | Text | City name search |
| Has Events | Toggle | Show only cities with events |
| Has Members | Toggle | Show only cities with members |
| Region | Multi-select | Americas, Europe, Asia, etc. |

---

## 7. API ENDPOINTS

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/cities/map` | GET | All cities with coordinates |
| `/api/cities/search` | GET | Search cities |
| `/api/cities/:slug` | GET | City detail |
| `/api/events/by-city` | GET | Events grouped by city |

### Map Data Response
```json
{
  "cities": [
    {
      "id": 9,
      "name": "Buenos Aires",
      "slug": "buenos-aires",
      "country": "Argentina",
      "latitude": -34.6037,
      "longitude": -58.3816,
      "eventCount": 231,
      "memberCount": 156
    }
  ]
}
```

---

## 8. DATA SOURCES

### City Coordinates
1. City groups table (if lat/lng exists)
2. Geocoding via OpenStreetMap Nominatim
3. Hardcoded fallback for major cities

### City Discovery Flow
```
Scraped Event → City Name → 
  ├─ Existing Group? → Use group
  └─ New City? → Create group + geocode
```

---

## 9. LEAFLET INTEGRATION

```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

<MapContainer center={[0, 0]} zoom={2}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <MarkerClusterGroup>
    {cities.map(city => (
      <Marker key={city.id} position={[city.latitude, city.longitude]}>
        <Popup>
          <CityPopupCard city={city} />
        </Popup>
      </Marker>
    ))}
  </MarkerClusterGroup>
</MapContainer>
```

---

## 10. PERMISSIONS MATRIX

| Action | Public | Logged In | Admin |
|--------|--------|-----------|-------|
| View map | ✅ | ✅ | ✅ |
| Click city | ✅ | ✅ | ✅ |
| Search cities | ✅ | ✅ | ✅ |
| Add city | ❌ | ❌ | ✅ |

---

## 11. MOBILE RESPONSIVENESS

| Breakpoint | Layout |
|------------|--------|
| Mobile | Full-screen map, bottom sheet for city list |
| Tablet | Map with side panel |
| Desktop | Map with right sidebar city cards |

---

## 12. TEST SCENARIOS

```markdown
1. [E2E] Map loads with city markers
2. [E2E] Click marker shows popup
3. [E2E] Click "View City" navigates to city page
4. [E2E] Cluster markers when zoomed out
5. [E2E] Search filters map to matching city
6. [E2E] Buenos Aires marker shows 231 events
7. [API] /api/cities/map returns all cities with coords
```

---

## 13. COMPONENT FILES

| Component | Path |
|-----------|------|
| CommunityMapPage | `client/src/pages/CommunityMapPage.tsx` (TBD) |
| CityMarker | `client/src/components/map/CityMarker.tsx` |
| CityPopupCard | `client/src/components/map/CityPopupCard.tsx` |

---

## 14. RELATED PAGES

| Page | Navigation |
|------|------------|
| City Page | Click marker → city page |
| Events | Filter by city from map |
| Housing | Search housing in city |

---

## 15. FUTURE ENHANCEMENTS

- [ ] Heat map overlay for event density
- [ ] Time slider for event distribution
- [ ] Travel route planning
- [ ] "Dancers near me" with user locations
- [ ] Festival season visualization
