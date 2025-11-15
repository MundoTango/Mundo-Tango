/**
 * Mr. Blue Validation & Self-Healing System
 * Provides comprehensive code quality validation and automatic error fixing
 * 
 * Features:
 * - LSP diagnostics validation (TypeScript errors/warnings)
 * - Test execution with Playwright
 * - AI-powered error analysis using GROQ
 * - Automatic fix generation and application
 * - Rollback capability with snapshots
 * - Success metrics tracking
 */

import Groq from 'groq-sdk';
import { autonomousAgent } from './autonomousAgent';

// ==================== TYPE DEFINITIONS ====================

/**
 * LSP diagnostics report
 */
export interface LSPReport {
  totalErrors: number;
  totalWarnings: number;
  files: Map<string, DiagnosticError[]>;
  success: boolean;
}

/**
 * Individual diagnostic error
 */
export interface DiagnosticError {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string; // TS error code (e.g., "TS2345")
}

/**
 * Test execution results
 */
export interface TestResults {
  passed: number;
  failed: number;
  total: number;
  failedTests: FailedTest[];
  coverage?: number;
  duration: number; // milliseconds
}

/**
 * Failed test details
 */
export interface FailedTest {
  name: string;
  error: string;
  stackTrace: string;
  file: string;
}

/**
 * AI-powered error analysis result
 */
export interface ErrorAnalysis {
  rootCauses: string[];
  suggestedFixes: string[];
  complexity: 'simple' | 'medium' | 'complex';
  canAutoFix: boolean;
}

/**
 * Code fix instruction
 */
export interface CodeFix {
  filePath: string;
  oldString: string;
  newString: string;
  explanation: string;
  confidence: number; // 0-1
}

/**
 * Fix application result
 */
export interface FixResult {
  appliedFixes: number;
  failedFixes: number;
  errors: string[];
  filesModified: string[];
}

/**
 * Success metrics
 */
export interface Metrics {
  errorsFixed: number;
  warningsReduced: number;
  qualityScore: number; // 0-100
  improvementPercent: number;
}

// ==================== MAIN VALIDATOR CLASS ====================

/**
 * Main Validator class for code quality and self-healing
 */
export class Validator {
  private groq: Groq;
  private snapshots: Map<string, Map<string, string>> = new Map();
  private readonly MAX_SNAPSHOTS = 10;

  constructor() {
    // Initialize GROQ with Bifrost AI Gateway support
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || '',
      baseURL: process.env.BIFROST_BASE_URL || undefined,
    });

    console.log('[Validator] Initialized validation and self-healing system');
  }

  // ==================== LSP DIAGNOSTICS VALIDATION ====================

  /**
   * Check TypeScript LSP diagnostics for errors and warnings
   * @param filePaths - Optional array of specific files to check (defaults to all)
   * @returns LSP report with all errors and warnings
   */
  async checkLSPDiagnostics(filePaths?: string[]): Promise<LSPReport> {
    console.log('[Validator] Checking LSP diagnostics...');

    try {
      // Execute TypeScript compiler in no-emit mode
      const { stdout, stderr, exitCode } = await autonomousAgent.executeCommand(
        'npx tsc --noEmit',
        60000 // 60 second timeout
      );

      // Combine stdout and stderr for parsing
      const output = stdout + '\n' + stderr;

      // Parse TypeScript compiler output
      // Format: "src/file.ts(10,5): error TS2345: Argument of type..."
      const errorRegex = /(.+)\((\d+),(\d+)\):\s+(error|warning)\s+TS(\d+):\s+(.+)/g;

      const errors = new Map<string, DiagnosticError[]>();
      let totalErrors = 0;
      let totalWarnings = 0;

      let match;
      while ((match = errorRegex.exec(output)) !== null) {
        const [, file, line, column, severity, code, message] = match;

        // Filter by specified files if provided
        if (filePaths && filePaths.length > 0) {
          const matchesFilter = filePaths.some(fp => file.includes(fp));
          if (!matchesFilter) continue;
        }

        const diagnostic: DiagnosticError = {
          file: file.trim(),
          line: parseInt(line),
          column: parseInt(column),
          message: message.trim(),
          severity: severity as 'error' | 'warning',
          code: `TS${code}`
        };

        if (!errors.has(diagnostic.file)) {
          errors.set(diagnostic.file, []);
        }
        errors.get(diagnostic.file)!.push(diagnostic);

        if (diagnostic.severity === 'error') {
          totalErrors++;
        } else if (diagnostic.severity === 'warning') {
          totalWarnings++;
        }
      }

      const report: LSPReport = {
        totalErrors,
        totalWarnings,
        files: errors,
        success: totalErrors === 0
      };

      console.log(`[Validator] LSP check complete: ${totalErrors} errors, ${totalWarnings} warnings`);
      return report;
    } catch (error: any) {
      console.error('[Validator] LSP diagnostics failed:', error.message);
      throw new Error(`LSP diagnostics failed: ${error.message}`);
    }
  }

  // ==================== TEST EXECUTION ====================

  /**
   * Run Playwright tests and parse results
   * @param testPattern - Optional test pattern to run specific tests
   * @returns Test results with pass/fail counts and failed test details
   */
  async runTests(testPattern?: string): Promise<TestResults> {
    console.log('[Validator] Running tests...');

    const startTime = Date.now();
    let attempt = 1;
    const maxAttempts = 2; // Retry logic for flaky tests

    while (attempt <= maxAttempts) {
      try {
        // Build test command
        const command = testPattern 
          ? `npm run test -- ${testPattern}`
          : 'npm run test';

        console.log(`[Validator] Executing tests (attempt ${attempt}/${maxAttempts}): ${command}`);

        const { stdout, stderr, exitCode } = await autonomousAgent.executeCommand(
          command,
          120000 // 2 minute timeout
        );

        const output = stdout + '\n' + stderr;
        const duration = Date.now() - startTime;

        // Parse Playwright test output
        // Look for patterns like "5 passed (1s)" or "3 failed"
        const passedMatch = output.match(/(\d+)\s+passed/);
        const failedMatch = output.match(/(\d+)\s+failed/);
        const totalMatch = output.match(/(\d+)\s+total/);

        const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
        const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
        const total = totalMatch ? parseInt(totalMatch[1]) : passed + failed;

        // Extract failed test details
        const failedTests: FailedTest[] = [];

        // Parse failed test details
        // Pattern: "  ✓ test name" for passed, "  ✗ test name" for failed
        const testBlockRegex = /✗\s+(.+?)\n([\s\S]+?)(?=\n\s+✗|\n\n|$)/g;
        let testMatch;

        while ((testMatch = testBlockRegex.exec(output)) !== null) {
          const testName = testMatch[1].trim();
          const testOutput = testMatch[2];

          // Extract error message and stack trace
          const errorMatch = testOutput.match(/Error:\s+(.+?)(?=\n|$)/);
          const stackMatch = testOutput.match(/at\s+.+/g);

          failedTests.push({
            name: testName,
            error: errorMatch ? errorMatch[1] : 'Unknown error',
            stackTrace: stackMatch ? stackMatch.join('\n') : '',
            file: extractFileFromStack(stackMatch ? stackMatch[0] : '')
          });
        }

        const results: TestResults = {
          passed,
          failed,
          total,
          failedTests,
          duration
        };

        console.log(`[Validator] Tests complete: ${passed} passed, ${failed} failed (${duration}ms)`);

        // If tests passed or this is the last attempt, return results
        if (failed === 0 || attempt === maxAttempts) {
          return results;
        }

        // Retry for flaky tests
        console.log(`[Validator] Retrying flaky tests...`);
        attempt++;
      } catch (error: any) {
        console.error(`[Validator] Test execution failed (attempt ${attempt}):`, error.message);
        
        if (attempt === maxAttempts) {
          throw new Error(`Test execution failed after ${maxAttempts} attempts: ${error.message}`);
        }
        
        attempt++;
      }
    }

    // Should never reach here, but TypeScript requires a return
    throw new Error('Unexpected test execution flow');
  }

  // ==================== AI-POWERED ERROR ANALYSIS ====================

  /**
   * Analyze errors using AI to determine root causes and suggest fixes
   * @param errors - Array of diagnostic errors to analyze
   * @returns AI-powered error analysis with root causes and fix suggestions
   */
  async analyzeErrors(errors: DiagnosticError[]): Promise<ErrorAnalysis> {
    console.log(`[Validator] Analyzing ${errors.length} errors with AI...`);

    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured - AI analysis requires API key');
    }

    try {
      // Build error context for AI
      const errorContext = errors.map(e => 
        `${e.file}:${e.line}:${e.column} - [${e.code || 'TS'}] ${e.message}`
      ).join('\n');

      const systemPrompt = `You are a senior TypeScript debugging expert specializing in error analysis and fix suggestions.

ERRORS TO ANALYZE:
${errorContext}

YOUR TASK:
1. Identify the root causes of these errors
2. Suggest specific, actionable fixes
3. Determine complexity level (simple/medium/complex)
4. Assess if these errors can be automatically fixed

RESPONSE FORMAT (JSON):
{
  "rootCauses": ["Cause 1", "Cause 2", ...],
  "suggestedFixes": ["Fix 1", "Fix 2", ...],
  "complexity": "simple|medium|complex",
  "canAutoFix": true|false
}

GUIDELINES:
- Be specific and actionable in your suggestions
- Consider common TypeScript patterns and best practices
- Identify if errors are related (common root cause)
- Simple errors: Missing imports, typos, simple type mismatches
- Medium errors: Interface mismatches, incorrect generics
- Complex errors: Deep type system issues, architectural problems
- Only mark canAutoFix=true if fixes are straightforward and safe`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        model: 'llama-3.1-8b-instant', // Fast model for analysis
        temperature: 0.2, // Low temperature for consistent analysis
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI analysis');
      }

      const analysis: ErrorAnalysis = JSON.parse(response);
      
      console.log(`[Validator] AI analysis complete: ${analysis.rootCauses.length} root causes identified`);
      console.log(`[Validator] Complexity: ${analysis.complexity}, Can auto-fix: ${analysis.canAutoFix}`);

      return analysis;
    } catch (error: any) {
      console.error('[Validator] AI error analysis failed:', error.message);
      
      // Fallback analysis if AI fails
      return {
        rootCauses: ['AI analysis unavailable - manual review required'],
        suggestedFixes: ['Review errors manually and apply fixes'],
        complexity: 'complex',
        canAutoFix: false
      };
    }
  }

  // ==================== AUTO-FIX GENERATION ====================

  /**
   * Generate code fixes using AI based on error analysis
   * @param analysis - Error analysis with root causes and suggestions
   * @param errors - Original errors to fix
   * @returns Array of code fixes with exact change instructions
   */
  async generateFixes(analysis: ErrorAnalysis, errors: DiagnosticError[]): Promise<CodeFix[]> {
    console.log('[Validator] Generating code fixes with AI...');

    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured - fix generation requires API key');
    }

    if (!analysis.canAutoFix) {
      console.log('[Validator] Errors marked as not auto-fixable');
      return [];
    }

    try {
      const fixes: CodeFix[] = [];

      // Group errors by file for efficient fixing
      const errorsByFile = new Map<string, DiagnosticError[]>();
      for (const error of errors) {
        if (!errorsByFile.has(error.file)) {
          errorsByFile.set(error.file, []);
        }
        errorsByFile.get(error.file)!.push(error);
      }

      // Generate fixes for each file
      for (const [file, fileErrors] of errorsByFile.entries()) {
        try {
          // Read file content
          const fileContent = await autonomousAgent.readFile(file);

          // Build context for AI
          const errorContext = fileErrors.map(e =>
            `Line ${e.line}, Column ${e.column}: ${e.message} [${e.code}]`
          ).join('\n');

          const systemPrompt = `You are an expert TypeScript code fixer. Generate exact code changes to fix errors.

FILE: ${file}
ERRORS:
${errorContext}

ROOT CAUSES:
${analysis.rootCauses.join('\n')}

SUGGESTED FIXES:
${analysis.suggestedFixes.join('\n')}

FILE CONTENT:
\`\`\`typescript
${fileContent}
\`\`\`

YOUR TASK:
Generate exact code changes as JSON array with this format:
{
  "fixes": [
    {
      "oldString": "exact code to replace (multi-line OK)",
      "newString": "exact replacement code",
      "explanation": "what this fix does",
      "confidence": 0.9
    }
  ]
}

GUIDELINES:
- Provide EXACT strings to replace (including whitespace)
- Ensure newString is syntactically correct TypeScript
- Each fix should be self-contained
- Confidence: 0.0-1.0 (use 0.9+ for safe fixes, 0.5-0.8 for uncertain)
- Include enough context in oldString to make it unique in the file`;

          const completion = await this.groq.chat.completions.create({
            messages: [
              { role: 'system', content: systemPrompt }
            ],
            model: 'llama-3.1-70b-versatile', // Larger model for code generation
            temperature: 0.1, // Very low temperature for precise code
            max_tokens: 2000,
            response_format: { type: 'json_object' }
          });

          const response = completion.choices[0]?.message?.content;
          if (!response) {
            console.warn(`[Validator] No fix generated for ${file}`);
            continue;
          }

          const result = JSON.parse(response);
          const fileFixes = result.fixes || [];

          // Add file path to each fix
          for (const fix of fileFixes) {
            fixes.push({
              filePath: file,
              oldString: fix.oldString,
              newString: fix.newString,
              explanation: fix.explanation,
              confidence: fix.confidence || 0.5
            });
          }

          console.log(`[Validator] Generated ${fileFixes.length} fixes for ${file}`);
        } catch (error: any) {
          console.error(`[Validator] Fix generation failed for ${file}:`, error.message);
        }
      }

      console.log(`[Validator] Generated ${fixes.length} total fixes`);
      return fixes;
    } catch (error: any) {
      console.error('[Validator] Fix generation failed:', error.message);
      return [];
    }
  }

  // ==================== APPLY FIXES ====================

  /**
   * Apply code fixes to files
   * @param fixes - Array of code fixes to apply
   * @returns Fix result with success/failure counts
   */
  async applyFixes(fixes: CodeFix[]): Promise<FixResult> {
    console.log(`[Validator] Applying ${fixes.length} fixes...`);

    const result: FixResult = {
      appliedFixes: 0,
      failedFixes: 0,
      errors: [],
      filesModified: []
    };

    // Group fixes by file
    const fixesByFile = new Map<string, CodeFix[]>();
    for (const fix of fixes) {
      if (!fixesByFile.has(fix.filePath)) {
        fixesByFile.set(fix.filePath, []);
      }
      fixesByFile.get(fix.filePath)!.push(fix);
    }

    // Save snapshot before applying fixes
    const snapshotId = await this.saveSnapshot(Array.from(fixesByFile.keys()));
    console.log(`[Validator] Snapshot saved: ${snapshotId}`);

    try {
      // Apply fixes file by file
      for (const [file, fileFixes] of fixesByFile.entries()) {
        console.log(`[Validator] Applying ${fileFixes.length} fixes to ${file}`);

        // Sort by confidence (apply highest confidence first)
        fileFixes.sort((a, b) => b.confidence - a.confidence);

        for (const fix of fileFixes) {
          try {
            // Skip low-confidence fixes
            if (fix.confidence < 0.6) {
              console.log(`[Validator] Skipping low-confidence fix (${fix.confidence}): ${fix.explanation}`);
              continue;
            }

            await autonomousAgent.editFile(
              fix.filePath,
              fix.oldString,
              fix.newString
            );

            result.appliedFixes++;
            
            if (!result.filesModified.includes(fix.filePath)) {
              result.filesModified.push(fix.filePath);
            }

            console.log(`[Validator] ✓ Applied fix: ${fix.explanation}`);
          } catch (error: any) {
            result.failedFixes++;
            result.errors.push(`${fix.filePath}: ${error.message}`);
            console.error(`[Validator] ✗ Fix failed: ${error.message}`);
          }
        }
      }

      // Re-validate after applying fixes
      console.log('[Validator] Re-validating after fixes...');
      const postFixReport = await this.checkLSPDiagnostics(result.filesModified);

      // If new errors introduced, rollback
      if (postFixReport.totalErrors > 0) {
        console.warn(`[Validator] Fixes introduced ${postFixReport.totalErrors} new errors - rolling back`);
        await this.rollback(snapshotId);
        
        result.errors.push('Fixes introduced new errors - changes rolled back');
        result.appliedFixes = 0;
        result.filesModified = [];
      } else {
        console.log('[Validator] ✓ All fixes applied successfully, no new errors');
      }

      return result;
    } catch (error: any) {
      console.error('[Validator] Fix application failed:', error.message);
      
      // Rollback on failure
      await this.rollback(snapshotId);
      
      result.errors.push(`Fix application failed: ${error.message}`);
      return result;
    }
  }

  // ==================== ROLLBACK CAPABILITY ====================

  /**
   * Save snapshot of file contents before making changes
   * @param files - Array of file paths to snapshot
   * @returns Snapshot ID for rollback
   */
  async saveSnapshot(files: string[]): Promise<string> {
    const snapshotId = `snapshot-${Date.now()}`;
    const fileContents = new Map<string, string>();

    console.log(`[Validator] Saving snapshot of ${files.length} files...`);

    try {
      for (const file of files) {
        try {
          const content = await autonomousAgent.readFile(file);
          fileContents.set(file, content);
        } catch (error: any) {
          console.warn(`[Validator] Could not snapshot ${file}: ${error.message}`);
        }
      }

      this.snapshots.set(snapshotId, fileContents);

      // Maintain max snapshots limit
      if (this.snapshots.size > this.MAX_SNAPSHOTS) {
        const oldestKey = Array.from(this.snapshots.keys())[0];
        this.snapshots.delete(oldestKey);
        console.log(`[Validator] Removed oldest snapshot: ${oldestKey}`);
      }

      console.log(`[Validator] Snapshot ${snapshotId} saved (${fileContents.size} files)`);
      return snapshotId;
    } catch (error: any) {
      console.error('[Validator] Snapshot save failed:', error.message);
      throw new Error(`Failed to save snapshot: ${error.message}`);
    }
  }

  /**
   * Rollback files to a previous snapshot
   * @param snapshotId - Snapshot ID to restore
   */
  async rollback(snapshotId: string): Promise<void> {
    console.log(`[Validator] Rolling back to snapshot: ${snapshotId}`);

    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    try {
      for (const [file, content] of snapshot.entries()) {
        await autonomousAgent.writeFile(file, content);
        console.log(`[Validator] ✓ Restored ${file}`);
      }

      console.log(`[Validator] Rollback complete: ${snapshot.size} files restored`);
    } catch (error: any) {
      console.error('[Validator] Rollback failed:', error.message);
      throw new Error(`Rollback failed: ${error.message}`);
    }
  }

  /**
   * Get list of available snapshots
   * @returns Array of snapshot IDs
   */
  getSnapshots(): string[] {
    return Array.from(this.snapshots.keys());
  }

  // ==================== SUCCESS METRICS ====================

  /**
   * Calculate success metrics by comparing before/after LSP reports
   * @param before - LSP report before fixes
   * @param after - LSP report after fixes
   * @returns Success metrics with improvement statistics
   */
  calculateSuccessMetrics(before: LSPReport, after: LSPReport): Metrics {
    const errorsFixed = before.totalErrors - after.totalErrors;
    const warningsReduced = before.totalWarnings - after.totalWarnings;

    // Calculate quality score (0-100)
    // Formula: 100 - (errors * 10 + warnings * 2)
    // Capped at 0 minimum
    const qualityScore = Math.max(0, 100 - (after.totalErrors * 10 + after.totalWarnings * 2));

    // Calculate improvement percentage
    const totalIssuesBefore = before.totalErrors + before.totalWarnings;
    const totalIssuesAfter = after.totalErrors + after.totalWarnings;
    
    const improvementPercent = totalIssuesBefore > 0
      ? Math.round(((totalIssuesBefore - totalIssuesAfter) / totalIssuesBefore) * 100)
      : 0;

    const metrics: Metrics = {
      errorsFixed,
      warningsReduced,
      qualityScore,
      improvementPercent
    };

    console.log('[Validator] Success Metrics:');
    console.log(`  - Errors fixed: ${errorsFixed}`);
    console.log(`  - Warnings reduced: ${warningsReduced}`);
    console.log(`  - Quality score: ${qualityScore}/100`);
    console.log(`  - Improvement: ${improvementPercent}%`);

    return metrics;
  }

  // ==================== FULL VALIDATION & HEALING WORKFLOW ====================

  /**
   * Execute full validation and self-healing workflow
   * @param filePaths - Optional specific files to validate
   * @returns Complete validation result with metrics
   */
  async validateAndHeal(filePaths?: string[]): Promise<{
    beforeReport: LSPReport;
    afterReport: LSPReport;
    fixes: CodeFix[];
    fixResult: FixResult;
    metrics: Metrics;
    testResults?: TestResults;
  }> {
    console.log('[Validator] Starting full validation and self-healing workflow...');

    // Step 1: Check LSP diagnostics
    const beforeReport = await this.checkLSPDiagnostics(filePaths);

    if (beforeReport.totalErrors === 0) {
      console.log('[Validator] ✓ No errors found - validation complete');
      
      return {
        beforeReport,
        afterReport: beforeReport,
        fixes: [],
        fixResult: {
          appliedFixes: 0,
          failedFixes: 0,
          errors: [],
          filesModified: []
        },
        metrics: this.calculateSuccessMetrics(beforeReport, beforeReport)
      };
    }

    // Step 2: Collect all errors
    const allErrors: DiagnosticError[] = [];
    for (const fileErrors of beforeReport.files.values()) {
      allErrors.push(...fileErrors);
    }

    // Step 3: Analyze errors with AI
    const analysis = await this.analyzeErrors(allErrors);

    // Step 4: Generate fixes
    const fixes = await this.generateFixes(analysis, allErrors);

    // Step 5: Apply fixes
    const fixResult = await this.applyFixes(fixes);

    // Step 6: Re-validate
    const afterReport = await this.checkLSPDiagnostics(filePaths);

    // Step 7: Calculate metrics
    const metrics = this.calculateSuccessMetrics(beforeReport, afterReport);

    console.log('[Validator] ✓ Validation and self-healing workflow complete');

    return {
      beforeReport,
      afterReport,
      fixes,
      fixResult,
      metrics
    };
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Extract file path from stack trace line
 * @param stackLine - Single line from stack trace
 * @returns File path or empty string
 */
function extractFileFromStack(stackLine: string): string {
  const match = stackLine.match(/\((.+?):\d+:\d+\)/);
  return match ? match[1] : '';
}

// ==================== SINGLETON EXPORT ====================

/**
 * Singleton instance of Validator
 */
export const validator = new Validator();
