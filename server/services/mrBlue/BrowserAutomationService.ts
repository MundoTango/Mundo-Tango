import { chromium, Browser, Page } from 'playwright';
import { db } from '../../db';
import { browserAutomationRecordings, browserAutomationExecutions } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

interface BrowserAutomationResult {
  success: boolean;
  data?: any;
  filePath?: string;
  error?: string;
  screenshots: Array<{ step: number; base64: string; action: string }>;
}

interface BrowserAction {
  type: 'navigate' | 'click' | 'type' | 'wait' | 'screenshot' | 'extract' | 'scroll';
  selector?: string;
  value?: string;
  wait?: number;
  extractPattern?: string;
  url?: string;
}

interface Recording {
  id?: number;
  userId: number;
  name: string;
  description?: string;
  actions: BrowserAction[];
  startUrl: string;
  status?: string;
  metadata?: any;
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
      // Future: Parse instruction and execute steps using AI
      throw new Error('Custom browser automation not yet implemented. Use recorded sequences instead.');

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

  // ============================================================================
  // RECORDING & PLAYBACK SYSTEM
  // ============================================================================

  async saveRecording(recording: Recording): Promise<number> {
    const [result] = await db.insert(browserAutomationRecordings).values({
      userId: recording.userId,
      name: recording.name,
      description: recording.description,
      actions: recording.actions,
      startUrl: recording.startUrl,
      status: recording.status || 'draft',
      metadata: recording.metadata || {},
    }).returning({ id: browserAutomationRecordings.id });

    console.log(`[BrowserAutomation] ✅ Saved recording: ${recording.name} (ID: ${result.id})`);
    return result.id;
  }

  async updateRecording(recordingId: number, updates: Partial<Recording>): Promise<void> {
    await db.update(browserAutomationRecordings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(browserAutomationRecordings.id, recordingId));

    console.log(`[BrowserAutomation] ✅ Updated recording ID: ${recordingId}`);
  }

  async getRecording(recordingId: number): Promise<any> {
    const [recording] = await db.select()
      .from(browserAutomationRecordings)
      .where(eq(browserAutomationRecordings.id, recordingId));

    return recording;
  }

  async getUserRecordings(userId: number, status?: string): Promise<any[]> {
    const query = status
      ? and(
          eq(browserAutomationRecordings.userId, userId),
          eq(browserAutomationRecordings.status, status)
        )
      : eq(browserAutomationRecordings.userId, userId);

    const recordings = await db.select()
      .from(browserAutomationRecordings)
      .where(query)
      .orderBy(desc(browserAutomationRecordings.updatedAt));

    return recordings;
  }

  async deleteRecording(recordingId: number): Promise<void> {
    await db.delete(browserAutomationRecordings)
      .where(eq(browserAutomationRecordings.id, recordingId));

    console.log(`[BrowserAutomation] ✅ Deleted recording ID: ${recordingId}`);
  }

  async executeRecording(recordingId: number, userId: number): Promise<BrowserAutomationResult> {
    const screenshots: Array<{ step: number; base64: string; action: string }> = [];
    let stepNumber = 0;
    let executionId: number | null = null;

    try {
      // Load recording
      const recording = await this.getRecording(recordingId);
      if (!recording) {
        throw new Error(`Recording ${recordingId} not found`);
      }

      const actions = recording.actions as BrowserAction[];
      const totalSteps = actions.length;

      // Create execution record
      const [execution] = await db.insert(browserAutomationExecutions).values({
        recordingId,
        userId,
        status: 'running',
        totalSteps,
        stepsCompleted: 0,
      }).returning({ id: browserAutomationExecutions.id });

      executionId = execution.id;

      console.log(`[BrowserAutomation] Starting execution ${executionId} for recording: ${recording.name}`);

      // Initialize browser
      await this.initialize();
      this.page = await this.browser!.newPage();

      // Navigate to start URL
      await this.page.goto(recording.startUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      let extractedData: any = {};

      // Execute each action
      for (const action of actions) {
        stepNumber++;
        console.log(`[BrowserAutomation] Step ${stepNumber}/${totalSteps}: ${action.type}`);

        switch (action.type) {
          case 'navigate':
            if (action.url) {
              await this.page.goto(action.url, { waitUntil: 'networkidle', timeout: 30000 });
              screenshots.push({
                step: stepNumber,
                base64: await this.takeScreenshot(),
                action: `Navigate to ${action.url}`
              });
            }
            break;

          case 'click':
            if (action.selector) {
              await this.page.waitForSelector(action.selector, { timeout: 10000 });
              await this.page.click(action.selector);
              if (action.wait) {
                await this.page.waitForTimeout(action.wait);
              }
              screenshots.push({
                step: stepNumber,
                base64: await this.takeScreenshot(),
                action: `Click: ${action.selector}`
              });
            }
            break;

          case 'type':
            if (action.selector && action.value) {
              await this.page.waitForSelector(action.selector, { timeout: 10000 });
              await this.page.fill(action.selector, action.value);
              screenshots.push({
                step: stepNumber,
                base64: await this.takeScreenshot(),
                action: `Type into: ${action.selector}`
              });
            }
            break;

          case 'wait':
            if (action.wait) {
              await this.page.waitForTimeout(action.wait);
            } else if (action.selector) {
              await this.page.waitForSelector(action.selector, { timeout: 10000 });
            }
            screenshots.push({
              step: stepNumber,
              base64: await this.takeScreenshot(),
              action: 'Wait'
            });
            break;

          case 'screenshot':
            screenshots.push({
              step: stepNumber,
              base64: await this.takeScreenshot(),
              action: 'Screenshot'
            });
            break;

          case 'extract':
            if (action.selector) {
              const element = await this.page.$(action.selector);
              if (element) {
                const text = await element.textContent();
                extractedData[action.selector] = text;
              }
            }
            break;

          case 'scroll':
            if (action.value) {
              const distance = parseInt(action.value);
              await this.page.evaluate((dist) => {
                window.scrollBy(0, dist);
              }, distance);
            }
            screenshots.push({
              step: stepNumber,
              base64: await this.takeScreenshot(),
              action: 'Scroll'
            });
            break;
        }

        // Update execution progress
        await db.update(browserAutomationExecutions)
          .set({ stepsCompleted: stepNumber })
          .where(eq(browserAutomationExecutions.id, executionId));
      }

      // Mark execution as completed
      const duration = Date.now() - new Date(execution.startedAt).getTime();
      await db.update(browserAutomationExecutions).set({
        status: 'completed',
        completedAt: new Date(),
        duration,
        stepsCompleted: totalSteps,
        screenshots,
        result: extractedData,
      }).where(eq(browserAutomationExecutions.id, executionId));

      // Update recording stats
      const executions = await db.select()
        .from(browserAutomationExecutions)
        .where(eq(browserAutomationExecutions.recordingId, recordingId));

      const successCount = executions.filter(e => e.status === 'completed').length;
      const successRate = executions.length > 0 ? successCount / executions.length : 0;
      const avgDuration = executions.reduce((sum, e) => sum + (e.duration || 0), 0) / executions.length;

      await db.update(browserAutomationRecordings).set({
        executionCount: executions.length,
        lastExecutedAt: new Date(),
        successRate,
        averageDuration: Math.round(avgDuration),
      }).where(eq(browserAutomationRecordings.id, recordingId));

      console.log(`[BrowserAutomation] ✅ Execution ${executionId} completed successfully`);

      return {
        success: true,
        data: extractedData,
        screenshots
      };

    } catch (error: any) {
      console.error(`[BrowserAutomation] Execution failed:`, error);

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

      // Update execution record
      if (executionId) {
        const duration = Date.now() - new Date().getTime();
        await db.update(browserAutomationExecutions).set({
          status: 'failed',
          completedAt: new Date(),
          duration,
          errorMessage: error.message,
          errorStack: error.stack,
          screenshots,
        }).where(eq(browserAutomationExecutions.id, executionId));
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

  async getExecutionHistory(recordingId: number, limit = 10): Promise<any[]> {
    const executions = await db.select()
      .from(browserAutomationExecutions)
      .where(eq(browserAutomationExecutions.recordingId, recordingId))
      .orderBy(desc(browserAutomationExecutions.startedAt))
      .limit(limit);

    return executions;
  }
}

export const browserAutomationService = new BrowserAutomationService();
