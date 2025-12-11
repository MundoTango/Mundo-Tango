import { db } from './server/db/index';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';

async function runMigration() {
  try {
    const migrationSQL = fs.readFileSync('./server/migrations/fix_venue_group_types.sql', 'utf8');
    console.log('Running migration: fix_venue_group_types.sql');
    
    await db.execute(sql.raw(migrationSQL));
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
