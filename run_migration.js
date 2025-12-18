const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync('./server/migrations/fix_venue_group_types.sql', 'utf8');
    console.log('Running migration...');
    const result = await client.query(sql);
    console.log('Migration completed successfully!');
    console.log('Result:', result);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
