# PRD: Location Change Cascade System

> **Version:** 1.0  
> **Created:** 2025-11-28  
> **Status:** Active  

---

## 1. Purpose

The **Location Change Cascade System** is a unified mechanism that triggers multiple effects when a user changes their location (city/country). When a user updates their location—whether during onboarding or from profile settings—the system automatically:

- Auto-joins the user to the relevant city group
- Counts nearby dancers and venues
- Fetches upcoming local events
- Creates a welcome notification
- Invalidates relevant caches to refresh data
- Displays a welcome modal with local community statistics

This ensures users immediately feel connected to their new tango community upon relocating.

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
- **Welcome notification** persisted for users who may not see the modal
- **Beautiful welcome modal** showing community statistics and quick actions

---

## 3. Technical Implementation

### 3.1 Core Files

| File | Purpose |
|------|---------|
| `client/src/lib/locationChangeEffects.ts` | Core cascade logic, API calls, cache invalidation |
| `client/src/hooks/useLocationChange.ts` | React hook for easy integration in components |
| `client/src/components/location/LocationChangeWelcome.tsx` | Welcome modal UI component |
| `server/routes/location-change-routes.ts` | Backend API endpoint for cascade effects |
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
│   6. Create welcome notification                                        │
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
| **Welcome Notification** | Persistent notification for the user | `storage.createNotification()` with type `location_change` |
| **Cache Invalidation** | Refresh stale data across the app | Invalidates 5 query keys on frontend |

---

## 5. Files Using This System

| File | Usage Context |
|------|---------------|
| `client/src/components/profile/ProfileTabAbout.tsx` | Triggers cascade when user edits their city in profile settings |
| `client/src/components/location/LocationChangeWelcome.tsx` | Displays welcome modal with community stats and quick actions |
| `server/routes.ts` | Registers the location routes: `app.use("/api/location", locationChangeRoutes)` |

---

## 6. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/location/change-effects` | POST | Main cascade endpoint - processes all effects |

### Request Body
```json
{
  "previousCity": "New York",
  "previousCountry": "United States",
  "newCity": "Buenos Aires",
  "newCountry": "Argentina"
}
```

### Response Body
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

---

## 7. Integration Points

### 7.1 Profile Edit Flow
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

### 7.2 Notifications System
The cascade creates a persistent notification:
```typescript
await storage.createNotification({
  userId,
  type: "location_change",
  title: `Welcome to ${newCity}!`,
  message: `You're now connected with the ${newCity} tango community.`,
  data: { city: newCity, country: newCountry, previousCity, previousCountry },
});
```

### 7.3 Groups System
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

### 7.4 Query Invalidation Pattern
Ensures fresh data across the app:
```typescript
queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
queryClient.invalidateQueries({ queryKey: ['/api/events'] });
queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
```

---

## 8. Cross-References

### Related PRDs
| PRD | Relationship |
|-----|--------------|
| [PRD_UNIFIED_LOCATION_PICKER.md](./PRD_UNIFIED_LOCATION_PICKER.md) | Location input component that captures city/country changes |
| [PRD_TANGO_ROLES_SYSTEM.md](./PRD_TANGO_ROLES_SYSTEM.md) | Profile system that triggers location changes |

### Related Systems
- **UnifiedLocationPicker** - Provides the UI for selecting new location
- **Profile System** - Consumer of cascade on profile edit
- **Groups/Communities** - Receives auto-join members
- **Notifications System** - Receives welcome notifications
- **Events System** - Queried for local events
- **Query Invalidation** - TanStack Query cache management

---

## 9. Usage Examples

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

---

## 10. Future Considerations

### Potential Improvements
- **Location History** - Track previous locations for "returning home" features
- **Distance-based Effects** - Different effects for local vs. international moves
- **Personalized Recommendations** - ML-based suggestions based on user preferences
- **Move Announcement** - Optional post to feed announcing location change
- **Travel Mode** - Temporary location for travelers vs. permanent relocation

### Known Limitations
- **Single City Group** - Currently auto-joins only ONE city group (first match)
- **No Undo** - Cannot reverse auto-join after cascade completes
- **Synchronous Modal** - Welcome modal may not show if user navigates away quickly
- **Case Sensitivity** - City matching uses `ilike` but edge cases may exist

---

## 11. Testing Checklist

- [ ] Location change from profile settings triggers cascade
- [ ] Location change from onboarding triggers cascade
- [ ] Auto-join creates group membership
- [ ] Already-member case handled gracefully
- [ ] Nearby dancers count is accurate
- [ ] Nearby venues count is accurate
- [ ] Local events are fetched correctly
- [ ] Welcome notification is created
- [ ] All 5 caches are invalidated
- [ ] Welcome modal displays correct stats
- [ ] Toast message is formatted correctly
- [ ] Error handling works when API fails
