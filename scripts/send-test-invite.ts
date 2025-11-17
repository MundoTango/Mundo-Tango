/**
 * SEND TEST FACEBOOK MESSENGER INVITE
 * Sends a test invite to sboddye@gmail.com via Facebook Messenger
 */

import { FacebookMessengerService } from '../server/services/facebook/FacebookMessengerService';

const TEST_RECIPIENT_EMAIL = 'sboddye@gmail.com';
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID || '122157503636969453';
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

async function sendTestInvite() {
  console.log('📧 SENDING TEST FACEBOOK MESSENGER INVITE');
  console.log('═'.repeat(70));
  console.log('');
  console.log('📋 Configuration:');
  console.log(`   Recipient: ${TEST_RECIPIENT_EMAIL}`);
  console.log(`   Page ID: ${FACEBOOK_PAGE_ID}`);
  console.log(`   Token: ${FACEBOOK_PAGE_ACCESS_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log('');

  if (!FACEBOOK_PAGE_ACCESS_TOKEN) {
    console.error('❌ FACEBOOK_PAGE_ACCESS_TOKEN not found in environment');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Run: npx tsx scripts/generate-facebook-token-robust.ts');
    console.log('   2. Add token to Replit Secrets');
    console.log('   3. Try again');
    console.log('');
    process.exit(1);
  }

  try {
    const messenger = new FacebookMessengerService({
      pageId: FACEBOOK_PAGE_ID,
      accessToken: FACEBOOK_PAGE_ACCESS_TOKEN
    });

    console.log('🔍 Step 1: Validating token...');
    const isValid = await messenger.validateToken();
    
    if (!isValid) {
      console.error('❌ Token validation failed');
      console.log('');
      console.log('💡 Token may be expired or invalid');
      console.log('   Run: npx tsx scripts/test-facebook-token.ts');
      console.log('');
      process.exit(1);
    }

    console.log('   ✅ Token is valid');
    console.log('');

    console.log('📝 Step 2: Generating invitation message...');
    const message = `Hi! 👋

You're invited to join Mundo Tango - the premier platform for the global tango community!

🌟 What's Mundo Tango?
- Connect with tango dancers worldwide
- Discover events, workshops, and milongas
- Find teachers and share your passion

This is a test invite from our automated system powered by Mr. Blue AI Partner.

Visit: mundotango.life

Best regards,
The Mundo Tango Team`;

    console.log('');
    console.log('📧 Step 3: Sending invitation via Facebook Messenger...');
    console.log(`   To: ${TEST_RECIPIENT_EMAIL}`);
    console.log('');

    const result = await messenger.sendMessage(
      TEST_RECIPIENT_EMAIL,
      message
    );

    if (result.success) {
      console.log('═'.repeat(70));
      console.log('✅ SUCCESS! Invitation sent');
      console.log('═'.repeat(70));
      console.log('');
      console.log('📊 Details:');
      console.log(`   Message ID: ${result.messageId || 'N/A'}`);
      console.log(`   Recipient: ${TEST_RECIPIENT_EMAIL}`);
      console.log(`   Timestamp: ${new Date().toLocaleString()}`);
      console.log('');
      console.log('💡 Next: Check sboddye@gmail.com Facebook messages');
      console.log('');
    } else {
      console.log('═'.repeat(70));
      console.log('❌ FAILED: Could not send invitation');
      console.log('═'.repeat(70));
      console.log('');
      console.log('Error:', result.error || 'Unknown error');
      console.log('');
      console.log('💡 Troubleshooting:');
      console.log('   1. Verify token permissions (pages_messaging)');
      console.log('   2. Check if recipient has Facebook account');
      console.log('   3. Review rate limits (5/day, 1/hour)');
      console.log('');
    }

  } catch (error: any) {
    console.log('═'.repeat(70));
    console.log('❌ ERROR');
    console.log('═'.repeat(70));
    console.log('');
    console.log(error.message);
    console.log('');
    process.exit(1);
  }
}

sendTestInvite();
