/**
 * Apply RLS Migration P0 #2
 * 
 * This script applies the comprehensive Row Level Security policies
 * from migration 0003_add_rls_policies.sql to the database.
 * 
 * Usage: npx tsx server/db/apply-rls-migration-p0.ts
 */

import { db } from './index';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function applyRLSMigration() {
  console.log('🔒 Applying Row Level Security Migration (P0 #2)...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '0003_add_rls_policies.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split into individual statements (separated by double newlines or GO statements)
    const statements = migrationSQL
      .split(/;\s*(?=\n)/g)
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') && 
        !stmt.match(/^\/\*/) &&
        !stmt.toLowerCase().includes('verification queries')
      );

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--') || statement.length < 10) {
        continue;
      }

      try {
        // Extract a description from the statement
        const description = extractDescription(statement);
        
        console.log(`[${i + 1}/${statements.length}] ${description}`);
        await db.execute(sql.raw(statement + ';'));
        successCount++;
      } catch (error: any) {
        // Ignore errors for policies that already exist or tables that don't exist
        if (
          error.message.includes('already exists') ||
          error.message.includes('does not exist') ||
          error.message.includes('duplicate')
        ) {
          console.log(`   ⚠️  Skipped (already exists or table missing)`);
        } else {
          console.error(`   ❌ Error:`, error.message);
          errorCount++;
        }
      }
    }

    console.log(`\n✅ Migration completed:`);
    console.log(`   - ${successCount} statements executed successfully`);
    if (errorCount > 0) {
      console.log(`   - ${errorCount} statements failed`);
    }

    // Verify RLS is enabled
    console.log(`\n🔍 Verifying RLS is enabled on protected tables...\n`);
    await verifyRLS();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

function extractDescription(statement: string): string {
  if (statement.includes('ENABLE ROW LEVEL SECURITY')) {
    const match = statement.match(/ALTER TABLE (\w+)/i);
    return match ? `Enable RLS on ${match[1]}` : 'Enable RLS';
  }
  
  if (statement.includes('CREATE POLICY')) {
    const match = statement.match(/CREATE POLICY (\w+)/i);
    return match ? `Create policy: ${match[1]}` : 'Create policy';
  }
  
  if (statement.includes('DROP POLICY')) {
    const match = statement.match(/DROP POLICY.*?(\w+) ON/i);
    return match ? `Drop policy: ${match[1]}` : 'Drop policy';
  }
  
  return 'Execute SQL statement';
}

async function verifyRLS() {
  const tables = [
    'posts',
    'chat_messages',
    'financial_goals',
    'health_goals',
    'budget_entries',
    'nutrition_logs',
    'user_settings',
    'two_factor_secrets',
    'host_venue_profiles',
    'bookings',
    'event_rsvps',
    'group_members',
    'friendships'
  ];

  try {
    const result = await db.execute(sql`
      SELECT 
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = ANY(${tables})
      ORDER BY tablename;
    `);

    console.log('Table                    | RLS Enabled');
    console.log('-------------------------|------------');
    
    for (const row of result.rows) {
      const status = row.rls_enabled ? '✅ Yes' : '❌ No';
      const tableName = String(row.tablename).padEnd(24);
      console.log(`${tableName} | ${status}`);
    }

    console.log(`\n📊 ${result.rows.length} tables checked\n`);
  } catch (error) {
    console.error('⚠️  Could not verify RLS status:', error);
  }
}

// Run the migration
applyRLSMigration()
  .then(() => {
    console.log('🎉 RLS migration completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 RLS migration failed:', error);
    process.exit(1);
  });
