/**
 * Setup Test User Script
 * Creates god-level admin user for Playwright tests using secure env vars
 */
import { db } from "@shared/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function setupTestUser() {
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD must be set in Replit Secrets");
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists by email OR username
    const [existingByEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const [existingByUsername] = await db.select().from(users).where(eq(users.username, "testadmin")).limit(1);

    if (existingByEmail || existingByUsername) {
      const existing = existingByEmail || existingByUsername!;
      
      // Update to super_admin and sync credentials
      await db.update(users)
        .set({
          email,
          password: hashedPassword,
          role: "super_admin",
          isVerified: true,
          isActive: true,
        })
        .where(eq(users.id, existing.id));

      console.log(`✅ Test user updated successfully!`);
      console.log(`   Email: ${email}`);
      console.log(`   Username: testadmin`);
      console.log(`   Role: super_admin`);
      console.log(`   ID: ${existing.id}`);
      return;
    }

    // Create new test user with unique username
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: "Test Admin",
      username: `testadmin_${Date.now()}`,
      role: "super_admin",
      tangoRole: "teacher",
      isVerified: true,
      isActive: true,
    }).returning();

    console.log(`✅ Test user created successfully!`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Username: ${newUser.username}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   ID: ${newUser.id}`);
  } catch (error) {
    console.error("❌ Error setting up test user:", error);
    process.exit(1);
  }

  process.exit(0);
}

setupTestUser();
