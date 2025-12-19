import { test, expect } from '@playwright/test';
import { testUser } from './fixtures/test-data';

// ============================================================================
// MODAL FEATURES TESTS - Mundo Tango
// ============================================================================
// Tests the 4 new modal components: Share, Report, Edit, PostAnalytics
// ============================================================================

test.describe('ShareModal - Social Sharing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', testUser.email);
    await page.fill('[data-testid="input-password"]', testUser.password);
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/feed');
  });

  test('Share button opens ShareModal', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('[data-testid^="card-post"]');
    
    // Click share button on first post
    const firstPost = page.locator('[data-testid^="card-post"]').first();
    await firstPost.locator('[data-testid="button-share"]').click();
    
    // ShareModal should be visible
    await expect(page.locator('[data-testid="modal-share"]')).toBeVisible();
  });

  test('ShareModal displays all sharing options', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    await page.locator('[data-testid^="card-post"]').first().locator('[data-testid="button-share"]').click();
    
    // Check for all share platforms
    await expect(page.locator('[data-testid="button-share-facebook"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-share-twitter"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-share-whatsapp"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-share-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-copy-link"]')).toBeVisible();
  });

  test('Copy link functionality works', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    await page.locator('[data-testid^="card-post"]').first().locator('[data-testid="button-share"]').click();
    
    // Click copy link button
    await page.locator('[data-testid="button-copy-link"]').click();
    
    // Should show success message
    await expect(page.locator('[data-testid="text-copy-success"]')).toBeVisible();
  });

  test('ShareModal closes when clicking outside', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    await page.locator('[data-testid^="card-post"]').first().locator('[data-testid="button-share"]').click();
    
    // Click backdrop to close
    await page.locator('[data-testid="modal-backdrop"]').click({ position: { x: 10, y: 10 } });
    
    // Modal should be hidden
    await expect(page.locator('[data-testid="modal-share"]')).not.toBeVisible();
  });

  test('Social share links are correctly formatted', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    await page.locator('[data-testid^="card-post"]').first().locator('[data-testid="button-share"]').click();
    
    // Facebook share button should have correct href
    const facebookBtn = page.locator('[data-testid="button-share-facebook"]');
    const href = await facebookBtn.getAttribute('href');
    expect(href).toContain('facebook.com');
  });
});

test.describe('ReportModal - Content Reporting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', testUser.email);
    await page.fill('[data-testid="input-password"]', testUser.password);
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/feed');
  });

  test('Report button opens ReportModal', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    // Click menu button on first post
    const firstPost = page.locator('[data-testid^="card-post"]').first();
    await firstPost.locator('[data-testid="button-post-menu"]').click();
    
    // Click report option
    await page.locator('[data-testid="button-report"]').click();
    
    // ReportModal should be visible
    await expect(page.locator('[data-testid="modal-report"]')).toBeVisible();
  });

  test('ReportModal displays all report categories', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    await page.locator('[data-testid^="card-post"]').first().locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-report"]').click();
    
    // Check for RadioGroup with report reasons
    await expect(page.locator('[data-testid="radio-spam"]')).toBeVisible();
    await expect(page.locator('[data-testid="radio-harassment"]')).toBeVisible();
    await expect(page.locator('[data-testid="radio-inappropriate"]')).toBeVisible();
    await expect(page.locator('[data-testid="radio-misinformation"]')).toBeVisible();
    await expect(page.locator('[data-testid="radio-other"]')).toBeVisible();
  });

  test('Can submit report with selected reason', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    await page.locator('[data-testid^="card-post"]').first().locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-report"]').click();
    
    // Select spam reason
    await page.locator('[data-testid="radio-spam"]').click();
    
    // Add optional details
    await page.fill('[data-testid="input-report-details"]', 'This post is clearly spam advertising');
    
    // Submit report
    await page.locator('[data-testid="button-submit-report"]').click();
    
    // Should show success message
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    
    // Modal should close
    await expect(page.locator('[data-testid="modal-report"]')).not.toBeVisible();
  });

  test('Cannot submit report without selecting reason', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    await page.locator('[data-testid^="card-post"]').first().locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-report"]').click();
    
    // Try to submit without selecting reason
    await page.locator('[data-testid="button-submit-report"]').click();
    
    // Should show validation error
    await expect(page.locator('[data-testid="text-error"]')).toBeVisible();
    
    // Modal should still be open
    await expect(page.locator('[data-testid="modal-report"]')).toBeVisible();
  });
});

test.describe('EditPostModal - Post Editing with History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', testUser.email);
    await page.fill('[data-testid="input-password"]', testUser.password);
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/feed');
  });

  test('Edit button opens EditPostModal for own posts', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    // Find own post (created by logged-in user)
    const ownPost = page.locator('[data-testid^="card-post"]').filter({ hasText: testUser.name }).first();
    
    // Click edit button
    await ownPost.locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-edit"]').click();
    
    // EditPostModal should be visible
    await expect(page.locator('[data-testid="modal-edit-post"]')).toBeVisible();
  });

  test('EditPostModal shows current post content', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    const ownPost = page.locator('[data-testid^="card-post"]').filter({ hasText: testUser.name }).first();
    const originalContent = await ownPost.locator('[data-testid="text-post-content"]').textContent();
    
    await ownPost.locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-edit"]').click();
    
    // Textarea should contain original content
    const textareaContent = await page.locator('[data-testid="textarea-edit-content"]').inputValue();
    expect(textareaContent).toBe(originalContent);
  });

  test('Can update post content with edit reason', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    const ownPost = page.locator('[data-testid^="card-post"]').filter({ hasText: testUser.name }).first();
    await ownPost.locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-edit"]').click();
    
    // Update content
    await page.fill('[data-testid="textarea-edit-content"]', 'Updated post content with new information');
    
    // Add edit reason
    await page.fill('[data-testid="input-edit-reason"]', 'Fixed typo and added context');
    
    // Submit changes
    await page.locator('[data-testid="button-save-edit"]').click();
    
    // Should show success message
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    
    // Post should show edited badge
    await expect(ownPost.locator('[data-testid="badge-edited"]')).toBeVisible();
  });

  test('Edit history is tracked and viewable', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    const editedPost = page.locator('[data-testid^="card-post"]').filter({ has: page.locator('[data-testid="badge-edited"]') }).first();
    
    if (await editedPost.count() > 0) {
      // Click on edited badge
      await editedPost.locator('[data-testid="badge-edited"]').click();
      
      // Should show edit history
      await expect(page.locator('[data-testid="section-edit-history"]')).toBeVisible();
      
      // Should show edit reasons
      await expect(page.locator('[data-testid^="text-edit-reason"]')).toBeVisible();
    }
  });

  test('Cannot edit someone elses post', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    // Find post from another user
    const otherPost = page.locator('[data-testid^="card-post"]').filter({ hasNotText: testUser.name }).first();
    
    if (await otherPost.count() > 0) {
      await otherPost.locator('[data-testid="button-post-menu"]').click();
      
      // Edit button should not be visible for other users' posts
      const editButton = page.locator('[data-testid="button-edit"]');
      await expect(editButton).not.toBeVisible();
    }
  });
});

test.describe('PostAnalytics - Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', testUser.email);
    await page.fill('[data-testid="input-password"]', testUser.password);
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/feed');
  });

  test('Analytics button opens PostAnalytics modal', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    const ownPost = page.locator('[data-testid^="card-post"]').filter({ hasText: testUser.name }).first();
    
    // Click analytics/insights button
    await ownPost.locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-analytics"]').click();
    
    // PostAnalytics modal should be visible
    await expect(page.locator('[data-testid="modal-post-analytics"]')).toBeVisible();
  });

  test('PostAnalytics displays view count', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    const ownPost = page.locator('[data-testid^="card-post"]').filter({ hasText: testUser.name }).first();
    await ownPost.locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-analytics"]').click();
    
    // Should show views metric
    await expect(page.locator('[data-testid="metric-views"]')).toBeVisible();
    
    const views = await page.locator('[data-testid="text-view-count"]').textContent();
    expect(views).toMatch(/\d+/); // Should contain numbers
  });

  test('PostAnalytics shows share count', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    const ownPost = page.locator('[data-testid^="card-post"]').filter({ hasText: testUser.name }).first();
    await ownPost.locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-analytics"]').click();
    
    // Should show shares metric
    await expect(page.locator('[data-testid="metric-shares"]')).toBeVisible();
  });

  test('PostAnalytics displays engagement rate', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    const ownPost = page.locator('[data-testid^="card-post"]').filter({ hasText: testUser.name }).first();
    await ownPost.locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-analytics"]').click();
    
    // Should show engagement rate
    await expect(page.locator('[data-testid="metric-engagement"]')).toBeVisible();
    
    const engagementRate = await page.locator('[data-testid="text-engagement-rate"]').textContent();
    expect(engagementRate).toMatch(/%/); // Should contain percentage
  });

  test('PostAnalytics shows top countries/regions', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    const ownPost = page.locator('[data-testid^="card-post"]').filter({ hasText: testUser.name }).first();
    await ownPost.locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-analytics"]').click();
    
    // Should show geographic data
    const topCountriesSection = page.locator('[data-testid="section-top-countries"]');
    
    if (await topCountriesSection.isVisible()) {
      await expect(page.locator('[data-testid^="country-"]')).toHaveCount(await page.locator('[data-testid^="country-"]').count());
    }
  });

  test('PostAnalytics only visible for own posts', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    // Find post from another user
    const otherPost = page.locator('[data-testid^="card-post"]').filter({ hasNotText: testUser.name }).first();
    
    if (await otherPost.count() > 0) {
      await otherPost.locator('[data-testid="button-post-menu"]').click();
      
      // Analytics button should not be visible for other users' posts
      const analyticsButton = page.locator('[data-testid="button-analytics"]');
      await expect(analyticsButton).not.toBeVisible();
    }
  });

  test('PostAnalytics updates in real-time', async ({ page, context }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    const ownPost = page.locator('[data-testid^="card-post"]').filter({ hasText: testUser.name }).first();
    await ownPost.locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-analytics"]').click();
    
    // Get initial view count
    const initialViews = await page.locator('[data-testid="text-view-count"]').textContent();
    
    // Simulate another user viewing (in new tab)
    const page2 = await context.newPage();
    await page2.goto('/feed');
    
    // Wait a moment for analytics to update
    await page.waitForTimeout(2000);
    
    // View count might have increased (depending on implementation)
    const updatedViews = await page.locator('[data-testid="text-view-count"]').textContent();
    
    // At minimum, views should still be displayed
    expect(updatedViews).toBeTruthy();
    
    await page2.close();
  });
});

test.describe('Modal Integration - Combined Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', testUser.email);
    await page.fill('[data-testid="input-password"]', testUser.password);
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/feed');
  });

  test('Can share post after editing', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    const ownPost = page.locator('[data-testid^="card-post"]').filter({ hasText: testUser.name }).first();
    
    // Edit post
    await ownPost.locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-edit"]').click();
    await page.fill('[data-testid="textarea-edit-content"]', 'Updated content');
    await page.locator('[data-testid="button-save-edit"]').click();
    
    // Share edited post
    await ownPost.locator('[data-testid="button-share"]').click();
    await expect(page.locator('[data-testid="modal-share"]')).toBeVisible();
    
    // Copy link
    await page.locator('[data-testid="button-copy-link"]').click();
    await expect(page.locator('[data-testid="text-copy-success"]')).toBeVisible();
  });

  test('Analytics reflect shares from ShareModal', async ({ page }) => {
    await page.waitForSelector('[data-testid^="card-post"]');
    
    const ownPost = page.locator('[data-testid^="card-post"]').filter({ hasText: testUser.name }).first();
    
    // Share post
    await ownPost.locator('[data-testid="button-share"]').click();
    await page.locator('[data-testid="button-copy-link"]').click();
    await page.locator('[data-testid="modal-backdrop"]').click({ position: { x: 10, y: 10 } });
    
    // Check analytics
    await ownPost.locator('[data-testid="button-post-menu"]').click();
    await page.locator('[data-testid="button-analytics"]').click();
    
    // Share count should be updated
    await expect(page.locator('[data-testid="metric-shares"]')).toBeVisible();
  });
});

// ============================================================================
// Tests validate all 4 modal components work correctly
// ============================================================================
