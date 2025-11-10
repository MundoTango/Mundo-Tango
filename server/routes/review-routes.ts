import { Router, Response } from "express";
import { db } from "@shared/db";
import { reviews, users, teachers, venues, events } from "@shared/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/reviews?targetType=teacher&targetId=1 - Get reviews for a target
router.get("/", async (req, res: Response) => {
  try {
    const { targetType, targetId, userId } = req.query;

    let query = db.select({
      review: reviews,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
      },
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.createdAt));

    if (targetType && targetId) {
      query = query.where(
        and(
          eq(reviews.targetType, targetType as string),
          eq(reviews.targetId, parseInt(targetId as string))
        )
      ) as any;
    }

    if (userId) {
      query = query.where(eq(reviews.userId, parseInt(userId as string))) as any;
    }

    const result = await query;

    res.json(result.map((r: any) => ({
      ...r.review,
      user: r.user,
    })));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// POST /api/reviews - Create review (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { targetType, targetId, rating, title, content } = req.body;

    if (!targetType || !targetId || !rating || !content) {
      return res.status(400).json({ message: "Target, rating, and content are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if user already reviewed this target
    const existingReview = await db.select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          eq(reviews.targetType, targetType),
          eq(reviews.targetId, targetId)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      return res.status(400).json({ message: "You have already reviewed this" });
    }

    const result = await db.insert(reviews).values({
      userId,
      targetType,
      targetId,
      rating,
      title,
      content,
      verified: false,
      helpfulCount: 0,
    }).returning();

    // Update target's average rating
    await updateTargetRating(targetType, targetId);

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
});

// PATCH /api/reviews/:id - Update review (auth required)
router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { rating, title, content } = req.body;

    // Check ownership
    const existingResult = await db.select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .limit(1);

    if (existingResult.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    const existing: any = existingResult[0];

    if (existing.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this review" });
    }

    const updateData: any = { updatedAt: new Date() };
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      updateData.rating = rating;
    }
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    const result = await db.update(reviews)
      .set(updateData)
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    // Update target's average rating if rating changed
    if (rating !== undefined) {
      await updateTargetRating(existing.targetType, existing.targetId);
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Failed to update review" });
  }
});

// DELETE /api/reviews/:id - Delete review (auth required)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const existingResult = await db.select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .limit(1);

    if (existingResult.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    const existing: any = existingResult[0];

    if (existing.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await db.delete(reviews).where(eq(reviews.id, parseInt(id)));

    // Update target's average rating
    await updateTargetRating(existing.targetType, existing.targetId);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
});

// POST /api/reviews/:id/helpful - Mark review as helpful (auth required)
router.post("/:id/helpful", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.update(reviews)
      .set({
        helpfulCount: sql`${reviews.helpfulCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    res.status(500).json({ message: "Failed to mark review as helpful" });
  }
});

// GET /api/reviews/stats/:targetType/:targetId - Get review statistics
router.get("/stats/:targetType/:targetId", async (req, res: Response) => {
  try {
    const { targetType, targetId } = req.params;

    const result = await db.select({
      count: sql<number>`count(*)::int`,
      avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      rating1: sql<number>`count(case when ${reviews.rating} = 1 then 1 end)::int`,
      rating2: sql<number>`count(case when ${reviews.rating} = 2 then 1 end)::int`,
      rating3: sql<number>`count(case when ${reviews.rating} = 3 then 1 end)::int`,
      rating4: sql<number>`count(case when ${reviews.rating} = 4 then 1 end)::int`,
      rating5: sql<number>`count(case when ${reviews.rating} = 5 then 1 end)::int`,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.targetType, targetType),
        eq(reviews.targetId, parseInt(targetId))
      )
    );

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching review stats:", error);
    res.status(500).json({ message: "Failed to fetch review stats" });
  }
});

// Helper: Update target's average rating
async function updateTargetRating(targetType: string, targetId: number) {
  try {
    const result = await db.select({
      count: sql<number>`count(*)::int`,
      avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.targetType, targetType),
        eq(reviews.targetId, targetId)
      )
    );

    const { count, avgRating } = result[0];

    // Update the appropriate table
    if (targetType === "teacher") {
      await db.update(teachers)
        .set({
          rating: Math.round(avgRating),
          reviewCount: count,
        })
        .where(eq(teachers.id, targetId));
    } else if (targetType === "venue") {
      await db.update(venues)
        .set({
          rating: Math.round(avgRating),
          reviewCount: count,
        })
        .where(eq(venues.id, targetId));
    } else if (targetType === "event") {
      await db.update(events)
        .set({
          rating: Math.round(avgRating || 0),
          reviewCount: count,
        })
        .where(eq(events.id, targetId));
    }
  } catch (error) {
    console.error("Error updating target rating:", error);
  }
}

export default router;
