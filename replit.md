# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security, integrating various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising, offering advanced functionalities for tango enthusiasts. Its extensive AI ecosystem provides strategic oversight and execution capabilities, positioning Mundo Tango as a comprehensive solution for the global tango market. The platform's business vision includes capturing market potential through advanced AI, robust social features, and a scalable architecture.

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
The platform uses an "MT Ocean Theme" with dark mode, built with Tailwind CSS, shadcn/ui, and Radix UI. It supports 68 languages via `i18next` and uses Wouter for routing. Key UI components are under `client/src/components/mrBlue/` with a unified structure. Icons are from Lucide React and React Icons. City pages feature "City-First Branding" with 7 tabs.

### Backend
The backend is developed with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, an 8-tier Role-Based Access Control (RBAC) system, and automated database migrations. Server-side FFmpeg handles video transcoding. The API supports PRO functionalities, place recommendations, and enhanced Talent Match AI features. Email verification is mandatory.

### AI Systems
Mundo Tango integrates a comprehensive AI ecosystem with over 140 specialized agents, including self-healing infrastructure, a production-ready validation loop, and a Visual Validation Framework. A Bifrost AI Gateway facilitates multi-provider AI interactions. A RecursiveContextService manages hierarchical code summarization. The core AI brain in `/mr-blue-brain/` is modular, encompassing Identity, Cognition (e.g., ReAct Protocol, Chain-of-Thought), Operations, Orchestration (e.g., Mixture of Experts Router), Patterns, and specialized Agents. This includes a Multi-Agent Orchestration System, a Leadership Agent System with "God Commands," and the Mr. Blue AI Assistant providing real-time data access and intelligent task routing via a Multi-AI Orchestrator.

### Mr. Blue Diagnostic System (MB.MD Pattern 67 + Pattern 99 - Updated Jan 12, 2026)
This system enables autonomous actions via OpenAI function calling for god-level users (tier 8+). It provides comprehensive diagnostic and self-healing tools:

**Diagnostic Tools**:
- `getProjectContext()` - Get replit.md docs and database schema for full codebase understanding
- `getUserStats()`, `getUsersNeedingOnboarding()` - User statistics and onboarding status
- `queryDatabase()` - Safe SELECT-only database queries
- `readFile()`, `writeFile()`, `grepFiles()` - File system operations
- `getProjectStructure()`, `getSecurityAuditLogs()` - Project overview and audit trails

**Self-Healing Tools (Pattern 99)**:
- `getRecentErrors()` - Retrieve errors from `error_patterns` table for auto-fix
- `triggerAutoFix()` - Trigger AutoFixEngine (>95% confidence = auto-apply, 80-95% = stage, <80% = escalate)
- `recordLearning()` - Record success patterns via LearningRetentionService

**Action Tools (Pattern 67 - Jan 12, 2026)**:
- `sendOnboardingReminder(userId)` - Send onboarding reminder email to specific user via EmailService
- `markUserOnboarded(userId)` - Update database to mark user as onboarding complete
- `bulkSendOnboardingReminders(limit)` - Send reminders to multiple users (max 10 per call)
- Note: Uses `storage.getUserById()` (not getUser) for database lookups

**Multi-AI Orchestration**:
- Regular chat mode: Routes via Groq→Gemini→Claude for speed/cost optimization
- VibeCoding mode: Uses OpenAI GPT-4o (required for function calling/tools API)
- Platforms: Groq (fastest, FREE), OpenAI (reliable, function calling), Claude (best reasoning), Gemini (cheapest), OpenRouter (fallback)

**Direct API Endpoints** (god-level access required):
- `GET /api/mrblue/diagnostics/user-stats` - Returns user counts (total, onboarded, not onboarded)
- `GET /api/mrblue/diagnostics/users-needing-onboarding?limit=20` - Returns users with incomplete onboarding

**Performance**: Max 3 tool iterations, max_tokens=2000 to prevent timeouts. E2E tested via Playwright.

### Event Scraping System
A multi-stage scraping architecture coordinated by a Master Orchestrator, utilizes Priority Scrapers and an AI-powered UnifiedEventScraper. It features AI-powered extraction, 14 event type classifications, source transparency, city matching, and auto-city creation. Scraped events are stored in a `scraped_events` table and ingested into the main events table, with an Admin UI for real-time status and moderation.

### Platform Features
Core functionalities include social features (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers). Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Unified Messaging Inbox, and a Faceless Content System. The Talent Match AI system integrates volunteer onboarding, resume analysis, AI interviews, and an International Payment System supporting 30 currencies.

### Messaging System
The system uses a `directMessages` table for all conversations. It supports PRO contact forms routing to the inbox and new conversation creation via user search. Real-time updates are currently via polling, with WebSockets planned. Group chat uses a `group_messages` table.

### PRO Pages (/p/:slug)
Public profiles feature a glassmorphic design with bio, gallery, and testimonials. A contact form submits to the PRO's inbox via direct messages. Vanity URLs allow access to PRO pages or user profiles.

### Admin Feedback & QA System
A unified admin queue at `/admin/feedback-queue` consolidates user feedback (bug reports, feature requests, help) and founder feature approvals. It integrates with Mr. Blue for chat modes and includes journey replay, automatic screenshot capture, and enhanced error reporting. Access is restricted to god-level users.

### Navigation & Attention Hub
This system includes a filter to exclude fake users from friend suggestions, and a refined navigation experience with consolidated help and language selection.

### CI/CD & Contributor Workflow
The project uses GitHub Actions for CI/CD, running type checking, linting, commit linting, unit tests, build verification, and security audits on PRs and pushes to main. E2E tests run on the main branch. Husky pre-commit hooks enforce type-check and lint-staged. Conventional Commits are required.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon, Supabase
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime
- **Payments:** Stripe
- **Email:** Replit Resend Connector
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next