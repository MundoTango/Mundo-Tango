import { Page, expect } from '@playwright/test';

/**
 * Social Media Integration Testing Helper
 * Utilities for testing social media features
 */

export async function createSocialPost(page: Page, data: {
  content: string;
  platforms?: string[];
  scheduleTime?: string;
  image?: string;
}) {
  await page.goto('/social/compose');
  
  // Fill content
  await page.getByTestId('input-post-content').fill(data.content);
  
  // Select platforms
  if (data.platforms) {
    for (const platform of data.platforms) {
      await page.getByTestId(`checkbox-platform-${platform}`).check();
    }
  }
  
  // Upload image if provided
  if (data.image) {
    await page.getByTestId('input-upload-image').setInputFiles(data.image);
    await page.waitForTimeout(1000); // Wait for upload
  }
  
  // Schedule time if provided
  if (data.scheduleTime) {
    await page.getByTestId('button-schedule-post').click();
    await page.getByTestId('input-schedule-time').fill(data.scheduleTime);
  }
  
  // Submit post
  await page.getByTestId('button-submit-post').click();
  
  // Wait for confirmation
  await expect(page.getByText(/post (published|scheduled)/i)).toBeVisible({ timeout: 10000 });
}

export async function generateAICaption(page: Page, imagePath: string) {
  await page.goto('/social/compose');
  
  // Upload image
  await page.getByTestId('input-upload-image').setInputFiles(imagePath);
  await page.waitForTimeout(1000);
  
  // Click generate AI caption
  await page.getByTestId('button-ai-generate-caption').click();
  
  // Wait for AI to generate caption
  await page.waitForTimeout(3000); // AI processing time
  
  // Verify caption was generated
  const caption = await page.getByTestId('input-post-content').inputValue();
  expect(caption.length).toBeGreaterThan(0);
  
  return caption;
}

export async function getSuggestedPostingTime(page: Page, platform: string) {
  await page.goto('/social/compose');
  await page.getByTestId('button-suggest-best-time').click();
  
  // Wait for suggestions to load
  await page.waitForTimeout(2000);
  
  // Verify suggested times are shown
  await expect(page.getByTestId(`suggested-time-${platform}`)).toBeVisible();
}

export async function connectSocialPlatform(page: Page, platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter') {
  await page.goto('/social/connections');
  await page.getByTestId(`button-connect-${platform}`).click();
  
  // Simulate OAuth flow (in real tests, this would go through actual OAuth)
  await expect(page.getByText(/connect.*${platform}/i)).toBeVisible();
  
  // For testing, we can mock the connection success
  // In production, this would involve OAuth redirect flow
}

export async function verifyPlatformConnected(page: Page, platform: string) {
  await page.goto('/social/connections');
  const status = page.getByTestId(`status-${platform}`);
  await expect(status).toHaveText(/connected/i);
}

export async function viewEngagementMetrics(page: Page, postId: string) {
  await page.goto('/social/analytics');
  await page.getByTestId(`post-${postId}`).click();
  
  // Verify engagement metrics are visible
  await expect(page.getByTestId('metric-likes')).toBeVisible();
  await expect(page.getByTestId('metric-comments')).toBeVisible();
  await expect(page.getByTestId('metric-shares')).toBeVisible();
  await expect(page.getByTestId('metric-reach')).toBeVisible();
}

export async function createCampaign(page: Page, data: {
  name: string;
  platforms: string[];
  startDate: string;
  endDate: string;
}) {
  await page.goto('/social/campaigns');
  await page.getByTestId('button-create-campaign').click();
  
  // Fill campaign details
  await page.getByTestId('input-campaign-name').fill(data.name);
  
  // Select platforms
  for (const platform of data.platforms) {
    await page.getByTestId(`checkbox-platform-${platform}`).check();
  }
  
  // Set dates
  await page.getByTestId('input-start-date').fill(data.startDate);
  await page.getByTestId('input-end-date').fill(data.endDate);
  
  // Submit campaign
  await page.getByTestId('button-submit-campaign').click();
  
  // Wait for confirmation
  await expect(page.getByText(/campaign created/i)).toBeVisible({ timeout: 10000 });
}

export async function addPostToCampaign(page: Page, campaignId: string, postContent: string) {
  await page.goto(`/social/campaigns/${campaignId}`);
  await page.getByTestId('button-add-post').click();
  
  await page.getByTestId('input-post-content').fill(postContent);
  await page.getByTestId('button-save-post').click();
  
  // Verify post added to campaign
  await expect(page.getByText(postContent)).toBeVisible();
}

export async function launchCampaign(page: Page, campaignId: string) {
  await page.goto(`/social/campaigns/${campaignId}`);
  await page.getByTestId('button-launch-campaign').click();
  
  // Confirm launch
  await page.getByTestId('button-confirm-launch').click();
  
  // Wait for campaign to start
  await expect(page.getByText(/campaign (launched|active)/i)).toBeVisible({ timeout: 10000 });
}

export async function viewCampaignAnalytics(page: Page, campaignId: string) {
  await page.goto(`/social/campaigns/${campaignId}/analytics`);
  
  // Verify analytics metrics are visible
  await expect(page.getByTestId('metric-total-reach')).toBeVisible();
  await expect(page.getByTestId('metric-engagement-rate')).toBeVisible();
  await expect(page.getByTestId('metric-roi')).toBeVisible();
}

export async function viewAIInsights(page: Page) {
  await page.goto('/social/insights');
  
  // Verify AI insights sections are present
  await expect(page.getByTestId('section-content-performance')).toBeVisible();
  await expect(page.getByTestId('section-audience-insights')).toBeVisible();
  await expect(page.getByTestId('section-growth-recommendations')).toBeVisible();
}

export async function checkHashtagSuggestions(page: Page) {
  await page.goto('/social/compose');
  
  // Start typing content
  await page.getByTestId('input-post-content').fill('Dancing tango in Buenos Aires');
  
  // Wait for AI to suggest hashtags
  await page.waitForTimeout(2000);
  
  // Verify hashtag suggestions appear
  await expect(page.getByTestId('suggested-hashtags')).toBeVisible();
}
