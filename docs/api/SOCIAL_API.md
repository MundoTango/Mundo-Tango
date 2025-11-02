# Social API Documentation

## Overview
Complete social networking features including posts, comments, likes, follows, groups, and saved content.

**Base URL:** `/api`

**Authentication:** All endpoints require JWT Bearer token

**Rate Limits:** 200 requests/minute per user

---

## Table of Contents
1. [Posts](#posts)
2. [Comments](#comments)
3. [Likes & Reactions](#likes--reactions)
4. [Follows](#follows)
5. [Groups](#groups)
6. [Saved Posts](#saved-posts)
7. [User Profiles](#user-profiles)

---

## Posts

### Get Feed
```
GET /api/posts
```

Get personalized feed of posts from followed users, friends, and groups.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | integer | Posts per page (default: 20, max: 100) |
| offset | integer | Pagination offset (default: 0) |
| filter | string | Filter: `all`, `friends`, `following`, `groups` |
| visibility | string | Filter by visibility: `public`, `friends`, `private` |

**Response (200 OK):**
```json
{
  "posts": [
    {
      "id": 456,
      "user": {
        "id": 123,
        "username": "johndoe",
        "name": "John Doe",
        "profileImage": "https://..."
      },
      "content": "Amazing milonga tonight at Salon Canning! 🎵",
      "plainText": "Amazing milonga tonight at Salon Canning!",
      "imageUrl": "https://...",
      "videoUrl": null,
      "location": "Salon Canning, Buenos Aires",
      "formattedAddress": "Scalabrini Ortiz 1331, Buenos Aires",
      "visibility": "public",
      "postType": "post",
      "likes": 42,
      "comments": 8,
      "shares": 3,
      "hasLiked": true,
      "hasSaved": false,
      "hashtags": ["tango", "milonga", "buenosaires"],
      "mentions": ["@janedoe"],
      "createdAt": "2024-11-02T20:30:00Z",
      "updatedAt": "2024-11-02T20:30:00Z"
    }
  ],
  "hasMore": true,
  "nextOffset": 20
}
```

**cURL Example:**
```bash
curl -X GET "https://api.mundotango.com/api/posts?limit=20&filter=friends" \
  -H "Authorization: Bearer <token>"
```

**TypeScript Example:**
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

interface Post {
  id: number;
  content: string;
  user: {
    id: number;
    username: string;
    name: string;
  };
  likes: number;
  hasLiked: boolean;
}

const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ['/api/posts'],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(`/api/posts?offset=${pageParam}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0
  });
};
```

---

### Get Single Post
```
GET /api/posts/:id
```

Get details of a specific post.

**Response (200 OK):**
```json
{
  "id": 456,
  "user": {
    "id": 123,
    "username": "johndoe",
    "name": "John Doe",
    "profileImage": "https://..."
  },
  "content": "Amazing milonga tonight!",
  "imageUrl": "https://...",
  "likes": 42,
  "comments": 8,
  "hasLiked": true,
  "createdAt": "2024-11-02T20:30:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Post doesn't exist
- `403 Forbidden` - Private post, not accessible
- `500 Internal Server Error`

---

### Create Post
```
POST /api/posts
```

Create a new post with optional media, location, and tags.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Amazing milonga tonight at Salon Canning! 🎵",
  "plainText": "Amazing milonga tonight at Salon Canning!",
  "imageUrl": "https://cdn.mundotango.com/images/post123.jpg",
  "videoUrl": null,
  "location": "Salon Canning, Buenos Aires",
  "placeId": "ChIJ...",
  "formattedAddress": "Scalabrini Ortiz 1331, Buenos Aires",
  "coordinates": {
    "lat": -34.5997,
    "lng": -58.4166
  },
  "visibility": "public",
  "hashtags": ["tango", "milonga"],
  "mentions": ["johndoe", "janedoe"],
  "eventId": 789
}
```

**Response (201 Created):**
```json
{
  "id": 456,
  "userId": 123,
  "content": "Amazing milonga tonight at Salon Canning! 🎵",
  "imageUrl": "https://...",
  "likes": 0,
  "comments": 0,
  "shares": 0,
  "createdAt": "2024-11-02T20:30:00Z"
}
```

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Amazing milonga tonight!",
    "visibility": "public",
    "hashtags": ["tango", "milonga"]
  }'
```

**TypeScript Example:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CreatePostData {
  content: string;
  visibility: 'public' | 'friends' | 'private';
  imageUrl?: string;
  hashtags?: string[];
}

const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      return apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    }
  });
};
```

---

### Update Post
```
PUT /api/posts/:id
```

Update an existing post (only author can update).

**Request Body:**
```json
{
  "content": "Updated content for my post",
  "visibility": "friends"
}
```

**Response (200 OK):**
```json
{
  "id": 456,
  "content": "Updated content for my post",
  "visibility": "friends",
  "updatedAt": "2024-11-02T21:00:00Z"
}
```

**Error Responses:**
- `403 Forbidden` - Not the post author
- `404 Not Found` - Post doesn't exist
- `500 Internal Server Error`

---

### Delete Post
```
DELETE /api/posts/:id
```

Delete a post (only author or admin can delete).

**Response (204 No Content)**

**Error Responses:**
- `403 Forbidden` - Not authorized
- `404 Not Found` - Post doesn't exist
- `500 Internal Server Error`

---

## Comments

### Get Post Comments
```
GET /api/posts/:postId/comments
```

Get all comments for a specific post (includes nested replies).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | integer | Comments per page (default: 50) |
| offset | integer | Pagination offset |
| sort | string | Sort: `recent`, `popular`, `oldest` |

**Response (200 OK):**
```json
[
  {
    "id": 789,
    "postId": 456,
    "user": {
      "id": 234,
      "username": "janedoe",
      "name": "Jane Doe",
      "profileImage": "https://..."
    },
    "content": "Looks like an amazing night!",
    "likes": 5,
    "hasLiked": false,
    "parentCommentId": null,
    "replies": [
      {
        "id": 790,
        "user": {
          "id": 123,
          "username": "johndoe",
          "name": "John Doe"
        },
        "content": "It was! You should come next time",
        "likes": 2,
        "parentCommentId": 789,
        "createdAt": "2024-11-02T20:35:00Z"
      }
    ],
    "createdAt": "2024-11-02T20:32:00Z"
  }
]
```

---

### Create Comment
```
POST /api/posts/:postId/comments
```

Add a comment to a post or reply to another comment.

**Request Body:**
```json
{
  "content": "Looks amazing! Can't wait to join next time",
  "parentCommentId": 789
}
```

**Response (201 Created):**
```json
{
  "id": 791,
  "postId": 456,
  "userId": 123,
  "content": "Looks amazing! Can't wait to join next time",
  "parentCommentId": 789,
  "likes": 0,
  "createdAt": "2024-11-02T20:40:00Z"
}
```

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/posts/456/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Looks amazing!"}'
```

---

### Update Comment
```
PUT /api/comments/:id
```

Update your own comment.

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Response (200 OK):**
```json
{
  "id": 789,
  "content": "Updated comment text",
  "updatedAt": "2024-11-02T20:45:00Z"
}
```

---

### Delete Comment
```
DELETE /api/comments/:id
```

Delete your own comment or as admin.

**Response (204 No Content)**

---

## Likes & Reactions

### Like Post
```
POST /api/posts/:id/like
```

Like a post (toggles like on/off).

**Response (200 OK):**
```json
{
  "liked": true,
  "totalLikes": 43
}
```

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/posts/456/like \
  -H "Authorization: Bearer <token>"
```

**TypeScript Example:**
```typescript
const useLikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest(`/api/posts/${postId}/like`, {
        method: 'POST'
      });
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });
    }
  });
};
```

---

### Like Comment
```
POST /api/comments/:id/like
```

Like a comment (toggles like on/off).

**Response (200 OK):**
```json
{
  "liked": true,
  "totalLikes": 6
}
```

---

## Follows

### Follow User
```
POST /api/users/:userId/follow
```

Follow another user.

**Response (200 OK):**
```json
{
  "following": true,
  "followerId": 123,
  "followingId": 456
}
```

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/users/456/follow \
  -H "Authorization: Bearer <token>"
```

---

### Unfollow User
```
DELETE /api/users/:userId/follow
```

Unfollow a user.

**Response (200 OK):**
```json
{
  "following": false
}
```

---

### Get Followers
```
GET /api/users/:userId/followers
```

Get list of users following the specified user.

**Response (200 OK):**
```json
{
  "followers": [
    {
      "id": 234,
      "username": "follower1",
      "name": "Follower One",
      "profileImage": "https://...",
      "followedAt": "2024-10-15T10:00:00Z"
    }
  ],
  "total": 150
}
```

---

### Get Following
```
GET /api/users/:userId/following
```

Get list of users that the specified user follows.

**Response (200 OK):**
```json
{
  "following": [
    {
      "id": 567,
      "username": "following1",
      "name": "Following One",
      "profileImage": "https://...",
      "followedAt": "2024-09-20T14:30:00Z"
    }
  ],
  "total": 200
}
```

---

## Groups

### Get User Groups
```
GET /api/groups
```

Get groups that the authenticated user is a member of.

**Response (200 OK):**
```json
[
  {
    "id": 10,
    "name": "Buenos Aires Tango Lovers",
    "description": "Community for tango enthusiasts in BA",
    "avatar": "https://...",
    "coverPhoto": "https://...",
    "groupType": "public",
    "category": "tango",
    "location": "Buenos Aires, Argentina",
    "memberCount": 1250,
    "role": "member",
    "joinedAt": "2024-08-01T10:00:00Z"
  }
]
```

---

### Create Group
```
POST /api/groups
```

Create a new group.

**Request Body:**
```json
{
  "name": "Milongueros Unite",
  "description": "A group for traditional tango dancers",
  "groupType": "public",
  "category": "tango",
  "location": "Buenos Aires",
  "city": "Buenos Aires",
  "country": "Argentina",
  "rules": "Be respectful, share tango content only"
}
```

**Response (201 Created):**
```json
{
  "id": 11,
  "creatorId": 123,
  "name": "Milongueros Unite",
  "description": "A group for traditional tango dancers",
  "groupType": "public",
  "memberCount": 1,
  "createdAt": "2024-11-02T22:00:00Z"
}
```

---

### Join Group
```
POST /api/groups/:id/join
```

Join a public group or request to join private group.

**Response (200 OK):**
```json
{
  "joined": true,
  "role": "member",
  "pending": false
}
```

---

### Leave Group
```
POST /api/groups/:id/leave
```

Leave a group.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Left group successfully"
}
```

---

## Saved Posts

### Save Post
```
POST /api/posts/:id/save
```

Save a post to favorites.

**Response (200 OK):**
```json
{
  "saved": true,
  "savedAt": "2024-11-02T22:15:00Z"
}
```

---

### Get Saved Posts
```
GET /api/saved-posts
```

Get all posts saved by the user.

**Response (200 OK):**
```json
{
  "savedPosts": [
    {
      "id": 999,
      "post": {
        "id": 456,
        "content": "Amazing milonga...",
        "user": {
          "id": 123,
          "name": "John Doe"
        }
      },
      "savedAt": "2024-11-02T22:15:00Z"
    }
  ]
}
```

---

### Unsave Post
```
DELETE /api/posts/:id/save
```

Remove a post from saved posts.

**Response (200 OK):**
```json
{
  "saved": false
}
```

---

## User Profiles

### Get User Profile
```
GET /api/users/:username
```

Get public profile of a user.

**Response (200 OK):**
```json
{
  "id": 456,
  "username": "janedoe",
  "name": "Jane Doe",
  "profileImage": "https://...",
  "backgroundImage": "https://...",
  "bio": "Professional tango dancer and instructor",
  "city": "Buenos Aires",
  "country": "Argentina",
  "yearsOfDancing": 10,
  "tangoRoles": ["follower", "teacher"],
  "followers": 2500,
  "following": 350,
  "posts": 180,
  "isFollowing": true,
  "isFriend": false
}
```

---

## Error Codes Reference

| Code | Message | Description |
|------|---------|-------------|
| 400 | Validation error | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | No permission to access resource |
| 404 | Not found | Resource doesn't exist |
| 409 | Already exists | Duplicate action (e.g., already following) |
| 500 | Internal server error | Server-side error |

---

## Rate Limiting

**Rate Limits:**
- General endpoints: 200 requests/minute
- Post creation: 10 posts/hour
- Comment creation: 60 comments/hour
- Like/Unlike: 300 actions/minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 1640000000
```

---

## Complete Example: Creating and Interacting with Post

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Create post
const CreatePostForm = () => {
  const createPost = useCreatePost();
  
  const handleSubmit = async (content: string) => {
    await createPost.mutateAsync({
      content,
      visibility: 'public',
      hashtags: ['tango']
    });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
};

// Display feed with interactions
const Feed = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/posts']
  });
  
  const likePost = useLikePost();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {data?.posts.map(post => (
        <div key={post.id}>
          <p>{post.content}</p>
          <button onClick={() => likePost.mutate(post.id)}>
            {post.hasLiked ? 'Unlike' : 'Like'} ({post.likes})
          </button>
        </div>
      ))}
    </div>
  );
};
```

---
