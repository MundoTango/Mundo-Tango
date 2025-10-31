## Overview

Mundo Tango is a social platform connecting the global tango community, including dancers, teachers, organizers, and enthusiasts. Its purpose is to foster tango culture through authentic connections, event discovery, and community engagement. The project is built with PostgreSQL + Drizzle ORM and is designed for complete platform independence.

### Current Build Status (October 31, 2025)
**Phase 6 TIER 1**: ✅ Complete - Deployment automation + ESA Framework + Agent Coordination
- **Platform Pages**: Secrets, Git Repository, Monitoring, Analytics, ESA Dashboard, Agent Tasks, Agent Communications (7 pages total)
- **ESA Framework**: 134 agents registry system (50 Page, 50 Algorithm, 8 Mr Blue AI, 16 Life CEO, 5 Marketing, 5 HR)
  - 21 agents ACTIVE (P001-P017, A001-A003, A011-A012, A019, MB001, MB002, MB007, MB008)
  - 13 agents CERTIFIED (MB.MD Protocol Level 1, 85% performance score)
  - 20 tasks created (page_implementation type, all pending)
  - 21 communications sent (agent_to_agent activation notices)
- **Database Schema**: 5 ESA tables (esa_agents, agent_tasks, agent_communications, agent_certifications, agent_training_sessions) + 15+ platform tables
- **MB.MD Protocol**: Active - simultaneous, recursive, critical execution - ALL DELIVERABLES VERIFIED

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