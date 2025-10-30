# PART 1: Quick Start Guide

**Mundo Tango Platform - Complete Implementation Handoff**  
**Version:** 1.0  
**Generated:** October 30, 2025  
**Purpose:** Get started with Mundo Tango development immediately

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Architecture at a Glance](#architecture-at-a-glance)
3. [Tech Stack Decisions](#tech-stack-decisions)
4. [Implementation Timeline](#implementation-timeline)
5. [Getting Started](#getting-started)
6. [Phase Roadmap](#phase-roadmap)
7. [Key Concepts](#key-concepts)
8. [Support & Resources](#support--resources)

---

## Platform Overview

### What is Mundo Tango?

**Mundo Tango** is a comprehensive social platform designed for the global tango community, connecting dancers, teachers, organizers, and enthusiasts worldwide.

**Mission:** Create a vibrant digital space where tango culture thrives through authentic connections, event discovery, and community engagement.

### Core Features

**Social Networking:**
- User profiles with tango-specific information (roles, experience levels)
- Posts and memories feed (photos, videos, stories)
- Friend connections and follows
- Real-time messaging and chat
- Community groups and discussions

**Events & Discovery:**
- Global event calendar (milongas, festivals, workshops)
- Event creation and management
- RSVP and attendance tracking
- Location-based event discovery
- Event live streaming

**Community Platforms:**
- City-specific tango communities
- Housing marketplace for dancers
- Travel preferences and connections
- Favorite destinations sharing

**Intelligence & AI:**
- Mr Blue AI companion (16 specialized Life CEO agents)
- Multi-platform AI integration (OpenAI, Anthropic, Google, Groq, Perplexity)
- Intelligent routing and cost optimization
- Semantic memory and context awareness

**Monetization:**
- Stripe payment integration
- Subscription tiers
- Event ticketing
- Premium features

---

## Architecture at a Glance

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MUNDO TANGO                             │
│                   Global Tango Social Platform                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
        │   FRONTEND   │ │  BACKEND   │ │  DATABASE  │
        │              │ │            │ │            │
        │  React 18    │ │ Express.js │ │ PostgreSQL │
        │  TypeScript  │ │ TypeScript │ │   (Neon)   │
        │  Vite 5.x    │ │  Node 20   │ │  Drizzle   │
        │  Tailwind    │ │  REST API  │ │    ORM     │
        │  shadcn/ui   │ │  Socket.io │ │            │
        └──────────────┘ └────────────┘ └────────────┘
                │               │               │
        ┌───────┴───────────────┴───────────────┴────┐
        │                                             │
┌───────▼────────┐  ┌──────────────┐  ┌─────────────▼──────┐
│   REAL-TIME    │  │      AI      │  │    INTEGRATIONS    │
│                │  │              │  │                    │
│  Socket.io     │  │  Mr Blue     │  │  Stripe Payments   │
│  WebRTC        │  │  5 Providers │  │  File Storage      │
│  Live Streams  │  │  OpenAI      │  │  Email (Resend)    │
│  Chat          │  │  Anthropic   │  │  SMS (Twilio)      │
│  Notifications │  │  Google      │  │  Social OAuth      │
│                │  │  Groq        │  │                    │
│                │  │  Perplexity  │  │                    │
└────────────────┘  └──────────────┘  └────────────────────┘
```

### Data Flow

```
User Request → Frontend (React)
           ↓
    React Query (State Management)
           ↓
    API Request (Fetch/Socket)
           ↓
    Backend API (Express Routes)
           ↓
    ┌──────┴──────┐
    │             │
Database      AI Service
(PostgreSQL)  (Mr Blue)
    │             │
    └──────┬──────┘
           ↓
    Response Data
           ↓
    Cache Update (React Query)
           ↓
    UI Update (React)
```

---

## Tech Stack Decisions

### Frontend: React + Vite + Tailwind

**Why React 18?**
- Industry standard with massive ecosystem
- Concurrent rendering for better UX
- Server Components support (future)
- Strong TypeScript integration

**Why Vite over Create React App?**
- 10x faster cold starts (ESBuild)
- Instant HMR (Hot Module Replacement)
- Smaller bundle sizes
- Native ES modules support
- Better development experience

**Why Tailwind CSS?**
- Utility-first approach (rapid prototyping)
- Consistent design system
- No CSS file bloat
- Responsive by default
- Dark mode built-in

**Why shadcn/ui over Material UI?**
- Copy components (full control)
- Radix UI primitives (accessibility)
- Tailwind-based (consistent styling)
- Tree-shakeable (smaller bundles)
- Modern design aesthetic

### Backend: Express + PostgreSQL + Drizzle

**Why Express.js?**
- Minimal, unopinionated
- Massive middleware ecosystem
- Perfect for REST APIs
- Easy to integrate with Socket.io
- Team familiarity

**Why PostgreSQL over MongoDB?**
- ACID compliance (data integrity)
- Complex queries and joins
- JSON support (best of both worlds)
- Row Level Security (RLS)
- Proven scalability

**Why Drizzle ORM over Prisma?**
- TypeScript-native (better DX)
- Zero runtime overhead
- SQL-like syntax (easy learning)
- Better performance (no query engine)
- Smaller bundle size

### State Management: React Query + Context

**Why React Query over Redux?**
- Server state = 95% of app state
- Automatic caching & refetching
- Optimistic updates built-in
- Less boilerplate (90% reduction)
- Better DevTools

**Why Context API for client state?**
- Theme (dark/light mode)
- Authentication state
- No need for Redux complexity
- React built-in solution

### Real-time: Socket.io

**Why Socket.io over raw WebSockets?**
- Automatic reconnection
- Room management built-in
- Fallback to polling
- Binary data support
- Better browser support

### AI: Multi-Provider Architecture

**Why 5 AI Providers?**
- Cost optimization (route to cheapest)
- Reliability (automatic fallbacks)
- Feature coverage (each has strengths)
- Rate limit distribution
- Future-proof (easy to add more)

**Providers:**
1. **OpenAI** - Best general-purpose, GPT-4, GPT-3.5
2. **Anthropic** - Claude models, longer context
3. **Google** - Gemini, multimodal, free tier
4. **Groq** - Fastest inference, llama-3
5. **Perplexity** - Web-connected, real-time data

---

## Implementation Timeline

### Approach 1: Agent-First (Recommended) - 3-5 Weeks

**Philosophy:** Train AI agents first, then agents build the platform

**Week 1: Agent Training Foundation**
- Train 4 meta-agents (ESA CEO, Documentation, Sprint Manager, Master Control)
- Train 6 Division Chiefs
- Establish training infrastructure

**Weeks 2-3: Bulk Agent Training**
- Train 61 layer agents (parallel training)
- Train 28 specialist agents
- Train 16 Life CEO agents
- Certify all 105 agents

**Week 4: Platform Construction**
- Agents build core features (Parts 5-17)
- Database schema automated
- API endpoints generated
- Frontend components created

**Week 5: Polish & Deploy**
- Testing and QA (Parts 18-25)
- Performance optimization
- Production deployment (Parts 26-30)
- Documentation completion (Parts 31-52)

**Benefits:**
- ✅ Faster long-term development
- ✅ Consistent code quality
- ✅ Self-documenting
- ✅ Scalable to new features
- ✅ Knowledge retention

**Challenges:**
- ⚠️ Longer initial investment
- ⚠️ Requires agent infrastructure
- ⚠️ Learning curve for methodology

---

### Approach 2: MVP Fast - 3-5 Days

**Philosophy:** Build core features manually first, train agents later

**Day 1: Foundation Setup**
- Database schema (PostgreSQL + Drizzle)
- Authentication system (JWT + sessions)
- Basic API structure
- Frontend foundation

**Day 2-3: Core Features**
- User profiles and onboarding
- Posts and feed system
- Events management
- Basic messaging

**Day 4: Integration & Testing**
- Connect frontend to backend
- End-to-end testing
- Bug fixes
- Basic deployment

**Day 5: Polish & Agent Prep**
- Performance optimization
- Documentation
- Prepare for agent training (later)

**Benefits:**
- ✅ Fastest time to MVP
- ✅ Immediate tangible results
- ✅ Traditional development approach
- ✅ Can train agents later with real code

**Challenges:**
- ⚠️ Technical debt accumulation
- ⚠️ Less consistency
- ⚠️ Manual feature additions
- ⚠️ Higher long-term maintenance

---

### Which Approach to Choose?

**Choose Agent-First if:**
- Building for long-term (6+ months)
- Team has AI/automation experience
- Budget allows initial investment
- Need consistent quality at scale

**Choose MVP Fast if:**
- Need proof of concept ASAP
- Traditional dev team
- Budget-constrained initially
- Will scale with traditional methods

**Hybrid Approach (Best of Both):**
1. Days 1-3: Build core MVP manually
2. Week 2: Train priority agents (14 agents)
3. Weeks 3-4: Agents extend features
4. Week 5+: Full agent-driven development

---

## Getting Started

### Prerequisites

**Required Software:**
- Node.js 20.x or higher
- PostgreSQL 15.x or higher (or Neon account)
- Git 2.x
- Code editor (VS Code recommended)

**Required Accounts:**
- Replit account (for deployment)
- Neon/PostgreSQL database
- Stripe account (for payments)
- OpenAI API key (for AI features)

**Optional Accounts:**
- Anthropic, Google AI, Groq, Perplexity (for multi-AI)
- Cloudinary (for media storage)
- Sentry (for error tracking)

### First Steps

**1. Clone and Install**
```bash
git clone <repository-url>
cd mundo-tango
npm install
```

**2. Environment Setup**
```bash
cp .env.example .env
# Edit .env with your credentials
```

**3. Database Setup**
```bash
npm run db:push
```

**4. Start Development**
```bash
npm run dev
```

**5. Access Platform**
- Frontend: http://localhost:5000
- Backend API: http://localhost:5000/api

### Verify Installation

```bash
# Check Node version
node --version  # Should be v20.x.x

# Check packages
npm list --depth=0

# Test database connection
npm run db:studio
```

---

## Phase Roadmap

### Phase 0: Prerequisites (You Are Here!)
**Duration:** 1 day  
**Parts:** 0-2

**Deliverables:**
- ✅ MB.MD Methodology documentation
- ✅ Quick Start Guide (this document)
- ✅ Environment Setup complete

**Status:** Complete after Part 2 ✓

---

### Phase 1: Agent Training First
**Duration:** 1-3 weeks (if using Agent-First approach)  
**Parts:** 3-4

**Deliverables:**
- ESA Framework Overview (105 agents, 61 layers)
- Agent Training System (Ultra-Micro Parallel)
- 5-Day ESA Bootcamp materials
- 7 Certified Methodologies

**Key Agents:**
- Meta-agents (4): CEO, Documentation, Sprint Manager, Master Control
- Division Chiefs (6): Foundation, Core, Business, Intelligence, Platform, Extended
- Layer Agents (61): Specialized execution agents
- Specialists (28): Experts + Life CEO + Operational
- Custom (6): Mr Blue + Project-specific

**Training Methods:**
- Ultra-Micro Parallel (480x faster)
- Sequential Depth-First
- Parallel Breadth-First
- Hybrid Balanced
- Conservative Batch
- Aggressive Parallel
- Certification Framework

---

### Phase 2: Core Setup
**Duration:** 1 week  
**Parts:** 5-9

**Deliverables:**
- Database Setup (PostgreSQL + Drizzle) - 40+ tables
- Authentication System (JWT + 2FA)
- Frontend Foundation (React + Routing)
- Design System (MT Ocean Theme)
- API Structure (REST + Storage)

**Key Features:**
- Complete database schema
- User authentication and sessions
- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Design tokens and components

---

### Phase 3: Features
**Duration:** 2 weeks  
**Parts:** 10-17

**Deliverables:**
- Posts & Feed System
- Events Management
- Communities & Groups
- Real-Time Messaging (WebSockets)
- File Uploads (Storage)
- AI Intelligence (5 platforms + Mr Blue)
- Stripe Payments (Subscriptions)
- Search & Analytics

**Key Features:**
- Social networking complete
- Event discovery and RSVP
- Community platforms
- Live chat and notifications
- Media upload and storage
- AI companion integration
- Payment processing
- Full-text search

---

### Phase 4: Polish
**Duration:** 1 week  
**Parts:** 18-25

**Deliverables:**
- Internationalization (68 languages)
- Accessibility (WCAG 2.1 AA)
- Testing Complete (Vitest, Playwright)
- Performance Optimization
- Security Hardening (RBAC, RLS, 2FA)
- Mobile & PWA
- Customer Journeys (15 journeys, 88 routes)
- Component Library (70+ components)

**Key Features:**
- Multi-language support
- Screen reader compatible
- Comprehensive test coverage
- Sub-second page loads
- Security audit passed
- Mobile-first responsive
- Documented user flows
- Reusable component library

---

### Phase 5: Operations & Deployment
**Duration:** 1-2 weeks  
**Parts:** 26-52

**Deliverables:**

**Deployment (26-30):**
- Production deployment (Vercel, AWS, Railway)
- Monitoring & logging (Sentry, Prometheus)
- Disaster recovery basics
- Scaling strategies
- Troubleshooting guide

**Documentation (31-37):**
- Page architecture & data flows
- Page agents (P1-P50)
- Element agents (E1-E1000+)
- Algorithm agents (A1-A50)
- Specialized agents index (1255+ total)
- API reference complete (100+ endpoints)
- Database schema complete (40+ tables)

**Critical Operations (38-41):**
- Production operations playbook
- Secrets management guide
- Data migration procedures
- Disaster recovery detailed

**Team & Development (42-47):**
- Development environment setup
- Team onboarding guide
- Third-party API integration
- Replit platform configuration
- CI/CD pipeline configuration
- Git workflow & branching

**Standards (48-52):**
- Legal & compliance
- Error handling standards
- Performance benchmarks
- API rate limiting
- WebSocket architecture

---

## Key Concepts

### ESA Framework

**ESA** = **E**xpert **S**pecialized **A**gents

A hierarchical system of 105 AI agents organized into 6 divisions across 61 specialized layers.

**Hierarchy:**
```
Board of Directors (Agent #0 - ESA CEO)
    ↓
Division Chiefs (6 agents)
    ↓
Layer Agents (61 agents)
    ↓
Specialist Agents (28 agents)
    ↓
Custom Agents (6 agents)
```

**6 Divisions:**
1. **Foundation** (Layers 1-10): Database, API, Auth, Security, Components
2. **Core** (Layers 11-20): Real-time, Data, Files, Caching, Analytics
3. **Business** (Layers 21-30): Users, Groups, Events, Social, Messaging
4. **Intelligence** (Layers 31-46): AI Infrastructure + 16 Life CEO agents
5. **Platform** (Layers 47-56): Mobile, Performance, Testing, i18n
6. **Extended** (Layers 57-61): Automation, GitHub, Open Source

---

### MB.MD Methodology

**MB.MD** = **M**undo **B**lue **M**ethodology **D**irective

Three core principles for executing complex tasks:

1. **SIMULTANEOUSLY** - Execute all independent operations in parallel
2. **RECURSIVELY** - Deep-dive into every subsystem until complete
3. **CRITICALLY** - Apply rigorous quality standards at every level

**Usage:** "Use MB.MD: [task description]"

**Example:**
```
Use MB.MD: Create all 52 handoff documentation parts

Result:
- All 52 docs created in parallel
- Each doc explores topic to atomic level
- 100% coverage verified
- Production quality ensured
```

See [Part 0: MB.MD Methodology](./part-0-mbmd-methodology.md) for complete details.

---

### Agent 6-Phase Methodology

Every ESA agent follows this execution pattern:

**Phase 0: Pre-Flight Check**
- Verify 0 LSP errors (TypeScript issues)
- Check code health before starting
- Critical: Never skip this step!

**Phase 1: Discovery**
- Understand the task completely
- Identify all components involved
- Map dependencies

**Phase 2: Fix/Implement**
- Execute the actual work
- Follow MB.MD principles
- Write tests as you go

**Phase 3: Validation**
- Run tests
- Verify functionality
- Check LSP again

**Phase 4: Deployment**
- Deploy changes if needed
- Update documentation
- Notify stakeholders

**Phase 5: Monitoring**
- Watch for issues
- Collect metrics
- Continuous improvement

---

### Agent Communication Protocols

**A2A (Agent-to-Agent):**
- Escalation protocol when stuck
- Delegate to specialized agents
- Collaborate on complex tasks

**A2H (Agent-to-Human):**
- Request clarification
- Report completion
- Escalate blockers

**H2A (Human-to-Agent):**
- Task assignment
- Feedback and iteration
- Strategic direction

---

## Support & Resources

### Documentation Locations

**Phase 0 (Prerequisites):**
- `docs/phase-0/part-0-mbmd-methodology.md` - MB.MD protocol
- `docs/phase-0/part-1-quick-start.md` - This document
- `docs/phase-0/part-2-environment-setup.md` - Setup guide

**Other Phases:**
- `docs/phase-1/` - Agent training documentation
- `docs/phase-2/` - Core setup guides
- `docs/phase-3/` - Feature implementation
- `docs/phase-4/` - Polish and optimization
- `docs/phase-5/` - Operations and deployment

### Getting Help

**For Technical Issues:**
1. Check `docs/troubleshooting/` directory
2. Review error logs in `logs/`
3. Search GitHub issues
4. Ask in team Slack/Discord

**For Agent Training:**
1. Read Part 4: Agent Training Complete System
2. Follow 5-Day ESA Bootcamp
3. Review certified methodologies
4. Practice with sandbox tasks

**For Development Questions:**
1. Review relevant Phase documentation
2. Check code examples in `examples/`
3. Examine existing implementation
4. Consult with Division Chief agents

### Important Files

**Configuration:**
- `.env.example` - Environment variables template
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite configuration
- `tailwind.config.ts` - Tailwind configuration

**Source Code:**
- `client/` - Frontend React application
- `server/` - Backend Express application
- `shared/` - Shared types and schemas
- `db/` - Database migrations and seeds

**Documentation:**
- `docs/` - All platform documentation
- `ARCHITECTURE.md` - System architecture
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history

---

## Next Steps

✅ **You've completed Part 1: Quick Start Guide**

**Continue to:**
→ [Part 2: Environment Setup](./part-2-environment-setup.md)

After completing Phase 0, choose your path:
- **Agent-First?** → Proceed to Phase 1 (Parts 3-4)
- **MVP Fast?** → Skip to Phase 2 (Parts 5-9)

**Remember:** Follow the MB.MD methodology for everything you build!

---

**Generated:** October 30, 2025  
**Version:** 1.0  
**Part of:** Mundo Tango Complete Implementation Handoff  
**Previous:** [Part 0: MB.MD Methodology](./part-0-mbmd-methodology.md)  
**Next:** [Part 2: Environment Setup](./part-2-environment-setup.md)
