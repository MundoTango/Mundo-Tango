/**
 * BaseSecurityAgent - Base class for security/middleware agents
 * MB.MD v9.3 - Backend Agent System
 * 
 * Purpose: Manages security concerns:
 * - Authentication (JWT, OAuth)
 * - Authorization (RBAC)
 * - CSRF protection
 * - Rate limiting
 * - Input validation
 * - XSS prevention
 */

export interface SecurityChange {
  type: 'auth' | 'csrf' | 'rate_limit' | 'validation' | 'rbac';
  file: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  changes: string[];
}

export interface SecurityValidation {
  safe: boolean;
  vulnerabilities: string[];
  recommendations: string[];
}

export abstract class BaseSecurityAgent {
  protected id: string;
  protected name: string;
  protected middlewareFiles: string[];
  protected securityDomains: string[]; // Areas of security this agent handles

  constructor(
    id: string,
    name: string,
    middlewareFiles: string[],
    securityDomains: string[]
  ) {
    this.id = id;
    this.name = name;
    this.middlewareFiles = middlewareFiles;
    this.securityDomains = securityDomains;
  }

  /**
   * Get agent ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get security domains
   */
  getSecurityDomains(): string[] {
    return this.securityDomains;
  }

  /**
   * Analyze UI/API changes for security implications
   * @param uiChanges - UI changes
   * @param apiChanges - API changes
   * @returns List of security changes needed
   */
  abstract analyzeSecurityNeeds(
    uiChanges: any[],
    apiChanges: any[]
  ): Promise<SecurityChange[]>;

  /**
   * Validate security changes don't introduce vulnerabilities
   * @param changes - Proposed security changes
   * @returns Validation result
   */
  abstract validateSecurityChanges(
    changes: SecurityChange[]
  ): Promise<SecurityValidation>;

  /**
   * Apply security changes to middleware/auth files
   * @param changes - Security changes to apply
   * @returns Success status
   */
  abstract applySecurityChanges(changes: SecurityChange[]): Promise<{
    success: boolean;
    filesModified: string[];
    vulnerabilitiesFixed: number;
    errors: string[];
  }>;

  /**
   * Run security audit on the entire codebase
   * @returns Audit results
   */
  abstract runSecurityAudit(): Promise<{
    passed: boolean;
    vulnerabilities: SecurityChange[];
    score: number; // 0-100
  }>;
}
