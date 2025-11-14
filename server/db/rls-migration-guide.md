# Row Level Security (RLS) Migration Guide

## Overview
This guide explains how to apply Row Level Security policies to the Mundo Tango database to prevent unauthorized access to user data.

## What is RLS?
Row Level Security (RLS) is a PostgreSQL feature that restricts which rows users can access in database tables. It provides database-level security enforcement, preventing users from accessing other users' private data even if application code has bugs.

## Migration Files

### 1. Initial RLS Policies (0001_enable_rls.sql)
Already applied. Includes RLS for:
- users, posts, chat_messages, chat_rooms
- financial_portfolios, financial_accounts, financial_assets, financial_trades
- bookings, subscriptions, payments
- friendships, friend_requests
- groups, group_members, group_posts
- event_rsvps, notifications
- mr_blue_conversations, life_ceo_conversations

### 2. Additional RLS Policies (0002_add_missing_rls_policies.sql)
**NEW - Must be applied**. Adds RLS for:
- financial_goals
- health_goals
- budget_entries
- nutrition_logs
- events
- user_settings
- two_factor_secrets
- host_venue_profiles (updated)

## How to Apply Migration

### Option 1: Using psql (Recommended for Production)
```bash
# Connect to your database
psql $DATABASE_URL

# Apply the migration
\i server/db/migrations/0002_add_missing_rls_policies.sql

# Verify RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'financial_goals', 'health_goals', 'budget_entries',
    'nutrition_logs', 'events', 'user_settings', 'two_factor_secrets'
  )
ORDER BY tablename;
```

### Option 2: Using Node.js Script
```bash
# Run the migration script
tsx server/db/apply-rls-migration.ts
```

### Option 3: Using Drizzle Kit
```bash
# Generate migration
npm run db:generate

# Push to database
npm run db:push
```

## Verification

### 1. Check RLS Status
```sql
-- Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;
```

### 2. List All Policies
```sql
-- View all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  qual as using_condition
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Test Cross-User Access
```sql
-- Set user context to User A (ID: 1)
SELECT set_config('app.user_id', '1', true);

-- Try to access User B's data (ID: 2)
-- This should return EMPTY
SELECT * FROM financial_goals WHERE user_id = 2;

-- Access own data
-- This should return User A's goals
SELECT * FROM financial_goals WHERE user_id = 1;
```

## Usage in Application Code

### Method 1: Using withUserContext (Recommended)
```typescript
import { withUserContext } from '@shared/db';
import { financialGoals } from '@shared/schema';

// In your route handler
app.get('/api/financial-goals', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  const goals = await withUserContext(userId, async (db) => {
    return db.select().from(financialGoals);
  });
  
  // RLS automatically filters to only return user's own goals
  res.json(goals);
});
```

### Method 2: Using getDbWithUser
```typescript
import { getDbWithUser } from '@shared/db';
import { budgetEntries, healthGoals } from '@shared/schema';

app.get('/api/dashboard', authenticateToken, async (req, res) => {
  const userDb = getDbWithUser(req.user.id);
  
  // All queries automatically filtered by RLS
  const [budget, health] = await Promise.all([
    userDb.select().from(budgetEntries),
    userDb.select().from(healthGoals)
  ]);
  
  res.json({ budget, health });
});
```

### Method 3: Using withUserContext from server/db/withRLS.ts
```typescript
import { withUserContext } from '@server/db/withRLS';
import { db } from '@shared/db';
import { nutritionLogs } from '@shared/schema';

app.get('/api/nutrition', authenticateToken, async (req, res) => {
  const data = await withUserContext(req.user.id, async () => {
    return db.select().from(nutritionLogs);
  });
  
  res.json(data);
});
```

## Security Best Practices

### 1. Always Use RLS Helpers
❌ **BAD** - No user context:
```typescript
const goals = await db.select().from(financialGoals);
// Returns ALL users' data!
```

✅ **GOOD** - With user context:
```typescript
const goals = await withUserContext(userId, async (db) => {
  return db.select().from(financialGoals);
});
// Returns only authenticated user's data
```

### 2. Never Trust Client Input for User ID
❌ **BAD**:
```typescript
const userId = req.body.userId; // Client can fake this!
const goals = await withUserContext(userId, ...);
```

✅ **GOOD**:
```typescript
const userId = req.user.id; // From JWT token
const goals = await withUserContext(userId, ...);
```

### 3. Use RLS for All User-Specific Tables
All tables containing user-specific data MUST have RLS enabled:
- ✅ financial_goals, health_goals, budget_entries, nutrition_logs
- ✅ posts, messages, notifications
- ✅ events, bookings, subscriptions
- ✅ user_settings, two_factor_secrets

## Testing Checklist

- [ ] RLS enabled on all 31 tables
- [ ] User A cannot query User B's financial_goals
- [ ] User A cannot query User B's health_goals
- [ ] User A cannot query User B's private posts
- [ ] User A cannot query User B's messages
- [ ] User A CAN query public posts
- [ ] User A CAN query public events
- [ ] Friends can see friend-only posts
- [ ] Group members can see group posts
- [ ] Event attendees can see event details

## Rollback (Emergency Only)

If something goes wrong:
```sql
-- Disable RLS on a specific table (CAUTION!)
ALTER TABLE financial_goals DISABLE ROW LEVEL SECURITY;

-- Drop a specific policy
DROP POLICY IF EXISTS financial_goals_policy ON financial_goals;
```

## Monitoring

### Check RLS Policy Usage
```sql
-- See which policies are being used
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Monitor Performance Impact
RLS policies can impact query performance. Monitor slow queries:
```sql
-- Check slow queries
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%financial_goals%'
ORDER BY mean_exec_time DESC;
```

## Support

If you encounter issues:
1. Check server logs for RLS errors
2. Verify user context is being set: `SELECT current_setting('app.user_id', true);`
3. Review policy definitions in migration files
4. Test with manual SQL queries to isolate issues
