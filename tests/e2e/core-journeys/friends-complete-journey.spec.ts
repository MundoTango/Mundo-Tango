/**
 * FRIENDS COMPLETE JOURNEY TEST
 * Tests friend requests, suggestions, and friend management
 * MB.MD Protocol: Social connection validation
 */

import { test, expect } from '@playwright/test';

test.describe('Friends - Complete Journey', () => {
  
  test('should view friends list', async ({ page }) => {
    await page.goto('/friends');
    await page.waitForLoadState('networkidle');
    
    // Verify friends page
    await expect(page).toHaveTitle(/Friends|Mundo Tango/);
    await expect(page.getByTestId('friends-container')).toBeVisible();
  });

  test('should send friend request', async ({ page }) => {
    await page.goto('/friends/suggestions');
    
    // Send friend request
    await page.getByTestId('button-add-friend').first().click();
    
    // Verify success
    await expect(page.getByText(/request.*sent/i)).toBeVisible();
    
    // Button should change to "Pending"
    await expect(page.getByTestId('button-add-friend').first()).toHaveText(/pending|requested/i);
  });

  test('should accept friend request', async ({ page }) => {
    await page.goto('/friends/requests');
    
    // Accept first request
    await page.getByTestId('button-accept-request').first().click();
    
    // Verify success
    await expect(page.getByText(/accepted|now friends/i)).toBeVisible();
  });

  test('should decline friend request', async ({ page }) => {
    await page.goto('/friends/requests');
    
    // Decline request
    await page.getByTestId('button-decline-request').first().click();
    
    // Confirm decline
    await page.getByTestId('button-confirm-decline').click();
    
    // Verify removed
    await expect(page.getByText(/declined|removed/i)).toBeVisible();
  });

  test('should view friend suggestions', async ({ page }) => {
    await page.goto('/friends/suggestions');
    
    // Verify suggestions load
    await expect(page.getByTestId('suggestions-container')).toBeVisible();
    await expect(page.locator('[data-testid^="user-suggestion-"]')).toHaveCount({ min: 1 });
  });

  test('should remove friend', async ({ page }) => {
    await page.goto('/friends');
    
    // Open friend menu
    await page.getByTestId('button-friend-menu').first().click();
    await page.getByTestId('button-remove-friend').click();
    
    // Confirm removal
    await page.getByTestId('button-confirm-remove').click();
    
    // Verify success
    await expect(page.getByText(/removed|unfriended/i)).toBeVisible();
  });

  test('should search friends', async ({ page }) => {
    await page.goto('/friends');
    
    // Search
    await page.getByTestId('input-search-friends').fill('test');
    await page.waitForLoadState('networkidle');
    
    // Verify results filtered
    const results = page.locator('[data-testid^="friend-"]');
    await expect(results.first()).toBeVisible();
  });

  test('should filter friends by location', async ({ page }) => {
    await page.goto('/friends');
    
    // Open filters
    await page.getByTestId('button-filters').click();
    
    // Select location
    await page.getByTestId('select-location').click();
    await page.getByTestId('option-buenos-aires').click();
    
    // Apply filter
    await page.getByTestId('button-apply-filters').click();
    
    // Verify filtered
    await expect(page.locator('[data-testid^="friend-"]')).toHaveCount({ min: 0 });
  });

  test('should view mutual friends', async ({ page }) => {
    await page.goto('/friends/suggestions');
    
    // Click to view mutual friends
    await page.getByTestId('link-mutual-friends').first().click();
    
    // Verify modal/page
    await expect(page.getByTestId('mutual-friends-list')).toBeVisible();
  });

  // Responsive tests
  test('should display friends page on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/friends');
    
    await expect(page.getByTestId('friends-container')).toBeVisible();
  });
});
