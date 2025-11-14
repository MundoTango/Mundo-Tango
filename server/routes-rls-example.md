# Route Handler Examples with RLS

This document shows how to properly implement route handlers that use Row Level Security.

## ✅ Correct Implementation Examples

### Example 1: Financial Goals API

```typescript
import { Router } from 'express';
import { withUserContext } from '@shared/db';
import { financialGoals } from '@shared/schema';
import { authenticateToken } from './middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/financial-goals - List user's goals
router.get('/api/financial-goals', authenticateToken, async (req, res) => {
  const userId = req.user.id; // From JWT token, never from request body
  
  try {
    // RLS automatically filters to only user's own goals
    const goals = await withUserContext(userId, async (db) => {
      return db.select().from(financialGoals);
    });
    
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/financial-goals - Create new goal
router.post('/api/financial-goals', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { title, targetAmount, deadline } = req.body;
  
  try {
    const newGoal = await withUserContext(userId, async (db) => {
      return db.insert(financialGoals).values({
        userId, // Use authenticated user's ID
        title,
        targetAmount,
        deadline,
      }).returning();
    });
    
    res.status(201).json(newGoal[0]);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/financial-goals/:id - Update goal
router.put('/api/financial-goals/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const goalId = parseInt(req.params.id);
  const { title, targetAmount } = req.body;
  
  try {
    // RLS ensures user can only update their own goals
    const updated = await withUserContext(userId, async (db) => {
      return db.update(financialGoals)
        .set({ title, targetAmount })
        .where(eq(financialGoals.id, goalId))
        .returning();
    });
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Goal not found or access denied' });
    }
    
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/financial-goals/:id - Delete goal
router.delete('/api/financial-goals/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const goalId = parseInt(req.params.id);
  
  try {
    // RLS ensures user can only delete their own goals
    const deleted = await withUserContext(userId, async (db) => {
      return db.delete(financialGoals)
        .where(eq(financialGoals.id, goalId))
        .returning();
    });
    
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Goal not found or access denied' });
    }
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### Example 2: Health Goals API

```typescript
import { Router } from 'express';
import { withUserContext } from '@shared/db';
import { healthGoals } from '@shared/schema';
import { authenticateToken } from './middleware/auth';

const router = Router();

router.get('/api/health-goals', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const goals = await withUserContext(userId, async (db) => {
      return db.select().from(healthGoals);
    });
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/api/health-goals', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { goalType, target, deadline } = req.body;
  
  try {
    const newGoal = await withUserContext(userId, async (db) => {
      return db.insert(healthGoals).values({
        userId,
        goalType,
        target,
        deadline,
      }).returning();
    });
    
    res.status(201).json(newGoal[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### Example 3: Budget Entries API

```typescript
import { Router } from 'express';
import { withUserContext } from '@shared/db';
import { budgetEntries } from '@shared/schema';
import { authenticateToken } from './middleware/auth';
import { gte, lte, and } from 'drizzle-orm';

const router = Router();

// GET /api/budget-entries?startDate=2024-01-01&endDate=2024-12-31
router.get('/api/budget-entries', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;
  
  try {
    const entries = await withUserContext(userId, async (db) => {
      let query = db.select().from(budgetEntries);
      
      // Add date filters if provided
      if (startDate && endDate) {
        query = query.where(
          and(
            gte(budgetEntries.date, new Date(startDate as string)),
            lte(budgetEntries.date, new Date(endDate as string))
          )
        );
      }
      
      return query;
    });
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### Example 4: Events API (Public + Private)

```typescript
import { Router } from 'express';
import { withUserContext, db } from '@shared/db';
import { events } from '@shared/schema';
import { authenticateToken, optionalAuth } from './middleware/auth';
import { eq, or } from 'drizzle-orm';

const router = Router();

// GET /api/events - List events (public + user's private events)
router.get('/api/events', optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      // Authenticated user sees public events + their own events
      const userId = req.user.id;
      const userEvents = await withUserContext(userId, async (db) => {
        return db.select().from(events);
      });
      res.json(userEvents);
    } else {
      // Anonymous user sees only public events
      const publicEvents = await db.select()
        .from(events)
        .where(eq(events.visibility, 'public'));
      res.json(publicEvents);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/events - Create event (auth required)
router.post('/api/events', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { title, description, startDate, visibility } = req.body;
  
  try {
    const newEvent = await withUserContext(userId, async (db) => {
      return db.insert(events).values({
        userId,
        organizerId: userId,
        title,
        description,
        startDate,
        visibility: visibility || 'public',
      }).returning();
    });
    
    res.status(201).json(newEvent[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### Example 5: User Settings API

```typescript
import { Router } from 'express';
import { withUserContext } from '@shared/db';
import { userSettings } from '@shared/schema';
import { authenticateToken } from './middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/user-settings - Get user's settings
router.get('/api/user-settings', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const settings = await withUserContext(userId, async (db) => {
      return db.select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId));
    });
    
    res.json(settings[0] || {});
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/user-settings - Update user's settings
router.put('/api/user-settings', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { theme, language, notifications } = req.body;
  
  try {
    const updated = await withUserContext(userId, async (db) => {
      return db.update(userSettings)
        .set({
          theme,
          language,
          notifications,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, userId))
        .returning();
    });
    
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

## ❌ WRONG Implementation Examples (DO NOT USE)

### Example 1: No User Context (VULNERABLE!)

```typescript
// ❌ DANGEROUS: No user context, returns ALL users' data
router.get('/api/financial-goals', authenticateToken, async (req, res) => {
  const goals = await db.select().from(financialGoals);
  // ^ Returns ALL users' goals, not just authenticated user's!
  res.json(goals);
});
```

### Example 2: Trusting Client Input (VULNERABLE!)

```typescript
// ❌ DANGEROUS: Client can provide any user ID
router.get('/api/financial-goals', authenticateToken, async (req, res) => {
  const userId = req.body.userId; // Client controls this!
  
  const goals = await withUserContext(userId, async (db) => {
    return db.select().from(financialGoals);
  });
  // ^ Client can access any user's data by changing userId!
  res.json(goals);
});
```

### Example 3: Manual Filtering Instead of RLS

```typescript
// ❌ BAD: Manual filtering is error-prone and bypassable
router.get('/api/financial-goals', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  // Don't do manual filtering - use RLS instead!
  const goals = await db.select()
    .from(financialGoals)
    .where(eq(financialGoals.userId, userId));
  // ^ Works, but RLS provides additional security layer
  
  res.json(goals);
});
```

## Security Best Practices Checklist

- [ ] Always use `authenticateToken` middleware for protected routes
- [ ] Get `userId` from `req.user.id` (JWT token), never from request body/params
- [ ] Wrap all database queries in `withUserContext(userId, ...)`
- [ ] Let RLS policies handle access control, don't rely solely on WHERE clauses
- [ ] Return 404 instead of 403 when resource not found (prevents information disclosure)
- [ ] Log security events for audit trail
- [ ] Test cross-user access attempts in your test suite

## Testing Your Routes

```typescript
// Test file: server/__tests__/financial-goals.test.ts
import request from 'supertest';
import app from '../app';

describe('Financial Goals API with RLS', () => {
  let userAToken: string;
  let userBToken: string;
  let userAGoalId: number;
  
  beforeAll(async () => {
    // Login as User A and User B
    const userA = await request(app)
      .post('/api/auth/login')
      .send({ email: 'userA@example.com', password: 'password' });
    userAToken = userA.body.token;
    
    const userB = await request(app)
      .post('/api/auth/login')
      .send({ email: 'userB@example.com', password: 'password' });
    userBToken = userB.body.token;
  });
  
  test('User A can create their own goal', async () => {
    const response = await request(app)
      .post('/api/financial-goals')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Save for house',
        targetAmount: 100000,
      });
    
    expect(response.status).toBe(201);
    userAGoalId = response.body.id;
  });
  
  test('User A can view their own goals', async () => {
    const response = await request(app)
      .get('/api/financial-goals')
      .set('Authorization', `Bearer ${userAToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].userId).toBe(userA.id);
  });
  
  test('User B cannot access User A\'s goals', async () => {
    const response = await request(app)
      .get('/api/financial-goals')
      .set('Authorization', `Bearer ${userBToken}`);
    
    expect(response.status).toBe(200);
    // Should not include User A's goals
    const hasUserAGoals = response.body.some(g => g.id === userAGoalId);
    expect(hasUserAGoals).toBe(false);
  });
  
  test('User B cannot update User A\'s goal', async () => {
    const response = await request(app)
      .put(`/api/financial-goals/${userAGoalId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ title: 'Hacked title' });
    
    // Should return 404 (not found) due to RLS
    expect(response.status).toBe(404);
  });
});
```
