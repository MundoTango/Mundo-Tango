# ADR-001: Modular Route Architecture

**Date**: 2026-01-23  
**Status**: ✅ ACCEPTED (Already Implemented)  
**Sprint**: 1.2

---

## Context

The Mundo Tango application has 451 API endpoints across numerous domains (events, posts, users, tango profiles, AI agents, etc.). Managing all routes in a single file would create an unmaintainable monolith.

## Decision

**Adopt modular router pattern** with domain-based route organization.

### Structure

```
server/
├── routes.ts              # Main router registration (11,366 lines)
└── routes/                # Modular route files (~200+ files)
    ├── auth/              # Authentication routes
    ├── event-routes.ts    # Event management
    ├── post-routes.ts     # Social posts
    ├── user-routes.ts     # User management
    ├── venue-routes.ts    # Venue management
    ├── mrblue/            # AI agent routes
    ├── admin-routes.ts    # Admin panel
    └── ...                # 200+ more route modules
```

### Pattern

Each route module follows this pattern:

```typescript
// server/routes/domain-routes.ts
import type { Express } from "express";
import { authenticateToken } from "../middleware/auth";
import { storage } from "../storage";

export default function registerDomainRoutes(app: Express) {
  app.get("/api/domain", authenticateToken, async (req, res) => {
    // Route handler
  });

  app.post("/api/domain", authenticateToken, async (req, res) => {
    // Route handler
  });
}

// In routes.ts
import domainRoutes from "./routes/domain-routes";
app.use(domainRoutes);
```

---

## Consequences

### ✅ Positive

1. **Separation of Concerns**: Each domain has its own route file
2. **Team Scalability**: Multiple developers can work on different routes simultaneously
3. **Code Organization**: Easy to locate routes by domain
4. **Reduced Merge Conflicts**: Changes isolated to specific route files
5. **Testability**: Routes can be tested in isolation

### ❌ Negative

1. **More Files**: 200+ route files to navigate
2. **Import Overhead**: routes.ts requires 200+ imports (11K lines mostly imports)
3. **Discovery**: New developers need to understand the structure

### ⚠️ Trade-offs

- **Current State**: Already 95% modularized
- **Remaining Work**: Only system routes (CSRF, waitlist, sessions) are inline in routes.ts
- **Decision**: Keep system routes inline as they're tightly coupled to middleware setup

---

## Current State Analysis

**Total Endpoints**: 451  
**Modular Route Files**: ~200  
**Inline Routes in routes.ts**: ~15 (waitlist, CSRF token, talent match sessions)

**Why Inline Routes Remain**:

- **CSRF Token** (`/api/csrf-token`): Must be before CSRF verification middleware
- **Waitlist** (`/api/waitlist/join`): Public endpoint, no auth required
- **TalentMatch Sessions**: In-memory session management with cleanup logic

---

## Alternatives Considered

### 1. Single Monolithic routes.ts

**Rejected**: Would create 10,000+ line file, unmaintainable

### 2. Router Classes with Dependency Injection

```typescript
class EventRouter {
  constructor(private storage: Storage) {}
  registerRoutes(app: Express) {
    /* ... */
  }
}
```

**Rejected**: Over-engineered for current needs, functional approach simpler

### 3. Auto-Registration via File System

```typescript
// Auto-import all files from routes/
fs.readdirSync("./routes").forEach((file) => {
  const router = require(`./routes/${file}`);
  app.use(router);
});
```

**Rejected**: Loses explicitness, harder to understand order of registration

---

## Implementation Status

### ✅ Complete

- [x] 200+ modular route files created
- [x] Domain-based organization
- [x] Functional router exports
- [x] Middleware composition

### Remaining (If Needed)

- [ ] Extract inline session routes to `routes/talent-match-sessions.ts` (optional)
- [ ] Extract waitlist route to `routes/waitlist-routes.ts` (optional)

**Decision**: Keep current structure. Inline routes (<1% of total) are acceptable for system utilities.

---

## MB.MD Compliance

- **God Command #5**: ✅ Checked existing docs/structure first (routes already modularized)
- **P122 GitHub Workflow**: ✅ Changes will be committed with conventional format
- **Sprint 1.2 Goal**: ✅ Achieved (routes already modular)

---

## References

- [Express Router Documentation](https://expressjs.com/en/guide/routing.html)
- [RESTful API Design Principles](https://restfulapi.net/)
- Sprint 1.2 Execution Plan
- MB.MD Protocol v4.0.0
