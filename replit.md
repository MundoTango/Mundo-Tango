# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It offers comprehensive social networking features, event management, talent matching, and advanced AI-powered assistance. The platform integrates 7 business systems and 62 specialized AI agents, aiming to become the leading digital hub for the tango ecosystem. Its business model targets premium services, event monetization, and targeted advertising, built on a self-sovereign, resilient architecture with minimal third-party dependencies, optimized npm packages, and enterprise-grade security.

## User Preferences
**Methodology:** MB.MD Protocol v9.2 (see mb.md for complete methodology with Free Energy Principle + Organoid Intelligence)
- Work simultaneously (parallel execution with 3 subagents)
- Work recursively (deep exploration, not surface-level)
- Work critically (rigorous quality, 95-99/100 target)
- **NEW v8.0**: AI Agent Learning (DPO, Curriculum, GEPA, LIMI)
- **NEW v8.0**: 5 Development-First Principles (Security, Error, Performance, Mobile, Accessibility)
- **NEW v9.0**: **Agent SME Training System** - Agents become Subject Matter Experts by learning ALL documentation, code, and industry standards BEFORE implementation

**Never deviate from the handoff plan** - Follow the exact phase sequence

## System Architecture
The project utilizes a modular, agent-driven development approach based on an Expert Specialized Agents (ESA) framework, emphasizing a self-sovereign architecture.

### UI/UX Decisions
The platform features a unified **MT Ocean theme** with a tango-inspired color palette, dark mode, glassmorphic effects, and responsive design using Tailwind CSS and shadcn/ui. The frontend is built with React, TypeScript, Wouter for routing, and React Query, prioritizing a video-first design and global accessibility. Navigation is managed by **AppLayout**, **AdminLayout**, and **DashboardLayout**, including i18n integration and real-time features.

### Technical Implementations
**Backend Architecture:** Node.js with Express and TypeScript, PostgreSQL with Drizzle ORM, JWT authentication, and real-time capabilities via Supabase Realtime and WebSockets.

**Authentication & Access Patterns (MB.MD Protocol v9.2):**
-   **Visual Editor Public Access:** Visual Editor routes (`/`, `/mrblue/visual-editor`, `/admin/visual-editor`) are PUBLIC and accessible without authentication. Implements auth-optional UX where users can view/explore Visual Editor without login, with degraded functionality (view-only) for unauthenticated users.
-   **401 Error Handling:** Global query error handler (`client/src/lib/queryClient.ts`) intelligently handles 401 Unauthorized errors by:
    -   Bypassing login redirect for public paths (Visual Editor, login, register)
    -   Gracefully degrading UX for unauthenticated access
    -   Only redirecting to `/login` for protected routes requiring authentication
-   **MB.MD Protocol v9.2 Integration:** Implements Free Energy Principle (Expected Free Energy calculation), Active Inference (proactive error detection), and Bayesian Belief Updating (user preference modeling) for optimal auth UX.
-   **Design Philosophy:** Follows "auth-optional" pattern where public features are accessible without forced authentication, reducing friction while maintaining security for protected features. Similar UX pattern as Mr. Blue Chat (public access with degraded features).

**Key Systems:**
-   **Security & Compliance:** 8-Tier RBAC, Dynamic Feature Flags, RLS, CSP Headers, Audit Logging, 2FA, GDPR, Legal Compliance.
-   **Social Features:** Events, Groups, friendship algorithms, rich post interactions, real-time WebSocket notifications, Media Gallery, Live Streaming & Chat, Marketplace, Subscription management, Polymorphic Reviews, Leaderboard, Blog, Teacher/Venue Management, Workshop System, Music Library, Stories, and Venue Recommendations.
-   **Admin Dashboard & Analytics** for user management, content moderation, and platform health.
-   **AI Integration:**
    -   **Bifrost AI Gateway:** Unified AI gateway with automatic failover, semantic caching, and load balancing.
    -   **Mr. Blue AI Assistant:** Unified interface for Text Chat, Voice Chat, Vibecoding (context-aware code generation), and a **Visual Editor** with iframe preview, element selection, instant DOM updates, change tracking, and voice command integration. Supports seamless mode switching, voice input in all modes, and unified conversation history.
    -   **Proactive Self-Healing System:** Autonomous multi-agent system for continuous platform validation, featuring audit methods (UI/UX, Routing, Integrations, Performance, Accessibility, Security) powered by GROQ Llama-3.3-70b + Cheerio.
    -   **Replit AI ↔ Mr. Blue Integration:** Bidirectional communication bridge enabling Replit AI to control Mr. Blue AI autonomously via a RESTful API endpoint.
    -   **Autonomous Loop Infrastructure:** BullMQ continuous worker and API endpoints providing a foundation for autonomous operations.
    -   **Mr. Blue Visual Editor:** Features live preview, element inspector, component palette, AI-powered smart suggestions, undo/redo system, Git integration, preview mode, voice commands, 3D creator, Luma API integration, voice cloning, messenger UI, avatar video, address bar, focus mode, and enhanced loading.
    -   **Mr. Blue Vibe Coding System:** Natural language code generation using GROQ Llama-3.3-70b with real-time streaming of changes via Server-Sent Events (SSE).
    -   **Mr. Blue Voice Command System:** 50+ commands with fuzzy matching and wake word detection.
    -   **Mr. Blue Natural Language Automation:** Triggers browser automation via natural language.
    -   **Mr. Blue Proactive Error Detection & Learning Retention:** Autonomous error detection, AI-powered analysis, and self-healing with learning retention within the Visual Editor.
    -   **Mr. Blue System 1 - Context Service:** LanceDB-powered semantic search for RAG capabilities.
    -   **Mr. Blue Autonomous Agent System:** Full autonomous development using the MB.MD Protocol Engine, a GROQ Llama-3.1-70b powered AI Code Generator, and a Validator Service.
    -   **AI Arbitrage Engine:** Intelligent routing system for cost savings via TaskClassifier, ModelSelector, CascadeExecutor, and CostTracker.
    -   **AI Agent Learning Systems:** DPO Training, Curriculum Learning, GEPA Self-Evolution, and LIMI Curation.
    -   **Talent Match AI:** Advanced matching algorithms.
    -   **LIFE CEO AI SYSTEM:** Integrates LanceDB for semantic memory and orchestrates 16 specialized AI agents.
    -   **Multi-AI Orchestration System:** Integrates OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Groq Llama 3.1, Google Gemini Pro with fallback routing, load balancing, and semantic caching.
    -   **Automated Data Scraping System:** Uses static (Cheerio), dynamic (Playwright), and social (Facebook Graph API, Instagram) scraping with AI-powered deduplication.
    -   **Facebook OAuth Integration:** For sending messages via the official API using Page Access Tokens.

**Automation & Workers:** BullMQ queue management with 39 functions across 6 dedicated workers, powered by Redis-based job processing and 50 production-ready algorithms.

### System Design Choices
**Development Methodology:** MB.MD Protocol v4.0 (simultaneously, recursively, critically) with micro-batching, template reuse, context pre-loading, zero documentation mode, main agent parallel work, smart dependency ordering, parallel testing, a memory system, and 10-layer quality gates.

**Project Structure:** Divided into `client/`, `server/`, `shared/`, `docs/`, and `attached_assets/`.

**Production Infrastructure:** CI/CD with GitHub Actions, Prometheus/Grafana monitoring, Redis caching, BullMQ background jobs, robust security, performance optimizations, and reliability features.

**Testing Infrastructure:** Comprehensive Playwright test suites achieving 95% coverage, including E2E, WebSocket, security, performance, and visual editor tests, employing a Parallel Testing & Bug Fix Workflow.

## External Dependencies

-   **Database:** PostgreSQL (with Drizzle ORM)
-   **Authentication:** Google OAuth, Facebook OAuth (Supabase), JWT
-   **AI Platforms:** OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Groq (Llama 3.1), Google (Gemini Pro), Luma Dream Machine, ElevenLabs (Voice Cloning & TTS)
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