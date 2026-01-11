import { Router, type Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import OpenAI from "openai";
import * as VibeCodingTools from "../services/mrBlue/VibeCodingToolService";
import { isGodLevelUser } from "../services/mrBlue/TaskExecutorService";
import { agenticExecutor, ExecutionStep } from "../services/mrBlue/AgenticExecutor";

const router = Router();
const openai = new OpenAI();

// Track active SSE streams for cleanup
const activeVibeStreams = new Map<string, { res: Response; aborted: boolean }>();

// Detect if message requires autonomous agentic work (not just a single tool)
function isAgenticTask(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  const patterns = [
    /\b(fix|repair|patch|debug|solve)\b.*\b(bug|error|issue|problem)\b/i,
    /\b(implement|add|create|build)\b.*\b(feature|functionality|system)\b/i,
    /\b(refactor|improve|optimize|enhance)\b/i,
    /\b(investigate|analyze|diagnose)\b.*\b(and|then)\b.*\b(fix|solve|implement)\b/i,
    /\bwork on\b/i,
    /\bdo it\b/i,
    /\bfix it\b/i,
    /\bhandle this\b/i,
  ];
  return patterns.some(p => p.test(lowerMessage));
}

// MB.MD Pattern 65: Tool intent detection for god-level VibeCoding
// IMPORTANT: Use lowerMessage for pattern detection but ORIGINAL message for extracting paths
function detectToolIntent(message: string): { hasTool: boolean; tool: string | null; args: Record<string, any>; confidence: number } {
  const lowerMessage = message.toLowerCase().trim();
  const originalMessage = message.trim();
  
  // Git status patterns
  if (lowerMessage.includes("git status") || lowerMessage.includes("show git") || lowerMessage.includes("repo status")) {
    return { hasTool: true, tool: "getGitStatus", args: {}, confidence: 0.95 };
  }
  
  // List directory patterns - match on ORIGINAL to preserve path case
  const listDirMatch = originalMessage.match(/list\s+(?:directory|dir|files|folder)\s+([^\s]+)/i) ||
                       originalMessage.match(/ls\s+([^\s]+)/i) ||
                       originalMessage.match(/show\s+files\s+in\s+([^\s]+)/i);
  if (listDirMatch) {
    return { hasTool: true, tool: "listDirectory", args: { path: listDirMatch[1] }, confidence: 0.9 };
  }
  if (lowerMessage === "list files" || lowerMessage === "ls" || lowerMessage === "show files") {
    return { hasTool: true, tool: "listDirectory", args: { path: "." }, confidence: 0.85 };
  }
  
  // Read file patterns - match on ORIGINAL to preserve path case
  const readMatch = originalMessage.match(/read\s+(?:file\s+)?([^\s]+)/i) ||
                    originalMessage.match(/show\s+(?:contents?\s+of\s+)?([^\s]+\.(?:ts|tsx|js|jsx|json|md|css|html))/i) ||
                    originalMessage.match(/cat\s+([^\s]+)/i);
  if (readMatch) {
    return { hasTool: true, tool: "readFile", args: { path: readMatch[1] }, confidence: 0.9 };
  }
  
  // Grep/search patterns - match on ORIGINAL to preserve path case, but pattern can be from lower
  const grepMatch = originalMessage.match(/(?:grep|search|find)\s+["']?([^"']+)["']?\s+(?:in\s+)?([^\s]+)?/i);
  if (grepMatch) {
    return { hasTool: true, tool: "grepFiles", args: { pattern: grepMatch[1], path: grepMatch[2] || "." }, confidence: 0.85 };
  }
  
  // Write file patterns - format: write file <path> ```content```
  const writeMatch = originalMessage.match(/write\s+(?:file\s+)?([^\s`]+)\s+```([\s\S]+?)```/i);
  if (writeMatch) {
    return { hasTool: true, tool: "writeFile", args: { path: writeMatch[1], content: writeMatch[2] }, confidence: 0.95 };
  }
  
  // Edit file patterns - format: edit <path> replace "old" with "new"
  const editMatch = originalMessage.match(/edit\s+([^\s]+)\s+replace\s+["'](.+?)["']\s+with\s+["'](.+?)["']/is);
  if (editMatch) {
    return { hasTool: true, tool: "editFile", args: { path: editMatch[1], oldText: editMatch[2], newText: editMatch[3] }, confidence: 0.95 };
  }
  
  // Fix/execute patterns
  if (lowerMessage.includes("fix this") || lowerMessage.includes("apply the fix") || 
      lowerMessage.includes("make the change") || lowerMessage.includes("execute") ||
      lowerMessage.includes("fix it now") || lowerMessage.includes("do it now")) {
    return { hasTool: true, tool: "agenticExecute", args: { instruction: message }, confidence: 0.8 };
  }
  
  // Bug/ticket management patterns - triggers AgenticExecutor with updateBugStatus tool
  const ticketMatch = originalMessage.match(/(?:update|resolve|close|mark)\s+(?:ticket|bug|feedback|issue)\s*#?(\d+)/i);
  if (ticketMatch || lowerMessage.includes("update ticket") || lowerMessage.includes("resolve bug") ||
      lowerMessage.includes("mark as resolved") || lowerMessage.includes("notify the user") ||
      lowerMessage.includes("fixed the bug") || lowerMessage.includes("completed the fix")) {
    const bugId = ticketMatch ? parseInt(ticketMatch[1]) : undefined;
    return { hasTool: true, tool: "agenticExecute", args: { instruction: message, bugId }, confidence: 0.85 };
  }
  
  // MB.MD Pattern 67: Database query patterns
  const dbQueryMatch = originalMessage.match(/(?:query|select|show|check|get)\s+(?:database|db|events?|series|scraped)/i) ||
                       originalMessage.match(/sql\s+(.+)/i);
  if (dbQueryMatch || lowerMessage.includes("query database") || lowerMessage.includes("show events") ||
      lowerMessage.includes("check scraped") || lowerMessage.includes("event series")) {
    return { hasTool: true, tool: "queryDatabase", args: { query: message }, confidence: 0.85 };
  }
  
  // MB.MD: Scraper status patterns
  if (lowerMessage.includes("scraper status") || lowerMessage.includes("scraping status") ||
      lowerMessage.includes("last scrape") || lowerMessage.includes("when did scraper")) {
    return { hasTool: true, tool: "getScraperStatus", args: {}, confidence: 0.9 };
  }
  
  // MB.MD: Branch creation patterns (triggered on "let's fix it")
  if (lowerMessage.includes("let's fix") || lowerMessage.includes("lets fix") ||
      lowerMessage.includes("create branch") || lowerMessage.includes("new branch for")) {
    const branchName = `fix/bug-${Date.now()}`;
    return { hasTool: true, tool: "createBranch", args: { branchName }, confidence: 0.9 };
  }
  
  // MB.MD: Commit patterns
  if (lowerMessage.includes("commit changes") || lowerMessage.includes("commit this") ||
      lowerMessage.includes("save changes") || lowerMessage.includes("commit the fix")) {
    return { hasTool: true, tool: "commitChanges", args: { message: message }, confidence: 0.85 };
  }
  
  // MB.MD: PR creation patterns (triggered on "work complete")
  if (lowerMessage.includes("work complete") || lowerMessage.includes("create pr") ||
      lowerMessage.includes("create pull request") || lowerMessage.includes("ready for review") ||
      lowerMessage.includes("merge to main")) {
    return { hasTool: true, tool: "createPullRequest", args: { title: "Bug fix", body: message }, confidence: 0.85 };
  }
  
  // MB.MD: Test execution patterns
  if (lowerMessage.includes("run tests") || lowerMessage.includes("run playwright") ||
      lowerMessage.includes("test this") || lowerMessage.includes("e2e test")) {
    return { hasTool: true, tool: "runPlaywrightTest", args: {}, confidence: 0.85 };
  }
  
  return { hasTool: false, tool: null, args: {}, confidence: 0 };
}

// Execute tool with context
async function executeToolWithContext(tool: string, args: Record<string, any>): Promise<{ success: boolean; tool: string; data: any; error?: string }> {
  try {
    switch (tool) {
      case "getGitStatus":
        const gitStatus = await VibeCodingTools.getGitStatus();
        return { success: true, tool, data: gitStatus };
      case "listDirectory":
        const files = await VibeCodingTools.listDirectory(args.path || ".");
        return { success: true, tool, data: files };
      case "readFile":
        const content = await VibeCodingTools.readFile(args.path);
        return { success: true, tool, data: content };
      case "grepFiles":
        const matches = await VibeCodingTools.grepFiles(args.pattern, args.path || ".");
        return { success: true, tool, data: matches };
      case "writeFile":
        const writeResult = await VibeCodingTools.writeFile(args.path, args.content);
        return { success: writeResult.success, tool, data: writeResult.data, error: writeResult.error };
      case "editFile":
        // MB.MD PATTERN 67 GUARDRAILS: Prevent file corruption from bad edits
        const readResult = await VibeCodingTools.readFile(args.path);
        if (!readResult.success) {
          return { success: false, tool, data: null, error: readResult.error };
        }
        const originalContent = readResult.data.content;
        const originalLines = originalContent.split('\n').length;
        const originalSize = originalContent.length;
        
        // GUARDRAIL 1: Verify old text exists
        if (!originalContent.includes(args.oldText)) {
          return { success: false, tool, data: null, error: `Text to replace not found in file. Old text (${args.oldText.length} chars) not in ${args.path}` };
        }
        
        const newContent = originalContent.replace(args.oldText, args.newText);
        const newLines = newContent.split('\n').length;
        const newSize = newContent.length;
        
        // GUARDRAIL 2: Size validation - new content must be at least 80% of original
        const sizeRatio = newSize / originalSize;
        if (sizeRatio < 0.8) {
          console.error(`[MrBlue GUARDRAIL] BLOCKED: Edit would reduce file size from ${originalSize} to ${newSize} bytes (${(sizeRatio * 100).toFixed(1)}%)`);
          return { 
            success: false, 
            tool, 
            data: null, 
            error: `GUARDRAIL BLOCKED: Edit would reduce file size by ${((1 - sizeRatio) * 100).toFixed(1)}% (from ${originalSize} to ${newSize} bytes). Maximum reduction is 20%.` 
          };
        }
        
        // GUARDRAIL 3: Line count validation - no more than 50% reduction
        const lineRatio = newLines / originalLines;
        if (lineRatio < 0.5) {
          console.error(`[MrBlue GUARDRAIL] BLOCKED: Edit would reduce line count from ${originalLines} to ${newLines} lines (${(lineRatio * 100).toFixed(1)}%)`);
          return { 
            success: false, 
            tool, 
            data: null, 
            error: `GUARDRAIL BLOCKED: Edit would reduce line count by ${((1 - lineRatio) * 100).toFixed(1)}% (from ${originalLines} to ${newLines} lines). Maximum reduction is 50%.` 
          };
        }
        
        console.log(`[MrBlue EditFile] Validated: ${args.path} - Size ${originalSize}→${newSize} (${(sizeRatio * 100).toFixed(1)}%), Lines ${originalLines}→${newLines} (${(lineRatio * 100).toFixed(1)}%)`);
        
        const editWriteResult = await VibeCodingTools.writeFile(args.path, newContent);
        return { 
          success: editWriteResult.success, 
          tool, 
          data: { 
            path: args.path, 
            replaced: true, 
            bytesWritten: newContent.length,
            originalSize,
            newSize,
            originalLines,
            newLines
          },
          error: editWriteResult.error 
        };
      case "agenticExecute":
        // Delegate to AgenticExecutor for complex multi-step tasks
        console.log("[MrBlue Chat] Delegating to AgenticExecutor for:", args.instruction);
        const agenticResult = await agenticExecutor.execute(args.instruction, {
          diagnostic: args.bugId ? { bugId: args.bugId } : undefined
        });
        return { 
          success: agenticResult.success, 
          tool: "agenticExecute", 
          data: {
            summary: agenticResult.summary,
            filesModified: agenticResult.filesModified,
            filesCreated: agenticResult.filesCreated,
            toolCalls: agenticResult.toolCallsExecuted
          },
          error: agenticResult.success ? undefined : agenticResult.summary
        };
      case "queryDatabase":
        const dbResult = await VibeCodingTools.queryDatabase(args.query || "SELECT 1");
        return { success: dbResult.success, tool, data: dbResult.data, error: dbResult.error };
      case "getScraperStatus":
        const scraperResult = await VibeCodingTools.getScraperStatus();
        return { success: scraperResult.success, tool, data: scraperResult.data, error: scraperResult.error };
      case "createBranch":
        const branchResult = await VibeCodingTools.createBranch(args.branchName);
        return { success: branchResult.success, tool, data: branchResult.data, error: branchResult.error };
      case "commitChanges":
        const commitResult = await VibeCodingTools.commitChanges(args.message);
        return { success: commitResult.success, tool, data: commitResult.data, error: commitResult.error };
      case "createPullRequest":
        const prResult = await VibeCodingTools.createPullRequest(args.title, args.body);
        return { success: prResult.success, tool, data: prResult.data, error: prResult.error };
      case "runPlaywrightTest":
        const testResult = await VibeCodingTools.runPlaywrightTest(args.testFile, args.testName);
        return { success: testResult.success, tool, data: testResult.data, error: testResult.error };
      default:
        return { success: false, tool, data: null, error: "Unknown tool" };
    }
  } catch (error: any) {
    return { success: false, tool, data: null, error: error.message };
  }
}

router.post("/chat", authenticateToken, async (req: Request, res: Response) => {
  const { message, systemPrompt } = req.body;
  const userEmail = (req as any).user?.email || "";
  const userRoleLevel = (req as any).user?.roleLevel || 0;
  
  console.log("[MrBlue Chat] Received request:", { 
    message, 
    systemPromptLength: systemPrompt?.length,
    hasSystemPrompt: !!systemPrompt,
    userEmail
  });

  try {
    // MB.MD Pattern 65: Check for god-level tool execution FIRST
    const isGodLevel = isGodLevelUser(userRoleLevel) || isGodLevelUser(userEmail);
    const toolIntent = detectToolIntent(message);
    
    console.log(`[MrBlue Chat] Tool detection: isGodLevel=${isGodLevel}, tool=${toolIntent.tool}, confidence=${toolIntent.confidence}`);
    
    if (isGodLevel && toolIntent.hasTool && toolIntent.tool && toolIntent.confidence >= 0.7) {
      console.log(`[MrBlue Chat] Executing tool for god-level user: ${toolIntent.tool}`);
      
      const toolResult = await executeToolWithContext(toolIntent.tool, toolIntent.args);
      
      if (toolResult.success) {
        // Format the result conversationally using AI
        const formatResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are Mr. Blue, a VibeCoding agent with god-level powers. You just executed a real tool and got actual data from the repository. Present this data clearly and conversationally. Do not use emojis."
            },
            {
              role: "user",
              content: `User asked: "${message}"\n\nTool executed: ${toolResult.tool}\n\nActual result:\n${JSON.stringify(toolResult.data, null, 2)}`
            }
          ],
          temperature: 0.7,
        });
        
        const formattedReply = formatResponse.choices[0].message.content;
        console.log("[MrBlue Chat] Tool execution success, formatted reply length:", formattedReply?.length);
        
        return res.json({
          role: "assistant",
          response: formattedReply,
          content: formattedReply,
          timestamp: new Date().toISOString(),
          toolExecuted: toolResult.tool,
          toolSuccess: true,
          godLevelExecution: true,
          rawData: toolResult.data
        });
      } else {
        return res.json({
          role: "assistant",
          response: `I tried to execute ${toolResult.tool} but encountered an error: ${toolResult.error}`,
          content: `I tried to execute ${toolResult.tool} but encountered an error: ${toolResult.error}`,
          timestamp: new Date().toISOString(),
          toolExecuted: toolResult.tool,
          toolSuccess: false,
          godLevelExecution: true
        });
      }
    }
    
    // Standard AI response for non-tool requests
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt || "You are Mr. Blue, a helpful assistant." },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    console.log("[MrBlue Chat] Success, reply length:", reply?.length);
    res.json({ 
      role: "assistant",
      response: reply,
      content: reply,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[MrBlue Chat] Error:", error);
    res.status(500).json({ error: "Failed to communicate with AI" });
  }
});

/**
 * POST /api/mrblue/vibe-stream
 * SSE endpoint for streaming autonomous VibeCoding work
 * Streams Thought/Action/Observation in real-time as Mr Blue works
 * God-level users only
 */
router.post("/vibe-stream", authenticateToken, async (req: Request, res: Response) => {
  const { message, context } = req.body;
  const userEmail = (req as any).user?.email || "";
  const userRoleLevel = (req as any).user?.roleLevel || 0;
  const userId = (req as any).user?.id;
  
  // Verify god-level access
  const isGodLevel = isGodLevelUser(userRoleLevel) || isGodLevelUser(userEmail);
  if (!isGodLevel) {
    return res.status(403).json({ error: "God-level access required for VibeCoding stream" });
  }
  
  const streamId = `vibe_${userId}_${Date.now()}`;
  const session = { aborted: false };
  
  // Handle client disconnect
  req.on('close', () => {
    console.log(`[VibeStream] Client disconnected: ${streamId}`);
    session.aborted = true;
    activeVibeStreams.delete(streamId);
  });
  
  // Initialize SSE stream
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  
  activeVibeStreams.set(streamId, { res, aborted: false });
  
  // Helper to send SSE event with ReAct markers
  const sendEvent = (type: string, data: any) => {
    if (session.aborted || res.writableEnded) return;
    try {
      const marker = type === 'thought' ? 'THOUGHT' : 
                     type === 'action' ? 'ACTION' : 
                     type === 'observation' ? 'OBSERVATION' : 
                     type === 'complete' ? 'COMPLETE' :
                     type === 'error' ? 'ERROR' : type.toUpperCase();
      res.write(`data: ${JSON.stringify({ type, marker, ...data, timestamp: Date.now() })}\n\n`);
    } catch (e) {
      console.error('[VibeStream] Send error:', e);
    }
  };
  
  try {
    // Send initial connection
    sendEvent('connected', { 
      message: 'VibeCoding stream connected - I will work autonomously until the task is complete',
      streamId
    });
    
    // Initial thinking
    sendEvent('thought', { 
      content: `Analyzing task: "${message.substring(0, 100)}..."`,
      phase: 'analyzing'
    });
    
    // Execute agentic task with streaming
    const result = await agenticExecutor.execute(
      message,
      {
        currentPage: context?.currentPage,
        relevantFiles: context?.relevantFiles,
        diagnostic: context?.diagnostic
      },
      (step: ExecutionStep) => {
        // Stream each execution step to the client
        sendEvent(step.type, {
          content: step.content,
          toolName: step.toolName,
          toolResult: step.toolResult,
          phase: step.type === 'thought' ? 'thinking' :
                 step.type === 'action' ? 'executing' :
                 step.type === 'observation' ? 'observing' :
                 step.type === 'complete' ? 'complete' : 'processing'
        });
      }
    );
    
    // Send completion summary
    sendEvent('complete', {
      success: result.success,
      filesModified: result.filesModified,
      filesCreated: result.filesCreated,
      iterations: result.iterations,
      toolCallsExecuted: result.toolCallsExecuted,
      summary: result.finalResponse
    });
    
    res.end();
  } catch (error: any) {
    console.error('[VibeStream] Error:', error);
    sendEvent('error', { message: error.message || 'VibeCoding execution failed' });
    res.end();
  } finally {
    activeVibeStreams.delete(streamId);
  }
});

export default router;
