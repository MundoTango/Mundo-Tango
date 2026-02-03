/**
 * MR. BLUE VIBECODING ROUTES - Pattern 97 Complete
 * MB.MD v3.2 - Full VibeCoding with streaming
 *
 * NOW USES: VibeCodingMasterLoop for complete autonomous coding
 */

import { Router, type Request, Response } from "express";
import { vibeCodingMasterLoop } from "../services/VibeCodingMasterLoop";
import { getMrBlueCapabilities } from "../utils/mrBlueCapabilities";
import { agenticExecutor } from "../services/mrBlue/AgenticExecutor";
import { optionalAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// Apply optional auth middleware to all routes
router.use(optionalAuth);

// God-level user emails for direct agentic execution
const GOD_LEVEL_USERS = ['scott@boddye.com', 'admin@mundotango.life'];

function isGodLevel(user: any): boolean {
  if (!user) return false;
  return GOD_LEVEL_USERS.includes(user.email) || user.tier >= 8;
}

// Main VibeCoding endpoint with streaming support
router.post("/vibecoding", async (req: Request, res: Response) => {
  try {
    const { goal, context } = req.body;
    const user = (req as any).user;

    if (!goal) {
      return res
        .status(400)
        .json({ success: false, error: "Goal is required" });
    }

    // Check VibeCoding permission
    const userTier = user?.tier || 8;
    const capabilities = getMrBlueCapabilities(userTier);

    if (!capabilities.autonomousVibeCoding) {
      return res.status(403).json({
        success: false,
        error: "VibeCoding requires Elite (Tier 7) or God Level (Tier 8)",
        upgradeRequired: true,
      });
    }

    // Set up SSE headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sessionId = `vibe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Execute VibeCoding with streaming
    const result = await vibeCodingMasterLoop.executeVibeCoding(
      {
        goal,
        userId: user?.id || 0,
        sessionId,
        context,
      },
      (event) => {
        // Stream each event to client
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      },
    );

    // Send final result
    res.write(`data: ${JSON.stringify({ type: "result", result })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error("[VibeCoding] Error:", error);

    // If headers not sent, send JSON error
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: error.message || "VibeCoding failed",
      });
    }

    // Otherwise stream error and end
    res.write(
      `data: ${JSON.stringify({ type: "error", content: error.message })}\n\n`,
    );
    res.end();
  }
});

// Legacy endpoint for backwards compatibility (non-streaming)
router.post("/generate-code", async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;
    const user = (req as any).user;

    if (!prompt) {
      return res
        .status(400)
        .json({ success: false, error: "Prompt is required" });
    }

    const sessionId = `legacy-${Date.now()}`;

    const result = await vibeCodingMasterLoop.executeVibeCoding({
      goal: prompt,
      userId: user?.id || 0,
      sessionId,
      context,
    });

    return res.json({
      success: result.success,
      filesModified: result.filesModified,
      filesCreated: result.filesCreated,
      testsRun: result.testsRun,
      testsPassed: result.testsPassed,
      duration: result.duration,
      error: result.error,
    });
  } catch (error: any) {
    console.error("[VibeCoding] Legacy endpoint error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Code generation failed",
    });
  }
});

// Direct AgenticExecutor test endpoint (God-level only)
router.post("/agentic-execute", async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;
    const user = (req as any).user;

    // God-level check (tier 8 OR in GOD_LEVEL_USERS list)
    if (!isGodLevel(user)) {
      return res.status(403).json({
        success: false,
        error: "God-level (Tier 8) access required for direct agentic execution",
      });
    }

    if (!prompt) {
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    // Set up SSE for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    console.log(`[AgenticExecutor] Starting direct execution: ${prompt.substring(0, 100)}...`);

    // Execute with AgenticExecutor
    const result = await agenticExecutor.execute(
      prompt,
      context || {},
      (step) => {
        // Stream each step
        res.write(`data: ${JSON.stringify({
          type: step.type,
          content: step.content,
          timestamp: step.timestamp,
          toolName: step.toolName,
          toolResult: step.toolResult,
        })}\n\n`);
      }
    );

    // Send final result
    res.write(`data: ${JSON.stringify({
      type: "complete",
      success: result.success,
      filesModified: result.filesModified,
      filesCreated: result.filesCreated,
      error: result.error,
    })}\n\n`);

    res.end();
  } catch (error: any) {
    console.error("[AgenticExecutor] Direct execution error:", error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: error.message || "Agentic execution failed",
      });
    }
    
    res.write(`data: ${JSON.stringify({ type: "error", content: error.message })}\n\n`);
    res.end();
  }
});

export default router;
