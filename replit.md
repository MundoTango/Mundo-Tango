# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising, offering advanced functionalities for tango enthusiasts and an extensive AI ecosystem for strategic oversight and execution.

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

## System Architecture

### UI/UX
The platform uses an "MT Ocean Theme" with dark mode, built with Tailwind CSS, shadcn/ui, and Radix UI. It supports 68 languages via `i18next` and uses Wouter for routing. Key UI components include a Visual Editor, Unified Sidebar, PublicProfileView, and PerRoleExperience, with a strict z-index hierarchy. Icons are sourced from Lucide React and React Icons.

### Backend
The backend is developed with Express and TypeScript, leveraging PostgreSQL (Neon) and Drizzle ORM. It includes modular routes, JWT authentication with Google/Facebook OAuth, an 8-tier Role-Based Access Control (RBAC) system, and automated database migrations. Server-side FFmpeg is used for video transcoding. The API supports PRO functionalities, place recommendations, and enhanced Talent Match AI features. Email verification is mandatory for user access.

### AI Systems
Mundo Tango incorporates an extensive AI ecosystem with over 140 specialized agents, including self-healing infrastructure, a production-ready validation loop, and a Visual Validation Framework. A Bifrost AI Gateway enables multi-provider AI interactions. A RecursiveContextService handles hierarchical code summarization. The AI brain is structured into a modular `/mr-blue-brain/` system encompassing Identity, Cognition (e.g., ReAct Protocol, Chain-of-Thought), Operations, Orchestration (e.g., Mixture of Experts Router), Patterns, and specialized Agents.

**Leadership Agent System (Dec 2025)**:
- **4 Agents ONLINE**: CEO, CTO, GitHub Practices, Plan Tracker
- **4-Layer Knowledge**: God Commands, Learned Experiences, Mundo Tango Knowledge, Real-World Knowledge
- **API Routes**: `/api/mrblue/leadership/*` for agent queries and task routing
- **Auto-Invoke Agents (God Command #0)**:
  - **GitHub Practices Agent**: Enforces conventional commits, atomic commits, branch naming (triggers: session:start, task:complete, commit:prepare)
  - **Plan Tracker Agent**: Updates The Plan with task status/progress (triggers: task:start, task:complete, session:end)
- **God Commands**: 12 active directives including "test before complete", "work simultaneously", "work recursively", "feature branches required", "admin approval required"

**Mr. Blue AI Assistant (Enhanced Dec 2025)**:
- **Database Integration**: Real-time access to platform data via `MrBlueDataService` (events, cities, users, groups)
- **AI Engine**: Groq llama-3.3-70b-versatile model with platform context injection
- **Query Intent Detection**: Automatically routes event/city/help queries with location extraction
- **Fallback System**: Smart template responses if AI fails
- **UI**: Glassmorphic design with header, message timestamps, "Thinking..." indicator
- **Endpoint**: POST /api/mrblue/chat (requires auth)
- **Singleton Pattern**: MB.MD Pattern 63 - Only one chat instance allowed globally (prevents duplicate panels)
- **User Context**: MB.MD Pattern 64 - Full user data access (friends, RSVPs, cities, groups)
- **God Powers**: MB.MD Pattern 65 - Admin/CTO users get full system access like Replit AI Agent
- **Mobile Design**: MB.MD Pattern 66 - Full-screen takeover on mobile, floating panel on desktop
- **QA/Customer Test Platform** (MB.MD Pattern 67): User monitoring, feedback capture, admin approval queue
  - Regular users: Help + feedback → admin queue
  - God-level admins: Full MB.MD execution rights
  - Playbook: `Mr Blue/playbooks/qa-customer-platform.md`
  - God Commands: gc-011 (Admin Approval), gc-012 (God-Level Execution)

### Event Scraping System
A multi-stage scraping architecture coordinated by a Master Orchestrator (Agent #115), including Priority Scrapers and an AI-powered UnifiedEventScraper. It features AI-powered extraction, 14 event type classifications, source transparency, city matching, and auto-city creation for new event locations. Scraped events are stored in a `scraped_events` table and ingested into the main events table. An Admin UI at `/admin/scraping` provides real-time scraper status and a moderation queue.

**User-Contributed Sources**: Users can submit local event website URLs during onboarding (CitySelectionPage). Submissions are stored with `submissionStatus: 'pending_review'` and require admin approval via `/admin/pending-sources` before activation. The scraping scheduler runs daily at 6 AM PST and uses the full orchestrator to process all 245+ active sources.

### Platform Features
Core functionalities include social features (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers). Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Unified Messaging Inbox, and a Faceless Content System. The Talent Match AI system integrates volunteer onboarding, resume analysis, AI interviews, and an International Payment System supporting 30 currencies. All 276 city groups have valid coordinates, auto-geocoding, and public city pages. A comprehensive Data Quality System is in place.

### MB.MD Compliance (v9.9.3)
- **City-First Branding**: Cities use "Follow/Follower" terminology instead of "Join Group/Member" per CITY_PAGE.md specification
- **Shadow Group Architecture**: Cities have `legacyGroupId` linking to underlying group infrastructure for Discussion/Follower features
- **PostCreator Context Types**: Supports 'feed', 'event', 'group', 'city', 'memory' contexts
- **Auto-Append Mentions**: Posts in city/group/event contexts auto-append canonical @mention format (@type:type_id:Name_With_Underscores)
- **Privacy-by-Default**: City posts default to 'private' visibility (user can change before posting); groups maintain public default
- **City Page 7 Tabs**: All tabs implemented per CITY_PAGE.md spec:
  - Discussion: Chip filters (All/Recent/Popular) + sticky composer with backdrop-blur
  - Overview: Layer toggle cards (All/Events/Housing/Tips) with color coding + compact map
  - Events: Weekday filter tabs [Sun-Sat] + "Plan My Trip" CTA that switches to Housing tab
  - Members: Role filter chips + PRO ribbons with gradient styling
  - Housing: Airbnb housing view integration
  - Visitors: List of travelers visiting the city
  - Tips: Lucide icons (no emojis) via CategoryIcon component

### Data Architecture & Statistics
**Cities Table**: The authoritative data source for city information with 301 cities migrated from the legacy `groups` table. The `cities` table contains `legacyGroupId` to link back to the groups table for discussion features.

**API Architecture**:
- `/api/cities/by-slug/:slug` - Searches `cities` table first, falls back to `groups` table
- Slug normalization handles both "tbilisi" and "tbilisi-tango" variations
- Returns `id` (city table ID) and `legacyGroupId` (for Discussion tab compatibility)

The database contains 301 cities (migrated from 278 city groups), totaling 811 events and 820 active users across 62 countries. All cities follow the CITY_PAGE.md specification with geocoded coordinates.

### Testing & Production
The platform utilizes End-to-End (E2E) tests with Playwright, automated unit test coverage, and visual regression testing. A Volunteer Testing System provides 148 scenarios. Production deployments are managed via GitHub Actions for CI/CD, monitored by Prometheus/Grafana with Sentry, and deployed through Replit Publishing. Redis is used for caching, and PostgreSQL (Neon) with Drizzle ORM for the database.

### Marketing Site Architecture
The marketing site integrates a Human to Agent Collaboration (H2AC) Volunteer Program and an Ambassador Program. Public statistics are backed by real database data, and donations are handled via GoFundMe. The site includes "Coming Soon Features" and updated marketing pages.

### Production Database Admin Tools
Admin endpoints for troubleshooting production users (works when deployed):
- `GET /api/admin/production/status` - Connection status
- `GET /api/admin/production/user/:email` - User lookup with login diagnosis
- `GET /api/admin/production/users/search?q=` - Search users
- `GET /api/admin/production/users/recent` - Recent registrations
- `GET /api/admin/production/waitlist` - Waitlist users
- `GET /api/admin/production/stats` - User statistics

**Note**: These endpoints use Supabase REST API and only work when deployed to production (mundotango.life). Development environment has network restrictions.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon, Supabase (production)
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **Email:** Replit Resend Connector
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next with 69 language locales