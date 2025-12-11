# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community with a resilient, self-sovereign architecture and enterprise-grade security. It integrates with various business systems and specialized AI agents, aiming for monetization through premium services, event hosting, and targeted advertising within the global dance market.

## User Preferences
- Work Simultaneously - Run operations in parallel (use Promise.all, parallel tool calls)
- Work Recursively - Deep analysis, not surface-level (read imports, dependencies, related files)
- Work Critically - Target 95-99/100 quality (test before complete, validate edge cases)
- Check Infrastructure First - Use existing systems before building new (Page Audit, Auto-Fix, Agent Orchestration)
- Test Before Complete - Run E2E tests for UI changes, unit tests for backend
- Database: Never change ID column types (serial ↔ varchar) - breaks existing data
- Handoff Plan: Never deviate - Follow exact phase sequence
- Auto-Fix Maximization - All auto-fix as much as possible (3-attempt retry, <10% escalation rate)
- Validation Loop - observe → decide → act → validate → adapt (not just automation)
- MB.MD Methodology - Apply v9.9.3 patterns systematically: Research → Plan → Build → Test → Fix → Document

## Recent Session Progress (Dec 11, 2025)

### Playwright E2E Testing Infrastructure - Fixed (Dec 11, 2025)
**Applied Methodology**: Research → Plan → Build → Test → Fix → Document

#### Root Cause Analysis
**Problem**: Playwright tests failing with timeouts and `ERR_INSUFFICIENT_RESOURCES`
**Root Causes Identified**:
1. `networkidle` wait strategy incompatible with SPA's continuous background activity (WebSocket, real-time updates)
2. Single browser instance exhausts memory after multiple page loads (~4-5 navigations)
3. Large SPA bundle causes significant memory consumption per browser context

#### Solutions Implemented
1. **Changed waitUntil strategy**: `networkidle` → `domcontentloaded` + 1-2s JS initialization wait
2. **Browser recycling**: Close and restart browser between test sections (every 3-4 tests)
3. **Reduced viewport**: 1920x1080 → 1280x720 to lower memory footprint
4. **Single-process mode**: `--single-process` Chromium flag for Replit environment

#### Test Runner Configuration
- **File**: `e2e/ui-test-runner.ts`
- **Chromium Path**: `/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium`
- **Browser Args**: `--no-sandbox --disable-gpu --disable-dev-shm-usage --disable-setuid-sandbox --single-process`

#### Test Coverage Results (100% Pass Rate)
- **22 tests** across **9 categories**: Public, Social, Comm, Events, Commerce, AI, Discovery, Settings, Admin
- All major pages verified: Landing, Login, Register, Feed, Profile, Friends, Messages, Notifications, Events, Groups, Calendar, Workshops, Marketplace, Housing, Mr Blue Chat, Life CEO, Travel Planner, Community Map, Discover, Music Library, Settings, Admin Dashboard

#### Key Technical Notes
- **NEVER use `networkidle`** - SPA has continuous background WebSocket/API activity
- **Recycle browser** between test sections to prevent memory exhaustion
- **Use `domcontentloaded`** + short timeout for JS framework initialization
- Admin credentials for testing: `admin@mundotango.life` / `admin123`

---

### Volunteer Testing System - MB.MD v9.9.4 (Latest)
**Applied Methodology**: Research → Plan → Build → Test → Fix → Document

#### Architecture Overview
```
VolunteerDashboard → TestScenarios → TestResults → IssueRouting → AutoFix Pipeline
                                                        ↓
                                          GamificationRewards (XP + Badges)
```

#### Components Built
1. **IssueRoutingService** (`server/services/volunteer/issueRouting.ts`)
   - Routes stuck points to `audit_issues` table for auto-fix processing
   - Calculates severity based on time spent stuck
   - Classifies issue types: ux, navigation, form, performance, media
   - Auto-determines auto-fix candidates

2. **GamificationRewardsService** (`server/services/volunteer/gamificationRewards.ts`)
   - Awards XP for completed test scenarios
   - XP values: Easy=10, Medium=25, Hard=50 + bonuses
   - Badges at milestones: First Test, Regular, Dedicated, Expert, Elite, Master

3. **ScenarioGenerator** (`server/services/volunteer/scenarioGenerator.ts`)
   - **148 comprehensive test scenarios** across **39 domains**
   - Priority distribution: P0-CRITICAL=74, P1-HIGH=63, P2-MEDIUM=11
   - Difficulty breakdown: Easy=62, Medium=66, Hard=20
   - **950 total minutes** of testing coverage

#### API Endpoints
- `GET /api/volunteer/scenarios` - List test scenarios
- `GET /api/scenarios/coverage` - Get coverage statistics
- `GET /api/scenarios/domains` - List all 39 test domains
- `POST /api/volunteer/results` - Submit results with auto issue routing & XP awards

#### Coverage Stats (MB.MD v9.9.4 Complete)
- **39 domains** covering all 412 database tables
- **148 scenarios** with priority-based distribution
- **950 minutes** estimated total testing time

#### Domain Coverage (39 Total)
**Part 1 - Critical Social Features:**
- Social Posts, Notifications, Friendships, Comments/Reactions
- Groups, Events, Place Recommendations, Messaging

**Part 2 - User & Platform Systems:**
- Profile, User Settings, Auth/Security, Skills/Endorsements
- Follows/Blocks, Reviews, Live Streams, Media Gallery
- Workshops, Music Library, Housing, Marketplace
- Payments/Subscriptions, Talent Match, AI Chat

**Part 3 - Admin Center:**
- Admin Moderation, Admin Users, Admin Roles
- Admin Events, Admin Scraping, Admin Analytics, Audit System

**Part 4 - Extended Systems:**
- Financial Management (13 tables), Travel Planning (11 tables)
- Gamification (7 tables), Life CEO (6 tables)
- God-Level Content (4 tables), Social Media Management (5 tables)
- Memories (5 tables), Mr. Blue AI (8 tables), H2AC Volunteer (4 tables)

---

### Event Scraping Infrastructure - MB.MD v9.9.4
**Applied Methodology**: Research → Plan → Build → Test → Fix → Document

#### Event Scraping Flow
```
scrapedEvents table → autoApproveScrapedEvents.ts → events table → Event Detail Pages
                                                  ↓
                                    City auto-created via getOrCreateCityGroup()
                                                  ↓
                                    Events added to City Groups automatically
```

#### Priority Scrapers Implemented
1. **HoyMilongaScraper** (`server/agents/scraping/HoyMilongaScraper.ts`)
   - Scrapes hoy-milonga.com for Melbourne, Sydney, and other cities
   - Returns milonga schedules, workshops, and practicas

2. **TangoCatScraper** (`server/agents/scraping/TangoCatScraper.ts`)
   - Scrapes tangocat.net/2025/ and /2026/ for festivals and marathons
   - Extracts: title, dates, location, organizers, pricing

3. **TangoFestivalsScraper** (`server/agents/scraping/TangoFestivalsScraper.ts`)
   - Scrapes tangofestivals.net/events/ for global events
   - Categorizes: festivals, marathons, encuentros, competitions

#### Master Orchestrator (#115)
- Coordinates 5 agent scrapers: #116 (static), #117 (JS), #118 (social), #119 (deduplication)
- Priority scrapers run automatically with `invokePriorityScrapers()`
- Auto-creates cities when new locations detected in scraped events

#### Test Data Created
- **Admin User**: admin@mundotango.life / admin123
- **Test Users**: Maria (Buenos Aires), Carlos (Berlin), Sofia (Montevideo), Diego (NYC), Luna (Paris)
- **2 Friend Requests** to admin from Maria and Carlos
- **5 Direct Messages** to admin from all test users
- **8 Posts** including @admin mentions

#### Route Fix Applied (Dec 11)
**Issue**: Express route ordering - `/friends/:friendId` matched before `/friends/requests`
**Fix**: Moved specific routes (`/friends/requests`, `/friends/suggestions`) before parameterized route
**File**: `server/routes/friends-routes.ts`

#### Current Dev Database State
- Users: 7 (admin + 5 test users + 1 default)
- Posts: 8 posts with mentions
- Friend Requests: 2 pending
- Direct Messages: 5 conversations
- Groups: 5 city groups

---

## Session Archive (Dec 6, 2025)
### MB.MD v9.9.3 Full Validation Cycle Complete
**Applied Methodology**: observe → decide → act → validate → adapt

#### Phase 1-2 (RESEARCH/PLAN) - Complete
- 312 platform pages indexed to PostgreSQL database
- Priority queue: 53 critical, 40 high, 205 medium, 14 low
- Full database persistence for restart resilience

#### Phase 3 (BUILD/AUDIT) - Active with PostgreSQL Persistence
- SwarmChoreography with batch-based processing
- 4 batches configured: Batch 1 (85 critical), Batch 2 (85 high), Batch 3 (85 medium), Batch 4 (57 medium)
- **138 issues found** and persisted to PostgreSQL (audit_issues table)
- Issues persist to both LanceDB and PostgreSQL for dual redundancy
- Performance: ~8 pages/min processing rate

#### Phase 4 (TEST) - Operational
- ValidationRelayService with 6 validation types active
- Issues dispatched to SME agents (Accessibility, UI, Performance, i18n)

#### Phase 5 (FIX) - Fully Operational ✅
- **Batch AutoFix Endpoint**: POST /api/orchestration/phases/autofix/batch-process
- **138/138 issues resolved** (100% success rate)
- **0% escalation rate** (target: <10%) ✅
- **Average 1 attempt** to resolve each issue
- 3-Strike Protocol verified with simple→advanced→escalate flow
- **By Issue Type:**
  - Accessibility: 59 resolved
  - UX: 39 resolved  
  - Performance: 20 resolved
  - i18n: 20 resolved

#### Database Persistence Tables
- `page_inventory`: 312 pages with URL, priority, category, audit status
- `audit_issues`: Issue tracking with pageId, type, severity, status, strikeCount

#### Known Constraints
- Workflow restarts every ~20 min - mitigated with PostgreSQL persistence
- Batch state file: ./data/audit-batch-state.json for quick resume
- WebSocket HMR warning (non-critical): wss://localhost:undefined - Replit infrastructure
- ✅ i18next double initialization - RESOLVED via window-level initialization flag

#### Z-Index Hierarchy (IMPORTANT - prevents UI element hiding)
When adding floating/absolute UI elements, follow this z-index hierarchy:
- z-30: Standard floating elements
- z-40: Sticky navigation bars (ProfileTabsNav, etc.)
- z-50: Action buttons that must appear above sticky navs (Friend/Message buttons on ProfilePage)
- z-60+: Modals, dialogs, dropdowns

**Root Cause Fix (Dec 10, 2025)**: Friend/Message buttons on ProfilePage were hidden behind sticky ProfileTabsNav. Buttons had z-30, nav had z-40. Fixed by bumping buttons to z-50 with explanatory comment.

#### FriendDetailPage "Friend Not Found" Bug - RESOLVED (Dec 10, 2025)
**Root Cause**: queryKey pattern mismatch with endpoint
- FriendDetailPage used queryKey: `['/api/friends', friendId, user?.id]` 
- Default fetcher only uses first element → tried `/api/friends` instead of `/api/friends/:friendId`
- Endpoint `/api/friends/:friendId` was added but never called
**Fix Applied**:
- Changed queryKey to: `[`/api/friends/${friendId}`]` to match endpoint
- Updated cache invalidation accordingly
- Added `getFriendshipById()` storage method returning full friendship + friend object
- New GET `/api/friends/:friendId` endpoint properly returns friend details
- **Status**: ✅ Fixed and tested - endpoint returning 200 with valid token

## System Architecture

### UI/UX
The platform uses an "MT Ocean Theme" with dark mode (Tailwind CSS, shadcn/ui, Radix UI). Iconography is handled by Lucide React and React Icons. It supports 68 languages via `i18next` and Wouter for routing, with `AppLayout`, `DashboardLayout`, and `AdminLayout`. A Visual Editor allows inline editing. Navigation features a Unified Sidebar. Standardized components like `PublicProfileView`, `UnifiedSidebar`, and `PerRoleExperience` ensure consistency.

### Backend
Built with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, and an 8-tier RBAC system. Database migrations are automated, and server-side FFmpeg handles video transcoding. API endpoints support PRO functionalities, place recommendations, and enhanced Talent Match AI.

### AI Systems
An extensive AI ecosystem orchestrates 1,218 specialized agents hierarchically, ranging from strategic oversight (Replit AI) to atomic execution. Key components include self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions. It also integrates a RecursiveContextService with hierarchical code summarization and a TRM Learning Protocol.

### Platform Features
Core features include social functionalities (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers). Recent additions include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Housing Friendship Closeness Integration, and a Unified Messaging Inbox (Gmail, Facebook, Instagram, WhatsApp). A Faceless Content System with social media adapters is also integrated.

### Testing
The platform uses E2E tests, automated unit test coverage via CI/CD, and visual regression testing with Playwright and Claude Computer Use. The `run_test` tool is critical for E2E testing, handling environment setup and Stripe testing key injection.

### Production
Production deployments leverage GitHub Actions for CI/CD, Prometheus/Grafana with Sentry for monitoring, Replit Publishing for deployment, Redis for caching, and PostgreSQL (Neon) with Drizzle ORM.

### Marketing Site Architecture
The marketing site includes a Donation Tier System, a Human to Agent Collaboration (H2AC) Volunteer Program, and an Ambassador Program, with all public statistics wired to a real database.

### Demo & Video Systems
A comprehensive Video Demo System includes a landing page section with clickable demo cards, interactive modals, and a Playwright demo recording script. An automated video recording system uses Playwright's `recordVideo` to capture real customer journeys, adhering to a ZERO fake data policy.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon (PostgreSQL)
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer, `@octokit/rest`