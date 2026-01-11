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
import { BugDiagnosticAgent, type AgentWorkStream } from "../services/mrBlue/agents/BugDiagnosticAgent";
import * as VibeCodingTools from "../services/mrBlue/VibeCodingToolService";

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

router.post("/admin/reply/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const userWithTier = user as any;
    if (!user || (!isGodLevel(user) && (userWithTier.tier ?? 0) < 4)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const feedbackId = parseInt(req.params.id);
    const { recipientId, message } = req.body;

    if (!recipientId || !message?.trim()) {
      return res.status(400).json({ error: "Recipient and message are required" });
    }

    const feedback = await storage.getUserFeedback(feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    const messageContent = `**Regarding your feedback: "${feedback.title}"**\n\n${message}`;
    
    const directMessage = await storage.createDirectMessage({
      senderId: user.id,
      recipientId: recipientId,
      content: messageContent,
    });

    await storage.updateUserFeedback(feedbackId, {
      relatedMessageId: directMessage.id,
      adminNotes: (feedback.adminNotes || '') + `\n[${new Date().toISOString()}] Replied to user: ${message.substring(0, 100)}...`,
    });

    console.log(`[QA Platform] Admin ${user.id} replied to user ${recipientId} for feedback ${feedbackId}`);

    res.json({ success: true, messageId: directMessage.id });
  } catch (error: any) {
    console.error("[QA Platform] Admin reply error:", error);
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
// BUG FIX STREAMING (SSE for VibeCoding Integration)
// MB.MD Pattern 67 - Stream agent work to admin's VibeCoding chat
// ============================================================================

// Track active SSE connections for bug fix streaming
const activeBugFixStreams = new Map<string, { res: Response; aborted: boolean }>();

/**
 * POST /api/qa-platform/fix-stream/start
 * Start streaming bug fix agent work to VibeCoding chat
 * God-level only - uses SSE for real-time ReAct protocol updates
 */
router.post("/fix-stream/start", authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  if (!user || !isGodLevel(user)) {
    return res.status(403).json({ error: "God-level access required" });
  }

  const { feedbackId, diagnosticContext } = req.body;
  if (!feedbackId) {
    return res.status(400).json({ error: "Feedback ID required" });
  }

  const streamId = `fix_${feedbackId}_${Date.now()}`;
  const session = { aborted: false };

  // Handle client disconnect
  req.on('close', () => {
    console.log(`[BugFixStream] Client disconnected: ${streamId}`);
    session.aborted = true;
    activeBugFixStreams.delete(streamId);
  });

  // Initialize SSE stream
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  activeBugFixStreams.set(streamId, { res, aborted: false });

  // Helper to send SSE event
  const sendEvent = (type: string, data: any) => {
    if (session.aborted || res.writableEnded) return;
    try {
      res.write(`data: ${JSON.stringify({ type, ...data, timestamp: Date.now() })}\n\n`);
    } catch (e) {
      console.error('[BugFixStream] Send error:', e);
    }
  };

  try {
    // Initialize agent
    const bugAgent = new BugDiagnosticAgent();
    
    // Set up streaming callback
    bugAgent.setStreamCallback((work: AgentWorkStream) => {
      sendEvent('agent-work', {
        agent: work.agent,
        phase: work.phase,
        message: work.message,
        data: work.data
      });
    });

    // Send initial connection event
    sendEvent('connected', { 
      message: 'Bug fix stream connected',
      streamId,
      feedbackId
    });

    // Get feedback details
    const feedback = await storage.getUserFeedback(feedbackId);
    if (!feedback) {
      sendEvent('error', { message: 'Feedback not found' });
      res.end();
      return;
    }

    // Parse diagnostic context
    const context = diagnosticContext || feedback.sessionSnapshot || {};

    // Send phase: analyzing
    sendEvent('phase', { phase: 'analyzing', message: 'Analyzing diagnostic context...' });

    // Analyze context
    const analysis = await bugAgent.analyzeContext({
      testId: `bug_${feedbackId}`,
      breadcrumb: context.breadcrumb || [],
      apiCalls: context.apiCalls || [],
      userContext: context.userContext || { isLoggedIn: false, tier: 'free', isVerified: false, profileComplete: false, permissions: [] },
      errors: context.errors || [],
      appState: context.appState || {},
      selectedElement: context.selectedElement,
    });

    sendEvent('analysis-complete', {
      errorType: analysis.errorType,
      routing: analysis.routing,
      summary: analysis.summary
    });

    // Send phase: planning
    sendEvent('phase', { phase: 'planning', message: 'Creating fix plan...' });

    // Send ReAct protocol reasoning
    sendEvent('thought', { 
      content: `Error Type: ${analysis.errorType}. Routing to ${analysis.routing.primary} with support from ${analysis.routing.supporting.join(', ')}.`
    });

    sendEvent('action', {
      content: `Deploy ${analysis.routing.primary} for primary analysis`
    });

    // Send phase: executing
    sendEvent('phase', { phase: 'executing', message: 'Executing VibeCoding fix workflow...' });

    // MB.MD Pattern 67: Use VibeCoding tools for true autonomous workflow
    const filesModified: string[] = [];
    let fixSuccess = false;
    let fixReasoning = '';
    
    try {
      // Step 1: Create feature branch for the fix
      sendEvent('action', { content: 'Creating feature branch for bug fix...' });
      const branchName = `fix/bug-${feedbackId}-${Date.now()}`;
      const branchResult = await VibeCodingTools.createBranch(branchName);
      sendEvent('observation', { content: branchResult.success ? `Branch created: ${branchName}` : `Branch creation skipped: ${branchResult.error}` });

      // Step 2: Investigate the bug - search for relevant code
      const errorUrl = context.apiCalls?.find((c: any) => c.status >= 400)?.url || '';
      const searchPattern = errorUrl.includes('/api/') ? errorUrl.split('/api/')[1]?.split('?')[0] || '' : '';
      
      if (searchPattern) {
        sendEvent('action', { content: `Searching codebase for: ${searchPattern}` });
        const grepResult = await VibeCodingTools.grepFiles(searchPattern, 'server/routes');
        if (grepResult.success && grepResult.output) {
          sendEvent('observation', { content: `Found matching files:\n${grepResult.output.substring(0, 500)}` });
        }
      }

      // Step 3: Read relevant route files to understand the issue
      sendEvent('action', { content: 'Reading route configuration...' });
      const lsResult = await VibeCodingTools.listDirectory('server/routes');
      if (lsResult.success) {
        sendEvent('observation', { content: `Route files found: ${(lsResult.files || []).slice(0, 10).join(', ')}` });
      }

      // Step 4: Attempt to commit analysis (even if no code changes yet)
      sendEvent('action', { content: 'Committing analysis notes...' });
      const commitResult = await VibeCodingTools.commitChanges(`fix(bug-${feedbackId}): investigate ${analysis.errorType} error`);
      sendEvent('observation', { content: commitResult.success ? 'Analysis committed' : 'No changes to commit yet' });

      // Step 5: Prepare PR for review (even partial investigation helps)
      sendEvent('action', { content: 'Creating PR for review...' });
      const prResult = await VibeCodingTools.createPullRequest(
        `Fix Bug #${feedbackId}: ${feedback.title?.substring(0, 50) || 'Bug fix'}`,
        `## Bug Report\n${feedback.description || 'No description'}\n\n## Analysis\n- Error Type: ${analysis.errorType}\n- Primary Agent: ${analysis.routing.primary}\n- Summary: ${analysis.summary}\n\n## Diagnostic Context\nPage: ${feedback.currentPage}\nAPI Errors: ${(context.apiCalls || []).filter((c: any) => c.status >= 400).map((c: any) => `${c.method} ${c.url} (${c.status})`).join(', ')}`
      );
      
      if (prResult.success && prResult.url) {
        sendEvent('observation', { content: `PR created: ${prResult.url}` });
        fixSuccess = true;
        fixReasoning = `Investigation complete. PR created for review: ${prResult.url}`;
      } else {
        sendEvent('observation', { content: `PR creation note: ${prResult.error || 'No changes to submit'}` });
        fixReasoning = `Investigation complete. Analysis ready for manual review.`;
      }

    } catch (e: any) {
      console.error('[BugFixStream] VibeCoding error:', e);
      fixReasoning = `VibeCoding workflow encountered an error: ${e.message}`;
    }

    // Also run the traditional agent analysis for additional context
    const fixResult = await bugAgent.deployAgentsForFix({
      id: feedbackId,
      userId: feedback.userId || undefined,
      title: feedback.title,
      description: feedback.description || '',
      currentPage: feedback.currentPage || '/',
      diagnosticContext: context,
      status: 'in-progress',
      assignedAgents: [analysis.routing.primary, ...analysis.routing.supporting],
    }, true);

    sendEvent('observation', {
      content: `Agent analysis: ${fixResult.reasoning}. VibeCoding: ${fixReasoning}`
    });

    // Send phase: validating
    sendEvent('phase', { phase: 'validating', message: 'Validating fix...' });

    sendEvent('validation', {
      success: fixResult.success,
      confidence: fixResult.confidence,
      action: fixResult.action,
      filesModified: fixResult.filesModified || []
    });

    // Complete
    sendEvent('complete', {
      success: fixResult.success,
      action: fixResult.action,
      confidence: fixResult.confidence,
      reasoning: fixResult.reasoning,
      agentWork: fixResult.agentWork
    });

    // Update feedback status
    await storage.updateUserFeedback(feedbackId, {
      status: fixResult.success ? 'resolved' : 'in-progress',
      adminNotes: (feedback.adminNotes || '') + `\n[${new Date().toISOString()}] Auto-fix attempted: ${fixResult.action} (${fixResult.confidence}% confidence)`
    });

    res.end();
  } catch (error: any) {
    console.error('[BugFixStream] Error:', error);
    sendEvent('error', { message: error.message });
    res.end();
  } finally {
    activeBugFixStreams.delete(streamId);
  }
});

/**
 * GET /api/qa-platform/fix-stream/status
 * Check if bug fix streaming is available for user
 */
router.get("/fix-stream/status", authenticateToken, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  res.json({
    available: user ? isGodLevel(user) : false,
    tier: user?.tier || 0,
    activeStreams: activeBugFixStreams.size
  });
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
