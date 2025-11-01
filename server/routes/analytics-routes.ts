import { Router } from "express";
import type { IStorage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";

export function createAnalyticsRoutes(storage: IStorage) {
  const router = Router();

  router.post("/track/post-view", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, duration } = req.body;
      const userId = req.userId!;
      
      await storage.createAnalyticsEvent({
        eventType: "post_view",
        userId,
        entityType: "post",
        entityId: postId,
        metadata: { duration },
      });
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/track/post-share", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, platform } = req.body;
      const userId = req.userId!;
      
      await storage.createAnalyticsEvent({
        eventType: "post_share",
        userId,
        entityType: "post",
        entityId: postId,
        metadata: { platform },
      });
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/track/event-view", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { eventId } = req.body;
      const userId = req.userId!;
      
      await storage.createAnalyticsEvent({
        eventType: "event_view",
        userId,
        entityType: "event",
        entityId: eventId,
      });
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/stats/post/:postId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const postId = parseInt(req.params.postId);
      
      const views = await storage.getAnalyticsCount("post_view", "post", postId);
      const shares = await storage.getAnalyticsCount("post_share", "post", postId);
      
      res.json({
        views,
        shares,
        engagement: views + shares,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/stats/user", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      
      const totalPosts = await storage.getUserPostCount(userId);
      const totalViews = await storage.getUserTotalViews(userId);
      const totalLikes = await storage.getUserTotalLikes(userId);
      
      res.json({
        totalPosts,
        totalViews,
        totalLikes,
        avgViewsPerPost: totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
