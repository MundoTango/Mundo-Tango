import { Router } from "express";
import type { Request, Response } from "express";
import * as pointsService from "../services/gamification/pointsService";
import * as badgeService from "../services/gamification/badgeService";
import * as leaderboardService from "../services/gamification/leaderboardService";
import * as autonomyService from "../services/gamification/autonomyService";

const router = Router();

router.post("/points/award", async (req: Request, res: Response) => {
  try {
    const { userId, action, amount, reason } = req.body;

    if (!userId || !action || amount === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const totalPoints = await pointsService.awardPoints(userId, action, amount, reason);
    
    await badgeService.checkAndAwardBadges(userId);

    res.json({ success: true, totalPoints });
  } catch (error) {
    console.error("Error awarding points:", error);
    res.status(500).json({ error: "Failed to award points" });
  }
});

router.get("/points/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const points = await pointsService.getUserPoints(userId);
    res.json({ userId, points });
  } catch (error) {
    console.error("Error getting user points:", error);
    res.status(500).json({ error: "Failed to get user points" });
  }
});

router.get("/points/:userId/history", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const history = await pointsService.getPointsHistory(userId);
    res.json({ userId, history });
  } catch (error) {
    console.error("Error getting points history:", error);
    res.status(500).json({ error: "Failed to get points history" });
  }
});

router.get("/badges", async (req: Request, res: Response) => {
  try {
    const badges = await badgeService.getAllBadges();
    res.json({ badges });
  } catch (error) {
    console.error("Error getting badges:", error);
    res.status(500).json({ error: "Failed to get badges" });
  }
});

router.get("/badges/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const badges = await badgeService.getUserBadges(userId);
    res.json({ userId, badges });
  } catch (error) {
    console.error("Error getting user badges:", error);
    res.status(500).json({ error: "Failed to get user badges" });
  }
});

router.get("/badges/:userId/progress", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const allBadges = badgeService.BADGE_DEFINITIONS;
    
    const progress = await Promise.all(
      allBadges.map(async (badge) => ({
        badgeId: badge.badgeId,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        progress: await badgeService.getBadgeProgress(userId, badge.badgeId),
      }))
    );

    res.json({ userId, progress });
  } catch (error) {
    console.error("Error getting badge progress:", error);
    res.status(500).json({ error: "Failed to get badge progress" });
  }
});

router.get("/leaderboard/weekly", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const leaderboard = await leaderboardService.getWeeklyLeaderboard(limit);
    res.json({ type: "weekly", leaderboard });
  } catch (error) {
    console.error("Error getting weekly leaderboard:", error);
    res.status(500).json({ error: "Failed to get weekly leaderboard" });
  }
});

router.get("/leaderboard/monthly", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const leaderboard = await leaderboardService.getMonthlyLeaderboard(limit);
    res.json({ type: "monthly", leaderboard });
  } catch (error) {
    console.error("Error getting monthly leaderboard:", error);
    res.status(500).json({ error: "Failed to get monthly leaderboard" });
  }
});

router.get("/leaderboard/alltime", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const leaderboard = await leaderboardService.getAllTimeLeaderboard(limit);
    res.json({ type: "alltime", leaderboard });
  } catch (error) {
    console.error("Error getting all-time leaderboard:", error);
    res.status(500).json({ error: "Failed to get all-time leaderboard" });
  }
});

router.get("/leaderboard/volunteer", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const leaderboard = await leaderboardService.getVolunteerLeaderboard(limit);
    res.json({ type: "volunteer", leaderboard });
  } catch (error) {
    console.error("Error getting volunteer leaderboard:", error);
    res.status(500).json({ error: "Failed to get volunteer leaderboard" });
  }
});

router.get("/leaderboard/bugs", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const leaderboard = await leaderboardService.getBugHunterLeaderboard(limit);
    res.json({ type: "bugs", leaderboard });
  } catch (error) {
    console.error("Error getting bug hunter leaderboard:", error);
    res.status(500).json({ error: "Failed to get bug hunter leaderboard" });
  }
});

router.get("/leaderboard/:userId/rank", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const type = req.query.type as string || "alltime";
    const rank = await leaderboardService.getUserRank(userId, type);
    res.json({ userId, type, ...rank });
  } catch (error) {
    console.error("Error getting user rank:", error);
    res.status(500).json({ error: "Failed to get user rank" });
  }
});

router.get("/autonomy/level", async (req: Request, res: Response) => {
  try {
    const level = await autonomyService.getCurrentAutonomyLevel();
    const capabilities = await autonomyService.getAvailableCapabilities(level);
    res.json({ level, capabilities });
  } catch (error) {
    console.error("Error getting autonomy level:", error);
    res.status(500).json({ error: "Failed to get autonomy level" });
  }
});

router.get("/autonomy/timeline", async (req: Request, res: Response) => {
  try {
    const timeline = await autonomyService.getProgressTimeline();
    res.json({ timeline });
  } catch (error) {
    console.error("Error getting autonomy timeline:", error);
    res.status(500).json({ error: "Failed to get autonomy timeline" });
  }
});

router.post("/initialize", async (req: Request, res: Response) => {
  try {
    await badgeService.initializeBadges();
    await autonomyService.initializeAutonomyTimeline();
    res.json({ success: true, message: "Gamification system initialized" });
  } catch (error) {
    console.error("Error initializing gamification:", error);
    res.status(500).json({ error: "Failed to initialize gamification system" });
  }
});

export default router;
