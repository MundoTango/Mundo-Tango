# MB.MD v9.9.4 RECURSIVE TESTING PLAN - PART 4
## UNCOVERED SYSTEMS DISCOVERY (60+ Tables)

**Created**: December 11, 2025  
**Methodology**: MB.MD v9.9.4 (Research → Plan → Build → Test → Fix → Document)

---

## EXECUTIVE SUMMARY

**Total Platform Tables**: 412 pgTable definitions discovered  
**Previously Documented**: ~150 tables across Parts 1-3  
**Newly Discovered**: 60+ tables requiring comprehensive testing  

This document catalogs ALL uncovered systems with field-level test actions.

---

## TABLE OF CONTENTS

1. [Financial Management System (13 tables)](#1-financial-management-system-13-tables)
2. [Travel Planning System (11 tables)](#2-travel-planning-system-11-tables)
3. [Gamification System (7 tables)](#3-gamification-system-7-tables)
4. [Life CEO 16-Domain System (6 tables)](#4-life-ceo-16-domain-system-6-tables)
5. [God-Level Content Creation (4 tables)](#5-god-level-content-creation-4-tables)
6. [Social Media Management (5 tables)](#6-social-media-management-5-tables)
7. [Memories & Discovery Features (5 tables)](#7-memories--discovery-features-5-tables)
8. [Professional Profiles (17+ types)](#8-professional-profiles-17-types)
9. [Mr. Blue Autonomous System (8 tables)](#9-mr-blue-autonomous-system-8-tables)
10. [H2AC Framework (Human-to-Agent)](#10-h2ac-framework-human-to-agent)
11. [Browser Automation System](#11-browser-automation-system)
12. [Remaining Infrastructure Tables](#12-remaining-infrastructure-tables)

---

## 1. FINANCIAL MANAGEMENT SYSTEM (13 Tables)

**Agent Range**: #73-105 (33 Financial AI Agents)  
**Priority**: P0-CRITICAL (Revenue-generating)

### 1.1 financialPortfolios (lines 12754-12776)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key - auto-generated |
| `userId` | integer | FK to users - verify relationship |
| `name` | varchar(255) | CREATE: "My Portfolio" |
| `type` | varchar(50) | CREATE: personal/business/retirement |
| `totalValue` | numeric(15,2) | UPDATE: Calculate from assets |
| `cashBalance` | numeric(15,2) | UPDATE: Track available cash |
| `createdAt` | timestamp | System-generated |
| `updatedAt` | timestamp | System-generated on changes |

**Test Actions:**
- [ ] CREATE portfolio for user
- [ ] READ all user portfolios
- [ ] UPDATE portfolio value after trades
- [ ] DELETE portfolio (cascade to assets)
- [ ] CALCULATE total value from assets

---

### 1.2 financialAccounts (lines 12779-12804)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users |
| `provider` | varchar(50) | CREATE: coinbase/schwab/puzzle/mercury |
| `accountId` | varchar(255) | External account ID |
| `accountType` | varchar(50) | brokerage/crypto/banking/business |
| `balance` | numeric(15,2) | Sync balance from provider |
| `lastSyncedAt` | timestamp | Track last sync |
| `credentials` | jsonb | Encrypted credentials |

**Test Actions:**
- [ ] CONNECT external account
- [ ] SYNC account balance
- [ ] VERIFY credentials encryption
- [ ] LIST user accounts by provider
- [ ] DISCONNECT account

---

### 1.3 financialAssets (lines 12807-12833)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `portfolioId` | integer | FK to financialPortfolios |
| `symbol` | varchar(50) | CREATE: "BTC", "AAPL" |
| `assetType` | varchar(50) | stock/crypto/bond/etf/option |
| `quantity` | numeric(20,8) | CREATE: 1.5 BTC |
| `averagePrice` | numeric(15,2) | Calculate from trades |
| `currentPrice` | numeric(15,2) | UPDATE from market data |
| `totalValue` | numeric(15,2) | quantity * currentPrice |
| `lastUpdatedAt` | timestamp | Price update time |

**Test Actions:**
- [ ] ADD asset to portfolio
- [ ] UPDATE current price from market data
- [ ] CALCULATE total value
- [ ] LIST assets by type
- [ ] REMOVE asset (sell all)

---

### 1.4 financialTrades (lines 12836-12862)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `portfolioId` | integer | FK to financialPortfolios |
| `symbol` | varchar(50) | Trade symbol |
| `tradeType` | varchar(20) | buy/sell/transfer |
| `quantity` | numeric(20,8) | Trade quantity |
| `price` | numeric(15,2) | Execution price |
| `totalAmount` | numeric(15,2) | quantity * price |
| `fees` | numeric(15,2) | Transaction fees |
| `strategy` | varchar(255) | Which AI agent initiated |
| `executedAt` | timestamp | Execution time |
| `status` | varchar(20) | pending/executed/failed |

**Test Actions:**
- [ ] EXECUTE buy trade
- [ ] EXECUTE sell trade
- [ ] CALCULATE total with fees
- [ ] LIST trades by date range
- [ ] FILTER trades by symbol
- [ ] LINK trade to AI strategy

---

### 1.5 financialStrategies (lines 12865-12890)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `name` | varchar(255) | Strategy name |
| `agentId` | integer | Agent #73-105 |
| `strategyType` | varchar(50) | momentum/value/arbitrage/swing/day_trading |
| `riskLevel` | varchar(20) | low/medium/high/aggressive |
| `capitalAllocation` | numeric(15,2) | Amount allocated |
| `isActive` | boolean | Enable/disable |
| `performance` | jsonb | returns, sharpe ratio |
| `rules` | jsonb | Strategy parameters |

**Test Actions:**
- [ ] CREATE strategy
- [ ] ASSIGN to agent
- [ ] ACTIVATE/DEACTIVATE strategy
- [ ] UPDATE capital allocation
- [ ] TRACK performance metrics

---

### 1.6 financialMarketData (lines 12893-12916)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `symbol` | varchar(50) | Stock/crypto symbol |
| `price` | numeric(15,2) | Current price |
| `volume` | numeric(20,2) | 24h volume |
| `change24h` | numeric(10,2) | 24h change % |
| `high24h` | numeric(15,2) | 24h high |
| `low24h` | numeric(15,2) | 24h low |
| `marketCap` | numeric(20,2) | Market cap |
| `timestamp` | timestamp | Data timestamp |

**Test Actions:**
- [ ] FETCH market data
- [ ] STORE price history
- [ ] QUERY by symbol
- [ ] CALCULATE price change
- [ ] CACHE data (30-second refresh)

---

### 1.7 financialAIDecisions (lines 12919-12948)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `agentId` | integer | Agent #73-105 |
| `portfolioId` | integer | FK to portfolios |
| `decisionType` | varchar(20) | buy/sell/hold/rebalance |
| `symbol` | varchar(50) | Asset symbol |
| `reasoning` | text | AI explanation |
| `confidence` | numeric(3,2) | 0-1 confidence score |
| `recommendation` | jsonb | Full recommendation |
| `executedTradeId` | integer | FK to trades |

**Test Actions:**
- [ ] LOG AI decision
- [ ] STORE reasoning
- [ ] LINK to executed trade
- [ ] QUERY decisions by agent
- [ ] FILTER by confidence threshold

---

### 1.8 financialRiskMetrics (lines 12952-12975)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `portfolioId` | integer | FK to portfolios |
| `sharpeRatio` | numeric(10,4) | Risk-adjusted return |
| `maxDrawdown` | numeric(10,4) | Maximum loss |
| `volatility` | numeric(10,4) | Price volatility |
| `beta` | numeric(10,4) | Market correlation |
| `var95` | numeric(15,2) | Value at Risk (95%) |
| `exposureByAsset` | jsonb | Asset allocation |
| `calculatedAt` | timestamp | Calculation time |

**Test Actions:**
- [ ] CALCULATE risk metrics
- [ ] UPDATE after trades
- [ ] ALERT on high risk
- [ ] COMPARE to benchmark

---

### 1.9 financialAgents (lines 12978-13000)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `agentNumber` | integer | 73-105 (unique) |
| `name` | varchar(255) | Agent name |
| `tier` | integer | 1-6 (agent tier) |
| `role` | varchar(255) | Agent role |
| `isActive` | boolean | Active status |
| `lastRunAt` | timestamp | Last execution |
| `successRate` | numeric(5,2) | Success percentage |
| `totalDecisions` | integer | Decision count |

**Test Actions:**
- [ ] LIST all financial agents
- [ ] ACTIVATE/DEACTIVATE agent
- [ ] TRACK success rate
- [ ] LOG last run time
- [ ] COUNT decisions

---

### 1.10 financialMonitoring (lines 13003-13031)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `agentId` | integer | FK to financialAgents |
| `portfolioId` | integer | FK to portfolios |
| `checkType` | varchar(50) | price/risk/opportunity/alert |
| `findings` | jsonb | Check results |
| `actionTaken` | boolean | Action triggered |
| `timestamp` | timestamp | Check time |

**Test Actions:**
- [ ] LOG monitoring check
- [ ] FILTER by check type
- [ ] COUNT alerts
- [ ] TRIGGER action from finding

---

### 1.11-1.13 Additional Financial Tables

| Table | Lines | Fields | Test Focus |
|-------|-------|--------|------------|
| `financialGoals` | 15657+ | 10+ | Goal tracking, target amounts |
| `financialTransactions` | 17182+ | 12+ | Transaction log |
| `investments` | 17254+ | 10+ | Investment tracking |

---

## 2. TRAVEL PLANNING SYSTEM (11 Tables)

**Priority**: P0-CRITICAL (Core feature for tango travelers)

### 2.1 travelPlans (lines 6882-6911)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users |
| `cityId` | integer | FK to city group |
| `city` | varchar(255) | Destination city |
| `country` | varchar(255) | Destination country |
| `cities` | jsonb | Multi-city trips |
| `startDate` | timestamp | Trip start |
| `endDate` | timestamp | Trip end |
| `tripDuration` | integer | Days |
| `budget` | varchar(255) | Budget range |
| `interests` | text[] | Tango interests |
| `travelStyle` | varchar(255) | Travel style |
| `status` | varchar(50) | planning/confirmed/completed |
| `visibility` | varchar(20) | public/friends/private |
| `notes` | text | Trip notes |

**Test Actions:**
- [ ] CREATE travel plan
- [ ] SET destinations (single/multi-city)
- [ ] UPDATE status (planning → confirmed)
- [ ] SHARE with friends
- [ ] LINK to events in destination

---

### 2.2 travelPlanItems (lines 6913-6942)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `travelPlanId` | integer | FK to travelPlans |
| `type` | varchar(50) | accommodation/transport/event/activity |
| `title` | varchar(255) | Item title |
| `description` | text | Description |
| `date` | timestamp | Item date |
| `endDate` | timestamp | End date |
| `location` | varchar(255) | Location |
| `cost` | numeric(10,2) | Total cost |
| `costPerNight` | numeric(10,2) | Nightly rate |
| `nights` | integer | Number of nights |
| `bookingUrl` | varchar(512) | Booking link |
| `isBooked` | boolean | Booking status |
| `transportType` | varchar(50) | Flight/train/bus |
| `departureTime` | timestamp | Departure |
| `arrivalTime` | timestamp | Arrival |
| `departureLocation` | varchar(255) | From |
| `arrivalLocation` | varchar(255) | To |
| `linkedEventId` | integer | FK to events |

**Test Actions:**
- [ ] ADD accommodation item
- [ ] ADD transport item
- [ ] LINK to tango event
- [ ] CALCULATE total cost
- [ ] MARK as booked

---

### 2.3 tripJoinRequests (lines 6949-6979)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `tripId` | integer | FK to travelPlans |
| `requesterId` | integer | Person requesting |
| `ownerId` | integer | Trip owner |
| `message` | text | Request message |
| `status` | varchar(20) | pending/accepted/rejected |
| `respondedAt` | timestamp | Response time |

**Test Actions:**
- [ ] REQUEST to join trip
- [ ] ACCEPT/REJECT request
- [ ] NOTIFY on status change
- [ ] LIST pending requests

---

### 2.4-2.11 Additional Travel Tables

| Table | Lines | Fields | Test Focus |
|-------|-------|--------|------------|
| `travelPreferencesProfiles` | 12206+ | 15+ | User travel preferences |
| `travelSearches` | 14310+ | 10+ | Search history |
| `tripPlans` | 14414+ | 12+ | Alternative trip plans |
| `travelBookings` | 14446+ | 15+ | Booking confirmations |
| `tripItineraryItems` | 14477+ | 12+ | Detailed itinerary |
| `travelPreferences` | 14509+ | 8+ | Quick preferences |
| `travelBuddies` | 14532+ | 8+ | Travel companions |
| `travelAlerts` | 14559+ | 8+ | Price/availability alerts |
| `travelApiCache` | 14583+ | 8+ | API response cache |

---

## 3. GAMIFICATION SYSTEM (7 Tables)

**Priority**: P1-HIGH (User engagement)

### 3.1 achievements (lines 6409-6428)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `slug` | varchar(100) | Unique identifier |
| `name` | varchar(255) | Achievement name |
| `description` | text | Description |
| `category` | varchar(100) | Category |
| `iconUrl` | varchar(512) | Icon |
| `pointsValue` | integer | Points awarded |
| `rarity` | varchar(50) | common/rare/epic/legendary |
| `requirementType` | varchar(100) | Unlock condition type |
| `requirementValue` | integer | Condition value |

**Test Actions:**
- [ ] CREATE achievement
- [ ] CATEGORIZE achievements
- [ ] SET rarity levels
- [ ] DEFINE unlock requirements

---

### 3.2 userAchievements (lines 6430-6453)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users |
| `achievementId` | integer | FK to achievements |
| `progress` | integer | Current progress |
| `progressMax` | integer | Max progress |
| `isCompleted` | boolean | Completion status |
| `isDisplayed` | boolean | Show on profile |
| `displayOrder` | integer | Display order |
| `earnedAt` | timestamp | Unlock time |

**Test Actions:**
- [ ] TRACK progress toward achievement
- [ ] UNLOCK achievement
- [ ] DISPLAY on profile
- [ ] REORDER displayed achievements

---

### 3.3 userPoints (lines 6455-6478)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users (unique) |
| `totalPoints` | integer | Total points |
| `socialPoints` | integer | Social activity points |
| `eventPoints` | integer | Event attendance points |
| `contributionPoints` | integer | Community contribution |
| `achievementPoints` | integer | Achievement points |
| `level` | integer | Current level |
| `levelProgress` | integer | Progress to next level |
| `nextLevelThreshold` | integer | Points for next level |

**Test Actions:**
- [ ] AWARD points by category
- [ ] CALCULATE total
- [ ] LEVEL UP user
- [ ] DISPLAY leaderboard

---

### 3.4-3.7 Additional Gamification Tables

| Table | Lines | Fields | Test Focus |
|-------|-------|--------|------------|
| `gamificationPoints` | 16584+ | 5 | Point transaction log |
| `gamificationBadges` | 16615+ | 5 | Badge definitions |
| `userBadges` | 16640+ | 4 | User badge awards |
| `autonomyProgress` | 16670+ | 5 | Platform autonomy tracking |

---

## 4. LIFE CEO 16-DOMAIN SYSTEM (6 Tables)

**Agent Range**: P66-P81 (16 Life CEO Agents)  
**Priority**: P1-HIGH (Premium feature)

### 4.1 lifeCeoDomains (lines 2171-2179)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `name` | varchar | Domain name (unique) |
| `agentId` | varchar | Agent identifier |
| `description` | text | Domain description |
| `icon` | varchar | Domain icon |
| `color` | varchar | Theme color |

**16 Domains:**
1. Health
2. Fitness
3. Nutrition
4. Sleep
5. Stress
6. Finance
7. Career
8. Productivity
9. Learning
10. Creativity
11. Relationships
12. Social
13. Entertainment
14. Travel
15. Home Management
16. Wellness

**Test Actions:**
- [ ] SEED all 16 domains
- [ ] LINK to agent IDs
- [ ] DISPLAY domain dashboard

---

### 4.2 lifeCeoGoals (lines 2182-2206)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users |
| `domainId` | integer | FK to lifeCeoDomains |
| `title` | text | Goal title |
| `description` | text | Goal description |
| `targetDate` | timestamp | Target date |
| `status` | varchar | active/completed/paused |
| `progress` | integer | 0-100 percentage |
| `priority` | varchar | low/medium/high |
| `metadata` | jsonb | Additional data |
| `completedAt` | timestamp | Completion time |

**Test Actions:**
- [ ] CREATE goal in domain
- [ ] UPDATE progress
- [ ] COMPLETE goal
- [ ] LINK to milestones

---

### 4.3 lifeCeoTasks (lines 2209-2240)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users |
| `goalId` | integer | FK to goals |
| `domainId` | integer | FK to domains |
| `title` | text | Task title |
| `description` | text | Task description |
| `dueDate` | timestamp | Due date |
| `status` | varchar | pending/in_progress/completed |
| `priority` | varchar | low/medium/high |
| `estimatedMinutes` | integer | Time estimate |
| `actualMinutes` | integer | Actual time |
| `recurring` | varchar | daily/weekly/monthly |
| `metadata` | jsonb | Additional data |
| `completedAt` | timestamp | Completion time |

**Test Actions:**
- [ ] CREATE task for goal
- [ ] SET due date
- [ ] MARK complete
- [ ] TRACK time spent
- [ ] CREATE recurring task

---

### 4.4-4.6 Additional Life CEO Tables

| Table | Lines | Fields | Test Focus |
|-------|-------|--------|------------|
| `lifeCeoMilestones` | 2243+ | 6 | Goal milestones |
| `lifeCeoRecommendations` | 2262+ | 12 | AI recommendations |
| `lifeCeoConversations` | 2061+ | 5 | Chat history |
| `lifeCeoChatMessages` | 2078+ | 5 | Chat messages |

---

## 5. GOD-LEVEL CONTENT CREATION (4 Tables)

**Priority**: P1-HIGH (Premium tier feature)

### 5.1 godLevelQuotas (lines 233-255)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users (unique) |
| `videoQuotaUsed` | integer | Videos generated |
| `videoQuotaLimit` | integer | Monthly limit (default 5) |
| `voiceQuotaUsed` | integer | Voice clones used |
| `voiceQuotaLimit` | integer | Monthly limit (default 5) |
| `quotaResetDate` | timestamp | Next reset date |

**Test Actions:**
- [ ] CHECK quota before generation
- [ ] INCREMENT usage on generation
- [ ] RESET quota monthly
- [ ] ENFORCE limits

---

### 5.2 lumaVideos (lines 261-291)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users |
| `generationId` | varchar(255) | Luma API ID (unique) |
| `prompt` | text | Generation prompt |
| `videoUrl` | text | Luma video URL |
| `cloudinaryUrl` | text | Cloudinary CDN URL |
| `cloudinaryPublicId` | varchar(255) | Cloudinary ID |
| `status` | varchar(50) | pending/processing/completed/failed |
| `duration` | integer | Video duration (seconds) |
| `aspectRatio` | varchar(10) | 16:9, 9:16, 1:1 |
| `width` | integer | Video width |
| `height` | integer | Video height |
| `thumbnailUrl` | text | Thumbnail URL |
| `failureReason` | text | Error message |
| `completedAt` | timestamp | Completion time |

**Test Actions:**
- [ ] SUBMIT video generation request
- [ ] POLL for completion
- [ ] UPLOAD to Cloudinary
- [ ] DISPLAY in gallery

---

### 5.3 voiceClones (lines 306-352)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users |
| `voiceId` | varchar(255) | ElevenLabs voice ID (unique) |
| `name` | varchar(255) | Voice name |
| `description` | text | Description |
| `status` | varchar(50) | active/inactive/processing |
| `isDefault` | boolean | Default voice |
| `audioSampleCount` | integer | Training samples |
| `totalDuration` | integer | Total audio duration |
| `language` | varchar(10) | Voice language |
| `modelId` | varchar(100) | ElevenLabs model |
| `qualityScore` | real | Quality rating |
| `similarityScore` | real | Similarity rating |
| `usageCount` | integer | Times used |
| `lastUsedAt` | timestamp | Last usage |
| `elevenLabsData` | jsonb | API metadata |

**Test Actions:**
- [ ] CREATE voice clone from samples
- [ ] SET as default voice
- [ ] TRACK usage
- [ ] DELETE voice clone

---

### 5.4 didVideos (lines 368-416)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users |
| `didVideoId` | varchar(255) | D-ID video ID (unique) |
| `avatarUrl` | text | Avatar image URL |
| `avatarPreset` | varchar(100) | Preset avatar |
| `script` | text | Speaking script |
| `voice` | varchar(100) | Voice selection |
| `voiceProvider` | varchar(50) | d-id/elevenlabs |
| `elevenLabsVoiceId` | varchar(255) | Custom voice ID |
| `videoUrl` | text | D-ID video URL |
| `cloudinaryUrl` | text | Cloudinary CDN URL |
| `thumbnailUrl` | text | Thumbnail |
| `status` | varchar(50) | pending/processing/completed/failed |
| `duration` | integer | Video duration |
| `estimatedCost` | numeric(10,4) | Generation cost |

**Test Actions:**
- [ ] GENERATE talking avatar video
- [ ] USE custom voice clone
- [ ] UPLOAD to Cloudinary
- [ ] TRACK cost

---

## 6. SOCIAL MEDIA MANAGEMENT (5 Tables)

**Priority**: P2-MEDIUM (Marketing feature)

### 6.1 socialPosts (lines 13344-13366)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users |
| `content` | text | Post content |
| `mediaUrls` | text[] | Attached media |
| `platforms` | text[] | Target platforms |
| `scheduledFor` | timestamp | Schedule time |
| `status` | varchar(20) | draft/scheduled/published/failed |
| `publishedAt` | timestamp | Publish time |
| `engagement` | jsonb | Likes, shares, comments |

**Test Actions:**
- [ ] CREATE draft post
- [ ] SCHEDULE for future
- [ ] PUBLISH to platforms
- [ ] TRACK engagement

---

### 6.2 platformConnections (lines 13369-13395)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users |
| `platform` | varchar(50) | facebook/instagram/twitter |
| `accessToken` | text | OAuth token |
| `refreshToken` | text | Refresh token |
| `expiresAt` | timestamp | Token expiry |
| `scope` | text[] | Permissions |
| `platformUserId` | varchar(255) | Platform user ID |
| `platformUsername` | varchar(255) | Platform username |
| `isActive` | boolean | Connection active |
| `lastUsedAt` | timestamp | Last use |

**Test Actions:**
- [ ] CONNECT platform (OAuth)
- [ ] REFRESH expired tokens
- [ ] DISCONNECT platform
- [ ] LIST connected platforms

---

### 6.3-6.5 Additional Social Media Tables

| Table | Lines | Fields | Test Focus |
|-------|-------|--------|------------|
| `socialCampaigns` | 13398+ | 15 | Marketing campaigns |
| `aiGeneratedContent` | 13427+ | 12 | AI-generated posts |
| `eventClaims` | 13457+ | 9 | Organizer event claims |

---

## 7. MEMORIES & DISCOVERY FEATURES (5 Tables)

**Priority**: P1-HIGH (Social engagement)

### 7.1 memories (lines 5438-5460)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `userId` | integer | FK to users |
| `title` | varchar(255) | Memory title |
| `content` | text | Memory content |
| `type` | varchar(50) | milestone/photo/story/achievement |
| `mediaUrls` | text[] | Photos/videos |
| `date` | timestamp | Memory date |
| `location` | varchar(255) | Location |
| `visibility` | varchar(20) | private/friends/public |

**Test Actions:**
- [ ] CREATE memory with photos
- [ ] SET visibility
- [ ] SHARE with friends
- [ ] DISPLAY on profile

---

### 7.2-7.5 Additional Discovery Tables

| Table | Lines | Fields | Test Focus |
|-------|-------|--------|------------|
| `recommendations` | 5463+ | 7 | AI recommendations |
| `roleInvitations` | 5489+ | 8 | Role upgrade invites |
| `favorites` | 5514+ | 4 | User favorites |
| `communityStats` | 5540+ | 8 | City community stats |

---

## 8. PROFESSIONAL PROFILES (17+ Types)

**Priority**: P1-HIGH (Marketplace feature)  
**Lines**: 7077-7500+

### Profile Types:
1. `teacherProfiles` (30+ fields) - Tango teachers
2. `djProfiles` - Tango DJs
3. `organizerProfiles` - Event organizers
4. `photographerProfiles` - Event photographers
5. `videographerProfiles` - Video creators
6. `musicianProfiles` - Live musicians
7. `hostProfiles` - Housing hosts
8. `shoeSellerProfiles` - Tango shoe vendors
9. `clothingSellerProfiles` - Tango apparel
10. `translatorProfiles` - Language services
11. `tourGuideProfiles` - City guides
12. `massageTherapistProfiles` - Wellness
13. `nutritionistProfiles` - Diet/nutrition
14. `fitnessTrainerProfiles` - Fitness
15. `physiotherapistProfiles` - Physical therapy
16. `psychologistProfiles` - Mental health
17. `coachProfiles` - Life coaching

### Common Fields Across Profiles:
| Field | Type | Test Action |
|-------|------|-------------|
| `userId` | integer | FK to users (unique) |
| `bio` | text | Professional bio |
| `yearsExperience` | integer | Experience years |
| `specialties` | text[] | Specializations |
| `certifications` | text[] | Credentials |
| `hourlyRate` | numeric | Rate |
| `availability` | varchar | Availability |
| `portfolio` | jsonb | Work samples |
| `verificationStatus` | varchar | pending/verified |

**Test Actions:**
- [ ] CREATE professional profile
- [ ] UPLOAD credentials
- [ ] VERIFY profile (admin)
- [ ] SEARCH by specialty
- [ ] MATCH with seekers

---

## 9. MR. BLUE AUTONOMOUS SYSTEM (8 Tables)

**Priority**: P2-MEDIUM (AI infrastructure)

### Tables:
| Table | Lines | Fields | Test Focus |
|-------|-------|--------|------------|
| `mrBlueConversations` | 1795+ | 6 | Chat sessions |
| `mrBlueMessages` | 1813+ | 7 | Chat messages |
| `mrBlueSystemPrompts` | 16540+ | 8 | System prompts |
| `autonomousTasks` | 16699+ | 14 | Task decomposition |
| `autonomousTaskFiles` | 16738+ | 8 | Generated files |
| `userWorkflowActions` | 1845+ | 8 | Workflow patterns |
| `workflowPatterns` | 1866+ | 8 | Learned patterns |
| `userMemories` | 1971+ | 8 | Context memory |

---

## 10. H2AC FRAMEWORK (Human-to-Agent)

### h2acMessages (lines 2294-2324)

| Field | Type | Test Action |
|-------|------|-------------|
| `id` | serial | Primary key |
| `senderType` | varchar | human/agent |
| `senderId` | varchar | Sender identifier |
| `recipientType` | varchar | human/agent |
| `recipientId` | varchar | Recipient identifier |
| `messageType` | varchar | task/update/question/response |
| `subject` | text | Message subject |
| `content` | text | Message content |
| `priority` | varchar | low/normal/high/urgent |
| `status` | varchar | sent/read/responded |
| `metadata` | jsonb | Additional data |
| `readAt` | timestamp | Read time |
| `respondedAt` | timestamp | Response time |

**Test Actions:**
- [ ] SEND agent-to-agent message
- [ ] SEND agent-to-human message
- [ ] TRACK read status
- [ ] FILTER by priority

---

## 11. BROWSER AUTOMATION SYSTEM

### Tables:
| Table | Lines | Fields | Test Focus |
|-------|-------|--------|------------|
| `browserAutomationRecordings` | 2101+ | 13 | Recorded workflows |
| `browserAutomationExecutions` | 2132+ | 12 | Execution logs |

---

## 12. REMAINING INFRASTRUCTURE TABLES

### Discovered but Not Detailed:
| Category | Table Count | Notes |
|----------|-------------|-------|
| Email System | 3 | emailQueue, emailPreferences, emailLogs |
| UI Testing | 4 | uiTestScenarios, uiTestResults, userTestingSessions |
| Visual Editor | 3 | visualEdits, agentSelfTests, agentPerformanceMetrics |
| Ambassador | 2 | ambassadorApplications, ambassadors |
| Volunteer | 2 | volunteerApplications, volunteers |
| Certifications | 1 | certifications |
| Ban Appeals | 1 | banAppealslogs |
| Venue Recommendations | 1 | venueRecommendations |
| Talent Match | 2 | talentProfiles, talentMatches |

---

## MB.MD RECURSIVE TESTING METHODOLOGY

### Level 1: Schema Validation
- [ ] COUNT all 412 tables
- [ ] VERIFY FK relationships
- [ ] CHECK for orphaned records

### Level 2: API Endpoint Mapping
- [ ] MAP each table to API routes
- [ ] DOCUMENT CRUD endpoints
- [ ] IDENTIFY missing endpoints

### Level 3: UI Page Mapping
- [ ] MAP client pages to tables
- [ ] IDENTIFY untested pages
- [ ] VERIFY data flow

### Level 4: Integration Testing
- [ ] TEST cross-table relationships
- [ ] VERIFY cascade deletes
- [ ] TEST transaction integrity

### Level 5: E2E User Journeys
- [ ] Financial: Create portfolio → Add assets → Execute trades
- [ ] Travel: Plan trip → Add items → Request to join
- [ ] Life CEO: Set goal → Create tasks → Track progress
- [ ] God-Level: Generate video → Clone voice → Create avatar

---

## PRIORITY MATRIX

| Priority | System | Tables | Test Urgency |
|----------|--------|--------|--------------|
| **P0** | Financial | 13 | Revenue-critical |
| **P0** | Travel | 11 | Core feature |
| **P1** | Gamification | 7 | Engagement |
| **P1** | Life CEO | 6 | Premium |
| **P1** | God-Level | 4 | Premium |
| **P1** | Memories | 5 | Social |
| **P1** | Profiles | 17+ | Marketplace |
| **P2** | Social Media | 5 | Marketing |
| **P2** | Mr. Blue | 8 | AI |
| **P3** | Infrastructure | 15+ | Support |

---

*Document Version: 1.0*  
*Total Tables Documented: 60+ new, 412 total platform*  
*Last Updated: December 11, 2025*
