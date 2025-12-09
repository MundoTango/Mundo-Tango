# Mundo Tango Scraper System Index

**Purpose**: Comprehensive documentation of all scrapers, fields extracted, data flow, and UI destinations.

**Last Updated**: 2025-01-16 (Merged with Comprehensive Sources Index)
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

## 🌐 Target Sites & Sources

### **Static HTML Sites** (Agent #116: staticScraper.ts)

1. **TangoCat** - https://www.tangocat.com/events
   - Type: Static event listings
   - Coverage: Global tango events
   - Update frequency: Daily
   - Fields: Full event data + community metadata

2. **Tangopolix** - https://www.tangopolix.com/tango-events  
   - Type: Static event calendar
   - Coverage: International festivals & milongas
   - Update frequency: Daily
   - Fields: Event details with organizer info

3. **TangoFestivals.net** - https://tangofestivals.net/events
   - Type: Festival directory
   - Coverage: Major tango festivals worldwide
   - Update frequency: Weekly
   - Fields: Festival details, dates, locations

4. **TangoMapa** - https://tangomapa.com
   - Type: Interactive tango map
   - Coverage: Local milongas by city
   - Update frequency: Daily
   - Fields: Venue info, schedules, locations

5. **TangoDJ.org** - https://tangodj.org/milongas
   - Type: DJ & milonga listings
   - Coverage: International DJ schedules
   - Update frequency: Weekly
   - Fields: DJ names, venues, music styles

### **JavaScript-Rendered Sites** (Agent #117: jsScraper.ts)

6. **Todo Tango** - https://www.todotango.com/english/
   - Type: React-based community site
   - Coverage: Buenos Aires tango scene
   - Update frequency: Real-time
   - Fields: Events, community info, cultural content

7. **Tango.info** - https://www.tango.info
   - Type: Vue.js event platform
   - Coverage: European tango communities
   - Update frequency: Daily
   - Fields: Dynamic event data, RSVP counts

8. **Tango Space** - https://tango.space
   - Type: Angular community hub
   - Coverage: North American tango
   - Update frequency: Real-time
   - Fields: Events, workshops, community metadata

### **Social Media Sources** (Agent #118: socialScraper.ts)

9. **Facebook Groups** - https://www.facebook.com/groups/
   - Target Groups:
     - "Tango Events Worldwide"
     - "Tango Festival Updates"
     - "Milonga Announcements"
     - City-specific tango groups (100+ groups)
   - Update frequency: Real-time
   - Fields: Event posts with dates, locations, descriptions

10. **Facebook Pages** - https://www.facebook.com/pages/
    - Target Pages:
      - Major tango schools
      - Festival organizers
      - Milonga venues
      - Tango orchestras
    - Update frequency: Real-time
    - Fields: Event announcements, photos, RSVP data

11. **Instagram** - https://www.instagram.com
    - Target Accounts:
      - #tangoevent #milonga #tangofestival
      - Major tango influencers
      - Festival organizer accounts
    - Update frequency: Real-time
    - Fields: Event posters (image recognition), captions, dates

### **Event Platforms** (Agent #116: staticScraper.ts)

12. **Eventbrite** - https://www.eventbrite.com/d/online/tango
    - Type: Event ticketing platform
    - Coverage: Ticketed tango events globally
    - Update frequency: Real-time
    - Fields: Full event details, ticket prices, RSVP counts

13. **Meetup** - https://www.meetup.com/topics/tango
    - Type: Community meetup platform
    - Coverage: Local tango meetups & classes
    - Update frequency: Real-time
    - Fields: Recurring events, member counts, locations

### **RSS Feeds** (rss-service)

14. **Tango RSS Aggregator** - Multiple feeds:
    - TangoCat RSS: https://www.tangocat.com/rss
    - Tangopolix RSS: https://www.tangopolix.com/feed
    - TangoFestivals RSS: https://tangofestivals.net/feed
    - Update frequency: Hourly
    - Fields: Event summaries, links to full details

### **Scraping Statistics** (Current)

| Category | # of Sources | Update Frequency | Monthly Events |
|----------|--------------|------------------|----------------|
| Static Sites | 5 | Daily | ~2,500 |
| JS-Rendered | 3 | Daily | ~1,200 |
| Facebook | 100+ groups/pages | Real-time | ~5,000 |
| Instagram | 50+ accounts | Real-time | ~800 |
| Event Platforms | 2 | Real-time | ~1,500 |
| RSS Feeds | 3 | Hourly | ~1,000 |
| **TOTAL** | **163+** | **Mixed** | **~12,000/month** |

### **Adding New Sources**

To add a new scraping source:

```sql
-- Insert into eventScrapingSources table
INSERT INTO "eventScrapingSources" (url, platform, scraperType, active)
VALUES (
  'https://new-tango-site.com/events',
  'website',
  'static',  -- or 'js', 'social', 'rss'
  true
);
```

Then the master orchestrator will automatically include it in the next 24-hour scraping cycle.

#### **Complete Site List** (120+ Sources)

**CRITICAL**: This is the exhaustive master list of ALL sites Mundo Tango scrapes. When adding a new site, it gets added to this list AND the eventScrapingSources table.

##### **🌍 CITY EVENT CALENDARS** (120+ cities across 45+ countries)

**AMERICAS:**

*🇦🇷 Argentina:*
- Buenos Aires: https://www.facebook.com/groups/tangoBA (Facebook Group) - Agent #118
- Ushuaia: https://www.facebook.com/groups/tangoUshuaia (Facebook Group) - Agent #118
- Córdoba: [TBD](https://www.facebook.com/groups/tangocordoba (Facebook Group) - Agent #118)
- Rosario: [TBD](https://www.facebook.com/groups/tangorosario (Facebook Group) - Agent #118)
- Mendoza: [TBD](https://www.facebook.com/groups/tangomendoza (Facebook Group) - Agent #118)

*🇨🇦 Canada:*
- Toronto: [TBD](https://tangotoronto.ca/calendar (Static Website) - Agent #116)
- Montreal: [TBD](https://tangomontreal.com/en/calendar (Static Website) - Agent #116)  
- Vancouver: [TBD](https://www.vancouvertango.com/events (Static Website) - Agent #116)

*🇺🇸 United States:*
- New York: [TBD](https://www.newyorktango.com/calendar (Static Website) - Agent #116)
- San Francisco: [TBD](https://www.tangosf.com/events (Static Website) - Agent #116)
- Los Angeles: [TBD](https://www.tangola.org/calendar (Static Website) - Agent #116)
- Chicago: [TBD](https://www.tangochicago.com/calendar (Static Website) - Agent #116)
- Austin: [TBD](https://www.austintango.org/events (Static Website) - Agent #116)
- Seattle: [TBD](https://www.seattletango.org/calendar (Static Website) - Agent #116)
- Portland: [TBD](https://www.portlandtango.com/events (Static Website) - Agent #116)
- Denver: [TBD](https://www.denvertango.org/calendar (Static Website) - Agent #116)
- Miami: [TBD](https://www.miamitango.com/events (Static Website) - Agent #116)
- Boston: [TBD](https://www.bostontango.org/calendar (Static Website) - Agent #116)

*🇧🇷 Brazil:*
- São Paulo: [TBD](https://www.facebook.com/groups/tangosp (Facebook Group) - Agent #118)
- Rio de Janeiro: [TBD](https://www.facebook.com/groups/tangorj (Facebook Group) - Agent #118)

*🇲🇽 Mexico:*
- Mexico City: [TBD](https://www.facebook.com/groups/tangomx (Facebook Group) - Agent #118)

**EUROPE:**

*🇦🇹 Austria:*
- Vienna: http://www.tango-vienna.at/termine - Agent #116

*🇧🇪 Belgium:*
- Brussels: https://www.tangobrussel.com/agenda - Agent #116

*🇩🇪 Germany:*
- Berlin: TBD
- Munich: TBD
- Hamburg: TBD

*🇫🇷 France:*
- Paris: TBD
- Lyon: TBD

*🇬🇧 United Kingdom:*
- London: TBD
- Manchester: TBD

*🇮🇹 Italy:*
- Rome: TBD
- Milan: TBD

*🇪🇸 Spain:*
- Madrid: TBD
- Barcelona: TBD

*🇳🇱 Netherlands:*
- Amsterdam: TBD

**ASIA-PACIFIC:**

*🇦🇺 Australia:*
- Melbourne: https://tangoclub.melbourne/melbourne-tango-calendar - Agent #116
- Sydney: https://tangoevents.au/ - Agent #116

*🇯🇵 Japan:*
- Tokyo: TBD

*🇰🇷 South Korea:*
- Seoul: TBD

*🇸🇬 Singapore:*
- Singapore: TBD

**Note**: TBD = To Be Documented (sites exist in conversation history, need URL extraction)

##### **📚 TEACHER DIRECTORIES** (15+ sources)

1. **TangoTeachers.com** - https://tangoteachers.com - Global directory - Agent #116
2. **Instructor profiles on TangoCat** - Embedded in event sites - Agent #116
3. **Facebook Teacher Pages** - 100+ pages - Agent #118
4. **Instagram Teacher Accounts** - 50+ accounts - Agent #118
5. _(More TBD from research)_

##### **👠 SHOE VENDORS** (10+ sources)

1. **Neo Tango** - https://www.neotango.com - Agent #116
2. **Comme il Faut** - https://commeilfautshoes.com - Agent #116  
3. **Tango Leike** - TBD
4. **PortDance** - TBD
5. _(More TBD)_

##### **🎶 ORCHESTRA/DJ LISTINGS** (8+ sources)

1. **TangoDJ.org** - https://tangodj.org/milongas - Agent #116
2. **Orchestra listings on TodoTango** - Agent #117
3. _(More TBD)_

##### **🎉 FESTIVAL DIRECTORIES** (5+ sources)

1. **TangoFestivals.net** - https://tangofestivals.net/events - Agent #116
2. **Festival section on Tangopolix** - Already scraped
3. _(More TBD)_

##### **💬 COMMUNITY FORUMS** (20+ sources)

1. **Facebook Groups** - 100+ groups - Agent #118
2. **Reddit r/tango** - TBD
3. _(More TBD)_

---

#### **Adding a New Site: Complete Workflow**

When you discover a new tango site to scrape, follow this process:

**Step 1: Determine Scraper Type**

```bash
# Inspect the site
curl -I https://new-site.com/events

# Check if it's:
# - Static HTML (no JavaScript required) → Agent #116 (staticScraper.ts)
# - JS-rendered (requires Playwright) → Agent #117 (jsScraper.ts)  
# - Social Media (Facebook/Instagram) → Agent #118 (socialScraper.ts)
```

**Step 2: Add to eventScrapingSources Table**

```sql
-- Insert the new source
INSERT INTO "eventScrapingSources" (
  url, 
  platform, 
  scraperType, 
  city,
  country,
  active
)
VALUES (
  'https://new-site.com/events',
  'website',  -- or 'facebook', 'instagram', 'eventbrite', 'meetup'
  'static',   -- or 'js', 'social'
  'Paris',    -- City name
  'France',   -- Country name
  true
);
```

**Step 3: Update THIS Document**

Add the site to the appropriate section above:
- If it's a city calendar → Add to CITY EVENT CALENDARS section
- If it's a teacher directory → Add to TEACHER DIRECTORIES section  
- If it's a vendor → Add to SHOE VENDORS section
- etc.

**Step 4: Master Orchestrator Auto-Includes It**

The `masterOrchestrator.ts` (Agent #115) runs every 24 hours and will:
1. ✅ Query `eventScrapingSources` table for `active = true`
2. ✅ Group by `scraperType` 
3. ✅ Route to appropriate scraper (Agent #116, #117, or #118)
4. ✅ Scrape the new site automatically
5. ✅ Store events in `scrapedEvents` table
6. ✅ Run deduplication (Agent #119)
7. ✅ Auto-create city if new location detected

**Step 5: Verify Data in UI**

Within 24 hours, check:
- `/events` page → New events should appear
- EventCards should show platform badge ("From New Site")
- Map view should show new locations
- Community profiles should show enriched data

---

#### **What Happens After a Site is Added?**

```mermaid
graph TD
    A[New Site Added to DB] --> B[Wait for Next 24h Cron]
    B --> C[Master Orchestrator Runs]
    C --> D{Scraper Type?}
    D -->|static| E[Agent #116]
    D -->|js| F[Agent #117]
    D -->|social| G[Agent #118]
    E --> H[Scrape Site]
    F --> H
    G --> H
    H --> I[Store in scrapedEvents]
    I --> J[Agent #119 Deduplicates]
    J --> K[Auto-Create City if New]
    K --> L[Data Available in UI]
    L --> M[/events Page]
    L --> N[Map View]
    L --> O[Community Profiles]
```

**Timeline:**
- **T+0**: Site added to database
- **T+24h**: First scrape happens (next 4 AM UTC cron)
- **T+24h+5min**: Data deduplicated and available in UI
- **T+48h**: Second scrape (updates/new events)
- **Ongoing**: Scrapes every 24 hours automatically

**Monitoring:**
- Admin Dashboard (`/admin/scraping`) shows:
  - Scraping success rate per source
  - Last scraped timestamp
  - Error logs if scraping fails
  - Total events scraped

**Manual Trigger** (for testing new sources immediately):

```bash
# Run scraper immediately without waiting for cron
npm run scrape:all

# Or run specific scraper type:
npm run scrape:static  # For Agent #116 sources
npm run scrape:js      # For Agent #117 sources  
npm run scrape:social  # For Agent #118 sources
```





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
