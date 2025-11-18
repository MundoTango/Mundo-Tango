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
import { pagePreChecks, pageAgentRegistry, type InsertPagePreCheck } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
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

      // 2. Pre-check all pages in parallel
      const preCheckPromises = navigatesToPages.map(pageId =>
        this.preCheckPage(pageId, currentPageId)
      );

      await Promise.all(preCheckPromises);

      const totalTime = Date.now() - startTime;
      console.log(`✅ Pre-checked ${navigatesToPages.length} pages in ${totalTime}ms (background)`);
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
}
