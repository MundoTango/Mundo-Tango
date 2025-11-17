/**
 * FACEBOOK TOKEN GENERATOR - GOOGLE OAUTH LOGIN
 * 
 * Uses Google admin account to login to Facebook via OAuth,
 * then extracts Facebook Page Access Token
 * 
 * Enhanced with stealth mode to bypass Facebook bot detection
 */

import { chromium, Browser, Page } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Apply stealth plugin
chromium.use(StealthPlugin());

const FACEBOOK_APP_ID = '122157503636969453';
const GOOGLE_USERNAME = process.env.Google_Admin_account_username;
const GOOGLE_PASSWORD = process.env.Google_Admin_account_password;

async function generateTokenViaGoogleOAuth() {
  console.log('🤖 MR. BLUE - FACEBOOK TOKEN GENERATION (Google OAuth)');
  console.log('═'.repeat(70));
  console.log('');

  if (!GOOGLE_USERNAME || !GOOGLE_PASSWORD) {
    throw new Error('Missing Google admin credentials in secrets');
  }

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Step 1: Initialize browser with stealth mode
    console.log('[1/7] 🌐 Launching browser with stealth mode...');
    browser = await chromium.launch({
      headless: false, // Visible for debugging
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: ['geolocation'],
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      }
    });

    page = await context.newPage();

    // Inject anti-detection scripts
    await page.addInitScript(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      
      // Override Chrome automation properties
      (window.navigator as any).chrome = { runtime: {} };
      
      // Mask permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) => 
        parameters.name === 'notifications' 
          ? Promise.resolve({ state: 'prompt' } as PermissionStatus)
          : originalQuery(parameters);
    });

    console.log('   ✅ Stealth mode activated');

    // Step 2: Go to Facebook login
    console.log('[2/7] 🔐 Navigating to Facebook...');
    await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle' });
    await randomDelay(2000, 4000);

    // Step 3: Click "Continue with Google" button
    console.log('[3/7] 🔘 Looking for "Continue with Google" button...');
    
    // Try multiple selectors for Google OAuth button
    const googleButtonSelectors = [
      'button:has-text("Continue with Google")',
      'button:has-text("Log in with Google")',
      'a:has-text("Continue with Google")',
      'div[role="button"]:has-text("Google")',
      '[data-testid*="google"]',
      'button[aria-label*="Google"]'
    ];

    let googleButtonFound = false;
    for (const selector of googleButtonSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`   ✅ Found Google button: ${selector}`);
          await button.click();
          googleButtonFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!googleButtonFound) {
      // If no Google button, try to find the regular login and look for OAuth options
      console.log('   ⚠️  Direct Google button not found, checking login page...');
      
      // Look for "Log In" button to access full login page
      try {
        const loginButton = page.locator('a:has-text("Log In"), a:has-text("Log in")').first();
        if (await loginButton.isVisible({ timeout: 3000 })) {
          await loginButton.click();
          await randomDelay(2000, 3000);
          
          // Now try Google button again
          for (const selector of googleButtonSelectors) {
            try {
              const button = page.locator(selector).first();
              if (await button.isVisible({ timeout: 2000 })) {
                console.log(`   ✅ Found Google button on login page: ${selector}`);
                await button.click();
                googleButtonFound = true;
                break;
              }
            } catch (e) {
              continue;
            }
          }
        }
      } catch (e) {
        // Continue to fallback
      }
    }

    if (!googleButtonFound) {
      throw new Error('Could not find "Continue with Google" button. Facebook may have changed their UI.');
    }

    await randomDelay(2000, 3000);

    // Step 4: Handle Google OAuth popup/redirect
    console.log('[4/7] 🔑 Handling Google OAuth login...');
    
    // Wait for Google login page
    await page.waitForURL(/accounts\.google\.com/, { timeout: 10000 });
    
    // Enter Google email
    console.log('   📧 Entering Google email...');
    await page.fill('input[type="email"]', GOOGLE_USERNAME, { timeout: 5000 });
    await randomDelay(500, 1000);
    await page.click('button:has-text("Next"), #identifierNext');
    await randomDelay(2000, 3000);

    // Enter Google password
    console.log('   🔐 Entering Google password...');
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await typeWithRandomDelay(page, 'input[type="password"]', GOOGLE_PASSWORD);
    await randomDelay(500, 1000);
    await page.click('button:has-text("Next"), #passwordNext');
    
    console.log('   ⏳ Waiting for Google authentication...');
    await randomDelay(3000, 5000);

    // Step 5: Wait for redirect back to Facebook
    console.log('[5/7] ↩️  Waiting for Facebook redirect...');
    await page.waitForURL(/facebook\.com/, { timeout: 30000 });
    await randomDelay(2000, 3000);

    // Verify login success
    const isLoggedIn = await page.locator('[aria-label="Account"], [aria-label="Profile"], svg[aria-label="Your profile"]').first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isLoggedIn) {
      throw new Error('Facebook login verification failed - not authenticated');
    }

    console.log('   ✅ Successfully logged in to Facebook via Google OAuth');

    // Step 6: Navigate to Facebook Developer Console
    console.log('[6/7] 🛠️  Navigating to Facebook Developer Console...');
    await page.goto(`https://developers.facebook.com/apps/${FACEBOOK_APP_ID}/dashboard/`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await randomDelay(2000, 3000);

    // Step 7: Extract Page Access Token
    console.log('[7/7] 🎫 Extracting Page Access Token...');
    
    // Navigate to Graph API Explorer
    await page.goto('https://developers.facebook.com/tools/explorer/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await randomDelay(2000, 3000);

    // Select the Facebook Page
    console.log('   📄 Selecting Mundo Tango page...');
    const pageSelector = page.locator('select, [role="combobox"]').first();
    await pageSelector.click();
    await randomDelay(1000, 2000);
    
    // Look for page option (try different selectors)
    const pageOptions = [
      'option:has-text("Mundo Tango")',
      'li:has-text("Mundo Tango")',
      '[role="option"]:has-text("Mundo Tango")'
    ];
    
    let pageSelected = false;
    for (const option of pageOptions) {
      try {
        await page.click(option, { timeout: 2000 });
        pageSelected = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!pageSelected) {
      console.log('   ⚠️  Could not auto-select page - manual selection may be needed');
    }

    await randomDelay(1000, 2000);

    // Generate token
    console.log('   🔐 Generating access token...');
    const generateButton = page.locator('button:has-text("Generate Access Token"), button:has-text("Get Token")').first();
    await generateButton.click({ timeout: 5000 });
    await randomDelay(2000, 3000);

    // Handle permission dialog
    try {
      const continueButton = page.locator('button:has-text("Continue"), button:has-text("OK")').first();
      if (await continueButton.isVisible({ timeout: 3000 })) {
        await continueButton.click();
        await randomDelay(2000, 3000);
      }
    } catch (e) {
      // No permission dialog needed
    }

    // Extract token from input field
    const tokenInput = page.locator('input[placeholder*="Access Token"], input[name*="token"]').first();
    const shortToken = await tokenInput.inputValue({ timeout: 5000 });

    if (!shortToken || !shortToken.startsWith('EAA')) {
      throw new Error('Failed to extract access token from Graph API Explorer');
    }

    console.log('   ✅ Short-lived token extracted');

    // Exchange for long-lived token
    console.log('');
    console.log('🔄 Exchanging for long-lived token...');
    
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    if (!appSecret) {
      console.log('⚠️  FACEBOOK_APP_SECRET not found - skipping exchange');
      console.log('Short-lived token (1 hour):');
      console.log('━'.repeat(70));
      console.log(shortToken);
      console.log('━'.repeat(70));
      return shortToken;
    }

    const exchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `client_secret=${appSecret}&` +
      `fb_exchange_token=${shortToken}`;

    const response = await fetch(exchangeUrl);
    const data = await response.json();

    if (data.access_token) {
      const expiresInDays = Math.floor(data.expires_in / (60 * 60 * 24));
      
      console.log('✅ SUCCESS! Long-lived token generated:');
      console.log('');
      console.log('━'.repeat(70));
      console.log(data.access_token);
      console.log('━'.repeat(70));
      console.log('');
      console.log(`⏰ Expires in: ${expiresInDays} days`);
      console.log('');
      console.log('📝 Next steps:');
      console.log('  1. Add to Replit Secrets: FACEBOOK_PAGE_ACCESS_TOKEN');
      console.log('  2. Run: npx tsx scripts/test-facebook-token.ts');
      console.log('');

      return data.access_token;
    } else {
      console.log('⚠️  Token exchange failed, returning short-lived token');
      console.log(shortToken);
      return shortToken;
    }

  } catch (error: any) {
    console.error('');
    console.error('❌ Token generation failed:', error.message);
    
    // Take debug screenshot
    if (page) {
      try {
        await page.screenshot({ path: '/tmp/fb-google-oauth-debug.png' });
        console.log('📸 Debug screenshot saved: /tmp/fb-google-oauth-debug.png');
      } catch (e) {
        // Screenshot failed
      }
    }
    
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Helper functions
async function randomDelay(min: number, max: number) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

async function typeWithRandomDelay(page: Page, selector: string, text: string) {
  const input = page.locator(selector).first();
  for (const char of text) {
    await input.type(char);
    await randomDelay(50, 150);
  }
}

// Run the generator
generateTokenViaGoogleOAuth()
  .then(token => {
    console.log('═'.repeat(70));
    console.log('✅ Token generation complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('═'.repeat(70));
    console.error('❌ FAILED:', error.message);
    process.exit(1);
  });
