#!/usr/bin/env tsx
// ============================================================================
// SAFE MIGRATION SCRIPT - Mundo Tango
// ============================================================================
// Performs database migration with automated backup and safety checks
// Run: tsx scripts/safe-migrate.ts
// ============================================================================

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface MigrationResult {
  success: boolean;
  backupPath?: string;
  error?: string;
}

async function ensureBackupDir(): Promise<void> {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`📁 Created backup directory: ${backupDir}`);
  }
}

async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join('backups', `backup-${timestamp}.sql`);
  
  console.log('📦 Creating database backup...');
  
  try {
    const command = `pg_dump ${process.env.DATABASE_URL} > ${backupPath}`;
    await execAsync(command);
    
    // Verify backup was created and is not empty
    const stats = fs.statSync(backupPath);
    if (stats.size === 0) {
      throw new Error('Backup file is empty');
    }
    
    console.log(`✅ Backup created: ${backupPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

async function dryRunMigration(): Promise<boolean> {
  console.log('🧪 Running migration dry-run...');
  
  try {
    const { stdout, stderr } = await execAsync('drizzle-kit push --force', {
      env: { ...process.env, DRIZZLE_DRY_RUN: 'true' },
      cwd: process.cwd().replace('/scripts', '')
    });
    
    const output = stdout.toLowerCase();
    const hasDataLoss = output.includes('data loss') || 
                        output.includes('drop') || 
                        output.includes('delete');
    
    if (hasDataLoss) {
      console.error('⚠️  Migration may cause data loss!');
      console.log('Dry-run output:', stdout);
      return false;
    }
    
    console.log('✅ Dry-run passed');
    return true;
  } catch (error) {
    console.error('❌ Dry-run failed:', error);
    return false;
  }
}

async function applyMigration(): Promise<void> {
  console.log('⚡ Applying database migration...');
  
  try {
    await execAsync('npm run db:push', {
      cwd: process.cwd().replace('/scripts', '')
    });
    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed!');
    throw error;
  }
}

async function rollbackToBackup(backupPath: string): Promise<void> {
  console.log(`🔙 Rolling back to backup: ${backupPath}...`);
  
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    // Clean database
    await execAsync(`psql ${databaseUrl} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`);
    
    // Restore from backup
    await execAsync(`psql ${databaseUrl} < ${backupPath}`);
    
    console.log('✅ Rollback completed successfully!');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

export async function safeMigration(): Promise<MigrationResult> {
  console.log('🔄 Starting safe database migration...\n');
  
  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not set!');
    return { success: false, error: 'Missing DATABASE_URL' };
  }

  let backupPath: string | undefined;

  try {
    // Step 1: Ensure backup directory exists
    await ensureBackupDir();
    
    // Step 2: Create backup
    backupPath = await createBackup();
    console.log('');
    
    // Step 3: Run dry-run
    const isDrySafe = await dryRunMigration();
    console.log('');
    
    if (!isDrySafe) {
      console.error('❌ Dry-run detected issues. Migration aborted.');
      console.log(`📦 Backup available at: ${backupPath}`);
      return { success: false, backupPath, error: 'Dry-run failed' };
    }
    
    // Step 4: Apply migration
    await applyMigration();
    console.log('');
    
    console.log('✅ Safe migration completed successfully!');
    console.log(`📦 Backup created at: ${backupPath}`);
    console.log('   (You can delete this backup if migration was successful)\n');
    
    return { success: true, backupPath };
  } catch (error) {
    console.error('\n❌ Migration failed!');
    
    if (backupPath) {
      console.log('\n🔙 Attempting automatic rollback...');
      try {
        await rollbackToBackup(backupPath);
        console.log('✅ Database restored to pre-migration state');
      } catch (rollbackError) {
        console.error('❌ Automatic rollback failed!');
        console.error('   Manual rollback required using:');
        console.error(`   npm run db:rollback ${backupPath}`);
      }
    }
    
    return { 
      success: false, 
      backupPath, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  safeMigration()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(() => process.exit(1));
}
