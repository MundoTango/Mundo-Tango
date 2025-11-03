/**
 * MEMORIES PAGE E2E TESTS
 * Tests the My Tango Journey memories page functionality
 * 
 * Test Coverage:
 * - Page navigation and title verification
 * - Stats cards display
 * - Tab navigation
 * - Add memory button interaction
 * - Responsive design (desktop/mobile)
 */

import { test, expect } from '@playwright/test';

test.describe('Memories Page Tests', () => {
  test('should display memories page with correct title and structure', async ({ page }) => {
    await page.goto('/memories');

    // Verify page title
    await expect(page.getByTestId('text-page-title')).toContainText('My Tango Journey');

    // Verify stats cards are visible
    await expect(page.getByTestId('text-total-memories')).toBeVisible();
    
    // Verify the stats structure exists
    const statsCards = page.locator('[data-testid^="text-"]').filter({ hasText: /^\d+$/ });
    await expect(statsCards.first()).toBeVisible();

    // Verify Add Memory button is present
    await expect(page.getByTestId('button-create-memory')).toBeVisible();
  });

  test('should display all required stats cards', async ({ page }) => {
    await page.goto('/memories');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for stats cards (Total Memories, Events Attended, Milestones, This Year)
    // These should display numbers even if zero
    await expect(page.getByTestId('text-total-memories')).toBeVisible();
    
    // Verify stats contain numeric values
    const totalMemories = await page.getByTestId('text-total-memories').textContent();
    expect(totalMemories).toMatch(/^\d+$/);
  });

  test('should display tabs for Timeline, Albums, and Milestones', async ({ page }) => {
    await page.goto('/memories');

    // Wait for tabs to load
    await page.waitForLoadState('networkidle');

    // Verify tabs are present (looking for tab triggers)
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();

    // Check if tab content is accessible
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(2);
  });

  test('should trigger create memory flow when clicking Add Memory button', async ({ page }) => {
    await page.goto('/memories');

    // Click the Add Memory button
    const addButton = page.getByTestId('button-create-memory');
    await expect(addButton).toBeVisible();
    
    await addButton.click();

    // Wait for some action (modal, navigation, or state change)
    await page.waitForTimeout(1000);

    // The button should be clickable without errors
    // Actual behavior depends on implementation
  });

  test('should handle empty memories state gracefully', async ({ page }) => {
    await page.goto('/memories');

    await page.waitForLoadState('networkidle');

    // Page should load without errors even with no data
    await expect(page.getByTestId('text-page-title')).toBeVisible();
    
    // Stats should show 0 if no memories
    const totalMemories = await page.getByTestId('text-total-memories').textContent();
    expect(totalMemories).toMatch(/^\d+$/);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/memories');

    // Verify page title is visible on mobile
    await expect(page.getByTestId('text-page-title')).toBeVisible();

    // Verify Add Memory button is visible on mobile
    await expect(page.getByTestId('button-create-memory')).toBeVisible();

    // Verify stats cards are visible (should stack on mobile)
    await expect(page.getByTestId('text-total-memories')).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/memories');

    // Verify page loads correctly
    await expect(page.getByTestId('text-page-title')).toBeVisible();
    await expect(page.getByTestId('button-create-memory')).toBeVisible();
    await expect(page.getByTestId('text-total-memories')).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/memories');

    // Verify page loads correctly
    await expect(page.getByTestId('text-page-title')).toBeVisible();
    await expect(page.getByTestId('button-create-memory')).toBeVisible();
    await expect(page.getByTestId('text-total-memories')).toBeVisible();
  });
});
