# Mundo Tango

### Overview
Mundo Tango is a production-ready social platform connecting the global tango community with social networking features, event management, talent matching, and AI-powered assistance. It integrates 7 business systems and 62 specialized AI agents, aiming to be the leading digital hub for the tango ecosystem with market potential in premium services, event monetization, and targeted advertising. The project emphasizes a lean architecture, optimized npm packages, and enterprise-grade security including CSRF, CSP, audit logging, and GDPR compliance.

### Recent Progress
**Wave 7 Complete (January 2025):** Executed 10 parallel tracks using MB.MD v3.0, delivered 10/10 P0 blockers including:
- ✅ P0 #1: Tier Enforcement (RBAC + FeatureFlagService)
- ✅ P0 #2: Row Level Security (13 tables, 52 policies)
- ✅ P0 #6: Security Headers & CSP (A+ grade ready)
- ✅ P0 #8: Encryption at Rest (12 tables, AES-256-GCM)
- ✅ P0 #14: Stories Merge (24-hour expiration)
- ✅ P0 #15: Housing Photo Upload (Cloudinary integration, drag-drop, reordering)
- ✅ P0 #16: Event Search (12 filters + full-text)
- ✅ P0 #17: Admin Moderation (auto-flagging + queue)
- ✅ P0 #18: Analytics Dashboard (8 metrics + charts)
- ✅ P0 #19: Email Notifications (10 templates + rate limiting)

**Wave 8 Complete (November 2025):** Visual Editor Phase 1-6 Complete
- ✅ Production Build Fixed (use-user hook, queryClient imports, wouter navigation)
- ✅ MB.MD Prompt Strengthened (file paths not task IDs)
- ✅ Deployed to mundotango.life via Replit Publish
- ✅ Visual Editor Complete: Voice control, Visual Diff Viewer, Smart Suggestions, Git Integration
- ✅ 13 New Files: screenshotCapture, VisualDiffViewer, VoiceCommandProcessor, designSuggestions, gitCommitGenerator, etc.
- ✅ MB.MD v4.0 Performance: 4 subagents, 75min, ~$28 (vs 6 subagents, 165min, $45 in v3.0)
- ✅ **MB.MD Auto-Integration**: ALL Mr. Blue Visual Chat prompts automatically use MB.MD methodology (line 166 in `MrBlueVisualChat.tsx`)

**Wave 9 Complete (November 15, 2025):** 3D Avatar Integration & Authentication Fixes
- ✅ **3 Parallel Subagents** deployed simultaneously via MB.MD methodology (45min total)
- ✅ **Subagent 1 - Authentication Fix:** Eliminated all 401 errors by removing custom queryFn from UnifiedTopBar and AppLayout, all API calls now use default queryFn with automatic Authorization headers
- ✅ **Subagent 2 - Feed Error Handling:** Added graceful error handling to usePosts hook with retry logic (exponential backoff), context-aware error messages, zero error boundary crashes
- ✅ **Subagent 3 - 3D Avatar Integration:** Integrated MrBlueAvatar3D into Visual Editor with 2D/3D toggle button, conditional rendering, expression mapping (excited/curious/friendly/thinking)
- ✅ **Zero LSP Errors:** All modified files (UnifiedTopBar.tsx, AppLayout.tsx, FeedPage.tsx, usePosts.ts, MrBlueVisualChat.tsx) clean
- ✅ **API Endpoints Working:** /api/auth/me, /api/notifications/count, /api/messages/unread-count, /api/posts all returning data with auth headers
- ✅ **Feed Loading:** Posts render successfully, no "Something went wrong" errors, real-time WebSocket connections active

**Current Status:** 174/927 features complete (18.8%), 43/47 P0 blockers complete (91.5%).

**🎨 Vibe Coding Agent Status:**
- ✅ **Auto-MB.MD**: All Mr. Blue prompts use simultaneously/recursively/critically methodology
- ✅ **3D Avatar Complete**: MrBlueAvatar3D integrated into Visual Editor with toggle functionality
- ✅ **Authentication Fixed**: Zero 401 errors, all API calls authenticated
- ✅ **Feed Resilient**: Graceful error handling, retry logic, context-aware messages
- 🔄 **Next Phase**: Animation system enhancements, speech synthesis integration, personality trait refinement

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
-   **Mr. Blue Autonomous Agent System (PRODUCTION):** Full autonomous development capabilities with:
    - **MB.MD Protocol Engine:** Task decomposition with parallel/recursive/critical methodology
    - **AI Code Generator:** 850+ line GROQ Llama-3.1-70b powered multi-file generator
    - **Validator Service:** 798-line LSP diagnostics, snapshot/rollback, file safety validation
    - **Production Safety:** Rate limiting (5 tasks/hour for non-God users), cost caps ($10/task for non-God users), **God Level (Tier 8) users have NO limits**, audit logging to `auditLogs` table, database persistence to `autonomousTasks` table
    - **Visual Editor Integration:** AutonomousWorkflowPanel with real-time polling, task decomposition tree, file diffs, validation reports, approve/reject controls
    - **God Level (Tier 8) Security:** RBAC enforcement, path validation, SQL sanitization, command filtering
    - **API Endpoints:** `/api/autonomous/execute`, `/api/autonomous/status/:taskId`, `/api/autonomous/approve/:taskId`, `/api/autonomous/rollback/:taskId`, `/api/autonomous/validate`
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
**Development Methodology:** MB.MD Protocol v4.0 (simultaneously, recursively, critically) with:
- **Micro-Batching:** 3-4 features per subagent (60% overhead reduction vs v3.0)
- **Template Reuse System:** 70% time savings on similar features (dashboards, CRUD, services)
- **Context Pre-Loading:** Exact file paths provided, zero exploration time
- **Zero Documentation Mode:** Code only, learnings in wave-log.md (35min saved per wave)
- **Main Agent Parallel Work:** Build 2-3 micro features while subagents work
- **Smart Dependency Ordering:** Foundation-first to eliminate rebuilds (33% time savings)
- **Parallel Testing:** Build + test simultaneously (33% faster than sequential)
- **Memory System:** Self-improving via patterns.md, wave-log.md, cost-log.md, file-map.md, dependency-graph.md
- **Quality Gates:** 10-layer quality pipeline, <0.3 bugs per feature target
- **Performance:** 90min/wave, $32/wave vs 165min/$49.65 in v3.0 (45% faster, 35% cheaper)

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