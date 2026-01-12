/**
 * MR. BLUE CHAT ROUTES - MB.MD Pattern 67
 * Universal Bug Diagnostic System with Function Calling
 * 
 * Now supports OpenAI function calling for autonomous actions
 */

import { Router, type Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import OpenAI from "openai";
import {
  getUserStats,
  getUsersNeedingOnboarding,
  queryDatabase,
  readFile,
  writeFile,
  grepFiles,
  getProjectStructure,
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
    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}

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
    
    const baseSystemPrompt = systemPrompt || `You are Mr. Blue, an AI assistant for Mundo Tango - a social platform for the global tango community.

${isVibeCodingMode && isGodLevel ? `
VIBE CODING MODE ACTIVE - You have access to powerful tools:
- getUserStats: Get user statistics (total, onboarded, not onboarded)
- getUsersNeedingOnboarding: Get list of users who haven't completed onboarding
- queryDatabase: Execute safe SELECT queries to investigate data
- readFile: Read project files to examine code
- writeFile: Write/modify project files to fix issues
- grepFiles: Search the codebase for code patterns
- getProjectStructure: Get project overview

When asked to diagnose or fix issues, use these tools proactively. Don't just explain - take action.
If you need to query user data, use getUserStats or getUsersNeedingOnboarding instead of queryDatabase when possible.
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
      tools: isVibeCodingMode && isGodLevel ? MRBLUE_TOOLS : undefined,
      tool_choice: isVibeCodingMode && isGodLevel ? "auto" : undefined,
    });

    let assistantMessage = response.choices[0].message;
    const toolResults: { tool: string; result: any }[] = [];

    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log("[MrBlue] Processing tool calls:", assistantMessage.tool_calls.length);
      
      messages.push(assistantMessage);

      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments || "{}");
        
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
        tools: MRBLUE_TOOLS,
        tool_choice: "auto",
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
