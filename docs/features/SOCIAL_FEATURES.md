# Social Features Documentation

**Version:** 1.0  
**Last Updated:** November 2, 2025  
**Status:** Production  
**Owner:** Social Engagement Team  

---

## Table of Contents

1. [Overview](#overview)
2. [Post Management](#post-management)
3. [Commenting System](#commenting-system)
4. [Engagement Actions](#engagement-actions)
5. [Privacy Controls](#privacy-controls)
6. [Content Moderation](#content-moderation)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [H2AC Integration](#h2ac-integration)

---

## Overview

The Social Features module provides comprehensive social networking capabilities for Mundo Tango, enabling users to share tango moments, engage with content, and build community connections.

### Core Features

- **Post Creation**: Text, image, and video posts with rich content support
- **Comment System**: Nested comment threads with real-time updates
- **Engagement**: Like, share, and bookmark functionality
- **Privacy**: Granular visibility controls (public/friends/private)
- **Moderation**: AI-powered spam detection and content flagging
- **Edit History**: Post versioning with edit tracking
- **Media Support**: Images, videos, and embedded content

### Architecture

```
┌─────────────┐
│   Client    │ (React + TanStack Query)
└──────┬──────┘
       │ REST API
┌──────▼──────┐
│   Router    │ (Express Routes)
└──────┬──────┘
       │
┌──────▼──────┐
│  Storage    │ (IStorage Interface)
└──────┬──────┘
       │
┌──────▼──────┐
│  Database   │ (PostgreSQL via Drizzle ORM)
└─────────────┘
```

---

## Post Management

### Post Creation

#### Schema

```typescript
interface Post {
  id: number;
  userId: number;
  eventId?: number | null;
  content: string;
  richContent?: object | null;
  plainText?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  mediaEmbeds?: string[];
  mentions?: string[];
  hashtags?: string[];
  tags?: string[];
  location?: string | null;
  coordinates?: { lat: number; lng: number } | null;
  placeId?: string | null;
  formattedAddress?: string | null;
  visibility: 'public' | 'friends' | 'private';
  postType: 'post' | 'share' | 'memory';
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Creating a Post

**Frontend Implementation:**

```typescript
// client/src/pages/FeedPage.tsx
const createPostMutation = useMutation({
  mutationFn: (data: { content: string; imageUrl?: string; visibility: string; tags: string[] }) =>
    apiRequest('/api/posts', 'POST', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    toast({ title: "Post created successfully!" });
  },
});

const handleCreatePost = (e: React.FormEvent) => {
  e.preventDefault();
  createPostMutation.mutate({
    content,
    imageUrl: imageUrl || undefined,
    visibility,
    tags: selectedTags,
  });
};
```

**Backend Handler:**

```typescript
// server/routes.ts
router.post('/api/posts', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const validatedData = insertPostSchema.parse(req.body);
  
  const post = await storage.createPost({
    ...validatedData,
    userId,
    plainText: stripHtml(validatedData.content),
  });
  
  res.json(post);
});
```

#### Image Upload Flow

```typescript
// Image upload with Replit object storage
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });
  
  const { url } = await response.json();
  setImageUrl(url);
  setImagePreview(URL.createObjectURL(file));
};
```

### Post Editing

#### Edit History Tracking

```typescript
// Before update - save current version to history
const editPost = async (postId: number, newContent: string) => {
  // Fetch current post
  const currentPost = await storage.getPostById(postId);
  
  // Save to edit history
  await storage.createPostEditHistory({
    postId,
    previousContent: currentPost.content,
    editedAt: new Date(),
  });
  
  // Update post
  await storage.updatePost(postId, {
    content: newContent,
    updatedAt: new Date(),
  });
};
```

### Post Deletion

**Soft Delete with Cascade:**

```typescript
router.delete('/api/posts/:id', authenticateToken, async (req: AuthRequest, res) => {
  const postId = parseInt(req.params.id);
  const userId = req.userId!;
  
  // Verify ownership
  const post = await storage.getPostById(postId);
  if (post.userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  // Cascade delete (handled by ON DELETE CASCADE in schema)
  // Deletes: comments, likes, shares, bookmarks
  await storage.deletePost(postId);
  
  res.json({ message: 'Post deleted successfully' });
});
```

---

## Commenting System

### Nested Comments

#### Schema

```typescript
interface Comment {
  id: number;
  postId: number;
  userId: number;
  parentCommentId?: number | null;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Comment Tree Structure

```typescript
/**
 * Build nested comment tree from flat array
 */
function buildCommentTree(comments: Comment[]): CommentNode[] {
  const commentMap = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];
  
  // First pass: create nodes
  comments.forEach(comment => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
    });
  });
  
  // Second pass: build tree
  comments.forEach(comment => {
    const node = commentMap.get(comment.id)!;
    
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies.push(node);
      }
    } else {
      roots.push(node);
    }
  });
  
  return roots;
}
```

#### Creating Comments

```typescript
// client/src/components/PostActions.tsx
const createCommentMutation = useMutation({
  mutationFn: (data: { content: string; parentId?: number }) =>
    apiRequest(`/api/posts/${postId}/comments`, 'POST', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'comments'] });
    setCommentText('');
  },
});
```

#### Comment Sorting

```typescript
enum CommentSortOrder {
  RECENT = 'recent',
  POPULAR = 'popular',
  OLDEST = 'oldest',
}

function sortComments(comments: Comment[], order: CommentSortOrder): Comment[] {
  switch (order) {
    case CommentSortOrder.RECENT:
      return [...comments].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    case CommentSortOrder.POPULAR:
      return [...comments].sort((a, b) => b.likes - a.likes);
    
    case CommentSortOrder.OLDEST:
      return [...comments].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }
}
```

---

## Engagement Actions

### Like/Unlike

#### Optimistic Updates

```typescript
// client/src/components/PostActions.tsx
const [liked, setLiked] = useState(initialLiked);
const [likes, setLikes] = useState(likeCount);

const likeMutation = useMutation({
  mutationFn: () => apiRequest(`/api/posts/${postId}/like`, 'POST'),
  onMutate: () => {
    // Optimistic update
    setLiked(true);
    setLikes(prev => prev + 1);
  },
  onError: () => {
    // Rollback on error
    setLiked(false);
    setLikes(prev => prev - 1);
    toast({ title: "Failed to like post", variant: "destructive" });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
  },
});

const handleLike = () => {
  if (liked) {
    unlikeMutation.mutate();
  } else {
    likeMutation.mutate();
  }
};
```

#### Backend Implementation

```typescript
router.post('/api/posts/:id/like', authenticateToken, async (req: AuthRequest, res) => {
  const postId = parseInt(req.params.id);
  const userId = req.userId!;
  
  // Check if already liked
  const existing = await storage.getPostLike(postId, userId);
  if (existing) {
    return res.status(400).json({ error: 'Already liked' });
  }
  
  // Create like and increment counter
  await storage.createPostLike({ postId, userId });
  await storage.incrementPostLikes(postId);
  
  res.json({ message: 'Post liked' });
});

router.delete('/api/posts/:id/like', authenticateToken, async (req: AuthRequest, res) => {
  const postId = parseInt(req.params.id);
  const userId = req.userId!;
  
  await storage.deletePostLike(postId, userId);
  await storage.decrementPostLikes(postId);
  
  res.json({ message: 'Post unliked' });
});
```

### Share Functionality

```typescript
// Share Modal Component
interface ShareModalProps {
  postId: number;
  postContent: string;
  onShare: (platform: string) => void;
}

const ShareModal = ({ postId, postContent, onShare }: ShareModalProps) => {
  const platforms = [
    { name: 'Facebook', icon: Facebook, url: `https://facebook.com/sharer.php?u=${shareUrl}` },
    { name: 'Twitter', icon: Twitter, url: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${postContent}` },
    { name: 'WhatsApp', icon: MessageCircle, url: `https://wa.me/?text=${shareUrl}` },
    { name: 'Copy Link', icon: Link, action: 'copy' },
  ];
  
  // Track share
  const handleShare = async (platform: string) => {
    await apiRequest(`/api/posts/${postId}/share`, 'POST', { platform });
    onShare(platform);
  };
};
```

### Bookmark System

```typescript
// Saved Posts (Bookmarks)
const saveMutation = useMutation({
  mutationFn: () => apiRequest(`/api/posts/${postId}/save`, 'POST'),
  onMutate: () => setSaved(true),
  onError: () => {
    setSaved(false);
    toast({ title: "Failed to save post", variant: "destructive" });
  },
});

const unsaveMutation = useMutation({
  mutationFn: () => apiRequest(`/api/posts/${postId}/save`, 'DELETE'),
  onMutate: () => setSaved(false),
  onError: () => {
    setSaved(true);
    toast({ title: "Failed to unsave post", variant: "destructive" });
  },
});
```

---

## Privacy Controls

### Visibility Levels

```typescript
enum PostVisibility {
  PUBLIC = 'public',     // Visible to everyone
  FRIENDS = 'friends',   // Visible to friends only
  PRIVATE = 'private',   // Visible to author only
}
```

### Access Control

```typescript
/**
 * Check if user can view post based on visibility settings
 */
async function canViewPost(
  post: Post,
  viewerId: number,
  viewerFriendIds: number[]
): Promise<boolean> {
  // Author can always view their own posts
  if (post.userId === viewerId) {
    return true;
  }
  
  switch (post.visibility) {
    case 'public':
      return true;
    
    case 'friends':
      return viewerFriendIds.includes(post.userId);
    
    case 'private':
      return false;
    
    default:
      return false;
  }
}
```

### Filtering Posts by Visibility

```typescript
// Get posts visible to current user
router.get('/api/posts', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  
  // Get user's friends
  const friends = await storage.getUserFriends(userId);
  const friendIds = friends.map(f => f.id);
  
  // Fetch posts with visibility filter
  const posts = await storage.getPosts({
    where: or(
      eq(posts.visibility, 'public'),
      and(
        eq(posts.visibility, 'friends'),
        inArray(posts.userId, friendIds)
      ),
      eq(posts.userId, userId) // Always show own posts
    ),
  });
  
  res.json(posts);
});
```

---

## Content Moderation

### Spam Detection Integration

```typescript
// server/routes.ts
import { spamDetection } from './algorithms/spam-detection';

router.post('/api/posts', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { content } = req.body;
  
  // Get recent post count for spam detection
  const recentPosts = await storage.getRecentPostsByUser(userId, 1); // Last hour
  
  // Run spam detection
  const spamResult = await spamDetection.analyzeContent(
    content,
    userId,
    recentPosts.length
  );
  
  if (spamResult.isSpam) {
    return res.status(400).json({
      error: 'Content flagged as spam',
      reason: spamResult.reason,
      confidence: spamResult.confidence,
    });
  }
  
  // Create post if not spam
  const post = await storage.createPost({
    ...req.body,
    userId,
  });
  
  res.json(post);
});
```

### Report System

```typescript
interface ReportSchema {
  contentType: 'post' | 'comment';
  contentId: number;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
  details?: string;
}

router.post('/api/reports', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const report = await storage.createReport({
    ...req.body,
    reporterId: userId,
    status: 'pending',
  });
  
  // Notify moderators
  await notifyModerators(report);
  
  res.json({ message: 'Report submitted successfully' });
});
```

---

## Database Schema

### Posts Table

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rich_content JSONB,
  plain_text TEXT,
  image_url TEXT,
  video_url TEXT,
  media_embeds JSONB,
  mentions TEXT[],
  hashtags TEXT[],
  tags TEXT[],
  location TEXT,
  coordinates JSONB,
  place_id TEXT,
  formatted_address TEXT,
  visibility VARCHAR DEFAULT 'public',
  post_type VARCHAR DEFAULT 'post',
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX posts_user_idx ON posts(user_id);
CREATE INDEX posts_event_idx ON posts(event_id);
CREATE INDEX posts_created_at_idx ON posts(created_at);
CREATE INDEX posts_visibility_idx ON posts(visibility);
```

### Comments Table

```sql
CREATE TABLE post_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id INTEGER REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX post_comments_post_idx ON post_comments(post_id);
CREATE INDEX post_comments_user_idx ON post_comments(user_id);
CREATE INDEX post_comments_parent_idx ON post_comments(parent_comment_id);
```

### Engagement Tables

```sql
-- Likes
CREATE TABLE post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Shares
CREATE TABLE post_shares (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE saved_posts (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

---

## API Reference

### POST /api/posts

Create a new post.

**Request:**
```json
{
  "content": "Just finished my first milonga! Amazing experience! 💃",
  "imageUrl": "https://storage.replit.com/posts/abc123.jpg",
  "visibility": "public",
  "tags": ["milonga", "beginner", "buenos-aires"],
  "location": "La Catedral, Buenos Aires",
  "mentions": ["@username1", "@username2"]
}
```

**Response (201):**
```json
{
  "id": 123,
  "userId": 1,
  "content": "Just finished my first milonga! Amazing experience! 💃",
  "imageUrl": "https://storage.replit.com/posts/abc123.jpg",
  "visibility": "public",
  "likes": 0,
  "comments": 0,
  "shares": 0,
  "createdAt": "2025-11-02T10:00:00Z"
}
```

### GET /api/posts

Get posts feed with pagination.

**Query Parameters:**
- `limit`: Number of posts (default: 20)
- `offset`: Pagination offset (default: 0)
- `userId`: Filter by user ID
- `visibility`: Filter by visibility

**Response (200):**
```json
{
  "posts": [...],
  "total": 150,
  "hasMore": true
}
```

### POST /api/posts/:id/like

Like a post.

**Response (200):**
```json
{
  "message": "Post liked",
  "likes": 15
}
```

### POST /api/posts/:id/comments

Create a comment on a post.

**Request:**
```json
{
  "content": "Great moves! Keep it up!",
  "parentCommentId": null
}
```

---

## H2AC Integration

### Handoff Notes for Human Agents

#### Content Moderation Review
- **Trigger**: Post/comment flagged with confidence > 0.8
- **Action Required**: Manual review within 24 hours
- **Escalation**: Suspend user if 3+ violations

#### User Support
- **Issue**: "My post was deleted"
- **Response**: Check moderation logs, restore if false positive

#### Feature Requests
- **Common Request**: Video upload support
- **Status**: Planned for Q2 2026
- **Workaround**: Use YouTube embed links

---

**End of Document**
