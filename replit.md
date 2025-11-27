# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security, integrating 7 business systems and 1,218 specialized AI agents. The platform aims to monetize through premium services, event hosting, and targeted advertising, tapping into the global dance market.

## User Preferences
- **Work Simultaneously** - Run operations in parallel (use Promise.all, parallel tool calls)
- **Work Recursively** - Deep analysis, not surface-level (read imports, dependencies, related files)
- **Work Critically** - Target 95-99/100 quality (test before complete, validate edge cases)
- **Check Infrastructure First** - Use existing systems before building new (Page Audit, Auto-Fix, Agent Orchestration)
- **Test Before Complete** - Run E2E tests for UI changes, unit tests for backend
- **Database:** Never change ID column types (serial ↔ varchar) - breaks existing data
- **Handoff Plan:** Never deviate - Follow exact phase sequence
- **Auto-Fix Maximization** - All auto-fix as much as possible (3-attempt retry, <10% escalation rate)
- **Validation Loop** - observe → decide → act → validate → adapt (not just automation)

## System Architecture

### UI/UX
The platform uses the "MT Ocean Theme" with ocean blues and warm accents, supporting dark mode via Tailwind CSS. Components are built with `shadcn/ui` and Radix UI, using Lucide React and React Icons for iconography. It supports 68 languages via `i18next` and Wouter for routing. Layouts include `AppLayout` (public), `DashboardLayout` (authenticated), and `AdminLayout` (administrative). A Visual Editor provides wisprflow.ai-style inline editing with direct text editing, element manipulation, toast notifications, tooltips, and voice commands. A manual save system tracks changes, and context-awareness provides smart suggestions. Key features include a `UnifiedLocationPicker` for live map data autocomplete and multi-city trip support in travel planning.

### Backend
The backend uses Express and TypeScript, with PostgreSQL (Neon) and Drizzle ORM. `shared/schema.ts` defines the database schema, and `server/storage.ts` handles CRUD operations. Routes are modular, and authentication uses JWT (httpOnly cookies) with Google/Facebook OAuth, featuring an 8-tier Role-Based Access Control (RBAC) system. Database migrations are automated. Server-side FFmpeg transcoding handles video compression for uploads, generating H.264 video and thumbnails. The API includes endpoints for place recommendations with auto-aggregation and radius-based search, and travel plans supporting multi-city trips with per-city dates stored as JSONB arrays. Location search uses server-side caching.

### AI Systems
A universal agent ecosystem orchestrates 1,218 specialized AI agents through a hierarchical training architecture:
- **Level 1 - Replit AI:** Strategic oversight.
- **Level 2 - Mr. Blue:** Tactical coordinator.
- **Level 3 - 1,218 Agents:** Atomic task executors with instant knowledge sharing via a GlobalKnowledgeBase.
- **Self-Healing Infrastructure:** Includes `PreFlightCheckService`, `GlobalKnowledgeBase`, `PageAuditService`, `AutoFixEngine`, `AgentOrchestration`, and `VibeCodingService`.
- **Phase C Autonomous Framework:** A production-ready validation loop with `AutoRetryService`, `EscalationService`, `EvidenceCollector`, and `AgentEventBus` for >80% auto-fix success.
- **Visual Validation Framework:** Integrates Claude Computer Use for AI-powered UI change validation using before/after screenshots and visual regression analysis.
- **Contextual Agent Activation:** Agents activate per route with health checks, page audits, and contextual queries.
- **Backend Agent System:** Extends autonomous capabilities to the full stack for backend, database, security, and services.
- **Mr. Blue AI Assistant:** A fully autonomous AI system with 45+ services, offering text/voice chat, VibeCoding, page generation from natural language, proactive error detection, and auto-fix.
- **Bifrost AI Gateway:** Manages multi-provider AI interactions with failover, semantic caching, and load balancing.

### Platform Features
Core features include social functionalities like events, groups, posts, real-time notifications, media galleries, live streaming, marketplaces, and reviews. Business features include Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers for background processing. The platform supports event scraping, storing `source_name`, `source_url`, `external_source_id`, `scraped_event_id`, and raw participant data for events.

### Testing
The platform aims for 95%+ coverage using E2E Tests (Playwright) for authentication, feed, events, profiles, search, admin, and performance. Hybrid Visual Testing combines Playwright with Claude Computer Use for AI-powered visual regression, accessibility, and responsive design analysis. Integration tests cover backend API endpoints and orchestration services.

### Production
CI/CD is managed via GitHub Actions. Monitoring is handled with Prometheus/Grafana, caching with Redis, and error tracking with Sentry.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, i18next, Wouter, Multer