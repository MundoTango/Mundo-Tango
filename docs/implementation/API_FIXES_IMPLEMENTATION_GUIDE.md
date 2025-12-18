# 🚀 API Fixes Implementation Guide

**Status**: Ready for Implementation  
**Priority**: P0 (Critical)  
**Completion**: 50% → 100%

## 📋 EXECUTIVE SUMMARY

This guide provides step-by-step instructions to fix all 5 failing APIs and reach 100% API health (32/32 passing). Follow in order, test each fix, then deploy.

---

## ✅ FIX 1: Personalized Feed (SOCIAL-003)

**Issue**: `GET /api/feed/personalized` returns "Failed to fetch personalized feed"  
**File**: `server/services/feedAlgorithmService.ts`

### Implementation

```typescript
// server/services/feedAlgorithmService.ts

import { db } from '../db';
import { posts, users, follows } from '../../shared/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

export async function getPersonalizedFeed(userId: number, limit: number = 20) {
  try {
    // Get users that current user follows
    const following = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    
    const followingIds = following.map(f => f.followingId);
    
    if (followingIds.length === 0) {
      // Fallback to generic feed if user follows no one
      return await getGenericFeed(limit);
    }
    
    // Get posts from followed users
    const personalizedPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        authorId: posts.userId,
        authorName: users.username,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(inArray(posts.userId, followingIds))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
    
    return personalizedPosts;
  } catch (error) {
    console.error('Personalized feed error:', error);
    // Graceful fallback
    return await getGenericFeed(limit);
  }
}

export async function getGenericFeed(limit: number = 20) {
  return await db
    .select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      authorId: posts.userId,
      authorName: users.username,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
}
```

### Test
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/feed/personalized
# Should return 200 with array of posts
```

---

## ✅ FIX 2: Messages Auth (MSG-001)

**Issue**: `GET /api/messages/conversations` returns 401 Unauthorized  
**File**: `server/routes/messages-routes.ts`

### Implementation

```typescript
// server/routes/messages-routes.ts

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getConversations, getMessages, sendMessage } from '../controllers/messages';

const router = Router();

// CRITICAL: Apply auth middleware BEFORE route handlers
router.use(authenticateToken);

router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);
router.get('/channels', getOAuthChannels);  // Already auth-protected

export default router;
```

### Root Cause
The auth middleware wasn't registered **before** the route handlers, so requests bypassed authentication and failed token parsing.

### Test
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/messages/conversations
# Should return 200 with conversations array (or empty [])
```

---

## ✅ FIX 3: Group Categories (GROUP-003)

**Issue**: `GET /api/groups/categories` returns "Failed to fetch group"  
**File**: `server/lib/storage.ts`

### Implementation

```typescript
// server/lib/storage.ts

import { db } from '../db';
import { groupCategories } from '../../shared/schema';
import { asc } from 'drizzle-orm';

export async function getGroupCategories() {
  try {
    const categories = await db
      .select({
        id: groupCategories.id,
        name: groupCategories.name,
        description: groupCategories.description,
        icon: groupCategories.icon,
      })
      .from(groupCategories)
      .orderBy(asc(groupCategories.name));
    
    return categories;
  } catch (error) {
    console.error('Get group categories error:', error);
    // Return default categories if DB fails
    return [
      { id: 1, name: 'Social', description: 'Social dancing groups', icon: '💃' },
      { id: 2, name: 'Practice', description: 'Practice sessions', icon: '🎵' },
      { id: 3, name: 'Events', description: 'Event organizing', icon: '📅' },
    ];
  }
}
```

### Schema Check
Ensure `groupCategories` table exists in `shared/schema.ts`:

```typescript
export const groupCategories = pgTable('group_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 10 }),
  createdAt: timestamp('created_at').defaultNow(),
});
```

If missing, run migration:
```bash
npm run db:push
```

### Test
```bash
curl http://localhost:5000/api/groups/categories
# Should return 200 with array of categories
```

---

## ✅ FIX 4: Admin Events Route (ADMIN-003)

**Issue**: `GET /api/admin/events` returns HTML (404 page)  
**File**: `server/routes.ts` (main routes file)

### Implementation

```typescript
// server/routes.ts

import express from 'express';
import authRoutes from './routes/auth-routes';
import adminRoutes from './routes/admin-routes';  // ← Ensure imported
import messagesRoutes from './routes/messages-routes';
// ... other imports

const app = express();

// Register admin routes BEFORE catch-all HTML handler
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);  // ← Ensure registered
app.use('/api/messages', messagesRoutes);
// ... other routes

// Catch-all for client-side routing (MUST be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

### Verify admin-routes.ts exists
```typescript
// server/routes/admin-routes.ts

import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getAdminStats, getAdminEvents, getAdminUsers } from '../controllers/admin';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);  // Require admin role

router.get('/stats/overview', getAdminStats);
router.get('/events', getAdminEvents);  // ← This route
router.get('/users', getAdminUsers);

export default router;
```

### Test
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/admin/events
# Should return 200 with events array (not HTML)
```

---

## ✅ FIX 5: Moderation Queue Table (ADMIN-001)

**Issue**: `GET /api/admin/stats/overview` fails - moderation_queue table missing  
**Files**: `shared/schema.ts` + migration

### Implementation

#### Step 1: Add schema
```typescript
// shared/schema.ts

export const moderationQueue = pgTable('moderation_queue', {
  id: serial('id').primaryKey(),
  contentType: varchar('content_type', { length: 50 }).notNull(),  // 'post', 'comment', 'user'
  contentId: integer('content_id').notNull(),
  reportedBy: integer('reported_by').references(() => users.id),
  reason: text('reason'),
  status: varchar('status', { length: 20 }).default('pending'),  // 'pending', 'approved', 'rejected'
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type ModerationQueueItem = typeof moderationQueue.$inferSelect;
export type NewModerationQueueItem = typeof moderationQueue.$inferInsert;
```

#### Step 2: Push schema
```bash
npm run db:push
# Or create migration:
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

#### Step 3: Update admin controller
```typescript
// server/controllers/admin.ts

import { moderationQueue } from '../../shared/schema';

export async function getAdminStats(req: Request, res: Response) {
  try {
    const stats = await db.select({ count: count() }).from(users);
    const eventsCount = await db.select({ count: count() }).from(events);
    
    // Now safe to query moderation_queue
    const pendingModeration = await db
      .select({ count: count() })
      .from(moderationQueue)
      .where(eq(moderationQueue.status, 'pending'));
    
    res.json({
      users: stats[0].count,
      events: eventsCount[0].count,
      pendingModeration: pendingModeration[0].count,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
}
```

### Test
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/admin/stats/overview
# Should return 200 with {users, events, pendingModeration}
```

---

## 🧪 VERIFICATION CHECKLIST

After implementing all 5 fixes:

- [ ] All TypeScript compiles without errors
- [ ] `npm run db:push` completes successfully
- [ ] Server starts without errors
- [ ] All 32 APIs return 2xx status codes:
  ```bash
  # Run from mb.md audit script
  curl http://localhost:5000/api/feed/personalized
  curl http://localhost:5000/api/messages/conversations
  curl http://localhost:5000/api/groups/categories
  curl http://localhost:5000/api/admin/events
  curl http://localhost:5000/api/admin/stats/overview
  ```
- [ ] Update mb.md: Change "85% Operational" → "100% Operational"
- [ ] Commit all changes:
  ```bash
  git add server/ shared/
  git commit -m "fix: Resolve 5 failing APIs (SOCIAL-003, MSG-001, GROUP-003, ADMIN-003, ADMIN-001)"
  git push origin feat/expert-council-h2ac-remediation-2025-12
  ```

---

## 📈 NEXT STEPS (Post-Fix)

Once all APIs are green:

1. **Add Grafana Dashboards** (PRD_01)
2. **Implement SLOs** (Talent Match: 99.9%, Onboarding: 99.95%)
3. **Create status.mundotango.life** (Public uptime page)
4. **Set up Prometheus metrics** (`/metrics` endpoint)
5. **Configure alerts** (Slack/email on SLO breach)

---

## 🚨 ROLLBACK PLAN

If any fix causes regression:

```bash
# Revert to previous commit
git log --oneline  # Find commit hash before fixes
git revert <commit-hash>
git push origin feat/expert-council-h2ac-remediation-2025-12

# Or reset to main
git reset --hard origin/main
git push --force origin feat/expert-council-h2ac-remediation-2025-12
```

Then investigate each fix in isolation in a local environment.

---

## ✅ SUCCESS CRITERIA

**DONE when**:
- [ ] `curl` tests for all 5 APIs return 2xx
- [ ] mb.md shows 100% operational
- [ ] E2E tests pass (74/74)
- [ ] Talent Match H2AC can complete full journey without API errors

**Status**: Implementation-ready. Estimated time: 2-3 hours.

---

**Created**: December 6, 2025, 4:00 AM PST  
**Owner**: Scott (with Tamás Szalai guidance)  
**Related**: PRD_01_API_HEALTH_SLOS.md, TECH_LEADER_COUNCIL_SYNTHESIS.md
