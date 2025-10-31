## Overview

Mundo Tango is a social platform connecting the global tango community, including dancers, teachers, organizers, and enthusiasts. Its purpose is to foster tango culture through authentic connections, event discovery, and community engagement. The project is built with PostgreSQL + Drizzle ORM and is designed for complete platform independence.

### Current Build Status (October 31, 2025)
**Phase 6 TIER 1**: ✅ Complete + **WAVE 1 Foundation**: 🚧 In Progress (70% complete)
- **Platform Pages**: 7 platform pages operational (Secrets, Git, Monitoring, Analytics, ESA Dashboard, Agent Tasks, Communications)
- **ESA Framework**: 134 agents registry system - **39 ACTIVE** (29% operational)
  - 24 Page agents active (P001-P030 including Teachers, Venues, Calendar, Search, Admin)
  - 11 Algorithm agents active (Feed, Auth, Caching, Real-time, Event Recommendation, Search Ranking, etc.)
  - 4 Mr Blue AI agents active (Chat, Code Analysis, Generation, Debugging)
  - 20 tasks pending execution (Login, Profile, Feed, Events - all high priority)
  - 21 inter-agent communications logged
- **Design System**: ✅ MT Ocean Theme implemented (Turquoise #40E0D0 → Dodger Blue #1E90FF → Cobalt #0047AB)
  - Light + Dark modes with glassmorphic effects
  - 829-line design system active in index.css + mt-ocean-theme.css
- **Automation Infrastructure**: ✅ BullMQ + Workers (3/6 complete)
  - userLifecycleWorker.ts (Welcome, Profile completion, Re-engagement)
  - socialWorker.ts (Follow, Like, Comment, Friend request, Share notifications)
  - eventWorker.ts (Reminders, RSVP automation, New event notifications)
- **AI Dependencies**: ✅ Installed (Groq SDK, Anthropic SDK, BullMQ, IORedis)
- **Database**: ✅ 200+ tables verified (includes friends, notifications, RSVPs, all social features)
- **MB.MD Protocol**: Active - simultaneous, recursive, critical execution

## User Preferences

### Development Approach

**Methodology:** MB.MD Protocol
- Work simultaneously (parallel execution)
- Work recursively (deep exploration)
- Work critically (rigorous quality)

**Never deviate from the handoff plan** - Follow the exact phase sequence

## System Architecture

The project follows a modular and agent-driven development approach, leveraging an Expert Specialized Agents (ESA) framework.

**UI/UX Decisions:**
- **Color Palette:** Tango-inspired (burgundy #B91C3B, purple #8B5CF6, gold #F59E0B).
- **Design System:** Dark mode support, Tailwind CSS + shadcn/ui components, responsive design, and a custom typography system.
- **Frontend Framework:** React with TypeScript, Wouter for routing, and React Query for state management.

**Technical Implementations:**
- **Backend:** Node.js with Express, TypeScript.
- **Authentication:** JWT-based authentication with httpOnly cookies.
- **Database:** PostgreSQL with Drizzle ORM and serial IDs.
- **Data Access:** Direct client interaction with the database.
- **Real-time Capabilities:** Supabase Realtime for posts, comments, messages, and typing indicators (planned integration).
- **Core Platform Features:** Supabase Auth integration, query helpers, frontend foundation, and design system.
- **Quality Infrastructure:** Error boundaries, centralized logging, performance monitoring, and SEO metadata.
- **Social Features:** Pagination, optimistic updates, full CRUD operations, and follow/unfollow functionality.
- **Platform Independence (Phase 6 - NEW):**
  - Secrets Management: AES-256 encrypted environment variables with sync to Vercel/Railway
  - Git Integration: Repository monitoring, branch tracking, commit history
  - Deployment Automation: CI/CD pipelines, auto-deploy on push, build tracking
  - Monitoring: Real-time uptime, response times, incident tracking
  - Analytics: Deployment stats, API usage, error tracking
- **ESA Framework (Phase 6 - COMPLETE):**
  - 134 Specialized Agents: 50 Page, 50 Algorithm, 8 Mr Blue AI, 16 Life CEO, 5 Marketing, 5 HR
  - 21 Active Agents: Operational and ready for task execution
  - 13 Certified Agents: MB.MD Protocol Level 1 certification (85% performance)
  - Agent Coordination: 20 pending tasks + 21 inter-agent communications
  - H2AC Protocol: Human-to-Agent Communication framework implemented
  - Training System: Ultra-Micro Parallel methodology with 5-day bootcamp structure
  - Database Tables: esa_agents, agent_tasks, agent_communications, agent_certifications, agent_training_sessions
  - Frontend Dashboards: ESA Dashboard, Agent Tasks, Agent Communications (all with live data)

**System Design Choices:**
- **MB.MD Protocol:** A foundational development methodology emphasizing simultaneous, recursive, and critical execution.
- **Agent-Driven Development:** Utilizes an ESA framework with a hierarchy of agents for parallel task execution and quality control.
- **Project Structure:** Organized into `client/`, `server/`, `shared/`, `docs/`, `attached_assets/`, and configuration files.

## External Dependencies

- **Database:** PostgreSQL (with Drizzle ORM)
- **Authentication:** Google OAuth (planned)
- **AI Integration:** Multi-AI integration (5 providers, including OpenAI for `OPENAI_API_KEY`)
- **Payments:** Stripe (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`)
- **Real-time Communication:** Supabase Realtime (posts, messages, typing - planned integration)
- **Deployment & Hosting:** Vercel, Railway, Supabase (for platform independence features)