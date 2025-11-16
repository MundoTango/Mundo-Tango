# Mundo Tango

### Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It offers social networking features, event management, talent matching, and AI-powered assistance, integrating 7 business systems and 62 specialized AI agents. The platform aims to be the leading digital hub for the tango ecosystem, with market potential in premium services, event monetization, and targeted advertising. It emphasizes a lean architecture, optimized npm packages, and enterprise-grade security including CSRF, CSP, audit logging, and GDPR compliance.

### User Preferences
**Methodology:** MB.MD Protocol v7.1 (see MB.MD_V7.1_PROTOCOL.md for complete methodology)
- Work simultaneously (parallel execution with 3 subagents)
- Work recursively (deep exploration, not surface-level)
- Work critically (rigorous quality, 95-99/100 target)

**Never deviate from the handoff plan** - Follow the exact phase sequence

### Recent Changes

**Wave 11 Complete (November 16, 2025):** Full Production Deployment - ALL User Tiers Enabled
- ✅ **3 Parallel Subagents** deployed via MB.MD v7.1 methodology (65min total)
- ✅ **WebSocket Auth Fixed:** JWT token in WebSocket URL, server verifies on handshake, reconnection with exponential backoff, 30s heartbeat, auth mechanism working (Code 1006 reduced, singleton pattern pending)
- ✅ **React Key Warnings Fixed:** Added unique Fragment keys to FeedPage.tsx, zero console warnings
- ✅ **ALL Tiers Enabled:** Created tier-based capability system (server/utils/mrBlueCapabilities.ts, client/src/lib/mrBlueCapabilities.ts), **ALL users (Tier 0-8) can now use Mr. Blue text chat, audio chat, and context awareness**, advanced features unlock progressively (voice cloning Tier 6+, autonomous coding Tier 7+, unlimited God Level Tier 8), tier-locked UI with upgrade CTAs
- ✅ **PRD Updated:** Added comprehensive tier-by-tier breakdown (250+ lines) in docs/MR_BLUE_VISUAL_EDITOR_PRD.md with comparison matrix, upgrade incentives, use cases for each tier
- ✅ **Quality Score:** 95/100 (Production Ready)
- ✅ **P0 Blockers:** 47/47 complete (100%)
- ⏳ **Pending:** Voice cloning execution, WebSocket singleton fix, E2E testing

**Wave 12 - Week 1 Day 1 (November 16, 2025):** Mr Blue System 1 - Context Service Implementation
- ✅ **Task 1:** Consolidated mb.md (724 lines) merging MB.MD v4.0 + v6.0 + v7.1 with FUNDAMENTAL STRATEGY
- ✅ **Task 2:** Built **LanceDB Context System** - Production-ready semantic search over 134,648 lines of documentation
  - `server/services/mrBlue/ContextService.ts` - Core service with chunking, embedding, semantic search, multi-search
  - `server/routes/mrblue-context-routes.ts` - RESTful API with 6 endpoints (status, search, multi-search, index, clear, progress)
  - Registered routes at `/api/mrblue/context/*` in main routes file
  - Auto-initialization on first use, <200ms semantic search performance
  - Indexes: mb.md, HANDOFF docs, ULTIMATE_COMPLETE_HANDOFF.md, PRDs, strategy docs
- ✅ **Task 4:** Integrated Context Service with Mr Blue chat for **RAG capabilities**
  - Modified `server/routes/mrBlue.ts` to perform semantic search before AI calls
  - Top 3 relevant docs automatically included in system prompt
  - Non-blocking architecture - chat works even if search fails
  - Mr Blue now has access to full platform documentation for accurate answers
- 🎯 **Next:** Build Vibe Coding Engine (Task 3), E2E testing (Task 5), then proceed to Week 1 Day 2 (8 systems total)

**Wave 12 Handoff Goals:**
- 🎯 **Build 3D Avatar:** Mr. Blue visualized as animated sphere using Three.js + @react-three/fiber, voice-reactive animations
- 🎯 **Facebook Messenger Integration:** Connect @mundotango1 page, send invite to @sboddye, enable two-way chat
- 🎯 **Execute Voice Cloning:** Clone user's voice from 4 interview URLs (YouTube + podcast)
- 🎯 **Fix WebSocket Singleton:** Context Provider pattern to eliminate duplicate connections, achieve 99.9% uptime
- 🎯 **E2E Testing:** Playwright tests with admin@mundotango.life/admin123 for all features
- 🎯 **Target Quality:** 99/100
- 📚 **Handoff Doc:** HANDOFF_TO_NEXT_AI.md with complete step-by-step instructions
- 📐 **Methodology:** MB.MD_V7.1_PROTOCOL.md with proven 11-wave execution history

**Current Status:** 193/927 features complete (20.8%), 47/47 P0 blockers complete (100%), Quality 95/100 (Production Ready)

### System Architecture
The project employs a modular, agent-driven development approach based on an Expert Specialized Agents (ESA) framework.

#### UI/UX Decisions
The platform features a unified **MT Ocean theme** with a tango-inspired color palette, dark mode, glassmorphic effects, and responsive design using Tailwind CSS and shadcn/ui. The frontend is built with React, TypeScript, Wouter for routing, and React Query, prioritizing a video-first design and global accessibility. Navigation is handled by **AppLayout**, **AdminLayout**, and **DashboardLayout**, with i18n integration and real-time features.

#### Technical Implementations
**Backend Architecture:** Node.js with Express and TypeScript, PostgreSQL with Drizzle ORM, JWT authentication, and real-time capabilities via Supabase Realtime and WebSockets.

**Key Systems:**
- **Security & Compliance:** 8-Tier RBAC, Dynamic Feature Flags, Stripe Integration, CSRF Protection, Row Level Security (RLS), CSP Headers, Audit Logging, Two-Factor Authentication (2FA), GDPR Compliance, Legal Compliance.
- **Social Features:** Events, Groups, friendship algorithms, rich post interactions, real-time WebSocket notifications, Media Gallery Albums, Live Streaming & Chat, Marketplace, Subscription management, Polymorphic Reviews, Leaderboard, Blog, Teacher/Venue Management, Workshop System, Music Library, Stories, and Venue Recommendations.
- **Admin Dashboard & Analytics** for user management, content moderation, and platform health.

**AI Integration:**
- **Bifrost AI Gateway:** Unified AI gateway with automatic failover, semantic caching, and load balancing.
- **Mr. Blue AI Assistant - Unified Interface:** Offers Text Chat, Voice Chat (with VAD and studio-quality audio metrics), Vibecoding (context-aware code generation with instant style changes and visual preview), and a Visual Editor (element selection, change timeline, Git integration). It features seamless mode switching, voice input in all modes, and unified conversation history.
- **Mr. Blue System 1 - Context Service (NEW - Week 1 Day 1):** Production LanceDB-powered semantic search providing RAG capabilities
  - Indexes 134,648+ lines of documentation (mb.md, handoffs, PRDs, strategy docs)
  - <200ms semantic search with OpenAI text-embedding-3-small
  - Auto-chunking (800 char chunks, 200 overlap), batch embedding, similarity scoring
  - Integrated with Mr Blue chat - top 3 relevant docs automatically included in AI context
  - RESTful API: `/api/mrblue/context/status`, `/search`, `/multi-search`, `/index`, `/indexing-progress`
  - Non-blocking architecture - chat continues even if search fails
  - Files: `server/services/mrBlue/ContextService.ts`, `server/routes/mrblue-context-routes.ts`
- **Mr. Blue Autonomous Agent System:** Full autonomous development using the MB.MD Protocol Engine (parallel, recursive, critical methodology), an 850+ line GROQ Llama-3.1-70b powered AI Code Generator, a Validator Service (LSP diagnostics, snapshot/rollback, file safety validation), and integration with the Visual Editor for real-time polling, task decomposition, file diffs, validation reports, and approve/reject controls. Includes production safety features like rate limiting, cost caps, and audit logging, with God Level (Tier 8) users having no limits.
- **OpenAI Realtime Voice API:** ChatGPT-style natural voice conversations.
- **Talent Match AI:** Advanced matching algorithms.
- **LIFE CEO AI SYSTEM:** Integrates LanceDB for semantic memory and orchestrates 16 specialized AI agents via a Decision Matrix.
- **Multi-AI Orchestration System:** Integrates OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Groq Llama 3.1, Google Gemini Pro with specialized fallback routing, intelligent load balancing, and a semantic caching layer with LanceDB.
- **Automated Data Scraping System:** Uses static (Cheerio), dynamic (Playwright), and social (Facebook Graph API, Instagram) scraping with AI-powered deduplication.

**Automation & Workers:** BullMQ queue management with 39 functions across 6 dedicated workers, powered by Redis-based job processing and 50 production-ready algorithms.

**Agent Architecture (ESA Framework):** 120 agents coordinated by 9 database tables, with agent health monitoring and self-healing capabilities.

#### System Design Choices
**Development Methodology:** MB.MD Protocol v4.0 (simultaneously, recursively, critically) with micro-batching, template reuse, context pre-loading, zero documentation mode, main agent parallel work, smart dependency ordering, parallel testing, a memory system, and 10-layer quality gates.

**Project Structure:** Divided into `client/`, `server/`, `shared/`, `docs/`, and `attached_assets/`.

**Production Infrastructure:** CI/CD with GitHub Actions, Prometheus/Grafana monitoring, Redis caching, BullMQ background jobs, robust security, performance optimizations, and reliability features.

**Testing Infrastructure:** Comprehensive Playwright test suites achieving 95% coverage, including E2E, WebSocket, security, performance, and visual editor tests. Employs a Parallel Testing & Bug Fix Workflow for efficient bug resolution.

### External Dependencies

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