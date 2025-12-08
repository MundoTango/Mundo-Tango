/**
 * MR. BLUE VIBECODING ROUTES
 * MB.MD v9.2 - GROQ Llama-3.3-70b Code Generation
 * 
 * Implements autonomous code generation with context awareness
 */

import { Router, type Request, Response } from "express";
import { GroqService, GROQ_MODELS } from "../services/ai/GroqService";
import { getMrBlueCapabilities } from "../utils/mrBlueCapabilities";
import { db } from "../db";
import { mrBlueConversations } from "@shared/schema";
import { eq } from "drizzle-orm";
import logger from "../middleware/logger";

const router = Router();

router.post("/generate-code", async (req: Request, res: Response) => {
  try {
    const { prompt, context, conversationId } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: "Prompt is required" 
      });
    }

    // Get user tier capabilities
    const user = (req as any).user;
    const userTier = user?.tier || 8; // Default to God Level (8) to allow VibeCoding for all users during beta
    const capabilities = getMrBlueCapabilities(userTier);
    
    // Check if VibeCoding is enabled for this tier
    if (!capabilities.autonomousVibeCoding) {
      return res.status(403).json({
        success: false,
        error: "VibeCoding requires Elite (Tier 7) or God Level (Tier 8)",
        upgradeRequired: true,
      });
    }

    // Build system prompt with context
    const systemPrompt = `You are Mr. Blue, an expert code generation AI using MB.MD v9.2 methodology.

CRITICAL RULES:
1. ALWAYS generate actual, production-ready code
2. NEVER say "I'll help you" without code
3. NEVER claim completion without showing code
4. Use modern best practices (React, TypeScript, Tailwind CSS)

Current Context:
- Page: ${context?.currentPage || 'unknown'}
- Theme: ${context?.theme || 'MT Ocean'}
- Framework: React + TypeScript + Tailwind CSS

TASK: Generate complete, working code for the user's request.

RESPONSE FORMAT:
\`\`\`typescript
// Your generated code here
\`\`\`

Explanation: [Brief explanation of what you built]`;

    // Generate code using GROQ Llama-3.3-70b
    const response = await GroqService.querySimple({
      prompt,
      systemPrompt,
      model: GROQ_MODELS.LLAMA_70B,
      temperature: 0.3, // Lower temp for code generation
    });

    if (!response.success || !response.content) {
      return res.status(500).json({
        success: false,
        error: "Code generation failed",
      });
    }

    // Extract code blocks from response
    const codeBlocks = extractCodeBlocks(response.content);
    
    // Save to conversation if provided
    if (conversationId && user) {
      try {
        await db.insert(mrBlueConversations).values({
          userId: user.id,
          title: `VibeCoding: ${prompt.substring(0, 50)}...`,
          lastMessageAt: new Date(),
        });
      } catch (err) {
        console.error('[VibeCoding] Failed to save conversation:', err);
      }
    }

    return res.json({
      success: true,
      code: codeBlocks,
      explanation: response.content,
      model: GROQ_MODELS.LLAMA_70B,
      tokensUsed: response.tokensUsed,
    });

  } catch (error: any) {
    console.error('[VibeCoding] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || "Code generation failed",
    });
  }
});

/**
 * Extract code blocks from markdown
 */
function extractCodeBlocks(text: string): Array<{ language: string; code: string }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];
  
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'typescript',
      code: match[2].trim(),
    });
  }
  
  return blocks;
}

export default router;
