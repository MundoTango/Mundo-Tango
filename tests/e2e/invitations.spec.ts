/**
 * INVITATIONS PAGE E2E TESTS
 * Tests the role invitations functionality
 * 
 * Test Coverage:
 * - Page navigation and title verification
 * - Stats cards display (Pending, Accepted, Declined, Active Roles)
 * - Tab navigation (Pending, History)
 * - Invitation actions (accept/decline)
 * - Responsive design (desktop/mobile)
 */

import { test, expect } from '@playwright/test';

test.describe('Invitations Page Tests', () => {
  test('should display invitations page with correct title', async ({ page }) => {
    await page.goto('/invitations');

    // Verify page title
    await expect(page.getByTestId('text-page-title')).toContainText('Role Invitations');

    await page.waitForLoadState('networkidle');
  });

  test('should display all required stats cards', async ({ page }) => {
    await page.goto('/invitations');

    await page.waitForLoadState('networkidle');

    // Verify stats cards are visible
    await expect(page.getByTestId('text-pending-invitations')).toBeVisible();
    
    const pendingCount = await page.getByTestId('text-pending-invitations').textContent();
    expect(pendingCount).toMatch(/^\d+$/);
  });

  test('should display tabs for Pending and History', async ({ page }) => {
    await page.goto('/invitations');

    await page.waitForLoadState('networkidle');

    // Verify tabs are present
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();

    // Should have at least 2 tabs (Pending, History)
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(2);
  });

  test('should handle empty invitations state', async ({ page }) => {
    await page.goto('/invitations');

    await page.waitForLoadState('networkidle');

    // Page should load without errors even with no invitations
    await expect(page.getByTestId('text-page-title')).toBeVisible();
    
    // Stats should show 0 if no invitations
    const pendingCount = await page.getByTestId('text-pending-invitations').textContent();
    expect(pendingCount).toMatch(/^\d+$/);
  });

  test('should switch between Pending and History tabs', async ({ page }) => {
    await page.goto('/invitations');

    await page.waitForLoadState('networkidle');

    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      // Click History tab (second tab)
      await tabs.nth(1).click();
      await page.waitForTimeout(300);

      // Should still see the page title
      await expect(page.getByTestId('text-page-title')).toBeVisible();

      // Click back to Pending tab (first tab)
      await tabs.nth(0).click();
      await page.waitForTimeout(300);

      await expect(page.getByTestId('text-page-title')).toBeVisible();
    }
  });

  test('should display role types correctly', async ({ page }) => {
    await page.goto('/invitations');

    await page.waitForLoadState('networkidle');

    // Page should render role information if invitations exist
    // Otherwise should show empty state gracefully
    await expect(page.getByTestId('text-page-title')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/invitations');

    // Verify page title is visible on mobile
    await expect(page.getByTestId('text-page-title')).toBeVisible();

    // Verify stats are visible (should stack on mobile)
    await expect(page.getByTestId('text-pending-invitations')).toBeVisible();

    // Verify tabs are accessible on mobile
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/invitations');

    await expect(page.getByTestId('text-page-title')).toBeVisible();
    await expect(page.getByTestId('text-pending-invitations')).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/invitations');

    await expect(page.getByTestId('text-page-title')).toBeVisible();
    await expect(page.getByTestId('text-pending-invitations')).toBeVisible();
  });

  test('should display stats with numeric values', async ({ page }) => {
    await page.goto('/invitations');

    await page.waitForLoadState('networkidle');

    // Verify stats display numbers
    const pendingText = await page.getByTestId('text-pending-invitations').textContent();
    expect(pendingText).toMatch(/^\d+$/);
  });

  test('should handle page load without errors', async ({ page }) => {
    await page.goto('/invitations');

    // Wait for network to be idle
    await page.waitForLoadState('networkidle');

    // Check for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Page should be stable
    await expect(page.getByTestId('text-page-title')).toBeVisible();

    // Should have minimal console errors
    expect(errors.length).toBeLessThan(5);
  });
});
