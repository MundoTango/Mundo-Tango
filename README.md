# Mundo Tango

**Global Tango Community Platform**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-org/mundo-tango)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-TBD-lightgrey)](LICENSE)

**Platform Metrics:**
- 🎯 **133 Operational Pages** across 10 feature categories
- 🗄️ **263 Database Tables** with full ACID compliance
- 🧠 **50+ Production Algorithms** for social intelligence and matching
- 🤖 **1,255+ ESA Agents** coordinating development and operations
- ✅ **74 E2E Tests** with self-healing capabilities

---

## Table of Contents

1. [Overview](#overview)
2. [Business Vision](#business-vision)
3. [Key Features](#key-features)
4. [Technology Stack](#technology-stack)
5. [Quick Start](#quick-start)
6. [Project Structure](#project-structure)
7. [Documentation](#documentation)
8. [Development](#development)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Contributing](#contributing)
12. [License](#license)

---

## Overview

Mundo Tango is a comprehensive social platform designed to connect the global tango community, including dancers, teachers, organizers, and enthusiasts. The platform fosters tango culture through authentic connections, event discovery, and AI-powered personal assistance.

### Core Capabilities

- **Social Networking:** Full-featured feed, profiles, friendships, messaging, and real-time notifications
- **Event Management:** Comprehensive event discovery, RSVP, analytics, and community organization
- **Talent Matching:** AI-powered resume parsing and task assignment for volunteers and opportunities
- **Housing Marketplace:** 6-step wizard for hosting tango travelers with advanced filtering and map views
- **AI Companions:** Mr. Blue chat assistant + 16 Life CEO agents for personalized support
- **3D Avatars:** Luma AI integration for Pixar-style avatar generation from user photos
- **Self-Healing Infrastructure:** Automated error detection and recovery across all 125 pages

### Platform Architecture

Built on the **ESA (Expert System Architecture) Framework** with 1,255+ specialized AI agents coordinating development, monitoring, and operations. The platform follows the **MB.MD Protocol** (Mundo Blue Methodology Directive) for quality assurance and parallel execution.

---

## Business Vision

Become the leading digital hub for the global tango ecosystem by:

- **Connecting Communities:** Unite dancers, teachers, venues, and organizers worldwide
- **Event Monetization:** Premium listings, featured placements, and ticket integration
- **Subscription Tiers:** 8-level RBAC system (Free → Premium → God) with progressive feature access
- **Targeted Services:** Dance partner matching, teacher-student connections, housing for travelers
- **International Scale:** Multi-language support, global event calendar, city-specific communities

**Revenue Streams:**
- Premium memberships and subscription tiers
- Event promotion and ticketing fees
- Housing marketplace commissions
- Targeted advertising and sponsored content
- API access for third-party integrations

---

## Key Features

### 🎨 MT Ocean Design System
- **Primary Color:** Turquoise `#14b8a6` (teal-500)
- **Typography:** Inter font family with 400-600 weights
- **Theme:** Unified MT Ocean across all 133 pages
- **Components:** 3-layer token system (Primitive → Semantic → Component)
- **Dark Mode:** Full support with automatic theme switching
- **Accessibility:** WCAG 2.1 AA compliant components via shadcn/ui

### 🤖 AI-Powered Intelligence
- **Mr. Blue:** AI companion using Groq SDK for streaming chat responses
- **16 Life CEO Agents:** Personal assistants for fitness, finance, health, nutrition, career, relationships, and more
- **Talent Match AI:** Resume parsing and automatic task assignment
- **Predictive Context:** User navigation prediction and cache warming
- **Content Moderation:** Automated spam detection and quality scoring

### 🛡️ Self-Healing Error Boundaries
- **Coverage:** 125/125 pages (100% excluding 404)
- **Pattern Learning:** Tracks error patterns across sessions
- **Auto-Recovery:** Up to 3 recovery attempts with graceful degradation
- **Smart Fallbacks:** Intelligent routing to related functional pages
- **Persistence:** localStorage tracking for recurring issues

### 👥 Advanced Friendship System
- **Closeness Scoring:** Algorithm-based relationship strength measurement
- **Connection Pathfinding:** BFS algorithm to find mutual friends and degrees of separation
- **Media Sharing:** Upload up to 10 files (10MB each) with dance stories
- **Activity Timeline:** Track friendship milestones and shared experiences
- **Request Workflow:** Customizable messages, media attachments, dance history

### 🏠 Housing Marketplace
- **6-Step Host Wizard:** Property details, location, pricing, amenities, images, house rules
- **21 Amenities:** Including tango-specific (dance floor, sound system, near milongas)
- **Advanced Filtering:** Property type, price range, beds/baths, city/country search
- **Map Integration:** Toggle between list and map views
- **Friends-Only Mode:** Restrict listings to trusted connections
- **Multi-Currency:** Support for USD, EUR, ARS, and more

### 🎭 3D Avatar Designer
- **4-Photo Upload:** Drag-and-drop interface with 10MB validation per file
- **Luma AI Integration:** Pixar-style 3D avatar generation
- **Customization Controls:** Character name, style, outfit, expression, pose
- **Real-Time Status:** Progress tracking (Queued → Dreaming → Completed)
- **Generation History:** Last 5 avatars with timestamps
- **Profile Integration:** Set generated avatars as profile pictures

### 📊 50+ Production Algorithms

**Social Intelligence (11 algorithms):**
- Content Recommendation (Feed Ranking)
- Viral Content Detection
- Hashtag Analysis
- Network Effect Measurement
- Influencer Detection
- Spam Detection
- Quality Scoring
- Sentiment Analysis
- Trending Topics

**Event Intelligence (6 algorithms):**
- Event Recommendation
- Attendance Prediction
- Optimal Event Timing
- Duplicate Event Detection
- Event Categorization

**Matching Engine (4 algorithms):**
- Teacher-Student Matching
- Dance Partner Matching
- Music Preference Matching
- Skill Level Assessment

**Platform Intelligence (29+ algorithms):**
- Location Proximity
- Churn Prevention
- Fraud Detection
- Image Recognition
- Pricing Optimization
- Autocomplete
- And 23+ more...

### 🔄 Real-Time Features
- **WebSocket Notifications:** Live updates for messages, friend requests, event invites
- **Supabase Realtime:** Live feed updates, online presence, typing indicators
- **Optimistic Updates:** Instant UI feedback with automatic rollback on errors
- **Background Sync:** BullMQ workers with 39 automation functions across 6 queues

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI framework with concurrent rendering |
| **TypeScript** | 5.6.3 | Type-safe development |
| **Vite** | 5.4.20 | Build tool with HMR |
| **Wouter** | 3.3.5 | Lightweight routing (1.6KB) |
| **TanStack Query** | 5.60.5 | Server state management |
| **shadcn/ui** | Latest | Accessible component primitives |
| **Tailwind CSS** | 3.4.17 | Utility-first styling |
| **Framer Motion** | 11.13.1 | Animation library |
| **Lucide React** | 0.453.0 | Icon library |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20.x | JavaScript runtime |
| **Express.js** | 4.21.2 | REST API server |
| **TypeScript** | 5.6.3 | Type-safe development |
| **Drizzle ORM** | 0.39.1 | TypeScript-native ORM |
| **PostgreSQL** | 14+ | Relational database |
| **Neon** | Latest | Serverless PostgreSQL |
| **BullMQ** | 5.63.0 | Job queue management |
| **Passport.js** | 0.7.0 | Authentication |
| **JWT** | 9.0.2 | Token-based auth |

### AI & External Services

| Service | Purpose |
|---------|---------|
| **OpenAI** | AI chat and content generation |
| **Groq SDK** | Fast AI inference for Mr. Blue |
| **Anthropic** | Claude AI integration |
| **Luma Dream Machine** | 3D avatar generation |
| **Supabase Realtime** | WebSocket and live updates |
| **Stripe** | Payment processing |

### DevOps & Testing

| Tool | Purpose |
|------|---------|
| **Playwright** | E2E testing framework |
| **GitHub Actions** | CI/CD pipelines |
| **Vercel** | Frontend hosting |
| **Railway** | Backend hosting |
| **Neon** | Database hosting |

---

## Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **PostgreSQL** 14+ (or Neon account)
- **npm** or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/mundo-tango.git
cd mundo-tango

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/mundo_tango

# Authentication
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here

# AI Services
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
ANTHROPIC_API_KEY=sk-ant-...
LUMA_API_KEY=luma_...

# Real-time
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

### Development Commands

```bash
# Start dev server (port 5000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database operations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio

# Testing
npm run test         # Run Playwright tests
npm run test:ui      # Run tests with UI
```

---

## Project Structure

```
mundo-tango/
├── client/                 # React frontend (133 pages)
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   ├── adaptive/ # Responsive components
│   │   │   ├── mrblue/   # AI chat components
│   │   │   └── platform/ # Platform-specific components
│   │   ├── pages/        # Route components
│   │   │   ├── admin/    # Admin dashboard pages
│   │   │   ├── hr/       # HR agent pages
│   │   │   ├── life-ceo/ # Life CEO agent pages
│   │   │   ├── marketing/# Marketing agent pages
│   │   │   └── onboarding/# User onboarding flow
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility libraries
│   │   ├── contexts/     # React contexts
│   │   ├── config/       # Configuration files
│   │   │   └── tokens/   # Design tokens
│   │   └── styles/       # Global styles
│   └── index.html        # HTML entry point
│
├── server/                # Express backend
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   ├── services/         # Business logic services
│   ├── algorithms/       # 50+ production algorithms
│   ├── workers/          # BullMQ background workers
│   ├── lib/              # Server utilities
│   └── index.ts          # Server entry point
│
├── shared/               # Shared types & schemas
│   ├── schema.ts         # Drizzle database schema
│   ├── db.ts            # Database connection
│   └── route-config.ts  # Route configuration
│
├── docs/                 # 70+ documentation files
│   ├── algorithms/       # Algorithm documentation
│   ├── api/             # API documentation
│   ├── database/        # Database schema docs
│   ├── features/        # Feature documentation
│   ├── handoff/         # Handoff guides
│   ├── phase-0/         # MB.MD methodology
│   └── phase-1/         # ESA agent training
│
├── tests/                # Playwright E2E tests
│   ├── e2e/             # End-to-end test specs
│   │   ├── pages/       # Page object models
│   │   ├── helpers/     # Test utilities
│   │   └── fixtures/    # Test data
│   └── deployment/      # Deployment validation tests
│
├── attached_assets/      # Design assets & uploads
├── migrations/          # Database migrations
├── scripts/             # Utility scripts
│
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
├── playwright.config.ts # Playwright configuration
├── drizzle.config.ts    # Drizzle ORM configuration
└── package.json         # Dependencies
```

### Key Directories

- **`client/src/pages/`**: 133 operational pages organized by feature area
- **`server/algorithms/`**: 50+ production-ready algorithms for intelligence features
- **`docs/`**: 70+ markdown documentation files covering architecture, APIs, features
- **`tests/e2e/`**: 74 comprehensive E2E tests with self-healing locators
- **`shared/schema.ts`**: 263 database tables defined with Drizzle ORM

---

## Documentation

### Core Documentation Files

- **[ESA_FRAMEWORK.md](docs/ESA_FRAMEWORK.md)** - Complete ESA agent hierarchy and coordination (1,255+ agents)
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[TECH_STACK.md](docs/TECH_STACK.md)** - Detailed technology stack documentation
- **[TEST-MANIFEST.md](docs/TEST-MANIFEST.md)** - Complete test suite catalog (74 tests)
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Database schema documentation (263 tables)
- **[DEPLOYMENT_ARCHITECTURE.md](docs/DEPLOYMENT_ARCHITECTURE.md)** - Deployment and hosting guide

### Feature Documentation

- **[FRIENDSHIP_SYSTEM.md](docs/features/FRIENDSHIP_SYSTEM.md)** - Advanced friendship algorithms
- **[HOUSING_PLATFORM.md](docs/features/HOUSING_PLATFORM.md)** - Housing marketplace implementation
- **[AI_CHAT_MRBLUE.md](docs/features/AI_CHAT_MRBLUE.md)** - Mr. Blue AI companion
- **[SELF_HEALING.md](docs/features/SELF_HEALING.md)** - Self-healing error boundaries
- **[PREDICTIVE_CONTEXT.md](docs/features/PREDICTIVE_CONTEXT.md)** - Navigation prediction service

### API Documentation

- **[AUTH_API.md](docs/api/AUTH_API.md)** - Authentication endpoints
- **[SOCIAL_API.md](docs/api/SOCIAL_API.md)** - Social features API
- **[EVENTS_API.md](docs/api/EVENTS_API.md)** - Event management API
- **[MESSAGING_API.md](docs/api/MESSAGING_API.md)** - Messaging system API
- **[HOUSING_API.md](docs/api/HOUSING_API.md)** - Housing marketplace API

### Algorithm Documentation

- **[SOCIAL_INTELLIGENCE.md](docs/algorithms/SOCIAL_INTELLIGENCE.md)** - Social algorithms
- **[EVENT_INTELLIGENCE.md](docs/algorithms/EVENT_INTELLIGENCE.md)** - Event algorithms
- **[MATCHING_ENGINE.md](docs/algorithms/MATCHING_ENGINE.md)** - Matching algorithms
- **[PLATFORM_INTELLIGENCE.md](docs/algorithms/PLATFORM_INTELLIGENCE.md)** - Platform algorithms

### MB.MD Protocol Documentation

- **[MB_MD_MASTER_GUIDE.txt](docs/handoff/MB_MD_MASTER_GUIDE.txt)** - Complete methodology guide
- **[MB_MD_QUICK_REFERENCE.txt](docs/handoff/MB_MD_QUICK_REFERENCE.txt)** - Quick reference guide
- **[mb.md](mb.md)** - Project execution protocol

---

## Development

### God User Credentials

For development and testing, use the pre-seeded God user account:

```
Email: admin@mundotango.life
Password: MundoTango2025!Admin
Access Level: 8 (God)
```

**Features Available:**
- Full platform access
- Admin dashboard
- Agent health monitoring
- Feature flag management
- User role management
- System configuration

### RBAC System (8 Tiers)

| Level | Role | Access |
|-------|------|--------|
| **8** | God | Full platform control |
| **7** | Super Admin | Platform administration |
| **6** | Platform Vol | Development team |
| **5** | Admin | Content moderation |
| **4** | Community | Community management |
| **3** | Premium | Paid features |
| **2** | Basic | Standard features |
| **1** | Free | Limited features |

### Database Setup

#### Using Neon (Recommended)

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `.env` as `DATABASE_URL`
4. Run `npm run db:push` to sync schema

#### Using Local PostgreSQL

```bash
# Install PostgreSQL 14+
# Create database
createdb mundo_tango

# Update .env
DATABASE_URL=postgresql://localhost:5432/mundo_tango

# Push schema
npm run db:push

# Optional: Seed data
npm run seed
```

### Feature Flags

The platform uses dynamic feature flags for gradual rollouts:

```typescript
// Check feature flag
const isChatEnabled = await featureFlagService.isEnabled('mr_blue_chat', userId);

// Enable for specific users
await featureFlagService.enableForUsers('housing_marketplace', [userId1, userId2]);

// Enable by percentage
await featureFlagService.enableByPercentage('3d_avatars', 50);
```

### Background Workers

6 dedicated workers handle automation:

```bash
# User Lifecycle Worker - 10+ automations
# Social Automation Worker - 10+ automations
# Event Automation Worker - 8+ automations
# Life CEO Worker - 10+ automations
# Housing Worker - 5+ automations
# Admin Worker - 6+ automations
```

**Redis Optional:** Workers use in-memory fallback if Redis is unavailable.

---

## Testing

### Test Suite Overview

**Total Tests:** 74 comprehensive E2E tests
- **58 Page Tests** - Every platform page validated
- **16 Journey Tests** - Complete user flows

### Running Tests

```bash
# Run all tests
npm run test

# Run with UI mode
npm run test:ui

# Run specific test file
npx playwright test tests/e2e/01-public-marketing.spec.ts

# Run in headed mode
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

### Test Features

**Self-Healing Locators:**
- 80%+ auto-recovery from UI changes
- Fallback strategies for element detection
- Automatic retry with alternative selectors

**Mr. Blue AI Reporter:**
- Intelligent pattern detection in failures
- Automated issue categorization
- Failure correlation across test runs

**Video Recording:**
- All tests recorded for debugging
- Saved in `test-videos/` directory
- Trace files for detailed inspection

### Test Categories

1. **Deployment Tests** (`tests/deployment/`)
   - Environment validation
   - Security and authentication
   - Performance benchmarks

2. **E2E Platform Tests** (`tests/e2e/`)
   - Public pages (9 tests)
   - Authenticated pages (29 tests)
   - Admin pages (8 tests)
   - AI features (6 tests)
   - Customer journeys (16 tests)

3. **Visual Tests** (`tests/visual/`)
   - Design system validation
   - Theme consistency checks
   - Responsive design verification

### Page Object Models

32 reusable page objects in `tests/e2e/pages/`:
- `LoginPage.ts`
- `HomePage.ts`
- `ProfilePage.ts`
- `EventsPage.ts`
- `HousingListingsPage.ts`
- And 27+ more...

---

## Deployment

### Production Infrastructure

**Frontend:** Vercel
- Automatic deployments from `main` branch
- Edge network with global CDN
- Serverless functions for API routes

**Backend:** Railway
- Containerized Express.js server
- Automatic scaling
- Built-in monitoring

**Database:** Neon PostgreSQL
- Serverless database
- Automatic backups
- Branch-based development

**Real-time:** Supabase
- WebSocket connections
- Presence tracking
- Live updates

### CI/CD Pipeline

GitHub Actions workflow:

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    - Type checking
    - Unit tests
    - E2E tests
    - Performance audits
  
  deploy:
    - Build frontend
    - Build backend
    - Deploy to Vercel
    - Deploy to Railway
    - Run smoke tests
```

### Environment-Specific Configuration

**Development:**
- Local PostgreSQL or Neon branch
- Redis optional (in-memory fallback)
- Debug logging enabled
- Hot module reloading

**Staging:**
- Neon branch database
- Full Redis for queues
- Production-like config
- E2E test validation

**Production:**
- Neon production database
- Redis for queues and cache
- Error tracking (Sentry)
- Performance monitoring

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Feature flags reviewed
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security headers configured
- [ ] SSL certificates valid
- [ ] Monitoring alerts set up

---

## Contributing

### MB.MD Protocol

Mundo Tango follows the **MB.MD Protocol** (Mundo Blue Methodology Directive):

**Core Principles:**
- **Work Simultaneously:** Parallel execution of independent tasks
- **Work Recursively:** Deep exploration of dependencies
- **Work Critically:** Rigorous quality assurance at every step

**Development Phases:**
1. **Phase 0:** Methodology and environment setup
2. **Phase 1:** ESA agent training and ecosystem setup
3. **Phase 2:** Feature development and integration
4. **Phase 3:** Testing and quality assurance
5. **Phase 4:** Deployment and monitoring

### ESA Framework

Development is coordinated by **1,255+ ESA agents** across 6 categories:

**Agent Hierarchy:**
- **1 ESA CEO** - Strategic oversight
- **6 Division Chiefs** - Foundation, Core, Business, Intelligence, Platform, Extended
- **61 Layer Agents** - Database, auth, real-time, events, content moderation
- **7 Expert Agents** - AI research, UI/UX, data visualization, code quality
- **5 Operational Agents** - Sprint management, documentation, deployment
- **16 Life CEO Agents** - Personal AI assistants
- **9 Custom Agents** - Pattern learning, Mr. Blue system

**Extended Ecosystem:**
- **50 Page Agents** - One per page/view
- **1,000+ Element Agents** - Component-level specialists
- **50 Algorithm Agents** - Business logic experts
- **20 Journey Agents** - User flow management
- **30 Data Flow Agents** - Pipeline orchestration

### Code Standards

**TypeScript:**
- Strict mode enabled
- No `any` types without justification
- Comprehensive JSDoc comments

**React:**
- Functional components only
- Custom hooks for reusable logic
- Proper error boundaries
- Accessibility attributes (`data-testid`)

**CSS:**
- Tailwind utility classes
- Design tokens for consistency
- Mobile-first responsive design

**Testing:**
- Page object model pattern
- Self-healing locators
- Minimum 80% coverage for critical paths

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow code standards
   - Add tests for new features
   - Update documentation

3. **Run Quality Checks**
   ```bash
   npm run check      # Type checking
   npm run test       # E2E tests
   npm run lint       # Linting
   ```

4. **Submit PR**
   - Clear description of changes
   - Link to related issues
   - Tag relevant reviewers
   - Include screenshots for UI changes

5. **Code Review**
   - Automated checks must pass
   - At least 1 approval required
   - All comments resolved

6. **Merge**
   - Squash and merge to main
   - Delete feature branch
   - Automatic deployment triggered

---

## License

**TBD** - License to be determined.

For questions or commercial licensing inquiries, please contact:
- Email: [contact@mundotango.life](mailto:contact@mundotango.life)
- Website: [https://mundotango.life](https://mundotango.life)

---

## Support

### Documentation
- Full documentation available in [`docs/`](docs/) directory
- Quick start guide: [`docs/phase-0/part-1-quick-start.md`](docs/phase-0/part-1-quick-start.md)
- Troubleshooting: [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md)

### Community
- GitHub Issues: Report bugs and request features
- Discussions: Share ideas and get help
- Discord: Join our developer community (coming soon)

### Development Team
Built with the **MB.MD Protocol** by the Mundo Tango team.

---

**Mundo Tango** - Connecting the global tango community, one dance at a time. 💃🕺
