# RLS Routes Update Guide

## Critical Tables Requiring RLS-Protected Routes

### ✅ 41 Tables with RLS Enabled
1. posts
2. post_comments
3. chat_messages
4. chat_rooms
5. financial_goals
6. budget_entries
7. health_goals
8. workout_logs (conditional)
9. nutrition_logs (conditional)
10. sleep_logs (conditional)
11. fitness_activities (conditional)
12. host_homes
13. housing_bookings
14. user_subscriptions
15. life_ceo_conversations
16. life_ceo_chat_messages
17. life_ceo_domains
18. life_ceo_goals
19. life_ceo_tasks
20. life_ceo_milestones
21. life_ceo_recommendations
22. mr_blue_conversations
23. mr_blue_messages
24. payments
25. campaign_donations
26. travel_bookings
27. trip_plans
28. travel_preferences
29. document_instances
30. document_signatures
31. notifications
32. saved_posts
33. friend_requests
34. friendships
35. blocked_users
36. user_privacy_settings
37. two_factor_secrets
38. product_purchases
39. refresh_tokens
40. email_verification_tokens
41. password_reset_tokens

## How to Update Routes

### Pattern 1: Simple User-Owned Data (Most Common)

**BEFORE:**
```typescript
router.get('/api/financial-goals', authenticateToken, async (req: AuthRequest, res) => {
  const goals = await db.query.financialGoals.findMany({
    where: eq(financialGoals.userId, req.user!.id)
  });
  res.json(goals);
});
```

**AFTER:**
```typescript
import { getDbWithUser } from '../db/getRLSContext';

router.get('/api/financial-goals', authenticateToken, async (req: AuthRequest, res) => {
  const userDb = getDbWithUser(req.user!.id);
  
  const goals = await userDb.execute(async (tx) => {
    return tx.query.financialGoals.findMany();
  });
  
  res.json(goals);
});
```

**Key Changes:**
- Import `getDbWithUser` from `'../db/getRLSContext'`
- Create `userDb` instance with `getDbWithUser(req.user!.id)`
- Wrap query in `userDb.execute(async (tx) => { ... })`
- Remove manual `where: eq(userId, req.user.id)` - RLS handles this automatically

### Pattern 2: Complex Queries with Relations

**BEFORE:**
```typescript
router.get('/api/posts/:id', authenticateToken, async (req: AuthRequest, res) => {
  const post = await db.query.posts.findFirst({
    where: and(
      eq(posts.id, parseInt(req.params.id)),
      or(
        eq(posts.visibility, 'public'),
        eq(posts.userId, req.user!.id)
      )
    ),
    with: {
      user: true,
      comments: true
    }
  });
  res.json(post);
});
```

**AFTER:**
```typescript
import { getDbWithUser } from '../db/getRLSContext';

router.get('/api/posts/:id', authenticateToken, async (req: AuthRequest, res) => {
  const userDb = getDbWithUser(req.user!.id);
  
  const post = await userDb.execute(async (tx) => {
    return tx.query.posts.findFirst({
      where: eq(posts.id, parseInt(req.params.id)),
      with: {
        user: true,
        comments: true
      }
    });
  });
  
  res.json(post);
});
```

**Key Changes:**
- Remove visibility checks - RLS policy handles this
- RLS automatically filters based on user context

### Pattern 3: INSERT Operations

**BEFORE:**
```typescript
router.post('/api/posts', authenticateToken, async (req: AuthRequest, res) => {
  const newPost = await db.insert(posts).values({
    ...req.body,
    userId: req.user!.id
  }).returning();
  res.json(newPost);
});
```

**AFTER:**
```typescript
import { getDbWithUser } from '../db/getRLSContext';

router.post('/api/posts', authenticateToken, async (req: AuthRequest, res) => {
  const userDb = getDbWithUser(req.user!.id);
  
  const newPost = await userDb.execute(async (tx) => {
    return tx.insert(posts).values({
      ...req.body,
      userId: req.user!.id
    }).returning();
  });
  
  res.json(newPost[0]);
});
```

**Key Changes:**
- Still manually set `userId` (RLS validates but doesn't auto-populate)
- Wrap in `userDb.execute()`

### Pattern 4: UPDATE/DELETE Operations

**BEFORE:**
```typescript
router.delete('/api/posts/:id', authenticateToken, async (req: AuthRequest, res) => {
  await db.delete(posts).where(
    and(
      eq(posts.id, parseInt(req.params.id)),
      eq(posts.userId, req.user!.id)
    )
  );
  res.sendStatus(204);
});
```

**AFTER:**
```typescript
import { getDbWithUser } from '../db/getRLSContext';

router.delete('/api/posts/:id', authenticateToken, async (req: AuthRequest, res) => {
  const userDb = getDbWithUser(req.user!.id);
  
  await userDb.execute(async (tx) => {
    return tx.delete(posts).where(eq(posts.id, parseInt(req.params.id)));
  });
  
  res.sendStatus(204);
});
```

**Key Changes:**
- Remove userId check - RLS prevents deleting others' posts
- If user doesn't own post, delete silently succeeds but affects 0 rows

### Pattern 5: Routes That Should NOT Use RLS

Some routes need system-level access and should NOT use getDbWithUser:

- Public data endpoints (event listings, public profiles)
- Admin endpoints (use requireRoleLevel instead)
- System tasks (cron jobs, migrations)
- Auth endpoints (login, register)

**Example - Keep using `db` directly:**
```typescript
// Public events - anyone can see
router.get('/api/events/public', async (req, res) => {
  const events = await db.query.events.findMany({
    where: eq(events.visibility, 'public')
  });
  res.json(events);
});
```

## Critical Routes to Update First (P0)

### 1. Financial Data (HIGHEST PRIORITY)
- `/api/financial-goals/*`
- `/api/budget-entries/*`
- `/api/investments/*`

### 2. Health Data
- `/api/health-goals/*`
- `/api/nutrition-logs/*`
- `/api/fitness-activities/*`

### 3. Messages & Chat
- `/api/messages/*`
- `/api/chat/*`
- `/api/conversations/*`

### 4. Housing & Bookings
- `/api/housing/bookings/*`
- `/api/host-homes/mine`

### 5. Life CEO (Premium Feature)
- `/api/life-ceo/*`

### 6. Mr Blue
- `/api/mr-blue/*`

### 7. Personal Data
- `/api/saved-posts/*`
- `/api/notifications/*`
- `/api/friend-requests/*`

## Route Files to Update

Based on server/routes.ts imports, update these files:

1. `server/routes/financial-goals-routes.ts` - CRITICAL
2. `server/routes/budget-routes.ts` - CRITICAL
3. `server/routes/health-routes.ts` - CRITICAL
4. `server/routes/nutrition-routes.ts` - CRITICAL
5. `server/routes/messages-routes.ts` - CRITICAL
6. `server/routes/housing-routes.ts` - CRITICAL
7. `server/routes/life-ceo-routes.ts` - CRITICAL
8. `server/routes/mrBlue.ts` - CRITICAL
9. `server/routes/bookmark-routes.ts`
10. Main `server/routes.ts` - POST/PUT/DELETE for posts, comments

## Testing Checklist

After updating routes:

- [ ] User A cannot query User B's financial_goals
- [ ] User A cannot see User B's private messages
- [ ] User A can only edit/delete their own posts
- [ ] Friend-only posts only visible to friends
- [ ] Housing bookings only visible to guest and host
- [ ] Life CEO data is user-private
- [ ] Notifications only show to owner
- [ ] All tests pass

## Quick Test Command

```bash
# Test RLS is working
psql $DATABASE_URL -c "
  SET app.current_user_id = '1';
  SELECT COUNT(*) FROM financial_goals;  -- Should only show user 1's data
  
  SET app.current_user_id = '2';
  SELECT COUNT(*) FROM financial_goals;  -- Should only show user 2's data
"
```
