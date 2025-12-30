/**
 * MR. BLUE INTERNAL EXECUTOR
 * MB.MD Pattern 99 - Internal automation helper for server-side VibeCoding execution
 * 
 * This service enables the Replit Agent (and other internal systems) to route
 * all code fixes through Mr. Blue's VibeCodingService with proper validation layers,
 * bypassing CSRF since it runs server-side.
 * 
 * Usage:
 *   const executor = new MrBlueInternalExecutor();
 *   await executor.executeTask({
 *     bugId: 'tamas-bug-3',
 *     description: 'Like/reaction persistence issue',
 *     targetFiles: ['server/routes/post-routes.ts'],
 *     fixPlan: 'Check database save logic for likes',
 *   });
 */

import { VibeCodingService, VibeCodeRequest, VibeCodeResult, ApplyResult } from './VibeCodingService';
import { agentEventBus } from './AgentEventBus';
import { LearningRetentionService } from './LearningRetentionService';
import { v4 as uuidv4 } from 'uuid';

interface InternalTaskRequest {
  bugId: string;
  description: string;
  targetFiles?: string[];
  fixPlan: string;
  context?: string[];
  userId?: number;
}

interface InternalTaskResult {
  success: boolean;
  bugId: string;
  sessionId: string;
  preview?: VibeCodeResult;
  execution?: ApplyResult;
  validationPassed: boolean;
  filesModified: string[];
  error?: string;
  timestamp: string;
}

export class MrBlueInternalExecutor {
  private vibeCodingService: VibeCodingService;
  private executionLog: Map<string, InternalTaskResult>;

  constructor() {
    this.vibeCodingService = new VibeCodingService();
    this.executionLog = new Map();
  }

  /**
   * Execute a bug fix task through Mr. Blue's VibeCoding pipeline
   * This is the Pattern 99 compliant way for internal systems to make code changes
   */
  async executeTask(request: InternalTaskRequest): Promise<InternalTaskResult> {
    const sessionId = `mbmd-internal-${uuidv4().slice(0, 8)}`;
    const startTime = Date.now();

    console.log(`\n[MrBlue Internal] ========================================`);
    console.log(`[MrBlue Internal] 🎯 Pattern 99 Task: ${request.bugId}`);
    console.log(`[MrBlue Internal] 📝 Description: ${request.description}`);
    console.log(`[MrBlue Internal] 🎫 Session: ${sessionId}`);
    console.log(`[MrBlue Internal] ========================================\n`);

    try {
      await this.vibeCodingService.initialize();

      const vibeRequest: VibeCodeRequest = {
        naturalLanguage: this.buildNaturalLanguageRequest(request),
        context: request.context || [],
        targetFiles: request.targetFiles,
        userId: request.userId || 2,
        sessionId,
      };

      console.log(`[MrBlue Internal] 🔍 PHASE 1: Generating code preview...`);
      const preview = await this.vibeCodingService.generateCode(vibeRequest);

      if (!preview.success) {
        const result: InternalTaskResult = {
          success: false,
          bugId: request.bugId,
          sessionId,
          preview,
          validationPassed: false,
          filesModified: [],
          error: preview.error || 'Code generation failed',
          timestamp: new Date().toISOString(),
        };
        this.executionLog.set(request.bugId, result);
        return result;
      }

      console.log(`[MrBlue Internal] ✅ Preview generated: ${preview.fileChanges.length} files`);
      console.log(`[MrBlue Internal] 📊 Validation: syntax=${preview.validationResults.syntax}, lsp=${preview.validationResults.lsp}, safety=${preview.validationResults.safety}`);

      const validationPassed = preview.validationResults.syntax && 
                                preview.validationResults.lsp && 
                                preview.validationResults.safety;

      if (!validationPassed) {
        console.log(`[MrBlue Internal] ⚠️ Validation failed, not applying changes`);
        const result: InternalTaskResult = {
          success: false,
          bugId: request.bugId,
          sessionId,
          preview,
          validationPassed: false,
          filesModified: [],
          error: `Validation failed: ${preview.validationResults.warnings.join(', ')}`,
          timestamp: new Date().toISOString(),
        };
        this.executionLog.set(request.bugId, result);
        return result;
      }

      console.log(`[MrBlue Internal] 🔍 PHASE 2: Applying changes...`);
      const execution = await this.vibeCodingService.applyChanges(sessionId, request.userId || 2, {
        skipVisualValidation: true,
      });

      if (!execution.success) {
        const result: InternalTaskResult = {
          success: false,
          bugId: request.bugId,
          sessionId,
          preview,
          execution,
          validationPassed: true,
          filesModified: [],
          error: execution.error || 'Apply failed',
          timestamp: new Date().toISOString(),
        };
        this.executionLog.set(request.bugId, result);
        return result;
      }

      const elapsedMs = Date.now() - startTime;
      console.log(`[MrBlue Internal] ✅ COMPLETE in ${elapsedMs}ms`);
      console.log(`[MrBlue Internal] 📁 Files modified: ${execution.filesModified.join(', ')}`);
      if (execution.gitCommitId) {
        console.log(`[MrBlue Internal] 🔖 Git commit: ${execution.gitCommitId}`);
      }

      try {
        await LearningRetentionService.recordSuccessPattern({
          agentId: 'MrBlueInternalExecutor',
          task: request.description,
          solution: `Fixed ${request.bugId} via Pattern 99. Files: ${execution.filesModified.join(', ')}`,
          validationScore: 1.0,
          patternsUsed: [],
        });
      } catch (e) {
        console.log(`[MrBlue Internal] Note: Pattern recording skipped`);
      }

      const publishEvent = agentEventBus.createEvent(
        'task:completed',
        'MrBlueInternalExecutor',
        {
          bugId: request.bugId,
          sessionId,
          filesModified: execution.filesModified,
          success: true,
        } as any
      );
      await agentEventBus.publish(publishEvent);

      const result: InternalTaskResult = {
        success: true,
        bugId: request.bugId,
        sessionId,
        preview,
        execution,
        validationPassed: true,
        filesModified: execution.filesModified,
        timestamp: new Date().toISOString(),
      };
      this.executionLog.set(request.bugId, result);
      return result;

    } catch (error: any) {
      console.error(`[MrBlue Internal] ❌ Error: ${error.message}`);
      const result: InternalTaskResult = {
        success: false,
        bugId: request.bugId,
        sessionId,
        validationPassed: false,
        filesModified: [],
        error: error.message,
        timestamp: new Date().toISOString(),
      };
      this.executionLog.set(request.bugId, result);
      return result;
    }
  }

  /**
   * Preview a fix without applying (dry run)
   */
  async previewTask(request: InternalTaskRequest): Promise<VibeCodeResult | null> {
    const sessionId = `mbmd-preview-${uuidv4().slice(0, 8)}`;

    try {
      await this.vibeCodingService.initialize();

      const vibeRequest: VibeCodeRequest = {
        naturalLanguage: this.buildNaturalLanguageRequest(request),
        context: request.context || [],
        targetFiles: request.targetFiles,
        userId: request.userId || 2,
        sessionId,
      };

      return await this.vibeCodingService.generateCode(vibeRequest);
    } catch (error: any) {
      console.error(`[MrBlue Internal] Preview error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get execution history for a bug
   */
  getExecutionLog(bugId: string): InternalTaskResult | undefined {
    return this.executionLog.get(bugId);
  }

  /**
   * Get all execution logs
   */
  getAllExecutionLogs(): InternalTaskResult[] {
    return Array.from(this.executionLog.values());
  }

  private buildNaturalLanguageRequest(request: InternalTaskRequest): string {
    return `
BUG FIX REQUEST: ${request.bugId}
Description: ${request.description}

FIX PLAN:
${request.fixPlan}

${request.targetFiles?.length ? `Target files to modify:\n${request.targetFiles.map(f => `- ${f}`).join('\n')}` : ''}

REQUIREMENTS:
- Apply minimal changes to fix the issue
- Maintain existing code style and patterns
- Do NOT add comments unless necessary
- Validate changes compile without errors
`.trim();
  }
}

export const mrBlueInternalExecutor = new MrBlueInternalExecutor();
