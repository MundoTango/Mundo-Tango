/**
 * ESCALATION SERVICE - Phase C Autonomous Framework
 * Escalate tasks to Replit AI when auto-fix fails
 * 
 * Features:
 * - Classify escalation reasons
 * - Generate comprehensive reports
 * - Notify Replit AI via events + database
 * - Track escalation history
 */

import { db } from '../../db';
import { agentEventBus } from './AgentEventBus';
import type { ValidationResult } from '../validation/ValidationService';

export type EscalationReason =
  | 'CLARIFICATION_NEEDED'
  | 'INFRASTRUCTURE_ISSUE'
  | 'COMPLEXITY_EXCEEDED'
  | 'MAX_RETRIES_EXCEEDED'
  | 'UNKNOWN_ERROR';

export interface EscalationContext {
  sessionId: string;
  originalRequest: string;
  attempts: number;
  validationResults: ValidationResult[];
  strategies: any[];
}

export interface EscalationReport {
  id: string;
  sessionId: string;
  reason: EscalationReason;
  originalRequest: string;
  attempts: number;
  errorHistory: string[];
  strategiesTried: string[];
  evidence: {
    screenshots?: string[];
    logs: string[];
    lspErrors: string[];
    testResults?: any;
  };
  aiRecommendation: string;
  timestamp: Date;
}

export class EscalationService {
  /**
   * Escalate task to Replit AI
   */
  async escalate(context: EscalationContext): Promise<EscalationReport> {
    console.log(`[Escalation] 🚨 Escalating session ${context.sessionId} to Replit AI`);

    // Classify escalation reason
    const reason = this.classifyReason(context);
    
    // Generate AI recommendation
    const aiRecommendation = await this.generateRecommendation(context, reason);
    
    // Collect evidence
    const evidence = this.collectEvidence(context);
    
    // Create escalation report
    const report: EscalationReport = {
      id: `escalation-${context.sessionId}-${Date.now()}`,
      sessionId: context.sessionId,
      reason,
      originalRequest: context.originalRequest,
      attempts: context.attempts,
      errorHistory: this.extractErrors(context.validationResults),
      strategiesTried: this.extractStrategies(context.strategies),
      evidence,
      aiRecommendation,
      timestamp: new Date()
    };

    // Store in database (if schema exists)
    try {
      // TODO: Store in escalations table when schema is ready
      console.log('[Escalation] Report created:', {
        id: report.id,
        reason: report.reason,
        attempts: report.attempts
      });
    } catch (error) {
      console.warn('[Escalation] Could not store in database:', error);
    }

    // Publish escalation event
    await agentEventBus.publish({
      id: report.id,
      type: 'task:escalated',
      source: 'EscalationService',
      timestamp: Date.now(),
      sessionId: context.sessionId,
      reason: report.reason,
      attempts: report.attempts,
      recommendation: report.aiRecommendation
    });

    console.log(`[Escalation] ✅ Escalation report published: ${report.id}`);
    console.log(`[Escalation] Reason: ${report.reason}`);
    console.log(`[Escalation] Recommendation: ${report.aiRecommendation}`);

    return report;
  }

  /**
   * Classify why escalation is needed
   */
  private classifyReason(context: EscalationContext): EscalationReason {
    const errors = context.validationResults.flatMap(r => r.errors);
    
    // Check for clarification needs
    if (errors.some(e => e.message.includes('ambiguous') || e.message.includes('unclear'))) {
      return 'CLARIFICATION_NEEDED';
    }
    
    // Check for infrastructure issues
    if (errors.some(e => 
      e.message.includes('network') || 
      e.message.includes('timeout') ||
      e.message.includes('connection')
    )) {
      return 'INFRASTRUCTURE_ISSUE';
    }
    
    // Check for max retries
    if (context.attempts >= 3) {
      return 'MAX_RETRIES_EXCEEDED';
    }
    
    // Check for complexity
    if (errors.length > 10) {
      return 'COMPLEXITY_EXCEEDED';
    }
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Generate AI recommendation for Replit AI
   */
  private async generateRecommendation(
    context: EscalationContext,
    reason: EscalationReason
  ): Promise<string> {
    const errors = context.validationResults.flatMap(r => r.errors);
    const errorMessages = errors.map(e => e.message).slice(0, 5).join('; ');

    switch (reason) {
      case 'CLARIFICATION_NEEDED':
        return `User request is ambiguous. Suggest asking: "Could you clarify what you mean by '${context.originalRequest}'?" Specific areas of ambiguity: ${errorMessages}`;
      
      case 'INFRASTRUCTURE_ISSUE':
        return `Infrastructure/network issues detected. Check: API connectivity, database availability, external service status. Errors: ${errorMessages}`;
      
      case 'MAX_RETRIES_EXCEEDED':
        return `3 retry attempts failed. This requires human expertise. Tried strategies: ${context.strategies.map((s, i) => `Attempt ${i + 1}: ${s.strategyChanges?.join(', ') || 'N/A'}`).join(' | ')}. Persistent errors: ${errorMessages}`;
      
      case 'COMPLEXITY_EXCEEDED':
        return `Task complexity exceeds autonomous capabilities. Consider breaking into smaller sub-tasks. ${errors.length} errors detected across multiple areas: ${errorMessages}`;
      
      default:
        return `Unknown error pattern. Manual investigation required. Errors: ${errorMessages}`;
    }
  }

  /**
   * Collect evidence for escalation
   */
  private collectEvidence(context: EscalationContext): EscalationReport['evidence'] {
    return {
      logs: context.validationResults.flatMap(r => 
        r.errors.map(e => `[${e.severity}] ${e.file}:${e.line || '?'} - ${e.message}`)
      ),
      lspErrors: context.validationResults
        .filter(r => r.tier === 'LSP')
        .flatMap(r => r.errors.map(e => e.message)),
      screenshots: [], // Populated by EvidenceCollector
      testResults: null // Populated by EvidenceCollector
    };
  }

  /**
   * Extract error messages from validation results
   */
  private extractErrors(validationResults: ValidationResult[]): string[] {
    return validationResults.flatMap(r => 
      r.errors.map(e => `[${r.tier}] ${e.file}: ${e.message}`)
    );
  }

  /**
   * Extract strategies from retry attempts
   */
  private extractStrategies(strategies: any[]): string[] {
    return strategies.map((s, i) => 
      `Attempt ${i + 1}: ${s.strategyChanges?.join(', ') || 'No strategy recorded'}`
    );
  }

  /**
   * Mark escalation as resolved
   */
  async resolveEscalation(escalationId: string, resolution: string): Promise<void> {
    console.log(`[Escalation] ✅ Resolving escalation ${escalationId}: ${resolution}`);

    await agentEventBus.publish({
      id: `escalation-resolved-${escalationId}`,
      type: 'escalation:resolved',
      source: 'EscalationService',
      timestamp: Date.now(),
      escalationId,
      resolution
    });
  }
}

export const escalationService = new EscalationService();
