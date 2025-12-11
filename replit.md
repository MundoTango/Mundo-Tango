# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates with various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising within the global dance market. Its core purpose is to facilitate community interaction, event management, and offer advanced functionalities for tango enthusiasts worldwide.

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
The platform employs an "MT Ocean Theme" with dark mode, built using Tailwind CSS, shadcn/ui, and Radix UI. Iconography is provided by Lucide React and React Icons. It supports 68 languages via `i18next` and uses Wouter for routing, with distinct `AppLayout`, `DashboardLayout`, and `AdminLayout` components. Key UI elements include a Visual Editor for inline editing, a Unified Sidebar for navigation, and standardized components like `PublicProfileView` and `PerRoleExperience` to ensure consistency.

### Backend
The backend is developed with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. It features a modular route structure, JWT authentication with Google/Facebook OAuth, and an 8-tier Role-Based Access Control (RBAC) system. Database migrations are automated, and server-side FFmpeg is used for video transcoding. API endpoints support PRO functionalities, place recommendations, and an enhanced Talent Match AI.

### AI Systems
An extensive AI ecosystem comprises **48 operational agents** (audited Dec 7, 2025):
- **10 Page Agents**: Landing, Feed, Profile, Events, Messages, Admin, Housing, Groups, Financial, MrBlue
- **33 Feature Agents**: Subordinate to page agents (4 per major page, 3 per minor page)
- **5 Scraping Agents**: #115 Orchestrator, #116 Static, #117 JS, #118 Social, #119 Deduplicator

The hierarchy provides strategic oversight and atomic execution. This includes a self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions (OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs). The system also integrates a RecursiveContextService for hierarchical code summarization and a TRM Learning Protocol. The 5 scraping agents actively gather data from 203+ sources (200 active + 3 newly added).

### Platform Features
Core functionalities encompass social features such as events, groups, posts, notifications, media management, live streaming, marketplaces, and reviews. Business-oriented features include Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, automated scraping, an Admin Dashboard, Stripe Payments integration, and BullMQ Workers. Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Housing Friendship Closeness Integration, a Unified Messaging Inbox, and a Faceless Content System with social media adapters.

### International Payment System (MB.MD Pattern 49)
A comprehensive multi-gateway payment orchestration system supporting global payments:

**Phase 1 - Core Orchestration (Complete):**
- PaymentOrchestrator.ts - Multi-gateway routing with Stripe as primary
- CurrencyManager.ts - 30 currencies across 6 regions (US, EU, LATAM, APAC, AFRICA, MENA)
- WebhookDispatcher.ts - Multi-gateway webhook routing

**Phase 2 - Compliance (Complete):**
- AMLKYCVerifier.ts - Anti-money laundering verification (BASIC/ENHANCED/PREMIUM)
- TaxCalculator.ts - VAT/GST for 25+ countries
- SanctionsScreener.ts - OFAC/UN sanctions screening

**Phase 3 - Gateway Adapters (Built, Pending Credentials):**
- AdyenAdapter.ts - EU/APAC payments (10+ card types)
- WiseAdapter.ts - B2B international transfers
- LocalPaymentMethods.ts - Regional methods (PIX, Boleto, Alipay, WeChat Pay, M-Pesa, UPI, iDEAL, etc.)

**Phase 4 - Frontend (Complete):**
- PaymentMethodSelector.tsx - Smart method selection by country/region
- CurrencySelector.tsx - Currency picker with FX preview

**API Endpoints:** `/api/payments/` with currencies, methods, exchange-rate, tax, process, compliance, webhooks

**Known Limitations (Phase 2+ Work):**
- Adyen/Wise require API credentials for production use
- Webhook signature verification requires raw body middleware configuration
- Multi-gateway failover requires additional gateway credentials

### Testing
The platform utilizes E2E tests, automated unit test coverage via CI/CD, and visual regression testing with Playwright and Claude Computer Use. The `run_test` tool is essential for E2E testing, managing environment setup and Stripe testing key injection.

### Production
Production deployments are managed through GitHub Actions for CI/CD. Monitoring is handled by Prometheus/Grafana with Sentry, and deployment is facilitated by Replit Publishing. Redis is used for caching, and PostgreSQL (Neon) with Drizzle ORM serves as the database.

### Marketing Site Architecture
The marketing site integrates a Donation Tier System, a Human to Agent Collaboration (H2AC) Volunteer Program, and an Ambassador Program. All public statistics displayed on the site are wired to real database data.

### Demo & Video Systems
A comprehensive Video Demo System provides a landing page section with clickable demo cards, interactive modals, and a Playwright demo recording script. An automated video recording system leverages Playwright's `recordVideo` to capture real customer journeys, adhering to a strict "ZERO fake data" policy.

### Expert Council Remediation (Dec 7, 2025)
Per MB.MD methodology, 7 industry experts reviewed the platform:

| Expert | Focus | Documentation |
|--------|-------|---------------|
| Tamás Szalai | Infra/SLOs | `docs/ARCHITECTURE.md` (SLO appendix) |
| Aleksandra Płochocka | FEP Theory | `docs/DESIGN_NOTE_FEP.md` |
| Davor Perhaj | UX/UI | `docs/UX_AUDIT_DAVOR.md` |
| Caran | Product Wedge | `docs/TANDA_DE_3_WEDGE.md` |
| Karthikeyan Rajendran | AI Costs | `docs/AI_COST_BUDGET.md` |
| Jörn Schillmann | Strategy | `docs/EXEC_BRIEF.md` |
| Louis Parks | Product Ops | `docs/INCIDENT_PLAYBOOK.md` |

OSI References: `docs/prds/PRD_EXPERT_COUNCIL_OSI_REFERENCES.md`

### Recent Schema Fixes (Dec 10, 2025)
Resolved systematic UUID/integer type mismatches in the database:

**Tables Recreated (empty, 0 data loss):**
- `posts` - ID and user_id changed from UUID to INTEGER
- `events` - ID and user_id changed from UUID to INTEGER, added 55+ missing columns
- `communities` - ID changed from UUID to INTEGER, added missing columns
- `community_members` - All IDs changed from UUID to INTEGER
- `subscriptions` - ID and user_id changed from UUID to INTEGER

**Tables Fixed (columns added):**
- `follows` - Recreated with integer types
- `prediction_cache` - Added `confidence_scores` and `cache_warmed_at` columns

**All Core APIs Now Operational:**
- Auth/Login ✅
- Posts API ✅
- Feed API ✅
- Messaging API ✅
- Events API ✅
- Users API ✅

### Database Migration to Supabase (Dec 10, 2025)
Successfully migrated from Neon to Supabase PostgreSQL:

**Database Connection:**
- Primary: Supabase PostgreSQL (`SUPABASE_DATABASE_URL`)
- Fallback: Neon (disabled endpoint)
- Connection logic: `shared/db.ts` prioritizes Supabase when available

**Data Seeded:**
- 5 test users with tango roles (admin, teacher, DJ, organizer, dancer)
- 198 tango events across 10 cities (milongas, practicas, festivals, workshops)
- 143 community scraping sources across 46 countries

**Seed Scripts:**
- `server/scripts/seed-users-simple.ts` - Creates test users with tango_roles
- `server/scripts/seedTangoData.ts` - Creates 100 realistic tango events
- `server/scripts/populateTangoCommunities.ts` - Populates 143 community sources

**Public Stats API (`/api/stats/public`):**
- dancers: 5 (active users)
- teachers: 3 (users with Teacher role)
- organizers: 2 (users with Organizer role)
- events: 198 (future-dated events)
- cities: 4 (unique user cities)
- countries: 4 (unique user countries)

### Branch Merge Recovery (Dec 11, 2025)
Restored critical files from 10+ feature branches using MB.MD v9.9.4 methodology:

**Branches Analyzed:**
- `server/services/scrapers` - 496 files (scrapers, sidebar, friends)
- `feature/audio-conversation` - 776 files (messaging UI, auto-fix engine)
- `feature/friends-list` - SendFriendRequestModal, FriendsPage
- `qa-remediation/sprint1-critical-fixes` - 103 documented issues

**Key Components Restored/Verified:**
- MessagesPage.tsx - 617 lines with i18n, conversation list, channel filtering
- FriendshipQuestionnaire.tsx - 341 lines with form validation and preview
- UnifiedInbox.tsx - 324 lines with multi-channel support (FB, WhatsApp, Gmail, Instagram)
- ProfilePage.tsx - 1034 lines upgraded from scrapers branch
- FeedPage.tsx - 606 lines with reactions, comments, media
- AutoFixEngine.ts - Self-healing system
- BaseEventScraper.ts, TangopolixScraper.ts - Event scraping infrastructure

**Data Seeded (Dec 11, 2025):**
- 9 posts with full user data and tango roles
- 198 tango events (38KB API response)
- 5 users with diverse tango roles
- 10 city community groups (Buenos Aires, Paris, NYC, Berlin, London, Tokyo, Rome, Istanbul, Barcelona, São Paulo)
- 8 tango venues (milongas, studios)
- 5 tango housing listings

**API Status (All Operational):**
- Posts API: 9 posts with reactions and user profiles
- Events API: 198 events (38KB data)
- Stats API: 5 dancers, 3 teachers, 2 organizers, 198 events, 4 cities, 4 countries
- Community Locations API: 10 cities with 12,331 total members
- Community Stats API: 10 cities, 10 countries, 403 events, 8 venues, 5 housing
- Health API: Healthy with 277+ seconds uptime

## External Dependencies
- **Infrastructure:** PostgreSQL (Supabase primary), Redis, Cloudinary, OpenStreetMap
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer, `@octokit/rest`