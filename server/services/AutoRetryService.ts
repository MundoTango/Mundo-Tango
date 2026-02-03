/**
 * AUTO-RETRY SERVICE - Phase C Autonomous Framework
 * 3-attempt retry with pattern learning
 * 
 * Features:
 * - Analyze validation failures
 * - Retrieve learned patterns
 * - Adjust strategy based on patterns
 * - Max 3 retry attempts
 * - Escalate after exhaustion
 */

import { LearningRetentionService } from './LearningRetentionService';
import { agentEventBus } from './AgentEventBus';
import type { ValidationResult } from './ValidationService';

export interface RetryContext {
  sessionId: string;
  originalRequest: string;
  validationResult: ValidationResult;
  attemptNumber: number;
}

export interface RetryStrategy {
  modifiedPrompt: string;
  strategyChanges: string[];
  patternsApplied: string[];
  confidence: number;
}

export interface RetryResult {
  success: boolean;
  attemptNumber: number;
  strategy: RetryStrategy;
  validationResult?: ValidationResult;
  shouldEscalate: boolean;
  reason?: string;
}

export class AutoRetryService {
  private maxAttempts = 3;

  /**
   * Retry a failed validation with learned patterns
   */
  async retry(
    context: RetryContext
  ): Promise<RetryResult> {
    const { sessionId, originalRequest, validationResult, attemptNumber } = context;

    console.log(`[AutoRetry] 🔄 Retry attempt ${attemptNumber}/${this.maxAttempts} for session ${sessionId}`);

    // Check if we should escalate
    if (attemptNumber >= this.maxAttempts) {
      console.log('[AutoRetry] ❌ Max attempts reached, escalating...');
      
      await agentEventBus.publish({
        id: `retry-exhausted-${sessionId}`,
        type: 'retry:exhausted',
        source: 'AutoRetryService',
        timestamp: Date.now(),
        sessionId,
        attempts: attemptNumber,
        errors: validationResult.errors.map(e => e.message)
      });

      return {
        success: false,
        attemptNumber,
        strategy: {
          modifiedPrompt: originalRequest,
          strategyChanges: [],
          patternsApplied: [],
          confidence: 0
        },
        shouldEscalate: true,
        reason: 'MAX_ATTEMPTS_EXCEEDED'
      };
    }

    // Publish retry attempt event
    await agentEventBus.publish({
      id: `retry-${sessionId}-${attemptNumber}`,
      type: 'retry:attempted',
      source: 'AutoRetryService',
      timestamp: Date.now(),
      sessionId,
      attemptNumber,
      maxAttempts: this.maxAttempts,
      reason: this.classifyFailureReason(validationResult)
    });

    // Step 1: Analyze failure
    const failureAnalysis = this.analyzeFailure(validationResult);
    console.log(`[AutoRetry] Failure analysis: ${failureAnalysis.rootCause}`);

    // Step 2: Retrieve relevant patterns
    const patterns = await LearningRetentionService.getRelevantPatterns({
      agentId: 'VibeCodingAgent',
      task: originalRequest,
      taskType: 'retry',
      metadata: {
        failureReason: failureAnalysis.rootCause,
        attemptNumber,
        errorTypes: failureAnalysis.errorTypes
      }
    });

    console.log(`[AutoRetry] Found ${patterns.length} relevant patterns for retry`);

    // Step 3: Adjust strategy
    const strategy = this.adjustStrategy(
      originalRequest,
      failureAnalysis,
      patterns
    );

    console.log(`[AutoRetry] Strategy adjusted: ${strategy.strategyChanges.join(', ')}`);

    return {
      success: false, // Actual success determined by VibeCodingService re-execution
      attemptNumber,
      strategy,
      shouldEscalate: false
    };
  }

  /**
   * Analyze why validation failed
   */
  private analyzeFailure(validationResult: ValidationResult): {
    rootCause: string;
    errorTypes: string[];
    severity: 'high' | 'medium' | 'low';
  } {
    const errors = validationResult.errors;
    const errorTypes = [...new Set(errors.map(e => e.severity))];
    
    // Classify root cause
    let rootCause = 'UNKNOWN_ERROR';
    
    if (errors.some(e => e.message.includes('syntax'))) {
      rootCause = 'SYNTAX_ERROR';
    } else if (errors.some(e => e.message.includes('type'))) {
      rootCause = 'TYPE_ERROR';
    } else if (errors.some(e => e.message.includes('undefined'))) {
      rootCause = 'UNDEFINED_REFERENCE';
    } else if (errors.some(e => e.message.includes('import'))) {
      rootCause = 'IMPORT_ERROR';
    }

    const severity = errors.some(e => e.severity === 'error') ? 'high' :
                     errors.some(e => e.severity === 'warning') ? 'medium' : 'low';

    return {
      rootCause,
      errorTypes,
      severity
    };
  }

  /**
   * Adjust retry strategy based on patterns
   */
  private adjustStrategy(
    originalRequest: string,
    failureAnalysis: { rootCause: string; errorTypes: string[] },
    patterns: any[]
  ): RetryStrategy {
    const strategyChanges: string[] = [];
    let modifiedPrompt = originalRequest;

    // Apply learned patterns
    if (patterns.length > 0) {
      const topPattern = patterns[0];
      strategyChanges.push(`Applied pattern: ${topPattern.pattern.patternType}`);
      
      // Modify prompt based on pattern
      modifiedPrompt += `\n\nLearned pattern: ${topPattern.pattern.description}`;
      
      if (topPattern.pattern.solution) {
        modifiedPrompt += `\nSuccessful approach: ${topPattern.pattern.solution}`;
      }
    }

    // Add error-specific guidance
    switch (failureAnalysis.rootCause) {
      case 'SYNTAX_ERROR':
        modifiedPrompt += '\n\nIMPORTANT: Ensure all syntax is valid TypeScript/JavaScript.';
        strategyChanges.push('Added syntax validation guidance');
        break;
      case 'TYPE_ERROR':
        modifiedPrompt += '\n\nIMPORTANT: All types must match TypeScript definitions.';
        strategyChanges.push('Added type safety guidance');
        break;
      case 'UNDEFINED_REFERENCE':
        modifiedPrompt += '\n\nIMPORTANT: All variables and imports must be defined.';
        strategyChanges.push('Added reference checking guidance');
        break;
      case 'IMPORT_ERROR':
        modifiedPrompt += '\n\nIMPORTANT: Use correct import paths and ensure modules exist.';
        strategyChanges.push('Added import validation guidance');
        break;
    }

    const confidence = patterns.length > 0 ? patterns[0].relevanceScore : 0.3;

    return {
      modifiedPrompt,
      strategyChanges,
      patternsApplied: patterns.map(p => p.pattern.id.toString()),
      confidence
    };
  }

  /**
   * Classify failure reason for event
   */
  private classifyFailureReason(validationResult: ValidationResult): string {
    const errors = validationResult.errors;
    
    if (errors.some(e => e.message.includes('syntax'))) {
      return 'Syntax errors detected';
    } else if (errors.some(e => e.message.includes('type'))) {
      return 'Type errors detected';
    } else if (errors.length > 5) {
      return `Multiple errors detected (${errors.length} total)`;
    } else {
      return `Validation failed: ${errors[0]?.message || 'Unknown error'}`;
    }
  }

  /**
   * Record successful retry pattern
   */
  async recordSuccessfulRetry(
    sessionId: string,
    attemptNumber: number,
    strategy: RetryStrategy
  ): Promise<void> {
    console.log(`[AutoRetry] ✅ Retry ${attemptNumber} succeeded, recording pattern...`);

    await agentEventBus.publish({
      id: `retry-succeeded-${sessionId}`,
      type: 'retry:succeeded',
      source: 'AutoRetryService',
      timestamp: Date.now(),
      sessionId,
      attemptNumber,
      strategy: strategy.strategyChanges
    });

    // Record pattern in LearningRetentionService
    await LearningRetentionService.recordSuccessPattern({
      agentId: 'AutoRetryService',
      task: `Retry after ${attemptNumber} attempts`,
      solution: JSON.stringify(strategy),
      validationScore: 1.0,
      patternsUsed: strategy.patternsApplied
    });
  }
}

export const autoRetryService = new AutoRetryService();
