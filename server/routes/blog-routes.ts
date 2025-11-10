import { Router, Response } from "express";
import { db } from "@shared/db";
import { blogPosts, users } from "@shared/schema";
import { eq, desc, or, ilike, and } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/blog?search=query - Get blog posts with optional search
router.get("/", async (req, res: Response) => {
  try {
    const { search } = req.query;

    let query = db.select({
      post: blogPosts,
      author: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatar: users.profileImage,
      },
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt));

    if (search && typeof search === "string") {
      query = query.where(
        or(
          ilike(blogPosts.title, `%${search}%`),
          ilike(blogPosts.content, `%${search}%`)
        )
      ) as any;
    }

    const result = await query;

    res.json(result.map((r: any) => ({
      ...r.post,
      author: r.author,
    })));
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ message: "Failed to fetch blog posts" });
  }
});

// GET /api/blog/:slug - Get single blog post by slug
router.get("/:slug", async (req, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await db.select({
      post: blogPosts,
      author: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatar: users.profileImage,
      },
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(eq(blogPosts.slug, slug))
    .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    const data: any = result[0];

    res.json({
      ...data.post,
      author: data.author,
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({ message: "Failed to fetch blog post" });
  }
});

// POST /api/blog - Create blog post (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, slug, content, excerpt, coverImage, category, status, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const result = await db.insert(blogPosts).values({
      authorId: userId,
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
      content,
      excerpt,
      coverImage,
      category,
      status: status || "draft",
      tags: tags || [],
      publishedAt: status === "published" ? new Date() : null,
      views: 0,
      readTime: Math.ceil(content.split(" ").length / 200), // ~200 words per minute
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ message: "Failed to create blog post" });
  }
});

// PATCH /api/blog/:id - Update blog post (auth required)
router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { title, content, excerpt, coverImage, category, status, tags } = req.body;

    // Check ownership
    const existingResult = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, parseInt(id)))
      .limit(1);

    if (existingResult.length === 0) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    const existing: any = existingResult[0];

    if (existing.authorId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) {
      updateData.content = content;
      updateData.readTime = Math.ceil(content.split(" ").length / 200);
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) {
      updateData.status = status;
      if (status === "published" && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (tags !== undefined) updateData.tags = tags;

    const result = await db.update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, parseInt(id)))
      .returning();

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ message: "Failed to update blog post" });
  }
});

// DELETE /api/blog/:id - Delete blog post (auth required)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const existingResult = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, parseInt(id)))
      .limit(1);

    if (existingResult.length === 0) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    const existing: any = existingResult[0];

    if (existing.authorId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(id)));

    res.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ message: "Failed to delete blog post" });
  }
});

export default router;
