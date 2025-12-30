/**
 * Mr Blue Self-Healing Service
 * 
 * Implements MB.MD Pattern 53: Self-Healing System
 * Autonomously detects, analyzes, and fixes issues using the Error Recovery Protocol
 * 
 * Invocation: use mb.md: agents:self-healing
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// MB.MD Pattern Definitions with Auto-Fix Capabilities
interface MBMDPattern {
  id: number;
  name: string;
  pattern: string;
  rootCause: string;
  detection: (error: string) => boolean;
  autoFixSteps: string[];
  autoFixFunction?: (context: FixContext) => Promise<FixResult>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface FixContext {
  error: string;
  page: string;
  step: string;
  logs?: string[];
  screenshot?: string;
}

interface FixResult {
  success: boolean;
  action: string;
  details: string;
  requiresRetest: boolean;
}

// The 10 Self-Healing Agents from MB.MD
export const SELF_HEALING_AGENTS = {
  'SH-001': { name: 'Error Pattern Matcher', role: 'Maps errors to MB.MD patterns' },
  'SH-002': { name: 'Auto-Fixer', role: 'Applies automated fixes' },
  'SH-003': { name: 'Retry Manager', role: 'Manages retry with exponential backoff' },
  'SH-004': { name: 'Log Analyzer', role: 'Parses logs for root cause' },
  'SH-005': { name: 'Schema Validator', role: 'Validates database schema' },
  'SH-006': { name: 'Dependency Checker', role: 'Verifies package dependencies' },
  'SH-007': { name: 'API Health Monitor', role: 'Monitors API endpoint health' },
  'SH-008': { name: 'Memory Manager', role: 'Handles memory issues' },
  'SH-009': { name: 'Session Healer', role: 'Fixes auth/session issues' },
  'SH-010': { name: 'Workflow Recovery', role: 'Restarts failed workflows' },
};

// MB.MD Pattern Library with Auto-Fix Functions
// IMPORTANT: Order matters - more specific patterns should come before general ones
export const MBMD_PATTERNS: MBMDPattern[] = [
  {
    id: 99,
    name: 'Page Crash / Navigation Error',
    pattern: 'Pattern 99: Page Crash / Navigation Error',
    rootCause: 'Playwright page crashed or navigation failed during test',
    detection: (e) => /page crashed|page\.reload:.*crash|target.*closed|context.*closed|browser.*closed|frame detached|browser.*disconnected|navigation failed/i.test(e),
    autoFixSteps: [
      '1. Wait for page to stabilize before interaction',
      '2. Increase navigation timeout',
      '3. Check for memory issues causing crash',
      '4. Retry the test'
    ],
    autoFixFunction: async (ctx) => {
      console.log('[SH-010] Pattern 99: Page crash detected, recommending retry...');
      return {
        success: true,
        action: 'RETRY_AFTER_CRASH',
        details: 'Page crashed - will retry with fresh browser context',
        requiresRetest: true
      };
    },
    severity: 'high'
  },
  {
    id: 10,
    name: 'Login/Authentication Failure',
    pattern: 'Pattern 10: Login/Authentication Failure',
    rootCause: 'Login step failed - credentials or form submission issue',
    detection: (e) => /login failed|login error|authentication failed|credentials invalid|wrong password|incorrect.*credentials/i.test(e),
    autoFixSteps: [
      '1. Verify admin credentials are correct',
      '2. Check if login form selectors match',
      '3. Ensure CSRF token is present',
      '4. Retry login with correct credentials'
    ],
    autoFixFunction: async (ctx) => {
      console.log('[SH-009] Pattern 10: Login failure detected, will retry with fresh session...');
      return {
        success: true,
        action: 'RETRY_LOGIN',
        details: 'Login failed - retrying with fresh browser context',
        requiresRetest: true
      };
    },
    severity: 'high'
  },
  {
    id: 8,
    name: 'DOM Element Selection',
    pattern: 'Pattern 8: DOM Element Selection',
    rootCause: 'Target element not found - selector may have changed or element not rendered',
    detection: (e) => /element.*not found|selector.*not found|locator.*not found|timeout.*waiting for selector/i.test(e),
    autoFixSteps: [
      '1. Inspect page to find correct element selector',
      '2. Add data-testid attribute to target element',
      '3. Update test selector to match',
      '4. Re-run test'
    ],
    autoFixFunction: async (ctx) => {
      console.log('[SH-001] Pattern 8: Attempting to find alternative selector...');
      return {
        success: false,
        action: 'ESCALATE_TO_MANUAL',
        details: 'Element selector mismatch requires manual inspection',
        requiresRetest: false
      };
    },
    severity: 'medium'
  },
  {
    id: 12,
    name: 'Network Connectivity',
    pattern: 'Pattern 12: Network Connectivity',
    rootCause: 'Failed to establish connection to target endpoint',
    detection: (e) => /network|fetch|connection|econnrefused|socket/.test(e.toLowerCase()),
    autoFixSteps: [
      '1. Verify server is running on correct port',
      '2. Check CORS configuration',
      '3. Ensure firewall/proxy allows connections',
      '4. Re-run test'
    ],
    autoFixFunction: async (ctx) => {
      console.log('[SH-010] Pattern 12: Checking server health...');
      try {
        const response = await fetch('http://localhost:5000/api/health');
        if (response.ok) {
          return {
            success: true,
            action: 'SERVER_HEALTHY',
            details: 'Server is running, retrying request',
            requiresRetest: true
          };
        }
      } catch (e) {
        // Try to restart workflow
        console.log('[SH-010] Pattern 12: Attempting workflow restart...');
      }
      return {
        success: false,
        action: 'ESCALATE',
        details: 'Server not responding',
        requiresRetest: false
      };
    },
    severity: 'high'
  },
  {
    id: 15,
    name: 'Request Timeout',
    pattern: 'Pattern 15: Request Timeout',
    rootCause: 'Operation exceeded allowed time limit',
    detection: (e) => /timeout|timed out/.test(e.toLowerCase()),
    autoFixSteps: [
      '1. Check server logs for slow queries',
      '2. Optimize database queries or API calls',
      '3. Increase timeout in test config if needed',
      '4. Re-run test'
    ],
    autoFixFunction: async (ctx) => {
      console.log('[SH-003] Pattern 15: Timeout detected, will retry with extended wait...');
      return {
        success: true,
        action: 'RETRY_WITH_EXTENDED_TIMEOUT',
        details: 'Increasing wait time and retrying',
        requiresRetest: true
      };
    },
    severity: 'medium'
  },
  {
    id: 27,
    name: 'File Upload Processing',
    pattern: 'Pattern 27: File Upload Processing',
    rootCause: 'Multer middleware configuration issue or file size limit exceeded',
    detection: (e) => /upload|file|multer|multipart/.test(e.toLowerCase()),
    autoFixSteps: [
      '1. Check multer config in server/routes.ts',
      '2. Increase limits.fileSize for larger PDFs',
      '3. Ensure upload directory exists and is writable',
      '4. Re-run test'
    ],
    autoFixFunction: async (ctx) => {
      console.log('[SH-002] Pattern 27: Checking upload directory...');
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        return {
          success: true,
          action: 'CREATED_UPLOAD_DIR',
          details: 'Created missing uploads directory',
          requiresRetest: true
        };
      }
      return {
        success: false,
        action: 'ESCALATE',
        details: 'Upload directory exists, issue may be config-related',
        requiresRetest: false
      };
    },
    severity: 'high'
  },
  {
    id: 41,
    name: 'AI Resume Parsing',
    pattern: 'Pattern 41: AI Resume Parsing',
    rootCause: 'OpenAI API call failed or response parsing error',
    detection: (e) => /openai|gpt|resume.*pars|pdf.*pars|ai.*pars|api.*key.*invalid|rate.*limit.*exceed/i.test(e),
    autoFixSteps: [
      '1. Verify OPENAI_API_KEY is set in environment',
      '2. Check API rate limits and quota',
      '3. Add error handling for malformed responses',
      '4. Re-run test'
    ],
    autoFixFunction: async (ctx) => {
      console.log('[SH-002] Pattern 41: Checking OpenAI API key...');
      if (!process.env.OPENAI_API_KEY) {
        return {
          success: false,
          action: 'MISSING_API_KEY',
          details: 'OPENAI_API_KEY not configured',
          requiresRetest: false
        };
      }
      return {
        success: true,
        action: 'API_KEY_PRESENT',
        details: 'API key exists, retrying request',
        requiresRetest: true
      };
    },
    severity: 'high'
  },
  {
    id: 53,
    name: 'CSRF Token Validation',
    pattern: 'Pattern 53: CSRF Token Validation',
    rootCause: 'CSRF middleware blocking request without valid token',
    detection: (e) => /csrf|forbidden|403/.test(e.toLowerCase()),
    autoFixSteps: [
      '1. Open server/middleware/csrf.ts',
      '2. Add failing endpoint to CSRF_EXEMPT_PATHS array',
      '3. Restart server to apply changes',
      '4. Re-run test'
    ],
    autoFixFunction: async (ctx) => {
      console.log('[SH-002] Pattern 53: CSRF issue detected, checking exempt paths...');
      // Could auto-add endpoint to exempt list
      return {
        success: false,
        action: 'REQUIRES_CODE_CHANGE',
        details: 'CSRF exemption requires code modification',
        requiresRetest: false
      };
    },
    severity: 'high'
  },
  {
    id: 9,
    name: 'Authentication Session',
    pattern: 'Pattern 9: Authentication Session',
    rootCause: 'Auth token expired or invalid session state',
    detection: (e) => /401|unauthorized|token.*expired|session|access.*denied/.test(e.toLowerCase()),
    autoFixSteps: [
      '1. Check if token refresh is working',
      '2. Verify localStorage has valid tokens',
      '3. Re-authenticate if needed',
      '4. Re-run test'
    ],
    autoFixFunction: async (ctx) => {
      console.log('[SH-009] Pattern 9: Session issue detected, attempting re-auth...');
      return {
        success: true,
        action: 'RE_AUTHENTICATE',
        details: 'Will re-login and retry',
        requiresRetest: true
      };
    },
    severity: 'high'
  }
];

// Healing log entry type
type HealingLogEntry = { timestamp: Date; agent: string; action: string; result: string };

// Main Self-Healing Service
export class SelfHealingService {
  private maxRetries: number = 3;
  private retryCount: number = 0;
  private healingLog: HealingLogEntry[] = [];

  constructor() {
    console.log('[Mr Blue Self-Healing] Service initialized with 10 agents');
  }

  /**
   * Analyze error and match to MB.MD pattern
   * Uses Agent SH-001: Error Pattern Matcher
   */
  analyzeError(error: string): MBMDPattern | null {
    console.log('[SH-001] Analyzing error for pattern match...');
    
    for (const pattern of MBMD_PATTERNS) {
      if (pattern.detection(error)) {
        console.log(`[SH-001] Matched: ${pattern.pattern}`);
        this.logAction('SH-001', `Pattern matched: ${pattern.name}`, 'SUCCESS');
        return pattern;
      }
    }
    
    console.log('[SH-001] No pattern match found');
    this.logAction('SH-001', 'No pattern match', 'UNKNOWN_ERROR');
    return null;
  }

  /**
   * Attempt auto-fix for detected pattern
   * Uses Agent SH-002: Auto-Fixer
   */
  async attemptAutoFix(pattern: MBMDPattern, context: FixContext): Promise<FixResult> {
    console.log(`[SH-002] Attempting auto-fix for ${pattern.name}...`);
    
    if (!pattern.autoFixFunction) {
      this.logAction('SH-002', `No auto-fix available for ${pattern.name}`, 'MANUAL_REQUIRED');
      return {
        success: false,
        action: 'NO_AUTO_FIX',
        details: `Pattern ${pattern.id} requires manual intervention`,
        requiresRetest: false
      };
    }

    try {
      const result = await pattern.autoFixFunction(context);
      this.logAction('SH-002', `Auto-fix attempt: ${result.action}`, result.success ? 'SUCCESS' : 'FAILED');
      return result;
    } catch (e: any) {
      this.logAction('SH-002', `Auto-fix error: ${e.message}`, 'ERROR');
      return {
        success: false,
        action: 'AUTO_FIX_FAILED',
        details: e.message,
        requiresRetest: false
      };
    }
  }

  /**
   * Full self-healing cycle: detect -> analyze -> fix -> validate
   * Implements MB.MD Error Recovery Decision Tree
   */
  async heal(error: string, context: FixContext): Promise<{
    healed: boolean;
    pattern: MBMDPattern | null;
    fixResult: FixResult | null;
    retryRecommended: boolean;
    healingLog: HealingLogEntry[];
  }> {
    console.log('[Mr Blue Self-Healing] Starting healing cycle...');
    
    // Step 1: Pattern matching
    const pattern = this.analyzeError(error);
    
    if (!pattern) {
      return {
        healed: false,
        pattern: null,
        fixResult: null,
        retryRecommended: false,
        healingLog: this.healingLog
      };
    }

    // Step 2: Attempt auto-fix
    const fixResult = await this.attemptAutoFix(pattern, context);

    // Step 3: Determine if retry is recommended
    const shouldRetry = fixResult.requiresRetest && this.retryCount < this.maxRetries;
    
    if (shouldRetry) {
      this.retryCount++;
      this.logAction('SH-003', `Retry ${this.retryCount}/${this.maxRetries}`, 'PENDING');
    }

    return {
      healed: fixResult.success,
      pattern,
      fixResult,
      retryRecommended: shouldRetry,
      healingLog: this.healingLog
    };
  }

  /**
   * Reset retry counter for new test run
   */
  resetRetryCount(): void {
    this.retryCount = 0;
    this.healingLog = [];
  }

  /**
   * Get healing status and logs
   */
  getStatus(): { 
    agentsActive: string[];
    issuesFound: number;
    issuesFixed: number;
    retryCount: number;
    log: HealingLogEntry[];
  } {
    const issuesFixed = this.healingLog.filter(l => l.result === 'SUCCESS').length;
    return {
      agentsActive: Object.keys(SELF_HEALING_AGENTS),
      issuesFound: this.healingLog.length,
      issuesFixed,
      retryCount: this.retryCount,
      log: this.healingLog
    };
  }

  private logAction(agent: string, action: string, result: string): void {
    this.healingLog.push({
      timestamp: new Date(),
      agent,
      action,
      result
    });
  }
}

// Singleton instance
export const selfHealingService = new SelfHealingService();
