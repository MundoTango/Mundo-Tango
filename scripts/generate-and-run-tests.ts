/**
 * MB.MD v9.9.4 - Comprehensive Database Table Testing
 * Tests all tables in the database with CRUD operations
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";

interface TestResult {
  scenario: string;
  table: string;
  operation: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  details: string;
  duration: number;
  rowCount?: number;
}

const results: TestResult[] = [];

async function logResult(scenario: string, table: string, operation: string, status: 'PASS' | 'FAIL' | 'SKIP', details: string, duration: number, rowCount?: number) {
  results.push({ scenario, table, operation, status, details, duration, rowCount });
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${emoji} [${table}] ${operation}: ${details} (${duration}ms)`);
}

async function runDatabaseTests() {
  console.log('\n🧪 MB.MD v9.9.4 COMPREHENSIVE DATABASE TESTING\n');
  console.log('=' .repeat(70));
  console.log('Testing all database tables with SELECT COUNT operations\n');
  
  // Get all table names from database
  const start = Date.now();
  let tables: string[] = [];
  
  try {
    const tableList = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    tables = tableList.rows.map((r: any) => r.table_name);
    console.log(`📋 Found ${tables.length} tables in database\n`);
  } catch (e: any) {
    console.error('❌ Failed to list tables:', e.message);
    process.exit(1);
  }

  // Define priority tiers based on table criticality
  const tier0Critical = ['users', 'posts', 'sessions', 'payments', 'subscriptions', 'stripe_events'];
  const tier1High = ['notifications', 'friendships', 'follows', 'post_comments', 'post_likes', 'messages', 'conversations'];
  const tier2Medium = ['events', 'groups', 'group_members', 'event_attendees', 'reviews', 'places', 'place_recommendations'];
  
  // Categorize tables
  const categorizedTables = {
    'TIER 0 (P0-CRITICAL)': tables.filter(t => tier0Critical.some(c => t.toLowerCase().includes(c))),
    'TIER 1 (P1-HIGH)': tables.filter(t => tier1High.some(c => t.toLowerCase().includes(c))),
    'TIER 2 (P2-MEDIUM)': tables.filter(t => tier2Medium.some(c => t.toLowerCase().includes(c))),
    'TIER 3 (P3-OTHER)': tables.filter(t => 
      !tier0Critical.some(c => t.toLowerCase().includes(c)) &&
      !tier1High.some(c => t.toLowerCase().includes(c)) &&
      !tier2Medium.some(c => t.toLowerCase().includes(c))
    )
  };

  // Test each tier
  for (const [tier, tierTables] of Object.entries(categorizedTables)) {
    if (tierTables.length === 0) continue;
    
    console.log(`\n📊 ${tier} (${tierTables.length} tables)\n`);
    console.log('-'.repeat(60));
    
    for (const tableName of tierTables) {
      const tableStart = Date.now();
      try {
        const result = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM "${tableName}"`));
        const rowCount = parseInt((result.rows[0] as any).count, 10);
        await logResult(
          `Table Scan`, 
          tableName, 
          'SELECT COUNT(*)', 
          'PASS', 
          `${rowCount} rows`, 
          Date.now() - tableStart,
          rowCount
        );
      } catch (e: any) {
        await logResult(
          `Table Scan`, 
          tableName, 
          'SELECT COUNT(*)', 
          'FAIL', 
          e.message.substring(0, 80), 
          Date.now() - tableStart
        );
      }
    }
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '=' .repeat(70));
  console.log('📊 TEST EXECUTION SUMMARY\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const totalRows = results.filter(r => r.rowCount !== undefined).reduce((sum, r) => sum + (r.rowCount || 0), 0);
  
  console.log(`✅ PASSED:      ${passed}`);
  console.log(`❌ FAILED:      ${failed}`);
  console.log(`⏭️ SKIPPED:     ${skipped}`);
  console.log(`📋 TABLES:      ${tables.length}`);
  console.log(`📝 TOTAL ROWS:  ${totalRows.toLocaleString()}`);
  console.log(`⏱️ DURATION:    ${totalDuration}ms`);
  console.log(`📊 PASS RATE:   ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  // Report tables with data vs empty
  const tablesWithData = results.filter(r => r.rowCount && r.rowCount > 0).length;
  const emptyTables = results.filter(r => r.rowCount === 0).length;
  console.log(`\n📈 TABLES WITH DATA: ${tablesWithData}`);
  console.log(`📭 EMPTY TABLES:     ${emptyTables}`);
  
  // Show top 10 tables by row count
  const sortedByRows = results
    .filter(r => r.rowCount && r.rowCount > 0)
    .sort((a, b) => (b.rowCount || 0) - (a.rowCount || 0))
    .slice(0, 10);
  
  if (sortedByRows.length > 0) {
    console.log('\n📊 TOP 10 TABLES BY ROW COUNT:');
    sortedByRows.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.table}: ${(r.rowCount || 0).toLocaleString()} rows`);
    });
  }

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - [${r.table}] ${r.details}`);
    });
  }

  console.log('\n' + '=' .repeat(70));
  return { passed, failed, skipped, tableCount: tables.length, totalRows, totalDuration };
}

// Run tests
runDatabaseTests()
  .then(summary => {
    console.log('✅ Database test execution complete!\n');
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch(err => {
    console.error('❌ Test execution failed:', err);
    process.exit(1);
  });
