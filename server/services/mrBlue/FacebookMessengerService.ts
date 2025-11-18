import { chromium, Browser, Page } from 'playwright';
import { llmVisionPlanner } from './LLMVisionPlanner';
import { db } from '../../db';
import { sql } from 'drizzle-orm';

interface FacebookAutomationResult {
  success: boolean;
  messagesSent: number;
  recipientNames: string[];
  error?: string;
  screenshots: Array<{ step: number; base64: string; action: string }>;
}

interface RateLimitStatus {
  canSend: boolean;
  dailyCount: number;
  hourlyCount: number;
  nextAvailable?: Date;
}

export class FacebookMessengerService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private maxSteps: number = 50;
  private stepTimeout: number = 30000; // 30s per step

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled', // Anti-detection
          '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });
    }
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async takeScreenshot(): Promise<string> {
    if (!this.page) throw new Error('No active page');
    const screenshot = await this.page.screenshot({ fullPage: false });
    return screenshot.toString('base64');
  }

  async checkRateLimit(userId: number): Promise<RateLimitStatus> {
    try {
      // Check daily limit (5 per day)
      const dailyResult = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM facebook_invites 
        WHERE user_id = ${userId} 
          AND sent_at > NOW() - INTERVAL '24 hours'
          AND status = 'sent'
      `);
      const dailyCount = parseInt(String(dailyResult.rows[0]?.count || 0));

      // Check hourly limit (1 per hour)
      const hourlyResult = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM facebook_invites 
        WHERE user_id = ${userId} 
          AND sent_at > NOW() - INTERVAL '1 hour'
          AND status = 'sent'
      `);
      const hourlyCount = parseInt(String(hourlyResult.rows[0]?.count || 0));

      const canSend = dailyCount < 5 && hourlyCount < 1;
      
      if (!canSend) {
        // Calculate next available time
        const nextAvailable = hourlyCount >= 1 
          ? new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
          : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        return { canSend: false, dailyCount, hourlyCount, nextAvailable };
      }

      return { canSend: true, dailyCount, hourlyCount };
    } catch (error: any) {
      console.error('[FacebookMessenger] Error checking rate limit:', error);
      return { canSend: false, dailyCount: 999, hourlyCount: 999 };
    }
  }

  async recordSentInvite(userId: number, recipientName: string, status: 'sent' | 'failed' | 'rate_limited'): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO facebook_invites (user_id, recipient_fb_name, sent_at, status, message_template)
        VALUES (${userId}, ${recipientName}, NOW(), ${status}, 'mundo_tango_invite')
      `);
    } catch (error: any) {
      console.error('[FacebookMessenger] Error recording invite:', error);
    }
  }

  async login(taskId: string, screenshots: Array<{ step: number; base64: string; action: string }>, startStep: number = 0): Promise<number> {
    let stepNumber = startStep;
    const fbEmail = process.env.FACEBOOK_EMAIL;
    const fbPassword = process.env.FACEBOOK_PASSWORD;

    if (!fbEmail || !fbPassword) {
      throw new Error('FACEBOOK_EMAIL or FACEBOOK_PASSWORD environment variables not set');
    }

    console.log(`[FacebookMessenger ${taskId}] Starting login flow...`);

    // Step 1: Navigate to Facebook
    stepNumber++;
    console.log(`[FacebookMessenger ${taskId}] Step ${stepNumber}: Navigate to Facebook`);
    await this.page!.goto('https://www.facebook.com', { 
      waitUntil: 'networkidle',
      timeout: this.stepTimeout 
    });
    screenshots.push({
      step: stepNumber,
      base64: await this.takeScreenshot(),
      action: 'Navigate to facebook.com'
    });

    // Step 2: Fill email
    stepNumber++;
    console.log(`[FacebookMessenger ${taskId}] Step ${stepNumber}: Fill email`);
    const emailSelectors = [
      'input[name="email"]',
      'input[type="email"]',
      'input#email',
      'input[placeholder*="Email"]'
    ];
    
    let filled = false;
    for (const selector of emailSelectors) {
      try {
        await this.page!.waitForSelector(selector, { timeout: 5000 });
        await this.page!.fill(selector, fbEmail);
        filled = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!filled) {
      throw new Error('Could not find email input field');
    }

    screenshots.push({
      step: stepNumber,
      base64: await this.takeScreenshot(),
      action: 'Enter email'
    });

    // Step 3: Fill password
    stepNumber++;
    console.log(`[FacebookMessenger ${taskId}] Step ${stepNumber}: Fill password`);
    const passwordSelectors = [
      'input[name="pass"]',
      'input[type="password"]',
      'input#pass',
      'input[placeholder*="Password"]'
    ];
    
    filled = false;
    for (const selector of passwordSelectors) {
      try {
        await this.page!.waitForSelector(selector, { timeout: 5000 });
        await this.page!.fill(selector, fbPassword);
        filled = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!filled) {
      throw new Error('Could not find password input field');
    }

    screenshots.push({
      step: stepNumber,
      base64: await this.takeScreenshot(),
      action: 'Enter password'
    });

    // Step 4: Click login
    stepNumber++;
    console.log(`[FacebookMessenger ${taskId}] Step ${stepNumber}: Click login`);
    const loginSelectors = [
      'button[name="login"]',
      'button[type="submit"]',
      'button:has-text("Log In")',
      'button:has-text("Log in")',
      'input[type="submit"][value*="Log"]'
    ];
    
    let clicked = false;
    for (const selector of loginSelectors) {
      try {
        await this.page!.click(selector, { timeout: 5000 });
        clicked = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!clicked) {
      throw new Error('Could not find login button');
    }

    // Wait for navigation after login
    await this.page!.waitForLoadState('networkidle', { timeout: this.stepTimeout });
    await this.page!.waitForTimeout(3000); // Additional wait for post-login redirects

    screenshots.push({
      step: stepNumber,
      base64: await this.takeScreenshot(),
      action: 'Click login and wait for redirect'
    });

    console.log(`[FacebookMessenger ${taskId}] Login complete`);
    return stepNumber;
  }

  async navigateToMessenger(taskId: string, stepNumber: number, screenshots: Array<{ step: number; base64: string; action: string }>, recipientFbUsername?: string): Promise<number> {
    // Step: Navigate to Messenger (carefully to preserve session)
    stepNumber++;
    
    console.log(`[FacebookMessenger ${taskId}] Step ${stepNumber}: Navigate to Messenger${recipientFbUsername ? ` and find ${recipientFbUsername}` : ''}`);
    
    // First go to main messenger page to ensure session is maintained
    await this.page!.goto('https://www.facebook.com/messages', {
      waitUntil: 'networkidle',
      timeout: this.stepTimeout
    });
    await this.page!.waitForTimeout(2000);
    
    // Check if we're still logged in
    const isLoginPage = await this.page!.evaluate(() => {
      return document.querySelector('input[name="email"]') !== null || 
             document.querySelector('input[placeholder*="Email"]') !== null ||
             document.body.textContent?.includes('Log Into Facebook') ||
             document.body.textContent?.includes('You must log in');
    });
    
    if (isLoginPage) {
      console.log(`[FacebookMessenger ${taskId}] ⚠️  Session lost! Re-authenticating...`);
      // Re-login if session was lost
      stepNumber = await this.login(taskId, screenshots, stepNumber);
      // Navigate back to messenger
      await this.page!.goto('https://www.facebook.com/messages', {
        waitUntil: 'networkidle',
        timeout: this.stepTimeout
      });
      await this.page!.waitForTimeout(2000);
    }
    
    // If we have a username, now navigate to their conversation
    if (recipientFbUsername) {
      console.log(`[FacebookMessenger ${taskId}] Navigating to conversation with ${recipientFbUsername}...`);
      await this.page!.goto(`https://www.facebook.com/messages/t/${recipientFbUsername}`, {
        waitUntil: 'networkidle',
        timeout: this.stepTimeout
      });
      await this.page!.waitForTimeout(3000);
    }

    screenshots.push({
      step: stepNumber,
      base64: await this.takeScreenshot(),
      action: recipientFbUsername ? `Navigate to conversation with ${recipientFbUsername}` : 'Navigate to Messenger'
    });

    return stepNumber;
  }

  async sendMessage(
    taskId: string,
    recipientName: string,
    messageTemplate: string,
    stepNumber: number,
    screenshots: Array<{ step: number; base64: string; action: string }>
  ): Promise<number> {
    // Step: Search for user
    stepNumber++;
    console.log(`[FacebookMessenger ${taskId}] Step ${stepNumber}: Search for ${recipientName}`);
    
    // Wait for page to fully load
    await this.page!.waitForTimeout(3000);
    
    // Comprehensive search selectors for Facebook Messenger
    const searchSelectors = [
      'input[placeholder*="Search"]',
      'input[placeholder*="search"]',
      'input[aria-label*="Search"]',
      'input[aria-label*="search"]',
      'input[type="search"]',
      'input[role="searchbox"]',
      'input[name="q"]',
      '[aria-label*="Search"] input',
      '[placeholder*="Search"] input',
      'div[role="search"] input',
      'input.x1i10hfl',  // Facebook's dynamic class (may change)
      'input[data-testid*="search"]'
    ];

    let searchFilled = false;
    for (const selector of searchSelectors) {
      try {
        console.log(`[FacebookMessenger ${taskId}] Trying selector: ${selector}`);
        await this.page!.waitForSelector(selector, { timeout: 3000 });
        await this.page!.click(selector); // Click first to focus
        await this.page!.waitForTimeout(500);
        await this.page!.fill(selector, recipientName);
        searchFilled = true;
        console.log(`[FacebookMessenger ${taskId}] ✅ Search box found with: ${selector}`);
        await this.page!.waitForTimeout(3000); // Wait for search results to load
        break;
      } catch (e) {
        console.log(`[FacebookMessenger ${taskId}] ❌ Failed with: ${selector}`);
        continue;
      }
    }

    if (!searchFilled) {
      // Take debug screenshot before throwing error
      screenshots.push({
        step: stepNumber,
        base64: await this.takeScreenshot(),
        action: `DEBUG: Could not find search box`
      });
      throw new Error(`Could not find search box for ${recipientName}. Tried ${searchSelectors.length} selectors.`);
    }

    screenshots.push({
      step: stepNumber,
      base64: await this.takeScreenshot(),
      action: `Search for ${recipientName}`
    });

    // Step: Click on user in results
    stepNumber++;
    console.log(`[FacebookMessenger ${taskId}] Step ${stepNumber}: Click on ${recipientName} in results`);
    
    // Try multiple selectors for search results
    const resultSelectors = [
      `a:has-text("${recipientName}")`,
      `div[role="link"]:has-text("${recipientName}")`,
      `span:has-text("${recipientName}")`,
    ];

    let resultClicked = false;
    for (const selector of resultSelectors) {
      try {
        await this.page!.click(selector, { timeout: 5000 });
        resultClicked = true;
        await this.page!.waitForTimeout(2000); // Wait for conversation to load
        break;
      } catch (e) {
        continue;
      }
    }

    if (!resultClicked) {
      throw new Error(`Could not find ${recipientName} in search results`);
    }

    screenshots.push({
      step: stepNumber,
      base64: await this.takeScreenshot(),
      action: `Open conversation with ${recipientName}`
    });

    // Step: Type message
    stepNumber++;
    console.log(`[FacebookMessenger ${taskId}] Step ${stepNumber}: Type message`);
    
    // Get message text based on template
    const messageText = this.getMessageTemplate(messageTemplate, recipientName);
    
    const messageInputSelectors = [
      'div[role="textbox"]',
      'div[contenteditable="true"]',
      'textarea[placeholder*="message"]',
      'p[data-text="true"]'
    ];

    let messageFilled = false;
    for (const selector of messageInputSelectors) {
      try {
        await this.page!.waitForSelector(selector, { timeout: 5000 });
        await this.page!.fill(selector, messageText);
        messageFilled = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!messageFilled) {
      throw new Error('Could not find message input box');
    }

    screenshots.push({
      step: stepNumber,
      base64: await this.takeScreenshot(),
      action: `Type invitation message`
    });

    // Step: Send message
    stepNumber++;
    console.log(`[FacebookMessenger ${taskId}] Step ${stepNumber}: Send message`);
    
    const sendSelectors = [
      'button[aria-label*="Send"]',
      'button:has-text("Send")',
      'div[aria-label*="Send"]',
      'button[type="submit"]'
    ];

    let sendClicked = false;
    for (const selector of sendSelectors) {
      try {
        await this.page!.click(selector, { timeout: 5000 });
        sendClicked = true;
        await this.page!.waitForTimeout(1000); // Wait for message to send
        break;
      } catch (e) {
        continue;
      }
    }

    if (!sendClicked) {
      // Fallback: Press Enter key
      try {
        await this.page!.keyboard.press('Enter');
        await this.page!.waitForTimeout(1000);
      } catch (e) {
        throw new Error('Could not send message');
      }
    }

    screenshots.push({
      step: stepNumber,
      base64: await this.takeScreenshot(),
      action: `Message sent to ${recipientName}`
    });

    console.log(`[FacebookMessenger ${taskId}] Message sent successfully to ${recipientName}`);
    return stepNumber;
  }

  async sendMessageDirect(
    taskId: string,
    recipientName: string,
    messageTemplate: string,
    stepNumber: number,
    screenshots: Array<{ step: number; base64: string; action: string }>
  ): Promise<number> {
    // Already at the conversation page, skip search
    // Just type and send the message
    
    // First, check if we need to click "Send message" button or similar
    stepNumber++;
    console.log(`[FacebookMessenger ${taskId}] Step ${stepNumber}: Inspect page and prepare for messaging`);
    
    // Try clicking common "Start messaging" buttons
    const startMessageButtons = [
      'button:has-text("Send message")',
      'button:has-text("Message")',
      'div[role="button"]:has-text("Send message")',
      'a:has-text("Send message")'
    ];
    
    for (const selector of startMessageButtons) {
      try {
        const element = await this.page!.$(selector);
        if (element) {
          console.log(`[FacebookMessenger ${taskId}] Found "Send message" button, clicking...`);
          await element.click();
          await this.page!.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    screenshots.push({
      step: stepNumber,
      base64: await this.takeScreenshot(),
      action: `Prepare for messaging`
    });
    
    // Step: Type message
    stepNumber++;
    console.log(`[FacebookMessenger ${taskId}] Step ${stepNumber}: Type message to ${recipientName}`);
    
    // Get message text based on template
    const messageText = this.getMessageTemplate(messageTemplate, recipientName);
    
    // Try intelligent element finding - look for ALL editable elements
    let messageFilled = false;
    
    try {
      console.log(`[FacebookMessenger ${taskId}] Inspecting page for editable elements...`);
      
      // Get all potentially editable elements
      const editableElements = await this.page!.$$eval(
        'div[contenteditable="true"], textarea, input[type="text"]',
        (elements) => elements.map((el, idx) => ({
          index: idx,
          tag: el.tagName,
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          placeholder: el.getAttribute('placeholder'),
          className: el.className,
          visible: el.offsetParent !== null
        }))
      );
      
      console.log(`[FacebookMessenger ${taskId}] Found ${editableElements.length} editable elements:`);
      editableElements.forEach((el, idx) => {
        console.log(`  ${idx}: ${el.tag} [visible:${el.visible}] role="${el.role}" aria-label="${el.ariaLabel}" placeholder="${el.placeholder}"`);
      });
      
      // Try each visible editable element
      for (let i = 0; i < editableElements.length; i++) {
        if (!editableElements[i].visible) continue;
        
        try {
          const selector = `(//div[@contenteditable="true"] | //textarea | //input[@type="text"])[${i + 1}]`;
          console.log(`[FacebookMessenger ${taskId}] Trying element ${i}...`);
          
          const element = await this.page!.locator(selector).first();
          await element.click({ timeout: 2000 });
          await this.page!.waitForTimeout(500);
          await element.fill(messageText);
          
          messageFilled = true;
          console.log(`[FacebookMessenger ${taskId}] ✅ Successfully filled element ${i}`);
          break;
        } catch (e) {
          console.log(`[FacebookMessenger ${taskId}] ❌ Element ${i} failed`);
          continue;
        }
      }
    } catch (error: any) {
      console.log(`[FacebookMessenger ${taskId}] Intelligent search failed: ${error.message}`);
    }
    
    // Fallback to standard selectors
    if (!messageFilled) {
      console.log(`[FacebookMessenger ${taskId}] Falling back to standard selectors...`);
      const messageInputSelectors = [
        'div[role="textbox"]',
        'div[contenteditable="true"]',
        'textarea[placeholder*="message"]',
        'textarea[placeholder*="Aa"]',
        'p[data-text="true"]',
        '[aria-label*="Message"] div[contenteditable="true"]',
        '[data-testid="message-input"]',
        'div.notranslate[contenteditable="true"]',
        'textarea',
        'input[type="text"]'
      ];

      for (const selector of messageInputSelectors) {
        try {
          console.log(`[FacebookMessenger ${taskId}] Trying selector: ${selector}`);
          await this.page!.waitForSelector(selector, { timeout: 3000 });
          await this.page!.click(selector);
          await this.page!.waitForTimeout(500);
          await this.page!.fill(selector, messageText);
          messageFilled = true;
          console.log(`[FacebookMessenger ${taskId}] ✅ Message input found with: ${selector}`);
          break;
        } catch (e) {
          console.log(`[FacebookMessenger ${taskId}] ❌ Failed with: ${selector}`);
          continue;
        }
      }
    }

    if (!messageFilled) {
      // Take final debug screenshot
      screenshots.push({
        step: stepNumber,
        base64: await this.takeScreenshot(),
        action: `ERROR: Could not find any message input`
      });
      throw new Error('Could not find message input box after trying all methods');
    }

    screenshots.push({
      step: stepNumber,
      base64: await this.takeScreenshot(),
      action: `Type invitation message`
    });

    // Step: Send message
    stepNumber++;
    console.log(`[FacebookMessenger ${taskId}] Step ${stepNumber}: Send message`);
    
    const sendSelectors = [
      'button[aria-label*="Send"]',
      'button:has-text("Send")',
      'div[aria-label*="Send"]',
      'button[type="submit"]',
      '[data-testid="send-button"]'
    ];

    let sendClicked = false;
    for (const selector of sendSelectors) {
      try {
        await this.page!.click(selector, { timeout: 5000 });
        sendClicked = true;
        await this.page!.waitForTimeout(2000); // Wait for message to send
        break;
      } catch (e) {
        continue;
      }
    }

    if (!sendClicked) {
      // Fallback: Press Enter key
      try {
        console.log(`[FacebookMessenger ${taskId}] Using Enter key fallback`);
        await this.page!.keyboard.press('Enter');
        await this.page!.waitForTimeout(2000);
      } catch (e) {
        throw new Error('Could not send message');
      }
    }

    screenshots.push({
      step: stepNumber,
      base64: await this.takeScreenshot(),
      action: `Message sent to ${recipientName}`
    });

    console.log(`[FacebookMessenger ${taskId}] Message sent successfully to ${recipientName}`);
    return stepNumber;
  }

  getMessageTemplate(templateName: string, recipientName: string): string {
    const templates: Record<string, string> = {
      'mundo_tango_invite': `Hey ${recipientName.split(' ')[0]}! 👋\n\nI'd love to invite you to Mundo Tango, the global tango community platform. We're connecting dancers worldwide, sharing events, and celebrating our passion for tango.\n\nJoin us at mundotango.life 💃🕺\n\nHope to see you there!`,
      'event_invite': `Hi ${recipientName.split(' ')[0]}! 🎵\n\nThere's an amazing tango event coming up that I think you'd love. Check it out on Mundo Tango: mundotango.life/events\n\nLet's dance! 💃`,
      'generic': `Hey ${recipientName.split(' ')[0]}! I wanted to share Mundo Tango with you - it's a great platform for the tango community. Check it out: mundotango.life`
    };

    return templates[templateName] || templates['generic'];
  }

  async sendInvitation(
    taskId: string,
    userId: number,
    recipientName: string,
    messageTemplate: string = 'mundo_tango_invite',
    recipientFbUsername?: string
  ): Promise<FacebookAutomationResult> {
    const screenshots: Array<{ step: number; base64: string; action: string }> = [];
    let stepNumber = 0;

    try {
      // Check rate limit first
      const rateLimit = await this.checkRateLimit(userId);
      if (!rateLimit.canSend) {
        await this.recordSentInvite(userId, recipientName, 'rate_limited');
        return {
          success: false,
          messagesSent: 0,
          recipientNames: [],
          error: `Rate limit exceeded. Daily: ${rateLimit.dailyCount}/5, Hourly: ${rateLimit.hourlyCount}/1. Next available: ${rateLimit.nextAvailable?.toLocaleString()}`,
          screenshots
        };
      }

      await this.initialize();
      this.page = await this.browser!.newPage();

      console.log(`[FacebookMessenger ${taskId}] Starting invitation to ${recipientName}${recipientFbUsername ? ` (${recipientFbUsername})` : ''}...`);

      // Execute login flow
      stepNumber = await this.login(taskId, screenshots);

      // Navigate to Messenger (with direct conversation link if username provided)
      stepNumber = await this.navigateToMessenger(taskId, stepNumber, screenshots, recipientFbUsername);

      // Send message (skip search if we have direct conversation)
      if (recipientFbUsername) {
        stepNumber = await this.sendMessageDirect(taskId, recipientName, messageTemplate, stepNumber, screenshots);
      } else {
        stepNumber = await this.sendMessage(taskId, recipientName, messageTemplate, stepNumber, screenshots);
      }

      // Record success
      await this.recordSentInvite(userId, recipientName, 'sent');

      console.log(`[FacebookMessenger ${taskId}] Successfully sent invitation to ${recipientName}`);

      return {
        success: true,
        messagesSent: 1,
        recipientNames: [recipientName],
        screenshots
      };

    } catch (error: any) {
      console.error(`[FacebookMessenger ${taskId}] Error:`, error);

      // Record failure
      await this.recordSentInvite(userId, recipientName, 'failed');

      // Take final error screenshot
      if (this.page) {
        try {
          screenshots.push({
            step: stepNumber + 1,
            base64: await this.takeScreenshot(),
            action: `Error: ${error.message}`
          });
        } catch (e) {
          // Ignore screenshot errors
        }
      }

      return {
        success: false,
        messagesSent: 0,
        recipientNames: [],
        error: error.message,
        screenshots
      };
    } finally {
      await this.cleanup();
    }
  }

  async sendBatchInvitations(
    taskId: string,
    userId: number,
    recipientNames: string[],
    messageTemplate: string = 'mundo_tango_invite'
  ): Promise<FacebookAutomationResult> {
    const screenshots: Array<{ step: number; base64: string; action: string }> = [];
    const successfulRecipients: string[] = [];
    let messagesSent = 0;

    try {
      await this.initialize();
      this.page = await this.browser!.newPage();

      console.log(`[FacebookMessenger ${taskId}] Starting batch invitations to ${recipientNames.length} recipients...`);

      // Login once
      let stepNumber = await this.login(taskId, screenshots);

      // Navigate to Messenger
      stepNumber = await this.navigateToMessenger(taskId, stepNumber, screenshots);

      // Send to each recipient
      for (const recipientName of recipientNames) {
        try {
          // Check rate limit before each send
          const rateLimit = await this.checkRateLimit(userId);
          if (!rateLimit.canSend) {
            console.log(`[FacebookMessenger ${taskId}] Rate limit reached after ${messagesSent} messages`);
            break;
          }

          // Send message
          stepNumber = await this.sendMessage(taskId, recipientName, messageTemplate, stepNumber, screenshots);
          
          await this.recordSentInvite(userId, recipientName, 'sent');
          successfulRecipients.push(recipientName);
          messagesSent++;

          // Wait between messages (anti-spam)
          await this.page!.waitForTimeout(5000);

        } catch (error: any) {
          console.error(`[FacebookMessenger ${taskId}] Failed to send to ${recipientName}:`, error.message);
          await this.recordSentInvite(userId, recipientName, 'failed');
          // Continue to next recipient
        }
      }

      return {
        success: messagesSent > 0,
        messagesSent,
        recipientNames: successfulRecipients,
        screenshots
      };

    } catch (error: any) {
      console.error(`[FacebookMessenger ${taskId}] Batch error:`, error);

      return {
        success: false,
        messagesSent,
        recipientNames: successfulRecipients,
        error: error.message,
        screenshots
      };
    } finally {
      await this.cleanup();
    }
  }
}

export const facebookMessengerService = new FacebookMessengerService();
