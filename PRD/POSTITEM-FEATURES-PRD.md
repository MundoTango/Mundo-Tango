# POST ITEM - FEATURE SPECIFICATION & BUTTON GUIDE

**Version:** 1.0  
**Status:** Production-Ready  
**Last Updated:** November 27, 2025  
**File:** `client/src/components/feed/PostItem.tsx`

---

## 1. POST CARD ANATOMY

```
┌────────────────────────────────────────────────────┐
│ HEADER SECTION                                     │
│ [Avatar] Name @username [Roles] · 5m ago  [⋮Menu] │
├────────────────────────────────────────────────────┤
│ CONTENT SECTION                                    │
│ Post text with @[mentions] and regular content    │
├────────────────────────────────────────────────────┤
│ TAGS SECTION (if tags exist)                       │
│ [🎫 Travel] [🎵 Music] [🎭 Culture]               │
├────────────────────────────────────────────────────┤
│ MEDIA SECTION (if image OR video)                  │
│ [Image: 16/9 aspect] OR [Video: fullscreen]       │
├────────────────────────────────────────────────────┤
│ REACTION SECTION                                   │
│ [❤️ 12] [😊 3] [👏 2]  [💬] [↗️] [🔗] [🎫 Save]     │
├────────────────────────────────────────────────────┤
│ COMMENTS SECTION (if showComments=true)            │
│ [Comment form + list of comments]                 │
└────────────────────────────────────────────────────┘
```

---

## 2. ALL BUTTONS & FEATURES

### HEADER SECTION

#### **User Info Block**
- **Avatar:** User's profile image or initials fallback
- **Name:** User's full name (clickable link to profile)
- **Username:** @username (secondary text)
- **Tango Roles:** 1-3 badges showing roles (Leader, Follower, Teacher, DJ, etc.)
  - Click tooltip shows full role label
  - "+N more" text if more than 3 roles
- **Timestamp:** Relative time (e.g., "5m ago", "2d ago")
  - Uses `safeDateDistance()` for formatting

#### **Post Actions Menu Button (...)**
- **Component:** `PostActionsMenu`
- **Icon:** Three dots (⋮)
- **Only visible to post author:**
  - Edit Post → Opens editor
  - Delete Post → Confirms deletion
  - Report Post → Opens report modal
- **Visible to everyone else:**
  - Save/Unsave Post
  - Report Post

---

### REACTION SECTION (Interactive)

#### **Reaction Button Cluster**
Each reaction type has a button with:
- **Icon + Color:** Unique color for each reaction type
- **Count Display:** Shows number of reactions
- **Current User Indicator:** Filled/highlighted if user has this reaction

**9 Reaction Types:**
1. ❤️ **Love** - Red heart
2. 😊 **Joy** - Smile face
3. 😲 **Wow** - Surprised face
4. 😢 **Sad** - Sad face
5. 😠 **Angry** - Angry face
6. 👏 **Clap** - Clapping hands
7. 🔥 **Fire** - Fire icon
8. 💃 **Dance** - Dancing figure
9. 🎉 **Party** - Party popper

**How to Use:**
- Click reaction button to toggle your reaction
- Reaction popup appears below with all 9 options
- Click any icon to select/deselect that reaction
- Count updates immediately
- Can only have ONE active reaction per post

#### **Comment Button (💬)**
- **Icon:** Message circle
- **Label:** "Comments" with count (e.g., "💬 5")
- **Behavior:** 
  - Click to toggle comment section visibility
  - Shows CommentsSection component below post
  - Displays all comments for this post

#### **Share Button (↗️)**
- **Icon:** Share arrow
- **Behavior:**
  - Opens ShareModal
  - Options:
    - Share to timeline
    - Send as message
    - Copy link
- **Backend:** Tracks shares separately

#### **Link Copy Button (🔗)**
- **Icon:** Link chain
- **Behavior:**
  - Copies post URL to clipboard
  - Shows toast confirmation
- **Format:** `domain.com/posts/{postId}`

#### **Save Button (🎫 / 🎫✓)**
- **Icon:** Bookmark (empty) or BookmarkCheck (filled)
- **Color:** MT Ocean teal (#40E0D0) when saved
- **Behavior:**
  - Click to save post to your "Saved Posts" collection
  - Icon fills with teal color when saved
  - Click again to unsave (icon becomes hollow)
- **Persistence:** Saved state persists across sessions
- **Mutations:** 
  - Uses `useSavePost()` or `useUnsavePost()` hooks
  - Invalidates cache on success
  - Shows toast notification

---

### CONTENT SECTION

#### **Text Content**
- **Rendering:** Uses `renderMentionPills()` to render mentions as pills
- **@Mentions:** 
  - Format: `@[Username](userId:user)` renders as interactive pill
  - Pills link to user profile
  - Pills styled with MT Ocean colors
- **Formatting:** `whitespace-pre-wrap` preserves formatting
- **Data-testid:** `post-content-${postId}`

---

### TAGS SECTION

#### **Tag Badges**
- **Display:** Only shown if post has tags
- **Format:** Gradient badge with icon + label
- **15 Available Tags:**
  - 🎫 Travel, 🍕 Food, 🎭 Culture, 🏔️ Adventure, 🌙 Nightlife
  - 🌿 Nature, 🎨 Art, 🎵 Music, 💪 Sports, 📷 Photography
  - ❤️ Family, 👥 Friends, 💼 Work, 🎯 Milestone, 🎉 Celebration
- **Style:** Each tag has unique gradient color
- **Data-testid:** `tag-badge-${tagId}`

---

### MEDIA SECTION

#### **Image Display**
- **Aspect Ratio:** 16:9 (landscape)
- **Behavior:** 
  - Hover: Subtle zoom effect (1.05x scale)
  - Smooth animation over 0.6s
  - Rounded corners (rounded-lg)
  - Padding: `px-4 pb-3`
- **Data-testid:** `post-image-${postId}`

#### **Video Display**
- **Format:** MP4 or base64-encoded (converted to Blob URL)
- **Aspect Ratio:** 16:9 video aspect
- **Features:**
  - Native HTML5 video controls
  - Poster thumbnail (if available)
  - Preload="auto" for performance
  - Mobile: `playsInline` attribute
  - Black background fallback
  - Rounded corners
- **Data-testid:** `post-video-${postId}`
- **Special:** Base64 videos converted to Blob URLs for iOS Safari compatibility

---

### COMMENTS SECTION

#### **Toggle & Display**
- **Component:** `CommentsSection`
- **Visibility:** Only shown when `showComments === true`
- **Trigger:** User clicks comment button
- **Style:** 
  - Border-top with MT Ocean teal border color
  - `px-4 py-3` padding
  - `border-color: rgba(64, 224, 208, 0.2)` subtle border
- **Features:** Full comment thread with:
  - Comment form
  - List of existing comments
  - Comment reactions
  - Nested replies (if enabled)

---

## 3. MUTATION HOOKS & HANDLERS

### Reaction Mutation
```typescript
const handleReaction = async (reactionId: string) => {
  await reactMutation.mutateAsync({ 
    postId: post.id, 
    reactionType: reactionId 
  });
};
```
- **Endpoint:** `POST /api/posts/{postId}/react`
- **Cache:** Invalidates `['infinite-feed']` and `['/api/posts']`
- **Optimistic Update:** Yes (updates UI immediately)
- **Error Handling:** Toast notification

### Save/Unsave Mutations
```typescript
const handleSave = async () => {
  if (isSaved) {
    await unsaveMutation.mutateAsync({ postId: post.id });
  } else {
    await saveMutation.mutateAsync({ postId: post.id });
  }
};
```
- **Save Endpoint:** `POST /api/posts/{postId}/save`
- **Unsave Endpoint:** `DELETE /api/posts/{postId}/save`
- **Cache:** Invalidates `['/api/posts/saved']`
- **Optimistic Update:** Yes
- **Error Handling:** Toast notifications

### Share Mutation
```typescript
const handleShare = async (
  shareType: 'timeline' | 'comment' | 'link',
  comment?: string
) => {
  await shareMutation.mutateAsync({ 
    postId: post.id, 
    shareType, 
    comment 
  });
};
```
- **Endpoint:** `POST /api/posts/{postId}/share`
- **Params:** `{ shareType, comment }`

---

## 4. STYLING & THEME

### Card Styling
- **Background:** MT Ocean gradient with 8% opacity + 5% blur
- **Border:** Rgba(64, 224, 208, 0.2) - subtle teal
- **Motion:** Fade in + slide up (0.5s) on scroll
- **Margin:** `mb-4` spacing between posts

### Color System
- **Primary:** #40E0D0 (MT Ocean Teal)
- **Secondary:** #1E90FF (MT Ocean Blue)
- **Reactions:** Each has unique color (red, yellow, blue, etc.)

---

## 5. ACCESSIBILITY & TESTING

### Data-testids
```
post-item-${postId}
user-roles-${userId}
post-content-${postId}
tag-badge-${tagId}
post-image-${postId}
post-video-${postId}
button-reaction-${reactionId}-${postId}
button-comment-${postId}
button-share-${postId}
button-save-${postId}
button-actions-menu-${postId}
```

### Keyboard Navigation
- Tab through all interactive elements
- Enter to activate buttons
- Escape to close modals

---

## 6. PLACES WHERE POSTITEM IS USED

- ✅ **InfiniteScrollFeed.tsx** - Main feed with infinite scroll
- ✅ **ProfileTabFeed.tsx** - User's profile post feed
- ✅ **GroupPostFeed.tsx** - Group discussion feed
- ✅ **FeedPage.tsx** - Feed page component
- ✅ **SearchResults.tsx** - Search results feed

---

## 7. REQUIRED API ENDPOINTS

All endpoints require authentication:

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/posts/{postId}/react` | Add reaction to post | ✅ |
| POST | `/api/posts/{postId}/save` | Save post | ❓ Check |
| DELETE | `/api/posts/{postId}/save` | Unsave post | ❓ Check |
| POST | `/api/posts/{postId}/share` | Share post | ✅ |
| POST | `/api/posts/{postId}/report` | Report post | ✅ |
| GET | `/api/posts/{postId}/comments` | Get comments | ✅ |
| POST | `/api/posts/{postId}/comments` | Add comment | ✅ |

---

## 8. KNOWN ISSUES & FIXES

### Issue: Reaction Selection Not Working
- **Cause:** `pointerEvents: 'auto'` missing on popup
- **Fix:** Added `pointerEvents: 'auto'` to reaction popup style
- **Status:** ✅ FIXED

### Issue: Save Button Not Responding
- **Cause:** API endpoint or mutation error handling
- **Fix:** Verify `/api/posts/{postId}/save` exists and returns proper format
- **Status:** ⏳ PENDING

---

## 9. INTEGRATION CHECKLIST

- [ ] All mutation hooks properly imported
- [ ] API endpoints exist and working
- [ ] Toast notifications on all actions
- [ ] Cache invalidation on mutations
- [ ] Error boundaries wrap components
- [ ] Dark mode colors applied
- [ ] Mobile responsive layout
- [ ] Accessibility (keyboard nav, ARIA labels)
- [ ] All data-testids present
- [ ] Performance: Lazy load images/videos
- [ ] Video base64 to Blob conversion working
- [ ] Comment section toggles correctly
- [ ] Share modal opens on click

