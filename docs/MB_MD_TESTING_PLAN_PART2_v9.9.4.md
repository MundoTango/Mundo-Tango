# MB.MD v9.9.4 COMPREHENSIVE TESTING PLAN - PART 2
## Additional User Interaction Tables

**Created**: December 11, 2025  
**Methodology**: MB.MD v9.9.4 (Research → Plan → Build → Test → Fix → Document)

---

## TABLE OF CONTENTS

1. [User Profile & Account](#tier-5-user-profile--account)
2. [Authentication & Security](#tier-6-authentication--security)
3. [Skills & Endorsements](#tier-7-skills--endorsements)
4. [Follows & Social Connections](#tier-8-follows--social-connections)
5. [Reviews & Ratings](#tier-9-reviews--ratings)
6. [Live Streams](#tier-10-live-streams)
7. [Media Gallery](#tier-11-media-gallery)
8. [Workshops & Enrollments](#tier-12-workshops--enrollments)
9. [Music Library & Playlists](#tier-13-music-library--playlists)
10. [Housing & Accommodations](#tier-14-housing--accommodations)
11. [Marketplace](#tier-15-marketplace)
12. [Payments & Subscriptions](#tier-16-payments--subscriptions)
13. [Talent Match / Volunteer System](#tier-17-talent-match--volunteer)
14. [AI Chat Systems](#tier-18-ai-chat-systems)
15. [Venues](#tier-19-venues)

---

## TIER 5: USER PROFILE & ACCOUNT

### 16. users Table (lines 37-141)

| Field | Type | Test Action |
|-------|------|-------------|
| `name`, `username`, `email` | varchar | Profile display |
| `password` | text | Hashed, never exposed |
| `profileImage`, `backgroundImage` | text | Image upload via Cloudinary |
| `bio` | text | Profile description |
| `city`, `country`, `latitude`, `longitude` | various | **CRITICAL: Triggers city group** |
| `tangoRoles` | text[] | leader/follower |
| `tangoStartYear` | integer | Experience calculation |
| `leaderLevel`, `followerLevel` | integer | 0-10 scale |
| `languages` | text[] | Multilingual support |
| `isVerified`, `verificationBadge` | boolean | Verification status |
| `stripeCustomerId`, `subscriptionTier` | varchar | Payment integration |
| `twoFactorEnabled` | boolean | Security feature |
| `customUrl` | varchar | Custom profile URL |
| `privacySettings` | jsonb | Privacy preferences |

**Test Scenarios:**
- [ ] UPDATE profile with new city → triggers city group normalization
- [ ] UPLOAD profile image → Cloudinary compression
- [ ] SET custom URL → verify uniqueness
- [ ] UPDATE tango roles/levels → verify array handling
- [ ] VIEW public profile vs private profile
- [ ] VERIFY verification badge display

---

### 17. userSettings Table (lines 3765-3791)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users (unique) |
| `emailNotifications` | boolean | Toggle email notifications |
| `pushNotifications` | boolean | Toggle push notifications |
| `profileVisibility` | varchar | public/friends/private |
| `showOnlineStatus` | boolean | Online indicator |
| `allowMessages` | varchar | everyone/friends/nobody |
| `language` | varchar | App language |
| `theme` | varchar | light/dark/system |
| `encryptedData` | text | Encrypted sensitive settings |

**Test Scenarios:**
- [ ] CREATE default settings on user registration
- [ ] UPDATE notification preferences
- [ ] UPDATE privacy settings → verify access control changes
- [ ] UPDATE theme → verify UI changes
- [ ] VERIFY encryptedData is never exposed in API responses

---

### 18. userLocationHistory Table (lines 184-227)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `city`, `country` | varchar | Historical city |
| `startDate`, `endDate` | date | Date range |
| `isCurrent` | boolean | Current city flag |
| `latitude`, `longitude` | numeric | Coordinates |
| `groupId` | integer | Auto-linked city group |

**Test Scenarios:**
- [ ] ADD location history entry
- [ ] SET isCurrent = true → auto-link to city group
- [ ] VIEW location history timeline
- [ ] VERIFY groupId auto-populated

---

## TIER 6: AUTHENTICATION & SECURITY

### 19. refreshTokens Table

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `token` | text | JWT refresh token |
| `expiresAt` | timestamp | Token expiration |
| `deviceInfo` | text | Device metadata |

**Test Scenarios:**
- [ ] CREATE refresh token on login
- [ ] USE refresh token to get new access token
- [ ] EXPIRE token → force re-login
- [ ] REVOKE token on logout

---

### 20. emailVerificationTokens Table

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `token` | varchar | Verification token |
| `expiresAt` | timestamp | Token expiration |

**Test Scenarios:**
- [ ] CREATE token on registration
- [ ] VERIFY email with valid token
- [ ] REJECT expired token
- [ ] DELETE token after verification

---

### 21. passwordResetTokens Table

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `token` | varchar | Reset token |
| `expiresAt` | timestamp | Token expiration |

**Test Scenarios:**
- [ ] CREATE token on password reset request
- [ ] RESET password with valid token
- [ ] REJECT expired/used token
- [ ] DELETE token after password change

---

### 22. twoFactorSecrets Table

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users (unique) |
| `secret` | text | Encrypted TOTP secret |
| `backupCodes` | text[] | Encrypted backup codes |
| `isEnabled` | boolean | 2FA active status |

**Test Scenarios:**
- [ ] SETUP 2FA → generate secret + QR code
- [ ] VERIFY TOTP code
- [ ] USE backup code
- [ ] DISABLE 2FA

---

### 23. securityAuditLogs Table (lines 1771-1789)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `action` | varchar | login, logout, password_change, etc |
| `ipAddress` | varchar | Client IP |
| `userAgent` | text | Browser/device info |
| `metadata` | jsonb | Additional data |

**Test Scenarios:**
- [ ] LOG login event
- [ ] LOG password change
- [ ] LOG suspicious activity
- [ ] QUERY audit logs for user

---

## TIER 7: SKILLS & ENDORSEMENTS

### 24. userSkills Table (lines 494-513)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `skillName` | varchar | Skill name |
| `level` | varchar | beginner/intermediate/advanced/expert |

**Test Scenarios:**
- [ ] ADD skill to profile
- [ ] UPDATE skill level
- [ ] DELETE skill
- [ ] VIEW skills on profile

---

### 25. skillEndorsements Table (lines 515-535)

| Field | Type | Test Action |
|-------|------|-------------|
| `skillId` | integer | FK to userSkills |
| `endorserId` | integer | FK to users |

**Test Scenarios:**
- [ ] ENDORSE friend's skill
- [ ] REMOVE endorsement
- [ ] COUNT endorsements per skill
- [ ] VERIFY can only endorse once per skill

---

## TIER 8: FOLLOWS & SOCIAL CONNECTIONS

### 26. follows Table (lines 432-452)

| Field | Type | Test Action |
|-------|------|-------------|
| `followerId` | integer | FK to users (follower) |
| `followingId` | integer | FK to users (followed) |

**Test Scenarios:**
- [ ] FOLLOW user
- [ ] UNFOLLOW user
- [ ] GET follower count
- [ ] GET following count
- [ ] CHECK if following specific user

---

### 27. blockedUsers Table (lines 541-560)

| Field | Type | Test Action |
|-------|------|-------------|
| `blockerId` | integer | FK to users (blocker) |
| `blockedId` | integer | FK to users (blocked) |

**Test Scenarios:**
- [ ] BLOCK user
- [ ] UNBLOCK user
- [ ] VERIFY blocked user can't send messages
- [ ] VERIFY blocked user can't see profile
- [ ] VERIFY blocked user removed from feed

---

### 28. profileViews Table (lines 458-488)

| Field | Type | Test Action |
|-------|------|-------------|
| `profileUserId` | integer | FK to users (viewed) |
| `viewerUserId` | integer | FK to users (viewer) |
| `profileType` | varchar | Type of profile view |
| `viewerIp` | varchar | IP for anonymous views |

**Test Scenarios:**
- [ ] TRACK profile view
- [ ] COUNT total profile views
- [ ] GET profile view analytics
- [ ] VERIFY self-views not counted

---

## TIER 9: REVIEWS & RATINGS

### 29. reviews Table (lines 2872-2893)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to reviewer |
| `targetType` | varchar | event/venue/teacher/workshop |
| `targetId` | integer | FK to target entity |
| `rating` | integer | 1-5 stars |
| `title`, `content` | text | Review text |
| `verified` | boolean | Verified attendance |
| `helpfulCount` | integer | Helpful votes |

**Test Scenarios:**
- [ ] CREATE review for event
- [ ] CREATE review for venue
- [ ] UPDATE review
- [ ] DELETE review (author only)
- [ ] MARK review as helpful
- [ ] CALCULATE average rating

---

## TIER 10: LIVE STREAMS

### 30. liveStreams Table (lines 2896-2922)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to host |
| `title` | varchar | Stream title |
| `status` | varchar | scheduled/live/ended |
| `isLive` | boolean | Currently streaming |
| `viewers`, `viewerCount` | integer | Viewer counters |
| `scheduledDate` | varchar | Scheduled start |
| `streamUrl` | text | Stream URL |

**Test Scenarios:**
- [ ] SCHEDULE live stream
- [ ] START stream → isLive = true
- [ ] END stream → status = ended
- [ ] GET active streams list
- [ ] UPDATE viewer count

---

### 31. streamViewers Table (lines 2948-2968)

| Field | Type | Test Action |
|-------|------|-------------|
| `streamId` | integer | FK to liveStreams |
| `viewerId` | integer | FK to users |
| `joinedAt` | timestamp | Join time |
| `leftAt` | timestamp | Leave time (null = active) |

**Test Scenarios:**
- [ ] JOIN stream → create record
- [ ] LEAVE stream → set leftAt
- [ ] COUNT active viewers
- [ ] GET viewer history

---

### 32. liveStreamMessages Table (lines 2972-2991)

| Field | Type | Test Action |
|-------|------|-------------|
| `streamId` | integer | FK to liveStreams |
| `userId` | integer | FK to users |
| `message` | text | Chat message |

**Test Scenarios:**
- [ ] SEND message to stream chat
- [ ] GET stream chat history
- [ ] MODERATE messages (delete)

---

## TIER 11: MEDIA GALLERY

### 33. media Table (lines 2995-3014)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `type` | varchar | image/video |
| `url` | text | Cloudinary URL |
| `thumbnail` | text | Thumbnail URL |
| `caption` | text | Description |
| `likes`, `comments` | integer | Counters |

**Test Scenarios:**
- [ ] UPLOAD image → Cloudinary processing
- [ ] UPLOAD video → Cloudinary processing
- [ ] DELETE media
- [ ] LIKE media
- [ ] COMMENT on media

---

### 34. storyViews Table (lines 2925-2944)

| Field | Type | Test Action |
|-------|------|-------------|
| `storyId` | integer | FK to posts (story) |
| `viewerId` | integer | FK to users |

**Test Scenarios:**
- [ ] VIEW story → create record
- [ ] COUNT story views
- [ ] GET story viewers list

---

## TIER 12: WORKSHOPS & ENROLLMENTS

### 35. workshops Table (lines 2742-2763)

| Field | Type | Test Action |
|-------|------|-------------|
| `title` | varchar | Workshop name |
| `description` | text | Details |
| `instructor` | varchar | Teacher name |
| `date`, `location` | varchar/text | Schedule |
| `price` | integer | Cost |
| `capacity`, `registered`, `spotsLeft` | integer | Enrollment counts |

**Test Scenarios:**
- [ ] CREATE workshop
- [ ] UPDATE workshop details
- [ ] CHECK capacity availability
- [ ] CLOSE registration when full

---

### 36. workshopEnrollments Table (lines 2766-2789)

| Field | Type | Test Action |
|-------|------|-------------|
| `workshopId` | integer | FK to workshops |
| `userId` | integer | FK to users |
| `status` | varchar | enrolled/cancelled/completed |

**Test Scenarios:**
- [ ] ENROLL in workshop → increment registered count
- [ ] CANCEL enrollment → decrement registered count
- [ ] COMPLETE workshop
- [ ] VERIFY unique enrollment per user

---

## TIER 13: MUSIC LIBRARY & PLAYLISTS

### 37. musicLibrary Table (lines 2792-2810)

| Field | Type | Test Action |
|-------|------|-------------|
| `title`, `artist` | varchar | Song info |
| `album`, `genre` | varchar | Metadata |
| `orchestra` | varchar | Tango orchestra |
| `fileUrl` | varchar | Audio file |

**Test Scenarios:**
- [ ] ADD song to library (admin)
- [ ] SEARCH songs by artist/orchestra
- [ ] FILTER by genre

---

### 38. playlists Table (lines 2813-2829)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `name` | varchar | Playlist name |
| `description` | text | Description |
| `isPublic` | boolean | Public visibility |

**Test Scenarios:**
- [ ] CREATE playlist
- [ ] UPDATE playlist
- [ ] DELETE playlist
- [ ] SHARE public playlist

---

### 39. playlistSongs Table (lines 2832-2848)

| Field | Type | Test Action |
|-------|------|-------------|
| `playlistId` | integer | FK to playlists |
| `songId` | integer | FK to musicLibrary |
| `position` | integer | Sort order |

**Test Scenarios:**
- [ ] ADD song to playlist
- [ ] REMOVE song from playlist
- [ ] REORDER songs

---

### 40. musicFavorites Table (lines 2852-2868)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `songId` | integer | FK to musicLibrary |

**Test Scenarios:**
- [ ] FAVORITE song
- [ ] UNFAVORITE song
- [ ] GET user favorites

---

## TIER 14: HOUSING & ACCOMMODATIONS

### 41. housingListings Table (line 4648)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to host |
| `title`, `description` | text | Listing info |
| `city`, `country` | varchar | Location |
| `pricePerNight` | numeric | Pricing |
| `maxGuests`, `bedrooms`, `bathrooms` | integer | Capacity |
| `amenities` | text[] | Features |
| `isActive` | boolean | Available status |

**Test Scenarios:**
- [ ] CREATE housing listing
- [ ] UPDATE listing details
- [ ] TOGGLE availability
- [ ] SEARCH listings by city
- [ ] FILTER by amenities

---

### 42. housingBookings Table (line 4711)

| Field | Type | Test Action |
|-------|------|-------------|
| `listingId` | integer | FK to housingListings |
| `guestId` | integer | FK to users |
| `checkIn`, `checkOut` | date | Stay dates |
| `totalPrice` | numeric | Booking cost |
| `status` | varchar | pending/confirmed/cancelled |

**Test Scenarios:**
- [ ] CREATE booking request
- [ ] HOST confirm/decline booking
- [ ] GUEST cancel booking
- [ ] CHECK date availability

---

### 43. housingReviews Table (line 4736)

| Field | Type | Test Action |
|-------|------|-------------|
| `bookingId` | integer | FK to housingBookings |
| `reviewerId` | integer | FK to users |
| `rating` | integer | 1-5 stars |
| `content` | text | Review text |

**Test Scenarios:**
- [ ] CREATE review after checkout
- [ ] CALCULATE listing average rating

---

### 44. housingFavorites Table (line 4757)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `listingId` | integer | FK to housingListings |

**Test Scenarios:**
- [ ] SAVE listing to favorites
- [ ] REMOVE from favorites
- [ ] VIEW saved listings

---

## TIER 15: MARKETPLACE

### 45. marketplaceItems Table (line 4780)

| Field | Type | Test Action |
|-------|------|-------------|
| `sellerId` | integer | FK to users |
| `title`, `description` | text | Item info |
| `category` | varchar | shoes/clothes/accessories |
| `price` | numeric | Price |
| `condition` | varchar | new/like_new/good/fair |
| `imageUrls` | text[] | Photos |
| `status` | varchar | active/sold/archived |

**Test Scenarios:**
- [ ] LIST item for sale
- [ ] UPDATE item details
- [ ] MARK as sold
- [ ] SEARCH by category
- [ ] FILTER by condition

---

### 46. marketplaceProducts Table (line 13913)

| Field | Type | Test Action |
|-------|------|-------------|
| `name`, `description` | text | Product info |
| `price` | numeric | Price |
| `stripePriceId` | varchar | Stripe integration |
| `stock` | integer | Inventory |
| `isDigital` | boolean | Digital download |

**Test Scenarios:**
- [ ] CREATE product
- [ ] UPDATE stock
- [ ] SYNC with Stripe

---

## TIER 16: PAYMENTS & SUBSCRIPTIONS

### 47. payments Table (line 3193)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `amount` | numeric | Payment amount |
| `currency` | varchar | Currency code |
| `stripePaymentId` | varchar | Stripe payment ID |
| `status` | varchar | pending/completed/failed/refunded |
| `type` | varchar | subscription/event/marketplace |

**Test Scenarios:**
- [ ] CREATE payment record on Stripe webhook
- [ ] UPDATE status on payment success/failure
- [ ] PROCESS refund

---

### 48. subscriptions Table (line 5300)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `stripeSubscriptionId` | varchar | Stripe subscription ID |
| `tier` | varchar | free/pro/premium |
| `status` | varchar | active/cancelled/past_due |
| `currentPeriodEnd` | timestamp | Billing cycle end |

**Test Scenarios:**
- [ ] CREATE subscription on Stripe webhook
- [ ] UPGRADE subscription tier
- [ ] CANCEL subscription
- [ ] HANDLE renewal

---

### 49. subscriptionPlans Table (line 17860)

| Field | Type | Test Action |
|-------|------|-------------|
| `name` | varchar | Plan name |
| `stripePriceId` | varchar | Stripe price ID |
| `price` | numeric | Monthly price |
| `features` | text[] | Included features |

**Test Scenarios:**
- [ ] GET available plans
- [ ] DISPLAY plan features

---

## TIER 17: TALENT MATCH / VOLUNTEER

### 50. volunteers Table (lines 3542-3558)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `profile` | jsonb | Volunteer profile |
| `skills` | text[] | Skills array |
| `availability` | varchar | Availability |
| `hoursPerWeek` | integer | Time commitment |

**Test Scenarios:**
- [ ] REGISTER as volunteer
- [ ] UPDATE profile
- [ ] SET availability

---

### 51. resumes Table (lines 3560-3576)

| Field | Type | Test Action |
|-------|------|-------------|
| `volunteerId` | integer | FK to volunteers |
| `filename` | text | Original filename |
| `fileUrl` | text | Uploaded file URL |
| `parsedText` | text | AI-extracted text |
| `links` | text[] | Extracted links |

**Test Scenarios:**
- [ ] UPLOAD resume
- [ ] PARSE resume with AI
- [ ] EXTRACT skills from resume

---

### 52. tasks Table (lines 3598-3614)

| Field | Type | Test Action |
|-------|------|-------------|
| `title`, `description` | text | Task info |
| `domain`, `phase` | varchar | Project domain/phase |
| `estimatedHours` | integer | Time estimate |
| `requiredSkills` | text[] | Required skills |
| `status` | varchar | open/assigned/completed |

**Test Scenarios:**
- [ ] CREATE task (admin)
- [ ] ASSIGN task to volunteer
- [ ] COMPLETE task

---

### 53. assignments Table (lines 3617-3638)

| Field | Type | Test Action |
|-------|------|-------------|
| `volunteerId` | integer | FK to volunteers |
| `taskId` | integer | FK to tasks |
| `matchReason` | text | AI match reason |
| `status` | varchar | pending/approved/rejected |

**Test Scenarios:**
- [ ] CREATE assignment
- [ ] ADMIN approve/reject
- [ ] TRACK assignment status

---

### 54. talentProfiles Table (line 7027)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `skills` | jsonb | Skill ratings |
| `experience` | jsonb | Experience details |
| `portfolioUrls` | text[] | Portfolio links |

**Test Scenarios:**
- [ ] CREATE talent profile
- [ ] UPDATE skills
- [ ] SEARCH by skills

---

### 55. talentMatches Table (line 7055)

| Field | Type | Test Action |
|-------|------|-------------|
| `profileId` | integer | FK to talentProfiles |
| `taskId` | integer | FK to tasks |
| `matchScore` | numeric | AI match score |
| `status` | varchar | Match status |

**Test Scenarios:**
- [ ] GENERATE matches for task
- [ ] ACCEPT/DECLINE match

---

## TIER 18: AI CHAT SYSTEMS

### 56. mrBlueConversations Table (lines 1795-1811)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `title` | text | Conversation title |
| `contextWindow` | integer | Context size |
| `lastMessageAt` | timestamp | Last activity |

**Test Scenarios:**
- [ ] CREATE conversation
- [ ] GET conversation list
- [ ] DELETE conversation

---

### 57. mrBlueMessages Table (lines 1813-1843)

| Field | Type | Test Action |
|-------|------|-------------|
| `conversationId` | integer | FK to mrBlueConversations |
| `userId` | integer | FK to users |
| `role` | varchar | user/assistant |
| `content` | text | Message content |
| `metadata` | jsonb | Additional data |

**Test Scenarios:**
- [ ] SEND message to Mr Blue
- [ ] RECEIVE AI response
- [ ] EDIT message
- [ ] DELETE message

---

### 58. lifeCeoConversations Table (lines 2061-2076)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `domain` | varchar | Life domain |
| `title` | text | Conversation title |

**Test Scenarios:**
- [ ] CREATE LIFE CEO conversation
- [ ] SELECT domain (16 domains)
- [ ] GET conversation history

---

### 59. lifeCeoGoals Table (lines 2182-2206)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users |
| `domainId` | integer | FK to lifeCeoDomains |
| `title`, `description` | text | Goal info |
| `targetDate` | timestamp | Deadline |
| `progress` | integer | 0-100% |
| `status` | varchar | active/completed/abandoned |

**Test Scenarios:**
- [ ] CREATE goal
- [ ] UPDATE progress
- [ ] COMPLETE goal

---

### 60. lifeCeoTasks Table (lines 2209-2240)

| Field | Type | Test Action |
|-------|------|-------------|
| `goalId` | integer | FK to lifeCeoGoals |
| `title`, `description` | text | Task info |
| `dueDate` | timestamp | Deadline |
| `status` | varchar | pending/in_progress/completed |

**Test Scenarios:**
- [ ] CREATE task for goal
- [ ] UPDATE task status
- [ ] COMPLETE task → update goal progress

---

## TIER 19: VENUES

### 61. venues Table (line 3080)

| Field | Type | Test Action |
|-------|------|-------------|
| `name` | varchar | Venue name |
| `address`, `city`, `country` | text/varchar | Location |
| `latitude`, `longitude` | numeric | Coordinates |
| `capacity` | integer | Max attendees |
| `amenities` | text[] | Features |
| `contactInfo` | jsonb | Contact details |
| `isVerified` | boolean | Verification status |

**Test Scenarios:**
- [ ] CREATE venue
- [ ] UPDATE venue details
- [ ] VERIFY venue (admin)
- [ ] SEARCH venues by city
- [ ] LINK venue to event

---

### 62. venueRecommendations Table (line 6993)

| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to recommender |
| `venueId` | integer | FK to venue |
| `rating` | integer | 1-5 stars |
| `content` | text | Recommendation text |

**Test Scenarios:**
- [ ] CREATE venue recommendation
- [ ] CALCULATE venue average rating

---

## SUMMARY: TOTAL TABLES REQUIRING USER INTERACTION TESTING

| Tier | Category | Tables | Priority |
|------|----------|--------|----------|
| 1 | Social Core | 9 | Critical |
| 2 | Groups & Events | 3 | Critical |
| 3 | Messaging | 2 | Critical |
| 4 | Place Recommendations | 1 | High |
| 5 | User Profile | 3 | Critical |
| 6 | Auth & Security | 5 | Critical |
| 7 | Skills & Endorsements | 2 | Medium |
| 8 | Follows & Social | 3 | High |
| 9 | Reviews | 1 | Medium |
| 10 | Live Streams | 3 | Medium |
| 11 | Media Gallery | 2 | Medium |
| 12 | Workshops | 2 | Medium |
| 13 | Music | 4 | Low |
| 14 | Housing | 4 | Medium |
| 15 | Marketplace | 2 | Medium |
| 16 | Payments | 3 | High |
| 17 | Talent Match | 6 | Medium |
| 18 | AI Chat | 5 | Medium |
| 19 | Venues | 2 | Medium |
| **TOTAL** | | **62** | |

---

## KEY CROSS-TABLE RELATIONSHIPS

```
users (1) ←→ (1) userSettings
users (1) ←→ (N) userLocationHistory
users (1) ←→ (N) userSkills ←→ (N) skillEndorsements
users (1) ←→ (N) follows (follower/following)
users (1) ←→ (N) blockedUsers (blocker/blocked)
users (1) ←→ (N) profileViews
users (1) ←→ (N) reviews
users (1) ←→ (N) liveStreams ←→ (N) streamViewers
users (1) ←→ (N) media
users (1) ←→ (N) workshopEnrollments ←→ workshops
users (1) ←→ (N) playlists ←→ (N) playlistSongs ←→ musicLibrary
users (1) ←→ (N) musicFavorites ←→ musicLibrary
users (1) ←→ (N) housingListings ←→ (N) housingBookings
users (1) ←→ (N) marketplaceItems
users (1) ←→ (N) payments
users (1) ←→ (1) subscriptions
users (1) ←→ (1) volunteers ←→ (N) resumes
volunteers (N) ←→ (N) tasks via assignments
users (1) ←→ (N) mrBlueConversations ←→ (N) mrBlueMessages
users (1) ←→ (N) lifeCeoConversations ←→ (N) lifeCeoChatMessages
users (1) ←→ (N) lifeCeoGoals ←→ (N) lifeCeoTasks
```

---

*Document Version: 1.0*  
*Last Updated: December 11, 2025*
