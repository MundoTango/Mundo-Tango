import { Router, Response } from "express";
import { db } from "@shared/db";
import { travelPlans, travelPlanItems, users } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/travel/plans - Get user's travel plans (auth required)
router.get("/plans", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const result = await db.select()
      .from(travelPlans)
      .where(eq(travelPlans.userId, userId))
      .orderBy(desc(travelPlans.startDate));

    res.json(result);
  } catch (error) {
    console.error("Error fetching travel plans:", error);
    res.status(500).json({ message: "Failed to fetch travel plans" });
  }
});

// GET /api/travel/plans/:id - Get single travel plan (auth required)
router.get("/plans/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const planResult = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, parseInt(id)),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (planResult.length === 0) {
      return res.status(404).json({ message: "Travel plan not found" });
    }

    // Get plan items/destinations
    const itemsResult = await db.select()
      .from(travelPlanItems)
      .where(eq(travelPlanItems.travelPlanId, parseInt(id)))
      .orderBy(travelPlanItems.startDate);

    res.json({
      ...planResult[0],
      items: itemsResult,
    });
  } catch (error) {
    console.error("Error fetching travel plan:", error);
    res.status(500).json({ message: "Failed to fetch travel plan" });
  }
});

// POST /api/travel/plans - Create travel plan (auth required)
router.post("/plans", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, description, startDate, endDate, budget, currency } = req.body;

    if (!name || !startDate) {
      return res.status(400).json({ message: "Name and start date are required" });
    }

    const result = await db.insert(travelPlans).values({
      userId,
      name,
      description: description || null,
      startDate,
      endDate: endDate || null,
      budget: budget || null,
      currency: currency || 'USD',
      isPublic: false,
      collaborators: [],
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating travel plan:", error);
    res.status(500).json({ message: "Failed to create travel plan" });
  }
});

// POST /api/travel/plans/:id/destinations - Add destination to travel plan (auth required)
router.post("/plans/:id/destinations", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { 
      city, 
      country, 
      startDate, 
      endDate, 
      accommodation, 
      activities, 
      estimatedCost,
      notes 
    } = req.body;

    // Verify ownership
    const plan = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, parseInt(id)),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (plan.length === 0) {
      return res.status(404).json({ message: "Travel plan not found or not authorized" });
    }

    if (!city || !country || !startDate) {
      return res.status(400).json({ message: "City, country, and start date are required" });
    }

    const result = await db.insert(travelPlanItems).values({
      travelPlanId: parseInt(id),
      city,
      country,
      startDate,
      endDate: endDate || null,
      accommodation: accommodation || null,
      activities: activities || [],
      estimatedCost: estimatedCost || null,
      notes: notes || null,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error adding destination:", error);
    res.status(500).json({ message: "Failed to add destination" });
  }
});

// PATCH /api/travel/plans/:id - Update travel plan (auth required)
router.patch("/plans/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, description, startDate, endDate, budget, currency, isPublic } = req.body;

    // Verify ownership
    const existing = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, parseInt(id)),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Travel plan not found or not authorized" });
    }

    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (budget !== undefined) updateData.budget = budget;
    if (currency !== undefined) updateData.currency = currency;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const result = await db.update(travelPlans)
      .set(updateData)
      .where(eq(travelPlans.id, parseInt(id)))
      .returning();

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating travel plan:", error);
    res.status(500).json({ message: "Failed to update travel plan" });
  }
});

// DELETE /api/travel/plans/:id - Delete travel plan (auth required)
router.delete("/plans/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verify ownership
    const existing = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, parseInt(id)),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Travel plan not found or not authorized" });
    }

    await db.delete(travelPlans).where(eq(travelPlans.id, parseInt(id)));

    res.json({ message: "Travel plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting travel plan:", error);
    res.status(500).json({ message: "Failed to delete travel plan" });
  }
});

// DELETE /api/travel/plans/:planId/destinations/:itemId - Delete destination (auth required)
router.delete("/plans/:planId/destinations/:itemId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { planId, itemId } = req.params;

    // Verify ownership
    const plan = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, parseInt(planId)),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (plan.length === 0) {
      return res.status(404).json({ message: "Travel plan not found or not authorized" });
    }

    await db.delete(travelPlanItems)
      .where(and(
        eq(travelPlanItems.id, parseInt(itemId)),
        eq(travelPlanItems.travelPlanId, parseInt(planId))
      ));

    res.json({ message: "Destination deleted successfully" });
  } catch (error) {
    console.error("Error deleting destination:", error);
    res.status(500).json({ message: "Failed to delete destination" });
  }
});

export default router;
