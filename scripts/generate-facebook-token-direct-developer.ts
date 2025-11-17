/**
 * FACEBOOK TOKEN GENERATOR - DIRECT DEVELOPER CONSOLE
 * 
 * Simpler approach: Go directly to Facebook Developer Console
 * which should trigger Google OAuth automatically if not logged in
 */

import { chromium, Browser, Page } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

const FACEBOOK_APP_ID = '122157503636969453';
const GOOGLE_USERNAME = process.env.Google_Admin_account_username;
const GOOGLE_PASSWORD = process.env.Google_Admin_account_password;

async function generateTokenDirectDeveloper() {
  console.log('🤖 MR. BLUE - FACEBOOK TOKEN (Direct Developer Console)');
  console.log('═'.repeat(70));
  console.log('');

  if (!GOOGLE_USERNAME || !GOOGLE_PASSWORD) {
    throw new Error('Missing Google credentials');
  }

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('[1/5] 🌐 Launching browser...');
    browser = await chromium.launch({
      headless: false,
      args: ['--disable-blink-features=AutomationControlled']
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    page = await context.newPage();

    // Step 1: Login to Google first
    console.log('[2/5] 🔐 Logging into Google account...');
    await page.goto('https://accounts.google.com/', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', GOOGLE_USERNAME);
    await page.click('button:has-text("Next"), #identifierNext');
    await page.waitForTimeout(2000);

    await page.fill('input[type="password"]', GOOGLE_PASSWORD);
    await page.click('button:has-text("Next"), #passwordNext');
    await page.waitForTimeout(3000);

    console.log('   ✅ Logged into Google');

    // Step 2: Navigate directly to Facebook Developer Tools (Graph API Explorer)
    console.log('[3/5] 🛠️  Opening Graph API Explorer...');
    await page.goto('https://developers.facebook.com/tools/explorer/', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    await page.waitForTimeout(5000);

    // Check if we need to login to Facebook
    const needsFBLogin = await page.locator('input[name="email"], button:has-text("Log In"), button:has-text("Continue with Google")').first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (needsFBLogin) {
      console.log('[4/5] 🔑 Facebook login required...');
      
      // Try Google OAuth button
      const googleButtons = [
        'button:has-text("Continue with Google")',
        'button:has-text("Log in with Google")',
        'div[role="button"]:has-text("Google")'
      ];

      let clicked = false;
      for (const selector of googleButtons) {
        try {
          if (await page.locator(selector).first().isVisible({ timeout: 2000 })) {
            await page.click(selector);
            clicked = true;
            console.log('   ✅ Clicked Google OAuth');
            await page.waitForTimeout(5000);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!clicked) {
        console.log('   ⚠️  Manual intervention needed: Google OAuth button not found');
        console.log('   ⏸️  PAUSING for 60 seconds - please complete login manually');
        await page.waitForTimeout(60000);
      }
    }

    // Step 3: We should now be on Graph API Explorer
    console.log('[5/5] 🎫 Generating token...');
    
    // Wait for the page to load
    await page.waitForTimeout(3000);

    // Take screenshot to see state
    await page.screenshot({ path: '/tmp/fb-graph-api-state.png' });
    console.log('   📸 Screenshot saved: /tmp/fb-graph-api-state.png');

    // Try to click "Get Token" or "Generate Access Token" button
    const tokenButtons = [
      'button:has-text("Generate Access Token")',
      'button:has-text("Get Token")',
      'button:has-text("Generate Token")'
    ];

    for (const selector of tokenButtons) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 3000 })) {
          console.log(`   🔘 Found token button: ${selector}`);
          await button.click();
          await page.waitForTimeout(3000);
          
          // Handle permission popup
          try {
            await page.click('button:has-text("Continue"), button:has-text("OK")', { timeout: 3000 });
            await page.waitForTimeout(2000);
          } catch (e) {
            // No popup
          }
          
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Extract token from input field
    const tokenSelectors = [
      'input[placeholder*="Access Token"]',
      'input[name*="token"]',
      'textarea[placeholder*="Access Token"]',
      'code:has-text("EAA")',
      'pre:has-text("EAA")'
    ];

    let token = null;
    for (const selector of tokenSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          const value = await element.inputValue().catch(() => element.textContent());
          if (value && value.includes('EAA')) {
            token = value.trim();
            console.log('   ✅ Token found!');
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (!token) {
      console.log('   ⚠️  Could not auto-extract token');
      console.log('   ⏸️  PAUSING for 60 seconds - please manually copy token');
      console.log('   📋 Look for field labeled "Access Token" and copy the value');
      await page.waitForTimeout(60000);
      
      // Try again after pause
      for (const selector of tokenSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            const value = await element.inputValue().catch(() => element.textContent());
            if (value && value.includes('EAA')) {
              token = value.trim();
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (!token) {
      throw new Error('Could not extract token. Please use manual method.');
    }

    console.log('');
    console.log('✅ Short-lived token extracted:');
    console.log('━'.repeat(70));
    console.log(token);
    console.log('━'.repeat(70));
    console.log('');

    // Exchange for long-lived token
    console.log('🔄 Exchanging for long-lived token...');
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    
    if (!appSecret) {
      console.log('⚠️  FACEBOOK_APP_SECRET not set - returning short-lived token');
      console.log('   Add FACEBOOK_APP_SECRET and run exchange script separately');
      return token;
    }

    const exchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `client_secret=${appSecret}&` +
      `fb_exchange_token=${token}`;

    const response = await fetch(exchangeUrl);
    const data = await response.json();

    if (data.access_token) {
      const days = Math.floor(data.expires_in / 86400);
      console.log('');
      console.log('✅ LONG-LIVED TOKEN (60-90 days):');
      console.log('━'.repeat(70));
      console.log(data.access_token);
      console.log('━'.repeat(70));
      console.log(`⏰ Expires in ${days} days`);
      console.log('');
      return data.access_token;
    } else {
      console.log('⚠️  Exchange failed, using short-lived token');
      return token;
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (page) {
      await page.screenshot({ path: '/tmp/fb-error.png' });
      console.log('📸 Error screenshot: /tmp/fb-error.png');
    }
    throw error;
  } finally {
    if (browser) {
      console.log('');
      console.log('🔒 Keeping browser open for 30 seconds for review...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      await browser.close();
    }
  }
}

generateTokenDirectDeveloper()
  .then(token => {
    console.log('═'.repeat(70));
    console.log('✅ SUCCESS - Token ready!');
    console.log('');
    console.log('📝 Next: Add to Replit Secrets as FACEBOOK_PAGE_ACCESS_TOKEN');
    process.exit(0);
  })
  .catch(error => {
    console.log('═'.repeat(70));
    console.log('❌ FAILED:', error.message);
    console.log('');
    console.log('💡 Alternative: Use manual method (5 min)');
    console.log('   See: docs/FACEBOOK_TOKEN_MANUAL_GUIDE.md');
    process.exit(1);
  });
