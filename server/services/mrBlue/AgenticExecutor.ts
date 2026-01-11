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
 * 
 * GOD COMMANDS ENFORCED:
 * #2: Work Simultaneously - Promise.all for parallel tool execution
 * #4: Work Critically - Validate file actually changed after each write
 * #7: Auto-Fix - 3-attempt retry on tool failures
 * #8: Validation Loop - observe → decide → act → validate → adapt
 */

import * as fs from 'fs/promises';
import * as path from 'path';
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

const basePath = process.cwd();

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
      description: 'Read the contents of a file from the project',
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
  }
];

class AgenticExecutorService {
  private readonly MAX_ITERATIONS = 15;
  private readonly MAX_RETRIES = 3;

  async execute(
    task: string,
    context?: { currentPage?: string; relevantFiles?: string[] },
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

    const messages: Array<{ role: string; content: string; tool_call_id?: string; name?: string }> = [
      {
        role: 'system',
        content: `You are Mr. Blue, an autonomous AI coding agent for the Mundo Tango platform.
You have access to real filesystem tools to read, write, and modify code files.

CRITICAL RULES:
1. Actually execute changes - don't just describe what you would do
2. Read files before editing to understand current state
3. Make precise, targeted edits
4. Verify your changes worked by reading the file after editing

PROJECT CONTEXT:
${context?.currentPage ? `Current Page: ${context.currentPage}` : ''}
${context?.relevantFiles?.length ? `Relevant Files: ${context.relevantFiles.join(', ')}` : ''}

When the task is complete, respond with a summary of what you did. Do not call any more tools.`
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
