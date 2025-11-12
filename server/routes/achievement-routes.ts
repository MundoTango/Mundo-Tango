import { Router, Response } from "express";
import { db } from "@shared/db";
import { achievements, userAchievements, userPoints, users } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/achievements - Get all available achievements
router.get("/", async (req, res: Response) => {
  try {
    const result = await db.select()
      .from(achievements)
      .orderBy(achievements.category, achievements.points);

    res.json(result);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Failed to fetch achievements" });
  }
});

// GET /api/achievements/user/:userId - Get user's achievements
router.get("/user/:userId", async (req, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await db.select({
      userAchievement: userAchievements,
      achievement: achievements,
    })
    .from(userAchievements)
    .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, parseInt(userId)))
    .orderBy(desc(userAchievements.unlockedAt));

    res.json(result.map((r: any) => ({
      ...r.userAchievement,
      achievement: r.achievement,
    })));
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({ message: "Failed to fetch user achievements" });
  }
});

// GET /api/achievements/my - Get authenticated user's achievements (auth required)
router.get("/my", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const result = await db.select({
      userAchievement: userAchievements,
      achievement: achievements,
    })
    .from(userAchievements)
    .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.unlockedAt));

    res.json(result.map((r: any) => ({
      ...r.userAchievement,
      achievement: r.achievement,
    })));
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({ message: "Failed to fetch user achievements" });
  }
});

// POST /api/achievements/unlock - Manually unlock achievement (auth required, admin)
router.post("/unlock", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, achievementId } = req.body;

    if (!userId || !achievementId) {
      return res.status(400).json({ message: "User ID and Achievement ID are required" });
    }

    // Check if already unlocked
    const existing = await db.select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Achievement already unlocked" });
    }

    // Get achievement details for points
    const achievement = await db.select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .limit(1);

    if (achievement.length === 0) {
      return res.status(404).json({ message: "Achievement not found" });
    }

    // Unlock achievement
    const result = await db.insert(userAchievements).values({
      userId,
      achievementId,
      progress: 100,
    }).returning();

    // Add points to user
    await addPoints(userId, achievement[0].points, `Achievement: ${achievement[0].name}`);

    res.status(201).json({
      ...result[0],
      achievement: achievement[0],
    });
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    res.status(500).json({ message: "Failed to unlock achievement" });
  }
});

// POST /api/achievements/progress - Update achievement progress (auth required)
router.post("/progress", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { achievementId, progress } = req.body;

    if (!achievementId || progress === undefined) {
      return res.status(400).json({ message: "Achievement ID and progress are required" });
    }

    // Check if achievement exists
    const achievement = await db.select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .limit(1);

    if (achievement.length === 0) {
      return res.status(404).json({ message: "Achievement not found" });
    }

    // Check existing progress
    const existing = await db.select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update progress
      const result = await db.update(userAchievements)
        .set({ 
          progress: Math.min(progress, 100),
          unlockedAt: progress >= 100 ? new Date() : existing[0].unlockedAt,
        })
        .where(and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        ))
        .returning();

      // If just completed, add points
      if (progress >= 100 && existing[0].progress < 100) {
        await addPoints(userId, achievement[0].points, `Achievement: ${achievement[0].name}`);
      }

      res.json(result[0]);
    } else {
      // Create new progress entry
      const result = await db.insert(userAchievements).values({
        userId,
        achievementId,
        progress: Math.min(progress, 100),
      }).returning();

      // If completed on first entry, add points
      if (progress >= 100) {
        await addPoints(userId, achievement[0].points, `Achievement: ${achievement[0].name}`);
      }

      res.status(201).json(result[0]);
    }
  } catch (error) {
    console.error("Error updating achievement progress:", error);
    res.status(500).json({ message: "Failed to update achievement progress" });
  }
});

// GET /api/achievements/stats - Get achievement statistics (auth required)
router.get("/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const totalAchievements = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(achievements);

    const unlockedAchievements = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(userAchievements)
    .where(and(
      eq(userAchievements.userId, userId),
      sql`${userAchievements.progress} >= 100`
    ));

    const points = await db.select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId))
      .limit(1);

    res.json({
      totalAchievements: totalAchievements[0].count,
      unlockedAchievements: unlockedAchievements[0].count,
      totalPoints: points.length > 0 ? points[0].totalPoints : 0,
      completionRate: totalAchievements[0].count > 0 
        ? Math.round((unlockedAchievements[0].count / totalAchievements[0].count) * 100) 
        : 0,
    });
  } catch (error) {
    console.error("Error fetching achievement stats:", error);
    res.status(500).json({ message: "Failed to fetch achievement stats" });
  }
});

// Helper: Add points to user
async function addPoints(userId: number, points: number, reason: string) {
  try {
    // Check if user has points entry
    const existing = await db.select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing points
      await db.update(userPoints)
        .set({
          totalPoints: existing[0].totalPoints + points,
          updatedAt: new Date(),
        })
        .where(eq(userPoints.userId, userId));
    } else {
      // Create new points entry
      await db.insert(userPoints).values({
        userId,
        totalPoints: points,
        reason,
      });
    }
  } catch (error) {
    console.error("Error adding points:", error);
  }
}

export default router;
