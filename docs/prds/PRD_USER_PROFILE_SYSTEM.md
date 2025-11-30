# PRD: User Profile System

> **Version:** 1.1  
> **Created:** 2025-11-28  
> **Last Updated:** 2025-11-30  
> **Status:** Active  
> **Master Document:** This PRD is the central reference for all profile-related components

---

## 1. Purpose

The User Profile System is the central hub for user identity, professional portfolio, and social connections on the Mundo Tango platform. It provides a comprehensive, tabbed interface that displays personal information, tango experience, professional credentials, social content, travel plans, and networking capabilities.

This master PRD consolidates documentation for all profile components and serves as the authoritative reference for the 8 core profile tabs and their integration with other platform systems.

---

## 2. System Overview

### 2.1 Profile Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            USER PROFILE PAGE                                      │
│                            /profile/:id                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         PROFILE HEADER                                   │    │
│  │  ┌─────────┐ ┌──────────────────────────────────────────────────────┐   │    │
│  │  │ Avatar  │ │ Name, Username, Bio, Location, Social Links           │   │    │
│  │  │ Cover   │ │ Tango Roles, Experience, Languages                    │   │    │
│  │  │ Photo   │ │ [Follow] [Message] [Settings] [Dashboard/Customer]    │   │    │
│  │  └─────────┘ └──────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                          PROFILE TABS NAV                                │    │
│  │  [Feed] [Memories] [Travel] [Events] [Friends] [Photos] [About] [PRO]   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                          TAB CONTENT AREA                                │    │
│  │                                                                          │    │
│  │                  (Renders active tab component)                          │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Core Profile Tabs

| Tab | Component | Purpose | PRD Reference |
|-----|-----------|---------|---------------|
| **Feed** | `ProfileTabFeed.tsx` | User's posts and memories timeline | [PRD_UNIFIED_FEEDS_SYSTEM.md](./PRD_UNIFIED_FEEDS_SYSTEM.md) |
| **Memories** | `ProfileTabMemories.tsx` | Milestone events and tango journey | Memory System |
| **Travel** | `ProfileTabTravel.tsx` | Trip planning and travel history | [PRD_TRAVEL_PLANNING_SYSTEM.md](./PRD_TRAVEL_PLANNING_SYSTEM.md) |
| **Events** | `ProfileTabEvents.tsx` | Event participations and history | Events System |
| **Friends** | `ProfileTabFriends.tsx` | Social connections network | Friendship System |
| **Photos** | `ProfileTabPhotos.tsx` | Photo gallery with drag-drop reorder | Media System |
| **About** | `ProfileTabAbout.tsx` | Bio, location, roles, languages | [PRD_UNIFIED_LOCATION_PICKER.md](./PRD_UNIFIED_LOCATION_PICKER.md), [PRD_UNIFIED_LANGUAGE_SYSTEM.md](./PRD_UNIFIED_LANGUAGE_SYSTEM.md), [PRD_TANGO_ROLES_SYSTEM.md](./PRD_TANGO_ROLES_SYSTEM.md) |
| **PRO** | `ProfileTabPro.tsx` (Planned) | Professional portfolio (17 tabs → 1) | [PRD_UNIFIED_PRO_TAB.md](./PRD_UNIFIED_PRO_TAB.md) |

### 2.3 Legacy Role-Based Tabs (to be consolidated into PRO)

| Legacy Tab | Target Component | Status |
|------------|------------------|--------|
| `ProfileTabTeacher.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabDJ.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabPerformer.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabPhotographer.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabOrganizer.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabMusician.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabChoreographer.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabVendor.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabTangoSchool.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabTangoHotel.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabWellness.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabTourOperator.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabHostVenue.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabTangoGuide.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabContentCreator.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabLearningResource.tsx` | → ProfileTabPro.tsx | Pending |
| `ProfileTabTaxiDancer.tsx` | → ProfileTabPro.tsx | Pending |

---

## 3. Database Schema (Users Table)

### 3.1 Complete Schema Fields

```typescript
// From shared/schema.ts - users table
export const users = pgTable("users", {
  // ═══════════════════════════════════════════════════════════════════════
  // BASIC IDENTITY
  // ═══════════════════════════════════════════════════════════════════════
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  nickname: varchar("nickname"),
  mobileNo: varchar("mobile_no"),
  
  // ═══════════════════════════════════════════════════════════════════════
  // PROFILE IMAGES
  // ═══════════════════════════════════════════════════════════════════════
  profileImage: text("profile_image"),
  backgroundImage: text("background_image"),
  
  // ═══════════════════════════════════════════════════════════════════════
  // ABOUT SECTION
  // ═══════════════════════════════════════════════════════════════════════
  bio: text("bio"),
  occupation: varchar("occupation"),
  interests: text("interests").array(),
  
  // ═══════════════════════════════════════════════════════════════════════
  // LOCATION (About Tab + Maps Integration)
  // ═══════════════════════════════════════════════════════════════════════
  city: varchar("city"),
  country: varchar("country"),
  state: varchar("state"),
  countryCode: varchar("country_code"),
  stateCode: varchar("state_code"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  
  // ═══════════════════════════════════════════════════════════════════════
  // TANGO EXPERIENCE (About Tab + PRO Tab)
  // ═══════════════════════════════════════════════════════════════════════
  tangoRoles: text("tango_roles").array(),                    // ['teacher', 'dj', 'dancer-leader']
  tangoRoleExperience: jsonb("tango_role_experience")         // [{role: 'teacher', startYear: 2015}]
    .$type<{role: string, startYear: number}[]>(),
  tangoStartYear: integer("tango_start_year"),                // When first started tango
  leaderLevel: integer("leader_level").default(0),            // 0-10 skill level
  followerLevel: integer("follower_level").default(0),        // 0-10 skill level
  yearsOfDancing: integer("years_of_dancing").default(0),     // @deprecated - use tangoStartYear
  
  // ═══════════════════════════════════════════════════════════════════════
  // LANGUAGES (About Tab + i18n)
  // ═══════════════════════════════════════════════════════════════════════
  primaryLanguage: varchar("primary_language"),               // ISO 639-1 code (e.g., 'en', 'es')
  languages: text("languages").array(),                       // Additional languages ['fr', 'pt']
  
  // ═══════════════════════════════════════════════════════════════════════
  // SOCIAL & PORTFOLIO (About Tab)
  // ═══════════════════════════════════════════════════════════════════════
  socialLinks: jsonb("social_links"),                         // {instagram, facebook, twitter, linkedin, youtube, website}
  portfolioUrls: text("portfolio_urls").array(),              // Professional portfolio links
  communityWebsiteUrl: text("community_website_url"),         // User's tango community site
  facebookUrl: text("facebook_url"),                          // Legacy field
  customUrl: varchar("custom_url", { length: 100 }).unique(), // Custom profile URL slug
  
  // ═══════════════════════════════════════════════════════════════════════
  // VERIFICATION & BADGES
  // ═══════════════════════════════════════════════════════════════════════
  isVerified: boolean("is_verified").default(false),
  verificationBadge: boolean("verification_badge").default(false),
  
  // ═══════════════════════════════════════════════════════════════════════
  // ACCOUNT STATUS
  // ═══════════════════════════════════════════════════════════════════════
  isActive: boolean("is_active").default(true),
  suspended: boolean("suspended").default(false),
  role: varchar("role").default("user").notNull(),            // 'user' | 'admin' | 'moderator'
  
  // ═══════════════════════════════════════════════════════════════════════
  // SUBSCRIPTION (Premium Features)
  // ═══════════════════════════════════════════════════════════════════════
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status"),
  subscriptionTier: varchar("subscription_tier").default("free"),
  
  // ═══════════════════════════════════════════════════════════════════════
  // PRIVACY SETTINGS
  // ═══════════════════════════════════════════════════════════════════════
  privacySettings: jsonb("privacy_settings"),                 // Granular visibility controls
  availability: jsonb("availability"),                        // Booking availability schedule
  
  // ═══════════════════════════════════════════════════════════════════════
  // ONBOARDING & JOURNEY
  // ═══════════════════════════════════════════════════════════════════════
  formStatus: integer("form_status").default(0),
  isOnboardingComplete: boolean("is_onboarding_complete").default(false),
  codeOfConductAccepted: boolean("code_of_conduct_accepted").default(false),
  termsAccepted: boolean("terms_accepted").default(false),
  customerJourneyState: varchar("customer_journey_state").default("J1"),
  lastJourneyUpdate: timestamp("last_journey_update"),
  
  // ═══════════════════════════════════════════════════════════════════════
  // TIMESTAMPS
  // ═══════════════════════════════════════════════════════════════════════
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  lastLoginIp: varchar("last_login_ip"),
});
```

### 3.2 Field Categories by Tab

| Tab | Primary Fields | Secondary Fields |
|-----|----------------|------------------|
| **Header** | name, username, profileImage, backgroundImage | bio, city, country, tangoRoles |
| **About** | bio, city, country, occupation, interests | tangoRoles, tangoRoleExperience, tangoStartYear, leaderLevel, followerLevel |
| **About** (Languages) | primaryLanguage, languages | — |
| **About** (Social) | socialLinks, portfolioUrls, communityWebsiteUrl | facebookUrl, customUrl |
| **Feed** | (posts table) | userId reference |
| **Memories** | (memories table) | userId reference |
| **Travel** | (travelPlans table) | userId reference, city, country |
| **Events** | (eventParticipants table) | tangoRoles for role-based event participation |
| **Friends** | (friendships table) | userId reference |
| **Photos** | (profilePhotos table) | userId reference |
| **PRO** | tangoRoles, tangoRoleExperience | (eventParticipants for verified history) |

---

## 4. Core Tab Implementations

### 4.1 ProfileTabAbout

**Purpose:** Display and edit user's personal information, tango experience, and social links.

**Component:** `client/src/components/profile/ProfileTabAbout.tsx`

**Key Features:**
- Inline editing for own profile (bio, location, roles, languages)
- Location selection via UnifiedLocationPicker
- Language selection via UnifiedLanguagePicker
- Per-role experience tracking (start year per role)
- Skill level sliders (leader/follower 0-10)
- Social links display and editing

**Props Interface:**
```typescript
interface ProfileTabAboutProps {
  user: User;
  isOwnProfile: boolean;
}
```

**Editable Fields:**
| Field | Input Type | Component |
|-------|------------|-----------|
| bio | Textarea | Native textarea |
| city + country | Location picker | UnifiedLocationPicker |
| tangoRoles | Multi-select | Role selection grid |
| tangoRoleExperience | Year pickers | Per-role start year |
| leaderLevel, followerLevel | Slider | Radix UI Slider (0-10) |
| primaryLanguage | Single select | UnifiedLanguagePicker mode="primary" |
| languages | Multi-select | UnifiedLanguagePicker mode="additional" |

**Cross-Tab Data Flows:**
- `tangoRoles` → PRO Tab (determines which professional sections appear)
- `city, country` → Travel Tab (trip destination suggestions)
- `primaryLanguage` → i18n system (site language)
- `tangoRoles` → Talent Match recommendations

---

### 4.2 ProfileTabFeed

**Purpose:** Display user's posts and memories in a unified feed format.

**Component:** `client/src/components/profile/ProfileTabFeed.tsx`

**Integration:** Uses `UnifiedMemoriesFeed` component from the Unified Feeds System.

**Props Interface:**
```typescript
interface ProfileTabFeedProps {
  posts: Post[];
  isLoading: boolean;
  isOwnProfile: boolean;
  userId: number;
}
```

**Key Features:**
- Renders posts via UnifiedMemoriesFeed wrapper
- Context: `{ type: 'profile', id: userId }`
- PostCreator shown for own profile
- Edit/delete functionality for own posts

**Related PRD:** [PRD_UNIFIED_FEEDS_SYSTEM.md](./PRD_UNIFIED_FEEDS_SYSTEM.md)

---

### 4.3 ProfileTabMemories

**Purpose:** Display tango journey milestones and special memories.

**Component:** `client/src/components/profile/ProfileTabMemories.tsx`

**Props Interface:**
```typescript
interface ProfileTabMemoriesProps {
  isOwnProfile: boolean;
  profileId: number;
}
```

**Memory Types:**
| Type | Icon | Color | Description |
|------|------|-------|-------------|
| `milestone` | Award | Amber | Tango journey milestones |
| `event` | Calendar | Blue | Event participations |
| `photo` | Camera | Purple | Photo memories |
| `achievement` | Star | Green | Accomplishments |

**Stats Display:**
- Total Memories
- Events Attended
- Milestones
- This Year

**Key Features:**
- Memory type tabs (all, milestone, event, photo, achievement)
- Stats grid at top
- Timeline view of memories
- Add Memory button (own profile only)
- Motion animations via framer-motion

---

### 4.4 ProfileTabTravel

**Purpose:** Travel planning and trip management with AI-powered itinerary building.

**Component:** `client/src/components/profile/ProfileTabTravel.tsx`

**Props Interface:**
```typescript
interface ProfileTabTravelProps {
  profileId: number;
  isOwnProfile: boolean;
}
```

**Travel Plan Structure:**
```typescript
interface TravelPlan {
  id: number;
  tripName?: string;
  city: string;
  country?: string;
  startDate: string;
  endDate: string;
  tripDuration: number;
  status: string; // 'planning' | 'upcoming' | 'completed'
  notes?: string;
  items?: TravelPlanItem[];
}

interface TravelPlanItem {
  id: number;
  type: string; // 'event' | 'housing' | 'transport' | 'restaurant' | 'activity'
  title: string;
  description?: string;
  date?: string;
  location?: string;
  cost?: number;
  isBooked: boolean;
  linkedEventId?: number;
}
```

**Key Features:**
- AI Trip Planner integration
- City events discovery
- Housing search (MT Host listings)
- Transport planning
- Budget tracking
- Itinerary export

**Cross-Tab Data Flows:**
- Travel → Events (trip events linked via linkedEventId)
- Location (About) → Travel (destination suggestions)

---

### 4.5 ProfileTabEvents

**Purpose:** Display user's event participations, upcoming events, and manage RSVP status.

**Component:** `client/src/components/profile/ProfileTabEvents.tsx`

**Key Features:**
- Grid of event cards (2 columns on desktop)
- Event type badges
- Pricing display
- Date and venue information
- Event image display
- Host languages display
- **RSVP Mutation System** (Nov 29, 2025)

#### RSVP Mutation System

> **Architecture:** See [PRD_RSVP_ARCHITECTURE.md](./PRD_RSVP_ARCHITECTURE.md) for complete RSVP system documentation.

**Status States:**
| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| `going` | CheckCircle2 | Green (`text-green-500`) | User confirmed attendance |
| `maybe` | HelpCircle | Yellow (`text-yellow-500`) | User interested but uncertain |
| `not_going` | XCircle | Red (`text-red-500`) | User declined |
| `interested` | Star | Blue (`text-blue-500`) | Following event updates |
| `null` | Calendar | Muted | No RSVP yet |

**Implementation (Updated Nov 30, 2025):**
```typescript
// RSVP Hook - Now fetches ALL statuses by default (not just 'going')
export function useEventRSVPs(eventId: number | undefined, options?: { statusFilter?: string }) {
  const statusFilter = options?.statusFilter || 'all';
  
  return useQuery({
    queryKey: ['/api/events', eventId, 'attendees', { status: statusFilter }],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/attendees?status=${statusFilter}`);
      if (!res.ok) throw new Error('Failed to fetch attendees');
      return res.json();
    },
    enabled: !!eventId,
  });
}

// RSVP Mutation - With proper cache invalidation
export function useRSVPEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      return apiRequest("POST", `/api/events/${eventId}/rsvp`, { status });
    },
    onSuccess: (_, variables) => {
      // Invalidate all attendee queries for this event (all status filters)
      queryClient.invalidateQueries({ 
        queryKey: ['/api/events', variables.eventId, 'attendees'] 
      });
    }
  });
}
```

**Critical Fix (Nov 30, 2025):**
The backend endpoint `GET /api/events/:id/attendees` now supports `status=all` query parameter to return RSVPs of all statuses, not just 'going'. This fixes the bug where 'maybe' and 'not_going' RSVPs would disappear after page refresh.

**Dropdown UI:**
- All 3 options always visible (Going, Maybe, Not Going)
- Current status shown with checkmark
- Status-specific icons with colors
- Disabled during mutation pending

**Data Structure (API Response):**
```typescript
// GET /api/events/:id/attendees?status=all returns:
// Array of attendee objects with nested rsvp and user data
[
  {
    rsvp: {
      id: number;
      eventId: number;
      userId: number;
      status: 'going' | 'maybe' | 'not_going' | 'interested';
      createdAt: string;
      updatedAt: string;
    };
    user: {
      id: number;
      name: string;
      profileImage?: string;
    };
  }
]

// Query Parameters:
// - status=all (default): Returns all RSVPs regardless of status
// - status=going: Returns only confirmed attendees (for attendee lists)
// - status=maybe: Returns only 'maybe' responses
// - status=interested: Returns only users following the event
```

**Event Interface:**
```typescript
// Response from GET /api/users/:userId/events?status=going,maybe,interested
interface UserEventResponse {
  event: {
    id: number;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    venue?: string;
    city?: string;
    location: string;
    eventType: string;
    imageUrl?: string;
    maxAttendees?: number;
  };
  rsvpStatus: 'going' | 'maybe' | 'not_going' | 'interested';
  _count: number;
}
```

> **Note (Nov 30, 2025):** The `hostLanguages` field was removed from the API response as it doesn't exist in the events schema. The endpoint now returns only valid schema columns.

**Cross-Tab Data Flows:**
- Events → PRO Tab (verified event participations)
- Events → Memories (event memories auto-created)
- Travel → Events (trip-linked events)
- RSVP Status → Event Attendees list

---

### 4.6 ProfileTabPhotos

**Purpose:** Photo gallery with multi-upload and drag-drop reordering.

**Component:** `client/src/components/profile/ProfileTabPhotos.tsx`

**Key Features:**
- 6 photo slots (maximum)
- Multi-file selection and batch upload
- Immediate thumbnail preview before upload
- Circular progress indicators during upload
- Drag-and-drop reordering (react-beautiful-dnd)
- Client-side image compression
- Database persistence

**Photo Slot States:**
| Status | Description |
|--------|-------------|
| `empty` | Slot available for upload |
| `preview` | File selected, not yet uploaded |
| `uploading` | Upload in progress with % indicator |
| `uploaded` | Successfully saved to database |

**API Integration:**
- `GET /api/profile/photos` - Fetch existing photos
- `POST /api/profile/photos` - Upload new photo
- `PATCH /api/profile/photos/reorder` - Update photo order
- `DELETE /api/profile/photos/:id` - Delete photo

---

### 4.7 ProfileTabFriends

**Purpose:** Display user's social connections and friendship network.

**Component:** `client/src/components/profile/ProfileTabFriends.tsx`

**Current Status:** Basic placeholder component (pending full implementation)

**Planned Features:**
- Friends list with avatars
- Mutual friends display
- Friendship status (friend, pending, none)
- Friend search
- Friend suggestions

---

### 4.8 ProfileTabPro (Unified Professional Tab)

**Purpose:** Consolidated professional portfolio for all 17 role-based tabs.

**Component:** `client/src/components/profile/ProfileTabPro.tsx` (Planned)

**Consolidates These Components:**
- ProfileTabTeacher, ProfileTabDJ, ProfileTabPerformer
- ProfileTabPhotographer, ProfileTabOrganizer, ProfileTabMusician
- ProfileTabChoreographer, ProfileTabVendor, ProfileTabTangoSchool
- ProfileTabTangoHotel, ProfileTabWellness, ProfileTabTourOperator
- ProfileTabHostVenue, ProfileTabTangoGuide, ProfileTabContentCreator
- ProfileTabLearningResource, ProfileTabTaxiDancer

**Key Features:**
- Dynamic role switching based on user's tangoRoles
- Integrated event history (verified participations)
- Role-specific statistics
- Portfolio items per role
- Booking request management
- Reviews and ratings

**Related PRD:** [PRD_UNIFIED_PRO_TAB.md](./PRD_UNIFIED_PRO_TAB.md)

---

## 5. Cross-Tab Data Flows

### 5.1 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           USER PROFILE DATA FLOWS                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│    ┌────────────┐          ┌────────────┐          ┌────────────┐              │
│    │   ABOUT    │◄────────►│    PRO     │◄────────►│   EVENTS   │              │
│    │    TAB     │          │    TAB     │          │    TAB     │              │
│    └─────┬──────┘          └─────┬──────┘          └─────┬──────┘              │
│          │                       │                       │                       │
│          │ tangoRoles            │ eventParticipants     │                       │
│          │ tangoRoleExperience   │ (verified history)    │                       │
│          │                       │                       │                       │
│          ▼                       ▼                       ▼                       │
│    ┌─────────────────────────────────────────────────────────────────┐          │
│    │                      users TABLE                                  │          │
│    │  tangoRoles[], tangoRoleExperience[], city, country, languages   │          │
│    └─────────────────────────────────────────────────────────────────┘          │
│          │                       │                       │                       │
│          │                       │                       │                       │
│          ▼                       ▼                       ▼                       │
│    ┌────────────┐          ┌────────────┐          ┌────────────┐              │
│    │   TRAVEL   │◄────────►│  MEMORIES  │◄────────►│    FEED    │              │
│    │    TAB     │          │    TAB     │          │    TAB     │              │
│    └────────────┘          └────────────┘          └────────────┘              │
│          │                       │                       │                       │
│          │ travelPlans           │ memories              │ posts                 │
│          │ → linkedEventId       │ → type='event'        │                       │
│          │                       │                       │                       │
│          └───────────────────────┴───────────────────────┘                       │
│                                  │                                               │
│                    ┌─────────────┴─────────────┐                                │
│                    │                           │                                │
│              ┌─────▼─────┐               ┌─────▼─────┐                          │
│              │  FRIENDS  │               │  PHOTOS   │                          │
│              │    TAB    │               │    TAB    │                          │
│              └───────────┘               └───────────┘                          │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Key Data Flow Relationships

| Source | Target | Data | Purpose |
|--------|--------|------|---------|
| About → PRO | tangoRoles | Determines which professional sections display |
| About → i18n | primaryLanguage | Sets site display language |
| About → Talent Match | tangoRoles, languages, city | Powers professional matching |
| PRO → Events | eventParticipants | Verified event history builds credibility |
| Travel → Events | linkedEventId | Links trip items to platform events |
| Events → Memories | Event participation | Auto-creates memory on event completion |
| Feed → Memories | posts with tags | Tagged posts appear in memories |
| Location → Travel | city, country | Suggests nearby destinations |
| Roles → Search | tangoRoles | Enables role-based user discovery |

---

## 6. API Endpoints

### 6.1 Profile CRUD

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/users/:id` | Fetch user profile by ID |
| `GET` | `/api/users/username/:username` | Fetch user profile by username |
| `PATCH` | `/api/users/me` | Update own profile fields |
| `POST` | `/api/profile/photo` | Upload profile image |
| `POST` | `/api/profile/cover` | Upload cover/background image |

### 6.2 Profile Photos

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/profile/photos` | Get profile photo gallery |
| `POST` | `/api/profile/photos` | Upload gallery photo |
| `PATCH` | `/api/profile/photos/reorder` | Reorder photos |
| `DELETE` | `/api/profile/photos/:id` | Delete photo |

### 6.3 Posts (Feed Tab)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/posts/user/:userId` | Get user's posts |
| `POST` | `/api/posts` | Create new post |
| `PATCH` | `/api/posts/:id` | Edit post |
| `DELETE` | `/api/posts/:id` | Delete post |

### 6.4 Memories

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/memories?userId=:id` | Get user's memories |
| `GET` | `/api/memories/stats?userId=:id` | Get memory statistics |
| `POST` | `/api/memories` | Create memory |
| `PATCH` | `/api/memories/:id` | Edit memory |
| `DELETE` | `/api/memories/:id` | Delete memory |

### 6.5 Travel

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/travel/plans?userId=:id` | Get travel plans |
| `POST` | `/api/travel/plans` | Create travel plan |
| `PATCH` | `/api/travel/plans/:id` | Update travel plan |
| `DELETE` | `/api/travel/plans/:id` | Delete travel plan |
| `POST` | `/api/travel/plans/:id/items` | Add item to plan |

### 6.6 Friendships

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/friendships` | Get friends list |
| `POST` | `/api/friendships/request/:userId` | Send friend request |
| `POST` | `/api/friendships/accept/:userId` | Accept request |
| `DELETE` | `/api/friendships/:userId` | Remove friend |

### 6.7 PRO Tab (Planned)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/users/:id/pro-stats` | Professional statistics by role |
| `GET` | `/api/users/:id/event-history` | Event participation history |
| `GET` | `/api/users/:id/booking-requests` | Pending booking requests |
| `POST` | `/api/booking-requests` | Create booking request |
| `PATCH` | `/api/booking-requests/:id` | Accept/decline request |

---

## 7. Core Component Files

### 7.1 Main Profile System

| File | Purpose | Lines |
|------|---------|-------|
| `client/src/pages/ProfilePage.tsx` | Main profile page container | ~1108 |
| `client/src/components/ProfileTabsNav.tsx` | Tab navigation component | ~150 |
| `client/src/components/profile/DashboardCustomerToggle.tsx` | View mode switcher | ~50 |

### 7.2 Profile Tab Components

| File | Purpose | Lines |
|------|---------|-------|
| `client/src/components/profile/ProfileTabAbout.tsx` | About section with editing | ~500 |
| `client/src/components/profile/ProfileTabFeed.tsx` | Post feed via UnifiedMemoriesFeed | ~50 |
| `client/src/components/profile/ProfileTabMemories.tsx` | Memories timeline | ~297 |
| `client/src/components/profile/ProfileTabTravel.tsx` | Travel planning | ~800 |
| `client/src/components/profile/ProfileTabEvents.tsx` | Event participations | ~152 |
| `client/src/components/profile/ProfileTabPhotos.tsx` | Photo gallery | ~400 |
| `client/src/components/profile/ProfileTabFriends.tsx` | Friends list | ~30 (stub) |

### 7.3 Legacy Role Tabs (17 files, pending consolidation)

| File | Target Role |
|------|-------------|
| `ProfileTabTeacher.tsx` | Teacher |
| `ProfileTabDJ.tsx` | DJ |
| `ProfileTabPerformer.tsx` | Performer |
| `ProfileTabPhotographer.tsx` | Photographer |
| `ProfileTabOrganizer.tsx` | Organizer |
| `ProfileTabMusician.tsx` | Musician |
| `ProfileTabChoreographer.tsx` | Choreographer |
| `ProfileTabVendor.tsx` | Vendor/Business |
| `ProfileTabTangoSchool.tsx` | Tango School |
| `ProfileTabTangoHotel.tsx` | Tango Hotel |
| `ProfileTabWellness.tsx` | Wellness Provider |
| `ProfileTabTourOperator.tsx` | Tour Operator |
| `ProfileTabHostVenue.tsx` | Host/Venue |
| `ProfileTabTangoGuide.tsx` | Tango Guide |
| `ProfileTabContentCreator.tsx` | Content Creator |
| `ProfileTabLearningResource.tsx` | Learning Resource |
| `ProfileTabTaxiDancer.tsx` | Taxi Dancer |

### 7.4 Shared Dependencies

| File | Purpose |
|------|---------|
| `client/src/lib/tangoRoles.ts` | Tango role definitions (19 roles) |
| `shared/utils/roleExperience.ts` | Per-role experience calculations |
| `client/src/components/input/UnifiedLocationPicker.tsx` | Location selection |
| `client/src/components/input/UnifiedLanguagePicker.tsx` | Language selection |
| `client/src/components/UserRoleBadges.tsx` | Role badge display |
| `client/src/components/feed/UnifiedMemoriesFeed.tsx` | Feed display wrapper |

---

## 8. Integration Points

### 8.1 Onboarding Flow

The profile system integrates with the 5-step onboarding process:

| Step | Data Collected | Profile Field |
|------|----------------|---------------|
| 1 | Basic info | name, email |
| 2 | Location | city, country |
| 3 | Tango roles | tangoRoles |
| 4 | Languages | primaryLanguage, languages |
| 5 | Profile details | bio, profileImage |

### 8.2 i18n System

- `primaryLanguage` syncs with i18next for site language
- `UnifiedLanguagePicker` with `syncI18n=true` immediately updates UI language
- Language changes persist to localStorage and database

### 8.3 Talent Match System

Uses profile data for professional matching:
- `tangoRoles` (filter by role)
- `city, country` (geographic matching)
- `languages` (language compatibility)
- `tangoRoleExperience` (experience level)

### 8.4 Events System

Bidirectional integration:
- Events → Profile (participations appear in Events tab)
- Profile roles → Events (determines participant role options)
- Event completion → Memories (auto-creates milestone memory)

### 8.5 Map System

Location data powers map features:
- `latitude, longitude` for precise positioning
- `city, country` for search and filtering
- Integration with UnifiedLocationPicker for geocoding

---

## 9. View Modes

### 9.1 Dashboard vs Customer Toggle

Professional users see a toggle between two view modes:

| Mode | Audience | Features |
|------|----------|----------|
| **Dashboard** | Profile owner | Stats, management, booking requests, editing |
| **Customer** | Public visitors | Portfolio view, reviews, booking CTA |

**Component:** `DashboardCustomerToggle.tsx`

```typescript
interface DashboardCustomerToggleProps {
  viewMode: 'dashboard' | 'customer';
  onViewModeChange: (mode: 'dashboard' | 'customer') => void;
}
```

### 9.2 Own Profile vs Other Profile

| Context | Features Shown |
|---------|----------------|
| **Own Profile** | Edit buttons, dashboard view, private stats |
| **Other Profile** | Public-only data, follow/message buttons, booking CTA |

Detection: `isOwnProfile = currentUser?.id === profileUser.id`

---

## 10. Cross-References

### 10.1 Related PRDs

| PRD | Relationship |
|-----|--------------|
| [PRD_UNIFIED_FEEDS_SYSTEM.md](./PRD_UNIFIED_FEEDS_SYSTEM.md) | Feed tab uses UnifiedMemoriesFeed |
| [PRD_UNIFIED_LOCATION_PICKER.md](./PRD_UNIFIED_LOCATION_PICKER.md) | About tab location selection |
| [PRD_UNIFIED_LANGUAGE_SYSTEM.md](./PRD_UNIFIED_LANGUAGE_SYSTEM.md) | About tab language selection |
| [PRD_TANGO_ROLES_SYSTEM.md](./PRD_TANGO_ROLES_SYSTEM.md) | Role definitions and display |
| [PRD_UNIFIED_PRO_TAB.md](./PRD_UNIFIED_PRO_TAB.md) | Consolidates 17 role tabs |
| [PRD_PER_ROLE_EXPERIENCE.md](./PRD_PER_ROLE_EXPERIENCE.md) | Per-role experience tracking |
| [PRD_LOCATION_CHANGE_CASCADE.md](./PRD_LOCATION_CHANGE_CASCADE.md) | Location change effects |

### 10.2 Related Routes

| Route | Page | Profile Integration |
|-------|------|---------------------|
| `/profile/:id` | ProfilePage | Main profile display |
| `/profile/:id?tab=about` | ProfileTabAbout | About section |
| `/profile/:id?tab=feed` | ProfileTabFeed | User posts |
| `/settings` | SettingsPage | Extended profile editing |
| `/onboarding/*` | Onboarding flow | Initial profile setup |

---

## 11. Future Considerations

### 11.1 Planned Improvements

1. **PRO Tab Consolidation**: Replace 17 role tabs with unified ProfileTabPro.tsx
2. **Friends Tab Enhancement**: Full implementation with friend suggestions
3. **Photo Gallery 2.0**: Video support, captions, tagging
4. **Privacy Controls**: Granular per-field visibility settings
5. **Profile Analytics**: View counts, engagement metrics
6. **Verification System**: Badge verification for professional roles

### 11.2 Known Limitations

- Maximum 6 photos in gallery (UI constraint)
- Profile URL limited to 100 characters
- No real-time profile view notifications
- Legacy role data requires migration for full experience tracking

### 11.3 Migration Notes

- Legacy `yearsOfDancing` field deprecated; use `tangoStartYear` + `tangoRoleExperience`
- Old role values auto-map via `getRoleByValueWithLegacy()` in tangoRoles.ts
- Facebook URL field migrated to `socialLinks.facebook`

---

## 12. Appendix: Complete Tab Routing

```typescript
// From ProfilePage.tsx - Tab rendering logic
const renderTabContent = () => {
  switch (activeTab) {
    case 'feed':
      return <ProfileTabFeed posts={posts} isLoading={postsLoading} isOwnProfile={isOwnProfile} userId={user.id} />;
    case 'memories':
      return <ProfileTabMemories isOwnProfile={isOwnProfile} profileId={user.id} />;
    case 'travel':
      return <ProfileTabTravel profileId={user.id} isOwnProfile={isOwnProfile} />;
    case 'events':
      return <ProfileTabEvents />;
    case 'friends':
      return <ProfileTabFriends />;
    case 'photos':
      return <ProfileTabPhotos />;
    case 'about':
      return <ProfileTabAbout user={user} isOwnProfile={isOwnProfile} />;
    // Role-specific tabs (to be consolidated into PRO)
    case 'teacher':
      return <ProfileTabTeacher isOwnProfile={isOwnProfile} viewMode={viewMode} />;
    case 'dj':
      return <ProfileTabDJ isOwnProfile={isOwnProfile} viewMode={viewMode} />;
    // ... 15 more role tabs ...
    default:
      return null;
  }
};
```
