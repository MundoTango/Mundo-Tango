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
    console.log('🔍 Step 1: Validating token...');
    console.log('═'.repeat(70));
    const validation = await FacebookMessengerService.validateToken();
    
    if (!validation.isValid) {
      console.error('❌ Token validation failed');
      console.log('');
      console.log('Error:', validation.error);
      if (validation.details) {
        console.log('Details:', JSON.stringify(validation.details, null, 2));
      }
      console.log('');
      console.log('💡 Next steps:');
      console.log('   1. Check if FACEBOOK_PAGE_ACCESS_TOKEN is set correctly');
      console.log('   2. Verify token has required permissions: pages_messaging');
      console.log('   3. Token may be expired - regenerate at: https://developers.facebook.com/tools/explorer/');
      console.log('');
      process.exit(1);
    }

    console.log('✅ Token is valid');
    console.log('   App ID:', validation.appId);
    console.log('   User ID:', validation.userId);
    console.log('   Scopes:', validation.scopes?.join(', ') || 'None');
    console.log('   Expires:', validation.expiresAt ? validation.expiresAt.toISOString() : 'Never');
    console.log('');

    console.log('📝 Step 2: Generating invitation message...');
    console.log('═'.repeat(70));
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

    console.log('Message generated ✅');
    console.log('');

    console.log('📧 Step 3: Sending invitation via Facebook Messenger...');
    console.log('═'.repeat(70));
    console.log(`   To: ${TEST_RECIPIENT_EMAIL}`);
    console.log('');

    // Note: Facebook requires PSID (Page-Scoped ID), not email
    // We need to look up the PSID first
    console.log('⚠️  NOTE: Facebook Messenger requires Page-Scoped ID (PSID), not email');
    console.log('   Looking up PSID for email:', TEST_RECIPIENT_EMAIL);
    console.log('');

    const result = await FacebookMessengerService.sendMessage({
      recipientEmail: TEST_RECIPIENT_EMAIL,
      message: message
    });

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
