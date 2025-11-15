/**
 * Autonomous Agent Core Service for Mr. Blue
 * Provides full Replit Agent capabilities for autonomous operations
 * 
 * Features:
 * - File operations (read, write, edit, delete, list, search)
 * - Shell command execution
 * - Database operations
 * - Git operations
 * - Secrets management
 * - Rate limiting (100 ops/minute)
 * - Comprehensive audit logging
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import { gitService } from '../gitService';

const execAsync = promisify(exec);

/**
 * Command execution result
 */
export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * File search result
 */
export interface SearchResult {
  file: string;
  matches: string[];
}

/**
 * Git status result
 */
export interface GitStatus {
  modified: string[];
  added: string[];
  deleted: string[];
}

/**
 * Operation audit log entry
 */
interface AuditLogEntry {
  timestamp: Date;
  operation: string;
  details: string;
  success: boolean;
}

/**
 * Rate limiter for operations
 */
class RateLimiter {
  private operations: number[] = [];
  private readonly maxOps: number;
  private readonly windowMs: number;

  constructor(maxOps: number = 100, windowMs: number = 60000) {
    this.maxOps = maxOps;
    this.windowMs = windowMs;
  }

  checkLimit(): boolean {
    const now = Date.now();
    this.operations = this.operations.filter(time => now - time < this.windowMs);
    
    if (this.operations.length >= this.maxOps) {
      return false;
    }
    
    this.operations.push(now);
    return true;
  }

  getRemainingOps(): number {
    const now = Date.now();
    this.operations = this.operations.filter(time => now - time < this.windowMs);
    return this.maxOps - this.operations.length;
  }
}

/**
 * Main Autonomous Agent class
 */
class AutonomousAgent {
  private workingDir: string;
  private rateLimiter: RateLimiter;
  private auditLog: AuditLogEntry[] = [];

  constructor() {
    this.workingDir = process.cwd();
    this.rateLimiter = new RateLimiter(100, 60000);
    console.log('[AutonomousAgent] Initialized with working directory:', this.workingDir);
  }

  // ==================== AUDIT LOGGING ====================

  /**
   * Log an operation for audit trail
   */
  private log(operation: string, details: string, success: boolean = true): void {
    const entry: AuditLogEntry = {
      timestamp: new Date(),
      operation,
      details,
      success
    };
    
    this.auditLog.push(entry);
    
    const status = success ? '✓' : '✗';
    console.log(`[AutonomousAgent] ${status} ${operation}: ${details}`);
  }

  /**
   * Get audit log entries
   */
  getAuditLog(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  // ==================== RATE LIMITING ====================

  /**
   * Check if operation can proceed (rate limiting)
   */
  private checkRateLimit(): void {
    if (!this.rateLimiter.checkLimit()) {
      const remaining = this.rateLimiter.getRemainingOps();
      throw new Error(
        `Rate limit exceeded. Max 100 operations per minute. Remaining: ${remaining}`
      );
    }
  }

  // ==================== PATH VALIDATION ====================

  /**
   * Validate and resolve file path (security check)
   */
  private validatePath(filePath: string): string {
    // Prevent directory traversal attacks
    if (filePath.includes('..')) {
      throw new Error('Invalid path: Directory traversal not allowed');
    }

    // Resolve to absolute path
    const absolutePath = path.resolve(this.workingDir, filePath);

    // Ensure path is within working directory
    if (!absolutePath.startsWith(this.workingDir)) {
      throw new Error('Invalid path: Must be within working directory');
    }

    return absolutePath;
  }

  // ==================== FILE OPERATIONS ====================

  /**
   * Read file contents
   * @param filePath - Relative or absolute path to file
   * @returns File contents as string
   */
  async readFile(filePath: string): Promise<string> {
    this.checkRateLimit();
    
    try {
      const absolutePath = this.validatePath(filePath);
      const content = await fs.readFile(absolutePath, 'utf-8');
      
      this.log('readFile', `Read ${filePath} (${content.length} bytes)`);
      return content;
    } catch (error: any) {
      this.log('readFile', `Failed to read ${filePath}: ${error.message}`, false);
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Write or create file
   * @param filePath - Relative or absolute path to file
   * @param content - Content to write
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    this.checkRateLimit();
    
    try {
      const absolutePath = this.validatePath(filePath);
      
      // Ensure directory exists
      const dir = path.dirname(absolutePath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(absolutePath, content, 'utf-8');
      
      this.log('writeFile', `Wrote ${filePath} (${content.length} bytes)`);
    } catch (error: any) {
      this.log('writeFile', `Failed to write ${filePath}: ${error.message}`, false);
      throw new Error(`Failed to write file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Edit file by replacing old string with new string
   * @param filePath - Relative or absolute path to file
   * @param oldString - String to find
   * @param newString - Replacement string
   */
  async editFile(filePath: string, oldString: string, newString: string): Promise<void> {
    this.checkRateLimit();
    
    try {
      const content = await this.readFile(filePath);
      
      if (!content.includes(oldString)) {
        throw new Error(`String not found in file: ${oldString.substring(0, 50)}...`);
      }
      
      const newContent = content.replace(oldString, newString);
      await this.writeFile(filePath, newContent);
      
      this.log('editFile', `Edited ${filePath}: replaced ${oldString.length} chars with ${newString.length} chars`);
    } catch (error: any) {
      this.log('editFile', `Failed to edit ${filePath}: ${error.message}`, false);
      throw new Error(`Failed to edit file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Delete file
   * @param filePath - Relative or absolute path to file
   */
  async deleteFile(filePath: string): Promise<void> {
    this.checkRateLimit();
    
    try {
      const absolutePath = this.validatePath(filePath);
      await fs.unlink(absolutePath);
      
      this.log('deleteFile', `Deleted ${filePath}`);
    } catch (error: any) {
      this.log('deleteFile', `Failed to delete ${filePath}: ${error.message}`, false);
      throw new Error(`Failed to delete file ${filePath}: ${error.message}`);
    }
  }

  /**
   * List files in directory
   * @param directory - Relative or absolute path to directory
   * @returns Array of file names
   */
  async listFiles(directory: string): Promise<string[]> {
    this.checkRateLimit();
    
    try {
      const absolutePath = this.validatePath(directory);
      const entries = await fs.readdir(absolutePath, { withFileTypes: true });
      
      const files = entries
        .filter(entry => entry.isFile())
        .map(entry => entry.name);
      
      this.log('listFiles', `Listed ${files.length} files in ${directory}`);
      return files;
    } catch (error: any) {
      this.log('listFiles', `Failed to list ${directory}: ${error.message}`, false);
      throw new Error(`Failed to list directory ${directory}: ${error.message}`);
    }
  }

  /**
   * Search files for pattern (grep-style)
   * @param pattern - Regular expression pattern to search
   * @param searchPath - Optional path to search in (defaults to working directory)
   * @returns Array of search results with file paths and matching lines
   */
  async searchFiles(pattern: string, searchPath?: string): Promise<SearchResult[]> {
    this.checkRateLimit();
    
    try {
      const basePath = searchPath ? this.validatePath(searchPath) : this.workingDir;
      
      // Use grep command for efficient searching
      const { stdout } = await execAsync(
        `grep -r -n "${pattern}" "${basePath}" 2>/dev/null || true`,
        { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
      );
      
      const results: Map<string, string[]> = new Map();
      
      if (stdout) {
        const lines = stdout.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          const colonIndex = line.indexOf(':');
          if (colonIndex === -1) continue;
          
          const filePath = line.substring(0, colonIndex);
          const match = line.substring(colonIndex + 1);
          
          if (!results.has(filePath)) {
            results.set(filePath, []);
          }
          results.get(filePath)!.push(match);
        }
      }
      
      const searchResults: SearchResult[] = Array.from(results.entries()).map(
        ([file, matches]) => ({ file, matches })
      );
      
      this.log('searchFiles', `Found ${searchResults.length} files matching "${pattern}"`);
      return searchResults;
    } catch (error: any) {
      this.log('searchFiles', `Search failed for "${pattern}": ${error.message}`, false);
      throw new Error(`Failed to search files: ${error.message}`);
    }
  }

  // ==================== SHELL COMMAND EXECUTION ====================

  /**
   * Execute shell command
   * @param command - Command to execute
   * @param timeout - Timeout in milliseconds (default: 30000)
   * @returns Command result with stdout, stderr, and exit code
   */
  async executeCommand(command: string, timeout: number = 30000): Promise<CommandResult> {
    this.checkRateLimit();
    
    // Security check: prevent dangerous commands
    const dangerousPatterns = [
      'rm -rf /',
      'mkfs',
      'dd if=',
      ':(){:|:&};:',  // Fork bomb
      'chmod 777',
      'chown root'
    ];
    
    for (const pattern of dangerousPatterns) {
      if (command.includes(pattern)) {
        throw new Error(`Dangerous command not allowed: ${pattern}`);
      }
    }
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workingDir,
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        env: process.env
      });
      
      this.log('executeCommand', `Executed: ${command.substring(0, 100)}`);
      
      return {
        stdout: stdout.toString(),
        stderr: stderr.toString(),
        exitCode: 0
      };
    } catch (error: any) {
      this.log('executeCommand', `Command failed: ${command.substring(0, 100)} - ${error.message}`, false);
      
      return {
        stdout: error.stdout?.toString() || '',
        stderr: error.stderr?.toString() || error.message,
        exitCode: error.code || 1
      };
    }
  }

  // ==================== DATABASE OPERATIONS ====================

  /**
   * Execute SQL query
   * @param query - SQL query to execute
   * @returns Query results
   */
  async queryDatabase(query: string): Promise<any[]> {
    this.checkRateLimit();
    
    try {
      // Security: Prevent destructive operations in production
      const destructivePatterns = ['DROP TABLE', 'TRUNCATE', 'DELETE FROM', 'UPDATE'];
      const isDestructive = destructivePatterns.some(pattern => 
        query.toUpperCase().includes(pattern)
      );
      
      if (isDestructive && process.env.NODE_ENV === 'production') {
        throw new Error('Destructive SQL operations not allowed in production');
      }
      
      const result = await db.execute(sql.raw(query));
      
      this.log('queryDatabase', `Executed SQL query (${result.length} rows returned)`);
      return result;
    } catch (error: any) {
      this.log('queryDatabase', `Query failed: ${error.message}`, false);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  /**
   * Get database schema information
   * @returns Schema information including tables and columns
   */
  async getDatabaseSchema(): Promise<any> {
    this.checkRateLimit();
    
    try {
      // Query PostgreSQL information schema
      const tables = await db.execute(sql`
        SELECT 
          table_name,
          table_type
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      const columns = await db.execute(sql`
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `);
      
      this.log('getDatabaseSchema', `Retrieved schema for ${tables.length} tables`);
      
      return {
        tables,
        columns
      };
    } catch (error: any) {
      this.log('getDatabaseSchema', `Failed to get schema: ${error.message}`, false);
      throw new Error(`Failed to get database schema: ${error.message}`);
    }
  }

  /**
   * Execute database transaction
   * @param callback - Callback function receiving transaction object
   * @returns Transaction result
   */
  async executeTransaction<T>(callback: (tx: typeof db) => Promise<T>): Promise<T> {
    this.checkRateLimit();
    
    try {
      const result = await db.transaction(callback);
      this.log('executeTransaction', 'Transaction completed successfully');
      return result;
    } catch (error: any) {
      this.log('executeTransaction', `Transaction failed: ${error.message}`, false);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  // ==================== GIT OPERATIONS ====================

  /**
   * Commit current changes
   * @param message - Commit message
   */
  async gitCommit(message: string): Promise<void> {
    this.checkRateLimit();
    
    try {
      // Stage all changes
      await this.executeCommand('git add -A');
      
      // Commit with message
      const sanitizedMessage = message.replace(/"/g, '\\"').substring(0, 200);
      await this.executeCommand(`git commit -m "${sanitizedMessage}"`);
      
      this.log('gitCommit', `Committed: ${message.substring(0, 50)}`);
    } catch (error: any) {
      this.log('gitCommit', `Commit failed: ${error.message}`, false);
      throw new Error(`Git commit failed: ${error.message}`);
    }
  }

  /**
   * Get git status
   * @returns Git status with modified, added, and deleted files
   */
  async gitStatus(): Promise<GitStatus> {
    this.checkRateLimit();
    
    try {
      const { stdout } = await this.executeCommand('git status --porcelain');
      
      const modified: string[] = [];
      const added: string[] = [];
      const deleted: string[] = [];
      
      if (stdout) {
        const lines = stdout.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          const status = line.substring(0, 2).trim();
          const file = line.substring(3).trim();
          
          if (status === 'M' || status === 'MM') {
            modified.push(file);
          } else if (status === 'A' || status === 'AM') {
            added.push(file);
          } else if (status === 'D') {
            deleted.push(file);
          }
        }
      }
      
      this.log('gitStatus', `Status: ${modified.length} modified, ${added.length} added, ${deleted.length} deleted`);
      
      return { modified, added, deleted };
    } catch (error: any) {
      this.log('gitStatus', `Status check failed: ${error.message}`, false);
      throw new Error(`Git status failed: ${error.message}`);
    }
  }

  /**
   * Get current git branch
   * @returns Current branch name
   */
  async getCurrentBranch(): Promise<string> {
    return gitService.getCurrentBranch();
  }

  /**
   * Create and checkout new branch
   * @param branchName - Name of branch to create
   */
  async createBranch(branchName: string): Promise<void> {
    this.checkRateLimit();
    
    try {
      await this.executeCommand(`git checkout -b ${branchName}`);
      this.log('createBranch', `Created and checked out branch: ${branchName}`);
    } catch (error: any) {
      this.log('createBranch', `Branch creation failed: ${error.message}`, false);
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  // ==================== SECRETS MANAGEMENT ====================

  /**
   * Get secret from environment variables
   * @param key - Secret key
   * @returns Secret value or undefined if not found
   */
  getSecret(key: string): string | undefined {
    this.checkRateLimit();
    
    const value = process.env[key];
    
    // Never log actual secret values
    if (value) {
      this.log('getSecret', `Retrieved secret: ${key} (value hidden)`);
    } else {
      this.log('getSecret', `Secret not found: ${key}`, false);
    }
    
    return value;
  }

  /**
   * Check if secret exists
   * @param key - Secret key
   * @returns True if secret exists
   */
  hasSecret(key: string): boolean {
    return process.env[key] !== undefined;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get working directory
   * @returns Current working directory path
   */
  getWorkingDirectory(): string {
    return this.workingDir;
  }

  /**
   * Get rate limiter status
   * @returns Number of remaining operations in current window
   */
  getRemainingOperations(): number {
    return this.rateLimiter.getRemainingOps();
  }
}

/**
 * Singleton instance of Autonomous Agent
 */
export const autonomousAgent = new AutonomousAgent();
