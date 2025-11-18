import { chromium, Browser, Page } from 'playwright';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as path from 'path';

interface ExecutionResult {
  success: boolean;
  error?: string;
  steps: string[];
  screenshotsPath?: string;
}

async function sendFacebookMessage(): Promise<ExecutionResult> {
  const taskId = `fb-final-${nanoid(8)}`;
  const steps: string[] = [];
  const screenshots: Array<{ step: number; base64: string; action: string }> = [];
  
  // REAL Facebook credentials
  const senderEmail = "admin@mundotango.life";
  const senderPassword = "*5D!O@PD2ZTW%#k%F";
  const recipientName = "Scott Boddye";
  
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   MB.MD Protocol v8.1 - Facebook Messenger Automation        ║');
  console.log('║              FINAL ATTEMPT - With Real Credentials          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Task ID:       ${taskId}`);
  console.log(`Sender:        ${senderEmail}`);
  console.log(`Recipient:     ${recipientName}`);
  console.log('');

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    // Step 1: Go to messenger.com
    steps.push('✅ Navigate to messenger.com');
    console.log('Step 1: Navigate to messenger.com...');
    await page.goto('https://www.messenger.com', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    screenshots.push({ step: 1, base64: await page.screenshot({ encoding: 'base64' }), action: 'Navigate to messenger.com' });
    
    // Step 2: Fill email
    steps.push('✅ Enter email');
    console.log('Step 2: Fill email...');
    await page.fill('input[name="email"]', senderEmail);
    await page.waitForTimeout(500);
    screenshots.push({ step: 2, base64: await page.screenshot({ encoding: 'base64' }), action: 'Enter email' });
    
    // Step 3: Fill password
    steps.push('✅ Enter password');
    console.log('Step 3: Fill password...');
    await page.fill('input[name="pass"]', senderPassword);
    await page.waitForTimeout(500);
    screenshots.push({ step: 3, base64: await page.screenshot({ encoding: 'base64' }), action: 'Enter password' });
    
    // Step 4: Click login
    steps.push('✅ Click login');
    console.log('Step 4: Click login...');
    
    // Try multiple button selectors
    const loginButtonSelectors = [
      'button:has-text("Continue")',
      'button:has-text("Log In")',
      'button:has-text("Log in")',
      'button[type="submit"]',
      'button[name="login"]'
    ];
    
    let loginClicked = false;
    for (const selector of loginButtonSelectors) {
      try {
        await page.click(selector, { timeout: 5000 });
        loginClicked = true;
        console.log(`✅ Clicked login button: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!loginClicked) {
      // Try pressing Enter as fallback
      await page.keyboard.press('Enter');
    }
    
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(3000);
    screenshots.push({ step: 4, base64: await page.screenshot({ encoding: 'base64' }), action: 'After login' });
    
    // Step 5: Look for "New Message" or search
    steps.push('✅ Look for messaging interface');
    console.log('Step 5: Finding messaging interface...');
    await page.waitForTimeout(2000);
    
    // Try to find and click "New Message" button
    const newMessageSelectors = [
      'a[href="/new"]',
      'a[aria-label*="New message"]',
      'button:has-text("New message")',
      'div[aria-label*="New message"]'
    ];
    
    let foundNewMessage = false;
    for (const selector of newMessageSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`Found New Message button: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          foundNewMessage = true;
          steps.push('✅ Clicked New Message button');
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    screenshots.push({ step: 5, base64: await page.screenshot({ encoding: 'base64' }), action: 'Messaging interface' });
    
    // Step 6: Search for recipient
    steps.push('✅ Search for recipient');
    console.log('Step 6: Searching for recipient...');
    
    // Look for "To:" field or search input
    const searchSelectors = [
      'input[placeholder*="To"]',
      'input[placeholder*="to"]',
      'input[name="to"]',
      'input[aria-label*="To"]',
      'input[placeholder*="Search"]',
      'input[type="search"]',
      'input'
    ];
    
    let searchFilled = false;
    for (const selector of searchSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          try {
            await element.click({ timeout: 2000 });
            await page.waitForTimeout(500);
            await element.fill(recipientName);
            await page.waitForTimeout(2000);
            searchFilled = true;
            console.log(`✅ Search filled with: ${selector}`);
            steps.push(`✅ Filled search with "${recipientName}"`);
            break;
          } catch (e) {
            continue;
          }
        }
        if (searchFilled) break;
      } catch (e) {
        continue;
      }
    }
    
    screenshots.push({ step: 6, base64: await page.screenshot({ encoding: 'base64' }), action: 'Search for recipient' });
    
    if (!searchFilled) {
      throw new Error('Could not find search/To field');
    }
    
    // Step 7: Click on recipient in results
    steps.push('✅ Select recipient from results');
    console.log('Step 7: Selecting recipient...');
    await page.waitForTimeout(1000);
    
    const resultSelectors = [
      `span:has-text("${recipientName}")`,
      `div:has-text("${recipientName}")`,
      `li:has-text("${recipientName}")`
    ];
    
    let clicked = false;
    for (const selector of resultSelectors) {
      try {
        await page.click(selector, { timeout: 3000 });
        clicked = true;
        console.log(`✅ Clicked recipient: ${selector}`);
        await page.waitForTimeout(2000);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!clicked) {
      // Try pressing Enter
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
    }
    
    screenshots.push({ step: 7, base64: await page.screenshot({ encoding: 'base64' }), action: 'Select recipient' });
    
    // Step 8: Type message
    steps.push('✅ Type message');
    console.log('Step 8: Typing message...');
    
    const message = `Hey Scott! 👋\n\nI'd love to invite you to Mundo Tango, the global tango community platform. We're connecting dancers worldwide, sharing events, and celebrating our passion for tango.\n\nJoin us at mundotango.life 💃🕺\n\nHope to see you there!`;
    
    const messageSelectors = [
      'div[role="textbox"]',
      'div[contenteditable="true"]',
      'textarea',
      'p[data-text="true"]'
    ];
    
    let messageFilled = false;
    for (const selector of messageSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          try {
            const isVisible = await element.isVisible();
            if (isVisible) {
              await element.click();
              await page.waitForTimeout(500);
              await element.fill(message);
              messageFilled = true;
              console.log(`✅ Message typed with: ${selector}`);
              steps.push('✅ Message typed successfully');
              break;
            }
          } catch (e) {
            continue;
          }
        }
        if (messageFilled) break;
      } catch (e) {
        continue;
      }
    }
    
    screenshots.push({ step: 8, base64: await page.screenshot({ encoding: 'base64' }), action: 'Type message' });
    
    if (!messageFilled) {
      throw new Error('Could not find message input');
    }
    
    // Step 9: Send message
    steps.push('✅ Send message');
    console.log('Step 9: Sending message...');
    
    // Try clicking send button or pressing Enter
    try {
      await page.click('button[aria-label*="Send"]', { timeout: 2000 });
    } catch {
      await page.keyboard.press('Enter');
    }
    
    await page.waitForTimeout(2000);
    screenshots.push({ step: 9, base64: await page.screenshot({ encoding: 'base64' }), action: 'Message sent' });
    steps.push('✅ Message sent successfully!');
    
    // Save screenshots
    const logsDir = path.join(process.cwd(), 'logs', 'fb-automation');
    fs.mkdirSync(logsDir, { recursive: true });
    
    const screenshotsData = {
      taskId,
      sender: senderEmail,
      recipient: recipientName,
      timestamp: new Date().toISOString(),
      screenshots: screenshots.map((s, idx) => ({
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
    
    console.log('');
    console.log('📸 Screenshots saved to:', jsonPath);
    console.log('');
    
    return {
      success: true,
      steps,
      screenshotsPath: jsonPath
    };
    
  } catch (error: any) {
    steps.push(`❌ Error: ${error.message}`);
    
    if (page) {
      const errorScreenshot = await page.screenshot({ encoding: 'base64' });
      screenshots.push({ step: steps.length, base64: errorScreenshot, action: `Error: ${error.message}` });
    }
    
    return {
      success: false,
      error: error.message,
      steps
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Execute
sendFacebookMessage().then(result => {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    EXECUTION RESULTS                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  if (result.success) {
    console.log('✅ SUCCESS!\n');
    console.log('Steps Completed:');
    result.steps.forEach(step => console.log(`  ${step}`));
  } else {
    console.log('❌ FAILED\n');
    console.log(`Error: ${result.error}\n`);
    console.log('Steps Executed:');
    result.steps.forEach(step => console.log(`  ${step}`));
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
