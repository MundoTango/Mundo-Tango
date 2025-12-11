# MB.MD v9.9.4 COMPREHENSIVE TESTING PLAN
## Mundo Tango Platform - Field-by-Field Database Testing

**Created**: December 11, 2025  
**Methodology**: MB.MD v9.9.4 (Research → Plan → Build → Test → Fix → Document)

---

## TABLE OF CONTENTS

1. [Database Schema Overview](#database-schema-overview)
2. [Tier 1: Critical Social Features](#tier-1-critical-social-features)
3. [Tier 2: Groups & Events](#tier-2-groups--events)
4. [Tier 3: Messaging](#tier-3-messaging)
5. [Tier 4: Place Recommendations](#tier-4-place-recommendations)
6. [City Normalization Flow](#city-normalization-flow)
7. [@Mention Flow Matrix](#mention-flow-matrix)
8. [Cross-Flow Integration Tests](#cross-flow-integration-tests)

---

## DATABASE SCHEMA OVERVIEW

**Total Tables**: 100+ tables across 4 tiers  
**Priority Queue**: 53 critical, 40 high, 205 medium, 14 low

### Test Data Matrix

| User | ID | City | Test Role |
|------|----|------|-----------|
| admin | 1 | Buenos Aires | Receive mentions, notifications, admin features |
| Maria | 3 | Buenos Aires | Friend requests with dance story |
| Carlos | 4 | Berlin | Events, posts in Berlin group |
| Sofia | 5 | Montevideo | Reactions, comments, sub-comments |
| Diego | 6 | NYC | Media uploads, place recommendations |
| Luna | 7 | Paris | Sharing, favorites, report feature |

---

## TIER 1: CRITICAL SOCIAL FEATURES

### 1. posts Table (lines 1320-1388)

| Field | Type | Test Action |
|-------|------|-------------|
| `content` | text | Create post, verify stored |
| `mentions` | text[] | Parse @user/@city/@event, verify array populated |
| `hashtags` | text[] | Parse #hashtags, verify array populated |
| `mediaGallery` | jsonb | Upload image/video, verify compression & URL |
| `visibility` | varchar | Test public/private/friends-only filtering |
| `likes`, `comments`, `shares` | integer | Verify counters increment on actions |
| `location`, `coordinates`, `placeId` | text/jsonb | Add location, verify geocoding |

**Test Scenarios:**
- [ ] CREATE post with text only
- [ ] CREATE post with @user mention → notification to user
- [ ] CREATE post with @city mention → post appears in city group
- [ ] CREATE post with @event mention → post linked to event
- [ ] CREATE post with #hashtag → searchable by hashtag
- [ ] CREATE post with media → verify Cloudinary compression
- [ ] UPDATE post (author only) → verify edit saved
- [ ] DELETE post (author only) → verify cascade deletes
- [ ] READ post feed → verify visibility filtering

---

### 2. notifications Table (lines 1657-1690)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to user receiving notification |
| `type` | varchar | friend_request, mention, like, comment, share |
| `title`, `message` | text | Verify content populated |
| `isRead` | boolean | Mark read, verify toggle |
| `actionUrl` | text | Verify link to source |

**Test Scenarios:**
- [ ] CREATE notification on friend request sent
- [ ] CREATE notification on @mention
- [ ] CREATE notification on post like
- [ ] CREATE notification on comment
- [ ] MARK notification as read
- [ ] COUNT unread notifications (badge)

---

### 3. friendRequests Table (lines 2680-2738)

| Field | Type | Test Action |
|-------|------|-------------|
| `senderId`, `receiverId` | integer | FK to users |
| `status` | varchar | pending/accepted/declined/snoozed |
| `didWeDance`, `danceLocation`, `danceStory` | various | Dance story form |
| `senderMessage`, `senderPrivateNote` | text | Personal messages |
| `mediaUrls` | text[] | Attached photos/videos |
| `snoozedUntil` | timestamp | Snooze feature |

**Test Scenarios:**
- [ ] SEND friend request with message
- [ ] SEND friend request with dance story
- [ ] SEND friend request with media
- [ ] SNOOZE friend request
- [ ] ACCEPT friend request → creates friendship
- [ ] DECLINE friend request
- [ ] VERIFY notification created for receiver

---

### 4. friendships Table (lines 3684-3711)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId`, `friendId` | integer | FK to users |
| `closenessScore` | integer | 0-100 score |
| `connectionDegree` | integer | 1 = direct friend |
| `status` | varchar | active/blocked |

**Test Scenarios:**
- [ ] CREATE friendship on request accept
- [ ] UPDATE closeness score on interactions
- [ ] GET mutual friends
- [ ] GET friendship details
- [ ] BLOCK friend → update status

---

### 5. postComments Table (lines 1409-1430)

| Field | Type | Test Action |
|-------|------|-------------|
| `postId` | integer | FK to post |
| `userId` | integer | FK to commenter |
| `parentCommentId` | integer | For sub-comments/replies |
| `content` | text | Comment text |
| `likes` | integer | Comment likes counter |

**Test Scenarios:**
- [ ] CREATE comment on post
- [ ] CREATE sub-comment (reply)
- [ ] LIKE comment
- [ ] DELETE comment (author only)
- [ ] VERIFY post.comments counter updates

---

### 6. reactions Table (lines 3820-3841)

| Field | Type | Test Action |
|-------|------|-------------|
| `postId` | integer | FK to post |
| `userId` | integer | FK to user |
| `reactionType` | varchar | 13 types: love, passion, fire, tango, celebrate, brilliant, support, hug, sad, cry, thinking, shock, angry |

**Test Scenarios:**
- [ ] ADD reaction to post
- [ ] CHANGE reaction type
- [ ] REMOVE reaction
- [ ] GET reaction counts by type

---

### 7. postShares Table (lines 3794-3817)

| Field | Type | Test Action |
|-------|------|-------------|
| `postId` | integer | FK to post |
| `userId` | integer | FK to sharer |
| `shareType` | varchar | facebook, instagram, twitter, copy_link |
| `comment` | text | Share comment |

**Test Scenarios:**
- [ ] SHARE to Facebook
- [ ] SHARE to Instagram
- [ ] SHARE via copy link
- [ ] VERIFY post.shares counter updates

---

### 8. savedPosts Table (lines 2660-2677)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to user |
| `postId` | integer | FK to post |

**Test Scenarios:**
- [ ] SAVE post → appears in Favorites
- [ ] UNSAVE post
- [ ] GET saved posts list (Favorites page)

---

### 9. reportedProfiles Table (lines 563-587)

| Field | Type | Test Action |
|-------|------|-------------|
| `reporterId` | integer | FK to reporter |
| `reportedUserId` | integer | FK to reported user |
| `reason` | text | Report reason |
| `status` | varchar | pending/reviewed/resolved/dismissed |
| `adminNotes` | text | Admin response |

**Test Scenarios:**
- [ ] REPORT user → appears in admin panel
- [ ] ADMIN review report
- [ ] ADMIN resolve/dismiss report

---

## TIER 2: GROUPS & EVENTS

### 10. groups Table (lines 1036-1106)

| Field | Type | Test Action |
|-------|------|-------------|
| `name`, `slug` | varchar | Group identity |
| `type` | varchar | city, pro, general |
| `city`, `country` | varchar | Location binding |
| `latitude`, `longitude` | numeric | Coordinates |
| `memberCount`, `postCount`, `eventCount` | integer | Counters |

**Test Scenarios:**
- [ ] CREATE city group (auto-created from user location)
- [ ] JOIN group as member
- [ ] FOLLOW group as follower
- [ ] POST to group → verify groupPosts created
- [ ] VERIFY posts with @city go to city group

---

### 11. groupMembers Table (lines 1108-1173)

| Field | Type | Test Action |
|-------|------|-------------|
| `groupId` | integer | FK to group |
| `userId` | integer | FK to user |
| `role` | varchar | member/follower/admin/moderator |
| `canPost`, `canComment`, `canCreateEvents` | boolean | Permissions |

**Test Scenarios:**
- [ ] VERIFY member vs follower permissions
- [ ] TAG posts as member/non-member

---

### 12. events Table (lines 665-823)

| Field | Type | Test Action |
|-------|------|-------------|
| `title`, `description` | text | Event content |
| `startDate`, `endDate` | timestamp | Scheduling |
| `city`, `country`, `latitude`, `longitude` | various | Location |
| `groupId` | integer | FK to city group |
| `seriesId` | integer | FK to eventSeries |
| `status` | varchar | draft/published/cancelled |
| `eventType` | varchar | milonga/workshop/festival/etc |

**Test Scenarios:**
- [ ] CREATE event → auto-links to city group
- [ ] @event mention in post → links post to event
- [ ] Recurring event detection → seriesId linked

---

## TIER 3: MESSAGING

### 13. directMessages Table (lines 1584-1618)

| Field | Type | Test Action |
|-------|------|-------------|
| `senderId`, `recipientId` | integer | FKs to users |
| `content` | text | Message text |
| `mediaUrl`, `mediaType` | text/varchar | Attachments |
| `isRead` | boolean | Read status |

**Test Scenarios:**
- [ ] SEND message
- [ ] SEND with media
- [ ] MARK as read
- [ ] GET conversation list

---

### 14. directMessageReactions Table (lines 1623-1651)

| Field | Type | Test Action |
|-------|------|-------------|
| `messageId` | integer | FK to message |
| `userId` | integer | FK to user |
| `reactionType` | varchar | Tango emoji |

**Test Scenarios:**
- [ ] ADD reaction to message
- [ ] REMOVE reaction

---

## TIER 4: PLACE RECOMMENDATIONS

### 15. placeRecommendations Table (lines 1464-1505)

| Field | Type | Test Action |
|-------|------|-------------|
| `placeName` | text | Place name |
| `category` | varchar | venue/teacher/restaurant/shop/accommodation/service |
| `latitude`, `longitude` | numeric | Coordinates |
| `postId` | integer | FK to post |
| `recommendationCount` | integer | Popularity |
| `userIds` | text[] | Array of recommenders |

**Test Scenarios:**
- [ ] CREATE recommendation from post
- [ ] Link recommendation to city group
- [ ] GET recommendations by city
- [ ] GET recommendations on map
- [ ] DEDUPLICATION: same lat/lng increments count

---

## CITY NORMALIZATION FLOW

### The Gap Identified

| Component | Uses Normalization? |
|-----------|---------------------|
| Scrapers (HoyMilonga, TangoCat, TangoFestivals) | ✅ YES |
| profileRoutes.ts (user profile update) | ❌ NO |
| event-routes.ts (manual event creation) | ❌ NO |
| cityGroupAutomation.ts (group creation) | ❌ NO |

### Correct Flow (To Be Implemented)

```
User Input: "tokyo", "TOKYO", "Tōkyō"
        ↓
GeocodingService.geocodeCity() → OpenStreetMap lookup
        ↓
Returns: { lat: 35.68, lng: 139.65, displayName: "Tokyo, Japan" }
        ↓
CityMatcherService.matchEventLocation()
  1. Exact match against existing groups
  2. Fuzzy match (>80% similarity)
  3. Geocode + find nearest (50km)
        ↓
NORMALIZED: { city: "Tokyo", country: "Japan", lat, lng }
        ↓
ensureCityGroupExists() → Uses normalized name
```

### Duplicate Prevention Test Matrix

| User 1 Input | User 2 Input | User 3 Input | Expected Groups |
|--------------|--------------|--------------|-----------------|
| "Tokyo", "Japan" | "tokyo", "japan" | "TOKYO", "JAPAN" | 1 group: "Tokyo" |
| "Buenos Aires", "Argentina" | "buenos aires", "argentina" | "BUENOS AIRES" | 1 group: "Buenos Aires" |
| "Melbourne", "Australia" | "melbourne", "australia" | "Melborne" (typo) | 1 group: "Melbourne" |

---

## @MENTION FLOW MATRIX

| Mention Type | Parse Pattern | Destination | Notification? | Database Action |
|--------------|---------------|-------------|---------------|-----------------|
| @user | `@user:user_123:maria` | User profile | YES | Insert into notifications |
| @city | `@city:city_456:tokyo` | City group feed | NO | Link to groups + groupPosts |
| @progroup | `@pro:pro_789:teachers` | Pro group feed | NO | Link to groups + tag member status |
| @event | `@event:event_101:milonga` | Event detail page | NO | Link via eventId in post |

---

## CROSS-FLOW INTEGRATION TESTS

| # | Test Name | Flow Combination | Steps | Expected Results |
|---|-----------|------------------|-------|------------------|
| X.1 | New user → city group → event | 1 + 2 | 1. User updates city 2. Creates event | City group created once, event linked |
| X.2 | Scraped event → city group → post | 2 + 3 | 1. Process scraped event 2. User posts with @city | City group exists, post appears |
| X.3 | Place recommendation → city feed | 3 + 1 | 1. User recommends venue | Recommendation appears in city group |
| X.4 | Event series detection | 2 | 1. Create 3 weekly events same venue | eventSeries created, all linked |

---

## KEY FOREIGN KEY RELATIONSHIPS

```
posts.userId → users.id
posts.eventId → events.id
postComments.postId → posts.id
postComments.parentCommentId → postComments.id (self-ref)
reactions.postId → posts.id
reactions.userId → users.id
friendRequests.senderId → users.id
friendRequests.receiverId → users.id
friendships.userId → users.id
friendships.friendId → users.id
notifications.userId → users.id
groups.createdBy → users.id
groupMembers.groupId → groups.id
groupMembers.userId → users.id
events.groupId → groups.id
events.seriesId → eventSeries.id
placeRecommendations.postId → posts.id
savedPosts.userId → users.id
savedPosts.postId → posts.id
reportedProfiles.reporterId → users.id
reportedProfiles.reportedUserId → users.id
```

---

## DATABASE VERIFICATION QUERIES

```sql
-- Verify no duplicate cities
SELECT LOWER(city), COUNT(*) 
FROM groups WHERE type = 'city' 
GROUP BY LOWER(city) HAVING COUNT(*) > 1;

-- Verify all city groups have coordinates
SELECT id, name, city, latitude, longitude 
FROM groups 
WHERE type = 'city' AND (latitude IS NULL OR longitude IS NULL);

-- Verify event → city group linkage
SELECT e.id, e.title, e.city, e.group_id, g.name as group_name 
FROM events e 
JOIN groups g ON e.group_id = g.id;

-- Verify place recommendation deduplication
SELECT latitude, longitude, category, COUNT(*) 
FROM place_recommendations 
GROUP BY latitude, longitude, category 
HAVING COUNT(*) > 1;
```

---

*Document Version: 1.0*  
*Last Updated: December 11, 2025*
