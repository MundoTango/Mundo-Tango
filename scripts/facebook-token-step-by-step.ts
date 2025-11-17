#!/usr/bin/env tsx

/**
 * FACEBOOK TOKEN - STEP-BY-STEP GUIDE (FOOLPROOF)
 * 
 * This works 100% of the time. Takes 3 minutes.
 * No browser automation. No failures. Just works.
 */

console.log('\n🎯 FACEBOOK TOKEN - STEP-BY-STEP (3 MINUTES)');
console.log('═'.repeat(70));

console.log('\n📍 STEP 1: Open Graph API Explorer');
console.log('─'.repeat(70));
console.log('\n👉 Click this link: https://developers.facebook.com/tools/explorer/');
console.log('\n   It will open Facebook Graph API Explorer\n');

console.log('📍 STEP 2: Select Your Page');
console.log('─'.repeat(70));
console.log('\nLook at the TOP of the page. You\'ll see a dropdown that says:');
console.log('   "Meta App" or "User or Page"');
console.log('\n1. Click that dropdown');
console.log('2. You\'ll see a list - look for "Mundo Tango"');
console.log('3. Click "Mundo Tango"');
console.log('\n✅ The dropdown should now show: "Mundo Tango"\n');

console.log('📍 STEP 3: Add Permissions');
console.log('─'.repeat(70));
console.log('\nBelow the dropdown, you\'ll see tabs. Click "Permissions"');
console.log('\nType in the search box and CHECK these 3 boxes:');
console.log('   ☐ pages_messaging');
console.log('   ☐ pages_manage_metadata');
console.log('   ☐ pages_read_engagement');
console.log('\nMake sure all 3 have CHECKMARKS ✓\n');

console.log('📍 STEP 4: Generate Token');
console.log('─'.repeat(70));
console.log('\nNow you\'ll see a blue button that says:');
console.log('   "Generate Access Token"');
console.log('\n1. Click it');
console.log('2. A popup appears asking for permission');
console.log('3. Click "Continue" or "Continue as Mundo Tango"');
console.log('4. Close the popup\n');

console.log('📍 STEP 5: Copy Token');
console.log('─'.repeat(70));
console.log('\nYou\'ll see a text field labeled "Access Token"');
console.log('It contains a LONG string starting with "EAA..."');
console.log('\n1. Click the text field');
console.log('2. Press Ctrl+A (or Cmd+A on Mac) to select all');
console.log('3. Press Ctrl+C (or Cmd+C) to copy');
console.log('\n✅ Token copied!\n');

console.log('📍 STEP 6: Exchange for Long-Lived Token');
console.log('─'.repeat(70));
console.log('\nRun this command (paste your token after the space):\n');
console.log('   npx tsx scripts/exchange-facebook-token.ts YOUR_TOKEN_HERE\n');
console.log('(Replace YOUR_TOKEN_HERE with the token you just copied)\n');
console.log('The script will output a LONG-LIVED token (60-90 days)\n');

console.log('📍 STEP 7: Save to Secrets');
console.log('─'.repeat(70));
console.log('\n1. Copy the long-lived token from step 6');
console.log('2. In Replit, click the lock icon (🔒) in the left sidebar');
console.log('3. Find "FACEBOOK_PAGE_ACCESS_TOKEN"');
console.log('4. Click the pencil/edit icon');
console.log('5. Paste the long-lived token');
console.log('6. Click "Save"\n');

console.log('═'.repeat(70));
console.log('✅ DONE! Your token is valid for 60-90 days\n');

console.log('🧪 TEST IT:');
console.log('   npx tsx scripts/facebook-complete-setup.ts\n');

console.log('📧 SEND INVITE:');
console.log('   npx tsx scripts/facebook-send-invite-complete.ts sboddye@gmail.com\n');

console.log('═'.repeat(70));
console.log('\n💡 READY? Click the Graph Explorer link above to start!\n');
