/**
 * SecurityValidator - Security Best Practices Enforcement Service
 * 
 * Validates AI-generated code against security best practices and OWASP Top 10.
 * Prevents common security vulnerabilities before deployment.
 * 
 * Core Validation Methods:
 * - SQL Injection detection
 * - XSS (Cross-Site Scripting) prevention
 * - CSRF token validation
 * - Hardcoded secret detection
 * - Authentication/authorization checks
 * - Rate limiting enforcement
 * - Input validation requirements
 * - Secure password handling
 * - HTTPS enforcement
 * - Security header validation
 * 
 * Severity Levels:
 * - CRITICAL: Immediate security risk (SQL injection, hardcoded secrets)
 * - HIGH: Major vulnerability (missing auth, XSS)
 * - MEDIUM: Security weakness (weak validation, missing headers)
 * - LOW: Best practice violation (no rate limiting, weak config)
 * 
 * Integration:
 * - Call validateSecurity() on all AI-generated code
 * - Use detectHardcodedSecrets() before committing
 * - Run validateInputValidation() on API endpoints
 * - Check validateAuthentication() on protected routes
 */

import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export const SecurityValidationSchema = z.object({
  secure: z.boolean(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE']),
  vulnerabilities: z.array(z.object({
    type: z.enum([
      'SQL_INJECTION',
      'XSS',
      'CSRF',
      'HARDCODED_SECRET',
      'MISSING_AUTH',
      'MISSING_AUTHORIZATION',
      'WEAK_PASSWORD',
      'NO_RATE_LIMITING',
      'MISSING_INPUT_VALIDATION',
      'HTTP_INSTEAD_OF_HTTPS',
      'MISSING_SECURITY_HEADERS',
      'SENSITIVE_DATA_EXPOSURE',
      'INSECURE_DESERIALIZATION',
      'VULNERABLE_DEPENDENCY',
    ]),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    message: z.string(),
    location: z.string().optional(),
    code: z.string().optional(),
    remediation: z.string(),
    owaspCategory: z.string().optional(),
  })),
  securityScore: z.number().min(0).max(100),
  safeToDeply: z.boolean(),
  recommendation: z.string(),
  owaspCoverage: z.object({
    injection: z.boolean(),
    brokenAuth: z.boolean(),
    sensitiveDataExposure: z.boolean(),
    xxe: z.boolean(),
    brokenAccessControl: z.boolean(),
    securityMisconfig: z.boolean(),
    xss: z.boolean(),
    insecureDeserialization: z.boolean(),
    knownVulnerabilities: z.boolean(),
    insufficientLogging: z.boolean(),
  }),
});

export type SecurityValidation = z.infer<typeof SecurityValidationSchema>;

export interface SecretDetectionResult {
  found: boolean;
  secrets: Array<{
    type: 'API_KEY' | 'PASSWORD' | 'TOKEN' | 'PRIVATE_KEY' | 'DATABASE_URL';
    value: string;
    location: string;
    confidence: number;
  }>;
}

export interface InputValidationResult {
  hasValidation: boolean;
  endpoints: Array<{
    route: string;
    method: string;
    hasValidation: boolean;
    validationType?: 'zod' | 'joi' | 'yup' | 'custom';
    issues: string[];
  }>;
}

export interface AuthenticationCheckResult {
  hasAuthentication: boolean;
  protectedRoutes: Array<{
    route: string;
    hasAuth: boolean;
    hasAuthorization: boolean;
    issues: string[];
  }>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const SQL_INJECTION_PATTERNS = [
  /['"].*\s*(OR|AND)\s+1\s*=\s*1/i,
  /['"].*\s*(OR|AND)\s+['"].*['"]\s*=\s*['"]/i,
  /UNION\s+SELECT/i,
  /;\s*DROP\s+TABLE/i,
  /;\s*DELETE\s+FROM/i,
  /;\s*UPDATE\s+.*\s+SET/i,
  /EXEC\s*\(/i,
  /EXECUTE\s*\(/i,
  /--.*$/m, // SQL comments
  /\/\*.*\*\//s, // Multi-line SQL comments
];

const XSS_PATTERNS = [
  /<script[^>]*>.*<\/script>/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /onclick\s*=/i,
  /eval\s*\(/i,
  /innerHTML\s*=/i,
  /document\.write/i,
  /dangerouslySetInnerHTML/i,
];

const HARDCODED_SECRET_PATTERNS = [
  {
    type: 'API_KEY' as const,
    pattern: /api[_-]?key\s*=\s*['"][a-zA-Z0-9]{20,}['"]/i,
    confidence: 0.9,
  },
  {
    type: 'PASSWORD' as const,
    pattern: /password\s*=\s*['"][^'"]{6,}['"]/i,
    confidence: 0.7,
  },
  {
    type: 'TOKEN' as const,
    pattern: /token\s*=\s*['"][a-zA-Z0-9._-]{30,}['"]/i,
    confidence: 0.85,
  },
  {
    type: 'PRIVATE_KEY' as const,
    pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/i,
    confidence: 1.0,
  },
  {
    type: 'DATABASE_URL' as const,
    pattern: /(postgres|mysql|mongodb):\/\/[^'"]+:([^'"@]+)@/i,
    confidence: 0.95,
  },
  {
    type: 'API_KEY' as const,
    pattern: /AKIA[0-9A-Z]{16}/i, // AWS Access Key
    confidence: 1.0,
  },
  {
    type: 'TOKEN' as const,
    pattern: /ghp_[a-zA-Z0-9]{36}/i, // GitHub Personal Access Token
    confidence: 1.0,
  },
];

const WEAK_PASSWORD_PATTERNS = [
  /password\s*=\s*['"]password['"]/i,
  /password\s*=\s*['"]123456['"]/i,
  /password\s*=\s*['"]admin['"]/i,
  /password\s*=\s*['"]test['"]/i,
];

const MISSING_AUTH_INDICATORS = [
  'app.get',
  'app.post',
  'app.put',
  'app.delete',
  'app.patch',
];

const REQUIRED_SECURITY_HEADERS = [
  'X-Content-Type-Options',
  'X-Frame-Options',
  'X-XSS-Protection',
  'Strict-Transport-Security',
  'Content-Security-Policy',
];

const INSECURE_FUNCTIONS = [
  'eval(',
  'new Function(',
  'setTimeout(',
  'setInterval(',
  'execSync(',
  'exec(',
];

// ============================================================================
// SECURITY VALIDATOR SERVICE
// ============================================================================

export class SecurityValidator {
  /**
   * Comprehensive security validation
   * 
   * @param code - Code to validate
   * @param context - Optional context
   * @returns Security validation result
   * 
   * @example
   * const result = SecurityValidator.validateSecurity(code, {
   *   fileType: 'typescript',
   *   isApiRoute: true,
   * });
   * if (!result.safeToDeply) {
   *   console.error('Security issues:', result.vulnerabilities);
   * }
   */
  static validateSecurity(
    code: string,
    context?: { fileType?: string; isApiRoute?: boolean }
  ): SecurityValidation {
    console.log(`[SecurityValidator] 🔒 Running security validation...`);

    const vulnerabilities: SecurityValidation['vulnerabilities'] = [];

    // Check for SQL Injection
    const sqlInjectionIssues = this.detectSqlInjection(code);
    vulnerabilities.push(...sqlInjectionIssues);

    // Check for XSS
    const xssIssues = this.detectXss(code);
    vulnerabilities.push(...xssIssues);

    // Check for hardcoded secrets
    const secretIssues = this.detectHardcodedSecretsInCode(code);
    vulnerabilities.push(...secretIssues);

    // Check for missing authentication
    if (context?.isApiRoute) {
      const authIssues = this.detectMissingAuth(code);
      vulnerabilities.push(...authIssues);
    }

    // Check for weak passwords
    const passwordIssues = this.detectWeakPasswords(code);
    vulnerabilities.push(...passwordIssues);

    // Check for insecure functions
    const insecureFunctionIssues = this.detectInsecureFunctions(code);
    vulnerabilities.push(...insecureFunctionIssues);

    // Check for HTTP instead of HTTPS
    const httpsIssues = this.detectHttpInsteadOfHttps(code);
    vulnerabilities.push(...httpsIssues);

    // Check for missing input validation
    const validationIssues = this.detectMissingInputValidation(code);
    vulnerabilities.push(...validationIssues);

    // Calculate severity
    const criticalCount = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const mediumCount = vulnerabilities.filter(v => v.severity === 'MEDIUM').length;

    let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE' = 'SAFE';
    if (criticalCount > 0) severity = 'CRITICAL';
    else if (highCount > 0) severity = 'HIGH';
    else if (mediumCount > 0) severity = 'MEDIUM';
    else if (vulnerabilities.length > 0) severity = 'LOW';

    // Calculate security score (100 = perfect, 0 = very insecure)
    const securityScore = this.calculateSecurityScore(vulnerabilities);
    const secure = severity === 'SAFE' || severity === 'LOW';
    const safeToDeply = securityScore >= 70;

    // Check OWASP Top 10 coverage
    const owaspCoverage = this.checkOwaspCoverage(vulnerabilities);

    const recommendation = this.generateRecommendation(severity, vulnerabilities);

    const result: SecurityValidation = {
      secure,
      severity,
      vulnerabilities,
      securityScore,
      safeToDeply,
      recommendation,
      owaspCoverage,
    };

    console.log(
      `[SecurityValidator] ${safeToDeply ? '✅' : '❌'} Score: ${securityScore}/100 | ` +
      `Severity: ${severity} | Issues: ${vulnerabilities.length}`
    );

    return result;
  }

  /**
   * Detect SQL injection vulnerabilities
   */
  static detectSqlInjection(code: string): SecurityValidation['vulnerabilities'] {
    const issues: SecurityValidation['vulnerabilities'] = [];

    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(code)) {
        issues.push({
          type: 'SQL_INJECTION',
          severity: 'CRITICAL',
          message: 'Potential SQL injection vulnerability detected',
          code: pattern.source,
          remediation: 'Use parameterized queries or prepared statements. Never concatenate user input into SQL queries.',
          owaspCategory: 'A03:2021 - Injection',
        });
      }
    }

    // Check for string concatenation in SQL
    if (code.includes('SELECT') || code.includes('INSERT') || code.includes('UPDATE')) {
      if (code.includes('+') || code.includes('`${')) {
        issues.push({
          type: 'SQL_INJECTION',
          severity: 'HIGH',
          message: 'SQL query uses string concatenation - potential injection risk',
          remediation: 'Use parameterized queries with $1, $2, etc. placeholders',
          owaspCategory: 'A03:2021 - Injection',
        });
      }
    }

    return issues;
  }

  /**
   * Detect XSS vulnerabilities
   */
  static detectXss(code: string): SecurityValidation['vulnerabilities'] {
    const issues: SecurityValidation['vulnerabilities'] = [];

    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(code)) {
        issues.push({
          type: 'XSS',
          severity: 'HIGH',
          message: 'Potential XSS vulnerability detected',
          code: pattern.source,
          remediation: 'Sanitize user input, use React/Vue automatic escaping, avoid dangerouslySetInnerHTML',
          owaspCategory: 'A03:2021 - Injection',
        });
      }
    }

    return issues;
  }

  /**
   * Detect hardcoded secrets in code
   */
  static detectHardcodedSecrets(code: string): SecretDetectionResult {
    console.log(`[SecurityValidator] 🔍 Scanning for hardcoded secrets...`);

    const secrets: SecretDetectionResult['secrets'] = [];

    for (const { type, pattern, confidence } of HARDCODED_SECRET_PATTERNS) {
      const matches = code.matchAll(new RegExp(pattern, 'gi'));
      for (const match of matches) {
        secrets.push({
          type,
          value: match[0].substring(0, 20) + '...', // Truncate for safety
          location: `Line ${this.getLineNumber(code, match.index || 0)}`,
          confidence,
        });
      }
    }

    console.log(`[SecurityValidator] Found ${secrets.length} potential secrets`);

    return {
      found: secrets.length > 0,
      secrets,
    };
  }

  /**
   * Detect hardcoded secrets and return as vulnerabilities
   */
  private static detectHardcodedSecretsInCode(code: string): SecurityValidation['vulnerabilities'] {
    const result = this.detectHardcodedSecrets(code);
    const issues: SecurityValidation['vulnerabilities'] = [];

    for (const secret of result.secrets) {
      issues.push({
        type: 'HARDCODED_SECRET',
        severity: 'CRITICAL',
        message: `Hardcoded ${secret.type} detected`,
        location: secret.location,
        remediation: 'Move secrets to environment variables (.env file) and use process.env',
        owaspCategory: 'A02:2021 - Cryptographic Failures',
      });
    }

    return issues;
  }

  /**
   * Validate input validation is present
   */
  static validateInputValidation(code: string): InputValidationResult {
    console.log(`[SecurityValidator] 🛡️  Checking input validation...`);

    const endpoints: InputValidationResult['endpoints'] = [];

    // Look for route definitions
    const routePatterns = [
      /app\.(get|post|put|delete|patch)\s*\(['"]([^'"]+)['"]/gi,
      /router\.(get|post|put|delete|patch)\s*\(['"]([^'"]+)['"]/gi,
    ];

    for (const pattern of routePatterns) {
      const matches = code.matchAll(pattern);
      for (const match of matches) {
        const method = match[1].toUpperCase();
        const route = match[2];

        // Check if route has validation
        const hasZod = code.includes('z.object') || code.includes('.parse(') || code.includes('.safeParse(');
        const hasJoi = code.includes('Joi.object') || code.includes('.validate(');
        const hasYup = code.includes('yup.object') || code.includes('.validate(');
        
        const hasValidation = hasZod || hasJoi || hasYup;
        const validationType = hasZod ? 'zod' as const : hasJoi ? 'joi' as const : hasYup ? 'yup' as const : undefined;

        const issues: string[] = [];
        if (!hasValidation && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
          issues.push('No input validation schema detected');
        }

        endpoints.push({
          route,
          method,
          hasValidation,
          validationType,
          issues,
        });
      }
    }

    const hasValidation = endpoints.every(e => e.hasValidation || e.method === 'GET');

    console.log(`[SecurityValidator] Checked ${endpoints.length} endpoints`);

    return {
      hasValidation,
      endpoints,
    };
  }

  /**
   * Detect missing authentication
   */
  private static detectMissingAuth(code: string): SecurityValidation['vulnerabilities'] {
    const issues: SecurityValidation['vulnerabilities'] = [];

    // Check for protected routes without auth middleware
    const hasRoutes = MISSING_AUTH_INDICATORS.some(indicator => code.includes(indicator));
    const hasAuth = code.includes('authenticate') || 
                    code.includes('isAuthenticated') || 
                    code.includes('requireAuth') ||
                    code.includes('verifyToken') ||
                    code.includes('passport.authenticate');

    if (hasRoutes && !hasAuth) {
      issues.push({
        type: 'MISSING_AUTH',
        severity: 'HIGH',
        message: 'API routes defined without authentication middleware',
        remediation: 'Add authentication middleware to protect routes',
        owaspCategory: 'A07:2021 - Identification and Authentication Failures',
      });
    }

    return issues;
  }

  /**
   * Check authentication on routes
   */
  static checkAuthentication(code: string): AuthenticationCheckResult {
    console.log(`[SecurityValidator] 🔐 Checking authentication...`);

    const protectedRoutes: AuthenticationCheckResult['protectedRoutes'] = [];

    // Look for route definitions
    const routePattern = /app\.(get|post|put|delete|patch)\s*\(['"]([^'"]+)['"]/gi;
    const matches = code.matchAll(routePattern);

    for (const match of matches) {
      const route = match[2];
      
      // Check if route has auth middleware
      const hasAuth = code.includes('authenticate') || code.includes('isAuthenticated');
      const hasAuthorization = code.includes('authorize') || code.includes('checkPermission');

      const issues: string[] = [];
      if (!hasAuth && !route.startsWith('/public')) {
        issues.push('No authentication middleware detected');
      }
      if (!hasAuthorization && route.includes('/admin')) {
        issues.push('Admin route without authorization check');
      }

      protectedRoutes.push({
        route,
        hasAuth,
        hasAuthorization,
        issues,
      });
    }

    const hasAuthentication = protectedRoutes.every(r => r.hasAuth || r.route.startsWith('/public'));

    console.log(`[SecurityValidator] Checked ${protectedRoutes.length} routes`);

    return {
      hasAuthentication,
      protectedRoutes,
    };
  }

  /**
   * Detect weak passwords
   */
  private static detectWeakPasswords(code: string): SecurityValidation['vulnerabilities'] {
    const issues: SecurityValidation['vulnerabilities'] = [];

    for (const pattern of WEAK_PASSWORD_PATTERNS) {
      if (pattern.test(code)) {
        issues.push({
          type: 'WEAK_PASSWORD',
          severity: 'CRITICAL',
          message: 'Weak or default password detected',
          remediation: 'Use environment variables for passwords, enforce strong password policies',
          owaspCategory: 'A07:2021 - Identification and Authentication Failures',
        });
      }
    }

    // Check for missing password hashing
    if (code.includes('password') && !code.includes('bcrypt') && !code.includes('hash')) {
      issues.push({
        type: 'WEAK_PASSWORD',
        severity: 'CRITICAL',
        message: 'Password stored without hashing',
        remediation: 'Hash passwords using bcrypt or similar before storage',
        owaspCategory: 'A02:2021 - Cryptographic Failures',
      });
    }

    return issues;
  }

  /**
   * Detect insecure functions
   */
  private static detectInsecureFunctions(code: string): SecurityValidation['vulnerabilities'] {
    const issues: SecurityValidation['vulnerabilities'] = [];

    for (const func of INSECURE_FUNCTIONS) {
      if (code.includes(func)) {
        issues.push({
          type: 'INSECURE_DESERIALIZATION',
          severity: 'HIGH',
          message: `Insecure function detected: ${func}`,
          code: func,
          remediation: 'Avoid using eval, exec, and similar functions with user input',
          owaspCategory: 'A08:2021 - Software and Data Integrity Failures',
        });
      }
    }

    return issues;
  }

  /**
   * Detect HTTP instead of HTTPS
   */
  private static detectHttpInsteadOfHttps(code: string): SecurityValidation['vulnerabilities'] {
    const issues: SecurityValidation['vulnerabilities'] = [];

    const httpPattern = /['"]http:\/\/(?!localhost|127\.0\.0\.1)/gi;
    if (httpPattern.test(code)) {
      issues.push({
        type: 'HTTP_INSTEAD_OF_HTTPS',
        severity: 'MEDIUM',
        message: 'HTTP URLs detected - should use HTTPS',
        remediation: 'Use HTTPS for all external URLs to ensure encrypted communication',
        owaspCategory: 'A02:2021 - Cryptographic Failures',
      });
    }

    return issues;
  }

  /**
   * Detect missing input validation
   */
  private static detectMissingInputValidation(code: string): SecurityValidation['vulnerabilities'] {
    const issues: SecurityValidation['vulnerabilities'] = [];

    const hasRoutes = code.includes('app.post') || code.includes('app.put') || code.includes('app.patch');
    const hasValidation = code.includes('z.object') || code.includes('Joi.') || code.includes('yup.');

    if (hasRoutes && !hasValidation) {
      issues.push({
        type: 'MISSING_INPUT_VALIDATION',
        severity: 'HIGH',
        message: 'API routes without input validation',
        remediation: 'Add Zod/Joi/Yup validation schemas for all user inputs',
        owaspCategory: 'A03:2021 - Injection',
      });
    }

    return issues;
  }

  /**
   * Check CSRF protection
   */
  static checkCsrfProtection(code: string): boolean {
    return code.includes('csrf') || 
           code.includes('csurf') || 
           code.includes('csrfToken');
  }

  /**
   * Check rate limiting
   */
  static checkRateLimiting(code: string): boolean {
    return code.includes('rateLimit') || 
           code.includes('express-rate-limit') ||
           code.includes('rate-limiter');
  }

  /**
   * Check security headers
   */
  static checkSecurityHeaders(code: string): {
    hasSecurityHeaders: boolean;
    missingHeaders: string[];
  } {
    const missingHeaders: string[] = [];

    for (const header of REQUIRED_SECURITY_HEADERS) {
      if (!code.includes(header)) {
        missingHeaders.push(header);
      }
    }

    return {
      hasSecurityHeaders: missingHeaders.length === 0,
      missingHeaders,
    };
  }

  /**
   * Validate secure session management
   */
  static validateSessionSecurity(code: string): {
    secure: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (code.includes('express-session')) {
      if (!code.includes('secure: true')) {
        issues.push('Session cookie missing secure flag');
      }
      if (!code.includes('httpOnly: true')) {
        issues.push('Session cookie missing httpOnly flag');
      }
      if (!code.includes('sameSite')) {
        issues.push('Session cookie missing sameSite attribute');
      }
    }

    return {
      secure: issues.length === 0,
      issues,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static calculateSecurityScore(
    vulnerabilities: SecurityValidation['vulnerabilities']
  ): number {
    let score = 100;

    const criticalCount = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const mediumCount = vulnerabilities.filter(v => v.severity === 'MEDIUM').length;
    const lowCount = vulnerabilities.filter(v => v.severity === 'LOW').length;

    score -= criticalCount * 30;
    score -= highCount * 15;
    score -= mediumCount * 10;
    score -= lowCount * 5;

    return Math.max(0, Math.min(100, score));
  }

  private static checkOwaspCoverage(
    vulnerabilities: SecurityValidation['vulnerabilities']
  ): SecurityValidation['owaspCoverage'] {
    const types = new Set(vulnerabilities.map(v => v.type));

    return {
      injection: types.has('SQL_INJECTION') || types.has('XSS'),
      brokenAuth: types.has('MISSING_AUTH') || types.has('WEAK_PASSWORD'),
      sensitiveDataExposure: types.has('HARDCODED_SECRET') || types.has('SENSITIVE_DATA_EXPOSURE'),
      xxe: false, // Not checked yet
      brokenAccessControl: types.has('MISSING_AUTHORIZATION'),
      securityMisconfig: types.has('MISSING_SECURITY_HEADERS'),
      xss: types.has('XSS'),
      insecureDeserialization: types.has('INSECURE_DESERIALIZATION'),
      knownVulnerabilities: types.has('VULNERABLE_DEPENDENCY'),
      insufficientLogging: false, // Not checked yet
    };
  }

  private static generateRecommendation(
    severity: string,
    vulnerabilities: SecurityValidation['vulnerabilities']
  ): string {
    if (severity === 'CRITICAL') {
      return 'CRITICAL SECURITY ISSUES: Do NOT deploy to production. Fix all critical vulnerabilities immediately. This code poses serious security risks.';
    }

    if (severity === 'HIGH') {
      return 'HIGH SECURITY RISK: Address all high-severity issues before deployment. Consider security audit.';
    }

    if (severity === 'MEDIUM') {
      return 'MEDIUM SECURITY RISK: Fix medium-severity issues. Code may be deployed with caution.';
    }

    if (severity === 'LOW') {
      return 'LOW SECURITY RISK: Minor security improvements recommended but code is generally safe.';
    }

    return 'SECURE: No security issues detected. Code follows security best practices.';
  }

  private static getLineNumber(code: string, index: number): number {
    const lines = code.substring(0, index).split('\n');
    return lines.length;
  }
}
