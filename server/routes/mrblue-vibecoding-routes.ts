/**
 * MR. BLUE VIBECODING ROUTES - Pattern 97 Complete
 * MB.MD v3.2 - Full VibeCoding with streaming
 *
 * NOW USES: VibeCodingMasterLoop for complete autonomous coding
 */

import { Router, type Request, Response } from "express";
import { vibeCodingMasterLoop } from "../services/mrBlue/VibeCodingMasterLoop";
import { getMrBlueCapabilities } from "../utils/mrBlueCapabilities";

const router = Router();

// Main VibeCoding endpoint with streaming support
router.post("/vibecodeing", async (req: Request, res: Response) => {
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

export default router;
