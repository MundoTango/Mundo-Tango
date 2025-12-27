import pg from "pg";
const { Pool } = pg;

const PROD_URL = process.env.SUPABASE_DATABASE_URL;
if (!PROD_URL) {
  console.log("SUPABASE_DATABASE_URL not set");
  process.exit(1);
}

async function queryUser(email: string) {
  const pool = new Pool({
    connectionString: PROD_URL,
    ssl: { rejectUnauthorized: false },
  });
  
  try {
    const result = await pool.query(
      `SELECT id, email, username, name, role, waitlist, is_verified, is_active, suspended, created_at, last_login_at 
       FROM users 
       WHERE email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log(`User not found: ${email}`);
    } else {
      console.log("=== User Found in PRODUCTION Database ===");
      console.log(JSON.stringify(result.rows[0], null, 2));
      
      // Diagnose login issues
      const user = result.rows[0];
      console.log("\n=== Login Diagnosis ===");
      console.log("Can login:", user.is_active && !user.suspended && user.is_verified ? "YES" : "NO");
      if (!user.is_active) console.log("Issue: Account is INACTIVE");
      if (user.suspended) console.log("Issue: Account is SUSPENDED");
      if (!user.is_verified) console.log("Issue: Email NOT VERIFIED");
      if (user.waitlist) console.log("Note: User is on WAITLIST (can still login)");
    }
  } finally {
    await pool.end();
  }
}

queryUser("mmllee@gmail.com");
