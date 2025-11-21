# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It offers a resilient, self-sovereign architecture with enterprise-grade security, integrating 7 business systems and 1,218 specialized AI agents. The platform's business model includes premium services, event monetization, and targeted advertising, aiming to capture significant market potential within the global dance community.

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
The platform utilizes the "MT Ocean Theme," inspired by tango aesthetics with ocean blues and warm accents. It supports dark mode via Tailwind CSS and builds components using `shadcn/ui` and Radix UI. Icons are sourced from Lucide React and React Icons, with i18n support for 68 languages via `i18next`. Routing is handled by Wouter, and layouts are structured into `AppLayout` (public), `DashboardLayout` (authenticated), and `AdminLayout` (administrative).

### Backend
The backend is built with Express and TypeScript, using PostgreSQL (Neon) as the database with Drizzle ORM. `shared/schema.ts` serves as the single source of truth for the database schema, and `server/storage.ts` provides a CRUD interface. Routes are modularized, and authentication is managed via JWT (httpOnly cookies) and Google/Facebook OAuth, featuring an 8-tier Role-Based Access Control (RBAC) system. Database migrations are automated with `npm run db:push`.

### AI Systems
A universal agent ecosystem comprises 1,218 agents, including an Agent Scanner, SME Training System, DPO Training, Curriculum Learning, and GEPA Self-Evolution.
- **Self-Healing Infrastructure:** Features `PageAuditService` (6-agent parallel audit), `AutoFixEngine`, `AgentOrchestration`, and `VibeCodingService` (natural language to code).
- **Mr. Blue AI Assistant:** Provides text/voice chat, VibeCoding (GROQ Llama-3.3-70b), a visual editor, page generation from natural language, proactive error detection, and auto-fix capabilities.
- **The Plan: Scott's First-Time Login Tour:** A 50-page validation system guiding new users.
- **Bifrost AI Gateway:** Manages multi-provider AI interactions (OpenAI, Anthropic, Groq, Google) with automatic failover, semantic caching, and load balancing.

### Platform Features
- **Social:** Events, groups, friendship, posts, real-time notifications (WebSocket), media gallery, live streaming, marketplace, subscriptions, reviews, leaderboard, blog, teacher/venue management, workshops, music library, stories, venue recommendations.
- **Business:** Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers for background processing.

### Project Structure
The project is organized into `client/` for the React frontend, `server/` for the Express backend, `shared/` for shared types/schemas, `docs/` for documentation, and `attached_assets/` for media files.

### Testing
The platform aims for 95% E2E coverage using Playwright, testing journeys, WebSockets, security, performance, and the visual editor.

### Production
CI/CD is managed via GitHub Actions, monitoring with Prometheus/Grafana, caching with Redis, error tracking with Sentry, and performance optimization through bundle optimization, lazy loading, and code splitting.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion
- **Other:** Sentry, Playwright, BullMQ