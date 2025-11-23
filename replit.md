# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community with a resilient, self-sovereign architecture and enterprise-grade security. It integrates 7 business systems and 1,218 specialized AI agents. The platform's business model includes premium services, event monetization, and targeted advertising, aiming to capture significant market potential within the global dance community.

## User Preferences
- **Work Simultaneously** - Run operations in parallel (use Promise.all, parallel tool calls)
- **Work Recursively** - Deep analysis, not surface-level (read imports, dependencies, related files)
- **Work Critically** - Target 95-99/100 quality (test before complete, validate edge cases)
- **Check Infrastructure First** - Use existing systems before building new (Page Audit, Auto-Fix, Agent Orchestration)
- **Test Before Complete** - Run E2E tests for UI changes, unit tests for backend
- **Database:** Never change ID column types (serial ↔ varchar) - breaks existing data
- **Handoff Plan:** Never deviate - Follow exact phase sequence

## System Architecture

### UI/UX
The platform uses the "MT Ocean Theme" with ocean blues and warm accents, supporting dark mode via Tailwind CSS. Components are built with `shadcn/ui` and Radix UI, using Lucide React and React Icons for iconography. It provides i18n support for 68 languages via `i18next` and uses Wouter for routing. Layouts include `AppLayout` (public), `DashboardLayout` (authenticated), and `AdminLayout` (administrative). The Visual Editor provides a wisprflow.ai-style UX with voice interaction, element selection, inline text editing, and an auto-save mechanism.

### Backend
The backend is developed with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. `shared/schema.ts` is the single source of truth for the database schema, with `server/storage.ts` providing CRUD operations. Routes are modular, and authentication uses JWT (httpOnly cookies) and Google/Facebook OAuth, featuring an 8-tier Role-Based Access Control (RBAC) system. Database migrations are automated.

### AI Systems
A universal agent ecosystem coordinates 1,218 specialized AI agents through a hierarchical training architecture:
- **Level 1 - Replit AI:** Strategic oversight, trains Mr. Blue.
- **Level 2 - Mr. Blue:** Tactical coordinator, manages specialized agents.
- **Level 3 - 1,218 Agents:** Atomic task executors with instant knowledge sharing via a GlobalKnowledgeBase.
- **Self-Healing Infrastructure:** Includes `PreFlightCheckService`, `GlobalKnowledgeBase`, `PageAuditService`, `AutoFixEngine` for autonomous self-healing, `AgentOrchestration`, and `VibeCodingService`. It features error detection, auto-analysis, auto-approval of fixes, and database integration for proposals.
- **Contextual Agent Activation:** Agents activate per route with health checks, page audits, and contextual queries, improving performance.
- **Backend Agent System:** Extends the Visual Editor to a full-stack autonomous system, handling backend, database, security, and service agents through a 7-phase orchestration process (Analyzing → Schema → API → Security → Service → Git → Restart). It supports real-time progress tracking, automatic Git commits, and session-based change tracking.
- **Mr. Blue AI Assistant:** A fully autonomous AI system with 45+ services, offering text/voice chat, VibeCoding, page generation from natural language, proactive error detection, and auto-fix capabilities. Key features include chat persistence, AI suggestions (Claude), a memory system (LanceDB), and browser automation.
- **The Plan:** A 50-page validation system guiding first-time users through platform features.
- **Bifrost AI Gateway:** Manages multi-provider AI interactions with failover, semantic caching, and load balancing.

### Platform Features
Core features include social functionalities like events, groups, posts, real-time notifications, media galleries, live streaming, marketplaces, and reviews. Business features include Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers for background processing.

### Testing
The platform aims for 95% E2E coverage using Playwright for journeys, WebSockets, security, performance, and the visual editor.

### Production
CI/CD is managed via GitHub Actions. Monitoring is done with Prometheus/Grafana, caching with Redis, error tracking with Sentry, and performance optimization through bundle optimization, lazy loading, and code splitting.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion
- **Other:** Sentry, Playwright, BullMQ