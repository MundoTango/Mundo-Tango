/**
 * Test connection to old DATABASE_URL (Neon)
 */
import pg from 'pg';

async function testConnection() {
  const oldDbUrl = process.env.DATABASE_URL;
  console.log('Attempting connection to DATABASE_URL...');
  console.log('Host pattern:', oldDbUrl?.match(/@([^:\/]+)/)?.[1] || 'unknown');

  const client = new pg.Client({ 
    connectionString: oldDbUrl, 
    connectionTimeoutMillis: 15000 
  });

  try {
    await client.connect();
    console.log('✅ Connected to old database!');
    
    // Check what tables exist
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('\nTables found:', tables.rows.map(r => r.table_name).join(', '));
    
    // Check user counts
    const users = await client.query('SELECT COUNT(*) as count FROM users');
    console.log('\nUsers:', users.rows[0].count);
    
    // Check for admin user
    const admin = await client.query("SELECT id, email, name, bio FROM users WHERE email = 'admin@mundotango.life' LIMIT 1");
    if (admin.rows.length > 0) {
      console.log('Admin found:', admin.rows[0]);
    } else {
      console.log('Admin user not found in old database');
    }
    
    // Check posts count
    try {
      const posts = await client.query('SELECT COUNT(*) as count FROM posts');
      console.log('Posts:', posts.rows[0].count);
    } catch (e) {
      console.log('Posts table not found or error');
    }
    
    await client.end();
    console.log('\n✅ Old database is accessible - data migration is possible!');
  } catch (e: any) {
    console.log('❌ Connection failed:', e.message);
    if (e.message.includes('endpoint')) {
      console.log('\n⚠️ The Neon endpoint appears to be disabled.');
      console.log('To recover your data, please:');
      console.log('1. Log into console.neon.tech');
      console.log('2. Find the MundoTango project');
      console.log('3. Re-enable the endpoint or restore from a backup');
    }
  }
  
  process.exit(0);
}

testConnection();
