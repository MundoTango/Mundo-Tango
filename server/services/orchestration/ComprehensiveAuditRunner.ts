/**
 * COMPREHENSIVE AUDIT RUNNER - MB.MD v9.9.3
 * Orchestrates Replit AI + Mr Blue for full platform audit
 * 
 * Phase 1: RESEARCH - Index all pages with TRM hierarchy
 * Phase 2: PLAN - Prioritize and assign SME agents
 * Phase 3: BUILD/AUDIT - Run SwarmChoreography audits
 * Phase 4: TEST - ValidationRelay execution
 * Phase 5: FIX - 3-Strike AutoFix protocol
 */

import { lanceDB } from '../../lib/lancedb';
import { SwarmChoreographyController, type AuditResult, type Issue } from './SwarmChoreographyController';
import { ValidationRelayService } from './ValidationRelayService';
import { StrikeTracker } from './StrikeTracker';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

export interface PageInventory {
  id: string;
  name: string;
  path: string;
  category: PageCategory;
  priority: AuditPriority;
  dependencies: string[];
  components: string[];
  apiEndpoints: string[];
  roleRequired: number;
  lastAudited?: Date;
  issueCount: number;
}

export type PageCategory = 
  | 'admin'
  | 'auth'
  | 'dashboard'
  | 'profile'
  | 'events'
  | 'groups'
  | 'messages'
  | 'mrblue'
  | 'lifeceo'
  | 'marketing'
  | 'prototype'
  | 'settings'
  | 'billing'
  | 'housing'
  | 'travel'
  | 'professional'
  | 'other';

export type AuditPriority = 'critical' | 'high' | 'medium' | 'low';

export interface AuditProgress {
  phase: 'research' | 'plan' | 'audit' | 'test' | 'fix' | 'complete';
  percentComplete: number;
  pagesIndexed: number;
  pagesAudited: number;
  issuesFound: number;
  issuesFixed: number;
  issuesEscalated: number;
  currentPage?: string;
  startTime: Date;
  estimatedCompletion?: Date;
}

export interface AuditReport {
  summary: {
    totalPages: number;
    pagesAudited: number;
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    issuesFixed: number;
    fixRate: number;
    escalationRate: number;
  };
  byCategory: Record<PageCategory, {
    pages: number;
    issues: number;
    fixed: number;
  }>;
  bySME: Record<string, {
    assigned: number;
    fixed: number;
    avgFixTime: number;
  }>;
  topIssueTypes: Array<{ type: string; count: number }>;
  pageResults: PageAuditSummary[];
  trmLearnings: string[];
  recommendations: string[];
  generatedAt: Date;
}

export interface PageAuditSummary {
  pageId: string;
  pageName: string;
  category: PageCategory;
  issueCount: number;
  fixedCount: number;
  status: 'clean' | 'has_issues' | 'needs_attention';
}

// ============================================================================
// COMPREHENSIVE AUDIT RUNNER
// ============================================================================

export class ComprehensiveAuditRunner {
  private swarm: SwarmChoreographyController;
  private validator: ValidationRelayService;
  private strikeTracker: StrikeTracker;
  private pageInventory: Map<string, PageInventory> = new Map();
  private progress: AuditProgress;
  private auditResults: Map<string, AuditResult> = new Map();
  
  constructor() {
    this.swarm = new SwarmChoreographyController();
    this.validator = new ValidationRelayService();
    this.strikeTracker = new StrikeTracker();
    this.progress = {
      phase: 'research',
      percentComplete: 0,
      pagesIndexed: 0,
      pagesAudited: 0,
      issuesFound: 0,
      issuesFixed: 0,
      issuesEscalated: 0,
      startTime: new Date()
    };
  }

  /**
   * Get current progress
   */
  getProgress(): AuditProgress {
    return { ...this.progress };
  }

  /**
   * PHASE 1: RESEARCH - Index all platform pages
   */
  async phase1Research(): Promise<number> {
    console.log('[ComprehensiveAudit] 🔬 Phase 1: RESEARCH - Indexing pages...');
    this.progress.phase = 'research';
    
    const pagesDir = path.join(process.cwd(), 'client/src/pages');
    const pages = await this.discoverPages(pagesDir);
    
    for (const page of pages) {
      const inventory = await this.analyzePageForInventory(page);
      this.pageInventory.set(inventory.id, inventory);
      
      // Index in LanceDB for TRM context (flat structure for Arrow compatibility)
      await lanceDB.addMemory('page-inventory', {
        id: inventory.id,
        content: `Page: ${inventory.name} | Category: ${inventory.category} | Priority: ${inventory.priority} | Role: ${inventory.roleRequired}`
      });
      
      this.progress.pagesIndexed++;
      this.progress.percentComplete = Math.round((this.progress.pagesIndexed / pages.length) * 15);
    }
    
    console.log(`[ComprehensiveAudit] ✅ Indexed ${this.progress.pagesIndexed} pages`);
    return this.progress.pagesIndexed;
  }

  /**
   * Discover all page files
   */
  private async discoverPages(dir: string): Promise<string[]> {
    const pages: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subPages = await this.discoverPages(fullPath);
          pages.push(...subPages);
        } else if (entry.name.endsWith('.tsx') && entry.name.includes('Page')) {
          pages.push(fullPath);
        } else if (entry.name.endsWith('.tsx')) {
          // Include non-Page components that might be pages
          pages.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`[ComprehensiveAudit] Error reading ${dir}:`, error);
    }
    
    return pages;
  }

  /**
   * Analyze a page file to build inventory
   */
  private async analyzePageForInventory(filePath: string): Promise<PageInventory> {
    const fileName = path.basename(filePath, '.tsx');
    const relativePath = filePath.replace(process.cwd(), '');
    
    // Determine category based on file name/path
    const category = this.categorizePageByName(fileName, filePath);
    const priority = this.determinePriority(category, fileName);
    const roleRequired = this.determineRoleRequired(category, fileName);
    
    return {
      id: `page-${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: fileName,
      path: relativePath,
      category,
      priority,
      dependencies: [],
      components: [],
      apiEndpoints: [],
      roleRequired,
      issueCount: 0
    };
  }

  /**
   * Categorize page by name
   */
  private categorizePageByName(name: string, filePath: string): PageCategory {
    const lowerName = name.toLowerCase();
    const lowerPath = filePath.toLowerCase();
    
    if (lowerName.includes('admin') || lowerPath.includes('/admin/')) return 'admin';
    if (lowerName.includes('login') || lowerName.includes('register') || lowerName.includes('auth')) return 'auth';
    if (lowerName.includes('dashboard')) return 'dashboard';
    if (lowerName.includes('profile')) return 'profile';
    if (lowerName.includes('event')) return 'events';
    if (lowerName.includes('group') || lowerName.includes('city')) return 'groups';
    if (lowerName.includes('message') || lowerName.includes('chat') || lowerName.includes('inbox')) return 'messages';
    if (lowerName.includes('mrblue') || lowerName.includes('mr-blue')) return 'mrblue';
    if (lowerName.includes('lifeceo') || lowerName.includes('life-ceo')) return 'lifeceo';
    if (lowerName.includes('landing') || lowerName.includes('about') || lowerName.includes('features')) return 'marketing';
    if (lowerName.includes('prototype')) return 'prototype';
    if (lowerName.includes('setting') || lowerName.includes('preferences')) return 'settings';
    if (lowerName.includes('billing') || lowerName.includes('subscription') || lowerName.includes('payment')) return 'billing';
    if (lowerName.includes('housing') || lowerName.includes('accommodation')) return 'housing';
    if (lowerName.includes('travel') || lowerName.includes('trip')) return 'travel';
    if (lowerName.includes('teacher') || lowerName.includes('dj') || lowerName.includes('musician')) return 'professional';
    
    return 'other';
  }

  /**
   * Determine audit priority
   */
  private determinePriority(category: PageCategory, name: string): AuditPriority {
    // Critical: Auth, Admin, Billing (security/money)
    if (['auth', 'admin', 'billing'].includes(category)) return 'critical';
    
    // High: Core user features
    if (['dashboard', 'profile', 'events', 'messages'].includes(category)) return 'high';
    
    // Medium: AI features, groups
    if (['mrblue', 'lifeceo', 'groups', 'housing', 'travel'].includes(category)) return 'medium';
    
    // Low: Marketing, prototypes
    if (['marketing', 'prototype'].includes(category)) return 'low';
    
    return 'medium';
  }

  /**
   * Determine minimum role level required
   */
  private determineRoleRequired(category: PageCategory, name: string): number {
    if (category === 'admin') return 7; // Admin level
    if (name.toLowerCase().includes('god')) return 8; // God level
    if (['billing', 'settings'].includes(category)) return 1; // Logged in
    return 0; // Public
  }

  /**
   * PHASE 2: PLAN - Create prioritized audit queue
   */
  async phase2Plan(): Promise<Map<AuditPriority, PageInventory[]>> {
    console.log('[ComprehensiveAudit] 📋 Phase 2: PLAN - Creating audit queue...');
    this.progress.phase = 'plan';
    this.progress.percentComplete = 15;
    
    const queue = new Map<AuditPriority, PageInventory[]>([
      ['critical', []],
      ['high', []],
      ['medium', []],
      ['low', []]
    ]);
    
    // Sort pages by priority
    for (const [, page] of this.pageInventory) {
      queue.get(page.priority)!.push(page);
    }
    
    // Log queue summary
    console.log(`[ComprehensiveAudit] Audit Queue:`);
    console.log(`  - Critical: ${queue.get('critical')!.length} pages`);
    console.log(`  - High: ${queue.get('high')!.length} pages`);
    console.log(`  - Medium: ${queue.get('medium')!.length} pages`);
    console.log(`  - Low: ${queue.get('low')!.length} pages`);
    
    this.progress.percentComplete = 20;
    return queue;
  }

  /**
   * PHASE 3: BUILD/AUDIT - Run SwarmChoreography audits
   */
  async phase3Audit(): Promise<AuditResult[]> {
    console.log('[ComprehensiveAudit] 🔍 Phase 3: BUILD/AUDIT - Running swarm audits...');
    this.progress.phase = 'audit';
    
    await this.swarm.initialize();
    
    const results: AuditResult[] = [];
    const totalPages = this.pageInventory.size;
    let audited = 0;
    
    // Audit in priority order: critical first
    const priorities: AuditPriority[] = ['critical', 'high', 'medium', 'low'];
    
    for (const priority of priorities) {
      const pages = Array.from(this.pageInventory.values())
        .filter(p => p.priority === priority);
      
      // Batch audit pages for efficiency (5 at a time)
      for (let i = 0; i < pages.length; i += 5) {
        const batch = pages.slice(i, i + 5);
        
        // Parallel audit batch
        const batchResults = await Promise.all(
          batch.map(async (page) => {
            this.progress.currentPage = page.name;
            
            const result = await this.swarm.auditPage({
              pageId: page.id,
              pageName: page.name,
              pageUrl: page.path,
              requestedBy: 'comprehensive-audit',
              roleLevel: 8, // God level for full access
              auditType: 'full'
            });
            
            this.auditResults.set(page.id, result);
            audited++;
            this.progress.pagesAudited = audited;
            this.progress.issuesFound += result.totalIssues;
            
            // Update progress percentage (20-60% range)
            this.progress.percentComplete = 20 + Math.round((audited / totalPages) * 40);
            
            return result;
          })
        );
        
        results.push(...batchResults);
      }
    }
    
    console.log(`[ComprehensiveAudit] ✅ Audited ${audited} pages, found ${this.progress.issuesFound} issues`);
    return results;
  }

  /**
   * PHASE 4: TEST - Execute ValidationRelay
   */
  async phase4Test(): Promise<void> {
    console.log('[ComprehensiveAudit] 🧪 Phase 4: TEST - Running validation...');
    this.progress.phase = 'test';
    this.progress.percentComplete = 60;
    
    await this.validator.initialize();
    
    // Get high-priority pages for E2E testing
    const criticalPages = Array.from(this.pageInventory.values())
      .filter(p => p.priority === 'critical' || p.priority === 'high')
      .slice(0, 20); // Limit to 20 for performance
    
    for (const page of criticalPages) {
      await this.validator.queueValidation({
        target: page.path,
        type: 'e2e',
        priority: page.priority === 'critical' ? 'critical' : 'high'
      });
    }
    
    // Queue API validations
    await this.validator.queueValidation({
      target: '/api/health',
      type: 'api',
      priority: 'critical'
    });
    
    // Execute all queued validations
    const results = await this.validator.executeQueue();
    
    console.log(`[ComprehensiveAudit] ✅ Validation complete: ${results.passed} passed, ${results.failed} failed`);
    this.progress.percentComplete = 75;
  }

  /**
   * PHASE 5: FIX - Process issues through 3-Strike AutoFix
   */
  async phase5Fix(): Promise<void> {
    console.log('[ComprehensiveAudit] 🔧 Phase 5: FIX - Applying auto-fixes...');
    this.progress.phase = 'fix';
    
    await this.strikeTracker.initialize();
    
    // Get all issues from swarm
    const status = this.swarm.getStatus();
    const issues = await this.swarm.getAllIssues();
    
    let fixed = 0;
    let escalated = 0;
    
    for (const issue of issues) {
      if (issue.status === 'open' || issue.status === 'assigned') {
        const result = await this.strikeTracker.processIssue({
          id: issue.id,
          type: issue.type as any,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          pageId: issue.pageId,
          pageName: issue.pageName,
          location: issue.location,
          suggestedFix: issue.suggestedFix
        });
        
        if (result.status === 'resolved') {
          fixed++;
          this.progress.issuesFixed = fixed;
        } else if (result.status === 'escalated') {
          escalated++;
          this.progress.issuesEscalated = escalated;
        }
        
        // Update progress (75-95% range)
        const total = issues.length || 1;
        this.progress.percentComplete = 75 + Math.round(((fixed + escalated) / total) * 20);
      }
    }
    
    console.log(`[ComprehensiveAudit] ✅ Fixed ${fixed} issues, escalated ${escalated}`);
  }

  /**
   * Generate comprehensive audit report
   */
  async generateReport(): Promise<AuditReport> {
    console.log('[ComprehensiveAudit] 📊 Generating report...');
    this.progress.phase = 'complete';
    this.progress.percentComplete = 95;
    
    const issues = await this.swarm.getAllIssues();
    const strikeStats = this.strikeTracker.getStats();
    
    // Calculate category breakdown
    const byCategory: Record<PageCategory, { pages: number; issues: number; fixed: number }> = {} as any;
    for (const [, page] of this.pageInventory) {
      if (!byCategory[page.category]) {
        byCategory[page.category] = { pages: 0, issues: 0, fixed: 0 };
      }
      byCategory[page.category].pages++;
    }
    
    for (const issue of issues) {
      const page = this.pageInventory.get(issue.pageId);
      if (page && byCategory[page.category]) {
        byCategory[page.category].issues++;
        if (issue.status === 'fixed' || issue.status === 'verified') {
          byCategory[page.category].fixed++;
        }
      }
    }
    
    // Calculate issue types
    const issueTypes = new Map<string, number>();
    for (const issue of issues) {
      issueTypes.set(issue.type, (issueTypes.get(issue.type) || 0) + 1);
    }
    const topIssueTypes = Array.from(issueTypes.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Build page results
    const pageResults: PageAuditSummary[] = Array.from(this.pageInventory.values()).map(page => {
      const pageIssues = issues.filter(i => i.pageId === page.id);
      const fixedCount = pageIssues.filter(i => i.status === 'fixed' || i.status === 'verified').length;
      
      return {
        pageId: page.id,
        pageName: page.name,
        category: page.category,
        issueCount: pageIssues.length,
        fixedCount,
        status: pageIssues.length === 0 ? 'clean' : 
                pageIssues.some(i => i.severity === 'critical') ? 'needs_attention' : 'has_issues'
      };
    });
    
    const report: AuditReport = {
      summary: {
        totalPages: this.pageInventory.size,
        pagesAudited: this.progress.pagesAudited,
        totalIssues: issues.length,
        criticalIssues: issues.filter(i => i.severity === 'critical').length,
        highIssues: issues.filter(i => i.severity === 'high').length,
        mediumIssues: issues.filter(i => i.severity === 'medium').length,
        lowIssues: issues.filter(i => i.severity === 'low').length,
        issuesFixed: this.progress.issuesFixed,
        fixRate: issues.length > 0 ? this.progress.issuesFixed / issues.length : 1,
        escalationRate: strikeStats.metrics.escalationRate
      },
      byCategory,
      bySME: {}, // Will be populated from swarm
      topIssueTypes,
      pageResults: pageResults.sort((a, b) => b.issueCount - a.issueCount),
      trmLearnings: [
        'Pattern 66 SwarmChoreography enabled parallel SME dispatch',
        'Pattern 67 ValidationRelay prioritized critical pages for E2E testing',
        'Pattern 68 StrikeTracker achieved 3-strike escalation protocol'
      ],
      recommendations: this.generateRecommendations(issues, pageResults),
      generatedAt: new Date()
    };
    
    // Persist report to LanceDB
    await lanceDB.addMemory('audit-report', JSON.stringify(report));
    
    this.progress.percentComplete = 100;
    console.log('[ComprehensiveAudit] ✅ Report generated');
    
    return report;
  }

  /**
   * Generate recommendations based on audit results
   */
  private generateRecommendations(issues: Issue[], pageResults: PageAuditSummary[]): string[] {
    const recommendations: string[] = [];
    
    // Check for critical issues
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(`⚠️ URGENT: ${criticalIssues.length} critical issues require immediate attention`);
    }
    
    // Check for categories with high issue counts
    const categoryIssues = new Map<string, number>();
    for (const result of pageResults) {
      categoryIssues.set(result.category, (categoryIssues.get(result.category) || 0) + result.issueCount);
    }
    
    const topCategory = Array.from(categoryIssues.entries())
      .sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] > 10) {
      recommendations.push(`📂 Focus on ${topCategory[0]} pages - ${topCategory[1]} issues found`);
    }
    
    // Check escalation rate
    if (this.progress.issuesEscalated > issues.length * 0.1) {
      recommendations.push(`👤 High escalation rate (${Math.round(this.progress.issuesEscalated / issues.length * 100)}%) - consider expanding auto-fix patterns`);
    }
    
    // Check for recurring issue types
    const issueTypes = new Map<string, number>();
    for (const issue of issues) {
      issueTypes.set(issue.type, (issueTypes.get(issue.type) || 0) + 1);
    }
    const topType = Array.from(issueTypes.entries())
      .sort((a, b) => b[1] - a[1])[0];
    if (topType && topType[1] > 5) {
      recommendations.push(`🔄 Recurring ${topType[0]} issues (${topType[1]}x) - implement systematic fix`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Platform is in good health - continue regular monitoring');
    }
    
    return recommendations;
  }

  /**
   * Run complete 5-phase audit
   */
  async runFullAudit(): Promise<AuditReport> {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  MB.MD v9.9.3 COMPREHENSIVE PLATFORM AUDIT');
    console.log('  Replit AI + Mr Blue Orchestration');
    console.log('═══════════════════════════════════════════════════════════════');
    
    this.progress.startTime = new Date();
    
    // Phase 1: Research
    await this.phase1Research();
    
    // Phase 2: Plan
    await this.phase2Plan();
    
    // Phase 3: Audit
    await this.phase3Audit();
    
    // Phase 4: Test
    await this.phase4Test();
    
    // Phase 5: Fix
    await this.phase5Fix();
    
    // Generate report
    const report = await this.generateReport();
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  AUDIT COMPLETE');
    console.log(`  Pages: ${report.summary.pagesAudited}/${report.summary.totalPages}`);
    console.log(`  Issues: ${report.summary.totalIssues} (${report.summary.criticalIssues} critical)`);
    console.log(`  Fixed: ${report.summary.issuesFixed} (${Math.round(report.summary.fixRate * 100)}%)`);
    console.log(`  Escalation Rate: ${Math.round(report.summary.escalationRate * 100)}%`);
    console.log('═══════════════════════════════════════════════════════════════');
    
    return report;
  }
}

// Export singleton
export const comprehensiveAuditRunner = new ComprehensiveAuditRunner();
