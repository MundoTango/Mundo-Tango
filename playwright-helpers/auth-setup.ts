/**
 * Playwright Authentication Setup Helper
 * 
 * This creates a reusable authenticated session that can be loaded
 * in tests to skip the login flow entirely.
 * 
 * Usage in tests:
 * 1. Run this once to create auth.json
 * 2. Load auth.json in test context
 * 3. Navigate directly to protected pages
 */

import { chromium, Browser, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, '../.playwright-auth.json');

interface AuthConfig {
  email: string;
  password: string;
  baseURL: string;
}

/**
 * Creates authenticated session and saves cookies/localStorage
 */
export async function setupAuthSession(config: AuthConfig): Promise<void> {
  const browser: Browser = await chromium.launch();
  const context: BrowserContext = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 Setting up authentication session...');
    
    // Navigate to login page
    await page.goto(`${config.baseURL}/login`);
    
    // Fill login form
    await page.fill('[data-testid="input-email"]', config.email);
    await page.fill('[data-testid="input-password"]', config.password);
    
    // Submit login (click the FORM button, not navbar)
    await page.click('[data-testid="button-login"]');
    
    // Wait for redirect (should go to / or /feed)
    await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
    
    // Verify login succeeded by checking for accessToken
    const hasToken = await page.evaluate(() => {
      return localStorage.getItem('accessToken') !== null;
    });
    
    if (!hasToken) {
      throw new Error('Authentication failed - no accessToken found');
    }
    
    console.log('✅ Login successful, saving session...');
    
    // Save authenticated state (cookies + localStorage)
    await context.storageState({ path: AUTH_FILE });
    
    console.log(`✅ Auth session saved to ${AUTH_FILE}`);
    console.log('📋 Tests can now use this session to bypass login');
    
  } catch (error) {
    console.error('❌ Auth setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Check if auth file exists and is valid
 */
export function hasValidAuthSession(): boolean {
  return fs.existsSync(AUTH_FILE);
}

/**
 * Get path to auth file for loading in tests
 */
export function getAuthFilePath(): string {
  return AUTH_FILE;
}

/**
 * Delete auth file (for cleanup or forced re-login)
 */
export function clearAuthSession(): void {
  if (fs.existsSync(AUTH_FILE)) {
    fs.unlinkSync(AUTH_FILE);
    console.log('🗑️  Auth session cleared');
  }
}

// CLI support: node playwright-helpers/auth-setup.ts
if (require.main === module) {
  const baseURL = process.env.BASE_URL || 'http://localhost:5000';
  const email = process.env.TEST_EMAIL || 'admin@mundotango.life';
  const password = process.env.TEST_PASSWORD || 'admin123';
  
  setupAuthSession({ email, password, baseURL })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
