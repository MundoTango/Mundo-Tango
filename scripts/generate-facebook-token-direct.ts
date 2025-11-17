/**
 * DIRECT AUTONOMOUS TOKEN GENERATION
 * 
 * Bypasses API authentication by calling FacebookTokenGenerator directly.
 * This demonstrates Mr. Blue's "computer use" feature (Playwright automation).
 * 
 * Usage: npx tsx scripts/generate-facebook-token-direct.ts
 */

import { FacebookTokenGenerator } from '../server/services/facebook/FacebookTokenGenerator';
import * as fs from 'fs/promises';
import * as path from 'path';

async function generateToken() {
  console.log('\n🤖 MR. BLUE AUTONOMOUS TOKEN GENERATION');
  console.log('Using "Computer Use" Feature (Playwright Browser Automation)');
  console.log('='.repeat(70));
  console.log('');

  const email = process.env.FACEBOOK_EMAIL;
  const password = process.env.FACEBOOK_PASSWORD;
  const appId = process.env.FACEBOOK_PAGE_ID;

  if (!email || !password) {
    console.error('❌ Missing credentials: FACEBOOK_EMAIL or FACEBOOK_PASSWORD not set');
    console.error('Please add these secrets in Replit Secrets');
    process.exit(1);
  }

  if (!appId) {
    console.error('❌ Missing FACEBOOK_PAGE_ID environment variable');
    process.exit(1);
  }

  console.log('📋 Configuration:');
  console.log('  Email:', email.substring(0, 3) + '***' + email.substring(email.indexOf('@')));
  console.log('  App/Page ID:', appId);
  console.log('  Headless Mode: false (for 2FA support)');
  console.log('');
  console.log('🚀 Starting browser automation...');
  console.log('');
  console.log('This automation will:');
  console.log('  1. 🌐 Launch Chromium browser');
  console.log('  2. 🔐 Navigate to Facebook and login');
  console.log('  3. 🔑 Handle 2FA if enabled (you\'ll need to enter code)');
  console.log('  4. 🛠️  Navigate to Developer Console');
  console.log('  5. 🎫 Extract/Generate Page Access Token');
  console.log('  6. 💾 Save token to file for your review');
  console.log('');
  console.log('⚠️  IMPORTANT: If you have 2FA enabled, a browser window will open.');
  console.log('   You have 60 seconds to enter your 2FA code when prompted.');
  console.log('');
  console.log('⏳ Please wait... this may take 30-90 seconds...');
  console.log('');

  try {
    const generator = new FacebookTokenGenerator();
    
    // Execute autonomous token generation
    const result = await generator.generatePageAccessToken(
      email,
      password,
      appId,
      false // Non-headless mode for 2FA
    );

    console.log('');
    console.log('='.repeat(70));
    
    if (result.success && result.token) {
      console.log('✅ TOKEN GENERATION SUCCESSFUL!');
      console.log('='.repeat(70));
      console.log('');
      console.log('📊 Token Details:');
      console.log('  Token (first 40 chars):', result.token.substring(0, 40) + '...');
      console.log('  Expires in:', result.expiresIn ? (result.expiresIn / 86400).toFixed(0) : 'Unknown', 'days');
      console.log('');
      console.log('📋 Execution Steps:');
      result.steps?.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step}`);
      });
      console.log('');
      console.log('='.repeat(70));
      console.log('');
      console.log('💾 Saving token to file...');
      
      // Save token to file
      const tokenPath = path.join(process.cwd(), 'facebook-token.txt');
      await fs.writeFile(tokenPath, result.token, 'utf-8');
      console.log('✅ Token saved to:', tokenPath);
      console.log('');
      console.log('🔧 NEXT STEPS:');
      console.log('  1. Copy the token from facebook-token.txt');
      console.log('  2. Update FACEBOOK_PAGE_ACCESS_TOKEN in Replit Secrets');
      console.log('  3. Delete facebook-token.txt (for security)');
      console.log('  4. Restart the application workflow');
      console.log('  5. Test with: curl http://localhost:5000/api/facebook/validate-token');
      console.log('');
      console.log('='.repeat(70));
      console.log('');
      console.log('🎉 FULL TOKEN (also in facebook-token.txt):');
      console.log(result.token);
      console.log('');
      
    } else {
      console.error('❌ TOKEN GENERATION FAILED');
      console.error('='.repeat(70));
      console.error('');
      console.error('Error:', result.error);
      console.error('');
      console.error('Execution Steps:');
      result.steps?.forEach((step, i) => {
        console.error(`  ${i + 1}. ${step}`);
      });
      console.error('');
      console.error('💡 Troubleshooting:');
      console.error('  - Verify FACEBOOK_EMAIL and FACEBOOK_PASSWORD are correct');
      console.error('  - Check if Facebook account has access to the Page/App');
      console.error('  - Ensure 2FA code was entered correctly (if applicable)');
      console.error('  - Check screenshot at /tmp/fb-token-debug.png for details');
      console.error('');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('');
    console.error('='.repeat(70));
    console.error('❌ FATAL ERROR');
    console.error('='.repeat(70));
    console.error('');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('');
    process.exit(1);
  }
}

generateToken();
