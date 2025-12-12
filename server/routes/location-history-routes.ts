import { Router, type Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { db } from "../storage";
import { userLocationHistory, groups, groupMembers, users } from "@shared/schema";
import { eq, and, desc, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { ensureCityGroupExists } from "../utils/cityGroupAutomation";

const router = Router();

// Validation schema for location history entry
const locationHistorySchema = z.object({
  city: z.string().min(1, "City is required"),
  country: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD").optional().nullable(),
  isCurrent: z.boolean().optional().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// ============================================================================
// GET /api/location-history - Get current user's location history
// ============================================================================
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const history = await db
      .select({
        id: userLocationHistory.id,
        city: userLocationHistory.city,
        country: userLocationHistory.country,
        startDate: userLocationHistory.startDate,
        endDate: userLocationHistory.endDate,
        isCurrent: userLocationHistory.isCurrent,
        latitude: userLocationHistory.latitude,
        longitude: userLocationHistory.longitude,
        groupId: userLocationHistory.groupId,
        createdAt: userLocationHistory.createdAt,
      })
      .from(userLocationHistory)
      .where(eq(userLocationHistory.userId, userId))
      .orderBy(desc(userLocationHistory.isCurrent), desc(userLocationHistory.startDate));

    res.json(history);
  } catch (error) {
    console.error("[LocationHistory] Error fetching:", error);
    res.status(500).json({ message: "Failed to fetch location history" });
  }
});

// ============================================================================
// POST /api/location-history - Add a new location history entry
// ============================================================================
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validation = locationHistorySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.error.errors 
      });
    }

    const { city, country, startDate, endDate, isCurrent, latitude, longitude } = validation.data;

    // Validate 6+ months residency
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (monthsDiff < 6) {
      return res.status(400).json({ 
        message: "Location history entries require at least 6 months residency for tango" 
      });
    }

    // If marking as current, unset any existing current locations
    if (isCurrent) {
      await db
        .update(userLocationHistory)
        .set({ isCurrent: false, updatedAt: new Date() })
        .where(and(
          eq(userLocationHistory.userId, userId),
          eq(userLocationHistory.isCurrent, true)
        ));
    }

    // Find or create city group - using centralized automation
    let groupId: number | null = null;
    const cityGroupResult = await ensureCityGroupExists(city, country || '', userId);
    
    if (cityGroupResult) {
      groupId = cityGroupResult.groupId;
      console.log(`[LocationHistory] ${cityGroupResult.wasCreated ? 'Created' : 'Found'} city group: ${cityGroupResult.groupName} (ID: ${groupId})`);
      
      // Auto-join user to the city group if not already a member
      try {
        await db.insert(groupMembers).values({
          groupId,
          userId,
          role: "member",
          status: "active",
          joinedAt: new Date(),
        }).onConflictDoNothing();
        console.log(`[LocationHistory] User ${userId} joined city group ${groupId}`);
      } catch (e) {
        // Already a member, ignore
        console.log(`[LocationHistory] User ${userId} already member of city group ${groupId}`);
      }
    }

    // Insert location history entry
    const [newEntry] = await db
      .insert(userLocationHistory)
      .values({
        userId,
        city,
        country: country || null,
        startDate,
        endDate: endDate || null,
        isCurrent: isCurrent || false,
        latitude: latitude?.toString() || null,
        longitude: longitude?.toString() || null,
        groupId,
      })
      .returning();

    console.log(`[LocationHistory] User ${userId} added location: ${city} (${startDate} - ${endDate || 'current'})`);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("[LocationHistory] Error adding:", error);
    res.status(500).json({ message: "Failed to add location history" });
  }
});

// ============================================================================
// PUT /api/location-history/:id - Update a location history entry
// ============================================================================
router.put("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const entryId = parseInt(req.params.id);
    const validation = locationHistorySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.error.errors 
      });
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(userLocationHistory)
      .where(and(
        eq(userLocationHistory.id, entryId),
        eq(userLocationHistory.userId, userId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Location history entry not found" });
    }

    const { city, country, startDate, endDate, isCurrent, latitude, longitude } = validation.data;

    // Validate 6+ months residency
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (monthsDiff < 6) {
      return res.status(400).json({ 
        message: "Location history entries require at least 6 months residency for tango" 
      });
    }

    // If marking as current, unset any existing current locations
    if (isCurrent) {
      await db
        .update(userLocationHistory)
        .set({ isCurrent: false, updatedAt: new Date() })
        .where(and(
          eq(userLocationHistory.userId, userId),
          eq(userLocationHistory.isCurrent, true)
        ));
    }

    const [updated] = await db
      .update(userLocationHistory)
      .set({
        city,
        country: country || null,
        startDate,
        endDate: endDate || null,
        isCurrent: isCurrent || false,
        latitude: latitude?.toString() || null,
        longitude: longitude?.toString() || null,
        updatedAt: new Date(),
      })
      .where(eq(userLocationHistory.id, entryId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[LocationHistory] Error updating:", error);
    res.status(500).json({ message: "Failed to update location history" });
  }
});

// ============================================================================
// DELETE /api/location-history/:id - Delete a location history entry
// ============================================================================
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const entryId = parseInt(req.params.id);

    // Verify ownership
    const existing = await db
      .select()
      .from(userLocationHistory)
      .where(and(
        eq(userLocationHistory.id, entryId),
        eq(userLocationHistory.userId, userId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Location history entry not found" });
    }

    await db
      .delete(userLocationHistory)
      .where(eq(userLocationHistory.id, entryId));

    res.json({ message: "Location history entry deleted" });
  } catch (error) {
    console.error("[LocationHistory] Error deleting:", error);
    res.status(500).json({ message: "Failed to delete location history" });
  }
});

// ============================================================================
// GET /api/location-history/with-groups - Get location history with linked groups
// ============================================================================
router.get("/with-groups", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const historyWithGroups = await db
      .select({
        locationHistory: userLocationHistory,
        group: groups,
      })
      .from(userLocationHistory)
      .leftJoin(groups, eq(userLocationHistory.groupId, groups.id))
      .where(eq(userLocationHistory.userId, userId))
      .orderBy(desc(userLocationHistory.isCurrent), desc(userLocationHistory.startDate));

    res.json(historyWithGroups.map(item => ({
      ...item.locationHistory,
      group: item.group ? {
        id: item.group.id,
        name: item.group.name,
        city: item.group.city,
        country: item.group.country,
        coverImage: item.group.coverImage,
        memberCount: item.group.memberCount,
      } : null,
    })));
  } catch (error) {
    console.error("[LocationHistory] Error fetching with groups:", error);
    res.status(500).json({ message: "Failed to fetch location history with groups" });
  }
});

export default router;
