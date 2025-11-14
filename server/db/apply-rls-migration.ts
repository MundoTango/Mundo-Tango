/**
 * Apply RLS Migration Script
 * 
 * This script applies the additional RLS policies to the database.
 * Run with: tsx server/db/apply-rls-migration.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from '@shared/db';
import { sql } from 'drizzle-orm';

async function applyRLSMigration() {
  console.log('========================================');
  console.log('Applying Additional RLS Policies');
  console.log('========================================\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, 'migrations', '0002_add_missing_rls_policies.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log('📊 Executing SQL statements...\n');

    // Split by semicolons but keep CREATE POLICY statements together
    const statements = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.trim().startsWith('SELECT') && statement.includes('--')) {
        // Skip commented verification queries
        continue;
      }

      try {
        await db.execute(sql.raw(statement + ';'));
        successCount++;
        
        // Log what was executed
        if (statement.includes('ENABLE ROW LEVEL SECURITY')) {
          const tableName = statement.match(/ALTER TABLE (\w+)/)?.[1];
          console.log(`✅ Enabled RLS on: ${tableName}`);
        } else if (statement.includes('CREATE POLICY')) {
          const policyName = statement.match(/CREATE POLICY (\w+)/)?.[1];
          console.log(`✅ Created policy: ${policyName}`);
        }
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists')) {
          console.log(`⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`);
        } else {
          console.error(`❌ Error executing statement:`, error.message);
          console.error(`   Statement: ${statement.substring(0, 100)}...`);
          errorCount++;
        }
      }
    }

    console.log('\n========================================');
    console.log('Migration Complete');
    console.log('========================================');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}\n`);

    // Verify RLS status
    console.log('Verifying RLS status...\n');
    
    const rlsStatus = await db.execute(sql`
      SELECT 
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN (
          'financial_goals', 'health_goals', 'budget_entries',
          'nutrition_logs', 'events', 'user_settings', 
          'two_factor_secrets', 'host_venue_profiles'
        )
      ORDER BY tablename;
    `);

    console.log('RLS Status for New Tables:');
    console.table(rlsStatus.rows);

    // Count total policies
    const policyCount = await db.execute(sql`
      SELECT COUNT(*) as total_policies
      FROM pg_policies
      WHERE schemaname = 'public';
    `);

    console.log(`\n📊 Total RLS policies in database: ${policyCount.rows[0]?.total_policies || 0}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
applyRLSMigration()
  .then(() => {
    console.log('\n✅ All done! RLS policies have been applied.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
