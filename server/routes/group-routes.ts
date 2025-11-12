import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import {
  groups,
  groupMembers,
  groupPosts,
  groupCategories,
  groupCategoryAssignments,
  users,
  insertGroupSchema,
  insertGroupPostSchema
} from "@shared/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { eq, and, desc, sql, or, ilike, inArray, count, asc } from "drizzle-orm";
import { z } from "zod";

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
      limit = "20",
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
        )`.as('member_count')
      })
      .from(groups)
      .leftJoin(users, eq(groups.creatorId, users.id))
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

    res.json(results);
  } catch (error) {
    console.error("[Groups] Error fetching groups:", error);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
});

// ============================================================================
// GROUP ANALYTICS (must be before /:id routes)
// ============================================================================

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

// GET /api/groups/:id - Get group details
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
      .leftJoin(users, eq(groups.creatorId, users.id))
      .where(eq(groups.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Get member count
    const memberCount = await db
      .select({ count: count() })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, parseInt(id)));

    res.json({
      ...result[0],
      memberCount: memberCount[0]?.count || 0
    });
  } catch (error) {
    console.error("[Groups] Error fetching group:", error);
    res.status(500).json({ message: "Failed to fetch group" });
  }
});

// POST /api/groups - Create new group (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    const groupData = insertGroupSchema.omit({ creatorId: true }).parse(req.body);

    const [group] = await db
      .insert(groups)
      .values({
        ...groupData,
        creatorId: userId
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
    const userId = req.userId!;
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
    const userId = req.userId!;
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

    if (group[0].creatorId !== userId) {
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
    const userId = req.userId!;
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

// POST /api/groups/:id/leave - Leave group (auth required)
router.post("/:id/leave", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
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

    if (group[0]?.creatorId === userId) {
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
          country: users.country
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

// GET /api/groups/:id/posts - Get group posts
router.get("/:id/posts", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = "20", offset = "0" } = req.query;

    const posts = await db
      .select({
        post: groupPosts,
        author: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(groupPosts)
      .leftJoin(users, eq(groupPosts.userId, users.id))
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

// POST /api/groups/:id/posts - Create group post (auth required, members only)
router.post("/:id/posts", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { content, mediaUrls } = req.body;

    // Check if user is a member
    const membership = await db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, parseInt(id)),
        eq(groupMembers.userId, userId),
        eq(groupMembers.status, "active")
      ))
      .limit(1);

    if (membership.length === 0) {
      return res.status(403).json({ message: "Must be a group member to post" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const [post] = await db
      .insert(groupPosts)
      .values({
        groupId: parseInt(id),
        userId,
        content,
        mediaUrls: mediaUrls || []
      })
      .returning();

    res.status(201).json(post);
  } catch (error) {
    console.error("[Groups] Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
});

export default router;
