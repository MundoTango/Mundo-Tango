# Row Level Security (RLS) Implementation Guide

## Overview

This guide explains how to update route handlers to use Row Level Security (RLS) helpers, ensuring database-level access control for all user-specific data.

## Why RLS?

**Security**: RLS enforces data access controls at the database level, making it impossible for users to access other users' data even if they manipulate API requests.

**GDPR Compliance**: RLS is a critical component for GDPR compliance, ensuring users can only access their own personal data.

**Defense in Depth**: Even if application-level auth fails, RLS provides a backup layer of security.

## Core Concept

All database queries accessing user-specific data must be wrapped with `withUserContext()`:

```typescript
import { withUserContext } from '../db/withRLS';

// BEFORE (insecure - relies only on WHERE clause)
const accounts = await db
  .select()
  .from(financialAccounts)
  .where(eq(financialAccounts.userId, userId));

// AFTER (secure - enforced by database RLS policies)
const accounts = await withUserContext(userId, async () => {
  return db.select().from(financialAccounts);
});
```

## Implementation Steps

### 1. Import the RLS Helper

At the top of your route file:

```typescript
import { withUserContext } from '../db/withRLS';
```

### 2. Wrap Database Operations

For GET requests (reading data):

```typescript
router.get('/api/financial-accounts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    const accounts = await withUserContext(userId, async () => {
      return db
        .select()
        .from(financialAccounts)
        .orderBy(desc(financialAccounts.createdAt));
    });
    
    res.json(accounts);
  } catch (error) {
    console.error('[Financial] Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});
```

For POST requests (creating data):

```typescript
router.post('/api/financial-accounts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validation = insertFinancialAccountSchema.omit({ userId: true }).safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.errors });
    }
    
    const [account] = await withUserContext(userId, async () => {
      return db.insert(financialAccounts).values({
        ...validation.data,
        userId,
      }).returning();
    });
    
    res.json(account);
  } catch (error) {
    console.error('[Financial] Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});
```

For PUT/PATCH requests (updating data):

```typescript
router.patch('/api/financial-accounts/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    
    const [updated] = await withUserContext(userId, async () => {
      return db
        .update(financialAccounts)
        .set({
          ...req.body,
          updatedAt: new Date(),
        })
        .where(eq(financialAccounts.id, parseInt(id)))
        .returning();
    });
    
    if (!updated) {
      return res.status(404).json({ error: 'Account not found or access denied' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('[Financial] Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});
```

For DELETE requests (deleting data):

```typescript
router.delete('/api/financial-accounts/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    
    await withUserContext(userId, async () => {
      return db
        .delete(financialAccounts)
        .where(eq(financialAccounts.id, parseInt(id)));
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('[Financial] Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});
```

### 3. Complex Queries with Joins

Even complex queries work the same way:

```typescript
router.get('/api/posts/feed', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    const feed = await withUserContext(userId, async () => {
      return db
        .select({
          post: posts,
          author: users,
          likeCount: sql<number>`count(${postLikes.id})`,
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .leftJoin(postLikes, eq(posts.id, postLikes.postId))
        .groupBy(posts.id, users.id)
        .orderBy(desc(posts.createdAt))
        .limit(50);
    });
    
    res.json(feed);
  } catch (error) {
    console.error('[Feed] Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});
```

## Which Routes Need RLS?

### ✅ MUST Use withUserContext

All routes accessing these tables MUST use `withUserContext()`:

- `users` (profile data)
- `posts` (user posts)
- `chat_messages` (direct messages)
- `chat_rooms` (chat conversations)
- `financial_*` tables (all financial data)
- `bookings` (travel bookings)
- `subscriptions` (user subscriptions)
- `payments` (payment history)
- `friendships` (friend connections)
- `friend_requests` (friend requests)
- `notifications` (user notifications)
- `mr_blue_conversations` (AI chat history)
- `life_ceo_*` tables (Life CEO data)
- Any table with a `user_id` column containing private user data

### ❌ Can Skip withUserContext

These routes can skip RLS (they access public/system data):

- Public event listings (events are public)
- Public group discovery
- System configuration
- Static content
- Health checks
- Metrics/monitoring

### ⚠️ Special Cases

**Admin Routes**: Use `withSystemContext()` for admin operations:

```typescript
import { withSystemContext } from '../db/withRLS';

router.get('/api/admin/users', requireAdmin, async (req: AuthRequest, res: Response) => {
  const allUsers = await withSystemContext(async () => {
    return db.select().from(users);
  });
  
  res.json(allUsers);
});
```

**Public + Private Data**: Combine both approaches:

```typescript
router.get('/api/posts/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;
  
  // RLS policies will handle visibility automatically
  const [post] = await withUserContext(userId, async () => {
    return db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(id)))
      .limit(1);
  });
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found or not visible to you' });
  }
  
  res.json(post);
});
```

## Testing Your Implementation

After updating routes, verify RLS is working:

1. **Run RLS Tests**:
   ```bash
   tsx server/db/rls-tests.ts
   ```

2. **Manual Testing**:
   - Create data as User A
   - Try to access it as User B (should fail)
   - Try to access it as User A (should succeed)

3. **Check Server Logs**:
   Look for `[RLS]` prefix in logs to see RLS operations

## Common Mistakes

### ❌ Forgetting to wrap queries

```typescript
// WRONG - No RLS protection
const accounts = await db.select().from(financialAccounts);
```

### ❌ Using WHERE clause instead of RLS

```typescript
// WRONG - Relies on app logic, not database security
const accounts = await db
  .select()
  .from(financialAccounts)
  .where(eq(financialAccounts.userId, userId));
```

### ❌ Wrapping only part of the query

```typescript
// WRONG - Sets context but doesn't wrap the query
await setDbUser(userId);
const accounts = await db.select().from(financialAccounts);
```

### ✅ Correct implementation

```typescript
// RIGHT - Wraps entire query with RLS context
const accounts = await withUserContext(userId, async () => {
  return db.select().from(financialAccounts);
});
```

## Migration Checklist

When updating a route file:

- [ ] Import `withUserContext` from `../db/withRLS`
- [ ] Identify all database queries in the file
- [ ] Wrap each query accessing user-specific data with `withUserContext(userId, async () => { ... })`
- [ ] Remove redundant `WHERE user_id =` clauses (RLS handles this)
- [ ] Test the route manually or with automated tests
- [ ] Verify RLS policies exist for all tables used

## Verification

After migration, verify your implementation:

```typescript
// 1. Check that RLS is enabled on the table
import { isRLSEnabled } from '../db/rls';
const enabled = await isRLSEnabled('financial_accounts');
console.log('RLS enabled:', enabled); // Should be true

// 2. Run the RLS test suite
import { runRLSTests } from '../db/rls-tests';
await runRLSTests();

// 3. Check policies exist
import { listPolicies } from '../db/rls';
const policies = await listPolicies('financial_accounts');
console.log('Policies:', policies); // Should show ownership policies
```

## Performance Considerations

RLS has minimal performance impact because:

1. **Database-level**: Policies are enforced in PostgreSQL, which is highly optimized
2. **Index-friendly**: RLS policies work with existing indexes
3. **Session-based**: User context is set once per request, not per query

## Security Benefits

By implementing RLS:

1. **Defense in Depth**: Multiple layers of security (auth middleware + RLS)
2. **GDPR Compliant**: Users cannot access other users' personal data
3. **Audit Trail**: Database logs show which user accessed which data
4. **Zero-Trust**: Even if app code is compromised, RLS prevents unauthorized access

## Support

If you encounter issues:

1. Check server logs for `[RLS]` error messages
2. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE rowsecurity = true;`
3. List policies: `SELECT * FROM pg_policies WHERE tablename = 'your_table';`
4. Run RLS tests: `tsx server/db/rls-tests.ts`

## Summary

**Golden Rule**: If a route accesses user-specific data, wrap all database operations with `withUserContext(userId, async () => { ... })`.

This ensures database-level security, GDPR compliance, and defense-in-depth protection for all user data.
