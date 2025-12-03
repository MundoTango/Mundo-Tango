# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It boasts a resilient, self-sovereign architecture with enterprise-grade security and integrates with 7 business systems and 1,218 specialized AI agents. The platform's business model focuses on monetization through premium services, event hosting, and targeted advertising, aiming to capture a significant share of the global dance market.

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
- **MB.MD Methodology** - Apply v9.9.2 patterns systematically: Research → Plan → Build → Test → Document

## System Architecture

### Standardized Components
The platform utilizes standardized components such as PublicProfileView, UnifiedSidebar, TangoRoles, RoleChangeCascade, CascadeFramework, RBAC/ABAC System, PerRoleExperience, UnifiedLocationPicker, UnifiedMemoriesFeed, LocationChangeCascade, and UnifiedPROTab for consistent functionality and design.

### Profile Tab Architecture
The profile system features 8 core tabs: About (with Profile, Privacy, Security, Notifications, Subscription), Feed, Photos, Friends, Events, Travel, Memories, and PRO. The PRO tab integrates with event participation to auto-populate professional portfolios.

### Navigation System
The Unified Sidebar provides icon-centric navigation with 27 items across Social, Community, PRO Discovery, and Services sections, featuring a 3-column grid, hover-triggered tooltips, and `z-50` layering. A "My Stuff" section offers personalized shortcuts.

### UI/UX
Mundo Tango employs an "MT Ocean Theme" with ocean blues and warm accents, supporting dark mode via Tailwind CSS. Components are built with `shadcn/ui` and Radix UI, utilizing Lucide React and React Icons for iconography. It supports 68 languages via `i18next` and Wouter for routing. Layouts include `AppLayout`, `DashboardLayout`, and `AdminLayout`. A Visual Editor enables inline editing.

### Backend
The backend is built with Express and TypeScript, using PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, and an 8-tier RBAC system. Database migrations are automated, and server-side FFmpeg handles video transcoding. The API includes endpoints for PRO tab functionalities, place recommendations, travel plans, and enhanced Talent Match AI with language-based search filtering.

### AI Systems
An extensive AI ecosystem orchestrates 1,218 specialized agents hierarchically, with Replit AI for strategic oversight, Mr. Blue for tactical coordination, and individual agents for atomic tasks. This system includes self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a comprehensive Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions.

### Groups System
The Groups system provides community features with 3 discovery tabs (My Groups, Cities, Professional) and 7 detail tabs (Discussion, Events, Housing, Hub, Members, City Guide, Settings). It includes database tables for groups, group members (with role hierarchy), group posts, and categories. API endpoints cover CRUD operations, join/leave flows, membership approval, and integrations with Events, Profile, Location, RSVP, and Notifications.

### Platform Features
Core features encompass social functionalities (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers for background processing).

### Testing
The platform utilizes E2E tests, automated unit test coverage via CI/CD, and visual regression testing with Playwright and Claude Computer Use for AI-powered validation.

### Production
Production leverages GitHub Actions for CI/CD, Prometheus/Grafana with Sentry for monitoring, Replit Publishing for deployment, Redis for caching, and PostgreSQL (Neon) with Drizzle ORM for infrastructure.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next, i18next-browser-languagedetector, i18next-http-backend, react-i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer