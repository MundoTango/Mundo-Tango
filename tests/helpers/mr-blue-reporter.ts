/**
 * MR BLUE AI REPORTER
 * Pattern detection and intelligent test insights
 * 
 * Capabilities:
 * - Detects failure patterns across tests
 * - Provides severity levels and recommendations
 * - Generates executive-level reports
 * - Tracks flakiness and stability
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: string;
  pageUrl?: string;
}

export interface Pattern {
  type: 'auth_failure' | 'timeout' | 'selector_missing' | 'api_error' | 'theme_mismatch';
  severity: 'critical' | 'high' | 'medium' | 'low';
  count: number;
  affectedTests: string[];
  recommendation: string;
}

export class MrBlueReporter {
  private testResults: TestResult[] = [];
  private patterns: Pattern[] = [];

  addTestResult(result: TestResult): void {
    this.testResults.push(result);
    this.detectPatterns();
  }

  private detectPatterns(): void {
    this.patterns = [];

    // Pattern 1: Authentication failures
    const authFailures = this.testResults.filter(r => 
      r.error?.includes('401') || 
      r.error?.includes('unauthorized') ||
      r.error?.includes('authentication')
    );

    if (authFailures.length > 0) {
      this.patterns.push({
        type: 'auth_failure',
        severity: 'critical',
        count: authFailures.length,
        affectedTests: authFailures.map(t => t.testName),
        recommendation: 'Check authentication middleware and session management. Verify JWT_SECRET and SESSION_SECRET environment variables.'
      });
    }

    // Pattern 2: Timeout issues
    const timeouts = this.testResults.filter(r =>
      r.error?.includes('timeout') ||
      r.duration > 30000
    );

    if (timeouts.length > 3) {
      this.patterns.push({
        type: 'timeout',
        severity: 'high',
        count: timeouts.length,
        affectedTests: timeouts.map(t => t.testName),
        recommendation: 'Performance issue detected. Check API response times and database query optimization.'
      });
    }

    // Pattern 3: Missing selectors
    const selectorIssues = this.testResults.filter(r =>
      r.error?.includes('Element not found') ||
      r.error?.includes('data-testid')
    );

    if (selectorIssues.length > 0) {
      this.patterns.push({
        type: 'selector_missing',
        severity: 'medium',
        count: selectorIssues.length,
        affectedTests: selectorIssues.map(t => t.testName),
        recommendation: 'Add missing data-testid attributes to components. Review component implementation.'
      });
    }

    // Pattern 4: API errors
    const apiErrors = this.testResults.filter(r =>
      r.error?.includes('500') ||
      r.error?.includes('API') ||
      r.error?.includes('fetch failed')
    );

    if (apiErrors.length > 0) {
      this.patterns.push({
        type: 'api_error',
        severity: 'critical',
        count: apiErrors.length,
        affectedTests: apiErrors.map(t => t.testName),
        recommendation: 'Backend API issues detected. Check server logs, database connections, and error handling.'
      });
    }

    // Pattern 5: Theme mismatches
    const themeIssues = this.testResults.filter(r =>
      r.error?.includes('theme') ||
      r.error?.includes('color') ||
      r.testName.includes('theme')
    );

    if (themeIssues.length > 0) {
      this.patterns.push({
        type: 'theme_mismatch',
        severity: 'medium',
        count: themeIssues.length,
        affectedTests: themeIssues.map(t => t.testName),
        recommendation: 'Theme system configuration issue. Verify theme-routes.ts and CSS variable application.'
      });
    }
  }

  generateReport(): string {
    const totalTests = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;
    const skipped = this.testResults.filter(r => r.status === 'skipped').length;
    const passRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;

    let report = '\n';
    report += '╔════════════════════════════════════════════════════════════╗\n';
    report += '║         MR BLUE AI TEST REPORT - PATTERN ANALYSIS         ║\n';
    report += '╠════════════════════════════════════════════════════════════╣\n';
    report += `║  Total Tests:     ${totalTests.toString().padEnd(42)} ║\n`;
    report += `║  ✅ Passed:       ${passed.toString().padEnd(42)} ║\n`;
    report += `║  ❌ Failed:       ${failed.toString().padEnd(42)} ║\n`;
    report += `║  ⏭️  Skipped:      ${skipped.toString().padEnd(42)} ║\n`;
    report += `║  📊 Pass Rate:    ${passRate}%${' '.repeat(40 - passRate.toString().length)} ║\n`;
    report += '╠════════════════════════════════════════════════════════════╣\n';
    report += `║  🔍 Patterns Detected: ${this.patterns.length.toString().padEnd(35)} ║\n`;
    report += '╚════════════════════════════════════════════════════════════╝\n';

    if (this.patterns.length > 0) {
      report += '\n🔍 DETECTED PATTERNS:\n\n';
      this.patterns.forEach((pattern, index) => {
        const severityIcon = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢'
        }[pattern.severity];

        report += `${index + 1}. ${severityIcon} ${pattern.type.toUpperCase()} (Severity: ${pattern.severity})\n`;
        report += `   Count: ${pattern.count} tests affected\n`;
        report += `   Recommendation: ${pattern.recommendation}\n`;
        report += `   Affected Tests:\n`;
        pattern.affectedTests.slice(0, 3).forEach(test => {
          report += `     - ${test}\n`;
        });
        if (pattern.affectedTests.length > 3) {
          report += `     ... and ${pattern.affectedTests.length - 3} more\n`;
        }
        report += '\n';
      });
    }

    return report;
  }

  saveReport(filename: string = 'mr-blue-report.json'): void {
    const reportPath = path.join('test-results', filename);
    fs.mkdirSync('test-results', { recursive: true });

    const jsonReport = {
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'passed').length,
        failed: this.testResults.filter(r => r.status === 'failed').length,
        skipped: this.testResults.filter(r => r.status === 'skipped').length,
      },
      patterns: this.patterns,
      testResults: this.testResults,
      generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(reportPath, JSON.stringify(jsonReport, null, 2));
    console.log(`🤖 Mr Blue report saved: ${reportPath}`);
  }

  printReport(): void {
    console.log(this.generateReport());
  }
}

// Global instance
export const mrBlue = new MrBlueReporter();
