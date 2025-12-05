/**
 * SWARM CHOREOGRAPHY CONTROLLER - Pattern 66
 * MB.MD v9.9.3 - Build/Audit Phase Orchestration
 * 
 * Orchestrates the Build/Audit phase:
 * - Page Agent audits their pages
 * - Finds issues → Dispatches to SME
 * - SME fixes → Returns to Page Agent
 * 
 * Features:
 * - Role-aware issue assignment
 * - Parallel SME dispatch
 * - TRM context snapshots per cycle
 * - Issue registry with LanceDB persistence
 */

import { lanceDB } from '../../lib/lancedb';

// ============================================================================
// TYPES
// ============================================================================

export interface PageAuditRequest {
  pageId: string;
  pageName: string;
  pageUrl: string;
  requestedBy: string;
  roleLevel: number;
  auditType: AuditType;
}

export type AuditType = 
  | 'full'           // Complete page audit
  | 'accessibility'  // A11y only
  | 'performance'    // Performance only
  | 'security'       // Security only
  | 'ux'             // UX/UI only
  | 'data'           // Data integrity only
  | 'i18n';          // Internationalization

export interface Issue {
  id: string;
  pageId: string;
  pageName: string;
  type: IssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
  location: IssueLocation;
  suggestedFix?: string;
  assignedSME?: string;
  status: IssueStatus;
  requiredRoleLevel: number;
  createdAt: Date;
  updatedAt: Date;
  fixedAt?: Date;
  fixedBy?: string;
  trmContext?: string;
}

export type IssueType = 
  | 'ui'
  | 'ux'
  | 'accessibility'
  | 'performance'
  | 'security'
  | 'data'
  | 'i18n'
  | 'api'
  | 'validation'
  | 'navigation';

export type IssueSeverity = 
  | 'critical'   // Blocks user, security issue
  | 'high'       // Major feature broken
  | 'medium'     // Feature degraded
  | 'low';       // Minor improvement

export type IssueStatus = 
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'fixed'
  | 'verified'
  | 'wont_fix'
  | 'escalated';

export interface IssueLocation {
  file?: string;
  line?: number;
  component?: string;
  selector?: string;
}

export interface SMEAgent {
  id: string;
  name: string;
  specialty: IssueType[];
  availability: 'available' | 'busy' | 'offline';
  currentLoad: number;
  maxLoad: number;
  successRate: number;
}

export interface AuditResult {
  pageId: string;
  pageName: string;
  auditType: AuditType;
  totalIssues: number;
  bySeverity: Record<IssueSeverity, number>;
  byType: Record<string, number>;
  issues: Issue[];
  auditedAt: Date;
  auditDuration: number;
}

export interface SwarmStatus {
  activeAudits: number;
  pendingIssues: number;
  assignedIssues: number;
  fixedToday: number;
  smeAgents: SMEAgent[];
  averageFixTime: number;
}

// ============================================================================
// SME AGENT REGISTRY
// ============================================================================

const SME_AGENTS: SMEAgent[] = [
  { id: 'sme-ui-01', name: 'UI Specialist', specialty: ['ui', 'ux'], availability: 'available', currentLoad: 0, maxLoad: 5, successRate: 0.94 },
  { id: 'sme-ui-02', name: 'UI Expert', specialty: ['ui'], availability: 'available', currentLoad: 0, maxLoad: 5, successRate: 0.92 },
  { id: 'sme-a11y-01', name: 'Accessibility Expert', specialty: ['accessibility'], availability: 'available', currentLoad: 0, maxLoad: 3, successRate: 0.96 },
  { id: 'sme-perf-01', name: 'Performance Optimizer', specialty: ['performance'], availability: 'available', currentLoad: 0, maxLoad: 4, successRate: 0.91 },
  { id: 'sme-sec-01', name: 'Security Analyst', specialty: ['security'], availability: 'available', currentLoad: 0, maxLoad: 3, successRate: 0.98 },
  { id: 'sme-data-01', name: 'Data Integrity Agent', specialty: ['data', 'validation'], availability: 'available', currentLoad: 0, maxLoad: 4, successRate: 0.95 },
  { id: 'sme-i18n-01', name: 'Internationalization Expert', specialty: ['i18n'], availability: 'available', currentLoad: 0, maxLoad: 6, successRate: 0.93 },
  { id: 'sme-api-01', name: 'API Specialist', specialty: ['api'], availability: 'available', currentLoad: 0, maxLoad: 5, successRate: 0.94 },
  { id: 'sme-nav-01', name: 'Navigation Expert', specialty: ['navigation', 'ux'], availability: 'available', currentLoad: 0, maxLoad: 4, successRate: 0.92 }
];

// ============================================================================
// SWARM CHOREOGRAPHY CONTROLLER CLASS
// ============================================================================

export class SwarmChoreographyController {
  private issues: Map<string, Issue> = new Map();
  private smeAgents: Map<string, SMEAgent> = new Map();
  private auditHistory: AuditResult[] = [];
  private initialized = false;

  constructor() {
    SME_AGENTS.forEach(agent => this.smeAgents.set(agent.id, agent));
  }

  /**
   * Initialize controller
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[SwarmChoreography] Initializing Pattern 66 controller...');

    try {
      // Load any persisted issues from LanceDB
      const memories = await lanceDB.searchMemories('swarm-issue', 100);
      
      for (const memory of memories) {
        if (memory.id.startsWith('issue-')) {
          try {
            const issue = JSON.parse(memory.content);
            this.issues.set(issue.id, issue);
          } catch {
            // Skip invalid entries
          }
        }
      }

      this.initialized = true;
      console.log(`[SwarmChoreography] ✅ Loaded ${this.issues.size} existing issues`);
    } catch (error) {
      console.error('[SwarmChoreography] Failed to initialize:', error);
      this.initialized = true; // Continue without historical data
    }
  }

  /**
   * Start a page audit
   */
  async auditPage(request: PageAuditRequest): Promise<AuditResult> {
    console.log(`[SwarmChoreography] Starting ${request.auditType} audit for ${request.pageName}`);

    const startTime = Date.now();
    const issues: Issue[] = [];

    // Simulate page audit based on audit type
    const detectedIssues = await this.detectIssues(request);
    
    for (const issue of detectedIssues) {
      issue.id = `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      issue.createdAt = new Date();
      issue.updatedAt = new Date();
      issue.status = 'open';

      // Store in registry
      this.issues.set(issue.id, issue);
      issues.push(issue);

      // Persist to LanceDB
      await lanceDB.addMemory(
        `issue-${issue.id}`,
        JSON.stringify(issue)
      );
    }

    const result: AuditResult = {
      pageId: request.pageId,
      pageName: request.pageName,
      auditType: request.auditType,
      totalIssues: issues.length,
      bySeverity: this.countBySeverity(issues),
      byType: this.countByType(issues),
      issues,
      auditedAt: new Date(),
      auditDuration: Date.now() - startTime
    };

    this.auditHistory.push(result);

    // Auto-dispatch issues to SMEs
    await this.dispatchToSMEs(issues);

    console.log(`[SwarmChoreography] Audit complete: ${issues.length} issues found`);
    return result;
  }

  /**
   * Detect issues in a page (simulated)
   */
  private async detectIssues(request: PageAuditRequest): Promise<Partial<Issue>[]> {
    const issues: Partial<Issue>[] = [];

    // Common issues by audit type
    if (request.auditType === 'full' || request.auditType === 'accessibility') {
      issues.push({
        pageId: request.pageId,
        pageName: request.pageName,
        type: 'accessibility',
        severity: 'medium',
        title: 'Missing alt text on images',
        description: 'Images should have descriptive alt text for screen readers',
        location: { component: 'ImageGallery' },
        suggestedFix: 'Add alt attributes to all <img> elements',
        requiredRoleLevel: 1
      });
    }

    if (request.auditType === 'full' || request.auditType === 'ux') {
      issues.push({
        pageId: request.pageId,
        pageName: request.pageName,
        type: 'ux',
        severity: 'low',
        title: 'Empty state not implemented',
        description: 'Page shows blank content when no data is available',
        location: { component: 'ContentList' },
        suggestedFix: 'Use EmptyStateResolver component with role-aware messaging',
        requiredRoleLevel: 1
      });
    }

    if (request.auditType === 'full' || request.auditType === 'performance') {
      issues.push({
        pageId: request.pageId,
        pageName: request.pageName,
        type: 'performance',
        severity: 'medium',
        title: 'Large bundle size detected',
        description: 'Component imports unnecessary dependencies',
        location: { file: `${request.pageName}.tsx` },
        suggestedFix: 'Use dynamic imports for heavy components',
        requiredRoleLevel: 2
      });
    }

    if (request.auditType === 'full' || request.auditType === 'i18n') {
      issues.push({
        pageId: request.pageId,
        pageName: request.pageName,
        type: 'i18n',
        severity: 'low',
        title: 'Hardcoded text strings',
        description: 'Text is not internationalized',
        location: { component: 'Header' },
        suggestedFix: 'Use t() function from react-i18next',
        requiredRoleLevel: 1
      });
    }

    return issues;
  }

  /**
   * Dispatch issues to appropriate SME agents
   */
  private async dispatchToSMEs(issues: Issue[]): Promise<void> {
    for (const issue of issues) {
      const sme = this.findBestSME(issue.type);
      
      if (sme && sme.currentLoad < sme.maxLoad) {
        issue.assignedSME = sme.id;
        issue.status = 'assigned';
        issue.updatedAt = new Date();
        sme.currentLoad++;

        console.log(`[SwarmChoreography] Dispatched ${issue.id} to ${sme.name}`);
      }
    }
  }

  /**
   * Find the best available SME for an issue type
   */
  private findBestSME(issueType: IssueType): SMEAgent | null {
    const candidates = Array.from(this.smeAgents.values())
      .filter(sme => 
        sme.specialty.includes(issueType) &&
        sme.availability === 'available' &&
        sme.currentLoad < sme.maxLoad
      )
      .sort((a, b) => {
        // Prefer higher success rate and lower load
        const scoreA = a.successRate * (1 - a.currentLoad / a.maxLoad);
        const scoreB = b.successRate * (1 - b.currentLoad / b.maxLoad);
        return scoreB - scoreA;
      });

    return candidates[0] || null;
  }

  /**
   * Mark an issue as fixed
   */
  async fixIssue(issueId: string, fixedBy: string, trmContext?: string): Promise<boolean> {
    const issue = this.issues.get(issueId);
    if (!issue) return false;

    issue.status = 'fixed';
    issue.fixedAt = new Date();
    issue.fixedBy = fixedBy;
    issue.updatedAt = new Date();
    if (trmContext) issue.trmContext = trmContext;

    // Release SME load
    if (issue.assignedSME) {
      const sme = this.smeAgents.get(issue.assignedSME);
      if (sme && sme.currentLoad > 0) {
        sme.currentLoad--;
      }
    }

    // Update in LanceDB
    await lanceDB.addMemory(
      `issue-${issue.id}`,
      JSON.stringify(issue)
    );

    console.log(`[SwarmChoreography] Issue ${issueId} fixed by ${fixedBy}`);
    return true;
  }

  /**
   * Verify a fix
   */
  async verifyFix(issueId: string): Promise<boolean> {
    const issue = this.issues.get(issueId);
    if (!issue || issue.status !== 'fixed') return false;

    issue.status = 'verified';
    issue.updatedAt = new Date();

    await lanceDB.addMemory(
      `issue-${issue.id}`,
      JSON.stringify(issue)
    );

    return true;
  }

  /**
   * Escalate an issue
   */
  async escalateIssue(issueId: string, reason: string): Promise<boolean> {
    const issue = this.issues.get(issueId);
    if (!issue) return false;

    issue.status = 'escalated';
    issue.updatedAt = new Date();
    issue.description += `\n\n[ESCALATED] ${reason}`;

    await lanceDB.addMemory(
      `issue-${issue.id}`,
      JSON.stringify(issue)
    );

    console.log(`[SwarmChoreography] Issue ${issueId} escalated: ${reason}`);
    return true;
  }

  /**
   * Get issues by status
   */
  getIssuesByStatus(status: IssueStatus): Issue[] {
    return Array.from(this.issues.values())
      .filter(i => i.status === status);
  }

  /**
   * Get issues for a role level (only show issues they can fix)
   */
  getIssuesForRole(roleLevel: number): Issue[] {
    return Array.from(this.issues.values())
      .filter(i => i.requiredRoleLevel <= roleLevel && i.status !== 'verified' && i.status !== 'wont_fix');
  }

  /**
   * Get swarm status
   */
  getStatus(): SwarmStatus {
    const issues = Array.from(this.issues.values());
    const today = new Date().toISOString().split('T')[0];

    return {
      activeAudits: this.auditHistory.filter(a => 
        new Date().getTime() - a.auditedAt.getTime() < 3600000
      ).length,
      pendingIssues: issues.filter(i => i.status === 'open').length,
      assignedIssues: issues.filter(i => i.status === 'assigned' || i.status === 'in_progress').length,
      fixedToday: issues.filter(i => 
        i.fixedAt && i.fixedAt.toISOString().split('T')[0] === today
      ).length,
      smeAgents: Array.from(this.smeAgents.values()),
      averageFixTime: this.calculateAverageFixTime()
    };
  }

  /**
   * Calculate average fix time
   */
  private calculateAverageFixTime(): number {
    const fixedIssues = Array.from(this.issues.values())
      .filter(i => i.status === 'fixed' || i.status === 'verified');

    if (fixedIssues.length === 0) return 0;

    const totalTime = fixedIssues.reduce((sum, issue) => {
      if (issue.fixedAt) {
        return sum + (issue.fixedAt.getTime() - issue.createdAt.getTime());
      }
      return sum;
    }, 0);

    return Math.round(totalTime / fixedIssues.length / 1000); // in seconds
  }

  /**
   * Count issues by severity
   */
  private countBySeverity(issues: Issue[]): Record<IssueSeverity, number> {
    const counts: Record<IssueSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    issues.forEach(i => {
      counts[i.severity]++;
    });

    return counts;
  }

  /**
   * Count issues by type
   */
  private countByType(issues: Issue[]): Record<string, number> {
    const counts: Record<string, number> = {};

    issues.forEach(i => {
      counts[i.type] = (counts[i.type] || 0) + 1;
    });

    return counts;
  }

  /**
   * Get all SME agents
   */
  getSMEAgents(): SMEAgent[] {
    return Array.from(this.smeAgents.values());
  }

  /**
   * Get audit history
   */
  getAuditHistory(limit: number = 10): AuditResult[] {
    return this.auditHistory
      .sort((a, b) => b.auditedAt.getTime() - a.auditedAt.getTime())
      .slice(0, limit);
  }
}

// Singleton instance
export const swarmChoreographyController = new SwarmChoreographyController();
