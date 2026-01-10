# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising, offering advanced functionalities for tango enthusiasts. Its extensive AI ecosystem provides strategic oversight and execution capabilities, positioning Mundo Tango as a comprehensive solution for the global tango market. The business vision includes capturing market potential through advanced AI, robust social features, and a scalable architecture.

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

## System Architecture

### UI/UX
The platform uses an "MT Ocean Theme" with dark mode, built with Tailwind CSS, shadcn/ui, and Radix UI. It supports 68 languages via `i18next` and uses Wouter for routing. Key UI components are organized under `client/src/components/mrBlue/` with a unified structure. Icons are from Lucide React and React Icons. City pages feature a "City-First Branding" with 7 tabs (Discussion, Overview, Events, Members, Housing, Visitors, Tips).

### Backend
The backend is developed with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. It includes modular routes, JWT authentication with Google/Facebook OAuth, an 8-tier Role-Based Access Control (RBAC) system, and automated database migrations. Server-side FFmpeg handles video transcoding. The API supports PRO functionalities, place recommendations, and enhanced Talent Match AI features. Email verification is mandatory for user access.

### AI Systems
Mundo Tango integrates a comprehensive AI ecosystem with over 140 specialized agents, featuring self-healing infrastructure, a production-ready validation loop, and a Visual Validation Framework. A Bifrost AI Gateway facilitates multi-provider AI interactions. A RecursiveContextService manages hierarchical code summarization. The core AI brain in `/mr-blue-brain/` is modular, encompassing Identity, Cognition (e.g., ReAct Protocol, Chain-of-Thought), Operations, Orchestration (e.g., Mixture of Experts Router), Patterns, and specialized Agents. This includes a Multi-Agent Orchestration System, a Leadership Agent System with "God Commands," and the Mr. Blue AI Assistant providing real-time data access and intelligent task routing via a Multi-AI Orchestrator.

### Event Scraping System
A multi-stage scraping architecture is coordinated by a Master Orchestrator, using Priority Scrapers and an AI-powered UnifiedEventScraper. It features AI-powered extraction, 14 event type classifications, source transparency, city matching, and auto-city creation. Scraped events are stored in a `scraped_events` table and ingested into the main events table, with an Admin UI for real-time status and moderation.

### Platform Features
Core functionalities include social features (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers). Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Unified Messaging Inbox, and a Faceless Content System. The Talent Match AI system integrates volunteer onboarding, resume analysis, AI interviews, and an International Payment System supporting 30 currencies.

### Messaging System
The messaging system uses a `directMessages` table. PRO contact forms route to directMessages, and new conversations can be initiated via user search. Group chat uses the `group_messages` table. Real-time messaging is currently polling, with WebSocket planned.

### PRO Pages (/p/:slug)
Public profiles feature a glassmorphic design with bio, gallery, and testimonials. A contact form on these pages submits to the PRO's inbox via directMessages. Vanity URLs (`/:username`) resolve to PRO pages or user profiles.

### Admin Feedback & QA System
A unified admin queue at `/admin/feedback-queue` consolidates user feedback triage and founder feature approvals. It includes tabs for "User Feedback" and "Feature Approval." Mr. Blue integration supports chat modes (Help, Features, Bug Report) with attachment support and session tracking. The system captures session events for journey replay, including automatic screenshots and enhanced error boundary reporting.

### Universal Bug Diagnostic System (MB.MD Pattern 67)
This system captures comprehensive context for diagnosing and fixing issues. It tracks user paths, API calls with payloads, user context (tier, permissions), console errors, network failures, rage clicks, open dialogs, and form state. It uses a component registry, network interceptor, user context capture, and a breadcrumb context.

**User Bug Reporting Flow:**
- Users click "Report Bug" in Mr. Blue chat to enter bug mode
- ElementSelector (`client/src/components/qa/ElementSelector.tsx`) allows targeting specific DOM elements
- JourneyReplay (`client/src/components/qa/JourneyReplay.tsx`) provides interactive playback of user journey with network failures, console errors, and rage clicks
- Conversational AI analysis helps users describe issues naturally
- Full diagnostic context is captured and submitted with bug reports

**Admin Fix Flow:**
- Admins view bug reports at `/admin/feedback-queue`
- "Let's Fix It" button navigates to impacted page with `?mrblue=debug` parameter
- VibeCoding mode auto-opens with diagnostic context pre-loaded
- "Try Auto-Fix" button opens BugFixStream dialog with real-time agent work streaming
- God-level gating (tier 8+) restricts "Try Auto-Fix" button visibility
- Admin can reply directly to user's Messages Inbox

**Auto-Fix Streaming Architecture (SSE):**
- SSE endpoint: `/api/qa-platform/fix-stream/start` streams agent work in real-time
- BugDiagnosticAgent executes ReAct protocol phases: analyzing → planning → executing → validating
- Each phase streams Thought/Action/Observation markers to the frontend
- Frontend component: `BugFixStream.tsx` displays real-time agent reasoning with progress tracking
- Phases include confidence scores and completion status

**Key Components:**
- `useJourneyTracker` hook captures session activity
- `DiagnosisSummary` displays AI analysis of diagnostic context
- `ContextCards` shows user context, API calls, and errors
- `JourneyTimeline` shows step-by-step navigation history
- `BugFixStream` displays real-time agent work with ReAct protocol visualization

### CI/CD & Contributor Workflow
The project utilizes GitHub Actions for CI/CD, running on PRs and pushes to main. The pipeline includes type checking, linting, unit tests, build verification, security audits, and E2E tests (on main only). Branch protection is enforced, and pre-commit hooks run type-check and lint-staged. Conventional Commits are required for all contributions.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon, Supabase
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **Email:** Resend (via Replit Connector)
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next