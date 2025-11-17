import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';

const FACEBOOK_APP_ID = '1450658896233975'; // Mundo Tango app
const FACEBOOK_PAGE_ID = '344494435403137'; // @mundotango1

interface AutomationResult {
  success: boolean;
  token?: string;
  step: string;
  error?: string;
  manualActionRequired?: {
    url: string;
    instructions: string;
  };
}

async function waitForNavigation(page: Page, timeout = 10000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch (e) {
    // Continue even if timeout - some pages never fully idle
    console.log('⚠️  Navigation timeout (continuing anyway)');
  }
}

async function takeDebugScreenshot(page: Page, name: string) {
  const path = `/tmp/fb-messenger-${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 Debug screenshot: ${path}`);
}

async function addMessengerToApp(): Promise<AutomationResult> {
  let browser: Browser | null = null;
  
  try {
    console.log('\n🤖 AUTONOMOUS FACEBOOK MESSENGER SETUP');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Get credentials from environment
    const email = process.env.FACEBOOK_EMAIL;
    const password = process.env.FACEBOOK_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing FACEBOOK_EMAIL or FACEBOOK_PASSWORD in secrets');
    }

    console.log('📋 STEP 1: Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    // Add random delays to appear more human
    const randomDelay = () => new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    console.log('📋 STEP 2: Navigating to Facebook Developers...');
    await page.goto('https://developers.facebook.com/', { waitUntil: 'domcontentloaded' });
    await randomDelay();
    await takeDebugScreenshot(page, '01-homepage');

    console.log('📋 STEP 3: Clicking "My Apps"...');
    
    // Try multiple selectors for "My Apps" button
    const myAppsSelectors = [
      'a[href*="/apps"]',
      'text="My Apps"',
      'a:has-text("My Apps")',
      '[data-testid="my-apps"]',
      'button:has-text("My Apps")',
    ];

    let clicked = false;
    for (const selector of myAppsSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 3000, state: 'visible' });
        if (element) {
          await element.click();
          clicked = true;
          console.log(`✅ Clicked using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!clicked) {
      // Try direct navigation instead
      console.log('⚠️  Could not find "My Apps" button, navigating directly...');
      await page.goto(`https://developers.facebook.com/apps/${FACEBOOK_APP_ID}/dashboard/`, { waitUntil: 'domcontentloaded' });
    }

    await randomDelay();
    await takeDebugScreenshot(page, '02-after-my-apps-click');

    // Check if we need to login
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);

    if (currentUrl.includes('facebook.com/login') || currentUrl.includes('checkpoint')) {
      console.log('📋 STEP 4: Login required, filling credentials...');
      await takeDebugScreenshot(page, '03-login-page');

      // Wait for email field
      const emailSelectors = ['input[name="email"]', 'input[type="email"]', '#email'];
      let emailInput = null;
      for (const selector of emailSelectors) {
        try {
          emailInput = await page.waitForSelector(selector, { timeout: 3000 });
          if (emailInput) break;
        } catch (e) {}
      }

      if (!emailInput) {
        throw new Error('Could not find email input field');
      }

      await emailInput.fill(email);
      await randomDelay();

      // Fill password
      const passwordSelectors = ['input[name="pass"]', 'input[type="password"]', '#pass'];
      let passwordInput = null;
      for (const selector of passwordSelectors) {
        try {
          passwordInput = await page.waitForSelector(selector, { timeout: 3000 });
          if (passwordInput) break;
        } catch (e) {}
      }

      if (!passwordInput) {
        throw new Error('Could not find password input field');
      }

      await passwordInput.fill(password);
      await randomDelay();
      await takeDebugScreenshot(page, '04-credentials-filled');

      // Click login button
      const loginSelectors = [
        'button[name="login"]',
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Log In")',
        'button:has-text("Log in")',
      ];

      let loginButton = null;
      for (const selector of loginSelectors) {
        try {
          loginButton = await page.waitForSelector(selector, { timeout: 3000 });
          if (loginButton) break;
        } catch (e) {}
      }

      if (!loginButton) {
        throw new Error('Could not find login button');
      }

      await loginButton.click();
      console.log('✅ Login button clicked');
      
      // Wait for navigation after login
      await page.waitForTimeout(5000);
      await takeDebugScreenshot(page, '05-after-login');

      // Check for 2FA or security checkpoint
      const url = page.url();
      if (url.includes('checkpoint') || url.includes('two_factor') || url.includes('2fa')) {
        await takeDebugScreenshot(page, '06-2fa-checkpoint');
        
        return {
          success: false,
          step: 'login_2fa',
          manualActionRequired: {
            url: page.url(),
            instructions: `
🔐 MANUAL ACTION REQUIRED: 2FA/Security Checkpoint

Your Facebook account requires 2-factor authentication or security verification.

WHAT TO DO:
1. Open this URL in your browser: ${page.url()}
2. Complete the 2FA verification (enter code from authenticator app)
3. Complete any security checkpoints
4. Once you reach the Developers dashboard, come back here

After completing 2FA, we'll try a different approach to add Messenger.
            `.trim(),
          },
        };
      }
    }

    console.log('📋 STEP 5: Navigating to app dashboard...');
    await page.goto(`https://developers.facebook.com/apps/${FACEBOOK_APP_ID}/dashboard/`, { waitUntil: 'domcontentloaded' });
    await randomDelay();
    await takeDebugScreenshot(page, '07-app-dashboard');

    console.log('📋 STEP 6: Looking for "Add Product" or Messenger setup...');
    
    // Try to find and click "Add Product" or Messenger tile
    const addProductSelectors = [
      'text="Add Product"',
      'button:has-text("Add Product")',
      'a:has-text("Add Product")',
      '[data-testid="add-product"]',
    ];

    let addProductFound = false;
    for (const selector of addProductSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 3000 });
        if (element) {
          await element.click();
          addProductFound = true;
          console.log('✅ Clicked "Add Product"');
          break;
        }
      } catch (e) {}
    }

    if (!addProductFound) {
      console.log('⚠️  Could not find "Add Product" button, trying direct navigation...');
      await page.goto(`https://developers.facebook.com/apps/${FACEBOOK_APP_ID}/add/`, { waitUntil: 'domcontentloaded' });
    }

    await randomDelay();
    await takeDebugScreenshot(page, '08-add-product-page');

    console.log('📋 STEP 7: Looking for Messenger product tile...');
    
    // Try to find Messenger tile
    const messengerSelectors = [
      'text="Messenger"',
      '[data-testid="messenger-product"]',
      'button:has-text("Messenger")',
      'div:has-text("Messenger")',
    ];

    let messengerTile = null;
    for (const selector of messengerSelectors) {
      try {
        messengerTile = await page.waitForSelector(selector, { timeout: 3000 });
        if (messengerTile) {
          console.log(`✅ Found Messenger tile using: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    if (!messengerTile) {
      // Maybe Messenger is already added?
      console.log('⚠️  Could not find Messenger tile - checking if already configured...');
      await page.goto(`https://developers.facebook.com/apps/${FACEBOOK_APP_ID}/messenger/`, { waitUntil: 'domcontentloaded' });
      await randomDelay();
      await takeDebugScreenshot(page, '09-messenger-settings-check');
      
      const currentUrl = page.url();
      if (!currentUrl.includes('messenger')) {
        return {
          success: false,
          step: 'find_messenger_product',
          manualActionRequired: {
            url: `https://developers.facebook.com/apps/${FACEBOOK_APP_ID}/settings/basic/`,
            instructions: `
🔧 MANUAL ACTION REQUIRED: Add Messenger Product

I couldn't automatically find the "Add Product" section for Messenger.

WHAT TO DO:
1. Open this URL: https://developers.facebook.com/apps/${FACEBOOK_APP_ID}/settings/basic/
2. Look in the left sidebar for "Add Product" or a "+" icon
3. Click on it
4. Find the "Messenger" tile
5. Click "Set Up" on the Messenger tile
6. Come back here and run: npx tsx scripts/facebook-add-messenger-autonomous.ts

This will add Messenger Platform to your app.
            `.trim(),
          },
        };
      }
    } else {
      // Found Messenger tile, click "Set Up" button
      console.log('📋 STEP 8: Clicking "Set Up" on Messenger tile...');
      
      const setupSelectors = [
        'button:has-text("Set Up")',
        'button:has-text("Setup")',
        'a:has-text("Set Up")',
        'a:has-text("Setup")',
      ];

      let setupButton = null;
      for (const selector of setupSelectors) {
        try {
          // Find Setup button within the Messenger tile context
          setupButton = await messengerTile.locator(selector).first();
          if (setupButton && await setupButton.isVisible()) {
            await setupButton.click();
            console.log('✅ Clicked "Set Up" button');
            break;
          }
        } catch (e) {}
      }

      await randomDelay();
      await takeDebugScreenshot(page, '10-after-messenger-setup');
    }

    console.log('📋 STEP 9: Navigating to Messenger settings...');
    await page.goto(`https://developers.facebook.com/apps/${FACEBOOK_APP_ID}/messenger/settings/`, { waitUntil: 'domcontentloaded' });
    await randomDelay();
    await takeDebugScreenshot(page, '11-messenger-settings');

    console.log('📋 STEP 10: Looking for "Add or Remove Pages" / Token Generation...');
    
    const pageTokenSelectors = [
      'button:has-text("Add or Remove Pages")',
      'button:has-text("Add Page")',
      'button:has-text("Generate Token")',
      'a:has-text("Add or Remove Pages")',
    ];

    let pageTokenButton = null;
    for (const selector of pageTokenSelectors) {
      try {
        pageTokenButton = await page.waitForSelector(selector, { timeout: 5000 });
        if (pageTokenButton) {
          console.log(`✅ Found button using: ${selector}`);
          await pageTokenButton.click();
          await randomDelay();
          await takeDebugScreenshot(page, '12-after-add-pages-click');
          break;
        }
      } catch (e) {}
    }

    if (!pageTokenButton) {
      console.log('⚠️  Could not find "Add Pages" button');
      await takeDebugScreenshot(page, '13-no-add-pages-button');
      
      return {
        success: false,
        step: 'configure_page_permissions',
        manualActionRequired: {
          url: `https://developers.facebook.com/apps/${FACEBOOK_APP_ID}/messenger/settings/`,
          instructions: `
🔧 MANUAL ACTION REQUIRED: Configure Page Permissions

I've added Messenger to your app, but need manual help to configure page permissions.

WHAT TO DO:
1. Open this URL: https://developers.facebook.com/apps/${FACEBOOK_APP_ID}/messenger/settings/
2. Scroll to "Access Tokens" section
3. Click "Add or Remove Pages" button
4. In the popup, select your page: "Mundo Tango - @mundotango1"
5. Make sure "Manage and access Page conversations in Messenger" is set to YES
6. Click "Next" → "Done"
7. Click "Generate Token" next to your page name
8. Copy the token that appears
9. Run: npx tsx scripts/exchange-facebook-token.ts <PASTE_TOKEN_HERE>

Then you'll have a working 60-90 day token!
          `.trim(),
        },
      };
    }

    // Wait for permission dialog
    await page.waitForTimeout(3000);
    await takeDebugScreenshot(page, '14-permission-dialog');

    console.log('📋 STEP 11: Looking for page in permission dialog...');
    
    // Try to find and select the Mundo Tango page
    const pageSelectors = [
      `text="Mundo Tango"`,
      `input[value="${FACEBOOK_PAGE_ID}"]`,
      `label:has-text("Mundo Tango")`,
    ];

    let pageCheckbox = null;
    for (const selector of pageSelectors) {
      try {
        pageCheckbox = await page.waitForSelector(selector, { timeout: 5000 });
        if (pageCheckbox) {
          console.log(`✅ Found page using: ${selector}`);
          
          // Try to click the checkbox or label
          await pageCheckbox.click();
          await randomDelay();
          await takeDebugScreenshot(page, '15-page-selected');
          break;
        }
      } catch (e) {}
    }

    // Click Next/Continue button
    console.log('📋 STEP 12: Clicking Next/Continue...');
    const nextSelectors = [
      'button:has-text("Next")',
      'button:has-text("Continue")',
      'button:has-text("Done")',
    ];

    for (const selector of nextSelectors) {
      try {
        const button = await page.waitForSelector(selector, { timeout: 3000 });
        if (button) {
          await button.click();
          console.log(`✅ Clicked: ${selector}`);
          await randomDelay();
          await takeDebugScreenshot(page, '16-after-next-click');
          break;
        }
      } catch (e) {}
    }

    // Final step: Generate token
    console.log('📋 STEP 13: Looking for "Generate Token" button...');
    await page.waitForTimeout(3000);
    await takeDebugScreenshot(page, '17-final-state');

    const generateTokenSelectors = [
      'button:has-text("Generate Token")',
      'a:has-text("Generate Token")',
    ];

    let generateButton = null;
    for (const selector of generateTokenSelectors) {
      try {
        generateButton = await page.waitForSelector(selector, { timeout: 5000 });
        if (generateButton) {
          await generateButton.click();
          console.log('✅ Clicked "Generate Token"');
          await randomDelay();
          await takeDebugScreenshot(page, '18-after-generate-token');
          break;
        }
      } catch (e) {}
    }

    // Try to extract token from page
    console.log('📋 STEP 14: Extracting token from page...');
    await page.waitForTimeout(2000);
    
    const tokenSelectors = [
      'input[type="text"][readonly]',
      'input[value^="EAAG"]',
      'code:has-text("EAAG")',
      'pre:has-text("EAAG")',
    ];

    let token = null;
    for (const selector of tokenSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 3000 });
        if (element) {
          const value = await element.inputValue().catch(() => element.textContent());
          if (value && value.startsWith('EAAG')) {
            token = value;
            console.log(`✅ Found token using: ${selector}`);
            break;
          }
        }
      } catch (e) {}
    }

    await takeDebugScreenshot(page, '19-final-screenshot');

    if (!token) {
      return {
        success: false,
        step: 'extract_token',
        manualActionRequired: {
          url: `https://developers.facebook.com/apps/${FACEBOOK_APP_ID}/messenger/settings/`,
          instructions: `
🎉 ALMOST THERE! Manual Token Copy Required

I've successfully configured Messenger for your app! Now you just need to copy the token.

WHAT TO DO:
1. Open this URL: https://developers.facebook.com/apps/${FACEBOOK_APP_ID}/messenger/settings/
2. Scroll to "Access Tokens" section
3. You should see "Mundo Tango" with a token next to it
4. Click "Generate Token" if needed
5. Copy the token (starts with EAAG...)
6. Run: npx tsx scripts/exchange-facebook-token.ts <PASTE_TOKEN_HERE>

You're one step away from sending invitations!
          `.trim(),
        },
      };
    }

    console.log('✅ Token extracted successfully!');
    console.log(`Token preview: ${token.substring(0, 20)}...`);

    return {
      success: true,
      step: 'complete',
      token,
    };

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    return {
      success: false,
      step: 'error',
      error: error.message,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Main execution
async function main() {
  const result = await addMessengerToApp();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 AUTOMATION RESULT');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (result.success && result.token) {
    console.log('✅ SUCCESS! Token generated automatically!\n');
    console.log(`Token: ${result.token}\n`);
    console.log('📋 NEXT STEP: Exchange for long-lived token\n');
    console.log(`Run: npx tsx scripts/exchange-facebook-token.ts ${result.token}\n`);
  } else if (result.manualActionRequired) {
    console.log(`⚠️  MANUAL ACTION REQUIRED (Step: ${result.step})\n`);
    console.log(result.manualActionRequired.instructions);
    console.log(`\n🔗 URL: ${result.manualActionRequired.url}\n`);
  } else {
    console.log(`❌ FAILED at step: ${result.step}`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
  }

  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
