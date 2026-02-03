import { MrBlueInternalExecutor } from '../services/MrBlueInternalExecutor';

async function triggerMrBlue() {
  const executor = new MrBlueInternalExecutor();
  
  console.log('\n🔵 [Mr Blue] Starting Pattern 101 Task: Fix message-routes.ts issues\n');
  
  const result = await executor.executeTask({
    bugId: 'p101-fix-message-routes',
    description: 'Fix message-routes.ts that has broken routes',
    targetFiles: ['server/routes/message-routes.ts'],
    fixPlan: `Fix the message-routes.ts file:
      1. Change router path from '/api/messages/:id/reply-external' to '/:id/reply-external' (this is a router, not the main app)
      2. Import getConversationById from messageController or create a simple implementation
      3. Get the user's proPageContactEmail from the database instead of hardcoded env var
      4. Import db and eq from drizzle if needed
      5. Ensure the router doesn't break existing /messages routes`,
    context: [
      'This is an Express router, not the main app, so route paths should be relative',
      'The router is mounted at /api/messages in the main routes',
      'The existing routes /messages and /messages POST should work',
      'getConversationById function may not exist - may need to query db directly'
    ],
  });
  
  console.log('\n🔵 [Mr Blue] Task Result:', JSON.stringify(result, null, 2));
  return result;
}

triggerMrBlue().catch(console.error);
