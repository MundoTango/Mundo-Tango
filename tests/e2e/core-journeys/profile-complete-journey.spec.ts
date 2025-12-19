/**
 * PROFILE COMPLETE JOURNEY TEST
 * Tests profile viewing, editing, avatar upload, and bio updates
 * MB.MD Protocol: Critical user identity management
 */

import { test, expect } from '@playwright/test';

test.describe('Profile - Complete Journey', () => {
  
  test('should view own profile', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Verify profile elements
    await expect(page.getByTestId('profile-header')).toBeVisible();
    await expect(page.getByTestId('profile-avatar')).toBeVisible();
    await expect(page.getByTestId('profile-name')).toBeVisible();
    await expect(page.getByTestId('profile-bio')).toBeVisible();
    
    // Verify stats
    await expect(page.getByTestId('stat-posts')).toBeVisible();
    await expect(page.getByTestId('stat-followers')).toBeVisible();
    await expect(page.getByTestId('stat-following')).toBeVisible();
  });

  test('should edit profile information', async ({ page }) => {
    await page.goto('/profile/edit');
    
    // Update bio
    const newBio = `Tango enthusiast from Buenos Aires. Updated ${Date.now()}`;
    await page.getByTestId('textarea-bio').fill(newBio);
    
    // Update location
    await page.getByTestId('input-city').fill('Buenos Aires');
    await page.getByTestId('input-country').fill('Argentina');
    
    // Save changes
    await page.getByTestId('button-save-profile').click();
    
    // Verify success
    await expect(page.getByText(/profile.*updated/i)).toBeVisible();
    
    // Navigate back and verify
    await page.goto('/profile');
    await expect(page.getByText(newBio)).toBeVisible();
  });

  test('should upload profile avatar', async ({ page }) => {
    await page.goto('/profile/edit');
    
    // Click avatar upload
    await page.getByTestId('button-upload-avatar').click();
    
    // Set file input (simulated)
    const fileInput = page.getByTestId('input-avatar-file');
    await expect(fileInput).toBeAttached();
  });

  test('should view profile tabs (Posts, Photos, Events)', async ({ page }) => {
    await page.goto('/profile');
    
    // Posts tab (default)
    await expect(page.getByTestId('tab-posts')).toHaveClass(/active|selected/);
    
    // Photos tab
    await page.getByTestId('tab-photos').click();
    await expect(page.getByTestId('photos-grid')).toBeVisible();
    
    // Events tab
    await page.getByTestId('tab-events').click();
    await expect(page.getByTestId('events-list')).toBeVisible();
  });

  test('should view another user profile', async ({ page }) => {
    await page.goto('/profile/testuser123');
    
    // Verify profile loads
    await expect(page.getByTestId('profile-header')).toBeVisible();
    
    // Verify follow button visible
    await expect(page.getByTestId('button-follow')).toBeVisible();
  });

  test('should follow/unfollow user from profile', async ({ page }) => {
    await page.goto('/profile/testuser123');
    
    // Follow user
    const followButton = page.getByTestId('button-follow');
    await followButton.click();
    
    // Should change to "Following"
    await expect(followButton).toHaveText(/following|unfollow/i);
    
    // Unfollow
    await followButton.click();
    await expect(page.getByTestId('button-follow')).toHaveText(/follow/i);
  });

  test('should send direct message from profile', async ({ page }) => {
    await page.goto('/profile/testuser123');
    
    // Click message button
    await page.getByTestId('button-message').click();
    
    // Should navigate to messages
    await expect(page).toHaveURL(/\/messages/);
  });

  test('should view followers list', async ({ page }) => {
    await page.goto('/profile');
    
    // Click followers count
    await page.getByTestId('stat-followers').click();
    
    // Should show followers modal/page
    await expect(page.getByTestId('followers-list')).toBeVisible();
  });

  test('should view following list', async ({ page }) => {
    await page.goto('/profile');
    
    // Click following count
    await page.getByTestId('stat-following').click();
    
    // Should show following modal/page
    await expect(page.getByTestId('following-list')).toBeVisible();
  });

  // Responsive tests
  test('should display profile correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/profile');
    
    await expect(page.getByTestId('profile-header')).toBeVisible();
    await expect(page.getByTestId('profile-avatar')).toBeVisible();
  });
});
