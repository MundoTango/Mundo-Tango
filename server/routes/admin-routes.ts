/**
 * ADMIN DASHBOARD ROUTES
 * 6 sections: Overview, User Growth, Moderation Queue, Activity, Health, Top Content
 */

import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { storage } from "../storage";

const router = Router();

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * GET /api/admin/stats/overview
 * Overview metrics for admin dashboard
 */
router.get("/stats/overview", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await storage.getAdminStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/moderation/queue
 * Get pending moderation items
 */
router.get("/moderation/queue", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const queue = await storage.getModerationQueue();
    res.json(queue);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/moderation/:reportId/action
 * Take action on moderation report
 */
router.post("/moderation/:reportId/action", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, notes } = req.body;
    
    // TODO: Implement moderation action logic
    // actions: 'dismiss', 'warn', 'remove', 'suspend', 'ban'
    
    res.json({ success: true, reportId, action });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/activity/recent
 * Get recent user activity
 */
router.get("/activity/recent", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = "20" } = req.query;
    const activities = await storage.getRecentAdminActivity();
    res.json(activities.slice(0, parseInt(limit as string)));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = "1", limit = "50", search = "", role = "", status = "" } = req.query;
    
    // TODO: Implement user filtering/pagination
    
    res.json({ users: [], total: 0, page: parseInt(page as string) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
