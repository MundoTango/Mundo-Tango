# Mundo Tango

### Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It offers comprehensive social networking features, event management tools, talent matching, and AI-powered personal assistance. The platform integrates 7 business systems and 62 specialized AI agents, aiming to become the leading digital hub for the tango ecosystem. It has significant market potential in premium services, event monetization, targeted advertising, and plans for international scaling. The project prioritizes a lean architecture, optimized npm packages for efficiency and security, and enterprise-grade security features including CSRF protection, CSP headers, audit logging, and full GDPR compliance.

### User Preferences
**Methodology:** MB.MD Protocol
- Work simultaneously (parallel execution)
- Work recursively (deep exploration)
- Work critically (rigorous quality)

**Never deviate from the handoff plan** - Follow the exact phase sequence

### System Architecture

The project utilizes a modular, agent-driven development approach based on an Expert Specialized Agents (ESA) framework.

#### UI/UX Decisions
The platform features a unified **MT Ocean theme** across all pages, characterized by a tango-inspired color palette, dark mode, glassmorphic effects, and responsive design using Tailwind CSS and shadcn/ui components. The design system follows a 3-layer approach (Primitive → Semantic → Component) for theme customization. The frontend is built with React, TypeScript, Wouter for routing, and React Query, prioritizing a video-first design and global accessibility. Navigation is managed by **AppLayout**, **AdminLayout**, and a new **DashboardLayout**, all styled with the MT Ocean theme, including turquoise gradients, glassmorphic elements, and ocean-themed interactive components. The system includes full i18n integration and real-time features with 30-second polling for notifications and messages.

#### Technical Implementations

**Backend Architecture:** Node.js with Express and TypeScript, PostgreSQL with Drizzle ORM, JWT-based authentication, and real-time capabilities via Supabase Realtime and WebSockets.

**Key Systems:**
-   **8-Tier RBAC System** and **Dynamic Feature Flag System**.
-   **Stripe Integration** for dynamic pricing and subscriptions.
-   **Comprehensive Social Features:** Events, Groups, friendship algorithms, rich post interactions (reactions, shares, reports, saves, threaded comments, @mentions, editing with history), and real-time WebSocket notifications.
-   **Media Gallery Albums System:** Complete album management with CRUD operations, media organization, lightbox viewer, and privacy controls.
-   **Live Streaming & Chat:** Real-time chat via WebSocket, message history, viewer count, and live broadcasting capabilities.
-   **Marketplace & Content Systems:** Housing, Live Streaming, Marketplace, Subscription management, Polymorphic Reviews, Media Gallery, Leaderboard, Blog, Teacher/Venue Management, Workshop System, Music Library, Stories, and Venue Recommendations.
-   **Admin Dashboard & Analytics** for user management, content moderation, and platform health.
-   **P0 Workflows:** Founder Approval, Safety Review, and AI Support with human escalation.

**AI Integration:**
-   **Bifrost AI Gateway:** Unified AI gateway with automatic failover, semantic caching, and load balancing.
-   **Mr. Blue AI Assistant:** Context-aware conversational intelligence, breadcrumb tracking, and predictive assistance using Groq SDK.
-   **OpenAI Realtime Voice API:** ChatGPT-style natural voice conversations.
-   **Unified Voice Interface:** Combines voice and text chat.
-   **Instant Visual Feedback:** Enhanced iframe injector with `APPLY_CHANGE` and `UNDO_CHANGE` commands.
-   **Visual Editor System (Replit-style):** Development environment with live MT page preview, tabbed interface, element selection, context-aware Mr. Blue AI code generation, and Git integration.
-   **Talent Match AI:** Advanced matching algorithms for dancers/teachers.
-   **LIFE CEO AI SYSTEM:** Integrates LanceDB for semantic memory (vector database, embeddings, similarity search) and orchestrates 16 specialized AI agents via a Decision Matrix for intelligent routing and multi-agent collaboration, presented in a Life CEO Dashboard UI.

**Multi-AI Orchestration System:**
-   Integrates 5 AI platforms: OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Groq Llama 3.1, Google Gemini Pro, with specialized fallback routing.
-   Features intelligent load balancing, a semantic caching layer with LanceDB, a unified API gateway, and real-time monitoring.
-   Supported by 15 AI Intelligence Services and over 50 API endpoints covering orchestration, intelligence operations, learning, memory, quality, knowledge, collaboration, caching, and agent management.
-   Utilizes 16 intelligence database tables for agent capabilities, memory, collaboration, learning, quality scores, knowledge graphs, cache entries, and platform metrics.

**Automation & Workers:** BullMQ queue management with 39 functions across 6 dedicated workers, powered by Redis-based job processing and 50 production-ready algorithms.

**Agent Architecture (ESA Framework):** 120 agents (105 ESA + 8 Mr. Blue + 5 Scraping + component agents) coordinated by 9 database tables, with agent health monitoring and self-healing capabilities.

**Automated Data Scraping System:**
-   **Agent #115 (Orchestrator):** Master workflow coordinator managing 200 global tango community sources.
-   **Agent #116 (Static Scraper):** Cheerio-based HTML/CSS extraction.
-   **Agent #117 (JS Scraper):** Playwright headless browser for dynamic sites.
-   **Agent #118 (Social Scraper):** Facebook Graph API and Instagram integration.
-   **Agent #119 (Deduplicator):** AI-powered semantic matching using OpenAI embeddings.
-   **Coverage:** 92 cities across 43 countries with expected 500-1000 events per automated run.
-   **Admin Control:** Manual trigger via `/api/admin/trigger-scraping` endpoint (super_admin only).

#### System Design Choices

**Development Methodology:** MB.MD Protocol (simultaneously, recursively, critically) with wave-based parallel agent execution, continuous integration, agent state tracking, and automated quality gates.

**Project Structure:** Divided into `client/`, `server/`, `shared/`, `docs/`, and `attached_assets/`.

**Production Infrastructure:** CI/CD with GitHub Actions, Prometheus/Grafana monitoring, Redis caching, BullMQ background jobs, robust security measures (CSP, rate limiting, OWASP Top 10 compliance), performance optimizations (compression, code splitting, PostgreSQL indexing), and reliability features (automated backups, zero-downtime deployments).

**Testing Infrastructure:** Comprehensive Playwright test suites achieving **95% coverage**, including E2E critical tests (authentication, payments, admin), WebSocket real-time tests, Media Gallery Album tests, theme persistence tests, integration tests (API validation), security tests (OWASP Top 10), performance tests (k6 load testing), and visual editor tests, totaling approximately 1,500+ lines across 12 suites.

**Parallel Testing & Bug Fix Workflow (MB.MD Protocol):**
- **Continue-on-Bug Testing:** Playwright tests record bugs but continue testing remaining features, maximizing coverage in single pass
- **Parallel Bug Fixing:** While tests run, dedicated agents fix discovered bugs simultaneously
- **Focused Regression Tests:** After fixes, targeted tests verify specific bug resolutions without full re-run
- **Multi-Agent Orchestration:** Testing agent discovers → Logging agent documents → Fixing agent repairs → Verification agent validates
- **Efficiency Gains:** 3-5x faster bug resolution through parallel workflows vs sequential test-fix-retest cycles

#### Security & Compliance Features
- **CSRF Protection** - Cookie-based double-submit pattern.
- **CSP Headers** - Environment-aware Content Security Policy (development: permissive, production: strict nonce-based).
- **Audit Logging** - Comprehensive security event tracking in database.
- **GDPR Compliance UI** - 4 new pages: Security Settings, Privacy & Data, Data Export, Account Deletion.
- **Database Tables** - securityAuditLogs, dataExportRequests, userPrivacySettings.
- **API Endpoints** - 8 new endpoints for security and privacy management.
- **E2E Testing** - 15 comprehensive security feature tests.
- **Documentation** - Complete security features guide (SECURITY_FEATURES.md).

### External Dependencies

-   **Database:** PostgreSQL (with Drizzle ORM)
-   **Authentication:** Google OAuth, JWT
-   **AI Platforms:** OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Groq (Llama 3.1), Google (Gemini Pro), Luma Dream Machine
-   **AI Infrastructure:** Bifrost AI Gateway
-   **Vector Database:** LanceDB
-   **Payments:** Stripe
-   **Real-time Communication:** Supabase Realtime, WebSocket
-   **Deployment & Hosting:** Vercel, Railway, Supabase
-   **Queue Management:** BullMQ (requires Redis)
-   **UI Components:** shadcn/ui, Radix UI
-   **Animation Library:** Framer Motion
-   **Error Tracking:** Sentry
-   **Image Hosting:** Cloudinary