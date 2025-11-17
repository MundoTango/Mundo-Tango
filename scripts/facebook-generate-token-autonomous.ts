#!/usr/bin/env tsx

/**
 * AUTONOMOUS FACEBOOK TOKEN GENERATOR
 * 
 * Uses Playwright stealth mode to automatically:
 * 1. Log into Facebook
 * 2. Navigate to Developer Tools
 * 3. Extract Page Access Token
 * 4. Exchange for long-lived token (60-90 days)
 * 5. Update environment secrets
 * 
 * Requires: FACEBOOK_EMAIL, FACEBOOK_PASSWORD in secrets
 */

import { FacebookTokenGenerator } from '../server/services/facebook/FacebookTokenGenerator';
import fs from 'fs/promises';

async function main() {
  console.log('\n🤖 AUTONOMOUS FACEBOOK TOKEN GENERATOR');
  console.log('═'.repeat(70));
  console.log('\nThis will:');
  console.log('  1. Open a browser window');
  console.log('  2. Log into Facebook automatically');
  console.log('  3. Navigate to Developer Tools');
  console.log('  4. Extract your Page Access Token');
  console.log('  5. Exchange for long-lived token (60-90 days)');
  console.log('  6. Save to environment\n');
  
  // Get credentials from environment
  const email = process.env.FACEBOOK_EMAIL;
  const password = process.env.FACEBOOK_PASSWORD;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  
  if (!email || !password) {
    console.error('❌ Missing credentials!\n');
    console.log('Required secrets:');
    console.log('  • FACEBOOK_EMAIL - Your Facebook account email');
    console.log('  • FACEBOOK_PASSWORD - Your Facebook account password');
    console.log('\nAdd these to Replit Secrets (lock icon in sidebar)\n');
    process.exit(1);
  }
  
  if (!pageId) {
    console.error('❌ Missing FACEBOOK_PAGE_ID!\n');
    console.log('Add your Facebook Page ID to Replit Secrets\n');
    process.exit(1);
  }
  
  console.log('📧 Email:', email);
  console.log('🔑 Password: ********');
  console.log('📄 Page ID:', pageId);
  console.log('\n⚠️  2FA Notice:');
  console.log('   If you have 2FA enabled, the browser window will pause');
  console.log('   and wait for you to enter your code (60 seconds).\n');
  
  const generator = new FacebookTokenGenerator();
  
  console.log('🚀 Starting autonomous browser...\n');
  console.log('─'.repeat(70));
  
  // Generate token (headless=false to show browser for 2FA)
  const result = await generator.generatePageAccessToken(
    email,
    password,
    pageId,
    false // Show browser window for 2FA support
  );
  
  console.log('─'.repeat(70));
  console.log('\n📊 EXECUTION LOG:');
  result.steps?.forEach((step, i) => {
    console.log(`   ${i + 1}. ${step}`);
  });
  console.log();
  
  if (!result.success) {
    console.error('❌ Token generation FAILED\n');
    console.error('Error:', result.error);
    console.log('\n💡 Troubleshooting:');
    console.log('  • Check credentials in Replit Secrets');
    console.log('  • If 2FA prompt appeared, make sure you entered code');
    console.log('  • Check screenshot: /tmp/fb-token-debug.png');
    console.log('  • Try running with headless=true if no 2FA\n');
    process.exit(1);
  }
  
  const shortToken = result.token!;
  console.log('✅ Short-lived token obtained!');
  console.log(`   Token: ${shortToken.substring(0, 30)}...`);
  console.log(`   Length: ${shortToken.length} chars\n`);
  
  // Exchange for long-lived token
  if (appSecret) {
    console.log('🔄 Exchanging for long-lived token...\n');
    
    const exchangeResult = await generator.exchangeForLongLivedToken(
      shortToken,
      pageId,
      appSecret
    );
    
    if (exchangeResult.success) {
      const longToken = exchangeResult.token!;
      const daysValid = Math.floor(exchangeResult.expiresIn! / 86400);
      
      console.log('✅ Long-lived token obtained!');
      console.log(`   Valid for: ${daysValid} days`);
      console.log(`   Token: ${longToken.substring(0, 30)}...`);
      console.log(`   Length: ${longToken.length} chars\n`);
      
      // Save to environment
      console.log('💾 Saving to environment...\n');
      
      // Note: In Replit, we can't programmatically update secrets
      // So we'll save to a file and tell user to copy to secrets
      const envUpdate = `FACEBOOK_PAGE_ACCESS_TOKEN=${longToken}`;
      await fs.writeFile('/tmp/facebook-token.txt', envUpdate);
      
      console.log('═'.repeat(70));
      console.log('✅ TOKEN GENERATED SUCCESSFULLY!\n');
      console.log('📋 NEXT STEPS:\n');
      console.log('1. Copy this token:');
      console.log('─'.repeat(70));
      console.log(longToken);
      console.log('─'.repeat(70));
      console.log('\n2. Go to Replit Secrets (lock icon in sidebar)');
      console.log('3. Find "FACEBOOK_PAGE_ACCESS_TOKEN"');
      console.log('4. Paste the token above');
      console.log('5. Click "Save"\n');
      console.log('Token also saved to: /tmp/facebook-token.txt\n');
      console.log('═'.repeat(70));
      console.log(`\n✅ Token valid for ${daysValid} days - no need to refresh!\n`);
      
    } else {
      console.error('❌ Token exchange failed\n');
      console.error('Error:', exchangeResult.error);
      console.log('\n💡 You can still use the short-lived token:');
      console.log('   Valid for: ~2 hours');
      console.log(`   Token: ${shortToken}\n`);
    }
  } else {
    console.log('⚠️  No FACEBOOK_APP_SECRET found');
    console.log('   Cannot exchange for long-lived token');
    console.log('   Short-lived token will expire in ~2 hours\n');
    console.log(`   Token: ${shortToken}\n`);
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
