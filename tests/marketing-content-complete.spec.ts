import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Complete Marketing Content Generator (Photos + Videos)
 * 
 * Purpose: Automatically capture high-quality screenshots AND videos of all platform features
 * for use in marketing materials, social media, and documentation.
 * 
 * Outputs:
 * - Screenshots: marketing-assets/screenshots/
 * - Videos: marketing-assets/videos/
 * 
 * Run with:
 * - All content: npx playwright test tests/marketing-content-complete.spec.ts
 * - Photos only: npx playwright test tests/marketing-content-complete.spec.ts -g "Screenshots"
 * - Videos only: npx playwright test tests/marketing-content-complete.spec.ts -g "Videos"
 */

const BASE_URL = process.env.BASE_URL || 'https://e0001089-5956-480e-9ebc-7b1a6c2ec0e7-00-3cydblgjeyjzl.worf.replit.dev';
const SCREENSHOTS_DIR = path.join(process.cwd(), 'marketing-assets/screenshots');
const VIDEOS_DIR = path.join(process.cwd(), 'marketing-assets/videos');


test.use({ colorScheme: "dark" });
// Ensure directories exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}
if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// Helper function to take screenshot
async function captureScreenshot(
    page: Page,
    featureName: string,
    options: { waitFor?: string; scroll?: boolean } = {}
  ) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${featureName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

  if (options.waitFor) {
        await page.waitForSelector(options.waitFor, { timeout: 10000 }).catch(() => {});
  }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

  if (options.scroll) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot: ${filename}`);
}

test.describe('Marketing Screenshots - All Features', () => {
    test.use({
          viewport: { width: 1920, height: 1080 },
          deviceScaleFactor: 2,
    });

                test.beforeEach(async ({ page }) => {
                            // Skip login - marketing screenshots don't require authentication
                            page.setDefaultTimeout(90000); // Increase timeout to 90 seconds
                });

                test('01 - Memory Feed', async ({ page }) => {
                      await page.goto(`${BASE_URL}/feed`);
                      await captureScreenshot(page, 'memory-feed', { scroll: true });
                });

                test('02 - Events Discovery - List', async ({ page }) => {
                      await page.goto(`${BASE_URL}/events`);
                      await captureScreenshot(page, 'events-list', { scroll: true });
                });

                test('03 - Events Discovery - Calendar', async ({ page }) => {
                      await page.goto(`${BASE_URL}/events`);
                      await page.click('button:has-text("Calendar")').catch(() => {});
                      await page.waitForTimeout(1000);
                      await captureScreenshot(page, 'events-calendar');
                });

                test('04 - Events Discovery - Map', async ({ page }) => {
                      await page.goto(`${BASE_URL}/events`);
                      await page.click('button:has-text("Map")').catch(() => {});
                      await page.waitForTimeout(2000);
                      await captureScreenshot(page, 'events-map');
                });

                test('05 - Housing Marketplace', async ({ page }) => {
                      await page.goto(`${BASE_URL}/housing`);
                      await captureScreenshot(page, 'housing-marketplace', { scroll: true });
                });

                test('06 - Professional Network', async ({ page }) => {
                      await page.goto(`${BASE_URL}/pro/organizers`);
                      await captureScreenshot(page, 'pro-network', { scroll: true });
                });

                test('07 - Community Groups', async ({ page }) => {
                      await page.goto(`${BASE_URL}/groups`);
                      await captureScreenshot(page, 'community-groups', { scroll: true });
                });

                test('08 - Community World Map', async ({ page }) => {
                      await page.goto(`${BASE_URL}/community-world-map`);
                      await page.waitForTimeout(3000);
                      await captureScreenshot(page, 'community-world-map');
                });

                test('09 - User Profile', async ({ page }) => {
                      await page.goto(`${BASE_URL}/profile`);
                      await captureScreenshot(page, 'user-profile', { scroll: true });
                });

                test('10 - Messaging', async ({ page }) => {
                      await page.goto(`${BASE_URL}/messages`);
                      await captureScreenshot(page, 'messaging');
                });

                test('11 - Mr. Blue AI Assistant', async ({ page }) => {
                      await page.goto(`${BASE_URL}/feed`);
                      await page.click('button:has-text("Ask Mr. Blue")').catch(() => {});
                      await page.waitForTimeout(1000);
                      await captureScreenshot(page, 'mr-blue-ai');
                });

                test('12 - Life CEO Agents', async ({ page }) => {
                      await page.goto(`${BASE_URL}/life-ceo`);
                      await captureScreenshot(page, 'life-ceo-agents', { scroll: true });
                });

                test('13 - Mobile - Memory Feed', async ({ page }) => {
                      await page.setViewportSize({ width: 375, height: 812 });
                      await page.goto(`${BASE_URL}/feed`);
                      await captureScreenshot(page, 'mobile-memory-feed');
                });

                test('14 - Mobile - Events', async ({ page }) => {
                      await page.setViewportSize({ width: 375, height: 812 });
                      await page.goto(`${BASE_URL}/events`);
                      await captureScreenshot(page, 'mobile-events');
                });
});

test.describe('Marketing Videos - All Features', () => {
    test.use({
          viewport: { width: 1920, height: 1080 },
          video: {
                  mode: 'on',
                  size: { width: 1920, height: 1080 }
          },
    });

    test.beforeEach(async ({ page }) => {
        // Skip login - marketing videos don't require authentication
        page.setDefaultTimeout(90000);
    });

                test('Video 01 - Memory Feed Demo', async ({ page }) => {
                      console.log('🎥 Recording: Memory Feed');
                      await page.goto(`${BASE_URL}/feed`);
                      await page.waitForLoadState('networkidle');
                      await page.waitForTimeout(2000);
                      await page.evaluate(() => window.scrollTo(0, 300));
                      await page.waitForTimeout(2000);
                      await page.evaluate(() => window.scrollTo(0, 600));
                      await page.waitForTimeout(2000);
                      await page.evaluate(() => window.scrollTo(0, 0));
                      await page.waitForTimeout(2000);
                      console.log('✅ Recorded: Memory Feed');
                });

                test('Video 02 - Events Discovery Demo', async ({ page }) => {
                      console.log('🎥 Recording: Events Discovery');
                      await page.goto(`${BASE_URL}/events`);
                      await page.waitForLoadState('networkidle');
                      await page.waitForTimeout(2000);
                      await page.evaluate(() => window.scrollTo(0, 400));
                      await page.waitForTimeout(2000);
                      await page.click('button:has-text("Calendar")').catch(() => {});
                      await page.waitForTimeout(3000);
                      await page.click('button:has-text("Map")').catch(() => {});
                      await page.waitForTimeout(3000);
                      console.log('✅ Recorded: Events Discovery');
                });

                test('Video 03 - Housing Marketplace Demo', async ({ page }) => {
                      console.log('🎥 Recording: Housing Marketplace');
                      await page.goto(`${BASE_URL}/housing`);
                      await page.waitForLoadState('networkidle');
                      await page.waitForTimeout(2000);
                      await page.evaluate(() => window.scrollTo(0, 400));
                      await page.waitForTimeout(2000);
                      await page.evaluate(() => window.scrollTo(0, 800));
                      await page.waitForTimeout(2000);
                      console.log('✅ Recorded: Housing Marketplace');
                });

                test('Video 04 - Community Features Demo', async ({ page }) => {
                      console.log('🎥 Recording: Community Features');
                      await page.goto(`${BASE_URL}/groups`);
                      await page.waitForLoadState('networkidle');
                      await page.waitForTimeout(2000);
                      await page.evaluate(() => window.scrollTo(0, 400));
                      await page.waitForTimeout(2000);
                      await page.goto(`${BASE_URL}/community-world-map`);
                      await page.waitForTimeout(3000);
                      console.log('✅ Recorded: Community Features');
                });

                test('Video 05 - Professional Network Demo', async ({ page }) => {
                      console.log('🎥 Recording: Professional Network');
                      await page.goto(`${BASE_URL}/pro/organizers`);
                      await page.waitForLoadState('networkidle');
                      await page.waitForTimeout(2000);
                      await page.evaluate(() => window.scrollTo(0, 400));
                      await page.waitForTimeout(2000);
                      console.log('✅ Recorded: Professional Network');
                });

                test('Video 06 - AI Assistant Demo', async ({ page }) => {
                      console.log('🎥 Recording: AI Assistant');
                      await page.goto(`${BASE_URL}/feed`);
                      await page.waitForLoadState('networkidle');
                      await page.click('button:has-text("Ask Mr. Blue")').catch(() => {});
                      await page.waitForTimeout(3000);
                      console.log('✅ Recorded: AI Assistant');
                });

                test('Video 07 - Complete User Journey', async ({ page }) => {
                      console.log('🎥 Recording: Complete User Journey');
                      await page.goto(`${BASE_URL}/feed`);
                      await page.waitForTimeout(2000);
                      await page.goto(`${BASE_URL}/events`);
                      await page.waitForTimeout(2000);
                      await page.evaluate(() => window.scrollTo(0, 300));
                      await page.waitForTimeout(2000);
                      await page.goto(`${BASE_URL}/housing`);
                      await page.waitForTimeout(2000);
                      await page.evaluate(() => window.scrollTo(0, 300));
                      await page.waitForTimeout(2000);
                      await page.goto(`${BASE_URL}/groups`);
                      await page.waitForTimeout(2000);
                      await page.goto(`${BASE_URL}/profile`);
                      await page.waitForTimeout(2000);
                      console.log('✅ Recorded: Complete User Journey');
                });
});
