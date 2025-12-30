import { MrBlueInternalExecutor } from '../services/mrBlue/MrBlueInternalExecutor';

async function triggerMrBlue() {
  const executor = new MrBlueInternalExecutor();
  
  console.log('\n🔵 [Mr Blue] Starting Pattern 101 Task: Add getConversationById function\n');
  
  const result = await executor.executeTask({
    bugId: 'p101-add-getconv',
    description: 'Add the getConversationById function that is being used but not defined',
    targetFiles: ['server/routes/message-routes.ts'],
    fixPlan: `Add getConversationById function to message-routes.ts:
      1. Import conversations table from @shared/schema
      2. Add an async function getConversationById(id) that queries the db
      3. The function should: db.select().from(conversations).where(eq(conversations.id, parseInt(id))).limit(1)
      4. Return the first result or null
      5. Place the function definition before the routes that use it`,
    context: [
      'conversations table is in @shared/schema',
      'The function should take id as string and parse it to number for the query',
      'Return null if no conversation found',
      'Already have db and eq imported'
    ],
  });
  
  console.log('\n🔵 [Mr Blue] Task Result:', JSON.stringify(result, null, 2));
  return result;
}

triggerMrBlue().catch(console.error);
