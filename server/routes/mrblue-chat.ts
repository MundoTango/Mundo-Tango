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
import { unifiedMrBlueChat } from "../services/UnifiedMrBlueChat";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI();

/**
 * Dynamic Detective System Prompt for Bug Reports
 * MB.MD Pattern 67 - Asks contextual follow-up questions based on user responses
 */
const BUG_DETECTIVE_PROMPT = `You are Mr. Blue, acting as a QA Detective for the MundoTango platform.

## Your Role
You are gathering information about a bug the user is experiencing. Your job is to ask intelligent, contextual follow-up questions to understand the issue completely.

## Behavior Rules
1. Ask ONE focused question at a time based on what the user just told you
2. Be empathetic and patient - the user may be frustrated
3. Use simple, non-technical language
4. Reference specific details from what the user said
5. Guide them to provide: what they were doing, what they expected, and what actually happened

## Dynamic Question Strategy
Based on user input, ask about these aspects (if not yet covered):
- What specific action triggered the issue?
- What page/feature were they using?
- What did they expect to happen?
- What actually happened instead?
- Did they see any error messages?
- Can they reproduce the issue?

## Example Responses
User: "The button doesn't work"
You: "I understand you're having trouble with a button. Can you tell me which button you're trying to click and what page you're on when this happens?"

User: "I can't see my events"
You: "I see you're having trouble viewing your events. Are you looking at a specific city's events page, your personal event list, or the main events calendar? And did this just start happening or has it been an ongoing issue?"

User: "I got an error when trying to RSVP"
You: "Sorry to hear you encountered an error while RSVPing. What did the error message say, if you remember? And which event were you trying to RSVP to?"

## Important
- Keep responses short and focused (2-3 sentences max)
- Always acknowledge what the user shared before asking for more details
- If you have enough information, say "Thanks for the details! Click 'Submit Bug Report' when you're ready to send this to our team."`;

/**
 * Main chat endpoint - routes through UnifiedMrBlueChat
 * Supports: tools, agents, memory, context enrichment
 */
router.post("/chat", authenticateToken, async (req: Request, res: Response) => {
  const { message, systemPrompt, page, context } = req.body;
  const user = (req as any).user;

  console.log("[MrBlue Chat] Received request:", {
    message: message?.substring(0, 100),
    userId: user?.id,
    roleLevel: user?.roleLevel,
    page,
    mode: context?.mode
  });

  if (!message) {
    return res.status(400).json({
      success: false,
      error: "Message is required"
    });
  }

  try {
    // Bug Report Detective Mode - use dynamic detective prompt
    if (context?.mode === "bug_report") {
      console.log("[MrBlue Chat] Bug report mode - using detective prompt");
      
      // Build context-aware prompt
      let diagnosticContext = "";
      if (context?.diagnosticSnapshot) {
        diagnosticContext = `\n\n## User Context\n- Current Page: ${context.diagnosticSnapshot.currentPath || context.currentPage || 'unknown'}
- User Tier: ${context.diagnosticSnapshot.userTier || 'unknown'}`;
        
        if (context.diagnosticSnapshot.recentErrors?.length > 0) {
          diagnosticContext += `\n- Recent Errors: ${context.diagnosticSnapshot.recentErrors.map((e: any) => e.message).join('; ')}`;
        }
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: BUG_DETECTIVE_PROMPT + diagnosticContext },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });
      
      const reply = response.choices[0].message.content || "Can you tell me more about what happened?";
      
      return res.json({
        success: true,
        message: reply,
        response: reply,
        mode: "bug_detective"
      });
    }

    // Regular chat - use unified chat service
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
