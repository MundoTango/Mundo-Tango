/**
 * Page Audit Service
 * MB.MD v9.0 - Self-Healing Page Agent System
 * November 18, 2025
 * 
 * Runs comprehensive audits on pages using activated agents
 * Target: <200ms audit time
 */

import { db } from '../../../shared/db';
import { 
  pageAudits, 
  agentBeliefs, 
  predictionErrors,
  type InsertPageAudit,
  type InsertAgentBeliefs,
  type InsertPredictionError,
  type SelectAgentBeliefs,
  type SelectPageAudit
} from '../../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface AuditIssue {
  category: 'ui_ux' | 'routing' | 'integration' | 'performance' | 'accessibility' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string;
  suggestedFix: string;
  agentId: string;
  surpriseScore?: number; // FEP: Prediction error magnitude (0-1)
  priority?: 'critical' | 'high' | 'medium' | 'low'; // FEP-based priority
}

export interface AuditResults {
  pageId: string;
  timestamp: Date;
  totalIssues: number;
  criticalIssues: number;
  issuesByCategory: {
    ui_ux: AuditIssue[];
    routing: AuditIssue[];
    integration: AuditIssue[];
    performance: AuditIssue[];
    accessibility: AuditIssue[];
    security: AuditIssue[];
  };
  hasIssues: boolean;
  auditDurationMs: number;
  auditorAgents: string[];
}

export class PageAuditService {
  /**
   * Run comprehensive audit on a page
   * MB.MD pattern: Work simultaneously (run all audits in parallel)
   */
  static async runComprehensiveAudit(pageId: string): Promise<AuditResults> {
    const startTime = Date.now();

    try {
      // Run all audits in parallel
      const [
        uiUxIssues,
        routingIssues,
        integrationIssues,
        performanceIssues,
        accessibilityIssues,
        securityIssues
      ] = await Promise.all([
        this.auditUIUX(pageId),
        this.auditRouting(pageId),
        this.auditIntegrations(pageId),
        this.auditPerformance(pageId),
        this.auditAccessibility(pageId),
        this.auditSecurity(pageId)
      ]);

      const issuesByCategory = {
        ui_ux: uiUxIssues,
        routing: routingIssues,
        integration: integrationIssues,
        performance: performanceIssues,
        accessibility: accessibilityIssues,
        security: securityIssues
      };

      const allIssues = [
        ...uiUxIssues,
        ...routingIssues,
        ...integrationIssues,
        ...performanceIssues,
        ...accessibilityIssues,
        ...securityIssues
      ];

      const totalIssues = allIssues.length;
      const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
      const hasIssues = totalIssues > 0;
      const auditDurationMs = Date.now() - startTime;

      const auditorAgents = [
        'EXPERT_11', // UI/UX
        'AGENT_6',   // Routing
        'AGENT_38',  // Integration
        'AGENT_52',  // Performance
        'AGENT_53',  // Accessibility
        'AGENT_1'    // Security
      ];

      const auditResults: AuditResults = {
        pageId,
        timestamp: new Date(),
        totalIssues,
        criticalIssues,
        issuesByCategory,
        hasIssues,
        auditDurationMs,
        auditorAgents
      };

      // Save audit to database
      await this.saveAudit(auditResults);

      console.log(`✅ Audit complete for ${pageId}: ${totalIssues} issues (${criticalIssues} critical) in ${auditDurationMs}ms`);

      return auditResults;
    } catch (error) {
      console.error(`❌ Failed to audit ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * UI/UX Audit (EXPERT_11)
   */
  private static async auditUIUX(pageId: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];

    // Placeholder - will be implemented with actual UI/UX checks
    // Examples: duplicate components, inconsistent spacing, missing dark mode variants

    return issues;
  }

  /**
   * Routing Audit (AGENT_6)
   */
  private static async auditRouting(pageId: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];

    // Placeholder - will be implemented with actual routing checks
    // Examples: duplicate routes, broken links, missing canonical URLs

    return issues;
  }

  /**
   * Integration Audit (AGENT_38)
   */
  private static async auditIntegrations(pageId: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];

    // Placeholder - will be implemented with actual integration checks
    // Examples: feature conflicts, missing agent communication, broken WebSocket

    return issues;
  }

  /**
   * Performance Audit (AGENT_52)
   */
  private static async auditPerformance(pageId: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];

    // Placeholder - will be implemented with actual performance checks
    // Examples: slow component renders, bundle size problems, memory leaks

    return issues;
  }

  /**
   * Accessibility Audit (AGENT_53)
   */
  private static async auditAccessibility(pageId: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];

    // Placeholder - will be implemented with actual accessibility checks
    // Examples: missing ARIA labels, keyboard navigation broken, contrast failures

    return issues;
  }

  /**
   * Security Audit (AGENT_1)
   */
  private static async auditSecurity(pageId: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];

    // Placeholder - will be implemented with actual security checks
    // Examples: XSS vulnerabilities, missing CSRF tokens, exposed secrets

    return issues;
  }

  /**
   * Save audit results to database
   * Gracefully skips saving if page not registered (prevents FK constraint violation)
   */
  private static async saveAudit(results: AuditResults): Promise<void> {
    try {
      // Check if page is registered before saving (prevents FK constraint violation)
      const { pageAgentRegistry } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const [pageReg] = await db
        .select()
        .from(pageAgentRegistry)
        .where(eq(pageAgentRegistry.pageId, results.pageId));

      if (!pageReg) {
        console.log(`⚠️ Skipping audit save for ${results.pageId} - page not registered yet`);
        return;
      }

      const auditData: InsertPageAudit = {
        pageId: results.pageId,
        totalIssues: results.totalIssues,
        criticalIssues: results.criticalIssues,
        uiUxIssues: results.issuesByCategory.ui_ux.length,
        routingIssues: results.issuesByCategory.routing.length,
        integrationIssues: results.issuesByCategory.integration.length,
        performanceIssues: results.issuesByCategory.performance.length,
        accessibilityIssues: results.issuesByCategory.accessibility.length,
        securityIssues: results.issuesByCategory.security.length,
        issuesByCategory: results.issuesByCategory,
        auditResults: results,
        auditorAgents: results.auditorAgents,
        auditDurationMs: results.auditDurationMs,
        hasIssues: results.hasIssues,
        healingRequired: results.totalIssues > 0,
        healingApplied: false
      };

      const [insertedAudit] = await db.insert(pageAudits).values(auditData).returning();
      console.log(`✅ Audit saved for ${results.pageId}`);

      // FEP: Update agent beliefs and track prediction errors
      await this.updateFEPBeliefs(results, insertedAudit.id);
    } catch (error) {
      console.error(`❌ Failed to save audit for ${results.pageId}:`, error);
      // Don't throw - allow orchestration to continue even if audit save fails
    }
  }

  /**
   * FEP: Update agent beliefs based on new observations (Bayesian inference)
   * MB.MD v9.2 Pattern 27: Free Energy Principle
   */
  private static async updateFEPBeliefs(results: AuditResults, auditId: number): Promise<void> {
    try {
      // Update beliefs for each auditor agent
      for (const agentId of results.auditorAgents) {
        // Get agent's prior beliefs
        const [priorBelief] = await db
          .select()
          .from(agentBeliefs)
          .where(
            and(
              eq(agentBeliefs.agentId, agentId),
              eq(agentBeliefs.pageId, results.pageId)
            )
          );

        const actualIssueCount = results.totalIssues;

        if (priorBelief) {
          // BAYESIAN UPDATE: posterior = (prior × likelihood) / evidence
          const prior = priorBelief.expectedIssueCount;
          const confidence = priorBelief.confidence;
          
          // Weighted average (simple Bayesian approximation)
          const posterior = (prior * confidence + actualIssueCount * (1 - confidence)) / 
                            (confidence + (1 - confidence));
          
          // Increase confidence (we learned something)
          const newConfidence = Math.min(confidence + 0.1, 0.95);

          // Prediction error (surprise)
          const predictionError = Math.abs(actualIssueCount - prior);
          const surpriseScore = Math.min(predictionError / 10, 1.0); // Normalize to 0-1

          // Update beliefs
          await db
            .update(agentBeliefs)
            .set({
              expectedIssueCount: posterior,
              confidence: newConfidence,
              lastObservation: results,
              lastObservedIssueCount: actualIssueCount,
              predictionError,
              observationCount: priorBelief.observationCount + 1,
              lastUpdated: new Date()
            })
            .where(eq(agentBeliefs.id, priorBelief.id));

          // Track prediction error for learning
          await db.insert(predictionErrors).values({
            pageId: results.pageId,
            agentId,
            predicted: prior,
            actual: actualIssueCount,
            error: predictionError,
            surpriseScore,
            predictionType: 'issue_count',
            auditId,
            beliefUpdated: true,
            actionTaken: predictionError > 0.5 ? 'high_priority_healing' : 'standard_healing'
          });

          console.log(`🧠 FEP: ${agentId} beliefs updated - Expected: ${prior.toFixed(2)} → ${posterior.toFixed(2)}, Surprise: ${surpriseScore.toFixed(3)}`);
        } else {
          // Initialize new belief for this agent/page combination
          await db.insert(agentBeliefs).values({
            agentId,
            pageId: results.pageId,
            expectedIssueCount: actualIssueCount,
            confidence: 0.3, // Start with low confidence
            lastObservation: results,
            lastObservedIssueCount: actualIssueCount,
            predictionError: 0,
            observationCount: 1
          });

          console.log(`🧠 FEP: Initialized beliefs for ${agentId} on ${results.pageId}`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to update FEP beliefs:', error);
      // Don't throw - FEP is enhancement, not critical path
    }
  }

  /**
   * FEP: Calculate surprise score (prediction error magnitude)
   * MB.MD v9.2 Pattern 27: High surprise = high information value
   */
  static async calculateSurpriseScore(
    pageId: string,
    agentId: string,
    actualValue: number
  ): Promise<number> {
    try {
      const [belief] = await db
        .select()
        .from(agentBeliefs)
        .where(
          and(
            eq(agentBeliefs.agentId, agentId),
            eq(agentBeliefs.pageId, pageId)
          )
        );

      if (!belief) {
        return 0.5; // Medium surprise for unknown pages
      }

      // Prediction error = |actual - predicted|
      const predictionError = Math.abs(actualValue - belief.expectedIssueCount);
      
      // Normalize to 0-1 (assume max 10 issues)
      const surpriseScore = Math.min(predictionError / 10, 1.0);

      return surpriseScore;
    } catch (error) {
      console.error('❌ Failed to calculate surprise score:', error);
      return 0.5; // Default medium surprise
    }
  }

  /**
   * FEP: Prioritize issues by surprise + severity
   * MB.MD v9.2 Pattern 27: Fix surprising issues first (high information value)
   */
  static async prioritizeIssues(issues: AuditIssue[], pageId: string): Promise<AuditIssue[]> {
    try {
      // Calculate surprise score for each issue
      const issuesWithSurprise = await Promise.all(
        issues.map(async (issue) => {
          const surpriseScore = await this.calculateSurpriseScore(
            pageId,
            issue.agentId,
            1 // Single issue
          );

          return {
            ...issue,
            surpriseScore,
            priorityScore: 
              (issue.severity === 'critical' ? 1.0 : 
               issue.severity === 'high' ? 0.7 : 
               issue.severity === 'medium' ? 0.4 : 0.2) * 0.6 + // Severity weight
              surpriseScore * 0.4 // Surprise weight
          };
        })
      );

      // Sort by priority score (highest first)
      return issuesWithSurprise.sort((a, b) => 
        (b.priorityScore || 0) - (a.priorityScore || 0)
      );
    } catch (error) {
      console.error('❌ Failed to prioritize issues:', error);
      return issues; // Return original order on error
    }
  }

  /**
   * FEP: Get agent's current beliefs about a page
   */
  static async getAgentBeliefs(pageId: string, agentId: string): Promise<SelectAgentBeliefs | null> {
    try {
      const [belief] = await db
        .select()
        .from(agentBeliefs)
        .where(
          and(
            eq(agentBeliefs.agentId, agentId),
            eq(agentBeliefs.pageId, pageId)
          )
        );

      return belief || null;
    } catch (error) {
      console.error('❌ Failed to get agent beliefs:', error);
      return null;
    }
  }

  /**
   * FEP: Get recent prediction errors for learning
   */
  static async getRecentPredictionErrors(pageId: string, limit: number = 10) {
    try {
      return await db
        .select()
        .from(predictionErrors)
        .where(eq(predictionErrors.pageId, pageId))
        .orderBy(desc(predictionErrors.timestamp))
        .limit(limit);
    } catch (error) {
      console.error('❌ Failed to get prediction errors:', error);
      return [];
    }
  }
}
