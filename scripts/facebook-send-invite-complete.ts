#!/usr/bin/env tsx

/**
 * FACEBOOK SEND INVITE - COMPLETE END-TO-END FLOW
 * 
 * This script demonstrates the complete flow for sending Mundo Tango invites via Facebook Messenger.
 * Following MB.MD Pattern 32: Facebook Messenger Expert Agent
 * 
 * Prerequisites:
 * 1. Valid FACEBOOK_PAGE_ACCESS_TOKEN in secrets
 * 2. User has messaged the page (PSID captured via webhook)
 */

import { FacebookMessengerService } from '../server/services/facebook/FacebookMessengerService';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

const MUNDO_TANGO_INVITE_MESSAGE = `🎊 You're Invited to Mundo Tango! 🎊

Hi! We're excited to invite you to join Mundo Tango - the premier platform connecting the global tango community.

🌟 What is Mundo Tango?

✨ Connect with tango dancers worldwide
🎭 Discover events, milongas, and workshops
👨‍🏫 Find teachers and share your passion
💃 Join a community that celebrates authentic connections

🤖 Powered by Mr. Blue AI Partner - your intelligent assistant for all things tango!

🔗 Get Started: https://mundotango.life

Ready to join the dance? Click the link above to create your account and become part of something special.

Abrazo,
The Mundo Tango Team

P.S. This platform is built to reverse the negative impacts of social media - fostering real connections, not silos. Join us in changing the world, one dance at a time. 🌍`;

async function main() {
  const recipientEmail = process.argv[2];
  
  if (!recipientEmail) {
    console.error('\n❌ Usage: npx tsx scripts/facebook-send-invite-complete.ts <EMAIL>\n');
    console.log('Example: npx tsx scripts/facebook-send-invite-complete.ts sboddye@gmail.com\n');
    process.exit(1);
  }
  
  console.log('\n🎯 MUNDO TANGO FACEBOOK INVITE - COMPLETE FLOW');
  console.log('═'.repeat(70));
  console.log(`\n📧 Sending invite to: ${recipientEmail}\n`);
  
  // STEP 1: Validate token
  console.log('📋 STEP 1: Validating Facebook token...');
  console.log('─'.repeat(70));
  
  const tokenValidation = await FacebookMessengerService.validateToken();
  
  if (!tokenValidation.isValid) {
    console.error('❌ Token validation failed!\n');
    console.log('Error:', tokenValidation.error);
    console.log('\n💡 Fix: Run npx tsx scripts/facebook-get-token-simple.ts\n');
    process.exit(1);
  }
  
  console.log('✅ Token is valid');
  console.log(`   Expires: ${tokenValidation.expiresAt ? tokenValidation.expiresAt.toISOString() : 'Never'}\n`);
  
  // STEP 2: Look up PSID from database
  console.log('📋 STEP 2: Looking up PSID from database...');
  console.log('─'.repeat(70));
  
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, recipientEmail))
    .limit(1);
  
  if (user.length === 0) {
    console.error(`❌ User not found in database: ${recipientEmail}\n`);
    console.log('💡 User needs to create an account first at: https://mundotango.life\n');
    process.exit(1);
  }
  
  const psid = user[0].facebookPSID;
  
  if (!psid) {
    console.log('⚠️  No PSID found for this user\n');
    console.log('The user needs to message your Facebook page first.\n');
    console.log('SOLUTION: Share this link with them:');
    console.log(`   https://m.me/mundotango1?ref=${encodeURIComponent(recipientEmail)}\n`);
    console.log('When they click the link and send a message:');
    console.log('  1. Webhook captures their PSID automatically');
    console.log('  2. PSID gets stored in database');
    console.log('  3. Then you can send them messages\n');
    console.log('📝 Manual alternative:');
    console.log(`   1. Ask ${recipientEmail} to message @mundotango1 on Facebook`);
    console.log('   2. Wait for webhook to capture PSID');
    console.log('   3. Run this script again\n');
    process.exit(1);
  }
  
  console.log(`✅ PSID found: ${psid}\n`);
  
  // STEP 3: Send invitation message
  console.log('📋 STEP 3: Sending Mundo Tango invitation...');
  console.log('─'.repeat(70));
  console.log(`\nMessage preview (${MUNDO_TANGO_INVITE_MESSAGE.length} chars):`);
  console.log('┌' + '─'.repeat(68) + '┐');
  console.log(MUNDO_TANGO_INVITE_MESSAGE.split('\n').map(line => 
    `│ ${line.padEnd(66)} │`
  ).join('\n'));
  console.log('└' + '─'.repeat(68) + '┘\n');
  
  try {
    const result = await FacebookMessengerService.sendMessage({
      recipientPSID: psid,
      message: MUNDO_TANGO_INVITE_MESSAGE
    });
    
    if (result.success && result.messageId) {
      console.log('═'.repeat(70));
      console.log('✅ SUCCESS! Invitation sent\n');
      console.log('Details:');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Recipient PSID: ${psid}`);
      console.log(`   Timestamp: ${new Date().toISOString()}\n`);
      
      // Update database
      await db
        .update(users)
        .set({
          facebookLastMessageAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, user[0].id));
      
      console.log('✅ Database updated with send timestamp\n');
      console.log('🎉 Mundo Tango invite delivered successfully!\n');
      console.log('Next steps:');
      console.log('  • User receives message in Facebook Messenger');
      console.log('  • User clicks link to join Mundo Tango');
      console.log('  • Authentic connections begin! 🌍\n');
    } else {
      console.error('❌ Send failed\n');
      console.log('Error:', result.error || 'Unknown error');
      console.log('\nTroubleshooting:');
      console.log('  • Check if token is still valid');
      console.log('  • Verify PSID is correct');
      console.log('  • Ensure user messaged page in last 24 hours');
      console.log('  • Try using CONFIRMED_EVENT_UPDATE tag for events\n');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ FATAL ERROR\n');
    console.error('Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
