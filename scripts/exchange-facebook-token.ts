#!/usr/bin/env tsx

/**
 * FACEBOOK TOKEN EXCHANGE - Short-Lived → Long-Lived
 * 
 * Converts a 1-hour token from Graph API Explorer
 * into a 60-90 day long-lived token
 */

async function main() {
  const shortLivedToken = process.argv[2];
  
  if (!shortLivedToken) {
    console.error('❌ Usage: npx tsx scripts/exchange-facebook-token.ts <SHORT_LIVED_TOKEN>\n');
    console.log('Get short-lived token from: https://developers.facebook.com/tools/explorer/\n');
    process.exit(1);
  }

  const appId = process.env.FACEBOOK_APP_ID || '122157503636969453';
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appSecret) {
    console.error('❌ Missing FACEBOOK_APP_SECRET environment variable\n');
    console.log('Add it to Replit Secrets, then try again.\n');
    process.exit(1);
  }

  console.log('\n🔄 Exchanging short-lived token for long-lived token...\n');

  try {
    const url = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
    url.searchParams.set('grant_type', 'fb_exchange_token');
    url.searchParams.set('client_id', appId);
    url.searchParams.set('client_secret', appSecret);
    url.searchParams.set('fb_exchange_token', shortLivedToken);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.error) {
      console.error('❌ Facebook API Error:');
      console.error(`   Code: ${data.error.code}`);
      console.error(`   Message: ${data.error.message}\n`);
      process.exit(1);
    }

    if (!data.access_token) {
      console.error('❌ No access_token in response\n');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('✅ SUCCESS! Long-lived token generated:\n');
    console.log(`Token: ${data.access_token}`);
    console.log(`Type: ${data.token_type || 'bearer'}`);
    console.log(`Expires in: ${data.expires_in ? data.expires_in + ' seconds (~' + Math.floor(data.expires_in / 86400) + ' days)' : 'Never'}\n`);
    
    console.log('📋 Next Steps:');
    console.log('1. Copy the token above');
    console.log('2. Add to Replit Secrets as: FACEBOOK_PAGE_ACCESS_TOKEN');
    console.log('3. Restart workflow: npm run dev');
    console.log('4. Send test invite: npx tsx scripts/send-test-invite.ts sboddye@gmail.com\n');

  } catch (error: any) {
    console.error('❌ Network Error:', error.message, '\n');
    process.exit(1);
  }
}

main();
