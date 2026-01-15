# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising, offering advanced functionalities for tango enthusiasts. Its extensive AI ecosystem provides strategic oversight and execution capabilities, positioning Mundo Tango as a comprehensive solution for the global tango market.

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

### Mr. Blue Diagnostic System
This system enables autonomous actions via OpenAI function calling for god-level users (tier 8+). It provides comprehensive diagnostic and self-healing tools:
- **Diagnostic Tools**: `getProjectContext()`, `getUserStats()`, `getUsersNeedingOnboarding()`, `queryDatabase()`, `readFile()`, `writeFile()`, `grepFiles()`, `getProjectStructure()`, `getSecurityAuditLogs()`.
- **Self-Healing Tools**: `getRecentErrors()`, `triggerAutoFix()`, `recordLearning()`.
- **Action Tools**: `sendOnboardingReminder(userId)`, `markUserOnboarded(userId)`, `bulkSendOnboardingReminders(limit)`.

Multi-AI Orchestration routes chat via Groq→Gemini→Claude for speed/cost optimization in regular mode, and uses OpenAI GPT-4o for VibeCoding mode (required for function calling). Direct API endpoints are available for god-level access.

### Registration Invite Codes
Special invite codes (`nomad`, `tango`) allow users to bypass email verification, onboarding, and waitlists for new registrations, immediately issuing JWT tokens. For unverified users logging in with an invite code, it triggers a verification email and redirects to the verification page.

### Password Management System
Users can change passwords when logged in (`POST /api/auth/change-password`) and utilize a forgot password flow (`POST /api/auth/forgot-password` and `POST /api/auth/reset-password`).

**Admin Password Reset (Added 2026-01-15):**
- Endpoint: `POST /api/admin/users/:userId/reset-password`
- Access: Admin (tier 4+) via Admin Users Management page (`/admin/users`)
- Security: Uses crypto.randomBytes for cryptographically secure temp passwords
- Email: Sends temp password to user; if email fails, displays in UI for manual sharing
- Audit: All reset actions logged with adminId, targetUserId, timestamp

### Trip Participant Management System
Manages trip travelers with owner/participant roles. Owners can invite/remove participants and edit trip details. Participants can view shared details, leave trips, and see trips in their "Trips I'm Joining" section. Access control ensures only owners or active participants can view trip details. A notification system sends `trip_invite` notifications.

### Profile System
Comprehensive user profiles feature 8 main tabs (About, Posts, Events, Groups, Media, Friends, Places, Travel) and 5 sub-tabs for "About" (Bio, Identity, Education/Work, Preferences, Settings). A permission matrix defines access based on owner, friend, or standard user roles. Privacy controls allow users to manage profile visibility, discoverability, online status, and messaging permissions. GDPR tools enable data export and account deletion.

**UI Components:**
- `UserIdentityHeader`: Consistent identity display across Friends/Travel tabs with turquoise gradient avatars, tango role icons, connection degrees, closeness scores
- `PrivacySubTab`: 11 privacy toggle switches, GDPR data export with authenticated download flow, 2FA settings, account deletion with 30-day grace period

**GDPR Compliance (Verified 2026-01-13):**
- Authenticated data export: `POST /api/gdpr/request-export` → `GET /api/gdpr/export/:id/download`
- 2FA: TOTP via speakeasy, QR codes, encrypted secrets, 8 backup codes per user
- Account deletion: 30-day grace period with soft delete (isActive:false, suspended:true)
- Test selectors: `data-testid="privacy-subtab"`, `data-testid="button-download-data"`

### Event Scraping System
A multi-stage scraping architecture coordinated by a Master Orchestrator utilizes Priority Scrapers and an AI-powered UnifiedEventScraper. It features AI-powered extraction, 14 event type classifications, source transparency, city matching, and auto-city creation. Scraped events are stored in a `scraped_events` table and ingested into the main events table, with an Admin UI for real-time status and moderation.

### Event Series & Placeholder System (Updated 2026-01-13)
**RecurringEventDetector** (`server/services/scraping/RecurringEventDetector.ts`) provides:
- **Global Series Detection**: Scans ALL cities for recurring patterns (same title + venue + day of week, 2+ occurrences)
- **12-Month Placeholder Generation**: 365-day horizon for travel planning
- **Full Pipeline Orchestration**: run-all-scrapers.ts runs scrapers → ingest → detect series → generate placeholders
- **Stats (Jan 2026)**: 1,953 active series, 2,515 placeholders, 12,133 total events, 30+ cities covered
- **Key Files**: `RecurringEventDetector.ts`, `run-all-scrapers.ts`, `event_series` schema
- **API**: `GET /api/travel/events-by-city?city={city}&startDate={date}&endDate={date}`

### Platform Features
Core functionalities include social features (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers). Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Unified Messaging Inbox, and a Faceless Content System. The Talent Match AI system integrates volunteer onboarding, resume analysis, AI interviews, and an International Payment System supporting 30 currencies.

### Messaging System
The system uses a `directMessages` table for all conversations, routing PRO contact forms to the inbox and enabling new conversation creation via user search. Group chat uses a `group_messages` table.

### PRO Pages (/p/:slug)
Public profiles feature a glassmorphic design with bio, gallery, and testimonials. A contact form submits to the PRO's inbox via direct messages. Vanity URLs allow access to PRO pages or user profiles.

### Admin Feedback & QA System
A unified admin queue at `/admin/feedback-queue` consolidates user feedback and founder feature approvals. It integrates with Mr. Blue for chat modes and includes journey replay, automatic screenshot capture, and enhanced error reporting. Access is restricted to god-level users.

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