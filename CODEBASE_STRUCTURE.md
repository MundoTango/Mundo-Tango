# Mundo Tango Codebase Structure

> **Quick Navigation Guide** - Where everything lives

## 📁 Project Overview

```
Mundo-Tango/
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express backend (Node + TypeScript)
├── shared/          # Shared types & schemas (Drizzle ORM)
├── public/          # Static assets
└── scripts/         # Build & deployment automation
```

---

## 🎯 Frontend (`client/src/`)

### Pages (~50 active)

```
pages/
├── HomePage.tsx              # Landing page (/)
├── LoginPage.tsx             # Auth (/login)
├── EventsPage.tsx            # Events feed (/events)
├── HousingPage.tsx           # Housing listings (/housing)
├── TalentMatchPage.tsx       # Volunteer matching (/talent)
├── FeedPage.tsx              # Social feed (/feed)
└── _archived/                # Historical experiments (DO NOT USE)
```

### Components (~200 active)

```
components/
├── ui/                       # shadcn/ui primitives (Button, Card, etc.)
├── AppSidebar.tsx            # Main navigation
├── TopBar.tsx                # User menu & notifications
├── EventCard.tsx             # Event display
├── HousingListingCard.tsx    # Housing display
└── features/                 # Feature-specific components
    ├── events/
    ├── social/
    ├── housing/
    └── talent/
```

### Routes (`routes/`)

```
routes/
├── route-config.ts           # ⚠️ Route definitions (commented experimental)
├── authRoutes.tsx            # Auth flow
├── eventsRoutes.tsx          # Events pages
├── housingRoutes.tsx         # Housing pages
├── talentRoutes.tsx          # Talent Match
└── mrBlueRoutes.tsx          # Mr. Blue AI Chat ✅ ACTIVE
```

---

## ⚙️ Backend (`server/`)

### Main Entry

```
server/
├── index.ts                  # Express server entry
├── routes.ts                 # ⚠️ 430KB, 11,367 lines (SEE BELOW)
├── storage.ts                # ⚠️ 330KB database layer
└── vite.ts                   # Vite dev server integration
```

### Routes (`server/routes/`)

**200+ Modular Route Files** (already good!):

```
routes/
├── auth/                     # Authentication
├── event-routes.ts           # Events CRUD
├── housing-routes.ts         # Housing listings
├── talent-match-routes.ts    # Volunteer system
├── mrblue/                   # Mr. Blue AI (30+ files)
├── admin-routes.ts           # Admin panel
└── ... 170+ more
```

**⚠️ Complexity Hotspot: `server/routes.ts`**

This file contains:

- 200+ route imports (lines 1-221)
- 200+ inline route handlers (`app.get`, `app.post`)
- Domains mixed in one file:
  - Profile routes (photographer, performer, vendor, etc.)
  - Social routes (posts, comments, reactions, stories)
  - Settings routes (privacy, exports, sessions)
  - Event routes (create, RSVP, scraping)
  - Messaging routes
  - Notifications
  - Community features

**Why not split immediately?**

- Works in production (don't break what works)
- Many routes already modular (imported)
- Requires comprehensive endpoint testing
- Better to document first, refactor when needed

---

### Services (`server/services/`) - 423 files 😱

**Core Services** (frequently used):

```
services/
├── ai/
│   ├── openai-service.ts     # GPT integration
│   └── anthropic-service.ts  # Claude integration
├── notification-service.ts   # Real-time notifications
├── websocket*.ts             # WebSocket services (5 files)
├── profile-enrichment.ts     # User profiles
├── resume-parser.ts          # Document parsing
└── cityscape-service.ts      # Location features
```

**⚠️ Service Sprawl**:

- 50+ orchestration files (agent system)
- 20+ AI-related services
- 30+ domain-specific services (events, housing, etc.)
- Many one-off utilities

**Consolidation Opportunity**: Future work to merge redundant services

---

### Storage Layer (`server/storage.ts`) - 330KB

Single-file database interface with all queries:

```typescript
// User operations
export const userRepository = {
  createUser(), updateUser(), getUserByEmail(), ...
}

// Event operations
export const eventRepository = {
  createEvent(), getEventById(), updateEvent(), ...
}

// Post operations
export const postRepository = {
  createPost(), deletePost(), getPostsByUser(), ...
}

// ... 15+ more repositories
```

**Future**: Split into `storage/users.ts`, `storage/events.ts`, etc.

---

## 🗄️ Database (`shared/schema.ts`)

Drizzle ORM schemas:

```typescript
// Core tables
users, posts, events, groups, chatMessages, ...

// Profile tables (15+ types)
teacherProfiles, djProfiles, photographerProfiles, ...

// Feature tables
housingListings, travelPlans, achievements, ...
```

---

## 🎨 Styles

```
client/src/
├── index.css                 # Global styles + Tailwind
└── styles/
    ├── theme.css
    └── components.css
```

---

## 🧪 Testing

```
playwright-tests/
├── e2e/                      # End-to-end tests
└── integration/              # API integration tests
```

---

## 📦 Key Dependencies

**Frontend**:

- React 18 + Vite
- TanStack Query (data fetching)
- shadcn/ui (components)
- Tailwind CSS (styling)
- i18next (internationalization)

**Backend**:

- Express (server)
- Drizzle ORM (database)
- PostgreSQL (database)
- Bull (job queues)
- Redis (caching)

---

## 🚀 Getting Started

1. **Install**: `npm install`
2. **Database**: Setup PostgreSQL
3. **Environment**: Copy `.env.example` to `.env`
4. **Dev Server**: `npm run dev`
5. **Access**: http://localhost:5000

---

## 🔥 Complexity Hotspots

### High Priority (Hard to Navigate)

1. **`server/routes.ts`** - 11,367 lines
2. **`server/storage.ts`** - 330KB
3. **`server/services/`** - 423 files

### Medium Priority

4. **Root directory** - 188 files (mostly docs)
5. **`client/src/pages/`** - 376 files (includes \_archived)

---

## 💡 Quick Tips

- **Adding a route?** → Check if modular file exists in `server/routes/`
- **Database query?** → Use repository in `server/storage.ts`
- **New component?** → Create in `client/src/components/features/{domain}/`
- **AI features?** → Most are in `server/services/ai/` or `server/routes/mrblue/`
- **Lost?** → Search codebase: `grep -r "keyword" server/ client/`

---

## 📚 Additional Documentation

- [README.md](../README.md) - Project overview
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Dev guidelines
- [mb.md](../mb.md) - MB.MD vibe council methodology

---

_Last Updated: 2026-01-31_
_Vibe Council Approved ✨_
