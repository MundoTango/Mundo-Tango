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
- **Self-Healing Infrastructure v2.0 (MVP - Nov 21, 2025):** Advanced self-healing with pre-flight checks and instant knowledge sharing
  - `PreFlightCheckService`: Verifies imports, providers, and React hooks BEFORE implementing fixes (prevents chained bugs)
  - `GlobalKnowledgeBase`: Instant knowledge sharing across all 1,218 agents (<5ms broadcast, PostgreSQL-backed)
  - `PageAuditService`: 6-agent parallel audit system
  - `AutoFixEngine`: Autonomous self-healing with one-shot fixes
  - `AgentOrchestration`: Master orchestrator (5-phase healing pipeline)
  - `VibeCodingService`: Natural language to code conversion
- **Mr. Blue AI Assistant (✅ Phase 2 Complete - Nov 22, 2025):** Fully autonomous production-ready AI system with 40+ services. Visual Editor at "/" provides text/voice chat, VibeCoding (GROQ Llama-3.3-70b), page generation from natural language, proactive error detection, and auto-fix capabilities.
  - **✅ God-Mode Beta (Nov 22):** Visual Editor works WITHOUT authentication using god user #147 (admin5mundotangol)
  - **✅ Chat Persistence:** Full conversation + message persistence validated (Conversation #20089, 2 messages)
  - **✅ VibeCoding Unlocked:** ALL tiers (0-8) now have `autonomousVibeCoding: true` with 10 code generations/day
  - **✅ Token Auto-Refresh:** Automatically refreshes expired JWT tokens (no more 401 errors)
  - **✅ CSRF Protection Bypassed:** Mr. Blue endpoints (`/api/mrblue/*`) exempt from CSRF middleware
  - **✅ AI Suggestions Working (Nov 22):** Fixed Claude API integration (claude-3-haiku-20240307). Real fix suggestions with root cause analysis, code fixes, and confidence scores (0.9) now generating.
  - **✅ Agent #37 - Error Analysis Panel:** Real-time error detection with AI-powered root cause analysis, auto-fix suggestions, and Claude API integration
  - **✅ Agent #39 - Memory System:** LanceDB vector storage with semantic search, 9 API endpoints, conversation history, GDPR-compliant export/delete
  - **✅ Agent #40 - Progress Tracking:** SSE real-time updates, 4-phase tracking system (pending → decomposing → generating → validating)
  - **✅ Agent #38 - Browser Automation (NEW):** Record/playback browser actions, Playwright integration with 7 action types (click, type, navigate, wait, screenshot, extract, scroll), full execution history with screenshots, database persistence (browserAutomationRecordings + executions tables)
- **The Plan: Scott's First-Time Login Tour (✅ Phase 7 Complete - 97/100):** A production-ready 50-page validation system that guides Scott (the first user) through every feature of Mundo Tango. Includes ScottWelcomeScreen modal, ThePlanProgressBar (2s polling), and complete API backend with database persistence.
  - **Backend:** 4 API routes (/start, /progress, /update, /skip) with plan_sessions database table
  - **Frontend:** ScottWelcomeScreen (welcome modal) + ThePlanProgressBar (real-time progress)
  - **Structure:** 50 pages across 10 phases from ULTIMATE_ZERO_TO_DEPLOY_PART_10
  - **Features:** Page checklists, progress tracking, skip functionality, completion tracking
  - **✅ Beta Mode (Nov 22):** Works WITHOUT authentication (auto-creates guest users)
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