import { Router, Response } from "express";
import { db } from "../db";
import { venues } from "../../shared/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/venues - List venues with search/filter
router.get("/", async (req, res: Response) => {
  try {
    const { search, city, country } = req.query;

    let query = db.select()
      .from(venues)
      .orderBy(desc(venues.rating))
      .$dynamic();

    const conditions = [];
    
    if (search && typeof search === "string") {
      conditions.push(
        or(
          ilike(venues.name, `%${search}%`),
          ilike(venues.description, `%${search}%`)
        ) as any
      );
    }

    if (city && typeof city === "string") {
      conditions.push(eq(venues.city, city));
    }

    if (country && typeof country === "string") {
      conditions.push(eq(venues.country, country));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;

    res.json(result);
  } catch (error) {
    console.error("Error fetching venues:", error);
    res.status(500).json({ message: "Failed to fetch venues" });
  }
});

// GET /api/venues/:id - Get venue detail
router.get("/:id", async (req, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.select()
      .from(venues)
      .where(eq(venues.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Venue not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching venue:", error);
    res.status(500).json({ message: "Failed to fetch venue" });
  }
});

// POST /api/venues - Create venue (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, address, city, country, phone, email, hours, image } = req.body;

    if (!name || !address || !city || !country) {
      return res.status(400).json({ message: "Name, address, city, and country are required" });
    }

    const result = await db.insert(venues).values({
      name,
      description: description || null,
      address,
      city,
      country,
      phone: phone || null,
      email: email || null,
      hours: hours || null,
      image: image || null,
      rating: 0,
      reviewCount: 0,
      verified: false,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating venue:", error);
    res.status(500).json({ message: "Failed to create venue" });
  }
});

// PATCH /api/venues/:id - Update venue (auth required)
router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, address, city, country, phone, email, hours, image } = req.body;

    // Check existence
    const existing = await db.select().from(venues).where(eq(venues.id, parseInt(id))).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (hours !== undefined) updateData.hours = hours;
    if (image !== undefined) updateData.image = image;

    const result = await db.update(venues)
      .set(updateData)
      .where(eq(venues.id, parseInt(id)))
      .returning();

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating venue:", error);
    res.status(500).json({ message: "Failed to update venue" });
  }
});

// DELETE /api/venues/:id - Delete venue (auth required)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check existence
    const existing = await db.select().from(venues).where(eq(venues.id, parseInt(id))).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Venue not found" });
    }

    await db.delete(venues).where(eq(venues.id, parseInt(id)));

    res.json({ message: "Venue deleted successfully" });
  } catch (error) {
    console.error("Error deleting venue:", error);
    res.status(500).json({ message: "Failed to delete venue" });
  }
});

export default router;
