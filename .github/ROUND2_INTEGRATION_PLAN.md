# Scraper Round 2: HoyMilonga Expansion & City Hub Map Integration

## Executive Summary

This document outlines the complete implementation plan for Round 2 of the scraping expansion, focusing on:
- HoyMilonga multi-city integration (8 active + 21 new cities)
- Schema extensions for shops, schools, and venue rentals
- City Hub Map integration with new POI types and filters
- Master orchestrator enhancements for site validation

## Current Status (as of commit a46f618)

### ✅ Already Implemented
- **Map Pins**: Custom styled pins for events, housing, recommendations
- **PIN_CONFIG**: SVG-based markers with color coding (#FF5A5F events, #00A699 housing, #FFB400 recommendations)
- **Tango Role Icons**: GraduationCap (Teachers), Music (DJs), Calendar (Organizers), Drama (Performers)
- **Map Component**: GroupDetailsPage.tsx with createStyledIcon() function
- **Price Display**: Circular markers showing event prices or "Free"

### 🏗️ In Progress
- Branch: `feature/scraper-round2-hoymilonga-expansion`
- HoyMilonga scraper stub (Agent #120)
- Schema migration files planned

## Phase 1: Schema Extensions

### New Tables Required

#### 1. city_pois (Points of Interest)
```sql
CREATE TABLE city_pois (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  poi_type TEXT NOT NULL CHECK (poi_type IN ('shop', 'school', 'venue_rental', 'cultural_center')),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  website_url TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB,
  price_range TEXT,
  amenities TEXT[],
  verified BOOLEAN DEFAULT false,
  source_url TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_city_pois_city ON city_pois(city_id);
CREATE INDEX idx_city_pois_type ON city_pois(poi_type);
CREATE INDEX idx_city_pois_location ON city_pois USING GIST (ST_MakePoint(longitude, latitude));
```

#### 2. venue_rentals (Extended venue data)
```sql
CREATE TABLE venue_rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_poi_id UUID REFERENCES city_pois(id) ON DELETE CASCADE,
  hourly_rate DECIMAL(10, 2),
  daily_rate DECIMAL(10, 2),
  weekly_rate DECIMAL(10, 2),
  capacity_min INTEGER,
  capacity_max INTEGER,
  floor_type TEXT,
  has_sound_system BOOLEAN DEFAULT false,
  has_mirrors BOOLEAN DEFAULT false,
  has_air_conditioning BOOLEAN DEFAULT false,
  has_parking BOOLEAN DEFAULT false,
  booking_url TEXT,
  booking_requirements TEXT[],
  availability_calendar JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venue_rentals_poi ON venue_rentals(city_poi_id);
```

#### 3. user_external_links (Teacher/DJ websites)
```sql
CREATE TABLE user_external_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL CHECK (link_type IN ('personal_website', 'teaching_page', 'event_page', 'youtube', 'instagram', 'facebook')),
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  discovered_via TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, url)
);

CREATE INDEX idx_user_links_user ON user_external_links(user_id);
CREATE INDEX idx_user_links_type ON user_external_links(link_type);
```

### Existing Table Extensions

#### events table
```sql
-- Add sub_event tracking
ALTER TABLE events ADD COLUMN parent_event_id UUID REFERENCES events(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN is_sub_event BOOLEAN DEFAULT false;

CREATE INDEX idx_events_parent ON events(parent_event_id) WHERE parent_event_id IS NOT NULL;
```

## Phase 2: Map Pin Integration

### PIN_CONFIG Extensions

Add to `client/src/pages/GroupDetailsPage.tsx`:

```typescript
const PIN_CONFIG = {
  event: { bg: '#FF5A5F', shadow: 'rgba(255, 90, 95, 0.4)', svg: ... },
  housing: { bg: '#00A699', shadow: 'rgba(0, 166, 153, 0.4)', svg: ... },
  recommendation: { bg: '#FFB400', shadow: 'rgba(255, 180, 0, 0.4)', svg: ... },
  
  // NEW POI TYPES
  shop: { 
    bg: '#9C27B0',  // Purple
    shadow: 'rgba(156, 39, 176, 0.4)',
    svg: '<svg>...</svg>',  // Shopping bag icon
    icon: ShoppingBag
  },
  school: { 
    bg: '#FF9800',  // Orange
    shadow: 'rgba(255, 152, 0, 0.4)',
    svg: '<svg>...</svg>',  // School/academy icon
    icon: GraduationCap
  },
  venue_rental: { 
    bg: '#4CAF50',  // Green
    shadow: 'rgba(76, 175, 80, 0.4)',
    svg: '<svg>...</svg>',  // Building/venue icon
    icon: Building
  }
};
```

### Map Filters UI

Add filter toggles to City Hub Map:

```typescript
const [activeFilters, setActiveFilters] = useState({
  events: true,
  housing: true,
  shops: true,
  schools: true,
  venue_rentals: true,
  recommendations: true
});

// Filter button component
<div className="map-filters">
  <FilterButton 
    icon={Calendar} 
    label="Events" 
    active={activeFilters.events}
    color="#FF5A5F"
    onClick={() => toggleFilter('events')}
  />
  <FilterButton 
    icon={ShoppingBag} 
    label="Shops" 
    active={activeFilters.shops}
    color="#9C27B0"
    onClick={() => toggleFilter('shops')}
  />
  <FilterButton 
    icon={GraduationCap} 
    label="Schools" 
    active={activeFilters.schools}
    color="#FF9800"
    onClick={() => toggleFilter('schools')}
  />
  <FilterButton 
    icon={Building} 
    label="Venue Rentals" 
    active={activeFilters.venue_rentals}
    color="#4CAF50"
    onClick={() => toggleFilter('venue_rentals')}
  />
</div>
```

### Data Flow

1. **Query city_pois** with active filters
2. **Transform to map markers** using PIN_CONFIG
3. **Attach click handlers** → Open POI detail modal
4. **Show basic profile** with contact info, hours, amenities

## Phase 3: HoyMilonga Multi-City Scraper

### Agent #120: HoyMilonga Scraper

**File**: `server/services/scrapers/agents/agent-120-hoymilonga.ts`

#### City Coverage (29 total)

##### Active Cities (8)
1. Buenos Aires - https://hoymilonga.com/buenosaires/
2. Madrid - https://hoymilonga.com/madrid/
3. Barcelona - https://hoymilonga.com/barcelona/
4. Paris - https://hoymilonga.com/paris/
5. Berlin - https://hoymilonga.com/berlin/
6. London - https://hoymilonga.com/london/
7. Rome - https://hoymilonga.com/rome/
8. Milan - https://hoymilonga.com/milan/

##### Missing Cities (21) - REQUIRES URL RESEARCH
1. Vienna
2. Brussels
3. Amsterdam
4. Copenhagen
5. Stockholm
6. Warsaw
7. Prague
8. Budapest
9. Athens
10. Lisbon
11. Dublin
12. Helsinki
13. Oslo
14. Moscow
15. Istanbul
16. Tel Aviv
17. New York
18. Los Angeles
19. San Francisco
20. Chicago
21. Washington DC

### Scraper Architecture

```typescript
interface HoyMilongaData {
  events: Event[];
  schools: School[];
  shops: Shop[];
  teachers: Teacher[];
  venues: Venue[];
}

class Agent120HoyMilonga extends BaseScraper {
  async scrapeCity(citySlug: string): Promise<HoyMilongaData> {
    const baseUrl = `https://hoymilonga.com/${citySlug}/`;
    
    // 1. Scrape events page
    const events = await this.scrapeEvents(baseUrl);
    
    // 2. Scrape schools
    const schools = await this.scrapeSchools(baseUrl + 'escuelas/');
    
    // 3. Scrape shops
    const shops = await this.scrapeShops(baseUrl + 'tiendas/');
    
    // 4. Extract teachers from schools
    const teachers = this.extractTeachers(schools);
    
    // 5. Scrape venues
    const venues = await this.scrapeVenues(baseUrl + 'milongas/');
    
    return { events, schools, shops, teachers, venues };
  }
  
  async transformAndSave(data: HoyMilongaData, cityId: string) {
    // Transform to our schema
    for (const school of data.schools) {
      await this.db.city_pois.create({
        city_id: cityId,
        poi_type: 'school',
        name: school.name,
        address: school.address,
        latitude: school.lat,
        longitude: school.lng,
        website_url: school.website,
        phone: school.phone,
        source_url: school.sourceUrl
      });
    }
    
    // Similar for shops, venues, etc.
  }
}
```

### Data Mapping

| HoyMilonga Type | Mundo Tango Table | POI Type |
|-----------------|-------------------|----------|
| Escuelas (Schools) | city_pois | school |
| Tiendas (Shops) | city_pois | shop |
| Milongas (Venues) | city_pois + venue_rentals | venue_rental |
| Teachers | users + user_external_links | - |
| Events | events | - |

## Phase 3A: Professional Role Auto-Assignment

### Overview

Automatic role assignment when scraping discovers professionals (teachers, DJs, venue owners, schools) from HoyMilonga and other aggregators.

### Identity Resolution Service

**File**: `server/services/identity-resolution.ts`

```typescript
interface IdentityMatch {
  userId: number | null;
  confidence: number; // 0-100
  matchType: 'email' | 'name+city' | 'external_link' | 'none';
  candidates: User[];
}

class IdentityResolutionService {
  async findUser(scraped: ScrapedProfessional): Promise<IdentityMatch> {
    // 1. Try exact email match (highest confidence)
    if (scraped.email) {
      const user = await db.users.findFirst({ where: { email: scraped.email } });
      if (user) return { userId: user.id, confidence: 95, matchType: 'email', candidates: [user] };
    }
    
    // 2. Try external_link match (high confidence)
    if (scraped.website) {
      const link = await db.user_external_links.findFirst({ where: { url: scraped.website } });
      if (link) return { userId: link.user_id, confidence: 90, matchType: 'external_link', candidates: [] };
    }
    
    // 3. Try name + city match (medium confidence, may have multiple candidates)
    const candidates = await db.users.findMany({
      where: {
        AND: [
          { display_name: { contains: scraped.name, mode: 'insensitive' } },
          { city: scraped.city }
        ]
      },
      take: 5
    });
    
    if (candidates.length === 1) {
      return { userId: candidates[0].id, confidence: 70, matchType: 'name+city', candidates };
    } else if (candidates.length > 1) {
      return { userId: null, confidence: 40, matchType: 'name+city', candidates };
    }
    
    // 4. No match - create shadow profile
    return { userId: null, confidence: 0, matchType: 'none', candidates: [] };
  }
  
  async createShadowProfile(scraped: ScrapedProfessional): Promise<number> {
    const user = await db.users.create({
      data: {
        username: this.generateUsername(scraped.name),
        display_name: scraped.name,
        email: scraped.email || null,
        city: scraped.city,
        is_shadow_profile: true, // New column
        shadow_profile_source: 'hoymilonga',
        created_at: new Date()
      }
    });
    return user.id;
  }
}
```

### Role Assignment Logic

**File**: `server/services/scrapers/agents/agent-120-hoymilonga.ts` (Enhanced)

```typescript
class Agent120HoyMilonga extends BaseScraper {
  async processDiscoveredProfessionals(data: HoyMilongaData, cityId: string) {
    const identityService = new IdentityResolutionService();
    const rolesAssigned: Array<{userId: number; role: string;}> = [];
    
    // Process Teachers
    for (const teacher of data.teachers) {
      const match = await identityService.findUser({
        name: teacher.name,
        email: teacher.email,
        website: teacher.website,
        city: cityId
      });
      
      let userId: number;
      if (match.confidence >= 70 && match.userId) {
        userId = match.userId;
      } else if (match.confidence === 0) {
        // Create shadow profile for unregistered professional
        userId = await identityService.createShadowProfile(teacher);
      } else {
        // Low confidence (40-69) - flag for manual review
        await this.flagForManualReview(match, teacher);
        continue;
      }
      
      // Assign teacher role if not already assigned
      await this.assignRole(userId, 'teacher', {
        yearsExperience: teacher.yearsExperience || 0,
        verified: true,
        verificationSource: 'hoymilonga',
        discoveredAt: new Date()
      });
      
      // Create external link record
      if (teacher.website) {
        await db.user_external_links.upsert({
          where: { user_id_url: { user_id: userId, url: teacher.website } },
          create: {
            user_id: userId,
            link_type: 'teaching_page',
            url: teacher.website,
            title: teacher.schoolName,
            verified: true,
            discovered_via: 'hoymilonga_scraper'
          },
          update: { verified: true }
        });
      }
      
      rolesAssigned.push({ userId, role: 'teacher' });
    }
    
    // Similar processing for DJs, venue owners, schools...
    return rolesAssigned;
  }
  
  async assignRole(userId: number, role: string, metadata: RoleMetadata) {
    const user = await db.users.findUnique({ where: { id: userId } });
    if (!user) return;
    
    // Check if role already assigned
    if (user.tangoRoles?.includes(role)) {
      // Update verification if from trusted source
      if (metadata.verified) {
        await this.updateRoleVerification(userId, role, metadata.verificationSource);
      }
      return;
    }
    
    // Add new role
    await db.users.update({
      where: { id: userId },
      data: {
        tangoRoles: [...(user.tangoRoles || []), role],
        tangoRoleExperience: [
          ...(user.tangoRoleExperience || []),
          {
            role,
            startDate: metadata.discoveredAt,
            yearsExperience: metadata.yearsExperience,
            isVerified: metadata.verified,
            verificationSource: metadata.verificationSource
          }
        ]
      }
    });
  }
}
```

### Verification Confidence Scoring

| Source | Base Confidence | Notes |
|--------|----------------|-------|
| HoyMilonga | 90 | Trusted aggregator |
| TangoCat | 85 | Trusted aggregator |
| Individual school site | 70 | Domain verified |
| Social media listing | 50 | Requires additional verification |
| User self-claim | 30 | Unverified until confirmed |

**Multi-Source Boost**: +10 confidence per additional source (max 100)

```typescript
function calculateVerificationScore(sources: VerificationSource[]): number {
  if (sources.length === 0) return 0;
  
  const baseScore = Math.max(...sources.map(s => s.confidence));
  const multiSourceBonus = Math.min((sources.length - 1) * 10, 30);
  
  return Math.min(baseScore + multiSourceBonus, 100);
}
```

### Event Team Auto-Population

When scraping events with listed professionals:

```typescript
async scrapeEventWithProfessionals(eventUrl: string) {
  const event = await this.extractEventData(eventUrl);
  
  // Save event
  const eventId = await this.saveEvent(event);
  
  // Extract and match professionals
  const professionals = event.teachers.concat(event.djs).concat(event.performers);
  
  for (const pro of professionals) {
    const userId = await this.findOrCreateProfessional(pro);
    
    // Create event participant record (auto-populates PRO tab)
    await db.eventParticipants.create({
      data: {
        eventId,
        userId,
        role: pro.role, // 'teacher' | 'dj' | 'performer'
        status: 'confirmed',
        isPubliclyListed: true,
        customTitle: pro.title, // "Guest DJ from Berlin"
        source: 'hoymilonga_scraper',
        confirmedAt: new Date()
      }
    });
  }
  
  return eventId;
}
```

**Result**: Professionals automatically get verified event history in their PRO tab[web:23].

### Role Mapping from Scraped Data

| Scraped Type | Mundo Tango Role | Auto-Assign |
|--------------|------------------|-------------|
| Escuela Teacher | `teacher` | ✅ Yes |
| DJ (event listing) | `dj` | ✅ Yes |
| Tienda Owner | `business` | ✅ Yes |
| Milonga Venue Owner | `venue-owner` | ✅ Yes |
| School Administrator | `teacher` | ✅ Yes (primary role) |
| Event Performer | `performer` | ✅ Yes |

## Phase 3B: Mr. Blue Validation Agent

### Overview

Mr. Blue AI acts as the **Professional Onboarding Agent**, validating scraped data and reaching out to discovered professionals.

### Data Quality Validation

**Pattern 53: Data Quality Validation Protocol**

Before assigning roles, Mr. Blue validates:

```typescript
interface DataQualityCheck {
  professionalName: string;
  checks: {
    nameValid: boolean; // Not "Unknown" or "TBA"
    contactValid: boolean; // Has email OR website
    cityValid: boolean; // Matches known city
    duplicateCheck: boolean; // Not duplicate of existing user
    websiteReachable: boolean; // Website returns 200
  };
  overallScore: number; // 0-100
  recommendation: 'auto_assign' | 'flag_for_review' | 'reject';
}

class MrBlueValidationAgent {
  async validateProfessional(scraped: ScrapedProfessional): Promise<DataQualityCheck> {
    const checks = {
      nameValid: this.validateName(scraped.name),
      contactValid: !!(scraped.email || scraped.website),
      cityValid: await this.validateCity(scraped.city),
      duplicateCheck: await this.checkDuplicates(scraped),
      websiteReachable: await this.checkWebsite(scraped.website)
    };
    
    const score = Object.values(checks).filter(Boolean).length * 20;
    
    return {
      professionalName: scraped.name,
      checks,
      overallScore: score,
      recommendation: score >= 80 ? 'auto_assign' : score >= 60 ? 'flag_for_review' : 'reject'
    };
  }
}
```

### Professional Outreach System

**Pattern 54: Professional Identity Resolution**

Mr. Blue sends onboarding emails to newly discovered professionals:

```typescript
interface OutreachEmail {
  to: string;
  subject: string;
  template: 'shadow_profile_created' | 'role_assigned' | 'profile_claim';
  personalizations: {
    professionalName: string;
    role: string;
    discoverySource: string;
    claimUrl: string;
  };
}

async sendProfessionalOutreach(userId: number, role: string) {
  const user = await db.users.findUnique({ where: { id: userId } });
  if (!user.email || !user.is_shadow_profile) return;
  
  const claimToken = await this.generateClaimToken(userId);
  
  await emailService.send({
    to: user.email,
    subject: `You've been listed as a ${role} on Mundo Tango`,
    template: 'shadow_profile_created',
    personalizations: {
      professionalName: user.display_name,
      role,
      discoverySource: 'HoyMilonga',
      claimUrl: `https://mundo-tango.vercel.app/claim-profile/${claimToken}`
    }
  });
}
```

### Conflict Resolution

**Pattern 55: Multi-Source Verification Scoring**

When same professional found on multiple sites with different roles:

```typescript
async resolveRoleConflict(userId: number, conflicts: RoleConflict[]) {
  // Assign ALL roles found across sources
  const uniqueRoles = [...new Set(conflicts.map(c => c.role))];
  
  for (const role of uniqueRoles) {
    const sources = conflicts.filter(c => c.role === role);
    const confidence = calculateVerificationScore(sources);
    
    await this.assignRole(userId, role, {
      yearsExperience: Math.max(...sources.map(s => s.yearsExperience || 0)),
      verified: confidence >= 70,
      verificationSource: sources.map(s => s.source).join(', '),
      discoveredAt: new Date()
    });
  }
  
  // If ambiguous (e.g., 3 "Maria Santos" in Buenos Aires), flag for review
  if (conflicts.some(c => c.confidence < 70)) {
    await db.manual_review_queue.create({
      data: {
        entity_type: 'professional_identity',
        entity_id: userId,
        reason: 'low_confidence_match',
        conflicts: JSON.stringify(conflicts),
        assigned_to: 'mr_blue_agent',
        status: 'pending'
      }
    });
  }
}
```

### Mr. Blue Dashboard Integration

Add to Mr. Blue's orchestration capabilities:

- **Daily Validation Pass**: Review all scraped professionals from previous day
- **Outreach Campaign**: Email 50 shadow profile users per day
- **Conflict Resolution**: Present ambiguous cases for admin review
- **Verification Scoring**: Real-time confidence calculation



## Phase 4: Master Orchestrator Enhancements

### Site Validation Before Scraping



**File**: `server/services/scrapers/orchestrator.ts`

```typescript
interface SiteValidation {
  url: string;
  isLive: boolean;
  statusCode: number;
  scraperType: 'static' | 'js-rendered' | 'social-api' | 'api';
  lastChecked: Date;
}

class ScraperOrchestrator {
  async validateSitesBeforeRun(): Promise<SiteValidation[]> {
    const sites = await this.loadSitesFromIndex();
    const validations: SiteValidation[] = [];
    
    for (const site of sites) {
      try {
        const response = await fetch(site.url, { method: 'HEAD' });
        const scraperType = this.detectScraperType(response, site.url);
        
        validations.push({
          url: site.url,
          isLive: response.ok,
          statusCode: response.status,
          scraperType,
          lastChecked: new Date()
        });
      } catch (error) {
        validations.push({
          url: site.url,
          isLive: false,
          statusCode: 0,
          scraperType: 'static',
          lastChecked: new Date()
        });
      }
    }
    
    return validations;
  }
  
  detectScraperType(response: Response, url: string): string {
    const contentType = response.headers.get('content-type');
    
    // API detection
    if (contentType?.includes('application/json')) return 'api';
    
    // Social media detection
    if (url.includes('facebook.com') || url.includes('instagram.com')) {
      return 'social-api';
    }
    
    // JavaScript-heavy sites
    const jsHeavySites = ['eventbrite', 'meetup', 'ticketmaster'];
    if (jsHeavySites.some(s => url.includes(s))) return 'js-rendered';
    
    return 'static';
  }
  
  async runScrapersWithValidation() {
    // 1. Validate all sites
    const validations = await this.validateSitesBeforeRun();
    
    // 2. Filter to live sites only
    const liveSites = validations.filter(v => v.isLive);
    
    // 3. Group by scraper type
    const grouped = this.groupBy(liveSites, 'scraperType');
    
    // 4. Run scrapers in parallel by type
    await Promise.all([
      this.runStaticScrapers(grouped['static']),
      this.runJSScrapers(grouped['js-rendered']),
      this.runAPIScrapers(grouped['api']),
      this.runSocialScrapers(grouped['social-api'])
    ]);
  }
}
```

### Auto-Schema Detection

When scraping a new site, automatically determine:

1. **Data Types Available**: Events, schools, shops, teachers?
2. **Schema Mapping**: Which fields map to our tables?
3. **Blocking Check**: Do required tables exist?

```typescript
interface SiteSchemaAnalysis {
  dataTypes: ('events' | 'schools' | 'shops' | 'teachers')[];
  fieldMappings: Record<string, string>;
  requiredTables: string[];
  tablesExist: boolean;
}

async analyzeSiteSchema(siteUrl: string): Promise<SiteSchemaAnalysis> {
  const sampleData = await this.scrapeSample(siteUrl);
  
  const analysis: SiteSchemaAnalysis = {
    dataTypes: [],
    fieldMappings: {},
    requiredTables: [],
    tablesExist: false
  };
  
  // Detect data types from DOM structure
  if (sampleData.includes('class="event"')) {
    analysis.dataTypes.push('events');
    analysis.requiredTables.push('events');
  }
  
  if (sampleData.includes('class="school"') || sampleData.includes('escuela')) {
    analysis.dataTypes.push('schools');
    analysis.requiredTables.push('city_pois');
  }
  
  // Check if tables exist
  analysis.tablesExist = await this.checkTablesExist(analysis.requiredTables);
  
  return analysis;
}
```

## Phase 5: Implementation Checklist

### Database Setup
- [ ] Deploy Phase 2 schema migrations
  - [ ] city_pois table
  - [ ] venue_rentals table
  - [ ] user_external_links table
  - [ ] events.parent_event_id column
  - [ ] events.is_sub_event column
- [ ] Verify indexes created
- [ ] Test PostGIS functions for location queries

### Frontend Development
- [ ] Extend PIN_CONFIG with shop/school/venue pins
- [ ] Create FilterButton component
- [ ] Add filter state management to GroupDetailsPage
- [ ] Implement POI detail modal
- [ ] Update map query to fetch city_pois
- [ ] Add color-coded legend to map

### Backend Development
- [ ] Complete Agent #120 (HoyMilonga scraper)
  - [ ] scrapeEvents() method
  - [ ] scrapeSchools() method
  - [ ] scrapeShops() method
  - [ ] scrapeVenues() method
  - [ ] extractTeachers() method
- [ ] Update orchestrator with validation logic
- [ ] Add schema detection to orchestrator
- [ ] Create API endpoints for city_pois
  - [ ] GET /api/cities/:id/pois
  - [ ] GET /api/pois/:id
  - [ ] GET /api/venue-rentals/:id

### City Research
- [ ] Research HoyMilonga URLs for 21 missing cities
- [ ] Verify city slugs match expected pattern
- [ ] Document any cities not on HoyMilonga
- [ ] Create fallback plan for unsupported cities

### Testing
- [ ] Unit tests for Agent #120
- [ ] Integration tests for city_pois queries
- [ ] E2E tests for map filters
- [ ] Load testing with 3000+ POIs
- [ ] Mobile responsiveness testing

### Documentation
- [ ] Update SCRAPER_INDEX.md with Agent #120
- [ ] Document PIN_CONFIG color scheme
- [ ] Create POI data format specification
- [ ] Update PRD_EVENTS_SYSTEM.md with sub-events
- [ ] Add City Hub Map user guide

## Phase 6: Deployment Strategy

### Rollout Plan

#### Week 1: Schema & Infrastructure
1. Deploy schema migrations to staging
2. Run migration tests
3. Deploy to production
4. Monitor database performance

#### Week 2: Frontend Development
1. Implement PIN_CONFIG extensions
2. Build filter UI components
3. Create POI detail modal
4. Deploy to preview environment

#### Week 3: HoyMilonga Scraper
1. Complete Agent #120 implementation
2. Test on 8 active cities
3. Research + add 21 new cities
4. Run full scrape (dry run)

#### Week 4: Integration & Testing
1. Connect frontend to city_pois API
2. E2E testing
3. Performance optimization
4. Production deployment

### Success Metrics

- **Coverage**: 29 cities with HoyMilonga data
- **POI Count**: 3000+ shops, schools, venues
- **Map Performance**: <2s load time with 3000 pins
- **User Engagement**: 30% of users interact with map filters
- **Data Freshness**: Scrapers run daily, data <24hrs old

## Appendix

### Related Files
- `client/src/pages/GroupDetailsPage.tsx` - Map implementation
- `server/services/scrapers/agents/agent-120-hoymilonga.ts` - HoyMilonga scraper
- `db/migrations/add_city_pois.sql` - Schema migration
- `.github/SCRAPER_INDEX.md` - Scraper inventory
- `PRD_EVENTS_SYSTEM.md` - Events system PRD
- `PRD_UNIFIED_PRO_TAB.md` - Teacher/DJ profiles

### Contact
- Implementation questions: @admin3304
- Schema review: Database team
- UI/UX feedback: Design team

---

**Status**: 🟡 In Progress
**Last Updated**: 2025
**Next Review**: After Phase 1 completion
