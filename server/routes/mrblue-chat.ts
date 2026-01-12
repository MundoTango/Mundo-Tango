/**
 * MR. BLUE CHAT ROUTES - MB.MD Pattern 67 + Pattern 99
 * Universal Bug Diagnostic System with Multi-AI Orchestration
 * 
 * AI Platform Routing:
 * - Regular Chat → UnifiedAIOrchestrator (Groq→Gemini→OpenRouter for speed, Claude for reasoning)
 * - VibeCoding Mode → OpenAI GPT-4o (required for function calling/tools)
 * 
 * This hybrid approach uses the right AI platform for each task:
 * - Groq (Llama 3.3): Fast, FREE - classification, simple Q&A
 * - Claude (Anthropic): Best reasoning - complex analysis
 * - GPT-4o (OpenAI): Reliable - code generation, function calling
 * - Gemini: Cheapest - bulk operations
 */

import { Router, type Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import OpenAI from "openai";
import { smartRoute, collaborativeAnalysis } from "../services/ai/UnifiedAIOrchestrator";
import {
  getUserStats,
  getUsersNeedingOnboarding,
  queryDatabase,
  readFile,
  writeFile,
  grepFiles,
  getProjectStructure,
  getSecurityAuditLogs,
  getProjectContext,
  formatToolResponse,
} from "../services/mrBlue/VibeCodingToolService";

const router = Router();
const openai = new OpenAI();

const MRBLUE_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getUserStats",
      description: "Get statistics about users: total count, onboarded count, not onboarded count. Use this to diagnose user registration and onboarding issues.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "getUsersNeedingOnboarding",
      description: "Get a list of users who registered but haven't completed onboarding. Returns email, name, role, tangoRoles, and registration date.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Maximum number of users to return (default 20)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "queryDatabase",
      description: "Execute a safe SELECT query on the database. Only SELECT queries are allowed. Use this to investigate data issues.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The SELECT SQL query to execute" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "readFile",
      description: "Read the contents of a project file. Use this to examine code and configuration.",
      parameters: {
        type: "object",
        properties: {
          filePath: { type: "string", description: "Path to the file relative to project root" },
        },
        required: ["filePath"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "writeFile",
      description: "Write content to a project file. Use this to fix code issues.",
      parameters: {
        type: "object",
        properties: {
          filePath: { type: "string", description: "Path to the file relative to project root" },
          content: { type: "string", description: "The content to write to the file" },
        },
        required: ["filePath", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "grepFiles",
      description: "Search for a term in the codebase. Returns matching files and line numbers.",
      parameters: {
        type: "object",
        properties: {
          searchTerm: { type: "string", description: "The term to search for" },
          directory: { type: "string", description: "Directory to search in (default: .)" },
        },
        required: ["searchTerm"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProjectStructure",
      description: "Get an overview of the project structure including source files, dependencies, and scripts.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "getSecurityAuditLogs",
      description: "Get security audit logs to investigate user actions like login attempts, password changes, failed logins. Use this to see what a specific user tried to do.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "number", description: "Optional user ID to filter logs" },
          action: { type: "string", description: "Optional action type: login, logout, password_change, password_reset_request, password_reset_complete, failed_login" },
          limit: { type: "number", description: "Max logs to return (default 50)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProjectContext",
      description: "Get full project context including replit.md documentation and database schema. Use this first to understand the codebase like Replit Agent does.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

async function executeTool(name: string, args: Record<string, any>): Promise<any> {
  console.log(`[MrBlue] Executing tool: ${name}`, args);
  
  switch (name) {
    case "getUserStats":
      return await getUserStats();
    case "getUsersNeedingOnboarding":
      return await getUsersNeedingOnboarding(args.limit || 20);
    case "queryDatabase":
      return await queryDatabase(args.query);
    case "readFile":
      return await readFile(args.filePath);
    case "writeFile":
      return await writeFile(args.filePath, args.content);
    case "grepFiles":
      return await grepFiles(args.searchTerm, args.directory || ".");
    case "getProjectStructure":
      return await getProjectStructure();
    case "getSecurityAuditLogs":
      return await getSecurityAuditLogs(args.userId, args.action, args.limit || 50);
    case "getProjectContext":
      return await getProjectContext();
    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}

router.get("/diagnostics/user-stats", authenticateToken, async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  const isGodLevel = user?.role === "admin" || user?.tier >= 8;
  if (!isGodLevel) {
    return res.status(403).json({ error: "God-level access required" });
  }

  try {
    const stats = await getUserStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/diagnostics/users-needing-onboarding", authenticateToken, async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  const isGodLevel = user?.role === "admin" || user?.tier >= 8;
  if (!isGodLevel) {
    return res.status(403).json({ error: "God-level access required" });
  }

  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await getUsersNeedingOnboarding(limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/chat", authenticateToken, async (req: Request, res: Response) => {
  const { message, systemPrompt, mode } = req.body;
  const user = (req as any).user;
  
  console.log("[MrBlue Chat] Received request:", { 
    message: message?.substring(0, 100), 
    mode,
    userId: user?.id,
  });

  try {
    const isVibeCodingMode = mode === "vibe-coding" || mode === "vibecoding";
    const isGodLevel = user?.role === "admin" || user?.tier >= 8;
    
    // ============================================================================
    // REGULAR CHAT MODE - Use Multi-AI Orchestration (Groq→Claude→Gemini)
    // Routes to best AI based on task type for speed and cost optimization
    // ============================================================================
    if (!isVibeCodingMode || !isGodLevel) {
      console.log("[MrBlue Chat] Using Multi-AI Orchestrator (smartRoute)");
      
      const mrBlueSystemPrompt = systemPrompt || `You are Mr. Blue, an AI assistant for Mundo Tango - a social platform for the global tango community. Be helpful, concise, and action-oriented.`;
      
      try {
        const aiResponse = await smartRoute({
          query: message,
          useCase: 'chat',
          priority: 'speed',
          systemPrompt: mrBlueSystemPrompt,
          temperature: 0.7,
          maxTokens: 1500,
        });
        
        console.log(`[MrBlue Chat] Multi-AI response from ${aiResponse.platform}/${aiResponse.model} | $${aiResponse.cost.toFixed(6)} | ${aiResponse.latency}ms`);
        
        return res.json({
          message: aiResponse.content,
          metadata: {
            platform: aiResponse.platform,
            model: aiResponse.model,
            cost: aiResponse.cost,
            latency: aiResponse.latency,
            cached: aiResponse.cached || false,
          },
        });
      } catch (orchestratorError: any) {
        console.warn("[MrBlue Chat] Multi-AI Orchestrator failed, falling back to OpenAI:", orchestratorError.message);
      }
    }
    
    // ============================================================================
    // VIBE CODING MODE - Use OpenAI GPT-4o (Required for Function Calling/Tools)
    // Only OpenAI supports the function calling API needed for autonomous actions
    // ============================================================================
    console.log("[MrBlue Chat] Using OpenAI GPT-4o for VibeCoding with tools");
    
    const baseSystemPrompt = systemPrompt || `You are Mr. Blue, an AI assistant for Mundo Tango - a social platform for the global tango community.

${isVibeCodingMode && isGodLevel ? `
VIBE CODING MODE ACTIVE - You have full codebase awareness like Replit Agent.

AVAILABLE TOOLS:
- getProjectContext: START HERE - Get replit.md docs and database schema for full codebase understanding
- getSecurityAuditLogs: Investigate what users tried to do (login, password changes, failed attempts)
- getUserStats: Get user statistics (total, onboarded, not onboarded)
- getUsersNeedingOnboarding: Get list of users who haven't completed onboarding
- queryDatabase: Execute safe SELECT queries to investigate data
- readFile: Read project files to examine code
- writeFile: Write/modify project files to fix issues
- grepFiles: Search the codebase for code patterns
- getProjectStructure: Get project overview

METHODOLOGY (MB.MD v9.9.4):
1. Research → Use getProjectContext first to understand the codebase
2. Plan → Identify what needs to change
3. Build → Use readFile then writeFile to make changes
4. Test → Verify changes work
5. Fix → Handle any errors

When asked to diagnose or fix issues, use these tools proactively. Don't just explain - take action.
You have autonomous capabilities - investigate, decide, act, validate, adapt.
` : ''}

Be helpful, concise, and action-oriented.`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: baseSystemPrompt },
      { role: "user", content: message },
    ];

    let response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      tools: isVibeCodingMode && isGodLevel ? MRBLUE_TOOLS : undefined,
      tool_choice: isVibeCodingMode && isGodLevel ? "auto" : undefined,
    });

    let assistantMessage = response.choices[0].message;
    const toolResults: { tool: string; result: any }[] = [];
    let iterations = 0;
    const MAX_ITERATIONS = 3;

    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0 && iterations < MAX_ITERATIONS) {
      iterations++;
      console.log(`[MrBlue] Processing tool calls (iteration ${iterations}/${MAX_ITERATIONS}):`, assistantMessage.tool_calls.length);
      
      messages.push(assistantMessage);

      for (const toolCall of assistantMessage.tool_calls) {
        const tc = toolCall as any;
        const toolName = tc.function.name;
        const toolArgs = JSON.parse(tc.function.arguments || "{}");
        
        const result = await executeTool(toolName, toolArgs);
        toolResults.push({ tool: toolName, result });
        
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        tools: MRBLUE_TOOLS,
        tool_choice: iterations >= MAX_ITERATIONS - 1 ? "none" : "auto",
      });

      assistantMessage = response.choices[0].message;
    }

    const reply = assistantMessage.content || "";
    
    const formattedToolResults = toolResults.map(tr => ({
      tool: tr.tool,
      html: formatToolResponse(tr.tool, tr.result),
    }));

    console.log("[MrBlue Chat] Success, tools used:", toolResults.map(t => t.tool));
    
    res.json({ 
      message: reply,
      toolsUsed: toolResults.length > 0 ? formattedToolResults : undefined,
    });
  } catch (error: any) {
    console.error("[MrBlue Chat] Error:", error);
    res.status(500).json({ error: "Failed to communicate with AI", details: error.message });
  }
});

export default router;
