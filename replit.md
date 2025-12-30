# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising, offering advanced functionalities for tango enthusiasts. Its extensive AI ecosystem provides strategic oversight and execution capabilities, positioning Mundo Tango as a comprehensive solution for the global tango market.

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

## Test Credentials
**For all E2E and Playwright tests, use these admin credentials:**
- Email: `admin@mundotango.life`
- Password: `admin123` (or `admin123!` if first fails)
- Role Level: 8 (God-level access)

This account has full platform access for testing all features including:
- Admin dashboard, feedback management, scraper controls
- Mr. Blue VibeCoding tools (god-level only)
- All RBAC-protected features

## System Architecture

### UI/UX
The platform employs an "MT Ocean Theme" with dark mode, built using Tailwind CSS, shadcn/ui, and Radix UI. It supports 68 languages via `i18next` and uses Wouter for routing. Key UI components include a Visual Editor, Unified Sidebar, PublicProfileView, and PerRoleExperience, with a strict z-index hierarchy. Icons are sourced from Lucide React and React Icons. City pages follow a "City-First Branding" with 7 tabs including Discussion, Overview, Events, Members, Housing, Visitors, and Tips, adhering to the CITY_PAGE.md specification.

### Backend
The backend is developed with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, an 8-tier Role-Based Access Control (RBAC) system, and automated database migrations. Server-side FFmpeg is used for video transcoding. The API supports PRO functionalities, place recommendations, and enhanced Talent Match AI features. Email verification is mandatory for user access.

### AI Systems
Mundo Tango integrates a comprehensive AI ecosystem with over 140 specialized agents. This includes self-healing infrastructure, a production-ready validation loop, and a Visual Validation Framework. A Bifrost AI Gateway facilitates multi-provider AI interactions. A RecursiveContextService manages hierarchical code summarization. The core AI brain is modular, located in `/mr-blue-brain/`, encompassing Identity, Cognition (e.g., ReAct Protocol, Chain-of-Thought), Operations, Orchestration (e.g., Mixture of Experts Router), Patterns, and specialized Agents.

Key AI features include:
- **A2A Multi-Agent Orchestration System**: Manages communication and routing for 130+ agents across various categories (C-Suite, VP-Level, Page Agents, Self-Healing, Scraping, Business).
- **Leadership Agent System**: Comprises CEO, CTO, GitHub Practices, and Plan Tracker agents, with 4-layer knowledge base and "God Commands" for enforcing directives like "test before complete" and "work simultaneously."
- **Mr. Blue AI Assistant**: Provides real-time access to platform data via `MrBlueDataService`. It uses a Multi-AI Orchestrator (Groq, OpenAI, Anthropic with automatic fallback and consensus system) for intelligent task routing based on intent detection. It includes "VibeCoding Tools" (readFile, writeFile, grepFiles, etc.) and "VibeCoding Streaming" for real-time ReAct protocol visualization for god-level users, enabling them to observe AI thought processes and actions.

### Event Scraping System
A multi-stage scraping architecture is coordinated by a Master Orchestrator (Agent #115) and includes Priority Scrapers and an AI-powered UnifiedEventScraper. It features AI-powered extraction, 14 event type classifications, source transparency, city matching, and auto-city creation for new event locations. Scraped events are stored in a `scraped_events` table and ingested into the main events table. An Admin UI provides real-time scraper status and a moderation queue. Users can also contribute local event website URLs, which require admin approval before activation.

### Platform Features
Core functionalities include social features (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers). Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Unified Messaging Inbox, and a Faceless Content System. The Talent Match AI system integrates volunteer onboarding, resume analysis, AI interviews, and an International Payment System supporting 30 currencies.

## Recent Changes (December 30, 2025)

### QA Feedback System (Pattern 67 + Pattern 99)
Implemented complete user feedback system with 3-button interface and admin management:

**Frontend Components:**
- `client/src/components/qa/FeedbackButton.tsx` - 3-button feedback dialog (Support/Bug/Feature)
- `client/src/hooks/useJourneyTracker.ts` - User journey/navigation tracking
- `client/src/pages/admin/FeedbackManagementPage.tsx` - Admin ticket queue
- `client/src/pages/PostDetailPage.tsx` - Single post view for Facebook sharing

**Integration:**
- FeedbackButton added to UnifiedTopBar (desktop)
- Admin route: `/admin/feedback`
- Mr. Blue integration for bug analysis via VibeCoding

### Agent Knowledge Base
Created living documentation for 140+ agents:
- `docs/AGENT_KNOWLEDGE_BASE.md` - Agent onboarding guide
- `docs/prd/QA_FEEDBACK_SYSTEM.md` - QA system PRD
- `docs/prd/POSTS_SYSTEM.md` - Posts/Feed PRD
- `docs/agent-knowledge/vibecoding.md` - VibeCoding patterns

### Pattern 99 Multi-Agent Site Auditor Implementation
Created infrastructure for Mr. Blue to orchestrate bug fixes through VibeCoding pipeline:

**New Files Created:**
- `server/services/mrBlue/MrBlueInternalExecutor.ts` - Internal automation helper for server-side VibeCoding execution
- `server/scripts/pattern99-executor.ts` - CLI tool to run Pattern 99 bug fixes

**Bug Fixes (Tamás Report):**
1. **Bug #1 (Event filtering)** - Fixed: CityDetailsPage.tsx now passes `city.city` instead of `city.name`
2. **Bug #2 (RSVP status)** - Fixed: Flattened `/api/events/my-rsvps` response structure
3. **Bug #4 (DM blank screen)** - Fixed: MessagesPage.tsx auto-selects first conversation
4. **Bug #5 (Facebook share 404)** - Fixed: Created `/posts/:id` route with SEOHead for OG tags
5. **Bug #7 (Saved posts)** - Fixed: Corrected API endpoint to `/api/posts/saved`
6. **Bug #8 (Localization)** - Fixed: Added localStorage caching to i18n detection
7. **Bug #9 (Toast z-index)** - Verified: Already correct at z-[99999]

**Bug #10 & #11 - Completed:**
- Bug #10 (Photo Lightbox): Created `ImageLightbox.tsx` component with zoom/rotate controls, keyboard shortcuts, and fullscreen view
- Bug #11 (Who Liked): Created `WhoLikedModal.tsx` showing users who reacted, added `/api/posts/:id/likes` endpoint, made reaction count clickable

**Code Cleanup:**
- Cleaned up unused stub files (`server/routes/post-routes.ts`, `client/src/components/posts/PostCard.tsx`)

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon, Supabase (for production admin tools)
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **Email:** Replit Resend Connector
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next (with 69 language locales)