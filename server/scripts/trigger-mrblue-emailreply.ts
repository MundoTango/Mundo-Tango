import { MrBlueInternalExecutor } from '../services/MrBlueInternalExecutor';

async function triggerMrBlue() {
  const executor = new MrBlueInternalExecutor();
  
  console.log('\n🔵 [Mr Blue] Starting Pattern 101 Task: Implement email reply flow\n');
  
  const result = await executor.executeTask({
    bugId: 'p101-email-reply-flow',
    description: 'Create email reply service for pro users to reply to non-member contacts via Resend',
    targetFiles: [
      'server/services/emailReplyService.ts',
      'server/routes/message-routes.ts'
    ],
    fixPlan: `Create email reply flow for non-member contacts:
      1. Create new file server/services/emailReplyService.ts with:
         - Import Resend from 'resend' (already installed)
         - Function sendReplyEmail(options: { to: string, from: string, subject: string, body: string })
         - Use process.env.RESEND_API_KEY for authentication
         - Return success/error status
      
      2. Add endpoint to message-routes.ts:
         - POST /api/messages/:id/reply-external for replying to external contacts
         - Get the conversation, check if it has externalContactEmail
         - Get the pro user's proPageContactEmail as the 'from' address
         - Call emailReplyService.sendReplyEmail()
         - Update message status after sending`,
    context: [
      'Resend npm package is already installed',
      'RESEND_API_KEY is available in environment',
      'Users table has proPageContactEmail column for the from address',
      'Messages have externalContactEmail for non-member contacts',
      'Use ESM import: import { Resend } from "resend"'
    ],
  });
  
  console.log('\n🔵 [Mr Blue] Task Result:', JSON.stringify(result, null, 2));
  return result;
}

triggerMrBlue().catch(console.error);
