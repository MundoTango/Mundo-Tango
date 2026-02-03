/**
 * MB.MD v9.9.4 - Issue Routing Service
 * Routes stuck points from volunteer testing to audit_issues for auto-fix processing
 */

import { db } from "../db";
import { auditIssues, uiTestResults, uiTestScenarios, InsertAuditIssue } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface StuckPoint {
  stepIndex: number;
  timeSpentSeconds: number;
  scenarioId: number;
  scenarioTitle?: string;
  stepAction?: string;
  volunteerFeedback?: string;
}

export interface IssueRoutingResult {
  issueId?: number;
  routed: boolean;
  autoFixCandidate: boolean;
  severity: string;
}

export class IssueRoutingService {
  
  /**
   * Route a stuck point to the audit_issues table for potential auto-fix
   */
  async routeStuckPoint(stuckPoint: StuckPoint): Promise<IssueRoutingResult> {
    try {
      const scenario = await db
        .select()
        .from(uiTestScenarios)
        .where(eq(uiTestScenarios.id, stuckPoint.scenarioId))
        .limit(1);

      if (!scenario.length) {
        return { routed: false, autoFixCandidate: false, severity: "unknown" };
      }

      const steps = scenario[0].steps as { step: number; action: string }[];
      const stuckStep = steps?.[stuckPoint.stepIndex];
      
      const severity = this.calculateSeverity(stuckPoint);
      const issueType = this.classifyIssueType(stuckStep?.action || "");
      const autoFixCandidate = this.isAutoFixCandidate(issueType, severity);

      const issueData: InsertAuditIssue = {
        pageId: null,
        type: issueType,
        severity,
        message: `User stuck at step ${stuckPoint.stepIndex + 1}: "${stuckStep?.action || 'Unknown step'}" in scenario "${scenario[0].title}"`,
        element: stuckStep?.action || null,
        suggestion: this.generateSuggestion(issueType, stuckStep?.action),
        status: autoFixCandidate ? "pending_autofix" : "pending",
        strikeCount: 0,
      };

      const [result] = await db
        .insert(auditIssues)
        .values(issueData)
        .returning({ id: auditIssues.id });

      console.log(`[IssueRouting] Routed stuck point to issue #${result.id}, type: ${issueType}, severity: ${severity}`);

      return {
        issueId: result.id,
        routed: true,
        autoFixCandidate,
        severity,
      };
    } catch (error) {
      console.error("[IssueRouting] Failed to route stuck point:", error);
      return { routed: false, autoFixCandidate: false, severity: "unknown" };
    }
  }

  /**
   * Route multiple stuck points from a test result
   */
  async routeTestResultStuckPoints(resultId: number): Promise<IssueRoutingResult[]> {
    try {
      const [result] = await db
        .select()
        .from(uiTestResults)
        .where(eq(uiTestResults.id, resultId))
        .limit(1);

      if (!result || !result.stuckPoints) {
        return [];
      }

      const stuckPoints = result.stuckPoints as StuckPoint[];
      const routingResults: IssueRoutingResult[] = [];

      for (const sp of stuckPoints) {
        const routingResult = await this.routeStuckPoint({
          ...sp,
          scenarioId: result.scenarioId || 0,
        });
        routingResults.push(routingResult);
      }

      return routingResults;
    } catch (error) {
      console.error("[IssueRouting] Failed to route test result stuck points:", error);
      return [];
    }
  }

  /**
   * Calculate issue severity based on time spent stuck and frequency
   */
  private calculateSeverity(stuckPoint: StuckPoint): string {
    const timeThresholds = {
      critical: 300,
      high: 180,
      medium: 60,
      low: 30,
    };

    if (stuckPoint.timeSpentSeconds >= timeThresholds.critical) return "critical";
    if (stuckPoint.timeSpentSeconds >= timeThresholds.high) return "high";
    if (stuckPoint.timeSpentSeconds >= timeThresholds.medium) return "medium";
    return "low";
  }

  /**
   * Classify issue type based on step action content
   */
  private classifyIssueType(stepAction: string): string {
    const actionLower = stepAction.toLowerCase();
    
    if (actionLower.includes("click") || actionLower.includes("button")) {
      return "ux";
    }
    if (actionLower.includes("navigate") || actionLower.includes("page")) {
      return "navigation";
    }
    if (actionLower.includes("input") || actionLower.includes("enter") || actionLower.includes("type")) {
      return "form";
    }
    if (actionLower.includes("load") || actionLower.includes("wait") || actionLower.includes("verify")) {
      return "performance";
    }
    if (actionLower.includes("upload") || actionLower.includes("image") || actionLower.includes("photo")) {
      return "media";
    }
    return "ux";
  }

  /**
   * Determine if issue is a candidate for auto-fix
   */
  private isAutoFixCandidate(issueType: string, severity: string): boolean {
    const autoFixTypes = ["ux", "accessibility", "form", "navigation"];
    const nonCriticalSeverities = ["low", "medium", "high"];
    
    return autoFixTypes.includes(issueType) && nonCriticalSeverities.includes(severity);
  }

  /**
   * Generate fix suggestion based on issue type and step
   */
  private generateSuggestion(issueType: string, stepAction?: string): string {
    const suggestions: Record<string, string> = {
      ux: "Review button visibility, contrast, and click target size. Ensure interactive elements are clearly distinguishable.",
      navigation: "Check route definitions and navigation links. Ensure proper redirects and state management.",
      form: "Verify form field labels, validation messages, and input types. Check for proper autocomplete attributes.",
      performance: "Optimize component rendering, reduce API calls, implement loading states.",
      media: "Check file upload handlers, size limits, and supported formats. Add progress indicators.",
      accessibility: "Add ARIA labels, ensure keyboard navigation, check color contrast.",
    };

    return suggestions[issueType] || "Review the step implementation and user flow.";
  }

  /**
   * Get pending auto-fix issues from volunteer testing
   */
  async getPendingAutoFixIssues(): Promise<any[]> {
    try {
      const issues = await db
        .select()
        .from(auditIssues)
        .where(eq(auditIssues.status, "pending_autofix"))
        .orderBy(desc(auditIssues.id))
        .limit(50);

      return issues;
    } catch (error) {
      console.error("[IssueRouting] Failed to get pending auto-fix issues:", error);
      return [];
    }
  }

  /**
   * Get issue statistics
   */
  async getIssueStats(): Promise<{
    total: number;
    pendingAutoFix: number;
    resolved: number;
    bySeverity: Record<string, number>;
  }> {
    try {
      const allIssues = await db.select().from(auditIssues);
      
      const stats = {
        total: allIssues.length,
        pendingAutoFix: allIssues.filter(i => i.status === "pending_autofix").length,
        resolved: allIssues.filter(i => i.status === "resolved" || i.status === "fixed").length,
        bySeverity: {
          critical: allIssues.filter(i => i.severity === "critical").length,
          high: allIssues.filter(i => i.severity === "high").length,
          medium: allIssues.filter(i => i.severity === "medium").length,
          low: allIssues.filter(i => i.severity === "low").length,
        },
      };

      return stats;
    } catch (error) {
      console.error("[IssueRouting] Failed to get issue stats:", error);
      return { total: 0, pendingAutoFix: 0, resolved: 0, bySeverity: {} };
    }
  }
}

export const issueRoutingService = new IssueRoutingService();
