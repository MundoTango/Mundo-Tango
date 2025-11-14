# Mundo Tango

### Overview
Mundo Tango is a production-ready social platform connecting the global tango community with social networking features, event management, talent matching, and AI-powered assistance. It integrates 7 business systems and 62 specialized AI agents, aiming to be the leading digital hub for the tango ecosystem with market potential in premium services, event monetization, and targeted advertising. The project emphasizes a lean architecture, optimized npm packages, and enterprise-grade security including CSRF, CSP, audit logging, and GDPR compliance.

### User Preferences
**Methodology:** MB.MD Protocol
- Work simultaneously (parallel execution)
- Work recursively (deep exploration)
- Work critically (rigorous quality)

**Never deviate from the handoff plan** - Follow the exact phase sequence

### System Architecture
The project employs a modular, agent-driven development approach based on an Expert Specialized Agents (ESA) framework.

#### UI/UX Decisions
The platform features a unified **MT Ocean theme** with a tango-inspired color palette, dark mode, glassmorphic effects, and responsive design using Tailwind CSS and shadcn/ui. It uses a 3-layer design system (Primitive → Semantic → Component). The frontend is built with React, TypeScript, Wouter for routing, and React Query, prioritizing a video-first design and global accessibility. Navigation is handled by **AppLayout**, **AdminLayout**, and **DashboardLayout**, all adhering to the MT Ocean theme, with i18n integration and real-time features.

#### Technical Implementations
**Backend Architecture:** Node.js with Express and TypeScript, PostgreSQL with Drizzle ORM, JWT authentication, and real-time capabilities via Supabase Realtime and WebSockets.

**Key Systems:**
-   **8-Tier RBAC System** and **Dynamic Feature Flag System**.
-   **Stripe Integration** for dynamic pricing and subscriptions.
-   **Comprehensive Social Features:** Events, Groups, friendship algorithms, rich post interactions, and real-time WebSocket notifications.
-   **Media Gallery Albums System:** Complete album management with CRUD, media organization, lightbox, and privacy controls.
-   **Live Streaming & Chat:** Real-time chat, message history, viewer count, and live broadcasting.
-   **Marketplace & Content Systems:** Housing, Live Streaming, Marketplace, Subscription management, Polymorphic Reviews, Media Gallery, Leaderboard, Blog, Teacher/Venue Management, Workshop System, Music Library, Stories, and Venue Recommendations.
-   **Admin Dashboard & Analytics** for user management, content moderation, and platform health.
-   **Security & Compliance:** CSRF Protection, Tier Enforcement System, Row Level Security (RLS), CSP Headers, Audit Logging, Two-Factor Authentication (2FA), GDPR Compliance (data export, privacy settings, account deletion), Legal Compliance (Code of Conduct acceptance tracking).

**AI Integration:**
-   **Bifrost AI Gateway:** Unified AI gateway with automatic failover, semantic caching, and load balancing.
-   **Mr. Blue AI Assistant:** Context-aware conversational intelligence, breadcrumb tracking, and predictive assistance.
-   **OpenAI Realtime Voice API:** ChatGPT-style natural voice conversations.
-   **Unified Voice Interface:** Combines voice and text chat.
-   **Instant Visual Feedback:** Enhanced iframe injector with `APPLY_CHANGE` and `UNDO_CHANGE` commands.
-   **Visual Editor System (Replit-style):** Development environment with live MT page preview, tabbed interface, element selection, context-aware Mr. Blue AI code generation, and Git integration.
-   **Talent Match AI:** Advanced matching algorithms for dancers/teachers.
-   **LIFE CEO AI SYSTEM:** Integrates LanceDB for semantic memory and orchestrates 16 specialized AI agents via a Decision Matrix for intelligent routing and multi-agent collaboration, presented in a Life CEO Dashboard UI.
-   **Multi-AI Orchestration System:** Integrates OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Groq Llama 3.1, Google Gemini Pro with specialized fallback routing, intelligent load balancing, and a semantic caching layer with LanceDB.
-   **Automated Data Scraping System:** Orchestrated by Agent #115, using static (Cheerio), dynamic (Playwright), and social (Facebook Graph API, Instagram) scraping, with AI-powered deduplication for global tango community sources.

**Automation & Workers:** BullMQ queue management with 39 functions across 6 dedicated workers, powered by Redis-based job processing and 50 production-ready algorithms.

**Agent Architecture (ESA Framework):** 120 agents (105 ESA + 8 Mr. Blue + 5 Scraping + component agents) coordinated by 9 database tables, with agent health monitoring and self-healing capabilities.

#### System Design Choices
**Development Methodology:** MB.MD Protocol v2.0 (simultaneously, recursively, critically) with wave-based parallel execution, a continue-on-bug strategy, and subagent delegation for efficiency.

**Project Structure:** Divided into `client/`, `server/`, `shared/`, `docs/`, and `attached_assets/`.

**Production Infrastructure:** CI/CD with GitHub Actions, Prometheus/Grafana monitoring, Redis caching, BullMQ background jobs, robust security measures (CSP, rate limiting, OWASP Top 10 compliance), performance optimizations, and reliability features.

**Testing Infrastructure:** Comprehensive Playwright test suites achieving **95% coverage**, including E2E critical tests, WebSocket real-time tests, security tests, performance tests, and visual editor tests. A Parallel Testing & Bug Fix Workflow (MB.MD Protocol v2.0) uses continue-on-bug testing, parallel bug fixing, focused regression tests, and multi-agent orchestration for efficient bug resolution.

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