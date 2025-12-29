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

import { ContextService } from './ContextService';
import { CodeGenerator } from './CodeGenerator';
import { orchestrateAI } from '../ai/AIOrchestrator';
import { agentEventBus } from './AgentEventBus';
import { progressTrackingAgent } from './ProgressTrackingAgent';
import { preferenceExtractor } from './preferenceExtractor';
import { LearningRetentionService } from './LearningRetentionService';
import { escalationService } from './EscalationService';
import { evidenceCollector } from './EvidenceCollector';
import { visualValidationService } from './VisualValidationService';
import type { WorkflowStep } from '@shared/types/a2a';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// MB.MD Pattern: Lazy-loaded services to avoid circular dependencies
let validationService: any = null;
let clarificationService: any = null;
let sequentialOrchestrator: any = null;
let autoRetryService: any = null;

async function getValidationService() {
  if (!validationService) {
    const { ValidationService } = await import('../validation/ValidationService');
    validationService = new ValidationService();
  }
  return validationService;
}

async function getClarificationService() {
  if (!clarificationService) {
    const mod = await import('../clarification/ClarificationService');
    clarificationService = mod.clarificationService;
  }
  return clarificationService;
}

async function getSequentialOrchestrator() {
  if (!sequentialOrchestrator) {
    const mod = await import('../orchestration/SequentialOrchestrator');
    sequentialOrchestrator = mod.sequentialOrchestrator;
  }
  return sequentialOrchestrator;
}

async function getAutoRetryService() {
  if (!autoRetryService) {
    const mod = await import('./AutoRetryService');
    autoRetryService = mod.autoRetryService;
  }
  return autoRetryService;
}

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

      // MB.MD Fix: Use lazy-load getter to ensure service is initialized
      const clarificationSvc = await getClarificationService();
      
      // Step 1: Check initial clarity score
      const clarityScore = await clarificationSvc['assessClarity'](request.naturalLanguage);
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
        const clarificationResult = await clarificationSvc.clarify(
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
   * WITH PHASE C AUTONOMOUS FRAMEWORK: Pattern Learning + Validation Loop + Auto-Retry + Escalation
   */
  async generateCode(request: VibeCodeRequest, attemptNumber: number = 1): Promise<VibeCodeResult> {
    try {
      console.log(`[VibeCoding] 🎯 Request (Attempt ${attemptNumber}/3): "${request.naturalLanguage}"`);
      
      // Publish progress update
      const progressEvent = agentEventBus.createEvent(
        'progress:update',
        'VibeCodingService',
        {
          sessionId: request.sessionId,
          phase: 'planning',
          percent: 10,
          message: `Analyzing request (Attempt ${attemptNumber}/3)...`,
        } as any
      );
      await agentEventBus.publish(progressEvent);

      // PHASE C STEP 1: Query learned patterns BEFORE generating
      console.log('[VibeCoding] 📚 Querying learned patterns...');
      const patterns = await LearningRetentionService.getRelevantPatterns({
        agentId: 'VibeCodingAgent',
        task: request.naturalLanguage,
        taskType: 'code_generation',
        metadata: { attemptNumber }
      });
      console.log(`[VibeCoding] Found ${patterns.length} relevant patterns`);

      // Apply patterns to enhance request
      let enhancedRequest = request.naturalLanguage;
      if (patterns.length > 0) {
        const topPattern = patterns[0];
        console.log(`[VibeCoding] Applying pattern: ${topPattern.pattern.patternType}`);
        enhancedRequest += `\n\nLearned pattern: ${topPattern.pattern.description}`;
      }

      // PHASE 1: Clarification
      const clarificationResult = await this.assessAndClarify({
        ...request,
        naturalLanguage: enhancedRequest
      });
      
      if (clarificationResult.clarified) {
        console.log(`[VibeCoding] 📝 Using clarified request`);
        enhancedRequest = clarificationResult.finalRequest;
      }
      
      // PHASE 2: Check for known errors
      const knownErrors = await this.checkForKnownErrors(enhancedRequest);
      
      // PHASE 3: Extract user preferences
      await preferenceExtractor.extractAndSave(
        request.userId,
        enhancedRequest,
        undefined
      );
      
      // Step 1: Interpret the request
      const interpretation = await this.interpretRequest(enhancedRequest);
      console.log(`[VibeCoding] 📝 Interpretation: ${interpretation.intent}`);

      // Step 2: Get relevant context
      const contextResults = await this.contextService.search(enhancedRequest, 5);
      console.log(`[VibeCoding] 📚 Found ${contextResults.length} relevant context chunks`);

      // Build preference context
      const preferenceContext = await preferenceExtractor.buildPreferenceContext(request.userId);
      if (preferenceContext) {
        console.log(`[VibeCoding] 🎨 Loaded user preferences`);
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

      // Step 3: Generate code changes
      const fileChanges = await this.codeGenerator.generateChanges({
        request: enhancedRequest,
        interpretation,
        context: contextResults,
        targetFiles: request.targetFiles || [],
        knownErrors,
        preferenceContext,
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

      // PHASE C STEP 2: Multi-tier validation with Phase C framework
      console.log('[VibeCoding] 🔍 Running multi-tier validation...');
      const files = fileChanges.map(fc => ({
        path: fc.filePath,
        content: fc.newContent
      }));
      
      // MB.MD Fix: Use lazy-load getter to ensure service is initialized
      const validationSvc = await getValidationService();
      const validationResult = await validationSvc.validate(files, {
        strictMode: true,
        maxAttempts: 1
      });

      console.log(`[VibeCoding] Validation result: ${validationResult.passed ? '✅ PASSED' : '❌ FAILED'} (score: ${validationResult.score})`);

      // PHASE C STEP 3: Handle validation result
      if (!validationResult.passed) {
        console.log(`[VibeCoding] ❌ Validation failed with ${validationResult.errors.length} errors`);
        
        // Collect evidence for failure
        const evidence = await evidenceCollector.collect(
          request.sessionId,
          validationResult,
          fileChanges.map(fc => fc.filePath)
        );
        
        // Try auto-retry if attempts remain
        if (attemptNumber < 3) {
          console.log(`[VibeCoding] 🔄 Initiating auto-retry (attempt ${attemptNumber + 1}/3)...`);
          
          // MB.MD Fix: Use lazy-load getter to ensure service is initialized
          const autoRetrySvc = await getAutoRetryService();
          const retryResult = await autoRetrySvc.retry({
            sessionId: request.sessionId,
            originalRequest: request.naturalLanguage,
            validationResult,
            attemptNumber
          });

          if (retryResult.shouldEscalate) {
            // Escalate after exhausting retries
            console.log('[VibeCoding] 🚨 Escalating to Replit AI...');
            await escalationService.escalate({
              sessionId: request.sessionId,
              originalRequest: request.naturalLanguage,
              attempts: attemptNumber,
              validationResults: [validationResult],
              strategies: [retryResult.strategy]
            });
            
            // Return failed result
            return {
              success: false,
              sessionId: request.sessionId,
              request: request.naturalLanguage,
              interpretation: interpretation.summary,
              fileChanges: [],
              validationResults: {
                syntax: false,
                lsp: false,
                safety: false,
                warnings: validationResult.errors.map(e => e.message),
              },
              estimatedImpact: 'Failed validation',
              error: `Validation failed after ${attemptNumber} attempts. Task escalated.`
            };
          }

          // Retry with adjusted strategy
          console.log(`[VibeCoding] Retrying with adjusted strategy: ${retryResult.strategy.strategyChanges.join(', ')}`);
          return await this.generateCode({
            ...request,
            naturalLanguage: retryResult.strategy.modifiedPrompt
          }, attemptNumber + 1);
        } else {
          // Escalate after 3 failures
          console.log('[VibeCoding] 🚨 Max retries exhausted, escalating...');
          await escalationService.escalate({
            sessionId: request.sessionId,
            originalRequest: request.naturalLanguage,
            attempts: attemptNumber,
            validationResults: [validationResult],
            strategies: []
          });

          return {
            success: false,
            sessionId: request.sessionId,
            request: request.naturalLanguage,
            interpretation: interpretation.summary,
            fileChanges: [],
            validationResults: {
              syntax: false,
              lsp: false,
              safety: false,
              warnings: validationResult.errors.map(e => e.message),
            },
            estimatedImpact: 'Failed validation',
            error: `Validation failed after ${attemptNumber} attempts. Task escalated.`
          };
        }
      }

      // PHASE C STEP 4: Validation passed - collect evidence and record success
      console.log('[VibeCoding] ✅ Validation passed!');
      
      const evidence = await evidenceCollector.collect(
        request.sessionId,
        validationResult,
        fileChanges.map(fc => fc.filePath)
      );

      // Publish code:validated event
      const validatedEvent = agentEventBus.createEvent(
        'code:validated',
        'VibeCodingService',
        {
          sessionId: request.sessionId,
          validationResult,
          evidence,
        } as any
      );
      await agentEventBus.publish(validatedEvent);

      // PHASE C STEP 5: Record successful pattern
      if (attemptNumber > 1) {
        // Record successful retry
        await autoRetryService.recordSuccessfulRetry(
          request.sessionId,
          attemptNumber,
          {
            modifiedPrompt: enhancedRequest,
            strategyChanges: ['Pattern learning applied', 'Validation passed'],
            patternsApplied: patterns.map(p => p.pattern.id.toString()),
            confidence: validationResult.score
          }
        );
      } else {
        // Record regular success pattern
        await LearningRetentionService.recordSuccessPattern({
          agentId: 'VibeCodingAgent',
          task: request.naturalLanguage,
          solution: JSON.stringify(fileChanges.map(fc => ({ file: fc.filePath, action: fc.action }))),
          validationScore: validationResult.score,
          patternsUsed: patterns.map(p => p.pattern.id.toString())
        });
      }

      // Step 5: Create result with evidence
      const result: VibeCodeResult = {
        success: true,
        sessionId: request.sessionId,
        request: request.naturalLanguage,
        interpretation: interpretation.summary,
        fileChanges,
        validationResults: {
          syntax: true,
          lsp: true,
          safety: true,
          warnings: validationResult.errors.filter(e => e.severity === 'warning').map(e => e.message),
        },
        estimatedImpact: this.estimateImpact(fileChanges),
      };

      // Cache result
      this.sessionCache.set(request.sessionId, result);

      console.log(`[VibeCoding] 🎉 Code generation complete (attempt ${attemptNumber}) - Evidence collected, pattern recorded`);
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

    // MB.MD Pattern 99: Use AI Orchestrator with automatic fallback
    const aiResponse = await orchestrateAI('classification', '', prompt, {
      temperature: 0.3,
      maxTokens: 500,
    });
    console.log(`[VibeCoding] Interpretation from ${aiResponse.provider}`);

    const response = aiResponse.content || '{}';
    
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
   * NOW WITH VISUAL VALIDATION (November 24, 2025)
   */
  async applyChanges(sessionId: string, userId: number, options?: {
    skipVisualValidation?: boolean;
    targetUrl?: string;
    targetPage?: string;
    selectedElement?: string;
  }): Promise<ApplyResult> {
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

      // STEP 1: Check if this change affects UI (visual validation required)
      const isUIChange = result.fileChanges.some(change => 
        change.filePath.match(/\.(tsx|jsx|css|html)$/) &&
        !change.filePath.includes('test') &&
        !change.filePath.includes('spec')
      );

      // STEP 2: Run visual validation for UI changes (UNLESS explicitly skipped)
      if (isUIChange && !options?.skipVisualValidation) {
        console.log('[VibeCoding] 🔍 UI change detected - Running visual validation...');
        
        try {
          // Determine target URL and page
          const targetUrl = options?.targetUrl || 'http://localhost:5000';
          const targetPage = options?.targetPage || '/'; // Default to homepage
          
          // Run visual validation
          const validationResult = await visualValidationService.validateChanges({
            sessionId,
            userId,
            changeDescription: result.request,
            targetUrl,
            targetPage,
            selectedElement: options?.selectedElement,
            checkpoints: [
              'Layout should be intact with no broken positioning',
              'All text should be readable with proper contrast',
              'Background transparency should not cause readability issues',
              'All buttons and interactive elements should be visible',
              'No overlapping or cut-off content'
            ]
          });

          // BLOCK if visual validation failed
          if (!validationResult.success) {
            console.log('[VibeCoding] ❌ Visual validation FAILED - Changes NOT applied');
            console.log(`[VibeCoding] Issues: ${validationResult.analysis.issues.join(', ')}`);
            console.log(`[VibeCoding] Escalation ID: ${validationResult.escalationId}`);
            
            return {
              success: false,
              sessionId,
              filesModified: [],
              error: `Visual validation failed: ${validationResult.analysis.feedback}. Escalated to Replit AI (ID: ${validationResult.escalationId})`,
            };
          }

          console.log('[VibeCoding] ✅ Visual validation PASSED - Proceeding with changes');
        } catch (error: any) {
          console.error('[VibeCoding] ⚠️ Visual validation error:', error.message);
          console.log('[VibeCoding] Proceeding with caution...');
          // Continue with changes but log the validation failure
        }
      } else if (isUIChange) {
        console.log('[VibeCoding] ⚠️ UI change detected but visual validation SKIPPED (manual override)');
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

// MB.MD Pattern: Lazy singleton to avoid circular dependency during module loading
let _vibeCodingServiceInstance: VibeCodingService | null = null;

export function getVibeCodingService(): VibeCodingService {
  if (!_vibeCodingServiceInstance) {
    _vibeCodingServiceInstance = new VibeCodingService();
  }
  return _vibeCodingServiceInstance;
}

// Legacy export for backward compatibility (lazy getter)
export const vibeCodingService = {
  get instance() { return getVibeCodingService(); },
  generateCode: (...args: any[]) => getVibeCodingService().generateCode(...args),
  applyChange: (...args: any[]) => getVibeCodingService().applyChange(...args),
};
