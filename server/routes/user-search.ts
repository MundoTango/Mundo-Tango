import { Router } from 'express';
import { db } from '@shared/db';
import { users, posts, events, groups } from '@shared/schema';
import { sql, ilike, or } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Simple user search endpoint for messaging
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    const searchTerm = `%${query.trim()}%`;

    const userResults = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        profileImageUrl: users.profileImage,
        bio: users.bio,
      })
      .from(users)
      .where(
        or(
          ilike(users.name, searchTerm),
          ilike(users.username, searchTerm)
        )
      )
      .limit(20);

    res.json(userResults);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Global search endpoint for UnifiedTopBar
router.get('/global-search', authenticateToken, async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length < 2) {
      return res.json({
        users: [],
        posts: [],
        events: [],
        groups: [],
      });
    }

    const searchTerm = `%${query.trim()}%`;

    // Search users (limit 5)
    const userResults = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        bio: users.bio,
      })
      .from(users)
      .where(
        or(
          ilike(users.name, searchTerm),
          ilike(users.username, searchTerm)
        )
      )
      .limit(5);

    // Search posts (limit 5)
    const postResults = await db
      .select({
        id: posts.id,
        content: posts.content,
        userId: posts.userId,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        },
      })
      .from(posts)
      .innerJoin(users, sql`${posts.userId} = ${users.id}`)
      .where(ilike(posts.content, searchTerm))
      .orderBy(sql`${posts.createdAt} DESC`)
      .limit(5);

    // Search events (limit 5)
    const eventResults = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        location: events.location,
      })
      .from(events)
      .where(
        or(
          ilike(events.title, searchTerm),
          ilike(events.description, searchTerm),
          ilike(events.location, searchTerm)
        )
      )
      .orderBy(sql`${events.startDate} ASC`)
      .limit(5);

    // Search groups (limit 5)
    const groupResults = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        imageUrl: groups.imageUrl,
        memberCount: groups.memberCount,
      })
      .from(groups)
      .where(
        or(
          ilike(groups.name, searchTerm),
          ilike(groups.description, searchTerm)
        )
      )
      .limit(5);

    res.json({
      users: userResults,
      posts: postResults,
      events: eventResults,
      groups: groupResults,
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// User mention autocomplete endpoint - supports users, groups, and events
router.get('/mention-search', authenticateToken, async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length < 1) {
      return res.json([]);
    }

    const searchTerm = `%${query.trim()}%`;

    // Search users
    const userResults = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        type: sql<string>`'user'`,
      })
      .from(users)
      .where(
        or(
          ilike(users.name, searchTerm),
          ilike(users.username, searchTerm)
        )
      )
      .limit(5);

    // Search groups (city groups and pro groups)
    const groupResults = await db
      .select({
        id: groups.id,
        name: groups.name,
        username: sql<string>`NULL`,
        profileImage: groups.imageUrl,
        type: sql<string>`CASE WHEN ${groups.type} = 'city' THEN 'city_group' WHEN ${groups.type} = 'professional' THEN 'pro_group' ELSE 'group' END`,
      })
      .from(groups)
      .where(
        or(
          ilike(groups.name, searchTerm),
          ilike(groups.description, searchTerm)
        )
      )
      .limit(5);

    // Search events
    const eventResults = await db
      .select({
        id: events.id,
        name: events.title,
        username: sql<string>`NULL`,
        profileImage: events.imageUrl,
        type: sql<string>`'event'`,
      })
      .from(events)
      .where(
        or(
          ilike(events.title, searchTerm),
          ilike(events.description, searchTerm)
        )
      )
      .limit(5);

    // Combine all results
    const allResults = [
      ...userResults.map(r => ({ ...r, name: r.name, displayType: 'User' })),
      ...groupResults.map(r => ({ ...r, displayType: r.type === 'city_group' ? 'City Group' : r.type === 'pro_group' ? 'Pro Group' : 'Group' })),
      ...eventResults.map(r => ({ ...r, displayType: 'Event' }))
    ];

    res.json(allResults);
  } catch (error) {
    console.error('Mention search error:', error);
    res.status(500).json({ error: 'Failed to search mentions' });
  }
});

// GET /api/users/by-role - Get users by tango role and city for Hub directories
router.get('/by-role', async (req, res) => {
  try {
    const role = req.query.role as string;
    const city = req.query.city as string;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!role) {
      return res.status(400).json({ error: 'Role parameter is required' });
    }

    let query = db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        bio: users.bio,
        city: users.city,
        country: users.country,
        tangoRoles: users.tangoRoles,
      })
      .from(users)
      .where(sql`${role} = ANY(${users.tangoRoles})`)
      .limit(limit);

    if (city) {
      query = db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          bio: users.bio,
          city: users.city,
          country: users.country,
          tangoRoles: users.tangoRoles,
        })
        .from(users)
        .where(
          sql`${role} = ANY(${users.tangoRoles}) AND ${users.city} ILIKE ${`%${city}%`}`
        )
        .limit(limit);
    }

    const results = await query;
    res.json(results);
  } catch (error) {
    console.error('Users by role error:', error);
    res.status(500).json({ error: 'Failed to fetch users by role' });
  }
});

export default router;
