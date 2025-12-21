# Groups Page Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** GroupsPageAgent | **Invocation:** `use mb.md: pages:groups`

---

## 1. Overview

The Groups Page displays all tango communities on the platform, including city groups, professional groups, and interest-based groups. It serves as the discovery hub for finding and joining communities.

**Component:** `client/src/pages/GroupsPage.tsx`

### MB.MD References
- **Agent:** `use mb.md: agents:page` → GroupsPageAgent
- **Operations:** `use mb.md: operations` → 10-step workflow
- **Related:** `use mb.md: pages:city` → City page spec

---

## 2. Data Architecture

### 2.1 Groups Table

```sql
groups (
  id: serial PRIMARY KEY,
  name: varchar(255) NOT NULL,
  slug: varchar(255) UNIQUE NOT NULL,
  description: text,
  longDescription: text,
  type: varchar DEFAULT 'city', -- city, professional, interest, school
  roleType: varchar, -- organizer, teacher, dj, performer
  city: varchar,
  country: varchar,
  latitude: numeric(10,7),
  longitude: numeric(10,7),
  isPrivate: boolean DEFAULT false,
  visibility: varchar DEFAULT 'public',
  joinApproval: boolean DEFAULT true,
  emoji: varchar(10),
  imageUrl: text,
  coverImage: text,
  memberCount: integer DEFAULT 0,
  postCount: integer DEFAULT 0,
  eventCount: integer DEFAULT 0,
  allowEvents: boolean DEFAULT true,
  allowPosts: boolean DEFAULT true,
  verified: boolean DEFAULT false,
  ownerId: integer REFERENCES users(id),
  createdAt: timestamp,
  updatedAt: timestamp
)
```

### 2.2 Group Types

| Type | Description | Example |
|------|-------------|---------|
| city | City-based community | Buenos Aires Tango |
| professional | Role-based group | DJs of Argentina |
| interest | Topic-based group | Tango Music Lovers |
| school | Dance school | Academia del Tango |

---

## 3. URL Routing

| Pattern | Access | Behavior |
|---------|--------|----------|
| `/groups` | Public | All groups listing |
| `/groups?type=city` | Public | City groups only |
| `/groups?type=professional` | Public | Professional groups |
| `/groups/:id` | Public | Group detail page |
| `/cities/:slug` | Public | City group (preferred) |

---

## 4. Page Structure

### 4.1 Layout Diagram

```
┌────────────────────────────────────────────────────────────┐
│  [Navbar]                                                  │
├────────────────────────────────────────────────────────────┤
│  GROUPS HEADER                                             │
│  Discover Tango Communities                                │
│  [Search groups...]                    [+ Create Group]    │
├────────────────────────────────────────────────────────────┤
│  FILTER TABS                                               │
│  [All] [Cities] [Professional] [Schools] [Interests]       │
├────────────────────────────────────────────────────────────┤
│  GROUPS GRID                                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ [Image]    │ │ [Image]    │ │ [Image]    │             │
│  │ 🇦🇷 Buenos │ │ 🇩🇪 Berlin  │ │ 🎵 DJs of  │             │
│  │ Aires      │ │ Tango      │ │ Europe     │             │
│  │ 1.2K memb  │ │ 800 memb   │ │ 150 memb   │             │
│  │ [Follow]   │ │ [Follow]   │ │ [Join]     │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ [Image]    │ │ [Image]    │ │ [Image]    │             │
│  │ ...        │ │ ...        │ │ ...        │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│                                                            │
│  [Load More]                                               │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Component Specifications

### 5.1 Group Card

| Element | Content | Styling |
|---------|---------|---------|
| Cover Image | Group cover | aspect-video rounded-t |
| Emoji/Flag | Country flag or emoji | Top-left overlay |
| Name | Group name | font-semibold text-lg |
| Description | Short description | text-muted-foreground truncate |
| Member count | "1.2K members" | text-sm |
| Action button | Follow/Join/Request | Button variant |
| Verified badge | If verified | CheckCircle icon |

### 5.2 Filter Tabs

| Filter | Query | Groups Shown |
|--------|-------|--------------|
| All | - | All groups |
| Cities | `?type=city` | City groups |
| Professional | `?type=professional` | Role-based |
| Schools | `?type=school` | Dance schools |
| Interests | `?type=interest` | Topic groups |

### 5.3 Search

| Feature | Behavior |
|---------|----------|
| Text search | Name, description match |
| Location filter | City, country |
| Sort options | Popular, Recent, A-Z |

---

## 6. Join Mechanics

### 6.1 Group Access Types

| Type | Button | Flow |
|------|--------|------|
| Public (city) | "Follow" | Instant join |
| Public (other) | "Join" | Instant join |
| Approval Required | "Request" | Pending approval |
| Private | "Request" | Must be invited |
| Member | "Joined ✓" | Already member |

### 6.2 Membership States

| State | Display | Actions |
|-------|---------|---------|
| Not member | Join/Follow button | Can join |
| Pending | "Pending" badge | Can cancel |
| Member | "Joined ✓" | Can leave |
| Admin | "Admin" badge | Can manage |
| Owner | "Owner" badge | Full control |

---

## 7. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/groups` | GET | List all groups |
| `/api/groups/:id` | GET | Group details |
| `/api/groups` | POST | Create group |
| `/api/groups/:id` | PUT | Update group |
| `/api/groups/:id/join` | POST | Join group |
| `/api/groups/:id/leave` | POST | Leave group |
| `/api/groups/:id/members` | GET | List members |
| `/api/groups/my` | GET | User's groups |

---

## 8. Permissions Matrix

| Action | Visitor | Member | Admin | Owner |
|--------|---------|--------|-------|-------|
| View groups list | Yes | Yes | Yes | Yes |
| View group details | Yes | Yes | Yes | Yes |
| Join group | No | Yes | N/A | N/A |
| Create group | No | Yes | Yes | Yes |
| Edit group | No | No | Yes | Yes |
| Delete group | No | No | No | Yes |
| Manage members | No | No | Yes | Yes |

---

## 9. Mobile Responsiveness

| Breakpoint | Grid Columns |
|------------|--------------|
| < 640px | 1 column |
| 640-768px | 2 columns |
| 768-1024px | 3 columns |
| > 1024px | 4 columns |

---

## 10. Internationalization

- Group type labels translated
- Action buttons localized
- Member count formatting (1.2K, 10K+)
- Country names localized

---

## 11. Analytics Tracking

| Event | Trigger | Data |
|-------|---------|------|
| `groups_view` | Page load | filter_type |
| `group_search` | Search submit | query |
| `group_click` | Card click | group_id, type |
| `group_join` | Join click | group_id, access_type |
| `group_create` | Create submit | group_type |

---

## 12. Related Pages

| Page | Relationship |
|------|--------------|
| `/groups/:id` | Group detail |
| `/cities/:slug` | City group (redirect) |
| `/groups/create` | Create new group |
| `/groups/my` | User's groups |

---

## 13. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/GroupsPage.tsx` | Groups listing |
| `client/src/pages/GroupDetailsPage.tsx` | Group detail |
| `client/src/components/GroupCard.tsx` | Group card |
| `client/src/components/GroupCreateModal.tsx` | Create group |

---

## 14. Test Scenarios

### 14.1 E2E Tests

```
1. [New Context] Create browser context
2. [Browser] Navigate to /groups
3. [Verify] Assert groups grid visible
4. [Browser] Click "Cities" filter
5. [Verify] Assert only city groups shown
6. [Browser] Search "Buenos Aires"
7. [Verify] Assert Buenos Aires group appears
8. [Browser] Click group card
9. [Verify] Assert redirect to group detail
```

---

## 15. Future Enhancements

| Priority | Enhancement | Status |
|----------|-------------|--------|
| P1 | Group recommendations | Planned |
| P2 | Group categories | Planned |
| P2 | Group events calendar | Active |
| P3 | Group chat | Backlog |

---

*Every community. Every connection. Find your tango family.*
