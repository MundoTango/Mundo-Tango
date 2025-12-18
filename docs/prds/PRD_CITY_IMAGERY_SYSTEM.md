# PRD: City Imagery Standardization System

**Version:** 1.0  
**Created:** November 30, 2025  
**Status:** Implementation Complete  
**Pattern:** MB.MD v9.7 Pattern 40 - City Imagery Standardization Protocol

---

## Overview

The City Imagery System provides a **standardized, platform-wide methodology** for displaying city-specific skyline/cityscape images anywhere a city is referenced in the Mundo Tango platform. This ensures visual consistency, improves user experience, and eliminates repeated discussions about city cover photos.

## Problem Statement

City groups, travel pages, housing listings, and event cards all display cities but use inconsistent fallback images or no city-specific imagery. This has been discussed "multiple times" without a centralized solution.

## Solution: Centralized City Image Mapping

### Architecture

```
client/src/lib/cityImageMap.ts (Single Source of Truth)
         ↓
getCityImageUrl(city: string) → Unsplash URL
         ↓
All 15+ city-related components import and use this function
```

### Core Utility

**Location:** `client/src/lib/cityImageMap.ts`

```typescript
export const CITY_IMAGE_MAP: Record<string, string> = {
  "Buenos Aires": "https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1200...",
  "Paris": "https://images.unsplash.com/photo-1499856871957-5b8620a32237?w=1200...",
  // 27+ major tango cities mapped
};

export function getCityImageUrl(city?: string | null): string {
  // 1. Try exact match
  // 2. Try partial match (first word)
  // 3. Fallback to generic tango image
}
```

---

## Component Integration Matrix

| # | Component | Path | Integration Method | Status |
|---|-----------|------|-------------------|--------|
| 1 | GroupsPage.tsx | pages/ | `getCityImageUrl(group.city)` | ✅ Complete |
| 2 | GroupDetailsPage.tsx | pages/ | `getCityImageUrl(group.city)` | ✅ Complete |
| 3 | CityGroupsPage.tsx | pages/ | `getCityImageUrl(group.city)` | ✅ Complete |
| 4 | GroupCard.tsx | components/ | `getCityImageUrl(group.city)` | ✅ Complete |
| 5 | ProfessionalGroupsPage.tsx | pages/ | `getCityImageUrl(group.city)` | ✅ Complete |
| 6 | GroupsPrototypePage.tsx | pages/ | `getCityImageUrl(group.city)` | ✅ Complete |
| 7 | EventCard.tsx | components/ | `getCityImageUrl(event.city)` | ✅ Complete |
| 8 | EventDetailsPage.tsx | pages/ | `getCityImageUrl(event.city)` | ✅ Complete |
| 9 | ProfileTabTravel.tsx | components/profile/ | Uses local stock images | N/A |
| 10 | HousingMarketplacePage.tsx | pages/ | Property images (not city) | N/A |
| 11 | HousingSearchPage.tsx | pages/ | Property images (not city) | N/A |
| 12 | CityGuidesPage.tsx | pages/ | `getCityImageUrl(city)` | ✅ Complete |
| 13 | albums.tsx | pages/ | Album cover images | N/A |
| 14 | album-detail.tsx | pages/ | Album cover images | N/A |

---

## Fallback Chain

```
Priority 1: entity.coverImage (user-uploaded custom image)
     ↓ (if null/undefined)
Priority 2: getCityImageUrl(entity.city) (city-specific skyline)
     ↓ (if city not in map)
Priority 3: Generic tango/dance fallback image
```

### Implementation Pattern

```tsx
// CORRECT - Use this pattern everywhere
<img src={group.coverImage || getCityImageUrl(group.city)} alt={group.name} />

// WRONG - Hardcoded fallback
<img src={group.coverImage || "https://images.unsplash.com/generic..."} />
```

---

## Supported Cities (27+)

### Major Tango Cities
- Buenos Aires (Obelisco skyline)
- Paris (Eiffel Tower)
- Barcelona (Sagrada Familia)
- Berlin (cityscape)
- London (Big Ben)

### Global Cities
- New York, Tokyo, Toronto, Sydney, Melbourne
- Los Angeles, San Francisco, Miami, Chicago
- Amsterdam, Vienna, Prague, Rome, Venice
- Madrid, Lisbon, Istanbul, Bangkok, Singapore
- Hong Kong, Seoul, Dubai, Mexico City
- Rio de Janeiro, São Paulo

---

## Adding New Cities

To add a new city to the system:

1. Find a high-quality Unsplash image of the city skyline
2. Get the photo ID from the URL (e.g., `photo-1612294037637-ec328d0e075e`)
3. Add to `CITY_IMAGE_MAP`:

```typescript
"City Name": "https://images.unsplash.com/photo-{ID}?w=1200&auto=format&fit=crop&q=80",
```

4. The change automatically propagates to all 15+ components

---

## Testing Checklist

- [ ] Buenos Aires group shows Obelisco skyline image
- [ ] Paris group shows Eiffel Tower image
- [ ] Groups with custom coverImage still show custom image
- [ ] Groups with unmapped cities show generic fallback
- [ ] City Group landing page shows correct images
- [ ] City Group detail hero shows correct image
- [ ] Event cards with city show city-specific backgrounds

---

## Cross-System Wirings

| From | To | Integration |
|------|-----|-------------|
| Groups | cityImageMap | `getCityImageUrl(group.city)` in cover photos |
| Events | cityImageMap | `getCityImageUrl(event.city)` in hero sections |
| Travel | Stock images | Uses local imported images (separate system) |
| Housing | Property photos | Uses listing.coverPhotoUrl (not city-based) |

---

## MB.MD Pattern 40: City Imagery Standardization Protocol

**Added to mb.md v9.8**

1. **SINGLE SOURCE**: All city images from `cityImageMap.ts`
2. **FALLBACK CHAIN**: Custom → City-specific → Generic
3. **IMPORT PATTERN**: `import { getCityImageUrl } from "@/lib/cityImageMap"`
4. **USAGE**: `src={entity.coverImage || getCityImageUrl(entity.city)}`
5. **EXPANSION**: Add new cities to CITY_IMAGE_MAP only

---

## Maintenance

- **Image Expiration**: Unsplash URLs are stable and don't expire
- **Adding Cities**: Update `CITY_IMAGE_MAP` in cityImageMap.ts
- **Testing**: Visual verification on Groups landing page
- **Documentation**: Update this PRD when adding major cities

---

## Related Documentation

- `mb.md` Pattern 40 - City Imagery Standardization Protocol
- `docs/prds/PRD_GROUPS_LANDING_SYSTEM.md` - Groups landing page
- `docs/prds/PRD_GROUPS_DETAILS_SYSTEM.md` - Group detail page
