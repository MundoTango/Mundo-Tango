/**
 * CONTINUOUS AUDITING SERVICE - C6-1
 * December 2025
 * 
 * Runs periodic page audits every 5 minutes, detects regressions,
 * and logs results to the database.
 */

import { pageAuditService, type PageAuditReport } from '../page-audit/PageAuditService';
import { db } from '../../db';
import { pageAudits, pageInventory, auditIssues } from '@shared/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

export interface AuditStatus {
  isRunning: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  totalPagesAudited: number;
  totalIssuesFound: number;
  criticalIssues: number;
  regressions: number;
  intervalMs: number;
  recentAudits: Array<{
    pagePath: string;
    timestamp: Date;
    issuesCount: number;
    hasRegressions: boolean;
  }>;
}

export interface RegressionResult {
  pagePath: string;
  previousIssues: number;
  currentIssues: number;
  newCriticalIssues: number;
  regressionType: 'minor' | 'major' | 'critical';
}

class ContinuousAuditService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastRunAt: Date | null = null;
  private nextRunAt: Date | null = null;
  private totalPagesAudited = 0;
  private totalIssuesFound = 0;
  private criticalIssues = 0;
  private regressions = 0;
  private intervalMs = 5 * 60 * 1000; // 5 minutes
  private recentAudits: AuditStatus['recentAudits'] = [];
  private initialized = false;

  /**
   * Initialize the continuous auditing service
   */
  async initialize(options?: { intervalMs?: number }): Promise<void> {
    if (this.initialized) {
      console.log('⚠️  [ContinuousAudit] Already initialized');
      return;
    }

    if (options?.intervalMs) {
      this.intervalMs = options.intervalMs;
    }

    console.log(`🔄 [ContinuousAudit] Initializing with ${this.intervalMs / 1000}s interval...`);

    // Start the periodic audit loop
    this.startPeriodicAudits();
    this.initialized = true;

    console.log('✅ [ContinuousAudit] Service initialized');
  }

  /**
   * Start periodic audits
   */
  private startPeriodicAudits(): void {
    // Calculate next run time
    this.nextRunAt = new Date(Date.now() + this.intervalMs);

    // Run immediately on start (but delayed slightly to not block startup)
    setTimeout(() => {
      this.runAuditCycle().catch(err => {
        console.error('❌ [ContinuousAudit] Initial audit cycle failed:', err);
      });
    }, 10000); // 10 second delay after startup

    // Set up interval for subsequent runs
    this.intervalId = setInterval(() => {
      this.runAuditCycle().catch(err => {
        console.error('❌ [ContinuousAudit] Audit cycle failed:', err);
      });
    }, this.intervalMs);

    console.log(`📅 [ContinuousAudit] Next audit scheduled for ${this.nextRunAt.toISOString()}`);
  }

  /**
   * Run a complete audit cycle
   */
  async runAuditCycle(): Promise<void> {
    if (this.isRunning) {
      console.log('⏳ [ContinuousAudit] Audit already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRunAt = new Date();
    const startTime = Date.now();

    console.log('🔍 [ContinuousAudit] Starting audit cycle...');

    try {
      // Get pages to audit (prioritize critical pages and pages with previous issues)
      const pagesToAudit = await this.getPagesToAudit();
      console.log(`📋 [ContinuousAudit] Found ${pagesToAudit.length} pages to audit`);

      let cycleIssues = 0;
      let cycleCritical = 0;
      let cycleRegressions = 0;

      for (const pagePath of pagesToAudit) {
        try {
          const report = await this.auditSinglePage(pagePath);
          
          if (report) {
            // Check for regressions
            const regression = await this.detectRegression(pagePath, report);
            
            cycleIssues += report.totalIssues;
            cycleCritical += report.critical;
            
            if (regression) {
              cycleRegressions++;
              this.regressions++;
              console.log(`⚠️  [ContinuousAudit] Regression detected in ${pagePath}: ${regression.regressionType}`);
            }

            // Log to database
            await this.logAuditResult(pagePath, report, regression);

            // Track recent audits
            this.recentAudits.unshift({
              pagePath,
              timestamp: new Date(),
              issuesCount: report.totalIssues,
              hasRegressions: !!regression
            });

            // Keep only last 20 recent audits
            if (this.recentAudits.length > 20) {
              this.recentAudits = this.recentAudits.slice(0, 20);
            }

            this.totalPagesAudited++;
          }
        } catch (err) {
          console.error(`❌ [ContinuousAudit] Failed to audit ${pagePath}:`, err);
        }
      }

      this.totalIssuesFound += cycleIssues;
      this.criticalIssues += cycleCritical;

      const duration = Date.now() - startTime;
      console.log(`✅ [ContinuousAudit] Cycle complete in ${duration}ms - ${pagesToAudit.length} pages, ${cycleIssues} issues, ${cycleRegressions} regressions`);

    } catch (err) {
      console.error('❌ [ContinuousAudit] Audit cycle error:', err);
    } finally {
      this.isRunning = false;
      this.nextRunAt = new Date(Date.now() + this.intervalMs);
    }
  }

  /**
   * Get list of pages to audit
   */
  private async getPagesToAudit(): Promise<string[]> {
    const pagesDir = path.join(process.cwd(), 'client/src/pages');
    
    try {
      // Get all page files
      const pageFiles = await glob('**/*.tsx', { cwd: pagesDir });
      
      // Map to relative paths from project root
      const pagePaths = pageFiles.map(file => `client/src/pages/${file}`);
      
      // Prioritize: audit a subset each cycle (max 10 pages per cycle to avoid long runs)
      // Rotate through pages using a simple round-robin based on time
      const rotationIndex = Math.floor(Date.now() / this.intervalMs) % Math.max(1, Math.ceil(pagePaths.length / 10));
      const startIndex = rotationIndex * 10;
      
      return pagePaths.slice(startIndex, startIndex + 10);
    } catch (err) {
      console.error('[ContinuousAudit] Failed to get pages:', err);
      return [];
    }
  }

  /**
   * Audit a single page
   */
  private async auditSinglePage(pagePath: string): Promise<PageAuditReport | null> {
    try {
      const fullPath = path.join(process.cwd(), pagePath);
      await fs.access(fullPath);
      
      const report = await pageAuditService.auditPage({
        pagePath,
        category: 'all',
        autoFix: false
      });
      
      return report;
    } catch (err) {
      // File might not exist or audit failed
      return null;
    }
  }

  /**
   * Detect regressions by comparing with previous audit
   */
  private async detectRegression(pagePath: string, currentReport: PageAuditReport): Promise<RegressionResult | null> {
    try {
      // Generate pageId from pagePath
      const pageId = pagePath.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 100);
      
      // Get previous audit for this page
      const previousAudits = await db
        .select()
        .from(pageAudits)
        .where(eq(pageAudits.pageId, pageId))
        .orderBy(desc(pageAudits.auditTimestamp))
        .limit(1);

      if (previousAudits.length === 0) {
        // First audit for this page, no regression possible
        return null;
      }

      const previous = previousAudits[0];
      const previousIssues = previous.totalIssues || 0;
      const previousCritical = previous.criticalIssues || 0;

      // Determine if this is a regression
      const issueIncrease = currentReport.totalIssues - previousIssues;
      const criticalIncrease = currentReport.critical - previousCritical;

      if (issueIncrease <= 0 && criticalIncrease <= 0) {
        // No regression - same or fewer issues
        return null;
      }

      let regressionType: RegressionResult['regressionType'] = 'minor';
      
      if (criticalIncrease > 0) {
        regressionType = 'critical';
      } else if (issueIncrease >= 3) {
        regressionType = 'major';
      }

      return {
        pagePath,
        previousIssues,
        currentIssues: currentReport.totalIssues,
        newCriticalIssues: criticalIncrease > 0 ? criticalIncrease : 0,
        regressionType
      };
    } catch (err) {
      console.error('[ContinuousAudit] Regression detection failed:', err);
      return null;
    }
  }

  /**
   * Log audit result to database
   */
  private async logAuditResult(
    pagePath: string,
    report: PageAuditReport,
    regression: RegressionResult | null
  ): Promise<void> {
    try {
      const pageId = pagePath.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 100);
      
      // First ensure the page exists in pageAgentRegistry
      const { pageAgentRegistry } = await import('@shared/schema');
      const pageName = pagePath.split('/').pop()?.replace(/\.tsx?$/, '') || 'Unknown';
      await db.insert(pageAgentRegistry).values({
        pageId,
        pageName,
        route: `/${pageName.toLowerCase()}`,
        pageAgentId: 'test-agent', // Use existing test agent for audits
        metadata: { pageType: report.pageType || 'unknown' },
        lastAudit: new Date(),
      }).onConflictDoNothing();
      
      await db.insert(pageAudits).values({
        pageId,
        totalIssues: report.totalIssues,
        criticalIssues: report.critical,
        hasIssues: report.totalIssues > 0,
        auditResults: report as any,
        auditorAgents: ['continuous-audit-service'],
        auditDurationMs: 0,
        issuesByCategory: {
          errors: report.errors,
          warnings: report.warnings,
          info: report.info,
          regression: regression ? regression.regressionType : null
        }
      });

      // Also log individual issues to audit_issues table
      for (const issue of report.issues) {
        await db.insert(auditIssues).values({
          pageId: pagePath.replace(/[^a-zA-Z0-9]/g, '_'),
          issueType: issue.category,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          status: 'open'
        }).onConflictDoNothing();
      }
    } catch (err) {
      console.error('[ContinuousAudit] Failed to log audit result:', err);
    }
  }

  /**
   * Get current audit status
   */
  getStatus(): AuditStatus {
    return {
      isRunning: this.isRunning,
      lastRunAt: this.lastRunAt,
      nextRunAt: this.nextRunAt,
      totalPagesAudited: this.totalPagesAudited,
      totalIssuesFound: this.totalIssuesFound,
      criticalIssues: this.criticalIssues,
      regressions: this.regressions,
      intervalMs: this.intervalMs,
      recentAudits: this.recentAudits
    };
  }

  /**
   * Trigger an immediate audit cycle
   */
  async triggerAudit(): Promise<void> {
    console.log('🔄 [ContinuousAudit] Manual audit triggered');
    await this.runAuditCycle();
  }

  /**
   * Stop the continuous auditing service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.initialized = false;
    console.log('⏹️  [ContinuousAudit] Service stopped');
  }
}

export const continuousAuditService = new ContinuousAuditService();
