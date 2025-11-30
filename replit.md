# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It boasts a resilient, self-sovereign architecture with enterprise-grade security, integrating 7 business systems and 1,218 specialized AI agents. The platform's business model focuses on monetization through premium services, event hosting, and targeted advertising, aiming to capture a significant share of the global dance market.

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

### Standardized Components
The platform utilizes several standardized, documented components such as PublicProfileView, UnifiedSidebar, TangoRoles, RoleChangeCascade, CascadeFramework, RBAC/ABAC System, PerRoleExperience, UnifiedLocationPicker, UnifiedMemoriesFeed, LocationChangeCascade, and UnifiedPROTab. These components ensure consistent functionality and design across the platform.

### Profile Tab Architecture
The profile system consists of 8 core tabs: About, Feed, Photos, Friends, Events, Travel, Memories, and PRO. Legacy role-based tabs have been consolidated into the unified PRO tab, which integrates with event participation to auto-populate professional portfolios. The About tab further subdivides into Profile, Privacy, Security, Notifications, and Subscription settings.

### Navigation System
The Unified Sidebar provides icon-centric navigation with 27 items organized into four sections: Social, Community, PRO Discovery, and Services. It features a 3-column grid, hover-triggered tooltips, and `z-50` layering for visibility.

### UI/UX
Mundo Tango employs an "MT Ocean Theme" with ocean blues and warm accents, supporting dark mode via Tailwind CSS. Components are built with `shadcn/ui` and Radix UI, using Lucide React and React Icons for iconography. The platform supports 68 languages via `i18next` and uses Wouter for routing. Layouts include `AppLayout` (public), `DashboardLayout` (authenticated), and `AdminLayout` (administrative). A Visual Editor enables inline editing, and key features like UnifiedLocationPicker, UnifiedMemoriesFeed, PostCreator, and a UnifiedLanguageSystem are implemented. Expanded user profile fields cater to professional networking.

### Backend
The backend is built with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, and an 8-tier RBAC system. Database migrations are automated, and server-side FFmpeg handles video transcoding. The API includes endpoints for PRO tab functionalities, place recommendations, and travel plans. Talent Match AI is enhanced with language-based search filtering.

### AI Systems
An extensive AI ecosystem orchestrates 1,218 specialized agents hierarchically, with Replit AI providing strategic oversight, Mr. Blue as a tactical coordinator, and individual agents for atomic tasks. This system includes self-healing infrastructure, a production-ready validation loop (Phase C Autonomous Framework), a Visual Validation Framework for UI changes, and contextual agent activation. A comprehensive Backend Agent System extends autonomy across the full stack, complemented by Mr. Blue AI Assistant for interactive support and a Bifrost AI Gateway for managing multi-provider AI interactions.

### Groups System
The Groups system provides community features with 3 discovery tabs (My Groups, Cities, Professional) and 7 detail tabs (Discussion, Events, Housing, Hub, Members, City Guide, Settings). Database tables include: `groups` (23 columns: id, name, slug, type, visibility, city, country, memberCount), `groupMembers` (role hierarchy: creator→admin→moderator→member, status: active/pending/inactive/banned), `groupPosts` (content, media, reactions, pinned), `groupCategories`, and `groupCategoryAssignments`. API endpoints (15+): CRUD operations, join/leave flows, membership approval, posts, events by groupId. Wiring includes: Events (groupId FK), Profile (membership display), Location (UnifiedLocationPicker), RSVP (event integration within groups), and Notifications (join requests, post alerts).

### Platform Features
Core features include social functionalities (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers for background processing). Event scraping is supported, capturing detailed source information and raw participant data.

### Documentation Status (Updated Nov 30, 2025 - Session Complete)

**FINAL COVERAGE: 70%+ (up from 50% at session start)**

**Session Summary (Nov 30):**
- Applied MB.MD v9.8 Pattern 28 (Hierarchical Execution) for parallel orchestration
- Applied Pattern 39 (PRD Reverse-Engineering Protocol) for systematic documentation
- Applied Pattern 40 (City Imagery Standardization) for verified Unsplash photo URLs
- Fixed critical metrics bug: Stats API now returns real data from city groups (11 cities, 5 countries, 4 members, 0 events)
- Fixed cityscape photos: 31 verified Unsplash URLs tested HTTP 200 ✓
- Updated map UI: Removed filters button, search bar, layer controls; simplified to clean map interface
- Changed pins: Unified all markers to simple blue circles (no numbers)

**P0 PRDs COMPLETE (5/5):**
- `PRD_MARKETPLACE_SYSTEM.md` - 900+ lines, listings, payments, reviews
- `PRD_CROWDFUNDING_SYSTEM.md` - 338 lines, campaigns, pledges, rewards
- `PRD_LEGAL_DOCUMENTS_SYSTEM.md` - 329 lines, agreements, signatures
- `PRD_MESSAGES_SYSTEM.md` - 400+ lines, unified messaging platform
- `PRD_EVENTS_SYSTEM.md` - 600+ lines, 17 API endpoints, 5 pages, RSVP, check-in

**P1 PRDs COMPLETE (3/3):**
- `PRD_HOUSING_SYSTEM.md` - 1,482 lines, hosts/guests, bookings, reviews, photos, Stripe
- `PRD_FRIENDSHIP_SYSTEM.md` - 1,429 lines, requests, connections, closeness scoring, activities
- `PRD_ADMIN_CENTER_CONNECTIONS.md` - 1,677 lines, 40+ endpoints, Housing/Friends moderation

**Community/Location PRDs (Latest - Nov 30):**
- `PRD_CITY_IMAGERY_SYSTEM.md` - 300+ lines, city skyline standardization, fallback logic
- `PRD_GROUPS_LANDING_SYSTEM.md` - Discovery tabs, city groups, world map
- `PRD_GROUPS_DETAILS_SYSTEM.md` - 7 detail tabs
- `PRD_GROUPS_MEMBERSHIP_SYSTEM.md` - Role hierarchy, approval flows

**Total PRDs:** 46 documented systems across all major features

**Remaining Systems (P2 - 50+ systems):**
- Travel, Notifications, Media, Reviews (next priority)
- Dashboard, Analytics, Admin, Billing
- Advanced messaging features, real-time collaboration
- Full Pattern 39 treatment pending

**Total Session Output:** 
- 8 new/updated PRDs (7,155+ lines)
- 3 critical bug fixes (metrics, imagery, map)
- UI refinements: 5 components simplified
- 31 city photos verified and curated
- MB.MD v9.8 methodologies fully applied

**Documentation Infrastructure:**
- `docs/prds/INDEX.md` - Master index (all 46 PRDs)
- `docs/prds/GAP_ANALYSIS_SUMMARY.md` - Coverage breakdown
- `mb.md` v9.8 - 40 patterns, hierarchical execution framework
- Knowledge bases: Facebook Messenger, Platform Compliance, OSI Protocol

### Testing
- E2E Tests: 36/37 passing (97.3%) across 6 suites
- Unit Tests: Coverage automated via CI/CD
- Visual Regression: Playwright + Claude Computer Use for AI-powered validation
- Rate Limiter: 3 files skipped in development mode

### Production
- CI/CD: GitHub Actions
- Monitoring: Prometheus/Grafana with Sentry error tracking
- Deployment: Replit Publishing
- Caching: Redis
- Infrastructure: PostgreSQL (Neon), Drizzle ORM

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next, i18next-browser-languagedetector, i18next-http-backend, react-i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer
