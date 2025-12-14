# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates with various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising within the global dance market. Its core purpose is to facilitate community interaction, event management, and offer advanced functionalities for tango enthusiasts worldwide.

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
The platform uses an "MT Ocean Theme" with dark mode, built with Tailwind CSS, shadcn/ui, and Radix UI. Iconography is from Lucide React and React Icons. It supports 68 languages via `i18next` and uses Wouter for routing (`AppLayout`, `DashboardLayout`, `AdminLayout`). Key UI components include a Visual Editor, Unified Sidebar, PublicProfileView, UnifiedSidebar, and PerRoleExperience. A strict z-index hierarchy (z-30 to z-60+) prevents overlay issues.

### Backend
The backend uses Express and TypeScript with PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, an 8-tier Role-Based Access Control (RBAC) system, and automated database migrations. Server-side FFmpeg handles video transcoding. The API supports PRO functionalities, place recommendations, and enhanced Talent Match AI features.

### AI Systems
Mundo Tango features an extensive AI ecosystem with 48 specialized agents (10 Page, 33 Feature, 5 Scraping agents) for strategic oversight and atomic execution. It includes self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions. A RecursiveContextService handles hierarchical code summarization, and a TRM Learning Protocol is integrated. Scraping agents gather event data and automatically create city groups.

**Mr. Blue Custom Prompt Support (Dec 2025):** The `/api/mrblue/chat` endpoint now supports a `systemPrompt` parameter for custom AI interactions (e.g., Talent Match interviews). When `systemPrompt` is provided in the request body, the API bypasses the ConversationOrchestrator and directly uses the custom prompt with Groq's llama-3.3-70b-versatile model, returning `mode: 'custom_prompt'` in the response.

### Platform Features
Core functionalities include social features (events, groups, posts, notifications, media management, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers). Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Housing Friendship Closeness Integration, Unified Messaging Inbox, and a Faceless Content System. The Talent Match AI system includes volunteer onboarding, resume analysis, AI interviews, and task assignment. An International Payment System (MB.MD Pattern 49) orchestrates multi-gateway payments with compliance features (AML/KYC, tax calculation, sanctions screening) across 30 currencies and 6 regions.

**MB.MD Pattern 51 - Talent Pipeline Enhancement (Dec 2025):** The volunteer onboarding flow now features a complete interview-to-review pipeline. Key components: (1) VolunteerThankYouPage displays after interview completion with auto-redirect; (2) VolunteerDetailsPage provides admin view with tabbed interface for Interview Chat, Resume, and Assignments; (3) GET /api/v1/volunteers/:id/details aggregates volunteer data, resume, interview sessions, and assignments in a single API call; (4) TalentPipelinePage's "View Interview" button navigates to volunteer details for admin review.

### Testing
The platform employs End-to-End (E2E) tests with Playwright, automated unit test coverage via CI/CD, and visual regression testing with Claude Computer Use. The `run_test` tool manages E2E environment setup and Stripe key injection. A Volunteer Testing System provides 148 scenarios across 39 domains, with automated issue routing and an auto-fix pipeline. MB.MD Pattern 50 introduces Pre-Authenticated Playwright Testing for faster, reusable test runs by saving and reusing session states.

### Production
Production deployments use GitHub Actions for CI/CD. Monitoring is via Prometheus/Grafana with Sentry, and deployment through Replit Publishing. Redis is used for caching, and PostgreSQL (Neon) with Drizzle ORM for the database.

### Marketing Site Architecture
The marketing site integrates a Human to Agent Collaboration (H2AC) Volunteer Program and an Ambassador Program. Public statistics are backed by real database data. Donations are handled via GoFundMe integration with a reusable GoFundMeEmbed component.

**Dec 14, 2025 - Landing Page Overhaul:**
- Removed pricing section and video demo section from landing page
- Added "Coming Soon Features" section showcasing 6 upcoming platform features
- Replaced Stripe donation buttons with GoFundMe embed on /donate and /support pages
- Updated CSP to allow GoFundMe scripts and iframes

**Dec 14, 2025 - Marketing Site Phase 2:**
- Updated footer: Removed pricing, FAQ, dance styles, blog links; Updated social URLs to mundotangolife1 (Facebook) and mundotango.life (Instagram)
- Changed /login links to /register across marketing pages (MrBluePage, VolunteerPage, AmbassadorsPage, ForOrganizersPage, ForDancersPage, ForTeachersPage)
- Updated About page with 2 new Alexandros photos (Skoot_20, Skoot_16) and bio mentioning "100+ cities"
- Removed pricing section from /for-teachers page
- Removed 'browse events' button from /for-dancers page
- Created new Tango Roles landing page at /tango-roles with role flexibility focus (lead/follow/both) - added to "Who it's for" menu

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer, `@octokit/rest`