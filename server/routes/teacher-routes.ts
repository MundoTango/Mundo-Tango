import { Router, Response } from "express";
import { db } from "../db";
import { teachers, venues, users } from "../../shared/schema";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/teachers - List teachers with search/filter
router.get("/", async (req, res: Response) => {
  try {
    const { search, specialty } = req.query;

    let query = db.select({
      teacher: teachers,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        city: users.city,
      },
    })
    .from(teachers)
    .leftJoin(users, eq(teachers.userId, users.id))
    .orderBy(desc(teachers.rating))
    .$dynamic();

    const conditions = [];
    
    if (search && typeof search === "string") {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(teachers.bio, `%${search}%`)
        ) as any
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;

    res.json(result.map((r: any) => ({
      ...r.teacher,
      user: r.user,
    })));
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
});

// GET /api/teachers/:id - Get teacher detail
router.get("/:id", async (req, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.select({
      teacher: teachers,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        city: users.city,
        email: users.email,
      },
    })
    .from(teachers)
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(eq(teachers.id, parseInt(id)))
    .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ ...result[0].teacher, user: result[0].user });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({ message: "Failed to fetch teacher" });
  }
});

// POST /api/teachers - Create teacher profile (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { bio, experience, specialties } = req.body;

    // Check if user already has teacher profile
    const existing = await db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Teacher profile already exists" });
    }

    const result = await db.insert(teachers).values({
      userId,
      bio: bio || null,
      experience: experience || null,
      specialties: specialties || [],
      rating: 0,
      reviewCount: 0,
      verified: false,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating teacher profile:", error);
    res.status(500).json({ message: "Failed to create teacher profile" });
  }
});

// PATCH /api/teachers/:id - Update teacher profile (auth required, owner only)
router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { bio, experience, specialties } = req.body;

    // Check ownership
    const existing = await db.select().from(teachers).where(eq(teachers.id, parseInt(id))).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    if (existing[0].userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const updateData: any = {};
    if (bio !== undefined) updateData.bio = bio;
    if (experience !== undefined) updateData.experience = experience;
    if (specialties !== undefined) updateData.specialties = specialties;

    const result = await db.update(teachers)
      .set(updateData)
      .where(eq(teachers.id, parseInt(id)))
      .returning();

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating teacher profile:", error);
    res.status(500).json({ message: "Failed to update teacher profile" });
  }
});

// DELETE /api/teachers/:id - Delete teacher profile (auth required, owner only)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const existing = await db.select().from(teachers).where(eq(teachers.id, parseInt(id))).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    if (existing[0].userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this profile" });
    }

    await db.delete(teachers).where(eq(teachers.id, parseInt(id)));

    res.json({ message: "Teacher profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher profile:", error);
    res.status(500).json({ message: "Failed to delete teacher profile" });
  }
});

export default router;
