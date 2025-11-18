import { chromium, Browser, Page } from 'playwright';

interface BrowserAutomationResult {
  success: boolean;
  data?: any;
  filePath?: string;
  error?: string;
  screenshots: Array<{ step: number; base64: string; action: string }>;
}

export class BrowserAutomationService {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
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

  async extractWixContacts(taskId: string): Promise<BrowserAutomationResult> {
    const screenshots: Array<{ step: number; base64: string; action: string }> = [];
    let stepNumber = 0;

    try {
      await this.initialize();
      this.page = await this.browser!.newPage();

      const wixEmail = process.env.WIX_EMAIL;
      const wixPassword = process.env.WIX_PASSWORD;

      if (!wixEmail || !wixPassword) {
        throw new Error('WIX_EMAIL or WIX_PASSWORD environment variables not set');
      }

      console.log(`[WixExtraction ${taskId}] Starting extraction...`);

      // Step 1: Navigate to Wix login
      stepNumber++;
      console.log(`[WixExtraction ${taskId}] Step ${stepNumber}: Navigate to Wix login`);
      await this.page.goto('https://manage.wix.com/dashboard', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      screenshots.push({
        step: stepNumber,
        base64: await this.takeScreenshot(),
        action: 'Navigate to Wix dashboard'
      });

      // Step 2: Fill in email
      stepNumber++;
      console.log(`[WixExtraction ${taskId}] Step ${stepNumber}: Fill in email`);
      await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
      await this.page.fill('input[type="email"], input[name="email"]', wixEmail);
      screenshots.push({
        step: stepNumber,
        base64: await this.takeScreenshot(),
        action: 'Enter email'
      });

      // Step 3: Click next/continue
      stepNumber++;
      console.log(`[WixExtraction ${taskId}] Step ${stepNumber}: Click next`);
      await this.page.click('button[type="submit"], button:has-text("Next"), button:has-text("Continue")');
      await this.page.waitForTimeout(2000);
      screenshots.push({
        step: stepNumber,
        base64: await this.takeScreenshot(),
        action: 'Click next/continue'
      });

      // Step 4: Fill in password
      stepNumber++;
      console.log(`[WixExtraction ${taskId}] Step ${stepNumber}: Fill in password`);
      await this.page.waitForSelector('input[type="password"], input[name="password"]', { timeout: 10000 });
      await this.page.fill('input[type="password"], input[name="password"]', wixPassword);
      screenshots.push({
        step: stepNumber,
        base64: await this.takeScreenshot(),
        action: 'Enter password'
      });

      // Step 5: Click login
      stepNumber++;
      console.log(`[WixExtraction ${taskId}] Step ${stepNumber}: Click login`);
      await this.page.click('button[type="submit"], button:has-text("Log In"), button:has-text("Sign In")');
      await this.page.waitForNavigation({ timeout: 30000 });
      screenshots.push({
        step: stepNumber,
        base64: await this.takeScreenshot(),
        action: 'Click login button'
      });

      // Step 6: Navigate to Contacts
      stepNumber++;
      console.log(`[WixExtraction ${taskId}] Step ${stepNumber}: Navigate to Contacts`);
      await this.page.waitForTimeout(3000); // Wait for dashboard to load
      
      // Try multiple selectors for Contacts menu
      const contactsSelectors = [
        'a[href*="contacts"]',
        'a:has-text("Contacts")',
        '[data-hook="contacts"]',
        'nav a:has-text("Contacts")'
      ];
      
      let clicked = false;
      for (const selector of contactsSelectors) {
        try {
          await this.page.click(selector, { timeout: 5000 });
          clicked = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!clicked) {
        throw new Error('Could not find Contacts menu item');
      }

      await this.page.waitForTimeout(3000);
      screenshots.push({
        step: stepNumber,
        base64: await this.takeScreenshot(),
        action: 'Navigate to Contacts'
      });

      // Step 7: Click Export
      stepNumber++;
      console.log(`[WixExtraction ${taskId}] Step ${stepNumber}: Click Export`);
      
      const exportSelectors = [
        'button:has-text("Export")',
        '[data-hook="export-button"]',
        'button[aria-label*="Export"]'
      ];
      
      clicked = false;
      for (const selector of exportSelectors) {
        try {
          await this.page.click(selector, { timeout: 5000 });
          clicked = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!clicked) {
        throw new Error('Could not find Export button');
      }

      await this.page.waitForTimeout(2000);
      screenshots.push({
        step: stepNumber,
        base64: await this.takeScreenshot(),
        action: 'Click Export button'
      });

      // Step 8: Select All Contacts & Download
      stepNumber++;
      console.log(`[WixExtraction ${taskId}] Step ${stepNumber}: Download contacts`);
      
      // Set up download listener
      const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });
      
      // Click download/export button
      const downloadSelectors = [
        'button:has-text("Download")',
        'button:has-text("Export")',
        '[data-hook="download-button"]'
      ];
      
      clicked = false;
      for (const selector of downloadSelectors) {
        try {
          await this.page.click(selector, { timeout: 5000 });
          clicked = true;
          break;
        } catch (e) {
          continue;
        }
      }

      // Wait for download
      const download = await downloadPromise;
      const filePath = `/tmp/wix_contacts_${taskId}.csv`;
      await download.saveAs(filePath);
      
      screenshots.push({
        step: stepNumber,
        base64: await this.takeScreenshot(),
        action: 'Download contacts CSV'
      });

      console.log(`[WixExtraction ${taskId}] Successfully extracted to: ${filePath}`);

      return {
        success: true,
        filePath,
        data: {
          totalSteps: stepNumber,
          message: 'Wix contacts extracted successfully',
          downloadedFile: filePath
        },
        screenshots
      };

    } catch (error: any) {
      console.error(`[WixExtraction ${taskId}] Error:`, error);
      
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
        error: error.message,
        screenshots
      };
    } finally {
      await this.cleanup();
    }
  }

  async executeCustomAutomation(
    taskId: string,
    instruction: string
  ): Promise<BrowserAutomationResult> {
    const screenshots: Array<{ step: number; base64: string; action: string }> = [];
    
    try {
      await this.initialize();
      this.page = await this.browser!.newPage();

      // For now, return error for custom automations
      // Future: Parse instruction and execute steps
      throw new Error('Custom browser automation not yet implemented. Use Wix extraction for now.');

    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        screenshots
      };
    } finally {
      await this.cleanup();
    }
  }
}

export const browserAutomationService = new BrowserAutomationService();
