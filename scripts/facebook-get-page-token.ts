#!/usr/bin/env tsx

/**
 * GET PAGE ACCESS TOKEN FROM USER TOKEN
 * 
 * This script uses the Facebook Graph API to:
 * 1. Take a User Access Token (from Access Token Tool)
 * 2. Get all pages you manage
 * 3. Extract the Page Access Token for Mundo Tango
 * 4. Exchange it for a long-lived token (60-90 days)
 */

async function main() {
  const userAccessToken = process.argv[2];
  
  if (!userAccessToken) {
    console.error('\n❌ Usage: npx tsx scripts/facebook-get-page-token.ts <USER_ACCESS_TOKEN>\n');
    console.log('Get your User Access Token from:');
    console.log('  https://developers.facebook.com/tools/accesstoken/\n');
    console.log('Under "Mundo Tango" app, copy the "User Token" (the long green text)\n');
    process.exit(1);
  }

  console.log('\n🔍 FACEBOOK PAGE TOKEN EXTRACTOR');
  console.log('═'.repeat(70));
  console.log('\n📋 Step 1: Getting your Facebook pages...\n');

  try {
    // Get all pages managed by this user
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`
    );
    
    const pagesData = await pagesResponse.json();
    
    if (pagesData.error) {
      console.error('❌ Facebook API Error:');
      console.error(`   Code: ${pagesData.error.code}`);
      console.error(`   Message: ${pagesData.error.message}`);
      console.error(`   Type: ${pagesData.error.type}\n`);
      
      if (pagesData.error.code === 190) {
        console.log('💡 This means your token is invalid or expired.');
        console.log('   Get a fresh User Token from: https://developers.facebook.com/tools/accesstoken/\n');
      }
      
      process.exit(1);
    }

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error('❌ No pages found for this account\n');
      console.log('Make sure:');
      console.log('  • You\'re an admin of the Mundo Tango page');
      console.log('  • You used the correct User Token from Access Token Tool\n');
      process.exit(1);
    }

    console.log(`✅ Found ${pagesData.data.length} page(s):\n`);
    
    pagesData.data.forEach((page: any, index: number) => {
      console.log(`${index + 1}. ${page.name}`);
      console.log(`   Page ID: ${page.id}`);
      console.log(`   Category: ${page.category || 'N/A'}`);
      console.log(`   Token preview: ${page.access_token.substring(0, 30)}...`);
      console.log();
    });

    // Find Mundo Tango page
    const mundoTangoPage = pagesData.data.find((page: any) => 
      page.name.toLowerCase().includes('mundo') && 
      page.name.toLowerCase().includes('tango')
    );

    if (!mundoTangoPage) {
      console.error('❌ Could not find "Mundo Tango" page\n');
      console.log('Available pages:');
      pagesData.data.forEach((page: any) => console.log(`  • ${page.name}`));
      console.log('\nIf you see your page above, update the script to match the exact name.\n');
      process.exit(1);
    }

    console.log('═'.repeat(70));
    console.log('🎯 Found Mundo Tango Page!\n');
    console.log(`Page Name: ${mundoTangoPage.name}`);
    console.log(`Page ID: ${mundoTangoPage.id}`);
    console.log(`Category: ${mundoTangoPage.category}\n`);

    const shortPageToken = mundoTangoPage.access_token;
    console.log(`📋 Step 2: Short-lived Page Token obtained`);
    console.log(`   Token: ${shortPageToken.substring(0, 40)}...`);
    console.log(`   Length: ${shortPageToken.length} chars\n`);

    // Exchange for long-lived token
    const appId = process.env.FACEBOOK_APP_ID || '1450658896233975';
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appSecret) {
      console.log('⚠️  No FACEBOOK_APP_SECRET found');
      console.log('   Cannot exchange for long-lived token\n');
      console.log('═'.repeat(70));
      console.log('✅ SHORT-LIVED PAGE TOKEN (valid ~60 days):\n');
      console.log(shortPageToken);
      console.log('\n📋 Save this to Replit Secrets as: FACEBOOK_PAGE_ACCESS_TOKEN\n');
      return;
    }

    console.log('📋 Step 3: Exchanging for long-lived token (60-90 days)...\n');

    const exchangeUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    exchangeUrl.searchParams.set('grant_type', 'fb_exchange_token');
    exchangeUrl.searchParams.set('client_id', appId);
    exchangeUrl.searchParams.set('client_secret', appSecret);
    exchangeUrl.searchParams.set('fb_exchange_token', shortPageToken);

    const exchangeResponse = await fetch(exchangeUrl.toString());
    const exchangeData = await exchangeResponse.json();

    if (exchangeData.error) {
      console.log('⚠️  Token exchange failed (but short-lived token still works!)\n');
      console.log('Error:', exchangeData.error.message);
      console.log('\nUsing short-lived token instead:\n');
      console.log('═'.repeat(70));
      console.log('✅ SHORT-LIVED PAGE TOKEN:\n');
      console.log(shortPageToken);
      console.log('\n📋 Save this to Replit Secrets as: FACEBOOK_PAGE_ACCESS_TOKEN\n');
      return;
    }

    const longPageToken = exchangeData.access_token;
    const expiresIn = exchangeData.expires_in;
    const daysValid = expiresIn ? Math.floor(expiresIn / 86400) : 'Never';

    console.log('✅ Long-lived token obtained!\n');
    console.log('═'.repeat(70));
    console.log('🎉 SUCCESS! LONG-LIVED PAGE ACCESS TOKEN:\n');
    console.log(longPageToken);
    console.log(`\n⏰ Valid for: ${daysValid} days`);
    console.log(`   Token length: ${longPageToken.length} chars\n`);
    console.log('═'.repeat(70));
    console.log('\n📋 NEXT STEPS:\n');
    console.log('1. Copy the token above');
    console.log('2. Go to Replit Secrets (🔒 lock icon)');
    console.log('3. Find or create: FACEBOOK_PAGE_ACCESS_TOKEN');
    console.log('4. Paste the token');
    console.log('5. Click Save\n');
    console.log('🧪 TEST: npx tsx scripts/facebook-complete-setup.ts');
    console.log('📧 SEND INVITE: npx tsx scripts/facebook-send-invite-complete.ts sboddye@gmail.com\n');

  } catch (error: any) {
    console.error('\n❌ Network Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

main();
