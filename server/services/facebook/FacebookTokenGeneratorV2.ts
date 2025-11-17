/**
 * FACEBOOK TOKEN GENERATOR V2 - PRODUCTION READY
 * 
 * Multi-strategy approach with 3 fallback methods:
 * 1. Direct Facebook login (email/password)
 * 2. Session cookie persistence (login once, reuse)
 * 3. Assisted mode (pause for manual intervention)
 * 
 * Enhanced with comprehensive selector strategies and error recovery
 */

import { chromium as playwrightChromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

playwrightChromium.use(StealthPlugin());

interface TokenResult {
  success: boolean;
  token?: string;
  tokenType?: 'short' | 'long';
  expiresIn?: number;
  error?: string;
  method?: string;
}

export class FacebookTokenGeneratorV2 {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private cookiesPath = path.join(process.cwd(), '.facebook-cookies.json');

  /**
   * Main entry point - tries multiple strategies
   */
  async generateToken(options: {
    appId: string;
    appSecret?: string;
    email?: string;
    password?: string;
    useSavedSession?: boolean;
    assistedMode?: boolean;
  }): Promise<TokenResult> {
    try {
      await this.initBrowser(options.assistedMode || false);

      // Strategy 1: Try saved session cookies
      if (options.useSavedSession && fs.existsSync(this.cookiesPath)) {
        console.log('📂 Attempting login with saved session...');
        const result = await this.trySessionLogin(options.appId);
        if (result.success) {
          console.log('✅ Session login successful!');
          return result;
        }
        console.log('⚠️  Session expired, trying fresh login...');
      }

      // Strategy 2: Direct Facebook login
      if (options.email && options.password) {
        console.log('🔐 Attempting direct Facebook login...');
        const result = await this.tryDirectLogin(
          options.appId,
          options.email,
          options.password,
          options.assistedMode || false
        );
        if (result.success) {
          console.log('✅ Direct login successful!');
          // Save session for future use
          await this.saveSession();
          
          // Exchange token if app secret provided
          if (result.token && options.appSecret) {
            return await this.exchangeToken(
              result.token,
              options.appId,
              options.appSecret
            );
          }
          return result;
        }
      }

      // Strategy 3: Assisted mode - pause for manual login
      if (options.assistedMode) {
        console.log('👤 Entering assisted mode...');
        return await this.assistedLogin(options.appId);
      }

      return {
        success: false,
        error: 'All login strategies failed'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Initialize browser with stealth configuration
   */
  private async initBrowser(visible: boolean): Promise<void> {
    this.browser = await playwrightChromium.launch({
      headless: !visible,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080'
      ]
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });

    this.page = await this.context.newPage();

    // Anti-detection
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      (window.navigator as any).chrome = { runtime: {} };
    });
  }

  /**
   * Try login with saved session cookies
   */
  private async trySessionLogin(appId: string): Promise<TokenResult> {
    try {
      if (!this.page || !this.context) throw new Error('Browser not initialized');

      // Load saved cookies
      const cookies = JSON.parse(fs.readFileSync(this.cookiesPath, 'utf8'));
      await this.context.addCookies(cookies);

      // Go directly to Graph API Explorer
      await this.page.goto('https://developers.facebook.com/tools/explorer/', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      await this.delay(2000, 3000);

      // Check if we're logged in
      const isLoggedIn = await this.isLoggedInToFacebook();
      if (!isLoggedIn) {
        return { success: false, error: 'Session expired' };
      }

      // Extract token
      return await this.extractTokenFromGraphAPI(appId);

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Direct Facebook login with comprehensive selector strategies
   */
  private async tryDirectLogin(
    appId: string,
    email: string,
    password: string,
    assistedMode: boolean
  ): Promise<TokenResult> {
    try {
      if (!this.page) throw new Error('Browser not initialized');

      console.log('🌐 Navigating to Facebook...');
      await this.page.goto('https://www.facebook.com/', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      await this.delay(2000, 3000);

      // Try multiple email field selectors
      const emailSelectors = [
        'input[name="email"]',
        'input[type="email"]',
        'input[id="email"]',
        'input[placeholder*="Email"]',
        'input[placeholder*="email"]',
        'input[aria-label*="Email"]',
        '#email'
      ];

      console.log('📧 Finding email field...');
      const emailField = await this.findElement(emailSelectors);
      if (!emailField) {
        throw new Error('Could not find email input field');
      }

      console.log('✍️  Entering email...');
      await this.typeHumanLike(emailField, email);
      await this.delay(500, 1000);

      // Try multiple password field selectors
      const passwordSelectors = [
        'input[name="pass"]',
        'input[type="password"]',
        'input[id="pass"]',
        'input[placeholder*="Password"]',
        'input[placeholder*="password"]',
        'input[aria-label*="Password"]',
        '#pass'
      ];

      console.log('🔒 Finding password field...');
      const passwordField = await this.findElement(passwordSelectors);
      if (!passwordField) {
        throw new Error('Could not find password input field');
      }

      console.log('✍️  Entering password...');
      await this.typeHumanLike(passwordField, password);
      await this.delay(500, 1000);

      // Try multiple login button selectors
      const loginButtonSelectors = [
        'button[name="login"]',
        'button[type="submit"]',
        'button:has-text("Log In")',
        'button:has-text("Log in")',
        'button[data-testid="royal_login_button"]',
        'input[type="submit"][value="Log In"]',
        'button[aria-label*="Log in"]'
      ];

      console.log('🔘 Finding login button...');
      const loginButton = await this.findElement(loginButtonSelectors);
      if (!loginButton) {
        throw new Error('Could not find login button');
      }

      console.log('🖱️  Clicking login...');
      await loginButton.click();
      
      // Wait for navigation
      await this.delay(3000, 5000);

      // Check for 2FA or security check
      const needs2FA = await this.page.locator('input[name="approvals_code"], input[placeholder*="code"], input[placeholder*="Code"]').first().isVisible({ timeout: 3000 }).catch(() => false);
      
      if (needs2FA && assistedMode) {
        console.log('⚠️  2FA detected - pausing for 60 seconds...');
        console.log('   Please enter your 2FA code in the browser window');
        await this.delay(60000, 60000);
      }

      // Verify login success
      const isLoggedIn = await this.isLoggedInToFacebook();
      if (!isLoggedIn) {
        // Take screenshot for debugging
        await this.page.screenshot({ path: '/tmp/fb-login-failed.png' });
        throw new Error('Login failed - check credentials or 2FA');
      }

      console.log('✅ Successfully logged in to Facebook');

      // Navigate to Graph API Explorer
      return await this.extractTokenFromGraphAPI(appId);

    } catch (error: any) {
      if (this.page) {
        await this.page.screenshot({ path: '/tmp/fb-direct-login-error.png' });
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Assisted mode - let user login manually, then extract token
   */
  private async assistedLogin(appId: string): Promise<TokenResult> {
    try {
      if (!this.page) throw new Error('Browser not initialized');

      console.log('👤 ASSISTED MODE ACTIVATED');
      console.log('═'.repeat(70));
      console.log('Please complete the following steps in the browser window:');
      console.log('');
      console.log('1. Log in to Facebook (if not already logged in)');
      console.log('2. Handle any 2FA or security checks');
      console.log('3. Wait for the script to continue...');
      console.log('');
      console.log('⏰ You have 120 seconds...');
      console.log('═'.repeat(70));

      await this.page.goto('https://www.facebook.com/', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait 2 minutes for user to login
      await this.delay(120000, 120000);

      // Check if logged in
      const isLoggedIn = await this.isLoggedInToFacebook();
      if (!isLoggedIn) {
        throw new Error('Not logged in after assisted mode timeout');
      }

      console.log('✅ Login detected, proceeding...');
      return await this.extractTokenFromGraphAPI(appId);

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract token from Graph API Explorer
   */
  private async extractTokenFromGraphAPI(appId: string): Promise<TokenResult> {
    try {
      if (!this.page) throw new Error('Browser not initialized');

      console.log('🛠️  Navigating to Graph API Explorer...');
      await this.page.goto('https://developers.facebook.com/tools/explorer/', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      await this.delay(3000, 4000);

      // Take screenshot of current state
      await this.page.screenshot({ path: '/tmp/fb-graph-api-state.png' });
      console.log('   📸 Screenshot: /tmp/fb-graph-api-state.png');

      // Try to click "Generate Access Token" button
      const tokenButtonSelectors = [
        'button:has-text("Generate Access Token")',
        'button:has-text("Get Token")',
        'button:has-text("Generate Token")',
        'button[aria-label*="token"]',
        'button[aria-label*="Token"]'
      ];

      const tokenButton = await this.findElement(tokenButtonSelectors, 5000);
      if (tokenButton) {
        console.log('🔘 Clicking generate token button...');
        await tokenButton.click();
        await this.delay(2000, 3000);

        // Handle permission dialog
        try {
          const continueButton = await this.findElement([
            'button:has-text("Continue")',
            'button:has-text("OK")',
            'button:has-text("Allow")'
          ], 3000);
          
          if (continueButton) {
            await continueButton.click();
            await this.delay(2000, 3000);
          }
        } catch (e) {
          // No dialog
        }
      }

      // Extract token from page
      const tokenSelectors = [
        'input[placeholder*="Access Token"]',
        'input[name*="token"]',
        'textarea[placeholder*="Access Token"]',
        'input[value^="EAA"]',
        'textarea[value^="EAA"]'
      ];

      for (const selector of tokenSelectors) {
        try {
          const element = this.page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            const value = await element.inputValue();
            if (value && value.startsWith('EAA')) {
              console.log('✅ Token extracted successfully!');
              return {
                success: true,
                token: value,
                tokenType: 'short',
                method: 'graph-api-explorer'
              };
            }
          }
        } catch (e) {
          continue;
        }
      }

      // If automated extraction failed, try text content
      const pageContent = await this.page.content();
      const tokenMatch = pageContent.match(/EAA[A-Za-z0-9-_]+/);
      if (tokenMatch) {
        console.log('✅ Token found in page content!');
        return {
          success: true,
          token: tokenMatch[0],
          tokenType: 'short',
          method: 'page-content'
        };
      }

      throw new Error('Could not extract token from Graph API Explorer');

    } catch (error: any) {
      if (this.page) {
        await this.page.screenshot({ path: '/tmp/fb-graph-api-error.png' });
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Exchange short-lived token for long-lived token
   */
  private async exchangeToken(
    shortToken: string,
    appId: string,
    appSecret: string
  ): Promise<TokenResult> {
    try {
      console.log('🔄 Exchanging for long-lived token...');

      const url = `https://graph.facebook.com/v21.0/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${appId}&` +
        `client_secret=${appSecret}&` +
        `fb_exchange_token=${shortToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.access_token) {
        const days = Math.floor(data.expires_in / 86400);
        console.log(`✅ Long-lived token generated (${days} days)`);
        
        return {
          success: true,
          token: data.access_token,
          tokenType: 'long',
          expiresIn: data.expires_in,
          method: 'token-exchange'
        };
      } else {
        console.log('⚠️  Exchange failed, returning short-lived token');
        return {
          success: true,
          token: shortToken,
          tokenType: 'short',
          method: 'no-exchange'
        };
      }
    } catch (error: any) {
      return {
        success: true,
        token: shortToken,
        tokenType: 'short',
        error: `Exchange failed: ${error.message}`
      };
    }
  }

  /**
   * Save session cookies for future use
   */
  private async saveSession(): Promise<void> {
    if (!this.context) return;
    
    try {
      const cookies = await this.context.cookies();
      fs.writeFileSync(this.cookiesPath, JSON.stringify(cookies, null, 2));
      console.log('💾 Session saved for future use');
    } catch (error: any) {
      console.log('⚠️  Failed to save session:', error.message);
    }
  }

  /**
   * Check if logged in to Facebook
   */
  private async isLoggedInToFacebook(): Promise<boolean> {
    if (!this.page) return false;

    const loginIndicators = [
      '[aria-label="Account"]',
      '[aria-label="Profile"]',
      '[aria-label="Your profile"]',
      'svg[aria-label="Your profile"]',
      'a[href*="/profile.php"]',
      'div[role="navigation"]'
    ];

    for (const selector of loginIndicators) {
      try {
        if (await this.page.locator(selector).first().isVisible({ timeout: 2000 })) {
          return true;
        }
      } catch (e) {
        continue;
      }
    }

    return false;
  }

  /**
   * Find element using multiple selectors
   */
  private async findElement(selectors: string[], timeout: number = 5000): Promise<any> {
    if (!this.page) return null;

    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout })) {
          return element;
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  }

  /**
   * Type with human-like delays
   */
  private async typeHumanLike(element: any, text: string): Promise<void> {
    for (const char of text) {
      await element.type(char);
      await this.delay(50, 150);
    }
  }

  /**
   * Random delay
   */
  private async delay(min: number, max: number): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup browser resources
   */
  private async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }
}
