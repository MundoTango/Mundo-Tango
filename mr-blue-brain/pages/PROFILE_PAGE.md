# Profile Page Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** ProfilePageAgent | **Invocation:** `use mb.md: pages:profile`

---

## 1. Overview

The Profile Page displays user information, tango journey, social connections, and professional portfolio. It supports both self-view (editable) and public view (read-only) modes.

**Component:** `client/src/pages/ProfilePage.tsx` (1,023 lines)

### MB.MD References
- **Agent:** `use mb.md: agents:page` → ProfilePageAgent
- **Operations:** `use mb.md: operations` → 10-step workflow
- **Patterns:** `use mb.md: patterns:core` → Pattern #7 (Social)

---

## 2. Data Architecture

### 2.1 Users Table

```sql
users (
  id: serial PRIMARY KEY,
  name: varchar NOT NULL,
  username: varchar UNIQUE NOT NULL,
  email: varchar UNIQUE NOT NULL,
  profileImage: text,
  backgroundImage: text,
  bio: text,
  firstName: varchar,
  lastName: varchar,
  country: varchar,
  city: varchar,
  role: varchar DEFAULT 'user',
  tangoRoles: text[], -- ['leader', 'follower', 'dj', 'teacher', 'organizer']
  yearsOfDancing: integer,
  leaderLevel: integer,
  followerLevel: integer,
  languages: text[],
  socialLinks: jsonb,
  isPro: boolean DEFAULT false,
  isVerified: boolean DEFAULT false
)
```

### 2.2 Related Tables

| Table | Relationship | Purpose |
|-------|--------------|---------|
| `posts` | userId | User's posts |
| `friendships` | userId/friendId | Friend connections |
| `events` | userId | Organized/attended events |
| `travel_plans` | userId | Travel itineraries |
| `user_photos` | userId | Photo gallery |
| `memories` | userId | Tango memories |

---

## 3. URL Routing

| Pattern | Access | Behavior |
|---------|--------|----------|
| `/profile/:id` | Public | View profile by ID |
| `/users/:userId` | Public | Alias route |
| `/profile/:id?view=public` | Public | Force public view |
| `/profile/:id?tab=feed` | Public | Specific tab |

### 3.1 Supported Tabs

| Tab | Query Param | Component |
|-----|-------------|-----------|
| Feed | `?tab=feed` | ProfileTabFeed |
| Travel | `?tab=travel` | ProfileTabTravel |
| Events | `?tab=events` | ProfileTabEvents |
| Friends | `?tab=friends` | ProfileTabFriends |
| Photos | `?tab=photos` | ProfileTabPhotos |
| About | `?tab=about` | ProfileTabAbout |
| Memories | `?tab=memories` | ProfileTabMemories |
| PRO | `?tab=pro` | ProfileTabPro (PRO users only) |

---

## 4. Page Structure

### 4.1 Layout Diagram

```
┌────────────────────────────────────────────────────────────┐
│  [Cover Photo - Full Width]                         [Edit] │
├────────────────────────────────────────────────────────────┤
│  ┌──────┐                                                  │
│  │Avatar│  Name, @username                                 │
│  │      │  Tango Roles: [Leader] [Teacher] [DJ]           │
│  └──────┘  📍 Buenos Aires, Argentina                      │
│            💃 Dancing 8 years | Level 7                    │
│            [Follow] [Message] [...]                        │
├────────────────────────────────────────────────────────────┤
│  [Feed] [Travel] [Events] [Friends] [Photos] [About] [PRO] │
├────────────────────────────────────────────────────────────┤
│  TAB CONTENT AREA                                          │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  (Dynamic content based on selected tab)              │ │
│  │                                                        │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Tab Specifications

### 5.1 Feed Tab (Default)

| Element | Source | Features |
|---------|--------|----------|
| Posts | `/api/posts?userId=` | Text, images, videos |
| Post actions | Like, comment, share | Real-time updates |
| Post creation | Own profile only | Rich text editor |

### 5.2 Travel Tab

| Element | Source | Features |
|---------|--------|----------|
| Upcoming trips | `/api/travel-plans?userId=` | City, dates, status |
| Past trips | Same endpoint, filtered | Memories attached |
| Trip planning | Own profile only | Add new trips |

### 5.3 Events Tab

| Element | Source | Features |
|---------|--------|----------|
| Attending | `/api/events?attendee=` | RSVP'd events |
| Organizing | `/api/events?organizer=` | Created events |
| Past events | Same, filtered by date | Event history |

### 5.4 Friends Tab

| Element | Source | Features |
|---------|--------|----------|
| Friends list | `/api/friendships?userId=` | Grid view |
| Friend count | Aggregated | Display in header |
| Mutual friends | Calculated | Shown on others' profiles |

### 5.5 Photos Tab

| Element | Source | Features |
|---------|--------|----------|
| Photo gallery | `/api/users/:id/photos` | Grid layout |
| Upload | Own profile only | Drag & drop |
| Albums | Grouped by event/date | Optional |

### 5.6 About Tab

| Element | Content |
|---------|---------|
| Bio | Free text description |
| Tango journey | Years dancing, roles, levels |
| Languages | Spoken languages |
| Social links | Instagram, Facebook, etc. |
| Verification | Badge if verified |

### 5.7 PRO Tab

| Element | Visibility | Content |
|---------|------------|---------|
| Dashboard view | Own profile | Analytics, bookings |
| Customer view | Toggle | Public-facing portfolio |
| Services | PRO users | Teaching, DJ services |

---

## 6. Interactive Elements

### 6.1 Photo Upload Dialogs

```typescript
<PhotoUploadDialog
  isOpen={profilePhotoDialogOpen}
  onClose={() => setProfilePhotoDialogOpen(false)}
  onUpload={handlePhotoUpload}
  type="profile"
/>
```

### 6.2 Friendship Actions

| Action | Button | Behavior |
|--------|--------|----------|
| Follow | UserPlus | Creates follow relationship |
| Unfollow | UserMinus | Removes follow |
| Request Friend | HeartHandshake | Opens questionnaire |
| Accept Request | UserCheck | Confirms friendship |

### 6.3 Friendship Questionnaire

```typescript
<FriendshipQuestionnaire
  isOpen={friendshipQuestionnaireOpen}
  onClose={() => setFriendshipQuestionnaireOpen(false)}
  targetUserId={userId}
/>
```

---

## 7. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/users/:id` | GET | User profile data |
| `/api/users/:id/posts` | GET | User's posts |
| `/api/users/:id/photos` | GET | Photo gallery |
| `/api/profile/photo` | POST | Upload profile photo |
| `/api/profile/cover` | POST | Upload cover photo |
| `/api/friendships` | GET/POST | Friendship operations |
| `/api/travel-plans` | GET | User's travel plans |

---

## 8. Permissions Matrix

| Action | Self | Friend | Visitor |
|--------|------|--------|---------|
| View profile | Yes | Yes | Yes |
| Edit profile | Yes | No | No |
| View posts | Yes | Yes | Public only |
| Upload photos | Yes | No | No |
| Send message | N/A | Yes | Yes |
| Send friend request | N/A | N/A | Yes |
| View travel plans | Yes | Yes | Public only |

---

## 9. Mobile Responsiveness

| Breakpoint | Layout Changes |
|------------|----------------|
| < 640px | Stacked header, horizontal scroll tabs |
| 640-1024px | Side-by-side avatar/info |
| > 1024px | Full desktop layout |

---

## 10. Internationalization

- Profile labels translated via i18next
- Tango role names localized
- Country/city names localized
- Date formats region-specific

---

## 11. Analytics Tracking

| Event | Trigger | Data |
|-------|---------|------|
| `profile_view` | Page load | profile_id, viewer_id |
| `tab_change` | Tab click | tab_name |
| `follow_action` | Follow/unfollow | action_type |
| `friend_request` | Request sent | requester, target |
| `photo_upload` | Photo uploaded | photo_type |

---

## 12. Related Pages

| Page | Relationship |
|------|--------------|
| `/friends` | Friends list full page |
| `/messages` | Messaging from profile |
| `/events` | Event connections |
| `/settings` | Profile settings |

---

## 13. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/ProfilePage.tsx` | Main profile page |
| `client/src/components/ProfileTabsNav.tsx` | Tab navigation |
| `client/src/components/profile/ProfileTabFeed.tsx` | Feed tab |
| `client/src/components/profile/ProfileTabTravel.tsx` | Travel tab |
| `client/src/components/profile/ProfileTabEvents.tsx` | Events tab |
| `client/src/components/profile/ProfileTabFriends.tsx` | Friends tab |
| `client/src/components/profile/ProfileTabPhotos.tsx` | Photos tab |
| `client/src/components/profile/ProfileTabAbout.tsx` | About tab |
| `client/src/components/profile/ProfileTabPro.tsx` | PRO tab |
| `client/src/components/PhotoUploadDialog.tsx` | Photo upload |
| `client/src/components/friendship/FriendshipQuestionnaire.tsx` | Friend request |

---

## 14. Test Scenarios

### 14.1 E2E Tests

```
1. [New Context] Create browser context
2. [Browser] Login as admin@mundotango.life
3. [Browser] Navigate to /profile/1
4. [Verify] Assert profile header visible
5. [Verify] Assert tango roles badges displayed
6. [Browser] Click "Travel" tab
7. [Verify] Assert travel content loads
8. [Browser] Click "Photos" tab
9. [Verify] Assert photo gallery renders
```

### 14.2 Photo Upload Test

```
1. [New Context] Create browser context
2. [Browser] Login and navigate to own profile
3. [Browser] Click avatar camera icon
4. [Browser] Upload test image
5. [Verify] Assert profile photo updated
```

---

## 15. Performance

| Metric | Target | Optimization |
|--------|--------|--------------|
| Tab load | < 500ms | Lazy loading tabs |
| Photo gallery | < 1s | Image lazy loading |
| Initial load | < 2s | Critical data first |

---

## 16. Future Enhancements

| Priority | Enhancement | Status |
|----------|-------------|--------|
| P1 | Profile verification badges | Active |
| P2 | Video introductions | Planned |
| P2 | Dance style tags | Planned |
| P3 | Achievement system | Backlog |

---

*Every dancer. Every story. Complete profiles.*
