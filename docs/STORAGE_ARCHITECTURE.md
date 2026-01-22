# 📚 storage.ts Architecture Documentation

**File:** `server/storage.ts`  
**Size:** 330KB, 8,882 lines  
**Purpose:** Unified data access layer for all database operations  
**Status:** Monolith (future refactoring recommended)

---

## 🎯 Purpose of This Document

This document helps developers:

1. **Navigate** the 8,882-line storage.ts file
2. **Understand** domain boundaries within the monolith
3. **Find** methods quickly by domain
4. **Plan** future refactoring efforts

---

## 🗺️ Domain Map

storage.ts contains ~700 methods organized across 10 logical domains:

| Domain                | Methods | Tables                  | Lines (approx) |
| --------------------- | ------- | ----------------------- | -------------- |
| 🔐 **Authentication** | ~100    | users, tokens, 2FA      | 800-1200       |
| 👥 **Social**         | ~150    | posts, friends, follows | 1500-2000      |
| 📅 **Events**         | ~80     | events, RSVPs, photos   | 800-1000       |
| 👫 **Groups**         | ~70     | groups, members, posts  | 700-900        |
| 🏠 **Housing**        | ~50     | listings, bookings      | 500-700        |
| 🚀 **Platform**       | ~80     | deployments, CI/CD      | 800-1000       |
| 🤖 **AI (Mr. Blue)**  | ~70     | conversations, errors   | 700-900        |
| 🏙️ **Communities**    | ~40     | communities, venues     | 400-600        |
| 📝 **Content**        | ~50     | blogs, tutorials, media | 500-700        |
| 💬 **Messaging**      | ~30     | chat, notifications     | 300-500        |

**Total:** ~720 methods

---

## 🔍 Quick Method Finder

### 🔐 Authentication Domain

**User Management:**

- `getUserById(id)` - Fetch user by ID
- `getUserByEmail(email)` - Fetch user by email
- `getUserByUsername(username)` - Fetch user by username
- `createUser(user)` - Register new user
- `updateUser(id, data)` - Update user profile
- `updateUserPassword(id, hash)` - Change password

**Tokens:**

- `createRefreshToken(token)` - Create refresh token
- `getRefreshToken(token)` - Validate refresh token
- `deleteRefreshToken(token)` - Logout/revoke token
- `createEmailVerificationToken(token)` - Email verification
- `createPasswordResetToken(token)` - Password reset flow

**2FA:**

- `createTwoFactorSecret(secret)` - Enable 2FA
- `getTwoFactorSecret(userId)` - Verify 2FA code
- `updateTwoFactorSecret(userId, secret)` - Update 2FA
- `deleteTwoFactorSecret(userId)` - Disable 2FA

---

### 👥 Social Domain

**Posts:**

- `createPost(post)` - Create new post
- `getPostById(id)` - Fetch single post
- `getPosts(params)` - Feed query with filters
- `updatePost(id, data)` - Edit post
- `deletePost(id)` - Remove post
- `likePost(postId, userId)` - Like a post
- `unlikePost(postId, userId)` - Unlike a post
- `savePost(postId, userId)` - Bookmark post
- `createPostComment(comment)` - Add comment

**Friends:**

- `getUserFriends(userId)` - Get user's friends list
- `sendFriendRequest(data)` - Send friend request
- `acceptFriendRequest(requestId)` - Accept request
- `declineFriendRequest(requestId)` - Decline request
- `getMutualFriends(userId1, userId2)` - Common friends
- `getFriendshipStats(userId, friendId)` - Friendship metrics
- `removeFriend(userId, friendId)` - Unfriend

**Follows:**

- `followUser(followerId, followingId)` - Follow user
- `unfollowUser(followerId, followingId)` - Unfollow
- `getFollowers(userId)` - Get followers
- `getFollowing(userId)` - Get following

**Blocking:**

- `blockUser(userId, blockedUserId)` - Block user
- `unblockUser(userId, blockedUserId)` - Unblock
- `getBlockedUsers(userId)` - Blocked list

---

### 📅 Events Domain

**Events:**

- `createEvent(event)` - Create event
- `getEventById(id)` - Fetch event details
- `getEvents(params)` - Query events by city/date/type
- `updateEvent(id, data)` - Edit event
- `deleteEvent(id)` - Cancel event
- `searchEvents(params)` - Full-text search

**RSVPs:**

- `createEventRsvp(rsvp)` - RSVP to event
- `getEventRsvps(eventId)` - Get attendees
- `updateEventRsvp(eventId, userId, status)` - Change RSVP
- `getUserRsvps(userId)` - User's upcoming events
- `checkInEventAttendee(eventId, userId)` - Check-in at event

**Photos:**

- `uploadEventPhoto(photo)` - Upload event photo
- `getEventPhotos(eventId)` - Get photo gallery
- `deleteEventPhoto(id)` - Remove photo
- `featureEventPhoto(photoId)` - Set as cover

**Comments:**

- `createEventComment(comment)` - Comment on event
- `getEventComments(eventId)` - Get discussions

---

### 👫 Groups Domain

**Groups:**

- `createGroup(group)` - Create new group
- `getGroupById(id)` - Fetch group details
- `getGroupBySlug(slug)` - Fetch by URL slug
- `getGroups(params)` - Browse groups
- `searchGroups(query)` - Search groups
- `getSuggestedGroups(userId)` - Recommendations

**Membership:**

- `joinGroup(groupId, userId)` - Join group
- `leaveGroup(groupId, userId)` - Leave group
- `getGroupMembers(groupId)` - List members
- `updateGroupMember(groupId, userId, data)` - Update role
- `banGroupMember(groupId, userId)` - Ban member

**Invites:**

- `sendGroupInvite(invite)` - Invite to group
- `getUserGroupInvites(userId)` - Pending invites
- `acceptGroupInvite(inviteId)` - Accept invite
- `declineGroupInvite(inviteId)` - Decline

**Posts:**

- `createGroupPost(post)` - Post to group
- `getGroupPosts(groupId)` - Group feed
- `pinGroupPost(postId)` - Pin announcement
- `approveGroupPost(postId, approverId)` - Moderate post

---

### 🏠 Housing Domain

**Listings:**

- `createHousingListing(listing)` - Create listing
- `getHousingListingById(id)` - View listing
- `getHousingListings(params)` - Search listings
- `updateHousingListing(id, data)` - Edit listing
- `deleteHousingListing(id)` - Remove listing

**Bookings:**

- `createHousingBooking(booking)` - Book stay
- `getHousingBookings(params)` - Booking history
- `updateHousingBooking(id, data)` - Modify booking
- `deleteHousingBooking(id)` - Cancel booking

---

### 🚀 Platform Domain

**Deployments:**

- `createDeployment(deployment)` - Log deployment
- `getDeployments(params)` - Deployment history
- `getDeploymentByVercelId(id)` - Fetch by Vercel ID

**Integrations:**

- `createPlatformIntegration(integration)` - Connect platform
- `getPlatformIntegration(userId, platform)` - Get connection
- `updatePlatformIntegration(id, data)` - Update tokens

**Environment Variables:**

- `createEnvironmentVariable(envVar)` - Add secret
- `getEnvironmentVariables(params)` - List secrets
- `updateEnvironmentVariable(id, data)` - Update secret

**CI/CD:**

- `createCicdPipeline(pipeline)` - Create pipeline
- `createCicdRun(run)` - Log CI/CD run
- `getCicdRuns(pipelineId)` - Build history

---

### 🤖 AI (Mr. Blue) Domain

**Conversations:**

- `createMrBlueConversation(data)` - Start chat
- `getMrBlueConversationMessages(conversationId)` - Chat history
- `createMrBlueMessage(message)` - Add message
- `getOrCreateActiveMrBlueConversation(userId)` - Get/create active chat

**Error Patterns:**

- `createErrorPattern(data)` - Log error pattern
- `searchErrorPatterns(keywords)` - Find similar errors
- `updateErrorPattern(id, data)` - Update solution

**User Preferences:**

- `saveUserPreference(data)` - Save preference
- `getUserPreferences(userId, category)` - Get prefs
- `getUserPreferenceByKey(userId, key)` - Get specific pref

---

### 🏙️ Communities Domain

**Communities:**

- `getCommunityByCity(cityName)` - Get community
- `createCommunity(data)` - Create community
- `joinCommunity(communityId, userId)` - Join

**Venues:**

- `createVenue(venue)` - Add venue
- `getVenues(params)` - Browse venues
- `getVenueById(id)` - Venue details

**Teachers:**

- `createTeacher(teacher)` - Add teacher profile
- `getTeachers(params)` - Browse teachers
- `getTeacherByUserId(userId)` - User's teacher profile

---

### 📝 Content Domain

**Blog Posts:**

- `createBlogPost(post)` - Publish blog
- `getBlogPosts(params)` - List blogs
- `getBlogPostBySlug(slug)` - Fetch by URL

**Tutorials:**

- `createTutorial(tutorial)` - Add tutorial
- `getTutorials(params)` - Browse tutorials

**Media:**

- `createMedia(media)` - Upload media
- `getUserMedia(userId, params)` - User's media library

---

### 💬 Messaging Domain

**Chat:**

- `getUserConversations(userId)` - List chats
- `getOrCreateDirectConversation(userId1, userId2)` - DM
- `sendMessage(message)` - Send message
- `getChatRoomMessages(chatRoomId)` - Message history

**Notifications:**

- `createNotification(notification)` - Send notification
- `getUserNotifications(userId)` - Inbox
- `markNotificationAsRead(id)` - Mark read

---

## 🛠️ Usage Examples

### Example 1: Creating a Post

```typescript
import { storage } from "./storage";

// Create post
const post = await storage.createPost({
  userId: 123,
  content: "Hello Mundo Tango!",
  visibility: "public",
});

// Get post with user data
const fullPost = await storage.getPostById(post.id);
```

### Example 2: Friend Request Flow

```typescript
// Send request
await storage.sendFriendRequest({
  senderId: 123,
  receiverId: 456,
  message: "Met you at the milonga!",
});

// Accept request
const requests = await storage.getFriendRequests(456);
await storage.acceptFriendRequest(requests[0].id);

// Get mutual friends
const mutualFriends = await storage.getMutualFriends(123, 456);
```

### Example 3: Event with RSVP

```typescript
// Create event
const event = await storage.createEvent({
  title: "Milonga Night",
  city: "Buenos Aires",
  startDate: new Date("2026-02-01"),
  organizerId: 123,
});

// RSVP
await storage.createEventRsvp({
  eventId: event.id,
  userId: 456,
  status: "going",
  guestCount: 2,
});

// Get attendees
const attendees = await storage.getEventRsvps(event.id);
```

---

## 🔮 Future Refactoring Plan

**When to refactor:** After Phase 5 (CRUD testing) when we have comprehensive test coverage.

**Proposed structure:**

```
server/storage/
├── index.ts              # Re-export unified interface
├── base.storage.ts       # Shared db instance + utilities
├── auth.storage.ts       # Authentication (~800 lines)
├── social.storage.ts     # Posts, friends, follows (~1500 lines)
├── events.storage.ts     # Events, RSVPs (~800 lines)
├── groups.storage.ts     # Groups, members (~700 lines)
├── housing.storage.ts    # Listings, bookings (~500 lines)
├── platform.storage.ts   # Deployments, CI/CD (~800 lines)
├── ai.storage.ts         # Mr. Blue, errors (~700 lines)
├── community.storage.ts  # Communities, venues (~500 lines)
├── content.storage.ts    # Blogs, tutorials (~500 lines)
└── messaging.storage.ts  # Chat, notifications (~400 lines)
```

**Benefits:**

- Easier to navigate (12 files vs 1)
- Faster TypeScript compilation
- Reduced merge conflicts
- Clear domain boundaries
- Independent testing

**Risks:**

- Circular dependencies
- Breaking existing imports
- Time investment (12-16 hours)

**Prerequisites:**

- Comprehensive E2E test coverage
- CI/CD pipeline for validation
- Gradual rollout strategy

---

## 📖 Related Documentation

- [Audit Report](file:///Users/scottboddye/.gemini/antigravity/brain/588db685-86b6-46c9-994f-a2113fcce1a3/audit_report.md) - Original finding
- [Phase 2 Implementation Plan](file:///Users/scottboddye/.gemini/antigravity/brain/588db685-86b6-46c9-994f-a2113fcce1a3/phase2_implementation_plan.md) - Detailed refactor strategy
- [Schema Documentation](file:///Users/scottboddye/Desktop/Mundo-Tango/server/db/schema.ts) - Database schema

---

**Last Updated:** January 22, 2026  
**Status:** ✅ Documentation complete, refactoring deferred to post-testing phase
