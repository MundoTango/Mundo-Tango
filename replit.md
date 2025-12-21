# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates with various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising, offering advanced functionalities for tango enthusiasts worldwide and an extensive AI ecosystem for strategic oversight and execution.

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
The platform uses an "MT Ocean Theme" with dark mode, built with Tailwind CSS, shadcn/ui, and Radix UI. It supports 68 languages via `i18next` and uses Wouter for routing (`AppLayout`, `DashboardLayout`, `AdminLayout`). Key UI components include a Visual Editor, Unified Sidebar, PublicProfileView, and PerRoleExperience, with a strict z-index hierarchy. Icons are sourced from Lucide React and React Icons.

### Backend
The backend is developed with Express and TypeScript, leveraging PostgreSQL (Neon) and Drizzle ORM. It includes modular routes, JWT authentication with Google/Facebook OAuth, an 8-tier Role-Based Access Control (RBAC) system, and automated database migrations. Server-side FFmpeg is used for video transcoding. The API supports PRO functionalities, place recommendations, and enhanced Talent Match AI features.

### AI Systems
Mundo Tango incorporates an extensive AI ecosystem with over 140 specialized agents for strategic oversight and atomic execution. This includes self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions. A RecursiveContextService handles hierarchical code summarization, and a TRM Learning Protocol is integrated. Scraping agents gather event data and automatically create city groups. The `/api/mrblue/chat` endpoint supports a `systemPrompt` parameter for custom AI interactions, bypassing the ConversationOrchestrator for direct prompt usage with Groq's llama-3.3-70b-versatile model.

### Mr. Blue Brain v2.0 (Modular Architecture)
The AI brain is restructured into a modular `/mr-blue-brain/` folder system with 30+ files across 9 folders, using invocation syntax for token-efficient loading. This includes:
- **Identity**: Defines Mr. Blue's core (soul, system-prompt, values, personality-modes).
- **Cognition**: Implements thinking processes like ReAct Protocol, Chain-of-Thought, Tree of Thoughts, Reflexion Loop.
- **Operations**: Details Mr. Blue's workflow and error recovery.
- **Orchestration**: Manages coordination using Mixture of Experts Router and Magentic Dynamic Orchestration.
- **Patterns**: Contains 61 MB.MD core and advanced patterns.
- **Agents**: Profiles for 140+ specialized agents (page, life-ceo, self-healing, scraping, business, core).
- **n8n**: Guides external integrations.

### Event Scraping System
A multi-stage scraping architecture coordinated by a Master Orchestrator. It includes Priority Scrapers (HoyMilonga, TangoCat, TangoFestivalsScraper) and an AI-powered UnifiedEventScraper for generic websites. The system scrapes aggregator sites, then follows links to actual event pages for detailed information. Key features include AI-powered extraction, 14 event type classifications, source transparency ("View on {sourceName}"), city matching, and auto-city creation for new event locations. Scrapers can extract team member names in multiple languages from subpages. Scraped events are stored in a `scraped_events` table and ingested into the main events table by `ScrapedEventIngestionService`.

**HoyMilonga Playwright Scraper** (December 2025):
- Supports 8 cities: Buenos Aires (40), Athens (5), Berlin (5), São Paulo (3), Miami (2), Istanbul, London, Montevideo
- Uses Playwright chromium for JavaScript SPA rendering
- Enriches events from detail pages (venue, address, organizers, price, cover image)
- Extracts participant profiles (DJs, teachers, organizers) automatically
- Country mapping: Argentina, Brazil, Germany, Greece, Turkey, UK, USA, Uruguay

### Platform Features
Core functionalities include social features (events, groups, posts, notifications, media management, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers). Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Unified Messaging Inbox, and a Faceless Content System. The Talent Match AI system integrates volunteer onboarding, resume analysis, AI interviews, and task assignment, with an International Payment System supporting 30 currencies and 6 regions.

**Cities as First-Class Entities (December 2025):**
- Cities are now SEPARATE from groups - stored in `cities` table with 23 entries
- Canonical URL pattern: `/cities/:slug` (e.g., `/cities/buenos-aires`, `/cities/rome`)
- Cities table has: id, slug, name, country, cover_image, legacy_group_id, member counts, etc.
- Legacy groups preserved for posts/members storage via `legacy_group_id` reference
- CityDetailsPage has 7 tabs: Discussion (default), Events, Members, Overview, Housing, Visitors, Tips
- Events tab has weekday filter buttons (Sun-Sat) with UTC date handling (getUTCDay())
- Cityscape cover images (skylines, architecture - NO PEOPLE) in cityImageMap.ts
- WorldMap, SearchPage, CityPopupCard all link to `/cities/:slug` URLs
- cityGroupAutomation.ts creates cities in cities table (not groups)
- Redirect pages (CitySlugRedirectPage, CityGroupRedirectPage) route to `/cities/:slug`
- Mr. Blue chat hidden on marketing pages for cleaner UX
- CSRF token fix: Token reuse across server restarts, prevents 403 errors on RSVP

**Key City Files:**
- `client/src/pages/CityDetailsPage.tsx` - Main city page with all 7 tabs
- `client/src/lib/cityImageMap.ts` - Cityscape photo URLs for all 23 cities
- `server/utils/cityGroupAutomation.ts` - City creation/lookup (uses cities table)
- `server/routes/city-routes.ts` - City API endpoints (/api/cities/*)

### Testing & Production
The platform utilizes End-to-End (E2E) tests with Playwright, automated unit test coverage, and visual regression testing. A Volunteer Testing System provides 148 scenarios with automated issue routing. Production deployments are managed via GitHub Actions for CI/CD, monitored by Prometheus/Grafana with Sentry, and deployed through Replit Publishing. Redis is used for caching, and PostgreSQL (Neon) with Drizzle ORM for the database. Deployment size optimization is achieved by excluding large directories via `.gitignore`, and the production build incorporates React.lazy() for code splitting.

### Marketing Site Architecture
The marketing site integrates a Human to Agent Collaboration (H2AC) Volunteer Program and an Ambassador Program. Public statistics are backed by real database data, and donations are handled via GoFundMe. The site includes "Coming Soon Features" and updated marketing pages with new footers and an updated About page. A new Tango Roles landing page is available.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer, `@octokit/rest`

## Critical Files Protection (NEVER DELETE)

The following files and directories are protected and must NEVER be deleted during deployment or cleanup:

### Core Documentation
| File | Purpose |
|------|---------|
| `mb.md` | MB.MD v2.0 methodology - core AI brain reference |
| `mb-legacy.md` | Legacy methodology backup (6,472 lines) |
| `replit.md` | Project documentation and preferences |

### AI Brain System
| Directory | Purpose |
|-----------|---------|
| `mr-blue-brain/` | Modular AI brain with 30+ files, 140+ agents |
| `mr-blue-brain/identity/` | Core identity (soul, values, personality) |
| `mr-blue-brain/cognition/` | Thinking frameworks (ReAct, CoT, ToT) |
| `mr-blue-brain/patterns/` | 61 MB.MD patterns |
| `mr-blue-brain/agents/` | 140+ specialized agent profiles |

### Asset Directories (Used by React Components)
| Directory | Used By |
|-----------|---------|
| `attached_assets/optimized/` | 7 pages (About, Home, Friends, Life-CEO) |
| `attached_assets/stock_images/` | 20+ pages (landing, marketing, etc.) |

### Protection Mechanism
- `scripts/prebuild-cleanup.sh` - Has explicit exclusions for these files
- `.gitignore` - Has exceptions for required asset directories
- All protected files must be tracked in git