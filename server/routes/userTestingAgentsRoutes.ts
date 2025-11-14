import { Router } from "express";
import { SessionSchedulerAgent } from "../services/userTesting/sessionSchedulerAgent";
import { LiveObserverAgent } from "../services/userTesting/liveObserverAgent";
import { BugDetectorAgent } from "../services/userTesting/bugDetectorAgent";
import { UxPatternAgent } from "../services/userTesting/uxPatternAgent";

const router = Router();

// Initialize agents
const sessionScheduler = new SessionSchedulerAgent();
const liveObserver = new LiveObserverAgent();
const bugDetector = new BugDetectorAgent();
const uxPatternAgent = new UxPatternAgent();

/**
 * POST /api/user-testing/sessions/create
 * Create a new testing session
 */
router.post("/sessions/create", async (req, res) => {
  try {
    const { volunteerId, scenarioId, scheduledAt } = req.body;

    if (!volunteerId || !scenarioId || !scheduledAt) {
      return res.status(400).json({
        error: "Missing required fields: volunteerId, scenarioId, scheduledAt",
      });
    }

    const session = await sessionScheduler.createSession(
      parseInt(volunteerId),
      parseInt(scenarioId),
      new Date(scheduledAt)
    );

    res.json({
      success: true,
      session,
    });
  } catch (error: any) {
    console.error("Error creating session:", error);
    res.status(500).json({
      error: "Failed to create session",
      message: error.message,
    });
  }
});

/**
 * POST /api/user-testing/sessions/:id/daily-room
 * Create Daily.co room for a session
 */
router.post("/sessions/:id/daily-room", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);

    const roomConfig = await sessionScheduler.createDailyRoom(sessionId);

    res.json({
      success: true,
      roomConfig,
    });
  } catch (error: any) {
    console.error("Error creating Daily.co room:", error);
    res.status(500).json({
      error: "Failed to create Daily.co room",
      message: error.message,
    });
  }
});

/**
 * POST /api/user-testing/sessions/:id/notify
 * Send notification to volunteer
 */
router.post("/sessions/:id/notify", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);

    await sessionScheduler.notifyVolunteer(sessionId);

    res.json({
      success: true,
      message: "Notification sent",
    });
  } catch (error: any) {
    console.error("Error notifying volunteer:", error);
    res.status(500).json({
      error: "Failed to notify volunteer",
      message: error.message,
    });
  }
});

/**
 * POST /api/user-testing/sessions/:id/cancel
 * Cancel a session
 */
router.post("/sessions/:id/cancel", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        error: "Cancellation reason is required",
      });
    }

    await sessionScheduler.cancelSession(sessionId, reason);

    res.json({
      success: true,
      message: "Session cancelled",
    });
  } catch (error: any) {
    console.error("Error cancelling session:", error);
    res.status(500).json({
      error: "Failed to cancel session",
      message: error.message,
    });
  }
});

/**
 * GET /api/user-testing/sessions
 * List all sessions with optional status filter
 */
router.get("/sessions", async (req, res) => {
  try {
    const { status } = req.query;

    const sessions = await sessionScheduler.listSessions(status as string);

    res.json({
      success: true,
      sessions,
    });
  } catch (error: any) {
    console.error("Error listing sessions:", error);
    res.status(500).json({
      error: "Failed to list sessions",
      message: error.message,
    });
  }
});

/**
 * GET /api/user-testing/sessions/:id
 * Get session details
 */
router.get("/sessions/:id", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);

    const session = await sessionScheduler.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: "Session not found",
      });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error: any) {
    console.error("Error getting session:", error);
    res.status(500).json({
      error: "Failed to get session",
      message: error.message,
    });
  }
});

/**
 * GET /api/user-testing/sessions/:id/observe
 * Start observing a session
 */
router.get("/sessions/:id/observe", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);

    const observationData = await liveObserver.startObserving(sessionId);

    res.json({
      success: true,
      ...observationData,
    });
  } catch (error: any) {
    console.error("Error starting observation:", error);
    res.status(500).json({
      error: "Failed to start observation",
      message: error.message,
    });
  }
});

/**
 * POST /api/user-testing/sessions/:id/end
 * End observation session
 */
router.post("/sessions/:id/end", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);

    await liveObserver.endObservation(sessionId);

    res.json({
      success: true,
      message: "Observation ended",
    });
  } catch (error: any) {
    console.error("Error ending observation:", error);
    res.status(500).json({
      error: "Failed to end observation",
      message: error.message,
    });
  }
});

/**
 * POST /api/user-testing/screenshots/capture
 * Capture screenshot during session
 */
router.post("/screenshots/capture", async (req, res) => {
  try {
    const { sessionId, timestamp } = req.body;

    if (!sessionId || !timestamp) {
      return res.status(400).json({
        error: "Missing required fields: sessionId, timestamp",
      });
    }

    const screenshotUrl = await liveObserver.captureScreenshot(
      parseInt(sessionId),
      new Date(timestamp)
    );

    res.json({
      success: true,
      screenshotUrl,
    });
  } catch (error: any) {
    console.error("Error capturing screenshot:", error);
    res.status(500).json({
      error: "Failed to capture screenshot",
      message: error.message,
    });
  }
});

/**
 * GET /api/user-testing/sessions/:id/interactions
 * Get session interactions
 */
router.get("/sessions/:id/interactions", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);

    const interactions = await liveObserver.getSessionInteractions(sessionId);

    res.json({
      success: true,
      interactions,
    });
  } catch (error: any) {
    console.error("Error getting interactions:", error);
    res.status(500).json({
      error: "Failed to get interactions",
      message: error.message,
    });
  }
});

/**
 * POST /api/user-testing/sessions/:id/notes
 * Generate AI session notes
 */
router.post("/sessions/:id/notes", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);

    const notes = await liveObserver.generateSessionNotes(sessionId);

    res.json({
      success: true,
      notes,
    });
  } catch (error: any) {
    console.error("Error generating notes:", error);
    res.status(500).json({
      error: "Failed to generate notes",
      message: error.message,
    });
  }
});

/**
 * POST /api/user-testing/bugs/detect/:sessionId
 * Analyze session and detect bugs
 */
router.post("/bugs/detect/:sessionId", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);

    const bugs = await bugDetector.analyzeInteractions(sessionId);

    res.json({
      success: true,
      bugs,
      count: bugs.length,
    });
  } catch (error: any) {
    console.error("Error detecting bugs:", error);
    res.status(500).json({
      error: "Failed to detect bugs",
      message: error.message,
    });
  }
});

/**
 * POST /api/user-testing/bugs/create
 * Create a bug report
 */
router.post("/bugs/create", async (req, res) => {
  try {
    const { sessionId, bug, volunteerId } = req.body;

    if (!sessionId || !bug) {
      return res.status(400).json({
        error: "Missing required fields: sessionId, bug",
      });
    }

    const bugId = await bugDetector.createBugReport(
      parseInt(sessionId),
      bug,
      volunteerId ? parseInt(volunteerId) : undefined
    );

    res.json({
      success: true,
      bugId,
    });
  } catch (error: any) {
    console.error("Error creating bug report:", error);
    res.status(500).json({
      error: "Failed to create bug report",
      message: error.message,
    });
  }
});

/**
 * GET /api/user-testing/bugs/session/:sessionId
 * Get all bugs for a session
 */
router.get("/bugs/session/:sessionId", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);

    const bugs = await bugDetector.getSessionBugs(sessionId);

    res.json({
      success: true,
      bugs,
    });
  } catch (error: any) {
    console.error("Error getting session bugs:", error);
    res.status(500).json({
      error: "Failed to get session bugs",
      message: error.message,
    });
  }
});

/**
 * GET /api/user-testing/patterns/:sessionId
 * Detect UX patterns in session
 */
router.get("/patterns/:sessionId", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);

    const patterns = await uxPatternAgent.detectPattern(sessionId);

    res.json({
      success: true,
      patterns,
    });
  } catch (error: any) {
    console.error("Error detecting patterns:", error);
    res.status(500).json({
      error: "Failed to detect patterns",
      message: error.message,
    });
  }
});

/**
 * GET /api/user-testing/patterns/session/:sessionId
 * Get stored patterns for a session
 */
router.get("/patterns/session/:sessionId", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);

    const patterns = await uxPatternAgent.getSessionPatterns(sessionId);

    res.json({
      success: true,
      patterns,
    });
  } catch (error: any) {
    console.error("Error getting patterns:", error);
    res.status(500).json({
      error: "Failed to get patterns",
      message: error.message,
    });
  }
});

/**
 * POST /api/user-testing/heatmap/:sessionId
 * Generate heatmap for session
 */
router.post("/heatmap/:sessionId", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);

    const heatmap = await uxPatternAgent.generateHeatmap(sessionId);

    res.json({
      success: true,
      heatmap,
    });
  } catch (error: any) {
    console.error("Error generating heatmap:", error);
    res.status(500).json({
      error: "Failed to generate heatmap",
      message: error.message,
    });
  }
});

/**
 * GET /api/user-testing/patterns/:patternId/improvement
 * Get improvement suggestion for a pattern
 */
router.get("/patterns/:patternId/improvement", async (req, res) => {
  try {
    const patternId = parseInt(req.params.patternId);

    const suggestion = await uxPatternAgent.suggestImprovement(patternId);

    res.json({
      success: true,
      suggestion,
    });
  } catch (error: any) {
    console.error("Error getting improvement suggestion:", error);
    res.status(500).json({
      error: "Failed to get improvement suggestion",
      message: error.message,
    });
  }
});

export default router;
