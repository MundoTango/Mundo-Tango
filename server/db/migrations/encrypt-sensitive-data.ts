/**
 * Migration Script: Encrypt Sensitive Data (P0 #8)
 * 
 * This script migrates existing plaintext data to encrypted format for compliance
 * with GDPR and HIPAA requirements.
 * 
 * NOTE: Since these are new tables with encryptedData columns, this script is
 * primarily a template for future migrations if data needs to be moved from
 * plaintext columns to encrypted columns.
 * 
 * Usage: tsx server/db/migrations/encrypt-sensitive-data.ts
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import {
  financialGoals,
  budgetEntries,
  budgetCategories,
  healthGoals,
  healthMetrics,
  nutritionLogs,
  fitnessActivities,
  userPayments,
} from "@shared/schema";
import { encryptObject } from "../utils/encryption";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sqlClient = neon(process.env.DATABASE_URL);
const db = drizzle(sqlClient);

interface MigrationStats {
  table: string;
  recordsProcessed: number;
  recordsMigrated: number;
  errors: number;
}

async function migrateTable(
  tableName: string,
  table: any,
  encryptionMapper: (record: any) => any
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    table: tableName,
    recordsProcessed: 0,
    recordsMigrated: 0,
    errors: 0,
  };

  try {
    console.log(`\n[${tableName}] Starting migration...`);
    
    // Fetch all records (if this table exists and has plaintext data to migrate)
    const records = await db.select().from(table);
    stats.recordsProcessed = records.length;
    
    if (records.length === 0) {
      console.log(`[${tableName}] No records to migrate (table may be new)`);
      return stats;
    }

    console.log(`[${tableName}] Found ${records.length} records`);

    // Process each record
    for (const record of records) {
      try {
        // Check if already encrypted
        if (record.encryptedData && record.encryptedData.includes(':')) {
          console.log(`[${tableName}] Record ${record.id} already encrypted, skipping`);
          continue;
        }

        // Extract sensitive data and encrypt
        const sensitiveData = encryptionMapper(record);
        const encryptedData = encryptObject(sensitiveData);

        // Update record with encrypted data
        await db.update(table)
          .set({ 
            encryptedData,
            updatedAt: new Date() // Update timestamp if available
          })
          .where(eq(table.id, record.id));

        stats.recordsMigrated++;
        console.log(`[${tableName}] ✓ Migrated record ${record.id}`);
      } catch (error) {
        stats.errors++;
        console.error(`[${tableName}] ✗ Error migrating record ${record.id}:`, error);
      }
    }

    console.log(`[${tableName}] Migration complete: ${stats.recordsMigrated}/${stats.recordsProcessed} records migrated`);
  } catch (error) {
    console.error(`[${tableName}] Fatal error during migration:`, error);
    stats.errors++;
  }

  return stats;
}

async function runMigration() {
  console.log('='.repeat(60));
  console.log('  ENCRYPTION AT REST MIGRATION (P0 #8)');
  console.log('='.repeat(60));
  console.log('\nThis script encrypts sensitive data in 8 tables:');
  console.log('  1. Financial Goals');
  console.log('  2. Budget Entries');
  console.log('  3. Budget Categories');
  console.log('  4. Health Goals');
  console.log('  5. Health Metrics');
  console.log('  6. Nutrition Logs');
  console.log('  7. Fitness Activities');
  console.log('  8. User Payments');
  console.log('');

  const allStats: MigrationStats[] = [];

  // Migrate Financial Goals
  allStats.push(await migrateTable(
    'financial_goals',
    financialGoals,
    (record) => ({
      targetAmount: record.targetAmount || 0,
      currentAmount: record.currentAmount || 0,
      currency: record.currency || 'USD',
      notes: record.notes || '',
      milestones: record.milestones || [],
    })
  ));

  // Migrate Budget Entries
  allStats.push(await migrateTable(
    'budget_entries',
    budgetEntries,
    (record) => ({
      amount: record.amount || 0,
      currency: record.currency || 'USD',
      description: record.description || '',
      notes: record.notes || '',
    })
  ));

  // Migrate Budget Categories
  allStats.push(await migrateTable(
    'budget_categories',
    budgetCategories,
    (record) => ({
      monthlyLimit: record.monthlyLimit || 0,
      yearlyTarget: record.yearlyTarget || 0,
      notes: record.notes || '',
    })
  ));

  // Migrate Health Goals
  allStats.push(await migrateTable(
    'health_goals',
    healthGoals,
    (record) => ({
      targetWeight: record.targetWeight || 0,
      currentWeight: record.currentWeight || 0,
      bmi: record.bmi || 0,
      bodyFat: record.bodyFat || 0,
      measurements: record.measurements || {},
      notes: record.notes || '',
    })
  ));

  // Migrate Health Metrics
  allStats.push(await migrateTable(
    'health_metrics',
    healthMetrics,
    (record) => ({
      value: record.value || 0,
      unit: record.unit || '',
      notes: record.notes || '',
      additionalData: record.additionalData || {},
    })
  ));

  // Migrate Nutrition Logs
  allStats.push(await migrateTable(
    'nutrition_logs',
    nutritionLogs,
    (record) => ({
      calories: record.calories || 0,
      protein: record.protein || 0,
      carbs: record.carbs || 0,
      fat: record.fat || 0,
      fiber: record.fiber || 0,
      sugar: record.sugar || 0,
      notes: record.notes || '',
    })
  ));

  // Migrate Fitness Activities
  allStats.push(await migrateTable(
    'fitness_activities',
    fitnessActivities,
    (record) => ({
      distance: record.distance || 0,
      pace: record.pace || 0,
      heartRate: record.heartRate || 0,
      calories: record.calories || 0,
      notes: record.notes || '',
      route: record.route || null,
    })
  ));

  // Migrate User Payments
  allStats.push(await migrateTable(
    'user_payments',
    userPayments,
    (record) => ({
      amount: record.amount || 0,
      currency: record.currency || 'USD',
      description: record.description || '',
      metadata: record.metadata || {},
      billingDetails: record.billingDetails || {},
    })
  ));

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('  MIGRATION SUMMARY');
  console.log('='.repeat(60));
  
  let totalProcessed = 0;
  let totalMigrated = 0;
  let totalErrors = 0;

  console.log('\nTable                     | Processed | Migrated | Errors');
  console.log('-'.repeat(60));
  
  for (const stats of allStats) {
    console.log(
      `${stats.table.padEnd(25)} | ${stats.recordsProcessed.toString().padStart(9)} | ${stats.recordsMigrated.toString().padStart(8)} | ${stats.errors.toString().padStart(6)}`
    );
    totalProcessed += stats.recordsProcessed;
    totalMigrated += stats.recordsMigrated;
    totalErrors += stats.errors;
  }

  console.log('-'.repeat(60));
  console.log(
    `${'TOTAL'.padEnd(25)} | ${totalProcessed.toString().padStart(9)} | ${totalMigrated.toString().padStart(8)} | ${totalErrors.toString().padStart(6)}`
  );
  console.log('='.repeat(60));

  if (totalErrors > 0) {
    console.log(`\n⚠️  Migration completed with ${totalErrors} error(s)`);
    console.log('Please review the errors above and retry if necessary.');
    process.exit(1);
  } else {
    console.log('\n✓ Migration completed successfully!');
    console.log(`\nEncrypted ${totalMigrated} sensitive records across 8 tables.`);
    console.log('All sensitive data is now protected with AES-256-GCM encryption.');
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('\nMigration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  });
