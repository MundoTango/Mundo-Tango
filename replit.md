# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security, integrating 7 business systems and 1,218 specialized AI agents. The platform aims to monetize through premium services, event hosting, and targeted advertising, tapping into the global dance market.

## User Preferences
- **Work Simultaneously** - Run operations in parallel (use Promise.all, parallel tool calls)
- **Work Recursively** - Deep analysis, not surface-level (read imports, dependencies, related files)
- **Work Critically** - Target 95-99/100 quality (test before complete, validate edge cases)
- **Check Infrastructure First** - Use existing systems before building new (Page Audit, Auto-Fix, Agent Orchestration)
- **Test Before Complete** - Run E2E tests for UI changes, unit tests for backend
- **Database:** Never change ID column types (serial ↔ varchar) - breaks existing data
- **Handoff Plan:** Never deviate - Follow exact phase sequence
- **Auto-Fix Maximization** - All auto-fix as much as possible (3-attempt retry, <10% escalation rate)
- **Validation Loop** - observe → decide → act → validate → adapt (not just automation)

## System Architecture

### UI/UX
The platform employs the "MT Ocean Theme" with ocean blues and warm accents, supporting dark mode via Tailwind CSS. Components are built using `shadcn/ui` and Radix UI, with iconography from Lucide React and React Icons. It supports 68 languages via `i18next` and uses Wouter for routing. Layouts include `AppLayout` (public), `DashboardLayout` (authenticated), and `AdminLayout` (administrative).

A Visual Editor provides a wisprflow.ai-style inline editing experience. Key features include direct text editing, element deletion and movement, visual feedback via toast notifications, instructional tooltips for shortcuts, and voice commands. A manual save system tracks unsaved changes, and context-awareness provides smart suggestions.

### Backend
The backend is built with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. `shared/schema.ts` defines the database schema, with `server/storage.ts` handling CRUD operations. Routes are modular, and authentication uses JWT (httpOnly cookies) with Google/Facebook OAuth, featuring an 8-tier Role-Based Access Control (RBAC) system. Database migrations are automated.

### AI Systems
A universal agent ecosystem orchestrates 1,218 specialized AI agents through a hierarchical training architecture:
- **Level 1 - Replit AI:** Strategic oversight.
- **Level 2 - Mr. Blue:** Tactical coordinator for specialized agents.
- **Level 3 - 1,218 Agents:** Atomic task executors with instant knowledge sharing via a GlobalKnowledgeBase.
- **Self-Healing Infrastructure:** Includes `PreFlightCheckService`, `GlobalKnowledgeBase`, `PageAuditService`, and `AutoFixEngine` for autonomous self-healing, `AgentOrchestration`, and `VibeCodingService`.
- **Phase C Autonomous Framework:** A production-ready validation loop with `AutoRetryService`, `EscalationService`, `EvidenceCollector`, and `AgentEventBus` integration, aiming for >80% auto-fix success.
- **Visual Validation Framework:** Integrates Claude Computer Use for AI-powered UI change validation, capturing before/after screenshots and analyzing visual regressions. This system blocks acceptance if validation fails.
- **Contextual Agent Activation:** Agents activate per route with health checks, page audits, and contextual queries.
- **Backend Agent System:** Extends autonomous capabilities to the full stack, handling backend, database, security, and services through a 7-phase orchestration process.
- **Mr. Blue AI Assistant:** A fully autonomous AI system with 45+ services, offering text/voice chat, VibeCoding, page generation from natural language, proactive error detection, and auto-fix.
- **Bifrost AI Gateway:** Manages multi-provider AI interactions with failover, semantic caching, and load balancing.

### Platform Features
Core features encompass social functionalities like events, groups, posts, real-time notifications, media galleries, live streaming, marketplaces, and reviews. Business features include Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers for background processing.

### Testing
The platform aims for 95%+ coverage, utilizing:
- **E2E Tests (Playwright):** Covering authentication, feed, events, profiles, search, admin, and performance.
- **Hybrid Visual Testing:** Combines Playwright with Claude Computer Use for AI-powered visual regression testing, analyzing screenshots for visual regressions, accessibility, and responsive design.
- **Integration Tests:** For backend API endpoints and orchestration services.

### Production
CI/CD is managed via GitHub Actions. Monitoring is handled with Prometheus/Grafana, caching with Redis, error tracking with Sentry, and performance optimization through bundle optimization, lazy loading, and code splitting.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion
- **Other:** Sentry, Playwright, BullMQ

## Testing Configuration (ALREADY CONFIGURED ✅)

### Stripe Secrets - CONFIGURED
All Stripe test mode secrets are already set up:
- ✅ `STRIPE_SECRET_KEY` - Backend API calls
- ✅ `VITE_STRIPE_PUBLIC_KEY` - Frontend Stripe.js
- ✅ `STRIPE_WEBHOOK_SECRET` - Webhook verification
- ✅ `TESTING_STRIPE_SECRET_KEY` - Test-specific key
- ✅ `TESTING_VITE_STRIPE_PUBLIC_KEY` - Test-specific public key

### Test Credentials - CONFIGURED
- ✅ `TEST_ADMIN_EMAIL` = `admin@example.com`
- ✅ `TEST_ADMIN_PASSWORD` = `admin123`

### Test Card Numbers (in `tests/helpers/stripe.ts`):
- SUCCESS: `4242424242424242`
- DECLINE: `4000000000000002`
- INSUFFICIENT: `4000000000009995`
- REQUIRES_3DS: `4000002500003155`

### Running E2E Tests

**Playwright Configuration (`playwright.config.ts`):**
- Stripe keys auto-injected via `env` block (lines 62-66)
- Falls back: `TESTING_STRIPE_SECRET_KEY` → `STRIPE_SECRET_KEY`
- Falls back: `TESTING_VITE_STRIPE_PUBLIC_KEY` → `VITE_STRIPE_PUBLIC_KEY`
- Uses system Chromium (NixOS compatible) with GPU disabled
- Dev server auto-starts at `localhost:5000`

**Run Commands:**
```bash
# Full comprehensive test suite (recommended)
npx playwright test tests/mb-md-comprehensive.spec.ts

# Stripe billing tests
npx playwright test tests/wave5-stripe-billing.spec.ts

# All tests (slow)
npx playwright test

# Specific test file
npx playwright test tests/e2e/critical/payments-stripe.spec.ts

# With UI mode (interactive)
npx playwright test --ui

# Show report after tests
npx playwright show-report test-results/html-report
```

**Test Data:**
- Login: `admin@example.com` / `admin123`
- Melbourne Group ID: 21 (156 events)
- Stripe test cards work automatically (no extra config needed)

## Recent Changes (Nov 26, 2025 - Session 2)

### Facebook/Instagram-Style Video Compression - COMPLETE ✅

**Architecture:**
- Server-side FFmpeg transcoding (like Facebook/Instagram)
- No client-side size limits - accept ANY video size
- Progressive encoding with H.264 codec for universal browser compatibility
- Automatic thumbnail generation from video frame

**Backend Implementation:**
- `server/services/videoCompression.ts` - FFmpeg-based compression service
  - H.264 video codec, AAC audio codec
  - 1080p max resolution, 5Mbps target bitrate
  - Fast-start enabled for progressive playback
  - Returns base64 data URL for database storage
- `server/routes/video-upload-routes.ts` - Multipart upload endpoint
  - `/api/upload/video/compress` - POST endpoint with FormData
  - Multer handles chunked uploads (500MB temp limit)
  - Returns compressed video + thumbnail as base64

**Frontend Implementation:**
- `PostCreator.tsx` now uses FormData upload instead of client-side base64
- Progress tracking during server compression
- Toast notifications show compression ratio (e.g., "50MB → 8MB, 84% smaller")

**Dependencies:**
- FFmpeg v6.1.1 (system dependency via Nix)
- fluent-ffmpeg (Node.js wrapper)

### Google Maps-Style Hidden Gems Recommendation System - COMPLETE ✅

**Database Schema:**
- Added `placeRecommendations` table with:
  - Automatic deduplication by `(latitude, longitude, category)` using unique constraint
  - `recommendationCount` to track aggregate votes
  - `userIds` array to track which users recommended each place
  - Indexes on category, coordinates, and recommendation count for fast lookups

**Backend Storage Layer:**
- `createOrUpdatePlaceRecommendation()` - Auto-aggregates recommendations for same location
- `getPlaceRecommendationsByCategory()` - Browse recommendations by type
- `getPlaceRecommendationsByLocation()` - Radius-based search (Google Maps style)
- `getPlaceRecommendationById()` - Get specific recommendation details

**API Endpoints:**
- `POST /api/posts` now automatically creates/updates place recommendations when `isRecommendation: true`
- `GET /api/recommendations/by-location?lat=X&lng=Y&radius=5` - Find nearby places
- `GET /api/recommendations/by-category/:category?limit=50` - Browse by type
- `GET /api/recommendations/:id` - Get recommendation details

**Frontend Components:**
- `RecommendationsMap.tsx` - Leaflet map with clustered markers showing recommendation counts
- `RecommendationsList.tsx` - Card-based list view with expandable details
- Both components show user count, address, price range, and link to Google Maps

**Tags Fix:**
- Fixed PostCreator tags not being retained
- Added `tags: posts.tags` to the `getPosts()` SELECT query in `server/storage.ts`
- Tags now properly persist and display on posts

**Known Issues:**
- Vite HMR WebSocket error (`wss://localhost:undefined`) - Development-only, doesn't affect functionality
- This is a Replit infrastructure/Vite config limitation, not our code

## Recent Changes (Nov 27, 2025)

### Sidebar Architecture Refactoring - COMPLETE ✅

**Issue Fixed:**
- Duplicate `<aside>` elements causing positioning conflicts
- AppLayout wrapped Sidebar in an `<aside>`, while Sidebar rendered its own fixed `<aside>`
- No state persistence - sidebar reset on page refresh

**Architecture (Fixed):**
- **AppLayout.tsx** - Manages sidebar state with cookie persistence
  - `isMobile` state detects screen width < 1024px
  - Cookie persistence: `sidebar_state` cookie (7-day expiry)
  - Removed duplicate aside wrapper - Sidebar renders its own
  - Main content adjusts with `lg:ml-64` margin when sidebar is open on desktop

- **Sidebar.tsx** - Self-contained fixed sidebar
  - Accepts `isOpen`, `setIsOpen`, `isMobile` props from AppLayout
  - Fixed positioning at `top-16 left-0` (below topbar)
  - Uses `translate-x-0` / `-translate-x-full` for show/hide animation
  - Mobile overlay only shows when `isMobile && isOpen`
  - No longer auto-closes on resize (controlled by AppLayout)

**Cookie Persistence:**
```javascript
// Sidebar state persists across refreshes
document.cookie = "sidebar_state=true; path=/; max-age=604800";
```

**Important Files:**
- `client/src/components/AppLayout.tsx` - Main layout wrapper with sidebar state management
- `client/src/components/Sidebar.tsx` - Fixed sidebar with mobile/desktop responsive behavior
- `client/src/components/navigation/UnifiedTopBar.tsx` - Topbar with hamburger menu toggle

## Previous Changes (Nov 25, 2025)

### Database Schema Sync
Added 8 missing columns to events table for scraping support:
- `source_name` - Source website name (e.g., "tangoclub.melbourne")
- `source_url` - Original event URL
- `external_source_id` - ID from source system
- `scraped_event_id` - Link to scraped_events table
- `organizer_text`, `dj_text`, `teacher_text`, `performer_text` - Raw participant data

### API Endpoints Added
- `GET /api/groups/:id/events` - Returns paginated events for a group (was missing, caused frontend to show 0 events)

### Critical Learnings
1. **Schema-Database Sync**: Always verify columns exist in database before querying. Use `ALTER TABLE ADD COLUMN IF NOT EXISTS` for safe migrations.
2. **Route Wrapping**: All pages must have AppLayout wrapper with sidebar/topbar. Pattern: `<Route path="/page"><AppLayout><PageComponent /></AppLayout></Route>`
3. **API Validation**: Test API endpoints with curl before marking work complete.

### Current Data Status
- **260 events** in database across multiple cities
- **156 events** linked to Melbourne group (ID 21)
- **66 participants** extracted (11 organizers, 25 DJs, 27 teachers, 3 performers)
- **31 scraped profiles** created
