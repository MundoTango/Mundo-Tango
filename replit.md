# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising, offering advanced functionalities for tango enthusiasts and an extensive AI ecosystem for strategic oversight and execution.

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

## System Architecture

### UI/UX
The platform uses an "MT Ocean Theme" with dark mode, built with Tailwind CSS, shadcn/ui, and Radix UI. It supports 68 languages via `i18next` and uses Wouter for routing. Key UI components include a Visual Editor, Unified Sidebar, PublicProfileView, and PerRoleExperience, with a strict z-index hierarchy. Icons are sourced from Lucide React and React Icons.

### Backend
The backend is developed with Express and TypeScript, leveraging PostgreSQL (Neon) and Drizzle ORM. It includes modular routes, JWT authentication with Google/Facebook OAuth, an 8-tier Role-Based Access Control (RBAC) system, and automated database migrations. Server-side FFmpeg is used for video transcoding. The API supports PRO functionalities, place recommendations, and enhanced Talent Match AI features. Email verification is mandatory for user access.

### AI Systems
Mundo Tango incorporates an extensive AI ecosystem with over 140 specialized agents, including self-healing infrastructure, a production-ready validation loop, and a Visual Validation Framework. A Bifrost AI Gateway enables multi-provider AI interactions. A RecursiveContextService handles hierarchical code summarization. The AI brain is structured into a modular `/mr-blue-brain/` system encompassing Identity, Cognition (e.g., ReAct Protocol, Chain-of-Thought), Operations, Orchestration (e.g., Mixture of Experts Router), Patterns, and specialized Agents.

### Event Scraping System
A multi-stage scraping architecture coordinated by a Master Orchestrator, including Priority Scrapers and an AI-powered UnifiedEventScraper. It features AI-powered extraction, 14 event type classifications, source transparency, city matching, and auto-city creation for new event locations. Scraped events are stored in a `scraped_events` table and ingested into the main events table. An Admin UI at `/admin/scraping` provides real-time scraper status and a moderation queue.

### Platform Features
Core functionalities include social features (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers). Recent enhancements include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Unified Messaging Inbox, and a Faceless Content System. The Talent Match AI system integrates volunteer onboarding, resume analysis, AI interviews, and an International Payment System supporting 30 currencies. All 276 city groups have valid coordinates, auto-geocoding, and public city pages. A comprehensive Data Quality System is in place.

### Data Architecture & Statistics
The database contains 276 city groups and 254 unique cities with event data, totaling 811 events and 820 active users across 62 countries. All city groups follow the Buenos Aires template specification and have geocoded coordinates.

### Testing & Production
The platform utilizes End-to-End (E2E) tests with Playwright, automated unit test coverage, and visual regression testing. A Volunteer Testing System provides 148 scenarios. Production deployments are managed via GitHub Actions for CI/CD, monitored by Prometheus/Grafana with Sentry, and deployed through Replit Publishing. Redis is used for caching, and PostgreSQL (Neon) with Drizzle ORM for the database.

### Marketing Site Architecture
The marketing site integrates a Human to Agent Collaboration (H2AC) Volunteer Program and an Ambassador Program. Public statistics are backed by real database data, and donations are handled via GoFundMe. The site includes "Coming Soon Features" and updated marketing pages.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **Email:** Replit Resend Connector
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next with 69 language locales