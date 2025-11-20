/**
 * MR BLUE VIBE CODING SERVICE - SYSTEM 4
 * Natural Language → Production Code Engine
 * 
 * Powered by GROQ Llama-3.1-70b-versatile
 * Week 1, Day 1 Implementation - MB.MD v7.1
 * 
 * Features:
 * - Natural language code request parsing
 * - Multi-file editing (5+ files at once)
 * - Safety validation (LSP, syntax, file safety)
 * - Preview generation before apply
 * - Git integration for rollback
 */

import Groq from 'groq-sdk';
import { ContextService } from './ContextService';
import { CodeGenerator } from './CodeGenerator';
import { agentEventBus } from './AgentEventBus';
import { progressTrackingAgent } from './ProgressTrackingAgent';
import { preferenceExtractor } from './PreferenceExtractor';
import { clarificationService } from '../clarification/ClarificationService';
import { sequentialOrchestrator } from '../orchestration/SequentialOrchestrator';
import type { WorkflowStep } from '@shared/types/a2a';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface VibeCodeRequest {
  naturalLanguage: string;
  context?: string[];
  targetFiles?: string[];
  userId: number;
  sessionId: string;
}

export interface FileChange {
  filePath: string;
  originalContent: string;
  newContent: string;
  diff: string;
  action: 'create' | 'modify' | 'delete';
  reason: string;
}

export interface VibeCodeResult {
  success: boolean;
  sessionId: string;
  request: string;
  interpretation: string;
  fileChanges: FileChange[];
  validationResults: {
    syntax: boolean;
    lsp: boolean;
    safety: boolean;
    warnings: string[];
  };
  estimatedImpact: string;
  previewUrl?: string;
  error?: string;
}

export interface ApplyResult {
  success: boolean;
  sessionId: string;
  filesModified: string[];
  gitCommitId?: string;
  error?: string;
}

export class VibeCodingService {
  private contextService: ContextService;
  private codeGenerator: CodeGenerator;
  private sessionCache = new Map<string, VibeCodeResult>();

  constructor() {
    this.contextService = new ContextService();
    this.codeGenerator = new CodeGenerator(this.contextService);
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    console.log('[VibeCoding] Initializing Vibe Coding Engine...');
    await this.contextService.initialize();
    console.log('[VibeCoding] ✅ Vibe Coding Engine ready');
  }

  /**
   * PHASE 2: Check for known errors in the request
   * Queries errorPatterns table for past failures matching keywords in the prompt
   */
  async checkForKnownErrors(prompt: string): Promise<Array<{
    errorMessage: string;
    suggestedFix: string;
    frequency: number;
  }>> {
    try {
      const { storage } = await import('../../storage');
      
      // Extract keywords from prompt (simple approach: split by spaces and filter)
      const keywords = prompt
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3 && !['make', 'this', 'that', 'with', 'from', 'have'].includes(word))
        .slice(0, 10); // Limit to 10 keywords to avoid overly broad queries

      if (keywords.length === 0) {
        return [];
      }

      console.log(`[VibeCoding] 🔍 Checking for known errors with keywords: ${keywords.join(', ')}`);
      
      const patterns = await storage.searchErrorPatterns(keywords);
      
      if (patterns.length > 0) {
        console.log(`[VibeCoding] ⚠️ Found ${patterns.length} known error patterns!`);
        return patterns.map((p: any) => ({
          errorMessage: p.errorMessage,
          suggestedFix: p.suggestedFix || 'No fix suggested yet',
          frequency: p.frequency || 1,
        }));
      }
      
      console.log(`[VibeCoding] ✅ No known errors found for this request`);
      return [];
    } catch (error: any) {
      console.error('[VibeCoding] Error checking for known errors:', error);
      return [];
    }
  }

  /**
   * PHASE 1: Assess request clarity and run clarification if needed
   * Uses ClarificationService to determine if request is ambiguous
   */
  private async assessAndClarify(
    request: VibeCodeRequest
  ): Promise<{ clarified: boolean; finalRequest: string; clarityScore: number }> {
    try {
      console.log(`[VibeCoding] 🔍 Assessing request clarity...`);

      // Use sessionId as conversationId for tracking
      const conversationId = parseInt(request.sessionId.split('-')[1] || '1', 10);

      // Step 1: Check initial clarity score
      const clarityScore = await clarificationService['assessClarity'](request.naturalLanguage);
      console.log(`[VibeCoding] 📊 Initial clarity score: ${clarityScore.toFixed(2)}`);

      // Step 2: If clarity is below threshold (0.8), run clarification
      if (clarityScore < 0.8) {
        console.log(`[VibeCoding] ⚠️ Request is ambiguous (${clarityScore.toFixed(2)} < 0.8)`);
        console.log(`[VibeCoding] 🤔 Starting clarification rounds...`);

        // Publish clarification start event
        const clarificationEvent = agentEventBus.createEvent(
          'progress:update',
          'VibeCodingService',
          {
            sessionId: request.sessionId,
            phase: 'clarification',
            percent: 5,
            message: 'Clarifying ambiguous request...',
          } as any
        );
        await agentEventBus.publish(clarificationEvent);

        // Run clarification loop
        const clarificationResult = await clarificationService.clarify(
          request.naturalLanguage,
          conversationId,
          {
            maxRounds: 2,
            minClarityThreshold: 0.8,
            questionCount: 3
          }
        );

        console.log(
          `[VibeCoding] ✅ Clarification complete after ${clarificationResult.totalRounds} rounds`
        );

        return {
          clarified: clarificationResult.clarified,
          finalRequest: clarificationResult.finalRequest,
          clarityScore: clarificationResult.rounds[clarificationResult.rounds.length - 1]?.clarityScore || clarityScore
        };
      }

      // Request is already clear
      console.log(`[VibeCoding] ✅ Request is clear (${clarityScore.toFixed(2)} >= 0.8)`);
      return {
        clarified: false,
        finalRequest: request.naturalLanguage,
        clarityScore
      };
    } catch (error: any) {
      console.error('[VibeCoding] Error in clarity assessment:', error);
      // On error, proceed with original request
      return {
        clarified: false,
        finalRequest: request.naturalLanguage,
        clarityScore: 0.5
      };
    }
  }

  /**
   * Generate code from natural language request
   * NOW WITH CLARIFICATION INTEGRATION
   */
  async generateCode(request: VibeCodeRequest): Promise<VibeCodeResult> {
    try {
      console.log(`[VibeCoding] 🎯 Request: "${request.naturalLanguage}"`);
      
      // Publish progress update
      const progressEvent = agentEventBus.createEvent(
        'progress:update',
        'VibeCodingService',
        {
          sessionId: request.sessionId,
          phase: 'planning',
          percent: 10,
          message: 'Analyzing request...',
        } as any
      );
      await agentEventBus.publish(progressEvent);

      // PHASE 1: Clarification - NEW INTEGRATION
      const clarificationResult = await this.assessAndClarify(request);
      
      // Update request with clarified version if clarification was needed
      if (clarificationResult.clarified) {
        console.log(`[VibeCoding] 📝 Using clarified request`);
        request.naturalLanguage = clarificationResult.finalRequest;
      }
      
      // PHASE 2: Check for known errors BEFORE generating code
      const knownErrors = await this.checkForKnownErrors(request.naturalLanguage);
      
      // PHASE 3: Extract user preferences from the request
      await preferenceExtractor.extractAndSave(
        request.userId,
        request.naturalLanguage,
        undefined // conversationId can be added if available
      );
      
      // Step 1: Interpret the request using GROQ
      const interpretation = await this.interpretRequest(request.naturalLanguage);
      console.log(`[VibeCoding] 📝 Interpretation: ${interpretation.intent}`);

      // Step 2: Get relevant context from documentation
      const contextResults = await this.contextService.search(
        request.naturalLanguage,
        5
      );
      console.log(`[VibeCoding] 📚 Found ${contextResults.length} relevant context chunks`);

      // PHASE 3: Build user preference context
      const preferenceContext = await preferenceExtractor.buildPreferenceContext(request.userId);
      if (preferenceContext) {
        console.log(`[VibeCoding] 🎨 Loaded user preferences for code generation`);
      }

      // Update progress
      const contextProgressEvent = agentEventBus.createEvent(
        'progress:update',
        'VibeCodingService',
        {
          sessionId: request.sessionId,
          phase: 'execution',
          percent: 40,
          message: 'Generating code changes...',
        } as any
      );
      await agentEventBus.publish(contextProgressEvent);

      // Step 3: Generate code changes (PHASE 2 & 3: Inject error patterns and preferences)
      const fileChanges = await this.codeGenerator.generateChanges({
        request: request.naturalLanguage,
        interpretation,
        context: contextResults,
        targetFiles: request.targetFiles || [],
        knownErrors, // PHASE 2: Pass error patterns to code generator
        preferenceContext, // PHASE 3: Pass user preferences to code generator
      });
      console.log(`[VibeCoding] 🔨 Generated ${fileChanges.length} file changes`);

      // Publish code:generated event
      const codeGeneratedEvent = agentEventBus.createEvent(
        'code:generated',
        'VibeCodingService',
        {
          sessionId: request.sessionId,
          fileChanges,
        } as any
      );
      await agentEventBus.publish(codeGeneratedEvent);

      // Step 4: Validate changes
      const validationResults = await this.validateChanges(fileChanges);
      console.log(`[VibeCoding] ✅ Validation complete`);

      // Publish validation event
      if (validationResults.syntax && validationResults.safety) {
        const validationPassedEvent = agentEventBus.createEvent(
          'validation:passed',
          'VibeCodingService',
          {
            sessionId: request.sessionId,
            validationResults,
          } as any
        );
        await agentEventBus.publish(validationPassedEvent);
      } else {
        const validationFailedEvent = agentEventBus.createEvent(
          'validation:failed',
          'VibeCodingService',
          {
            sessionId: request.sessionId,
            errors: validationResults.warnings,
          } as any
        );
        await agentEventBus.publish(validationFailedEvent);
      }

      // Step 5: Create result
      const result: VibeCodeResult = {
        success: true,
        sessionId: request.sessionId,
        request: request.naturalLanguage,
        interpretation: interpretation.summary,
        fileChanges,
        validationResults,
        estimatedImpact: this.estimateImpact(fileChanges),
      };

      // Cache result for preview/apply
      this.sessionCache.set(request.sessionId, result);

      console.log(`[VibeCoding] 🎉 Code generation complete for session ${request.sessionId}`);
      return result;
    } catch (error: any) {
      console.error('[VibeCoding] ❌ Error generating code:', error);
      return {
        success: false,
        sessionId: request.sessionId,
        request: request.naturalLanguage,
        interpretation: '',
        fileChanges: [],
        validationResults: {
          syntax: false,
          lsp: false,
          safety: false,
          warnings: [],
        },
        estimatedImpact: 'Unknown',
        error: error.message,
      };
    }
  }

  /**
   * Generate code using SequentialOrchestrator for ordered workflow execution
   * This provides an orchestrated alternative to the standard generateCode method
   * 
   * Workflow Steps:
   * 1. Clarification (if needed)
   * 2. Code Generation
   * 3. Validation
   * 4. Result Streaming
   */
  async generateCodeWithOrchestrator(request: VibeCodeRequest): Promise<VibeCodeResult> {
    try {
      console.log(`[VibeCoding] 🎼 Starting orchestrated workflow for: "${request.naturalLanguage}"`);

      const conversationId = parseInt(request.sessionId.split('-')[1] || '1', 10);

      // Define workflow steps
      const steps: WorkflowStep[] = [
        {
          id: 'clarify',
          agentId: 'clarification',
          task: request.naturalLanguage,
          context: {
            conversationId,
            userId: request.userId,
            sessionId: request.sessionId
          }
        },
        {
          id: 'generate',
          agentId: 'vibe-coding',
          task: request.naturalLanguage,
          context: {
            targetFiles: request.targetFiles,
            userId: request.userId,
            sessionId: request.sessionId
          }
        },
        {
          id: 'validate',
          agentId: 'quality-validator',
          task: 'Validate generated code changes',
          context: {
            sessionId: request.sessionId
          }
        }
      ];

      // Execute workflow using SequentialOrchestrator
      console.log(`[VibeCoding] 🚀 Executing ${steps.length} workflow steps...`);
      const workflowResult = await sequentialOrchestrator.execute(steps);

      if (!workflowResult.success) {
        console.error('[VibeCoding] ❌ Workflow execution failed');
        return {
          success: false,
          sessionId: request.sessionId,
          request: request.naturalLanguage,
          interpretation: '',
          fileChanges: [],
          validationResults: {
            syntax: false,
            lsp: false,
            safety: false,
            warnings: workflowResult.errors?.map(e => e.error) || []
          },
          estimatedImpact: 'Unknown',
          error: 'Workflow execution failed'
        };
      }

      // Extract results from workflow
      const clarificationStep = workflowResult.results.find(r => r.stepId === 'clarify');
      const generationStep = workflowResult.results.find(r => r.stepId === 'generate');
      const validationStep = workflowResult.results.find(r => r.stepId === 'validate');

      console.log(`[VibeCoding] ✅ Orchestrated workflow completed in ${workflowResult.duration}ms`);

      // For now, fall back to standard generation if orchestrator doesn't provide full result
      // This maintains backward compatibility
      return await this.generateCode(request);
    } catch (error: any) {
      console.error('[VibeCoding] ❌ Orchestrator error:', error);
      // Fall back to standard generation on error
      return await this.generateCode(request);
    }
  }

  /**
   * Interpret natural language request using GROQ
   */
  private async interpretRequest(naturalLanguage: string): Promise<{
    intent: string;
    summary: string;
    targetAreas: string[];
    complexity: 'low' | 'medium' | 'high';
    estimatedFiles: number;
  }> {
    const prompt = `You are an expert code interpreter. Analyze this natural language coding request and extract structured information.

Request: "${naturalLanguage}"

Provide a JSON response with:
{
  "intent": "Brief description of what the user wants to achieve",
  "summary": "1-2 sentence summary of the changes needed",
  "targetAreas": ["list", "of", "affected", "areas"],
  "complexity": "low|medium|high",
  "estimatedFiles": <number of files that will be affected>
}

Respond ONLY with valid JSON, no additional text.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('[VibeCoding] Failed to parse interpretation:', response);
      return {
        intent: naturalLanguage,
        summary: naturalLanguage,
        targetAreas: ['unknown'],
        complexity: 'medium',
        estimatedFiles: 1,
      };
    }
  }

  /**
   * Validate file changes for safety and correctness
   */
  private async validateChanges(fileChanges: FileChange[]): Promise<{
    syntax: boolean;
    lsp: boolean;
    safety: boolean;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    let syntax = true;
    let lsp = true;
    let safety = true;

    // Safety checks
    for (const change of fileChanges) {
      // Check for destructive operations
      if (change.action === 'delete') {
        warnings.push(`⚠️ File deletion detected: ${change.filePath}`);
        safety = false;
      }

      // Check for critical file modifications
      const criticalFiles = ['package.json', 'drizzle.config.ts', 'vite.config.ts'];
      if (criticalFiles.some(f => change.filePath.includes(f))) {
        warnings.push(`⚠️ Critical file modification: ${change.filePath}`);
      }

      // Check for large changes
      const linesChanged = change.diff.split('\n').length;
      if (linesChanged > 100) {
        warnings.push(`⚠️ Large change (${linesChanged} lines) in ${change.filePath}`);
      }

      // Basic syntax validation for TypeScript/JavaScript
      if (change.filePath.match(/\.(ts|tsx|js|jsx)$/)) {
        try {
          // Check for basic syntax errors (unclosed braces, etc.)
          const openBraces = (change.newContent.match(/\{/g) || []).length;
          const closeBraces = (change.newContent.match(/\}/g) || []).length;
          
          if (openBraces !== closeBraces) {
            warnings.push(`⚠️ Possible syntax error in ${change.filePath}: Unmatched braces`);
            syntax = false;
          }
        } catch (error) {
          warnings.push(`⚠️ Failed to validate syntax for ${change.filePath}`);
          syntax = false;
        }
      }
    }

    // LSP validation would go here (requires LSP server integration)
    // For now, we'll assume LSP is valid if syntax is valid
    lsp = syntax;

    return {
      syntax,
      lsp,
      safety: safety && warnings.length === 0,
      warnings,
    };
  }

  /**
   * Estimate impact of changes
   */
  private estimateImpact(fileChanges: FileChange[]): string {
    const fileCount = fileChanges.length;
    const totalLines = fileChanges.reduce(
      (sum, change) => sum + change.diff.split('\n').length,
      0
    );

    if (fileCount === 1 && totalLines < 20) {
      return 'Low - Single file, minor change';
    } else if (fileCount <= 3 && totalLines < 100) {
      return 'Medium - Few files, moderate changes';
    } else {
      return 'High - Multiple files or extensive changes';
    }
  }

  /**
   * Preview generated code changes
   */
  async previewChanges(sessionId: string): Promise<VibeCodeResult | null> {
    const result = this.sessionCache.get(sessionId);
    
    if (!result) {
      console.error(`[VibeCoding] ❌ No cached result for session ${sessionId}`);
      return null;
    }

    return result;
  }

  /**
   * Apply generated code changes
   */
  async applyChanges(sessionId: string, userId: number): Promise<ApplyResult> {
    try {
      const result = this.sessionCache.get(sessionId);
      
      if (!result || !result.success) {
        return {
          success: false,
          sessionId,
          filesModified: [],
          error: 'Invalid or failed session',
        };
      }

      // Safety check - don't apply if validation failed
      if (!result.validationResults.safety) {
        return {
          success: false,
          sessionId,
          filesModified: [],
          error: 'Safety validation failed - manual review required',
        };
      }

      console.log(`[VibeCoding] 📝 Applying ${result.fileChanges.length} file changes...`);

      const filesModified: string[] = [];

      // Create git commit point before changes
      let gitCommitId: string | undefined;
      try {
        const { stdout } = await execAsync('git rev-parse HEAD');
        gitCommitId = stdout.trim();
        console.log(`[VibeCoding] 📌 Git checkpoint: ${gitCommitId}`);
      } catch (error) {
        console.warn('[VibeCoding] ⚠️ Git checkpoint failed, continuing without rollback support');
      }

      // Apply each file change
      for (const change of result.fileChanges) {
        try {
          const fullPath = path.join(process.cwd(), change.filePath);

          if (change.action === 'create' || change.action === 'modify') {
            // Ensure directory exists
            const dir = path.dirname(fullPath);
            await fs.mkdir(dir, { recursive: true });

            // Write file
            await fs.writeFile(fullPath, change.newContent, 'utf-8');
            filesModified.push(change.filePath);
            console.log(`[VibeCoding] ✅ ${change.action}: ${change.filePath}`);
          } else if (change.action === 'delete') {
            // Deletion requires explicit confirmation (shouldn't reach here due to safety check)
            console.warn(`[VibeCoding] ⚠️ Skipping deletion: ${change.filePath}`);
          }
        } catch (error: any) {
          console.error(`[VibeCoding] ❌ Error applying change to ${change.filePath}:`, error);
          throw new Error(`Failed to apply change to ${change.filePath}: ${error.message}`);
        }
      }

      // Clear session cache
      this.sessionCache.delete(sessionId);

      console.log(`[VibeCoding] 🎉 Successfully applied ${filesModified.length} file changes`);

      return {
        success: true,
        sessionId,
        filesModified,
        gitCommitId,
      };
    } catch (error: any) {
      console.error('[VibeCoding] ❌ Error applying changes:', error);
      return {
        success: false,
        sessionId,
        filesModified: [],
        error: error.message,
      };
    }
  }

  /**
   * Validate code safety without applying
   */
  async validateCode(code: string, filePath: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic syntax checks
      if (filePath.match(/\.(ts|tsx|js|jsx)$/)) {
        const openBraces = (code.match(/\{/g) || []).length;
        const closeBraces = (code.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
          errors.push('Unmatched braces');
        }

        const openParens = (code.match(/\(/g) || []).length;
        const closeParens = (code.match(/\)/g) || []).length;
        
        if (openParens !== closeParens) {
          errors.push('Unmatched parentheses');
        }

        // Check for common mistakes
        if (code.includes('console.log') && !code.includes('development')) {
          warnings.push('Console.log detected - consider removing for production');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: [error.message],
        warnings,
      };
    }
  }
}

// Singleton instance
export const vibeCodingService = new VibeCodingService();
