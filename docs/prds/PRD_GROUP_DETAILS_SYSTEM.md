# PRD: Group Details System

> **Version:** 1.0  
> **Created:** 2025-11-30  
> **Status:** Active  
> **Route:** `/groups/:id`

---

## 1. Purpose

The Group Details page (`/groups/:id`) provides the full group experience with 7 content tabs: Discussion, Events, Housing, Hub, Members, City Guide, and Settings. It features an editorial-style hero section and comprehensive community features.

---

## 2. Problem Solved

Before this system existed:
- No centralized location for group discussions and posts
- Events within groups were not discoverable
- No housing/accommodation integration for travelers
- No local tango resource directory (milongas, DJs, teachers)
- No admin settings for group management

---

## 3. Technical Implementation

### 3.1 Core Files

| File | Purpose | Lines |
|------|---------|-------|
| `client/src/pages/GroupDetailsPage.tsx` | Main group details page | 700+ |
| `client/src/components/groups/GroupPostFeed.tsx` | Discussion posts feed | 78 |
| `client/src/components/groups/GroupMembersList.tsx` | Members list component | ~150 |
| `client/src/components/groups/GroupSettingsPanel.tsx` | Admin settings | ~200 |
| `server/routes/group-routes.ts` | API endpoints | 649 |

### 3.2 Page Structure

```
/groups/:id (GroupDetailsPage.tsx)
├── Hero Section (50-60vh height)
│   ├── Cover Image (parallax, scale animation on load)
│   ├── Gradient Overlay (from-black/70 via-black/50 to-background)
│   ├── Type Badge (city/professional/specialty)
│   ├── Group Avatar (if imageUrl exists)
│   ├── Group Name (serif font, 4-6xl)
│   ├── Stats Row
│   │   ├── Member Count (Users icon)
│   │   └── Location (MapPin icon)
│   └── Action Buttons
│       ├── Join Group (if not member)
│       └── Leave Group (if member)
│
├── Main Content (max-w-5xl)
│   ├── About Card (if description exists)
│   │   └── Whitespace-preserved description
│   │
│   └── Tab Navigation (7 tabs)
│       ├── Discussion Tab
│       ├── Events Tab (Calendar icon)
│       ├── Housing Tab (Home icon)
│       ├── Hub Tab (Heart icon)
│       ├── Members Tab
│       ├── City Guide Tab (Compass icon)
│       └── Settings Tab (Settings icon, members only)
│
└── Self-Healing Error Boundary
    └── Fallback: /groups
```

### 3.3 Key Interfaces/Types

```typescript
// Group data with creator info
interface GroupDetailsResponse {
  group: SelectGroup;
  creator: {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
    bio: string | null;
  };
  memberCount: number;
}

// Membership status check
interface MembershipData {
  isMember: boolean;
  role?: 'admin' | 'moderator' | 'member';
  status?: 'active' | 'pending';
}

// Group events with RSVP data
interface GroupEvent extends SelectEvent {
  organizer: {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
    isVerified: boolean;
  };
  attendeeCount: number;
}
```

---

## 4. Tab Details

### 4.1 Discussion Tab

| Element | Description | Component | Data Source |
|---------|-------------|-----------|-------------|
| Post Feed | Group posts with reactions | `GroupPostFeed` | `GET /api/groups/:id/posts` |
| Post Creator | New post form (members only) | `UnifiedMemoriesFeed` | Embedded |
| Pinned Posts | Priority display | Sorted by `isPinned` | Database flag |
| Empty State | Prompt to post first | Conditional render | - |

**Component Props:**
```typescript
<GroupPostFeed 
  groupId={group.id}
  groupName={group.name}
  canPost={membershipData?.isMember || false}
  canModerate={membershipData?.isMember || false}
/>
```

**Wiring to UnifiedMemoriesFeed:**
- `GroupPostFeed` transforms `SelectGroupPost[]` → `PostItemData[]`
- Uses `UnifiedMemoriesFeed` component for display
- Context: `{ type: 'group', id: groupId, name: groupName }`

### 4.2 Events Tab

| Element | Description | Data Source | Navigation |
|---------|-------------|-------------|------------|
| Event Cards | Events linked to group | `GET /api/groups/:id/events` | Click → `/events/:id` |
| City Fallback | Events by group city | `GET /api/events?city=X` | - |
| RSVP Button | Going/RSVP toggle | `useRSVPEvent` hook | Updates status |
| Details Button | View full event | - | → `/events/:id` |
| View All | Shows all events | - | → `/events?city=X` |

**RSVP Integration:**
```typescript
const rsvpMutation = useRSVPEvent();
const { data: myRsvps } = useMyRSVPs();

const handleRSVP = async (eventId: number, currentStatus?: string) => {
  const newStatus = currentStatus === "going" ? "not_going" : "going";
  await rsvpMutation.mutateAsync({ eventId, status: newStatus });
};
```

**Test IDs:**
- `event-{id}` - Event card container
- `button-rsvp-event-{id}` - RSVP button
- `button-view-event-{id}` - Details button
- `button-view-all-events` - View all link

### 4.3 Housing Tab (MT Host Integration)

| Element | Description | Future Wiring |
|---------|-------------|---------------|
| Housing Cards | Available accommodations | → Travel System |
| Host Name | Accommodation host | → User Profile |
| Room Type | Private/Shared/Apartment | → Booking flow |
| Price | Per night rate | → Stripe |
| Availability | Status badge | → Calendar system |
| View Details | Booking action | → Future MT Host |

**Mock Data Structure:**
```typescript
{
  id: 1,
  host: "Maria S.",
  type: "Private Room",
  price: "$45/night",
  availability: "Available" | "Booked"
}
```

**Test IDs:**
- `housing-{id}` - Housing card
- `button-book-{id}` - Booking button

### 4.4 Hub Tab (Community Directory)

| Section | Content | Future Wiring |
|---------|---------|---------------|
| **Local Milongas** | Venue name, schedule, rating | → Events/Venues |
| **DJs Directory** | DJ profiles with ratings | → User Profiles (DJ role) |
| **Teachers Directory** | Teacher profiles | → User Profiles (Teacher role) |
| **Venues List** | Dance spaces in city | → Venue database |

**Data Structure:**
```typescript
// Milongas
{ id: 1, name: "La Viruta", schedule: "Wed & Fri 11pm", rating: 4.8 }

// DJs
{ id: 1, name: "DJ Carlos", specialty: "Golden Age", rating: 4.9 }

// Teachers  
{ id: 1, name: "Maria & Juan", style: "Salon", rating: 4.7 }

// Venues
{ id: 1, name: "Tango Porteño", capacity: 100, floor: "Maple Wood" }
```

### 4.5 Members Tab

| Element | Description | Data Source | Navigation |
|---------|-------------|-------------|------------|
| Member List | All active members | `GET /api/groups/:id/members` | - |
| Avatar | User profile image | `users.profileImage` | Click → `/profile/:id` |
| Name/Username | User identity | `users.name/username` | Click → `/profile/:id` |
| Role Badge | Admin/Mod/Member | `groupMembers.role` | Display only |
| Location | City, Country | `users.city/country` | Display only |
| Tango Roles | User's dance roles | `users.tangoRoles` | Display only |

**Component:** `GroupMembersList`

**API Response:**
```typescript
GET /api/groups/:id/members?status=active

Response: Array<{
  membership: SelectGroupMember,
  user: {
    id: number,
    name: string,
    username: string,
    profileImage: string | null,
    city: string | null,
    country: string | null,
    tangoRoles: string[]
  }
}>
```

### 4.6 City Guide Tab

| Section | Content |
|---------|---------|
| Getting Around | Transportation tips |
| Neighborhoods | Best areas for tango |
| Accommodation | Hotel recommendations |
| Cultural Notes | Local customs |
| Safety Tips | Practical advice |
| Language | Common phrases |

**Test ID:** `section-city-guide`

### 4.7 Settings Tab (Members Only)

| Section | Actions | Permissions |
|---------|---------|-------------|
| **Group Info** | Edit name, description, cover | Admin, Moderator |
| **Visibility** | Change public/private/secret | Admin only |
| **Member Management** | Approve/remove members | Admin, Moderator |
| **Posting Rules** | Who can post | Admin only |
| **Notifications** | Group notification settings | All members |
| **Delete Group** | Permanent deletion | Creator only |

**Component:** `GroupSettingsPanel`

**Visibility:** Only shown if `membershipData?.isMember === true`

---

## 5. Hero Section Actions

### 5.1 Join Group

```typescript
const joinGroup = useMutation({
  mutationFn: async () => {
    const res = await apiRequest("POST", `/api/groups/${group.id}/join`);
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/groups", groupIdOrSlug] });
    queryClient.invalidateQueries({ queryKey: ["/api/groups", group?.id, "membership"] });
    toast({ title: "Joined group!", description: "You are now a member." });
  },
});
```

**Button States:**
- Default: "Join Group" with Check icon
- Pending: "Joining..."
- Private group: Changes to pending status

**Test ID:** `button-join-group`

### 5.2 Leave Group

```typescript
const leaveGroup = useMutation({
  mutationFn: async () => {
    const res = await apiRequest("DELETE", `/api/groups/${group.id}/leave`);
    return res;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/groups", groupIdOrSlug] });
    toast({ title: "Left group", description: "You are no longer a member." });
  },
});
```

**Button States:**
- Default: "Leave Group" (outline variant)
- Pending: "Leaving..."

**Test ID:** `button-leave-group`

---

## 6. API Endpoints

### 6.1 Get Group Details

```
GET /api/groups/:id

Response: {
  group: SelectGroup,
  creator: { id, name, username, profileImage, bio },
  memberCount: number
}
```

### 6.2 Check Membership

```
GET /api/groups/:id/membership
Auth: Required

Response: {
  isMember: boolean,
  role?: 'admin' | 'moderator' | 'member',
  status?: 'active' | 'pending'
}
```

### 6.3 Get Group Events

```
GET /api/groups/:id/events?limit=50

Response: {
  events: Array<{
    event: SelectEvent,
    organizer: { id, name, username, profileImage, isVerified },
    attendeeCount: number
  }>,
  pagination: { page, limit, total, totalPages }
}
```

### 6.4 Get Group Posts

```
GET /api/groups/:id/posts?limit=20&offset=0

Response: Array<{
  post: SelectGroupPost,
  author: { id, name, username, profileImage }
}>
```

### 6.5 Get Group Members

```
GET /api/groups/:id/members?status=active&role=admin

Response: Array<{
  membership: SelectGroupMember,
  user: { id, name, username, profileImage, city, country, tangoRoles }
}>
```

---

## 7. Component Wiring

### 7.1 GroupPostFeed → UnifiedMemoriesFeed

```typescript
// GroupPostFeed transforms data for UnifiedMemoriesFeed
const transformedPosts: PostItemData[] = posts.map((post) => ({
  id: post.id,
  userId: post.authorId,
  content: post.content,
  likes: post.likeCount || 0,
  comments: post.commentCount || 0,
  createdAt: post.createdAt,
  user: {
    id: post.authorId,
    name: `User #${post.authorId}`,
    profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`,
  },
}));

<UnifiedMemoriesFeed
  posts={transformedPosts}
  context={{ type: 'group', id: groupId, name: groupName }}
  showPostCreator={canPost}
/>
```

### 7.2 GroupEventsTab → RSVP System

```typescript
import { useRSVPEvent, useMyRSVPs } from "@/hooks/useEvents";

// Get user's existing RSVPs
const { data: myRsvps } = useMyRSVPs();

// Check status for specific event
const getUserRsvpStatus = (eventId: number) => {
  return myRsvps?.find((r) => r.eventId === eventId)?.status;
};

// Toggle RSVP
const handleRSVP = async (eventId: number, currentStatus?: string) => {
  const newStatus = currentStatus === "going" ? "not_going" : "going";
  await rsvpMutation.mutateAsync({ eventId, status: newStatus });
};
```

### 7.3 Members → User Profile

```typescript
// Each member links to their profile
<Link href={`/profile/${user.id}`}>
  <Avatar>
    <AvatarImage src={user.profileImage} />
    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
  </Avatar>
</Link>
```

---

## 8. Test IDs

| Element | Test ID |
|---------|---------|
| Join group button | `button-join-group` |
| Leave group button | `button-leave-group` |
| Event card | `event-{id}` |
| RSVP button | `button-rsvp-event-{id}` |
| View event button | `button-view-event-{id}` |
| View all events | `button-view-all-events` |
| Housing card | `housing-{id}` |
| Book housing button | `button-book-{id}` |
| Location section | `section-location` |

---

## 9. Cross-References

### Related PRDs
- [PRD_GROUPS_LANDING_SYSTEM.md](./PRD_GROUPS_LANDING_SYSTEM.md) - Groups discovery
- [PRD_GROUP_MEMBERSHIP_SYSTEM.md](./PRD_GROUP_MEMBERSHIP_SYSTEM.md) - Join/leave flows
- [PRD_UNIFIED_FEEDS_SYSTEM.md](./PRD_UNIFIED_FEEDS_SYSTEM.md) - Post display
- [PRD_RSVP_ARCHITECTURE.md](./PRD_RSVP_ARCHITECTURE.md) - Event RSVP
- [PRD_TRAVEL_PLANNING_SYSTEM.md](./PRD_TRAVEL_PLANNING_SYSTEM.md) - Housing integration

### Related Pages/Features
- **Groups Landing** (`/groups`) - Back navigation
- **Events** (`/events/:id`) - Event details
- **User Profile** (`/profile/:id`) - Member profiles

---

## 10. Wiring to Other Systems

### 10.1 Groups → Events
- `events.groupId` FK links events to groups
- `GroupEventsTab` fetches via `/api/groups/:id/events`
- Falls back to city-based events if no groupId events
- RSVP buttons use `useRSVPEvent` hook

### 10.2 Groups → RSVP
- Events within groups use standard RSVP architecture
- `useMyRSVPs()` hook fetches user's existing RSVPs
- Status persistence via `eventRsvps` table
- Cache invalidation on RSVP mutation

### 10.3 Groups → User Profile
- Members link to `/profile/:id`
- `groupMembers.userId` FK to users table
- Profile shows group memberships

### 10.4 Groups → Travel (Future)
- Housing tab will integrate with MT Host
- `Request to Book` buttons for accommodations
- Travel plans can include city group recommendations

### 10.5 Groups → Notifications
- New post notifications for group members
- Mention notifications (@username)
- Admin action alerts (role changes, removals)
- Join request notifications for private groups

---

## 11. Error Handling

### 11.1 SelfHealingErrorBoundary

```typescript
<SelfHealingErrorBoundary pageName="Group Details" fallbackRoute="/groups">
  {/* Page content */}
</SelfHealingErrorBoundary>
```

### 11.2 Group Not Found

```typescript
if (!group) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-muted-foreground">Group not found</p>
      </CardContent>
    </Card>
  );
}
```

---

## 12. Future Considerations

- Real member management UI in Settings tab
- Direct messaging between members
- Event creation within groups
- Media gallery tab
- Polls and voting
- Group announcements (admin-only posts)
- Integration with MT Host booking system
- Real-time notifications via WebSocket

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial PRD creation |
