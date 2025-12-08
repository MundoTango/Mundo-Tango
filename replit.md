# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security, and integrates with various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising within the global dance market.

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
The platform utilizes an "MT Ocean Theme" with dark mode, built with Tailwind CSS, shadcn/ui, and Radix UI. Iconography is provided by Lucide React and React Icons. It supports 68 languages via `i18next` and uses Wouter for routing, with `AppLayout`, `DashboardLayout`, and `AdminLayout`. Key features include a Visual Editor for inline editing, a Unified Sidebar for navigation, and standardized components like `PublicProfileView`, `UnifiedSidebar`, and `PerRoleExperience`.

### Backend
The backend is built with Express and TypeScript, using PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, and an 8-tier Role-Based Access Control (RBAC) system. Database migrations are automated, and server-side FFmpeg handles video transcoding. API endpoints support PRO functionalities, place recommendations, and enhanced Talent Match AI.

### AI Systems
Mundo Tango incorporates an extensive AI ecosystem with 1,218 specialized agents. This system includes self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions. It also integrates a RecursiveContextService with hierarchical code summarization and a TRM Learning Protocol.

### Platform Features
Core functionalities include social features (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers). Recent additions include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Housing Friendship Closeness Integration, and a Unified Messaging Inbox. A Faceless Content System with social media adapters is also integrated.

### Testing
The platform employs E2E tests, automated unit test coverage via CI/CD, and visual regression testing using Playwright and Claude Computer Use. The `run_test` tool is essential for E2E testing, managing environment setup and Stripe testing key injection.

### Production
Production deployments are managed via GitHub Actions for CI/CD. Monitoring is handled by Prometheus/Grafana with Sentry. Replit Publishing is used for deployment, Redis for caching, and PostgreSQL (Neon) with Drizzle ORM for data persistence.

### Marketing Site Architecture
The marketing site includes a Donation Tier System, a Human to Agent Collaboration (H2AC) Volunteer Program, and an Ambassador Program. All public statistics displayed on the marketing site are connected to a real database.

### Demo & Video Systems
A comprehensive Video Demo System features a landing page section with clickable demo cards, interactive modals, and a Playwright demo recording script. An automated video recording system uses Playwright's `recordVideo` to capture real customer journeys, adhering to a "ZERO fake data" policy.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon (PostgreSQL)
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer, `@octokit/rest`