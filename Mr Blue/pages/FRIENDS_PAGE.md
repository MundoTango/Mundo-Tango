# Friends Page Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** FriendsPageAgent | **Invocation:** `use mb.md: pages:friends`

---

## 1. Overview

The Friends Page manages social connections between tango dancers, including friends, followers, and connection requests. It features a unique "closeness" scoring system based on shared tango experiences.

**Component:** `client/src/pages/FriendsPage.tsx`

### MB.MD References
- **Agent:** `use mb.md: agents:page` → FriendsPageAgent
- **Operations:** `use mb.md: operations` → 10-step workflow
- **Patterns:** `use mb.md: patterns:core` → Pattern #7 (Social)

---

## 2. Data Architecture

### 2.1 Friendships Table

```sql
friendships (
  id: serial PRIMARY KEY,
  userId: integer REFERENCES users(id),
  friendId: integer REFERENCES users(id),
  status: varchar DEFAULT 'pending', -- pending, accepted, blocked
  closenessScore: integer DEFAULT 0,
  sharedEvents: integer DEFAULT 0,
  sharedCities: integer DEFAULT 0,
  lastInteraction: timestamp,
  questionnaireAnswers: jsonb,
  createdAt: timestamp,
  updatedAt: timestamp,
  UNIQUE(userId, friendId)
)
```

### 2.2 Follows Table

```sql
follows (
  id: serial PRIMARY KEY,
  followerId: integer REFERENCES users(id),
  followingId: integer REFERENCES users(id),
  createdAt: timestamp,
  UNIQUE(followerId, followingId)
)
```

---

## 3. URL Routing

| Pattern | Access | Behavior |
|---------|--------|----------|
| `/friends` | Authenticated | Friends list |
| `/friends/requests` | Authenticated | Pending requests |
| `/friends/followers` | Authenticated | Followers list |
| `/friends/following` | Authenticated | Following list |
| `/friends/suggestions` | Authenticated | Friend suggestions |

---

## 4. Page Structure

### 4.1 Layout Diagram

```
┌────────────────────────────────────────────────────────────┐
│  [Navbar]                                                  │
├───────────────┬────────────────────────────────────────────┤
│ SIDEBAR       │  MAIN CONTENT                              │
│ ┌───────────┐ │  ┌──────────────────────────────────────┐ │
│ │ Friends   │ │  │ FRIENDS HEADER                       │ │
│ │ (42)      │ │  │ [Search friends...] [Sort: Closest]  │ │
│ ├───────────┤ │  └──────────────────────────────────────┘ │
│ │ Requests  │ │  ┌──────────────────────────────────────┐ │
│ │ (3) 🔴    │ │  │ FRIEND CARD                          │ │
│ ├───────────┤ │  │ [Avatar] Name                        │ │
│ │ Followers │ │  │ @username • Buenos Aires             │ │
│ │ (156)     │ │  │ 💃 Leader | 🎵 DJ                    │ │
│ ├───────────┤ │  │ Closeness: ████████░░ 82%            │ │
│ │ Following │ │  │ [Message] [View Profile]             │ │
│ │ (89)      │ │  └──────────────────────────────────────┘ │
│ ├───────────┤ │  ┌──────────────────────────────────────┐ │
│ │ Find      │ │  │ FRIEND CARD 2...                     │ │
│ │ Friends   │ │  └──────────────────────────────────────┘ │
│ └───────────┘ │                                            │
└───────────────┴────────────────────────────────────────────┘
```

---

## 5. Closeness Score System

### 5.1 Score Components

| Factor | Points | Max |
|--------|--------|-----|
| Mutual friendship | 20 | 20 |
| Events attended together | 5/event | 50 |
| Same city | 10 | 10 |
| Messages exchanged | 1/10 msgs | 10 |
| Profile views | 0.5/view | 5 |
| Shared groups | 2/group | 10 |

### 5.2 Closeness Levels

| Score | Level | Badge |
|-------|-------|-------|
| 0-20 | Acquaintance | - |
| 21-40 | Friend | 🤝 |
| 41-60 | Good Friend | 💫 |
| 61-80 | Close Friend | ⭐ |
| 81-100 | Best Friend | 💎 |

---

## 6. Friend Card Specifications

### 6.1 Card Elements

| Element | Content | Action |
|---------|---------|--------|
| Avatar | Profile photo | Link to profile |
| Name | Full name | Link to profile |
| Username | @handle | - |
| Location | City, Country | - |
| Tango roles | Badges | - |
| Closeness bar | Progress | Tooltip with score |
| Message button | Opens chat | Direct message |
| More menu | Options | Unfriend, Block |

### 6.2 Compact View (Mobile)

| Element | Visible |
|---------|---------|
| Avatar | Yes (small) |
| Name | Yes |
| Closeness | Progress bar only |
| Actions | Icon buttons |

---

## 7. Request Management

### 7.1 Incoming Requests

| Element | Content |
|---------|---------|
| Sender info | Avatar, name, mutual friends |
| Questionnaire | Their answers (if provided) |
| Actions | Accept, Decline |
| Time | When requested |

### 7.2 Outgoing Requests

| Element | Content |
|---------|---------|
| Recipient info | Avatar, name |
| Status | Pending |
| Actions | Cancel request |
| Time | When sent |

---

## 8. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/friends` | GET | List friends |
| `/api/friends/requests` | GET | Pending requests |
| `/api/friends/request` | POST | Send request |
| `/api/friends/:id/accept` | POST | Accept request |
| `/api/friends/:id/decline` | POST | Decline request |
| `/api/friends/:id/unfriend` | POST | Remove friend |
| `/api/friends/:id/block` | POST | Block user |
| `/api/friends/suggestions` | GET | AI suggestions |
| `/api/friends/closeness/:id` | GET | Closeness details |
| `/api/follows` | GET/POST | Follow management |

---

## 9. Friend Suggestions

### 9.1 Suggestion Sources

| Source | Priority | Criteria |
|--------|----------|----------|
| Same city | High | Location match |
| Same events | High | Event attendance |
| Mutual friends | Medium | Friend-of-friend |
| Same tango role | Low | Role match |
| Same groups | Medium | Group membership |

### 9.2 Suggestion Card

| Element | Content |
|---------|---------|
| Avatar | Profile photo |
| Name | Full name |
| Mutual friends | "5 mutual friends" |
| Reason | "You both attend Salon Canning" |
| Actions | Add Friend, Dismiss |

---

## 10. Permissions Matrix

| Action | Visitor | Member | Friend |
|--------|---------|--------|--------|
| View friends list | No | Own only | No |
| Send friend request | No | Yes | N/A |
| Accept request | No | Yes | N/A |
| View closeness | No | Own | Mutual |
| Message friend | No | No | Yes |
| See mutual friends | No | Yes | Yes |

---

## 11. Mobile Responsiveness

| Breakpoint | Layout |
|------------|--------|
| < 640px | Full screen tabs, card list |
| 640-1024px | Sidebar + list |
| > 1024px | Full layout |

---

## 12. Internationalization

- Tab labels translated
- Closeness levels localized
- Action buttons translated
- Time formatting localized

---

## 13. Analytics Tracking

| Event | Trigger | Data |
|-------|---------|------|
| `friends_view` | Page load | tab_name |
| `friend_request_sent` | Send request | target_id |
| `friend_request_accepted` | Accept | requester_id |
| `friend_removed` | Unfriend | friend_id |
| `suggestion_action` | Add/Dismiss | action, suggestion_id |

---

## 14. Related Pages

| Page | Relationship |
|------|--------------|
| `/profile/:id` | View friend profile |
| `/messages` | Message friends |
| `/events` | Events with friends |
| `/settings/privacy` | Friend privacy settings |

---

## 15. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/FriendsPage.tsx` | Friends main page |
| `client/src/pages/FriendshipPage.tsx` | Friend detail |
| `client/src/components/FriendCard.tsx` | Friend card |
| `client/src/components/friendship/FriendshipQuestionnaire.tsx` | Request form |
| `client/src/components/friendship/FriendRequestReviewModal.tsx` | Review modal |
| `client/src/pages/ClosenessMetricsDashboardPage.tsx` | Closeness analytics |

---

## 16. Test Scenarios

### 16.1 E2E Tests

```
1. [New Context] Create browser context
2. [Browser] Login as test user
3. [Browser] Navigate to /friends
4. [Verify] Assert friends list visible
5. [Browser] Click "Requests" tab
6. [Verify] Assert pending requests shown
7. [Browser] Click "Accept" on first request
8. [Verify] Assert friend added to list
```

---

## 17. Future Enhancements

| Priority | Enhancement | Status |
|----------|-------------|--------|
| P1 | AI friend matching | Active |
| P2 | Friend groups/circles | Planned |
| P2 | Relationship milestones | Planned |
| P3 | Friend activity feed | Backlog |

---

*Every connection. Every dance partner. Your tango network.*
