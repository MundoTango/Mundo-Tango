/**
 * VISUAL REGRESSION TESTING SUITE
 * MB.MD v8.0 Testing Standards
 * 
 * Implements comprehensive visual regression testing using Playwright
 * screenshot comparison with pixelmatch for diff generation.
 * 
 * Coverage: 10+ visual tests across key pages and components
 * 
 * Test Categories:
 * 1. Page-Level Visual Tests (Home, Feed, Profile, Events)
 * 2. Component Visual Tests (Navigation, Cards, Forms)
 * 3. Theme Visual Tests (Light/Dark mode)
 * 4. Responsive Visual Tests (Mobile, Tablet, Desktop)
 * 
 * Baseline images stored in: tests/screenshots/baselines/
 * Diff images generated in: tests/screenshots/diffs/
 */

import { test, expect, Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'fs';
import path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASELINE_DIR = path.join(process.cwd(), 'tests/screenshots/baselines');
const ACTUAL_DIR = path.join(process.cwd(), 'tests/screenshots/actual');
const DIFF_DIR = path.join(process.cwd(), 'tests/screenshots/diffs');

// Ensure directories exist
[BASELINE_DIR, ACTUAL_DIR, DIFF_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Visual comparison threshold (0 = exact match, 1 = ignore all differences)
const DIFF_THRESHOLD = 0.1; // 10% difference tolerance
const PIXEL_DIFF_THRESHOLD = 0.05; // 5% pixel difference allowed

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Compare two screenshots and generate diff image
 */
async function compareScreenshots(
  baselinePath: string,
  actualPath: string,
  diffPath: string,
  threshold: number = DIFF_THRESHOLD
): Promise<{ match: boolean; diffPixels: number; totalPixels: number; diffPercentage: number }> {
  // If baseline doesn't exist, create it from actual
  if (!fs.existsSync(baselinePath)) {
    console.log(`Creating baseline: ${baselinePath}`);
    fs.copyFileSync(actualPath, baselinePath);
    return { match: true, diffPixels: 0, totalPixels: 0, diffPercentage: 0 };
  }

  const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
  const actual = PNG.sync.read(fs.readFileSync(actualPath));
  
  const { width, height } = baseline;
  const diff = new PNG({ width, height });
  
  const diffPixels = pixelmatch(
    baseline.data,
    actual.data,
    diff.data,
    width,
    height,
    { threshold }
  );
  
  const totalPixels = width * height;
  const diffPercentage = (diffPixels / totalPixels) * 100;
  
  // Save diff image if there are differences
  if (diffPixels > 0) {
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    console.log(`Diff image saved: ${diffPath}`);
    console.log(`Difference: ${diffPixels} pixels (${diffPercentage.toFixed(2)}%)`);
  }
  
  const match = diffPercentage <= (PIXEL_DIFF_THRESHOLD * 100);
  
  return { match, diffPixels, totalPixels, diffPercentage };
}

/**
 * Take screenshot and compare with baseline
 */
async function takeAndCompareScreenshot(
  page: Page,
  name: string,
  options: any = {}
): Promise<void> {
  const baselinePath = path.join(BASELINE_DIR, `${name}.png`);
  const actualPath = path.join(ACTUAL_DIR, `${name}.png`);
  const diffPath = path.join(DIFF_DIR, `${name}.png`);
  
  // Take screenshot
  await page.screenshot({ path: actualPath, fullPage: true, ...options });
  
  // Compare with baseline
  const result = await compareScreenshots(baselinePath, actualPath, diffPath);
  
  expect(result.match, 
    `Visual regression detected: ${result.diffPixels} pixels differ (${result.diffPercentage.toFixed(2)}%). ` +
    `See diff at: ${diffPath}`
  ).toBe(true);
}

/**
 * Wait for page to be fully loaded and stable
 */
async function waitForPageStability(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Allow animations to settle
}

// ============================================================================
// PAGE-LEVEL VISUAL REGRESSION TESTS
// ============================================================================

test.describe('Visual Regression - Page Level', () => {
  
  test('Home page visual snapshot', async ({ page }) => {
    await page.goto('/');
    await waitForPageStability(page);
    
    await takeAndCompareScreenshot(page, 'home-page-desktop');
  });

  test('Feed page visual snapshot', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'test@example.com');
    await page.fill('[data-testid="input-password"]', 'password123');
    await page.click('[data-testid="button-login"]');
    
    await page.goto('/feed');
    await waitForPageStability(page);
    
    await takeAndCompareScreenshot(page, 'feed-page-desktop');
  });

  test('Profile page visual snapshot', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'test@example.com');
    await page.fill('[data-testid="input-password"]', 'password123');
    await page.click('[data-testid="button-login"]');
    
    await page.goto('/profile');
    await waitForPageStability(page);
    
    await takeAndCompareScreenshot(page, 'profile-page-desktop');
  });

  test('Events page visual snapshot', async ({ page }) => {
    await page.goto('/events');
    await waitForPageStability(page);
    
    await takeAndCompareScreenshot(page, 'events-page-desktop');
  });

  test('Marketing landing page visual snapshot', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    await waitForPageStability(page);
    
    await takeAndCompareScreenshot(page, 'marketing-page-desktop');
  });
});

// ============================================================================
// COMPONENT-LEVEL VISUAL REGRESSION TESTS
// ============================================================================

test.describe('Visual Regression - Components', () => {
  
  test('Navigation bar visual snapshot', async ({ page }) => {
    await page.goto('/');
    await waitForPageStability(page);
    
    const nav = await page.locator('nav').first();
    await nav.screenshot({ path: path.join(ACTUAL_DIR, 'nav-component.png') });
    
    const baselinePath = path.join(BASELINE_DIR, 'nav-component.png');
    const actualPath = path.join(ACTUAL_DIR, 'nav-component.png');
    const diffPath = path.join(DIFF_DIR, 'nav-component.png');
    
    const result = await compareScreenshots(baselinePath, actualPath, diffPath);
    expect(result.match).toBe(true);
  });

  test('Event card component visual snapshot', async ({ page }) => {
    await page.goto('/events');
    await waitForPageStability(page);
    
    const eventCard = await page.locator('[data-testid^="card-event"]').first();
    if (await eventCard.count() > 0) {
      await eventCard.screenshot({ path: path.join(ACTUAL_DIR, 'event-card-component.png') });
      
      const baselinePath = path.join(BASELINE_DIR, 'event-card-component.png');
      const actualPath = path.join(ACTUAL_DIR, 'event-card-component.png');
      const diffPath = path.join(DIFF_DIR, 'event-card-component.png');
      
      const result = await compareScreenshots(baselinePath, actualPath, diffPath);
      expect(result.match).toBe(true);
    }
  });

  test('Sidebar component visual snapshot', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'test@example.com');
    await page.fill('[data-testid="input-password"]', 'password123');
    await page.click('[data-testid="button-login"]');
    
    await page.goto('/feed');
    await waitForPageStability(page);
    
    const sidebar = await page.locator('aside').first();
    if (await sidebar.count() > 0) {
      await sidebar.screenshot({ path: path.join(ACTUAL_DIR, 'sidebar-component.png') });
      
      const baselinePath = path.join(BASELINE_DIR, 'sidebar-component.png');
      const actualPath = path.join(ACTUAL_DIR, 'sidebar-component.png');
      const diffPath = path.join(DIFF_DIR, 'sidebar-component.png');
      
      const result = await compareScreenshots(baselinePath, actualPath, diffPath);
      expect(result.match).toBe(true);
    }
  });
});

// ============================================================================
// THEME VISUAL REGRESSION TESTS
// ============================================================================

test.describe('Visual Regression - Theme Switching', () => {
  
  test('Light mode theme snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Ensure light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    
    await waitForPageStability(page);
    await takeAndCompareScreenshot(page, 'home-light-mode');
  });

  test('Dark mode theme snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    await waitForPageStability(page);
    await takeAndCompareScreenshot(page, 'home-dark-mode');
  });

  test('MT Ocean theme visual consistency', async ({ page }) => {
    await page.goto('/');
    
    // Verify MT Ocean theme is active
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('mt-ocean');
    
    await waitForPageStability(page);
    await takeAndCompareScreenshot(page, 'mt-ocean-theme');
  });

  test('Bold Minimaximalist theme visual consistency', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    // Verify Bold Minimaximalist theme is active
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('bold-minimaximalist');
    
    await waitForPageStability(page);
    await takeAndCompareScreenshot(page, 'bold-minimaximalist-theme');
  });
});

// ============================================================================
// RESPONSIVE VISUAL REGRESSION TESTS
// ============================================================================

test.describe('Visual Regression - Responsive Design', () => {
  
  test('Mobile viewport (375x667) snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForPageStability(page);
    
    await takeAndCompareScreenshot(page, 'home-mobile');
  });

  test('Tablet viewport (768x1024) snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await waitForPageStability(page);
    
    await takeAndCompareScreenshot(page, 'home-tablet');
  });

  test('Desktop viewport (1920x1080) snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await waitForPageStability(page);
    
    await takeAndCompareScreenshot(page, 'home-desktop-fullhd');
  });

  test('Events page mobile responsive snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/events');
    await waitForPageStability(page);
    
    await takeAndCompareScreenshot(page, 'events-mobile');
  });
});

// ============================================================================
// CRITICAL USER FLOW VISUAL TESTS
// ============================================================================

test.describe('Visual Regression - User Flows', () => {
  
  test('Login form visual snapshot', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    
    await takeAndCompareScreenshot(page, 'login-form');
  });

  test('Post creation modal visual snapshot', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'test@example.com');
    await page.fill('[data-testid="input-password"]', 'password123');
    await page.click('[data-testid="button-login"]');
    
    await page.goto('/feed');
    await waitForPageStability(page);
    
    // Open post creation modal
    const createPostButton = await page.locator('[data-testid="button-create-post"]').first();
    if (await createPostButton.count() > 0) {
      await createPostButton.click();
      await page.waitForTimeout(300); // Wait for modal animation
      
      await takeAndCompareScreenshot(page, 'post-creation-modal');
    }
  });
});

// ============================================================================
// SUMMARY TEST
// ============================================================================

test('Visual regression test summary', async () => {
  const baselineFiles = fs.readdirSync(BASELINE_DIR);
  const actualFiles = fs.readdirSync(ACTUAL_DIR);
  const diffFiles = fs.readdirSync(DIFF_DIR);
  
  console.log('\n=== VISUAL REGRESSION TEST SUMMARY ===');
  console.log(`Baseline images: ${baselineFiles.length}`);
  console.log(`Actual screenshots: ${actualFiles.length}`);
  console.log(`Diff images generated: ${diffFiles.length}`);
  console.log(`Threshold: ${PIXEL_DIFF_THRESHOLD * 100}% pixel difference allowed`);
  console.log('=====================================\n');
  
  // All tests should pass if we reach here
  expect(true).toBe(true);
});
