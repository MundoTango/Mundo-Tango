# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community with comprehensive social networking, event management, talent matching, and advanced AI assistance. It integrates 7 business systems and 62 specialized AI agents, aiming to be the leading digital hub for tango. The business model focuses on premium services, event monetization, and targeted advertising, built on a self-sovereign, resilient architecture with enterprise-grade security.

## User Preferences
**Methodology:** MB.MD Protocol v9.2
- Work simultaneously (parallel execution with 3 subagents)
- Work recursively (deep exploration, not surface-level)
- Work critically (rigorous quality, 95-99/100 target)
- **NEW v8.0**: AI Agent Learning (DPO, Curriculum, GEPA, LIMI)
- **NEW v8.0**: 5 Development-First Principles (Security, Error, Performance, Mobile, Accessibility)
- **NEW v9.0**: **Agent SME Training System** - Agents become Subject Matter Experts by learning ALL documentation, code, and industry standards BEFORE implementation

**Never deviate from the handoff plan** - Follow the exact phase sequence

## System Architecture
The project uses a modular, agent-driven development approach based on an Expert Specialized Agents (ESA) framework, emphasizing a self-sovereign architecture.

### UI/UX Decisions
The platform features a unified **MT Ocean theme** with a tango-inspired color palette, dark mode, glassmorphic effects, and responsive design using Tailwind CSS and shadcn/ui. The frontend is built with React, TypeScript, Wouter for routing, and React Query, prioritizing a video-first design and global accessibility. Navigation is managed by **AppLayout**, **AdminLayout**, and **DashboardLayout**, including i18n integration and real-time features.

### Technical Implementations
**Backend Architecture:** Node.js with Express and TypeScript, PostgreSQL with Drizzle ORM, JWT authentication, and real-time capabilities via Supabase Realtime and WebSockets.

**Authentication & Access Patterns:** Implements an "auth-optional" pattern for public routes (e.g., Visual Editor) with graceful degradation for unauthenticated users, and robust 401 error handling for protected routes. This integrates MB.MD Protocol v9.2's Free Energy Principle and Active Inference for optimal UX.

**Key Systems:**
-   **Security & Compliance:** 8-Tier RBAC, Dynamic Feature Flags, RLS, CSP Headers, Audit Logging, 2FA, GDPR, Legal Compliance.
-   **Social Features:** Events, Groups, friendship algorithms, rich post interactions, real-time WebSocket notifications, Media Gallery, Live Streaming & Chat, Marketplace, Subscription management, Polymorphic Reviews, Leaderboard, Blog, Teacher/Venue Management, Workshop System, Music Library, Stories, and Venue Recommendations.
-   **Admin Dashboard & Analytics** for user management, content moderation, and platform health.
-   **AI Integration:**
    -   **Bifrost AI Gateway:** Unified AI gateway with automatic failover, semantic caching, and load balancing.
    -   **Universal Agent Ecosystem:** Production-ready system with 1,218 specialized agents, including a **Universal Agent Scanner** for auto-discovery and an **Agent SME Training System**.
    -   **AI Page Generator:** Natural language to production-ready pages using GROQ Llama-3.3-70b, generating React components, API routes, database schemas, Playwright tests, and route registrations. Integrated into the Visual Editor.
    -   **Page Audit System:** Comprehensive 12-category auditing for Mr. Blue's self-healing, with pattern detection, auto-fix engine, AI deep audit, and escalation matrix. Integrated into the Visual Editor.
    -   **Mr. Blue AI Assistant:** Unified interface for Text Chat, Voice Chat, Vibecoding (context-aware code generation), and a **Visual Editor** with live preview, element selection, instant DOM updates, change tracking, and voice commands. Supports seamless mode switching and unified conversation history. Includes a working Vibecoding system with intent classification, natural language UI modification detection, context awareness, and code generation.
    -   **Proactive Self-Healing System:** Autonomous multi-agent system for continuous platform validation using GROQ Llama-3.3-70b.
    -   **Replit AI ↔ Mr. Blue Integration:** Bidirectional communication bridge for autonomous control.
    -   **Mr. Blue Visual Editor:** Features live preview, element inspector, component palette, AI-powered smart suggestions, undo/redo, Git integration, preview mode, voice commands, and advanced creator tools.
    -   **Mr. Blue Vibe Coding System:** Natural language code generation using GROQ Llama-3.3-70b with real-time SSE streaming.
    -   **Mr. Blue Voice Command System:** 50+ commands with fuzzy matching.
    -   **Mr. Blue Natural Language Automation:** Triggers browser automation via natural language.
    -   **Mr. Blue Proactive Error Detection & Learning Retention:** Autonomous error detection, AI-powered analysis, and self-healing within the Visual Editor.
    -   **Mr. Blue System 1 - Context Service:** LanceDB-powered semantic search for RAG.
    -   **Mr. Blue Autonomous Agent System:** Full autonomous development using MB.MD Protocol Engine and a GROQ Llama-3.1-70b powered AI Code Generator.
    -   **AI Arbitrage Engine:** Intelligent routing for cost savings.
    -   **AI Agent Learning Systems:** DPO Training, Curriculum Learning, GEPA Self-Evolution, and LIMI Curation.
    -   **Talent Match AI:** Advanced matching algorithms.
    -   **LIFE CEO AI SYSTEM:** Integrates LanceDB and orchestrates 16 specialized AI agents.
    -   **Multi-AI Orchestration System:** Integrates OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Groq Llama 3.1, Google Gemini Pro with fallback, load balancing, and semantic caching.
    -   **Automated Data Scraping System:** Uses static (Cheerio), dynamic (Playwright), and social (Facebook Graph API, Instagram) scraping with AI-powered deduplication.
    -   **Facebook OAuth Integration:** For sending messages via the official API.

**Automation & Workers:** BullMQ queue management with 39 functions across 6 dedicated workers, powered by Redis.

### System Design Choices
**Development Methodology:** MB.MD Protocol v4.0 (simultaneously, recursively, critically) with micro-batching, template reuse, context pre-loading, zero documentation mode, parallel work, smart dependency ordering, parallel testing, a memory system, and 10-layer quality gates.

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