/**
 * TEST FACEBOOK PAGE ACCESS TOKEN
 * Validate current token and check expiration
 */

async function testFacebookToken() {
  console.log('🔐 Testing Facebook Page Access Token...\n');

  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!token) {
    console.error('❌ FACEBOOK_PAGE_ACCESS_TOKEN not found');
    process.exit(1);
  }

  try {
    // Test 1: Debug token to check validity and expiration
    console.log('🔍 Test 1: Token Validation...');
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`;
    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();

    if (debugData.data) {
      const { is_valid, expires_at, scopes } = debugData.data;
      console.log(`   Valid: ${is_valid ? '✅' : '❌'}`);
      
      if (expires_at) {
        const expirationDate = new Date(expires_at * 1000);
        const daysUntilExpiration = Math.floor((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        console.log(`   Expires: ${expirationDate.toLocaleDateString()} (${daysUntilExpiration} days)`);
      } else {
        console.log(`   Expires: Never (long-lived token)`);
      }
      
      if (scopes) {
        console.log(`   Scopes: ${scopes.slice(0, 5).join(', ')}${scopes.length > 5 ? '...' : ''}`);
      }
      console.log('');

      if (!is_valid) {
        console.error('❌ Token is INVALID - needs regeneration\n');
        return false;
      }
    } else {
      console.error('❌ Failed to validate token:', debugData.error?.message || 'Unknown error');
      return false;
    }

    // Test 2: Get page info
    console.log('📄 Test 2: Page Access Test...');
    const pageResponse = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
    const pageData = await pageResponse.json();

    if (pageData.id) {
      console.log(`✅ Page Access: ${pageData.name || 'Mundo Tango'}`);
      console.log(`   Page ID: ${pageData.id}\n`);
    } else {
      console.error('❌ Failed to access page:', pageData.error?.message || 'Unknown error');
      return false;
    }

    // Test 3: Check messaging permissions
    console.log('💬 Test 3: Messaging Permissions...');
    const permsResponse = await fetch(`https://graph.facebook.com/me/permissions?access_token=${token}`);
    const permsData = await permsResponse.json();

    if (permsData.data) {
      const grantedPerms = permsData.data.filter((p: any) => p.status === 'granted').map((p: any) => p.permission);
      const hasMessaging = grantedPerms.includes('pages_messaging') || grantedPerms.includes('pages_manage_metadata');
      
      console.log(`   Granted: ${grantedPerms.length} permissions`);
      console.log(`   Messaging: ${hasMessaging ? '✅' : '❌'}`);
      console.log('');
    }

    console.log('✅ Facebook token is VALID and OPERATIONAL\n');
    return true;

  } catch (error: any) {
    console.error('❌ Token test failed:', error.message);
    return false;
  }
}

testFacebookToken()
  .then(valid => {
    if (!valid) {
      console.log('⚠️  Token needs regeneration. Run: npx tsx scripts/generate-facebook-token-direct.ts');
      process.exit(1);
    }
  })
  .catch(console.error);
