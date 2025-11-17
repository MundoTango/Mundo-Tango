#!/usr/bin/env tsx

/**
 * FACEBOOK COMPLETE SETUP - END-TO-END SOLUTION
 * 
 * This script handles the entire Facebook Messenger setup process:
 * 1. Validate current token (or detect expiration)
 * 2. Guide user through token refresh if needed
 * 3. Test API connection
 * 4. Check PSID requirements
 * 5. Provide next steps for sending messages
 * 
 * MB.MD V9.0 Patterns Applied:
 * - Pattern 28 (Multi-Tier Token Management)
 * - Pattern 29 (PSID Lookup)
 * - Pattern 30 (Systematic Error Diagnosis)
 */

import { FacebookMessengerService } from '../server/services/facebook/FacebookMessengerService';

async function main() {
  console.log('\n🤖 FACEBOOK MESSENGER - COMPLETE SETUP');
  console.log('═'.repeat(70));
  console.log('');

  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID || '122157503636969453';

  // STEP 1: Check if token exists
  console.log('📋 STEP 1: Checking token configuration...');
  console.log('═'.repeat(70));
  
  if (!token) {
    console.log('❌ FACEBOOK_PAGE_ACCESS_TOKEN not found in secrets\n');
    console.log('📖 ACTION REQUIRED: Generate a new Facebook token\n');
    console.log('Quick steps:');
    console.log('  1. Go to: https://developers.facebook.com/tools/explorer/');
    console.log('  2. Click dropdown (top) → Select "Mundo Tango" page');
    console.log('  3. Click "Permissions" tab');
    console.log('  4. Add these permissions:');
    console.log('     - pages_messaging');
    console.log('     - pages_manage_metadata');
    console.log('     - pages_read_engagement');
    console.log('  5. Click "Generate Access Token" button');
    console.log('  6. Copy the token (starts with EAA...)');
    console.log('  7. Run: npx tsx scripts/exchange-facebook-token.ts <TOKEN>');
    console.log('  8. Add long-lived token to Replit Secrets as FACEBOOK_PAGE_ACCESS_TOKEN\n');
    process.exit(1);
  }

  console.log('✅ Token found in secrets\n');

  // STEP 2: Validate token
  console.log('📋 STEP 2: Validating token...');
  console.log('═'.repeat(70));

  const validation = await FacebookMessengerService.validateToken();

  if (!validation.isValid) {
    console.log('❌ Token is INVALID or EXPIRED\n');
    console.log('Error:', validation.error);
    
    if (validation.expiresAt) {
      console.log('Expired on:', validation.expiresAt.toLocaleString());
    }

    console.log('\n📖 TOKEN EXPIRED - ACTION REQUIRED:\n');
    console.log('Your token needs to be regenerated. Here\'s the EXACT process:\n');
    console.log('METHOD 1: Graph API Explorer (Recommended - 5 minutes)');
    console.log('  1. Open: https://developers.facebook.com/tools/explorer/');
    console.log('  2. Login with admin@mundotango.life');
    console.log('  3. Top dropdown: Click "User or Page" → Select "Mundo Tango"');
    console.log('  4. Click "Permissions" tab (below dropdown)');
    console.log('  5. Search and enable EACH permission:');
    console.log('     ☑️  pages_messaging');
    console.log('     ☑️  pages_manage_metadata');
    console.log('     ☑️  pages_read_engagement');
    console.log('  6. Click "Generate Access Token" (blue button)');
    console.log('  7. Click "Continue as Mundo Tango" in popup');
    console.log('  8. Copy the token from "Access Token" field');
    console.log('  9. Run: npx tsx scripts/exchange-facebook-token.ts <PASTE_TOKEN_HERE>');
    console.log(' 10. Script will output long-lived token (60-90 days)');
    console.log(' 11. Copy long-lived token → Replit Secrets → FACEBOOK_PAGE_ACCESS_TOKEN');
    console.log(' 12. Run this script again to verify\n');

    console.log('❓ TROUBLESHOOTING:\n');
    console.log('Q: "I don\'t see Mundo Tango in dropdown"');
    console.log('A: Make sure you\'re logged in as admin@mundotango.life (page admin)\n');
    console.log('Q: "Permissions tab is empty"');
    console.log('A: First select the page from dropdown, then permissions appear\n');
    console.log('Q: "Token still expires quickly"');
    console.log('A: Make sure you run exchange-facebook-token.ts to get 60-90 day token\n');

    process.exit(1);
  }

  console.log('✅ Token is VALID!\n');
  console.log('Details:');
  console.log('  App ID:', validation.appId);
  console.log('  User/Page ID:', validation.userId);
  console.log('  Scopes:', validation.scopes?.join(', ') || 'None');
  console.log('  Expires:', validation.expiresAt ? validation.expiresAt.toLocaleString() : 'Never (long-lived)');
  console.log('');

  // STEP 3: Test API connection
  console.log('📋 STEP 3: Testing Facebook API connection...');
  console.log('═'.repeat(70));

  try {
    const pageInfo = await FacebookMessengerService.getPageInfo();
    console.log('✅ API connection successful!\n');
    console.log('Page Info:');
    console.log('  ID:', pageInfo.id);
    console.log('  Name:', pageInfo.name);
    if (pageInfo.email) console.log('  Email:', pageInfo.email);
    console.log('');
  } catch (error: any) {
    console.log('❌ API connection failed\n');
    console.log('Error:', error.message);
    console.log('\nThis could mean:');
    console.log('  - Token permissions are insufficient');
    console.log('  - Facebook API is experiencing issues');
    console.log('  - Token was revoked\n');
    process.exit(1);
  }

  // STEP 4: Explain PSID requirement
  console.log('📋 STEP 4: Understanding PSID requirement...');
  console.log('═'.repeat(70));
  console.log('✅ Token validated, API connected successfully!\n');
  console.log('⚠️  IMPORTANT: Facebook Messenger requires PSID (Page-Scoped ID)\n');
  console.log('You CANNOT send messages to email addresses directly.');
  console.log('You need the user\'s PSID (Page-Scoped ID) to send messages.\n');
  
  console.log('📖 HOW TO GET PSID FOR sboddye@gmail.com:\n');
  console.log('METHOD 1: User Initiates Conversation (Easiest)');
  console.log('  1. Share page link with user: https://facebook.com/mundotango1');
  console.log('  2. User clicks "Send Message" button');
  console.log('  3. User sends any message to page');
  console.log('  4. Webhook receives message with PSID automatically');
  console.log('  5. Now you can reply programmatically\n');

  console.log('METHOD 2: Add as App Tester (For Testing)');
  console.log('  1. Go to: https://developers.facebook.com/apps/');
  console.log('  2. Select your Mundo Tango app');
  console.log('  3. Roles → Testers → Add Testers');
  console.log('  4. Enter: sboddye@gmail.com');
  console.log('  5. They accept tester invite');
  console.log('  6. Now they can message page for testing\n');

  console.log('METHOD 3: Customer Chat Plugin (For Website)');
  console.log('  1. Install Facebook Messenger chat widget on mundotango.life');
  console.log('  2. When users chat, PSID captured automatically');
  console.log('  3. Store PSID in database linked to user account\n');

  console.log('═'.repeat(70));
  console.log('✅ SETUP COMPLETE!\n');
  console.log('📊 SUMMARY:');
  console.log('  ✅ Token validated and working');
  console.log('  ✅ API connection successful');
  console.log('  ✅ Page info retrieved');
  console.log('  ⏭️  Next: Get PSID using one of the methods above');
  console.log('  ⏭️  Then: npx tsx scripts/send-message-by-psid.ts <PSID> "Your message"\n');

  console.log('💡 RECOMMENDATION:');
  console.log('  For sboddye@gmail.com, easiest approach:');
  console.log('  1. Send them this link: https://m.me/mundotango1');
  console.log('  2. Ask them to send you a test message');
  console.log('  3. Check page inbox for their message');
  console.log('  4. Webhook will capture PSID for future messaging\n');
}

main().catch((error) => {
  console.error('\n❌ FATAL ERROR:', error.message);
  console.error('\n', error.stack);
  process.exit(1);
});
