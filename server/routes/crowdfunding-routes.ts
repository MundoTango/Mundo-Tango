import { Express, Request, Response } from "express";
import { db } from "@shared/db";
import { 
  fundingCampaigns, 
  campaignDonations, 
  campaignUpdates,
  users,
  insertFundingCampaignSchema,
  insertCampaignDonationSchema,
  insertCampaignUpdateSchema,
  type SelectFundingCampaign,
  type SelectCampaignDonation,
  type SelectCampaignUpdate,
} from "@shared/schema";
import { eq, desc, sql, and, or, gte, lte, ilike } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

export default function crowdfundingRoutes(app: Express) {
  
  // ============================================================================
  // CAMPAIGN MANAGEMENT
  // ============================================================================
  
  /**
   * GET /api/crowdfunding/campaigns
   * Browse campaigns with filters, search, and sorting
   */
  app.get("/api/crowdfunding/campaigns", async (req: Request, res: Response) => {
    try {
      const { 
        category, 
        status = 'active', 
        search, 
        sort = 'trending',
        limit = '20',
        offset = '0' 
      } = req.query;

      let query = db
        .select({
          campaign: fundingCampaigns,
          creator: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          },
          backerCount: sql<number>`(
            SELECT COUNT(DISTINCT donor_user_id) 
            FROM campaign_donations 
            WHERE campaign_id = ${fundingCampaigns.id}
          )`.as('backerCount'),
          daysRemaining: sql<number>`(
            CASE 
              WHEN ${fundingCampaigns.deadline} IS NULL THEN NULL
              ELSE EXTRACT(DAY FROM (${fundingCampaigns.deadline} - CURRENT_TIMESTAMP))
            END
          )`.as('daysRemaining'),
        })
        .from(fundingCampaigns)
        .leftJoin(users, eq(fundingCampaigns.userId, users.id))
        .$dynamic();

      // Apply filters
      const conditions = [];
      if (status) {
        conditions.push(eq(fundingCampaigns.status, status as string));
      }
      if (category) {
        conditions.push(eq(fundingCampaigns.category, category as string));
      }
      if (search) {
        conditions.push(
          or(
            ilike(fundingCampaigns.title, `%${search}%`),
            ilike(fundingCampaigns.description, `%${search}%`)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply sorting
      switch (sort) {
        case 'new':
          query = query.orderBy(desc(fundingCampaigns.createdAt));
          break;
        case 'ending':
          query = query.orderBy(fundingCampaigns.deadline);
          break;
        case 'funded':
          query = query.orderBy(desc(fundingCampaigns.currentAmount));
          break;
        case 'trending':
        default:
          // Trending: combination of recent activity and funding progress
          query = query.orderBy(
            desc(sql`(
              CAST(${fundingCampaigns.currentAmount} AS DECIMAL) / 
              NULLIF(CAST(${fundingCampaigns.goalAmount} AS DECIMAL), 0) * 100
            )`),
            desc(fundingCampaigns.createdAt)
          );
          break;
      }

      // Apply pagination
      const campaigns = await query
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      res.json(campaigns);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns", error: error.message });
    }
  });

  /**
   * GET /api/crowdfunding/campaigns/:id
   * Get detailed campaign information
   */
  app.get("/api/crowdfunding/campaigns/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const [campaign] = await db
        .select({
          campaign: fundingCampaigns,
          creator: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
            bio: users.bio,
          },
          backerCount: sql<number>`(
            SELECT COUNT(DISTINCT donor_user_id) 
            FROM campaign_donations 
            WHERE campaign_id = ${fundingCampaigns.id}
          )`.as('backerCount'),
          daysRemaining: sql<number>`(
            CASE 
              WHEN ${fundingCampaigns.deadline} IS NULL THEN NULL
              ELSE EXTRACT(DAY FROM (${fundingCampaigns.deadline} - CURRENT_TIMESTAMP))
            END
          )`.as('daysRemaining'),
        })
        .from(fundingCampaigns)
        .leftJoin(users, eq(fundingCampaigns.userId, users.id))
        .where(eq(fundingCampaigns.id, parseInt(id)));

      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      res.json(campaign);
    } catch (error: any) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign", error: error.message });
    }
  });

  /**
   * POST /api/crowdfunding/campaigns
   * Create a new campaign
   */
  app.post("/api/crowdfunding/campaigns", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      
      const validatedData = insertFundingCampaignSchema.parse({
        ...req.body,
        userId,
      });

      const [campaign] = await db
        .insert(fundingCampaigns)
        .values(validatedData)
        .returning();

      res.status(201).json(campaign);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      res.status(400).json({ message: "Failed to create campaign", error: error.message });
    }
  });

  /**
   * PUT /api/crowdfunding/campaigns/:id
   * Update campaign (owner only)
   */
  app.put("/api/crowdfunding/campaigns/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      // Verify ownership
      const [existing] = await db
        .select()
        .from(fundingCampaigns)
        .where(eq(fundingCampaigns.id, parseInt(id)));

      if (!existing) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this campaign" });
      }

      const [updated] = await db
        .update(fundingCampaigns)
        .set({
          ...req.body,
          updatedAt: new Date(),
        })
        .where(eq(fundingCampaigns.id, parseInt(id)))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating campaign:", error);
      res.status(400).json({ message: "Failed to update campaign", error: error.message });
    }
  });

  /**
   * GET /api/crowdfunding/campaigns/user/:userId
   * Get campaigns created by a user
   */
  app.get("/api/crowdfunding/campaigns/user/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const campaigns = await db
        .select({
          campaign: fundingCampaigns,
          backerCount: sql<number>`(
            SELECT COUNT(DISTINCT donor_user_id) 
            FROM campaign_donations 
            WHERE campaign_id = ${fundingCampaigns.id}
          )`.as('backerCount'),
          daysRemaining: sql<number>`(
            CASE 
              WHEN ${fundingCampaigns.deadline} IS NULL THEN NULL
              ELSE EXTRACT(DAY FROM (${fundingCampaigns.deadline} - CURRENT_TIMESTAMP))
            END
          )`.as('daysRemaining'),
        })
        .from(fundingCampaigns)
        .where(eq(fundingCampaigns.userId, parseInt(userId)))
        .orderBy(desc(fundingCampaigns.createdAt));

      res.json(campaigns);
    } catch (error: any) {
      console.error("Error fetching user campaigns:", error);
      res.status(500).json({ message: "Failed to fetch user campaigns", error: error.message });
    }
  });

  // ============================================================================
  // DONATION MANAGEMENT
  // ============================================================================

  /**
   * POST /api/crowdfunding/donations
   * Make a donation to a campaign
   */
  app.post("/api/crowdfunding/donations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { campaignId, amount, message, isAnonymous, stripePaymentId } = req.body;

      // Verify campaign exists and is active
      const [campaign] = await db
        .select()
        .from(fundingCampaigns)
        .where(eq(fundingCampaigns.id, campaignId));

      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (campaign.status !== 'active') {
        return res.status(400).json({ message: "Campaign is not accepting donations" });
      }

      // Calculate platform fee (5%) and net amount
      const donationAmount = parseFloat(amount);
      const platformFee = donationAmount * 0.05;
      const netAmount = donationAmount - platformFee;

      // Get donor name
      const [donor] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, userId));

      // Create donation
      const [donation] = await db
        .insert(campaignDonations)
        .values({
          campaignId,
          donorUserId: userId,
          amount: amount,
          currency: 'USD',
          donorName: isAnonymous ? null : donor?.name,
          message,
          isAnonymous,
          stripePaymentId,
          platformFee: platformFee.toFixed(2),
          netAmount: netAmount.toFixed(2),
        })
        .returning();

      // Update campaign current amount
      await db
        .update(fundingCampaigns)
        .set({
          currentAmount: sql`CAST(${fundingCampaigns.currentAmount} AS DECIMAL) + ${netAmount}`,
          updatedAt: new Date(),
        })
        .where(eq(fundingCampaigns.id, campaignId));

      res.status(201).json(donation);
    } catch (error: any) {
      console.error("Error creating donation:", error);
      res.status(400).json({ message: "Failed to create donation", error: error.message });
    }
  });

  /**
   * GET /api/crowdfunding/donations/campaign/:campaignId
   * Get donations for a campaign
   */
  app.get("/api/crowdfunding/donations/campaign/:campaignId", async (req: Request, res: Response) => {
    try {
      const { campaignId } = req.params;

      const donations = await db
        .select({
          donation: campaignDonations,
          donor: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          },
        })
        .from(campaignDonations)
        .leftJoin(users, eq(campaignDonations.donorUserId, users.id))
        .where(eq(campaignDonations.campaignId, parseInt(campaignId)))
        .orderBy(desc(campaignDonations.donatedAt));

      res.json(donations);
    } catch (error: any) {
      console.error("Error fetching campaign donations:", error);
      res.status(500).json({ message: "Failed to fetch donations", error: error.message });
    }
  });

  /**
   * GET /api/crowdfunding/donations/user
   * Get donations made by the authenticated user
   */
  app.get("/api/crowdfunding/donations/user", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      const donations = await db
        .select({
          donation: campaignDonations,
          campaign: {
            id: fundingCampaigns.id,
            title: fundingCampaigns.title,
            imageUrl: fundingCampaigns.imageUrl,
            status: fundingCampaigns.status,
          },
        })
        .from(campaignDonations)
        .leftJoin(fundingCampaigns, eq(campaignDonations.campaignId, fundingCampaigns.id))
        .where(eq(campaignDonations.donorUserId, userId))
        .orderBy(desc(campaignDonations.donatedAt));

      res.json(donations);
    } catch (error: any) {
      console.error("Error fetching user donations:", error);
      res.status(500).json({ message: "Failed to fetch donations", error: error.message });
    }
  });

  // ============================================================================
  // CAMPAIGN UPDATES
  // ============================================================================

  /**
   * POST /api/crowdfunding/updates
   * Post a campaign update (campaign creator only)
   */
  app.post("/api/crowdfunding/updates", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { campaignId, title, content, imageUrls, videoUrl } = req.body;

      // Verify campaign ownership
      const [campaign] = await db
        .select()
        .from(fundingCampaigns)
        .where(eq(fundingCampaigns.id, campaignId));

      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (campaign.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to post updates for this campaign" });
      }

      const [update] = await db
        .insert(campaignUpdates)
        .values({
          campaignId,
          title,
          content,
          imageUrls,
          videoUrl,
        })
        .returning();

      res.status(201).json(update);
    } catch (error: any) {
      console.error("Error creating campaign update:", error);
      res.status(400).json({ message: "Failed to create update", error: error.message });
    }
  });

  /**
   * GET /api/crowdfunding/updates/:campaignId
   * Get updates for a campaign
   */
  app.get("/api/crowdfunding/updates/:campaignId", async (req: Request, res: Response) => {
    try {
      const { campaignId } = req.params;

      const updates = await db
        .select()
        .from(campaignUpdates)
        .where(eq(campaignUpdates.campaignId, parseInt(campaignId)))
        .orderBy(desc(campaignUpdates.postedAt));

      res.json(updates);
    } catch (error: any) {
      console.error("Error fetching campaign updates:", error);
      res.status(500).json({ message: "Failed to fetch updates", error: error.message });
    }
  });

  // ============================================================================
  // CAMPAIGN ANALYTICS & STATISTICS
  // ============================================================================

  /**
   * GET /api/crowdfunding/stats
   * Get platform-wide crowdfunding statistics
   */
  app.get("/api/crowdfunding/stats", async (req: Request, res: Response) => {
    try {
      const [stats] = await db
        .select({
          totalRaised: sql<number>`COALESCE(SUM(CAST(current_amount AS DECIMAL)), 0)`.as('totalRaised'),
          totalCampaigns: sql<number>`COUNT(*)`.as('totalCampaigns'),
          activeCampaigns: sql<number>`COUNT(*) FILTER (WHERE status = 'active')`.as('activeCampaigns'),
          completedCampaigns: sql<number>`COUNT(*) FILTER (WHERE status = 'completed')`.as('completedCampaigns'),
        })
        .from(fundingCampaigns);

      const [donorStats] = await db
        .select({
          totalBackers: sql<number>`COUNT(DISTINCT donor_user_id)`.as('totalBackers'),
          totalDonations: sql<number>`COUNT(*)`.as('totalDonations'),
        })
        .from(campaignDonations);

      res.json({
        ...stats,
        ...donorStats,
      });
    } catch (error: any) {
      console.error("Error fetching crowdfunding stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics", error: error.message });
    }
  });

  /**
   * GET /api/crowdfunding/campaigns/:id/analytics
   * Get detailed analytics for a specific campaign
   */
  app.get("/api/crowdfunding/campaigns/:id/analytics", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      // Verify campaign ownership
      const [campaign] = await db
        .select()
        .from(fundingCampaigns)
        .where(eq(fundingCampaigns.id, parseInt(id)));

      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (campaign.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to view analytics" });
      }

      // Get donation timeline
      const donationTimeline = await db
        .select({
          date: sql<string>`DATE(donated_at)`.as('date'),
          amount: sql<number>`SUM(CAST(amount AS DECIMAL))`.as('amount'),
          count: sql<number>`COUNT(*)`.as('count'),
        })
        .from(campaignDonations)
        .where(eq(campaignDonations.campaignId, parseInt(id)))
        .groupBy(sql`DATE(donated_at)`)
        .orderBy(sql`DATE(donated_at)`);

      // Get top donors
      const topDonors = await db
        .select({
          donor: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          },
          totalAmount: sql<number>`SUM(CAST(amount AS DECIMAL))`.as('totalAmount'),
          donationCount: sql<number>`COUNT(*)`.as('donationCount'),
        })
        .from(campaignDonations)
        .leftJoin(users, eq(campaignDonations.donorUserId, users.id))
        .where(
          and(
            eq(campaignDonations.campaignId, parseInt(id)),
            eq(campaignDonations.isAnonymous, false)
          )
        )
        .groupBy(users.id, users.name, users.username, users.profileImage)
        .orderBy(desc(sql`SUM(CAST(amount AS DECIMAL))`))
        .limit(10);

      res.json({
        donationTimeline,
        topDonors,
      });
    } catch (error: any) {
      console.error("Error fetching campaign analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
    }
  });

  /**
   * GET /api/crowdfunding/featured
   * Get featured campaigns
   */
  app.get("/api/crowdfunding/featured", async (req: Request, res: Response) => {
    try {
      const campaigns = await db
        .select({
          campaign: fundingCampaigns,
          creator: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          },
          backerCount: sql<number>`(
            SELECT COUNT(DISTINCT donor_user_id) 
            FROM campaign_donations 
            WHERE campaign_id = ${fundingCampaigns.id}
          )`.as('backerCount'),
          daysRemaining: sql<number>`(
            CASE 
              WHEN ${fundingCampaigns.deadline} IS NULL THEN NULL
              ELSE EXTRACT(DAY FROM (${fundingCampaigns.deadline} - CURRENT_TIMESTAMP))
            END
          )`.as('daysRemaining'),
          fundingPercentage: sql<number>`(
            (CAST(${fundingCampaigns.currentAmount} AS DECIMAL) / 
            NULLIF(CAST(${fundingCampaigns.goalAmount} AS DECIMAL), 0)) * 100
          )`.as('fundingPercentage'),
        })
        .from(fundingCampaigns)
        .leftJoin(users, eq(fundingCampaigns.userId, users.id))
        .where(eq(fundingCampaigns.status, 'active'))
        .orderBy(
          desc(sql`(CAST(${fundingCampaigns.currentAmount} AS DECIMAL) / NULLIF(CAST(${fundingCampaigns.goalAmount} AS DECIMAL), 0)) * 100`),
          desc(fundingCampaigns.createdAt)
        )
        .limit(6);

      res.json(campaigns);
    } catch (error: any) {
      console.error("Error fetching featured campaigns:", error);
      res.status(500).json({ message: "Failed to fetch featured campaigns", error: error.message });
    }
  });
}
