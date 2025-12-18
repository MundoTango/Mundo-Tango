# PRD: Location Change Cascade System

> **Version:** 2.0  
> **Created:** 2025-11-28  
> **Updated:** 2025-11-28  
> **Status:** Active  

---

## 1. Purpose

The **Location Change Cascade System** is a unified mechanism that triggers multiple effects when a user changes their location (city/country). When a user updates their location—whether during onboarding or from profile settings—the system automatically:

- Auto-joins the user to the relevant city group
- Counts nearby dancers and venues
- Fetches upcoming local events
- Creates a welcome notification with navigation link
- Invalidates relevant caches to refresh data
- Displays a welcome modal with local community statistics

This ensures users immediately feel connected to their new tango community upon relocating.

**Related System:** The [PRO Group Cascade](#12-pro-group-cascade-system) extends this pattern for tango role changes.

---

## 2. Problem Solved

**Before the Location Change Cascade existed:**
- Location updates during **onboarding** triggered welcome effects and auto-join city groups
- Location updates via **profile edit** simply saved to the database silently
- Users who moved cities had to manually:
  - Find and join their new city's tango group
  - Search for local events
  - Discover nearby dancers and venues
- No cache invalidation meant stale data displayed for groups/events/feed
- No unified experience between onboarding and profile editing flows
- No feedback to users about their new community stats

**After implementing the Location Change Cascade:**
- **Consistent experience** whether location changes in onboarding or profile settings
- **Automatic city group membership** - users are added to their city's tango group
- **Instant community stats** - nearby dancers, venues, and events displayed
- **Comprehensive cache invalidation** - fresh data for groups, events, feed, notifications
- **Welcome notification** persisted with direct navigation link to new group
- **Beautiful welcome modal** showing community statistics and quick actions

---

## 3. Technical Implementation

### 3.1 Core Files

| File | Purpose |
|------|---------|
| `client/src/lib/locationChangeEffects.ts` | Core cascade logic, API calls, cache invalidation |
| `client/src/lib/roleChangeEffects.ts` | PRO group cascade logic for role changes |
| `client/src/hooks/useLocationChange.ts` | React hook for easy integration in components |
| `client/src/components/location/LocationChangeWelcome.tsx` | Welcome modal UI component |
| `client/src/components/profile/ProfileTabAbout.tsx` | Profile integration triggering both cascades |
| `server/routes/location-change-routes.ts` | Backend API endpoint for location cascade effects |
| `server/routes/role-change-routes.ts` | Backend API endpoint for PRO group cascade effects |
| `server/storage.ts` | Database helpers (`countUsersByCity`, `countVenuesByCity`) |

### 3.2 Key Interfaces/Types

```typescript
// Event data passed when location changes
export interface LocationChangeEvent {
  previousCity?: string;
  previousCountry?: string;
  newCity: string;
  newCountry: string;
  userId: number;
  timestamp: Date;
}

// Effects returned from the cascade
export interface LocationChangeEffects {
  autoJoinedGroup?: { 
    groupId: number; 
    groupName: string; 
    memberCount?: number;
    alreadyMember?: boolean;
  };
  suggestedGroups?: Array<{ 
    id: number; 
    name: string; 
    city?: string;
    memberCount: number;
  }>;
  localEvents?: Array<{ 
    id: number; 
    title: string; 
    date: string;
    city?: string;
    eventType?: string;
  }>;
  nearbyDancers?: number;
  nearbyVenues?: number;
  welcomeMessage?: string;
}
```

### 3.3 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     USER CHANGES LOCATION                                │
│            (Profile Edit or Onboarding Flow)                            │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   detectLocationChange()                                 │
│     Compare previous city/country with new values                       │
│     Returns true if either changed                                      │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ Location Changed?
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                triggerLocationChangeEffects()                            │
│                                                                          │
│  1. POST /api/location/change-effects                                   │
│  2. Invalidate caches:                                                  │
│     - /api/groups                                                       │
│     - /api/events                                                       │
│     - /api/feed                                                         │
│     - /api/notifications                                                │
│     - /api/users/me                                                     │
│  3. Return LocationChangeEffects                                        │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   BACKEND PROCESSING                                     │
│   POST /api/location/change-effects                                     │
│                                                                          │
│   1. Find city group → Auto-join user                                   │
│   2. Query suggested groups in country                                  │
│   3. Fetch local events (limit 5)                                       │
│   4. countUsersByCity() → nearby dancers                                │
│   5. countVenuesByCity() → nearby venues                                │
│   6. Create welcome notification with actionUrl                         │
│   7. Return consolidated effects                                        │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   UI FEEDBACK                                            │
│                                                                          │
│   Option A: Toast notification with welcome message                     │
│   Option B: LocationChangeWelcome modal with full stats                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Core Functions

#### `triggerLocationChangeEffects(event: LocationChangeEvent)`
Main function that orchestrates the cascade:
```typescript
export async function triggerLocationChangeEffects(
  event: LocationChangeEvent
): Promise<LocationChangeEffects> {
  // 1. Call backend API
  const response = await fetch('/api/location/change-effects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      previousCity: event.previousCity,
      previousCountry: event.previousCountry,
      newCity: event.newCity,
      newCountry: event.newCountry,
    }),
  });

  // 2. Invalidate all relevant caches
  queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
  queryClient.invalidateQueries({ queryKey: ['/api/events'] });
  queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
  queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });

  return effects;
}
```

#### `detectLocationChange(oldProfile, newCity, newCountry)`
Helper to determine if location actually changed:
```typescript
export function detectLocationChange(
  oldProfile: { city?: string; country?: string } | null,
  newCity: string,
  newCountry: string
): boolean {
  if (!oldProfile) return true;
  const cityChanged = oldProfile.city !== newCity;
  const countryChanged = oldProfile.country !== newCountry;
  return cityChanged || countryChanged;
}
```

#### `formatWelcomeMessage(effects, cityName)`
Creates user-friendly welcome message:
```typescript
export function formatWelcomeMessage(
  effects: LocationChangeEffects, 
  cityName: string
): string {
  const parts: string[] = [`Welcome to ${cityName}!`];
  
  if (effects.autoJoinedGroup) {
    parts.push(`You've been added to "${effects.autoJoinedGroup.groupName}".`);
  }
  if (effects.nearbyDancers && effects.nearbyDancers > 0) {
    parts.push(`${effects.nearbyDancers} dancers are in your area.`);
  }
  if (effects.localEvents && effects.localEvents.length > 0) {
    parts.push(`${effects.localEvents.length} upcoming events nearby.`);
  }
  
  return parts.join(' ');
}
```

### 3.5 Storage Layer

```typescript
// Count active users in a city
async countUsersByCity(city: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(
      ilike(users.city, city),
      eq(users.isActive, true)
    ));
  return result[0]?.count || 0;
}

// Count venues in a city
async countVenuesByCity(city: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(venues)
    .where(ilike(venues.city, city));
  return result[0]?.count || 0;
}
```

---

## 4. Cascade Effects (Complete List)

| Effect | Description | Backend Action |
|--------|-------------|----------------|
| **Auto-join City Group** | User automatically joins their city's tango group | `storage.joinGroup()` - handles already-member case gracefully |
| **Suggested Groups** | List of other groups in the same country | Query groups by country, limit 5 |
| **Local Events** | Upcoming events in the new city | `storage.getEvents({ city, limit: 5 })` |
| **Nearby Dancers** | Count of active users in the city | `storage.countUsersByCity()` |
| **Nearby Venues** | Count of venues in the city | `storage.countVenuesByCity()` |
| **Welcome Notification** | Persistent notification with actionUrl for direct navigation | `storage.createNotification()` with type `location_change` |
| **Cache Invalidation** | Refresh stale data across the app | Invalidates 5 query keys on frontend |

---

## 5. Notification Navigation Links

Location change notifications include an `actionUrl` that allows users to navigate directly to their new city group when clicking the notification.

### 5.1 actionUrl Implementation

```typescript
// In server/routes/location-change-routes.ts
await storage.createNotification({
  userId,
  type: "location_change",
  title: `Welcome to ${newCity}!`,
  message: `You're now connected with the ${newCity} tango community.`,
  data: { city: newCity, country: newCountry, previousCity, previousCountry },
  actionUrl: autoJoinedGroup 
    ? `/groups/${autoJoinedGroup.groupId}` 
    : `/groups?city=${encodeURIComponent(newCity)}`,
});
```

### 5.2 Navigation Behavior

| Scenario | actionUrl | User Experience |
|----------|-----------|-----------------|
| City group exists and user joined | `/groups/{groupId}` | Direct navigation to city group page |
| City group created during cascade | `/groups/{groupId}` | Direct navigation to newly created group |
| No city group found | `/groups?city={cityName}` | Navigate to groups with city filter |

### 5.3 Frontend Notification Click Handler

When a user clicks a notification with an `actionUrl`:
1. The notification is marked as read
2. User is navigated to the specified URL
3. For city groups: User lands directly on their new community group page

---

## 6. Group Cover Images

The cascade system automatically assigns appropriate cover images to groups based on their type.

### 6.1 City Group Images (Cityscape)

City groups receive cityscape images from major tango cities around the world:

```typescript
// In server/routes/location-change-routes.ts
const CITYSCAPE_IMAGES: Record<string, string> = {
  'buenos aires': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80',
  'new york': 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  'barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  'berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80',
  'san francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
  'los angeles': 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800&q=80',
  'miami': 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800&q=80',
  'sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
  'melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&q=80',
  'amsterdam': 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=800&q=80',
  'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  'madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
  'lisbon': 'https://images.unsplash.com/photo-1536663815808-535e2280d2c2?w=800&q=80',
  'montevideo': 'https://images.unsplash.com/photo-1597376537717-c99e19cd0b0e?w=800&q=80',
  'mexico city': 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&q=80',
  'chicago': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&q=80',
  'toronto': 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&q=80',
};

const DEFAULT_CITYSCAPE = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80';

function getCityscapeImage(cityName: string): string {
  const normalizedCity = cityName.toLowerCase().trim();
  return CITYSCAPE_IMAGES[normalizedCity] || DEFAULT_CITYSCAPE;
}
```

### 6.2 PRO Group Images (Role-Appropriate)

PRO groups receive images appropriate to each professional role:

```typescript
// In server/routes/role-change-routes.ts
const PRO_ROLE_IMAGES: Record<string, string> = {
  'leader': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
  'follower': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
  'teacher': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  'student': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  'dj': 'https://images.unsplash.com/photo-1571266028243-d220c6a8b0c5?w=800&q=80',
  'musician': 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
  'organizer': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'performer': 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80',
  'photographer': 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80',
  'videographer': 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80',
  'venue-owner': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'promoter': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'instructor': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  'host': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'choreographer': 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80',
  'historian': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
  'journalist': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
  'designer': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
  'vendor': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
};

const DEFAULT_PRO_GROUP_IMAGE = 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80';

function getPROGroupImage(role: string): string {
  return PRO_ROLE_IMAGES[role] || DEFAULT_PRO_GROUP_IMAGE;
}
```

### 6.3 Image Assignment Flow

When a new group is created during cascade:

```typescript
// City group creation
const [newGroup] = await db.insert(groups).values({
  name: newCity,
  slug: `city-${slug}-${Date.now()}`,
  type: 'city',
  coverImage: getCityscapeImage(newCity),  // Cityscape image
  // ... other fields
}).returning();

// PRO group creation
const [newGroup] = await db.insert(groups).values({
  name: mapping.name,
  slug: mapping.slug,
  type: 'role',
  coverImage: getPROGroupImage(role),  // Role-appropriate image
  // ... other fields
}).returning();
```

---

## 7. Files Using This System

| File | Usage Context |
|------|---------------|
| `client/src/components/profile/ProfileTabAbout.tsx` | Triggers cascade when user edits their city or roles in profile settings |
| `client/src/lib/locationChangeEffects.ts` | Core location cascade logic |
| `client/src/lib/roleChangeEffects.ts` | Core PRO group cascade logic |
| `client/src/components/location/LocationChangeWelcome.tsx` | Displays welcome modal with community stats and quick actions |
| `server/routes.ts` | Registers routes: `app.use("/api/location", locationChangeRoutes)` and `app.use("/api/roles", roleChangeRoutes)` |

---

## 8. API Endpoints

### 8.1 Location Change Endpoint

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/location/change-effects` | POST | Main cascade endpoint - processes all location effects |

#### Request Body
```json
{
  "previousCity": "New York",
  "previousCountry": "United States",
  "newCity": "Buenos Aires",
  "newCountry": "Argentina"
}
```

#### Response Body
```json
{
  "autoJoinedGroup": {
    "groupId": 42,
    "groupName": "Buenos Aires Tangueros",
    "memberCount": 156
  },
  "suggestedGroups": [
    { "id": 43, "name": "Milongueros Argentina", "memberCount": 89 }
  ],
  "localEvents": [
    { "id": 101, "title": "Friday Milonga", "date": "2025-11-29" }
  ],
  "nearbyDancers": 234,
  "nearbyVenues": 18,
  "welcomeMessage": "Welcome to Buenos Aires! Connect with local dancers..."
}
```

### 8.2 Role Change Endpoint

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/roles/change-effects` | POST | PRO group cascade - auto-join professional groups |

#### Request Body
```json
{
  "previousRoles": ["leader"],
  "newRoles": ["leader", "teacher", "dj"]
}
```

#### Response Body
```json
{
  "addedRoles": ["teacher", "dj"],
  "removedRoles": [],
  "autoJoinedGroups": [
    { "groupId": 101, "groupName": "Tango Teachers Worldwide", "role": "teacher", "memberCount": 45 },
    { "groupId": 102, "groupName": "Tango DJs Network", "role": "dj", "memberCount": 32 }
  ],
  "createdGroups": [],
  "message": "You've joined 2 professional groups!"
}
```

---

## 9. Integration Points

### 9.1 Profile Edit Flow (Location)
```typescript
// In ProfileTabAbout.tsx
const handleSave = async () => {
  // After profile update succeeds...
  if (detectLocationChange(previousProfile, newCity, newCountry)) {
    const event: LocationChangeEvent = {
      previousCity: previousProfile?.city,
      previousCountry: previousProfile?.country,
      newCity,
      newCountry,
      userId: user.id,
      timestamp: new Date(),
    };
    const effects = await triggerLocationChangeEffects(event);
    // Show welcome toast with effects
  }
};
```

### 9.2 Profile Edit Flow (Roles)
```typescript
// In ProfileTabAbout.tsx
const handleRoleSave = async () => {
  // After role update succeeds...
  const effects = await triggerRoleChangeEffects({
    previousRoles: previousProfile?.tangoRoles || [],
    newRoles: selectedRoles,
  });
  
  if (effects.autoJoinedGroups.length > 0) {
    toast({
      title: "Professional Groups",
      description: effects.message,
    });
  }
};
```

### 9.3 Notifications System (with actionUrl)
The cascade creates a persistent notification with navigation:
```typescript
await storage.createNotification({
  userId,
  type: "location_change",
  title: `Welcome to ${newCity}!`,
  message: `You're now connected with the ${newCity} tango community.`,
  data: { city: newCity, country: newCountry, previousCity, previousCountry },
  actionUrl: autoJoinedGroup ? `/groups/${autoJoinedGroup.groupId}` : `/groups?city=${encodeURIComponent(newCity)}`,
});
```

### 9.4 Groups System
Auto-join logic with graceful handling:
```typescript
try {
  await storage.joinGroup(group.id, userId);
  // User successfully added to city group
} catch (joinError) {
  if (joinError?.message?.includes("already") || joinError?.code === "23505") {
    // User already a member - not an error
    autoJoinedGroup = { ...group, alreadyMember: true };
  }
}
```

### 9.5 Query Invalidation Pattern
Ensures fresh data across the app:
```typescript
queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
queryClient.invalidateQueries({ queryKey: ['/api/events'] });
queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
```

---

## 10. Cross-References

### Related PRDs
| PRD | Relationship |
|-----|--------------|
| [PRD_UNIFIED_LOCATION_PICKER.md](./PRD_UNIFIED_LOCATION_PICKER.md) | Location input component that captures city/country changes |
| [PRD_TANGO_ROLES_SYSTEM.md](./PRD_TANGO_ROLES_SYSTEM.md) | Profile system that triggers location and role changes |

### Related Systems
- **UnifiedLocationPicker** - Provides the UI for selecting new location
- **Profile System** - Consumer of cascade on profile edit
- **Groups/Communities** - Receives auto-join members (city and PRO groups)
- **Notifications System** - Receives welcome notifications with actionUrl
- **Events System** - Queried for local events
- **Query Invalidation** - TanStack Query cache management

---

## 11. Usage Examples

### Example 1: Using in Profile Component
```typescript
import { 
  triggerLocationChangeEffects, 
  detectLocationChange, 
  formatWelcomeMessage 
} from '@/lib/locationChangeEffects';

const handleLocationUpdate = async (newCity: string, newCountry: string) => {
  // Save to database first
  await updateProfile({ city: newCity, country: newCountry });
  
  // Check if location actually changed
  if (detectLocationChange(previousProfile, newCity, newCountry)) {
    const effects = await triggerLocationChangeEffects({
      previousCity: previousProfile?.city,
      previousCountry: previousProfile?.country,
      newCity,
      newCountry,
      userId: currentUser.id,
      timestamp: new Date(),
    });
    
    toast({
      title: "Location Updated",
      description: formatWelcomeMessage(effects, newCity),
    });
  }
};
```

### Example 2: Using the Hook
```typescript
import { useLocationChange } from '@/hooks/useLocationChange';

function ProfilePage({ user }) {
  const { 
    isProcessing, 
    lastEffects, 
    checkAndTriggerEffects 
  } = useLocationChange({ 
    userId: user.id,
    onEffectsTriggered: (effects) => {
      // Optional callback when effects complete
      console.log('Location effects:', effects);
    }
  });

  const handleCityChange = async (city: string, country: string) => {
    const effects = await checkAndTriggerEffects(city, country);
    if (effects) {
      // Show welcome modal
      setShowWelcomeModal(true);
    }
  };
}
```

### Example 3: Displaying Welcome Modal
```typescript
import { LocationChangeWelcome } from '@/components/location/LocationChangeWelcome';

function ProfileSettings() {
  const [effects, setEffects] = useState<LocationChangeEffects | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  return (
    <>
      {/* Profile form... */}
      
      {effects && (
        <LocationChangeWelcome
          effects={effects}
          cityName={currentCity}
          isOpen={showWelcome}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </>
  );
}
```

### Example 4: Using Role Change Effects
```typescript
import { triggerRoleChangeEffects } from '@/lib/roleChangeEffects';

const handleRoleUpdate = async (newRoles: string[]) => {
  // Save roles to database first
  await updateProfile({ tangoRoles: newRoles });
  
  // Trigger PRO group cascade
  const effects = await triggerRoleChangeEffects({
    previousRoles: previousProfile?.tangoRoles || [],
    newRoles,
  });
  
  if (effects.autoJoinedGroups.length > 0) {
    toast({
      title: "Professional Networks",
      description: `You've joined ${effects.autoJoinedGroups.length} professional group(s)!`,
    });
  }
};
```

---

## 12. PRO Group Cascade System

The PRO Group Cascade extends the location change pattern to handle professional role changes. When a user selects tango roles (teacher, DJ, organizer, etc.), they automatically join corresponding professional groups.

### 12.1 Overview

Similar to the city cascade, the PRO group cascade:
1. Detects added roles (new selections)
2. Finds existing PRO groups for each role
3. Auto-joins user to matching groups
4. Creates new PRO groups if none exist
5. Creates welcome notification for each new group

### 12.2 PRO Group Mappings

```typescript
const PRO_ROLE_GROUP_MAPPINGS: Record<string, { name: string; description: string; slug: string }> = {
  'teacher': { 
    name: 'Tango Teachers Worldwide', 
    description: 'Connect with tango teachers from around the globe...',
    slug: 'pro-teachers'
  },
  'dj': { 
    name: 'Tango DJs Network', 
    description: 'The global community of tango DJs...',
    slug: 'pro-djs'
  },
  'performer': { 
    name: 'Tango Performers Guild', 
    description: 'For professional tango performers...',
    slug: 'pro-performers'
  },
  'organizer': { 
    name: 'Event Organizers Hub', 
    description: 'Connect with fellow tango event organizers...',
    slug: 'pro-organizers'
  },
  // ... additional role mappings
};
```

### 12.3 Cascade Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     USER CHANGES TANGO ROLES                             │
│            (Profile Settings or Onboarding)                             │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   triggerRoleChangeEffects()                             │
│                                                                          │
│  POST /api/roles/change-effects                                         │
│  Body: { previousRoles: [...], newRoles: [...] }                        │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   BACKEND PROCESSING                                     │
│                                                                          │
│   For each ADDED role:                                                  │
│   1. Check PRO_ROLE_GROUP_MAPPINGS for matching group                   │
│   2. Find existing group by slug (type='role')                          │
│   3. If exists → Auto-join user                                         │
│   4. If not exists → Create new PRO group with cover image              │
│   5. Create welcome notification with actionUrl                         │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   RESPONSE                                               │
│                                                                          │
│   {                                                                      │
│     addedRoles: ['teacher', 'dj'],                                      │
│     autoJoinedGroups: [{ groupId, groupName, role, memberCount }],      │
│     createdGroups: [{ groupId, groupName, role }],                      │
│     message: "You've joined 2 professional groups!"                     │
│   }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.4 Client-Side Integration

```typescript
// client/src/lib/roleChangeEffects.ts

export interface RoleChangeEvent {
  previousRoles: string[];
  newRoles: string[];
}

export interface RoleChangeEffects {
  addedRoles: string[];
  removedRoles: string[];
  autoJoinedGroups: Array<{
    groupId: number;
    groupName: string;
    role: string;
    memberCount: number;
    alreadyMember?: boolean;
    created?: boolean;
  }>;
  createdGroups: Array<{
    groupId: number;
    groupName: string;
    role: string;
  }>;
  message: string;
}

export async function triggerRoleChangeEffects(
  event: RoleChangeEvent
): Promise<RoleChangeEffects> {
  const response = await fetch('/api/roles/change-effects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(event),
  });

  return await response.json();
}
```

### 12.5 Notification with Navigation

When a user joins a PRO group, they receive a notification that links directly to the group:

```typescript
await storage.createNotification({
  userId,
  type: 'role_group_join',
  title: `Welcome to ${groupName}!`,
  message: `You've joined the ${role} professional network.`,
  data: { role, groupId },
  actionUrl: `/groups/${groupId}`,
});
```

---

## 13. Future Considerations

### Potential Improvements
- **Location History** - Track previous locations for "returning home" features
- **Distance-based Effects** - Different effects for local vs. international moves
- **Personalized Recommendations** - ML-based suggestions based on user preferences
- **Move Announcement** - Optional post to feed announcing location change
- **Travel Mode** - Temporary location for travelers vs. permanent relocation
- **Role-based Event Suggestions** - Suggest events matching professional roles

### Known Limitations
- **Single City Group** - Currently auto-joins only ONE city group (first match)
- **No Undo** - Cannot reverse auto-join after cascade completes
- **Synchronous Modal** - Welcome modal may not show if user navigates away quickly
- **Case Sensitivity** - City matching uses `ilike` but edge cases may exist
- **Role Removal** - Currently does not auto-leave groups when roles are removed

---

## 14. Testing Checklist

### Location Cascade
- [ ] Location change from profile settings triggers cascade
- [ ] Location change from onboarding triggers cascade
- [ ] Auto-join creates group membership
- [ ] Already-member case handled gracefully
- [ ] Nearby dancers count is accurate
- [ ] Nearby venues count is accurate
- [ ] Local events are fetched correctly
- [ ] Welcome notification is created with actionUrl
- [ ] Notification click navigates to group page
- [ ] All 5 caches are invalidated
- [ ] Welcome modal displays correct stats
- [ ] Toast message is formatted correctly
- [ ] Error handling works when API fails
- [ ] City group receives cityscape cover image

### PRO Group Cascade
- [ ] Role change triggers PRO group cascade
- [ ] Added roles join corresponding PRO groups
- [ ] Removed roles do not affect group membership
- [ ] PRO group created if none exists for role
- [ ] Welcome notification created for each joined group
- [ ] Notification actionUrl points to correct group
- [ ] PRO groups receive role-appropriate cover images
- [ ] Already-member case handled gracefully
