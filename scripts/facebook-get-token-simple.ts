#!/usr/bin/env tsx

/**
 * SIMPLE FACEBOOK TOKEN GUIDE
 * 
 * This script provides the EXACT steps to get a never-expiring Facebook token.
 * Following MB.MD Pattern 32: Facebook Messenger Expert Agent
 */

console.log('\n🎯 GET FACEBOOK TOKEN - SIMPLE 3-STEP PROCESS');
console.log('═'.repeat(70));
console.log('\n📖 This will take 5 minutes. Follow these EXACT steps:\n');

console.log('STEP 1: Get Short-Lived Token (2 minutes)');
console.log('─'.repeat(70));
console.log('1. Open this link: https://developers.facebook.com/tools/explorer/');
console.log('2. Login with your Facebook admin account');
console.log('3. Look for dropdown at top that says "User or Page"');
console.log('4. Click dropdown → Select "Mundo Tango" (your page)');
console.log('5. Click "Permissions" tab (below the dropdown)');
console.log('6. Type in search box and enable these 3 permissions:');
console.log('   ☑️  pages_messaging');
console.log('   ☑️  pages_manage_metadata');
console.log('   ☑️  pages_read_engagement');
console.log('7. Click blue "Generate Access Token" button');
console.log('8. Popup appears → Click "Continue as Mundo Tango"');
console.log('9. Copy the token from "Access Token" field');
console.log('   (It starts with "EAA..." and is very long)');
console.log('\n✅ Step 1 complete when you have token starting with EAA...\n');

console.log('STEP 2: Convert to Long-Lived Token (1 minute)');
console.log('─'.repeat(70));
console.log('Run this command (replace YOUR_SHORT_TOKEN with token from step 1):');
console.log('\nnpx tsx scripts/exchange-facebook-token.ts YOUR_SHORT_TOKEN\n');
console.log('Expected output: "Long-lived token (60-90 days): EAA..."\n');
console.log('✅ Step 2 complete when script outputs long-lived token\n');

console.log('STEP 3: Add to Secrets (1 minute)');
console.log('─'.repeat(70));
console.log('1. Copy the LONG-LIVED token from step 2');
console.log('2. Go to Replit Secrets panel (left sidebar, lock icon)');
console.log('3. Find "FACEBOOK_PAGE_ACCESS_TOKEN"');
console.log('4. Paste the long-lived token');
console.log('5. Click "Save"');
console.log('\n✅ Step 3 complete when secret is saved\n');

console.log('VERIFY: Test Token (30 seconds)');
console.log('─'.repeat(70));
console.log('Run: npx tsx scripts/facebook-complete-setup.ts');
console.log('\nShould show: ✅ Token is VALID!\n');

console.log('═'.repeat(70));
console.log('📝 TROUBLESHOOTING:\n');
console.log('❌ "Don\'t see Mundo Tango in dropdown"');
console.log('→  Make sure you\'re logged into correct Facebook account (admin@mundotango.life)\n');
console.log('❌ "Permissions tab is empty"');
console.log('→  First select "Mundo Tango" from dropdown, then permissions appear\n');
console.log('❌ "Generate Token button is gray/disabled"');
console.log('→  Make sure at least 1 permission is checked\n');
console.log('❌ "Token still shows as expired"');
console.log('→  Make sure you ran exchange-facebook-token.ts to get long-lived version\n');

console.log('═'.repeat(70));
console.log('\n💡 READY TO START? Open the Graph Explorer link above!\n');
