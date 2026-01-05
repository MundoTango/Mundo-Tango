import { db } from "../storage";
import { users } from "../../shared/schema";
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

async function migrate() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log("Fetching production users from Supabase...");
  const { data: prodUsers, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    console.error("Error fetching users:", error);
    process.exit(1);
  }

  console.log(`Found ${prodUsers?.length || 0} users in production.`);

  for (const u of (prodUsers || [])) {
    try {
      const existing = await db.query.users.findFirst({
        where: eq(users.email, u.email),
      });

      if (!existing) {
        console.log(`Migrating user: ${u.email}`);
        await db.insert(users).values({
          email: u.email,
          username: u.username || u.email.split('@')[0],
          name: u.name || u.username,
          password: u.password || 'MIGRATED_USER',
          role: u.role || 'user',
          isVerified: u.is_verified ?? true,
          isActive: u.is_active ?? true,
          profileImage: u.profile_image,
          createdAt: new Date(u.created_at),
        });
      } else {
        console.log(`User already exists: ${u.email}`);
      }
    } catch (e) {
      console.error(`Failed to migrate ${u.email}:`, e);
    }
  }

  console.log("Migration complete!");
}

migrate().catch(console.error);
