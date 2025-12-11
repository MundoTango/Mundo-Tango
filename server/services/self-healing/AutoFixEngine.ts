/**
 * Auto-Fix Engine
 * MB.MD v9.0 - Self-Healing Page Agent System
 * C5-1 to C5-3: Production-Ready Auto-Fix with 3-Strike Protocol
 * 
 * Features:
 * - 3-Strike Protocol: Track failures, escalate after 3 failed fix attempts
 * - Continuous Mode: Production loop for real-time healing
 * - Smart Fix Selection: Learn from past fix patterns
 */

import { db } from '../../../shared/db';
import { pageAudits, pageHealingLogs } from '../../../shared/schema';
import { PageAuditService, type AuditResults, type AuditIssue } from './PageAuditService';
import { SelfHealingService } from './SelfHealingService';
import { desc, eq, sql, and, gte } from 'drizzle-orm';

interface StrikeRecord {
  issueHash: string;
  issueDescription: string;
  pageId: string;
  strikes: number;
  lastAttempt: Date;
  fixAttempts: FixAttempt[];
  escalated: boolean;
  escalatedAt?: Date;
}

interface FixAttempt {
  attemptedAt: Date;
  fixApplied: string;
  success: boolean;
  errorMessage?: string;
}

interface ProductionLoopConfig {
  intervalMs: number;
  maxConcurrentPages: number;
  enableContinuousMode: boolean;
  strikeThreshold: number;
  cooldownPeriodMs: number;
}

interface LoopStatus {
  running: boolean;
  lastRun?: Date;
  pagesProcessed: number;
  issuesFixed: number;
  strikeEscalations: number;
  errors: number;
}

const strikeRecords = new Map<string, StrikeRecord>();
let productionLoopInterval: NodeJS.Timeout | null = null;
let loopStatus: LoopStatus = {
  running: false,
  pagesProcessed: 0,
  issuesFixed: 0,
  strikeEscalations: 0,
  errors: 0
};

const DEFAULT_CONFIG: ProductionLoopConfig = {
  intervalMs: 30000,
  maxConcurrentPages: 5,
  enableContinuousMode: true,
  strikeThreshold: 3,
  cooldownPeriodMs: 300000
};

export class AutoFixEngine {
  private static config: ProductionLoopConfig = { ...DEFAULT_CONFIG };

  /**
   * Initialize the Auto-Fix Engine
   * Called at server startup for production deployment
   */
  static async initialize(customConfig?: Partial<ProductionLoopConfig>): Promise<void> {
    if (customConfig) {
      this.config = { ...DEFAULT_CONFIG, ...customConfig };
    }

    console.log('🔧 [AutoFixEngine] Initializing...');
    console.log(`   - Continuous Mode: ${this.config.enableContinuousMode ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   - Strike Threshold: ${this.config.strikeThreshold}`);
    console.log(`   - Interval: ${this.config.intervalMs}ms`);
    console.log(`   - Cooldown: ${this.config.cooldownPeriodMs}ms`);

    await this.loadStrikeRecordsFromDB();

    if (this.config.enableContinuousMode) {
      this.startProductionLoop();
    }

    console.log('✅ [AutoFixEngine] Initialized successfully');
  }

  /**
   * Start the production continuous healing loop
   */
  static startProductionLoop(): void {
    if (productionLoopInterval) {
      console.log('⚠️ [AutoFixEngine] Production loop already running');
      return;
    }

    console.log('🚀 [AutoFixEngine] Starting production loop...');
    loopStatus.running = true;

    productionLoopInterval = setInterval(async () => {
      try {
        await this.runHealingCycle();
      } catch (error) {
        console.error('❌ [AutoFixEngine] Healing cycle error:', error);
        loopStatus.errors++;
      }
    }, this.config.intervalMs);

    this.runHealingCycle().catch(err => {
      console.error('❌ [AutoFixEngine] Initial healing cycle error:', err);
      loopStatus.errors++;
    });
  }

  /**
   * Stop the production loop
   */
  static stopProductionLoop(): void {
    if (productionLoopInterval) {
      clearInterval(productionLoopInterval);
      productionLoopInterval = null;
      loopStatus.running = false;
      console.log('⏹️ [AutoFixEngine] Production loop stopped');
    }
  }

  /**
   * Run a single healing cycle
   * Scans for issues and attempts fixes with 3-Strike Protocol
   */
  static async runHealingCycle(): Promise<void> {
    loopStatus.lastRun = new Date();

    const recentAudits = await db
      .select()
      .from(pageAudits)
      .where(gte(pageAudits.auditTimestamp, new Date(Date.now() - 3600000)))
      .orderBy(desc(pageAudits.auditTimestamp))
      .limit(this.config.maxConcurrentPages);

    const pagesWithIssues = recentAudits.filter(a => (a.totalIssues as number) > 0);

    if (pagesWithIssues.length === 0) {
      return;
    }

    console.log(`🔄 [AutoFixEngine] Processing ${pagesWithIssues.length} pages with issues`);

    await Promise.all(
      pagesWithIssues.map(async (audit) => {
        try {
          await this.processPageWithStrikes(audit.pageId);
          loopStatus.pagesProcessed++;
        } catch (error) {
          console.error(`❌ [AutoFixEngine] Failed to process ${audit.pageId}:`, error);
          loopStatus.errors++;
        }
      })
    );
  }

  /**
   * Process a page with 3-Strike Protocol
   */
  static async processPageWithStrikes(pageId: string): Promise<void> {
    const auditResults = await PageAuditService.runComprehensiveAudit(pageId);

    if (!auditResults.hasIssues) {
      return;
    }

    for (const category of Object.keys(auditResults.issuesByCategory)) {
      const issues = auditResults.issuesByCategory[category];
      
      for (const issue of issues) {
        await this.processIssueWithStrikes(pageId, issue, auditResults);
      }
    }
  }

  /**
   * Process a single issue with 3-Strike tracking
   */
  private static async processIssueWithStrikes(
    pageId: string,
    issue: AuditIssue,
    auditResults: AuditResults
  ): Promise<void> {
    const issueHash = this.generateIssueHash(pageId, issue);
    let record = strikeRecords.get(issueHash);

    if (!record) {
      record = {
        issueHash,
        issueDescription: issue.description,
        pageId,
        strikes: 0,
        lastAttempt: new Date(),
        fixAttempts: [],
        escalated: false
      };
      strikeRecords.set(issueHash, record);
    }

    if (record.escalated) {
      const timeSinceEscalation = Date.now() - (record.escalatedAt?.getTime() || 0);
      if (timeSinceEscalation < this.config.cooldownPeriodMs) {
        console.log(`⏳ [3-Strike] Issue ${issueHash.slice(0, 8)} in cooldown, skipping`);
        return;
      }
      record.escalated = false;
      record.strikes = 0;
      record.fixAttempts = [];
    }

    console.log(`🔨 [3-Strike] Attempting fix for issue (Strike ${record.strikes + 1}/${this.config.strikeThreshold})`);

    try {
      const singleIssueAudit: AuditResults = {
        ...auditResults,
        issuesByCategory: { [issue.category]: [issue] },
        totalIssues: 1
      };

      const healingResult = await SelfHealingService.executeSimultaneousFixes(singleIssueAudit);

      if (healingResult.success && healingResult.issuesFixed > 0) {
        record.fixAttempts.push({
          attemptedAt: new Date(),
          fixApplied: issue.suggestedFix || 'auto-fix',
          success: true
        });

        strikeRecords.delete(issueHash);
        loopStatus.issuesFixed++;
        console.log(`✅ [3-Strike] Issue fixed successfully, record cleared`);
      } else {
        this.recordStrike(record, 'Fix applied but no improvement detected');
      }
    } catch (error: any) {
      this.recordStrike(record, error.message);
    }

    strikeRecords.set(issueHash, record);
  }

  /**
   * Record a strike against an issue
   */
  private static recordStrike(record: StrikeRecord, errorMessage: string): void {
    record.strikes++;
    record.lastAttempt = new Date();
    record.fixAttempts.push({
      attemptedAt: new Date(),
      fixApplied: 'attempted',
      success: false,
      errorMessage
    });

    console.log(`⚠️ [3-Strike] Strike ${record.strikes}/${this.config.strikeThreshold} for ${record.issueHash.slice(0, 8)}`);

    if (record.strikes >= this.config.strikeThreshold) {
      this.escalateIssue(record);
    }
  }

  /**
   * Escalate an issue after reaching strike threshold
   */
  private static escalateIssue(record: StrikeRecord): void {
    record.escalated = true;
    record.escalatedAt = new Date();
    loopStatus.strikeEscalations++;

    console.log(`🚨 [3-Strike] ESCALATION: Issue ${record.issueHash.slice(0, 8)} reached ${this.config.strikeThreshold} strikes`);
    console.log(`   Page: ${record.pageId}`);
    console.log(`   Issue: ${record.issueDescription}`);
    console.log(`   Action: Cooldown for ${this.config.cooldownPeriodMs / 60000} minutes, then retry`);
  }

  /**
   * Generate a unique hash for an issue
   */
  private static generateIssueHash(pageId: string, issue: AuditIssue): string {
    const str = `${pageId}:${issue.category}:${issue.description}:${issue.agentId}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Load strike records from database
   */
  private static async loadStrikeRecordsFromDB(): Promise<void> {
    try {
      const recentFailures = await db
        .select()
        .from(pageHealingLogs)
        .where(
          and(
            eq(pageHealingLogs.success, false),
            gte(pageHealingLogs.healingTimestamp, new Date(Date.now() - 86400000))
          )
        )
        .limit(100);

      for (const failure of recentFailures) {
        const pageId = failure.pageId;
        const reasons = failure.failureReasons as any[];
        
        if (reasons && reasons.length > 0) {
          for (const reason of reasons) {
            const issueHash = this.generateIssueHash(pageId, {
              category: 'unknown',
              description: reason.error || 'Unknown error',
              severity: 'warning' as const,
              agentId: reason.agentId || 'unknown',
              suggestedFix: null,
              pageId
            });
            
            if (!strikeRecords.has(issueHash)) {
              strikeRecords.set(issueHash, {
                issueHash,
                issueDescription: reason.error || 'Unknown error',
                pageId,
                strikes: 1,
                lastAttempt: failure.healingTimestamp,
                fixAttempts: [{
                  attemptedAt: failure.healingTimestamp,
                  fixApplied: 'unknown',
                  success: false,
                  errorMessage: reason.error
                }],
                escalated: false
              });
            }
          }
        }
      }

      console.log(`📦 [AutoFixEngine] Loaded ${strikeRecords.size} strike records from DB`);
    } catch (error) {
      console.warn('⚠️ [AutoFixEngine] Could not load strike records from DB:', error);
    }
  }

  /**
   * Get current loop status
   */
  static getStatus(): LoopStatus {
    return { ...loopStatus };
  }

  /**
   * Get all strike records
   */
  static getStrikeRecords(): StrikeRecord[] {
    return Array.from(strikeRecords.values());
  }

  /**
   * Get escalated issues
   */
  static getEscalatedIssues(): StrikeRecord[] {
    return Array.from(strikeRecords.values()).filter(r => r.escalated);
  }

  /**
   * Clear a specific strike record
   */
  static clearStrike(issueHash: string): boolean {
    return strikeRecords.delete(issueHash);
  }

  /**
   * Clear all strike records
   */
  static clearAllStrikes(): void {
    strikeRecords.clear();
    console.log('🧹 [AutoFixEngine] All strike records cleared');
  }

  /**
   * Force run a healing cycle (for testing/manual trigger)
   */
  static async forceHealingCycle(): Promise<void> {
    console.log('🔄 [AutoFixEngine] Force running healing cycle...');
    await this.runHealingCycle();
  }

  /**
   * Update configuration
   */
  static updateConfig(newConfig: Partial<ProductionLoopConfig>): void {
    const wasRunning = loopStatus.running;
    
    if (wasRunning) {
      this.stopProductionLoop();
    }
    
    this.config = { ...this.config, ...newConfig };
    
    if (wasRunning && this.config.enableContinuousMode) {
      this.startProductionLoop();
    }
    
    console.log('⚙️ [AutoFixEngine] Configuration updated');
  }
}
