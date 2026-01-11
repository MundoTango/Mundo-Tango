/**
 * AGENTIC EXECUTOR - Pattern 97 Real Code Execution
 * MB.MD v3.3 - Actually executes code like Replit AI
 * 
 * This is the missing piece: a proper tool-calling loop that:
 * 1. Sends task + tools to AI (OpenAI function calling)
 * 2. Parses AI's tool_calls
 * 3. Executes REAL tools from VibeCodingToolService
 * 4. Returns results to AI, loops until done
 * 5. Tracks all files modified/created
 * 6. Commits changes with conventional commit messages (GOD Command #0)
 * 7. Updates bug status and notifies users
 * 
 * GOD COMMANDS ENFORCED:
 * #0: AUTO-INVOKE GitHub Practices + Plan Tracker
 * #2: Work Simultaneously - Promise.all for parallel tool execution
 * #3: Work Recursively - Read imports, dependencies, related files
 * #4: Work Critically - Validate file actually changed after each write
 * #7: Auto-Fix - 3-attempt retry on tool failures
 * #8: Validation Loop - observe → decide → act → validate → adapt
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  readFile,
  writeFile,
  listDirectory,
  searchFiles,
  grepFiles,
  executeCommand,
  getProjectStructure,
  ToolResult
} from './VibeCodingToolService';

const execAsync = promisify(exec);
const basePath = process.cwd();

// ==================== MB.MD CONTEXT ====================

const MB_MD_GOD_COMMANDS = `
## GOD COMMANDS (HIGHEST PRIORITY - from mb.md)

| ID | Command | Scope |
|----|---------|-------|
| #0 | AUTO-INVOKE GitHub Practices - Commit changes with conventional messages | Global |
| #1 | Test before completing any task | Global |
| #2 | Work Simultaneously - Parallel operations (Promise.all) | Global |
| #3 | Work Recursively - Read imports, dependencies, related files BEFORE editing | Global |
| #4 | Work Critically - Target 95-99/100 quality (validate edge cases) | Global |
| #5 | Check Documentation First - Use existing systems before building new | Global |
| #6 | Never change ID column types (serial ↔ varchar breaks data) | Database |
| #7 | Auto-Fix Maximization - 3-attempt retry, <10% escalation rate | Global |
| #8 | Validation Loop - observe → decide → act → validate → adapt | Global |
| #9 | Zero Hardcoding - All UI text MUST use i18next t() function | Global |
`;

const ARCHITECTURE_CONTEXT = `
## Mundo Tango Architecture (from replit.md)

### Backend Structure:
- Express + TypeScript + Drizzle ORM
- Routes: server/routes/*.ts (modular route files)
- Services: server/services/*.ts
- Schema: shared/schema.ts (Drizzle tables + Zod validation)
- Storage: server/storage.ts (IStorage interface)

### Frontend Structure:
- React + Vite + Tailwind CSS + shadcn/ui
- Components: client/src/components/
- Pages: client/src/pages/
- Hooks: client/src/hooks/

### Key Route Files by Feature:
- Travel/Events: server/routes/travel-routes.ts
- Events: server/routes/event-routes.ts
- Users/Auth: server/routes/auth-routes.ts
- Cities: server/routes/city-routes.ts
- Admin: server/routes/admin-routes.ts
- Messaging: server/routes/messaging-routes.ts
`;

// Error type to file hint mapping
const ERROR_FILE_HINTS: Record<string, string[]> = {
  'travel': ['server/routes/travel-routes.ts', 'client/src/pages/profile.tsx', 'shared/schema.ts'],
  'events': ['server/routes/event-routes.ts', 'server/routes/travel-routes.ts', 'shared/schema.ts'],
  'auth': ['server/routes/auth-routes.ts', 'server/middleware/auth.ts'],
  'city': ['server/routes/city-routes.ts', 'client/src/pages/city.tsx'],
  'profile': ['server/routes/user-routes.ts', 'client/src/pages/profile.tsx'],
  'messaging': ['server/routes/messaging-routes.ts', 'shared/schema.ts'],
  'talent': ['server/routes/talent-match-routes.ts', 'server/services/talent-match/'],
};

export interface DiagnosticContext {
  bugId?: number;
  userId?: number;
  currentPage?: string;
  failedApiCalls?: Array<{ url: string; status: number; error?: string }>;
  consoleErrors?: string[];
  userJourney?: string[];
  selectedElement?: string;
}

function buildDiagnosticPrompt(diagnostic?: DiagnosticContext): string {
  if (!diagnostic) return '';
  
  let prompt = '\n## BUG DIAGNOSTIC CONTEXT:\n';
  
  if (diagnostic.bugId) {
    prompt += `Bug ID: ${diagnostic.bugId}\n`;
  }
  
  if (diagnostic.currentPage) {
    prompt += `Current Page: ${diagnostic.currentPage}\n`;
    
    // Add file hints based on page/error
    const pageKey = Object.keys(ERROR_FILE_HINTS).find(key => 
      diagnostic.currentPage?.toLowerCase().includes(key)
    );
    if (pageKey) {
      prompt += `\nRELEVANT FILES TO CHECK:\n${ERROR_FILE_HINTS[pageKey].map(f => `- ${f}`).join('\n')}\n`;
    }
  }
  
  if (diagnostic.failedApiCalls?.length) {
    prompt += `\nFAILED API CALLS:\n`;
    diagnostic.failedApiCalls.forEach(call => {
      prompt += `- ${call.url} → ${call.status}${call.error ? ` (${call.error})` : ''}\n`;
      
      // Add hints for failed endpoints
      const endpoint = call.url.split('/api/')[1]?.split('/')[0] || '';
      if (ERROR_FILE_HINTS[endpoint]) {
        prompt += `  → Check: ${ERROR_FILE_HINTS[endpoint].join(', ')}\n`;
      }
    });
  }
  
  if (diagnostic.consoleErrors?.length) {
    prompt += `\nCONSOLE ERRORS:\n${diagnostic.consoleErrors.map(e => `- ${e}`).join('\n')}\n`;
  }
  
  if (diagnostic.userJourney?.length) {
    prompt += `\nUSER JOURNEY:\n${diagnostic.userJourney.map((j, i) => `${i + 1}. ${j}`).join('\n')}\n`;
  }
  
  if (diagnostic.selectedElement) {
    prompt += `\nSELECTED ELEMENT: ${diagnostic.selectedElement}\n`;
  }
  
  return prompt;
}

export interface ToolSchema {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, { type: string; description: string }>;
      required: string[];
    };
  };
}

export interface AgenticResult {
  success: boolean;
  filesModified: string[];
  filesCreated: string[];
  toolCallsExecuted: number;
  iterations: number;
  finalResponse: string;
  error?: string;
  executionLog: ExecutionStep[];
}

export interface ExecutionStep {
  type: 'thought' | 'action' | 'observation' | 'error' | 'complete';
  content: string;
  timestamp: number;
  toolName?: string;
  toolResult?: any;
}

export type StreamCallback = (step: ExecutionStep) => void;

const TOOL_SCHEMAS: ToolSchema[] = [
  {
    type: 'function',
    function: {
      name: 'readFile',
      description: 'Read the contents of a file from the project. ALWAYS read files before editing them (GOD Command #3).',
      parameters: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to the file relative to project root' }
        },
        required: ['filePath']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'writeFile',
      description: 'Write or create a file in the project. Use this to make code changes.',
      parameters: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to the file relative to project root' },
          content: { type: 'string', description: 'The complete new content for the file' }
        },
        required: ['filePath', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'editFile',
      description: 'Edit a specific section of a file by replacing old content with new content',
      parameters: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to the file' },
          oldContent: { type: 'string', description: 'The exact content to find and replace' },
          newContent: { type: 'string', description: 'The new content to replace it with' }
        },
        required: ['filePath', 'oldContent', 'newContent']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'listDirectory',
      description: 'List files and directories in a path',
      parameters: {
        type: 'object',
        properties: {
          dirPath: { type: 'string', description: 'Directory path relative to project root' }
        },
        required: ['dirPath']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'grepFiles',
      description: 'Search for a pattern in file contents across the codebase',
      parameters: {
        type: 'object',
        properties: {
          searchTerm: { type: 'string', description: 'The text or pattern to search for' },
          directory: { type: 'string', description: 'Directory to search in (default: .)' }
        },
        required: ['searchTerm']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'searchFiles',
      description: 'Find files by name pattern (e.g., *.tsx, package.json)',
      parameters: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'File pattern to match' },
          directory: { type: 'string', description: 'Directory to search in' }
        },
        required: ['pattern']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getProjectStructure',
      description: 'Get an overview of the project file structure',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'gitCommit',
      description: 'Commit changes with a conventional commit message (GOD Command #0). Use after making file changes.',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', description: 'Commit type: fix, feat, refactor, docs, style, test, chore' },
          scope: { type: 'string', description: 'Scope of change: travel, events, auth, profile, messaging, etc.' },
          message: { type: 'string', description: 'Brief description of what was fixed/changed' }
        },
        required: ['type', 'scope', 'message']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'updateBugStatus',
      description: 'Mark a bug report as resolved and optionally notify the reporting user',
      parameters: {
        type: 'object',
        properties: {
          bugId: { type: 'number', description: 'The ID of the bug report to update' },
          status: { type: 'string', description: 'New status: resolved, in-progress, rejected' },
          resolution: { type: 'string', description: 'Summary of how the bug was fixed' },
          notifyUser: { type: 'boolean', description: 'Whether to send a message to the reporting user' }
        },
        required: ['bugId', 'status', 'resolution']
      }
    }
  }
];

class AgenticExecutorService {
  private readonly MAX_ITERATIONS = 15;
  private readonly MAX_RETRIES = 3;

  async execute(
    task: string,
    context?: { 
      currentPage?: string; 
      relevantFiles?: string[];
      diagnostic?: DiagnosticContext;
    },
    onStream?: StreamCallback
  ): Promise<AgenticResult> {
    const startTime = Date.now();
    const filesModified: string[] = [];
    const filesCreated: string[] = [];
    const executionLog: ExecutionStep[] = [];
    let toolCallsExecuted = 0;
    let iterations = 0;

    const emit = (type: ExecutionStep['type'], content: string, toolName?: string, toolResult?: any) => {
      const step: ExecutionStep = { type, content, timestamp: Date.now(), toolName, toolResult };
      executionLog.push(step);
      onStream?.(step);
      console.log(`[AgenticExecutor] ${type.toUpperCase()}: ${content.substring(0, 100)}...`);
    };

    // Build enhanced system prompt with MB.MD context
    const diagnosticPrompt = buildDiagnosticPrompt(context?.diagnostic);
    
    const systemPrompt = `You are Mr. Blue, an autonomous AI coding agent for the Mundo Tango platform.
You have access to real filesystem tools to read, write, and modify code files.

${MB_MD_GOD_COMMANDS}

${ARCHITECTURE_CONTEXT}

## CRITICAL WORKFLOW (ReAct Protocol):
1. THINK: Analyze the bug and identify likely cause
2. READ: Always read relevant files BEFORE editing (GOD Command #3)
3. PLAN: Determine the minimal fix needed
4. EDIT: Make precise, targeted edits
5. VERIFY: Read the file after editing to confirm change
6. COMMIT: Use gitCommit to save changes with conventional message
7. UPDATE: If fixing a bug, use updateBugStatus to mark resolved and notify user

## CURRENT CONTEXT:
${context?.currentPage ? `Current Page: ${context.currentPage}` : ''}
${context?.relevantFiles?.length ? `Relevant Files: ${context.relevantFiles.join(', ')}` : ''}
${diagnosticPrompt}

When the task is complete, respond with a summary of what you did. Do not call any more tools.`;

    const messages: Array<{ role: string; content: string; tool_call_id?: string; name?: string }> = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: task
      }
    ];

    try {
      while (iterations < this.MAX_ITERATIONS) {
        iterations++;
        emit('thought', `Iteration ${iterations}: Analyzing task and deciding next action...`);

        const response = await this.callOpenAI(messages);
        
        if (!response.tool_calls || response.tool_calls.length === 0) {
          emit('complete', response.content || 'Task completed');
          return {
            success: true,
            filesModified,
            filesCreated,
            toolCallsExecuted,
            iterations,
            finalResponse: response.content || 'Task completed',
            executionLog
          };
        }

        messages.push({
          role: 'assistant',
          content: response.content || '',
          ...({ tool_calls: response.tool_calls } as any)
        });

        const toolResults = await Promise.all(
          response.tool_calls.map(async (toolCall: any) => {
            const toolName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            
            emit('action', `Executing ${toolName}(${JSON.stringify(args)})`, toolName);
            
            let result: ToolResult;
            let retries = 0;
            
            while (retries < this.MAX_RETRIES) {
              try {
                result = await this.executeToolWithValidation(toolName, args, filesModified, filesCreated);
                break;
              } catch (err: any) {
                retries++;
                if (retries >= this.MAX_RETRIES) {
                  result = { success: false, tool: toolName, data: null, error: err.message };
                } else {
                  emit('thought', `Retry ${retries}/${this.MAX_RETRIES} for ${toolName}: ${err.message}`);
                  await new Promise(r => setTimeout(r, 500));
                }
              }
            }
            
            toolCallsExecuted++;
            
            const summary = result!.success 
              ? `Success: ${JSON.stringify(result!.data).substring(0, 300)}`
              : `Error: ${result!.error}`;
            emit('observation', summary, toolName, result);
            
            return {
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolName,
              content: JSON.stringify(result)
            };
          })
        );

        messages.push(...toolResults);
      }

      emit('error', `Max iterations (${this.MAX_ITERATIONS}) reached`);
      return {
        success: false,
        filesModified,
        filesCreated,
        toolCallsExecuted,
        iterations,
        finalResponse: '',
        error: `Max iterations reached`,
        executionLog
      };

    } catch (err: any) {
      emit('error', err.message);
      return {
        success: false,
        filesModified,
        filesCreated,
        toolCallsExecuted,
        iterations,
        finalResponse: '',
        error: err.message,
        executionLog
      };
    }
  }

  private async executeToolWithValidation(
    toolName: string,
    args: Record<string, any>,
    filesModified: string[],
    filesCreated: string[]
  ): Promise<ToolResult> {
    const fileExistsBefore = async (filePath: string): Promise<boolean> => {
      try {
        await fs.access(path.join(basePath, filePath));
        return true;
      } catch {
        return false;
      }
    };

    let result: ToolResult;

    switch (toolName) {
      case 'readFile':
        result = await readFile(args.filePath);
        break;

      case 'writeFile': {
        const existed = await fileExistsBefore(args.filePath);
        result = await writeFile(args.filePath, args.content);
        if (result.success) {
          const verifyResult = await readFile(args.filePath);
          if (!verifyResult.success || verifyResult.data?.content !== args.content) {
            throw new Error('Critical validation failed: file content does not match after write');
          }
          if (existed) {
            if (!filesModified.includes(args.filePath)) filesModified.push(args.filePath);
          } else {
            if (!filesCreated.includes(args.filePath)) filesCreated.push(args.filePath);
          }
        }
        break;
      }

      case 'editFile': {
        const readResult = await readFile(args.filePath);
        if (!readResult.success) {
          throw new Error(`Cannot read file for editing: ${readResult.error}`);
        }
        const oldContent = readResult.data.content;
        if (!oldContent.includes(args.oldContent)) {
          throw new Error(`Cannot find oldContent in file. The content to replace was not found.`);
        }
        const newFileContent = oldContent.replace(args.oldContent, args.newContent);
        result = await writeFile(args.filePath, newFileContent);
        if (result.success) {
          const verifyResult = await readFile(args.filePath);
          if (!verifyResult.success || !verifyResult.data?.content.includes(args.newContent)) {
            throw new Error('Critical validation failed: edit not applied correctly');
          }
          if (!filesModified.includes(args.filePath)) filesModified.push(args.filePath);
        }
        break;
      }

      case 'listDirectory':
        result = await listDirectory(args.dirPath || '.');
        break;

      case 'grepFiles':
        result = await grepFiles(args.searchTerm, args.directory || '.');
        break;

      case 'searchFiles':
        result = await searchFiles(args.pattern, args.directory || '.');
        break;

      case 'getProjectStructure':
        result = await getProjectStructure();
        break;

      case 'gitCommit': {
        // GOD Command #0: Conventional commit with GitHub practices
        const commitType = args.type || 'fix';
        const scope = args.scope || 'general';
        const message = args.message || 'Auto-fix applied by Mr. Blue';
        const commitMessage = `${commitType}(${scope}): ${message}`;
        
        try {
          // Stage all changes
          await execAsync('git add -A', { cwd: basePath });
          
          // Create commit
          const { stdout } = await execAsync(
            `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`,
            { cwd: basePath }
          );
          
          result = {
            success: true,
            tool: 'gitCommit',
            data: { 
              commitMessage,
              output: stdout.substring(0, 500),
              filesCommitted: filesModified.length + filesCreated.length
            }
          };
        } catch (err: any) {
          // Handle "nothing to commit" case
          if (err.message.includes('nothing to commit')) {
            result = {
              success: true,
              tool: 'gitCommit',
              data: { commitMessage, note: 'No changes to commit' }
            };
          } else {
            result = { success: false, tool: 'gitCommit', data: null, error: err.message };
          }
        }
        break;
      }

      case 'updateBugStatus': {
        // Update bug status and optionally notify user
        const bugId = args.bugId;
        const status = args.status || 'resolved';
        const resolution = args.resolution || 'Fixed by Mr. Blue auto-fix';
        const notifyUser = args.notifyUser !== false; // Default to true
        
        try {
          // Import storage dynamically to avoid circular deps
          const { storage } = await import('../../storage');
          
          // Update the bug status
          await storage.updateFeedbackStatus(bugId, status, resolution);
          
          // Get bug details for user notification
          const feedback = await storage.getFeedbackById(bugId);
          
          // Send message to user if requested
          if (notifyUser && feedback?.userId) {
            await storage.createDirectMessage({
              senderId: 1, // System/Admin user
              recipientId: feedback.userId,
              content: `Your bug report "${feedback.title}" has been resolved.\n\n**Resolution:** ${resolution}\n\nThank you for reporting this issue!`,
              isRead: false
            });
          }
          
          result = {
            success: true,
            tool: 'updateBugStatus',
            data: { 
              bugId,
              newStatus: status,
              resolution,
              userNotified: notifyUser && !!feedback?.userId
            }
          };
        } catch (err: any) {
          result = { success: false, tool: 'updateBugStatus', data: null, error: err.message };
        }
        break;
      }

      default:
        result = { success: false, tool: toolName, data: null, error: `Unknown tool: ${toolName}` };
    }

    return result;
  }

  private async callOpenAI(messages: any[]): Promise<{ content: string; tool_calls?: any[] }> {
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || 'https://api.openai.com/v1';
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        tools: TOOL_SCHEMAS,
        tool_choice: 'auto',
        temperature: 0.2,
        max_completion_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const choice = data.choices[0];
    
    return {
      content: choice.message.content || '',
      tool_calls: choice.message.tool_calls
    };
  }
}

export const agenticExecutor = new AgenticExecutorService();
