/**
 * QUICK FACEBOOK TOKEN EXCHANGE
 * 
 * After getting short-lived token from Graph API Explorer,
 * run this script to exchange it for a long-lived token (60-90 days)
 * 
 * Usage:
 *   1. Get short-lived token from: https://developers.facebook.com/tools/explorer/
 *   2. Get App Secret from: App Settings → Basic
 *   3. Run: SHORT_TOKEN="EAAxx..." APP_SECRET="xxx" npx tsx scripts/quick-facebook-token-exchange.ts
 */

const shortToken = process.env.SHORT_TOKEN;
const appId = '122157503636969453'; // Your Mundo Tango app
const appSecret = process.env.APP_SECRET || process.env.FACEBOOK_APP_SECRET;

if (!shortToken) {
  console.error('❌ Missing SHORT_TOKEN environment variable');
  console.log('\nUsage:');
  console.log('  SHORT_TOKEN="EAAxx..." APP_SECRET="xxx" npx tsx scripts/quick-facebook-token-exchange.ts\n');
  process.exit(1);
}

if (!appSecret) {
  console.error('❌ Missing APP_SECRET or FACEBOOK_APP_SECRET environment variable');
  console.log('\nGet your App Secret from: https://developers.facebook.com/apps/');
  console.log('Navigate to: Settings → Basic → App Secret\n');
  process.exit(1);
}

async function exchangeToken() {
  console.log('🔄 Exchanging short-lived token for long-lived token...\n');
  
  const url = `https://graph.facebook.com/v21.0/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${appId}&` +
    `client_secret=${appSecret}&` +
    `fb_exchange_token=${shortToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.access_token) {
      const expiresInDays = Math.floor(data.expires_in / (60 * 60 * 24));
      
      console.log('✅ SUCCESS! Long-lived token generated:\n');
      console.log('━'.repeat(80));
      console.log(data.access_token);
      console.log('━'.repeat(80));
      console.log(`\n⏰ Expires in: ${expiresInDays} days (${data.expires_in} seconds)`);
      console.log('\n📝 Next steps:');
      console.log('  1. Copy the token above');
      console.log('  2. Add to Replit Secrets: FACEBOOK_PAGE_ACCESS_TOKEN');
      console.log('  3. Run test: npx tsx scripts/test-facebook-token.ts\n');
    } else {
      console.error('❌ Token exchange failed:', data.error?.message || JSON.stringify(data));
      
      if (data.error?.code === 190) {
        console.log('\n💡 Error 190 means invalid access token. Try:');
        console.log('  1. Get a fresh short-lived token from Graph API Explorer');
        console.log('  2. Verify App Secret is correct (Settings → Basic)');
        console.log('  3. Ensure token hasn\'t expired (valid for 1 hour only)\n');
      }
    }
  } catch (error: any) {
    console.error('❌ Network error:', error.message);
  }
}

exchangeToken();
