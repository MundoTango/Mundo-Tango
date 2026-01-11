/**
 * Mr. Blue Enhanced Routes - Integrated Troubleshooting Intelligence
 * Auto-detects errors and provides solutions from 500+ issue knowledge base
 */

import { Router } from "express";
import { z } from "zod";
import { authenticateToken } from "../middleware/auth";
import {
  findMatchingIssues,
  getSolution,
  getIssuesByCategory,
  getCriticalIssues,
  type TroubleshootingIssue,
} from "../knowledge/mr-blue-troubleshooting-kb";
import { legalOrchestrator } from "../services/legal/LegalOrchestrator";
import { ElevenLabsVoiceService } from "../services/premium/elevenlabsVoiceService";
import { browserAutomationService } from "../services/mrBlue/BrowserAutomationService";
import { facebookMessengerService } from "../services/mrBlue/FacebookMessengerService";
import { mrBlueDataService } from "../services/mr-blue-data-service";
import { db } from "@db";
import {
  computerUseTasks,
  computerUseScreenshots,
  userFeedback,
} from "@shared/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import Groq from "groq-sdk";
import { storage } from "../storage";
import {
  taskExecutorService,
  isGodLevelUser,
} from "../services/mrBlue/TaskExecutorService";
import * as VibeCodingTools from "../services/mrBlue/VibeCodingToolService";
import { vibeCodingMasterLoop } from "../services/mrBlue/VibeCodingMasterLoop";


// MB.MD GOD COMMAND #7: Timeout wrapper for auto-fix retry logic
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}
const router = Router();
const elevenlabsService = new ElevenLabsVoiceService();

// Schema for enhanced chat with auto-troubleshooting
const enhancedChatSchema = z.object({
  message: z.string(),
  errorContext: z
    .object({
      errorMessage: z.string().optional(),
      stackTrace: z.string().optional(),
      browserLogs: z.array(z.string()).optional(),
      serverLogs: z.array(z.string()).optional(),
    })
    .optional(),
  currentPage: z.string().optional(),
  // MB.MD Pattern 67: Session context injection
  sessionContext: z
    .object({
      currentPage: z.string().optional(),
      recentActions: z.array(z.string()).optional(),
      navigationPath: z.array(z.string()).optional(),
      lastError: z.string().optional(),
      sessionId: z.string().optional(),
    })
    .optional(),
});

/**
 * Computer Use Intent Detection
 * Detects automation requests AND questions about Computer Use
 */
function detectComputerUseIntent(message: string): {
  isAutomation: boolean;
  type:
    | "wix_extraction"
    | "facebook_automation"
    | "info_request"
    | "custom"
    | null;
  confidence: number;
} {
  const msg = message.toLowerCase();

  // General Computer Use info patterns (user asking ABOUT the feature)
  const infoPatterns = [
    /computer.*use/i,
    /use.*computer/i, // Bidirectional: "can you use computer"
    /compute.*use/i,
    /use.*compute/i, // Bidirectional: "can you use compute"
    /computer.*access/i,
    /access.*computer/i, // Bidirectional
    /compute.*access/i,
    /access.*compute/i, // Bidirectional
    /browser.*automat/i,
    /automat.*browser/i, // Bidirectional
    /what.*automat/i,
    /can.*you.*automat/i,
    /do.*you.*have.*automat/i,
    /automation.*feature/i,
    /automation.*capabilit/i,
    /what.*can.*you.*do.*automat/i,
    /\bai.*automat/i, // AI automation
    /automat.*\bai/i, // automation AI
  ];

  for (const pattern of infoPatterns) {
    if (pattern.test(message)) {
      return {
        isAutomation: true,
        type: "info_request",
        confidence: 0.85,
      };
    }
  }

  // Wix extraction patterns
  const wixPatterns = [
    /wix.*contact/i,
    /extract.*wix/i,
    /get.*wix.*data/i,
    /download.*wix.*contact/i,
    /migrate.*wix/i,
  ];

  for (const pattern of wixPatterns) {
    if (pattern.test(message)) {
      return {
        isAutomation: true,
        type: "wix_extraction",
        confidence: 0.9,
      };
    }
  }

  // Facebook automation patterns
  const facebookPatterns = [
    /send.*fb.*invit.*to/i,
    /send.*facebook.*invit.*to/i,
    /invite.*on.*facebook/i,
    /facebook.*message.*to/i,
    /fb.*message.*to/i,
    /facebook.*automat/i,
    /automate.*facebook/i,
    /facebook.*invite/i,
    /fb.*invite/i,
  ];

  for (const pattern of facebookPatterns) {
    if (pattern.test(message)) {
      return {
        isAutomation: true,
        type: "facebook_automation",
        confidence: 0.8,
      };
    }
  }

  return {
    isAutomation: false,
    type: null,
    confidence: 0,
  };
}

/**
 * MB.MD Pattern 67: Feedback Intent Detection
 * Detects when user is reporting a bug, feature request, or support issue
 * Uses aggregated scoring - multiple matches BOOST confidence to handle mixed phrases
 */
function detectFeedbackIntent(message: string): {
  isFeedback: boolean;
  type: "bug" | "feature" | "support" | "complaint" | null;
  confidence: number;
} {
  const scores: {
    type: "bug" | "feature" | "support" | "complaint";
    confidence: number;
  }[] = [];

  // Bug patterns - each match adds to score (aggregation, not max)
  const bugPatterns = [
    /\bbug\b/i,
    /broken/i,
    /doesn'?t work/i,
    /not working/i,
    /error/i,
    /crash/i,
    /issue/i,
    /problem/i,
    /wrong/i,
    /failed/i,
    /can'?t.*do/i,
    /unable to/i,
  ];
  let bugMatches = bugPatterns.filter((p) => p.test(message)).length;
  if (bugMatches > 0) {
    // Base 0.7 + 0.1 per match, capped at 0.95
    scores.push({
      type: "bug",
      confidence: Math.min(0.95, 0.7 + bugMatches * 0.1),
    });
  }

  // Feature patterns
  const featurePatterns = [
    /feature request/i,
    /would be nice/i,
    /could you add/i,
    /can you add/i,
    /i wish/i,
    /please add/i,
    /suggestion/i,
    /idea for/i,
    /it would help/i,
    /new feature/i,
    /want to see/i,
  ];
  let featureMatches = featurePatterns.filter((p) => p.test(message)).length;
  if (featureMatches > 0) {
    scores.push({
      type: "feature",
      confidence: Math.min(0.95, 0.75 + featureMatches * 0.1),
    });
  }

  // Support patterns
  const supportPatterns = [
    /help me/i,
    /need help/i,
    /how do i/i,
    /how can i/i,
    /can you help/i,
    /stuck/i,
    /confused/i,
    /where is/i,
    /can'?t find/i,
    /show me how/i,
  ];
  let supportMatches = supportPatterns.filter((p) => p.test(message)).length;
  if (supportMatches > 0) {
    scores.push({
      type: "support",
      confidence: Math.min(0.95, 0.7 + supportMatches * 0.1),
    });
  }

  // Complaint patterns
  const complaintPatterns = [
    /frustrated/i,
    /annoying/i,
    /terrible/i,
    /awful/i,
    /hate/i,
    /disappointed/i,
    /unacceptable/i,
    /worst/i,
    /useless/i,
  ];
  let complaintMatches = complaintPatterns.filter((p) =>
    p.test(message),
  ).length;
  if (complaintMatches > 0) {
    scores.push({
      type: "complaint",
      confidence: Math.min(0.95, 0.75 + complaintMatches * 0.1),
    });
  }

  // Return highest confidence match; if multiple categories, add bonus for blended
  if (scores.length === 0) {
    return { isFeedback: false, type: null, confidence: 0 };
  }

  // If multiple categories match, boost highest by 0.05 (clear feedback intent)
  const hasMultipleCategories = scores.length >= 2;
  scores.sort((a, b) => b.confidence - a.confidence);
  const best = scores[0];
  const finalConfidence = hasMultipleCategories
    ? Math.min(0.95, best.confidence + 0.05)
    : best.confidence;

  return { isFeedback: true, type: best.type, confidence: finalConfidence };
}

/**
 * MB.MD Pattern 65: VibeCoding Intent Detection
 * Detects when a god-level user wants to make code changes via Mr. Blue
 */
function detectVibeCodingIntent(message: string): {
  isVibeCoding: boolean;
  confidence: number;
} {
  const msg = message.toLowerCase();

  // VibeCoding patterns - actions that require code changes
  const vibeCodingPatterns = [
    /\b(add|create|build|implement|make)\s+(a|an|the)?\s*\w+/i,
    /\b(fix|repair|correct|patch)\s+(this|the|a|an)?\s*\w+/i,
    /\b(change|update|modify|edit|adjust)\s+(this|the|a|an)?\s*\w+/i,
    /\b(remove|delete|hide)\s+(this|the|a|an)?\s*\w+/i,
    /\brefactor\b/i,
    /\bstyle\s+(this|the)\b/i,
    /\bupdate\s+the\s+(css|styling|design|layout)\b/i,
    /\badd\s+(a|an)?\s*button\b/i,
    /\badd\s+(a|an)?\s*feature\b/i,
    /\bfix\s+(the|this)?\s*(bug|issue|error|problem)\b/i,
    /\bmake\s+(this|the|it)\s+(work|better|faster|prettier)\b/i,
    /\bwrite\s+(the|some)?\s*code\b/i,
    /\bgenerate\s+(the|a|some)?\s*code\b/i,
    /\bimplement\s+(this|the)\b/i,
    /\bcan you (add|fix|create|change|update|build|implement)/i,
    /\bplease (add|fix|create|change|update|build|implement)/i,
    /\bpattern\s*9{1,2}\b/i,
    /\bexecute\s+(pattern|audit|fix|phase)/i,
    /\bspawn\s+(fix\s+)?subagent/i,
    /\bvibecoding\b/i,
    /\baudit\s+(and\s+)?fix/i,
    /\bfix\s+all\s+(issues?|bugs?)/i,
    /\bauto.?fix/i,
  ];

  // Check for matches
  const matchCount = vibeCodingPatterns.filter((p) => p.test(msg)).length;

  if (matchCount === 0) {
    return { isVibeCoding: false, confidence: 0 };
  }

  // Base 0.7 + 0.1 per match, capped at 0.95
  const confidence = Math.min(0.95, 0.7 + matchCount * 0.1);
  return { isVibeCoding: true, confidence };
}

/**
 * MB.MD Pattern 65: Tool Intent Detection
 * Detects when a god-level user wants to USE a tool (not just chat)
 * This is what makes Mr. Blue a TRUE VibeCoding agent - the ability to DO things
 */
function detectToolIntent(message: string): {
  hasTool: boolean;
  tool: string | null;
  args: Record<string, string>;
  confidence: number;
} {
  const msg = message.toLowerCase();

  // GitHub tool patterns
  if (/\b(github|repo|repository|repos|commits?|issues?)\b/i.test(msg)) {
    // Specific repo pattern: "look at owner/repo"
    const repoMatch = msg.match(
      /(?:look at|check|show|get)\s+(?:the\s+)?(?:github\s+)?(?:repo(?:sitory)?\s+)?([a-z0-9_-]+)\/([a-z0-9_-]+)/i,
    );
    if (repoMatch) {
      return {
        hasTool: true,
        tool: "getGitHubRepo",
        args: { owner: repoMatch[1], repo: repoMatch[2] },
        confidence: 0.95,
      };
    }
    // General GitHub info
    return { hasTool: true, tool: "getGitHubInfo", args: {}, confidence: 0.85 };
  }

  // Git status patterns
  if (
    /\b(git\s+status|current\s+branch|recent\s+commits?|uncommitted)\b/i.test(
      msg,
    )
  ) {
    return { hasTool: true, tool: "getGitStatus", args: {}, confidence: 0.9 };
  }

  // Project structure patterns
  if (
    /\b(project\s+structure|codebase|file\s+structure|what\s+files|overview)\b/i.test(
      msg,
    )
  ) {
    return {
      hasTool: true,
      tool: "getProjectStructure",
      args: {},
      confidence: 0.85,
    };
  }

  // File read patterns
  const readMatch = msg.match(
    /(?:read|show|open|view|look at|check)\s+(?:the\s+)?(?:file\s+)?([a-z0-9_\-./]+\.[a-z]+)/i,
  );
  if (readMatch) {
    return {
      hasTool: true,
      tool: "readFile",
      args: { filePath: readMatch[1] },
      confidence: 0.9,
    };
  }

  // Directory list patterns - handle "list files in X directory" and "list directory X"
  const dirMatch = msg.match(
    /(?:list|show|what'?s?\s+in)\s+(?:the\s+)?(?:files\s+in\s+(?:the\s+)?)?(?:directory\s+|folder\s+)?([a-zA-Z0-9_.\-\/]+)(?:\s+directory|\s+folder)?/i,
  );
  if (dirMatch) {
    const dirPath = dirMatch[1] !== "files" ? dirMatch[1] : ".";
    return {
      hasTool: true,
      tool: "listDirectory",
      args: { dirPath },
      confidence: 0.8,
    };
  }

  // Search patterns
  const searchMatch = msg.match(
    /(?:search|find|grep|look for)\s+(?:files?\s+)?(?:containing\s+|with\s+|for\s+)?["']?([^"']+)["']?/i,
  );
  if (searchMatch) {
    return {
      hasTool: true,
      tool: "grepFiles",
      args: { searchTerm: searchMatch[1].trim() },
      confidence: 0.8,
    };
  }

  // MB.MD Pattern 67: Auto-fix and VibeCoding execution patterns
  if (
    /\b(fix\s+this|apply\s+the\s+fix|make\s+the\s+change|edit\s+the\s+file|execute\s+now|do\s+it\s+now|fix\s+it\s+now|apply\s+fix\s+automatically)\b/i.test(msg) ||
    /\b(auto.?fix|apply.*automatically|make.*code\s+change|update\s+the\s+code)\b/i.test(msg)
  ) {
    return {
      hasTool: true,
      tool: "agenticExecute",
      args: { goal: message },
      confidence: 0.9,
    };
  }

  return { hasTool: false, tool: null, args: {}, confidence: 0 };
}

/**
 * Execute a VibeCoding tool and return formatted result
 */
async function executeToolWithContext(
  tool: string,
  args: Record<string, string>,
): Promise<VibeCodingTools.ToolResult> {
  switch (tool) {
    case "getGitHubInfo":
      return await VibeCodingTools.getGitHubInfo();
    case "getGitHubRepo":
      return await VibeCodingTools.getGitHubRepo(args.owner, args.repo);
    case "getGitStatus":
      return await VibeCodingTools.getGitStatus();
    case "getProjectStructure":
      return await VibeCodingTools.getProjectStructure();
    case "readFile":
      return await VibeCodingTools.readFile(args.filePath);
    case "listDirectory":
      return await VibeCodingTools.listDirectory(args.dirPath || ".");
    case "grepFiles":
      return await VibeCodingTools.grepFiles(args.searchTerm);
    case "searchFiles":
      return await VibeCodingTools.searchFiles(args.pattern);
    case "agenticExecute":
      // MB.MD Pattern 67: Execute AgenticExecutor for bug fixes
      try {
        const { agenticExecutor } = await import("../services/mrBlue/AgenticExecutor");
        const result = await agenticExecutor.execute({
          goal: args.goal,
          context: args.context || "",
          maxIterations: 5,
        });
        return {
          success: result.success,
          tool: "agenticExecute",
          data: {
            filesModified: result.filesModified || [],
            actions: result.actions || [],
            summary: result.summary || "Execution completed",
          },
          error: result.error,
        };
      } catch (error: any) {
        return {
          success: false,
          tool: "agenticExecute",
          data: null,
          error: error.message || "AgenticExecutor failed",
        };
      }
    default:
      return { success: false, tool, data: null, error: "Unknown tool" };
  }
}

/**
 * Context-aware chat endpoint for Mr. Blue interactions
 * Now supports:
 * - Computer Use automation triggers
 * - ElevenLabs TTS for voice responses
 * - Context-aware assistance
 */
router.post("/api/mrblue/chat", authenticateToken, async (req, res) => {
  try {
    const {
      message,
      context,
      voiceEnabled,
      selectedVoiceId,
      systemPrompt: customSystemPrompt,
      conversationHistory,
      sessionContext,
    } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // MB.MD Pattern 65: CHECK GOD-LEVEL TOOLS FIRST (before any early returns)
    // This ensures VibeCoding tools work even when systemPrompt is provided
    const userId = (req as any).user?.id;
    const userRoleLevel = (req as any).user?.roleLevel || 0;
    const userEmail = (req as any).user?.email || "";
    
    if (userId) {
      const isGodLevel = isGodLevelUser(userRoleLevel) || isGodLevelUser(userEmail);
      const toolIntent = detectToolIntent(message);
      
      console.log(
        `[Mr. Blue] Tool detection: isGodLevel=${isGodLevel} (roleLevel=${userRoleLevel}, email=${userEmail}), tool=${toolIntent.tool}, confidence=${toolIntent.confidence}`,
      );

      if (isGodLevel && toolIntent.hasTool && toolIntent.tool && toolIntent.confidence >= 0.7) {
        console.log(`[Mr. Blue] Tool execution request from god-level user: ${toolIntent.tool}`);
        
        try {
          const toolResult = await executeToolWithContext(toolIntent.tool, toolIntent.args);
          
          if (toolResult.success) {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const formatResponse = await groq.chat.completions.create({
              model: "llama-3.3-70b-versatile",
              messages: [
                {
                  role: "system",
                  content: `You are Mr. Blue, a VibeCoding agent with god-level powers. You just executed a tool and got real data. Format this data conversationally for the user. Be helpful and informative. Do not use emojis.`,
                },
                {
                  role: "user",
                  content: `User asked: "${message}"\n\nTool executed: ${toolResult.tool}\n\nResult data:\n${JSON.stringify(toolResult.data, null, 2)}`,
                },
              ],
              max_tokens: 500,
              temperature: 0.7,
            });
            
            const formattedResponse = formatResponse.choices[0]?.message?.content || JSON.stringify(toolResult.data, null, 2);
            
            return res.json({
              role: "assistant",
              content: formattedResponse,
              timestamp: new Date().toISOString(),
              toolExecuted: toolResult.tool,
              toolSuccess: true,
              godLevelExecution: true,
              rawData: toolResult.data,
            });
          } else {
            return res.json({
              role: "assistant",
              content: `I tried to execute ${toolResult.tool} but encountered an error: ${toolResult.error}. Please check that the required integrations are connected.`,
              timestamp: new Date().toISOString(),
              toolExecuted: toolResult.tool,
              toolSuccess: false,
              godLevelExecution: true,
            });
          }
        } catch (error: any) {
          console.error("[Mr. Blue] Tool execution error:", error);
        }
      }
    }

    // MB.MD Pattern 67: Build session context string for AI injection
    let sessionContextStr = "";
    if (sessionContext) {
      const parts: string[] = [];
      if (sessionContext.currentPage) {
        parts.push(`User is on page: ${sessionContext.currentPage}`);
      }
      if (sessionContext.recentActions?.length) {
        parts.push(
          `Recent actions: ${sessionContext.recentActions.slice(0, 5).join(", ")}`,
        );
      }
      if (sessionContext.navigationPath?.length) {
        parts.push(
          `Navigation path: ${sessionContext.navigationPath.join(" → ")}`,
        );
      }
      if (sessionContext.lastError) {
        parts.push(`Last error seen: ${sessionContext.lastError}`);
      }
      if (parts.length > 0) {
        sessionContextStr = `\n\n[User Session Context]\n${parts.join("\n")}`;
      }
    }

    // MB.MD Fix: If custom systemPrompt provided (e.g., from Talent Match interview), use Groq AI
    if (customSystemPrompt && typeof customSystemPrompt === "string") {
      console.log("[Mr. Blue] Using custom system prompt for AI response");
      console.log(
        "[Mr. Blue] systemPrompt length:",
        customSystemPrompt.length,
        "chars",
      );
      console.log(
        "[Mr. Blue] systemPrompt preview:",
        customSystemPrompt.substring(0, 200),
      );
      console.log("[Mr. Blue] User message:", message);

      try {
        const Groq = require("groq-sdk");
        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY || "",
          baseURL: process.env.GROQ_BASE_URL || undefined,
        });

        // Build messages array with conversation history for continuity
        const messages: Array<{
          role: "system" | "user" | "assistant";
          content: string;
        }> = [{ role: "system", content: customSystemPrompt }];

        // Include prior conversation turns if provided
        if (Array.isArray(conversationHistory)) {
          for (const msg of conversationHistory) {
            if (msg.role && msg.content) {
              messages.push({
                role: msg.role === "assistant" ? "assistant" : "user",
                content: msg.content || msg.message || "",
              });
            }
          }
        }

        // Add current user message
        messages.push({ role: "user", content: message });

        const aiResponse = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages,
          max_tokens: 300,
          temperature: 0.7,
        });

        const responseContent =
          aiResponse.choices[0]?.message?.content ||
          "I apologize, I could not generate a response. Please try again.";

        return res.json({
          response: responseContent,
          role: "assistant",
          content: responseContent,
          timestamp: new Date().toISOString(),
          contextUsed: true,
          aiGenerated: true,
        });
      } catch (aiError: any) {
        console.error("[Mr. Blue] AI generation error:", aiError);
        return res.json({
          response:
            "I encountered an issue generating a response. Let me try a different approach - could you tell me more about your background?",
          role: "assistant",
          content:
            "I encountered an issue generating a response. Let me try a different approach - could you tell me more about your background?",
          timestamp: new Date().toISOString(),
          error: aiError.message,
        });
      }
    }

    // NOTE: God-level tool detection moved to the top of the handler
    // to ensure it runs before any early returns (like customSystemPrompt)
    
    // Fallback variable declarations for code that still needs them
    const isGodLevel = userId ? (isGodLevelUser(userRoleLevel) || isGodLevelUser(userEmail)) : false;

    // MB.MD Pattern 65: VibeCoding Code Generation for God-Level Users
    const vibeCodingIntent = detectVibeCodingIntent(message);
                                                                                          console.log('[Mr. Blue] VibeCoding intent detection:', { isVibeCoding: vibeCodingIntent.isVibeCoding, confidence: vibeCodingIntent.confidence, tool: vibeCodingIntent.tool });

    if (
      isGodLevel &&
      vibeCodingIntent.isVibeCoding &&
      vibeCodingIntent.confidence >= 0.7
    ) {
      console.log(
        `[Mr. Blue] VibeCoding request from god-level user (${userEmail}): "${message.substring(0, 50)}..."`,
      );

      // Check if streaming is requested
      const streamRequested = req.headers.accept?.includes("text/event-stream");

      if (streamRequested) {
        // SSE streaming response
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        try {
          const result = await vibeCodingMasterLoop.executeVibeCoding(
            {
              goal: message,
              userId,
              sessionId: sessionContext?.sessionId || `vibe_${Date.now()}`,
              context: {
                currentPage: sessionContext?.currentPage || context?.currentPage,
                projectPath: process.cwd(),
                relevantFiles: sessionContext?.recentActions?.filter(
                  (a: string) => a.includes(".ts") || a.includes(".tsx"),
                ),
              },
            },
            (event) => {
              // Stream each event to client
              res.write(`data: ${JSON.stringify(event)}\n\n`);
            }
          );

          // Send final result
          res.write(`data: ${JSON.stringify({
            type: "complete",
            content: JSON.stringify(result),
            timestamp: Date.now(),
          })}\n\n`);
          res.end();
        } catch (vibeError: any) {
          console.error("[Mr. Blue] VibeCoding stream error:", vibeError);
          res.write(`data: ${JSON.stringify({
            type: "error",
            content: vibeError.message,
            timestamp: Date.now(),
          })}\n\n`);
          res.end();
        }
        return;
      }

      // Non-streaming execution
      try {
        const streamEvents: Array<{ type: string; content: string; phase?: string }> = [];
        
        console.log(`[Mr. Blue] ===== VIBECODING EXECUTION START =====`);
        console.log(`[Mr. Blue] Goal: "${message.substring(0, 100)}..."`);
        console.log(`[Mr. Blue] User: ${userEmail}, isGodLevel: ${isGodLevel}`);
        console.log(`[Mr. Blue] Session: ${sessionContext?.sessionId || 'none'}`);

        const result = await withTimeout(
          vibeCodingMasterLoop.executeVibeCoding(
            {
              goal: message,
              userId,
              sessionId: sessionContext?.sessionId || `vibe_${Date.now()}`,
              context: {
                currentPage: sessionContext?.currentPage || context?.currentPage,
                projectPath: process.cwd(),
                relevantFiles: sessionContext?.recentActions?.filter(
                  (a: string) => a.includes(".ts") || a.includes(".tsx"),
                ),
              },
            },
            (event) => {
              streamEvents.push({ type: event.type, content: event.content, phase: event.phase });
            }
          ),
          30000, // 30 second timeout
          "VibeCoding Master Loop (Streaming)"
        );

        console.log(`[Mr. Blue] ===== VIBECODING EXECUTION COMPLETE =====`);
        console.log(`[Mr. Blue] Success: ${result.success}, Files Modified: ${result.filesModified?.length || 0}`);
        console.log(`[Mr. Blue] Duration: ${result.durationMs || 'unknown'}ms`);


        // Build conversational response from execution
        const phasesSummary = streamEvents
          .filter(e => e.type === "phase" || e.type === "thought" || e.type === "action")
          .map(e => `[${e.phase || e.type}] ${e.content}`)
          .join("\n");

        const responseContent = result.success
          ? `VibeCoding completed successfully.\n\n${phasesSummary}\n\nFiles modified: ${result.filesModified.length > 0 ? result.filesModified.join(", ") : "None"}\nFiles created: ${result.filesCreated.length > 0 ? result.filesCreated.join(", ") : "None"}\nTests: ${result.testsRun ? (result.testsPassed ? "Passed" : "Failed") : "Not run"}\nDuration: ${result.duration}ms`
          : `VibeCoding encountered an issue: ${result.error}`;

        return res.json({
          role: "assistant",
          content: responseContent,
          timestamp: new Date().toISOString(),
          vibeCoding: true,
          success: result.success,
          filesModified: result.filesModified,
          filesCreated: result.filesCreated,
          testsRun: result.testsRun,
          testsPassed: result.testsPassed,
          duration: result.duration,
          godLevelExecution: true,
          executionLog: streamEvents,
        });
      } catch (vibeError: any) {
        console.error("[Mr. Blue] VibeCoding error:", vibeError);
        console.error("[Mr. Blue] ===== VIBECODING EXECUTION FAILED =====");
        console.error("[Mr. Blue] Error:", vibeError);
        console.error("[Mr. Blue] Stack:", vibeError.stack);

        return res.json({
          role: "assistant",
          content: `I encountered an issue executing your request: ${vibeError.message}. Please try again with more specific instructions.`,
          timestamp: new Date().toISOString(),
          vibeCoding: true,
          success: false,
          error: vibeError.message,
        });
      }
    }

    // MB.MD Pattern 67: Check for feedback intent and save to queue
    const feedbackIntent = detectFeedbackIntent(message);
    if (
      feedbackIntent.isFeedback &&
      feedbackIntent.type &&
      feedbackIntent.confidence >= 0.6
    ) {
      try {
        // Create feedback record
        const feedbackId = await storage.createUserFeedback({
          userId,
          sessionId: sessionContext?.sessionId || `sess_${Date.now()}`,
          feedbackType: feedbackIntent.type,
          title: message.substring(0, 100),
          description: message,
          currentPage:
            sessionContext?.currentPage || context?.currentPage || "",
          sessionSnapshot: sessionContext || null,
          status: "pending",
          priority: feedbackIntent.type === "bug" ? "high" : "medium",
          mrBlueResponse: null,
          adminNotes: null,
        });

        console.log(
          `[Mr. Blue] Feedback captured: ${feedbackIntent.type} (ID: ${feedbackId})`,
        );

        // For high-priority bugs, return acknowledgment
        if (
          feedbackIntent.type === "bug" ||
          feedbackIntent.type === "complaint"
        ) {
          return res.json({
            role: "assistant",
            content: `I've logged your ${feedbackIntent.type === "bug" ? "bug report" : "feedback"} and sent it to our team for review. A member of our team will look into this shortly. Is there anything else I can help you with in the meantime?`,
            timestamp: new Date().toISOString(),
            feedbackCaptured: true,
            feedbackId,
            feedbackType: feedbackIntent.type,
          });
        }
      } catch (feedbackError) {
        console.error("[Mr. Blue] Error capturing feedback:", feedbackError);
        // Continue with normal response even if feedback capture fails
      }
    }

    // STEP 1: Check for Computer Use automation intent
    const automationIntent = detectComputerUseIntent(message);

    if (automationIntent.isAutomation && userRoleLevel >= 8) {
      console.log(
        `[Mr. Blue] Detected automation intent: ${automationIntent.type}`,
      );

      if (automationIntent.type === "wix_extraction") {
        try {
          // Check if Wix credentials are configured
          if (!process.env.WIX_EMAIL || !process.env.WIX_PASSWORD) {
            return res.json({
              role: "assistant",
              content:
                "I'd love to help extract your Wix contacts, but I need WIX_EMAIL and WIX_PASSWORD configured in environment variables first. Please ask an admin to set these up.",
              timestamp: new Date().toISOString(),
              contextUsed: true,
              automationType: "wix_extraction",
              automationStatus: "credentials_missing",
            });
          }

          const taskId = `wix_extract_${nanoid(10)}`;

          // Create task record
          await db.insert(computerUseTasks).values({
            taskId,
            instruction:
              "Extract all contacts from Wix (triggered by Mr. Blue chat)",
            status: "running",
            steps: [],
            currentStep: 0,
            maxSteps: 20,
            requiresApproval: false,
            automationType: "wix_extraction",
          });

          // Execute extraction in background
          (async () => {
            try {
              const result =
                await browserAutomationService.extractWixContacts(taskId);

              // Store screenshots
              if (result.screenshots && result.screenshots.length > 0) {
                for (const screenshot of result.screenshots) {
                  await db.insert(computerUseScreenshots).values({
                    taskId,
                    stepNumber: screenshot.step,
                    screenshotBase64: screenshot.base64,
                    action: { description: screenshot.action },
                  });
                }
              }

              // Update task with result
              await db
                .update(computerUseTasks)
                .set({
                  status: result.success ? "completed" : "failed",
                  currentStep: result.screenshots?.length || 0,
                  result: result.data,
                  error: result.error,
                  steps:
                    result.screenshots?.map((s) => ({
                      step: s.step,
                      action: s.action,
                    })) || [],
                })
                .where(eq(computerUseTasks.taskId, taskId));

              console.log(
                `[Mr. Blue] Wix extraction task ${taskId} completed:`,
                result.success ? "SUCCESS" : "FAILED",
              );
            } catch (error: any) {
              console.error(`[Mr. Blue] Wix extraction error:`, error);

              await db
                .update(computerUseTasks)
                .set({
                  status: "failed",
                  error: error.message,
                })
                .where(eq(computerUseTasks.taskId, taskId));
            }
          })();

          // Return immediate response
          return res.json({
            role: "assistant",
            content: `🚀 Starting Wix contact extraction!\n\nTask ID: ${taskId}\n\nI'm now:\n1. Logging into your Wix account\n2. Navigating to Contacts\n3. Exporting all contacts\n4. Downloading the CSV\n\nThis will take 2-3 minutes. I'll show you real-time screenshots as I go. You can check the status anytime in the Computer Use tab.\n\nPoll /api/computer-use/task/${taskId} for live updates!`,
            timestamp: new Date().toISOString(),
            contextUsed: true,
            automationType: "wix_extraction",
            automationStatus: "started",
            taskId,
            pollUrl: `/api/computer-use/task/${taskId}`,
          });
        } catch (error: any) {
          console.error("[Mr. Blue] Wix extraction error:", error);
          return res.json({
            role: "assistant",
            content: `❌ Failed to start Wix extraction: ${error.message}\n\nPlease try again or check the Computer Use tab for more details.`,
            timestamp: new Date().toISOString(),
            automationType: "wix_extraction",
            automationStatus: "error",
            error: error.message,
          });
        }
      } else if (automationIntent.type === "facebook_automation") {
        try {
          // Check if Facebook credentials are configured
          if (!process.env.FACEBOOK_EMAIL || !process.env.FACEBOOK_PASSWORD) {
            return res.json({
              role: "assistant",
              content:
                "I'd love to help with Facebook automation, but I need FACEBOOK_EMAIL and FACEBOOK_PASSWORD configured in environment variables first. Please ask an admin to set these up.",
              timestamp: new Date().toISOString(),
              contextUsed: true,
              automationType: "facebook_automation",
              automationStatus: "credentials_missing",
            });
          }

          // Extract recipient name from message using patterns
          const namePatterns = [
            /send.*(?:fb|facebook).*invit.*to\s+(.+?)(?:\.|$)/i,
            /invite\s+(.+?)\s+on\s+facebook/i,
            /(?:fb|facebook).*message.*to\s+(.+?)(?:\.|$)/i,
          ];

          let recipientName: string | null = null;
          for (const pattern of namePatterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
              recipientName = match[1].trim();
              break;
            }
          }

          if (!recipientName) {
            return res.json({
              role: "assistant",
              content: `I detected you want to send a Facebook invitation, but I couldn't determine the recipient name.

Please use one of these formats:
• "Send FB invitation to John Smith"
• "Invite Maria Garcia on Facebook"
• "Send Facebook message to Carlos Mendez"

What name would you like to send to?`,
              timestamp: new Date().toISOString(),
              automationType: "facebook_automation",
              automationStatus: "missing_recipient",
            });
          }

          // Check rate limit
          const rateLimit =
            await facebookMessengerService.checkRateLimit(userId);
          if (!rateLimit.canSend) {
            return res.json({
              role: "assistant",
              content: `⏱️ Facebook invitation rate limit reached!

**Current Status:**
• Daily limit: ${rateLimit.dailyCount}/5 sent
• Hourly limit: ${rateLimit.hourlyCount}/1 sent

You can send your next invitation at: ${rateLimit.nextAvailable?.toLocaleString()}

These limits help protect your Facebook account from being flagged for spam. Thank you for your patience! 🙏`,
              timestamp: new Date().toISOString(),
              automationType: "facebook_automation",
              automationStatus: "rate_limited",
              rateLimitInfo: rateLimit,
            });
          }

          const taskId = `fb_invite_${nanoid(10)}`;

          // Create task record
          await db.insert(computerUseTasks).values({
            taskId,
            userId,
            instruction: `Send Facebook invitation to ${recipientName} (triggered by Mr. Blue chat)`,
            status: "running",
            steps: [],
            currentStep: 0,
            maxSteps: 15,
            requiresApproval: false,
            automationType: "facebook_automation",
          });

          // Execute Facebook automation in background
          (async () => {
            try {
              const result = await facebookMessengerService.sendInvitation(
                taskId,
                userId,
                recipientName,
                "mundo_tango_invite",
              );

              // Store screenshots
              if (result.screenshots && result.screenshots.length > 0) {
                for (const screenshot of result.screenshots) {
                  await db.insert(computerUseScreenshots).values({
                    taskId,
                    stepNumber: screenshot.step,
                    screenshotBase64: screenshot.base64,
                    action: { description: screenshot.action },
                  });
                }
              }

              // Update task with result
              await db
                .update(computerUseTasks)
                .set({
                  status: result.success ? "completed" : "failed",
                  currentStep: result.screenshots?.length || 0,
                  result: {
                    success: result.success,
                    messagesSent: result.messagesSent,
                    recipientNames: result.recipientNames,
                  },
                  error: result.error,
                  steps:
                    result.screenshots?.map((s) => ({
                      step: s.step,
                      action: s.action,
                    })) || [],
                })
                .where(eq(computerUseTasks.taskId, taskId));

              console.log(
                `[Mr. Blue] Facebook automation task ${taskId} completed:`,
                result.success ? "SUCCESS" : "FAILED",
              );
            } catch (error: any) {
              console.error(`[Mr. Blue] Facebook automation error:`, error);

              await db
                .update(computerUseTasks)
                .set({
                  status: "failed",
                  error: error.message,
                })
                .where(eq(computerUseTasks.taskId, taskId));
            }
          })();

          // Return immediate response
          return res.json({
            role: "assistant",
            content: `🚀 Starting Facebook invitation to ${recipientName}!

Task ID: ${taskId}

**I'm now:**
1. 🔐 Logging into Facebook
2. 💬 Opening Messenger
3. 🔍 Searching for "${recipientName}"
4. ✉️ Sending personalized Mundo Tango invitation

**Rate Limits:**
• Daily: ${rateLimit.dailyCount + 1}/5
• Hourly: ${rateLimit.hourlyCount + 1}/1

This will take 1-2 minutes. I'll show you real-time screenshots as I go!

Poll /api/computer-use/task/${taskId} for live updates! 📸`,
            timestamp: new Date().toISOString(),
            contextUsed: true,
            automationType: "facebook_automation",
            automationStatus: "started",
            taskId,
            pollUrl: `/api/computer-use/task/${taskId}`,
            recipientName,
          });
        } catch (error: any) {
          console.error("[Mr. Blue] Facebook automation error:", error);
          return res.json({
            role: "assistant",
            content: `❌ Failed to start Facebook automation: ${error.message}\n\nPlease try again or check the Computer Use tab for more details.`,
            timestamp: new Date().toISOString(),
            automationType: "facebook_automation",
            automationStatus: "error",
            error: error.message,
          });
        }
      } else if (automationIntent.type === "info_request") {
        // User is asking ABOUT Computer Use capabilities
        return res.json({
          role: "assistant",
          content: `🤖 **Yes! I have access to Computer Use automation!**

I can control a real web browser to automate tasks for you. Here's what I can do:

**Available Automations:**

📦 **Wix Data Migration**
"Extract my Wix contacts" - I'll log into Wix, navigate to your contacts, and download them as CSV

💌 **Facebook Messenger Invitations** ✨ NEW!
"Send FB invitation to [name]" - I'll log into Facebook, search for the person, and send a personalized Mundo Tango invitation

**How It Works:**
1. You tell me what to automate (natural language)
2. I detect the intent and start the automation
3. You see real-time progress with screenshots
4. Task completes and you get the results

**Try It Now:**

*Wix Migration:*
• "Extract my Wix contacts"
• "Migrate my Wix data"
• "Get my Wix contact list"

*Facebook Invitations:*
• "Send FB invitation to John Smith"
• "Invite Maria Garcia on Facebook"
• "Send Facebook message to Carlos Mendez"

**Features:**
✅ Real-time progress updates
✅ Live browser screenshots
✅ Background execution (non-blocking)
✅ Secure (admin-only access)
✅ Rate limiting (5/day, 1/hour for FB)

Would you like to try one?`,
          timestamp: new Date().toISOString(),
          automationType: "info_request",
          automationStatus: "explained",
        });
      }
    }

    // Handle non-admin users asking about Computer Use
    if (automationIntent.isAutomation && userRoleLevel < 8) {
      return res.json({
        role: "assistant",
        content: `🔒 Computer Use automation is available, but requires admin access (role level 8+).

Your current role level: ${userRoleLevel}

Computer Use allows me to control a web browser to automate tasks like:
• Extracting data from websites
• Automating social media actions
• Migrating data between platforms

Please contact an administrator if you need access to this feature.`,
        timestamp: new Date().toISOString(),
        automationType: "info_request",
        automationStatus: "insufficient_permissions",
      });
    }

    // STEP 2: Build context-aware system message with real platform data
    let platformContext = "";
    let userContext = "";
    let godModeContext = "";

    try {
      platformContext = await mrBlueDataService.buildPlatformContext();
    } catch (err) {
      console.log("[Mr. Blue] Could not fetch platform context:", err);
    }

    // MB.MD Pattern 64: Add user-specific context (friends, RSVPs, cities, groups)
    try {
      userContext = await mrBlueDataService.buildUserContextString(userId);
      console.log("[Mr. Blue] User context loaded for userId:", userId);
    } catch (err) {
      console.log("[Mr. Blue] Could not fetch user context:", err);
    }

    // MB.MD Pattern 65: Add god mode context for admin/CTO users (roleLevel >= 8)
    const isGodMode = userRoleLevel >= 8;
    if (isGodMode) {
      try {
        godModeContext = await mrBlueDataService.buildGodModeContext();
        console.log("[Mr. Blue] God mode activated for admin user");
      } catch (err) {
        console.log("[Mr. Blue] Could not fetch god mode context:", err);
      }
    }

    let systemMessage = `You are Mr. Blue, the friendly and knowledgeable AI assistant for Mundo Tango - a global social platform connecting the tango dance community.

PERSONALITY:
- Warm, welcoming, and passionate about tango
- Concise but helpful responses (2-4 sentences unless more detail is requested)
- Uses relevant tango terminology naturally
- Can help with events, cities, travel tips, connecting with dancers, and platform navigation

${platformContext}
${userContext}
${godModeContext}
${sessionContextStr}`;

    if (context) {
      const { currentPage, pageTitle, breadcrumbs, userIntent } = context;

      if (currentPage) {
        systemMessage += `\n\nUser's Current Page: ${currentPage}`;
      }
      if (pageTitle) {
        systemMessage += `\nPage Title: ${pageTitle}`;
      }
      if (userIntent) {
        systemMessage += `\nUser Intent: ${userIntent}`;
      }
      if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
        systemMessage += "\n\nRecent Actions:";
        breadcrumbs.slice(-3).forEach((b: any) => {
          systemMessage += `\n- ${b.action} on ${b.page}`;
        });
      }
    }

    systemMessage += `\n\nRespond naturally to the user's question. If they ask about events, cities, or the platform, use the real data above. Be helpful, concise, and engaging.`;

    // STEP 3: Generate AI response using Groq
    let responseContent = "";

    try {
      const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY || "",
        baseURL: process.env.GROQ_BASE_URL || undefined,
      });

      const queryIntent = mrBlueDataService.detectQueryIntent(message);

      // Add relevant data to context based on query intent
      if (queryIntent.type === "events" && queryIntent.location) {
        const cityEvents = await mrBlueDataService.getEventsInCity(
          queryIntent.location,
          5,
        );
        if (cityEvents.length > 0) {
          systemMessage += `\n\nEVENTS IN ${queryIntent.location.toUpperCase()}:\n`;
          cityEvents.forEach((e) => {
            const date = e.startDate
              ? new Date(e.startDate).toLocaleDateString()
              : "TBD";
            systemMessage += `- ${e.title} (${e.eventType || "Event"}) on ${date}\n`;
          });
        }
      } else if (queryIntent.type === "cities") {
        const cities = await mrBlueDataService.getPopularCities(8);
        if (cities.length > 0) {
          systemMessage += `\n\nTOP TANGO CITIES:\n`;
          cities.forEach((c) => {
            systemMessage += `- ${c.name}, ${c.country || ""}\n`;
          });
        }
      }

      const aiResponse = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      responseContent =
        aiResponse.choices[0]?.message?.content ||
        "I'm here to help with your tango journey! What would you like to know about events, cities, or connecting with the tango community?";

      console.log("[Mr. Blue] AI response generated successfully");
    } catch (aiError: any) {
      console.error(
        "[Mr. Blue] AI generation error, falling back to context-aware response:",
        aiError.message,
      );

      // Fallback to smart template response if AI fails
      if (context?.currentPage?.includes("/feed")) {
        responseContent = `Welcome to the Feed! Share your tango moments, connect with dancers, and discover what's happening in the community. What would you like to do?`;
      } else if (context?.currentPage?.includes("/events")) {
        responseContent = `Looking for tango events? I can help you find milongas, festivals, and workshops. What type of event are you interested in?`;
      } else if (context?.currentPage?.includes("/city")) {
        responseContent = `Exploring a tango city! Each city page shows local events, venues, teachers, and community members. What would you like to know?`;
      } else {
        responseContent = `I'm Mr. Blue, your tango community guide! I can help you find events, explore cities, or connect with dancers. How can I assist you today?`;
      }
    }

    const response = {
      role: "assistant",
      content: responseContent,
      timestamp: new Date().toISOString(),
      contextUsed: !!context,
      audioUrl: null as string | null,
      characterCount: responseContent.length,
    };

    // If voice is enabled, convert response to speech using ElevenLabs
    if (voiceEnabled) {
      try {
        console.log("[Mr. Blue] Generating TTS with ElevenLabs...");
        const voiceId = selectedVoiceId || "21m00Tcm4TlvDq8ikWAM"; // Default: Rachel

        const voiceResult = await elevenlabsService.textToSpeech(
          responseContent,
          voiceId,
          userId,
        );

        response.audioUrl = voiceResult.audioUrl;
        response.characterCount = voiceResult.characterCount;

        console.log(
          `[Mr. Blue] TTS generated: ${voiceResult.characterCount} characters`,
        );
      } catch (error: any) {
        console.error("[Mr. Blue] TTS error:", error);
        // Graceful fallback - return text-only response if TTS fails
        console.log("[Mr. Blue] Continuing with text-only response");
      }
    }

    res.json(response);
  } catch (error: any) {
    console.error("[Mr. Blue Chat] Error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

// ============================================================================
// MB.MD Pattern 65: Mr Blue Conversation Management
// Store and retrieve conversation history for each user
// ============================================================================

interface MrBlueMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolExecuted?: string;
  toolSuccess?: boolean;
}

interface MrBlueConversation {
  id: string;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: MrBlueMessage[];
}

// In-memory conversation store (per user)
const conversationStore = new Map<number, MrBlueConversation[]>();

/**
 * GET /api/mrblue/conversations
 * List all conversations for the current user
 */
router.get("/api/mrblue/conversations", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const conversations = conversationStore.get(userId) || [];
    
    // Return conversations without full message content for listing
    const conversationList = conversations.map(c => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messageCount: c.messages.length,
      lastMessage: c.messages.length > 0 ? c.messages[c.messages.length - 1].content.substring(0, 100) : null,
    }));

    res.json(conversationList);
  } catch (error: any) {
    console.error("[Mr. Blue Conversations] List error:", error);
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

/**
 * POST /api/mrblue/conversations
 * Create a new conversation
 */
router.post("/api/mrblue/conversations", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title } = req.body;
    const now = new Date().toISOString();
    
    const newConversation: MrBlueConversation = {
      id: nanoid(),
      userId,
      title: title || `Conversation ${new Date().toLocaleDateString()}`,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    const userConversations = conversationStore.get(userId) || [];
    userConversations.unshift(newConversation);
    conversationStore.set(userId, userConversations);

    res.json({
      id: newConversation.id,
      title: newConversation.title,
      createdAt: newConversation.createdAt,
    });
  } catch (error: any) {
    console.error("[Mr. Blue Conversations] Create error:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

/**
 * GET /api/mrblue/conversations/:conversationId/messages
 * Get messages for a specific conversation
 */
router.get("/api/mrblue/conversations/:conversationId/messages", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { conversationId } = req.params;
    const userConversations = conversationStore.get(userId) || [];
    const conversation = userConversations.find(c => c.id === conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json({
      conversationId: conversation.id,
      title: conversation.title,
      messages: conversation.messages,
    });
  } catch (error: any) {
    console.error("[Mr. Blue Conversations] Get messages error:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

/**
 * DELETE /api/mrblue/conversations/:conversationId
 * Delete a conversation
 */
router.delete("/api/mrblue/conversations/:conversationId", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { conversationId } = req.params;
    const userConversations = conversationStore.get(userId) || [];
    const index = userConversations.findIndex(c => c.id === conversationId);

    if (index === -1) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    userConversations.splice(index, 1);
    conversationStore.set(userId, userConversations);

    res.json({ success: true, message: "Conversation deleted" });
  } catch (error: any) {
    console.error("[Mr. Blue Conversations] Delete error:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

/**
 * Enhanced chat endpoint with automatic error detection and legal intelligence
 */
router.post(
  "/api/mr-blue/chat-enhanced",
  authenticateToken,
  async (req, res) => {
    try {
      const { message, errorContext, currentPage } = enhancedChatSchema.parse(
        req.body,
      );

      // Step 1: Check for legal queries (Agents #185-186)
      const legalQuery = detectLegalQuery(message);

      if (legalQuery.isLegal) {
        const legalResponse = await handleLegalQuery(
          message,
          legalQuery.queryType,
          (req as any).user?.id,
        );

        return res.json({
          success: true,
          response: legalResponse,
          queryType: "legal",
          legalAgentUsed: legalQuery.agent,
        });
      }

      // Step 2: Check if user is reporting an error
      const isErrorReport = detectErrorInMessage(message, errorContext);

      if (isErrorReport) {
        // Step 3: Search knowledge base for matching issues
        const matchingIssues = findMatchingIssues(
          message + " " + (errorContext?.errorMessage || ""),
        );

        if (matchingIssues.length > 0) {
          // Step 4: Prioritize critical issues
          const criticalMatch = matchingIssues.find(
            (i) => i.severity === "critical",
          );
          const topMatch = criticalMatch || matchingIssues[0];

          // Step 5: Provide solution
          const response = formatTroubleshootingSolution(
            topMatch,
            matchingIssues.length,
          );

          return res.json({
            success: true,
            response,
            issueDetected: true,
            issueId: topMatch.id,
            severity: topMatch.severity,
            relatedIssues: matchingIssues.slice(0, 3).map((i) => ({
              id: i.id,
              title: i.title,
              category: i.category,
            })),
          });
        }
      }

      // Step 6: If no error detected, proceed with normal conversation
      return res.json({
        success: true,
        response:
          "I can help you with development tasks and legal document analysis. What would you like to do?",
        issueDetected: false,
      });
    } catch (error: any) {
      console.error("[Mr. Blue Enhanced] Error:", error);
      res.status(500).json({
        message: "Failed to process chat",
        error: error.message,
      });
    }
  },
);

/**
 * Get all critical issues for proactive monitoring
 */
router.get("/api/mr-blue/critical-issues", authenticateToken, (req, res) => {
  const criticalIssues = getCriticalIssues();
  res.json({ issues: criticalIssues });
});

/**
 * Search knowledge base
 */
router.post("/api/mr-blue/search-kb", authenticateToken, (req, res) => {
  const { query } = req.body;
  const results = findMatchingIssues(query);
  res.json({ results });
});

/**
 * Get issue by ID
 */
router.get("/api/mr-blue/issue/:id", authenticateToken, (req, res) => {
  const issue = getSolution(req.params.id);
  if (issue) {
    res.json({ issue });
  } else {
    res.status(404).json({ message: "Issue not found" });
  }
});

/**
 * Detect if message contains error report
 */
function detectErrorInMessage(message: string, errorContext?: any): boolean {
  const lowerMessage = message.toLowerCase();

  // Error keywords
  const errorKeywords = [
    "error",
    "crash",
    "broken",
    "not working",
    "failed",
    "failure",
    "bug",
    "issue",
    "problem",
    "help",
    "fix",
    "undefined",
    "null",
    "cannot",
    "unable",
    "doesn't work",
    "won't load",
    "stuck",
  ];

  // Check for error keywords
  const hasErrorKeyword = errorKeywords.some((keyword) =>
    lowerMessage.includes(keyword),
  );

  // Check if error context provided
  const hasErrorContext = !!(
    errorContext?.errorMessage || errorContext?.stackTrace
  );

  return hasErrorKeyword || hasErrorContext;
}

/**
 * Format troubleshooting solution for user-friendly display
 */
function formatTroubleshootingSolution(
  issue: TroubleshootingIssue,
  totalMatches: number,
): string {
  return `
🔍 **Issue Detected: ${issue.title}**

**Severity:** ${issue.severity.toUpperCase()} ${issue.severity === "critical" ? "🚨" : issue.severity === "high" ? "⚠️" : "ℹ️"}

**What's Happening:**
${issue.rootCause}

**How to Fix It:**
${issue.solution}

**Prevention Tips:**
${issue.prevention}

${totalMatches > 1 ? `\n💡 I found ${totalMatches} related issues. Use the search to explore more.` : ""}

**Need More Help?**
I can walk you through the fix step-by-step, or you can ask me to clarify any part of the solution.
  `.trim();
}

/**
 * Detect if message is a legal query (Agents #185-186)
 */
function detectLegalQuery(message: string): {
  isLegal: boolean;
  queryType?: string;
  agent?: string;
} {
  const lowerMessage = message.toLowerCase();

  // Legal query keywords
  const reviewKeywords = [
    "review",
    "analyze",
    "check",
    "evaluate",
    "assess",
    "risk",
    "compliance",
  ];
  const contractKeywords = [
    "contract",
    "clause",
    "waiver",
    "agreement",
    "template",
    "document",
  ];
  const complianceKeywords = [
    "esign",
    "ueta",
    "gdpr",
    "ccpa",
    "compliant",
    "compliance",
    "legal",
  ];
  const assistKeywords = [
    "suggest",
    "recommend",
    "auto-fill",
    "fill",
    "compare",
    "missing",
  ];

  const hasReviewKeyword = reviewKeywords.some((k) => lowerMessage.includes(k));
  const hasContractKeyword = contractKeywords.some((k) =>
    lowerMessage.includes(k),
  );
  const hasComplianceKeyword = complianceKeywords.some((k) =>
    lowerMessage.includes(k),
  );
  const hasAssistKeyword = assistKeywords.some((k) => lowerMessage.includes(k));

  // Document Review Agent (#185)
  if ((hasReviewKeyword || hasComplianceKeyword) && hasContractKeyword) {
    return {
      isLegal: true,
      queryType: "review",
      agent: "document-reviewer",
    };
  }

  // Contract Assistant (#186)
  if (hasAssistKeyword && hasContractKeyword) {
    return {
      isLegal: true,
      queryType: "assist",
      agent: "contract-assistant",
    };
  }

  // Compliance check
  if (hasComplianceKeyword) {
    return {
      isLegal: true,
      queryType: "compliance",
      agent: "document-reviewer",
    };
  }

  return { isLegal: false };
}

/**
 * Handle legal queries with appropriate agent
 */
async function handleLegalQuery(
  message: string,
  queryType?: string,
  userId?: number,
): Promise<string> {
  try {
    const lowerMessage = message.toLowerCase();

    // Review queries
    if (queryType === "review") {
      return `🔍 **Legal Document Review (Agent #185)**

I can help you review legal documents for:
- **Clause Analysis**: Identify missing or incomplete clauses
- **Risk Assessment**: Evaluate one-sided terms and liability exposure
- **Compliance Checking**: Verify ESIGN, UETA, GDPR, CCPA compliance
- **Plain Language**: Simplify legal jargon

**To review a document:**
1. Use the API: POST /api/legal/agents/review-document
2. Provide document content or document ID
3. Get comprehensive analysis with risk scores

**Example questions I can answer:**
- "Review this waiver for risks"
- "Is this document ESIGN compliant?"
- "What clauses am I missing in this contract?"

Would you like me to review a specific document?`;
    }

    // Assistance queries
    if (queryType === "assist") {
      return `🤝 **Smart Contract Assistant (Agent #186)**

I can help you with:
- **Clause Recommendations**: Context-aware suggestions for your document type
- **Auto-Fill**: Intelligently fill {{variables}} with user/event data
- **Template Comparison**: Compare two contract templates side-by-side
- **Negotiation Advice**: Identify negotiable terms and suggest compromises
- **Workflow Optimization**: Optimize signature workflows (sequential/parallel)

**Available APIs:**
- POST /api/legal/agents/assist-contract - Get clause recommendations
- POST /api/legal/agents/suggest-clauses - Suggest specific clauses
- POST /api/legal/agents/auto-fill - Auto-fill document variables
- POST /api/legal/agents/compare-documents - Compare templates

**Example requests:**
- "Suggest clauses for an event waiver"
- "Auto-fill this contract with participant data"
- "Compare template A vs template B"

What would you like help with?`;
    }

    // Compliance queries
    if (queryType === "compliance") {
      return `✅ **Compliance Verification**

I can check your documents for compliance with:
- **ESIGN Act** (US Electronic Signatures)
- **UETA** (Uniform Electronic Transactions Act)
- **GDPR** (EU Data Privacy)
- **CCPA** (California Consumer Privacy Act)
- **Jurisdiction-specific** requirements

**To check compliance:**
Use POST /api/legal/agents/check-compliance with your document

**I'll provide:**
- Compliance score (0-100)
- Specific issues found
- Recommendations for compliance
- Jurisdiction-specific guidance

Would you like me to check a document's compliance?`;
    }

    // General legal help
    return `⚖️ **Legal Document AI Agents**

I have two specialized legal AI agents:

**Agent #185: Document Review Agent**
- Analyzes legal documents for completeness
- Checks compliance (ESIGN, UETA, GDPR, CCPA)
- Assesses risk factors
- Suggests plain language alternatives

**Agent #186: Smart Contract Assistant**
- Recommends appropriate clauses
- Auto-fills contract variables
- Provides negotiation advice
- Compares contract templates
- Optimizes signature workflows

**Available Templates:**
1. Event Liability Waiver
2. Teacher Employment Contract
3. Venue Rental Agreement
4. Participant Release Form
5. IP Agreement
6. Photo/Video Release
7. Music Licensing Agreement

**How to use:**
- "Review this waiver" → Document review
- "Suggest clauses for teacher contract" → Clause recommendations
- "Check ESIGN compliance" → Compliance verification
- "Compare these templates" → Template comparison

What legal task can I help you with?`;
  } catch (error) {
    console.error("[Legal Query Handler] Error:", error);
    return "I encountered an error processing your legal query. Please try using the legal agent APIs directly.";
  }
}

export default router;
