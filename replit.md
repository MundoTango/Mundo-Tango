# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security, integrating various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising, offering advanced functionalities for tango enthusiasts and an extensive AI ecosystem for strategic oversight and execution.

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
Mundo Tango incorporates an extensive AI ecosystem with over 140 specialized agents. This includes self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions. A RecursiveContextService handles hierarchical code summarization, and a TRM Learning Protocol is integrated. Scraping agents gather event data and automatically create city groups. The `/api/mrblue/chat` endpoint supports a `systemPrompt` parameter for custom AI interactions, bypassing the ConversationOrchestrator for direct prompt usage with Groq's llama-3.3-70b-versatile model.

The AI brain is structured into a modular `/mr-blue-brain/` folder system, encompassing:
- **Identity**: Defines Mr. Blue's core (soul, system-prompt, values, personality-modes).
- **Cognition**: Implements thinking processes like ReAct Protocol, Chain-of-Thought, Tree of Thoughts, Reflexion Loop.
- **Operations**: Details Mr. Blue's workflow and error recovery.
- **Orchestration**: Manages coordination using Mixture of Experts Router and Magentic Dynamic Orchestration.
- **Patterns**: Contains 61 MB.MD core and advanced patterns.
- **Agents**: Profiles for 140+ specialized agents (page, life-ceo, self-healing, scraping, business, core).
- **n8n**: Guides external integrations.

### Event Scraping System
A multi-stage scraping architecture coordinated by a Master Orchestrator. It includes Priority Scrapers (HoyMilonga, TangoCat, TangoFestivalsScraper) and an AI-powered UnifiedEventScraper for generic websites. The system scrapes aggregator sites, then follows links to actual event pages for detailed information. Key features include AI-powered extraction, 14 event type classifications, source transparency, city matching, and auto-city creation for new event locations. Scrapers can extract team member names in multiple languages from subpages. Scraped events are stored in a `scraped_events` table and ingested into the main events table by `ScrapedEventIngestionService`. An Admin UI at `/admin/scraping` provides real-time scraper status and a moderation queue.

### Platform Features
Core functionalities include social features (events, groups, posts, notifications, media management, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers). Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Unified Messaging Inbox, and a Faceless Content System. The Talent Match AI system integrates volunteer onboarding, resume analysis, AI interviews, and task assignment, with an International Payment System supporting 30 currencies and 6 regions. All 232 city groups have valid coordinates, auto-geocoding for new cities, and the city pages are publicly accessible. A comprehensive Data Quality System is in place for reports, migrations, and profile linking.

### Data Architecture & Statistics
**Current Database State (Updated Dec 21, 2024):**
- 276 city groups in `groups` table (all follow CITY_PAGE.md spec - Buenos Aires template)
- 254 unique cities with event data (from scrapers)
- 811 total events, 820 active users, 62 countries

**World Map Stats (FIXED Dec 2024):**
- Previous bug: Stats API was ADDING counts (232 + userCities + locationHistory + 254 scraped = 585 cities ❌)
- Fix: Use MAX for deduplication, now shows 276 cities correctly
- City name matching: Events stored with city names ("Buenos Aires"), groups have full names ("Buenos Aires Tango Community") - CityDetailsPage extracts city name properly

**City Migration (Completed Dec 21, 2024):**
- All cities with events now have proper city groups following Buenos Aires template
- 44 new city groups created via `server/scripts/migrate-cities-to-groups.ts`
- All groups have geocoded coordinates from OpenStreetMap Nominatim
- Event counts synced for all 276 city groups
- Migration script can be re-run for future cities

### Testing & Production
The platform utilizes End-to-End (E2E) tests with Playwright, automated unit test coverage, and visual regression testing. A Volunteer Testing System provides 148 scenarios with automated issue routing. Production deployments are managed via GitHub Actions for CI/CD, monitored by Prometheus/Grafana with Sentry, and deployed through Replit Publishing. Redis is used for caching, and PostgreSQL (Neon) with Drizzle ORM for the database.

### Marketing Site Architecture
The marketing site integrates a Human to Agent Collaboration (H2AC) Volunteer Program and an Ambassador Program. Public statistics are backed by real database data, and donations are handled via GoFundMe. The site includes "Coming Soon Features" and updated marketing pages with new footers and an updated About page. A new Tango Roles landing page is available.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next with 69 language locales, lazy-loaded translations

## Recent Changes (Dec 23, 2024)

### Complete Internationalization - Professional Translations Added
- **FINAL STATUS**: 318/318 non-admin pages have t() calls, i18n infrastructure fully working
- **Translation Files**: Located in `client/public/locales/{lng}/{ns}.json` (4 namespaces: common, navigation, pages, errors)
- **69 Languages**: All synced from English base
- **Language Selector**: Supports 69 languages including es-ar (Argentine Rioplatense Spanish) at position #2
- **RTL Support**: Arabic, Hebrew, Persian, Urdu with automatic dir="rtl"/"ltr" switching
- **URL Detection**: `?lng=` query parameter works for language switching
- **E2E Verified**: Tests confirm locale files load correctly and display translated text

**Professional Translations Completed (Dec 23, 2024):**
- ✅ **Spanish (es)**: All 4 namespaces - common, pages, navigation, errors
  - Hero: "Donde el Tango se encuentra con la Comunidad"
  - Culturally appropriate tango terminology
- ✅ **French (fr)**: All 4 namespaces - common, pages, navigation, errors
  - Hero: "Où le Tango rencontre la Communauté"
  - Proper French localization
- ✅ **Japanese (ja)**: All 4 namespaces - common, pages, navigation, errors
  - Hero: "タンゴとコミュニティの出会う場所"
  - Culturally appropriate with proper honorifics

**Remaining Priority Languages (Pending):**
- es-ar (Argentine Rioplatense Spanish), pt (Portuguese), de (German), it (Italian), zh (Chinese), ko (Korean), ru (Russian)

**i18n Configuration (client/src/lib/i18n.ts):**
- Detection order: `['querystring', 'localStorage', 'navigator', 'htmlTag']`
- Fallback: `en` (English)
- Load mode: `languageOnly` (es-ar → es → en fallback chain)
- Namespaces: common, navigation, pages, errors

**MB.MD Learnings Applied:**
1. ✅ Verify target directories before writing files (`client/public/locales/` not `public/locales/`)
2. ✅ Ensure translation keys in JSON match what code calls
3. ✅ Include `querystring` in i18n detection order for URL-based switching
4. ✅ Sync all locales from English base before testing
5. ✅ E2E test language switching on multiple pages before declaring complete
6. ✅ Professional translations require human-quality text, not machine-translated placeholders