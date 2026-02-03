/**
 * HallucinationDetector - AI-Generated Content Validation Service
 * 
 * Detects common AI hallucinations before deployment to prevent production disasters.
 * Inspired by "slopsquatting" packages, fabricated APIs, and fake test data.
 * 
 * Core Detection Methods:
 * - Validate npm/pip packages actually exist
 * - Verify API endpoints are real
 * - Detect fabricated data patterns (lorem ipsum, fake emails)
 * - Check for impossible values (negative counts, future dates in history)
 * - Flag suspiciously perfect test results
 * - Detect hallucinated function/method names
 * - Identify made-up configuration options
 * 
 * Severity Levels:
 * - CRITICAL: Will break production (missing packages, wrong APIs)
 * - HIGH: Likely to cause issues (fake data in migrations, wrong configs)
 * - MEDIUM: May cause confusion (placeholder text, test emails)
 * - LOW: Minor issues (poor naming, mock data)
 * 
 * Integration:
 * - Call detectHallucinations() on AI-generated code before deployment
 * - Use validatePackages() before npm install
 * - Run validateApiEndpoints() before API integration
 * - Check validateTestData() before database seeding
 */

import { z } from 'zod';
import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export const HallucinationDetectionSchema = z.object({
  hasHallucinations: z.boolean(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE']),
  issues: z.array(z.object({
    type: z.enum([
      'FAKE_PACKAGE',
      'INVALID_API',
      'FABRICATED_DATA',
      'IMPOSSIBLE_VALUE',
      'PERFECT_TEST',
      'HALLUCINATED_FUNCTION',
      'INVALID_CONFIG',
      'PLACEHOLDER_TEXT',
    ]),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    message: z.string(),
    location: z.string().optional(),
    suggestion: z.string().optional(),
  })),
  confidence: z.number().min(0).max(1),
  safeToDeply: z.boolean(),
  recommendation: z.string(),
});

export type HallucinationDetection = z.infer<typeof HallucinationDetectionSchema>;

export interface PackageValidationResult {
  package: string;
  exists: boolean;
  platform: 'npm' | 'pypi';
  latestVersion?: string;
  downloads?: number;
  error?: string;
}

export interface ApiValidationResult {
  endpoint: string;
  valid: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

export interface DataValidationResult {
  field: string;
  value: any;
  valid: boolean;
  issue?: string;
  suggestion?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const FAKE_EMAIL_PATTERNS = [
  /fake@example\.com/i,
  /test@test\.com/i,
  /user@domain\.com/i,
  /admin@localhost/i,
  /john\.doe@email\.com/i,
  /jane\.smith@mail\.com/i,
];

const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /dolor sit amet/i,
  /consectetur adipiscing/i,
  /TODO:?\s/i,
  /FIXME:?\s/i,
  /XXX/i,
  /placeholder/i,
  /\[INSERT .* HERE\]/i,
];

const IMPOSSIBLE_VALUE_CHECKS = {
  negativeCount: (val: number) => val < 0,
  futureHistoricalDate: (date: Date) => date > new Date(),
  invalidPercentage: (val: number) => val < 0 || val > 100,
  invalidAge: (age: number) => age < 0 || age > 150,
};

const SEQUENTIAL_ID_PATTERN = /^(1|2|3|4|5|6|7|8|9|10)$/;

const HALLUCINATED_FUNCTION_KEYWORDS = [
  'magicFunction',
  'autoFix',
  'smartHandler',
  'intelligentProcessor',
  'autoOptimize',
];

const COMMON_CONFIG_TYPOS = {
  'maxSize': 'maxsize',
  'fileName': 'filename',
  'timeOut': 'timeout',
  'dataBase': 'database',
};

// Package name patterns that are likely hallucinated
const SUSPICIOUS_PACKAGE_PATTERNS = [
  /^(super|ultra|mega|hyper|auto|smart)-/i,
  /-(helper|utils|toolkit|magic|ai|auto)$/i,
  /-v?\d+$/i, // Packages ending in version numbers
];

const NPM_REGISTRY_URL = 'https://registry.npmjs.org';
const PYPI_REGISTRY_URL = 'https://pypi.org/pypi';

// ============================================================================
// HALLUCINATION DETECTOR SERVICE
// ============================================================================

export class HallucinationDetector {
  /**
   * Detect hallucinations in AI-generated code
   * 
   * @param code - Code to analyze
   * @param context - Optional context (file type, purpose)
   * @returns Detection result with issues
   * 
   * @example
   * const result = HallucinationDetector.detectHallucinations(code, {
   *   fileType: 'typescript',
   *   purpose: 'api-integration',
   * });
   * if (!result.safeToDeply) {
   *   console.error('Hallucinations detected:', result.issues);
   * }
   */
  static detectHallucinations(
    code: string,
    context?: { fileType?: string; purpose?: string }
  ): HallucinationDetection {
    console.log(`[HallucinationDetector] 🔍 Analyzing code (${code.length} chars)...`);

    const issues: HallucinationDetection['issues'] = [];

    // Detect placeholder text
    const placeholderIssues = this.detectPlaceholderText(code);
    issues.push(...placeholderIssues);

    // Detect fake emails
    const emailIssues = this.detectFakeEmails(code);
    issues.push(...emailIssues);

    // Detect hallucinated functions
    const functionIssues = this.detectHallucinatedFunctions(code);
    issues.push(...functionIssues);

    // Detect invalid config
    const configIssues = this.detectInvalidConfig(code);
    issues.push(...configIssues);

    // Detect sequential IDs
    const idIssues = this.detectSequentialIds(code);
    issues.push(...idIssues);

    // Calculate severity
    const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
    const highCount = issues.filter(i => i.severity === 'HIGH').length;
    const mediumCount = issues.filter(i => i.severity === 'MEDIUM').length;

    let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';
    if (criticalCount > 0) severity = 'CRITICAL';
    else if (highCount > 0) severity = 'HIGH';
    else if (mediumCount > 0) severity = 'MEDIUM';
    else if (issues.length > 0) severity = 'LOW';

    const hasHallucinations = issues.length > 0;
    const confidence = this.calculateConfidence(issues);
    const safeToDeply = severity === 'NONE' || severity === 'LOW';
    const recommendation = this.generateRecommendation(severity, issues);

    const result: HallucinationDetection = {
      hasHallucinations,
      severity,
      issues,
      confidence,
      safeToDeply,
      recommendation,
    };

    console.log(
      `[HallucinationDetector] ${safeToDeply ? '✅' : '❌'} Severity: ${severity} | ` +
      `Issues: ${issues.length} | Confidence: ${confidence.toFixed(2)}`
    );

    return result;
  }

  /**
   * Validate npm packages actually exist
   * 
   * @param packages - Package names to validate
   * @returns Validation results
   * 
   * @example
   * const results = await HallucinationDetector.validateNpmPackages([
   *   'react',
   *   'super-magic-ai-helper', // Likely hallucinated
   * ]);
   */
  static async validateNpmPackages(
    packages: string[]
  ): Promise<PackageValidationResult[]> {
    console.log(`[HallucinationDetector] 📦 Validating ${packages.length} npm packages...`);

    const results: PackageValidationResult[] = [];

    for (const pkg of packages) {
      try {
        // Check if package name is suspicious
        const isSuspicious = SUSPICIOUS_PACKAGE_PATTERNS.some(pattern =>
          pattern.test(pkg)
        );

        if (isSuspicious) {
          console.warn(`[HallucinationDetector] ⚠️  Suspicious package name: ${pkg}`);
        }

        // Query npm registry
        const response = await axios.get(`${NPM_REGISTRY_URL}/${pkg}`, {
          timeout: 5000,
          validateStatus: (status) => status < 500,
        });

        if (response.status === 200) {
          const data = response.data;
          results.push({
            package: pkg,
            exists: true,
            platform: 'npm',
            latestVersion: data['dist-tags']?.latest,
            downloads: data.downloads?.lastMonth,
          });
          console.log(`[HallucinationDetector] ✅ ${pkg} exists (v${data['dist-tags']?.latest})`);
        } else {
          results.push({
            package: pkg,
            exists: false,
            platform: 'npm',
            error: `Package not found (HTTP ${response.status})`,
          });
          console.warn(`[HallucinationDetector] ❌ ${pkg} does NOT exist`);
        }
      } catch (error: any) {
        results.push({
          package: pkg,
          exists: false,
          platform: 'npm',
          error: error.message,
        });
        console.error(`[HallucinationDetector] ❌ Error validating ${pkg}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Validate Python packages (PyPI)
   * 
   * @param packages - Package names to validate
   * @returns Validation results
   */
  static async validatePyPiPackages(
    packages: string[]
  ): Promise<PackageValidationResult[]> {
    console.log(`[HallucinationDetector] 🐍 Validating ${packages.length} PyPI packages...`);

    const results: PackageValidationResult[] = [];

    for (const pkg of packages) {
      try {
        const response = await axios.get(`${PYPI_REGISTRY_URL}/${pkg}/json`, {
          timeout: 5000,
          validateStatus: (status) => status < 500,
        });

        if (response.status === 200) {
          const data = response.data;
          results.push({
            package: pkg,
            exists: true,
            platform: 'pypi',
            latestVersion: data.info?.version,
          });
          console.log(`[HallucinationDetector] ✅ ${pkg} exists (v${data.info?.version})`);
        } else {
          results.push({
            package: pkg,
            exists: false,
            platform: 'pypi',
            error: `Package not found (HTTP ${response.status})`,
          });
          console.warn(`[HallucinationDetector] ❌ ${pkg} does NOT exist`);
        }
      } catch (error: any) {
        results.push({
          package: pkg,
          exists: false,
          platform: 'pypi',
          error: error.message,
        });
        console.error(`[HallucinationDetector] ❌ Error validating ${pkg}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Validate API endpoints are real
   * 
   * @param endpoints - API endpoints to test
   * @returns Validation results
   * 
   * @example
   * const results = await HallucinationDetector.validateApiEndpoints([
   *   'https://api.github.com/users/octocat',
   *   'https://api.fake-service.com/v1/magic', // Likely hallucinated
   * ]);
   */
  static async validateApiEndpoints(
    endpoints: string[]
  ): Promise<ApiValidationResult[]> {
    console.log(`[HallucinationDetector] 🌐 Validating ${endpoints.length} API endpoints...`);

    const results: ApiValidationResult[] = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        const response = await axios.get(endpoint, {
          timeout: 10000,
          validateStatus: (status) => status < 500,
        });

        const responseTime = Date.now() - startTime;
        const valid = response.status >= 200 && response.status < 400;

        results.push({
          endpoint,
          valid,
          statusCode: response.status,
          responseTime,
        });

        console.log(
          `[HallucinationDetector] ${valid ? '✅' : '⚠️'} ${endpoint} → ${response.status} (${responseTime}ms)`
        );
      } catch (error: any) {
        results.push({
          endpoint,
          valid: false,
          error: error.message,
        });
        console.error(`[HallucinationDetector] ❌ ${endpoint} failed: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Validate test data for fabricated patterns
   * 
   * @param data - Test data to validate
   * @returns Validation results
   */
  static validateTestData(data: Record<string, any>): DataValidationResult[] {
    console.log(`[HallucinationDetector] 🧪 Validating test data...`);

    const results: DataValidationResult[] = [];

    for (const [field, value] of Object.entries(data)) {
      // Check for fake emails
      if (typeof value === 'string' && value.includes('@')) {
        const isFake = FAKE_EMAIL_PATTERNS.some(pattern => pattern.test(value));
        if (isFake) {
          results.push({
            field,
            value,
            valid: false,
            issue: 'Fake email address detected',
            suggestion: 'Use realistic test emails (e.g., user1@example.org)',
          });
        }
      }

      // Check for lorem ipsum
      if (typeof value === 'string') {
        const hasPlaceholder = PLACEHOLDER_PATTERNS.some(pattern => pattern.test(value));
        if (hasPlaceholder) {
          results.push({
            field,
            value,
            valid: false,
            issue: 'Placeholder text detected',
            suggestion: 'Replace with realistic content',
          });
        }
      }

      // Check for sequential IDs
      if (field.toLowerCase().includes('id') && typeof value === 'number') {
        if (value >= 1 && value <= 10) {
          results.push({
            field,
            value,
            valid: false,
            issue: 'Sequential ID detected (1-10)',
            suggestion: 'Use realistic UUID or random IDs',
          });
        }
      }

      // Check for impossible dates
      if (field.toLowerCase().includes('date') && value instanceof Date) {
        if (value > new Date()) {
          results.push({
            field,
            value,
            valid: false,
            issue: 'Future date in historical field',
            suggestion: 'Use past dates for historical data',
          });
        }
      }

      // Check for impossible values
      if (typeof value === 'number') {
        if (field.toLowerCase().includes('count') && value < 0) {
          results.push({
            field,
            value,
            valid: false,
            issue: 'Negative count value',
            suggestion: 'Use non-negative values for counts',
          });
        }

        if (field.toLowerCase().includes('age') && (value < 0 || value > 150)) {
          results.push({
            field,
            value,
            valid: false,
            issue: 'Invalid age value',
            suggestion: 'Use realistic age values (0-150)',
          });
        }

        if (field.toLowerCase().includes('percent') && (value < 0 || value > 100)) {
          results.push({
            field,
            value,
            valid: false,
            issue: 'Invalid percentage value',
            suggestion: 'Use values between 0-100',
          });
        }
      }
    }

    console.log(`[HallucinationDetector] Found ${results.length} data issues`);
    return results;
  }

  /**
   * Check for suspiciously perfect test results (100% pass rate)
   * 
   * @param testResults - Test results to analyze
   * @returns True if suspicious
   */
  static detectPerfectTestResults(testResults: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  }): boolean {
    const { total, passed, failed, skipped } = testResults;

    // Perfect results on first try with many tests is suspicious
    if (total >= 10 && passed === total && failed === 0 && skipped === 0) {
      console.warn(
        `[HallucinationDetector] ⚠️  Suspiciously perfect test results: ${passed}/${total} passed`
      );
      return true;
    }

    return false;
  }

  /**
   * Detect hallucinated npm package imports in code
   * 
   * @param code - Code to analyze
   * @returns List of detected packages
   */
  static extractPackageImports(code: string): string[] {
    const imports: string[] = [];

    // Match: import ... from 'package'
    const importPattern = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
    const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    const importMatches = code.matchAll(importPattern);
    const requireMatches = code.matchAll(requirePattern);

    for (const match of importMatches) {
      const pkg = match[1];
      if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
        imports.push(pkg.split('/')[0]); // Get base package name
      }
    }

    for (const match of requireMatches) {
      const pkg = match[1];
      if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
        imports.push(pkg.split('/')[0]);
      }
    }

    return [...new Set(imports)]; // Remove duplicates
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static detectPlaceholderText(code: string): HallucinationDetection['issues'] {
    const issues: HallucinationDetection['issues'] = [];

    for (const pattern of PLACEHOLDER_PATTERNS) {
      if (pattern.test(code)) {
        issues.push({
          type: 'PLACEHOLDER_TEXT',
          severity: 'MEDIUM',
          message: `Placeholder text detected: ${pattern.source}`,
          suggestion: 'Replace with actual content before deployment',
        });
      }
    }

    return issues;
  }

  private static detectFakeEmails(code: string): HallucinationDetection['issues'] {
    const issues: HallucinationDetection['issues'] = [];

    for (const pattern of FAKE_EMAIL_PATTERNS) {
      if (pattern.test(code)) {
        issues.push({
          type: 'FABRICATED_DATA',
          severity: 'HIGH',
          message: `Fake email address detected: ${pattern.source}`,
          suggestion: 'Use realistic test emails or environment variables',
        });
      }
    }

    return issues;
  }

  private static detectHallucinatedFunctions(code: string): HallucinationDetection['issues'] {
    const issues: HallucinationDetection['issues'] = [];

    for (const keyword of HALLUCINATED_FUNCTION_KEYWORDS) {
      if (code.includes(keyword)) {
        issues.push({
          type: 'HALLUCINATED_FUNCTION',
          severity: 'CRITICAL',
          message: `Likely hallucinated function: ${keyword}`,
          suggestion: 'Verify this function exists in documentation',
        });
      }
    }

    return issues;
  }

  private static detectInvalidConfig(code: string): HallucinationDetection['issues'] {
    const issues: HallucinationDetection['issues'] = [];

    for (const [correct, typo] of Object.entries(COMMON_CONFIG_TYPOS)) {
      if (code.includes(typo) && !code.includes(correct)) {
        issues.push({
          type: 'INVALID_CONFIG',
          severity: 'HIGH',
          message: `Possible config typo: "${typo}" (should be "${correct}")`,
          suggestion: `Use "${correct}" instead of "${typo}"`,
        });
      }
    }

    return issues;
  }

  private static detectSequentialIds(code: string): HallucinationDetection['issues'] {
    const issues: HallucinationDetection['issues'] = [];

    // Look for id: 1, id: 2, etc.
    const idPattern = /id:\s*(\d+)/g;
    const matches = [...code.matchAll(idPattern)];

    if (matches.length >= 3) {
      const ids = matches.map(m => parseInt(m[1]));
      const isSequential = ids.every((id, i) => i === 0 || id === ids[i - 1] + 1);

      if (isSequential) {
        issues.push({
          type: 'FABRICATED_DATA',
          severity: 'MEDIUM',
          message: 'Sequential IDs detected (1, 2, 3...) - likely fabricated',
          suggestion: 'Use realistic UUIDs or random IDs',
        });
      }
    }

    return issues;
  }

  private static calculateConfidence(issues: HallucinationDetection['issues']): number {
    if (issues.length === 0) return 1.0;

    const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
    const highCount = issues.filter(i => i.severity === 'HIGH').length;

    let confidence = 1.0;
    confidence -= criticalCount * 0.3;
    confidence -= highCount * 0.2;
    confidence -= (issues.length - criticalCount - highCount) * 0.1;

    return Math.max(0, Math.min(1, confidence));
  }

  private static generateRecommendation(
    severity: string,
    issues: HallucinationDetection['issues']
  ): string {
    if (severity === 'CRITICAL') {
      return 'DO NOT DEPLOY: Critical hallucinations detected. Code likely contains non-existent packages or APIs. Review and fix all issues before deployment.';
    }

    if (severity === 'HIGH') {
      return 'REVIEW REQUIRED: High-severity hallucinations detected. Verify all packages, APIs, and configurations before deployment.';
    }

    if (severity === 'MEDIUM') {
      return 'CAUTION: Medium-severity issues detected. Replace placeholder text and fake data before production use.';
    }

    if (severity === 'LOW') {
      return 'MINOR ISSUES: Some minor issues detected. Consider cleaning up before deployment.';
    }

    return 'SAFE: No hallucinations detected. Code appears valid.';
  }
}
