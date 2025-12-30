# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising, offering advanced functionalities for tango enthusiasts. Its extensive AI ecosystem provides strategic oversight and execution capabilities, positioning Mundo Tango as a comprehensive solution for the global tango market. The platform's business vision includes capturing market potential through advanced AI, robust social features, and a scalable architecture.

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
- MB.MD Methodology - Apply v9.9.3 patterns systematically: Research → Plan → Build → Test → Fix → Document
- Three-Layer Completion - Every feature requires: UI Layer + Data Layer + Interaction Layer (never mark UI-only as complete)
- Never mark messaging tasks complete without E2E verification - Must test PRO contact → inbox flow and new conversation creation
- Verify imports exist before using - Check all referenced schemas/tables are imported at file top

## System Architecture

### UI/UX
The platform utilizes an "MT Ocean Theme" with dark mode, built using Tailwind CSS, shadcn/ui, and Radix UI. It supports 68 languages via `i18next` and uses Wouter for routing. Key UI components include a Visual Editor, Unified Sidebar, PublicProfileView, and PerRoleExperience, adhering to a strict z-index hierarchy. Icons are from Lucide React and React Icons. City pages feature a "City-First Branding" with 7 tabs (Discussion, Overview, Events, Members, Housing, Visitors, Tips) following the CITY_PAGE.md specification.

### Backend
The backend is developed with Express and TypeScript, leveraging PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, an 8-tier Role-Based Access Control (RBAC) system, and automated database migrations. Server-side FFmpeg handles video transcoding. The API supports PRO functionalities, place recommendations, and enhanced Talent Match AI features. Email verification is mandatory for user access.

### AI Systems
Mundo Tango integrates a comprehensive AI ecosystem with over 140 specialized agents, including self-healing infrastructure, a production-ready validation loop, and a Visual Validation Framework. A Bifrost AI Gateway facilitates multi-provider AI interactions. A RecursiveContextService manages hierarchical code summarization. The core AI brain, located in `/mr-blue-brain/`, is modular, encompassing Identity, Cognition (e.g., ReAct Protocol, Chain-of-Thought), Operations, Orchestration (e.g., Mixture of Experts Router), Patterns, and specialized Agents. This includes a Multi-Agent Orchestration System for 130+ agents, a Leadership Agent System with "God Commands," and the Mr. Blue AI Assistant providing real-time data access and intelligent task routing via a Multi-AI Orchestrator (Groq, OpenAI, Anthropic with fallbacks and consensus).

### Event Scraping System
A multi-stage scraping architecture is coordinated by a Master Orchestrator, utilizing Priority Scrapers and an AI-powered UnifiedEventScraper. It features AI-powered extraction, 14 event type classifications, source transparency, city matching, and auto-city creation. Scraped events are stored in a `scraped_events` table and ingested into the main events table, with an Admin UI for real-time status and moderation.

### Platform Features
Core functionalities include social features (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers). Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Unified Messaging Inbox, and a Faceless Content System. The Talent Match AI system integrates volunteer onboarding, resume analysis, AI interviews, and an International Payment System supporting 30 currencies.

### Messaging System (Updated Dec 30, 2025)
- **Database**: Uses `directMessages` table (PRIMARY). `chatRooms`/`chatMessages` are DEPRECATED.
- **PRO Contact → Inbox**: Contact form via `/api/pro/contact` routes to directMessages ✅ COMPLETE
- **New Conversations**: User search via `/api/users/search` endpoint
- **Real-time**: Currently polling (5s), WebSocket planned
- **Group Chat**: Uses `group_messages` table via `/api/groups/:id/messages` ✅ FIXED
- **Documentation**: See `docs/PRD_MESSAGING_AND_PRO_PAGE.md` for full specification
- **Related PRDs**:
  - `docs/MESSAGING_ECOSYSTEM_MAP.md` - All systems interacting with messaging
  - `docs/prd/NOTIFICATIONS_SYSTEM.md` - 17 notification types (new_message + group_message ADDED)
  - `docs/prd/REALTIME_WEBSOCKET.md` - Replace polling with WebSocket
  - `docs/prd/EXTERNAL_MESSAGING_CHANNELS.md` - Facebook/Instagram/WhatsApp/Gmail
  - `docs/prd/GROUPS_SYSTEM.md` - Group chat implementation

### PRO Pages (/p/:slug)
- **Public Profiles**: Glassmorphic design with bio, gallery, testimonials
- **Contact Form**: Submits to PRO's inbox via directMessages (guest-contact user, CSRF exempt)
- **Endpoint**: `POST /api/pro/contact` - Zod validated, secure (no email impersonation)
- **Vanity URLs**: `/:username` resolves to PRO page or user profile
- **Documentation**: See `docs/prd/VANITY_URLS.md` for URL routing spec

### Three-Layer Completion Status (Dec 30, 2025)
| System | UI | Data | Interaction | Notes |
|--------|----|----|-----------|-------|
| Direct Messages | 90% | 95% | 85% | Fixed Dec 30 |
| Notifications | 70% | 85% | 60% | new_message + group_message ADDED |
| WebSocket | 30% | 60% | 10% | Uses polling |
| External Channels | 80% | 50% | 30% | Facebook partial |
| Groups | 85% | 90% | 80% | FIXED Dec 30 - group_messages table |

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon, Supabase
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **Email:** Replit Resend Connector
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next