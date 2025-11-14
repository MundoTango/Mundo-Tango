import { Router, type Request, Response } from "express";
import { db } from "@shared/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// In-memory onboarding session storage (can be replaced with Redis in production)
interface OnboardingSession {
  userId: number;
  startedAt: Date;
  currentStep: number;
  completedSteps: number[];
  selectedPlanId?: string;
  metadata?: Record<string, any>;
}

const onboardingSessions = new Map<number, OnboardingSession>();

// Analytics storage (should be persisted to database in production)
interface OnboardingAnalytics {
  userId: number;
  sessionId: string;
  event: string;
  step?: number;
  planId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const analyticsEvents: OnboardingAnalytics[] = [];

// Helper function to track analytics events
function trackEvent(
  userId: number,
  event: string,
  step?: number,
  planId?: string,
  metadata?: Record<string, any>
) {
  const analyticsEvent: OnboardingAnalytics = {
    userId,
    sessionId: `${userId}-${Date.now()}`,
    event,
    step,
    planId,
    timestamp: new Date(),
    metadata,
  };
  analyticsEvents.push(analyticsEvent);
  console.log('[Onboarding Analytics]', analyticsEvent);
}

// POST /api/onboarding/start - Start onboarding session
router.post("/start", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Create new onboarding session
    const session: OnboardingSession = {
      userId,
      startedAt: new Date(),
      currentStep: 0,
      completedSteps: [],
    };

    onboardingSessions.set(userId, session);
    trackEvent(userId, 'onboarding_started', 0);

    res.json({
      success: true,
      session: {
        currentStep: session.currentStep,
        startedAt: session.startedAt,
      },
    });
  } catch (error: any) {
    console.error('Error starting onboarding:', error);
    res.status(500).json({ message: "Error starting onboarding: " + error.message });
  }
});

// PATCH /api/onboarding/step - Update step progress
router.patch("/step", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { step } = req.body;

    if (typeof step !== 'number' || step < 0 || step > 3) {
      return res.status(400).json({ message: "Invalid step number" });
    }

    const session = onboardingSessions.get(userId);

    if (!session) {
      return res.status(404).json({ message: "No active onboarding session found" });
    }

    // Update session
    session.currentStep = step;
    if (!session.completedSteps.includes(step - 1) && step > 0) {
      session.completedSteps.push(step - 1);
    }

    onboardingSessions.set(userId, session);
    trackEvent(userId, 'step_viewed', step);

    res.json({
      success: true,
      session: {
        currentStep: session.currentStep,
        completedSteps: session.completedSteps,
      },
    });
  } catch (error: any) {
    console.error('Error updating step:', error);
    res.status(500).json({ message: "Error updating step: " + error.message });
  }
});

// POST /api/onboarding/complete - Complete onboarding
router.post("/complete", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { planId } = req.body;

    const session = onboardingSessions.get(userId);

    if (!session) {
      return res.status(404).json({ message: "No active onboarding session found" });
    }

    // Update user's onboarding status
    await db.update(users)
      .set({
        isOnboardingComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Track completion
    trackEvent(userId, 'onboarding_completed', 3, planId, {
      duration: Date.now() - session.startedAt.getTime(),
      completedSteps: session.completedSteps.length,
    });

    // Clean up session
    onboardingSessions.delete(userId);

    res.json({
      success: true,
      message: "Onboarding completed successfully",
    });
  } catch (error: any) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ message: "Error completing onboarding: " + error.message });
  }
});

// GET /api/onboarding/trial-eligibility - Check if user is eligible for trial
router.get("/trial-eligibility", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has ever had a paid subscription
    const hasHadSubscription = user.stripeSubscriptionId !== null || user.subscriptionTier !== 'free';
    const isEligible = !hasHadSubscription;

    res.json({
      eligible: isEligible,
      reason: hasHadSubscription
        ? "User has already used their trial or had a subscription"
        : "User is eligible for trial",
    });
  } catch (error: any) {
    console.error('Error checking trial eligibility:', error);
    res.status(500).json({ message: "Error checking trial eligibility: " + error.message });
  }
});

// POST /api/onboarding/skip - Skip onboarding (stay on free)
router.post("/skip", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const session = onboardingSessions.get(userId);

    if (session) {
      trackEvent(userId, 'onboarding_skipped', session.currentStep, undefined, {
        duration: Date.now() - session.startedAt.getTime(),
        lastStep: session.currentStep,
      });
    }

    // Mark onboarding as complete (user chose to skip)
    await db.update(users)
      .set({
        isOnboardingComplete: true,
        subscriptionTier: 'free',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Clean up session
    onboardingSessions.delete(userId);

    res.json({
      success: true,
      message: "Onboarding skipped, staying on free plan",
    });
  } catch (error: any) {
    console.error('Error skipping onboarding:', error);
    res.status(500).json({ message: "Error skipping onboarding: " + error.message });
  }
});

// POST /api/onboarding/track-event - Track custom analytics event
router.post("/track-event", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { event, step, planId, metadata } = req.body;

    if (!event || typeof event !== 'string') {
      return res.status(400).json({ message: "Event name is required" });
    }

    trackEvent(userId, event, step, planId, metadata);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking event:', error);
    res.status(500).json({ message: "Error tracking event: " + error.message });
  }
});

// GET /api/onboarding/analytics - Get analytics data (admin only)
router.get("/analytics", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Calculate conversion metrics
    const totalStarts = analyticsEvents.filter((e) => e.event === 'onboarding_started').length;
    const totalCompletions = analyticsEvents.filter((e) => e.event === 'onboarding_completed').length;
    const totalSkips = analyticsEvents.filter((e) => e.event === 'onboarding_skipped').length;

    const stepViews = [0, 1, 2, 3].map((step) => ({
      step,
      views: analyticsEvents.filter((e) => e.event === 'step_viewed' && e.step === step).length,
    }));

    const planSelections = analyticsEvents
      .filter((e) => e.event === 'onboarding_completed' && e.planId)
      .reduce((acc, e) => {
        acc[e.planId!] = (acc[e.planId!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    res.json({
      totalStarts,
      totalCompletions,
      totalSkips,
      conversionRate: totalStarts > 0 ? (totalCompletions / totalStarts) * 100 : 0,
      skipRate: totalStarts > 0 ? (totalSkips / totalStarts) * 100 : 0,
      stepViews,
      planSelections,
      recentEvents: analyticsEvents.slice(-50), // Last 50 events
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: "Error fetching analytics: " + error.message });
  }
});

// GET /api/onboarding/session - Get current session state
router.get("/session", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const session = onboardingSessions.get(userId);

    if (!session) {
      return res.status(404).json({ message: "No active onboarding session found" });
    }

    res.json({
      session: {
        currentStep: session.currentStep,
        completedSteps: session.completedSteps,
        startedAt: session.startedAt,
        selectedPlanId: session.selectedPlanId,
      },
    });
  } catch (error: any) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: "Error fetching session: " + error.message });
  }
});

export default router;
