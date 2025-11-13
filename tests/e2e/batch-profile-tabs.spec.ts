/**
 * AGENT 2: Profile Tab System Test Suite
 * Tests all 23 profile tabs
 * Timeline: Days 1-5
 */

import { test, expect } from '@playwright/test';
import { ProfileHelper } from '../helpers/profile-helper';
import { setupAuthenticatedSession } from '../helpers/auth-setup';

test.describe('Profile Tab System - Complete 23-Tab Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  // Test main profile page
  test('Profile overview page loads correctly', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Verify profile header
    await ProfileHelper.verifyProfileHeader(page);
    
    // Verify tab navigation exists
    await expect(page.getByTestId('profile-tabs')).toBeVisible();
  });

  // Test each profile tab
  const tabs = ProfileHelper.getAllTabs();
  
  for (const tabName of tabs) {
    test(`Profile ${tabName} tab displays correctly`, async ({ page }) => {
      // Navigate to tab
      await ProfileHelper.navigateToTab(page, tabName);
      
      // Verify tab is active
      await ProfileHelper.verifyTabActive(page, tabName);
      
      // Verify profile header still visible
      await ProfileHelper.verifyProfileHeader(page);
    });
  }

  // Test tab navigation
  test('Can navigate between profile tabs', async ({ page }) => {
    await ProfileHelper.testTabNavigation(page, 'photos', 'videos');
    await ProfileHelper.testTabNavigation(page, 'videos', 'events');
    await ProfileHelper.testTabNavigation(page, 'events', 'groups');
  });

  // Test public vs private tabs
  test('Public profile tabs are accessible without auth', async ({ page, context }) => {
    // Clear session to test public access
    await context.clearCookies();
    
    // Navigate to public profile
    await page.goto('/profile/15/photos');
    
    // Should be able to view photos
    await expect(page.getByTestId('photos-content')).toBeVisible();
  });

  // Test authenticated-only tabs
  test('Private tabs redirect when not authenticated', async ({ page, context }) => {
    await context.clearCookies();
    
    // Try to access settings tab
    await page.goto('/profile/settings');
    
    // Should redirect to login
    await page.waitForURL('**/login**');
  });

  // Test photo tab functionality
  test('Profile photos tab displays user photos', async ({ page }) => {
    await ProfileHelper.navigateToTab(page, 'photos');
    
    // Check for photo grid
    await expect(page.getByTestId('photo-grid')).toBeVisible();
  });

  // Test video tab functionality
  test('Profile videos tab displays user videos', async ({ page }) => {
    await ProfileHelper.navigateToTab(page, 'videos');
    
    // Check for video grid
    await expect(page.getByTestId('video-grid')).toBeVisible();
  });

  // Test events tab
  test('Profile events tab shows user events', async ({ page }) => {
    await ProfileHelper.navigateToTab(page, 'events');
    
    // Check for events list
    await expect(page.getByTestId('events-list')).toBeVisible();
  });

  // Test groups tab
  test('Profile groups tab shows user groups', async ({ page }) => {
    await ProfileHelper.navigateToTab(page, 'groups');
    
    // Check for groups list
    await expect(page.getByTestId('groups-list')).toBeVisible();
  });

  // Test travel tab
  test('Profile travel tab shows travel plans', async ({ page }) => {
    await ProfileHelper.navigateToTab(page, 'travel');
    
    // Check for travel plans
    await expect(page.getByTestId('travel-plans')).toBeVisible();
  });

  // Test connections tab
  test('Profile connections tab shows friends', async ({ page }) => {
    await ProfileHelper.navigateToTab(page, 'connections');
    
    // Check for friends grid
    await expect(page.getByTestId('connections-grid')).toBeVisible();
  });

  // Test badges tab
  test('Profile badges tab shows achievements', async ({ page }) => {
    await ProfileHelper.navigateToTab(page, 'badges');
    
    // Check for badges display
    await expect(page.getByTestId('badges-display')).toBeVisible();
  });

  // Test timeline tab
  test('Profile timeline tab shows activity feed', async ({ page }) => {
    await ProfileHelper.navigateToTab(page, 'timeline');
    
    // Check for timeline items
    await expect(page.getByTestId('timeline-feed')).toBeVisible();
  });

  // Test viewing another user's profile
  test('Can view other user profiles', async ({ page }) => {
    await ProfileHelper.navigateToTab(page, 'photos', 15);
    
    // Should show user 15's photos
    await expect(page).toHaveURL(/\/profile\/15\/photos/);
    await ProfileHelper.verifyProfileHeader(page);
  });
});
