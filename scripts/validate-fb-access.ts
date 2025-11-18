import { chromium, Browser, Page } from 'playwright';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as path from 'path';

interface AccountValidation {
  email: string;
  success: boolean;
  lastTwoMessages: Array<{ sender: string; preview: string }>;
  error?: string;
  screenshotsPath?: string;
}

async function validateFacebookAccess(email: string, password: string): Promise<AccountValidation> {
  const taskId = `fb-validate-${nanoid(8)}`;
  const screenshots: Array<{ step: number; base64: string; action: string }> = [];
  let browser: Browser | null = null;
  let page: Page | null = null;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📱 VALIDATING ACCESS: ${email}`);
  console.log(`${'='.repeat(70)}\n`);

  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();

    // Step 1: Navigate to Facebook
    console.log('Step 1: Navigate to facebook.com...');
    await page.goto('https://www.facebook.com', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    screenshots.push({ step: 1, base64: await page.screenshot({ encoding: 'base64' }), action: 'Navigate to Facebook' });

    // Step 2: Fill email
    console.log('Step 2: Fill email...');
    const emailSelectors = ['input[name="email"]', 'input[type="email"]', 'input[id="email"]'];
    for (const selector of emailSelectors) {
      try {
        await page.fill(selector, email, { timeout: 3000 });
        break;
      } catch (e) {
        continue;
      }
    }
    await page.waitForTimeout(500);
    screenshots.push({ step: 2, base64: await page.screenshot({ encoding: 'base64' }), action: 'Fill email' });

    // Step 3: Fill password
    console.log('Step 3: Fill password...');
    const passwordSelectors = ['input[name="pass"]', 'input[type="password"]', 'input[id="pass"]'];
    for (const selector of passwordSelectors) {
      try {
        await page.fill(selector, password, { timeout: 3000 });
        break;
      } catch (e) {
        continue;
      }
    }
    await page.waitForTimeout(500);
    screenshots.push({ step: 3, base64: await page.screenshot({ encoding: 'base64' }), action: 'Fill password' });

    // Step 4: Click login
    console.log('Step 4: Click login...');
    const loginSelectors = [
      'button[name="login"]',
      'button[type="submit"]',
      'button:has-text("Log In")',
      'button:has-text("Log in")'
    ];
    
    for (const selector of loginSelectors) {
      try {
        await page.click(selector, { timeout: 3000 });
        break;
      } catch (e) {
        continue;
      }
    }

    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(3000);
    screenshots.push({ step: 4, base64: await page.screenshot({ encoding: 'base64' }), action: 'After login' });

    // Step 5: Navigate to Messages
    console.log('Step 5: Navigate to messages...');
    await page.goto('https://www.facebook.com/messages', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000); // Wait for messages to load
    screenshots.push({ step: 5, base64: await page.screenshot({ encoding: 'base64' }), action: 'Messages page' });

    // Step 6: Extract last 2 messages
    console.log('Step 6: Extracting messages...');
    
    // Try to extract message information from the page
    const messages = await page.$$eval(
      'div[role="row"], div[role="listitem"], a[href*="/messages/t/"], div[data-testid*="message"]',
      (elements) => elements.slice(0, 10).map((el) => ({
        text: el.textContent?.trim().substring(0, 100) || '',
        html: el.innerHTML.substring(0, 200)
      }))
    );

    console.log(`\n📬 Found ${messages.length} potential message elements`);
    messages.forEach((msg, idx) => {
      console.log(`  ${idx + 1}. ${msg.text.substring(0, 60)}...`);
    });

    // Try to get more specific message data
    const conversationLinks = await page.$$eval(
      'a[href*="/messages/t/"]',
      (links) => links.slice(0, 5).map((link) => ({
        href: link.getAttribute('href'),
        text: link.textContent?.trim() || ''
      }))
    );

    console.log(`\n💬 Found ${conversationLinks.length} conversation links`);
    conversationLinks.forEach((conv, idx) => {
      console.log(`  ${idx + 1}. ${conv.text.substring(0, 60)} [${conv.href}]`);
    });

    screenshots.push({ step: 6, base64: await page.screenshot({ encoding: 'base64' }), action: 'Messages extracted' });

    // Save screenshots
    const logsDir = path.join(process.cwd(), 'logs', 'fb-validation');
    fs.mkdirSync(logsDir, { recursive: true });

    const screenshotsData = {
      taskId,
      email,
      timestamp: new Date().toISOString(),
      screenshots: screenshots.map((s) => ({
        step: s.step,
        action: s.action,
        imageFile: `${taskId}-step-${s.step}.png`
      }))
    };

    const jsonPath = path.join(logsDir, `${taskId}-screenshots.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(screenshotsData, null, 2));

    screenshots.forEach((s) => {
      const imgPath = path.join(logsDir, `${taskId}-step-${s.step}.png`);
      fs.writeFileSync(imgPath, Buffer.from(s.base64, 'base64'));
    });

    console.log(`\n📸 Screenshots saved: ${jsonPath}\n`);

    return {
      email,
      success: true,
      lastTwoMessages: conversationLinks.slice(0, 2).map((conv) => ({
        sender: conv.text || 'Unknown',
        preview: conv.href || ''
      })),
      screenshotsPath: jsonPath
    };

  } catch (error: any) {
    console.error(`\n❌ Error validating ${email}:`, error.message);
    
    // Save error screenshots
    if (page) {
      try {
        const errorScreenshot = await page.screenshot({ encoding: 'base64' });
        screenshots.push({ step: screenshots.length + 1, base64: errorScreenshot, action: `Error: ${error.message}` });
        
        const logsDir = path.join(process.cwd(), 'logs', 'fb-validation');
        fs.mkdirSync(logsDir, { recursive: true});
        
        screenshots.forEach((s) => {
          const imgPath = path.join(logsDir, `${taskId}-step-${s.step}.png`);
          fs.writeFileSync(imgPath, Buffer.from(s.base64, 'base64'));
        });
      } catch (e) {
        // Ignore screenshot errors
      }
    }

    return {
      email,
      success: false,
      lastTwoMessages: [],
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Main execution
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   MB.MD Protocol v8.1 - Facebook Account Validation          ║');
  console.log('║        PHASE 1 & 2: Prove Access to Both Accounts           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const accounts = [
    { email: 'admin@mundotango.life', password: '*5D!O@PD2ZTW%#k%F' },
    { email: 'sboddye@gmail.com', password: 'mdI!lSwg01uXV5rBF0q%jg%k^Xs#3*RR' }
  ];

  const results: AccountValidation[] = [];

  for (const account of accounts) {
    const result = await validateFacebookAccess(account.email, account.password);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between accounts
  }

  // Print final report
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    VALIDATION RESULTS                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  results.forEach((result, idx) => {
    console.log(`\n📧 Account ${idx + 1}: ${result.email}`);
    console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (result.success) {
      console.log(`\nLast 2 Messages:`);
      result.lastTwoMessages.forEach((msg, i) => {
        console.log(`  ${i + 1}. ${msg.sender}`);
        console.log(`     ${msg.preview}`);
      });
      console.log(`\n📸 Screenshots: ${result.screenshotsPath}`);
    } else {
      console.log(`Error: ${result.error}`);
    }
    console.log(`\n${'-'.repeat(70)}`);
  });

  const allSuccess = results.every(r => r.success);
  console.log(`\n${'═'.repeat(70)}`);
  console.log(allSuccess ? '✅ ALL ACCOUNTS VALIDATED - READY FOR PHASE 3' : '❌ VALIDATION FAILED - CANNOT PROCEED');
  console.log(`${'═'.repeat(70)}\n`);

  process.exit(allSuccess ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
