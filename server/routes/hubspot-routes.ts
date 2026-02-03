/**
 * HubSpot Admin Routes
 * 
 * Endpoints for managing HubSpot sync operations.
 * Admin-only access required.
 */

import { Router, Request, Response } from "express";
import { HubSpotService } from "../services/HubSpotService";
import { authenticateToken, requireAdmin, AuthRequest } from "../middleware/auth";
import { db } from "../db";
import { users } from "@shared/schema";
import { not, like } from "drizzle-orm";

const router = Router();

/**
 * GET /api/admin/hubspot/status
 * Check HubSpot connection status
 */
router.get("/status", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const status = await HubSpotService.getStatus();
    res.json(status);
  } catch (error) {
    console.error("[HubSpot Routes] Status check error:", error);
    res.status(500).json({ error: "Failed to check HubSpot status" });
  }
});

/**
 * POST /api/admin/hubspot/sync-all
 * Sync all real users to HubSpot
 */
router.post("/sync-all", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Get all real users (not discovered/scraped users)
    const realUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        username: users.username,
        city: users.city,
        country: users.country,
        waitlist: users.waitlist,
        is_verified: users.isVerified,
        created_at: users.createdAt,
      })
      .from(users)
      .where(
        not(like(users.email, "%@discovered.mundotango.app"))
      );

    console.log(`[HubSpot Routes] Starting sync of ${realUsers.length} real users`);

    const results = await HubSpotService.syncAllUsers(realUsers);

    res.json({
      message: `Synced ${results.success} of ${results.total} users to HubSpot`,
      ...results,
    });
  } catch (error) {
    console.error("[HubSpot Routes] Sync all error:", error);
    res.status(500).json({ error: "Failed to sync users to HubSpot" });
  }
});

/**
 * POST /api/admin/hubspot/sync-user/:id
 * Sync a single user to HubSpot
 */
router.post("/sync-user/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        username: users.username,
        city: users.city,
        country: users.country,
        waitlist: users.waitlist,
        is_verified: users.isVerified,
        created_at: users.createdAt,
      })
      .from(users)
      .where(
        not(like(users.email, "%@discovered.mundotango.app"))
      )
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await HubSpotService.syncContact(user);

    if (result.success) {
      res.json({
        message: `Synced user ${user.email} to HubSpot`,
        contactId: result.contactId,
      });
    } else {
      res.status(500).json({
        error: "Failed to sync user",
        details: result.error,
      });
    }
  } catch (error) {
    console.error("[HubSpot Routes] Sync user error:", error);
    res.status(500).json({ error: "Failed to sync user to HubSpot" });
  }
});

export default router;
