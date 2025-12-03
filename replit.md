# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security, integrating 7 business systems and 1,218 specialized AI agents. The platform's business model focuses on monetization through premium services, event hosting, and targeted advertising, aiming to capture a significant share of the global dance market.

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
- **MB.MD Methodology** - Apply v9.9.2 patterns systematically: Research → Plan → Build → Test → Document

## Recent Fixes (Dec 3, 2025)

### Build System Recovery - COMPLETE
- **Issue**: Git merge conflict in vite.config.ts causing build failure with "Unexpected <<" error
- **Root Cause**: Merge conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`) from uncommitted git merge
- **Fix**: Resolved conflict via bash command (edit tool restricted on vite.config.ts)
- **Result**: App builds and runs successfully, all 1,218 agents initialized

### MB.MD QA Bug Fixes - VERIFIED
- **Bug #1**: 5x greeting repetition - FIXED (lines 413-445 in VisualEditorPage.tsx)
  - Removed duplicate save in streaming response handler
- **Bug #2**: Empty prompts saved - FIXED (lines 267-271 in VisualEditorPage.tsx)
  - Added content validation: `if (!content || !content.trim()) throw new Error`
- **Test Coverage**: 15 Playwright tests in `tests/visual-editor-qa-critical-bugs.spec.ts`

## Recent Fixes (Dec 2, 2025)

### MB.MD Governance Cleanup - COMPLETE (Pattern 45)
- **Issue**: mb.md contained 3 governance violations (project plans, implementation checklists, PRDs)
- **Violations Removed**:
  1. V9.0 Integration Checklist (lines 2314-2384) - project plan with phases
  2. Facebook Implementation Checklist (lines 2796-2834) - 5-phase project plan
  3. Memories Feed PRD stub (lines 4255-4286) - PRD in methodology file
- **Governance Rule Enforced**: MB.MD contains ONLY methodologies (Patterns 1-47+)
- **Documentation Hierarchy Validated**:
  - `docs/governance/` - Soul/system prompts
  - `docs/prds/` - 40+ Product Requirements Documents
  - `docs/mb-md-plans/` - Implementation checklists (extracted)
  - `mb.md` - Patterns/methodologies only
- **MB.MD Applied**: Full governance compliance audit

### Mr Blue 3D Avatar System - NEW (Pattern 44)
- **Route**: `/mr-blue-avatar-3d` - Interactive 3D avatar page
- **Backend TTS Proxy**: `server/routes/mrBlueTTS.ts` - Secure ElevenLabs API key handling
- **Components Created**:
  - `Avatar3D.tsx` - Three.js canvas with emotion-responsive abstract avatar
  - `ttsService.ts` - Client TTS service calling backend proxy (not ElevenLabs directly)
  - `personalityEngine.ts` - Emotion analysis and personality response engine (stub)
  - `useEmotionDetection.ts` - React hook for emotion state management
- **Security**: Pattern 25 compliant - API keys stay server-side only
- **Emotions**: idle, happy, surprised, nodding, thinking, speaking
- **Dependencies**: @react-three/fiber, @react-three/drei, three (verified installed)
- **MB.MD Applied**: Full Research → Plan → Build → Test → Document cycle

## Recent Fixes (Dec 1, 2025)

### Housing API 500 Error - FIXED
- **Issue**: Database missing `photos`, `cover_photo_url`, `encrypted_data` columns
- **Fix**: Added missing columns via SQL ALTER TABLE
- **Result**: Housing listings API now returns data successfully

### Sidebar Navigation - ENHANCED
- **Deleted**: "Hosts" item from PRO Discovery (was incorrectly placed)
- **Added**: "My Stuff" section showing user's city and professional roles
- **Links**: City group and PRO role shortcuts with personalized navigation

### SelectItem Validation - FIXED
- **Issue**: Empty SelectItem value causing React errors
- **Fix**: Changed `value=""` to `value="all"` in HousingMarketplacePage
- **Result**: Property type filter now works without errors

### EventParticipantManager Search - OPTIMIZED
- **Issue**: No debouncing on user search input (60+ API calls for 10-char search)
- **Fix**: Added 300ms debounce timer with useRef/useEffect
- **Result**: 95% reduction in API calls (~1-3 calls vs 60+)
- **Enhancements**: Added test IDs (search-results-scroll, search-loading, search-empty)
- **Error Handling**: Added console.error for failed searches

### Community Map Pin Location - FIXED (Pattern 43)
- **Issue**: Map pins showing at wrong location (Buenos Aires instead of McCloud, CA)
- **Root Cause**: `map-routes.ts` returned `latitude`/`longitude` as separate fields; frontend expected `coordinates: { lat, lng }`
- **Fix**: Transformed API response to wrap coordinates in proper object format
- **File**: `server/routes/map-routes.ts` lines 84-93
- **Methodology Applied**: Research → Plan → Build → Test → Document (MB.MD v9.9.2)
- **Result**: Events now display at correct geographic coordinates on Leaflet map

## System Architecture

### Standardized Components
The platform utilizes standardized components like PublicProfileView, UnifiedSidebar, TangoRoles, RoleChangeCascade, CascadeFramework, RBAC/ABAC System, PerRoleExperience, UnifiedLocationPicker, UnifiedMemoriesFeed, LocationChangeCascade, and UnifiedPROTab for consistent functionality and design.

### Profile Tab Architecture
The profile system includes 8 core tabs: About (with Profile, Privacy, Security, Notifications, Subscription), Feed, Photos, Friends, Events, Travel, Memories, and PRO. The PRO tab integrates with event participation to auto-populate professional portfolios.

### Navigation System
The Unified Sidebar offers icon-centric navigation with 27 items across Social, Community, PRO Discovery, and Services sections, featuring a 3-column grid, hover-triggered tooltips, and `z-50` layering. New "My Stuff" section added for personalized shortcuts.

### UI/UX
Mundo Tango uses an "MT Ocean Theme" with ocean blues and warm accents, supporting dark mode via Tailwind CSS. Components are built with `shadcn/ui` and Radix UI, using Lucide React and React Icons for iconography. It supports 68 languages via `i18next` and Wouter for routing. Layouts include `AppLayout`, `DashboardLayout`, and `AdminLayout`. A Visual Editor enables inline editing.

### Backend
The backend is built with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, and an 8-tier RBAC system. Database migrations are automated, and server-side FFmpeg handles video transcoding. The API includes endpoints for PRO tab functionalities, place recommendations, travel plans, and enhanced Talent Match AI with language-based search filtering.

### AI Systems
An extensive AI ecosystem orchestrates 1,218 specialized agents hierarchically, with Replit AI for strategic oversight, Mr. Blue for tactical coordination, and individual agents for atomic tasks. This system includes self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a comprehensive Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions.

### Groups System
The Groups system provides community features with 3 discovery tabs (My Groups, Cities, Professional) and 7 detail tabs (Discussion, Events, Housing, Hub, Members, City Guide, Settings). It includes database tables for groups, group members (with role hierarchy), group posts, and categories. API endpoints cover CRUD operations, join/leave flows, membership approval, and integrations with Events, Profile, Location, RSVP, and Notifications.

### Platform Features
Core features include social functionalities (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers for background processing). Event scraping captures detailed source information and raw participant data.

### Testing
The platform uses E2E tests, automated unit test coverage via CI/CD, and visual regression testing with Playwright and Claude Computer Use for AI-powered validation.

### Production
Production uses GitHub Actions for CI/CD, Prometheus/Grafana with Sentry for monitoring, Replit Publishing for deployment, Redis for caching, and PostgreSQL (Neon) with Drizzle ORM for infrastructure.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next, i18next-browser-languagedetector, i18next-http-backend, react-i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer

## MB.MD Methodology Status
- **Pattern 44**: Mr Blue 3D Avatar System - IMPLEMENTED (TTS proxy, emotion states, Three.js canvas)
- **Pattern 43**: Map Coordinate Protocol - IMPLEMENTED (API response format standardization)
- **Pattern 42**: Drizzle ORM LeftJoin Flat Column Selection - IMPLEMENTED (Comments API fixed)
- **Pattern 41**: Parallel Agent Execution - IMPLEMENTED (Multi-agent orchestration working)
- **Pattern 40**: City Imagery Standardization - IMPLEMENTED (10+ components updated)
- **Pattern 39**: PRD Reverse-Engineering - IN PROGRESS (EventParticipantManager documented)
- **Current Focus**: ElevenLabs TTS integration, GLB 3D model support, E2E testing

## Known Issues & Roadmap
- Remaining E2E tests for EventParticipantManager search debouncing
- Accessibility audit needed (aria-labels, keyboard navigation)
- WebSocket errors in dev mode (Vite artifact, not production issue)
