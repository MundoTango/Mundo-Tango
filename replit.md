# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security, integrating with various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising, targeting a significant share of the global dance market.

## User Preferences
- Work Simultaneously - Run operations in parallel (use Promise.all, parallel tool calls)
- Work Recursively - Deep analysis, not surface-level (read imports, dependencies, related files)
- Work Critically - Target 95-99/100 quality (test before complete, validate edge cases)
- Check Infrastructure First - Use existing systems before building new (Page Audit, Auto-Fix, Agent Orchestration)
- Test Before Complete - Run E2E tests for UI changes, unit tests for backend
- Database: Never change ID column types (serial ↔ varchar) - breaks existing data
- Handoff Plan: Never deviate - Follow exact phase sequence
- Auto-Fix Maximization - All auto-fix as much as possible (3-attempt retry, <10% escalation rate)
- Validation Loop - observe → decide → act → validate → adapt (not just automation)
- MB.MD Methodology - Apply v9.9.2 patterns systematically: Research → Plan → Build → Test → Document

## System Architecture

### Standardized Components
The platform uses standardized components such as PublicProfileView, UnifiedSidebar, TangoRoles, RoleChangeCascade, CascadeFramework, RBAC/ABAC System, PerRoleExperience, UnifiedLocationPicker, UnifiedMemoriesFeed, LocationChangeCascade, and UnifiedPROTab for consistent functionality and design. The profile system includes 8 core tabs: About, Feed, Photos, Friends, Events, Travel, Memories, and PRO.

### Navigation System
A Unified Sidebar provides icon-centric navigation with 27 items across Social, Community, PRO Discovery, and Services sections, featuring a 3-column grid, hover tooltips, and `z-50` layering.

### UI/UX
Mundo Tango uses an "MT Ocean Theme" supporting dark mode via Tailwind CSS. Components are built with `shadcn/ui` and Radix UI, using Lucide React and React Icons for iconography. It supports 68 languages via `i18next` and Wouter for routing, with `AppLayout`, `DashboardLayout`, and `AdminLayout`. A Visual Editor enables inline editing.

### Backend
The backend uses Express and TypeScript with PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, and an 8-tier RBAC system. Database migrations are automated, and server-side FFmpeg handles video transcoding. API endpoints cover PRO tab functionalities, place recommendations, travel plans, and enhanced Talent Match AI.

### AI Systems
An extensive AI ecosystem orchestrates 1,218 specialized agents hierarchically, with Replit AI for strategic oversight, Mr. Blue for tactical coordination, and individual agents for atomic tasks. This includes self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions.

### Groups System
The Groups system offers community features with 3 discovery tabs (My Groups, Cities, Professional) and 7 detail tabs. It includes database tables for groups, members, posts, and categories, with API endpoints for CRUD, join/leave flows, and integrations.

### Platform Features
Core features include social functionalities (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers).

### Testing
The platform utilizes E2E tests, automated unit test coverage via CI/CD, and visual regression testing with Playwright and Claude Computer Use for AI-powered validation. E2E testing involves page load, API, button/link, and content verification. The `run_test` tool is critical for E2E testing, handling environment setup and Stripe testing key injection automatically.

### Production
Production leverages GitHub Actions for CI/CD, Prometheus/Grafana with Sentry for monitoring, Replit Publishing for deployment, Redis for caching, and PostgreSQL (Neon) with Drizzle ORM.

### Marketing Site Architecture
The marketing site includes a Donation Tier System, a Human to Agent Collaboration (H2AC) Volunteer Program, and an Ambassador Program. It features marketing page routes for support, supporters, volunteer, Mr. Blue, ambassadors, and open source, with all public statistics wired to a real database.

### Demo System
A comprehensive Video Demo System (MB.MD Patterns 28, 38, 41) includes a landing page video demo section with 4 clickable demo cards, a DemoModal (5-slide interactive carousel), a VideoDemoModal (video-style demo player), and a Playwright demo recording script. It adheres to a ZERO fake data policy.

### Video Recording System
An automated video recording system uses Playwright's `recordVideo` capability to capture real customer journeys (MB.MD Patterns 28, 38, 41). This includes a Journey Schema, Video Recorder, Video Service, and API endpoints for recording management. All videos are actual Playwright recordings.

### Event Scraping System
An automated scraping infrastructure (MB.MD Patterns 28, 38, 41) enriches global tango event and community data using specialized scraping agents (#115-119). It includes a City Group Enrichment Service, community metadata extraction, Admin API endpoints, and GitHub Actions automation for daily scraping.

### Event Series System (NEW - Dec 2024)
Recurring event containers for weekly/monthly/yearly events:
- **Database**: `event_series` table with recurrence_type, recurrence_day, organizer ownership
- **Events Link**: Events can belong to a series via `series_id` foreign key
- **Profile Page**: `/event-series/:id` with About/Upcoming/Past tabs, cover photo, inline edit for organizers
- **Auto-Creation**: Scraping pipeline detects recurring patterns (same venue + day of week) and auto-creates Series
- **Creator UI**: Event creation form has "Make this a recurring series" toggle with Weekly/Monthly/Yearly options
- **API Endpoints**: CRUD at `/api/event-series`, claim ownership at `/api/event-series/:id/claim`

### City Groups Events Tab (REDESIGNED - Dec 2024)
Redesigned to match Events landing page design:
- **Main Tabs**: "Upcoming Events" | "Series" (for recurring events)
- **View Tabs**: List | Calendar | Map (icons)
- **Compact Filter Bar**: Inline search, type selector, verified toggle, expandable advanced filters
- **Calendar View**: react-big-calendar integration with event navigation
- **Map View**: react-leaflet with event markers and popups

### RSS Feed Scraping (NEW - Dec 2024)
- **RSSFeedService**: Parses RSS 2.0 and Atom 1.0 feeds for event data
- **Database**: `rss_url` column in `event_scraping_sources` table
- **Admin Endpoints**: Add/list/validate RSS sources, trigger scraping
- **Pipeline Integration**: RSS sources processed in parallel with other scrapers

### Geocoding Service (NEW - Dec 2024)
- **GeocodingService**: OpenStreetMap Nominatim API integration with rate limiting (1 req/sec)
- **Caching**: 24-hour TTL in-memory cache to avoid duplicate lookups
- **Batch Script**: `server/scripts/batchGeocodeEvents.ts` for bulk geocoding
- **Coverage**: Geocodes events and city groups missing coordinates

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next, i18next-browser-languagedetector, i18next-http-backend, react-i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer