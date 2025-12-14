import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

console.log('📦 Connecting to database...');
await client.connect();

console.log('⚙️  Adding missing columns to scraped_events table...');

try {
  await client.query(`
    ALTER TABLE scraped_events 
    ADD COLUMN IF NOT EXISTS city VARCHAR(255),
    ADD COLUMN IF NOT EXISTS country VARCHAR(255),
    ADD COLUMN IF NOT EXISTS group_id INTEGER
  `);
  
  console.log('✅ Columns added successfully!');
  console.log('   - city VARCHAR(255)');
  console.log('   - country VARCHAR(255)');
  console.log('   - group_id INTEGER');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  await client.end();
}
