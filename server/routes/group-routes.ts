import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import {
  groups,
  groupMembers,
  groupPosts,
  groupCategories,
  groupCategoryAssignments,
  users,
  events,
  eventRsvps,
  userLocationHistory,
  insertGroupSchema,
  insertGroupPostSchema,
  placeRecommendations,
  housingListings,
  eventScrapingSources
} from "@shared/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { eq, and, desc, sql, or, ilike, inArray, count, asc, isNotNull, lt, gte } from "drizzle-orm";
import { z } from "zod";
import { PostingPermissionService } from "../services/PostingPermissionService";

const router = Router();

// ============================================================================
// GROUP ROUTES
// ============================================================================

// GET /api/groups - List groups with filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      search,
      type,
      city,
      country,
      isPrivate,
      limit = "100",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        group: groups,
        creator: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        },
        memberCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${groupMembers} 
          WHERE ${groupMembers.groupId} = ${groups.id}
        )`.as('memberCount'),
        eventCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${events} e
          WHERE e.group_id = ${groups.id}
        )`.as('eventCount'),
        recommendationCount: sql<number>`(0)`.as('recommendationCount'),
        housingCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${housingListings} h
          WHERE LOWER(h.city) = LOWER(${groups.city})
        )`.as('housingCount')
      })
      .from(groups)
      .leftJoin(users, eq(groups.createdBy, users.id))
      .$dynamic();

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(groups.name, `%${search}%`),
          ilike(groups.description, `%${search}%`)
        )
      );
    }
    if (type) conditions.push(eq(groups.type, type as string));
    if (city) conditions.push(eq(groups.city, city as string));
    if (country) conditions.push(eq(groups.country, country as string));
    if (isPrivate !== undefined) {
      conditions.push(eq(groups.isPrivate, isPrivate === "true"));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(groups.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    // Debug logging
    console.log(`[Groups] GET /api/groups - Returned ${results.length} groups (type filter: ${type}, city filter: ${city})`);
    if (results.length > 0) {
      const types = results.map(r => r.group.type);
      console.log(`[Groups] Group types returned: ${[...new Set(types)].join(', ')}`);
      const cities = results.map(r => r.group.city).filter(Boolean);
      console.log(`[Groups] Cities: ${[...new Set(cities)].join(', ')}`);
    }

    res.json(results);
  } catch (error) {
    console.error("[Groups] Error fetching groups:", error);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
});

// ============================================================================
// GROUP ANALYTICS (must be before /:id routes)
// ============================================================================

// GET /api/groups/my-groups - Get current user's groups with location awareness (auth required)
router.get("/my-groups", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user profile with city and tangoRoles
    const [userProfile] = await db
      .select({
        city: users.city,
        country: users.country,
        tangoRoles: users.tangoRoles,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Get user's location history
    const locationHistoryData = await db
      .select()
      .from(userLocationHistory)
      .where(eq(userLocationHistory.userId, userId))
      .orderBy(desc(userLocationHistory.isCurrent), desc(userLocationHistory.startDate));

    // Get user's joined groups with enhanced data
    const userGroups = await db
      .select({
        group: groups,
        membership: {
          role: groupMembers.role,
          status: groupMembers.status,
          joinedAt: groupMembers.joinedAt
        },
        creator: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        },
        memberCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${groupMembers} gm
          WHERE gm.group_id = ${groups.id}
          AND gm.status = 'active'
        )`.as('memberCount'),
        eventCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${events} e
          WHERE e.group_id = ${groups.id}
        )`.as('eventCount'),
        recommendationCount: sql<number>`(0)`.as('recommendationCount'),
        housingCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${housingListings} h
          WHERE LOWER(h.city) = LOWER(${groups.city})
        )`.as('housingCount'),
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .leftJoin(users, eq(groups.createdBy, users.id))
      .where(and(
        eq(groupMembers.userId, userId),
        eq(groupMembers.status, "active")
      ))
      .orderBy(desc(groupMembers.joinedAt));

    // Organize groups by location relevance
    const currentCity = userProfile?.city?.toLowerCase();
    const tangoRoles = userProfile?.tangoRoles || [];

    // Create a map of historical cities with their date ranges
    const historicalCities = new Map<string, { startDate: string; endDate: string | null; isCurrent: boolean }>();
    locationHistoryData.forEach(loc => {
      historicalCities.set(loc.city.toLowerCase(), {
        startDate: loc.startDate,
        endDate: loc.endDate,
        isCurrent: loc.isCurrent || false,
      });
    });

    // Enhance groups with location badges and categorization
    // Filter to only include: current city groups, groups from active location history, or professional groups
    const enhancedGroups = userGroups
      .map(item => {
        const groupCity = item.group.city?.toLowerCase();
        let locationCategory: 'current' | 'previous' | 'professional' | 'other' = 'other';
        let locationBadge: string | null = null;

        // Check if this is the current city group
        if (groupCity && currentCity && groupCity === currentCity) {
          locationCategory = 'current';
          locationBadge = 'Current City';
        }
        // Check if this is a historical city group
        else if (groupCity && historicalCities.has(groupCity)) {
          const history = historicalCities.get(groupCity)!;
          locationCategory = history.isCurrent ? 'current' : 'previous';
          if (!history.isCurrent) {
            const startYear = new Date(history.startDate).getFullYear();
            const endYear = history.endDate ? new Date(history.endDate).getFullYear() : null;
            locationBadge = endYear ? `Lived here ${startYear}-${endYear}` : `Lived here since ${startYear}`;
          }
        }
        // Check if this is a professional group (type='professional' OR type='role')
        else if (item.group.type === 'professional' || item.group.type === 'role') {
          locationCategory = 'professional';
          // Try to find a matching role for the badge
          const groupName = item.group.name.toLowerCase();
          const matchingRole = tangoRoles.find(role => 
            groupName.includes(role.toLowerCase()) || 
            groupName.includes(role.toLowerCase().replace('_', ' '))
          );
          if (matchingRole) {
            locationBadge = `Your Role: ${matchingRole}`;
          }
        }

        return {
          ...item,
          locationCategory,
          locationBadge,
          eventCount: item.eventCount || 0,
        };
      })
      // Filter out city groups that aren't connected to location history (orphaned groups)
      .filter(item => {
        // Always include professional groups (type='professional' OR type='role')
        if (item.group.type === 'professional' || item.group.type === 'role') return true;
        // Include current city group
        if (item.locationCategory === 'current') return true;
        // Include previous city groups from location history
        if (item.locationCategory === 'previous') return true;
        // Filter out orphaned city groups (not in location history)
        if (item.group.type === 'city' && item.locationCategory === 'other') return false;
        // Keep other non-city groups
        return true;
      });

    // Sort: current city first, then previous cities, then professional, then other
    const sortOrder = { current: 0, previous: 1, professional: 2, other: 3 };
    enhancedGroups.sort((a, b) => {
      const orderDiff = sortOrder[a.locationCategory] - sortOrder[b.locationCategory];
      if (orderDiff !== 0) return orderDiff;
      // Within same category, sort by join date
      return new Date(b.membership.joinedAt!).getTime() - new Date(a.membership.joinedAt!).getTime();
    });

    res.json({
      groups: enhancedGroups,
      userProfile: {
        currentCity: userProfile?.city,
        currentCountry: userProfile?.country,
        tangoRoles: tangoRoles,
      },
      locationHistory: locationHistoryData,
    });
  } catch (error) {
    console.error("[Groups] Error fetching user groups:", error);
    res.status(500).json({ message: "Failed to fetch user groups" });
  }
});

// GET /api/groups/analytics/popular - Get popular groups
router.get("/analytics/popular", async (req: Request, res: Response) => {
  try {
    const { limit = "10" } = req.query;

    const popular = await db
      .select({
        group: groups,
        memberCount: sql<number>`COUNT(${groupMembers.id})::int`.as('member_count')
      })
      .from(groups)
      .leftJoin(groupMembers, and(
        eq(groupMembers.groupId, groups.id),
        eq(groupMembers.status, "active")
      ))
      .groupBy(groups.id)
      .orderBy(desc(sql`COUNT(${groupMembers.id})`))
      .limit(parseInt(limit as string));

    res.json(popular);
  } catch (error) {
    console.error("[Groups] Error fetching popular groups:", error);
    res.status(500).json({ message: "Failed to fetch popular groups" });
  }
});

// GET /api/groups/analytics/activity - Get group activity statistics
router.get("/analytics/activity", async (req: Request, res: Response) => {
  try {
    const stats = await db
      .select({
        totalGroups: sql<number>`COUNT(DISTINCT ${groups.id})::int`,
        totalMembers: sql<number>`COUNT(${groupMembers.id})::int`,
        activeMembers: sql<number>`COUNT(CASE WHEN ${groupMembers.status} = 'active' THEN 1 END)::int`,
        totalPosts: sql<number>`COUNT(${groupPosts.id})::int`,
        averageMembersPerGroup: sql<number>`AVG(member_counts.cnt)::int`
      })
      .from(groups)
      .leftJoin(groupMembers, eq(groupMembers.groupId, groups.id))
      .leftJoin(groupPosts, eq(groupPosts.groupId, groups.id))
      .leftJoin(
        sql`(
          SELECT group_id, COUNT(*) as cnt
          FROM ${groupMembers}
          WHERE status = 'active'
          GROUP BY group_id
        ) as member_counts`,
        sql`member_counts.group_id = ${groups.id}`
      );

    res.json(stats[0] || {
      totalGroups: 0,
      totalMembers: 0,
      activeMembers: 0,
      totalPosts: 0,
      averageMembersPerGroup: 0
    });
  } catch (error) {
    console.error("[Groups] Error fetching activity stats:", error);
    res.status(500).json({ message: "Failed to fetch activity stats" });
  }
});

// GET /api/groups/:id - Get group details with dynamic counts
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db
      .select({
        group: groups,
        creator: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          bio: users.bio
        }
      })
      .from(groups)
      .leftJoin(users, eq(groups.createdBy, users.id))
      .where(eq(groups.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    const group = result[0].group;
    const groupId = parseInt(id);

    // Compute all counts dynamically
    const [memberCountResult] = await db
      .select({ count: count() })
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.status, "active")
      ));

    // For city groups, compute eventCount based on city match OR group_id match
    // For non-city groups, compute based on group_id only
    const isCity = group.type === 'city' && group.city;
    
    let eventCountResult: { count: number }[];
    if (isCity) {
      // City groups: count events where city matches (case-insensitive) OR group_id matches
      [eventCountResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(events)
        .where(or(
          eq(events.groupId, groupId),
          sql`LOWER(${events.city}) = LOWER(${group.city})`
        ));
    } else {
      // Non-city groups: count events linked to group
      [eventCountResult] = await db
        .select({ count: count() })
        .from(events)
        .where(eq(events.groupId, groupId));
    }

    // Count posts for this group
    const [postCountResult] = await db
      .select({ count: count() })
      .from(groupPosts)
      .where(eq(groupPosts.groupId, groupId));

    // For city groups, compute housingCount based on city match
    let housingCount = 0;
    if (isCity) {
      const [housingResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(housingListings)
        .where(sql`LOWER(${housingListings.city}) = LOWER(${group.city})`);
      housingCount = housingResult?.count || 0;
    }

    // For city groups, compute recommendationCount based on city match
    let recommendationCount = 0;
    if (isCity) {
      const [recResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(placeRecommendations)
        .where(sql`LOWER(${placeRecommendations.city}) = LOWER(${group.city})`);
      recommendationCount = recResult?.count || 0;
    }

    res.json({
      ...result[0],
      memberCount: memberCountResult?.count || 0,
      eventCount: eventCountResult?.count || 0,
      postCount: postCountResult?.count || 0,
      housingCount: housingCount,
      recommendationCount: recommendationCount
    });
  } catch (error) {
    console.error("[Groups] Error fetching group:", error);
    res.status(500).json({ message: "Failed to fetch group" });
  }
});

// GET /api/groups/:id/events - Get events for a group
router.get("/:id/events", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = "20", offset = "0", past, showAll } = req.query;
    const now = new Date();

    // Build conditions array
    const conditions = [eq(events.groupId, parseInt(id))];
    
    // Add date filter based on past/showAll parameters
    // If showAll=true, don't filter by date (show everything)
    if (showAll !== "true") {
      if (past === "true") {
        conditions.push(lt(events.startDate, now));
      } else {
        conditions.push(gte(events.startDate, now));
      }
    }

    // Get events linked to this group with date filter
    const groupEvents = await db
      .select({
        event: events,
        organizer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          isVerified: users.isVerified
        },
        attendeeCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${eventRsvps} 
          WHERE ${eventRsvps.eventId} = ${events.id}
          AND ${eventRsvps.status} = 'going'
        )`.as('attendee_count')
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .where(and(...conditions))
      .orderBy(past === "true" ? desc(events.startDate) : asc(events.startDate))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    // Get total count with same filter
    const [{ total }] = await db
      .select({ total: count() })
      .from(events)
      .where(and(...conditions));

    res.json({
      events: groupEvents,
      pagination: {
        page: Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1,
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error("[Groups] Error fetching group events:", error);
    res.status(500).json({ message: "Failed to fetch group events" });
  }
});

// GET /api/groups/:id/data-sources - Get scraping sources for a group's city
router.get("/:id/data-sources", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get the group to find its city
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, parseInt(id))
    });
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Get distinct sources from events linked to this group
    const eventSources = await db
      .selectDistinct({
        sourceName: events.sourceName,
        sourceUrl: events.sourceUrl
      })
      .from(events)
      .where(and(
        eq(events.groupId, parseInt(id)),
        sql`${events.sourceName} IS NOT NULL`
      ));
    
    // Get scraping sources for this city
    const scrapingSources = await db.query.eventScrapingSources.findMany({
      where: eq(eventScrapingSources.city, group.city || '')
    });
    
    // Combine and deduplicate sources
    const sources = [
      ...eventSources.map(s => ({
        name: s.sourceName,
        url: typeof s.sourceUrl === 'string' && s.sourceUrl.startsWith('[') 
          ? JSON.parse(s.sourceUrl)?.[0]?.url || s.sourceUrl 
          : s.sourceUrl,
        type: 'event'
      })),
      ...scrapingSources.map(s => ({
        name: s.name,
        url: s.url,
        type: 'scraping_source',
        lastScraped: s.lastScrapedAt
      }))
    ];
    
    // Deduplicate by URL
    const uniqueSources = sources.reduce((acc, source) => {
      if (!acc.some(s => s.url === source.url)) {
        acc.push(source);
      }
      return acc;
    }, [] as typeof sources);
    
    res.json({
      city: group.city,
      sources: uniqueSources,
      totalSources: uniqueSources.length
    });
  } catch (error) {
    console.error("[Groups] Error fetching data sources:", error);
    res.status(500).json({ message: "Failed to fetch data sources" });
  }
});

// POST /api/groups - Create new group (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const groupData = insertGroupSchema.omit({ createdBy: true }).parse(req.body);

    const [group] = await db
      .insert(groups)
      .values({
        ...groupData,
        createdBy: userId
      })
      .returning();

    // Automatically add creator as admin member
    await db.insert(groupMembers).values({
      groupId: group.id,
      userId,
      role: "admin",
      status: "active"
    });

    res.status(201).json(group);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("[Groups] Error creating group:", error);
    res.status(500).json({ message: "Failed to create group" });
  }
});

// PUT /api/groups/:id - Update group (auth required, admin only)
router.put("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if user is admin
    const membership = await db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, parseInt(id)),
        eq(groupMembers.userId, userId),
        or(
          eq(groupMembers.role, "admin"),
          eq(groupMembers.role, "moderator")
        )
      ))
      .limit(1);

    if (membership.length === 0) {
      return res.status(403).json({ message: "Not authorized to update this group" });
    }

    const [updated] = await db
      .update(groups)
      .set({
        ...req.body,
        updatedAt: new Date()
      })
      .where(eq(groups.id, parseInt(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[Groups] Error updating group:", error);
    res.status(500).json({ message: "Failed to update group" });
  }
});

// DELETE /api/groups/:id - Delete group (auth required, creator only)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if user is creator
    const group = await db
      .select()
      .from(groups)
      .where(eq(groups.id, parseInt(id)))
      .limit(1);

    if (group.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group[0].createdBy !== userId) {
      return res.status(403).json({ message: "Only the group creator can delete this group" });
    }

    await db.delete(groups).where(eq(groups.id, parseInt(id)));

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("[Groups] Error deleting group:", error);
    res.status(500).json({ message: "Failed to delete group" });
  }
});

// ============================================================================
// GROUP MEMBERSHIP ROUTES
// ============================================================================

// POST /api/groups/:id/join - Join group (auth required)
router.post("/:id/join", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if group exists
    const group = await db
      .select()
      .from(groups)
      .where(eq(groups.id, parseInt(id)))
      .limit(1);

    if (group.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if already a member
    const existing = await db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, parseInt(id)),
        eq(groupMembers.userId, userId)
      ))
      .limit(1);

    if (existing.length > 0) {
      if (existing[0].status === "active") {
        return res.status(409).json({ message: "Already a member of this group" });
      }
      
      // Reactivate membership
      const [updated] = await db
        .update(groupMembers)
        .set({ status: "active", joinedAt: new Date() })
        .where(and(
          eq(groupMembers.groupId, parseInt(id)),
          eq(groupMembers.userId, userId)
        ))
        .returning();
      
      return res.json(updated);
    }

    // Private groups require approval
    const status = group[0].isPrivate ? "pending" : "active";

    const [member] = await db
      .insert(groupMembers)
      .values({
        groupId: parseInt(id),
        userId,
        role: "member",
        status
      })
      .returning();

    // Update member count
    await db
      .update(groups)
      .set({
        memberCount: sql`${groups.memberCount} + 1`
      })
      .where(eq(groups.id, parseInt(id)));

    res.status(201).json(member);
  } catch (error) {
    console.error("[Groups] Error joining group:", error);
    res.status(500).json({ message: "Failed to join group" });
  }
});

// DELETE /api/groups/:id/leave - Leave group (auth required)
router.delete("/:id/leave", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if member
    const membership = await db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, parseInt(id)),
        eq(groupMembers.userId, userId)
      ))
      .limit(1);

    if (membership.length === 0) {
      return res.status(404).json({ message: "Not a member of this group" });
    }

    // Check if user is the creator
    const group = await db
      .select()
      .from(groups)
      .where(eq(groups.id, parseInt(id)))
      .limit(1);

    if (group[0]?.createdBy === userId) {
      return res.status(400).json({ 
        message: "Group creator cannot leave. Please transfer ownership or delete the group." 
      });
    }

    await db
      .delete(groupMembers)
      .where(and(
        eq(groupMembers.groupId, parseInt(id)),
        eq(groupMembers.userId, userId)
      ));

    // Update member count
    await db
      .update(groups)
      .set({
        memberCount: sql`${groups.memberCount} - 1`
      })
      .where(eq(groups.id, parseInt(id)));

    res.json({ message: "Left group successfully" });
  } catch (error) {
    console.error("[Groups] Error leaving group:", error);
    res.status(500).json({ message: "Failed to leave group" });
  }
});

// GET /api/groups/:id/members - Get group members
router.get("/:id/members", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, status = "active" } = req.query;

    let query = db
      .select({
        membership: groupMembers,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
          tangoRoles: users.tangoRoles
        }
      })
      .from(groupMembers)
      .leftJoin(users, eq(groupMembers.userId, users.id))
      .where(and(
        eq(groupMembers.groupId, parseInt(id)),
        eq(groupMembers.status, status as string)
      ))
      .$dynamic();

    if (role) {
      query = query.where(and(
        eq(groupMembers.groupId, parseInt(id)),
        eq(groupMembers.status, status as string),
        eq(groupMembers.role, role as string)
      ));
    }

    const members = await query.orderBy(asc(groupMembers.joinedAt));

    res.json(members);
  } catch (error) {
    console.error("[Groups] Error fetching members:", error);
    res.status(500).json({ message: "Failed to fetch members" });
  }
});

// ============================================================================
// GROUP POSTS ROUTES
// ============================================================================

// GET /api/groups/:id/permissions - Get user's posting permissions for a group
router.get("/:id/permissions", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const groupId = parseInt(req.params.id);

    const permissions = await PostingPermissionService.getGroupPermissions(userId, groupId);
    res.json(permissions);
  } catch (error) {
    console.error("[Groups] Error fetching permissions:", error);
    res.status(500).json({ message: "Failed to fetch permissions" });
  }
});

// GET /api/groups/:id/posts - Get group posts
router.get("/:id/posts", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = "20", offset = "0" } = req.query;

    const posts = await db
      .select({
        id: groupPosts.id,
        groupId: groupPosts.groupId,
        authorId: groupPosts.authorId,
        userId: groupPosts.authorId,
        content: groupPosts.content,
        mediaUrls: groupPosts.mediaUrls,
        likeCount: groupPosts.likeCount,
        commentCount: groupPosts.commentCount,
        createdAt: groupPosts.createdAt,
        isPinned: groupPosts.isPinned,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(groupPosts)
      .leftJoin(users, eq(groupPosts.authorId, users.id))
      .where(eq(groupPosts.groupId, parseInt(id)))
      .orderBy(desc(groupPosts.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(posts);
  } catch (error) {
    console.error("[Groups] Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// POST /api/groups/:id/posts - Create group post (RBAC enforced)
router.post("/:id/posts", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { content, mediaUrls } = req.body;
    const groupId = parseInt(id);

    // RBAC Permission Check
    const permissions = await PostingPermissionService.getGroupPermissions(userId, groupId);
    
    if (!permissions.canPost) {
      return res.status(403).json({ 
        message: permissions.reason || "You don't have permission to post in this group",
        role: permissions.role,
        canComment: permissions.canComment
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const [post] = await db
      .insert(groupPosts)
      .values({
        groupId: groupId,
        authorId: userId,
        content,
        mediaUrls: mediaUrls || []
      })
      .returning();

    // Fetch with user info
    const [postWithUser] = await db
      .select({
        id: groupPosts.id,
        groupId: groupPosts.groupId,
        authorId: groupPosts.authorId,
        userId: groupPosts.authorId,
        content: groupPosts.content,
        mediaUrls: groupPosts.mediaUrls,
        likeCount: groupPosts.likeCount,
        commentCount: groupPosts.commentCount,
        createdAt: groupPosts.createdAt,
        isPinned: groupPosts.isPinned,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(groupPosts)
      .leftJoin(users, eq(groupPosts.authorId, users.id))
      .where(eq(groupPosts.id, post.id))
      .limit(1);

    res.status(201).json(postWithUser || post);
  } catch (error) {
    console.error("[Groups] Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
});

export default router;
