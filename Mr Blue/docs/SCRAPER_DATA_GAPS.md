# Scraper Data Quality Gaps - Enhancement Specification

**Created:** December 28, 2025
**MB.MD Reference:** `use mb.md: data-quality`

---

## CURRENT DATA QUALITY METRICS

### Events Table (811 records)

| Field | Has Data | Missing | % Complete | Priority |
|-------|----------|---------|------------|----------|
| cover_image | 303 | 508 | **37%** | HIGH |
| organizer_text | 338 | 473 | **42%** | MEDIUM |
| dj_text | 132 | 679 | **16%** | LOW |
| teacher_text | 168 | 643 | **21%** | LOW |
| venue | 811 | 0 | 100% | N/A |
| price | 3 | 808 | **0.4%** | HIGH |
| description | 811 | 0 | 100% | N/A |

### Cities Table (301 records)

| Field | Has Data | Missing | % Complete | Priority |
|-------|----------|---------|------------|----------|
| description | 301 | 0 | 100% | N/A |
| cover_image | 16 | 285 | **5%** | HIGH |
| timezone | 0 | 301 | **0%** | HIGH |
| venue_count | 0 | 301 | **0%** | MEDIUM |
| event_count | 251 | 50 | 83% | LOW |

---

## REQUIRED SCRAPER ENHANCEMENTS

### 1. Event Cover Image Extraction (Priority: HIGH)

**Current Issue:** Only 37% of events have cover images

**Enhancement:**
```typescript
// In BaseEventScraper.ts / UnifiedEventScraper.ts
interface ScrapedEventImage {
  url: string;
  source: 'og:image' | 'event-image' | 'first-image';
  width?: number;
  height?: number;
}

async extractCoverImage(page: Page): Promise<string | null> {
  // Priority order:
  // 1. Facebook event cover
  // 2. Open Graph image (og:image)
  // 3. Event-specific image class
  // 4. First large image in content
  
  const selectors = [
    'meta[property="og:image"]',
    '.event-cover img',
    '.event-image img',
    'article img:first-of-type',
    '.content img[width]'
  ];
  
  for (const selector of selectors) {
    const img = await page.$(selector);
    if (img) {
      const src = await img.getAttribute('src') || await img.getAttribute('content');
      if (src && this.isValidImageUrl(src)) {
        return src;
      }
    }
  }
  return null;
}
```

### 2. Event Price Extraction (Priority: HIGH)

**Current Issue:** Only 0.4% of events have price data (3 of 811)

**Enhancement:**
```typescript
// Price pattern matching
const pricePatterns = [
  // Currency formats
  /\$(\d+(?:\.\d{2})?)/,           // $50, $50.00
  /€(\d+(?:,\d{2})?)/,             // €50, €50,00
  /(\d+)\s*(?:USD|EUR|GBP|ARS)/i,  // 50 USD, 50 EUR
  // Text patterns
  /(?:price|cost|fee)[:\s]*\$?(\d+)/i,
  /(?:entry|admission)[:\s]*\$?(\d+)/i,
  /(\d+)\s*(?:per person|pp|each)/i,
  // Range patterns
  /\$(\d+)\s*[-–]\s*\$?(\d+)/,     // $20-$50
];

async extractPrice(content: string): Promise<{ min: number; max?: number; currency: string } | null> {
  for (const pattern of pricePatterns) {
    const match = content.match(pattern);
    if (match) {
      return {
        min: parseInt(match[1]),
        max: match[2] ? parseInt(match[2]) : undefined,
        currency: this.detectCurrency(content)
      };
    }
  }
  
  // Check for "free" indicators
  if (/free|no charge|no cost|donation/i.test(content)) {
    return { min: 0, currency: 'USD' };
  }
  
  return null;
}
```

### 3. City Cover Image Population (Priority: HIGH)

**Current Issue:** Only 5% of cities have cover images (16 of 301)

**Enhancement Strategy:**
```typescript
// CityImageService.ts
async populateCityImages(): Promise<void> {
  const citiesWithoutImages = await db.select()
    .from(cities)
    .where(or(
      isNull(cities.coverImage),
      eq(cities.coverImage, '')
    ));
  
  for (const city of citiesWithoutImages) {
    // Strategy 1: Use most popular event image from city
    const topEvent = await db.select({ coverImage: events.coverImage })
      .from(events)
      .where(and(
        eq(events.city, city.name),
        isNotNull(events.coverImage)
      ))
      .orderBy(desc(events.goingCount))
      .limit(1);
    
    if (topEvent[0]?.coverImage) {
      await db.update(cities)
        .set({ coverImage: topEvent[0].coverImage })
        .where(eq(cities.id, city.id));
      continue;
    }
    
    // Strategy 2: Fetch from Unsplash/Pexels API
    const stockImage = await this.fetchCityStockImage(city.name, city.country);
    if (stockImage) {
      await db.update(cities)
        .set({ coverImage: stockImage })
        .where(eq(cities.id, city.id));
    }
  }
}
```

### 4. City Timezone Population (Priority: HIGH)

**Current Issue:** 0% of cities have timezone data

**Enhancement:**
```typescript
// TimezoneService.ts
import { find } from 'geo-tz';

async populateTimezones(): Promise<void> {
  const citiesNeedingTimezone = await db.select()
    .from(cities)
    .where(and(
      isNull(cities.timezone),
      isNotNull(cities.latitude),
      isNotNull(cities.longitude)
    ));
  
  for (const city of citiesNeedingTimezone) {
    const timezones = find(city.latitude, city.longitude);
    if (timezones.length > 0) {
      await db.update(cities)
        .set({ timezone: timezones[0] })
        .where(eq(cities.id, city.id));
      console.log(`Set timezone for ${city.name}: ${timezones[0]}`);
    }
  }
}
```

---

## SCRAPER FILES TO MODIFY

| File | Enhancement | Priority |
|------|-------------|----------|
| `server/services/scraping/UnifiedEventScraper.ts` | Add image/price extraction | HIGH |
| `server/services/scrapers/BaseEventScraper.ts` | Add image/price patterns | HIGH |
| `server/agents/scraping/TangoFestivalsScraper.ts` | Festival-specific price patterns | MEDIUM |
| `server/agents/scraping/HoyMilongaScraper.ts` | Spanish price patterns (€) | MEDIUM |
| `server/services/CityService.ts` | Add timezone population | HIGH |

---

## IMPLEMENTATION PRIORITY

### Phase 1: Critical (This Week)
1. Add price extraction to UnifiedEventScraper
2. Add cover_image extraction fallbacks
3. Populate city timezones using geo-tz library

### Phase 2: Important (Next Week)
1. Backfill event prices from descriptions (AI extraction)
2. City cover images from Unsplash/Pexels
3. Organizer profile linking

### Phase 3: Enhancement (Later)
1. DJ/Teacher profile extraction
2. Venue linking to cities
3. Event series detection

---

## SUCCESS METRICS

| Metric | Current | Target | Deadline |
|--------|---------|--------|----------|
| Events with cover_image | 37% | 80% | Jan 15, 2026 |
| Events with price | 0.4% | 60% | Jan 15, 2026 |
| Cities with cover_image | 5% | 90% | Jan 15, 2026 |
| Cities with timezone | 0% | 100% | Jan 7, 2026 |

---

## NOTES

- All scrapers should be tested in development before running on production
- Backfill operations should be run during off-peak hours
- Monitor API rate limits for stock image services
- Consider caching strategies for frequently accessed images
