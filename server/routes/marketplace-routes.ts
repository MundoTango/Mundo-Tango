import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import { marketplaceItems, users } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { eq, and, desc, sql, or, gte, lte } from "drizzle-orm";

const router = Router();

// ============================================================================
// MARKETPLACE ITEM ROUTES
// ============================================================================

// GET /api/marketplace/items - Get all marketplace items with filters
router.get("/items", async (req: Request, res: Response) => {
  try {
    const {
      category,
      condition,
      status,
      city,
      country,
      minPrice,
      maxPrice,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        item: marketplaceItems,
        seller: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(marketplaceItems)
      .leftJoin(users, eq(marketplaceItems.sellerId, users.id))
      .$dynamic();

    const conditions = [];

    if (category) conditions.push(eq(marketplaceItems.category, category as string));
    if (condition) conditions.push(eq(marketplaceItems.condition, condition as string));
    if (status) conditions.push(eq(marketplaceItems.status, status as string));
    if (city) conditions.push(eq(marketplaceItems.city, city as string));
    if (country) conditions.push(eq(marketplaceItems.country, country as string));
    if (minPrice) conditions.push(gte(marketplaceItems.price, parseInt(minPrice as string)));
    if (maxPrice) conditions.push(lte(marketplaceItems.price, parseInt(maxPrice as string)));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(marketplaceItems.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[Marketplace] Error fetching items:", error);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// GET /api/marketplace/items/:id - Get specific item
router.get("/items/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db
      .select({
        item: marketplaceItems,
        seller: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(marketplaceItems)
      .leftJoin(users, eq(marketplaceItems.sellerId, users.id))
      .where(eq(marketplaceItems.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Increment view count
    await db
      .update(marketplaceItems)
      .set({ views: sql`${marketplaceItems.views} + 1` })
      .where(eq(marketplaceItems.id, parseInt(id)));

    res.json(result[0]);
  } catch (error) {
    console.error("[Marketplace] Error fetching item:", error);
    res.status(500).json({ message: "Failed to fetch item" });
  }
});

// POST /api/marketplace/items - Create new item (auth required)
router.post("/items", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.userId!;
    console.log('[Marketplace] Creating item - userId:', req.userId, 'user:', req.user?.id);
    
    const {
      title,
      description,
      category,
      condition,
      price,
      currency,
      images,
      location,
      city,
      country
    } = req.body;

    if (!title || !description || !category || !condition || !price) {
      return res.status(400).json({ 
        message: "Title, description, category, condition, and price are required" 
      });
    }

    const [item] = await db
      .insert(marketplaceItems)
      .values({
        sellerId,
        title,
        description,
        category,
        condition,
        price,
        currency: currency || "USD",
        images,
        location,
        city,
        country,
        status: "available",
        views: 0
      })
      .returning();

    res.status(201).json(item);
  } catch (error) {
    console.error("[Marketplace] Error creating item:", error);
    res.status(500).json({ message: "Failed to create item" });
  }
});

// PATCH /api/marketplace/items/:id - Update item (auth required, owner only)
router.patch("/items/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const existing = await db
      .select()
      .from(marketplaceItems)
      .where(eq(marketplaceItems.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (existing[0].sellerId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [updated] = await db
      .update(marketplaceItems)
      .set({
        ...req.body,
        updatedAt: new Date()
      })
      .where(eq(marketplaceItems.id, parseInt(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[Marketplace] Error updating item:", error);
    res.status(500).json({ message: "Failed to update item" });
  }
});

// DELETE /api/marketplace/items/:id - Delete item (auth required, owner only)
router.delete("/items/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const existing = await db
      .select()
      .from(marketplaceItems)
      .where(eq(marketplaceItems.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (existing[0].sellerId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db
      .delete(marketplaceItems)
      .where(eq(marketplaceItems.id, parseInt(id)));

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("[Marketplace] Error deleting item:", error);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

// PATCH /api/marketplace/items/:id/status - Update item status (auth required, owner only)
router.patch("/items/:id/status", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["available", "sold", "reserved", "inactive"].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be: available, sold, reserved, or inactive" 
      });
    }

    // Check ownership
    const existing = await db
      .select()
      .from(marketplaceItems)
      .where(eq(marketplaceItems.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (existing[0].sellerId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [updated] = await db
      .update(marketplaceItems)
      .set({ status })
      .where(eq(marketplaceItems.id, parseInt(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[Marketplace] Error updating item status:", error);
    res.status(500).json({ message: "Failed to update item status" });
  }
});

// GET /api/marketplace/my-items - Get user's items (auth required)
router.get("/my-items", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const items = await db
      .select()
      .from(marketplaceItems)
      .where(eq(marketplaceItems.sellerId, userId))
      .orderBy(desc(marketplaceItems.createdAt));

    res.json(items);
  } catch (error) {
    console.error("[Marketplace] Error fetching user items:", error);
    res.status(500).json({ message: "Failed to fetch your items" });
  }
});

// GET /api/marketplace/categories - Get all categories with counts
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await db
      .select({
        category: marketplaceItems.category,
        count: sql<number>`count(*)::int`
      })
      .from(marketplaceItems)
      .where(eq(marketplaceItems.status, "available"))
      .groupBy(marketplaceItems.category)
      .orderBy(desc(sql`count(*)`));

    res.json(categories);
  } catch (error) {
    console.error("[Marketplace] Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

export default router;
