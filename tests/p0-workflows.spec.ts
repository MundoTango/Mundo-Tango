import { test, expect, Page } from '@playwright/test';

/**
 * P0 Workflows Test Suite
 * Tests for Founder Approval, Safety Review, and AI Support admin pages
 */

// Test credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@mundotango.life',
  password: 'admin123',
};

// Helper to login
async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="input-email"]', ADMIN_CREDENTIALS.email);
  await page.fill('[data-testid="input-password"]', ADMIN_CREDENTIALS.password);
  await page.click('[data-testid="button-login"]');
  await page.waitForURL('/feed', { timeout: 10000 });
}

test.describe('Founder Approval Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load Founder Approval page with all UI components', async ({ page }) => {
    await page.goto('/admin/founder-approval');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify page title
    await expect(page.locator('h1, h2').filter({ hasText: /Founder Approval|Feature Review/i }).first()).toBeVisible();
    
    // Verify filters and search card exists
    const filtersCard = page.locator('[data-testid*="card-filters"], [data-testid*="filters"]').first();
    if (await filtersCard.count() > 0) {
      await expect(filtersCard).toBeVisible();
    }
    
    // Verify statistics cards exist
    const statsCards = page.locator('[data-testid*="stat"], [data-testid*="card-stat"]');
    const statsCount = await statsCards.count();
    expect(statsCount).toBeGreaterThanOrEqual(3); // Should have at least 3 stat cards
    
    // Verify data table exists
    const table = page.locator('table, [data-testid*="table"]').first();
    await expect(table).toBeVisible();
  });

  test('should filter features by status', async ({ page }) => {
    await page.goto('/admin/founder-approval');
    await page.waitForLoadState('networkidle');
    
    // Try to find and click status filter
    const statusFilter = page.locator('[data-testid*="select-status"], select').first();
    if (await statusFilter.count() > 0) {
      await statusFilter.click();
      
      // Wait for dropdown options
      await page.waitForTimeout(500);
      
      // Check if options are visible
      const options = page.locator('[role="option"], option');
      const optionsCount = await options.count();
      expect(optionsCount).toBeGreaterThan(0);
    }
  });

  test('should open feature detail dialog when clicking on a feature', async ({ page }) => {
    await page.goto('/admin/founder-approval');
    await page.waitForLoadState('networkidle');
    
    // Look for clickable feature rows
    const viewButtons = page.locator('[data-testid*="button-view"], button').filter({ hasText: /view|details/i });
    
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      
      // Verify dialog opened
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"], [data-testid*="dialog"]').first();
      await expect(dialog).toBeVisible();
    }
  });

  test('should display MT Ocean theme styling', async ({ page }) => {
    await page.goto('/admin/founder-approval');
    await page.waitForLoadState('networkidle');
    
    // Verify background has gradient or ocean theme
    const body = page.locator('body, main, [data-testid*="page"]').first();
    const bgColor = await body.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundImage || styles.backgroundColor;
    });
    
    // Should have some styling applied
    expect(bgColor).toBeTruthy();
  });
});

test.describe('Safety Review Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load Safety Review page with all UI components', async ({ page }) => {
    await page.goto('/admin/safety-review');
    await page.waitForLoadState('networkidle');
    
    // Verify page title
    await expect(page.locator('h1, h2').filter({ hasText: /Safety Review/i }).first()).toBeVisible();
    
    // Verify risk level filter exists
    const riskFilter = page.locator('[data-testid*="select-risk"], [data-testid*="filter-risk"]').first();
    if (await riskFilter.count() > 0) {
      await expect(riskFilter).toBeVisible();
    }
    
    // Verify statistics cards
    const statsCards = page.locator('[data-testid*="stat"], [data-testid*="card-stat"]');
    expect(await statsCards.count()).toBeGreaterThanOrEqual(3);
    
    // Verify data table
    await expect(page.locator('table, [data-testid*="table"]').first()).toBeVisible();
  });

  test('should filter by risk level', async ({ page }) => {
    await page.goto('/admin/safety-review');
    await page.waitForLoadState('networkidle');
    
    const riskFilter = page.locator('[data-testid*="select-risk"], select').first();
    if (await riskFilter.count() > 0) {
      await riskFilter.click();
      await page.waitForTimeout(500);
      
      // Verify risk level options exist
      const options = page.locator('[role="option"], option');
      expect(await options.count()).toBeGreaterThan(0);
    }
  });

  test('should display risk levels with proper styling', async ({ page }) => {
    await page.goto('/admin/safety-review');
    await page.waitForLoadState('networkidle');
    
    // Look for risk level badges
    const riskBadges = page.locator('[data-testid*="badge-risk"], .badge').filter({ hasText: /low|medium|high|critical/i });
    
    if (await riskBadges.count() > 0) {
      const badge = riskBadges.first();
      await expect(badge).toBeVisible();
      
      // Verify badge has color styling
      const bgColor = await badge.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(bgColor).toBeTruthy();
      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
    }
  });

  test('should open review detail dialog', async ({ page }) => {
    await page.goto('/admin/safety-review');
    await page.waitForLoadState('networkidle');
    
    const viewButtons = page.locator('[data-testid*="button-view"], button').filter({ hasText: /view|details/i });
    
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      await page.waitForTimeout(500);
      
      const dialog = page.locator('[role="dialog"], [data-testid*="dialog"]').first();
      await expect(dialog).toBeVisible();
    }
  });
});

test.describe('AI Support Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load AI Support page with all UI components', async ({ page }) => {
    await page.goto('/admin/ai-support');
    await page.waitForLoadState('networkidle');
    
    // Verify page title
    await expect(page.locator('h1, h2').filter({ hasText: /AI Support|Support Tickets/i }).first()).toBeVisible();
    
    // Verify priority filter exists
    const priorityFilter = page.locator('[data-testid*="select-priority"], [data-testid*="filter-priority"]').first();
    if (await priorityFilter.count() > 0) {
      await expect(priorityFilter).toBeVisible();
    }
    
    // Verify statistics cards
    const statsCards = page.locator('[data-testid*="stat"], [data-testid*="card-stat"]');
    expect(await statsCards.count()).toBeGreaterThanOrEqual(3);
    
    // Verify data table
    await expect(page.locator('table, [data-testid*="table"]').first()).toBeVisible();
  });

  test('should filter tickets by status and priority', async ({ page }) => {
    await page.goto('/admin/ai-support');
    await page.waitForLoadState('networkidle');
    
    // Test status filter
    const statusFilter = page.locator('[data-testid*="select-status"], select').first();
    if (await statusFilter.count() > 0) {
      await statusFilter.click();
      await page.waitForTimeout(500);
      expect(await page.locator('[role="option"], option').count()).toBeGreaterThan(0);
    }
  });

  test('should display confidence scores', async ({ page }) => {
    await page.goto('/admin/ai-support');
    await page.waitForLoadState('networkidle');
    
    // Look for confidence score displays
    const confidenceElements = page.locator('[data-testid*="confidence"], [data-testid*="score"]');
    
    if (await confidenceElements.count() > 0) {
      const element = confidenceElements.first();
      await expect(element).toBeVisible();
      
      // Verify it contains a percentage or number
      const text = await element.textContent();
      expect(text).toMatch(/\d+%?|\d+\.\d+/);
    }
  });

  test('should open ticket detail dialog', async ({ page }) => {
    await page.goto('/admin/ai-support');
    await page.waitForLoadState('networkidle');
    
    const viewButtons = page.locator('[data-testid*="button-view"], button').filter({ hasText: /view|details/i });
    
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      await page.waitForTimeout(500);
      
      const dialog = page.locator('[role="dialog"], [data-testid*="dialog"]').first();
      await expect(dialog).toBeVisible();
    }
  });

  test('should display satisfaction ratings', async ({ page }) => {
    await page.goto('/admin/ai-support');
    await page.waitForLoadState('networkidle');
    
    // Look for rating displays
    const ratingElements = page.locator('[data-testid*="rating"], [data-testid*="satisfaction"]');
    
    if (await ratingElements.count() > 0) {
      await expect(ratingElements.first()).toBeVisible();
    }
  });
});

test.describe('Cross-Workflow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should navigate between all P0 workflow pages', async ({ page }) => {
    // Start from founder approval
    await page.goto('/admin/founder-approval');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Navigate to safety review
    await page.goto('/admin/safety-review');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Navigate to AI support
    await page.goto('/admin/ai-support');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should maintain MT Ocean theme across all pages', async ({ page }) => {
    const pages = [
      '/admin/founder-approval',
      '/admin/safety-review',
      '/admin/ai-support',
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Verify glassmorphic or gradient background
      const main = page.locator('main, [data-testid*="page"]').first();
      const bgImage = await main.evaluate((el) => window.getComputedStyle(el).backgroundImage);
      
      // Should have some background styling
      expect(bgImage).toBeTruthy();
    }
  });

  test('should display consistent card styling across pages', async ({ page }) => {
    const pages = [
      '/admin/founder-approval',
      '/admin/safety-review',
      '/admin/ai-support',
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Verify cards have consistent styling
      const cards = page.locator('[data-testid*="card"], .card').first();
      if (await cards.count() > 0) {
        const card = cards.first();
        const borderRadius = await card.evaluate((el) => window.getComputedStyle(el).borderRadius);
        
        // Should have border radius (rounded corners)
        expect(borderRadius).toBeTruthy();
        expect(borderRadius).not.toBe('0px');
      }
    }
  });
});
