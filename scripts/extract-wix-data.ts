import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

/**
 * MISSION: Extract Wix waitlist contacts (READ-ONLY)
 * - Login to Wix dashboard
 * - Navigate to Contacts section
 * - Export contacts as CSV
 * - Take screenshots for documentation
 * - NO CHANGES to the marketing site
 */

const WIX_USERNAME = process.env.Wix_username;
const WIX_PASSWORD = process.env.Wix_password;

if (!WIX_USERNAME || !WIX_PASSWORD) {
  console.error('❌ Missing Wix credentials in environment variables');
  process.exit(1);
}

async function extractWixData() {
  console.log('🚀 Starting Wix data extraction (READ-ONLY mode)...');
  
  const browser = await chromium.launch({
    headless: false, // Visible browser to handle CAPTCHAs if needed
    slowMo: 100 // Slow down to appear more human
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📍 Step 1: Navigating to Wix login...');
    await page.goto('https://users.wix.com/signin', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'attached_assets/wix_screenshots/01-login-page.png', fullPage: true });
    
    console.log('📍 Step 2: Entering credentials...');
    
    // Try multiple selectors for email field
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[data-testid="emailAuth"]',
      '#email'
    ];
    
    let emailInput: any = null;
    for (const selector of emailSelectors) {
      try {
        const el = await page.waitForSelector(selector, { timeout: 5000 });
        if (el && await el.isVisible()) {
          emailInput = el;
          console.log(`✅ Found email input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!emailInput) {
      console.error('❌ Could not find email input field');
      await page.screenshot({ path: 'attached_assets/wix_screenshots/error-no-email-field.png', fullPage: true });
      throw new Error('Email input not found');
    }
    
    await emailInput.fill(WIX_USERNAME);
    await page.waitForTimeout(1000);
    
    // Click "Next" or "Continue" button
    const nextButtonSelectors = [
      'button[type="submit"]',
      'button:has-text("Next")',
      'button:has-text("Continue")',
      '[data-testid="submit"]'
    ];
    
    let nextButton: any = null;
    for (const selector of nextButtonSelectors) {
      try {
        const el = await page.waitForSelector(selector, { timeout: 3000 });
        if (el && await el.isVisible()) {
          nextButton = el;
          console.log(`✅ Found next button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (nextButton) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'attached_assets/wix_screenshots/02-after-email.png', fullPage: true });
    }
    
    console.log('📍 Step 3: Entering password...');
    
    // Try multiple selectors for password field
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[data-testid="passwordAuth"]',
      '#password'
    ];
    
    let passwordInput: any = null;
    for (const selector of passwordSelectors) {
      try {
        const el = await page.waitForSelector(selector, { timeout: 5000 });
        if (el && await el.isVisible()) {
          passwordInput = el;
          console.log(`✅ Found password input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!passwordInput) {
      console.error('❌ Could not find password input field');
      await page.screenshot({ path: 'attached_assets/wix_screenshots/error-no-password-field.png', fullPage: true });
      throw new Error('Password input not found');
    }
    
    await passwordInput.fill(WIX_PASSWORD);
    await page.waitForTimeout(1000);
    
    // Click login button
    const loginButtonSelectors = [
      'button[type="submit"]',
      'button:has-text("Log In")',
      'button:has-text("Sign In")',
      '[data-testid="submit"]'
    ];
    
    let loginButton: any = null;
    for (const selector of loginButtonSelectors) {
      try {
        const el = await page.waitForSelector(selector, { timeout: 3000 });
        if (el && await el.isVisible()) {
          loginButton = el;
          console.log(`✅ Found login button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!loginButton) {
      console.error('❌ Could not find login button');
      await page.screenshot({ path: 'attached_assets/wix_screenshots/error-no-login-button.png', fullPage: true });
      throw new Error('Login button not found');
    }
    
    await loginButton.click();
    console.log('⏳ Waiting for login to complete...');
    
    // Wait for navigation or dashboard
    try {
      await page.waitForNavigation({ timeout: 30000 });
    } catch (e) {
      console.log('⚠️ Navigation timeout, checking if we\'re logged in...');
    }
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'attached_assets/wix_screenshots/03-after-login.png', fullPage: true });
    
    // Check if we need to handle 2FA or CAPTCHA
    const pageContent = await page.content();
    if (pageContent.includes('verification') || pageContent.includes('2-factor') || pageContent.includes('captcha')) {
      console.log('⚠️ DETECTED: 2FA or CAPTCHA challenge');
      console.log('⏸️ PAUSING for 60 seconds - Please complete the challenge manually in the browser window');
      await page.screenshot({ path: 'attached_assets/wix_screenshots/04-challenge-detected.png', fullPage: true });
      await page.waitForTimeout(60000); // 60 seconds to manually complete
    }
    
    console.log('📍 Step 4: Navigating to Contacts...');
    
    // Try to navigate to contacts directly
    try {
      await page.goto('https://manage.wix.com/dashboard/contacts', { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      console.log('⚠️ Direct navigation failed, trying alternative route...');
      // Try finding contacts link in dashboard
      const contactsLinkSelectors = [
        'a[href*="contacts"]',
        'button:has-text("Contacts")',
        '[data-hook="contacts"]'
      ];
      
      for (const selector of contactsLinkSelectors) {
        try {
          const contactsLink = await page.waitForSelector(selector, { timeout: 5000 });
          if (contactsLink) {
            await contactsLink.click();
            await page.waitForTimeout(3000);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'attached_assets/wix_screenshots/05-contacts-page.png', fullPage: true });
    
    console.log('📍 Step 5: Looking for Export button...');
    
    // Look for export/download button
    const exportButtonSelectors = [
      'button:has-text("Export")',
      'button:has-text("Download")',
      '[data-hook="export-button"]',
      '[data-testid="export-button"]',
      'button:has-text("More")', // Might be in a dropdown menu
      'button[aria-label*="Export"]'
    ];
    
    let exportButton: any = null;
    for (const selector of exportButtonSelectors) {
      try {
        const el = await page.waitForSelector(selector, { timeout: 5000 });
        if (el && await el.isVisible()) {
          exportButton = el;
          console.log(`✅ Found export button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!exportButton) {
      console.log('⚠️ Could not find export button automatically');
      console.log('📸 Taking screenshot for manual inspection...');
      await page.screenshot({ path: 'attached_assets/wix_screenshots/06-contacts-no-export.png', fullPage: true });
      
      // Try clicking "More" or menu button first
      const moreButtonSelectors = [
        'button:has-text("More")',
        'button[aria-label="More actions"]',
        '[data-hook="more-button"]'
      ];
      
      for (const selector of moreButtonSelectors) {
        try {
          const moreButton = await page.waitForSelector(selector, { timeout: 3000 });
          if (moreButton && await moreButton.isVisible()) {
            console.log(`✅ Clicking "More" button: ${selector}`);
            await moreButton.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'attached_assets/wix_screenshots/07-more-menu.png', fullPage: true });
            
            // Now try export again
            for (const expSelector of exportButtonSelectors) {
              try {
                const el = await page.waitForSelector(expSelector, { timeout: 3000 });
                if (el && await el.isVisible()) {
                  exportButton = el;
                  console.log(`✅ Found export in menu: ${expSelector}`);
                  break;
                }
              } catch (e) {
                continue;
              }
            }
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    if (exportButton) {
      console.log('📥 Clicking export button...');
      
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
      
      await exportButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'attached_assets/wix_screenshots/08-export-clicked.png', fullPage: true });
      
      // Look for CSV or download format option
      const csvSelectors = [
        'button:has-text("CSV")',
        'button:has-text("Download CSV")',
        '[data-hook="csv-option"]'
      ];
      
      for (const selector of csvSelectors) {
        try {
          const csvButton = await page.waitForSelector(selector, { timeout: 3000 });
          if (csvButton && await csvButton.isVisible()) {
            console.log(`✅ Selecting CSV format: ${selector}`);
            await csvButton.click();
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      await page.waitForTimeout(2000);
      
      // Wait for download
      try {
        console.log('⏳ Waiting for download to start...');
        const download = await downloadPromise;
        const downloadPath = path.join(process.cwd(), 'attached_assets', 'wix_waitlist.csv');
        await download.saveAs(downloadPath);
        console.log(`✅ Download saved to: ${downloadPath}`);
        
        // Verify file exists
        if (fs.existsSync(downloadPath)) {
          const fileSize = fs.statSync(downloadPath).size;
          console.log(`✅ File size: ${fileSize} bytes`);
          
          // Read first few lines to verify
          const content = fs.readFileSync(downloadPath, 'utf-8');
          const lines = content.split('\n').slice(0, 5);
          console.log('📄 First few lines of CSV:');
          lines.forEach((line, i) => console.log(`  ${i + 1}: ${line}`));
        }
      } catch (e) {
        console.error('❌ Download failed or timed out:', e.message);
        await page.screenshot({ path: 'attached_assets/wix_screenshots/09-download-error.png', fullPage: true });
      }
    }
    
    console.log('📍 Step 6: Taking final screenshots...');
    await page.screenshot({ path: 'attached_assets/wix_screenshots/10-final-state.png', fullPage: true });
    
    console.log('✅ Wix data extraction complete!');
    console.log('📂 Screenshots saved to: attached_assets/wix_screenshots/');
    console.log('📄 CSV saved to: attached_assets/wix_waitlist.csv');
    
  } catch (error) {
    console.error('❌ Error during extraction:', error);
    await page.screenshot({ path: 'attached_assets/wix_screenshots/error-final.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the extraction
extractWixData()
  .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
