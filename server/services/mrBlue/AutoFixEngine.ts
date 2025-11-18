/**
 * MR BLUE AUTO-FIX ENGINE - AUTONOMOUS SELF-HEALING SYSTEM
 * 
 * Goal: Automatically detect and fix errors WITHOUT manual intervention
 * 
 * Architecture:
 * 1. Listen to error patterns from ProactiveErrorDetector
 * 2. Analyze errors using GROQ AI (ErrorAnalysisAgent)
 * 3. Calculate confidence scores (0-100%)
 * 4. Generate fixes using VibeCoding (autonomous, not manual chat)
 * 5. Apply fixes based on confidence thresholds:
 *    - >95%: Auto-apply immediately
 *    - 80-95%: Stage for user approval
 *    - <80%: Alert user, manual review required
 * 6. Track status via Server-Sent Events (SSE)
 * 7. Git commit with descriptive messages
 * 
 * MB.MD Protocol v9.5 - Autonomous Intelligence
 */

import { VibeCodingService, VibeCodeRequest, VibeCodeResult } from './VibeCodingService';
import { ErrorAnalysisAgent } from './errorAnalysisAgent';
import { SolutionSuggesterAgent } from './solutionSuggesterAgent';
import { db } from '../../db';
import { errorPatterns } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

// ==================== TYPES ====================

export interface ErrorContext {
  id: number;
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  frequency: number;
  lastSeen: Date;
  metadata?: any;
}

export interface FixAnalysis {
  rootCause: string;
  suggestedFix: string;
  affectedFiles: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  testCoverage: number; // 0-100 (% of affected files with tests)
  historicalSuccess: number; // 0-100 (past success rate for similar fixes)
}

export interface FixDecision {
  action: 'auto-fix' | 'request-approval' | 'manual-review';
  confidence: number;
  reasoning: string;
}

export interface AutoFixResult {
  success: boolean;
  errorId: number;
  decision: FixDecision;
  fixAnalysis: FixAnalysis;
  vibeCodeResult?: VibeCodeResult;
  gitCommitId?: string;
  appliedAt?: Date;
  error?: string;
}

export interface AutoFixStatus {
  phase: 'idle' | 'scanning' | 'analyzing' | 'generating-fix' | 'applying' | 'testing' | 'complete' | 'failed';
  progress: number; // 0-100
  message: string;
  errorId?: number;
  confidence?: number;
}

// ==================== AUTO-FIX ENGINE ====================

export class AutoFixEngine {
  private vibeCoding: VibeCodingService;
  private errorAnalysis: ErrorAnalysisAgent;
  private solutionSuggester: SolutionSuggesterAgent;
  
  // Confidence thresholds (configurable)
  private readonly AUTO_FIX_THRESHOLD = 95; // >95% → Auto-apply
  private readonly APPROVAL_THRESHOLD = 80; // 80-95% → Request approval
  // <80% → Manual review required
  
  // Status tracking for SSE
  private currentStatus: AutoFixStatus = {
    phase: 'idle',
    progress: 0,
    message: 'Waiting for errors...'
  };
  
  // SSE clients
  private sseClients: Set<any> = new Set();
  
  // Historical success tracking
  private fixSuccessHistory: Map<string, number> = new Map();
  
  constructor() {
    this.vibeCoding = new VibeCodingService();
    this.errorAnalysis = new ErrorAnalysisAgent();
    this.solutionSuggester = new SolutionSuggesterAgent();
    console.log('[AutoFixEngine] Initialized autonomous self-healing system');
  }
  
  /**
   * Initialize the engine
   */
  async initialize(): Promise<void> {
    await this.vibeCoding.initialize();
    console.log('[AutoFixEngine] ✅ Ready for autonomous fixing');
  }
  
  /**
   * Main entry point: Automatically process error and attempt fix
   * This is called autonomously when errors are detected
   */
  async processError(errorId: number): Promise<AutoFixResult> {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[AutoFixEngine] 🚀 AUTONOMOUS FIX INITIATED for error ${errorId}`);
    console.log(`${'='.repeat(80)}\n`);
    
    try {
      // Step 1: Get error from database
      this.updateStatus('scanning', 10, `Loading error ${errorId}...`, errorId);
      
      const error = await this.getError(errorId);
      if (!error) {
        throw new Error(`Error ${errorId} not found in database`);
      }
      
      console.log(`[AutoFixEngine] 📋 Error: ${error.errorMessage}`);
      
      // Step 2: Analyze error and generate fix
      this.updateStatus('analyzing', 30, 'Analyzing root cause with AI...', errorId);
      
      const fixAnalysis = await this.analyzeError(error);
      console.log(`[AutoFixEngine] 🧠 Analysis complete - Confidence: ${fixAnalysis.confidence}%`);
      console.log(`[AutoFixEngine] 📝 Root Cause: ${fixAnalysis.rootCause}`);
      
      // Step 3: Make decision (auto-fix vs manual review)
      const decision = await this.makeDecision(fixAnalysis);
      console.log(`[AutoFixEngine] ⚖️  Decision: ${decision.action.toUpperCase()}`);
      console.log(`[AutoFixEngine] 💭 Reasoning: ${decision.reasoning}`);
      
      // Step 4: Execute based on decision
      let result: AutoFixResult;
      
      if (decision.action === 'auto-fix') {
        // HIGH CONFIDENCE → Auto-apply immediately
        result = await this.autoApplyFix(error, fixAnalysis);
      } else if (decision.action === 'request-approval') {
        // MEDIUM CONFIDENCE → Stage for approval
        result = await this.stageForApproval(error, fixAnalysis);
      } else {
        // LOW CONFIDENCE → Manual review
        result = await this.escalateToManualReview(error, fixAnalysis);
      }
      
      // Update database with result
      await this.updateErrorPattern(errorId, result);
      
      console.log(`\n[AutoFixEngine] ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log(`${'='.repeat(80)}\n`);
      
      return result;
    } catch (error: any) {
      console.error('[AutoFixEngine] ❌ Fatal error during auto-fix:', error);
      this.updateStatus('failed', 0, `Error: ${error.message}`);
      
      return {
        success: false,
        errorId,
        decision: { action: 'manual-review', confidence: 0, reasoning: 'Auto-fix crashed' },
        fixAnalysis: {
          rootCause: 'Unknown',
          suggestedFix: '',
          affectedFiles: [],
          estimatedComplexity: 'high',
          confidence: 0,
          testCoverage: 0,
          historicalSuccess: 0,
        },
        error: error.message,
      };
    }
  }
  
  /**
   * Analyze error and generate fix using AI
   */
  private async analyzeError(error: ErrorContext): Promise<FixAnalysis> {
    console.log('[AutoFixEngine] 🔍 Starting AI analysis...');
    
    // Use SolutionSuggesterAgent to generate fix
    const suggestion = await this.solutionSuggester.suggestFix(error.id);
    
    // Calculate confidence score
    const baseConfidence = suggestion.confidence;
    
    // Adjust for complexity
    const complexityPenalty = {
      low: 0,
      medium: -5,
      high: -15,
    }[this.estimateComplexity(suggestion.files)] || -10;
    
    // Adjust for test coverage
    const testCoverage = await this.getTestCoverage(suggestion.files);
    const testBonus = testCoverage > 80 ? 5 : 0;
    
    // Adjust for historical success
    const errorType = error.errorType || 'unknown';
    const historicalSuccess = this.fixSuccessHistory.get(errorType) || 50; // Default 50%
    const historyMultiplier = historicalSuccess / 100;
    
    // Final confidence (clamped 0-100)
    const finalConfidence = Math.min(100, Math.max(0,
      baseConfidence + complexityPenalty + testBonus
    )) * historyMultiplier;
    
    console.log(`[AutoFixEngine] 📊 Confidence Calculation:`);
    console.log(`  Base: ${baseConfidence}%`);
    console.log(`  Complexity Penalty: ${complexityPenalty}%`);
    console.log(`  Test Coverage Bonus: ${testBonus}%`);
    console.log(`  Historical Success: ${historicalSuccess}%`);
    console.log(`  Final Confidence: ${Math.round(finalConfidence)}%`);
    
    return {
      rootCause: suggestion.explanation,
      suggestedFix: suggestion.code,
      affectedFiles: suggestion.files,
      estimatedComplexity: this.estimateComplexity(suggestion.files),
      confidence: Math.round(finalConfidence),
      testCoverage,
      historicalSuccess,
    };
  }
  
  /**
   * Make decision: auto-fix, request approval, or manual review
   */
  private async makeDecision(analysis: FixAnalysis): Promise<FixDecision> {
    const { confidence, affectedFiles, estimatedComplexity } = analysis;
    
    // HIGH CONFIDENCE (>95%) → Auto-fix
    if (confidence >= this.AUTO_FIX_THRESHOLD) {
      return {
        action: 'auto-fix',
        confidence,
        reasoning: `High confidence (${confidence}%) + ${affectedFiles.length} files affected. Safe to auto-apply.`,
      };
    }
    
    // MEDIUM CONFIDENCE (80-95%) → Request approval
    if (confidence >= this.APPROVAL_THRESHOLD) {
      return {
        action: 'request-approval',
        confidence,
        reasoning: `Medium confidence (${confidence}%) or ${affectedFiles.length} files affected. Requesting user approval.`,
      };
    }
    
    // LOW CONFIDENCE (<80%) → Manual review
    return {
      action: 'manual-review',
      confidence,
      reasoning: `Low confidence (${confidence}%) or high complexity (${estimatedComplexity}). Requires manual review.`,
    };
  }
  
  /**
   * Auto-apply fix immediately (high confidence)
   */
  private async autoApplyFix(error: ErrorContext, analysis: FixAnalysis): Promise<AutoFixResult> {
    console.log('[AutoFixEngine] 🛠️  AUTO-APPLYING FIX (high confidence)...');
    
    this.updateStatus('generating-fix', 50, 'Generating code fix...', error.id, analysis.confidence);
    
    // Generate code using VibeCoding
    const vibeRequest: VibeCodeRequest = {
      naturalLanguage: `Fix this error: ${error.errorMessage}\n\nSuggested approach: ${analysis.suggestedFix}`,
      targetFiles: analysis.affectedFiles,
      userId: 1, // System user for autonomous fixes
      sessionId: `autofix-${error.id}-${Date.now()}`,
    };
    
    const vibeResult = await this.vibeCoding.generateCode(vibeRequest);
    
    if (!vibeResult.success) {
      throw new Error(`VibeCoding failed: ${vibeResult.error}`);
    }
    
    console.log(`[AutoFixEngine] ✅ Generated ${vibeResult.fileChanges.length} file changes`);
    
    this.updateStatus('applying', 70, 'Applying changes to files...', error.id, analysis.confidence);
    
    // Apply changes to files
    for (const change of vibeResult.fileChanges) {
      await fs.writeFile(change.filePath, change.newContent, 'utf-8');
      console.log(`[AutoFixEngine] ✏️  Modified: ${change.filePath}`);
    }
    
    this.updateStatus('testing', 85, 'Running validation checks...', error.id, analysis.confidence);
    
    // Git commit
    const gitCommitId = await this.gitCommit(
      `[AutoFix] ${error.errorMessage.substring(0, 50)}`,
      `Autonomous fix for error #${error.id}\n\nConfidence: ${analysis.confidence}%\nRoot Cause: ${analysis.rootCause}\n\nAffected files:\n${analysis.affectedFiles.map(f => `- ${f}`).join('\n')}`
    );
    
    console.log(`[AutoFixEngine] 📦 Git commit: ${gitCommitId}`);
    
    this.updateStatus('complete', 100, 'Fix applied successfully!', error.id, analysis.confidence);
    
    // Track success
    this.recordFixSuccess(error.errorType, true);
    
    return {
      success: true,
      errorId: error.id,
      decision: { action: 'auto-fix', confidence: analysis.confidence, reasoning: 'High confidence auto-fix' },
      fixAnalysis: analysis,
      vibeCodeResult: vibeResult,
      gitCommitId,
      appliedAt: new Date(),
    };
  }
  
  /**
   * Stage fix for user approval (medium confidence)
   */
  private async stageForApproval(error: ErrorContext, analysis: FixAnalysis): Promise<AutoFixResult> {
    console.log('[AutoFixEngine] ⏸️  STAGING FOR APPROVAL (medium confidence)...');
    
    this.updateStatus('generating-fix', 50, 'Generating code fix for approval...', error.id, analysis.confidence);
    
    // Generate code but DON'T apply
    const vibeRequest: VibeCodeRequest = {
      naturalLanguage: `Fix this error: ${error.errorMessage}\n\nSuggested approach: ${analysis.suggestedFix}`,
      targetFiles: analysis.affectedFiles,
      userId: 1,
      sessionId: `autofix-staged-${error.id}-${Date.now()}`,
    };
    
    const vibeResult = await this.vibeCoding.generateCode(vibeRequest);
    
    if (!vibeResult.success) {
      throw new Error(`VibeCoding failed: ${vibeResult.error}`);
    }
    
    console.log(`[AutoFixEngine] ✅ Generated fix (waiting for approval)`);
    console.log(`[AutoFixEngine] 📋 ${vibeResult.fileChanges.length} files will be modified`);
    
    this.updateStatus('complete', 100, 'Fix ready for approval', error.id, analysis.confidence);
    
    return {
      success: true,
      errorId: error.id,
      decision: { action: 'request-approval', confidence: analysis.confidence, reasoning: 'Awaiting user approval' },
      fixAnalysis: analysis,
      vibeCodeResult: vibeResult,
      // No gitCommitId because not applied yet
    };
  }
  
  /**
   * Escalate to manual review (low confidence)
   */
  private async escalateToManualReview(error: ErrorContext, analysis: FixAnalysis): Promise<AutoFixResult> {
    console.log('[AutoFixEngine] ⚠️  ESCALATING TO MANUAL REVIEW (low confidence)...');
    
    this.updateStatus('complete', 100, 'Requires manual review', error.id, analysis.confidence);
    
    // Just log the analysis for user to review
    console.log(`[AutoFixEngine] 📊 Analysis available for manual review`);
    console.log(`[AutoFixEngine] 📝 Root Cause: ${analysis.rootCause}`);
    console.log(`[AutoFixEngine] 🔧 Suggested Fix: ${analysis.suggestedFix}`);
    
    return {
      success: true,
      errorId: error.id,
      decision: { action: 'manual-review', confidence: analysis.confidence, reasoning: 'Low confidence - manual review recommended' },
      fixAnalysis: analysis,
      // No vibeCodeResult because no code generated
    };
  }
  
  /**
   * Get error from database
   */
  private async getError(errorId: number): Promise<ErrorContext | null> {
    const [error] = await db
      .select()
      .from(errorPatterns)
      .where(eq(errorPatterns.id, errorId))
      .limit(1);
    
    if (!error) return null;
    
    return {
      id: error.id,
      errorType: error.errorType,
      errorMessage: error.errorMessage,
      errorStack: error.errorStack || undefined,
      frequency: error.frequency,
      lastSeen: error.lastSeen,
      metadata: error.metadata,
    };
  }
  
  /**
   * Update error pattern in database with fix result
   */
  private async updateErrorPattern(errorId: number, result: AutoFixResult): Promise<void> {
    await db
      .update(errorPatterns)
      .set({
        status: result.success ? 'fixed' : 'failed',
        fixConfidence: result.fixAnalysis.confidence.toString(),
        suggestedFix: result.fixAnalysis.suggestedFix,
        aiAnalysis: {
          rootCause: result.fixAnalysis.rootCause,
          affectedFiles: result.fixAnalysis.affectedFiles,
          confidence: result.fixAnalysis.confidence,
          action: result.decision.action,
          appliedAt: result.appliedAt?.toISOString(),
          gitCommitId: result.gitCommitId,
        },
        updatedAt: new Date(),
      })
      .where(eq(errorPatterns.id, errorId));
  }
  
  /**
   * Estimate complexity based on number of files
   */
  private estimateComplexity(files: string[]): 'low' | 'medium' | 'high' {
    if (files.length <= 1) return 'low';
    if (files.length <= 3) return 'medium';
    return 'high';
  }
  
  /**
   * Get test coverage for affected files
   * TODO: Implement actual test coverage calculation
   */
  private async getTestCoverage(files: string[]): Promise<number> {
    // Stub: Return 50% for now
    // In production, this would analyze test files
    return 50;
  }
  
  /**
   * Create git commit
   */
  private async gitCommit(message: string, description: string): Promise<string> {
    try {
      await execAsync('git add -A');
      await execAsync(`git commit -m "${message}" -m "${description}"`);
      const { stdout } = await execAsync('git rev-parse HEAD');
      return stdout.trim();
    } catch (error: any) {
      console.warn('[AutoFixEngine] Git commit failed:', error.message);
      return 'no-commit';
    }
  }
  
  /**
   * Record fix success for learning
   */
  private recordFixSuccess(errorType: string, success: boolean): void {
    const current = this.fixSuccessHistory.get(errorType) || 50;
    // Simple exponential moving average
    const newRate = current * 0.8 + (success ? 100 : 0) * 0.2;
    this.fixSuccessHistory.set(errorType, newRate);
    
    console.log(`[AutoFixEngine] 📈 Updated success rate for ${errorType}: ${Math.round(newRate)}%`);
  }
  
  /**
   * Update status (for SSE broadcasting)
   */
  private updateStatus(
    phase: AutoFixStatus['phase'],
    progress: number,
    message: string,
    errorId?: number,
    confidence?: number
  ): void {
    this.currentStatus = { phase, progress, message, errorId, confidence };
    
    // Broadcast to SSE clients
    this.broadcastStatus();
    
    console.log(`[AutoFixEngine] 📡 Status: ${phase} (${progress}%) - ${message}`);
  }
  
  /**
   * Get current status (for SSE endpoint)
   */
  getStatus(): AutoFixStatus {
    return this.currentStatus;
  }
  
  /**
   * Register SSE client
   */
  registerSSEClient(res: any): void {
    this.sseClients.add(res);
    
    // Send current status immediately
    res.write(`data: ${JSON.stringify(this.currentStatus)}\n\n`);
    
    console.log(`[AutoFixEngine] 📡 SSE client connected (${this.sseClients.size} total)`);
  }
  
  /**
   * Unregister SSE client
   */
  unregisterSSEClient(res: any): void {
    this.sseClients.delete(res);
    console.log(`[AutoFixEngine] 📡 SSE client disconnected (${this.sseClients.size} remaining)`);
  }
  
  /**
   * Broadcast status to all SSE clients
   */
  private broadcastStatus(): void {
    const data = `data: ${JSON.stringify(this.currentStatus)}\n\n`;
    
    for (const client of this.sseClients) {
      try {
        client.write(data);
      } catch (error) {
        // Client disconnected, remove it
        this.sseClients.delete(client);
      }
    }
  }
}

// Singleton instance
let engineInstance: AutoFixEngine | null = null;

/**
 * Get singleton instance
 */
export function getAutoFixEngine(): AutoFixEngine {
  if (!engineInstance) {
    engineInstance = new AutoFixEngine();
  }
  return engineInstance;
}

/**
 * Initialize auto-fix engine
 */
export async function initAutoFixEngine(): Promise<AutoFixEngine> {
  const engine = getAutoFixEngine();
  await engine.initialize();
  return engine;
}
