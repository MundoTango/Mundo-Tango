import { Router, Response } from "express";
import { db } from "@shared/db";
import { users, userPoints, posts, eventRsvps } from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";

const router = Router();

// GET /api/leaderboard?type=points|events|contributions - Get leaderboard
router.get("/", async (req, res: Response) => {
  try {
    const { type = "points" } = req.query;

    if (type === "points") {
      // Top users by points
      const result = await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatar: users.profileImage,
        location: users.city,
        verified: sql<boolean>`${users.isVerified}`,
        score: sql<number>`COALESCE(MAX(${userPoints.totalPoints}), 0)::int`,
      })
      .from(users)
      .leftJoin(userPoints, eq(users.id, userPoints.userId))
      .groupBy(users.id)
      .orderBy(desc(sql`COALESCE(MAX(${userPoints.totalPoints}), 0)`))
      .limit(100);

      res.json(result);
    } else if (type === "events") {
      // Top users by events attended
      const result = await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatar: users.profileImage,
        location: users.city,
        verified: sql<boolean>`${users.isVerified}`,
        score: sql<number>`COUNT(${eventRsvps.id})::int`,
      })
      .from(users)
      .leftJoin(eventRsvps, and(
        eq(users.id, eventRsvps.userId),
        eq(eventRsvps.status, "attending")
      ))
      .groupBy(users.id)
      .orderBy(desc(sql`COUNT(${eventRsvps.id})`))
      .limit(100);

      res.json(result);
    } else if (type === "contributions") {
      // Top users by posts created
      const result = await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatar: users.profileImage,
        location: users.city,
        verified: sql<boolean>`${users.isVerified}`,
        score: sql<number>`COUNT(${posts.id})::int`,
      })
      .from(users)
      .leftJoin(posts, eq(users.id, posts.userId))
      .groupBy(users.id)
      .orderBy(desc(sql`COUNT(${posts.id})`))
      .limit(100);

      res.json(result);
    } else {
      return res.status(400).json({ message: "Invalid leaderboard type" });
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

export default router;
