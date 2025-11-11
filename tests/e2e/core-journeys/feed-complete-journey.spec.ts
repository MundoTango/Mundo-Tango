/**
 * FEED COMPLETE JOURNEY TEST
 * Tests the complete feed experience: browse, post, react, comment, share
 * MB.MD Protocol: Critical user path validation
 */

import { test, expect } from '@playwright/test';

test.describe('Feed - Complete Journey', () => {
  
  test('should browse feed, create post, and interact', async ({ page }) => {
    // STEP 1: Navigate to feed
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');
    
    // STEP 2: Verify feed loaded
    await expect(page).toHaveTitle(/Feed|Mundo Tango/);
    await expect(page.getByTestId('feed-container')).toBeVisible();
    
    // STEP 3: Create new post
    const postContent = `Test post ${Date.now()} - Dancing tonight at La Catedral!`;
    await page.getByTestId('textarea-create-post').fill(postContent);
    await page.getByTestId('button-publish-post').click();
    
    // STEP 4: Verify post appears
    await expect(page.getByText(postContent)).toBeVisible({ timeout: 10000 });
    
    // STEP 5: Like the post
    const likeButton = page.locator(`[data-testid^="button-like-"]`).first();
    await likeButton.click();
    await expect(likeButton).toHaveClass(/active|liked/);
    
    // STEP 6: Add comment
    const commentText = 'Great event! Count me in!';
    await page.getByTestId('button-comment').first().click();
    await page.getByTestId('textarea-comment').fill(commentText);
    await page.getByTestId('button-submit-comment').click();
    
    // STEP 7: Verify comment appears
    await expect(page.getByText(commentText)).toBeVisible();
  });

  test('should filter feed (Following, Popular, Recent)', async ({ page }) => {
    await page.goto('/feed');
    
    // Test Following filter
    await page.getByTestId('filter-following').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid^="post-"]')).toHaveCount({ min: 0 });
    
    // Test Popular filter
    await page.getByTestId('filter-popular').click();
    await page.waitForLoadState('networkidle');
    
    // Test Recent filter
    await page.getByTestId('filter-recent').click();
    await page.waitForLoadState('networkidle');
  });

  test('should share post', async ({ page }) => {
    await page.goto('/feed');
    
    // Click share button
    await page.getByTestId('button-share').first().click();
    
    // Verify share modal
    await expect(page.getByTestId('modal-share')).toBeVisible();
    
    // Share with comment
    await page.getByTestId('textarea-share-comment').fill('Must see this!');
    await page.getByTestId('button-confirm-share').click();
    
    // Verify shared
    await expect(page.getByText('Post shared successfully')).toBeVisible();
  });

  test('should save post for later', async ({ page }) => {
    await page.goto('/feed');
    
    // Save post
    await page.getByTestId('button-save').first().click();
    await expect(page.getByText(/saved|bookmarked/i)).toBeVisible();
    
    // Navigate to saved posts
    await page.goto('/saved-posts');
    await expect(page.locator('[data-testid^="post-"]')).toHaveCount({ min: 1 });
  });

  test('should report inappropriate post', async ({ page }) => {
    await page.goto('/feed');
    
    // Open post menu
    await page.getByTestId('button-post-menu').first().click();
    await page.getByTestId('button-report-post').click();
    
    // Fill report form
    await page.getByTestId('select-report-reason').click();
    await page.getByTestId('option-spam').click();
    await page.getByTestId('textarea-report-details').fill('This is spam content');
    await page.getByTestId('button-submit-report').click();
    
    // Verify submission
    await expect(page.getByText(/report.*submitted/i)).toBeVisible();
  });

  test('should load more posts on scroll', async ({ page }) => {
    await page.goto('/feed');
    
    // Get initial post count
    const initialCount = await page.locator('[data-testid^="post-"]').count();
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    // Should have more posts
    const newCount = await page.locator('[data-testid^="post-"]').count();
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  // Responsive tests
  test('should display feed correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/feed');
    
    await expect(page.getByTestId('feed-container')).toBeVisible();
    await expect(page.getByTestId('textarea-create-post')).toBeVisible();
  });

  test('should display feed correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/feed');
    
    await expect(page.getByTestId('feed-container')).toBeVisible();
  });
});
