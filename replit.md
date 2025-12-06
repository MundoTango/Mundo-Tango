# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community with a resilient, self-sovereign architecture and enterprise-grade security. It integrates with various business systems and specialized AI agents, aiming for monetization through premium services, event hosting, and targeted advertising within the global dance market.

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

## Recent Session Progress (Dec 6, 2025)
### MB.MD v9.9.3 Phase 3-5 Validation Complete
- **Phase 3 (Build/Audit)**: SwarmChoreography with 20-page batches processing 352 pages (~80 pages/10min)
- **Phase 4 (Test)**: ValidationRelayService with 6 validation types operational
- **Phase 5 (Fix)**: ✅ VERIFIED - 3-Strike AutoFix with processIssue() method tested
  - Issue 1 (a11y): Resolved attempt 1 with "simple" strategy (76.8% confidence)
  - Issue 2 (ui): Resolved attempt 1 with "simple" strategy (66.6% confidence)
  - Issue 3 (performance): Failed "simple" → Escalated to "advanced" → Resolved attempt 2
  - Stats: 0% escalation rate, within <10% target
- **Test Endpoint**: POST /api/orchestration/phases/test-phase5 for quick Phase 5 validation

## System Architecture

### UI/UX
The platform uses an "MT Ocean Theme" with dark mode (Tailwind CSS, shadcn/ui, Radix UI). Iconography is handled by Lucide React and React Icons. It supports 68 languages via `i18next` and Wouter for routing, with `AppLayout`, `DashboardLayout`, and `AdminLayout`. A Visual Editor allows inline editing. Navigation features a Unified Sidebar. Standardized components like `PublicProfileView`, `UnifiedSidebar`, and `PerRoleExperience` ensure consistency.

### Backend
Built with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, and an 8-tier RBAC system. Database migrations are automated, and server-side FFmpeg handles video transcoding. API endpoints support PRO functionalities, place recommendations, and enhanced Talent Match AI.

### AI Systems
An extensive AI ecosystem orchestrates 1,218 specialized agents hierarchically, ranging from strategic oversight (Replit AI) to atomic execution. Key components include self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions. It also integrates a RecursiveContextService with hierarchical code summarization and a TRM Learning Protocol.

### Platform Features
Core features include social functionalities (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers). Recent additions include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Housing Friendship Closeness Integration, and a Unified Messaging Inbox (Gmail, Facebook, Instagram, WhatsApp). A Faceless Content System with social media adapters is also integrated.

### Testing
The platform uses E2E tests, automated unit test coverage via CI/CD, and visual regression testing with Playwright and Claude Computer Use. The `run_test` tool is critical for E2E testing, handling environment setup and Stripe testing key injection.

### Production
Production deployments leverage GitHub Actions for CI/CD, Prometheus/Grafana with Sentry for monitoring, Replit Publishing for deployment, Redis for caching, and PostgreSQL (Neon) with Drizzle ORM.

### Marketing Site Architecture
The marketing site includes a Donation Tier System, a Human to Agent Collaboration (H2AC) Volunteer Program, and an Ambassador Program, with all public statistics wired to a real database.

### Demo & Video Systems
A comprehensive Video Demo System includes a landing page section with clickable demo cards, interactive modals, and a Playwright demo recording script. An automated video recording system uses Playwright's `recordVideo` to capture real customer journeys, adhering to a ZERO fake data policy.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon (PostgreSQL)
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer, `@octokit/rest`