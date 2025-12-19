# Friendship System Documentation

**Version:** 1.0  
**Last Updated:** November 2, 2025  
**Status:** Production  
**Owner:** Social Graph Team  

---

## Table of Contents

1. [Overview](#overview)
2. [Friend Request Workflow](#friend-request-workflow)
3. [Closeness Scoring Algorithm](#closeness-scoring-algorithm)
4. [Connection Degree Pathfinding](#connection-degree-pathfinding)
5. [Mutual Friends Detection](#mutual-friends-detection)
6. [Blocking System](#blocking-system)
7. [Friend Activity Feed](#friend-activity-feed)
8. [Database Schema](#database-schema)
9. [API Reference](#api-reference)
10. [H2AC Integration](#h2ac-integration)

---

## Overview

The Friendship System manages social connections between users, enabling friend requests, relationship tracking, and social graph operations. It uses bidirectional storage for efficient querying and includes sophisticated algorithms for closeness scoring and connection discovery.

### Core Features

- **Friend Requests**: Send, accept, decline, snooze workflow
- **Closeness Scoring**: Dynamic relationship strength (0-100)
- **Mutual Friends**: Efficient detection of shared connections
- **Connection Degree**: BFS pathfinding for degrees of separation
- **Blocking**: Privacy protection and harassment prevention
- **Activity Tracking**: Interaction history for closeness calculation
- **Pagination**: Efficient friend list handling for large networks

---

## Friend Request Workflow

### Request States

```typescript
enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  SNOOZED = 'snoozed',
  CANCELLED = 'cancelled',
}
```

### Sending a Friend Request

```typescript
// POST /api/friends/request/:userId
router.post('/friends/request/:userId', authenticateToken, async (req: AuthRequest, res) => {
  const senderId = req.userId!;
  const receiverId = parseInt(req.params.userId);
  
  // Prevent self-friending
  if (senderId === receiverId) {
    return res.status(400).json({ error: 'Cannot send request to yourself' });
  }
  
  // Check for existing request or friendship
  const existing = await storage.checkFriendshipStatus(senderId, receiverId);
  if (existing) {
    return res.status(400).json({ error: 'Request or friendship already exists' });
  }
  
  const request = await storage.sendFriendRequest({
    senderId,
    receiverId,
    senderMessage: req.body.message,
    didWeDance: req.body.didWeDance || false,
    danceLocation: req.body.danceLocation,
    danceStory: req.body.danceStory,
    mediaUrls: req.body.mediaUrls || [],
    status: 'pending',
  });
  
  // Send notification
  await storage.createNotification({
    userId: receiverId,
    type: 'friend_request',
    title: `New friend request`,
    message: req.body.message || 'wants to connect with you',
    relatedId: request.id,
    relatedType: 'friend_request',
  });
  
  res.json(request);
});
```

### Accepting a Friend Request

```typescript
router.post('/friends/requests/:requestId/accept', authenticateToken, async (req: AuthRequest, res) => {
  const requestId = parseInt(req.params.requestId);
  const userId = req.userId!;
  
  const request = await storage.getFriendRequestById(requestId);
  
  // Verify receiver
  if (request.receiverId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  if (request.status !== 'pending' && request.status !== 'snoozed') {
    return res.status(400).json({ error: 'Request already processed' });
  }
  
  // Update request status
  await storage.updateFriendRequest(requestId, {
    status: 'accepted',
    receiverMessage: req.body.response,
    respondedAt: new Date(),
  });
  
  // Create bidirectional friendship
  const friendship1 = await storage.createFriendship({
    userId: request.senderId,
    friendId: request.receiverId,
    closenessScore: 75, // Starting score
    connectionDegree: 1,
    lastInteractionAt: new Date(),
  });
  
  const friendship2 = await storage.createFriendship({
    userId: request.receiverId,
    friendId: request.senderId,
    closenessScore: 75,
    connectionDegree: 1,
    lastInteractionAt: new Date(),
  });
  
  // Send acceptance notification
  await storage.createNotification({
    userId: request.senderId,
    type: 'friend_accept',
    title: 'Friend request accepted',
    message: req.body.response || 'accepted your friend request',
    relatedId: friendship1.id,
    relatedType: 'friendship',
  });
  
  res.json({
    message: 'Friend request accepted',
    friendshipIds: [friendship1.id, friendship2.id],
  });
});
```

### Declining a Friend Request

```typescript
router.post('/friends/requests/:requestId/decline', authenticateToken, async (req: AuthRequest, res) => {
  const requestId = parseInt(req.params.requestId);
  
  await storage.updateFriendRequest(requestId, {
    status: 'declined',
    respondedAt: new Date(),
  });
  
  res.json({ message: 'Friend request declined' });
});
```

### Snoozing a Friend Request

```typescript
router.post('/friends/requests/:requestId/snooze', authenticateToken, async (req: AuthRequest, res) => {
  const requestId = parseInt(req.params.requestId);
  const { snoozeUntil } = req.body; // ISO date string
  
  await storage.updateFriendRequest(requestId, {
    status: 'snoozed',
    snoozedCount: sql`${friendRequests.snoozedCount} + 1`,
    lastSnoozedAt: new Date(),
  });
  
  // Schedule reminder notification
  if (snoozeUntil) {
    await storage.scheduleNotification({
      userId: req.userId!,
      type: 'friend_request_reminder',
      scheduledFor: new Date(snoozeUntil),
      relatedId: requestId,
      relatedType: 'friend_request',
    });
  }
  
  res.json({ message: 'Friend request snoozed' });
});
```

---

## Closeness Scoring Algorithm

### Algorithm Overview

**Purpose**: Quantify relationship strength dynamically based on interactions.

**Score Range**: 0-100
- **0-40**: Acquaintance
- **41-70**: Friend
- **71-85**: Close Friend
- **86-100**: Best Friend

### Scoring Formula

```typescript
/**
 * Calculate closeness score for a friendship
 * 
 * Factors:
 * - Message frequency (weight: 2 per message)
 * - Post interactions (weight: 1 per like)
 * - Comment exchanges (weight: 3 per comment)
 * - Events attended together (weight: 5 per event)
 * - Dance sessions together (weight: 10 per session)
 * - Time decay (penalty: -1 per month of inactivity)
 * 
 * Time Complexity: O(n) where n = number of activities
 * Space Complexity: O(1)
 */
async function calculateClosenessScore(friendshipId: number): Promise<number> {
  const friendship = await db
    .select()
    .from(friendships)
    .where(eq(friendships.id, friendshipId))
    .limit(1);
  
  if (!friendship[0]) return 0;
  
  let score = 75; // Starting baseline
  
  // Get all interaction activities
  const activities = await db
    .select()
    .from(friendshipActivities)
    .where(eq(friendshipActivities.friendshipId, friendshipId));
  
  // Count activities by type
  const eventCount = activities.filter(a => a.activityType === 'event_attended_together').length;
  const messageCount = activities.filter(a => a.activityType === 'message_sent').length;
  const danceCount = activities.filter(a => a.activityType === 'dance_together').length;
  const likeCount = activities.filter(a => a.activityType === 'post_liked').length;
  const commentCount = activities.filter(a => a.activityType === 'comment_exchanged').length;
  
  // Apply weights (with caps to prevent extreme scores)
  score += Math.min(eventCount * 5, 25);     // Max +25 from events
  score += Math.min(messageCount * 2, 20);   // Max +20 from messages
  score += Math.min(danceCount * 10, 30);    // Max +30 from dancing
  score += Math.min(likeCount * 1, 10);      // Max +10 from likes
  score += Math.min(commentCount * 3, 15);   // Max +15 from comments
  
  // Time decay penalty
  const lastInteraction = friendship[0].lastInteractionAt;
  if (lastInteraction) {
    const daysSinceInteraction = Math.floor(
      (Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceInteraction > 90) {
      score -= 15; // Significant decay after 3 months
    } else if (daysSinceInteraction > 30) {
      score -= 5;  // Minor decay after 1 month
    }
  }
  
  // Clamp to valid range
  score = Math.max(0, Math.min(100, score));
  
  // Update database
  await db
    .update(friendships)
    .set({ closenessScore: score })
    .where(eq(friendships.id, friendshipId));
  
  return score;
}
```

### Activity Tracking

```typescript
/**
 * Record friendship activity for closeness scoring
 */
async function trackFriendshipActivity(
  userId1: number,
  userId2: number,
  activityType: string,
  metadata?: any
): Promise<void> {
  // Get both friendship records (bidirectional)
  const friendships = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.userId, userId1), eq(friendships.friendId, userId2)),
        and(eq(friendships.userId, userId2), eq(friendships.friendId, userId1))
      )
    );
  
  // Record activity for both directions
  for (const friendship of friendships) {
    await db.insert(friendshipActivities).values({
      friendshipId: friendship.id,
      activityType,
      metadata,
    });
    
    // Update last interaction timestamp
    await db
      .update(friendships)
      .set({ lastInteractionAt: new Date() })
      .where(eq(friendships.id, friendship.id));
  }
  
  // Recalculate closeness scores asynchronously
  setTimeout(() => {
    friendships.forEach(f => calculateClosenessScore(f.id));
  }, 0);
}
```

### Closeness Tier Badges

```typescript
function getClosenessTier(score: number): {
  tier: string;
  badge: string;
  color: string;
} {
  if (score >= 86) {
    return { tier: 'Best Friend', badge: '⭐⭐⭐', color: 'gold' };
  } else if (score >= 71) {
    return { tier: 'Close Friend', badge: '⭐⭐', color: 'blue' };
  } else if (score >= 41) {
    return { tier: 'Friend', badge: '⭐', color: 'green' };
  } else {
    return { tier: 'Acquaintance', badge: '', color: 'gray' };
  }
}
```

---

## Connection Degree Pathfinding

### Algorithm: Breadth-First Search (BFS)

**Purpose**: Find shortest path between any two users in the social graph.

```typescript
/**
 * Calculate connection degree (degrees of separation)
 * 
 * Uses BFS to find shortest path in friendship graph
 * 
 * Time Complexity: O(V + E) where V = users, E = friendships
 * Space Complexity: O(V)
 * 
 * Returns:
 * - 0: Same user
 * - 1: Direct friends
 * - 2: Friend of friend
 * - 3+: Extended network
 * - Infinity: No connection
 */
async function getConnectionDegree(userId1: number, userId2: number): Promise<number> {
  // Same user
  if (userId1 === userId2) return 0;
  
  // Check direct friendship (degree 1)
  const directFriendship = await db
    .select()
    .from(friendships)
    .where(and(
      eq(friendships.userId, userId1),
      eq(friendships.friendId, userId2)
    ))
    .limit(1);
  
  if (directFriendship.length > 0) return 1;
  
  // BFS for extended connections
  const queue: Array<{ userId: number; degree: number }> = [{ userId: userId1, degree: 0 }];
  const visited = new Set<number>([userId1]);
  
  while (queue.length > 0) {
    const { userId: currentUserId, degree } = queue.shift()!;
    
    // Get friends of current user
    const friends = await db
      .select({ friendId: friendships.friendId })
      .from(friendships)
      .where(eq(friendships.userId, currentUserId));
    
    for (const { friendId } of friends) {
      if (visited.has(friendId)) continue;
      
      // Found target user
      if (friendId === userId2) {
        return degree + 1;
      }
      
      // Add to queue for further exploration
      visited.add(friendId);
      queue.push({ userId: friendId, degree: degree + 1 });
      
      // Limit search depth to avoid excessive computation
      if (degree >= 6) break; // Kevin Bacon number limit
    }
    
    // Stop if we've explored too many nodes
    if (visited.size > 10000) break;
  }
  
  return Infinity; // No connection found
}
```

### Frontend Display

```typescript
function ConnectionDegree({ userId, targetUserId }: Props) {
  const { data: degree } = useQuery({
    queryKey: ['/api/friends/connection-degree', userId, targetUserId],
    queryFn: () => apiRequest(`/api/friends/connection-degree/${targetUserId}`, 'GET'),
  });
  
  const labels = {
    1: 'Friend',
    2: 'Friend of friend',
    3: '3rd degree connection',
    4: '4th degree connection',
    5: '5th degree connection',
    6: '6th degree connection',
  };
  
  return (
    <Badge variant="secondary">
      {degree && degree < Infinity ? labels[degree] || `${degree}th degree` : 'Not connected'}
    </Badge>
  );
}
```

---

## Mutual Friends Detection

### Algorithm

```typescript
/**
 * Find mutual friends between two users
 * 
 * Time Complexity: O(n + m) where n, m = friend counts
 * Space Complexity: O(min(n, m))
 */
async function getMutualFriends(userId1: number, userId2: number): Promise<User[]> {
  // Get friend IDs for both users
  const user1Friends = await db
    .select({ friendId: friendships.friendId })
    .from(friendships)
    .where(eq(friendships.userId, userId1));
  
  const user2Friends = await db
    .select({ friendId: friendships.friendId })
    .from(friendships)
    .where(eq(friendships.userId, userId2));
  
  // Convert to sets for efficient intersection
  const user1FriendSet = new Set(user1Friends.map(f => f.friendId));
  const user2FriendSet = new Set(user2Friends.map(f => f.friendId));
  
  // Find intersection (mutual friends)
  const mutualFriendIds = [...user1FriendSet].filter(id => user2FriendSet.has(id));
  
  // Fetch user details
  const mutualFriends = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      profileImage: users.profileImage,
    })
    .from(users)
    .where(inArray(users.id, mutualFriendIds));
  
  return mutualFriends;
}
```

### Friend Suggestions

```typescript
/**
 * Suggest friends based on mutual connections
 * 
 * Algorithm:
 * 1. Find friends of friends (degree 2)
 * 2. Exclude current friends and pending requests
 * 3. Rank by number of mutual friends
 * 4. Return top N suggestions
 */
async function getFriendSuggestions(userId: number, limit: number = 10): Promise<Suggestion[]> {
  // Get current friends
  const myFriends = await db
    .select({ friendId: friendships.friendId })
    .from(friendships)
    .where(eq(friendships.userId, userId));
  
  const friendIds = myFriends.map(f => f.friendId);
  
  // Get friends of friends
  const friendsOfFriends = await db
    .select({
      userId: friendships.userId,
      friendId: friendships.friendId,
    })
    .from(friendships)
    .where(inArray(friendships.userId, friendIds));
  
  // Count mutual friends for each suggestion
  const suggestionCounts = new Map<number, number>();
  
  for (const fof of friendsOfFriends) {
    // Skip if already friends or self
    if (friendIds.includes(fof.friendId) || fof.friendId === userId) {
      continue;
    }
    
    suggestionCounts.set(
      fof.friendId,
      (suggestionCounts.get(fof.friendId) || 0) + 1
    );
  }
  
  // Sort by mutual friend count
  const sortedSuggestions = Array.from(suggestionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  
  // Fetch user details
  const suggestions = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      profileImage: users.profileImage,
      bio: users.bio,
    })
    .from(users)
    .where(inArray(users.id, sortedSuggestions.map(s => s[0])));
  
  // Add mutual friend count
  return suggestions.map(user => ({
    ...user,
    mutualFriends: suggestionCounts.get(user.id) || 0,
  }));
}
```

---

## Blocking System

### Blocking a User

```typescript
router.post('/friends/:userId/block', authenticateToken, async (req: AuthRequest, res) => {
  const blockerId = req.userId!;
  const blockedId = parseInt(req.params.userId);
  
  // Remove existing friendship if any
  await db.delete(friendships).where(
    or(
      and(eq(friendships.userId, blockerId), eq(friendships.friendId, blockedId)),
      and(eq(friendships.userId, blockedId), eq(friendships.friendId, blockerId))
    )
  );
  
  // Create block record
  await db.insert(blockedUsers).values({
    blockerId,
    blockedId,
    reason: req.body.reason,
  });
  
  res.json({ message: 'User blocked successfully' });
});
```

### Filtering Blocked Users

```typescript
/**
 * Middleware to filter out blocked users from results
 */
async function filterBlockedUsers(userId: number, userIds: number[]): Promise<number[]> {
  // Get all blocks involving this user (blocking or blocked by)
  const blocks = await db
    .select()
    .from(blockedUsers)
    .where(
      or(
        eq(blockedUsers.blockerId, userId),
        eq(blockedUsers.blockedId, userId)
      )
    );
  
  const blockedSet = new Set<number>();
  blocks.forEach(block => {
    blockedSet.add(block.blockerId);
    blockedSet.add(block.blockedId);
  });
  
  return userIds.filter(id => !blockedSet.has(id));
}
```

---

## Friend Activity Feed

### Activity Types

```typescript
enum FriendActivityType {
  POST_CREATED = 'post_created',
  EVENT_ATTENDING = 'event_attending',
  NEW_FRIEND = 'new_friend',
  PROFILE_UPDATED = 'profile_updated',
  MILESTONE_ACHIEVED = 'milestone_achieved',
}
```

### Generating Activity Feed

```typescript
router.get('/api/friends/activity', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { limit = 20, offset = 0 } = req.query;
  
  // Get friend IDs
  const friends = await storage.getUserFriends(userId);
  const friendIds = friends.map(f => f.id);
  
  // Aggregate activities from multiple sources
  const activities = await Promise.all([
    // Friend posts
    db.select().from(posts)
      .where(inArray(posts.userId, friendIds))
      .orderBy(desc(posts.createdAt))
      .limit(limit),
    
    // Friend event RSVPs
    db.select().from(eventAttendees)
      .where(inArray(eventAttendees.userId, friendIds))
      .orderBy(desc(eventAttendees.createdAt))
      .limit(limit),
    
    // New friendships
    db.select().from(friendships)
      .where(inArray(friendships.userId, friendIds))
      .orderBy(desc(friendships.createdAt))
      .limit(limit),
  ]);
  
  // Merge and sort by timestamp
  const mergedActivities = activities.flat().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  res.json(mergedActivities.slice(offset, offset + limit));
});
```

---

## Database Schema

```sql
-- Friendships (bidirectional storage)
CREATE TABLE friendships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  closeness_score INTEGER DEFAULT 75 NOT NULL,
  connection_degree INTEGER DEFAULT 1 NOT NULL,
  last_interaction_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX friendships_user_idx ON friendships(user_id);
CREATE INDEX friendships_friend_idx ON friendships(friend_id);
CREATE INDEX friendships_closeness_idx ON friendships(closeness_score);

-- Friend Requests
CREATE TABLE friend_requests (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_message TEXT,
  receiver_message TEXT,
  did_we_dance BOOLEAN DEFAULT FALSE,
  dance_location TEXT,
  dance_story TEXT,
  media_urls TEXT[],
  status VARCHAR DEFAULT 'pending' NOT NULL,
  snoozed_count INTEGER DEFAULT 0,
  last_snoozed_at TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Friendship Activities
CREATE TABLE friendship_activities (
  id SERIAL PRIMARY KEY,
  friendship_id INTEGER NOT NULL REFERENCES friendships(id) ON DELETE CASCADE,
  activity_type VARCHAR NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blocked Users
CREATE TABLE blocked_users (
  id SERIAL PRIMARY KEY,
  blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);
```

---

## API Reference

### GET /api/friends

Get list of friends with pagination.

**Query Parameters:**
- `limit`: Number of friends (default: 20)
- `sortBy`: Sort order ('closeness' | 'recent' | 'name')

**Response:**
```json
{
  "friends": [
    {
      "id": 123,
      "name": "Maria Lopez",
      "username": "maria_tango",
      "profileImage": "https://...",
      "closenessScore": 85,
      "closenessTier": "Close Friend",
      "mutualFriends": 12
    }
  ],
  "total": 150
}
```

### POST /api/friends/request/:userId

Send friend request.

### GET /api/friends/mutual/:userId

Get mutual friends with another user.

---

## H2AC Integration

### Handoff Scenarios

#### Friend Request Spam
- **Trigger**: User sends >10 requests/hour
- **Action**: Flag for manual review
- **Escalation**: Temporary restriction after 3 flags

#### Harassment via Blocking
- **Issue**: User repeatedly creates accounts to contact blocked user
- **Response**: IP-level restriction

---

**End of Document**
