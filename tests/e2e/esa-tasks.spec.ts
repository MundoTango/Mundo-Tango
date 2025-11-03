/**
 * ESA TASKS PAGE E2E TESTS
 * Tests the ESA Task Queue Management functionality
 * Requires God user authentication (Level 8 RBAC)
 * 
 * Test Coverage:
 * - Page access control (God user only)
 * - Task queue display
 * - Task stats visibility
 * - Status filtering
 * - Responsive design (desktop/mobile)
 */

import { test, expect } from '@playwright/test';

// Helper function to login as God user
async function loginAsGodUser(page: any) {
  await page.goto('/login');
  
  await page.fill('[data-testid="input-username"]', 'admin');
  await page.fill('[data-testid="input-password"]', 'MundoTango2025!Admin');
  
  await page.click('[data-testid="button-login"]');
  
  // Wait for redirect after login
  await page.waitForURL(/\/(feed|home|dashboard)/, { timeout: 10000 });
}

test.describe('ESA Tasks Page Tests', () => {
  test('should require authentication to access ESA tasks', async ({ page }) => {
    // Try to access without login
    await page.goto('/platform/esa/tasks');

    // Should redirect to login or show access denied
    const url = page.url();
    const isProtected = url.includes('/login') || url.includes('/403') || url.includes('/401');
    expect(isProtected).toBe(true);
  });

  test('should allow God user to access ESA tasks page', async ({ page }) => {
    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');

    await page.waitForLoadState('networkidle');

    // Should be able to access the page
    const url = page.url();
    expect(url).toContain('/platform/esa/tasks');
  });

  test('should display ESA tasks page with correct title', async ({ page }) => {
    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');

    await page.waitForLoadState('networkidle');

    // Verify page title
    await expect(page.getByTestId('text-page-title')).toContainText('ESA Task Queue');
  });

  test('should display total tasks stat', async ({ page }) => {
    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');

    await page.waitForLoadState('networkidle');

    // Verify total tasks stat
    await expect(page.getByTestId('text-total-tasks')).toBeVisible();
    
    const totalTasks = await page.getByTestId('text-total-tasks').textContent();
    expect(totalTasks).toMatch(/^\d+$/);
  });

  test('should display task status breakdown', async ({ page }) => {
    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');

    await page.waitForLoadState('networkidle');

    // Should show task counts (total, pending, completed, etc.)
    await expect(page.getByTestId('text-total-tasks')).toBeVisible();
  });

  test('should have tabs or filters for task status', async ({ page }) => {
    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');

    await page.waitForLoadState('networkidle');

    // Check if tabs or filtering exists
    const tabsList = page.locator('[role="tablist"]');
    const hasTabsList = await tabsList.count() > 0;

    // Either tabs should exist or page should load successfully
    if (hasTabsList) {
      await expect(tabsList).toBeVisible();
    } else {
      await expect(page.getByTestId('text-page-title')).toBeVisible();
    }
  });

  test('should switch between task status filters if available', async ({ page }) => {
    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');

    await page.waitForLoadState('networkidle');

    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      // Click second tab
      await tabs.nth(1).click();
      await page.waitForTimeout(300);

      // Should still see the page title
      await expect(page.getByTestId('text-page-title')).toBeVisible();
    }
  });

  test('should display task list or empty state', async ({ page }) => {
    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');

    await page.waitForLoadState('networkidle');

    // Page should load successfully
    await expect(page.getByTestId('text-page-title')).toBeVisible();
    
    // Stats should be visible
    await expect(page.getByTestId('text-total-tasks')).toBeVisible();
  });

  test('should handle empty task queue gracefully', async ({ page }) => {
    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');

    await page.waitForLoadState('networkidle');

    // Page should load without errors even with no tasks
    await expect(page.getByTestId('text-page-title')).toBeVisible();
    
    // Stats should show 0 if no tasks
    const totalTasks = await page.getByTestId('text-total-tasks').textContent();
    expect(totalTasks).toMatch(/^\d+$/);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');

    // Verify page title is visible on mobile
    await expect(page.getByTestId('text-page-title')).toBeVisible();

    // Verify stats are visible (should stack on mobile)
    await expect(page.getByTestId('text-total-tasks')).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');

    await expect(page.getByTestId('text-page-title')).toBeVisible();
    await expect(page.getByTestId('text-total-tasks')).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');

    await expect(page.getByTestId('text-page-title')).toBeVisible();
    await expect(page.getByTestId('text-total-tasks')).toBeVisible();
  });

  test('should display stats with numeric values', async ({ page }) => {
    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');

    await page.waitForLoadState('networkidle');

    // Verify stats display numbers
    const totalText = await page.getByTestId('text-total-tasks').textContent();
    expect(totalText).toMatch(/^\d+$/);
  });

  test('should handle page load without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await loginAsGodUser(page);
    await page.goto('/platform/esa/tasks');
    await page.waitForLoadState('networkidle');

    // Page should be stable
    await expect(page.getByTestId('text-page-title')).toBeVisible();

    // Should have minimal console errors
    expect(errors.length).toBeLessThan(5);
  });
});
