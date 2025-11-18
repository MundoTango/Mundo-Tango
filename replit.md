# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It offers social networking, event management, talent matching, and AI-powered assistance, integrating 7 business systems and 62 specialized AI agents. The platform aims to be the leading digital hub for the tango ecosystem, with market potential in premium services, event monetization, and targeted advertising, emphasizing a **self-sovereign, resilient architecture** with minimal third-party dependencies, optimized npm packages, and enterprise-grade security.

## User Preferences
**Methodology:** MB.MD Protocol v9.0 (see mb.md for complete methodology with Anti-Hallucination Framework)
- Work simultaneously (parallel execution with 3 subagents)
- Work recursively (deep exploration, not surface-level)
- Work critically (rigorous quality, 95-99/100 target)
- **NEW v8.0**: AI Agent Learning (DPO, Curriculum, GEPA, LIMI)
- **NEW v8.0**: 5 Development-First Principles (Security, Error, Performance, Mobile, Accessibility)
- **NEW v9.0**: **Agent SME Training System** - Agents become Subject Matter Experts by learning ALL documentation, code, and industry standards BEFORE implementation

**Never deviate from the handoff plan** - Follow the exact phase sequence

**NEW v9.0 STRATEGIC PIVOT** (Nov 18, 2025): **Self-Sovereign Architecture**
- Multi-platform flagging crisis (Supabase + GitHub) → Self-hosted solutions
- Passport.js OAuth (replacing Supabase Auth)
- n8n workflow automation (replacing browser automation)
- Replit native integrations (Gmail, SendGrid, PostgreSQL)
- Direct API integrations (Facebook Graph API, zero browser automation)
- **Goal**: <20% third-party dependency, 9/10 resilience score

**AGENT SME TRAINING SYSTEM ACTIVATED** (Nov 18, 2025):
- ✅ **4 New Database Tables**: agent_documentation_index, agent_code_knowledge, agent_sme_training, agent_industry_standards
- ✅ **396 Document-Agent Mappings**: All critical agents trained on relevant documentation
- ✅ **17 Industry Standards Loaded**: Voice UX (Alexa/Siri/ChatGPT/Claude), Testing (Playwright/Computer Use), Design (Nielsen Norman/WCAG 2.1 AAA), Quality (ISO 9001/Six Sigma)
- ✅ **9 Critical Agents Trained**: AGENT_0 (CEO), CHIEF_1 (UI/UX), CHIEF_4 (AI Intelligence), EXPERT_11 (Design), AGENT_6 (Routing), AGENT_38 (Orchestration), AGENT_41 (Voice Interface), AGENT_45 (Quality Audit), AGENT_51 (Testing)
- 🎯 **Next**: Create missing Page/Feature/Element agents, build self-healing system, implement Visual Editor

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
-   **Mr. Blue Vibe Coding System (PRODUCTION-READY):** ✅ **Fully Functional Nov 18, 2025** - Natural language code generation using GROQ Llama-3.3-70b with JSON mode (`response_format: { type: 'json_object' }`). Users request bug fixes or features via natural language, system detects intent (95% confidence threshold), targets correct files via route mapping, generates production-ready code with LanceDB semantic context, and streams changes in real-time. Key features: Intent detection via IntentDetector service, file targeting via route-to-file mapping, context-aware code generation with mb.md protocol integration, validation before application. **CRITICAL FIX (Nov 18):** Implemented GROQ JSON mode to eliminate parsing failures - no more "generated-code.txt" fallback, full code content properly extracted.
-   **Mr. Blue Natural Language Automation (PRODUCTION-READY):** ✅ **E2E Validated Nov 18, 2025** - God-level users (role_level ≥ 8) can trigger browser automation via natural language (e.g., "Send FB invitation to Scott Boddye"). System correctly detects intent, extracts recipient name, and executes Playwright-based Facebook Messenger automation. Includes rate limiting (5/day, 1/hour), database tracking, and graceful error handling. **Note:** Evolving to Facebook OAuth + Graph API approach for legitimate API access (see Facebook OAuth Integration below).
-   **Mr. Blue Proactive Error Detection & Learning Retention (PRODUCTION-READY):** ✅ **Phase 5 Complete Nov 18, 2025** - Visual Editor now features autonomous error detection, AI-powered analysis, and self-healing capabilities with learning retention. ProactiveErrorDetector monitors console errors and runtime exceptions (10/min rate limit), automatically submits to ErrorAnalysisAgent (GROQ Llama-3.3-70b), which analyzes root causes and generates fixes with confidence scores. Three-tier response: Auto-fix (≥85% confidence), Manual fix with "Apply" button (50-84%), Escalation to Intelligence Division Chief (<50%). **Learning System**: Feedback endpoint (`/api/mrblue/fix-feedback`) tracks fix effectiveness, updates confidence scores (success +0.10, failure -0.15), stores learning stats in metadata JSONB (successCount/failureCount), enables continuous self-improvement. UI displays error cards with confidence badges, action buttons, and thumbs up/down feedback. Database: `error_patterns` table with `fix_confidence` and `metadata` for learning persistence. WebSocket real-time updates for all actions.
-   **Mr. Blue System 1 - Context Service:** Production LanceDB-powered semantic search providing RAG capabilities, indexing 134,648+ lines of documentation with sub-200ms semantic search, auto-chunking, batch embedding, and similarity scoring.
-   **Mr. Blue Autonomous Agent System:** Full autonomous development using the MB.MD Protocol Engine, an 850+ line GROQ Llama-3.1-70b powered AI Code Generator, a Validator Service, and integration with the Visual Editor for real-time polling, task decomposition, file diffs, validation reports, and approve/reject controls. Includes production safety features like rate limiting, cost caps, and audit logging.
-   **AI Arbitrage Engine:** Intelligent routing system achieving 50-90% cost savings via TaskClassifier, ModelSelector, CascadeExecutor, and CostTracker.
-   **AI Agent Learning Systems:** 4 learning pathways enabling continuous self-improvement: DPO Training, Curriculum Learning, GEPA Self-Evolution, and LIMI Curation.
-   **OpenAI Realtime Voice API:** ChatGPT-style natural voice conversations.
-   **Talent Match AI:** Advanced matching algorithms.
-   **LIFE CEO AI SYSTEM:** Integrates LanceDB for semantic memory and orchestrates 16 specialized AI agents via a Decision Matrix.
-   **Multi-AI Orchestration System:** Integrates OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Groq Llama 3.1, Google Gemini Pro with specialized fallback routing, intelligent load balancing, and a semantic caching layer with LanceDB. Enhanced with queryWithArbitrage() for cost-aware intelligent routing.
-   **Automated Data Scraping System:** Uses static (Cheerio), dynamic (Playwright), and social (Facebook Graph API, Instagram) scraping with AI-powered deduplication.
-   **Facebook OAuth Integration (COMPLETE - Nov 18, 2025):** ✅ Strategic pivot from browser automation to legitimate Facebook OAuth + Graph API. When users authenticate via Supabase Facebook provider, they grant `pages_messaging` permission, enabling MT to send messages via official Facebook Graph API using Page Access Tokens (60-day expiry). **Complete Implementation:** (1) Frontend: `FacebookLoginButton` component with Supabase OAuth flow, (2) Backend: `SupabaseSyncService` syncs Supabase auth.users → MT users table, `FacebookOAuthService` exchanges User Token → Page Token via Graph API, (3) API: `/api/auth/facebook/connect` endpoint for token exchange, `/api/auth/facebook/status` for connection status, (4) Messenger: `FacebookMessengerService` updated to accept `pageAccessToken` parameter (backward compatible with env var), (5) Routes: Facebook OAuth routes registered, `/auth/callback` page added. **Setup Required:** Scott must configure Facebook App + enable Supabase provider (see `docs/FACEBOOK_OAUTH_SETUP_GUIDE.md`). **Architecture:** Self-sovereign (no browser automation, official API only).

**Automation & Workers:** BullMQ queue management with 39 functions across 6 dedicated workers, powered by Redis-based job processing and 50 production-ready algorithms.

### System Design Choices
**Development Methodology:** MB.MD Protocol v4.0 (simultaneously, recursively, critically) with micro-batching, template reuse, context pre-loading, zero documentation mode, main agent parallel work, smart dependency ordering, parallel testing, a memory system, and 10-layer quality gates.

**Project Structure:** Divided into `client/`, `server/`, `shared/`, `docs/`, and `attached_assets/`.

**Production Infrastructure:** CI/CD with GitHub Actions, Prometheus/Grafana monitoring, Redis caching, BullMQ background jobs, robust security, performance optimizations, and reliability features.

**Testing Infrastructure:** Comprehensive Playwright test suites achieving 95% coverage, including E2E, WebSocket, security, performance, and visual editor tests. Employs a Parallel Testing & Bug Fix Workflow.

## External Dependencies

-   **Database:** PostgreSQL (with Drizzle ORM)
-   **Authentication:** Google OAuth, Facebook OAuth (Supabase), JWT
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
-   **Automation:** Playwright (for browser automation)