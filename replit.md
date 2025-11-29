# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security, integrating 7 business systems and 1,218 specialized AI agents. The platform aims to monetize through premium services, event hosting, and targeted advertising, tapping into the global dance market.

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

### Standardized Components (PRDs: `docs/prds/`)
| Component | PRD | Files Using | Purpose |
|-----------|-----|-------------|---------|
| **PublicProfileView** | [PRD_PUBLIC_PROFILE_VIEW_SYSTEM.md](docs/prds/PRD_PUBLIC_PROFILE_VIEW_SYSTEM.md) | ProfilePage.tsx, All profile tabs | "View Public Profile" button + viewMode state (private/public) with privacy field filtering |
| **UnifiedSidebar** | [PRD_UNIFIED_SIDEBAR_SYSTEM.md](docs/prds/PRD_UNIFIED_SIDEBAR_SYSTEM.md) | AppSidebar.tsx, AdminSidebar.tsx | 4-section icon grid navigation (Social, Community, PRO Discovery, Services) with 27 items, hover tooltips, z-50 layering |
| **TangoRoles** | [PRD_TANGO_ROLES_SYSTEM.md](docs/prds/PRD_TANGO_ROLES_SYSTEM.md) | 15 files | 20 unified role definitions with `value`/`label` properties (includes Taxi Dancer) |
| **RoleChangeCascade** | [PRD_ROLE_CHANGE_CASCADE.md](docs/prds/PRD_ROLE_CHANGE_CASCADE.md) | role-change-routes.ts | Symmetric ADD/REMOVE auto-join/leave PRO groups on role changes |
| **CascadeFramework** | [PRD_CASCADE_FRAMEWORK.md](docs/prds/PRD_CASCADE_FRAMEWORK.md) | ProfileTabAbout.tsx, roleChangeEffects.ts, locationChangeEffects.ts | Unified cascade architecture: Trigger → Detection → ADD/REMOVE Cascade → Notification |
| **RBAC/ABAC System** | [PRD_RBAC_ABAC_COMPLETE.md](docs/prds/PRD_RBAC_ABAC_COMPLETE.md) | auth.ts, eventRolesSchemas.ts, tangoRoles.ts | Complete 4-tier role system: Platform (8 levels), Event (10 types), Tango (20 roles), Group (3 levels) |
| **PerRoleExperience** | [PRD_PER_ROLE_EXPERIENCE.md](docs/prds/PRD_PER_ROLE_EXPERIENCE.md) | 25+ files | Per-role start years with `calculateYearsInRole()` helper |
| **UnifiedLocationPicker** | [PRD_UNIFIED_LOCATION_PICKER.md](docs/prds/PRD_UNIFIED_LOCATION_PICKER.md) | 26 files | 3-tier search: popular cities → server cache → Nominatim API |
| **UnifiedMemoriesFeed** | [PRD_UNIFIED_FEEDS_SYSTEM.md](docs/prds/PRD_UNIFIED_FEEDS_SYSTEM.md) | 20+ files | Consistent post/memory display with SmartPostFeed + PostCreator |
| **LocationChangeCascade** | [PRD_LOCATION_CHANGE_CASCADE.md](docs/prds/PRD_LOCATION_CHANGE_CASCADE.md) | 5 files | Auto-join groups, notifications, cache refresh on city change |
| **UnifiedPROTab** | [PRD_UNIFIED_PRO_TAB.md](docs/prds/PRD_UNIFIED_PRO_TAB.md) | ProfileTabPro.tsx | Consolidates 17 role tabs into single dashboard/public view |

### Cascade-Eligible Profile Fields
| Field | Type | Cascade Target | Status |
|-------|------|----------------|--------|
| `tangoRoles` | varchar[] | PRO role groups (20 groups) | ✅ Implemented & Tested |
| `city`, `country` | varchar | City/country community groups | ✅ Implemented & Tested |
| `languages` | varchar[] | Language community groups | Planned |
| `interests` | varchar[] | Interest-based groups | Planned |
| `experienceLevel` | varchar | Experience-tier groups | Planned |

### Recent Fixes (Nov 29, 2025)

**Public Profile View System Added:**
- **Created:** PRD_PUBLIC_PROFILE_VIEW_SYSTEM.md (comprehensive view mode architecture)
- **Feature:** "View Public Profile" button in profile header (Eye icon)
- **Mechanism:** URL query param `?view=public` + viewMode state (private/public)
- **Privacy:** Respects fieldVisibility JSONB settings on all fields
- **Architecture:** 18 owner-only elements hidden in public view (edit buttons, upload buttons, settings)
- **Design:** Reuses existing DashboardCustomerToggle pattern extended to full profile
- **Test IDs:** Added `button-view-public-profile`, all public view elements testable
- **Status:** ✅ Button implemented, ready for tab integration
- **Files Modified:** ProfilePage.tsx (added Eye icon import + button), created PRD

**Unified Sidebar System Complete:**
- **Created:** PRD_UNIFIED_SIDEBAR_SYSTEM.md (comprehensive 27-item navigation system)
- **Structure:** 4 sections (Social, Community, PRO Discovery, Services) with 3-column icon grid
- **Design:** Icon-only sidebar (8x8 icons), hover-triggered tooltips (title + helper text)
- **Z-Index Fix:** Added `z-50` to Sidebar + TooltipContent (tooltips now always visible above page content)
- **Removed Items:** Discover (merged into Events), Travel section (user preference)
- **Added Items:** Events now includes Discover functionality ("Browse events - list, calendar, or map view")
- **Files Modified:** AppSidebar.tsx, AdminSidebar.tsx, replit.md
- **Test IDs:** All 27 items have unique `data-testid` attributes for E2E testing
- **Color Coding:** PRO Discovery items color-coded by role type for visual distinction
- **Status:** ✅ Production-ready with tooltip z-index layering

**Previous Fix - Boolean Type Mismatch in Group Join Approval (Nov 29 early):**
- **Issue:** Database column `join_approval` is boolean, but Drizzle schema and code used varchar ("open"/"approval"/"invite_only")
- **Root Cause:** When role cascade created new PRO groups, it failed with "invalid input syntax for type boolean: 'open'"
- **Files Fixed:** `shared/schema.ts`, `role-change-routes.ts`, `location-change-routes.ts`, `CustomGroupsPage.tsx`, `GroupSettingsPanel.tsx`, `GroupCreationModal.tsx`
- **Semantic Mapping:** `true` = "open" (anyone can join), `false` = requires approval
- **Impact:** Role cascade now successfully creates PRO groups and auto-joins users on role changes

See [docs/prds/INDEX.md](docs/prds/INDEX.md) for complete PRD index with cross-references (22 PRDs total).

### Profile Tab Architecture
The profile system uses **8 core tabs**: About, Feed, Photos, Friends, Events, Travel, Memories, and PRO. The **17 legacy role-based tabs** (Teacher, DJ, Performer, Photographer, Organizer, Musician, Choreographer, Vendor, etc.) are deprecated and consolidated into the unified PRO tab. Events→PRO integration ensures participant invites auto-populate the PRO portfolio with verified event history. See [PRD_PROFILE_PAGE_INDEX.md](docs/prds/PRD_PROFILE_PAGE_INDEX.md) for master component index with 33 components.

**About Tab Sub-Tabs (5 sub-tabs):**
- Profile (public) | Privacy (owner) | Security (owner) | Notifications (owner) | Subscription (owner)
- See `AboutSubTabs.tsx` for navigation, individual `settings/*SubTab.tsx` for implementations

**ProfileTabEvents RSVP System (Nov 29, 2025):**
- 3 states: `going` (green), `maybe` (yellow), `not_going` (red)
- All 3 dropdown options always visible with checkmarks
- Query key: `["/api/events", eventId, "attendees"]`
- Nested data: `{ rsvp: {...}, user: {...} }`

### Navigation System (Nov 29, 2025)
**Unified Sidebar Navigation:** Icon-centric 4-section sidebar with 27 items total:
- **Social (2):** Memories, Profile
- **Community (7):** Community Map, Events (incl. Discover), Groups, Friends, Recommendations, Messages, Leaderboard
- **PRO Discovery (15):** Learning, Music, Media, Performances, Venues, Organizers, Stories, Artists, Musicians, Fashion, Coaches, Hosts, Vendors, Leaders, Talent Match (color-coded by role)
- **Services (3):** Life CEO, Marketplace, Housing
- **Design:** Icon-only (no text), 3-column grid, hover-triggered tooltips, z-50 layering for visibility
- **Test IDs:** All items have unique `data-testid` attributes for E2E testing
- **Status:** ✅ Production-ready (Nov 29, 2025) - See [PRD_UNIFIED_SIDEBAR_SYSTEM.md](docs/prds/PRD_UNIFIED_SIDEBAR_SYSTEM.md)

### UI/UX
The platform uses the "MT Ocean Theme" with ocean blues and warm accents, supporting dark mode via Tailwind CSS. Components are built with `shadcn/ui` and Radix UI, using Lucide React and React Icons for iconography. It supports 68 languages via `i18next` and Wouter for routing. Layouts include `AppLayout` (public), `DashboardLayout` (authenticated), and `AdminLayout` (administrative). A Visual Editor provides wisprflow.ai-style inline editing with direct text editing, element manipulation, toast notifications, tooltips, and voice commands. A manual save system tracks changes, and context-awareness provides smart suggestions. Key features include:
- **UnifiedLocationPicker** - Smart location search across 27 files with 3-tier system: popular cities instant match, server-side cache (5 min TTL), Nominatim API fallback. Modes: `city` (city+country) and `address` (full street address). See [PRD](docs/prds/PRD_UNIFIED_LOCATION_PICKER.md).
- **UnifiedMemoriesFeed** - Consistent post/memory display across 8 files (ProfileTabFeed, FeedPage, FeedPrototypePage, InfiniteScrollFeed, GroupPostFeed, SavedPostsPage, FavoritesPage). Wraps SmartPostFeed + PostItem with context-aware modes (feed/group/event/profile/memory). See [PRD](docs/prds/PRD_UNIFIED_FEEDS_SYSTEM.md).
- **PostCreator** - Universal post creation with context modes (feed/event/group/memory), AI enhancement, location tagging, cross-posting, and 15 memory tags. See [PRD](docs/prds/PRD_UNIFIED_FEEDS_SYSTEM.md).
- **UnifiedLanguageSystem** - 68 languages with Top 10 popular grid. Argentine Spanish (Rioplatense with lunfardo) positioned as #2 due to tango's Buenos Aires origins. Language filters integrated with Talent Match AI and Event Recommendations. See [PRD](docs/prds/PRD_UNIFIED_LANGUAGE_SYSTEM.md).
- **About Section** - Expanded user profile fields: occupation, socialLinks (array), portfolioUrls (array), communityWebsiteUrl for professional networking.
- Multi-city trip support in travel planning.

### Backend
The backend uses Express and TypeScript, with PostgreSQL (Neon) and Drizzle ORM. `shared/schema.ts` defines the database schema, and `server/storage.ts` handles CRUD operations. Routes are modular, and authentication uses JWT (httpOnly cookies) with Google/Facebook OAuth, featuring an 8-tier Role-Based Access Control (RBAC) system. Database migrations are automated. Server-side FFmpeg transcoding handles video compression for uploads, generating H.264 video and thumbnails. The API includes endpoints for place recommendations with auto-aggregation and radius-based search, and travel plans supporting multi-city trips with per-city dates stored as JSONB arrays. Location search uses server-side caching.

**PRO Tab API Endpoints:**
- `GET /api/users/:id/pro-stats` - Role-specific statistics (gigs, ratings, upcoming events, earnings)
- `GET /api/users/:id/event-history` - Verified event participations for portfolio
- `GET /api/users/:id/booking-requests` - Incoming booking requests for professionals
- `POST /api/events/:id/my-participation` - Event participant self-management (role, status, availability)

**Talent Match Enhancements:**
- Language-based search filtering in natural language queries (e.g., "Find teachers who speak Portuguese")
- Query parsing extracts language requirements and matches against user.languages[] and user.primaryLanguage

### AI Systems
A universal agent ecosystem orchestrates 1,218 specialized AI agents through a hierarchical training architecture:
- **Level 1 - Replit AI:** Strategic oversight.
- **Level 2 - Mr. Blue:** Tactical coordinator.
- **Level 3 - 1,218 Agents:** Atomic task executors with instant knowledge sharing via a GlobalKnowledgeBase.
- **Self-Healing Infrastructure:** Includes `PreFlightCheckService`, `GlobalKnowledgeBase`, `PageAuditService`, `AutoFixEngine`, `AgentOrchestration`, and `VibeCodingService`.
- **Phase C Autonomous Framework:** A production-ready validation loop with `AutoRetryService`, `EscalationService`, `EvidenceCollector`, and `AgentEventBus` for >80% auto-fix success.
- **Visual Validation Framework:** Integrates Claude Computer Use for AI-powered UI change validation using before/after screenshots and visual regression analysis.
- **Contextual Agent Activation:** Agents activate per route with health checks, page audits, and contextual queries.
- **Backend Agent System:** Extends autonomous capabilities to the full stack for backend, database, security, and services.
- **Mr. Blue AI Assistant:** A fully autonomous AI system with 45+ services, offering text/voice chat, VibeCoding, page generation from natural language, proactive error detection, and auto-fix.
- **Bifrost AI Gateway:** Manages multi-provider AI interactions with failover, semantic caching, and load balancing.

### Platform Features
Core features include social functionalities like events, groups, posts, real-time notifications, media galleries, live streaming, marketplaces, and reviews. Business features include Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers for background processing. The platform supports event scraping, storing `source_name`, `source_url`, `external_source_id`, `scraped_event_id`, and raw participant data for events.

### Testing
The platform aims for 95%+ coverage using E2E Tests (Playwright) for authentication, feed, events, profiles, search, admin, and performance. Hybrid Visual Testing combines Playwright with Claude Computer Use for AI-powered visual regression, accessibility, and responsive design analysis. Integration tests cover backend API endpoints and orchestration services.

### Production
CI/CD is managed via GitHub Actions. Monitoring is handled with Prometheus/Grafana, caching with Redis, and error tracking with Sentry.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next, i18next-browser-languagedetector, i18next-http-backend, react-i18next (68 languages)
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer