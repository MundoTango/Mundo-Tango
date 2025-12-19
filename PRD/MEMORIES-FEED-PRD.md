# 📋 MEMORIES FEED PAGE - COMPREHENSIVE PRD (v1.0)

**Document Version:** 1.0  
**Created:** November 26, 2025  
**Last Updated:** November 26, 2025  
**Status:** Production-Ready (0 → Deploy Complete)  
**Route:** `/feed` (accessible via `client/src/pages/FeedPage.tsx`)

---

## 1. EXECUTIVE SUMMARY

The Memories Feed is the central social hub of Mundo Tango - a Facebook/Instagram-style infinite scroll feed for sharing tango memories, photos, videos, and Hidden Gem recommendations. It combines:

- **Instagram-style Stories Carousel** - 24h ephemeral content (horizontal scroll)
- **Following/Discover Algorithm Tabs** - Personalized vs exploratory content
- **PostCreator with @mentions** - Rich text input with user/event/group tagging
- **Server-side Video Compression** - Accept ANY video size, FFmpeg compression to ~8MB
- **Hidden Gems Recommendations** - Google Maps-style place recommendations
- **9 Facebook-style Reactions** - Heart, Laugh, Wow, Sad, Angry, Clap, Fire, Dance, Party
- **Real-time WebSocket Updates** - "X new posts" banner for live content
- **Upcoming Events Sidebar** - Priority-sorted events with real-time RSVP

---

## 2. UI WIREFRAME SPECIFICATION

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HEADER BAR (64px height)                        │
│  [☰ Sidebar Toggle]  [Logo: Mundo Tango]              [🔔 5] [👤 Avatar]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    EDITORIAL HERO SECTION                          │  │
│  │         (25-30vh height, background image + quote carousel)        │  │
│  │                                                                    │  │
│  │              "Tango is a feeling danced out"                       │  │
│  │                    — Jorge Luis Borges                             │  │
│  │                                                                    │  │
│  │         [Auto-rotates quotes every 5 seconds with fade]            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┤
│  │  CONTENT AREA (max-w-7xl, 12-column grid, gap-6)                   │
│  │                                                                     │
│  │  ┌────────────────────────────────┐  ┌─────────────────────────┐   │
│  │  │     MAIN FEED (col-span-9)     │  │ RIGHT SIDEBAR (col-3)   │   │
│  │  │                                │  │                         │   │
│  │  │  ┌──────────────────────────┐  │  │ ┌─────────────────────┐ │   │
│  │  │  │   STORIES CAROUSEL       │  │  │ │ 📅 Upcoming Events  │ │   │
│  │  │  │  [+Your] [👤] [👤] [👤]  │  │  │ │                     │ │   │
│  │  │  └──────────────────────────┘  │  │ │ [My Events] [Nearby]│ │   │
│  │  │                                │  │ │ [Trending][Upcoming]│ │   │
│  │  │  ┌──────────────────────────┐  │  │ │                     │ │   │
│  │  │  │     FEED TABS            │  │  │ │ ┌─────────────────┐ │ │   │
│  │  │  │ [👥 Following][🧭 Discover]│  │  │ │ │ 📅 Milan Tango  │ │ │   │
│  │  │  └──────────────────────────┘  │  │ │ │   in 2 days     │ │ │   │
│  │  │                                │  │ │ │ [127 going]     │ │ │   │
│  │  │  ┌──────────────────────────┐  │  │ │ │ [RSVP ▼]        │ │ │   │
│  │  │  │   NEW POSTS BANNER       │  │  │ │ └─────────────────┘ │ │   │
│  │  │  │ [🔄 5 new posts ↑]       │  │  │ │                     │ │   │
│  │  │  └──────────────────────────┘  │  │ │ [+ Create Event]    │ │   │
│  │  │                                │  │ └─────────────────────┘ │   │
│  │  │  ┌──────────────────────────┐  │  │                         │   │
│  │  │  │      POST CREATOR        │  │  └─────────────────────────┘   │
│  │  │  │ [👤 Avatar] Share a...   │  │                                │
│  │  │  │                          │  │                                │
│  │  │  │ ┌──────────────────────┐ │  │                                │
│  │  │  │ │ What's on your mind? │ │  │                                │
│  │  │  │ │ Try @mentioning...   │ │  │                                │
│  │  │  │ └──────────────────────┘ │  │                                │
│  │  │  │                          │  │                                │
│  │  │  │ [📍][#][📷][✨][👁][🔗]   │  │                                │
│  │  │  │                 [Share]  │  │                                │
│  │  │  └──────────────────────────┘  │                                │
│  │  │                                │                                │
│  │  │  ┌──────────────────────────┐  │                                │
│  │  │  │      POST CARD           │  │                                │
│  │  │  │ [👤] Name @user · 5m ago │  │                                │
│  │  │  │ Post content with        │  │                                │
│  │  │  │ @[User](1:user) mentions │  │                                │
│  │  │  │ [📷 Image/Video]         │  │                                │
│  │  │  │ [#Travel] [#Milonga]     │  │                                │
│  │  │  │ ───────────────────────  │  │                                │
│  │  │  │ [❤️12] [💬5] [↗Share][⋮]│  │                                │
│  │  │  └──────────────────────────┘  │                                │
│  │  │                                │                                │
│  │  │  [Infinite Scroll Trigger]     │                                │
│  │  │  "Scroll for more posts..."    │                                │
│  │  │                                │                                │
│  │  └────────────────────────────────┘                                │
│  │                                                                     │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. COMPONENT ARCHITECTURE

### 3.1 Page Component: `FeedPage.tsx` (1097 lines)

**Location:** `client/src/pages/FeedPage.tsx`  
**Route:** `/feed`  
**Layout:** Responsive 12-column grid (9-col main + 3-col sidebar on lg+)

**State Management:**
```typescript
// Feed Algorithm State
feedType: "following" | "discover"  // Tab selection
filter: "all" | "friends" | "public" | "saved" | "my-posts" | "mentions"
refreshKey: number                   // Force re-fetch trigger

// Quote Carousel State
currentQuoteIndex: number            // Auto-rotates every 5s

// Content Creation State
content: string                      // Post text content
visibility: "public" | "friends" | "private"
selectedTags: string[]
mediaFiles: File[]
mediaPreviews: string[]              // Blob URLs for instant preview

// @Mentions State
showMentions: boolean
mentionQuery: string
mentionResults: any[]                // Search results
mentions: MentionEntity[]            // Selected mentions

// Recommendations State (Hidden Gems)
recommendations: Array<{category, name, location}>
showRecommendationDialog: boolean
selectedCategory: string | null

// Dialogs State
editingPostId: number | null
deletingPostId: number | null
```

---

### 3.2 Stories Carousel: `StoriesCarousel.tsx` (279 lines)

**Location:** `client/src/components/feed/StoriesCarousel.tsx`

**Features:**
- Instagram-style horizontal scrollable story circles
- Gradient ring for unviewed stories
- Group stories by user (multiple stories per user)
- Full-screen story viewer dialog
- Progress bar per story segment
- Auto-advance with click navigation (left/right thirds)
- 24h expiration (stories expire automatically)

**Data Structure:**
```typescript
type Story = {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string;
  expiresAt: string;
  user?: { id, name, username, profileImage };
};

type GroupedStories = {
  userId: number;
  userName: string;
  userImage?: string | null;
  stories: Story[];
  hasUnviewed?: boolean;
};
```

**Test IDs:**
- `stories-carousel` - Main carousel container
- `button-create-story` - Add story button (current user)
- `story-avatar-{userId}` - Individual story avatars
- `story-viewer` - Full-screen story dialog
- `story-image` / `story-video` - Story media content
- `button-previous-story` / `button-next-story` - Navigation

---

### 3.3 Feed Tabs: `FeedTabs.tsx` (37 lines)

**Location:** `client/src/components/feed/FeedTabs.tsx`

**Features:**
- Two-tab toggle: Following (personalized) vs Discover (explore)
- Icon-enhanced tabs (Users, Compass icons)
- Full-width grid layout

**Test IDs:**
- `feed-tabs` - Container
- `tab-following` - Following tab trigger
- `tab-discover` - Discover tab trigger

---

### 3.4 New Posts Banner: `NewPostsBanner.tsx` (87 lines)

**Location:** `client/src/components/feed/NewPostsBanner.tsx`

**Features:**
- Real-time WebSocket connection for new post notifications
- Animated banner appears at top when new posts available
- Click to load new posts and reset counter
- Framer Motion entrance/exit animations

**WebSocket Protocol:**
```typescript
// Connect to: wss://{host}
// Listen for: { type: 'new_post' }
// On receive: Increment newPostsCount
```

**Test IDs:**
- `new-posts-banner` - Banner container (visible only when count > 0)
- `button-load-new-posts` - Load new posts button

---

### 3.5 Post Creator: `PostCreator.tsx` (1350 lines)

**Location:** `client/src/components/universal/PostCreator.tsx`

**Features:**
- Rich text input with @mention autocomplete
- Media upload (photos + videos) with instant blob preview
- Server-side video compression (FFmpeg → Object Storage)
- 15 predefined memory tags (Travel, Food, Culture, etc.)
- 6 recommendation categories (Restaurant, Café, Hotel, Venue, Activity, Bar)
- 3 visibility levels (Public, Friends, Private)
- AI content enhancement button
- Cross-post to Facebook/Instagram (opens settings)
- Hidden Gems location picker with coordinates

**6 Action Buttons (Bottom Row):**
1. 📍 Hidden Gems - Toggle recommendation mode
2. # Tags - Show tag selector panel
3. 📷 Camera - File picker for media
4. ✨ AI Enhance - Improve content with AI
5. 👁 Visibility - Toggle visibility selector
6. 🔗 Cross-post - Open social accounts settings

**Video Upload Flow:**
```
User selects video (ANY size)
  → Create blob URL for instant preview
  → On submit: FormData upload to /api/upload/video/compress
  → FFmpeg compression (H.264, 1080p max, 5Mbps)
  → Upload to Object Storage (GCS)
  → Return URL for database storage
  → Toast: "50MB → 8MB, 84% smaller"
```

**Test IDs:**
- `post-creator` - Main container
- `input-post-content` - SimpleMentionsInput wrapper
- `button-toggle-recommendations` - Hidden Gems toggle
- `button-toggle-tags` - Tags panel toggle
- `button-upload-media` - Media file picker
- `button-ai-enhance` - AI enhancement trigger
- `button-toggle-visibility` - Visibility selector
- `button-toggle-crosspost` - Cross-post settings link
- `button-share-memory` - Submit button
- `media-preview-grid` - Media previews container
- `media-preview-{index}` - Individual media preview
- `button-remove-media-{index}` - Remove media button

---

### 3.6 Infinite Scroll Feed: `InfiniteScrollFeed.tsx` (298 lines)

**Location:** `client/src/components/feed/InfiniteScrollFeed.tsx`

**Features:**
- TanStack Query infinite query with cursor pagination
- Intersection Observer for auto-loading
- Filter-based endpoint switching
- Loading skeletons during fetch
- Error state with retry button
- Empty state messaging
- Edit post dialog integration

**Query Configuration:**
```typescript
useInfiniteQuery<FeedResponse>({
  queryKey: ['infinite-feed', feedType, filter],
  queryFn: async ({ pageParam = 0 }) => {
    // Endpoint varies by filter:
    // - following → /api/feed/following
    // - discover → /api/feed/discover
    // - public → /api/posts?visibility=public
    // - saved → /api/saved-posts
    // - my-posts → /api/posts?userId=X
    // - mentions → /api/posts/mentions
    return fetch(`${endpoint}?limit=20&offset=${pageParam}`);
  },
  getNextPageParam: (lastPage) => lastPage.nextOffset,
  initialPageParam: 0,
});
```

**Test IDs:**
- `infinite-scroll-feed` - Feed container
- `feed-loading` - Loading skeleton state
- `dialog-edit-post-creator` - Edit post modal

---

### 3.7 Post Item: `PostItem.tsx` (366 lines)

**Location:** `client/src/components/feed/PostItem.tsx`

**Features:**
- Author header with avatar, name, username, tango roles
- Content with rendered @mention pills (color-coded by type)
- Media display (images, videos with blob URL conversion)
- 15 memory tags with icons and gradients
- Reaction system (ReactionSelector)
- Comments section toggle
- Share modal integration
- Save/unsave functionality
- Report modal for non-authors
- Edit/Delete for authors

**Mention Pill Colors:**
- 👤 User: Cyan (#40E0D0)
- 📅 Event: Blue (#1E90FF)
- 🏙️ City Group: Green (#22C55E)
- 👔 Professional Group: Purple (#9333EA)

**Test IDs:**
- `post-item-{id}` - Post card container
- `post-content-{id}` - Content text with mentions
- `user-roles-{userId}` - Tango role icons

---

### 3.8 Post Reactions: `PostReactions.tsx` (148 lines)

**Location:** `client/src/components/feed/PostReactions.tsx`

**9 Reaction Types:**
```typescript
const REACTIONS = [
  { name: "heart", label: "Love", color: "#EC4899" },
  { name: "laugh", label: "Funny", color: "#FBBF24" },
  { name: "wow", label: "Amazing", color: "#3B82F6" },
  { name: "sad", label: "Sad", color: "#6B7280" },
  { name: "angry", label: "Angry", color: "#EF4444" },
  { name: "clap", label: "Appreciation", color: "#10B981" },
  { name: "fire", label: "Hot", color: "#F97316" },
  { name: "dance", label: "Tango!", color: "#A855F7" },
  { name: "party", label: "Celebrate", color: "#F59E0B" },
];
```

**Features:**
- Popover with 9 reaction icons on hover
- Current reaction highlighted
- Toggle reaction on re-click (remove)
- Top 3 reactions summary display
- Optimistic updates via mutation

**Test IDs:**
- `button-reactions-{postId}` - Reaction trigger
- `text-reaction-count-{postId}` - Total count
- `button-reaction-{name}-{postId}` - Individual reactions

---

### 3.9 Post Actions Menu: `PostActions.tsx` (258 lines)

**Location:** `client/src/components/feed/PostActions.tsx`

**Menu Items:**
- Copy Link (all posts)
- Edit Post (own posts only)
- Delete Post (own posts only)
- Report Post (others' posts only)

**Dialogs:**
- Delete confirmation (AlertDialog)
- Edit content (Dialog with Textarea)
- Report reason (Dialog with Textarea)

**Test IDs:**
- `button-post-actions-{postId}` - Menu trigger
- `menu-copy-link-{postId}` - Copy link action
- `menu-edit-{postId}` - Edit action
- `menu-delete-{postId}` - Delete action
- `menu-report-{postId}` - Report action
- `button-confirm-delete-{postId}` - Delete confirmation
- `button-save-edit-{postId}` - Save edit button
- `button-submit-report-{postId}` - Submit report button

---

### 3.10 Upcoming Events Sidebar: `UpcomingEventsSidebar.tsx` (513 lines)

**Location:** `client/src/components/feed/UpcomingEventsSidebar.tsx`

**Features:**
- 4 priority category filters (My Events, Trending, Nearby, Upcoming)
- Event cards with date badge or image
- Real-time RSVP updates via WebSocket
- 3-state RSVP dropdown (Going, Maybe, Interested)
- Create Event CTA button
- Test data fallback for demos

**Test IDs:**
- `upcoming-events-sidebar` - Sidebar container
- `button-view-all-events` - Link to /events
- `button-category-{id}` - Category filter buttons
- `event-card-{id}` - Individual event cards
- `rsvp-count-{id}` - RSVP counter badge
- `button-rsvp-{id}` / `button-rsvp-status-{id}` - RSVP buttons
- `rsvp-going-{id}` / `rsvp-maybe-{id}` / `rsvp-interested-{id}` - RSVP options
- `button-create-event` - Create event CTA

---

## 4. API ENDPOINTS

### 4.1 Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get posts with filters (visibility, userId) |
| POST | `/api/posts` | Create new post |
| PATCH | `/api/posts` | Update existing post |
| DELETE | `/api/posts/{id}` | Delete post |
| GET | `/api/posts/stories` | Get stories (24h expiration) |
| GET | `/api/posts/mentions` | Get posts mentioning current user |

### 4.2 Feed

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feed/following` | Personalized feed from following |
| GET | `/api/feed/discover` | Explore feed (algorithmic) |

### 4.3 Interactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts/{id}/react` | Add reaction to post |
| DELETE | `/api/posts/{id}/react` | Remove reaction |
| POST | `/api/posts/{id}/report` | Report post |
| GET | `/api/saved-posts` | Get user's saved posts |

### 4.4 Mentions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mentions/search?query=X` | Search users/events/groups for @mention |

### 4.5 Video Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/video/compress` | Upload video for FFmpeg compression |

### 4.6 Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events?category=X&limit=5&upcoming=true` | Get upcoming events |
| GET | `/api/events/my-rsvps` | Get user's RSVPs |
| POST | `/api/events/{id}/rsvp` | RSVP to event |

---

## 5. DATABASE SCHEMA (Relevant Tables)

```typescript
// Posts table (shared/schema.ts)
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  videoThumbnail: text("video_thumbnail"),
  visibility: varchar("visibility").default("public"),
  type: varchar("type").default("post"),  // 'post' | 'story'
  expiresAt: timestamp("expires_at"),      // For stories
  tags: text("tags").array(),
  mentions: text("mentions").array(),      // JSON strings
  location: text("location"),
  coordinates: jsonb("coordinates"),       // {lat, lng}
  isRecommendation: boolean("is_recommendation").default(false),
  postType: varchar("post_type"),          // Recommendation category
  priceRange: varchar("price_range"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reactions table
export const postReactions = pgTable("post_reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  reactionType: varchar("reaction_type").notNull(), // heart, laugh, wow, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Place Recommendations (Hidden Gems)
export const placeRecommendations = pgTable("place_recommendations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: varchar("category").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  address: text("address"),
  priceRange: varchar("price_range"),
  description: text("description"),
  recommendationCount: integer("recommendation_count").default(1),
  userIds: text("user_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueLocation: unique().on(table.latitude, table.longitude, table.category),
}));
```

---

## 6. DESIGN SYSTEM (MT Ocean Theme)

**Color Palette:**
```css
--cyan-primary: #40E0D0       /* Turquoise - Primary accent */
--blue-primary: #1E90FF       /* Dodger Blue - Secondary accent */
--gradient-ocean: linear-gradient(135deg, rgba(64, 224, 208, 0.15), rgba(30, 144, 255, 0.12))
--gradient-button: linear-gradient(to-right, #06B6D4, #3B82F6, #8B5CF6)
```

**Card Styling:**
```typescript
// MT Ocean Glass Card
style={{
  background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.08), rgba(30, 144, 255, 0.05))',
  backdropFilter: 'blur(12px)',
  borderColor: 'rgba(64, 224, 208, 0.2)',
}}
```

**Animations:**
- Framer Motion for entrance animations
- Quote carousel fade transitions (5s interval)
- Icon button spring animations (staggered 0.1s)
- Hover elevate on cards (`hover-elevate` class)
- Real-time RSVP pulse animation

---

## 7. E2E TEST COVERAGE

**Test File:** `tests/e2e/feed-page.spec.ts` (create if not exists)

**Critical User Flows:**
1. View feed as unauthenticated user (redirect to login)
2. View feed as authenticated user
3. Switch between Following/Discover tabs
4. Create text-only post
5. Create post with image
6. Create post with video (large file compression)
7. Add @mention to post
8. Add tags to post
9. Toggle visibility before posting
10. React to a post (9 reaction types)
11. Comment on a post
12. Share post (copy link)
13. Save/unsave post
14. Edit own post
15. Delete own post
16. Report other's post
17. View stories carousel
18. Open and navigate story viewer
19. RSVP to event in sidebar
20. Infinite scroll loads more posts

**Test ID Selectors (Summary):**
```typescript
// Page elements
'[data-testid="text-page-quote"]'           // Hero quote
'[data-testid="stories-carousel"]'          // Stories
'[data-testid="feed-tabs"]'                 // Tab container
'[data-testid="tab-following"]'             // Following tab
'[data-testid="tab-discover"]'              // Discover tab
'[data-testid="post-creator"]'              // Creator container
'[data-testid="infinite-scroll-feed"]'      // Feed container
'[data-testid="upcoming-events-sidebar"]'   // Sidebar

// Post interactions
'[data-testid="post-item-{id}"]'           // Post card
'[data-testid="button-reactions-{id}"]'     // Reaction button
'[data-testid="button-comment-{id}"]'       // Comment toggle
'[data-testid="button-share-{id}"]'         // Share button
'[data-testid="button-post-actions-{id}"]'  // Actions menu
```

---

## 8. DEPLOYMENT CHECKLIST

**Pre-Deployment:**
- [ ] FFmpeg installed (Nix: `ffmpeg`)
- [ ] Object Storage bucket configured (`DEFAULT_OBJECT_STORAGE_BUCKET_ID`)
- [ ] WebSocket endpoints working (`/ws/notifications`)
- [ ] All rate limiters configured for production
- [ ] Database migrations applied (`npm run db:push`)
- [ ] Environment variables set (Stripe, Object Storage)

**Post-Deployment Verification:**
- [ ] Feed loads without errors
- [ ] Stories carousel displays
- [ ] Post creation works (text, image, video)
- [ ] Reactions persist
- [ ] Comments load and submit
- [ ] Infinite scroll functions
- [ ] Events sidebar shows data
- [ ] WebSocket new posts banner triggers

---

## 9. KNOWN ISSUES & LIMITATIONS

1. **Vite HMR WebSocket Error** - `wss://localhost:undefined` in dev console. Development-only, doesn't affect functionality. Replit infrastructure limitation.

2. **Video Processing Time** - Large videos (>100MB) may take 1-2 minutes to compress. Toast notifications inform users.

3. **Story Creation** - "Your Story" button placeholder. Full story creation modal TODO.

4. **Cross-post Sync** - Currently opens settings page. Full Claude Computer Use automation planned.

5. **@mention Social Sync** - @mentions with Facebook/Instagram URLs in profiles not yet syncing to those platforms.

---

## 10. FUTURE ENHANCEMENTS

1. **Story Creation Modal** - Full Instagram-style story creation
2. **Cross-post Automation** - Claude Computer Use for FB/IG posting
3. **@mention Social Sync** - Auto-tag users on FB/IG from their profile URLs
4. **Post Scheduling** - Schedule posts for future publication
5. **Analytics Dashboard** - Post performance metrics
6. **Translation** - Auto-translate posts (68 languages)
7. **Voice Posts** - Audio-only memories

---

**END OF MEMORIES FEED PRD v1.0**
