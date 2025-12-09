# Mundo Tango Scraper System Index

**Purpose**: Comprehensive documentation of all scrapers, fields extracted, data flow, and UI destinations.

**Last Updated**: 2025-01-16  
**Branch**: `server/services/scrapers`  
**Location**: `server/agents/scraping/`

---

## 📋 Executive Summary

The Mundo Tango scraping system consists of **5 core components** that extract tango event and community data from multiple sources:

- **3 Specialized Scrapers**: Static HTML, JavaScript-rendered, Social Media
- **1 Master Orchestrator**: Coordinates all scraping jobs
- **1 Deduplication Engine**: Prevents duplicate entries

**Data Sources**:
- Static websites (TangoCat, Tangopolix, TangoFestivals, etc.)
- JavaScript-rendered sites (React/Vue/Angular tango communities)
- Social media (Facebook Groups/Pages, Instagram)
- RSS feeds (tango event feeds)
- Event platforms (Eventbrite, Meetup)

---

## 🔧 Scraper Components

### 1. **staticScraper.ts** (Agent #116)
**Path**: `server/agents/scraping/staticScraper.ts`  
**Purpose**: Scrapes static HTML websites using Cheerio  
**Technologies**: Axios, Cheerio, robots.txt compliance

#### **Fields Extracted**:

##### ScrapedEventData Interface:
```typescript
- title: string
- description?: string
- startDate: Date
- endDate?: Date
- location?: string
- address?: string
- organizer?: string
- price?: number
- imageUrl?: string
- externalId?: string
```

##### ScrapedCommunityMetadata Interface:
```typescript
- communityName?: string
- description?: string
- history?: string
- culture?: string
- rules?: string[]
- dressCode?: string
- etiquette?: string[]
- organizers?: Array<{ name: string; role: string; contact?: string }>
- contactEmail?: string
- contactPhone?: string
- facebookUrl?: string
- instagramUrl?: string
- youtubeUrl?: string
- whatsappGroupLink?: string
- websiteUrl?: string
- memberCount?: number
- foundedYear?: number
- coverPhotoUrl?: string
- logoUrl?: string
```

**Target Sites**: TangoCat, Tangopolix, TangoFestivals, static event listing sites

**UI Destinations**:
- Events → `scrapedEvents` table → EventCard, Calendar, Map views
- Communities → `scrapedCommunityData` table → Community profiles

---

### 2. **jsScraper.ts** (Agent #117)
**Path**: `server/agents/scraping/jsScraper.ts`  
**Purpose**: Scrapes JavaScript-rendered websites using Playwright  
**Technologies**: Playwright (headless Chrome), AJAX handling, dynamic content loading

#### **Fields Extracted**:

##### DynamicEventData Interface:
```typescript
- title: string
- description?: string
- startDate: Date
- endDate?: Date
- location?: string
- price?: number
- imageUrl?: string
- url?: string
```

##### DynamicCommunityMetadata Interface:
```typescript
- communityName?: string
- description?: string
- history?: string
- rules?: string[]
- organizers?: Array<{ name: string; role: string }>
- socialLinks?: {
    facebook?: string
    instagram?: string
    youtube?: string
    whatsapp?: string
  }
- contactEmail?: string
- memberCount?: number
- coverPhotoUrl?: string
```

**Target Sites**: React/Vue/Angular tango community sites, About pages with dynamic content

**UI Destinations**:
- Events → `scrapedEvents` table → EventCard, Calendar, Map views
- Communities → `scrapedCommunityData` table → Community profiles, About sections

---

### 3. **socialScraper.ts** (Agent #118)
**Path**: `server/agents/scraping/socialScraper.ts`  
**Purpose**: Scrapes social media platforms for tango events  
**Technologies**: Facebook Graph API, Instagram scraping, fallback to web scraping

#### **Fields Extracted**:

##### SocialEventData Interface:
```typescript
- title: string
- description?: string
- startDate: Date
- endDate?: Date
- location?: string
- imageUrl?: string
- externalId?: string
- platform: 'facebook' | 'instagram'
```

**Target Platforms**: Facebook Groups/Pages, Instagram tango event posts

**UI Destinations**:
- Events → `scrapedEvents` table → EventCard (with social platform badge)
- Platform indicators → Show "From Facebook" or "From Instagram" tags

---

### 4. **masterOrchestrator.ts** (Agent #115)
**Path**: `server/agents/scraping/masterOrchestrator.ts`  
**Purpose**: Master scraping orchestration system  
**Schedule**: Every 24 hours (4 AM UTC)

#### **Responsibilities**:
1. **Schedule scraping jobs** every 24 hours
2. **Coordinate Agents** #116, #117, #118
3. **Manage proxy rotation system**
4. **Monitor scraping health**
5. **Trigger deduplication** (Agent #119)
6. **Auto-create cities** for new locations

#### **Scraping Flow**:
```
1. Group sources by scraper type:
   - facebookSources → Agent #118 (Social Scraper)
   - instagramSources → Agent #118 (Social Scraper)
   - websiteSources → Agent #116 (Static Scraper)
   - eventPlatformSources (Eventbrite, Meetup) → Agent #116
   - rssSources → rss-service

2. Execute scraping in parallel batches

3. Collect statistics (total events scraped)

4. Trigger deduplication (Agent #119)

5. Auto-create cities for new locations
```

**UI Destinations**:
- Admin Dashboard → Scraping health metrics
- Job logs → `/admin/scraping-jobs`

---

### 5. **deduplicator.ts** (Agent #119)
**Path**: `server/agents/scraping/deduplicator.ts`  
**Purpose**: Prevent duplicate event entries  

#### **Deduplication Strategy**:
1. **Title similarity** (Levenshtein distance)
2. **Date matching** (same startDate)
3. **Location matching** (same venue/city)
4. **URL comparison** (same external source)

**Process**: Runs after all scrapers complete, merges duplicate entries

**UI Destinations**:
- Events → Ensures clean, deduplicated event listings
- Admin Dashboard → Deduplication statistics

---

## 📊 Database Schema

### **scrapedEvents Table**
**Path**: `shared/schema.ts`

**Fields** (from all scrapers combined):
```sql
- id: uuid (primary key)
- title: text (required)
- description: text
- startDate: timestamp (required)
- endDate: timestamp
- location: text
- address: text
- organizer: text
- price: numeric
- imageUrl: text
- externalId: text (unique per source)
- platform: enum ('facebook', 'instagram', 'website', 'eventbrite', 'meetup')
- sourceUrl: text
- scrapedAt: timestamp
- deduplicatedAt: timestamp
- cityId: uuid (foreign key → cities)
- communityId: uuid (foreign key → communities)
```

### **scrapedCommunityData Table**
**Fields**:
```sql
- id: uuid
- communityName: text
- description: text
- history: text
- rules: jsonb
- organizers: jsonb
- socialLinks: jsonb
- contactInfo: jsonb
- memberCount: integer
- foundedYear: integer
- coverPhotoUrl: text
- logoUrl: text
```

### **eventScrapingSources Table**
**Fields**:
```sql
- id: uuid
- url: text (unique)
- platform: enum ('facebook', 'instagram', 'website', 'rss', 'eventbrite', 'meetup')
- scraperType: enum ('static', 'js', 'social', 'rss')
- active: boolean
- lastScraped: timestamp
- scrapingFrequency: interval (default: 24 hours)
```

---

## 🎨 UI Data Flow

### **Events Page** (`/events`)
**Components**: EventCard, Calendar, Map

**Data Flow**:
```
scrapedEvents table
  ↓ (deduplicatedalready)
  → Merged with user-created events
  → Filtered by:
      - Date range
      - City/location
      - Event type
      - Price range
  → Displayed in:
      - EventCard (grid view)
      - Calendar (monthly view)
      - Map (geographic view)
```

**EventCard Fields Displayed**:
- `title` (heading)
- `imageUrl` (cover photo)
- `startDate` + `endDate` (date/time)
- `location` + `address` (venue)
- `organizer` (host)
- `price` (ticket cost)
- `platform` badge ("From Facebook", "From TangoCat", etc.)
- `description` (preview, expandable)

### **Community Profiles** (`/communities/:id`)
**Components**: CommunityHeader, AboutSection, RulesSection, ContactSection

**Data Flow**:
```
scrapedCommunityData table
  → Enriched with:
      - User reviews
      - Event history
      - Member testimonials
  → Displayed in:
      - CommunityHeader (cover, logo, name)
      - AboutSection (description, history, culture)
      - RulesSection (rules, dress code, etiquette)
      - ContactSection (social links, email, phone)
```

### **Admin Dashboard** (`/admin/scraping`)
**Components**: ScrapingHealthWidget, JobLogsTable

**Metrics Displayed**:
- Total events scraped (last 24h)
- Scraping success rate
- Deduplication rate
- Active sources count
- Failed scraping jobs

---

## 🚀 Running Scrapers

### **Manual Trigger** (for testing):
```bash
# Run all scrapers
npm run scrape:all

# Run specific scraper
npm run scrape:static
npm run scrape:js
npm run scrape:social

# Run deduplication
npm run scrape:dedupe
```

### **Automated Schedule**:
- **Frequency**: Every 24 hours (4 AM UTC)
- **Orchestrator**: `masterOrchestrator.ts` (Agent #115)
- **Cron Job**: `/server/jobs/scraping-cron.ts`

---

## 📝 Next Steps (Orchestration Plan)

### **Phase 1: Event Scrapers** ✅ (CURRENT)
- [x] Static scraper (Agent #116)
- [x] JS scraper (Agent #117)
- [x] Social scraper (Agent #118)
- [x] Master orchestrator (Agent #115)
- [x] Deduplicator (Agent #119)

### **Phase 2: Vendor/Instructor Scrapers** (NEXT)
- [ ] Instructor profile scraper
- [ ] DJ profile scraper
- [ ] Venue/milonga scraper
- [ ] Shoe shop scraper
- [ ] Travel package scraper

### **Phase 3: Advanced Features**
- [ ] ML-based event categorization
- [ ] Auto-translation (multi-language)
- [ ] Image recognition (event posters)
- [ ] Sentiment analysis (reviews)

---

## 🔗 Related Documentation

- [MB.MD Methodology](./mb-md/README.md)
- [Agent Architecture](./agent-training/README.md)
- [Database Schema](./database/README.md)
- [API Documentation](./api/README.md)

---

**Author**: Comet (Perplexity AI) + admin3304  
**MB.MD Phase**: BUILD → DOCUMENT  
**Status**: ✅ Phase 1 Complete, Ready for Phase 2
