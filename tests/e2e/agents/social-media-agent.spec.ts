/**
 * SOCIAL MEDIA AGENT TEST
 * Tests social media management and scheduling agent
 */

import { test, expect } from '@playwright/test';

test.describe('Marketing - Social Media Agent', () => {
  test('should access social media agent', async ({ page }) => {
    await page.goto('/admin/agents/social-media');
    await expect(page.getByTestId('social-media-agent-container')).toBeVisible();
  });

  test('should schedule post', async ({ page }) => {
    await page.goto('/admin/agents/social-media');
    await page.getByTestId('textarea-post-content').fill('Join us for the next milonga!');
    await page.getByTestId('input-schedule-time').fill('2025-12-20T18:00');
    await page.getByTestId('button-schedule-post').click();
    await expect(page.getByText(/scheduled/i)).toBeVisible();
  });

  test('should view post analytics', async ({ page }) => {
    await page.goto('/admin/agents/social-media/analytics');
    await expect(page.getByTestId('post-analytics')).toBeVisible();
  });

  test('should generate hashtag suggestions', async ({ page }) => {
    await page.goto('/admin/agents/social-media');
    await page.getByTestId('button-suggest-hashtags').click();
    await expect(page.getByTestId('hashtag-suggestions')).toBeVisible();
  });
});
