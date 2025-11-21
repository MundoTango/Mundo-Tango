# Mundo Tango

---

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It offers comprehensive social networking, event management, talent matching, and advanced AI assistance, aiming to be the leading digital hub for tango enthusiasts. The platform integrates 7 core business systems and 62 specialized AI agents, built with a self-sovereign, resilient, and enterprise-grade secure architecture.

**Business Vision:** To become the premier digital ecosystem for the tango community, offering premium services, event monetization, and targeted advertising.
**Market Potential:** Tapping into the global tango community by providing a centralized, feature-rich platform.
**Project Ambition:** To be the most advanced and comprehensive social platform dedicated to tango, leveraging cutting-edge AI and robust architecture.

---

## User Preferences

Every Replit Agent session MUST execute protocols in this order:
1. **SELF-HEALING FIRST** - Always check infrastructure
2. **MB.MD EXECUTION CHECKLIST** - Follow methodology
3. **TASK-SPECIFIC PROTOCOLS** - Domain-specific rules
4. **QUALITY GATES (95-99/100)** - Verify before complete

**MB.MD Execution Checklist:**
- **Work Simultaneously** - Run operations in parallel (use Promise.all, parallel tool calls)
- **Work Recursively** - Deep analysis, not surface-level (read imports, dependencies, related files)
- **Work Critically** - Target 95-99/100 quality (test before complete, validate edge cases)
- **Check Infrastructure First** - Use existing systems before building new (Page Audit, Auto-Fix, Agent Orchestration)
- **Test Before Complete** - Run E2E tests for UI changes, unit tests for backend

**Quality Gates (95-99/100 Target):** Before marking ANY task complete:
- **LSP Diagnostics:** Check LSP if >100 lines changed (for typed languages)
- **E2E Testing:** `run_test` for browser interactions, forms, multi-page flows (for UI/UX features)
- **Infrastructure Verification:** Restart workflow, check logs, verify no errors
- **Documentation Update:** Update `replit.md` for major changes
- **Self-Audit:** "Did I use self-healing? Did I follow MB.MD checklist?"

**CRITICAL RULE for Database:** Never change ID column types (serial ↔ varchar) - breaks existing data.
**Handoff Plan:** Never deviate from the handoff plan - Follow the exact phase sequence.

---

## System Architecture

**Development Methodology:** MB.MD Protocol v9.2, emphasizing micro-batching, template reuse, parallel work, and 10-layer quality gates. Agents undergo SME (Subject Matter Expert) training, learning all documentation before implementation. The protocol includes DPO Training, Curriculum Learning, GEPA Self-Evolution, and LIMI Curation.

**UI/UX Decisions:**
- **Theme System:** MT Ocean, using a Tango-inspired palette (ocean blues, warm accents) with dark mode support via Tailwind. Features glassmorphic overlays and smooth animations.
- **Components:** Utilizes `shadcn/ui` and `Radix UI` primitives, with `Lucide React` and `React Icons` for iconography.
- **Responsiveness:** Mobile-first design, tested across various screen sizes.
- **Navigation:** Wouter for routing, with distinct layouts: `AppLayout` (public), `DashboardLayout` (authenticated), and `AdminLayout` (super admin).
- **Internationalization (i18n):** `i18next` supports 68 languages, with locale files in `public/locales/{lang}/{namespace}.json`.

**Technical Implementations:**
- **Frontend:** React, TypeScript, Vite, Wouter routing, React Query.
- **Backend:** Express.js, TypeScript, PostgreSQL.
- **Database:** PostgreSQL (Neon-backed) with Drizzle ORM. `shared/schema.ts` is the single source of truth for the schema. `npm run db:push` handles migrations.
- **API Structure:** Modular routes (`server/routes/*-routes.ts`) registered centrally in `server/routes.ts`. Uses Express middleware for authentication, CSRF, and rate limiting. Zod schemas from Drizzle are used for validation.
- **Authentication & Authorization:** JWT (stored in httpOnly cookies), Google/Facebook OAuth (via Supabase), and an 8-tier Role-Based Access Control (RBAC) system. Includes 2FA and robust security features like Dynamic Feature Flags, Row-Level Security (RLS), CSP Headers, and Audit Logging.
- **AI Systems:** A Universal Agent Ecosystem of 1,218 specialized agents.
    - **Self-Healing Infrastructure:** Page Audit Service (6-agent parallel audit), Auto-Fix Engine, Agent Orchestration, Error Analysis Agent, and VibeCoding Service (natural language to code). Endpoints include `/api/self-healing/orchestrate`, `/api/self-healing/health`, and `/api/self-healing/dashboard`.
    - **Mr. Blue AI Assistant:** Conversational AI with context awareness, voice chat (ElevenLabs TTS + Whisper STT), VibeCoding for code generation, a Visual Editor, and a Page Generator. Proactive error detection, autonomous agent system, and integration with Replit AI.
    - **The Plan: Scott's First-Time Login Tour:** A 50-page validation system to guide the founder through feature testing against documentation.
    - **Bifrost AI Gateway:** Unifies AI provider access (OpenAI, Anthropic, Groq, Google) with automatic failover, semantic caching, and load balancing.

**Feature Specifications:**
- **Social Features:** Events, groups, friendship system, posts (likes, comments, shares), real-time notifications (WebSockets), media gallery, live streaming, marketplace, subscriptions, reviews, leaderboard, blog, teacher/venue management, workshop system, music library, stories, venue recommendations.
- **Business Systems:** Talent Match AI, LIFE CEO AI SYSTEM (orchestrating 16 AI agents via LanceDB), Multi-AI Orchestration (4 providers with failover/caching), Automated Data Scraping (Cheerio, Playwright, Graph API), Admin Dashboard & Analytics, Stripe Payment Processing, and BullMQ-based Automation & Workers (39 functions, 6 workers, requires Redis).

**System Design Choices:**
- **Project Structure:** `client/` for frontend, `server/` for backend, `shared/` for common types/schemas, `docs/` for documentation, `attached_assets/` for media.
- **Testing:** 95% E2E coverage using Playwright for user journeys, WebSockets, security, performance, and visual editor functionality.
- **DevOps & Monitoring:** CI/CD with GitHub Actions, Prometheus/Grafana for monitoring, Redis for caching/session management, Sentry for error tracking. Optimized for performance with bundle sizes, lazy loading, and code splitting.

---

## External Dependencies

**Infrastructure:**
- **Database:** PostgreSQL (Neon-backed)
- **ORM:** Drizzle
- **Cache/Queue:** Redis (for BullMQ and session management)
- **Storage:** Cloudinary (for images)

**Authentication:**
- Google OAuth
- Facebook OAuth (via Supabase)
- JWT

**AI Platforms & Services:**
- OpenAI (GPT-4o)
- Anthropic (Claude 3.5 Sonnet)
- Groq (Llama 3.1, Llama 3.3-70b)
- Google (Gemini Pro)
- Luma (Dream Machine - video generation)
- ElevenLabs (Voice Cloning + TTS)
- Bifrost AI Gateway (for unified AI routing)

**Real-time Communication:**
- Supabase Realtime
- WebSockets (custom implementation)

**Payments:**
- Stripe

**UI/UX Libraries:**
- shadcn/ui
- Radix UI
- Framer Motion

**Error Tracking:**
- Sentry

**Testing:**
- Playwright

**Vector Search:**
- LanceDB

**Queue Management:**
- BullMQ