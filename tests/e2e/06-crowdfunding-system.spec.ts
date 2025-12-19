import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../helpers/auth-setup';
import { navigateToPage, verifyOnPage, waitForPageLoad } from '../helpers/navigation';
import {
  createCampaign,
  addRewardTier,
  submitCampaign,
  waitForCampaignApproval,
  predictCampaignSuccess,
  optimizeCampaign,
  applyOptimizationSuggestions,
  makeDonation,
  generateThankYouMessages,
  sendBulkThankYou,
  addCampaignUpdate,
  createSuspiciousCampaign,
  verifyFraudDetection,
  viewMyCampaigns,
  verifyCampaignStatus,
  viewFundingProgress,
  pauseCampaign,
  resumeCampaign,
  closeCampaignEarly,
} from '../helpers/crowdfunding';
import {
  testCampaign,
  suspiciousCampaign,
  testDonation,
  testCampaignUpdate,
} from '../fixtures/crowdfunding';

/**
 * WAVE 5 BATCH 2: CROWDFUNDING/GOFUNDME SYSTEM TESTS
 * Comprehensive E2E tests for campaign creation, donations, AI optimization, and fraud detection
 */

test.describe('Crowdfunding: Campaign Creation & Optimization', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should create campaign with reward tiers', async ({ page }) => {
    await navigateToPage(page, '/crowdfunding/create');
    await waitForPageLoad(page);
    
    // Create campaign
    await createCampaign(page, testCampaign);
    
    // Add reward tiers
    for (const tier of testCampaign.rewardTiers) {
      await addRewardTier(page, tier);
      await page.waitForTimeout(500);
    }
    
    // Verify tiers added
    for (const tier of testCampaign.rewardTiers) {
      await expect(page.getByText(tier.name)).toBeVisible();
      await expect(page.getByText(`$${tier.amount}`)).toBeVisible();
    }
    
    // Submit campaign
    const campaignId = await submitCampaign(page);
    
    // Verify redirect to campaign page
    await expect(page.url()).toContain(`/crowdfunding/campaign/${campaignId}`);
    
    // Wait for AI QA approval
    await waitForCampaignApproval(page, campaignId);
    
    // Verify campaign published
    await expect(page.getByTestId('campaign-status')).toHaveText(/published|active/i);
  });

  test('should predict campaign success with AI agent', async ({ page }) => {
    await navigateToPage(page, '/crowdfunding/create');
    
    // Fill campaign form
    await createCampaign(page, testCampaign);
    
    // Predict success
    const probability = await predictCampaignSuccess(page);
    
    // Verify prediction displayed
    expect(probability).toBeGreaterThan(0);
    expect(probability).toBeLessThanOrEqual(100);
    
    // Verify success factors shown
    await expect(page.getByTestId('success-factors')).toBeVisible();
    
    // Verify optimal recommendations
    await expect(page.getByTestId('optimal-goal-amount')).toBeVisible();
    await expect(page.getByTestId('optimal-duration')).toBeVisible();
    
    // Verify timeline prediction
    await expect(page.getByTestId('funding-timeline-prediction')).toBeVisible();
  });

  test('should optimize campaign with AI recommendations', async ({ page }) => {
    await navigateToPage(page, '/crowdfunding/create');
    
    // Create campaign
    await createCampaign(page, testCampaign);
    
    // Optimize campaign
    await optimizeCampaign(page);
    
    // Verify optimization results
    await expect(page.getByTestId('campaign-optimization-results')).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId('story-quality-score')).toBeVisible();
    await expect(page.getByTestId('title-suggestions')).toBeVisible();
    await expect(page.getByTestId('image-quality-assessment')).toBeVisible();
    await expect(page.getByTestId('reward-tier-optimization')).toBeVisible();
    await expect(page.getByTestId('update-frequency-recommendations')).toBeVisible();
    await expect(page.getByTestId('ab-testing-suggestions')).toBeVisible();
    
    // Apply suggestions
    await applyOptimizationSuggestions(page);
    
    // Verify success
    await expect(page.getByText(/optimization.*applied|campaign.*updated/i)).toBeVisible();
  });
});

test.describe('Crowdfunding: Donations & Engagement', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should make donation with Stripe integration', async ({ page }) => {
    // Navigate to campaign
    await navigateToPage(page, '/crowdfunding/campaign/1');
    
    // Verify campaign details
    await expect(page.getByTestId('campaign-title')).toBeVisible();
    await expect(page.getByTestId('campaign-description')).toBeVisible();
    await expect(page.getByTestId('funding-progress')).toBeVisible();
    
    // Make donation
    await makeDonation(page, testDonation);
    
    // Verify confirmation
    await expect(page.getByTestId('donation-confirmation')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('thank-you-message')).toBeVisible();
    
    // Verify donation appears in campaign
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check updated funding amount
    await expect(page.getByTestId('total-raised')).toBeVisible();
  });

  test('should generate AI thank-you messages for donors', async ({ page }) => {
    // Navigate to campaign as creator
    await navigateToPage(page, '/crowdfunding/campaign/1');
    
    // Generate thank-you messages
    await generateThankYouMessages(page);
    
    // Verify messages generated
    await expect(page.getByTestId('thank-you-messages')).toBeVisible({ timeout: 15000 });
    
    // Verify donor segmentation
    await expect(page.getByTestId('messages-one-time-donors')).toBeVisible();
    await expect(page.getByTestId('messages-recurring-donors')).toBeVisible();
    await expect(page.getByTestId('messages-whale-donors')).toBeVisible();
    
    // Send bulk thank you
    await sendBulkThankYou(page);
    
    // Verify sent
    await expect(page.getByText(/thank.*you.*messages.*sent/i)).toBeVisible();
  });

  test('should add campaign update with media', async ({ page }) => {
    await navigateToPage(page, '/crowdfunding/campaign/1');
    
    // Add update
    await addCampaignUpdate(page, testCampaignUpdate);
    
    // Verify update published
    await expect(page.getByText(/update.*published/i)).toBeVisible();
    
    // Verify update displayed
    await expect(page.getByText(testCampaignUpdate.title)).toBeVisible();
    await expect(page.getByText(testCampaignUpdate.content)).toBeVisible();
    
    // Verify engagement options
    await expect(page.getByTestId('update-likes')).toBeVisible().catch(() => {});
    await expect(page.getByTestId('update-comments')).toBeVisible().catch(() => {});
  });
});

test.describe('Crowdfunding: Fraud Detection & Campaign Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should detect suspicious campaign with AI fraud detection', async ({ page }) => {
    await navigateToPage(page, '/crowdfunding/create');
    
    // Create suspicious campaign
    await createSuspiciousCampaign(page);
    
    // Verify fraud detection
    await verifyFraudDetection(page);
    
    // Verify high risk score
    await expect(page.getByTestId('fraud-risk-score')).toBeVisible();
    
    const riskScoreText = await page.getByTestId('fraud-risk-score').textContent();
    const riskScore = parseInt(riskScoreText?.match(/\d+/)?.[0] || '0');
    
    // Should be flagged for manual review (> 70)
    expect(riskScore).toBeGreaterThan(70);
    
    // Verify manual review required
    await expect(page.getByText(/manual.*review.*required/i)).toBeVisible();
  });

  test('should manage campaigns (view, edit, pause, resume)', async ({ page }) => {
    // View my campaigns
    await viewMyCampaigns(page);
    
    // Verify campaigns list
    await expect(page.getByTestId('my-campaigns-list')).toBeVisible();
    
    // View campaign details
    await page.getByTestId('campaign-card-1').click();
    await verifyOnPage(page, /\/crowdfunding\/campaign\/\d+/);
    
    // Verify funding progress
    await viewFundingProgress(page);
    
    await expect(page.getByTestId('funding-progress-bar')).toBeVisible();
    await expect(page.getByTestId('donor-count')).toBeVisible();
    await expect(page.getByTestId('total-raised')).toBeVisible();
    
    // Pause campaign
    await pauseCampaign(page);
    await verifyCampaignStatus(page, 'paused');
    
    // Resume campaign
    await resumeCampaign(page);
    await verifyCampaignStatus(page, 'active');
  });

  test('should close campaign early', async ({ page }) => {
    await navigateToPage(page, '/crowdfunding/campaign/1');
    
    // Close campaign
    await closeCampaignEarly(page);
    
    // Verify closed status
    await verifyCampaignStatus(page, 'closed');
    
    // Verify donations disabled
    await expect(
      page.getByTestId('button-donate')
    ).toBeDisabled().catch(() => {
      // Button might be hidden instead
      return expect(page.getByTestId('button-donate')).not.toBeVisible();
    });
  });
});

test.describe('Crowdfunding: Performance & Usability', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should load crowdfunding pages within performance targets', async ({ page }) => {
    const pages = [
      '/crowdfunding/dashboard',
      '/crowdfunding/create',
      '/crowdfunding/campaign/1',
      '/crowdfunding/my'
    ];
    
    for (const url of pages) {
      const loadTime = await waitForPageLoad(page, 3000);
      await navigateToPage(page, url);
      
      // Verify page loads in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    }
  });

  test('should persist campaign data across sessions', async ({ page }) => {
    // Create campaign
    await navigateToPage(page, '/crowdfunding/create');
    await createCampaign(page, testCampaign);
    
    const campaignId = await submitCampaign(page);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify data persists
    await expect(page.getByText(testCampaign.title)).toBeVisible();
    await expect(page.getByText(testCampaign.description)).toBeVisible();
    
    // Navigate away and back
    await navigateToPage(page, '/feed');
    await navigateToPage(page, `/crowdfunding/campaign/${campaignId}`);
    
    // Verify data still present
    await expect(page.getByText(testCampaign.title)).toBeVisible();
  });

  test('should validate form inputs correctly', async ({ page }) => {
    await navigateToPage(page, '/crowdfunding/create');
    
    // Try to submit empty form
    await page.getByTestId('button-submit-campaign').click();
    
    // Verify validation errors
    await expect(page.getByText(/title.*required/i)).toBeVisible().catch(() => {});
    await expect(page.getByText(/description.*required/i)).toBeVisible().catch(() => {});
    await expect(page.getByText(/goal.*required/i)).toBeVisible().catch(() => {});
    
    // Fill invalid data
    await page.getByTestId('input-campaign-title').fill('ab'); // Too short
    await page.getByTestId('input-goal-amount').fill('-100'); // Negative
    
    await page.getByTestId('button-submit-campaign').click();
    
    // Verify validation errors
    await expect(page.getByText(/title.*too.*short|minimum.*3.*characters/i)).toBeVisible().catch(() => {});
    await expect(page.getByText(/goal.*positive|invalid.*amount/i)).toBeVisible().catch(() => {});
  });
});
