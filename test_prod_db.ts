import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing SUPABASE_URL or key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function queryUser(email: string) {
  console.log(`Searching for user: ${email}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  
  const { data, error } = await supabase
    .from("users")
    .select("id, email, username, name, role, waitlist, is_verified, is_active, suspended, created_at, last_login_at")
    .eq("email", email)
    .single();

  if (error) {
    console.log("Error:", error);
    return;
  }

  if (!data) {
    console.log(`User not found: ${email}`);
    return;
  }

  console.log("=== User Found in PRODUCTION Database ===");
  console.log(JSON.stringify(data, null, 2));
  
  console.log("\n=== Login Diagnosis ===");
  const canLogin = data.is_active && !data.suspended && data.is_verified;
  console.log("Can login:", canLogin ? "YES" : "NO");
  if (!data.is_active) console.log("Issue: Account is INACTIVE");
  if (data.suspended) console.log("Issue: Account is SUSPENDED");
  if (!data.is_verified) console.log("Issue: Email NOT VERIFIED");
  if (data.waitlist) console.log("Note: User is on WAITLIST (can still login)");
}

queryUser("mmllee@gmail.com");
