import { Router, type Request, Response } from "express";
import { db } from "@shared/db";
import { platformAds, adImpressions, adRevenue, insertPlatformAdSchema, insertAdImpressionSchema } from "@shared/adSchemas";
import { users } from "@shared/schema";
import { authenticateToken, AuthRequest, requireRoleLevel } from "../middleware/auth";
import { eq, and, desc, sql, gte, lte, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const router = Router();

// Helper: Check if user matches ad targeting
function matchesTargeting(user: any, targeting: any): boolean {
  if (!targeting) return true;

  // Check role targeting
  if (targeting.roles && targeting.roles.length > 0) {
    const userRoles = user.tangoRoles || [];
    const hasMatchingRole = targeting.roles.some((role: string) => 
      userRoles.includes(role)
    );
    if (!hasMatchingRole) return false;
  }

  // Check city targeting
  if (targeting.cities && targeting.cities.length > 0) {
    if (!targeting.cities.includes(user.city)) return false;
  }

  // Check country targeting
  if (targeting.countries && targeting.countries.length > 0) {
    if (!targeting.countries.includes(user.country)) return false;
  }

  // Check subscription tier targeting
  if (targeting.tiers && targeting.tiers.length > 0) {
    const userTier = user.subscriptionTier || 'free';
    if (!targeting.tiers.includes(userTier)) return false;
  }

  return true;
}

// Helper: Get user impression count for today
async function getUserDailyImpressions(userId: number): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const startOfDay = new Date(today + 'T00:00:00Z');
  
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(adImpressions)
    .where(
      and(
        eq(adImpressions.userId, userId),
        gte(adImpressions.viewedAt, startOfDay)
      )
    );
  
  return Number(result[0]?.count || 0);
}

// PUBLIC ROUTES

// GET /api/ads/display?placement={placement}
// Get ad for specific placement with user targeting
router.get("/display", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { placement } = req.query;
    
    if (!placement || typeof placement !== 'string') {
      return res.status(400).json({ error: "Placement parameter is required" });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check frequency capping (max 5 ads per day per user)
    const dailyImpressions = await getUserDailyImpressions(user.id);
    if (dailyImpressions >= 5) {
      return res.json({ ad: null, reason: "daily_limit_reached" });
    }

    // Get active ads for this placement
    const now = new Date();
    const activeAds = await db
      .select()
      .from(platformAds)
      .where(
        and(
          eq(platformAds.placement, placement),
          eq(platformAds.isActive, true),
          or(
            isNull(platformAds.startDate),
            lte(platformAds.startDate, now)
          ),
          or(
            isNull(platformAds.endDate),
            gte(platformAds.endDate, now)
          )
        )
      );

    // Filter by targeting
    const matchingAds = activeAds.filter(ad => {
      return matchesTargeting(user, ad.targeting);
    });

    if (matchingAds.length === 0) {
      return res.json({ ad: null, reason: "no_matching_ads" });
    }

    // Select random ad (weighted by CPM rate for more expensive ads)
    const totalWeight = matchingAds.reduce((sum, ad) => sum + ad.cpmRate, 0);
    let random = Math.random() * totalWeight;
    let selectedAd = matchingAds[0];
    
    for (const ad of matchingAds) {
      random -= ad.cpmRate;
      if (random <= 0) {
        selectedAd = ad;
        break;
      }
    }

    return res.json({ ad: selectedAd });
  } catch (error) {
    console.error("[Ads] Error fetching ad:", error);
    return res.status(500).json({ error: "Failed to fetch ad" });
  }
});

// POST /api/ads/impression
// Track ad impression
router.post("/impression", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      adId: z.number().int().positive(),
      placement: z.string().min(1),
    });

    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: fromZodError(validationResult.error).toString() 
      });
    }

    const { adId, placement } = validationResult.data;
    const userId = req.user?.id;

    // Record impression
    await db.insert(adImpressions).values({
      adId,
      userId: userId || null,
      placement,
      clicked: false,
    });

    // Update daily revenue (aggregate impressions)
    const today = new Date().toISOString().split('T')[0];
    
    // Get ad CPM rate
    const [ad] = await db
      .select({ cpmRate: platformAds.cpmRate })
      .from(platformAds)
      .where(eq(platformAds.id, adId))
      .limit(1);

    if (ad) {
      const impressionRevenue = Math.floor(ad.cpmRate / 1000); // CPM = cost per 1000 impressions

      // Check if revenue record exists for today
      const [existingRevenue] = await db
        .select()
        .from(adRevenue)
        .where(
          and(
            eq(adRevenue.adId, adId),
            eq(adRevenue.date, today)
          )
        )
        .limit(1);

      if (existingRevenue) {
        // Update existing record
        await db
          .update(adRevenue)
          .set({
            impressions: sql`${adRevenue.impressions} + 1`,
            revenue: sql`${adRevenue.revenue} + ${impressionRevenue}`,
          })
          .where(eq(adRevenue.id, existingRevenue.id));
      } else {
        // Create new record
        await db.insert(adRevenue).values({
          adId,
          date: today,
          impressions: 1,
          clicks: 0,
          revenue: impressionRevenue,
        });
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("[Ads] Error tracking impression:", error);
    return res.status(500).json({ error: "Failed to track impression" });
  }
});

// POST /api/ads/click
// Track ad click
router.post("/click", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      adId: z.number().int().positive(),
      impressionId: z.number().int().positive().optional(),
    });

    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: fromZodError(validationResult.error).toString() 
      });
    }

    const { adId, impressionId } = validationResult.data;
    const today = new Date().toISOString().split('T')[0];

    // Update impression if provided
    if (impressionId) {
      await db
        .update(adImpressions)
        .set({
          clicked: true,
          clickedAt: new Date(),
        })
        .where(eq(adImpressions.id, impressionId));
    }

    // Update daily revenue clicks
    const [existingRevenue] = await db
      .select()
      .from(adRevenue)
      .where(
        and(
          eq(adRevenue.adId, adId),
          eq(adRevenue.date, today)
        )
      )
      .limit(1);

    if (existingRevenue) {
      await db
        .update(adRevenue)
        .set({
          clicks: sql`${adRevenue.clicks} + 1`,
        })
        .where(eq(adRevenue.id, existingRevenue.id));
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("[Ads] Error tracking click:", error);
    return res.status(500).json({ error: "Failed to track click" });
  }
});

// ADMIN ROUTES (super_admin only)

// GET /api/admin/ads
// List all ads
router.get("/admin/ads", authenticateToken, requireRoleLevel("super_admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { placement, active } = req.query;
    
    let query = db.select().from(platformAds);
    const conditions = [];

    if (placement && typeof placement === 'string') {
      conditions.push(eq(platformAds.placement, placement));
    }

    if (active !== undefined) {
      conditions.push(eq(platformAds.isActive, active === 'true'));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const ads = await query.orderBy(desc(platformAds.createdAt));
    
    return res.json(ads);
  } catch (error) {
    console.error("[Ads Admin] Error listing ads:", error);
    return res.status(500).json({ error: "Failed to list ads" });
  }
});

// POST /api/admin/ads
// Create new ad
router.post("/admin/ads", authenticateToken, requireRoleLevel("super_admin"), async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = insertPlatformAdSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: fromZodError(validationResult.error).toString() 
      });
    }

    const [newAd] = await db
      .insert(platformAds)
      .values(validationResult.data)
      .returning();

    return res.status(201).json(newAd);
  } catch (error) {
    console.error("[Ads Admin] Error creating ad:", error);
    return res.status(500).json({ error: "Failed to create ad" });
  }
});

// PATCH /api/admin/ads/:id
// Update ad
router.patch("/admin/ads/:id", authenticateToken, requireRoleLevel("super_admin"), async (req: AuthRequest, res: Response) => {
  try {
    const adId = parseInt(req.params.id);
    if (isNaN(adId)) {
      return res.status(400).json({ error: "Invalid ad ID" });
    }

    const updateSchema = insertPlatformAdSchema.partial();
    const validationResult = updateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: fromZodError(validationResult.error).toString() 
      });
    }

    const [updatedAd] = await db
      .update(platformAds)
      .set(validationResult.data)
      .where(eq(platformAds.id, adId))
      .returning();

    if (!updatedAd) {
      return res.status(404).json({ error: "Ad not found" });
    }

    return res.json(updatedAd);
  } catch (error) {
    console.error("[Ads Admin] Error updating ad:", error);
    return res.status(500).json({ error: "Failed to update ad" });
  }
});

// DELETE /api/admin/ads/:id
// Delete ad
router.delete("/admin/ads/:id", authenticateToken, requireRoleLevel("super_admin"), async (req: AuthRequest, res: Response) => {
  try {
    const adId = parseInt(req.params.id);
    if (isNaN(adId)) {
      return res.status(400).json({ error: "Invalid ad ID" });
    }

    const [deletedAd] = await db
      .delete(platformAds)
      .where(eq(platformAds.id, adId))
      .returning();

    if (!deletedAd) {
      return res.status(404).json({ error: "Ad not found" });
    }

    return res.json({ success: true, deletedAd });
  } catch (error) {
    console.error("[Ads Admin] Error deleting ad:", error);
    return res.status(500).json({ error: "Failed to delete ad" });
  }
});

// GET /api/admin/ads/analytics
// Get revenue analytics
router.get("/admin/ads/analytics", authenticateToken, requireRoleLevel("super_admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = db
      .select({
        date: adRevenue.date,
        totalImpressions: sql<number>`sum(${adRevenue.impressions})`,
        totalClicks: sql<number>`sum(${adRevenue.clicks})`,
        totalRevenue: sql<number>`sum(${adRevenue.revenue})`,
      })
      .from(adRevenue)
      .groupBy(adRevenue.date)
      .orderBy(desc(adRevenue.date));

    const conditions = [];
    if (startDate && typeof startDate === 'string') {
      conditions.push(gte(adRevenue.date, startDate));
    }
    if (endDate && typeof endDate === 'string') {
      conditions.push(lte(adRevenue.date, endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const analytics = await query;
    
    // Calculate totals
    const totals = analytics.reduce((acc, day) => ({
      impressions: acc.impressions + Number(day.totalImpressions || 0),
      clicks: acc.clicks + Number(day.totalClicks || 0),
      revenue: acc.revenue + Number(day.totalRevenue || 0),
    }), { impressions: 0, clicks: 0, revenue: 0 });

    return res.json({
      daily: analytics,
      totals,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions * 100).toFixed(2) : 0,
    });
  } catch (error) {
    console.error("[Ads Admin] Error fetching analytics:", error);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// GET /api/admin/ads/:id/performance
// Get ad performance metrics
router.get("/admin/ads/:id/performance", authenticateToken, requireRoleLevel("super_admin"), async (req: AuthRequest, res: Response) => {
  try {
    const adId = parseInt(req.params.id);
    if (isNaN(adId)) {
      return res.status(400).json({ error: "Invalid ad ID" });
    }

    // Get ad details
    const [ad] = await db
      .select()
      .from(platformAds)
      .where(eq(platformAds.id, adId))
      .limit(1);

    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Get daily performance
    const dailyPerformance = await db
      .select()
      .from(adRevenue)
      .where(eq(adRevenue.adId, adId))
      .orderBy(desc(adRevenue.date));

    // Calculate totals
    const totals = dailyPerformance.reduce((acc, day) => ({
      impressions: acc.impressions + (day.impressions || 0),
      clicks: acc.clicks + (day.clicks || 0),
      revenue: acc.revenue + (day.revenue || 0),
    }), { impressions: 0, clicks: 0, revenue: 0 });

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions * 100).toFixed(2) : 0;

    return res.json({
      ad,
      performance: {
        daily: dailyPerformance,
        totals,
        ctr,
        avgDailyImpressions: dailyPerformance.length > 0 ? Math.round(totals.impressions / dailyPerformance.length) : 0,
        avgDailyRevenue: dailyPerformance.length > 0 ? Math.round(totals.revenue / dailyPerformance.length) : 0,
      },
    });
  } catch (error) {
    console.error("[Ads Admin] Error fetching performance:", error);
    return res.status(500).json({ error: "Failed to fetch performance" });
  }
});

export default router;
