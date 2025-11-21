# MB.MD PROTOCOL v9.2: 10-USER COMPREHENSIVE VALIDATION PLAN

**Mission:** Create 10 diverse test users to validate ALL 50 PART_10 pages with comprehensive RBAC/ABAC, friend relations, social features, and identify missing tech/communications/expertise gaps.

**Methodology:** Work Simultaneously (3 parallel streams), Recursively (deep validation at each layer), Critically (95-99/100 quality target)

**Status:** RESEARCH & PLANNING PHASE (DO NOT BUILD YET)

---

## 🎯 EXECUTIVE SUMMARY

### Current State Analysis

**✅ EXISTING INFRASTRUCTURE (Strong Foundation)**
- **RBAC System:** 8-tier platform roles (Free → God) with permissions framework
- **Friend Relations:** Closeness scoring (0-100), connection degrees, tier system (1-3)
- **Social Integration:** Facebook OAuth, Messenger, multi-platform scraper
- **Testing:** 119+ Playwright test files already exist
- **AI Stack:** OpenAI GPT-4o, Anthropic Claude, Groq Llama 3.1, Google Gemini
- **Reputation:** Professional endorsement routes implemented
- **Database:** 457 tables, comprehensive schema

**❌ CRITICAL GAPS IDENTIFIED**

### Gap Category 1: Testing Coverage (HIGH PRIORITY)
| Gap | Impact | Urgency |
|-----|--------|---------|
| No 10-user RBAC/ABAC validation | Can't verify role permissions work correctly | CRITICAL |
| No friend relation testing (6 types) | Closeness algorithm untested | HIGH |
| No @mention cross-user testing | Social features may fail | HIGH |
| No invitation batching validation | PART_10 core feature untested | CRITICAL |
| No 50-page comprehensive E2E | Can't validate PART_10 complete | CRITICAL |

### Gap Category 2: Missing Technology (MEDIUM PRIORITY)
| Missing Tech | Required For | Complexity |
|--------------|--------------|------------|
| Instagram Graph API integration | Multi-platform closeness metrics | Medium |
| WhatsApp Business API | Complete social scraping | High |
| Batch invitation scheduler | Smart invitation system | Medium |
| AI voice/style analyzer | Auto-generate Scott's messages | High |
| Professional endorsement UI | Reputation system UX | Low |
| Tiered tour + sentiment tracking | Mr. Blue tours system | Medium |
| Badge system (financial supporter) | User engagement gamification | Low |

### Gap Category 3: Missing Communications (MEDIUM PRIORITY)
| Communication Channel | Purpose | Status |
|----------------------|---------|--------|
| Instagram DM API | Send invitations via Instagram | NOT INTEGRATED |
| WhatsApp Business Messaging | Send batched invitations | NOT INTEGRATED |
| Email invitation batching | "X people inviting you" emails | PARTIALLY DONE |
| SMS invitations (Twilio) | Alternative invitation channel | NOT INTEGRATED |
| Push notifications (Firebase) | Real-time friend request alerts | NOT INTEGRATED |

### Gap Category 4: Missing Expertise (LOW PRIORITY)
| Expert Role | Needed For | Availability |
|-------------|-----------|--------------|
| Legal compliance specialist | GDPR/CCPA data retention | CONSULT NEEDED |
| Social media policy expert | FB/IG scraping legal review | CONSULT NEEDED |
| Rate limiting strategist | Avoid platform bans | INTERNAL OK |
| Professional network designer | Endorsement system UX | INTERNAL OK |
| AI training specialist | Voice/style analysis | INTERNAL OK |

---

## 👥 THE 10 TEST USERS: COMPREHENSIVE VALIDATION MATRIX

### User Persona Design Strategy

**Diversity Dimensions:**
1. **RBAC Tier:** Cover all 8 levels (Free → God)
2. **Friend Relations:** Test all 6 types (Close, 1°, 2°, 3°, Follower, Unknown, Blocked)
3. **Tango Roles:** Teacher, DJ, Organizer, Performer, Dancer, Venue Owner
4. **Geographic:** Global distribution (5 continents)
5. **Platform Activity:** High, Medium, Low engagement patterns

---

### 👤 USER 1: SCOTT (Founder - God Mode)
**RBAC Level:** God (Level 8)  
**Primary Role:** Platform Owner, Teacher  
**Location:** Seoul, South Korea  
**Friend Relations:** Close (0), 1st Degree (50), 2nd Degree (200), 3rd Degree (500)  
**Expertise:** Teaching, Event Organization  

**Test Responsibilities:**
- ✅ Execute full 50-page validation tour (The Plan)
- ✅ Test God-level admin permissions
- ✅ Validate multi-platform scraping (FB + IG + WhatsApp)
- ✅ Test AI voice/style analysis (Mr. Blue learns communication patterns)
- ✅ Validate professional endorsement giving/receiving
- ✅ Test invitation batching system (send to 10+ friends)
- ✅ Verify closeness metrics accuracy
- ✅ Test @mention across posts, comments, events

**Data Preparation:**
```sql
-- Already prepared: admin@mundotango.life (ID=15)
-- Clean slate: 0 posts, 0 friendships, onboarding_incomplete
```

---

### 👤 USER 2: MARIA (Super Admin - Teacher)
**RBAC Level:** Super Admin (Level 7)  
**Primary Role:** Professional Teacher, Community Leader  
**Location:** Buenos Aires, Argentina  
**Friend Relations:** Close to Scott, 1st Degree (30), 2nd Degree (150)  

**Test Responsibilities:**
- ✅ Test Super Admin dashboard access
- ✅ Validate user management (suspend/activate users)
- ✅ Test content moderation queue
- ✅ Verify platform analytics access
- ✅ Test teacher profile features (workshops, pricing, reviews)
- ✅ Give professional endorsements to other teachers
- ✅ Receive endorsements from students
- ✅ Create paid events with Stripe integration
- ✅ Test housing marketplace (post teacher apartment)
- ✅ @mention students in posts

**Friend Relations to Test:**
- Close: Scott (closeness score 90+)
- 1st Degree: 30 direct friends
- 2nd Degree: Friends of Scott (150 people)
- Test closeness algorithm with message frequency

---

### 👤 USER 3: JACKSON (Platform Contributor - DJ)
**RBAC Level:** Platform Contributor (Level 5)  
**Primary Role:** DJ, Music Curator  
**Location:** San Francisco, USA  
**Friend Relations:** 1st Degree (25), Follower (100), Unknown (1000)  

**Test Responsibilities:**
- ✅ Test contributor-level permissions
- ✅ Validate music library uploads
- ✅ Test event DJ assignment features
- ✅ Create DJ-specific events (milongas)
- ✅ Verify follower vs friend permissions
- ✅ Test public profile visibility
- ✅ Receive endorsements as DJ (musicality, song selection)
- ✅ Test playlist sharing
- ✅ @mention organizers in event posts
- ✅ Test invitation system (invite DJ colleagues)

**Friend Relations to Test:**
- 1st Degree: 25 direct friends
- Follower: 100 people following him (NOT friends)
- Unknown: 1000 people who see public profile
- Test follower permissions (can see posts, can't message directly)

---

### 👤 USER 4: SOFIA (Community Leader - Organizer)
**RBAC Level:** Community Leader (Level 3)  
**Primary Role:** Event Organizer, Group Admin  
**Location:** Paris, France  
**Friend Relations:** Close to Maria, 1st Degree (40), 2nd Degree (200)  

**Test Responsibilities:**
- ✅ Test community leader permissions
- ✅ Create and manage city groups (Paris Tango)
- ✅ Test group member approval workflow
- ✅ Create professional groups (Organizers Network)
- ✅ Test event creation with RSVP limits
- ✅ Verify event check-in system
- ✅ Test event page admin features
- ✅ Give endorsements to venue owners
- ✅ Receive endorsements as organizer
- ✅ Test housing search (find accommodation for festival)
- ✅ @mention teachers in event announcements

**Friend Relations to Test:**
- Close: Maria (closeness 85+)
- 1st Degree: 40 direct friends (organizers, teachers)
- 2nd Degree: Friends of Maria (200 people)
- Test group invitation batching

---

### 👤 USER 5: LUCAS (Premium User - Performer)
**RBAC Level:** Premium (Level 2)  
**Primary Role:** Professional Performer, Choreographer  
**Location:** Tokyo, Japan  
**Friend Relations:** 1st Degree (20), 2nd Degree (100), 3rd Degree (300)  

**Test Responsibilities:**
- ✅ Test premium subscription features
- ✅ Validate Stripe payment integration
- ✅ Test billing history & invoices
- ✅ Access premium-only features (verified badge, unlimited storage)
- ✅ Create performer profile with portfolio
- ✅ Test video upload (performance videos)
- ✅ Receive endorsements for performance skills
- ✅ Test event performer assignment
- ✅ @mention choreography partners
- ✅ Test premium messaging features

**Friend Relations to Test:**
- 1st Degree: 20 direct friends
- 2nd Degree: Friends of friends (100 people)
- 3rd Degree: Friends of friends of friends (300 people)
- Test 3rd-degree connection visibility

---

### 👤 USER 6: CHEN (Free User - Dancer)
**RBAC Level:** Free (Level 1)  
**Primary Role:** Social Dancer, Student  
**Location:** Shanghai, China  
**Friend Relations:** 1st Degree (15), Blocked (2)  

**Test Responsibilities:**
- ✅ Test free tier limitations (storage, features)
- ✅ Verify upsell prompts to premium
- ✅ Test basic social features (posts, comments, likes)
- ✅ Search for events in city
- ✅ RSVP to free events
- ✅ Test blocked user functionality
- ✅ Verify can't message blocked users
- ✅ Give endorsements to teachers
- ✅ Test free housing search
- ✅ @mention friends in posts

**Friend Relations to Test:**
- 1st Degree: 15 friends
- Blocked: 2 users (test visibility, messaging restrictions)
- Unknown: Can't see other users' full profiles
- Test free tier friend limit (if any)

---

### 👤 USER 7: ISABELLA (Platform Volunteer - Community Moderator)
**RBAC Level:** Platform Volunteer (Level 6)  
**Primary Role:** Content Moderator, Safety Reviewer  
**Location:** São Paulo, Brazil  
**Friend Relations:** 1st Degree (35), 2nd Degree (180)  

**Test Responsibilities:**
- ✅ Test volunteer moderator dashboard
- ✅ Review flagged content
- ✅ Approve/reject user reports
- ✅ Test safety center features
- ✅ Verify moderation queue workflow
- ✅ Test user suspension powers
- ✅ Give endorsements to community leaders
- ✅ Test translation management (volunteer translator)
- ✅ @mention other moderators in reports
- ✅ Test 68-language switcher

**Friend Relations to Test:**
- 1st Degree: 35 friends (volunteers, moderators)
- 2nd Degree: 180 people
- Test volunteer permissions (can moderate, can't delete accounts)

---

### 👤 USER 8: DAVID (Admin - Venue Owner)
**RBAC Level:** Admin (Level 4)  
**Primary Role:** Venue Owner, Business Manager  
**Location:** Melbourne, Australia  
**Friend Relations:** 1st Degree (25), 2nd Degree (120)  

**Test Responsibilities:**
- ✅ Test admin dashboard analytics
- ✅ Manage venue listings
- ✅ Test venue recommendation system
- ✅ Create venue-based events
- ✅ Test revenue sharing for paid events
- ✅ Receive venue endorsements (ambiance, floor quality)
- ✅ Test housing marketplace (venue has apartments)
- ✅ Verify admin user management
- ✅ @mention teachers in venue promotions
- ✅ Test invitation batching for venue events

**Friend Relations to Test:**
- 1st Degree: 25 friends (teachers, organizers)
- 2nd Degree: 120 people
- Test admin-level permissions (can manage users, can't delete platform)

---

### 👤 USER 9: ELENA (Free User - New Student)
**RBAC Level:** Free (Level 1)  
**Primary Role:** Beginner Dancer, First-Time User  
**Location:** New York, USA  
**Friend Relations:** Unknown (everyone), 0 friends initially  

**Test Responsibilities:**
- ✅ Test complete onboarding flow
- ✅ Verify first-time user tour (Mr. Blue guided)
- ✅ Test city selection during onboarding
- ✅ Upload first profile photo
- ✅ Select tango roles (student)
- ✅ Send first friend request
- ✅ Receive friend request from Scott
- ✅ Test unknown user visibility (can only see public profiles)
- ✅ Search for teachers in NYC
- ✅ Test RSVP to first event

**Friend Relations to Test:**
- Unknown: Everyone (before making friends)
- 0 → 1st friend: Test transition from unknown to friend
- Test invitation receiving flow
- Test closeness score initialization

---

### 👤 USER 10: AHMED (Premium User - Traveler)
**RBAC Level:** Premium (Level 2)  
**Primary Role:** Travel Planner, Housing Guest  
**Location:** Dubai, UAE  
**Friend Relations:** 1st Degree (18), 2nd Degree (90), Follower (50)  

**Test Responsibilities:**
- ✅ Test travel planner features
- ✅ Search housing across multiple cities
- ✅ Create trip plans (Dubai → Paris → Buenos Aires)
- ✅ Test housing booking workflow
- ✅ Leave reviews for hosts
- ✅ Test event discovery while traveling
- ✅ Verify multi-city group membership
- ✅ Give endorsements to venue owners
- ✅ Test premium travel features
- ✅ @mention friends in travel posts

**Friend Relations to Test:**
- 1st Degree: 18 friends (global travelers)
- 2nd Degree: 90 people
- Follower: 50 people following his travel blog
- Test cross-city friend recommendations

---

## 🧪 COMPREHENSIVE TEST MATRIX

### Test Dimension 1: RBAC/ABAC Validation

| User | Role Level | Test Permissions | Expected Access |
|------|-----------|------------------|----------------|
| Scott | God (8) | All features, all pages | Full platform control |
| Maria | Super Admin (7) | User management, analytics | Can't access God features |
| Isabella | Volunteer (6) | Moderation, translations | Can't manage users |
| Jackson | Contributor (5) | Upload music, create content | Can't moderate |
| David | Admin (4) | Venue management, analytics | Can manage users, not platform |
| Sofia | Community Leader (3) | Group admin, event creation | Can't access admin panel |
| Lucas | Premium (2) | All social features, no limits | Can't create groups |
| Chen | Free (1) | Basic features only | Storage limits, feature gates |
| Elena | Free (1) | Onboarding, basic social | Same as Chen |
| Ahmed | Premium (2) | Travel features, housing | Same as Lucas |

**Tests to Execute:**
1. ✅ Each user logs in → Verify correct dashboard shown
2. ✅ Each user tries to access higher-level features → Verify 403 Forbidden
3. ✅ Admin panel only visible to Admin+ (Levels 4-8)
4. ✅ Moderation queue only visible to Volunteer+ (Levels 6-8)
5. ✅ Free users hit storage limit → Verify upgrade prompt
6. ✅ Premium users have unlimited storage → Verify no limits
7. ✅ Community Leaders can create groups → Verify permissions
8. ✅ Free users can't create groups → Verify restriction

---

### Test Dimension 2: Friend Relation Validation

| Relation Type | Closeness Score | Visibility | Messaging | Example Users |
|--------------|----------------|-----------|-----------|---------------|
| **Close** | 90-100 | Full profile, all posts | Unlimited DMs | Scott ↔ Maria |
| **1st Degree (Friend)** | 75-89 | Full profile, friend posts | Unlimited DMs | Scott → 50 friends |
| **2nd Degree** | 50-74 | Limited profile | Can send request | Friends of Scott's friends |
| **3rd Degree** | 25-49 | Public profile only | Can't message | Friends of friends of friends |
| **Follower** | 0-24 | Public posts only | Can't DM | Jackson's 100 followers |
| **Unknown** | 0 | Public profile | Can send request | Elena (new user) |
| **Blocked** | -1 | Invisible | No contact | Chen blocked 2 users |

**Tests to Execute:**
1. ✅ Scott sends friend request to Maria → Becomes Close (score 90+)
2. ✅ Maria posts → Scott sees in feed (Close relation)
3. ✅ Jackson's follower posts → Jackson doesn't see (follower can't message)
4. ✅ Elena (unknown) searches for Scott → Sees public profile only
5. ✅ Chen blocks user → User disappears from feed, can't message
6. ✅ Lucas has 3rd-degree connection → Can see public profile, can't message
7. ✅ Test closeness score calculation (message frequency, interactions)
8. ✅ Test connection degree updates when mutual friend added

---

### Test Dimension 3: Social Features Validation

**Posts & Interactions:**
| Feature | Test Users | Expected Behavior |
|---------|-----------|------------------|
| Create text post | All users | Posts appear in friends' feeds |
| Upload photo post | Premium users | Photos stored, visible to friends |
| Upload video post | Premium users | Videos processed, playable |
| @mention friend | All users | Friend gets notification |
| @mention non-friend | Error | Can only mention friends |
| Like post | All users | Like count increments |
| Comment on post | All users | Comment appears, author notified |
| Reply to comment | All users | Nested comments work |
| Share post | All users | Shared post appears in sharer's feed |
| Delete own post | All users | Post removed from feeds |

**Events:**
| Feature | Test Users | Expected Behavior |
|---------|-----------|------------------|
| Create free event | Community Leader+ | Event appears in calendar |
| Create paid event | Community Leader+ | Stripe integration works |
| RSVP to event | All users | RSVP count increments |
| Cancel RSVP | All users | RSVP count decrements |
| Check-in to event | All users | Check-in recorded |
| Invite friend to event | All users | Friend gets invitation |
| Batch invite (10+ friends) | Organizers | Invitations batched over days |
| @mention DJ in event | Organizers | DJ gets notification |

**Groups:**
| Feature | Test Users | Expected Behavior |
|---------|-----------|------------------|
| Create city group | Community Leader | Group created, admin assigned |
| Create professional group | Community Leader | Role-based group created |
| Join public group | All users | Member count increments |
| Join private group | Invited users | Approval required |
| Invite to group | Group admins | Invitation sent |
| Approve member | Group admins | Member added to group |
| Post in group | Members | Post visible to group |
| @mention group member | Members | Member notified |

---

### Test Dimension 4: Platform Features Validation

**Housing Marketplace:**
| Test | User | Expected Result |
|------|------|----------------|
| Create listing | Maria (teacher) | Listing appears in search |
| Search by city | Ahmed (traveler) | Filtered results show |
| Book housing | Ahmed | Booking recorded |
| Leave review | Ahmed | Review appears on listing |
| @mention host | Ahmed | Host notified |

**Professional Reputation:**
| Test | User | Expected Result |
|------|------|----------------|
| Give teacher endorsement | Chen → Maria | Maria's reputation score increases |
| Give DJ endorsement | Sofia → Jackson | Jackson's DJ score increases |
| Give organizer endorsement | Scott → Sofia | Sofia's organizer score increases |
| Give venue endorsement | Ahmed → David | David's venue score increases |
| View reputation page | All users | Endorsements visible |

**Messaging:**
| Test | Users | Expected Result |
|------|-------|----------------|
| Send DM (1st degree) | Scott → Maria | Message delivered |
| Send DM (follower) | Follower → Jackson | Error (can't message non-friend) |
| Send DM (unknown) | Elena → Scott | Error (can't message unknown) |
| Create group chat | Scott + 5 friends | Group chat created |
| @mention in group chat | All chat members | Mentioned user notified |

**Invitations:**
| Test | User | Expected Result |
|------|------|----------------|
| Invite 1 friend | Scott | Single invitation sent |
| Invite 20 friends (batch) | Scott | Batched over 3 days (7/7/6) |
| Friend receives invitation | New user | Email with "Scott invites you" |
| Multiple invites same person | Scott, Maria, Sofia → Elena | "3 people invite you" message |
| Accept invitation | Elena | Account created, friendship pre-filled |

---

## 🚨 CRITICAL GAPS IDENTIFIED (PRIORITIZED)

### Category 1: MISSING TECHNOLOGY (Must Build)

#### Gap 1.1: Instagram Graph API Integration
**Status:** NOT IMPLEMENTED  
**Priority:** HIGH (PART_10 requirement)  
**Complexity:** Medium (2-3 days)

**What's Missing:**
- Instagram OAuth flow
- Instagram message scraping
- Instagram post scraping
- Instagram closeness metrics
- Instagram invitation sending

**Implementation Required:**
```typescript
// server/services/instagram/InstagramGraphAPI.ts
- OAuth authentication flow
- Message history API calls
- Post/comment scraping
- Closeness score calculation
- Rate limiting (200 API calls/hour)
```

**Integration Points:**
- Multi-platform scraper (`MultiPlatformScraper.ts`)
- Friend closeness table (combine FB + IG data)
- Invitation batching system

---

#### Gap 1.2: WhatsApp Business API Integration
**Status:** NOT IMPLEMENTED  
**Priority:** HIGH (PART_10 requirement)  
**Complexity:** High (4-5 days)

**What's Missing:**
- WhatsApp Business account setup
- WhatsApp message scraping (requires phone number verification)
- WhatsApp closeness metrics
- WhatsApp invitation sending

**Implementation Required:**
```typescript
// server/services/whatsapp/WhatsAppBusinessAPI.ts
- Business account verification
- Message template creation (for invitations)
- Message history API
- Rate limiting (1000 messages/24 hours)
```

**Legal Considerations:**
- WhatsApp requires business verification
- Message templates must be pre-approved
- User consent required for scraping

---

#### Gap 1.3: Batch Invitation Scheduler
**Status:** PARTIALLY IMPLEMENTED  
**Priority:** CRITICAL (PART_10 core feature)  
**Complexity:** Medium (2-3 days)

**What's Missing:**
- Batch queue system (send 7 invites/day over 3 days for 20 friends)
- "X people are inviting you" email templating
- Social messenger integration (FB Messenger, Instagram DM, WhatsApp)
- Rate limiting coordination across platforms

**Implementation Required:**
```typescript
// server/services/invitations/BatchInvitationScheduler.ts
- BullMQ job for daily batch sending
- Combine invitations from multiple inviters
- Template: "Scott, Maria, and 3 others invite you to Mundo Tango"
- Track invitation status per friend
```

---

#### Gap 1.4: AI Voice/Style Analyzer (Mr. Blue)
**Status:** NOT IMPLEMENTED  
**Priority:** HIGH (PART_10 requirement)  
**Complexity:** High (5-7 days)

**What's Missing:**
- Analyze Scott's writing style from FB messages
- Analyze Scott's voice tone from audio
- Generate auto-drafted friendship requests
- Generate auto-drafted invitations
- Scott reviews/edits before sending

**Implementation Required:**
```typescript
// server/services/mrBlue/VoiceStyleAnalyzer.ts
- OpenAI GPT-4o fine-tuning on Scott's messages
- Voice tone analysis (if audio available)
- Message generation API
- "Scott's style" confidence score
```

---

#### Gap 1.5: Professional Endorsement UI
**Status:** BACKEND EXISTS, FRONTEND INCOMPLETE  
**Priority:** MEDIUM  
**Complexity:** Low (1-2 days)

**What's Missing:**
- Endorsement request form (on profile page)
- Endorsement approval/decline workflow
- Reputation score display page
- Endorsement badge system
- Tango résumé builder

**Implementation Required:**
```typescript
// client/src/pages/ReputationPage.tsx
- Display all endorsements received
- Skill breakdown (teaching, musicality, organization)
- Star ratings visualization
- Request endorsement button
```

---

#### Gap 1.6: Tiered Mr. Blue Tours + Sentiment Tracking
**Status:** PARTIALLY IMPLEMENTED  
**Priority:** MEDIUM (PART_10 requirement)  
**Complexity:** Medium (3-4 days)

**What's Missing:**
- Role-based tour variations (teacher tour ≠ DJ tour)
- Sentiment analysis during tour (is user frustrated?)
- Adaptive tour pacing (slow down if confused)
- Tour completion analytics

**Implementation Required:**
```typescript
// server/services/mrBlue/TieredTourSystem.ts
- Define 5 tour types (dancer, teacher, DJ, organizer, admin)
- Sentiment analysis via GPT-4o
- Adaptive pacing algorithm
- Tour analytics dashboard
```

---

#### Gap 1.7: Badge System (Financial Supporter)
**Status:** PARTIALLY IMPLEMENTED  
**Priority:** LOW  
**Complexity:** Low (1 day)

**What's Missing:**
- "Early Supporter" badge (first 100 premium users)
- "Financial Supporter" badge (donated to platform)
- Badge display on profile
- Badge achievement notifications

**Implementation Required:**
```typescript
// server/services/badges/BadgeSystem.ts
- Badge definitions (early_supporter, donor, volunteer)
- Award badge on subscription/donation
- Display badges on profile page
```

---

### Category 2: MISSING COMMUNICATIONS

#### Gap 2.1: Instagram DM API
**Status:** NOT INTEGRATED  
**Needs:** Instagram Graph API  
**Use Case:** Send invitations via Instagram DM

#### Gap 2.2: WhatsApp Business Messaging
**Status:** NOT INTEGRATED  
**Needs:** WhatsApp Business API  
**Use Case:** Send batched invitations via WhatsApp

#### Gap 2.3: Email Invitation Batching
**Status:** PARTIALLY DONE  
**Needs:** Template for "X people invite you"  
**Use Case:** Professional email invitations

#### Gap 2.4: SMS Invitations (Twilio)
**Status:** NOT INTEGRATED  
**Needs:** Twilio integration  
**Use Case:** SMS invitations for users without social media

#### Gap 2.5: Push Notifications (Firebase)
**Status:** NOT INTEGRATED  
**Needs:** Firebase Cloud Messaging  
**Use Case:** Real-time notifications for friend requests, @mentions

---

### Category 3: MISSING EXPERTISE

#### Gap 3.1: Legal Compliance Specialist
**Need:** GDPR/CCPA compliance review  
**Specific Issues:**
- Data retention policy review
- Right to deletion implementation
- Consent management for scraping
- Cross-border data transfer compliance

**Recommendation:** Consult with legal firm specializing in tech/social media

---

#### Gap 3.2: Social Media Policy Expert
**Need:** FB/IG/WhatsApp scraping legal review  
**Specific Issues:**
- Facebook Terms of Service compliance
- Instagram API usage policy
- WhatsApp Business API restrictions
- Rate limiting strategy to avoid bans

**Recommendation:** Consult with social media API specialist

---

#### Gap 3.3: Rate Limiting Strategist
**Need:** Avoid platform bans  
**Current Status:** INTERNAL EXPERTISE OK (RateLimitTracker exists)  
**Enhancement Needed:** Coordination across FB + IG + WhatsApp

---

#### Gap 3.4: Professional Network Designer
**Need:** Endorsement system UX  
**Current Status:** INTERNAL EXPERTISE OK  
**Enhancement Needed:** Gamification elements

---

#### Gap 3.5: AI Training Specialist
**Need:** Voice/style analysis training  
**Current Status:** INTERNAL EXPERTISE OK (OpenAI GPT-4o fine-tuning)  
**Enhancement Needed:** Training data curation from Scott's messages

---

## 📋 COMPREHENSIVE TEST SCENARIOS

### Scenario 1: The Plan (Scott's First Login)
**Users:** Scott  
**Duration:** 2-4 hours  
**Pages:** All 50 pages from PART_10

**Test Flow:**
1. Scott logs in → Welcome screen appears
2. Mr. Blue introduces "The Plan"
3. Scott clicks "Start The Plan"
4. Progress bar appears (0/50 pages)
5. Page 1: Dashboard → Checklist items validated
6. Auto-advance to Page 2: User Profile
7. Continue through all 50 pages
8. At Page 50: Completion report generated
9. Download validation report

**Success Criteria:**
- All 50 pages accessible
- All checklist items testable
- Progress tracked accurately
- Report generated with findings

---

### Scenario 2: Multi-User RBAC Testing
**Users:** All 10 users  
**Duration:** 1 hour  
**Focus:** Role-based access control

**Test Flow:**
1. Each user logs in simultaneously
2. Each attempts to access features beyond their role
3. Verify 403 errors for unauthorized access
4. Admin panel visible only to Admin+ (Levels 4-8)
5. Moderation queue visible to Volunteer+ (Levels 6-8)
6. God features visible only to Scott
7. Free users hit storage limit
8. Premium users have no limits

**Success Criteria:**
- All unauthorized access blocked
- Correct features shown per role
- Storage limits enforced
- No permission leaks

---

### Scenario 3: Friend Relation Algorithm Testing
**Users:** Scott, Maria, Elena, Chen  
**Duration:** 30 minutes  
**Focus:** Closeness scoring & connection degrees

**Test Flow:**
1. Elena (unknown) searches for Scott → Sees public profile only
2. Elena sends friend request to Scott
3. Scott accepts → Elena becomes 1st degree (closeness 75)
4. Scott messages Elena 10 times → Closeness increases to 82
5. Maria (Close to Scott) messages Scott 50 times → Closeness stays 90+
6. Chen blocks user → User invisible
7. Test 2nd degree: Elena sees Maria's public posts (friend of friend)
8. Test 3rd degree: Elena sees public profiles only

**Success Criteria:**
- Closeness scores update based on interactions
- Connection degrees calculated correctly
- Unknown users see limited profiles
- Blocked users completely invisible

---

### Scenario 4: @Mention Cross-User Testing
**Users:** Scott, Maria, Sofia, Jackson  
**Duration:** 20 minutes  
**Focus:** Mention functionality across posts, comments, events

**Test Flow:**
1. Scott creates post, @mentions Maria → Maria gets notification
2. Sofia creates event, @mentions Jackson (DJ) → Jackson notified
3. Maria comments on post, @mentions Sofia → Sofia notified
4. Try @mention non-friend (unknown) → Error
5. Try @mention in group chat → All members notified
6. Test @mention in housing review → Host notified

**Success Criteria:**
- All mentions trigger notifications
- Can only mention friends (1st degree)
- Mentions work in posts, comments, events, reviews
- Unknown users can't be mentioned

---

### Scenario 5: Invitation Batching System
**Users:** Scott  
**Duration:** 3 days (automated test)  
**Focus:** Batch invitation sending

**Test Flow:**
1. Scott imports 20 friends from Facebook
2. Selects "Invite All" button
3. System batches: Day 1 (7 invites), Day 2 (7 invites), Day 3 (6 invites)
4. Each friend receives email: "Scott invites you to Mundo Tango"
5. Maria also invites same friend → Email updates to "Scott and Maria invite you"
6. Friend clicks link → Pre-filled profile with Scott's description
7. Friend confirms friendship → Scott notified

**Success Criteria:**
- Invitations batched over 3 days
- No more than 7/day sent
- Combined inviter names shown
- Pre-filled profiles work
- Friendship auto-created on signup

---

### Scenario 6: Professional Reputation Testing
**Users:** Maria (teacher), Chen (student), Jackson (DJ), Sofia (organizer)  
**Duration:** 15 minutes  
**Focus:** Endorsement workflow

**Test Flow:**
1. Chen takes Maria's workshop
2. Chen gives endorsement: "Teaching - 5 stars - Great musicality"
3. Maria's reputation score increases
4. Maria requests endorsement from Sofia (organizer)
5. Sofia approves endorsement
6. Maria's profile shows "Endorsed by 2 people"
7. Jackson receives DJ endorsement from Sofia
8. Test endorsement categories (teaching, DJ, organizing, performing)

**Success Criteria:**
- Endorsements appear on profile
- Reputation scores calculated
- Multiple endorsement categories supported
- Request/approve workflow works

---

### Scenario 7: Housing Marketplace End-to-End
**Users:** Ahmed (traveler), Maria (host)  
**Duration:** 10 minutes  
**Focus:** Housing booking workflow

**Test Flow:**
1. Maria creates listing: "Teacher apartment in Buenos Aires"
2. Ahmed searches housing for Paris trip
3. Finds Maria's listing in search results
4. Ahmed books 3 nights
5. Booking appears in Maria's dashboard
6. Ahmed checks in → Booking confirmed
7. Ahmed leaves review: "5 stars - Amazing host!"
8. Review appears on Maria's listing

**Success Criteria:**
- Listings searchable by city
- Booking workflow complete
- Reviews display correctly
- Host notified of bookings

---

### Scenario 8: Multi-Platform Closeness Metrics
**Users:** Scott  
**Duration:** 1 hour (manual scraping test)  
**Focus:** Facebook + Instagram + WhatsApp integration

**Test Flow:**
1. Scott grants Facebook permissions
2. System scrapes FB messages → Finds 50 friends
3. Scott grants Instagram permissions
4. System scrapes IG messages → Finds 30 friends (20 overlap with FB)
5. System combines: 60 unique friends total
6. For overlap (Lee Angelica): FB messages (100) + IG messages (50) = closeness 95
7. For FB-only friend: closeness 80
8. For IG-only friend: closeness 70
9. Display unified friend list sorted by closeness

**Success Criteria:**
- Multi-platform scraping works
- Duplicate friends merged correctly
- Closeness scores combined from both platforms
- Unified friend list accurate

---

## 🎯 MB.MD PROTOCOL v9.2 EXECUTION PLAN

### Phase 1: Research & Gap Analysis (COMPLETE)
**Duration:** ✅ DONE  
**Deliverables:**
- ✅ Identified 7 missing technologies
- ✅ Identified 5 missing communication channels
- ✅ Identified 5 expertise gaps
- ✅ Designed 10 test user personas
- ✅ Created comprehensive test matrix

---

### Phase 2: Infrastructure Preparation (NOT STARTED)
**Duration:** 3-5 days  
**Work Streams (Parallel):**

**Stream 1: Database Preparation**
- Create 10 test users with diverse profiles
- Establish friend relations matrix
- Seed sample data (posts, events, groups)
- Configure RBAC roles per user

**Stream 2: Missing Tech Implementation**
- Instagram Graph API integration (2 days)
- Batch invitation scheduler (2 days)
- Professional endorsement UI (1 day)

**Stream 3: Communication Channels**
- Email invitation templates (0.5 days)
- WhatsApp Business API setup (3 days)
- Instagram DM API setup (1 day)

---

### Phase 3: Comprehensive Testing (NOT STARTED)
**Duration:** 5-7 days  
**Work Streams (Parallel):**

**Stream 1: RBAC/ABAC Validation (2 days)**
- Execute 10-user role testing
- Document permission matrices
- Fix any unauthorized access bugs

**Stream 2: Friend Relation Testing (1 day)**
- Validate closeness algorithm
- Test connection degrees
- Verify follower/blocked behavior

**Stream 3: Social Features Testing (2 days)**
- @mention validation
- Invitation batching
- Professional endorsements
- Housing marketplace

---

### Phase 4: E2E Playwright Test Suite (NOT STARTED)
**Duration:** 3-4 days  
**Deliverables:**
- Write 50 Playwright tests (1 per PART_10 page)
- Execute full test suite
- Generate coverage report
- Fix all critical bugs

---

### Phase 5: Production Deployment (NOT STARTED)
**Duration:** 1-2 days  
**Deliverables:**
- Deploy to production
- Run smoke tests
- Monitor for errors
- Generate final validation report

---

## 📊 ESTIMATED RESOURCE REQUIREMENTS

### Development Time
| Phase | Duration | Complexity |
|-------|----------|-----------|
| Infrastructure Prep | 3-5 days | Medium |
| Comprehensive Testing | 5-7 days | High |
| E2E Test Suite | 3-4 days | Medium |
| Production Deployment | 1-2 days | Low |
| **TOTAL** | **12-18 days** | **High** |

### External Resources Needed
| Resource | Cost | Timeline |
|----------|------|----------|
| Legal compliance review | $2,000-5,000 | 1-2 weeks |
| Social media policy expert | $1,500-3,000 | 1 week |
| WhatsApp Business verification | $0 (free) | 3-5 days |
| Instagram Graph API access | $0 (free) | Instant |

---

## 🚀 RECOMMENDED NEXT STEPS

1. **APPROVE THIS PLAN** (User decision required)
2. **PRIORITIZE GAPS:** Which missing tech is most critical?
3. **ALLOCATE RESOURCES:** How many days can be dedicated?
4. **EXECUTE PHASE 2:** Implement missing infrastructure
5. **CREATE 10 TEST USERS:** Execute comprehensive validation
6. **RUN E2E TESTS:** Validate all 50 pages
7. **GENERATE REPORT:** Document findings vs PART_10 specs

---

## 📝 CONCLUSION

This comprehensive plan identifies **19 critical gaps** across technology, communications, and expertise. The **10 test users** provide comprehensive coverage of:

- ✅ All 8 RBAC levels
- ✅ All 6 friend relation types
- ✅ All tango roles (teacher, DJ, organizer, performer, dancer, venue)
- ✅ Global geographic distribution
- ✅ Diverse engagement patterns

**Execution of this plan will validate:**
- 50 PART_10 pages end-to-end
- RBAC/ABAC permissions matrix
- Friend relation algorithms
- Professional reputation system
- Multi-platform data integration
- Invitation batching system
- All social features (@mention, posts, events, groups)

**Total effort:** 12-18 development days + 2-3 weeks for external consultations.

---

**Built with:** MB.MD Protocol v9.2 (Simultaneously, Recursively, Critically)  
**Quality Target:** 95-99/100  
**Status:** READY FOR APPROVAL & EXECUTION
