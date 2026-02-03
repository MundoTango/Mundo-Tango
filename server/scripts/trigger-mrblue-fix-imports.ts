import { MrBlueInternalExecutor } from '../services/MrBlueInternalExecutor';

async function triggerMrBlue() {
  const executor = new MrBlueInternalExecutor();
  
  console.log('\n🔵 [Mr Blue] Starting Pattern 101 Task: Fix message-routes.ts imports\n');
  
  const result = await executor.executeTask({
    bugId: 'p101-fix-imports',
    description: 'Fix incorrect imports in message-routes.ts',
    targetFiles: ['server/routes/message-routes.ts'],
    fixPlan: `Fix the imports in message-routes.ts:
      1. Change 'import { db, eq } from "drizzle-orm"' to:
         - import { db } from "../db"
         - import { eq } from "drizzle-orm"
         - import { users } from "@shared/schema"
      2. Fix the db.select query to use proper Drizzle syntax:
         - Change from: db.select('proPageContactEmail').from('users').where(eq('id', conversation.userId))
         - To: db.select({ proPageContactEmail: users.proPageContactEmail }).from(users).where(eq(users.id, conversation.userId))
      3. Extract the actual email from the query result (it returns an array)
      4. If getConversationById doesn't exist, remove it from import and create a stub that queries db`,
    context: [
      'db is exported from server/db.ts, not drizzle-orm',
      'eq is exported from drizzle-orm',
      'users table is defined in @shared/schema (which is shared/schema.ts)',
      'Drizzle select syntax: db.select({ field: table.field }).from(table).where(...)',
      'getConversationById may not exist in messageController - check and handle appropriately'
    ],
  });
  
  console.log('\n🔵 [Mr Blue] Task Result:', JSON.stringify(result, null, 2));
  return result;
}

triggerMrBlue().catch(console.error);
