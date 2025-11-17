/**
 * FACEBOOK TOKEN GENERATOR - AUTONOMOUS BROWSER AUTOMATION
 * Uses Playwright to automate Facebook Developer Console token generation
 * Leverages Mr. Blue's "computer use" capabilities for autonomous setup
 * 
 * Security: Credentials stored in environment variables, never logged
 * 2FA Support: Manual code entry when prompted
 * Token Persistence: Auto-saves to environment variables
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

interface TokenGenerationResult {
  success: boolean;
  token?: string;
  expiresIn?: number;
  error?: string;
  steps?: string[];
}

export class FacebookTokenGenerator {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private executionSteps: string[] = [];

  /**
   * Log execution step
   */
  private log(step: string): void {
    this.executionSteps.push(step);
    console.log(`[FB Token Generator] ${step}`);
  }

  /**
   * Random delay to mimic human behavior
   */
  private async delay(min: number, max: number): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Initialize Playwright browser
   */
  private async initBrowser(headless: boolean = false): Promise<void> {
    this.log('Initializing browser...');
    this.browser = await chromium.launch({
      headless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });

    this.page = await this.context.newPage();
    this.log('Browser initialized successfully');
  }

  /**
   * Login to Facebook with 2FA support
   */
  private async loginToFacebook(email: string, password: string): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      this.log('Navigating to Facebook...');
      await this.page.goto('https://www.facebook.com/login', { waitUntil: 'domcontentloaded' });
      await this.delay(2000, 3000);

      this.log('Entering credentials...');
      await this.page.fill('input[name="email"]', email);
      await this.delay(500, 1000);
      await this.page.fill('input[name="pass"]', password);
      await this.delay(500, 1000);

      this.log('Clicking login button...');
      await this.page.click('button[name="login"]');
      await this.delay(3000, 5000);

      // Check for 2FA prompt
      const has2FA = await this.page.locator('text=/code|verification|two.*factor/i').count() > 0;
      
      if (has2FA) {
        this.log('⚠️  2FA DETECTED - Waiting for manual code entry (60 seconds)...');
        this.log('Please enter your 2FA code in the browser window');
        
        // Wait up to 60 seconds for 2FA completion
        await this.page.waitForURL('https://www.facebook.com/**', { 
          timeout: 60000,
          waitUntil: 'domcontentloaded'
        }).catch(() => {
          this.log('2FA timeout - proceeding anyway');
        });
        
        await this.delay(2000, 3000);
      }

      // Verify login success by checking for user profile elements
      const isLoggedIn = await this.page.evaluate(() => {
        return document.cookie.includes('c_user=');
      });

      if (isLoggedIn) {
        this.log('✅ Login successful!');
        return true;
      } else {
        this.log('❌ Login failed - not authenticated');
        return false;
      }

    } catch (error: any) {
      this.log(`❌ Login error: ${error.message}`);
      return false;
    }
  }

  /**
   * Navigate to Facebook Developers and generate token
   */
  private async navigateAndGenerateToken(appId: string): Promise<string | null> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      // Navigate to Access Token Tool
      this.log(`Navigating to Access Token Tool for App ID: ${appId}...`);
      const toolUrl = `https://developers.facebook.com/tools/accesstoken/?app_id=${appId}`;
      await this.page.goto(toolUrl, { waitUntil: 'domcontentloaded' });
      await this.delay(3000, 5000);

      // Look for Page Access Token section
      this.log('Looking for Page Access Token...');
      
      // Try multiple selectors to find the token
      const tokenSelectors = [
        'input[type="text"][value*="EAA"]', // Token usually starts with EAA
        'code:has-text("EAA")',
        'pre:has-text("EAA")',
        '[class*="token"] input',
        '[data-testid*="token"]'
      ];

      let token: string | null = null;

      for (const selector of tokenSelectors) {
        try {
          const element = await this.page.locator(selector).first();
          if (await element.count() > 0) {
            token = await element.inputValue().catch(() => element.textContent());
            if (token && token.startsWith('EAA')) {
              this.log(`✅ Token found using selector: ${selector}`);
              break;
            }
          }
        } catch (e) {
          // Try next selector
          continue;
        }
      }

      if (!token) {
        this.log('⚠️  Token not found automatically - looking for "Generate Token" button...');
        
        // Try to click "Generate Token" or "Get Access Token" button
        const buttonSelectors = [
          'button:has-text("Generate")',
          'button:has-text("Get Token")',
          'button:has-text("Access Token")',
          '[role="button"]:has-text("Generate")'
        ];

        for (const selector of buttonSelectors) {
          try {
            const button = await this.page.locator(selector).first();
            if (await button.count() > 0) {
              this.log(`Clicking: ${selector}`);
              await button.click();
              await this.delay(2000, 3000);
              
              // Try to get token again after clicking
              for (const tokenSelector of tokenSelectors) {
                const element = await this.page.locator(tokenSelector).first();
                if (await element.count() > 0) {
                  token = await element.inputValue().catch(() => element.textContent());
                  if (token && token.startsWith('EAA')) {
                    this.log('✅ Token generated successfully!');
                    break;
                  }
                }
              }
              
              if (token) break;
            }
          } catch (e) {
            continue;
          }
        }
      }

      if (token && token.startsWith('EAA')) {
        this.log(`✅ Token extracted: ${token.substring(0, 20)}...`);
        return token;
      } else {
        this.log('❌ Could not extract token');
        
        // Take screenshot for debugging
        const screenshotPath = '/tmp/fb-token-debug.png';
        await this.page.screenshot({ path: screenshotPath });
        this.log(`Screenshot saved to: ${screenshotPath}`);
        
        return null;
      }

    } catch (error: any) {
      this.log(`❌ Token generation error: ${error.message}`);
      return null;
    }
  }

  /**
   * MAIN: Generate Facebook Page Access Token autonomously
   * 
   * @param email - Facebook account email
   * @param password - Facebook account password
   * @param appId - Facebook App ID (from FACEBOOK_PAGE_ID env var)
   * @param headless - Run in headless mode (false for 2FA support)
   * @returns TokenGenerationResult
   */
  async generatePageAccessToken(
    email: string, 
    password: string, 
    appId: string,
    headless: boolean = false
  ): Promise<TokenGenerationResult> {
    this.executionSteps = [];
    
    try {
      this.log('🤖 Starting autonomous Facebook token generation...');
      this.log(`App ID: ${appId}`);
      this.log(`Headless: ${headless}`);

      // Step 1: Initialize browser
      await this.initBrowser(headless);

      // Step 2: Login to Facebook
      const loginSuccess = await this.loginToFacebook(email, password);
      if (!loginSuccess) {
        return {
          success: false,
          error: 'Facebook login failed - check credentials or 2FA',
          steps: this.executionSteps
        };
      }

      // Step 3: Navigate to Developer Console and generate token
      const token = await this.navigateAndGenerateToken(appId);
      
      if (!token) {
        return {
          success: false,
          error: 'Could not extract access token from Developer Console',
          steps: this.executionSteps
        };
      }

      this.log('✅ Token generation complete!');

      return {
        success: true,
        token,
        expiresIn: 5184000, // 60 days in seconds (typical for Page Access Tokens)
        steps: this.executionSteps
      };

    } catch (error: any) {
      this.log(`❌ Fatal error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        steps: this.executionSteps
      };
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Cleanup browser resources
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
      this.log('Browser cleanup complete');
    } catch (error) {
      console.error('[FB Token Generator] Cleanup error:', error);
    }
  }

  /**
   * Exchange short-lived token for long-lived token (60-90 days)
   */
  async exchangeForLongLivedToken(
    shortToken: string,
    appId: string,
    appSecret: string
  ): Promise<TokenGenerationResult> {
    try {
      this.log('Exchanging for long-lived token...');
      
      const axios = (await import('axios')).default;
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortToken
        }
      });

      const longLivedToken = response.data.access_token;
      const expiresIn = response.data.expires_in;

      this.log(`✅ Long-lived token obtained (expires in ${expiresIn / 86400} days)`);

      return {
        success: true,
        token: longLivedToken,
        expiresIn,
        steps: this.executionSteps
      };

    } catch (error: any) {
      this.log(`❌ Token exchange failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        steps: this.executionSteps
      };
    }
  }
}
