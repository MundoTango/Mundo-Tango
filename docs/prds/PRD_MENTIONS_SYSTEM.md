# PRD: @Mention System

> **Version:** 1.0  
> **Created:** 2025-11-30  
> **Status:** Active  
> **Pattern:** MB.MD v9.8 Pattern 39 (Reverse-Engineering Protocol)  
> **Routes:** `/api/mentions/*`, Event/Group posts with auto-prepended mentions

---

## 1. Purpose

The @Mention System provides comprehensive @mention capability across Mundo Tango, enabling users to reference and tag other users, events, groups, and cities in posts, comments, and discussions. The system uses a canonical format for database storage with MT Ocean-themed interactive mention pills for display.

---

## 2. Problem Solved

Before this system existed:
- No way to @mention events/groups in discussions
- Manual tagging felt disconnected from content context
- Event/group discussions lacked auto-context awareness
- Mention pills didn't reflect platform's MT Ocean branding

---

## 3. Technical Implementation

### 3.1 Core Files

| File | Purpose | Lines |
|------|---------|-------|
| `client/src/components/input/SimpleMentionsInput.tsx` | Contenteditable mention input | 671 |
| `client/src/components/feed/PostItem.tsx` | Display posts with mention pills | 402 |
| `client/src/utils/renderMentionPills.tsx` | Render canonical mentions as styled pills | 203 |
| `client/src/utils/mentionTokens.ts` | Token parsing/serialization | 264 |
| `server/routes/mention-routes.ts` | Mention search endpoints | 286 |
| `server/routes/event-routes.ts` | Event post creation with mentions | 1103 |
| `server/routes/group-routes.ts` | Group post creation with mentions | 649 |

### 3.2 Canonical Format (Database Storage)

Mentions use standardized format for serialization:

```typescript
// Format: @type:id:name_with_underscores

// User mention
@user:user_123:maria_rodriguez

// Event mention (auto-prepended in event discussions)
@event:event_1270:Melbourne_Tango_Circuit_2025

// Group mention (auto-prepended in group discussions)
@group:group_42:Buenos_Aires_Tango_Community

// City mention
@city:city_567:Buenos_Aires

// Full post example
"@event:event_1270:Melbourne_Tango_Circuit_2025 Great session last night! Dancing with @user:user_123:maria at the milonga."
```

### 3.3 Token System

Three token formats manage mentions throughout the pipeline:

```typescript
// 1. Token format (internal state)
type Token = TextToken | MentionToken
interface MentionToken {
  kind: 'mention';
  type: EntityType; // 'user' | 'event' | 'group' | 'city'
  id: string;       // Format: "user_123", "event_1270"
  name: string;     // Spaces converted to underscores
  groupType?: string; // 'professional' | 'city' (for groups)
}

// 2. Canonical format (database storage)
"@event:event_1270:Melbourne_Tango_Circuit_2025"

// 3. Display format (UI rendering)
Styled mention pills with icons and hover effects
```

### 3.4 SimpleMentionsInput Component

Contenteditable textarea with real-time mention parsing and autocomplete:

```typescript
<SimpleMentionsInput
  value={canonicalFormat}
  onChange={(canonical, mentions) => {
    setContent(canonical);
    setMentionIds(mentions.map(m => m.id));
  }}
  placeholder="What's on your mind? Try @mentioning someone..."
/>
```

**Features:**
- Autocomplete dropdown when typing `@` followed by 1+ char
- Separate search endpoints for user, event, group, city
- Real-time token parsing
- Keyboard navigation (Up/Down arrows, Enter to select)
- IME composition handling for Asian languages

---

## 4. Auto-Prepend System

When posting in event/group contexts, the system automatically prepends the entity mention:

```typescript
// User posts in event discussion
context = { type: 'event', id: 1270, name: 'Melbourne Tango Circuit 2025' }
userContent = "Great session!"

// PostCreator transforms to:
finalContent = "@event:event_1270:Melbourne_Tango_Circuit_2025 Great session!"

// Routes to: POST /api/events/1270/posts
```

**Implementation:**

```typescript
// PostCreator.tsx (lines 462-473)
if ((context.type === 'group' || context.type === 'event') && context.name && context.id) {
  const mentionType = context.type === 'event' ? 'event' : 'group';
  const entityId = typeof context.id === 'string' ? parseInt(context.id) : context.id;
  const safeName = context.name.replace(/ /g, '_');
  const canonicalMention = `@${mentionType}:${mentionType}_${entityId}:${safeName}`;
  if (!finalContent.includes(canonicalMention)) {
    finalContent = `${canonicalMention} ${finalContent}`;
  }
}
```

---

## 5. API Endpoints

### 5.1 Search Mentions

| Method | Endpoint | Auth | Query | Response |
|--------|----------|------|-------|----------|
| GET | `/api/mentions/users/search` | Yes | `?q=maria` | `{ data: MentionEntity[] }` |
| GET | `/api/mentions/events/search` | Yes | `?q=tango` | `{ data: MentionEntity[] }` |
| GET | `/api/mentions/groups/search` | Yes | `?q=buenos` | `{ data: MentionEntity[] }` |
| GET | `/api/mentions/cities/search` | Yes | `?q=mel` | `{ data: MentionEntity[] }` |

**Response Format:**

```typescript
interface MentionEntity {
  id: string;           // "user_123", "event_1270"
  type: EntityType;     // "user", "event", "group", "city"
  display: string;      // Display name
  avatar?: string;      // Profile image URL
  subtitle: string;     // Additional info (bio, date, members)
  metadata?: any;       // groupType, eventType, etc.
}
```

### 5.2 Event Posts with Mentions

```
POST /api/events/:id/posts
Auth: Required

Body: {
  content: "@event:event_1270:Melbourne_Tango_Circuit_2025 Great session!",
  mentions: ["event_1270"],
  imageUrl?: string,
  videoUrl?: string,
  tags?: string[],
  visibility: "public"
}

Response: SelectPost & { user: SelectUser }

Cache Invalidation: queryKey = ['/api/events', eventId, 'posts']
```

### 5.3 Group Posts with Mentions

```
POST /api/groups/:id/posts
Auth: Required

Body: {
  content: "@group:group_42:Buenos_Aires_Tango_Community Amazing discussion!",
  mentions: ["group_42"],
  imageUrl?: string,
  videoUrl?: string,
  tags?: string[],
  visibility: "public"
}

Response: SelectGroupPost & { user: SelectUser }

Cache Invalidation: queryKey = ['/api/groups', groupId, 'posts']
```

---

## 6. Frontend Components

### 6.1 PostCreator (Universal Post Creation)

**Location:** `client/src/components/universal/PostCreator.tsx`

```typescript
<PostCreator
  context={{ 
    type: 'event' | 'group' | 'memory' | 'profile',
    id: entityId,
    name: entityName
  }}
  onPostCreated={() => refetch()}
/>
```

**Features:**
- Context-aware routing (POST to `/api/events/{id}/posts` or `/api/groups/{id}/posts`)
- Auto-prepended @mention with canonical format
- Cache invalidation on post creation
- Media upload (images, videos)
- Tag selection
- Visibility toggle

### 6.2 PostItem (Display with Mention Pills)

**Location:** `client/src/components/feed/PostItem.tsx` (line 240)

```tsx
<div className="px-4 pb-3">
  <div className="whitespace-pre-wrap" data-testid={`post-content-${post.id}`}>
    {renderMentionPills(post.content)}
  </div>
</div>
```

**Renders:** Canonical mentions as interactive MT Ocean-themed pills

### 6.3 EventPostFeed

**Location:** `client/src/components/events/EventPostFeed.tsx`

```tsx
<UnifiedMemoriesFeed
  context={{ type: 'event', id: eventId, name: event.title }}
  queryKey={['/api/events', eventId, 'posts']}
  endpoint={`/api/events/${eventId}/posts`}
/>
```

Internally uses PostCreator + post list with context awareness.

---

## 7. Display System (Mention Pills)

### 7.1 Rendering Pipeline

```
Database: "@event:event_1270:Melbourne_Tango_Circuit_2025 Great session!"
    ↓
parseCanonicalToTokens()
    ↓
Token[]: [
  { kind: 'text', text: '' },
  { kind: 'mention', type: 'event', id: 'event_1270', name: 'Melbourne_Tango_Circuit_2025' },
  { kind: 'text', text: ' Great session!' }
]
    ↓
renderMentionPills()
    ↓
JSX: <ClickableMentionPill type="event" id="event_1270" name="Melbourne_Tango_Circuit_2025" /> + text
```

### 7.2 Mention Pill Styling (MT Ocean Theme)

| Type | Colors | Icon | Hover |
|------|--------|------|-------|
| **User** | Teal/Cyan gradient | Users | Scale 1.05 |
| **Event** | Blue gradient | Calendar | Scale 1.05 |
| **Group** | Purple gradient (prof: Orange) | Building2 | Scale 1.05 |
| **City** | Green gradient | MapPin | Scale 1.05 |

```typescript
// User: rgba(64, 224, 208) - Teal
// Event: rgba(30, 144, 255) - Blue
// Group: rgba(147, 51, 234) - Purple / rgba(251, 146, 60) - Orange
// City: rgba(34, 197, 94) - Green
```

### 7.3 Clickable Navigation

Mention pills are interactive links:

```typescript
// getMentionPath logic
- user:123 → /profile/123
- event:1270 → /events/1270
- group:42 → /groups/42
- city:567 → /communities?city=city_567
```

---

## 8. Data Flow

### 8.1 Creating a Post in Event Discussion

```
User types: "Great session!"
         ↓
PostCreator receives context: { type: 'event', id: 1270, name: 'Melbourne...' }
         ↓
Auto-prepend: "@event:event_1270:Melbourne_Tango_Circuit_2025 Great session!"
         ↓
POST /api/events/1270/posts { content: "...", mentions: ["event_1270"] }
         ↓
Backend stores: { content: "...", mentions: ["event_1270"] }
         ↓
Cache invalidation: queryKey = ['/api/events', 1270, 'posts']
         ↓
Feed refetches and displays post with mention pill
```

### 8.2 Rendering Mention in Feed

```
Database content: "@event:event_1270:Melbourne_Tango_Circuit_2025 Great session!"
         ↓
<PostItem post={post} />
         ↓
renderMentionPills(post.content)
         ↓
parseCanonicalToTokens() extracts [event mention token, text token]
         ↓
Renders: [Mention Pill] + " Great session!"
         ↓
User sees: 📅 @Melbourne_Tango_Circuit_2025 (styled in blue) + text
```

---

## 9. Type Definitions

```typescript
// From @shared/schema.ts
export type EntityType = 'user' | 'event' | 'group' | 'city';

export interface MentionToken {
  kind: 'mention';
  type: EntityType;
  id: string;           // "user_123", "event_1270", "group_42"
  name: string;         // "Melbourne_Tango_Circuit_2025"
  groupType?: string;   // 'professional' | 'city' (for groups)
}

export interface TextToken {
  kind: 'text';
  text: string;
}

export type Token = TextToken | MentionToken;

// From SimpleMentionsInput
export interface MentionEntity {
  id: string;
  type: EntityType;
  display: string;
  name?: string;
  avatar?: string | null;
  subtitle?: string;
  metadata?: any;
}
```

---

## 10. Cache Invalidation Strategy

**When creating a post with @mention:**

```typescript
// For event posts:
queryClient.invalidateQueries({ 
  queryKey: ['/api/events', eventId, 'posts'] 
});

// For group posts:
queryClient.invalidateQueries({ 
  queryKey: ['/api/groups', groupId, 'posts'] 
});
```

**Key insight:** Query keys use arrays with context ID as number, not string:
```typescript
// ✅ CORRECT (matches POST endpoint context.id)
queryKey: ['/api/events', 1270, 'posts']

// ❌ WRONG (string doesn't match number)
queryKey: ['/api/events', '1270', 'posts']
```

---

## 11. Testing

### 11.1 Unit Tests
- Token parsing: `parseCanonicalToTokens()`
- Token serialization: `tokensToCanonical()`
- Mention extraction: `extractMentionIds()`

### 11.2 E2E Tests
- Type `@event` → autocomplete dropdown appears
- Click suggestion → mention added to input
- Submit post → content includes auto-prepended mention
- View post → mention renders as styled pill
- Click pill → navigate to event page

### 11.3 Edge Cases
- Multiple mentions in one post
- Mention name with special characters (spaces, hyphens)
- Mention at start, middle, end of content
- Mention without finishing (e.g., "@event:ev" mid-text)

---

## 12. Known Limitations

1. **Manual @event/@group typing** - SimpleMentionsInput only shows autocomplete suggestions, doesn't validate manual typing
2. **Search responsiveness** - 300ms debounce on search queries
3. **Dropdown position** - Portal renders to document.body, may overlap with sticky headers

---

## 13. Future Enhancements

- [ ] Mention notifications ("You were mentioned in...")
- [ ] Mention thread filtering (show posts mentioning me)
- [ ] Batch mention operations (mention multiple entities)
- [ ] Mention history/analytics (who mentions whom most)
- [ ] Mention privacy (hide mentions from non-members in private groups)

---

## 14. Related PRDs

- [PRD_EVENTS_SYSTEM.md](./PRD_EVENTS_SYSTEM.md) - Event posting system
- [PRD_GROUPS_DETAILS_SYSTEM.md](./PRD_GROUPS_DETAILS_SYSTEM.md) - Group discussion tabs
- [PRD_POSTS_SYSTEM.md](./PRD_POSTS_SYSTEM.md) - Universal post creation
