/**
 * TEST SCRIPT: Autonomous Facebook Token Generation
 * 
 * This script tests Mr. Blue's "computer use" feature by autonomously
 * generating a Facebook Page Access Token using Playwright browser automation.
 * 
 * Usage: npx tsx scripts/test-facebook-token-generation.ts
 */

import axios from 'axios';

async function testTokenGeneration() {
  console.log('\n🤖 MR. BLUE AUTONOMOUS TOKEN GENERATION TEST');
  console.log('='.repeat(70));
  console.log('Using credentials from environment variables...');
  console.log('Email:', process.env.FACEBOOK_EMAIL?.substring(0, 3) + '***');
  console.log('Page ID:', process.env.FACEBOOK_PAGE_ID || 'NOT SET');
  console.log('='.repeat(70));
  console.log('');

  const email = process.env.FACEBOOK_EMAIL;
  const password = process.env.FACEBOOK_PASSWORD;
  const appId = process.env.FACEBOOK_PAGE_ID;

  if (!email || !password) {
    console.error('❌ Missing credentials: FACEBOOK_EMAIL or FACEBOOK_PASSWORD not set');
    process.exit(1);
  }

  if (!appId) {
    console.error('❌ Missing FACEBOOK_PAGE_ID - cannot generate token');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting autonomous browser automation...');
    console.log('This will:');
    console.log('  1. Launch Chromium browser (non-headless for 2FA)');
    console.log('  2. Navigate to Facebook and login');
    console.log('  3. Navigate to Developer Console');
    console.log('  4. Extract/Generate Page Access Token');
    console.log('  5. Return the token for you to save');
    console.log('');
    console.log('⚠️  If you have 2FA enabled, the browser will pause for you to enter the code.');
    console.log('');

    // Call the autonomous token generation endpoint
    const response = await axios.post('http://localhost:5000/api/facebook/generate-token-autonomous', {
      email,
      password,
      appId,
      headless: false // Non-headless so user can handle 2FA
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      // This might take a while with 2FA
      timeout: 120000 // 2 minutes
    });

    console.log('\n✅ TOKEN GENERATION COMPLETE!');
    console.log('='.repeat(70));
    console.log('');
    console.log('Success:', response.data.success);
    console.log('Message:', response.data.message);
    console.log('');
    console.log('Token (first 40 chars):', response.data.token?.substring(0, 40) + '...');
    console.log('Expires in:', response.data.expiresInDays, 'days');
    console.log('');
    console.log('📋 EXECUTION STEPS:');
    response.data.steps?.forEach((step: string, i: number) => {
      console.log(`  ${i + 1}. ${step}`);
    });
    console.log('');
    console.log('🔧 NEXT STEPS:');
    response.data.nextSteps?.forEach((step: string, i: number) => {
      console.log(`  ${i + 1}. ${step}`);
    });
    console.log('');
    console.log('='.repeat(70));
    console.log('');
    console.log('🎉 FULL TOKEN (copy this):');
    console.log(response.data.token);
    console.log('');

  } catch (error: any) {
    console.error('\n❌ TOKEN GENERATION FAILED');
    console.error('='.repeat(70));
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data.error);
      console.error('Steps executed:', error.response.data.steps);
    } else {
      console.error('Error:', error.message);
    }
    console.error('');
    process.exit(1);
  }
}

testTokenGeneration();
