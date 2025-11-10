import { Router, Response } from "express";
import { db } from "@shared/db";
import { workshops, workshopEnrollments, users } from "@shared/schema";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/workshops - List workshops with search/filter
router.get("/", async (req, res: Response) => {
  try {
    const { search, upcoming } = req.query;

    let query = db.select()
      .from(workshops)
      .orderBy(workshops.date)
      .$dynamic();

    const conditions = [];
    
    if (search && typeof search === "string") {
      conditions.push(
        or(
          ilike(workshops.title, `%${search}%`),
          ilike(workshops.description, `%${search}%`)
        ) as any
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;

    res.json(result);
  } catch (error) {
    console.error("Error fetching workshops:", error);
    res.status(500).json({ message: "Failed to fetch workshops" });
  }
});

// GET /api/workshops/:id - Get workshop detail
router.get("/:id", async (req, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.select()
      .from(workshops)
      .where(eq(workshops.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching workshop:", error);
    res.status(500).json({ message: "Failed to fetch workshop" });
  }
});

// POST /api/workshops - Create workshop (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, instructor, image, date, location, duration, price, capacity } = req.body;

    if (!title || !description || !instructor || !date || !location || !price || !capacity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await db.insert(workshops).values({
      title,
      description,
      instructor,
      image: image || null,
      date,
      location,
      duration: duration || null,
      price,
      capacity,
      registered: 0,
      spotsLeft: capacity,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating workshop:", error);
    res.status(500).json({ message: "Failed to create workshop" });
  }
});

// PATCH /api/workshops/:id - Update workshop (auth required)
router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, instructor, image, date, location, duration, price, capacity } = req.body;

    // Check existence
    const existing = await db.select().from(workshops).where(eq(workshops.id, parseInt(id))).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (instructor !== undefined) updateData.instructor = instructor;
    if (image !== undefined) updateData.image = image;
    if (date !== undefined) updateData.date = date;
    if (location !== undefined) updateData.location = location;
    if (duration !== undefined) updateData.duration = duration;
    if (price !== undefined) updateData.price = price;
    if (capacity !== undefined) {
      updateData.capacity = capacity;
      updateData.spotsLeft = capacity - existing[0].registered;
    }

    const result = await db.update(workshops)
      .set(updateData)
      .where(eq(workshops.id, parseInt(id)))
      .returning();

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating workshop:", error);
    res.status(500).json({ message: "Failed to update workshop" });
  }
});

// POST /api/workshops/:id/enroll - Enroll in workshop (auth required)
router.post("/:id/enroll", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check if workshop exists and has spots
    const workshop = await db.select().from(workshops).where(eq(workshops.id, parseInt(id))).limit(1);
    if (workshop.length === 0) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    if ((workshop[0].spotsLeft || 0) <= 0) {
      return res.status(400).json({ message: "Workshop is full" });
    }

    // Check if already enrolled
    const existing = await db.select()
      .from(workshopEnrollments)
      .where(and(
        eq(workshopEnrollments.workshopId, parseInt(id)),
        eq(workshopEnrollments.userId, userId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Already enrolled in this workshop" });
    }

    // Create enrollment
    const enrollment = await db.insert(workshopEnrollments).values({
      workshopId: parseInt(id),
      userId,
      status: "enrolled",
    }).returning();

    // Update workshop counts
    await db.update(workshops)
      .set({
        registered: workshop[0].registered + 1,
        spotsLeft: (workshop[0].spotsLeft || 0) - 1,
      })
      .where(eq(workshops.id, parseInt(id)));

    res.status(201).json(enrollment[0]);
  } catch (error) {
    console.error("Error enrolling in workshop:", error);
    res.status(500).json({ message: "Failed to enroll in workshop" });
  }
});

// DELETE /api/workshops/:id/enroll - Cancel enrollment (auth required)
router.delete("/:id/enroll", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Find enrollment
    const enrollment = await db.select()
      .from(workshopEnrollments)
      .where(and(
        eq(workshopEnrollments.workshopId, parseInt(id)),
        eq(workshopEnrollments.userId, userId)
      ))
      .limit(1);

    if (enrollment.length === 0) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Delete enrollment
    await db.delete(workshopEnrollments)
      .where(and(
        eq(workshopEnrollments.workshopId, parseInt(id)),
        eq(workshopEnrollments.userId, userId)
      ));

    // Update workshop counts
    const workshop = await db.select().from(workshops).where(eq(workshops.id, parseInt(id))).limit(1);
    if (workshop.length > 0) {
      await db.update(workshops)
        .set({
          registered: Math.max(0, workshop[0].registered - 1),
          spotsLeft: (workshop[0].spotsLeft || 0) + 1,
        })
        .where(eq(workshops.id, parseInt(id)));
    }

    res.json({ message: "Enrollment cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling enrollment:", error);
    res.status(500).json({ message: "Failed to cancel enrollment" });
  }
});

// GET /api/workshops/my-enrollments - Get user's enrolled workshops (auth required)
router.get("/my-enrollments", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const result = await db.select({
      enrollment: workshopEnrollments,
      workshop: workshops,
    })
    .from(workshopEnrollments)
    .leftJoin(workshops, eq(workshopEnrollments.workshopId, workshops.id))
    .where(eq(workshopEnrollments.userId, userId))
    .orderBy(desc(workshopEnrollments.enrolledAt));

    res.json(result.map((r: any) => ({
      ...r.enrollment,
      workshop: r.workshop,
    })));
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
});

// DELETE /api/workshops/:id - Delete workshop (auth required)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check existence
    const existing = await db.select().from(workshops).where(eq(workshops.id, parseInt(id))).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    await db.delete(workshops).where(eq(workshops.id, parseInt(id)));

    res.json({ message: "Workshop deleted successfully" });
  } catch (error) {
    console.error("Error deleting workshop:", error);
    res.status(500).json({ message: "Failed to delete workshop" });
  }
});

export default router;
