/**
 * Safety Confirmation Service (Pattern 70)
 * 
 * High-risk actions require human approval before execution.
 * This prevents accidental data loss or destructive operations.
 * 
 * MB.MD v3.1 - VibeCoding Evolution
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SafetyCheck {
  action: string;
  riskLevel: RiskLevel;
  description: string;
  requiresApproval: boolean;
  approvalReason?: string;
}

export interface PendingApproval {
  id: string;
  userId: number;
  action: string;
  riskLevel: RiskLevel;
  description: string;
  context: Record<string, any>;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approvedBy?: number;
  approvedAt?: number;
}

const RISK_PATTERNS: Array<{ pattern: RegExp; riskLevel: RiskLevel; reason: string }> = [
  { pattern: /\bDROP\s+TABLE\b/i, riskLevel: 'critical', reason: 'Database table deletion' },
  { pattern: /\bDROP\s+DATABASE\b/i, riskLevel: 'critical', reason: 'Database deletion' },
  { pattern: /\bTRUNCATE\b/i, riskLevel: 'critical', reason: 'Table data truncation' },
  { pattern: /\bDELETE\s+FROM\b/i, riskLevel: 'high', reason: 'Data deletion' },
  { pattern: /\bUPDATE\b.*\bWHERE\b/i, riskLevel: 'medium', reason: 'Data modification' },
  { pattern: /\brm\s+-rf?\b/i, riskLevel: 'critical', reason: 'File/directory deletion' },
  { pattern: /\bunlink\b|\bfs\.rmSync\b/i, riskLevel: 'high', reason: 'File deletion' },
  { pattern: /\bgit\s+push\s+.*--force\b/i, riskLevel: 'critical', reason: 'Force push to repository' },
  { pattern: /\bgit\s+reset\s+--hard\b/i, riskLevel: 'high', reason: 'Git history modification' },
  { pattern: /API_KEY|SECRET|PASSWORD|TOKEN/i, riskLevel: 'high', reason: 'Credential modification' },
  { pattern: /\.env\b/i, riskLevel: 'medium', reason: 'Environment file modification' },
  { pattern: /deploy|publish|production/i, riskLevel: 'high', reason: 'Production deployment' },
];

export class SafetyConfirmationService {
  private pendingApprovals: Map<string, PendingApproval> = new Map();
  private readonly APPROVAL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

  constructor() {
    console.log('[SafetyConfirmation] Service initialized');
    setInterval(() => this.cleanupExpiredApprovals(), 60 * 1000);
  }

  analyzeRisk(action: string, context?: Record<string, any>): SafetyCheck {
    let highestRisk: RiskLevel = 'low';
    let matchedReason = '';

    for (const { pattern, riskLevel, reason } of RISK_PATTERNS) {
      if (pattern.test(action) || (context?.code && pattern.test(context.code))) {
        if (this.riskLevelValue(riskLevel) > this.riskLevelValue(highestRisk)) {
          highestRisk = riskLevel;
          matchedReason = reason;
        }
      }
    }

    const requiresApproval = highestRisk === 'high' || highestRisk === 'critical';

    return {
      action,
      riskLevel: highestRisk,
      description: matchedReason || 'Standard operation',
      requiresApproval,
      approvalReason: requiresApproval ? matchedReason : undefined,
    };
  }

  private riskLevelValue(level: RiskLevel): number {
    const values: Record<RiskLevel, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };
    return values[level];
  }

  requestApproval(
    userId: number,
    action: string,
    riskLevel: RiskLevel,
    description: string,
    context: Record<string, any> = {}
  ): PendingApproval {
    const id = `approval-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const approval: PendingApproval = {
      id,
      userId,
      action,
      riskLevel,
      description,
      context,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.APPROVAL_TIMEOUT_MS,
      status: 'pending',
    };

    this.pendingApprovals.set(id, approval);
    console.log(`[SafetyConfirmation] Approval requested: ${id} - ${description}`);

    return approval;
  }

  approve(approvalId: string, adminId: number): boolean {
    const approval = this.pendingApprovals.get(approvalId);
    
    if (!approval) {
      console.warn(`[SafetyConfirmation] Approval not found: ${approvalId}`);
      return false;
    }

    if (approval.status !== 'pending') {
      console.warn(`[SafetyConfirmation] Approval already ${approval.status}: ${approvalId}`);
      return false;
    }

    if (Date.now() > approval.expiresAt) {
      approval.status = 'expired';
      console.warn(`[SafetyConfirmation] Approval expired: ${approvalId}`);
      return false;
    }

    approval.status = 'approved';
    approval.approvedBy = adminId;
    approval.approvedAt = Date.now();
    
    console.log(`[SafetyConfirmation] Approved by admin ${adminId}: ${approvalId}`);
    return true;
  }

  reject(approvalId: string, adminId: number): boolean {
    const approval = this.pendingApprovals.get(approvalId);
    
    if (!approval || approval.status !== 'pending') {
      return false;
    }

    approval.status = 'rejected';
    approval.approvedBy = adminId;
    approval.approvedAt = Date.now();
    
    console.log(`[SafetyConfirmation] Rejected by admin ${adminId}: ${approvalId}`);
    return true;
  }

  getApproval(approvalId: string): PendingApproval | undefined {
    return this.pendingApprovals.get(approvalId);
  }

  getPendingApprovals(userId?: number): PendingApproval[] {
    const approvals = Array.from(this.pendingApprovals.values())
      .filter(a => a.status === 'pending');

    if (userId !== undefined) {
      return approvals.filter(a => a.userId === userId);
    }

    return approvals;
  }

  isApproved(approvalId: string): boolean {
    const approval = this.pendingApprovals.get(approvalId);
    return approval?.status === 'approved';
  }

  private cleanupExpiredApprovals(): void {
    const now = Date.now();
    let cleaned = 0;

    const entries = Array.from(this.pendingApprovals.entries());
    for (const [id, approval] of entries) {
      if (approval.status === 'pending' && now > approval.expiresAt) {
        approval.status = 'expired';
        cleaned++;
      }
      if (now - approval.createdAt > 24 * 60 * 60 * 1000) {
        this.pendingApprovals.delete(id);
      }
    }

    if (cleaned > 0) {
      console.log(`[SafetyConfirmation] Expired ${cleaned} pending approvals`);
    }
  }

  formatForUser(check: SafetyCheck): string {
    const icons: Record<RiskLevel, string> = {
      low: '✅',
      medium: '⚠️',
      high: '🔴',
      critical: '🚨',
    };

    if (check.requiresApproval) {
      return `${icons[check.riskLevel]} **${check.riskLevel.toUpperCase()} RISK**: ${check.description}\n\nThis action requires admin approval before execution.`;
    }

    return `${icons[check.riskLevel]} Risk level: ${check.riskLevel} - ${check.description}`;
  }
}

export const safetyConfirmationService = new SafetyConfirmationService();
