# PRD: Unified Feeds System

> **Version:** 1.0  
> **Created:** 2025-11-28  
> **Status:** Active  
> **Components:** UnifiedMemoriesFeed, SmartPostFeed, PostCreator

---

## 1. Purpose

The Unified Feeds System provides a consistent, feature-rich post display and creation experience across the entire Mundo Tango platform. It combines three interconnected components:

- **UnifiedMemoriesFeed**: A wrapper component ensuring consistent post/memory display across all platform sections
- **SmartPostFeed**: Advanced filtering and search capabilities for post feeds
- **PostCreator**: Universal post creation with context-aware modes, AI enhancement, and cross-platform sharing

This system eliminates UI/UX inconsistencies, reduces code duplication, and provides a cohesive user experience whether viewing posts on the main feed, profiles, groups, events, or saved collections.

---

## 2. Problem Solved

### Before This System
- Posts displayed differently across pages (feed vs. profile vs. groups vs. events)
- Duplicate post rendering logic scattered across 10+ files
- Inconsistent filtering and search capabilities
- No unified post creation experience
- Context-specific features (group posts, event posts) required separate implementations
- Media handling varied between different post creation points

### After Implementation
- Single source of truth for post display across 8+ pages
- Unified filtering with 7 category filters + advanced filters
- Context-aware post creation (feed, event, group, memory, profile)
- Consistent media handling with smart compression
- Cross-platform posting (Facebook, Instagram) from any context
- AI enhancement available universally

---

## 3. Technical Implementation

### 3.1 Core Files

| File | Purpose | Lines |
|------|---------|-------|
| `client/src/components/feed/UnifiedMemoriesFeed.tsx` | Main wrapper component for consistent post display | ~150 |
| `client/src/components/feed/SmartPostFeed.tsx` | Advanced filtering and search with glassmorphic UI | ~375 |
| `client/src/components/universal/PostCreator.tsx` | Universal post creation with all features | ~1350 |

### 3.2 Key Interfaces/Types

```typescript
// UnifiedMemoriesFeed Props
interface UnifiedMemoriesFeedProps {
  posts: PostItemData[];
  isLoading?: boolean;
  context?: {
    type: 'feed' | 'event' | 'group' | 'memory' | 'profile';
    id?: string | number;
    name?: string;
  };
  showPostCreator?: boolean;
  showFilters?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  onPostCreated?: () => void;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  className?: string;
  ownerId?: number;
}

// SmartPostFeed Props
interface SmartPostFeedProps {
  posts: Post[];
  onFilterChange?: (filteredPosts: Post[]) => void;
  children?: React.ReactNode;
}

// PostCreator Props
interface PostCreatorProps {
  onPostCreated?: () => void;
  context?: {
    type: 'feed' | 'event' | 'group' | 'memory';
    id?: string;
    name?: string;
  };
  editMode?: boolean;
  existingPost?: any;
  className?: string;
  showStoryToggle?: boolean;
}

// PostItemData (shared across system)
interface PostItemData {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoThumbnail?: string | null;
  visibility: string;
  likes: number;
  comments: number;
  createdAt: string;
  isSaved?: boolean;
  currentReaction?: string | null;
  reactions?: Record<string, number>;
  tags?: string[] | null;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
    friendshipStatus?: 'accepted' | 'pending' | 'none' | null;
    tangoRoles?: string[] | null;
  };
}
```

### 3.3 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Consumer Components                          │
│  (FeedPage, ProfileTabFeed, GroupPostFeed, SavedPostsPage, etc.)   │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      UnifiedMemoriesFeed                            │
│  • Context-aware display (feed/event/group/memory/profile)          │
│  • Loading states with skeletons                                    │
│  • Empty state with custom messages/icons                           │
│  • Automatic PostCreator insertion for own profiles                 │
│  • Animation wrappers (framer-motion)                               │
└───────┬─────────────────────────────────────────────┬───────────────┘
        │                                             │
        ▼                                             ▼
┌───────────────────────┐                 ┌───────────────────────────┐
│    SmartPostFeed      │                 │      PostCreator          │
│  • Search bar         │                 │  • 5 context modes        │
│  • 7 category filters │                 │  • 15 memory tags         │
│  • Advanced filters   │                 │  • AI enhancement         │
│  • Time/engagement    │                 │  • Cross-posting          │
│  • Location filter    │                 │  • Media up to 30 files   │
│  • Results counter    │                 │  • Smart compression      │
└───────────────────────┘                 │  • Visibility controls    │
                                          │  • Mentions/tagging       │
                                          │  • Recommendations        │
                                          └───────────────────────────┘
```

### 3.4 Context Modes

The system supports 5 context modes that adapt behavior and messaging:

| Context | Post Creator | Empty Message | Filters | Auto-Show Creator |
|---------|--------------|---------------|---------|-------------------|
| `feed` | General post | "No posts to display" | Yes | Via prop |
| `profile` | Memory | "You haven't posted yet" / "No posts yet" | Optional | Own profile only |
| `group` | Group post | "No posts in {groupName} yet" | Yes | Based on permissions |
| `event` | Event post | "No posts about {eventName} yet" | Yes | Via prop |
| `memory` | Memory | "No memories yet" | Yes | Via prop |

### 3.5 15 Memory Tags

```typescript
const MEMORY_TAGS = [
  { id: "travel", label: "Travel", icon: Plane },
  { id: "food", label: "Food", icon: Pizza },
  { id: "culture", label: "Culture", icon: Drama },
  { id: "adventure", label: "Adventure", icon: Mountain },
  { id: "nightlife", label: "Nightlife", icon: Moon },
  { id: "nature", label: "Nature", icon: Leaf },
  { id: "art", label: "Art", icon: Palette },
  { id: "music", label: "Music", icon: Music },
  { id: "sports", label: "Sports", icon: Dumbbell },
  { id: "photography", label: "Photography", icon: PhotoIcon },
  { id: "family", label: "Family", icon: HeartHandshake },
  { id: "friends", label: "Friends", icon: UserPlus },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "milestone", label: "Milestone", icon: Target },
  { id: "celebration", label: "Celebration", icon: PartyPopper },
];
```

### 3.6 SmartPostFeed Filter Categories

```typescript
const FILTER_CATEGORIES = [
  { id: "all", label: "All Posts", icon: TrendingUp },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "popular", label: "Popular", icon: TrendingUp },
  { id: "photos", label: "Photos", icon: ImageIcon },
  { id: "videos", label: "Videos", icon: Video },
  { id: "tagged", label: "Tagged", icon: MapPin },
  { id: "nearby", label: "Nearby", icon: MapPin },
];

const ADVANCED_FILTERS = {
  time: ["all", "today", "week", "month", "year"],
  engagement: ["all", "high (20+)", "medium (10-20)", "low (<10)"],
  location: "city search with UnifiedLocationPicker"
};
```

### 3.7 AI Enhancement Integration

PostCreator includes built-in AI content enhancement:

```typescript
const handleAiEnhance = async () => {
  const response = await apiRequest('POST', '/api/ai/enhance-content', { 
    content, 
    context: context.type 
  });
  // Shows enhanced content for user approval
};
```

### 3.8 Cross-Posting Support

```typescript
// Cross-post to Facebook and/or Instagram
const handleCrossPost = async (postId: number, content: string) => {
  if (crossPostFacebook) {
    await apiRequest('POST', '/api/social/cross-post', {
      postId, content, platform: 'facebook', mediaUrls
    });
  }
  if (crossPostInstagram) {
    await apiRequest('POST', '/api/social/cross-post', {
      postId, content, platform: 'instagram', mediaUrls
    });
  }
};
```

### 3.9 Smart Media Compression

```typescript
// Automatic quality/size adjustment based on file size
const compressImage = (file: File): Promise<string> => {
  const fileSizeMB = file.size / (1024 * 1024);
  
  // >20MB: 800px, quality 0.6
  // 10-20MB: 1024px, quality 0.65
  // 5-10MB: 1280px, quality 0.7
  // 2-5MB: 1600px, quality 0.75
  // <2MB: 1920px, quality 0.8
};
```

---

## 4. Files Using This Component

### 4.1 UnifiedMemoriesFeed (8 files)

| File | Usage Context |
|------|---------------|
| `client/src/pages/FeedPage.tsx` | Main feed display with full features |
| `client/src/pages/FavoritesPage.tsx` | Displays saved/bookmarked posts |
| `client/src/pages/SavedPostsPage.tsx` | User's saved post collection |
| `client/src/pages/FeedPrototypePage.tsx` | Development/testing feed layout |
| `client/src/components/profile/ProfileTabFeed.tsx` | Profile page memories/posts tab |
| `client/src/components/feed/InfiniteScrollFeed.tsx` | Infinite scroll wrapper with pagination |
| `client/src/components/groups/GroupPostFeed.tsx` | Group-specific post feed |

### 4.2 SmartPostFeed (3 files)

| File | Usage Context |
|------|---------------|
| `client/src/pages/FeedPage.tsx` | Main feed filtering |
| `client/src/pages/FeedPrototypePage.tsx` | Prototype feed testing |
| `client/src/components/feed/UnifiedMemoriesFeed.tsx` | Child component for filtering |

### 4.3 PostCreator (9 files)

| File | Usage Context |
|------|---------------|
| `client/src/pages/FeedPage.tsx` | Main feed post creation |
| `client/src/pages/ProfilePage.tsx` | Profile post creation |
| `client/src/pages/CreatePostPage.tsx` | Dedicated post creation page |
| `client/src/pages/FeedPrototypePage.tsx` | Prototype testing |
| `client/src/components/profile/ProfileTabPhotos.tsx` | Photo upload in profile |
| `client/src/components/feed/UnifiedMemoriesFeed.tsx` | Embedded post creator |
| `client/src/components/feed/InfiniteScrollFeed.tsx` | Edit post dialog |
| `client/src/components/groups/GroupPostFeed.tsx` | Group post creation |

---

## 5. Integration Points

### 5.1 Feed Page (`/feed`)
- Full UnifiedMemoriesFeed with all features
- PostCreator with story toggle
- SmartPostFeed for filtering
- StoriesCarousel integration
- InfiniteScrollFeed for pagination

### 5.2 Profile Memories Tab (`/profile/:id`)
- UnifiedMemoriesFeed via ProfileTabFeed
- Context: `{ type: 'profile', id: userId }`
- Auto-shows PostCreator for own profile
- Filters disabled for cleaner view

### 5.3 Groups (`/groups/:slug`)
- GroupPostFeed wraps UnifiedMemoriesFeed
- Context: `{ type: 'group', id: groupId, name: groupName }`
- Permission-based PostCreator visibility
- Transforms group posts to PostItemData format

### 5.4 Events (`/events/:id`)
- UnifiedMemoriesFeed with event context
- Context: `{ type: 'event', id: eventId, name: eventName }`
- Event-specific empty messages

### 5.5 Saved Posts (`/saved-posts`)
- UnifiedMemoriesFeed in read-only mode
- No PostCreator (viewing only)
- Custom empty icon (Bookmark)

### 5.6 Favorites (`/favorites`)
- UnifiedMemoriesFeed for bookmarked posts
- Transforms saved post format to PostItemData
- Custom empty icon (Heart)

### 5.7 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/posts` | GET | Fetch posts for feed |
| `/api/posts` | POST | Create new post |
| `/api/posts/:id` | PATCH | Update existing post |
| `/api/posts/:id` | DELETE | Delete post |
| `/api/saved-posts` | GET | Get user's saved posts |
| `/api/posts/saved` | GET | Alternative saved posts endpoint |
| `/api/groups/:id/posts` | GET | Get group-specific posts |
| `/api/feed/following` | GET | Following feed algorithm |
| `/api/feed/discover` | GET | Discovery feed algorithm |
| `/api/ai/enhance-content` | POST | AI content enhancement |
| `/api/social/cross-post` | POST | Cross-post to social platforms |
| `/api/upload/video/compress` | POST | Server-side video compression |
| `/api/mentions/search` | GET | Search users for @mentions |

---

## 6. Cross-References

### 6.1 Related PRDs
- [PRD_UNIFIED_LOCATION_PICKER.md](./PRD_UNIFIED_LOCATION_PICKER.md) - Location picker used in PostCreator and SmartPostFeed
- [PRD_TANGO_ROLES_SYSTEM.md](./PRD_TANGO_ROLES_SYSTEM.md) - User roles displayed in post author info

### 6.2 Related Components
- **PostItem** (`client/src/components/feed/PostItem.tsx`) - Individual post rendering
- **PostReactions** (`client/src/components/feed/PostReactions.tsx`) - Reaction UI
- **PostActions** (`client/src/components/feed/PostActions.tsx`) - Like/comment/share actions
- **SimpleMentionsInput** (`client/src/components/input/SimpleMentionsInput.tsx`) - @mention autocomplete
- **EditPostDialog** (`client/src/components/modals/EditPostDialog.tsx`) - Post editing modal

### 6.3 Related Pages/Features
- **Profile System** - Displays user's posts via ProfileTabFeed
- **Groups System** - Uses GroupPostFeed for community posts
- **Events System** - Event-specific post feeds
- **Stories Feature** - StoriesCarousel integration in FeedPage
- **AI Enhancement** - Content improvement suggestions
- **Social Cross-Posting** - Facebook/Instagram integration

---

## 7. Usage Examples

### 7.1 Basic Feed Display

```tsx
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";

function MyFeedPage() {
  const { data: posts, isLoading } = useQuery({ queryKey: ["/api/posts"] });
  
  return (
    <UnifiedMemoriesFeed
      posts={posts || []}
      isLoading={isLoading}
      context={{ type: 'feed' }}
      showPostCreator={true}
      showFilters={true}
      onPostCreated={() => queryClient.invalidateQueries({ queryKey: ['/api/posts'] })}
    />
  );
}
```

### 7.2 Profile Posts with Owner Check

```tsx
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";

function ProfileFeed({ userId, posts, isLoading }: ProfileFeedProps) {
  return (
    <UnifiedMemoriesFeed
      posts={posts}
      isLoading={isLoading}
      context={{ type: 'profile', id: userId }}
      showFilters={false}
      ownerId={userId}  // Shows creator if viewing own profile
      onPostCreated={() => queryClient.invalidateQueries({ queryKey: ['/api/posts/user', userId] })}
    />
  );
}
```

### 7.3 Group Posts with Permissions

```tsx
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";

function GroupFeed({ groupId, groupName, canPost }: GroupFeedProps) {
  const { data: posts, isLoading } = useQuery({ 
    queryKey: ["/api/groups", groupId, "posts"] 
  });
  
  return (
    <UnifiedMemoriesFeed
      posts={transformedPosts}
      isLoading={isLoading}
      context={{ type: 'group', id: groupId, name: groupName }}
      showPostCreator={canPost}
      showFilters={true}
      emptyMessage={`No posts in ${groupName} yet. Be the first to share!`}
    />
  );
}
```

### 7.4 Saved Posts Collection

```tsx
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";
import { Bookmark } from "lucide-react";

function SavedPosts() {
  const { data: saved, isLoading } = useQuery({ queryKey: ["/api/saved-posts"] });
  
  return (
    <UnifiedMemoriesFeed
      posts={(saved || []).map(p => ({ ...p, isSaved: true }))}
      isLoading={isLoading}
      context={{ type: 'memory' }}
      showPostCreator={false}
      showFilters={true}
      emptyMessage="No saved posts yet. Bookmark posts to see them here!"
      emptyIcon={Bookmark}
    />
  );
}
```

### 7.5 Standalone PostCreator

```tsx
import { PostCreator } from "@/components/universal/PostCreator";

function CreateEventPost({ eventId, eventName }: EventPostProps) {
  return (
    <PostCreator
      context={{ type: 'event', id: eventId, name: eventName }}
      onPostCreated={() => {
        queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'posts'] });
        toast({ title: "Posted!", description: "Your event post is live" });
      }}
    />
  );
}
```

---

## 8. Feature Capabilities

### 8.1 PostCreator Features
| Feature | Description |
|---------|-------------|
| Multiple Media | Up to 30 images/videos per post |
| Smart Compression | Auto-adjusts quality based on file size |
| Server Video Compression | FFmpeg-based for large videos |
| 15 Memory Tags | Categorize posts with visual tags |
| AI Enhancement | GPT-powered content improvement |
| Cross-Posting | Publish to Facebook/Instagram |
| Location Tagging | City search with coordinates |
| Visibility Controls | Public, Friends, Private |
| Recommendations | Venue/restaurant/activity mentions |
| @Mentions | Tag users with autocomplete |
| Edit Mode | Reuse for editing existing posts |
| Story Toggle | Switch between post and story |

### 8.2 SmartPostFeed Features
| Feature | Description |
|---------|-------------|
| Search | Full-text search across content, users, tags, locations |
| Category Filters | All, Recent, Popular, Photos, Videos, Tagged, Nearby |
| Time Filter | Today, This Week, This Month, This Year |
| Engagement Filter | High (20+), Medium (10-20), Low (<10) |
| Location Filter | City-based filtering with UnifiedLocationPicker |
| Clear Filters | One-click reset all filters |
| Results Counter | Shows filtered vs. total post count |
| Glassmorphic UI | Modern visual design with backdrop blur |

---

## 9. Future Considerations

### 9.1 Potential Improvements
- **Virtual Scrolling**: For feeds with 1000+ posts
- **Offline Support**: Cache posts for offline viewing
- **Draft System**: Save unfinished posts as drafts
- **Scheduled Posts**: Post at a specific time
- **Post Templates**: Quick-start templates for common post types
- **Collaborative Posts**: Multiple authors per post

### 9.2 Known Limitations
- Maximum 30 media files per post
- Video compression requires server-side processing
- Cross-posting may fail if social tokens expire
- AI enhancement requires API key configuration

### 9.3 Performance Notes
- Uses React.memo for component optimization
- Blob URLs for instant media previews (cleanup on unmount)
- Base64 conversion only on submit (not during preview)
- Memoized filter calculations in SmartPostFeed

---

## 10. Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-28 | 1.0 | Initial PRD creation |
