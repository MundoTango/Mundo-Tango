/**
 * Streaming Service
 * Server-Sent Events (SSE) for live work progress updates
 * Powers real-time feedback in Mr. Blue chat
 */

import { Response } from 'express';

export interface StreamMessage {
  type: 'progress' | 'code' | 'completion' | 'error';
  status?: 'analyzing' | 'applying' | 'generating' | 'done';
  message?: string;
  code?: string;
  data?: any;
}

export class StreamingService {
  /**
   * Initialize SSE connection
   */
  initSSE(res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    
    // Send initial connection message
    this.send(res, {
      type: 'progress',
      status: 'analyzing',
      message: 'Connected to Mr. Blue...'
    });
  }

  /**
   * Send SSE message
   */
  send(res: Response, message: StreamMessage): void {
    if (res.writableEnded) {
      console.warn('[Streaming] Attempted to write to closed response');
      return;
    }

    try {
      const data = JSON.stringify(message);
      res.write(`data: ${data}\n\n`);
    } catch (error) {
      console.error('[Streaming] Send error:', error);
    }
  }

  /**
   * Stream work progress for visual edits
   */
  async streamVisualEdit(
    res: Response,
    request: {
      prompt: string;
      elementId?: string;
      currentPage?: string;
      onApplyChange?: (change: any) => Promise<void>;
      onGenerateCode?: (code: string) => Promise<void>;
    }
  ): Promise<void> {
    try {
      // Step 1: Analyzing request
      this.send(res, {
        type: 'progress',
        status: 'analyzing',
        message: '🔄 Analyzing request...'
      });

      await this.delay(300);

      // Step 2: Applying changes
      this.send(res, {
        type: 'progress',
        status: 'applying',
        message: '🎨 Applying changes to preview...'
      });

      // Trigger instant DOM update (if callback provided)
      if (request.onApplyChange) {
        const change = this.parseEditRequest(request.prompt);
        await request.onApplyChange(change);
      }

      await this.delay(200);

      // Step 3: Generating code
      this.send(res, {
        type: 'progress',
        status: 'generating',
        message: '📝 Generating code...'
      });

      // Stream code generation (if callback provided)
      if (request.onGenerateCode) {
        await request.onGenerateCode('// Generated code will appear here');
      }

      await this.delay(500);

      // Step 4: Completion
      this.send(res, {
        type: 'completion',
        status: 'done',
        message: '✅ Done! Changes applied.',
        data: {
          success: true,
          prompt: request.prompt
        }
      });

      // Close stream
      res.end();
    } catch (error: any) {
      this.send(res, {
        type: 'error',
        message: error.message || 'Failed to apply changes'
      });
      res.end();
    }
  }

  /**
   * Stream code generation progress
   */
  async streamCodeGeneration(
    res: Response,
    codeGenerator: AsyncGenerator<string, void, unknown>
  ): Promise<void> {
    try {
      for await (const chunk of codeGenerator) {
        this.send(res, {
          type: 'code',
          code: chunk
        });
      }

      this.send(res, {
        type: 'completion',
        status: 'done',
        message: 'Code generation complete'
      });

      res.end();
    } catch (error: any) {
      this.send(res, {
        type: 'error',
        message: error.message || 'Code generation failed'
      });
      res.end();
    }
  }

  /**
   * Parse edit request into structured change
   */
  private parseEditRequest(prompt: string): any {
    const lower = prompt.toLowerCase();

    // Color changes
    if (lower.includes('blue')) {
      return { type: 'style', property: 'backgroundColor', value: 'rgb(59, 130, 246)' };
    }
    if (lower.includes('red')) {
      return { type: 'style', property: 'backgroundColor', value: 'rgb(239, 68, 68)' };
    }
    if (lower.includes('green')) {
      return { type: 'style', property: 'backgroundColor', value: 'rgb(34, 197, 94)' };
    }

    // Size changes
    if (lower.includes('bigger') || lower.includes('larger')) {
      return { type: 'style', property: 'fontSize', value: '1.5em' };
    }
    if (lower.includes('smaller')) {
      return { type: 'style', property: 'fontSize', value: '0.8em' };
    }

    // Position changes
    if (lower.includes('move left')) {
      return { type: 'position', x: -50, y: 0 };
    }
    if (lower.includes('move right')) {
      return { type: 'position', x: 50, y: 0 };
    }

    // Default: no specific change detected
    return { type: 'unknown', prompt };
  }

  /**
   * Helper: delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send heartbeat to keep connection alive
   */
  sendHeartbeat(res: Response): void {
    if (!res.writableEnded) {
      res.write(':heartbeat\n\n');
    }
  }

  /**
   * MB.MD Pattern 98: Stream VibeCoding tool execution with live progress
   * Shows real-time work like Replit Agent
   */
  async streamToolExecution(
    res: Response,
    toolName: string,
    executeToolFn: () => Promise<any>
  ): Promise<any> {
    try {
      // Step 1: Show what we're doing
      this.send(res, {
        type: 'progress',
        status: 'analyzing',
        message: `🔍 **Executing ${toolName}...**`
      });
      await this.delay(200);

      // Step 2: Show the research step
      const toolLabels: Record<string, string> = {
        getGitHubInfo: '📦 Querying GitHub API...',
        getGitHubRepo: '📁 Fetching repository details...',
        getGitStatus: '🔀 Checking git status...',
        readFile: '📄 Reading file contents...',
        grepFiles: '🔎 Searching codebase...',
        searchFiles: '🔍 Finding files...',
        listDirectory: '📂 Listing directory...',
        getProjectStructure: '🏗️ Analyzing project structure...',
        executeCommand: '⚡ Running command...'
      };

      this.send(res, {
        type: 'progress',
        status: 'analyzing',
        message: toolLabels[toolName] || `⚙️ Running ${toolName}...`
      });
      await this.delay(100);

      // Step 3: Execute the tool
      const result = await executeToolFn();

      // Step 4: Show success
      this.send(res, {
        type: 'progress',
        status: 'done',
        message: result.success 
          ? `✅ **${toolName} completed**` 
          : `❌ **${toolName} failed**: ${result.error}`
      });
      await this.delay(100);

      return result;
    } catch (error: any) {
      this.send(res, {
        type: 'error',
        message: `Tool execution failed: ${error.message}`
      });
      throw error;
    }
  }
}

export const streamingService = new StreamingService();
