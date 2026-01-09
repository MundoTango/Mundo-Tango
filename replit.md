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
The platform utilizes an "MT Ocean Theme" with dark mode, built using Tailwind CSS, shadcn/ui, and Radix UI. It supports 68 languages via `i18next` and uses Wouter for routing. Key UI components are organized under `client/src/components/mrBlue/` with a unified structure (`core/`, `avatars/`, `advanced/`). Icons are from Lucide React and React Icons. City pages feature a "City-First Branding" with 7 tabs (Discussion, Overview, Events, Members, Housing, Visitors, Tips) following the CITY_PAGE.md specification.

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

### Admin Feedback & QA System (Updated Jan 9, 2026)
- **Unified Admin Queue**: Single tabbed interface at `/admin/feedback-queue` consolidates user feedback triage + founder feature approvals
- **Tabs**: "User Feedback" (bug reports, feature requests, help) + "Feature Approval" (agent-built features pending review)
- **Mr. Blue Integration**: Chat modes (Help, Features, Bug Report) with attachment support and session tracking
- **Journey Replay**: Session events captured for bug context (clicks, navigation, scrolls, errors, forms)
- **Automatic Screenshot Capture**: Bug reports auto-capture page screenshot using html2canvas (0.5 scale, 60% JPEG quality)
- **ErrorBoundary Enhancement**: "Report Bug" button on crash screen auto-submits critical bug reports with component stack
- **Screenshot Implementation**: `captureScreenshot()` in `useJourneyTracker.ts`, hides Mr. Blue panel during capture
- **Backend Routes**: `/api/qa-platform/*` for feedback, `/api/admin/founder-approval/*` for feature reviews
- **Access Control**: God-level users (scott@boddye.com, admin@mundotango.life, tier === 8) required
- **Backward Compatibility**: `/admin/founder-approval` redirects to unified queue

### Navigation & Attention Hub (Updated Dec 30, 2025)
- **Fake User Filter**: `@discovered.mundotango.app` emails excluded from friend requests/suggestions via `not(like(users.email, '%@discovered.mundotango.app'))` filter in storage.ts
- **Language Selector**: REMOVED from both UnifiedTopBar.tsx and GlobalTopbar.tsx (language setting from user profile only)
- **Help Button**: REMOVED from GlobalTopbar.tsx (consolidated in user menu)
- **Badge Clickability**: All topbar badges now have `pointer-events-none` class to ensure button clicks work
- **PRDs**: See `docs/prd/NAVIGATION_ATTENTION_HUB.md` and `docs/prd/PEOPLE_PERSONALIZATION.md`

### Three-Layer Completion Status (Dec 30, 2025)
| System | UI | Data | Interaction | Notes |
|--------|----|----|-----------|-------|
| Direct Messages | 90% | 95% | 85% | Fixed Dec 30 |
| Notifications | 70% | 85% | 60% | new_message + group_message ADDED |
| WebSocket | 30% | 60% | 10% | Uses polling |
| External Channels | 80% | 50% | 30% | Facebook partial |
| Groups | 85% | 90% | 80% | FIXED Dec 30 - group_messages table |
| Navigation Hub | 95% | 100% | 90% | Fake user filter + badge fix Dec 30 |

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon, Supabase
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **Email:** Replit Resend Connector
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next

### Internationalization System (Updated Jan 6, 2026)
- **Translation Files Location**: `client/public/locales/{lang}/*.json` - This is where Vite serves static files from
- **CRITICAL**: Do NOT edit files in `public/locales/` - Vite does not serve from that directory. Always edit `client/public/locales/{lang}/*.json`
- **Namespaces**: common, navigation, pages, errors
- **Supported Languages**: 68 languages including regional variants (es-ar, pt-br, zh-tw, zh-hk)
- **Priority Languages Coverage (Jan 6, 2026)**:
  - English (en): 100% - Source of truth
  - Spanish (es): 98% - Nearly complete
  - Japanese (ja): 95% - Navbar, landing, marketing pages complete
  - Russian (ru): 100% - COMPLETE via MB.MD P109 Locale Sync
  - French (fr): 100% - COMPLETE via MB.MD P109 Locale Sync
  - German (de): 100% - COMPLETE via MB.MD P109 Locale Sync
  - Italian (it): 100% - COMPLETE via MB.MD P109 Locale Sync
  - Portuguese (pt): 100% - COMPLETE via MB.MD P109 Locale Sync
- **Fallback Chain**: Regional variants fall back to base language (es-ar → es → en)
- **URL Language Param**: Use `?lng=ja` to set language via URL (config: `lookupQuerystring: "lng"`)
- **Pattern**: Use `const { t } = useTranslation('pages')` with single namespace string
- **Translation Guide**: See `translation.md` for comprehensive workflow, quality guidelines, and troubleshooting
- **TranslationAgent**: `server/services/mrBlue/agents/features/TranslationAgent.ts` - Provides audit, sync, coverage reporting, and bulk translation operations
- **Key Structure**: Login/Register pages use nested structure with hero, form, toast, seo keys. Onboarding pages use pageTitle, seoTitle, seoDescription, step, title, subtitle pattern
- **MB.MD P109 Locale Sync (Jan 6, 2026)**: Completed bulk translation for 5 priority languages. Used TranslationAgent to scaffold 925 missing keys, then parallel subagents translated common.json (45 keys), navigation.json (31 keys), and pages.json (109 keys). Navbar, marketing (dancers, organizers, support, about), and onboarding sections now fully localized for RU, FR, DE, IT, PT.

### Email Verification System (Updated Jan 6, 2026)
- **Provider**: Resend (via Replit Connector)
- **From Address**: `admin@mundotango.life`
- **Issue Identified**: Users not receiving verification emails due to missing DNS authentication records (SPF, DKIM, DMARC)
- **Required DNS Setup**: See `docs/EMAIL_DELIVERABILITY_SETUP.md` for configuration guide
- **Logging**: Enhanced logging added to `server/services/EmailService.ts` for delivery tracking
- **Resend Verification**: `/api/auth/resend-verification` endpoint available (rate limited: 3 per hour)
- **Status**: DNS records need to be configured in domain registrar to fix deliverability

### CI/CD & Contributor Workflow (Added Jan 8, 2026)
- **GitHub Actions**: `.github/workflows/ci.yml` - Runs on PRs and pushes to main
- **Pipeline Stages**:
  1. Type Check & Lint - TypeScript compilation verification
  2. Commit Lint - Conventional commit message validation
  3. Unit Tests - Vitest test suite
  4. Build Verification - Production build test
  5. Security Audit - npm audit for vulnerabilities
  6. E2E Tests - Playwright (on main branch only)
- **Branch Protection**: See `docs/GITHUB_BRANCH_PROTECTION.md` for setup guide
- **Pre-commit Hooks**: Husky runs type-check and lint-staged before commits
- **Contributor Docs**:
  - `CONTRIBUTING.md` - Complete contributor guide
  - `.github/PULL_REQUEST_TEMPLATE.md` - PR checklist
  - `.github/ISSUE_TEMPLATE/` - Bug report and feature request templates
- **Commit Format**: Conventional Commits required (feat, fix, docs, etc.)
- **Required for PRs**: TypeScript must compile, conventional commit format