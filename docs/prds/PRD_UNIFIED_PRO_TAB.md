# PRD: Unified PRO Tab System

> **Version:** 1.0  
> **Created:** 2025-11-28  
> **Status:** Planned  
> **Pattern:** MB.MD v9.5 Pattern 28 (Hierarchical Execution)

---

## 1. Purpose

The Unified PRO Tab consolidates 17 separate role-based profile tabs into a single, dynamic component that adapts based on the user's active tango roles. This creates a professional portfolio experience for users with professional/creative roles while significantly reducing codebase complexity and maintenance burden.

---

## 2. Problem Solved

### Previous State (17 Separate Tabs)

Before this consolidation, each professional/creative role had its own dedicated profile tab:

| Component File | Role |
|----------------|------|
| `ProfileTabTeacher.tsx` | Teacher |
| `ProfileTabDJ.tsx` | DJ |
| `ProfileTabPerformer.tsx` | Performer |
| `ProfileTabOrganizer.tsx` | Organizer |
| `ProfileTabPhotographer.tsx` | Photographer/Videographer |
| `ProfileTabMusician.tsx` | Musician |
| `ProfileTabChoreographer.tsx` | Choreographer (now → Performer) |
| `ProfileTabContentCreator.tsx` | Content Creator (now → Photographer) |
| `ProfileTabTangoGuide.tsx` | Tango Guide (now → Community Builder) |
| `ProfileTabTaxiDancer.tsx` | Taxi Dancer (now → Dancer-Leader) |
| `ProfileTabTourOperator.tsx` | Tour Operator (now → Organizer) |
| `ProfileTabHostVenue.tsx` | Host/Venue Owner |
| `ProfileTabTangoSchool.tsx` | Tango School (now → Teacher) |
| `ProfileTabTangoHotel.tsx` | Tango Hotel (now → Venue Owner) |
| `ProfileTabVendor.tsx` | Vendor (now → Business) |
| `ProfileTabWellness.tsx` | Wellness Provider (now → Coach) |
| `ProfileTabLearningResource.tsx` | Learning Resource (now → Teacher) |

**Problems with 17 Tabs:**
- **Code duplication**: Each tab reimplemented similar patterns (stats grid, portfolio items, booking packages)
- **Inconsistent UX**: Different tabs had different layouts, data structures, and interaction patterns
- **Maintenance burden**: Bug fixes and feature updates required changes across 17 files
- **No unified event history**: Event participations were not connected to professional profiles
- **Role fragmentation**: Legacy roles didn't map to standardized TANGO_ROLES system
- **Multiple tabs per user**: Users with 3+ roles saw 3+ tabs in their profile navigation

### Solution Benefits

- **Single unified component**: One `ProfileTabPro.tsx` handles all professional/creative roles
- **Dynamic role switching**: Role selector allows switching between user's active roles
- **Integrated event history**: Event participations (as DJ, teacher, performer, etc.) auto-populate portfolio
- **Consistent UX**: Same layout patterns across all professional roles
- **Verified credibility**: Event participation creates verifiable experience records
- **Reduced codebase**: 17 files → 4 focused components

---

## 3. Architecture

### 3.1 Component Hierarchy

```
ProfileTabPro.tsx (Main Container)
├── ProRoleSelector.tsx (Role switching for dashboard mode)
├── ProDashboard.tsx (Owner view - stats, management)
│   ├── ProStatsGrid.tsx (Role-specific statistics)
│   ├── ProEventHistory.tsx (Event participations)
│   ├── ProBookingManager.tsx (Incoming booking requests)
│   └── ProPortfolioEditor.tsx (Add/edit portfolio items)
├── ProPublicView.tsx (Visitor view)
│   ├── ProRoleCards.tsx (All active roles as cards)
│   ├── ProEventPortfolio.tsx (Public event history)
│   ├── ProReviews.tsx (Reviews & recommendations)
│   └── ProBookingCTA.tsx (Book this professional)
└── ProRoleCard.tsx (Reusable single role card)
```

### 3.2 Two View Modes

#### Dashboard Mode (Owner View)
When `isOwnProfile === true` and `viewMode === 'dashboard'`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PRO Dashboard                                              [+ Add Content] │
├─────────────────────────────────────────────────────────────────────────────┤
│ Role: [🎵 DJ ▼] [👨‍🏫 Teacher] [🎭 Performer]                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ 🎧 23       │ │ ⭐ 4.9      │ │ 📅 5        │ │ 💰 $2,850   │            │
│ │ Total Gigs  │ │ Avg Rating  │ │ Upcoming    │ │ This Month  │            │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Event History (Verified Participations)                                     │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ 🎵 DJ at "Summer Tango Festival 2024"                                 │  │
│ │    Jul 15-17, 2024 · Pearl District · ✓ Confirmed                     │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ 🎵 DJ at "Friday Night Milonga"                                       │  │
│ │    Weekly · Downtown Ballroom · ✓ Confirmed                           │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Booking Requests                                                            │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ Maria G. requests DJ for "Birthday Milonga"                           │  │
│ │ Dec 20, 2024 · 4 hours · $400                    [Accept] [Decline]   │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Your DJ Sets (Portfolio)                                                    │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│ │ Golden Age Mix   │ │ Neo-Tango Night  │ │ Vals Collection  │            │
│ │ 342 plays · 89 ♥ │ │ 567 plays · 156♥ │ │ 234 plays · 67 ♥│            │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Public Mode (Visitor View)
When `isOwnProfile === false`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Professional Profile                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Active Roles                                                                │
│ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐       │
│ │ 🎵 DJ              │ │ 👨‍🏫 Teacher         │ │ 🎭 Performer       │       │
│ │ ✓ Verified         │ │ ✓ Verified         │ │ ✓ Verified         │       │
│ │ 5 years exp        │ │ 12 years exp       │ │ 8 years exp        │       │
│ │ 23 events          │ │ 45 workshops       │ │ 15 shows           │       │
│ │ ⭐ 4.9 (42 reviews)│ │ ⭐ 4.8 (89 reviews)│ │ ⭐ 5.0 (28 reviews)│       │
│ └────────────────────┘ └────────────────────┘ └────────────────────┘       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Verified Event Portfolio                                                    │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ 🎵 DJ at "Summer Tango Festival 2024"                                 │  │
│ │    Jul 15-17, 2024 · Pearl District · 250 attendees                   │  │
│ │    ⭐ 4.9 · "Amazing music selection!" - Carlos M.                    │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ 👨‍🏫 Teacher at "Tango Fundamentals Workshop"                          │  │
│ │    Jun 22, 2024 · Community Center · 24 students                      │  │
│ │    ⭐ 5.0 · "Clear instruction, patient teacher!" - Ana R.            │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                              [Book This Professional]                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technical Implementation

### 4.1 Core Files

| File | Purpose |
|------|---------|
| `client/src/components/profile/ProfileTabPro.tsx` | Main unified component with view mode routing |
| `client/src/components/profile/pro/ProRoleCard.tsx` | Reusable role card with stats and experience |
| `client/src/components/profile/pro/ProEventHistory.tsx` | Event participations from `eventParticipants` |
| `client/src/components/profile/pro/ProDashboard.tsx` | Owner dashboard with stats and management |
| `client/src/components/profile/pro/ProPublicView.tsx` | Visitor view with portfolio and booking |
| `client/src/components/profile/pro/ProRoleSelector.tsx` | Role switching dropdown for dashboard |
| `client/src/components/profile/pro/ProBookingManager.tsx` | Incoming booking request management |
| `client/src/components/profile/pro/ProStatsGrid.tsx` | Role-specific statistics display |

### 4.2 Key Interfaces

```typescript
// Main component props
interface ProfileTabProProps {
  userId: number;
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'public';
}

// Role card props
interface ProRoleCardProps {
  role: TangoRole;
  experience: TangoRoleExperience | null;
  eventCount: number;
  avgRating: number;
  reviewCount: number;
  isVerified: boolean;
  onClick?: () => void;
}

// Event history item (from eventParticipants)
interface ProEventHistoryItem {
  id: number;
  eventId: number;
  eventTitle: string;
  eventDate: Date;
  eventVenue: string;
  role: EventRole; // 'dj' | 'teacher' | 'performer' | etc.
  status: ParticipantStatus; // 'confirmed' | 'pending' | 'declined'
  customTitle?: string; // "Guest DJ from Berlin"
  compensation?: {
    amount: number;
    currency: string;
    type: string;
  };
  isPubliclyListed: boolean;
}

// Dashboard stats per role
interface ProRoleStats {
  role: string;
  totalEvents: number;
  upcomingEvents: number;
  avgRating: number;
  reviewCount: number;
  monthlyRevenue?: number; // If compensation data available
  portfolioItems: number;
}

// Booking request
interface ProBookingRequest {
  id: number;
  requesterId: number;
  requesterName: string;
  role: string;
  eventTitle: string;
  eventDate: Date;
  duration: string;
  proposedFee?: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}
```

### 4.3 Role-to-Event-Role Mapping

The TANGO_ROLES (19 roles) map to EVENT_ROLES (10 roles) for event participation:

| TANGO_ROLE | EVENT_ROLE | Bookable |
|------------|------------|----------|
| `teacher` | `teacher` | Yes |
| `dj` | `dj` | Yes |
| `performer` | `performer` | Yes |
| `organizer` | `organizer` | No |
| `venue-owner` | `host` | Yes |
| `photographer` | `photographer` | Yes |
| `musician` | `performer` | Yes |
| `coach` | `teacher` | Yes |
| `mc` | `host` | Yes |
| `community-builder` | `volunteer` | No |
| `business` | `sponsor` | Yes |
| `artist` | `photographer` | Yes |

```typescript
// Helper function in shared/utils/roleMapping.ts
export const TANGO_TO_EVENT_ROLE: Record<string, EventRole> = {
  'teacher': 'teacher',
  'dj': 'dj',
  'performer': 'performer',
  'organizer': 'organizer',
  'venue-owner': 'host',
  'photographer': 'photographer',
  'musician': 'performer',
  'coach': 'teacher',
  'mc': 'host',
  'community-builder': 'volunteer',
  'business': 'sponsor',
  'artist': 'photographer',
};

export function getEventRoleForTangoRole(tangoRole: string): EventRole | null {
  return TANGO_TO_EVENT_ROLE[tangoRole] || null;
}

export function getTangoRolesForEventRole(eventRole: EventRole): string[] {
  return Object.entries(TANGO_TO_EVENT_ROLE)
    .filter(([_, er]) => er === eventRole)
    .map(([tr, _]) => tr);
}
```

### 4.4 Database Queries

#### Get User's Professional Stats

```typescript
// server/routes/profile-pro.ts

// Get event participation stats per role
async function getUserProStats(userId: number): Promise<ProRoleStats[]> {
  const participations = await db.query.eventParticipants.findMany({
    where: and(
      eq(eventParticipants.userId, userId),
      eq(eventParticipants.status, 'confirmed')
    ),
    with: {
      event: true
    }
  });

  // Group by role and calculate stats
  const statsByRole = new Map<string, ProRoleStats>();
  
  for (const p of participations) {
    const stats = statsByRole.get(p.role) || {
      role: p.role,
      totalEvents: 0,
      upcomingEvents: 0,
      avgRating: 0,
      reviewCount: 0,
      portfolioItems: 0
    };
    
    stats.totalEvents++;
    if (p.event.startDate > new Date()) {
      stats.upcomingEvents++;
    }
    
    statsByRole.set(p.role, stats);
  }
  
  return Array.from(statsByRole.values());
}
```

#### Get Event History for User

```typescript
// Get all event participations (for dashboard and public view)
async function getUserEventHistory(
  userId: number, 
  options?: { 
    role?: string; 
    publicOnly?: boolean;
    limit?: number;
  }
): Promise<ProEventHistoryItem[]> {
  const conditions = [eq(eventParticipants.userId, userId)];
  
  if (options?.role) {
    conditions.push(eq(eventParticipants.role, options.role));
  }
  if (options?.publicOnly) {
    conditions.push(eq(eventParticipants.isPubliclyListed, true));
  }
  
  return db.query.eventParticipants.findMany({
    where: and(...conditions),
    with: {
      event: {
        columns: {
          id: true,
          name: true,
          startDate: true,
          venue: true,
          city: true
        }
      }
    },
    orderBy: [desc(events.startDate)],
    limit: options?.limit || 20
  });
}
```

---

## 5. Events System Integration

### 5.1 Flow: Event Invite → PRO Tab Portfolio

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. ORGANIZER CREATES EVENT                                               │
│    Creates event + invites Maria as DJ                                   │
│    → eventRoleInvitations.create({ inviteeEmail, role: 'dj' })          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. MARIA RECEIVES INVITATION                                             │
│    Notification: "You've been invited to DJ at Summer Festival"         │
│    Email with accept/decline links                                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. MARIA ACCEPTS INVITE                                                  │
│    eventRoleInvitations.status = 'accepted'                              │
│    eventParticipants.create({                                            │
│      eventId, userId: maria.id, role: 'dj', status: 'confirmed'          │
│    })                                                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. AUTO-ADDED TO MARIA'S PRO TAB                                         │
│    PRO Tab Dashboard shows: "DJ at Summer Festival 2024 - Confirmed"     │
│    Public PRO Tab shows: Verified event in portfolio                     │
│    Stats updated: totalEvents++, experience verified                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Credibility Building

Event participations create **verified experience** that visitors can trust:

| Verification Level | Description | Display |
|--------------------|-------------|---------|
| **Confirmed** | User accepted invite, event completed | ✓ Verified |
| **Pending** | Invite sent, awaiting response | 🕐 Pending |
| **Claimed** | User self-reported, not event-linked | (No badge) |

```typescript
// Helper to calculate verification score
function calculateVerificationScore(eventHistory: ProEventHistoryItem[]): number {
  const confirmed = eventHistory.filter(e => e.status === 'confirmed').length;
  const total = eventHistory.length;
  return total > 0 ? (confirmed / total) * 100 : 0;
}

// Display in ProRoleCard
function getVerificationBadge(score: number): { text: string; color: string } {
  if (score >= 80) return { text: '✓ Highly Verified', color: 'text-green-600' };
  if (score >= 50) return { text: '✓ Verified', color: 'text-blue-600' };
  return { text: 'Building Portfolio', color: 'text-muted-foreground' };
}
```

### 5.3 Per-Role Experience Integration

Uses `tangoRoleExperience` from user schema:

```typescript
// In ProRoleCard.tsx
import { calculateYearsInRole, formatRoleExperience } from '@shared/utils/roleExperience';

function ProRoleCard({ role, user }: { role: TangoRole; user: User }) {
  const years = calculateYearsInRole(user, role.value);
  const experience = formatRoleExperience(user, role.value);
  
  return (
    <Card>
      <CardContent>
        <RoleIcon role={role.value} size={32} />
        <h3>{role.label}</h3>
        <p className="text-sm text-muted-foreground">{experience} experience</p>
        {/* ... stats, verification badge, etc. */}
      </CardContent>
    </Card>
  );
}
```

---

## 6. API Endpoints

### 6.1 New Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/users/:id/pro-stats` | Get professional stats by role |
| `GET` | `/api/users/:id/event-history` | Get event participation history |
| `GET` | `/api/users/:id/booking-requests` | Get pending booking requests (owner only) |
| `POST` | `/api/booking-requests` | Create a booking request |
| `PATCH` | `/api/booking-requests/:id` | Accept/decline booking request |
| `GET` | `/api/users/:id/portfolio` | Get portfolio items (sets, performances, etc.) |
| `POST` | `/api/users/:id/portfolio` | Add portfolio item |
| `PATCH` | `/api/users/:id/portfolio/:itemId` | Update portfolio item |
| `DELETE` | `/api/users/:id/portfolio/:itemId` | Delete portfolio item |

### 6.2 Endpoint Details

#### GET `/api/users/:id/pro-stats`

Returns aggregated stats for each of the user's professional roles.

**Request:**
```
GET /api/users/123/pro-stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "stats": [
    {
      "role": "dj",
      "tangoRole": "dj",
      "totalEvents": 23,
      "upcomingEvents": 5,
      "avgRating": 4.9,
      "reviewCount": 42,
      "monthlyRevenue": 2850,
      "portfolioItems": 8,
      "yearsExperience": 5,
      "verificationScore": 87
    },
    {
      "role": "teacher",
      "tangoRole": "teacher",
      "totalEvents": 45,
      "upcomingEvents": 3,
      "avgRating": 4.8,
      "reviewCount": 89,
      "monthlyRevenue": 1200,
      "portfolioItems": 12,
      "yearsExperience": 12,
      "verificationScore": 92
    }
  ]
}
```

#### GET `/api/users/:id/event-history`

Returns event participations, optionally filtered by role.

**Request:**
```
GET /api/users/123/event-history?role=dj&limit=10&publicOnly=true
Authorization: Bearer <token>
```

**Response:**
```json
{
  "events": [
    {
      "id": 456,
      "eventId": 789,
      "eventTitle": "Summer Tango Festival 2024",
      "eventDate": "2024-07-15T18:00:00Z",
      "eventVenue": "Pearl District Event Center",
      "eventCity": "Portland",
      "role": "dj",
      "status": "confirmed",
      "customTitle": "Guest DJ",
      "compensation": {
        "amount": 500,
        "currency": "USD",
        "type": "performance_fee"
      },
      "isPubliclyListed": true,
      "confirmedAt": "2024-06-01T10:30:00Z"
    }
  ],
  "total": 23,
  "hasMore": true
}
```

---

## 7. Files Using This Component

### 7.1 Profile System Integration

| File | Usage |
|------|-------|
| `client/src/pages/profile/[username].tsx` | Renders ProfileTabPro for users with professional roles |
| `client/src/components/profile/ProfileTabs.tsx` | Includes PRO tab in tab navigation |
| `client/src/components/profile/ProfileHeader.tsx` | May show "PRO" badge for verified professionals |

### 7.2 Event System Integration

| File | Usage |
|------|-------|
| `client/src/pages/events/[id].tsx` | Links to participant PRO profiles |
| `client/src/components/events/EventParticipantList.tsx` | Shows participant roles with PRO links |
| `server/routes/events.ts` | Creates eventParticipants records |
| `server/routes/event-invitations.ts` | Handles invite acceptance → participant creation |

### 7.3 Booking System

| File | Usage |
|------|-------|
| `client/src/components/booking/BookingRequestForm.tsx` | Creates booking requests from PRO tab |
| `server/routes/booking-requests.ts` | Handles booking request CRUD |
| `server/services/notification.ts` | Notifies professionals of booking requests |

---

## 8. Cross-References

### Related PRDs

| PRD | Relationship |
|-----|--------------|
| [PRD_TANGO_ROLES_SYSTEM.md](./PRD_TANGO_ROLES_SYSTEM.md) | Uses TANGO_ROLES for role definitions and icons |
| [PRD_PER_ROLE_EXPERIENCE.md](./PRD_PER_ROLE_EXPERIENCE.md) | Uses tangoRoleExperience for per-role years |
| [PRD_EVENT_PARTICIPANT_ROLES.md](./PRD_EVENT_PARTICIPANT_ROLES.md) | Uses eventParticipants for event history |
| [PRD_BOOKING_SYSTEM.md](./PRD_BOOKING_SYSTEM.md) | Integrates with booking request flow |

### Related Features

- **Onboarding System** (`/onboarding/*`) - Role selection during signup
- **Events System** (`/events/*`) - Event creation and participant invites
- **User Profiles** (`/u/:username`) - PRO tab display
- **Talent Search** (`/search/talent`) - Filters by professional roles

---

## 9. Migration Strategy

### Phase 1: Create New Components

1. Create `ProfileTabPro.tsx` with basic structure
2. Create `ProRoleCard.tsx` for role display
3. Create `ProEventHistory.tsx` connected to eventParticipants
4. Create `ProDashboard.tsx` for owner management

### Phase 2: Add API Endpoints

1. Implement `/api/users/:id/pro-stats`
2. Implement `/api/users/:id/event-history`
3. Update event invitation acceptance to create participant records

### Phase 3: Profile Integration

1. Add PRO tab to profile navigation
2. Conditionally show PRO tab for users with professional roles
3. Route to appropriate view mode based on viewer

### Phase 4: Deprecate Old Tabs

1. Redirect old tab routes to PRO tab with role filter
2. Mark old ProfileTab components as deprecated
3. Remove old components after verification

### Backwards Compatibility

- Old tabs remain functional during transition
- Deep links to old tabs redirect to PRO tab with appropriate role selected
- API endpoints for old tabs continue working (deprecated)

---

## 10. Usage Examples

### Basic PRO Tab Display

```tsx
import ProfileTabPro from '@/components/profile/ProfileTabPro';

// In profile page
<ProfileTabPro 
  userId={user.id} 
  isOwnProfile={currentUser?.id === user.id}
  viewMode={isOwnProfile ? 'dashboard' : 'public'}
/>
```

### Role Card Component

```tsx
import { ProRoleCard } from '@/components/profile/pro/ProRoleCard';
import { getRoleByValue } from '@/lib/tangoRoles';

const role = getRoleByValue('dj');

<ProRoleCard
  role={role}
  experience={user.tangoRoleExperience?.find(r => r.role === 'dj')}
  eventCount={23}
  avgRating={4.9}
  reviewCount={42}
  isVerified={true}
  onClick={() => setSelectedRole('dj')}
/>
```

### Event History Display

```tsx
import { ProEventHistory } from '@/components/profile/pro/ProEventHistory';

<ProEventHistory
  userId={user.id}
  role="dj"
  publicOnly={!isOwnProfile}
  limit={10}
/>
```

### Checking if User Has Professional Roles

```tsx
import { getBookableRoles } from '@/lib/tangoRoles';

const bookableRoleValues = getBookableRoles().map(r => r.value);
const userProRoles = user.tangoRoles?.filter(r => 
  bookableRoleValues.includes(r)
) || [];

const hasProfessionalRoles = userProRoles.length > 0;

// Only show PRO tab if user has at least one professional role
{hasProfessionalRoles && <ProfileTabPro {...props} />}
```

---

## 11. UI Components Specification

### 11.1 ProRoleCard

```tsx
interface ProRoleCardProps {
  role: TangoRole;
  experience?: TangoRoleExperience;
  stats: {
    eventCount: number;
    avgRating: number;
    reviewCount: number;
  };
  isVerified: boolean;
  isSelected?: boolean;
  variant?: 'compact' | 'full';
  onClick?: () => void;
}

// Compact variant (for role selector)
// Shows: Icon, Label, Years

// Full variant (for public display)
// Shows: Icon, Label, Years, Event count, Rating, Verification badge
```

### 11.2 ProStatsGrid

Displays 4 key metrics for the selected role:

| Metric | Icon | Label |
|--------|------|-------|
| Total Events | Calendar | Total Gigs/Classes/Shows |
| Average Rating | Star | Avg Rating |
| Upcoming | Clock | Upcoming |
| Revenue | DollarSign | This Month |

### 11.3 ProEventHistory

Timeline-style display of event participations:

```tsx
interface ProEventHistoryProps {
  userId: number;
  role?: string; // Filter by specific role
  publicOnly?: boolean;
  limit?: number;
  showCompensation?: boolean; // Only for owner view
}
```

---

## 12. Success Metrics

- [ ] Single ProfileTabPro replaces 17 separate components
- [ ] Event participations auto-populate in PRO tab
- [ ] Per-role experience years display correctly
- [ ] Dashboard mode allows role switching
- [ ] Public mode shows all professional roles
- [ ] Booking requests can be sent from PRO tab
- [ ] Verification badges display based on confirmed events
- [ ] Old ProfileTab routes redirect to PRO tab
- [ ] Mobile-responsive layout for all views

---

## 13. Future Considerations

### Potential Improvements

- **Portfolio Media**: Video uploads for performances, audio for DJ sets
- **Availability Calendar**: Show when professional is available for bookings
- **Pricing Tiers**: Display service packages with pricing
- **Endorsements**: Peer endorsements from event organizers
- **Featured Status**: Premium placement for PRO users in search

### Known Limitations

- Compensation data only visible to profile owner
- Review aggregation requires review system implementation
- Portfolio items currently role-agnostic (could be role-specific)

---

## 14. Implementation Order (MB.MD Pattern 28)

### Wave 1 (Parallel - PRD & Core):
- Create this PRD document
- Create role mapping utilities in `shared/utils/roleMapping.ts`

### Wave 2 (Parallel - Components):
- `ProfileTabPro.tsx` - Main container
- `ProRoleCard.tsx` - Role display card
- `ProEventHistory.tsx` - Event history timeline
- `ProDashboard.tsx` - Owner dashboard

### Wave 3 (Parallel - API):
- `/api/users/:id/pro-stats` endpoint
- `/api/users/:id/event-history` endpoint
- Update event invitation acceptance flow

### Wave 4 (Integration):
- Add PRO tab to profile navigation
- Connect to booking request system
- Add verification badge logic

### Wave 5 (Migration):
- Redirect old tab routes
- Deprecate old components
- Update documentation
