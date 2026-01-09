/**
 * QA/CUSTOMER TEST PLATFORM ROUTES
 * MB.MD Pattern 67 - User monitoring, feedback capture, admin approval queue
 * 
 * Regular users: Help + feedback → admin queue
 * God-level admins: Full MB.MD execution rights
 */

import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { EmailService } from "../services/EmailService";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// God-level user emails for execution rights
const GOD_LEVEL_USERS = [
  "scott@boddye.com",
  "admin@mundotango.life",
];

// Check if user is god-level
function isGodLevel(user: any): boolean {
  if (!user) return false;
  return GOD_LEVEL_USERS.includes(user.email) || user.tier === 8;
}

// ============================================================================
// ANALYTICS CONSENT
// ============================================================================

// Save visitor email from landing page (Guest access)
router.post("/visitor-email", async (req: Request, res: Response) => {
  try {
    const { email, source } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: "Invalid email" });
    }

    console.log(`[VisitorEmail] Capturing email: ${email} from source: ${source}`);

    // Store as a "Contact" or "Feedback" in the QA system so it appears in admin
    const feedback = await storage.createUserFeedback({
      userId: null, // Guest
      sessionId: null,
      feedbackType: "support",
      title: `Visitor Email Capture: ${source || 'unknown'}`,
      description: `Visitor interested in Facebook Live sessions: ${email}`,
      status: "pending",
      currentPage: "LandingPage",
      priority: "medium"
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error("[QA] Error saving visitor email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/consent", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { consentGiven } = req.body;
    
    // Check if consent exists
    const existing = await storage.getAnalyticsConsent(user.id);
    
    if (existing) {
      const updated = await storage.updateAnalyticsConsent(user.id, {
        consentGiven,
        consentTimestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      return res.json({ success: true, consent: updated });
    }

    const consent = await storage.createAnalyticsConsent({
      userId: user.id,
      consentGiven,
      consentTimestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({ success: true, consent });
  } catch (error: any) {
    console.error("[QA Platform] Consent error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/consent", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const consent = await storage.getAnalyticsConsent(user.id);
    res.json({ consent: consent || null });
  } catch (error: any) {
    console.error("[QA Platform] Get consent error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// USER FEEDBACK
// ============================================================================

const feedbackSchema = z.object({
  feedbackType: z.enum(["bug", "feature", "support", "complaint", "praise"]),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  currentPage: z.string().optional(),
  sessionSnapshot: z.any().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

router.post("/feedback", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const parsed = feedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const feedback = await storage.createUserFeedback({
      userId: user.id,
      sessionId: req.body.sessionId || null,
      ...parsed.data,
      status: "pending",
    });

    res.json({ success: true, feedback });
  } catch (error: any) {
    console.error("[QA Platform] Feedback error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/feedback", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const feedback = await storage.getUserFeedbackByUser(user.id);
    res.json({ feedback });
  } catch (error: any) {
    console.error("[QA Platform] Get feedback error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/feedback/:id", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const id = parseInt(req.params.id);
    const feedback = await storage.getUserFeedback(id);
    
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    // Only owner or admin can view
    if (feedback.userId !== user.id && !isGodLevel(user)) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ feedback });
  } catch (error: any) {
    console.error("[QA Platform] Get feedback error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Review Endpoints
router.get("/admin/pending", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    // Allow God level or regular Admins (tier >= 4)
    const userWithTier = user as any;
    if (!user || (!isGodLevel(user) && (userWithTier.tier ?? 0) < 4)) {
      console.log(`[QA Admin] Access denied for user ${user?.id} with tier ${userWithTier?.tier}`);
      return res.status(403).json({ error: "Admin access required" });
    }

    const pending = await storage.getPendingFeedback();
    console.log(`[QA Admin] Returning ${pending.length} pending items`);
    res.json(pending); // Return the array directly as expected by useQuery
  } catch (error: any) {
    console.error("[QA Platform] Admin pending error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/admin/approve/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    // Allow God level or regular Admins (tier >= 4)
    const userWithTier = user as any;
    if (!user || (!isGodLevel(user) && (userWithTier.tier ?? 0) < 4)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const id = parseInt(req.params.id);
    const { action, notes } = req.body;

    // Get the feedback to find the user's email
    const feedback = await storage.getUserFeedback(id);
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    // Update feedback status
    const newStatus = action === "reject" ? "rejected" : "approved";
    await storage.updateUserFeedback(id, {
      status: newStatus,
      assignedTo: user.id,
      adminNotes: notes,
    });

    // Send email notification to user (if they have a userId)
    if (feedback.userId) {
      const feedbackUser = await storage.getUserById(feedback.userId);
      if (feedbackUser?.email) {
        const status = action === "reject" ? "rejected" : "approved";
        console.log(`[QA Platform] Sending ${status} email to ${feedbackUser.email} for feedback: ${feedback.title}`);
        
        EmailService.sendFeedbackResponseEmail(
          feedbackUser.email,
          feedbackUser.name || feedbackUser.username || 'Tango Dancer',
          feedback.title,
          status as 'approved' | 'rejected',
          notes
        ).catch(err => {
          console.error(`[QA Platform] Failed to send feedback email:`, err);
        });
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("[QA Platform] Admin approve error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/admin/resolve/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user || !isGodLevel(user)) {
      return res.status(403).json({ error: "God-level access required" });
    }

    const id = parseInt(req.params.id);
    const { mrBlueResponse, adminNotes } = req.body;

    // Get the feedback to find the user's email
    const feedback = await storage.getUserFeedback(id);
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    await storage.updateUserFeedback(id, {
      status: "resolved",
      resolvedAt: new Date(),
      mrBlueResponse,
      adminNotes,
    });

    // Send email notification to user (if they have a userId)
    if (feedback.userId) {
      const feedbackUser = await storage.getUserById(feedback.userId);
      if (feedbackUser?.email) {
        console.log(`[QA Platform] Sending resolved email to ${feedbackUser.email} for feedback: ${feedback.title}`);
        
        EmailService.sendFeedbackResponseEmail(
          feedbackUser.email,
          feedbackUser.name || feedbackUser.username || 'Tango Dancer',
          feedback.title,
          'resolved',
          adminNotes || mrBlueResponse
        ).catch(err => {
          console.error(`[QA Platform] Failed to send feedback email:`, err);
        });
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("[QA Platform] Admin resolve error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// GOD-LEVEL EXECUTION (VibeCoding Bridge)
// ============================================================================

router.post("/execute", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !isGodLevel(user)) {
      return res.status(403).json({ 
        error: "God-level access required for code execution",
        message: "Only Scott Boddye and Admin can execute code via Mr. Blue"
      });
    }

    const { prompt, feedbackId } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Forward to VibeCoding service
    const vibeCodingUrl = `${req.protocol}://${req.get('host')}/api/mrblue/vibecoding/generate-code`;
    
    const response = await fetch(vibeCodingUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.authorization || "",
      },
      body: JSON.stringify({
        prompt,
        context: {
          source: "qa-platform",
          feedbackId,
          executedBy: user.email,
        },
      }),
    });

    const result = await response.json();

    // Log execution for audit trail
    if (feedbackId) {
      await storage.createAdminApproval({
        feedbackId,
        adminId: user.id,
        action: "approve",
        reason: `Executed VibeCoding: ${prompt.substring(0, 100)}`,
        executionPlan: { prompt, result },
      });
    }

    res.json({ success: true, result });
  } catch (error: any) {
    console.error("[QA Platform] Execute error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// STATUS & HEALTH
// ============================================================================

router.get("/status", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    res.json({
      status: "operational",
      version: "1.0.0",
      isGodLevel: user ? isGodLevel(user) : false,
      features: {
        feedback: true,
        analytics: true,
        vibeCoding: user ? isGodLevel(user) : false,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
