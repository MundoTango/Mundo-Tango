#!/usr/bin/env tsx
// ============================================================================
// DATABASE DRY-RUN SCRIPT - Mundo Tango
// ============================================================================
// Performs a dry-run of database migrations to detect potential issues
// Run: tsx scripts/db-dry-run.ts
// ============================================================================

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function dryRunMigration(): Promise<boolean> {
  console.log('🧪 Running migration dry-run...\n');
  
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not set!');
      return false;
    }

    // Run drizzle-kit push with dry-run flag
    const { stdout, stderr } = await execAsync('drizzle-kit push --force', {
      env: { ...process.env, DRIZZLE_DRY_RUN: 'true' },
      cwd: process.cwd().replace('/scripts', '')
    });
    
    console.log('📋 Dry-run output:');
    console.log(stdout);
    
    if (stderr) {
      console.log('⚠️  Warnings/Errors:');
      console.log(stderr);
    }
    
    // Check for data loss warnings
    const output = stdout.toLowerCase();
    const hasDataLoss = output.includes('data loss') || 
                        output.includes('drop') || 
                        output.includes('delete');
    const hasWarnings = output.includes('warning') || stderr.length > 0;
    
    if (hasDataLoss) {
      console.error('\n⚠️  CRITICAL: Migration may cause data loss!');
      console.error('   Review the changes carefully before proceeding.');
      return false;
    }
    
    if (hasWarnings) {
      console.warn('\n⚠️  Migration has warnings.');
      console.warn('   Review the output above before proceeding.');
      return false;
    }
    
    console.log('\n✅ Dry-run completed successfully!');
    console.log('   No data loss or critical warnings detected.');
    return true;
  } catch (error) {
    console.error('\n❌ Dry-run failed:', error);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  dryRunMigration()
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}
