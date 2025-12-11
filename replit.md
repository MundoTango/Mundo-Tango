# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates with various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising within the global dance market.

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
The platform employs an "MT Ocean Theme" with dark mode, built using Tailwind CSS, shadcn/ui, and Radix UI. Iconography is powered by Lucide React and React Icons. It supports 68 languages via `i18next` and uses Wouter for routing, featuring `AppLayout`, `DashboardLayout`, and `AdminLayout`. Key UI components include a Visual Editor for inline editing, a Unified Sidebar, `PublicProfileView`, `UnifiedSidebar`, and `PerRoleExperience`. A strict z-index hierarchy (z-30 to z-60+) is maintained for floating and absolute UI elements to prevent overlay issues.

### Backend
The backend is developed with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. It incorporates modular routes, JWT authentication with Google/Facebook OAuth, and an 8-tier Role-Based Access Control (RBAC) system. Automated database migrations are in place, and server-side FFmpeg handles video transcoding. The API supports PRO functionalities, place recommendations, and enhanced Talent Match AI features.

### AI Systems
Mundo Tango features an extensive AI ecosystem comprising 1,218 specialized agents. This system includes self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions. It also integrates a RecursiveContextService with hierarchical code summarization and a TRM Learning Protocol. Automated event scraping agents (e.g., HoyMilongaScraper, TangoCatScraper, TangoFestivalsScraper) populate event data, automatically creating city groups for new locations.

### Platform Features
Core functionalities include comprehensive social features such as events, groups, posts, notifications, media management, live streaming, marketplaces, and reviews. Business-oriented features include Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, an Admin Dashboard, Stripe Payments, and BullMQ Workers. Recent additions encompass an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Housing Friendship Closeness Integration, and a Unified Messaging Inbox (integrating Gmail, Facebook, Instagram, WhatsApp). A Faceless Content System with social media adapters is also integrated.

### Testing
The platform utilizes End-to-End (E2E) tests with Playwright, automated unit test coverage via CI/CD, and visual regression testing with Claude Computer Use. The `run_test` tool is essential for E2E testing, managing environment setup and Stripe testing key injection. E2E tests employ `domcontentloaded` with a short JS initialization wait and recycle browser instances between test sections to manage memory. A Volunteer Testing System provides 148 comprehensive test scenarios across 39 domains, with automated issue routing, gamification rewards, and an auto-fix pipeline.

### Production
Production deployments are managed via GitHub Actions for CI/CD. Monitoring is handled by Prometheus/Grafana with Sentry, and deployment uses Replit Publishing. Redis is used for caching, and PostgreSQL (Neon) with Drizzle ORM for database persistence.

### Marketing Site Architecture
The marketing site integrates a Donation Tier System, a Human to Agent Collaboration (H2AC) Volunteer Program, and an Ambassador Program, with all public statistics backed by a real database. A comprehensive Video Demo System provides clickable demo cards and interactive modals, with automated video recording using Playwright's `recordVideo` to ensure genuine customer journey captures.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon (PostgreSQL)
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer, `@octokit/rest`