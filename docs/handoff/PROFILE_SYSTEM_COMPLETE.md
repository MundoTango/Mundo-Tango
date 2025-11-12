# PROFILE SYSTEM COMPLETE - COMPREHENSIVE HANDOFF DOCUMENTATION

**Date:** November 12, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0.0

---

## Table of Contents

1. [Profile System Overview](#profile-system-overview)
2. [Profile Types (23 Total)](#profile-types)
3. [API Endpoints (100+)](#api-endpoints)
4. [Database Schema](#database-schema)
5. [Search Capabilities](#search-capabilities)
6. [Visibility & Permissions](#visibility-permissions)
7. [Frontend Integration](#frontend-integration)
8. [Media Upload System](#media-upload-system)
9. [Analytics Tracking](#analytics-tracking)
10. [Testing](#testing)
11. [Usage Examples](#usage-examples)

---

## Profile System Overview

The Mundo Tango Platform features a sophisticated multi-profile system supporting:

- **23 distinct profile types** (17 professional + 6 user-centric)
- **100+ API endpoints** for CRUD operations and search
- **Comprehensive search and filtering** across all profile types
- **Media upload support** (photos, videos, portfolios)
- **Real-time analytics tracking** (views, visitors, tab navigation)
- **RBAC visibility controls** (Public/Friends Only/Private)
- **Profile completion tracking** with percentage indicators
- **Professional verification** system for credibility

### Architecture

- **Base Profile:** Core user profile (`users` table)
- **Professional Profiles:** 17 specialized professional/business profiles (1:1 with user)
- **User-Centric Profiles:** 6 additional profile types for personal content (feed, travel, friends, etc.)
- **Profile Media:** Separate media management for each profile type
- **Profile Analytics:** Comprehensive tracking via `profile_views` table

---

## Profile Types

### Professional Profiles (17 Types)

#### 1. **Teacher Profile** (`teacher_profiles`)
Tango instructors offering private and group lessons.
- **Key Fields:** bio, teaching styles, specialties, certifications, hourly rates, availability
- **Route:** `/api/profiles/teacher`
- **Search:** By city, rate range, teaching styles, student levels

#### 2. **DJ Profile** (`dj_profiles`)
Professional DJs for milongas and tango events.
- **Key Fields:** DJ name, music styles, equipment, sets performed, portfolio links
- **Route:** `/api/profiles/dj`
- **Search:** By city, rate range, music styles, equipment availability

#### 3. **Musician Profile** (`musician_profiles`)
Live tango musicians and orchestras.
- **Key Fields:** instruments, genres, musical styles, performance history, albums
- **Route:** `/api/profiles/musician`
- **Search:** By instruments, city, performance rate, ensemble type

#### 4. **Photographer Profile** (`photographer_profiles`)
Event and portrait photographers.
- **Key Fields:** specialties, photography style, equipment, packages, portfolio
- **Route:** `/api/profiles/photographer`
- **Search:** By city, specialties, rate range, service types

#### 5. **Performer Profile** (`performer_profiles`)
Stage performers and show dancers.
- **Key Fields:** stage name, performance types, styles, repertoire, choreographies
- **Route:** `/api/profiles/performer`
- **Search:** By city, performance types, styles, availability

#### 6. **Vendor Profile** (`vendor_profiles`)
Sellers of tango shoes, clothing, and accessories.
- **Key Fields:** business name, product categories, products catalog, shipping options
- **Route:** `/api/profiles/vendor`
- **Search:** By product category, city, price range, shipping availability

#### 7. **Choreographer Profile** (`choreographer_profiles`)
Professional choreographers creating tango works.
- **Key Fields:** style specialties, works created, choreography count, services offered
- **Route:** `/api/profiles/choreographer`
- **Search:** By city, style specialties, service types

#### 8. **Tango School Profile** (`tango_school_profiles`)
Dance schools and academies.
- **Key Fields:** school name, classes offered, instructors, facilities, class schedules
- **Route:** `/api/profiles/tango-school`
- **Search:** By city, class types, skill levels, schedule

#### 9. **Tango Hotel Profile** (`tango_hotel_profiles`)
Hotels and accommodations catering to tango dancers.
- **Key Fields:** hotel name, amenities, room types, proximity to venues, special packages
- **Route:** `/api/profiles/tango-hotel`
- **Search:** By city, amenities, price range, proximity to events

#### 10. **Wellness Profile** (`wellness_profiles`)
Wellness professionals (massage, physiotherapy, etc.).
- **Key Fields:** specialties, services, treatments, certifications, session rates
- **Route:** `/api/profiles/wellness`
- **Search:** By city, specialty, service type, rate range

#### 11. **Tour Operator Profile** (`tour_operator_profiles`)
Tango tour and travel package organizers.
- **Key Fields:** company name, tour packages, destinations, group sizes, pricing
- **Route:** `/api/profiles/tour-operator`
- **Search:** By destination, package type, duration, price range

#### 12. **Host/Venue Profile** (`host_venue_profiles`)
Milonga venues and event spaces.
- **Key Fields:** venue name, capacity, amenities, location, booking info, event types
- **Route:** `/api/profiles/host-venue`
- **Search:** By city, capacity, amenities, availability

#### 13. **Tango Guide Profile** (`tango_guide_profiles`)
City guides and cultural experience providers.
- **Key Fields:** cities covered, tour types, languages, group sizes, availability
- **Route:** `/api/profiles/tango-guide`
- **Search:** By city, language, tour type, availability

#### 14. **Taxi Dancer Profile** (`taxi_dancer_profiles`)
Professional dance partners available for hire.
- **Key Fields:** dance styles, availability, hourly rates, experience level, cities
- **Route:** `/api/profiles/taxi-dancer`
- **Search:** By city, dance style, rate range, availability

#### 15. **Content Creator Profile** (`content_creator_profiles`)
Bloggers, vloggers, influencers in tango community.
- **Key Fields:** content types, platforms, audience size, collaboration rates, portfolio
- **Route:** `/api/profiles/content-creator`
- **Search:** By content type, platform, audience size, city

#### 16. **Learning Resource Profile** (`learning_resource_profiles`)
Educational content providers (online courses, tutorials).
- **Key Fields:** resource types, topics, formats, pricing, access levels
- **Route:** `/api/profiles/learning-resource`
- **Search:** By topic, format, skill level, price range

#### 17. **Organizer Profile** (`organizer_profiles`)
Event organizers and festival coordinators.
- **Key Fields:** event types, events organized, team size, services offered, portfolio
- **Route:** `/api/profiles/organizer`
- **Search:** By city, event types, experience, availability

### User-Centric Profiles (6 Types)

#### 18. **Travel Preferences Profile** (`travel_preferences_profiles`)
User's travel plans, preferences, and upcoming trips.
- **Key Fields:** travel plans, interests, budget preferences, travel style

#### 19. **Events Profile** (`events_profiles`)
User's event participation, RSVPs, and hosting history.
- **Key Fields:** events attended, events organized, RSVP history, preferences

#### 20. **Friends Network Profile** (`friends_network_profiles`)
User's social connections and friend groups.
- **Key Fields:** friends list, friend requests, mutual friends, connection strength

#### 21. **Photos/Media Gallery Profile** (`photos_media_gallery_profiles`)
User's photo and video collections.
- **Key Fields:** photo albums, video collections, tagged media, visibility settings

#### 22. **About/Bio Extended Profile** (`about_bio_extended_profiles`)
Extended biographical information and personal story.
- **Key Fields:** detailed bio, dance journey, achievements, influences, goals

#### 23. **Feed Activity Profile** (`feed_activity_profiles`)
User's posts, interactions, and social activity.
- **Key Fields:** posts created, likes given, comments, shares, engagement metrics

---

## API Endpoints

### Base Profile Endpoints

```
GET    /api/users/:id                    # Get user profile by ID
PUT    /api/users/:id                    # Update user profile
GET    /api/profile/:userId/stats        # Get profile statistics
POST   /api/profile/:userId/view         # Track profile view
GET    /api/profiles/search              # Universal profile search
```

### Professional Profile Endpoints (Pattern for all 17 types)

Each professional profile follows this pattern (replace `{type}` with profile type):

```
POST   /api/profiles/{type}              # Create profile (authenticated)
GET    /api/profiles/{type}/:userId      # Get profile by user ID
PUT    /api/profiles/{type}              # Update own profile (authenticated)
DELETE /api/profiles/{type}              # Delete own profile (authenticated)
GET    /api/profiles/{type}s/search      # Search profiles with filters
```

#### Teacher Profile Endpoints
```
POST   /api/profiles/teacher
GET    /api/profiles/teacher/:userId
PUT    /api/profiles/teacher
DELETE /api/profiles/teacher
GET    /api/profiles/teachers/search?city=Berlin&minRate=50&maxRate=100&styles=vals&level=advanced
```

#### DJ Profile Endpoints
```
POST   /api/profiles/dj
GET    /api/profiles/dj/:userId
PUT    /api/profiles/dj
DELETE /api/profiles/dj
GET    /api/profiles/djs/search?city=BuenosAires&minRate=200&maxRate=500&styles=traditional&equipmentType=own
```

#### Musician Profile Endpoints
```
POST   /api/profiles/musician
GET    /api/profiles/musician/:userId
PUT    /api/profiles/musician
DELETE /api/profiles/musician
GET    /api/profiles/musicians/search?city=Paris&instruments=bandoneon&minRate=300&ensembleType=orchestra
```

#### Photographer Profile Endpoints
```
POST   /api/profiles/photographer
GET    /api/profiles/photographer/:userId
PUT    /api/profiles/photographer
DELETE /api/profiles/photographer
GET    /api/profiles/photographers/search?city=Barcelona&specialties=event&minRate=150
```

#### Performer Profile Endpoints
```
POST   /api/profiles/performer
GET    /api/profiles/performer/:userId
PUT    /api/profiles/performer
DELETE /api/profiles/performer
GET    /api/profiles/performers/search?city=Moscow&styles=theatrical&performanceTypes=couple
```

#### Vendor Profile Endpoints
```
POST   /api/profiles/vendor
GET    /api/profiles/vendor/:userId
PUT    /api/profiles/vendor
DELETE /api/profiles/vendor
GET    /api/profiles/vendors/search?productCategories=shoes&city=Milan&priceRange=$$
```

#### Choreographer Profile Endpoints
```
POST   /api/profiles/choreographer
GET    /api/profiles/choreographer/:userId
PUT    /api/profiles/choreographer
DELETE /api/profiles/choreographer
GET    /api/profiles/choreographers/search?city=NewYork&styleSpecialties=stage
```

#### Tango School Profile Endpoints
```
POST   /api/profiles/tango-school
GET    /api/profiles/tango-school/:userId
PUT    /api/profiles/tango-school
DELETE /api/profiles/tango-school
GET    /api/profiles/tango-schools/search?city=Tokyo&classTypes=beginner&schedule=evening
```

#### Tango Hotel Profile Endpoints
```
POST   /api/profiles/tango-hotel
GET    /api/profiles/tango-hotel/:userId
PUT    /api/profiles/tango-hotel
DELETE /api/profiles/tango-hotel
GET    /api/profiles/tango-hotels/search?city=Istanbul&amenities=practice_room&priceRange=$$$
```

#### Host/Venue Profile Endpoints
```
POST   /api/profiles/host-venue
GET    /api/profiles/host-venue/:userId
PUT    /api/profiles/host-venue
DELETE /api/profiles/host-venue
GET    /api/profiles/host-venues/search?city=London&capacity=100&amenities=bar,parking
```

#### Wellness Profile Endpoints
```
POST   /api/profiles/wellness
GET    /api/profiles/wellness/:userId
PUT    /api/profiles/wellness
DELETE /api/profiles/wellness
GET    /api/profiles/wellness/search?city=Vienna&specialty=massage&serviceType=sports_therapy
```

#### Tour Operator Profile Endpoints
```
POST   /api/profiles/tour-operator
GET    /api/profiles/tour-operator/:userId
PUT    /api/profiles/tour-operator
DELETE /api/profiles/tour-operator
GET    /api/profiles/tour-operators/search?destination=Argentina&packageType=festival&duration=7
```

#### Tango Guide Profile Endpoints
```
POST   /api/profiles/tango-guide
GET    /api/profiles/tango-guide/:userId
PUT    /api/profiles/tango-guide
DELETE /api/profiles/tango-guide
GET    /api/profiles/tango-guides/search?city=Berlin&language=English&tourType=cultural
```

#### Taxi Dancer Profile Endpoints
```
POST   /api/profiles/taxi-dancer
GET    /api/profiles/taxi-dancer/:userId
PUT    /api/profiles/taxi-dancer
DELETE /api/profiles/taxi-dancer
GET    /api/profiles/taxi-dancers/search?city=Seattle&danceStyle=salon&minRate=40
```

#### Content Creator Profile Endpoints
```
POST   /api/profiles/content-creator
GET    /api/profiles/content-creator/:userId
PUT    /api/profiles/content-creator
DELETE /api/profiles/content-creator
GET    /api/profiles/content-creators/search?contentType=video&platform=youtube&audienceSize=10000
```

#### Learning Resource Profile Endpoints
```
POST   /api/profiles/learning-resource
GET    /api/profiles/learning-resource/:userId
PUT    /api/profiles/learning-resource
DELETE /api/profiles/learning-resource
GET    /api/profiles/learning-resources/search?topic=musicality&format=video&skillLevel=intermediate
```

#### Organizer Profile Endpoints
```
POST   /api/profiles/organizer
GET    /api/profiles/organizer/:userId
PUT    /api/profiles/organizer
DELETE /api/profiles/organizer
GET    /api/profiles/organizers/search?city=Amsterdam&eventTypes=festival&experience=5
```

### Media Upload Endpoints

```
POST   /api/profiles/:profileType/:userId/upload-photo      # Upload photo
POST   /api/profiles/:profileType/:userId/upload-video      # Upload video
POST   /api/profiles/:profileType/:userId/upload-portfolio  # Upload portfolio file
DELETE /api/profiles/:profileType/:userId/media/:mediaId    # Delete media item
GET    /api/profiles/:profileType/:userId/media             # Get all media for profile
```

### Analytics Endpoints

```
POST   /api/profiles/:userId/track-view       # Track profile view
GET    /api/profiles/:userId/analytics        # Get analytics summary (auth required)
GET    /api/profiles/:userId/visitors         # Get recent visitors (auth required)
```

---

## Database Schema

### Base User Profile Table

```sql
users (
  id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  bio TEXT,
  profileImage TEXT,
  backgroundImage TEXT,
  city VARCHAR,
  country VARCHAR,
  tangoRoles TEXT[],
  languages TEXT[],
  yearsOfDancing INTEGER,
  leaderLevel INTEGER DEFAULT 0,
  followerLevel INTEGER DEFAULT 0,
  subscriptionTier VARCHAR DEFAULT 'free',
  role VARCHAR DEFAULT 'user',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
)
```

### Professional Profile Tables (Common Pattern)

All 17 professional profile tables follow a similar structure:

```sql
{profile_type}_profiles (
  id SERIAL PRIMARY KEY,
  userId INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  yearsExperience INTEGER,
  specialties TEXT[],
  hourlyRate NUMERIC(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  photoUrls TEXT[],
  videoUrls TEXT[],
  portfolioUrl TEXT,
  averageRating REAL,
  reviewCount INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  isVerified BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  -- Profile-specific fields vary by type
)
```

### Profile Media Table

```sql
profile_media (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
  profileType VARCHAR(50) NOT NULL,
  mediaType VARCHAR(20) NOT NULL,  -- 'photo', 'video', 'portfolio'
  url TEXT NOT NULL,
  cloudinaryPublicId TEXT,
  caption TEXT,
  displayOrder INTEGER DEFAULT 0,
  visibility VARCHAR(20) DEFAULT 'public',
  createdAt TIMESTAMP DEFAULT NOW()
)
```

### Profile Views/Analytics Table

```sql
profile_views (
  id SERIAL PRIMARY KEY,
  profileUserId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewerUserId INTEGER REFERENCES users(id) ON DELETE CASCADE,
  profileType VARCHAR(50),           -- Which tab was viewed
  viewerIp VARCHAR(45),               -- For anonymous tracking
  createdAt TIMESTAMP DEFAULT NOW()
)

-- Indexes for performance
CREATE INDEX idx_profile_views_profile_user ON profile_views(profileUserId);
CREATE INDEX idx_profile_views_viewer_user ON profile_views(viewerUserId);
CREATE INDEX idx_profile_views_created_at ON profile_views(createdAt);
CREATE INDEX idx_profile_views_profile_type ON profile_views(profileType);
```

### Key Database Features

- **Cascading Deletes:** All profile data deleted when user is deleted
- **Unique Constraints:** One profile per type per user (1:1 relationship)
- **Indexed Searches:** City, country, rating, specialty fields indexed
- **JSONB Fields:** Complex data (equipment, certifications, packages) stored as JSONB
- **Array Fields:** Multi-select data (styles, specialties) stored as TEXT[]

---

## Search Capabilities

### Universal Search

The `/api/profiles/search` endpoint provides unified search across all profile types:

```javascript
GET /api/profiles/search?q=tango+teacher&city=Berlin&type=teacher&limit=20
```

### Profile-Specific Search Filters

Each profile type supports custom filters relevant to that profession:

#### Teacher Search Filters
- `city` - Location filter
- `minRate` / `maxRate` - Price range
- `styles` - Teaching styles (salon, nuevo, milonguero)
- `level` - Student levels (beginner, intermediate, advanced)
- `onlineTeaching` - Availability for online lessons
- `travelForTeaching` - Willing to travel

#### DJ Search Filters
- `city` - Location filter
- `minRate` / `maxRate` - Event rate range
- `styles` - Music styles (traditional, alternative, neo)
- `equipmentType` - Has own equipment
- `willingToTravel` - Travel availability
- `eventsWorked` - Minimum experience level

#### Musician Search Filters
- `city` - Location filter
- `instruments` - Instrument types (bandoneon, violin, piano)
- `minRate` / `maxRate` - Performance rate range
- `ensembleType` - Solo, duo, orchestra
- `genres` - Music genres

#### Photographer Search Filters
- `city` - Location filter
- `specialties` - Event, portrait, performance
- `minRate` / `maxRate` - Rate range
- `servicesOffered` - Photo, video, editing, prints
- `willingToTravel` - Travel availability

### Search Implementation Example

```typescript
// Backend search handler
app.get("/api/profiles/teachers/search", async (req, res) => {
  const {
    city,
    minRate,
    maxRate,
    styles,
    level
  } = req.query;

  const filters = [];
  
  if (city) {
    filters.push(eq(teacherProfiles.city, city));
  }
  
  if (minRate) {
    filters.push(gte(teacherProfiles.hourlyRate, parseFloat(minRate)));
  }
  
  if (maxRate) {
    filters.push(lte(teacherProfiles.hourlyRate, parseFloat(maxRate)));
  }
  
  if (styles) {
    filters.push(
      sql`${teacherProfiles.teachingStyles} && ARRAY[${styles.split(',')}]::text[]`
    );
  }

  const results = await db
    .select()
    .from(teacherProfiles)
    .innerJoin(users, eq(teacherProfiles.userId, users.id))
    .where(and(...filters))
    .orderBy(desc(teacherProfiles.averageRating));

  res.json(results);
});
```

---

## Visibility & Permissions

### Three-Tier Visibility System

#### 1. Public Profiles
- **Who can view:** Everyone (authenticated and anonymous)
- **What's visible:** Full profile, all tabs, contact info, media
- **Use case:** Professionals seeking clients, community engagement

#### 2. Friends Only
- **Who can view:** Confirmed friends only
- **What's visible:** Full profile for friends, limited preview for others
- **Use case:** Semi-private users, selective sharing

#### 3. Private Profiles
- **Who can view:** Profile owner only
- **What's visible:** Profile owner sees everything, others see minimal info
- **Use case:** Maximum privacy, internal use only

### Permission Checks

```typescript
// Backend permission check example
async function canViewProfile(viewerId: number | null, profileUserId: number): Promise<boolean> {
  // Get profile owner's privacy settings
  const user = await db.select().from(users).where(eq(users.id, profileUserId)).limit(1);
  
  if (!user[0]) return false;
  
  const visibility = user[0].profileVisibility || 'public';
  
  // Public profiles: everyone can view
  if (visibility === 'public') return true;
  
  // Owner can always view their own profile
  if (viewerId === profileUserId) return true;
  
  // Private profiles: only owner
  if (visibility === 'private') return false;
  
  // Friends only: check friendship
  if (visibility === 'friends') {
    if (!viewerId) return false;
    
    const friendship = await db.select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.userId1, viewerId), eq(friendships.userId2, profileUserId)),
          and(eq(friendships.userId1, profileUserId), eq(friendships.userId2, viewerId))
        )
      )
      .where(eq(friendships.status, 'accepted'))
      .limit(1);
      
    return friendship.length > 0;
  }
  
  return false;
}
```

### Profile Tab Visibility

Different tabs can have different visibility settings:

```typescript
interface TabVisibility {
  feed: 'public' | 'friends' | 'private';
  photos: 'public' | 'friends' | 'private';
  travel: 'public' | 'friends' | 'private';
  events: 'public' | 'friends' | 'private';
  friends: 'public' | 'friends' | 'private';
  about: 'public' | 'friends' | 'private';
  // Professional tabs inherit from base visibility
}
```

---

## Frontend Integration

### ProfilePage.tsx Architecture

The profile page uses a tab-based architecture to load different profile types:

```typescript
// client/src/pages/ProfilePage.tsx

import ProfileTabTeacher from "@/components/profile/ProfileTabTeacher";
import ProfileTabDJ from "@/components/profile/ProfileTabDJ";
import ProfileTabPhotographer from "@/components/profile/ProfileTabPhotographer";
// ... import all 23 tab components

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [, params] = useRoute("/profile/:id");
  
  // Fetch base user profile
  const { data: user } = useQuery({
    queryKey: ["user", profileId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${profileId}`);
      return res.json();
    }
  });
  
  // Render active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return <ProfileTabFeed userId={profileId} />;
      case 'teacher':
        return <ProfileTabTeacher userId={profileId} />;
      case 'dj':
        return <ProfileTabDJ userId={profileId} />;
      case 'photographer':
        return <ProfileTabPhotographer userId={profileId} />;
      // ... 20 more cases
      default:
        return <ProfileTabAbout userId={profileId} />;
    }
  };
  
  return (
    <div>
      <ProfileHeader user={user} />
      <ProfileTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        availableTabs={getAvailableTabs(user)}
      />
      {renderTabContent()}
    </div>
  );
}
```

### Profile Tab Component Structure

Each tab component follows this pattern:

```typescript
// client/src/components/profile/ProfileTabTeacher.tsx

interface ProfileTabTeacherProps {
  userId: number;
}

export default function ProfileTabTeacher({ userId }: ProfileTabTeacherProps) {
  const isOwnProfile = useAuth().user?.id === userId;
  
  // Fetch teacher profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profiles/teacher', userId],
    enabled: !!userId
  });
  
  // Track tab view
  useEffect(() => {
    fetch(`/api/profiles/${userId}/track-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileType: 'teacher' })
    });
  }, [userId]);
  
  if (isLoading) return <Skeleton />;
  if (!profile) return <EmptyState />;
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{profile.tagline}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{profile.bio}</p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Years Teaching</Label>
              <p>{profile.yearsExperience}</p>
            </div>
            <div>
              <Label>Hourly Rate</Label>
              <p>${profile.hourlyRate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isOwnProfile && (
        <Button onClick={() => navigate('/profile/teacher/edit')}>
          Edit Profile
        </Button>
      )}
    </div>
  );
}
```

### Adding a New Profile Type

To add a new profile type (e.g., "Event Planner"):

#### 1. Database Schema

Add to `shared/schema.ts`:

```typescript
export const eventPlannerProfiles = pgTable("event_planner_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  bio: text("bio"),
  yearsExperience: integer("years_experience"),
  eventTypes: text("event_types").array(),
  maxCapacity: integer("max_capacity"),
  packageRates: jsonb("package_rates"),
  portfolioUrls: text("portfolio_urls").array(),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEventPlannerProfileSchema = createInsertSchema(eventPlannerProfiles).omit({ 
  id: true, 
  userId: true,
  createdAt: true, 
  updatedAt: true 
});

export type InsertEventPlannerProfile = z.infer<typeof insertEventPlannerProfileSchema>;
export type SelectEventPlannerProfile = typeof eventPlannerProfiles.$inferSelect;
```

#### 2. API Routes

Add to `server/routes.ts`:

```typescript
// Event Planner Profile Routes
app.post("/api/profiles/event-planner", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validated = insertEventPlannerProfileSchema.parse(req.body);
    const profile = await storage.createEventPlannerProfile({ 
      ...validated, 
      userId: req.userId! 
    });
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create event planner profile" });
  }
});

app.get("/api/profiles/event-planner/:userId", async (req: Request, res: Response) => {
  try {
    const profile = await storage.getEventPlannerProfile(parseInt(req.params.userId));
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event planner profile" });
  }
});

app.put("/api/profiles/event-planner", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validated = insertEventPlannerProfileSchema.partial().parse(req.body);
    const profile = await storage.updateEventPlannerProfile(req.userId!, validated);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Failed to update event planner profile" });
  }
});

app.delete("/api/profiles/event-planner", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await storage.deleteEventPlannerProfile(req.userId!);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event planner profile" });
  }
});

app.get("/api/profiles/event-planners/search", async (req: Request, res: Response) => {
  try {
    const filters = {
      city: req.query.city as string | undefined,
      minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity as string) : undefined,
      eventTypes: req.query.eventTypes as string | undefined,
    };
    const results = await storage.searchEventPlannerProfiles(filters);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Failed to search event planner profiles" });
  }
});
```

#### 3. Frontend Tab Component

Create `client/src/components/profile/ProfileTabEventPlanner.tsx`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProfileTabEventPlannerProps {
  userId: number;
}

export default function ProfileTabEventPlanner({ userId }: ProfileTabEventPlannerProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profiles/event-planner', userId],
    enabled: !!userId
  });

  if (isLoading) return <div>Loading...</div>;
  if (!profile) return <div>No event planner profile found</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Planning Services</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{profile.bio}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="font-semibold">{profile.yearsExperience} years</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Capacity</p>
              <p className="font-semibold">{profile.maxCapacity} guests</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Event Types</p>
            <div className="flex flex-wrap gap-2">
              {profile.eventTypes.map((type: string) => (
                <Badge key={type} variant="secondary">{type}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button>Contact Event Planner</Button>
    </div>
  );
}
```

#### 4. Register Tab in ProfilePage

Add to `client/src/pages/ProfilePage.tsx`:

```typescript
import ProfileTabEventPlanner from "@/components/profile/ProfileTabEventPlanner";

// In renderTabContent():
case 'event-planner':
  return <ProfileTabEventPlanner userId={profileId} />;
```

#### 5. Add to ProfileTabsNav

Update tab configuration to include new tab:

```typescript
const availableTabs = [
  { id: 'feed', label: 'Feed', icon: Home },
  { id: 'event-planner', label: 'Event Planning', icon: Calendar },
  // ... other tabs
];
```

---

## Media Upload System

### Supported Media Types

- **Photos:** JPEG, PNG, WebP (up to 10MB)
- **Videos:** MP4, WebM (up to 100MB)
- **Portfolio Files:** PDF, JPEG, PNG (up to 10MB)

### Upload Flow

1. **Client:** Select file, preview locally
2. **Upload:** Send to `/api/profiles/:profileType/:userId/upload-{type}`
3. **Processing:** Backend validates, uploads to Cloudinary
4. **Storage:** Save URL and metadata to `profile_media` table
5. **Response:** Return media URL and ID to client

### Implementation Example

```typescript
// Frontend upload component
const handlePhotoUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('caption', caption);
  formData.append('visibility', visibility);
  
  const response = await fetch(
    `/api/profiles/teacher/${userId}/upload-photo`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }
  );
  
  const result = await response.json();
  console.log('Uploaded:', result.url);
};
```

### Cloudinary Configuration

Media uploads use Cloudinary (or fallback to base64):

```typescript
// Backend configuration (server/routes.ts)
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadMediaToCloudinary(file, folder, resourceType) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation: [
          { width: 1920, height: 1920, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(file.buffer);
  });
}
```

---

## Analytics Tracking

### Profile View Tracking

Every profile visit is tracked:

```typescript
// Automatic tracking on profile visit
useEffect(() => {
  fetch(`/api/profiles/${userId}/track-view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileType: activeTab, // Which tab was viewed
      source: 'direct' // How they arrived
    })
  });
}, [userId, activeTab]);
```

### Analytics Dashboard

Profile owners can view comprehensive analytics:

```typescript
const { data: analytics } = useQuery({
  queryKey: ['/api/profiles', userId, 'analytics'],
  queryFn: async () => {
    const res = await fetch(`/api/profiles/${userId}/analytics?period=month&days=30`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
});

// Analytics data structure:
{
  period: 30,
  summary: {
    totalViews: 245,
    uniqueVisitors: 189,
    uniqueIps: 150,
    uniqueUsers: 39
  },
  viewsByTab: [
    { profileType: 'teacher', count: 120 },
    { profileType: 'photos', count: 75 },
    { profileType: 'about', count: 50 }
  ],
  daily: [
    { date: '2025-11-01', totalViews: 12, uniqueVisitors: 10 },
    { date: '2025-11-02', totalViews: 15, uniqueVisitors: 13 }
  ],
  weekly: [...],
  monthly: [...]
}
```

### Recent Visitors

```typescript
const { data: visitors } = useQuery({
  queryKey: ['/api/profiles', userId, 'visitors'],
  queryFn: async () => {
    const res = await fetch(`/api/profiles/${userId}/visitors?limit=50`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
});

// Visitor data structure:
[
  {
    id: 1234,
    viewedAt: '2025-11-12T10:30:00Z',
    profileType: 'teacher',
    viewer: {
      id: 456,
      name: 'Maria Garcia',
      username: 'maria_tango',
      profileImage: 'https://...',
      city: 'Madrid',
      country: 'Spain'
    },
    isAnonymous: false
  },
  {
    id: 1235,
    viewedAt: '2025-11-12T09:15:00Z',
    profileType: 'photos',
    viewer: null,
    isAnonymous: true,
    viewerLocation: {
      ip: '192.168.1.xxx' // Partial IP for privacy
    }
  }
]
```

---

## Testing

### E2E Test Suite

Comprehensive tests located at `tests/e2e/profile-system.spec.ts`:

**Test Coverage (41 Total Tests):**

#### Core Profile Tests (10 tests)
- 1.1 - View own profile
- 1.2 - Edit base profile bio
- 1.3 - Edit profile city and location
- 1.4 - Upload and update profile avatar
- 1.5 - View public user profile
- 1.6 - Update privacy settings to public
- 1.7 - Update privacy settings to friends only
- 1.8 - Update privacy settings to private
- 1.9 - Display profile completion tracking
- 1.10 - Update contact information

#### Professional Profile Tests (15 tests)
- 2.1 - Create teacher profile
- 2.2 - Edit teacher profile
- 2.3 - Delete teacher profile
- 2.4 - Search teachers by specialty
- 2.5 - View teacher profile page
- 2.6 - Create DJ profile
- 2.7 - Edit DJ profile
- 2.8 - Delete DJ profile
- 2.9 - Search DJs by location
- 2.10 - View DJ profile page
- 2.11 - Create musician profile
- 2.12 - Edit musician profile
- 2.13 - Delete musician profile
- 2.14 - Search musicians by instrument
- 2.15 - View musician profile page

#### Media Upload Tests (5 tests)
- 3.1 - Upload portfolio image
- 3.2 - Upload sample mix (DJ)
- 3.3 - Upload demo video
- 3.4 - Delete media item
- 3.5 - View media gallery

#### Visibility & Permissions Tests (8 tests)
- 4.1 - Public profile viewable by all
- 4.2 - Friends-only profile visible to friends
- 4.3 - Private profile only visible to owner
- 4.4 - Professional tabs respect visibility
- 4.5 - Contact info hidden based on settings
- 4.6 - Media gallery respects visibility
- 4.7 - Cannot edit other user's profile
- 4.8 - Cannot delete other user's profile

#### Analytics Tests (3 tests)
- 5.1 - Track profile view
- 5.2 - View analytics dashboard
- 5.3 - View recent visitors

### Running Tests

```bash
# Run all profile tests
npm run test:e2e tests/e2e/profile-system.spec.ts

# Run specific test group
npm run test:e2e tests/e2e/profile-system.spec.ts -g "Professional Profile Tests"

# Run in headed mode (see browser)
npm run test:e2e tests/e2e/profile-system.spec.ts --headed

# Generate test report
npm run test:e2e tests/e2e/profile-system.spec.ts --reporter=html
```

---

## Usage Examples

### Example 1: Create Teacher Profile

**Request:**
```http
POST /api/profiles/teacher
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Passionate tango teacher with 15 years of experience in Salon and Milonguero styles.",
  "yearsExperience": 15,
  "teachingSince": 2010,
  "teachingStyles": ["salon", "milonguero", "vals"],
  "specialties": ["technique", "musicality", "connection"],
  "levels": ["beginner", "intermediate", "advanced"],
  "certifications": ["TangoMaestro Certified", "Dinzel Method"],
  "hourlyRate": 80,
  "currency": "USD",
  "privateClassRate": 100,
  "groupClassRate": 25,
  "availability": {
    "weekdays": ["Monday", "Wednesday", "Friday"],
    "timeSlots": ["18:00-21:00"],
    "locations": ["Downtown Studio", "Online"]
  },
  "languagesSpoken": ["English", "Spanish", "German"],
  "teachingLocations": ["Berlin", "Hamburg"],
  "onlineTeaching": true,
  "travelForTeaching": true
}
```

**Response:**
```json
{
  "id": 42,
  "userId": 123,
  "bio": "Passionate tango teacher with 15 years of experience...",
  "yearsExperience": 15,
  "hourlyRate": "80.00",
  "averageRating": null,
  "reviewCount": 0,
  "isActive": true,
  "isVerified": false,
  "createdAt": "2025-11-12T10:30:00Z",
  "updatedAt": "2025-11-12T10:30:00Z"
}
```

### Example 2: Search DJ Profiles

**Request:**
```http
GET /api/profiles/djs/search?city=Berlin&minRate=200&maxRate=500&styles=traditional&equipmentType=own
```

**Response:**
```json
[
  {
    "id": 15,
    "userId": 456,
    "user": {
      "id": 456,
      "name": "Carlos DJ",
      "username": "carlos_dj",
      "profileImage": "https://cloudinary.com/...",
      "city": "Berlin",
      "country": "Germany"
    },
    "djName": "DJ Tango Maestro",
    "bio": "Professional tango DJ specializing in traditional Golden Age music...",
    "musicStyles": ["traditional", "vals", "milonga"],
    "yearsExperience": 10,
    "hasOwnEquipment": true,
    "eventRate": "300.00",
    "averageRating": 4.8,
    "reviewCount": 24,
    "isVerified": true
  },
  {
    "id": 28,
    "userId": 789,
    "user": {
      "id": 789,
      "name": "Elena Rodriguez",
      "username": "elena_dj",
      "profileImage": "https://cloudinary.com/...",
      "city": "Berlin",
      "country": "Germany"
    },
    "djName": "DJ Elena",
    "bio": "Passionate about traditional tango music with modern interpretations...",
    "musicStyles": ["traditional", "neo-tango"],
    "yearsExperience": 7,
    "hasOwnEquipment": true,
    "eventRate": "250.00",
    "averageRating": 4.6,
    "reviewCount": 18,
    "isVerified": true
  }
]
```

### Example 3: Upload Profile Photo

**Request:**
```http
POST /api/profiles/teacher/123/upload-photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="photo"; filename="profile.jpg"
Content-Type: image/jpeg

<binary image data>
--boundary
Content-Disposition: form-data; name="caption"

Teaching at Buenos Aires milonga 2025
--boundary
Content-Disposition: form-data; name="visibility"

public
--boundary--
```

**Response:**
```json
{
  "id": 567,
  "userId": 123,
  "profileType": "teacher",
  "mediaType": "photo",
  "url": "https://res.cloudinary.com/mundo-tango/teacher/photo_xyz.jpg",
  "cloudinaryPublicId": "teacher/photo_xyz",
  "caption": "Teaching at Buenos Aires milonga 2025",
  "displayOrder": 1,
  "visibility": "public",
  "createdAt": "2025-11-12T11:00:00Z"
}
```

### Example 4: Get Profile Analytics

**Request:**
```http
GET /api/profiles/123/analytics?period=month&days=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "period": 30,
  "summary": {
    "totalViews": 342,
    "uniqueVisitors": 256,
    "uniqueIps": 210,
    "uniqueUsers": 46
  },
  "viewsByTab": [
    { "profileType": "teacher", "count": 180 },
    { "profileType": "photos", "count": 85 },
    { "profileType": "about", "count": 45 },
    { "profileType": "feed", "count": 32 }
  ],
  "daily": [
    {
      "date": "2025-11-01",
      "totalViews": 15,
      "uniqueVisitors": 12
    },
    {
      "date": "2025-11-02",
      "totalViews": 18,
      "uniqueVisitors": 15
    }
    // ... 28 more days
  ],
  "weekly": [
    {
      "week": "2025-10-28",
      "totalViews": 85,
      "uniqueVisitors": 68
    }
    // ... more weeks
  ],
  "monthly": [
    {
      "month": "2025-11-01",
      "totalViews": 342,
      "uniqueVisitors": 256
    }
  ]
}
```

### Example 5: Update Profile Visibility

**Request:**
```http
PUT /api/users/123
Authorization: Bearer <token>
Content-Type: application/json

{
  "profileVisibility": "friends"
}
```

**Response:**
```json
{
  "id": 123,
  "username": "maria_tango",
  "name": "Maria Garcia",
  "profileVisibility": "friends",
  "updatedAt": "2025-11-12T12:00:00Z"
}
```

---

## Key Features Summary

✅ **23 Profile Types** - Base user + 17 professional + 6 user-centric  
✅ **100+ API Endpoints** - Full CRUD + search for all types  
✅ **Advanced Search** - Type-specific filters, location, ratings, price  
✅ **Media Management** - Photos, videos, portfolios with Cloudinary  
✅ **Analytics Tracking** - Views, visitors, tab navigation metrics  
✅ **Visibility Controls** - Public / Friends Only / Private  
✅ **Profile Completion** - Percentage tracking for better profiles  
✅ **Professional Verification** - Trust badges for verified pros  
✅ **Mobile Responsive** - All profile types work on mobile  
✅ **Test Coverage** - 41 E2E tests covering all scenarios  

---

## Next Steps for Development

1. **Additional Profile Types:** Add Event Planner, Translator, Equipment Rental
2. **Enhanced Search:** Add full-text search, geolocation radius search
3. **Profile Badges:** Achievement badges, certifications display
4. **Reviews & Ratings:** Enable users to review professional profiles
5. **Booking Integration:** Direct booking from professional profiles
6. **Social Proof:** Display recent bookings, testimonials
7. **Profile Comparison:** Compare multiple professionals side-by-side
8. **Recommended Profiles:** AI-powered profile recommendations
9. **Export Functionality:** Export profile data to PDF
10. **Multi-language:** Translate profiles into multiple languages

---

**Document Version:** 1.0.0  
**Last Updated:** November 12, 2025  
**Maintained By:** Mundo Tango Development Team  
**Contact:** For questions or clarifications, see `docs/handoff/README.md`
