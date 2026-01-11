/**
 * MR. BLUE CHAT ROUTES
 * MB.MD Pattern 97 - Unified chat endpoint with tool calling
 *
 * Routes:
 * - POST /chat - Main chat endpoint (uses UnifiedMrBlueChat)
 * - POST /chat/simple - Legacy simple chat (backwards compatibility)
 */

import { Router, type Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { unifiedMrBlueChat } from "../services/mrBlue/UnifiedMrBlueChat";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI();

/**
 * Main chat endpoint - routes through UnifiedMrBlueChat
 * Supports: tools, agents, memory, context enrichment
 */
router.post("/chat", authenticateToken, async (req: Request, res: Response) => {
  const { message, systemPrompt, page } = req.body;
  const user = (req as any).user;

  console.log("[MrBlue Chat] Received request:", {
    message: message?.substring(0, 100),
    userId: user?.id,
    roleLevel: user?.roleLevel,
    page
  });

  if (!message) {
    return res.status(400).json({
      success: false,
      error: "Message is required"
    });
  }

  try {
    // Use unified chat service
    const response = await unifiedMrBlueChat.chat({
      message,
      userId: user?.id || 0,
      sessionId: `chat-${Date.now()}`,
      roleLevel: user?.roleLevel || 0,
      page
    });

    console.log(`[MrBlue Chat] Success (mode: ${response.mode}), response length: ${response.message?.length}`);

    // Return response in both new and legacy format for backwards compatibility
    res.json({
      success: response.success,
      message: response.message,
      mode: response.mode,
      metadata: response.metadata,
      // Legacy field for backwards compatibility
      reply: response.message
    });

  } catch (error: any) {
    console.error("[MrBlue Chat] Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to communicate with AI",
      message: error.message
    });
  }
});

/**
 * Legacy simple chat endpoint - direct OpenAI call
 * Kept for backwards compatibility with existing clients
 */
router.post("/chat/simple", authenticateToken, async (req: Request, res: Response) => {
  const { message, systemPrompt } = req.body;

  console.log("[MrBlue Chat Simple] Received request:", {
    message: message?.substring(0, 100),
    systemPromptLength: systemPrompt?.length
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt || "You are Mr. Blue, a helpful assistant." },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    console.log("[MrBlue Chat Simple] Success, reply length:", reply?.length);
    res.json({ message: reply });

  } catch (error: any) {
    console.error("[MrBlue Chat Simple] Error:", error);
    res.status(500).json({ error: "Failed to communicate with AI" });
  }
});

/**
 * Health check endpoint
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "mr-blue-chat",
    version: "2.0.0",
    features: ["tools", "memory", "context", "agents"]
  });
});

export default router;
