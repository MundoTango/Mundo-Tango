/**
 * Predictive Pre-Check Service
 * MB.MD v9.0 - Self-Healing Page Agent System
 * November 18, 2025
 * 
 * Pre-checks all pages that current page navigates to
 * Updated from "next 5 pages" to "all pages that x page navigates to"
 * Target: <1000ms background pre-check
 */

import { db } from '../../../shared/db';
import { 
  pagePreChecks, 
  pageAgentRegistry, 
  agentBeliefs,
  type InsertPagePreCheck 
} from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { PageAuditService, type AuditResults } from './PageAuditService';
import { SelfHealingService } from './SelfHealingService';

export class PredictivePreCheckService {
  /**
   * Pre-check all pages that current page navigates to
   * Updated: No longer "next 5 pages", now "ALL pages that x page navigates to"
   */
  static async checkPagesNavigatesTo(currentPageId: string): Promise<void> {
    const startTime = Date.now();

    try {
      // 1. Get all pages that current page navigates to
      const [currentPageReg] = await db
        .select()
        .from(pageAgentRegistry)
        .where(eq(pageAgentRegistry.pageId, currentPageId));

      if (!currentPageReg) {
        console.log(`⚠️  Page registration not found for: ${currentPageId}`);
        return;
      }

      const navigatesToPages = (currentPageReg.navigatesTo as string[]) || [];

      if (navigatesToPages.length === 0) {
        console.log(`ℹ️  No navigation targets for ${currentPageId}`);
        return;
      }

      console.log(`🔮 Pre-checking ${navigatesToPages.length} pages that ${currentPageId} navigates to...`);

      // 2. FEP: Select pages using Expected Free Energy (balance exploration/exploitation)
      const selectedPages = await this.selectPagesWithEFE(navigatesToPages, currentPageId);
      
      console.log(`🧠 FEP: Selected ${selectedPages.length}/${navigatesToPages.length} pages using Expected Free Energy`);

      // 3. Pre-check selected pages in parallel
      const preCheckPromises = selectedPages.map(({ pageId, efe, risk, ambiguity }) => {
        console.log(`  └─ ${pageId}: EFE=${efe.toFixed(3)} (risk=${risk.toFixed(2)}, ambiguity=${ambiguity.toFixed(2)})`);
        return this.preCheckPage(pageId, currentPageId);
      });

      await Promise.all(preCheckPromises);

      const totalTime = Date.now() - startTime;
      console.log(`✅ Pre-checked ${selectedPages.length} pages in ${totalTime}ms (background)`);
    } catch (error) {
      console.error(`❌ Failed to pre-check pages for ${currentPageId}:`, error);
    }
  }

  /**
   * Pre-check a single page
   */
  private static async preCheckPage(pageId: string, sourcePageId: string): Promise<void> {
    try {
      // 1. Run audit on target page
      const auditResults: AuditResults = await PageAuditService.runComprehensiveAudit(pageId);

      // 2. Predict issues
      const predictedIssues = auditResults.issuesByCategory;
      const issuesPredicted = auditResults.totalIssues;
      const criticalPredicted = auditResults.criticalIssues;

      // 3. Calculate confidence score
      const confidenceScore = this.calculateConfidence(auditResults);

      // 4. Calculate navigation probability (placeholder)
      const navigationProbability = 0.8; // High probability if in navigatesTo list

      // 5. Apply proactive healing if issues found
      let proactiveHealingApplied = false;
      let healingLogId: number | undefined;

      if (auditResults.hasIssues && auditResults.criticalIssues > 0) {
        console.log(`🔧 Applying proactive healing for ${pageId} (${auditResults.criticalIssues} critical issues)`);
        const healingResult = await SelfHealingService.executeSimultaneousFixes(auditResults);
        proactiveHealingApplied = healingResult.success;
      }

      // 6. Save pre-check to database
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour cache

      const preCheck: InsertPagePreCheck = {
        pageId,
        sourcePageId,
        predictedIssues,
        confidenceScore,
        navigationProbability,
        issuesPredicted,
        criticalPredicted,
        proactiveHealingApplied,
        healingLogId,
        expiresAt,
        cacheHit: false
      };

      await db.insert(pagePreChecks).values(preCheck);

      console.log(`✅ Pre-checked ${pageId}: ${issuesPredicted} issues predicted (${criticalPredicted} critical)`);
    } catch (error) {
      console.error(`❌ Failed to pre-check ${pageId}:`, error);
    }
  }

  /**
   * Calculate confidence score for predictions
   */
  private static calculateConfidence(auditResults: AuditResults): number {
    // Placeholder - will be improved with ML-based confidence scoring
    // For now: high confidence if issues are clear and categorized
    if (auditResults.totalIssues === 0) {
      return 1.0; // 100% confident no issues
    }

    // Confidence based on issue severity distribution
    const criticalRatio = auditResults.criticalIssues / auditResults.totalIssues;
    return 0.7 + (criticalRatio * 0.3); // 70-100% confidence
  }

  /**
   * Get cached pre-check if available
   */
  static async getCachedPreCheck(pageId: string): Promise<any | null> {
    const results = await db
      .select()
      .from(pagePreChecks)
      .where(eq(pagePreChecks.pageId, pageId))
      .orderBy(pagePreChecks.checkedTimestamp);

    if (results.length === 0) {
      return null;
    }

    const latestCheck = results[results.length - 1];

    // Check if cache is still valid
    if (new Date(latestCheck.expiresAt) > new Date()) {
      // Mark cache hit
      await db
        .update(pagePreChecks)
        .set({ cacheHit: true })
        .where(eq(pagePreChecks.id, latestCheck.id));

      console.log(`✅ Cache hit for ${pageId}: ${latestCheck.issuesPredicted} issues predicted`);
      return latestCheck;
    }

    return null;
  }

  /**
   * FEP: Select pages to pre-check using Expected Free Energy (EFE)
   * MB.MD v9.2 Pattern 28: Active Inference - Balance exploration/exploitation
   * 
   * EFE = Risk + Ambiguity
   * - Risk: Distance from preferred state (0 issues)
   * - Ambiguity: Uncertainty about page health
   * 
   * Lower EFE = higher priority (minimize free energy)
   */
  private static async selectPagesWithEFE(
    candidatePages: string[],
    sourcePageId: string
  ): Promise<Array<{ pageId: string; efe: number; risk: number; ambiguity: number }>> {
    try {
      // Calculate EFE for each candidate page
      const efeScores = await Promise.all(
        candidatePages.map(async (pageId) => {
          // Get agent beliefs about this page
          const beliefs = await db
            .select()
            .from(agentBeliefs)
            .where(eq(agentBeliefs.pageId, pageId));

          if (beliefs.length === 0) {
            // Unknown page = high ambiguity (exploration opportunity)
            return {
              pageId,
              efe: 1.5, // High priority for exploration
              risk: 0.5, // Unknown risk
              ambiguity: 1.0 // Maximum uncertainty
            };
          }

          // Aggregate beliefs from all agents
          const avgExpectedIssues = beliefs.reduce((sum, b) => 
            sum + b.expectedIssueCount, 0) / beliefs.length;
          const avgConfidence = beliefs.reduce((sum, b) => 
            sum + b.confidence, 0) / beliefs.length;

          // RISK: Distance from preferred state (0 issues)
          // Normalize to 0-1 (assume max 10 issues)
          const risk = Math.min(avgExpectedIssues / 10, 1.0);

          // AMBIGUITY: Uncertainty (low confidence = high ambiguity)
          const ambiguity = 1 - avgConfidence;

          // EXPECTED FREE ENERGY = risk + ambiguity
          const efe = risk + ambiguity;

          return {
            pageId,
            efe,
            risk,
            ambiguity
          };
        })
      );

      // Sort by EFE (lowest = highest priority)
      // This automatically balances:
      // - High risk pages (known problems) = EXPLOITATION
      // - High ambiguity pages (uncertain) = EXPLORATION
      const sorted = efeScores.sort((a, b) => a.efe - b.efe);

      // Select top pages (balance compute cost vs coverage)
      const maxPages = Math.min(candidatePages.length, 5); // Limit to 5 for performance
      return sorted.slice(0, maxPages);
    } catch (error) {
      console.error('❌ Failed to calculate EFE scores:', error);
      // Fallback to first N pages on error
      return candidatePages.slice(0, 5).map(pageId => ({
        pageId,
        efe: 0.5,
        risk: 0.5,
        ambiguity: 0.5
      }));
    }
  }

  /**
   * FEP: Calculate Expected Free Energy for a single page
   * Exposed for external use (e.g., AgentOrchestrationService)
   */
  static async calculateEFE(pageId: string): Promise<{
    efe: number;
    risk: number;
    ambiguity: number;
    details: string;
  }> {
    try {
      const beliefs = await db
        .select()
        .from(agentBeliefs)
        .where(eq(agentBeliefs.pageId, pageId));

      if (beliefs.length === 0) {
        return {
          efe: 1.5,
          risk: 0.5,
          ambiguity: 1.0,
          details: 'Unknown page (high exploration value)'
        };
      }

      const avgExpectedIssues = beliefs.reduce((sum, b) => 
        sum + b.expectedIssueCount, 0) / beliefs.length;
      const avgConfidence = beliefs.reduce((sum, b) => 
        sum + b.confidence, 0) / beliefs.length;

      const risk = Math.min(avgExpectedIssues / 10, 1.0);
      const ambiguity = 1 - avgConfidence;
      const efe = risk + ambiguity;

      const strategy = risk > ambiguity ? 'EXPLOIT (fix known problems)' : 'EXPLORE (reduce uncertainty)';

      return {
        efe,
        risk,
        ambiguity,
        details: `${strategy} - Expected issues: ${avgExpectedIssues.toFixed(2)}, Confidence: ${(avgConfidence * 100).toFixed(0)}%`
      };
    } catch (error) {
      console.error('❌ Failed to calculate EFE:', error);
      return {
        efe: 0.5,
        risk: 0.5,
        ambiguity: 0.5,
        details: 'Error calculating EFE'
      };
    }
  }
}
