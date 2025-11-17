/**
 * ROBUST FACEBOOK TOKEN GENERATION
 * 
 * Uses FacebookTokenGeneratorV2 with multi-strategy approach:
 * 1. Saved session (if available)
 * 2. Direct login with comprehensive selectors
 * 3. Assisted mode (manual intervention)
 */

import { FacebookTokenGeneratorV2 } from '../server/services/facebook/FacebookTokenGeneratorV2';

const APP_ID = '122157503636969453';
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const EMAIL = process.env.FACEBOOK_EMAIL;
const PASSWORD = process.env.FACEBOOK_PASSWORD;

async function generateToken() {
  console.log('🤖 MR. BLUE - FACEBOOK TOKEN GENERATION V2 (ROBUST)');
  console.log('═'.repeat(70));
  console.log('');
  console.log('📋 Configuration:');
  console.log(`   App ID: ${APP_ID}`);
  console.log(`   Email: ${EMAIL ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Password: ${PASSWORD ? '✅ Set' : '❌ Missing'}`);
  console.log(`   App Secret: ${APP_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log('');
  console.log('🔄 Strategy: Multi-approach with fallbacks');
  console.log('   1. Try saved session (if available)');
  console.log('   2. Direct Facebook login with smart selectors');
  console.log('   3. Assisted mode (manual help if needed)');
  console.log('');
  console.log('═'.repeat(70));
  console.log('');

  const generator = new FacebookTokenGeneratorV2();

  try {
    const result = await generator.generateToken({
      appId: APP_ID,
      appSecret: APP_SECRET,
      email: EMAIL,
      password: PASSWORD,
      useSavedSession: true,
      assistedMode: true // Enable manual intervention if needed
    });

    if (result.success && result.token) {
      console.log('');
      console.log('═'.repeat(70));
      console.log('✅ SUCCESS! Facebook token generated');
      console.log('═'.repeat(70));
      console.log('');
      console.log('📋 Token Details:');
      console.log(`   Type: ${result.tokenType?.toUpperCase() || 'UNKNOWN'}`);
      console.log(`   Method: ${result.method || 'unknown'}`);
      
      if (result.expiresIn) {
        const days = Math.floor(result.expiresIn / 86400);
        console.log(`   Expires: ${days} days (${new Date(Date.now() + result.expiresIn * 1000).toLocaleDateString()})`);
      } else {
        console.log(`   Expires: ${result.tokenType === 'short' ? '1 hour' : 'Unknown'}`);
      }
      
      console.log('');
      console.log('🔑 Token:');
      console.log('━'.repeat(70));
      console.log(result.token);
      console.log('━'.repeat(70));
      console.log('');
      console.log('📝 Next Steps:');
      console.log('   1. Copy the token above');
      console.log('   2. Add to Replit Secrets: FACEBOOK_PAGE_ACCESS_TOKEN');
      console.log('   3. Run test: npx tsx scripts/test-facebook-token.ts');
      console.log('   4. Send invite: npx tsx scripts/send-test-invite.ts');
      console.log('');
      
      if (result.tokenType === 'short') {
        console.log('⚠️  NOTE: This is a SHORT-LIVED token (1 hour)');
        console.log('   Add FACEBOOK_APP_SECRET to get 60-90 day tokens automatically');
        console.log('');
      }

      process.exit(0);
    } else {
      console.log('');
      console.log('═'.repeat(70));
      console.log('❌ FAILED: Could not generate token');
      console.log('═'.repeat(70));
      console.log('');
      console.log('Error:', result.error || 'Unknown error');
      console.log('');
      console.log('💡 Troubleshooting:');
      console.log('   1. Check credentials: FACEBOOK_EMAIL and FACEBOOK_PASSWORD');
      console.log('   2. Review screenshots in /tmp/ directory');
      console.log('   3. Try manual method: docs/FACEBOOK_TOKEN_MANUAL_GUIDE.md');
      console.log('');
      
      process.exit(1);
    }

  } catch (error: any) {
    console.log('');
    console.log('═'.repeat(70));
    console.log('❌ FATAL ERROR');
    console.log('═'.repeat(70));
    console.log('');
    console.log(error.message);
    console.log('');
    console.log('Stack trace:');
    console.log(error.stack);
    console.log('');
    
    process.exit(1);
  }
}

generateToken();
