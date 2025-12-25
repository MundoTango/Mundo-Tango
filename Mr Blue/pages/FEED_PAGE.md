# Feed Page Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** FeedPageAgent | **Invocation:** `use mb.md: pages:feed`

---

## 1. Overview

The Feed Page is the primary social hub for authenticated users, displaying posts from friends, followed groups, and recommended content. It serves as the home dashboard after login.

**Component:** `client/src/pages/HomePage.tsx` (redirects authenticated users to feed)

### MB.MD References
- **Agent:** `use mb.md: agents:page` → FeedPageAgent
- **Operations:** `use mb.md: operations` → 10-step workflow
- **Patterns:** `use mb.md: patterns:core` → Pattern #7 (Social)

---

## 2. Data Architecture

### 2.1 Posts Table

```sql
posts (
  id: serial PRIMARY KEY,
  userId: integer REFERENCES users(id),
  groupId: integer REFERENCES groups(id),
  content: text NOT NULL,
  imageUrl: text,
  videoUrl: text,
  visibility: varchar DEFAULT 'public',
  likesCount: integer DEFAULT 0,
  commentsCount: integer DEFAULT 0,
  sharesCount: integer DEFAULT 0,
  isPinned: boolean DEFAULT false,
  createdAt: timestamp,
  updatedAt: timestamp
)
```

### 2.2 Related Tables

| Table | Relationship | Purpose |
|-------|--------------|---------|
| `post_likes` | postId, userId | Like tracking |
| `post_comments` | postId, userId | Comments |
| `post_shares` | postId, userId | Share tracking |
| `post_media` | postId | Multiple images |
| `users` | userId | Author info |
| `groups` | groupId | Group context |

---

## 3. URL Routing

| Pattern | Access | Behavior |
|---------|--------|----------|
| `/home` | Authenticated | Main feed |
| `/feed` | Authenticated | Alias |
| `/discover` | Authenticated | Explore content |

---

## 4. Page Structure

### 4.1 Layout Diagram

```
┌────────────────────────────────────────────────────────────┐
│  [Navbar with user avatar and notifications]               │
├───────────────┬────────────────────────────────────────────┤
│ LEFT SIDEBAR  │  MAIN FEED                                 │
│ ┌───────────┐ │  ┌──────────────────────────────────────┐ │
│ │ My Stuff  │ │  │ POST CREATOR                         │ │
│ │ - Events  │ │  │ [Avatar] What's on your mind?        │ │
│ │ - Groups  │ │  │ [📷] [📹] [📅] [📍]      [Post]     │ │
│ │ - Friends │ │  └──────────────────────────────────────┘ │
│ ├───────────┤ │  ┌──────────────────────────────────────┐ │
│ │ Shortcuts │ │  │ POST CARD                            │ │
│ │ - Messages│ │  │ [Avatar] Name • 2h ago               │ │
│ │ - Travel  │ │  │ Post content text...                 │ │
│ │ - Housing │ │  │ [Image]                              │ │
│ └───────────┘ │  │ ❤️ 24  💬 8  ↗️ 3                    │ │
│               │  └──────────────────────────────────────┘ │
│               │  ┌──────────────────────────────────────┐ │
│               │  │ POST CARD 2...                       │ │
│               │  └──────────────────────────────────────┘ │
└───────────────┴────────────────────────────────────────────┘
```

---

## 5. Component Specifications

### 5.1 Post Creator

| Element | Feature | Behavior |
|---------|---------|----------|
| Avatar | Current user | Links to profile |
| Text input | Rich text | Expandable on focus |
| Photo button | Image upload | Gallery uploader |
| Video button | Video upload | Max 100MB |
| Event button | Link event | Event picker modal |
| Location button | Add location | Location picker |
| Post button | Submit | Creates post |

### 5.2 Post Card

| Element | Content | Actions |
|---------|---------|---------|
| Header | Author, timestamp, visibility | Menu (edit/delete) |
| Content | Text, images, video | Expandable |
| Media | Image gallery / video | Lightbox view |
| Reactions | Like, love, etc. | Reaction picker |
| Comments | Comment thread | Collapsible |
| Share | Share button | Share modal |

### 5.3 Feed Filters

| Filter | Content |
|--------|---------|
| All | Everything |
| Friends | Friends' posts only |
| Groups | Group posts only |
| Events | Event-related posts |
| Trending | High engagement |

---

## 6. Interactive Elements

### 6.1 Reaction System

| Reaction | Icon | Behavior |
|----------|------|----------|
| Like | Heart | Toggle |
| Love | Heart (filled) | Toggle |
| Passion | Flame | Toggle |
| Music | Music note | Toggle |

### 6.2 Comment Thread

```typescript
<CommentThread
  postId={post.id}
  comments={comments}
  onAddComment={handleComment}
  onDeleteComment={handleDelete}
/>
```

### 6.3 Share Modal

| Share Type | Destination |
|------------|-------------|
| Repost | Own feed |
| Message | Direct message |
| Group | Group feed |
| External | Copy link |

---

## 7. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/posts/feed` | GET | Personalized feed |
| `/api/posts` | POST | Create post |
| `/api/posts/:id` | GET/PUT/DELETE | Post CRUD |
| `/api/posts/:id/like` | POST | Toggle like |
| `/api/posts/:id/comments` | GET/POST | Comments |
| `/api/posts/:id/share` | POST | Share post |

---

## 8. Feed Algorithm

### 8.1 Content Sources (Priority Order)

| Priority | Source | Weight |
|----------|--------|--------|
| 1 | Close friends | 1.0 |
| 2 | Friends | 0.8 |
| 3 | Followed groups | 0.7 |
| 4 | Followed cities | 0.6 |
| 5 | Trending in network | 0.4 |
| 6 | Recommended | 0.2 |

### 8.2 Engagement Boost

| Signal | Boost |
|--------|-------|
| High likes | +0.2 |
| Many comments | +0.3 |
| Recent activity | +0.2 |
| Mutual connections | +0.1 |

---

## 9. Permissions Matrix

| Action | Member | Admin |
|--------|--------|-------|
| View feed | Yes | Yes |
| Create post | Yes | Yes |
| Edit own post | Yes | Yes |
| Delete own post | Yes | Yes |
| Delete any post | No | Yes |
| Pin post | No | Yes |
| Hide post | Yes | Yes |

---

## 10. Mobile Responsiveness

| Breakpoint | Layout |
|------------|--------|
| < 640px | Single column, no sidebar |
| 640-1024px | Single column with collapsible sidebar |
| > 1024px | Two column layout |

---

## 11. Internationalization

- Post timestamps localized
- Action buttons translated
- Reaction labels localized
- 68 languages supported

---

## 12. Analytics Tracking

| Event | Trigger | Data |
|-------|---------|------|
| `feed_view` | Page load | user_id |
| `post_create` | Submit post | has_media, word_count |
| `post_like` | Like click | post_id, author_id |
| `post_comment` | Submit comment | post_id, length |
| `post_share` | Share action | share_type |
| `scroll_depth` | Scroll position | depth_percentage |

---

## 13. Related Pages

| Page | Relationship |
|------|--------------|
| `/profile/:id` | Author profiles |
| `/groups/:id` | Group context |
| `/events/:id` | Event links |
| `/posts/:id` | Single post view |

---

## 14. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/HomePage.tsx` | Main feed page |
| `client/src/components/feed/PostCreator.tsx` | Create post |
| `client/src/components/feed/PostCard.tsx` | Post display |
| `client/src/components/feed/CommentThread.tsx` | Comments |
| `client/src/components/feed/ReactionSelector.tsx` | Reactions |
| `client/src/components/feed/ShareModal.tsx` | Sharing |
| `client/src/components/feed/ImageGalleryUploader.tsx` | Images |

---

## 15. Test Scenarios

### 15.1 E2E Tests

```
1. [New Context] Create browser context
2. [Browser] Login as admin@mundotango.life
3. [Browser] Navigate to /home
4. [Verify] Assert post creator visible
5. [Verify] Assert feed posts loading
6. [Browser] Type "Test post content" in creator
7. [Browser] Click Post button
8. [Verify] Assert new post appears at top of feed
```

### 15.2 Interaction Test

```
1. [Browser] Navigate to /home (logged in)
2. [Browser] Click like on first post
3. [Verify] Assert like count incremented
4. [Browser] Click like again
5. [Verify] Assert like count decremented
```

---

## 16. Performance

| Metric | Target | Optimization |
|--------|--------|--------------|
| Initial load | < 2s | Paginated feed |
| Infinite scroll | < 500ms | Preload next page |
| Post creation | < 1s | Optimistic UI |
| Image upload | < 3s | Compression |

---

## 17. Future Enhancements

| Priority | Enhancement | Status |
|----------|-------------|--------|
| P1 | Stories feature | Planned |
| P1 | Poll posts | Planned |
| P2 | Live posts | Backlog |
| P2 | Scheduled posts | Backlog |
| P3 | AI content suggestions | Backlog |

---

*Every post. Every connection. Your tango community.*
