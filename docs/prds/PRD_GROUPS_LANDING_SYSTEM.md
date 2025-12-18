# PRD: Groups Landing System

> **Version:** 1.0  
> **Created:** 2025-11-30  
> **Status:** Active  
> **Route:** `/groups`

---

## 1. Purpose

The Groups Landing page (`/groups`) is the central hub for discovering and managing tango community groups. It provides a 3-tab navigation system (My Groups, Cities, Professional) with advanced search, filtering, and group creation capabilities.

---

## 2. Problem Solved

Before this system existed:
- Users had no centralized way to discover tango communities
- City-based and professional groups were scattered across different pages
- No health scores or activity metrics to identify thriving communities
- No easy way to see groups the user has joined

---

## 3. Technical Implementation

### 3.1 Core Files

| File | Purpose | Lines |
|------|---------|-------|
| `client/src/pages/GroupsPage.tsx` | Main Groups landing page with 3 tabs | 524 |
| `client/src/pages/CityGroupsPage.tsx` | Dedicated City Groups page | 179 |
| `client/src/pages/ProfessionalGroupsPage.tsx` | Dedicated Professional Groups page | 182 |
| `client/src/components/groups/GroupCreationModal.tsx` | Create new group modal | 399 |
| `client/src/components/groups/GroupCategoryFilter.tsx` | Category filtering | ~50 |
| `server/routes/group-routes.ts` | Groups API endpoints | 649 |

### 3.2 Page Structure

```
/groups (GroupsPage.tsx)
├── Hero Section (50vh height)
│   ├── Background Image (unsplash tango community)
│   ├── "Global Tango Communities" Badge
│   ├── "Find Your Community" Heading
│   └── Subtext describing features
│
├── Main Content Container
│   ├── Search Bar (input-search-groups)
│   │   └── Searches name, description, city
│   │
│   ├── Tab Navigation (3 tabs)
│   │   ├── My Groups Tab (star icon)
│   │   ├── Cities Tab (building2 icon)
│   │   └── Professional Tab (globe icon)
│   │
│   └── Tab Content
│       ├── My Groups → renderCityCard() for joined groups
│       ├── Cities → Grid of city group cards
│       └── Professional → Editorial-style pro cards
│
└── Sidebar (sticky, lg:block only)
    ├── Quick Stats Card
    │   ├── Total Groups count
    │   ├── City Groups count
    │   ├── Professional count
    │   └── My Groups count
    │
    └── Create Group CTA Card
        └── "Create Group" button → GroupCreationModal
```

### 3.3 Key Interfaces/Types

```typescript
// From shared/schema.ts
interface SelectGroup {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  type: string;  // 'city' | 'professional' | 'specialty' | 'practice' | 'workshop'
  visibility: string;  // 'public' | 'private' | 'secret'
  city: string | null;
  country: string | null;
  region: string | null;
  coverImage: string | null;
  imageUrl: string | null;
  memberCount: number | null;
  createdBy: number | null;
  ownerId: number | null;
  isPrivate: boolean | null;
  joinApproval: boolean | null;
  // ... additional fields
}

// Enriched group with computed properties
interface EnrichedGroup extends SelectGroup {
  healthScore: number;      // 0-100 computed score
  distance: number;         // km from user (mock)
  isFeatured: boolean;      // memberCount > 20 && healthScore > 70
}

// My Groups response includes membership data
interface MyGroupResponse {
  group: SelectGroup;
  membership: {
    role: 'admin' | 'moderator' | 'member';
    status: 'active' | 'pending' | 'inactive';
    joinedAt: string;
  };
  memberCount: number;
}
```

---

## 4. Tab Details

### 4.1 My Groups Tab

| Element | Description | Data Source | Navigation |
|---------|-------------|-------------|------------|
| **Empty State** | Shows when user has no groups | - | "Browse Cities" / "Professional Groups" buttons |
| **Group Cards** | User's joined groups | `GET /api/groups/my-groups` | Click card → `/groups/:id` |
| **Health Score** | Activity indicator (0-100) | Computed from memberCount + activity | Display only |
| **Membership Role** | admin/moderator/member badge | `membership.role` | Display only |

**Buttons:**
- `button-view-group-{id}` → View Group → `/groups/:id`

### 4.2 Cities Tab

| Element | Description | Data Source | Navigation |
|---------|-------------|-------------|------------|
| **City Cards** | 16:9 cityscape images, 2-col grid | `GET /api/groups?type=city` | Click → `/groups/:id` |
| **Join Button** | Immediate join for public groups | `POST /api/groups/:id/join` | Toast confirmation |
| **Member Count** | Number of active members | `memberCount` from API | Display only |
| **Health Score** | Community activity level | Computed | Display only |

**Buttons:**
- `button-view-group-{id}` → Join Group → Triggers join mutation

### 4.3 Professional Tab

| Element | Description | Data Source | Navigation |
|---------|-------------|-------------|------------|
| **Editorial Cards** | Full-width, magazine-style layout | `GET /api/groups?type=professional` | - |
| **Featured Badge** | Star icon for high-activity groups | `isFeatured` computed | Display only |
| **Verified Icon** | Checkmark for verified groups | `group.isVerified` | Display only |
| **Request New Group** | Opens GroupCreationModal | - | Modal |
| **Join Community** | Request to join button | `POST /api/groups/:id/join` | Toast + pending state |

**Buttons:**
- `button-view-group-{id}` → Join Community → Pending if private
- "Request New Group" → Opens `GroupCreationModal`

---

## 5. GroupCreationModal

### 5.1 Form Fields

| Field | Type | Validation | Test ID |
|-------|------|------------|---------|
| Name | Input | min 3 chars | `input-group-name` |
| Slug | Input + Generate button | lowercase, numbers, hyphens | `input-group-slug`, `button-generate-slug` |
| Short Description | Textarea | min 10 chars | `input-group-description` |
| Long Description | Textarea | optional | `input-group-long-description` |
| Type | Select | city/specialty/practice/workshop | `select-group-type` |
| Language | Select | en/es/pt/fr/de/it | `select-group-language` |
| Home City | UnifiedLocationPicker | optional | inherits from picker |
| Visibility | Select | public/private/secret | `select-group-visibility` |
| Open Membership | Switch | boolean | `switch-join-approval` |
| Who Can Post | Select | members/moderators/admins | `select-who-can-post` |

### 5.2 API Call

```typescript
// POST /api/groups
{
  name: "Barcelona Tango Community",
  slug: "barcelona-tango",
  description: "A welcoming community...",
  longDescription: "Detailed information...",
  type: "city",
  visibility: "public",
  joinApproval: true,
  city: "Barcelona",
  country: "Spain",
  region: "Catalonia",
  language: "es",
  whoCanPost: "members",
  allowEvents: true,
  allowPosts: true,
  allowDiscussions: true
}

// Response: Created group with ID
// Side effect: Creator auto-added as admin member
```

---

## 6. Sidebar Components

### 6.1 Quick Stats Card

| Stat | Source | Description |
|------|--------|-------------|
| Total Groups | `enrichedGroups.length` | All groups in system |
| City Groups | `cityGroups.length` | Type = 'city' |
| Professional | `professionalGroups.length` | Type = 'professional' |
| My Groups | `myGroups.length` | User's memberships |

### 6.2 Create Group CTA

| Element | Description |
|---------|-------------|
| Gradient background | `from-primary/10 to-secondary/10` |
| CTA text | "Start a Community" |
| Button | `button-create-group` → Opens modal |

---

## 7. API Endpoints

### 7.1 List Groups

```
GET /api/groups
Query params:
  - search: string (searches name, description)
  - type: 'city' | 'professional' | etc.
  - city: string
  - country: string
  - isPrivate: boolean
  - limit: number (default: 20)
  - offset: number (default: 0)

Response: Array<{
  group: SelectGroup,
  creator: { id, name, username, profileImage },
  memberCount: number
}>
```

### 7.2 My Groups

```
GET /api/groups/my-groups
Auth: Required

Response: Array<{
  group: SelectGroup,
  membership: { role, status, joinedAt },
  creator: { id, name, username, profileImage },
  memberCount: number
}>
```

### 7.3 Create Group

```
POST /api/groups
Auth: Required
Body: InsertGroup (see form fields above)

Response: SelectGroup
Side effects:
  - Creator auto-added to groupMembers as 'admin'
  - Cache invalidation: ["/api/groups"]
```

### 7.4 Join Group

```
POST /api/groups/:id/join
Auth: Required

Response: {
  groupId: number,
  userId: number,
  role: 'member',
  status: 'active' | 'pending'  // pending if isPrivate
}

Side effects:
  - memberCount incremented on group
  - Toast notification
  - Cache invalidation
```

---

## 8. Search & Filtering

### 8.1 Search Implementation

```typescript
const filteredGroups = useMemo(() => {
  return enrichedGroups.filter(group => {
    const matchesSearch = !searchQuery || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters =
      (group.memberCount || 0) >= filters.minMembers &&
      group.healthScore >= filters.minHealthScore;

    return matchesSearch && matchesFilters;
  });
}, [enrichedGroups, searchQuery, filters]);
```

### 8.2 Sort Options

| Option | Sort Logic |
|--------|------------|
| Featured | `isFeatured` descending |
| Members | `memberCount` descending |
| Health | `healthScore` descending |
| Nearby | `distance` ascending |

---

## 9. Computed Properties

### 9.1 Health Score Calculation

```typescript
const calculateHealthScore = (group: SelectGroup): number => {
  const memberScore = Math.min((group.memberCount || 0) / 10, 40);
  const activityScore = 30; // Mock - TODO: Real activity tracking
  const engagementScore = 30; // Mock - TODO: Real engagement metrics
  return Math.round(memberScore + activityScore + engagementScore);
};
```

### 9.2 Featured Determination

```typescript
isFeatured: (group.memberCount || 0) > 20 && calculateHealthScore(group) > 70
```

---

## 10. Test IDs

| Element | Test ID |
|---------|---------|
| Search input | `input-search-groups` |
| Create group button (sidebar) | `button-create-group` |
| View group button | `button-view-group-{id}` |
| Group card | `card-group-{id}` |
| Join button | `button-join-{id}` |
| Request join button | `button-request-join-{id}` |
| Modal title | `text-create-group-title` |
| Submit create | `button-submit-create-group` |
| Cancel create | `button-cancel-create-group` |

---

## 11. Cross-References

### Related PRDs
- [PRD_GROUP_DETAILS_SYSTEM.md](./PRD_GROUP_DETAILS_SYSTEM.md) - `/groups/:id` page
- [PRD_GROUP_MEMBERSHIP_SYSTEM.md](./PRD_GROUP_MEMBERSHIP_SYSTEM.md) - Join/leave flows
- [PRD_UNIFIED_LOCATION_PICKER.md](./PRD_UNIFIED_LOCATION_PICKER.md) - City search
- [PRD_UNIFIED_FEEDS_SYSTEM.md](./PRD_UNIFIED_FEEDS_SYSTEM.md) - Post display

### Related Pages/Features
- **Group Details** (`/groups/:id`) - Click from group cards
- **Events** (`/events`) - Groups can host events
- **Profile** (`/profile/:id`) - Shows user's group memberships

---

## 12. Wiring to Other Systems

### 12.1 Groups → Events
- `events.groupId` foreign key links events to groups
- Groups can host events via Events tab in details page
- City groups show events filtered by city

### 12.2 Groups → User Profile
- `groupMembers.userId` links users to groups
- `/api/groups/my-groups` powers profile group display
- Group membership badges shown on user cards

### 12.3 Groups → Location System
- `UnifiedLocationPicker` used in GroupCreationModal
- `groups.city` and `groups.country` columns store location
- City groups auto-filtered by location

### 12.4 Groups → Sidebar Navigation
- `/groups` in `UnifiedSidebar` component
- Groups icon with tooltip
- Active state styling when on route

---

## 13. Future Considerations

- Real-time health score calculation from actual activity data
- Distance calculation using user's actual location
- Advanced filtering UI with sliders and checkboxes
- Group recommendations based on user interests
- Trending groups section
- Recently active groups section

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial PRD creation |
