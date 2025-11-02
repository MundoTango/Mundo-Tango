import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 10;

async function createTestUsers() {
  const testPassword = "TestPassword123!";
  const hashedPassword = await bcrypt.hash(testPassword, BCRYPT_ROUNDS);
  
  console.log("Test User Credentials:");
  console.log("======================");
  console.log("Email: superadmin@test.com");
  console.log("Password: TestPassword123!");
  console.log("Hashed Password:", hashedPassword);
}

createTestUsers();
