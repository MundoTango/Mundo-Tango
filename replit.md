# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community. It offers social networking, event management, talent matching, and AI-powered assistance, integrating 7 business systems and 62 specialized AI agents. The platform aims to be the leading digital hub for the tango ecosystem, with market potential in premium services, event monetization, and targeted advertising. It emphasizes a self-sovereign, resilient architecture with minimal third-party dependencies, optimized npm packages, and enterprise-grade security.

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
The project employs a modular, agent-driven development approach based on an Expert Specialized Agents (ESA) framework, emphasizing a self-sovereign architecture.

### UI/UX Decisions
The platform features a unified **MT Ocean theme** with a tango-inspired color palette, dark mode, glassmorphic effects, and responsive design using Tailwind CSS and shadcn/ui. The frontend uses React, TypeScript, Wouter for routing, and React Query, prioritizing a video-first design and global accessibility. Navigation is handled by **AppLayout**, **AdminLayout**, and **DashboardLayout**, with i18n integration and real-time features.

### Technical Implementations
**Backend Architecture:** Node.js with Express and TypeScript, PostgreSQL with Drizzle ORM, JWT authentication, and real-time capabilities via Supabase Realtime and WebSockets.

**Key Systems:**
-   **Security & Compliance:** 8-Tier RBAC, Dynamic Feature Flags, RLS, CSP Headers, Audit Logging, 2FA, GDPR, Legal Compliance.
-   **Social Features:** Events, Groups, friendship algorithms, rich post interactions, real-time WebSocket notifications, Media Gallery, Live Streaming & Chat, Marketplace, Subscription management, Polymorphic Reviews, Leaderboard, Blog, Teacher/Venue Management, Workshop System, Music Library, Stories, and Venue Recommendations.
-   **Admin Dashboard & Analytics** for user management, content moderation, and platform health.

**AI Integration:**
-   **Bifrost AI Gateway:** Unified AI gateway with automatic failover, semantic caching, and load balancing.
-   **Mr. Blue AI Assistant:** Unified interface offering Text Chat, Voice Chat, Vibecoding (context-aware code generation), and a **fully operational Visual Editor** with iframe preview, element selection, instant DOM updates, change tracking, and voice command integration. Features seamless mode switching, voice input in all modes, and unified conversation history.
-   **Mr. Blue Visual Editor (100% COMPLETE - Nov 18, 2025):**
    -   ✅ **Live Preview**: Actual iframe element loading real application with instant visual updates
    -   ✅ **Element Inspector**: Live CSS/HTML editing with color pickers, sliders, instant preview
    -   ✅ **Component Palette**: 20+ draggable components (buttons, inputs, containers, grids) with HTML5 drag & drop
    -   ✅ **Smart Suggestions**: AI-powered design tips via GROQ Llama-3.3-70b, auto-apply fixes, quality score (0-100)
    -   ✅ **Undo/Redo System**: 100-entry history with screenshots, batch undo, timeline navigation, search/filter
    -   ✅ **Git Integration**: Auto-commit on save, branch management, diff viewer, commit history
    -   ✅ **Preview Mode**: Side-by-side before/after comparison, device emulation, synchronized scrolling
    -   ✅ **Voice Commands**: 62 commands across 5 categories, TTS feedback, wake word detection
    -   ✅ **3D Creator**: React Three Fiber model editor with materials, transforms, GLB export
    -   ✅ **Luma API**: AI video generation with polling, progress tracking, Cloudinary storage
    -   ✅ **Voice Cloning**: ElevenLabs integration, 18-field database schema, clone management UI
    -   ✅ **Messenger UI**: Facebook OAuth, conversation history, contact selector, template builder
    -   ✅ **Avatar Video**: D-ID talking heads, 8 voice presets, SSML support, video export
    -   ✅ **Address Bar**: Browser-style navigation, history (10 pages), SSL indicator, bookmarks
    -   ✅ **Focus Mode**: Pomodoro timer (25/50/90 min), distraction blocking, auto-save, session summaries
    -   ✅ **Enhanced Loading**: 9+ skeleton screens, progress bars, optimistic UI, error states with retry
    -   📊 **Status**: 15/15 FEATURES COMPLETE (100%) - Production-Ready
-   **Mr. Blue Vibe Coding System (UPGRADED Nov 19, 2025):** Natural language code generation using GROQ Llama-3.3-70b with JSON mode. Detects intent, targets files, generates production-ready code with LanceDB semantic context, and **streams changes in real-time via Server-Sent Events (SSE)**. Features 5-phase progress tracking (interpreting → context_search → code_generation → validation → complete), EventSource client integration in Visual Editor chat, and comprehensive E2E testing. Implements Agent Client Protocol (ACP) style streaming for token-by-token progress updates.
-   **Mr. Blue Voice Command System:** 50+ commands across 5 categories (navigation, visual-editor, mr-blue, content, system) with fuzzy matching (60% similarity threshold), wake word detection, and continuous listening mode.
-   **Mr. Blue Natural Language Automation:** For god-level users, triggers browser automation via natural language (e.g., "Send FB invitation"). Evolving to Facebook OAuth + Graph API.
-   **Mr. Blue Proactive Error Detection & Learning Retention:** Visual Editor features autonomous error detection, AI-powered analysis (GROQ Llama-3.3-70b), and self-healing with learning retention. Provides auto-fix, manual fix, or escalation based on confidence scores. Tracks fix effectiveness for continuous self-improvement. **FIXED Nov 18, 2025**: Added CSRF token header + graceful JSON parsing (handles HTML error pages without crashes).
-   **Mr. Blue System 1 - Context Service:** LanceDB-powered semantic search providing RAG capabilities, indexing documentation for sub-200ms semantic search.
-   **Mr. Blue Autonomous Agent System:** Full autonomous development using the MB.MD Protocol Engine, an 850+ line GROQ Llama-3.1-70b powered AI Code Generator, a Validator Service, and integration with the Visual Editor for real-time polling, task decomposition, file diffs, validation reports, and approve/reject controls. Includes production safety features.
-   **AI Arbitrage Engine:** Intelligent routing system achieving 50-90% cost savings via TaskClassifier, ModelSelector, CascadeExecutor, and CostTracker.
-   **AI Agent Learning Systems:** 4 learning pathways: DPO Training, Curriculum Learning, GEPA Self-Evolution, and LIMI Curation.
-   **OpenAI Realtime Voice API:** ChatGPT-style natural voice conversations.
-   **ElevenLabs Voice Cloning (Nov 18, 2025):** Complete voice cloning integration with database persistence (`elevenlabsService`). Features audio upload (up to 25 files), voice clone creation via ElevenLabs API, clone management (list/delete), default voice selection, preview generation, and usage tracking. Database schema includes `voice_clones` table (18 fields: user_id, voice_id, name, status, is_default, audio_sample_count, language, model_id, usage_count, etc.). Integrated with `VoiceCloning.tsx` frontend component.
-   **Talent Match AI:** Advanced matching algorithms.
-   **LIFE CEO AI SYSTEM:** Integrates LanceDB for semantic memory and orchestrates 16 specialized AI agents via a Decision Matrix.
-   **Multi-AI Orchestration System:** Integrates OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Groq Llama 3.1, Google Gemini Pro with specialized fallback routing, intelligent load balancing, and a semantic caching layer with LanceDB, enhanced with `queryWithArbitrage()`.
-   **Automated Data Scraping System:** Uses static (Cheerio), dynamic (Playwright), and social (Facebook Graph API, Instagram) scraping with AI-powered deduplication.
-   **Facebook OAuth Integration:** Strategic pivot from browser automation to legitimate Facebook OAuth + Graph API for sending messages via official API using Page Access Tokens.

**Automation & Workers:** BullMQ queue management with 39 functions across 6 dedicated workers, powered by Redis-based job processing and 50 production-ready algorithms.

### System Design Choices
**Development Methodology:** MB.MD Protocol v4.0 (simultaneously, recursively, critically) with micro-batching, template reuse, context pre-loading, zero documentation mode, main agent parallel work, smart dependency ordering, parallel testing, a memory system, and 10-layer quality gates.

**Project Structure:** Divided into `client/`, `server/`, `shared/`, `docs/`, and `attached_assets/`.

**Production Infrastructure:** CI/CD with GitHub Actions, Prometheus/Grafana monitoring, Redis caching, BullMQ background jobs, robust security, performance optimizations, and reliability features.

**Testing Infrastructure:** Comprehensive Playwright test suites achieving 95% coverage, including E2E, WebSocket, security, performance, and visual editor tests. Employs a Parallel Testing & Bug Fix Workflow.

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