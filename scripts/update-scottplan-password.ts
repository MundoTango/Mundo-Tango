import bcrypt from 'bcrypt';
import { db } from '../server/db/index';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function updateScottPlanPassword() {
  const newPassword = 'testpass123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.update(users)
    .set({ password: hashedPassword })
    .where(eq(users.email, 'scottplan@test.com'));

  console.log('✅ Updated scottplan@test.com password to testpass123');
  process.exit(0);
}

updateScottPlanPassword().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
