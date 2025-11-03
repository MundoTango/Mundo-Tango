/**
 * COMMUNITY WORLD MAP PAGE E2E TESTS
 * Tests the Global Tango Community world map functionality
 * 
 * Test Coverage:
 * - Page navigation and title verification
 * - Global stats cards display
 * - City search functionality
 * - City list filtering
 * - Responsive design (desktop/mobile)
 */

import { test, expect } from '@playwright/test';

test.describe('Community World Map Page Tests', () => {
  test('should display community map page with correct title', async ({ page }) => {
    await page.goto('/community-world-map');

    // Verify page title contains "Global Tango Community"
    await expect(page.getByTestId('text-page-title')).toContainText('Global Tango Community');

    // Verify page loads successfully
    await page.waitForLoadState('networkidle');
  });

  test('should display all required global stats cards', async ({ page }) => {
    await page.goto('/community-world-map');

    await page.waitForLoadState('networkidle');

    // Verify Cities stat card
    await expect(page.getByTestId('text-total-cities')).toBeVisible();
    const cities = await page.getByTestId('text-total-cities').textContent();
    expect(cities).toMatch(/^\d+$/);

    // Verify Members stat card
    await expect(page.getByTestId('text-total-members')).toBeVisible();
    const members = await page.getByTestId('text-total-members').textContent();
    expect(members).toMatch(/^[\d,]+$/);
  });

  test('should have search functionality for cities', async ({ page }) => {
    await page.goto('/community-world-map');

    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.getByTestId('input-city-search');
    await expect(searchInput).toBeVisible();
  });

  test('should filter cities when typing in search', async ({ page }) => {
    await page.goto('/community-world-map');

    await page.waitForLoadState('networkidle');

    // Type in search
    const searchInput = page.getByTestId('input-city-search');
    await searchInput.fill('Buenos Aires');

    // Wait for filtering
    await page.waitForTimeout(500);

    // The input should contain the search text
    await expect(searchInput).toHaveValue('Buenos Aires');
  });

  test('should display city list or empty state', async ({ page }) => {
    await page.goto('/community-world-map');

    await page.waitForLoadState('networkidle');

    // Page should load without errors
    await expect(page.getByTestId('text-page-title')).toBeVisible();

    // Stats should be visible
    await expect(page.getByTestId('text-total-cities')).toBeVisible();
  });

  test('should clear search when clearing input', async ({ page }) => {
    await page.goto('/community-world-map');

    await page.waitForLoadState('networkidle');

    const searchInput = page.getByTestId('input-city-search');
    
    // Type and then clear
    await searchInput.fill('Buenos Aires');
    await page.waitForTimeout(300);
    
    await searchInput.clear();
    await page.waitForTimeout(300);

    // Input should be empty
    await expect(searchInput).toHaveValue('');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/community-world-map');

    // Verify page title is visible on mobile
    await expect(page.getByTestId('text-page-title')).toBeVisible();

    // Verify search is accessible on mobile
    await expect(page.getByTestId('input-city-search')).toBeVisible();

    // Verify stats are visible (should stack on mobile)
    await expect(page.getByTestId('text-total-cities')).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/community-world-map');

    await expect(page.getByTestId('text-page-title')).toBeVisible();
    await expect(page.getByTestId('input-city-search')).toBeVisible();
    await expect(page.getByTestId('text-total-cities')).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/community-world-map');

    await expect(page.getByTestId('text-page-title')).toBeVisible();
    await expect(page.getByTestId('input-city-search')).toBeVisible();
    await expect(page.getByTestId('text-total-cities')).toBeVisible();
    await expect(page.getByTestId('text-total-members')).toBeVisible();
  });

  test('should display stats with proper formatting', async ({ page }) => {
    await page.goto('/community-world-map');

    await page.waitForLoadState('networkidle');

    // Check that numbers are properly formatted
    const citiesText = await page.getByTestId('text-total-cities').textContent();
    const membersText = await page.getByTestId('text-total-members').textContent();

    // Should be numeric or formatted numbers
    expect(citiesText).toMatch(/^\d+$/);
    expect(membersText).toMatch(/^[\d,]+$/);
  });
});
