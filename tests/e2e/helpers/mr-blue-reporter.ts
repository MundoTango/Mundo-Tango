/**
 * MR BLUE CONTEXT-AWARE TEST REPORTER
 * Intelligent Test Failure Analysis and Pattern Detection
 * 
 * This system provides:
 * 1. Intelligent failure analysis with full context
 * 2. Pattern detection across multiple test failures
 * 3. Severity assessment (low/medium/high/critical)
 * 4. Actionable fix suggestions
 * 5. Comprehensive JSON reporting
 * 
 * Integrates with Mr Blue AI for advanced insights
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Report for a single test execution
 */
export interface TestReport {
  pageId: string;              // Page identifier (e.g., "P10")
  pageName: string;            // Human-readable page name
  agent: string;               // Agent responsible for page
  route: string;               // URL route
  testType: string;            // Type of test (navigation, interaction, etc.)
  status?: 'success' | 'failure';
  error?: string;              // Error message if failed
  context?: any;               // Additional context data
  timestamp?: number;          // Unix timestamp
  userRole?: string;           // User role during test (user, admin, etc.)
  duration?: number;           // Test duration in milliseconds
  screenshot?: string;         // Path to screenshot if captured
}

/**
 * Performance metric report
 */
export interface TestMetric {
  pageId: string;
  metric: string;              // Metric name (e.g., "Page Load Time")
  value: number;               // Measured value
  threshold: number;           // Expected threshold
  passed: boolean;             // Did it pass the threshold?
  unit?: string;               // Unit of measurement (ms, s, %, etc.)
}

/**
 * Pattern analysis structure
 */
export interface PatternAnalysis {
  pattern: string;             // Error pattern identifier
  occurrences: number;         // Number of times this pattern occurred
  affectedPages: string[];     // Pages where this pattern was observed
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;          // Recommended fix
  context?: any;               // Additional pattern context
}

/**
 * Comprehensive test report structure
 */
export interface ComprehensiveReport {
  timestamp: string;
  passed: number;
  failed: number;
  skipped: number;
  coverage: number;            // Percentage of tests passed
  selfHealingCount: number;
  reportsGenerated: number;
  totalDuration: number;       // Total test suite duration
  failures: TestReport[];
  metrics: TestMetric[];
  patterns: PatternAnalysis[];
  recommendations: string[];
  summary: string;
}

/**
 * Mr Blue Reporter Class
 * Provides intelligent test failure analysis and reporting
 */
export class MrBlueReporter {
  private reports: TestReport[] = [];
  private metrics: TestMetric[] = [];
  private patterns: Map<string, PatternAnalysis> = new Map();
  private startTime: number = Date.now();

  /**
   * Report successful test execution
   * 
   * @param report - Test report data
   */
  async reportSuccess(report: TestReport): Promise<void> {
    this.reports.push({
      ...report,
      status: 'success',
      timestamp: Date.now(),
    });

    // Send to Mr Blue API (if available)
    await this.sendToMrBlue(report, 'success');

    console.log(
      `💙 Mr Blue: ✅ SUCCESS - ${report.pageId}: ${report.pageName}`
    );
  }

  /**
   * Report test failure with full context
   * 
   * @param report - Test report data including error details
   */
  async reportFailure(report: TestReport): Promise<void> {
    this.reports.push({
      ...report,
      status: 'failure',
      timestamp: Date.now(),
    });

    // Analyze failure pattern
    this.analyzeFailurePattern(report);

    // Send to Mr Blue API (if available)
    await this.sendToMrBlue(report, 'failure');

    console.log(
      `💙 Mr Blue: ❌ FAILURE\n` +
      `   Page: ${report.pageId} - ${report.pageName}\n` +
      `   Agent: ${report.agent}\n` +
      `   Route: ${report.route}\n` +
      `   Error: ${report.error}\n` +
      `   Context: ${JSON.stringify(report.context || {}, null, 2)}`
    );
  }

  /**
   * Report performance metric
   * 
   * @param metric - Metric data
   */
  async reportMetric(metric: TestMetric): Promise<void> {
    this.metrics.push(metric);

    const status = metric.passed ? '✅' : '❌';
    const unit = metric.unit || '';
    
    console.log(
      `📊 Metric: ${metric.metric} = ${metric.value}${unit} ` +
      `(threshold: ${metric.threshold}${unit}) ${status}`
    );
  }

  /**
   * Analyze failure patterns across multiple tests
   * Detects recurring issues and assigns severity
   * 
   * @param report - Failed test report
   */
  private analyzeFailurePattern(report: TestReport): void {
    if (!report.error) return;

    // Extract error type
    const errorType = this.classifyError(report.error);
    
    // Check if pattern exists
    if (this.patterns.has(errorType)) {
      const pattern = this.patterns.get(errorType)!;
      pattern.occurrences++;
      
      // Add page if not already tracked
      if (!pattern.affectedPages.includes(report.pageId)) {
        pattern.affectedPages.push(report.pageId);
      }

      // Update severity if pattern is worsening
      if (pattern.occurrences >= 5) {
        pattern.severity = 'critical';
      } else if (pattern.occurrences >= 3) {
        pattern.severity = 'high';
      }
    } else {
      // Create new pattern entry
      this.patterns.set(errorType, {
        pattern: errorType,
        occurrences: 1,
        affectedPages: [report.pageId],
        severity: this.determineSeverity(errorType),
        suggestion: this.generateSuggestion(errorType),
        context: {
          firstOccurrence: Date.now(),
          sampleError: report.error
        }
      });
    }
  }

  /**
   * Classify error into predefined types
   * 
   * @param error - Error message string
   * @returns Error type classification
   */
  private classifyError(error: string): string {
    const lowerError = error.toLowerCase();

    if (lowerError.includes('timeout')) return 'TIMEOUT';
    if (lowerError.includes('not found') || lowerError.includes('404')) return 'ELEMENT_NOT_FOUND';
    if (lowerError.includes('401') || lowerError.includes('403') || lowerError.includes('unauthorized')) return 'AUTH_ERROR';
    if (lowerError.includes('500') || lowerError.includes('502') || lowerError.includes('503')) return 'SERVER_ERROR';
    if (lowerError.includes('network') || lowerError.includes('connection')) return 'NETWORK_ERROR';
    if (lowerError.includes('selector') || lowerError.includes('locator')) return 'SELECTOR_ERROR';
    if (lowerError.includes('assertion') || lowerError.includes('expected')) return 'ASSERTION_ERROR';
    if (lowerError.includes('navigation') || lowerError.includes('redirect')) return 'NAVIGATION_ERROR';
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Determine error severity based on type
   * 
   * @param errorType - Classified error type
   * @returns Severity level
   */
  private determineSeverity(errorType: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (errorType) {
      case 'TIMEOUT':
        return 'medium';
      case 'ELEMENT_NOT_FOUND':
        return 'high';
      case 'AUTH_ERROR':
        return 'critical';
      case 'SERVER_ERROR':
        return 'critical';
      case 'NETWORK_ERROR':
        return 'high';
      case 'SELECTOR_ERROR':
        return 'medium';
      case 'ASSERTION_ERROR':
        return 'high';
      case 'NAVIGATION_ERROR':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Generate actionable fix suggestion based on error type
   * 
   * @param errorType - Classified error type
   * @returns Fix suggestion string
   */
  private generateSuggestion(errorType: string): string {
    switch (errorType) {
      case 'TIMEOUT':
        return 'Consider increasing timeout or optimizing page load performance. Check for slow API calls or heavy computations.';
      case 'ELEMENT_NOT_FOUND':
        return 'Update test selectors or use self-healing locators. Element may have changed. Verify data-testid attributes exist.';
      case 'AUTH_ERROR':
        return 'Check authentication flow. Verify test user credentials and permissions. Ensure auth tokens are valid.';
      case 'SERVER_ERROR':
        return 'Backend service may be down. Check server logs and database connection. Verify API endpoints are responding.';
      case 'NETWORK_ERROR':
        return 'Verify network connectivity. Check API endpoints and firewall rules. Ensure test environment has internet access.';
      case 'SELECTOR_ERROR':
        return 'Use data-testid attributes instead of class/id selectors for stability. Update selectors to match current DOM structure.';
      case 'ASSERTION_ERROR':
        return 'Verify expected vs actual values. Check if business logic changed. Update test expectations if behavior is correct.';
      case 'NAVIGATION_ERROR':
        return 'Check route configuration and permissions. Verify navigation guards. Ensure user has access to destination page.';
      default:
        return 'Review test logs and Mr Blue analysis for detailed insights. Check console for additional error information.';
    }
  }

  /**
   * Send report to Mr Blue AI system
   * Currently logs to file, in production would call actual Mr Blue API
   * 
   * @param report - Test report
   * @param status - Test status
   */
  private async sendToMrBlue(report: TestReport, status: 'success' | 'failure'): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        status,
        ...report,
      };

      // Write to Mr Blue log file
      const logPath = path.join(process.cwd(), 'test-results', 'mr-blue-reports.json');
      
      // Ensure directory exists
      const dir = path.dirname(logPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Read existing log or create new array
      let existingLog: any[] = [];
      if (fs.existsSync(logPath)) {
        try {
          const content = fs.readFileSync(logPath, 'utf-8');
          existingLog = JSON.parse(content);
        } catch {
          existingLog = [];
        }
      }

      // Append new entry
      existingLog.push(logEntry);
      
      // Write updated log
      fs.writeFileSync(logPath, JSON.stringify(existingLog, null, 2));
    } catch (error) {
      console.warn('⚠️  Failed to send report to Mr Blue:', error);
    }
  }

  /**
   * Generate comprehensive test report with analysis
   * 
   * @returns Complete test report with statistics and recommendations
   */
  async generateReport(): Promise<ComprehensiveReport> {
    const totalTests = this.reports.length;
    const passed = this.reports.filter((r) => r.status === 'success').length;
    const failed = this.reports.filter((r) => r.status === 'failure').length;
    const skipped = 0; // Can be enhanced to track skipped tests
    const coverage = totalTests > 0 ? (passed / totalTests) * 100 : 0;

    // Calculate total duration
    const totalDuration = Date.now() - this.startTime;

    // Get self-healing count (would come from self-healing locator integration)
    const selfHealingCount = 0; // Placeholder - integrate with SelfHealingLocator

    // Generate recommendations based on patterns
    const recommendations = this.generateRecommendations();

    // Generate summary
    const summary = this.generateSummary(passed, failed, coverage);

    const report: ComprehensiveReport = {
      timestamp: new Date().toISOString(),
      passed,
      failed,
      skipped,
      coverage,
      selfHealingCount,
      reportsGenerated: totalTests,
      totalDuration,
      failures: this.reports.filter(r => r.status === 'failure'),
      metrics: this.metrics,
      patterns: Array.from(this.patterns.values()),
      recommendations,
      summary
    };

    // Save to file
    await this.saveReport(report);

    return report;
  }

  /**
   * Generate recommendations based on failure patterns
   * 
   * @returns Array of recommendation strings
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const patterns = Array.from(this.patterns.values());

    // Sort patterns by severity and occurrence
    patterns.sort((a, b) => {
      const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityWeight[b.severity] - severityWeight[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.occurrences - a.occurrences;
    });

    // Generate recommendations for top patterns
    patterns.forEach(pattern => {
      const emoji = {
        critical: '🚨',
        high: '⚠️',
        medium: 'ℹ️',
        low: '💡'
      }[pattern.severity];

      recommendations.push(
        `${emoji} ${pattern.severity.toUpperCase()}: ${pattern.pattern} occurred ${pattern.occurrences} times ` +
        `across ${pattern.affectedPages.length} pages. ${pattern.suggestion}`
      );
    });

    // Add general recommendations if needed
    if (this.reports.filter(r => r.status === 'failure').length > 10) {
      recommendations.push(
        '💡 Consider reviewing test stability. High failure rate detected. ' +
        'Review self-healing logs and update selectors where needed.'
      );
    }

    return recommendations;
  }

  /**
   * Generate executive summary
   * 
   * @param passed - Number of passed tests
   * @param failed - Number of failed tests
   * @param coverage - Coverage percentage
   * @returns Summary string
   */
  private generateSummary(passed: number, failed: number, coverage: number): string {
    const total = passed + failed;
    const status = coverage >= 90 ? 'EXCELLENT' : coverage >= 75 ? 'GOOD' : coverage >= 50 ? 'NEEDS IMPROVEMENT' : 'CRITICAL';

    return (
      `Test Suite Execution: ${status}\n` +
      `Total Tests: ${total} | Passed: ${passed} | Failed: ${failed}\n` +
      `Coverage: ${coverage.toFixed(1)}%\n` +
      `Patterns Detected: ${this.patterns.size}\n` +
      `Critical Issues: ${Array.from(this.patterns.values()).filter(p => p.severity === 'critical').length}`
    );
  }

  /**
   * Save comprehensive report to file
   * 
   * @param report - Report to save
   */
  private async saveReport(report: ComprehensiveReport): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const reportPath = path.join(
        process.cwd(),
        'test-results',
        `comprehensive-test-report-${timestamp}.json`
      );

      // Ensure directory exists
      const dir = path.dirname(reportPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      console.log(`\n💙 Mr Blue Comprehensive Report saved to: ${reportPath}`);
      console.log(`\n${report.summary}`);
      
      if (report.recommendations.length > 0) {
        console.log(`\n📋 Top Recommendations:`);
        report.recommendations.slice(0, 5).forEach(rec => console.log(`   ${rec}`));
      }
    } catch (error) {
      console.error('❌ Failed to save Mr Blue report:', error);
    }
  }

  /**
   * Clear all reports (useful for test isolation)
   */
  clearReports(): void {
    this.reports = [];
    this.metrics = [];
    this.patterns.clear();
    this.startTime = Date.now();
  }

  /**
   * Get current statistics
   */
  getStatistics(): {
    total: number;
    passed: number;
    failed: number;
    coverage: number;
    patterns: number;
  } {
    const total = this.reports.length;
    const passed = this.reports.filter(r => r.status === 'success').length;
    const failed = this.reports.filter(r => r.status === 'failure').length;
    const coverage = total > 0 ? (passed / total) * 100 : 0;

    return {
      total,
      passed,
      failed,
      coverage,
      patterns: this.patterns.size
    };
  }
}

/**
 * Export singleton instance for convenience
 */
export const mrBlue = new MrBlueReporter();
