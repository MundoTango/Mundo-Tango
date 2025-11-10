import { Router, Response } from "express";
import { db } from "@shared/db";
import { media, users } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/media?type=photo|video - Get media with optional type filter
router.get("/", async (req, res: Response) => {
  try {
    const { type } = req.query;

    let query = db.select({
      media: media,
      uploader: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
      },
    })
    .from(media)
    .leftJoin(users, eq(media.uploadedBy, users.id))
    .orderBy(desc(media.createdAt));

    if (type) {
      query = query.where(eq(media.type, type as string)) as any;
    }

    const result = await query;

    res.json(result.map((r: any) => ({
      ...r.media,
      uploader: r.uploader,
    })));
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ message: "Failed to fetch media" });
  }
});

// POST /api/media - Create media (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { type, url, thumbnailUrl, caption, albumId } = req.body;

    if (!type || !url) {
      return res.status(400).json({ message: "Type and URL are required" });
    }

    const result = await db.insert(media).values({
      type,
      url,
      thumbnailUrl,
      caption,
      albumId: albumId || null,
      uploadedBy: userId,
      likes: 0,
      views: 0,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating media:", error);
    res.status(500).json({ message: "Failed to create media" });
  }
});

// DELETE /api/media/:id - Delete media (auth required)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const existingResult = await db.select()
      .from(media)
      .where(eq(media.id, parseInt(id)))
      .limit(1);

    if (existingResult.length === 0) {
      return res.status(404).json({ message: "Media not found" });
    }

    const existing: any = existingResult[0];

    if (existing.uploadedBy !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this media" });
    }

    await db.delete(media).where(eq(media.id, parseInt(id)));

    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).json({ message: "Failed to delete media" });
  }
});

// POST /api/media/:id/like - Like media (auth required)
router.post("/:id/like", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.update(media)
      .set({
        likes: sql`${media.likes} + 1`,
      })
      .where(eq(media.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Media not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error liking media:", error);
    res.status(500).json({ message: "Failed to like media" });
  }
});

export default router;
