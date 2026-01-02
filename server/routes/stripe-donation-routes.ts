import { Express, Request, Response } from "express";
import { db } from "@shared/db";
import { campaignDonations, fundingCampaigns, users } from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

let stripeClientPromise: Promise<any> | null = null;

async function getStripeClient() {
  if (!stripeClientPromise) {
    stripeClientPromise = (async () => {
      try {
        const { getUncachableStripeClient } = await import('../stripeClient');
        return await getUncachableStripeClient();
      } catch (error) {
        console.error('[StripeDonation] Failed to get Stripe client:', error);
        return null;
      }
    })();
  }
  return stripeClientPromise;
}

export default function stripeDonationRoutes(app: Express) {
  
  const FUNDRAISING_GOAL = 30000;
  const MAIN_CAMPAIGN_ID = 1;

  app.get("/api/donations/progress", async (req: Request, res: Response) => {
    try {
      const [stats] = await db
        .select({
          totalRaised: sql<string>`COALESCE(SUM(CAST(net_amount AS DECIMAL)), 0)`.as('totalRaised'),
          donorCount: sql<number>`COUNT(DISTINCT donor_user_id)`.as('donorCount'),
          totalDonations: sql<number>`COUNT(*)`.as('totalDonations'),
        })
        .from(campaignDonations)
        .where(eq(campaignDonations.status, 'completed'));

      const totalRaised = parseFloat(stats?.totalRaised || '0');
      const percentage = Math.min((totalRaised / FUNDRAISING_GOAL) * 100, 100);

      res.json({
        totalRaised,
        goal: FUNDRAISING_GOAL,
        percentage: Math.round(percentage * 10) / 10,
        donorCount: stats?.donorCount || 0,
        totalDonations: stats?.totalDonations || 0,
      });
    } catch (error: any) {
      console.error("[StripeDonation] Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch donation progress", error: error.message });
    }
  });

  app.get("/api/donations/recent", async (req: Request, res: Response) => {
    try {
      const { limit = '5' } = req.query;
      
      const donations = await db
        .select({
          id: campaignDonations.id,
          amount: campaignDonations.amount,
          donorName: campaignDonations.donorName,
          isAnonymous: campaignDonations.isAnonymous,
          message: campaignDonations.message,
          donatedAt: campaignDonations.donatedAt,
        })
        .from(campaignDonations)
        .where(eq(campaignDonations.status, 'completed'))
        .orderBy(desc(campaignDonations.donatedAt))
        .limit(parseInt(limit as string));

      const publicDonations = donations.map(d => ({
        id: d.id,
        amount: d.amount,
        donorName: d.isAnonymous ? 'Anonymous Supporter' : (d.donorName || 'A Supporter'),
        message: d.message,
        donatedAt: d.donatedAt,
      }));

      res.json(publicDonations);
    } catch (error: any) {
      console.error("[StripeDonation] Error fetching recent donations:", error);
      res.status(500).json({ message: "Failed to fetch recent donations", error: error.message });
    }
  });

  app.post("/api/donations/checkout", async (req: Request, res: Response) => {
    try {
      const stripe = await getStripeClient();
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment service temporarily unavailable. Please try again later." 
        });
      }

      const { amount, donorName, donorEmail, isAnonymous, message } = req.body;

      if (!amount || amount < 1) {
        return res.status(400).json({ message: "Please enter a valid donation amount" });
      }

      if (amount > 50000) {
        return res.status(400).json({ message: "For donations over $50,000, please contact us directly" });
      }

      const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : 'http://localhost:5000';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Mundo Tango Donation',
              description: 'Support the global tango community',
              images: ['https://mundotango.life/logo.png'],
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        success_url: `${baseUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/donate`,
        customer_email: donorEmail || undefined,
        metadata: {
          donorName: isAnonymous ? 'Anonymous' : (donorName || 'Anonymous'),
          isAnonymous: String(isAnonymous || false),
          message: message || '',
          campaignId: String(MAIN_CAMPAIGN_ID),
        },
        billing_address_collection: 'auto',
        submit_type: 'donate',
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error("[StripeDonation] Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create donation session", error: error.message });
    }
  });

  app.get("/api/donations/session/:sessionId", async (req: Request, res: Response) => {
    try {
      const stripe = await getStripeClient();
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }

      const { sessionId } = req.params;
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        const existingDonation = await db
          .select()
          .from(campaignDonations)
          .where(eq(campaignDonations.stripePaymentId, session.id))
          .limit(1);

        if (existingDonation.length === 0) {
          const amount = (session.amount_total || 0) / 100;
          const platformFee = amount * 0.05;
          const netAmount = amount - platformFee;

          await db.insert(campaignDonations).values({
            campaignId: MAIN_CAMPAIGN_ID,
            donorUserId: null,
            amount: amount.toFixed(2),
            currency: 'USD',
            donorName: session.metadata?.isAnonymous === 'true' ? null : (session.metadata?.donorName || null),
            donorEmail: session.customer_email || null,
            message: session.metadata?.message || null,
            isAnonymous: session.metadata?.isAnonymous === 'true',
            stripePaymentId: session.id,
            stripePaymentIntent: session.payment_intent as string,
            platformFee: platformFee.toFixed(2),
            netAmount: netAmount.toFixed(2),
            status: 'completed',
          });

          await db
            .update(fundingCampaigns)
            .set({
              currentAmount: sql`CAST(${fundingCampaigns.currentAmount} AS DECIMAL) + ${netAmount}`,
              updatedAt: new Date(),
            })
            .where(eq(fundingCampaigns.id, MAIN_CAMPAIGN_ID));
        }
      }

      res.json({
        status: session.payment_status,
        amount: session.amount_total ? (session.amount_total / 100) : 0,
        donorName: session.metadata?.donorName,
        isAnonymous: session.metadata?.isAnonymous === 'true',
      });
    } catch (error: any) {
      console.error("[StripeDonation] Error retrieving session:", error);
      res.status(500).json({ message: "Failed to retrieve session", error: error.message });
    }
  });

  app.get("/api/donations/publishable-key", async (req: Request, res: Response) => {
    try {
      const { getStripePublishableKey } = await import('../stripeClient');
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      console.error("[StripeDonation] Error getting publishable key:", error);
      res.status(500).json({ message: "Payment service unavailable" });
    }
  });

  console.log("[StripeDonation] Routes registered: /api/donations/*");
}
