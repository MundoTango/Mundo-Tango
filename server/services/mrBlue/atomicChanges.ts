/**
 * Atomic Change Groups for Mr. Blue Visual Editor
 * Transaction-style file changes with rollback support
 * 
 * Features:
 * - Group related file changes together
 * - Apply all or none (atomic operation)
 * - Automatic rollback on error
 * - LSP validation before applying
 * - Change history tracking
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ==================== TYPE DEFINITIONS ====================

/**
 * Individual file change
 */
export interface FileChange {
  filePath: string;
  content: string;
  operation: 'create' | 'update' | 'delete';
  backup?: string; // Backup content before change
}

/**
 * Change group metadata
 */
export interface ChangeGroupMetadata {
  id: string;
  description: string;
  createdAt: Date;
  appliedAt?: Date;
  rolledBackAt?: Date;
  userId?: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  passed: boolean;
  errors: Array<{
    file: string;
    line?: number;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

/**
 * Apply result
 */
export interface ApplyResult {
  success: boolean;
  changesApplied: number;
  errors?: string[];
  rolledBack: boolean;
}

// ==================== ATOMIC CHANGE GROUP ====================

export class AtomicChangeGroup {
  private id: string;
  private changes: FileChange[] = [];
  private metadata: ChangeGroupMetadata;
  private applied: boolean = false;
  private backups: Map<string, string> = new Map();
  
  constructor(description: string, userId?: number) {
    this.id = `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.metadata = {
      id: this.id,
      description,
      createdAt: new Date(),
      userId
    };
    
    console.log(`[AtomicChangeGroup] Created: ${this.id}`);
  }

  // ==================== ADD CHANGES ====================

  /**
   * Add a file change to the group
   */
  add(filePath: string, content: string, operation: FileChange['operation'] = 'update'): void {
    this.changes.push({
      filePath,
      content,
      operation
    });
    
    console.log(`[AtomicChangeGroup] Added change: ${operation} ${filePath}`);
  }

  /**
   * Add multiple changes at once
   */
  addMultiple(changes: Array<{ filePath: string; content: string; operation?: FileChange['operation'] }>): void {
    for (const change of changes) {
      this.add(change.filePath, change.content, change.operation || 'update');
    }
  }

  // ==================== VALIDATION ====================

  /**
   * Validate all changes before applying
   * Uses LSP (Language Server Protocol) for validation
   */
  async validate(): Promise<ValidationResult> {
    console.log(`[AtomicChangeGroup] Validating ${this.changes.length} changes...`);
    
    const errors: ValidationResult['errors'] = [];
    
    try {
      // Write changes to temporary files for validation
      const tempDir = path.join(process.cwd(), '.tmp', this.id);
      await fs.mkdir(tempDir, { recursive: true });

      for (const change of this.changes) {
        const tempFile = path.join(tempDir, path.basename(change.filePath));
        await fs.writeFile(tempFile, change.content);

        // Run TypeScript compiler check (simple validation)
        if (change.filePath.endsWith('.ts') || change.filePath.endsWith('.tsx')) {
          try {
            const { stdout, stderr } = await execAsync(
              `npx tsc --noEmit --skipLibCheck ${tempFile}`,
              { timeout: 5000 }
            );
            
            if (stderr) {
              // Parse TypeScript errors
              const errorLines = stderr.split('\n').filter(line => line.includes('error TS'));
              for (const errorLine of errorLines) {
                errors.push({
                  file: change.filePath,
                  message: errorLine,
                  severity: 'error'
                });
              }
            }
          } catch (error: any) {
            // TypeScript errors show up in stderr, which throws an error
            if (error.stderr) {
              const errorLines = error.stderr.split('\n').filter((line: string) => line.includes('error TS'));
              for (const errorLine of errorLines) {
                errors.push({
                  file: change.filePath,
                  message: errorLine,
                  severity: 'error'
                });
              }
            }
          }
        }
      }

      // Cleanup temp dir
      await fs.rm(tempDir, { recursive: true, force: true });

      const passed = errors.length === 0;
      console.log(`[AtomicChangeGroup] Validation ${passed ? 'passed' : 'failed'}: ${errors.length} errors`);
      
      return {
        passed,
        errors
      };
    } catch (error: any) {
      console.error('[AtomicChangeGroup] Validation error:', error);
      return {
        passed: false,
        errors: [{
          file: 'validation',
          message: error.message || 'Validation failed',
          severity: 'error'
        }]
      };
    }
  }

  // ==================== BACKUP ====================

  /**
   * Create backups of all files before changes
   */
  private async createBackups(): Promise<Map<string, string>> {
    console.log('[AtomicChangeGroup] Creating backups...');
    
    const backups = new Map<string, string>();

    for (const change of this.changes) {
      if (change.operation === 'delete' || change.operation === 'update') {
        try {
          // Read existing file content
          const absolutePath = path.resolve(process.cwd(), change.filePath);
          const content = await fs.readFile(absolutePath, 'utf-8');
          backups.set(change.filePath, content);
          change.backup = content;
          
          console.log(`[AtomicChangeGroup] Backed up: ${change.filePath}`);
        } catch (error: any) {
          // File doesn't exist (might be a create operation that failed)
          if (error.code !== 'ENOENT') {
            console.warn(`[AtomicChangeGroup] Backup warning for ${change.filePath}:`, error.message);
          }
        }
      }
    }

    this.backups = backups;
    return backups;
  }

  // ==================== APPLY CHANGES ====================

  /**
   * Apply all changes atomically
   * If any change fails, rollback all changes
   */
  async apply(skipValidation: boolean = false): Promise<ApplyResult> {
    if (this.applied) {
      return {
        success: false,
        changesApplied: 0,
        errors: ['Changes already applied'],
        rolledBack: false
      };
    }

    console.log(`[AtomicChangeGroup] Applying ${this.changes.length} changes...`);

    // Validate first (unless skipped)
    if (!skipValidation) {
      const validation = await this.validate();
      if (!validation.passed) {
        return {
          success: false,
          changesApplied: 0,
          errors: validation.errors.map(e => `${e.file}: ${e.message}`),
          rolledBack: false
        };
      }
    }

    // Create backups
    await this.createBackups();

    const appliedChanges: string[] = [];
    const errors: string[] = [];

    try {
      // Apply all changes
      for (const change of this.changes) {
        const absolutePath = path.resolve(process.cwd(), change.filePath);
        
        try {
          // Ensure directory exists
          await fs.mkdir(path.dirname(absolutePath), { recursive: true });

          switch (change.operation) {
            case 'create':
            case 'update':
              await fs.writeFile(absolutePath, change.content, 'utf-8');
              break;
            
            case 'delete':
              await fs.unlink(absolutePath);
              break;
          }

          appliedChanges.push(change.filePath);
          console.log(`[AtomicChangeGroup] Applied: ${change.operation} ${change.filePath}`);
        } catch (error: any) {
          errors.push(`${change.filePath}: ${error.message}`);
          throw error; // Trigger rollback
        }
      }

      // Mark as applied
      this.applied = true;
      this.metadata.appliedAt = new Date();

      console.log(`[AtomicChangeGroup] Successfully applied ${appliedChanges.length} changes`);
      
      return {
        success: true,
        changesApplied: appliedChanges.length,
        rolledBack: false
      };
    } catch (error: any) {
      // Rollback on error
      console.error('[AtomicChangeGroup] Apply failed, rolling back:', error);
      await this.rollback();
      
      return {
        success: false,
        changesApplied: appliedChanges.length,
        errors: [`Apply failed: ${error.message}`, ...errors],
        rolledBack: true
      };
    }
  }

  // ==================== ROLLBACK ====================

  /**
   * Rollback all changes using backups
   */
  async rollback(): Promise<void> {
    console.log('[AtomicChangeGroup] Rolling back changes...');

    if (this.backups.size === 0) {
      console.warn('[AtomicChangeGroup] No backups available for rollback');
      return;
    }

    for (const [filePath, content] of this.backups) {
      try {
        const absolutePath = path.resolve(process.cwd(), filePath);
        await fs.writeFile(absolutePath, content, 'utf-8');
        console.log(`[AtomicChangeGroup] Restored: ${filePath}`);
      } catch (error: any) {
        console.error(`[AtomicChangeGroup] Rollback error for ${filePath}:`, error);
      }
    }

    this.metadata.rolledBackAt = new Date();
    console.log('[AtomicChangeGroup] Rollback complete');
  }

  // ==================== GETTERS ====================

  /**
   * Get change group ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get all changes
   */
  getChanges(): FileChange[] {
    return [...this.changes];
  }

  /**
   * Get metadata
   */
  getMetadata(): ChangeGroupMetadata {
    return { ...this.metadata };
  }

  /**
   * Check if changes are applied
   */
  isApplied(): boolean {
    return this.applied;
  }

  /**
   * Get file paths affected by this change group
   */
  getAffectedFiles(): string[] {
    return this.changes.map(c => c.filePath);
  }

  /**
   * Get change count
   */
  getChangeCount(): number {
    return this.changes.length;
  }
}

// ==================== CHANGE GROUP MANAGER ====================

/**
 * Manager for tracking multiple change groups
 */
export class ChangeGroupManager {
  private groups: Map<string, AtomicChangeGroup> = new Map();
  private history: ChangeGroupMetadata[] = [];

  /**
   * Create a new change group
   */
  createGroup(description: string, userId?: number): AtomicChangeGroup {
    const group = new AtomicChangeGroup(description, userId);
    this.groups.set(group.getId(), group);
    return group;
  }

  /**
   * Get a change group by ID
   */
  getGroup(id: string): AtomicChangeGroup | undefined {
    return this.groups.get(id);
  }

  /**
   * Apply a change group
   */
  async applyGroup(id: string, skipValidation: boolean = false): Promise<ApplyResult> {
    const group = this.groups.get(id);
    if (!group) {
      return {
        success: false,
        changesApplied: 0,
        errors: ['Change group not found'],
        rolledBack: false
      };
    }

    const result = await group.apply(skipValidation);
    
    // Add to history
    this.history.push(group.getMetadata());
    
    return result;
  }

  /**
   * Get change history
   */
  getHistory(): ChangeGroupMetadata[] {
    return [...this.history];
  }

  /**
   * Clear completed groups from memory
   */
  cleanup(): void {
    const completed = Array.from(this.groups.values()).filter(g => g.isApplied());
    for (const group of completed) {
      this.groups.delete(group.getId());
    }
    console.log(`[ChangeGroupManager] Cleaned up ${completed.length} completed groups`);
  }
}

// Singleton instance
export const changeGroupManager = new ChangeGroupManager();
