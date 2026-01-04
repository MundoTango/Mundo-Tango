/**
 * BaseSchemaAgent - Base class for database schema agents
 * MB.MD v9.3 - Backend Agent System
 * 
 * Purpose: Manages database schema changes:
 * - Add new tables
 * - Add new columns
 * - Update validation
 * - Create migrations
 * - Ensure referential integrity
 * 
 * CRITICAL: Never change ID column types (serial ↔ varchar)
 */

export interface SchemaChange {
  type: 'create_table' | 'add_column' | 'update_column' | 'create_index';
  table: string;
  column?: string;
  description: string;
  sql?: string;
  safe: boolean;
}

export interface SchemaValidation {
  safe: boolean;
  warnings: string[];
  errors: string[];
  destructive: boolean;
}

export abstract class BaseSchemaAgent {
  protected id: string;
  protected name: string;
  protected tables: string[]; // Tables this agent manages
  protected schemaFile: string = 'shared/schema.ts';

  constructor(id: string, name: string, tables: string[]) {
    this.id = id;
    this.name = name;
    this.tables = tables;
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
   * Get tables this agent manages
   */
  getTables(): string[] {
    return this.tables;
  }

  /**
   * Check if this agent manages a specific table
   */
  managesTable(table: string): boolean {
    return this.tables.includes(table);
  }

  /**
   * Analyze UI/API changes and determine required schema changes
   * @param uiChanges - UI changes
   * @param apiChanges - API changes
   * @returns List of schema changes needed
   */
  abstract analyzeChanges(
    uiChanges: any[],
    apiChanges: any[]
  ): Promise<SchemaChange[]>;

  /**
   * Validate schema changes are safe
   * CRITICAL: Prevent ID type changes
   */
  abstract validateSchemaChanges(
    changes: SchemaChange[]
  ): Promise<SchemaValidation>;

  /**
   * Apply schema changes to shared/schema.ts
   * @param changes - Schema changes to apply
   * @returns Success status
   */
  abstract applySchemaChanges(changes: SchemaChange[]): Promise<{
    success: boolean;
    filesModified: string[];
    migrations: string[];
    errors: string[];
  }>;

  /**
   * Run database migration
   * Uses `npm run db:push --force` for safe schema sync
   */
  abstract runMigration(): Promise<{
    success: boolean;
    output: string;
    errors: string[];
  }>;
}
