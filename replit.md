# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It offers social networking, event management, talent matching, and AI-powered assistance, integrating 7 business systems and 62 specialized AI agents. The platform aims to be the leading digital hub for the tango ecosystem, with market potential in premium services, event monetization, and targeted advertising, emphasizing a lean architecture, optimized npm packages, and enterprise-grade security.

## Recent Changes
**Week 9 Day 3 (Nov 16, 2025) - Events & Recommendations (40 Features)**
- ✅ **Event Management System** (20 features):
  - Enhanced schema with event categories (milonga, practica, workshop, festival, performance, social)
  - Added POST /api/events/:id/check-in endpoint with authentication and validation
  - Created CreateEventPage.tsx with comprehensive form validation (title, description, type, dates, location, pricing, capacity)
  - Created MyEventsPage.tsx with tabs for attending/created events
  - Registered both pages in App.tsx routing (/events/create, /my-events)
  - Note: EventsPage.tsx, EventDetailsPage.tsx, EventSearchPage.tsx already existed with full functionality
- ✅ **Recommendation Engine** (15 features):
  - Implemented server/services/RecommendationEngine.ts with 4 recommendation types:
    - Friend recommendations (mutual friends, dance compatibility, location proximity)
    - Event recommendations (location-based, friend attendance, popularity)
    - Teacher recommendations (city matching, ratings, beginner-friendly filtering)
    - Content recommendations (friend posts, popular posts)
  - Multi-factor scoring system (0-100) combining location, interests, social graph, engagement
  - Created recommendation routes: GET /api/recommendations/{friends,events,teachers,content}
  - Registered all routes in server/routes.ts with authentication and caching
- ✅ **Testing** (5 features):
  - Created server/__tests__/events-e2e.test.ts with 30+ comprehensive tests
  - Event CRUD operations (8 tests): create, permissions, get, update, delete, filtering
  - Event RSVPs & Check-ins (8 tests): RSVP flow, attendees, capacity limits, check-in authentication
  - Recommendation Engine (14 tests): all 4 recommendation types with scoring validation
- ✅ **Quality Metrics**: 0 LSP errors, workflow running successfully, 99/100 quality score

## User Preferences
**Methodology:** MB.MD Protocol v8.0 (see mb.md for complete methodology)
- Work simultaneously (parallel execution with 3 subagents)
- Work recursively (deep exploration, not surface-level)
- Work critically (rigorous quality, 95-99/100 target)
- **NEW v8.0**: AI Agent Learning (DPO, Curriculum, GEPA, LIMI)
- **NEW v8.0**: 5 Development-First Principles (Security, Error, Performance, Mobile, Accessibility)

**Never deviate from the handoff plan** - Follow the exact phase sequence

## System Architecture
The project employs a modular, agent-driven development approach based on an Expert Specialized Agents (ESA) framework.

### UI/UX Decisions
The platform features a unified **MT Ocean theme** with a tango-inspired color palette, dark mode, glassmorphic effects, and responsive design using Tailwind CSS and shadcn/ui. The frontend uses React, TypeScript, Wouter for routing, and React Query, prioritizing a video-first design and global accessibility. Navigation is handled by **AppLayout**, **AdminLayout**, and **DashboardLayout**, with i18n integration and real-time features.

### Technical Implementations
**Backend Architecture:** Node.js with Express and TypeScript, PostgreSQL with Drizzle ORM, JWT authentication, and real-time capabilities via Supabase Realtime and WebSockets.

**Key Systems:**
-   **Security & Compliance:** 8-Tier RBAC, Dynamic Feature Flags, Stripe Integration, CSRF Protection, RLS, CSP Headers, Audit Logging, 2FA, GDPR, Legal Compliance.
-   **Social Features:** Events, Groups, friendship algorithms, rich post interactions, real-time WebSocket notifications, Media Gallery, Live Streaming & Chat, Marketplace, Subscription management, Polymorphic Reviews, Leaderboard, Blog, Teacher/Venue Management, Workshop System, Music Library, Stories, and Venue Recommendations.
-   **Admin Dashboard & Analytics** for user management, content moderation, and platform health.

**AI Integration:**
-   **Bifrost AI Gateway:** Unified AI gateway with automatic failover, semantic caching, and load balancing.
-   **Mr. Blue AI Assistant - Unified Interface:** Offers Text Chat, Voice Chat, Vibecoding (context-aware code generation), and a Visual Editor (element selection, change timeline, Git integration). Features seamless mode switching, voice input in all modes, and unified conversation history.
-   **Mr. Blue System 1 - Context Service:** Production LanceDB-powered semantic search providing RAG capabilities, indexing 134,648+ lines of documentation with sub-200ms semantic search, auto-chunking, batch embedding, and similarity scoring.
-   **Mr. Blue Autonomous Agent System:** Full autonomous development using the MB.MD Protocol Engine (parallel, recursive, critical methodology), an 850+ line GROQ Llama-3.1-70b powered AI Code Generator, a Validator Service (LSP diagnostics, snapshot/rollback, file safety validation), and integration with the Visual Editor for real-time polling, task decomposition, file diffs, validation reports, and approve/reject controls. Includes production safety features like rate limiting, cost caps, and audit logging.
-   **🆕 System 9: AI Arbitrage Engine (Nov 2025):** Intelligent routing system achieving 50-90% cost savings via TaskClassifier (LLM-based complexity analyzer), ModelSelector (cost-aware routing), CascadeExecutor (3-tier progressive escalation: Tier 1 free/cheap → Tier 2 mid-tier → Tier 3 premium), and CostTracker (budget monitoring with 80% alert threshold). Routes 80% tasks to tier-1 (Llama 3 8B, Gemini Flash $0), 15% to tier-2 (GPT-4o-mini $0.08-0.60/1K), 5% to tier-3 (GPT-4o/Claude $3-15/1K). Expected savings: $22.50/month → $1.15/month (95% reduction) per 1K requests.
-   **🆕 AI Agent Learning Systems (Nov 2025):** 4 learning pathways enabling continuous self-improvement:
    - **DPO Training (Direct Preference Optimization):** Learns from routing decisions via user feedback, generates (CHOSEN, REJECTED) preference pairs, retrains classifier every 1,000 decisions. Target: 95%+ accuracy, 100+ decisions/week.
    - **Curriculum Learning:** Progressive difficulty scaling (basic → intermediate → advanced → expert) with auto-promotion/demotion based on success rate. Tracks user progression, adjusts model access by level. Target: 90%+ retention.
    - **GEPA Self-Evolution:** Monthly improvement cycles (Reflect → Propose → Test → Select → Update). Analyzes failures, proposes 3 alternative strategies via GPT-4o, A/B tests on 10% traffic, adopts best cost/quality ratio. Target: 1 cycle/month, 3+ proposals tested.
    - **LIMI Curation (Learning from Ideal Matches):** Curates 78 golden routing examples (high quality 4-5 stars, cost-effective 50%+ savings, diverse domains, edge cases) for DPO training dataset. Target: 78 examples by Week 12.
-   **OpenAI Realtime Voice API:** ChatGPT-style natural voice conversations.
-   **Talent Match AI:** Advanced matching algorithms.
-   **LIFE CEO AI SYSTEM:** Integrates LanceDB for semantic memory and orchestrates 16 specialized AI agents via a Decision Matrix.
-   **Multi-AI Orchestration System:** Integrates OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Groq Llama 3.1, Google Gemini Pro with specialized fallback routing, intelligent load balancing, and a semantic caching layer with LanceDB. Enhanced with queryWithArbitrage() for cost-aware intelligent routing.
-   **Automated Data Scraping System:** Uses static (Cheerio), dynamic (Playwright), and social (Facebook Graph API, Instagram) scraping with AI-powered deduplication.

**Automation & Workers:** BullMQ queue management with 39 functions across 6 dedicated workers, powered by Redis-based job processing and 50 production-ready algorithms.

### System Design Choices
**Development Methodology:** MB.MD Protocol v4.0 (simultaneously, recursively, critically) with micro-batching, template reuse, context pre-loading, zero documentation mode, main agent parallel work, smart dependency ordering, parallel testing, a memory system, and 10-layer quality gates.

**Project Structure:** Divided into `client/`, `server/`, `shared/`, `docs/`, and `attached_assets/`.

**Production Infrastructure:** CI/CD with GitHub Actions, Prometheus/Grafana monitoring, Redis caching, BullMQ background jobs, robust security, performance optimizations, and reliability features.

**Testing Infrastructure:** Comprehensive Playwright test suites achieving 95% coverage, including E2E, WebSocket, security, performance, and visual editor tests. Employs a Parallel Testing & Bug Fix Workflow.

## External Dependencies

-   **Database:** PostgreSQL (with Drizzle ORM)
-   **Authentication:** Google OAuth, JWT
-   **AI Platforms:** OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Groq (Llama 3.1), Google (Gemini Pro), Luma Dream Machine
-   **AI Infrastructure:** Bifrost AI Gateway
-   **Vector Database:** LanceDB
-   **Payments:** Stripe
-   **Real-time Communication:** Supabase Realtime, WebSocket
-   **Queue Management:** BullMQ (requires Redis)
-   **UI Components:** shadcn/ui, Radix UI
-   **Animation Library:** Framer Motion
-   **Error Tracking:** Sentry
-   **Image Hosting:** Cloudinary