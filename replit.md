# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising, offering advanced functionalities for tango enthusiasts. Its extensive AI ecosystem provides strategic oversight and execution capabilities, positioning Mundo Tango as a comprehensive solution for the global tango market. The platform's business vision includes capturing market potential through advanced AI, robust social features, and a scalable architecture.

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
- MB.MD Methodology - Apply v9.9.4 patterns systematically: Research → Plan → Build → Test → Fix → Document.
- Internationalization First - All UI text MUST use i18next `t()` function and have corresponding entries in `client/public/locales/en/*.json`. Never commit hardcoded UI strings.
- Parallel Translation Updates - When adding/modifying UI text, update all language variants (or use TranslationAgent for bulk sync) in parallel with code changes.
- Never mark messaging tasks complete without E2E verification - Must test PRO contact → inbox flow and new conversation creation
- Verify imports exist before using - Check all referenced schemas/tables are imported at file top

## Developer Experience (Updated Jan 4, 2026)
- **Zero Native Compilation**: `npm install` completes without Python/C++ toolchain requirements
- **Removed Dependencies**: `@xenova/transformers` (was dead code, caused node-gyp failures for volunteers)
- **Heuristic AI Detection**: Sentiment analysis and intent detection use lightweight regex/heuristics instead of ML models
- **Local Setup Guide**: See `docs/dev/LOCAL_SETUP.md` for volunteer onboarding instructions
- **Design Goal**: Volunteers should be able to `git clone && npm install && npm run dev` without compilation errors

## System Architecture

### UI/UX
The platform utilizes an "MT Ocean Theme" with dark mode, built using Tailwind CSS, shadcn/ui, and Radix UI. It supports 68 languages via `i18next` and uses Wouter for routing. Key UI components include a Visual Editor, Unified Sidebar, PublicProfileView, and PerRoleExperience, adhering to a strict z-index hierarchy. Icons are from Lucide React and React Icons. City pages feature a "City-First Branding" with 7 tabs (Discussion, Overview, Events, Members, Housing, Visitors, Tips) following the CITY_PAGE.md specification.

### Backend
The backend is developed with Express and TypeScript, leveraging PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, an 8-tier Role-Based Access Control (RBAC) system, and automated database migrations. Server-side FFmpeg handles video transcoding. The API supports PRO functionalities, place recommendations, and enhanced Talent Match AI features. Email verification is mandatory for user access.

### AI Systems
Mundo Tango integrates a comprehensive AI ecosystem with over 140 specialized agents, including self-healing infrastructure, a production-ready validation loop, and a Visual Validation Framework. A Bifrost AI Gateway facilitates multi-provider AI interactions. A RecursiveContextService manages hierarchical code summarization. The core AI brain, located in `/mr-blue-brain/`, is modular, encompassing Identity, Cognition (e.g., ReAct Protocol, Chain-of-Thought), Operations, Orchestration (e.g., Mixture of Experts Router), Patterns, and specialized Agents. This includes a Multi-Agent Orchestration System for 130+ agents, a Leadership Agent System with "God Commands," and the Mr. Blue AI Assistant providing real-time data access and intelligent task routing via a Multi-AI Orchestrator (Groq, OpenAI, Anthropic with fallbacks and consensus).

### Event Scraping System
A multi-stage scraping architecture is coordinated by a Master Orchestrator, utilizing Priority Scrapers and an AI-powered UnifiedEventScraper. It features AI-powered extraction, 14 event type classifications, source transparency, city matching, and auto-city creation. Scraped events are stored in a `scraped_events` table and ingested into the main events table, with an Admin UI for real-time status and moderation.

### Platform Features
Core functionalities include social features (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers). Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Unified Messaging Inbox, and a Faceless Content System. The Talent Match AI system integrates volunteer onboarding, resume analysis, AI interviews, and an International Payment System supporting 30 currencies.

### Messaging System (Updated Dec 30, 2025)
- **Database**: Uses `directMessages` table (PRIMARY). `chatRooms`/`chatMessages` are DEPRECATED.
- **PRO Contact → Inbox**: Contact form via `/api/pro/contact` routes to directMessages ✅ COMPLETE
- **New Conversations**: User search via `/api/users/search` endpoint
- **Real-time**: Currently polling (5s), WebSocket planned
- **Group Chat**: Uses `group_messages` table via `/api/groups/:id/messages` ✅ FIXED
- **Documentation**: See `docs/PRD_MESSAGING_AND_PRO_PAGE.md` for full specification
- **Related PRDs**:
  - `docs/MESSAGING_ECOSYSTEM_MAP.md` - All systems interacting with messaging
  - `docs/prd/NOTIFICATIONS_SYSTEM.md` - 17 notification types (new_message + group_message ADDED)
  - `docs/prd/REALTIME_WEBSOCKET.md` - Replace polling with WebSocket
  - `docs/prd/EXTERNAL_MESSAGING_CHANNELS.md` - Facebook/Instagram/WhatsApp/Gmail
  - `docs/prd/GROUPS_SYSTEM.md` - Group chat implementation

### PRO Pages (/p/:slug)
- **Public Profiles**: Glassmorphic design with bio, gallery, testimonials
- **Contact Form**: Submits to PRO's inbox via directMessages (guest-contact user, CSRF exempt)
- **Endpoint**: `POST /api/pro/contact` - Zod validated, secure (no email impersonation)
- **Vanity URLs**: `/:username` resolves to PRO page or user profile
- **Documentation**: See `docs/prd/VANITY_URLS.md` for URL routing spec

### Admin Feedback & QA System (Updated Jan 2, 2026)
- **Unified Admin Queue**: Single tabbed interface at `/admin/feedback-queue` consolidates user feedback triage + founder feature approvals
- **Tabs**: "User Feedback" (bug reports, feature requests, help) + "Feature Approval" (agent-built features pending review)
- **Mr. Blue Integration**: Chat modes (Help, Features, Bug Report) with attachment support and session tracking
- **Journey Replay**: Session events captured for bug context (clicks, navigation, scrolls, errors, forms)
- **Backend Routes**: `/api/qa-platform/*` for feedback, `/api/admin/founder-approval/*` for feature reviews
- **Access Control**: God-level users (scott@boddye.com, admin@mundotango.life, tier === 8) required
- **Backward Compatibility**: `/admin/founder-approval` redirects to unified queue

### Navigation & Attention Hub (Updated Dec 30, 2025)
- **Fake User Filter**: `@discovered.mundotango.app` emails excluded from friend requests/suggestions via `not(like(users.email, '%@discovered.mundotango.app'))` filter in storage.ts
- **Language Selector**: REMOVED from both UnifiedTopBar.tsx and GlobalTopbar.tsx (language setting from user profile only)
- **Help Button**: REMOVED from GlobalTopbar.tsx (consolidated in user menu)
- **Badge Clickability**: All topbar badges now have `pointer-events-none` class to ensure button clicks work
- **PRDs**: See `docs/prd/NAVIGATION_ATTENTION_HUB.md` and `docs/prd/PEOPLE_PERSONALIZATION.md`

### FeedPage Ecosystem (Updated Jan 4, 2026)
- **Deep Analysis**: See `docs/FEEDPAGE_DEEP_ANALYSIS.md` for comprehensive 10-phase MB.MD v9.9.5 audit
- **i18n Status**: ✅ COMPLETE - 8 components fixed (FeedTabs, CommentsSection, NewPostsBanner, InfiniteScrollFeed, PostActions, PostItem, StoriesCarousel, UpcomingEventsSidebar)
- **@Mentions System**: ✅ Working - PostCreator uses SimpleMentionsInput, backend APIs verified
- **Key Components**: PostCreator (1475 lines), InfiniteScrollFeed, StoriesCarousel (lazy), UpcomingEventsSidebar (lazy)
- **Remaining Fixes**: 2 MEDIUM (PostCreator i18n, FeedPage main), 2 LOW (accessibility polish)

### Three-Layer Completion Status (Updated Jan 4, 2026)
| System | UI | Data | Interaction | Notes |
|--------|----|----|-----------|-------|
| Direct Messages | 90% | 95% | 85% | Fixed Dec 30 |
| Notifications | 70% | 85% | 60% | new_message + group_message ADDED |
| WebSocket | 30% | 60% | 10% | Uses polling |
| External Channels | 80% | 50% | 30% | Facebook partial |
| Groups | 85% | 90% | 80% | FIXED Dec 30 - group_messages table |
| Navigation Hub | 95% | 100% | 90% | Fake user filter + badge fix Dec 30 |
| Feed Page | 98% | 95% | 90% | ✅ i18n FIXED Jan 4 - 8 components |

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon, Supabase
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **Email:** Replit Resend Connector
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next

### Internationalization System (Updated Dec 31, 2025)
- **Translation Files Location**: `client/public/locales/{lang}/*.json` - This is where Vite serves static files from
- **CRITICAL**: Do NOT edit files in `public/locales/` - Vite does not serve from that directory. Always edit `client/public/locales/{lang}/*.json`
- **Namespaces**: common, navigation, pages, errors
- **Supported Languages**: 68 languages including regional variants (es-ar, pt-br, zh-tw, zh-hk)
- **Priority Languages**: English (source), Spanish (105%), Russian (52%), French (49%), German (52%), Italian (52%), Portuguese (52%)
- **Fallback Chain**: Regional variants fall back to base language (es-ar → es → en)
- **URL Language Param**: Use `?lng=es` to set language via URL (config: `lookupQuerystring: "lng"`)
- **Pattern**: Use `const { t } = useTranslation('pages')` with single namespace string
- **Translation Guide**: See `translation.md` for comprehensive workflow, quality guidelines, and troubleshooting
- **TranslationAgent**: `server/services/mrblue/agents/features/TranslationAgent.ts` - Provides audit, sync, coverage reporting, and bulk translation operations
- **Key Structure**: Login/Register pages use nested structure with hero, form, toast, seo keys. Onboarding pages use pageTitle, seoTitle, seoDescription, step, title, subtitle pattern