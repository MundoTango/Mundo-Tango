# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It boasts a resilient, self-sovereign architecture with enterprise-grade security, integrating 7 business systems and 1,218 specialized AI agents. The platform's business model focuses on monetization through premium services, event hosting, and targeted advertising, aiming to capture a significant share of the global dance market.

## User Preferences
- **Work Simultaneously** - Run operations in parallel (use Promise.all, parallel tool calls)
- **Work Recursively** - Deep analysis, not surface-level (read imports, dependencies, related files)
- **Work Critically** - Target 95-99/100 quality (test before complete, validate edge cases)
- **Check Infrastructure First** - Use existing systems before building new (Page Audit, Auto-Fix, Agent Orchestration)
- **Test Before Complete** - Run E2E tests for UI changes, unit tests for backend
- **Database:** Never change ID column types (serial ↔ varchar) - breaks existing data
- **Handoff Plan:** Never deviate - Follow exact phase sequence
- **Auto-Fix Maximization** - All auto-fix as much as possible (3-attempt retry, <10% escalation rate)
- **Validation Loop** - observe → decide → act → validate → adapt (not just automation)

## System Architecture

### Standardized Components
The platform utilizes several standardized, documented components such as PublicProfileView, UnifiedSidebar, TangoRoles, RoleChangeCascade, CascadeFramework, RBAC/ABAC System, PerRoleExperience, UnifiedLocationPicker, UnifiedMemoriesFeed, LocationChangeCascade, and UnifiedPROTab. These components ensure consistent functionality and design across the platform.

### Profile Tab Architecture
The profile system consists of 8 core tabs: About, Feed, Photos, Friends, Events, Travel, Memories, and PRO. Legacy role-based tabs have been consolidated into the unified PRO tab, which integrates with event participation to auto-populate professional portfolios. The About tab further subdivides into Profile, Privacy, Security, Notifications, and Subscription settings.

### Navigation System
The Unified Sidebar provides icon-centric navigation with 27 items organized into four sections: Social, Community, PRO Discovery, and Services. It features a 3-column grid, hover-triggered tooltips, and `z-50` layering for visibility.

### UI/UX
Mundo Tango employs an "MT Ocean Theme" with ocean blues and warm accents, supporting dark mode via Tailwind CSS. Components are built with `shadcn/ui` and Radix UI, using Lucide React and React Icons for iconography. The platform supports 68 languages via `i18next` and uses Wouter for routing. Layouts include `AppLayout` (public), `DashboardLayout` (authenticated), and `AdminLayout` (administrative). A Visual Editor enables inline editing, and key features like UnifiedLocationPicker, UnifiedMemoriesFeed, PostCreator, and a UnifiedLanguageSystem are implemented. Expanded user profile fields cater to professional networking.

### Backend
The backend is built with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, and an 8-tier RBAC system. Database migrations are automated, and server-side FFmpeg handles video transcoding. The API includes endpoints for PRO tab functionalities, place recommendations, and travel plans. Talent Match AI is enhanced with language-based search filtering.

### AI Systems
An extensive AI ecosystem orchestrates 1,218 specialized agents hierarchically, with Replit AI providing strategic oversight, Mr. Blue as a tactical coordinator, and individual agents for atomic tasks. This system includes self-healing infrastructure, a production-ready validation loop (Phase C Autonomous Framework), a Visual Validation Framework for UI changes, and contextual agent activation. A comprehensive Backend Agent System extends autonomy across the full stack, complemented by Mr. Blue AI Assistant for interactive support and a Bifrost AI Gateway for managing multi-provider AI interactions.

### Platform Features
Core features include social functionalities (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers for background processing). Event scraping is supported, capturing detailed source information and raw participant data.

### Testing
The platform targets 95%+ test coverage using E2E Tests (Playwright) for critical functionalities and Hybrid Visual Testing with Playwright and Claude Computer Use for AI-powered visual regression analysis. Integration tests cover backend APIs and orchestration services.

### Production
CI/CD is managed via GitHub Actions. Monitoring is implemented with Prometheus/Grafana, caching with Redis, and error tracking with Sentry.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next, i18next-browser-languagedetector, i18next-http-backend, react-i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer