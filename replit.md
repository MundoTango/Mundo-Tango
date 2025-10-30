## Overview

Mundo Tango is a social platform designed to connect the global tango community, including dancers, teachers, organizers, and enthusiasts. Its core mission is to create a vibrant digital space that fosters tango culture through authentic connections, event discovery, and community engagement. The project is currently leveraging a Supabase backend with a focus on a fresh start using UUID architecture.

## User Preferences

### Development Approach

**Methodology:** MB.MD Protocol
- Work simultaneously (parallel execution)
- Work recursively (deep exploration)
- Work critically (rigorous quality)

**Never deviate from the handoff plan** - Follow the exact phase sequence

## System Architecture

The project follows a modular and agent-driven development approach.

**UI/UX Decisions:**
- **Color Palette:** Tango-inspired (burgundy #B91C3B, purple #8B5CF6, gold #F59E0B).
- **Design System:** Dark mode support, Tailwind CSS + shadcn/ui components, responsive design, and a custom typography system.
- **Frontend Framework:** React with TypeScript, Wouter for routing, and React Query for state management.

**Technical Implementations:**
- **Backend:** Node.js with Express, TypeScript, PostgreSQL (via Supabase) with Drizzle ORM, and Socket.io for real-time communication.
- **Authentication:** JWT + 2FA authentication, email verification, password reset, role-based access control, and session management.
- **API Structure:** RESTful API with authentication middleware, Zod schemas for request validation, and comprehensive error handling.
- **Database:** Supabase with PostgreSQL, UUID primary keys, Row Level Security (RLS), and auto-profile creation triggers. Includes tables for profiles, posts, likes, comments, events, RSVPs, communities, messages, conversations, and subscriptions.
- **File Storage:** Supabase Storage with dedicated buckets for avatars, posts, events, and private messages.

**Feature Specifications:**
- **Core Platform:** Authentication, API routes, frontend foundation, and design system are complete.
- **Real-time Capabilities:** Enabled through Supabase Realtime and Socket.io.

**System Design Choices:**
- **MB.MD Protocol:** A foundational development methodology emphasizing simultaneous, recursive, and critical execution.
- **Agent-Driven Development:** Utilizes an Expert Specialized Agents (ESA) framework with a hierarchy of 105 agents (Board, Division Chiefs, Layer Agents, Expert, Operational, Life CEO, Custom Agents) for parallel task execution and quality control.
- **Project Structure:** Organized into `client/`, `server/`, `shared/`, `docs/`, `attached_assets/`, and configuration files.

## External Dependencies

- **Database:** Supabase (PostgreSQL with UUIDs, Auth, Storage, Realtime)
- **Authentication:** Google OAuth (planned)
- **AI Integration:** Multi-AI integration (5 providers, including OpenAI for `OPENAI_API_KEY`)
- **Payments:** Stripe (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`)
- **Real-time Communication:** Socket.io