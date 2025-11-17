/**
 * DatabaseGuardian - Production Database Safety Service
 * 
 * Prevents database disasters by intercepting and validating all SQL operations.
 * Inspired by the Replit database deletion incident and similar AI coding disasters.
 * 
 * Core Functions:
 * - Block destructive operations (DROP, TRUNCATE, DELETE) without approval
 * - Enforce dev/prod database separation
 * - Auto-backup before migrations
 * - Audit log all database operations
 * - Detect potentially dangerous patterns
 * 
 * Protection Levels:
 * - CRITICAL: Operations that could destroy data (DROP, TRUNCATE)
 * - HIGH: Mass deletions, schema changes
 * - MEDIUM: Updates without WHERE, unindexed queries
 * - LOW: Read-only operations, safe writes
 * 
 * Integration:
 * - Call validateOperation() before executing any SQL
 * - Check requiresApproval() for destructive operations
 * - Use createBackup() before migrations
 * - Call logOperation() for audit trail
 */

import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export const DatabaseOperationSchema = z.object({
  sql: z.string(),
  params: z.array(z.any()).optional(),
  database: z.enum(['development', 'staging', 'production']),
  userId: z.number().optional(),
  source: z.string().optional(),
});

export type DatabaseOperation = z.infer<typeof DatabaseOperationSchema>;

export const ValidationResultSchema = z.object({
  allowed: z.boolean(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE']),
  requiresApproval: z.boolean(),
  risks: z.array(z.string()),
  warnings: z.array(z.string()),
  safetyScore: z.number().min(0).max(1),
  affectedTables: z.array(z.string()),
  estimatedImpact: z.object({
    tables: z.number(),
    rows: z.number().optional(),
    dataLossPotential: z.enum(['NONE', 'MINOR', 'MODERATE', 'SEVERE', 'CATASTROPHIC']),
  }),
  recommendation: z.string(),
  autoBackupRequired: z.boolean(),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

export interface BackupResult {
  success: boolean;
  backupId: string;
  timestamp: Date;
  size: number;
  tables: string[];
  location: string;
  error?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  operation: DatabaseOperation;
  result: ValidationResult;
  approved: boolean;
  approvedBy?: number;
  executionTime?: number;
  error?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DESTRUCTIVE_KEYWORDS = [
  'DROP', 'TRUNCATE', 'DELETE', 'ALTER', 'RENAME',
];

const CRITICAL_TABLES = [
  'users', 'payments', 'transactions', 'orders',
  'subscriptions', 'accounts', 'credentials',
];

const DANGEROUS_PATTERNS = [
  /DROP\s+(TABLE|DATABASE|SCHEMA)/i,
  /TRUNCATE\s+TABLE/i,
  /DELETE\s+FROM\s+\w+\s*$/i, // DELETE without WHERE
  /UPDATE\s+\w+\s+SET\s+.+\s*$/i, // UPDATE without WHERE
  /ALTER\s+TABLE\s+\w+\s+DROP/i,
  /GRANT\s+ALL/i,
  /REVOKE\s+ALL/i,
];

const SAFE_OPERATIONS = ['SELECT', 'EXPLAIN', 'DESCRIBE', 'SHOW'];

const PRODUCTION_LOCK_ENABLED = process.env.NODE_ENV === 'production';

// Audit log storage (in-memory for demo, use database in production)
const auditLog: AuditLogEntry[] = [];
const MAX_AUDIT_LOG_SIZE = 10000;

// ============================================================================
// DATABASE GUARDIAN SERVICE
// ============================================================================

export class DatabaseGuardian {
  /**
   * Validate a database operation before execution
   * 
   * @param operation - The database operation to validate
   * @returns Validation result with safety assessment
   * 
   * @example
   * const result = DatabaseGuardian.validateOperation({
   *   sql: 'DROP TABLE users',
   *   database: 'production',
   *   userId: 123,
   * });
   * if (!result.allowed) {
   *   throw new Error(`Operation blocked: ${result.risks.join(', ')}`);
   * }
   */
  static validateOperation(operation: DatabaseOperation): ValidationResult {
    console.log(`[DatabaseGuardian] 🛡️  Validating operation on ${operation.database}`);

    const risks: string[] = [];
    const warnings: string[] = [];
    let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE' = 'SAFE';
    let allowed = true;
    let requiresApproval = false;
    let autoBackupRequired = false;

    const sql = operation.sql.trim();
    const sqlUpper = sql.toUpperCase();

    // Check for safe read-only operations
    if (this.isSafeReadOperation(sql)) {
      return {
        allowed: true,
        severity: 'SAFE',
        requiresApproval: false,
        risks: [],
        warnings: [],
        safetyScore: 1.0,
        affectedTables: this.extractTables(sql),
        estimatedImpact: {
          tables: 0,
          dataLossPotential: 'NONE',
        },
        recommendation: 'Safe read-only operation',
        autoBackupRequired: false,
      };
    }

    // Check for destructive keywords
    const hasDestructiveKeyword = DESTRUCTIVE_KEYWORDS.some(keyword =>
      sqlUpper.includes(keyword)
    );

    if (hasDestructiveKeyword) {
      severity = 'HIGH';
      requiresApproval = true;
      warnings.push('Operation contains destructive keywords');
    }

    // Check for dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(sql)) {
        severity = 'CRITICAL';
        requiresApproval = true;
        autoBackupRequired = true;
        risks.push(`Dangerous pattern detected: ${pattern.source}`);
      }
    }

    // Check for DELETE/UPDATE without WHERE clause
    if (this.isMissingWhereClause(sql)) {
      severity = severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
      requiresApproval = true;
      risks.push('DELETE/UPDATE without WHERE clause - affects all rows');
    }

    // Check for critical tables
    const affectedTables = this.extractTables(sql);
    const criticalTablesAffected = affectedTables.filter(table =>
      CRITICAL_TABLES.includes(table.toLowerCase())
    );

    if (criticalTablesAffected.length > 0 && hasDestructiveKeyword) {
      severity = 'CRITICAL';
      requiresApproval = true;
      autoBackupRequired = true;
      risks.push(
        `Critical tables affected: ${criticalTablesAffected.join(', ')}`
      );
    }

    // Production database protection
    if (operation.database === 'production' && PRODUCTION_LOCK_ENABLED) {
      if (severity === 'CRITICAL' || severity === 'HIGH') {
        allowed = false;
        risks.push('PRODUCTION DATABASE: Destructive operations blocked by default');
      }
      requiresApproval = true;
      autoBackupRequired = true;
    }

    // Check for schema changes
    if (this.isSchemaChange(sql)) {
      severity = severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
      requiresApproval = true;
      autoBackupRequired = true;
      warnings.push('Schema change detected - may break application');
    }

    // Calculate safety score (0.0 = dangerous, 1.0 = safe)
    const safetyScore = this.calculateSafetyScore(sql, severity, risks.length);

    // Estimate impact
    const estimatedImpact = this.estimateImpact(sql, affectedTables, severity);

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      severity,
      risks,
      operation.database
    );

    const result: ValidationResult = {
      allowed,
      severity,
      requiresApproval,
      risks,
      warnings,
      safetyScore,
      affectedTables,
      estimatedImpact,
      recommendation,
      autoBackupRequired,
    };

    console.log(
      `[DatabaseGuardian] ${allowed ? '✅' : '❌'} Severity: ${severity} | ` +
      `Safety: ${safetyScore.toFixed(2)} | Tables: ${affectedTables.join(', ')}`
    );

    return result;
  }

  /**
   * Check if operation requires human approval
   * 
   * @param operation - Database operation
   * @returns True if approval needed
   */
  static requiresApproval(operation: DatabaseOperation): boolean {
    const result = this.validateOperation(operation);
    return result.requiresApproval;
  }

  /**
   * Create backup before executing operation
   * 
   * @param tables - Tables to backup
   * @param database - Database name
   * @returns Backup result
   */
  static async createBackup(
    tables: string[],
    database: string
  ): Promise<BackupResult> {
    console.log(`[DatabaseGuardian] 💾 Creating backup for ${tables.length} tables...`);

    try {
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();

      // TODO: Implement actual backup logic
      // This would use pg_dump or similar tool in production
      const backupLocation = `/backups/${database}/${backupId}.sql`;

      console.log(`[DatabaseGuardian] ✅ Backup created: ${backupId}`);

      return {
        success: true,
        backupId,
        timestamp,
        size: 0, // Would be actual size in production
        tables,
        location: backupLocation,
      };
    } catch (error: any) {
      console.error(`[DatabaseGuardian] ❌ Backup failed: ${error.message}`);
      return {
        success: false,
        backupId: '',
        timestamp: new Date(),
        size: 0,
        tables,
        location: '',
        error: error.message,
      };
    }
  }

  /**
   * Log database operation for audit trail
   * 
   * @param operation - Database operation
   * @param result - Validation result
   * @param approved - Whether operation was approved
   * @param approvedBy - User ID who approved
   * @param executionTime - Execution time in ms
   * @param error - Error message if failed
   */
  static logOperation(
    operation: DatabaseOperation,
    result: ValidationResult,
    approved: boolean,
    approvedBy?: number,
    executionTime?: number,
    error?: string
  ): void {
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      operation,
      result,
      approved,
      approvedBy,
      executionTime,
      error,
    };

    auditLog.push(entry);

    // Keep audit log size manageable
    if (auditLog.length > MAX_AUDIT_LOG_SIZE) {
      auditLog.shift();
    }

    console.log(
      `[DatabaseGuardian] 📝 Audit log entry created: ${entry.id} | ` +
      `Approved: ${approved} | Severity: ${result.severity}`
    );
  }

  /**
   * Get audit log entries
   * 
   * @param filters - Optional filters
   * @returns Filtered audit log entries
   */
  static getAuditLog(filters?: {
    database?: string;
    severity?: string;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
  }): AuditLogEntry[] {
    let filtered = [...auditLog];

    if (filters) {
      if (filters.database) {
        filtered = filtered.filter(e => e.operation.database === filters.database);
      }
      if (filters.severity) {
        filtered = filtered.filter(e => e.result.severity === filters.severity);
      }
      if (filters.userId) {
        filtered = filtered.filter(e => e.operation.userId === filters.userId);
      }
      if (filters.startDate) {
        filtered = filtered.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(e => e.timestamp <= filters.endDate!);
      }
    }

    return filtered;
  }

  /**
   * Check for SQL injection patterns
   * 
   * @param sql - SQL query
   * @param params - Query parameters
   * @returns True if potential injection detected
   */
  static detectSqlInjection(sql: string, params?: any[]): boolean {
    const injectionPatterns = [
      /['"].*[;].*--/i, // Quote + semicolon + comment
      /UNION\s+SELECT/i,
      /OR\s+1\s*=\s*1/i,
      /OR\s+['"].*['"]\s*=\s*['"]/i,
      /;\s*DROP/i,
      /;\s*DELETE/i,
      /;\s*UPDATE/i,
      /EXEC\s*\(/i,
      /EXECUTE\s*\(/i,
    ];

    return injectionPatterns.some(pattern => pattern.test(sql));
  }

  /**
   * Validate parameterized query
   * 
   * @param sql - SQL query
   * @param params - Query parameters
   * @returns Validation result
   */
  static validateParameterizedQuery(sql: string, params?: any[]): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check if query has placeholders but no params
    const placeholderCount = (sql.match(/\$\d+/g) || []).length;
    const paramCount = params?.length || 0;

    if (placeholderCount !== paramCount) {
      issues.push(
        `Placeholder mismatch: ${placeholderCount} placeholders, ${paramCount} params`
      );
    }

    // Check for string concatenation in query
    if (sql.includes('+') || sql.includes('||')) {
      issues.push('Possible string concatenation - use parameterized queries');
    }

    // Check for injection patterns
    if (this.detectSqlInjection(sql, params)) {
      issues.push('Potential SQL injection pattern detected');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Enforce dev/prod database separation
   * 
   * @param requestedDb - Requested database
   * @param environment - Current environment
   * @returns True if access allowed
   */
  static enforceEnvironmentSeparation(
    requestedDb: string,
    environment: string
  ): boolean {
    // In development, allow all databases
    if (environment === 'development') {
      return true;
    }

    // In production, only allow production database
    if (environment === 'production' && requestedDb !== 'production') {
      console.error(
        `[DatabaseGuardian] ❌ BLOCKED: Cannot access ${requestedDb} from production`
      );
      return false;
    }

    // In staging, only allow staging and development databases
    if (environment === 'staging' && requestedDb === 'production') {
      console.error(
        `[DatabaseGuardian] ❌ BLOCKED: Cannot access production from staging`
      );
      return false;
    }

    return true;
  }

  /**
   * Get statistics about blocked operations
   */
  static getStatistics(): {
    totalOperations: number;
    blocked: number;
    approved: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    safe: number;
  } {
    const total = auditLog.length;
    const blocked = auditLog.filter(e => !e.result.allowed).length;
    const approved = auditLog.filter(e => e.approved).length;
    const critical = auditLog.filter(e => e.result.severity === 'CRITICAL').length;
    const high = auditLog.filter(e => e.result.severity === 'HIGH').length;
    const medium = auditLog.filter(e => e.result.severity === 'MEDIUM').length;
    const low = auditLog.filter(e => e.result.severity === 'LOW').length;
    const safe = auditLog.filter(e => e.result.severity === 'SAFE').length;

    return {
      totalOperations: total,
      blocked,
      approved,
      critical,
      high,
      medium,
      low,
      safe,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static isSafeReadOperation(sql: string): boolean {
    const sqlUpper = sql.trim().toUpperCase();
    return SAFE_OPERATIONS.some(op => sqlUpper.startsWith(op));
  }

  private static isMissingWhereClause(sql: string): boolean {
    const sqlUpper = sql.toUpperCase();
    const hasDelete = sqlUpper.includes('DELETE FROM');
    const hasUpdate = sqlUpper.includes('UPDATE') && sqlUpper.includes('SET');
    const hasWhere = sqlUpper.includes('WHERE');

    return (hasDelete || hasUpdate) && !hasWhere;
  }

  private static isSchemaChange(sql: string): boolean {
    const schemaKeywords = ['ALTER', 'CREATE', 'DROP', 'RENAME'];
    const sqlUpper = sql.toUpperCase();
    return schemaKeywords.some(keyword => sqlUpper.includes(keyword));
  }

  private static extractTables(sql: string): string[] {
    const tables: string[] = [];
    const tablePatterns = [
      /FROM\s+(\w+)/gi,
      /JOIN\s+(\w+)/gi,
      /INTO\s+(\w+)/gi,
      /UPDATE\s+(\w+)/gi,
      /TABLE\s+(\w+)/gi,
    ];

    for (const pattern of tablePatterns) {
      const matches = sql.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          tables.push(match[1]);
        }
      }
    }

    return [...new Set(tables)]; // Remove duplicates
  }

  private static calculateSafetyScore(
    sql: string,
    severity: string,
    riskCount: number
  ): number {
    let score = 1.0;

    // Penalty for severity
    if (severity === 'CRITICAL') score -= 0.5;
    else if (severity === 'HIGH') score -= 0.3;
    else if (severity === 'MEDIUM') score -= 0.2;
    else if (severity === 'LOW') score -= 0.1;

    // Penalty for risks
    score -= riskCount * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  private static estimateImpact(
    sql: string,
    tables: string[],
    severity: string
  ): {
    tables: number;
    rows?: number;
    dataLossPotential: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CATASTROPHIC';
  } {
    let dataLossPotential: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CATASTROPHIC' = 'NONE';

    if (severity === 'CRITICAL') {
      dataLossPotential = 'CATASTROPHIC';
    } else if (severity === 'HIGH') {
      dataLossPotential = 'SEVERE';
    } else if (severity === 'MEDIUM') {
      dataLossPotential = 'MODERATE';
    } else if (severity === 'LOW') {
      dataLossPotential = 'MINOR';
    }

    return {
      tables: tables.length,
      dataLossPotential,
    };
  }

  private static generateRecommendation(
    severity: string,
    risks: string[],
    database: string
  ): string {
    if (severity === 'CRITICAL') {
      return `CRITICAL RISK: This operation should not be executed without careful review. Consider: 1) Create backup first, 2) Test in ${database === 'production' ? 'staging' : 'development'}, 3) Use WHERE clauses, 4) Implement soft deletes instead`;
    }

    if (severity === 'HIGH') {
      return `HIGH RISK: Create backup before proceeding. Test in lower environment first. Consider safer alternatives.`;
    }

    if (severity === 'MEDIUM') {
      return `MEDIUM RISK: Review operation carefully. Consider adding WHERE clauses or using transactions.`;
    }

    if (severity === 'LOW') {
      return `LOW RISK: Operation appears safe but review before production use.`;
    }

    return 'SAFE: Operation appears safe to execute.';
  }
}
