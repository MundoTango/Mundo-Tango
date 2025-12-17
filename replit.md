# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates with various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising within the global dance market. Its core purpose is to facilitate community interaction, event management, and offer advanced functionalities for tango enthusiasts worldwide, including an extensive AI ecosystem for strategic oversight and execution.

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
The platform utilizes an "MT Ocean Theme" with dark mode, built using Tailwind CSS, shadcn/ui, and Radix UI. Icons are sourced from Lucide React and React Icons. It supports 68 languages via `i18next` and uses Wouter for routing (`AppLayout`, `DashboardLayout`, `AdminLayout`). Key UI components include a Visual Editor, Unified Sidebar, PublicProfileView, and PerRoleExperience, with a strict z-index hierarchy.

### Backend
The backend is developed with Express and TypeScript, leveraging PostgreSQL (Neon) and Drizzle ORM. It incorporates modular routes, JWT authentication with Google/Facebook OAuth, an 8-tier Role-Based Access Control (RBAC) system, and automated database migrations. Server-side FFmpeg is used for video transcoding. The API supports PRO functionalities, place recommendations, and enhanced Talent Match AI features.

### AI Systems
Mundo Tango features an extensive AI ecosystem comprising 48 specialized agents (10 Page, 33 Feature, 5 Scraping agents) for strategic oversight and atomic execution. It includes self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions. A RecursiveContextService handles hierarchical code summarization, and a TRM Learning Protocol is integrated. Scraping agents gather event data and automatically create city groups. The `/api/mrblue/chat` endpoint supports a `systemPrompt` parameter for custom AI interactions, bypassing the ConversationOrchestrator for direct prompt usage with Groq's llama-3.3-70b-versatile model.

### Event Scraping System
Multi-stage scraping architecture coordinated by Master Orchestrator (`server/agents/scraping/masterOrchestrator.ts`):

**Architecture:**
- **Master Orchestrator** - Coordinates all scrapers, schedules jobs (4 AM UTC), manages parallel execution
- **Priority Scrapers** - HoyMilongaScraper, TangoCatScraper, TangoFestivalsScraper (run every cycle)
- **UnifiedEventScraper** - AI-powered generic scraper for any website using Groq LLM
- **Static/JS/Social Scrapers** - Specialized scrapers for different site types

**Multi-Stage Scraping (Aggregator → Source):**
1. Stage 1: Scrape aggregator sites (TangoCat, TangoFestivals) to get event listing links
2. Stage 2: Follow links to actual event websites and scrape full details
3. Store sourceUrl and sourceName for attribution ("View on {sourceName}")

**Scrapers by Source Type:**
- **HoyMilonga** (~8 cities): Buenos Aires, São Paulo, Berlin, Athens, Istanbul, London, Miami, Montevideo
  - Uses Playwright browser automation (SPA requires JavaScript rendering)
  - Scrapes weekly milonga/practica schedules with venue and neighborhood data
- **TangoCat**: International festivals/marathons/encuentros with link-following to event sites
- **TangoFestivals**: Festival calendar aggregator
- **UnifiedEventScraper**: Generic AI extraction for ~50+ direct calendar sites

**Key Features:**
- **AI-Powered Extraction**: Groq llama-3.3-70b-versatile extracts event data
- **EventType Classification**: 14 types (milonga, practica, workshop, festival, marathon, encuentro, class, social, performance, show, competition, online, concert, private)
- **Source Transparency**: Events display "View on {sourceName}" links with original URLs
- **City Matching**: CityMatcherService associates events with city groups
- **Auto-City Creation**: New cities auto-created when events detected
- **Multi-Page Team Discovery**: Scrapers follow subpages (/djs, /teachers, /maestros, /performers, /artists, /schedule) to extract team member names in 6 languages, appending to event descriptions for ingestion

**TangoCat URL Extraction**: 
- TangoCat uses internal `/go/EventName/ID` redirect links (not direct hrefs)
- Actual event URLs are embedded in JSON within `<script>` tags
- Scraper builds ID→URL map from JSON, matches with /go/ links to get real URLs
- Events stored with actual website URLs (not tangocat.net) for source attribution

**Database Schema**: `scraped_events` table includes `event_type`, `source_url`, `source_name`, `city`, `country` columns
**Admin Endpoints**: POST `/api/admin/unified-scrape`, GET `/api/admin/unified-scraper-status`
**Event Ingestion**: 
- `ScrapedEventIngestionService` promotes approved scraped_events to the main events table
- Events are assigned to a "scraper_bot" system user
- sourceUrl/sourceName preserved for "View on {sourceName}" attribution

**Test Scripts**: 
- `server/scripts/test-production-scraper.ts` - MB.MD v9.9.3 production pipeline test
- `server/scripts/test-scraper-single-event.ts` - Tests HoyMilonga + TangoCat with link-following

### Platform Features
Core functionalities encompass social features (events, groups, posts, notifications, media management, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers). Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Unified Messaging Inbox, and a Faceless Content System. The Talent Match AI system includes volunteer onboarding, resume analysis, AI interviews, and task assignment, with an International Payment System orchestrating multi-gateway payments across 30 currencies and 6 regions. The platform supports anonymous volunteer applications via a 4-step guest flow (Intake, Upload, Interview, Complete) and has an enhanced 5-step onboarding flow. Event cards now display "View Original" links for transparency.

### Testing
The platform utilizes End-to-End (E2E) tests with Playwright, automated unit test coverage via CI/CD, and visual regression testing. A Volunteer Testing System provides 148 scenarios, with automated issue routing and an auto-fix pipeline. Pre-Authenticated Playwright Testing is implemented for faster, reusable test runs.

### Production
Production deployments are managed via GitHub Actions for CI/CD. Monitoring is handled by Prometheus/Grafana with Sentry, and deployment through Replit Publishing. Redis is used for caching, and PostgreSQL (Neon) with Drizzle ORM for the database. Deployment size optimization is achieved by excluding large directories via `.gitignore`. The production build incorporates React.lazy() for code splitting and lazy loading of heavy libraries and i18next translations.

### Marketing Site Architecture
The marketing site integrates a Human to Agent Collaboration (H2AC) Volunteer Program and an Ambassador Program. Public statistics are backed by real database data, and donations are handled via GoFundMe integration. The landing page has been updated to remove pricing and video sections, add "Coming Soon Features," and replace Stripe donation buttons with GoFundMe embeds. Marketing pages have updated footers, changed `/login` links to `/register`, and an updated About page. A new Tango Roles landing page is available at `/tango-roles`.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer, `@octokit/rest`