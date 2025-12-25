import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'marketing-assets/screenshots');
const BASE_URL = process.env.BASE_URL || 'https://mundo-tango.vercel.app';

// Configure for this test file
test.use({
  colorScheme: 'dark',
  viewport: { width: 1920, height: 1080 },
});

test.describe('Quick Marketing Screenshots', () => {
  // Increase timeout for slow-loading pages
  test.setTimeout(120000); // 2 minutes per test

  test('01 - Landing Page', async ({ page }) => {
    console.log('Navigating to:', `${BASE_URL}/landing`);
    
    try {
      // Navigate with extended timeout
      await page.goto(`${BASE_URL}/landing`, { 
        waitUntil: 'networkidle',
        timeout: 90000 // 90 seconds
      });
      
      // Wait a bit for any animations
      await page.waitForTimeout(2000);
      
      // Take screenshot
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'landing-page.png'),
        fullPage: true,
      });
      
      console.log('✓ Screenshot saved: landing-page.png');
    } catch (error) {
      console.error('✗ Failed to capture landing page:', error.message);
      throw error;
    }
  });

  test('02 - Feed Page (Public)', async ({ page }) => {
    console.log('Navigating to:', `${BASE_URL}/feed`);
    
    try {
      await page.goto(`${BASE_URL}/feed`, { 
        waitUntil: 'domcontentloaded', // Less strict wait condition
        timeout: 90000
      });
      
      await page.waitForTimeout(3000);
      
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'feed-page-public.png'),
        fullPage: false, // Just visible area
      });
      
      console.log('✓ Screenshot saved: feed-page-public.png');
    } catch (error) {
      console.error('✗ Failed to capture feed page:', error.message);
      throw error;
    }
  });

  test('03 - Events Page', async ({ page }) => {
    console.log('Navigating to:', `${BASE_URL}/events`);
    
    try {
      await page.goto(`${BASE_URL}/events`, { 
        waitUntil: 'domcontentloaded',
        timeout: 90000
      });
      
      await page.waitForTimeout(3000);
      
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'events-page.png'),
        fullPage: false,
      });
      
      console.log('✓ Screenshot saved: events-page.png');
    } catch (error) {
      console.error('✗ Failed to capture events page:', error.message);
      // Don't throw - continue with other tests
    }
  });
});
