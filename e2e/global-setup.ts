/**
 * MB.MD v9.9.4 - Playwright Global Setup
 * Ensures consistent browser configuration across all test runs
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('[Global Setup] Initializing Playwright for Replit environment...');
  
  // Find system Chromium
  const chromiumPath = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';
  
  // Set environment variable for all tests
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = chromiumPath;
  
  // Warm up browser by doing a quick launch/close cycle
  console.log('[Global Setup] Warming up browser...');
  try {
    const browser = await chromium.launch({
      headless: true,
      executablePath: chromiumPath,
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
      ],
    });
    const page = await browser.newPage();
    await page.goto(config.projects[0]?.use?.baseURL || 'http://localhost:5000', { 
      timeout: 30000,
      waitUntil: 'domcontentloaded' 
    });
    await browser.close();
    console.log('[Global Setup] ✅ Browser warm-up complete');
  } catch (error) {
    console.error('[Global Setup] Browser warm-up failed:', error);
    throw error;
  }
}

export default globalSetup;
