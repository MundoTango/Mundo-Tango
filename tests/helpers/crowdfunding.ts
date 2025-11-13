import { Page, expect } from '@playwright/test';

/**
 * Crowdfunding Helper - Campaign creation, donations, AI optimization
 */

export async function createCampaign(page: Page, campaignData: {
  title: string;
  description: string;
  goalAmount: number;
  duration: number;
  category: string;
  imagePath?: string;
}) {
  await page.getByTestId('button-create-campaign').click();
  await page.waitForSelector('[data-testid="campaign-form"]');
  
  await page.getByTestId('input-campaign-title').fill(campaignData.title);
  await page.getByTestId('textarea-campaign-description').fill(campaignData.description);
  await page.getByTestId('input-goal-amount').fill(campaignData.goalAmount.toString());
  await page.getByTestId('input-campaign-duration').fill(campaignData.duration.toString());
  
  await page.getByTestId('select-campaign-category').click();
  await page.getByRole('option', { name: campaignData.category }).click();
  
  if (campaignData.imagePath) {
    await page.getByTestId('input-campaign-image').setInputFiles(campaignData.imagePath);
  }
}

export async function addRewardTier(page: Page, tier: {
  name: string;
  amount: number;
  description: string;
  quantity?: number;
}) {
  await page.getByTestId('button-add-reward-tier').click();
  await page.waitForSelector('[data-testid="reward-tier-form"]');
  
  await page.getByTestId('input-tier-name').fill(tier.name);
  await page.getByTestId('input-tier-amount').fill(tier.amount.toString());
  await page.getByTestId('textarea-tier-description').fill(tier.description);
  
  if (tier.quantity) {
    await page.getByTestId('input-tier-quantity').fill(tier.quantity.toString());
  }
  
  await page.getByTestId('button-save-tier').click();
  await page.waitForSelector('[data-testid="reward-tier-list"]');
}

export async function submitCampaign(page: Page) {
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/crowdfunding/campaigns') && response.status() === 201
  );
  
  await page.getByTestId('button-submit-campaign').click();
  const response = await responsePromise;
  
  const responseData = await response.json();
  return responseData.id;
}

export async function waitForCampaignApproval(page: Page, campaignId: number) {
  // Navigate to campaign detail page
  await page.goto(`/crowdfunding/campaign/${campaignId}`);
  
  // Wait for AI QA approval (max 30 seconds)
  await page.waitForSelector('[data-testid="campaign-status-approved"]', { timeout: 30000 });
  
  // Verify campaign is published
  await expect(page.getByTestId('campaign-status')).toHaveText(/published|active/i);
}

export async function predictCampaignSuccess(page: Page) {
  await page.getByTestId('button-predict-success').click();
  
  // Wait for AI prediction
  await page.waitForSelector('[data-testid="success-prediction-results"]', { timeout: 15000 });
  
  // Verify prediction components
  await expect(page.getByTestId('success-probability')).toBeVisible();
  await expect(page.getByTestId('success-factors')).toBeVisible();
  await expect(page.getByTestId('optimal-goal-amount')).toBeVisible();
  await expect(page.getByTestId('optimal-duration')).toBeVisible();
  await expect(page.getByTestId('funding-timeline-prediction')).toBeVisible();
  
  // Get success probability
  const probabilityText = await page.getByTestId('success-probability').textContent();
  const probability = parseInt(probabilityText?.match(/\d+/)?.[0] || '0');
  
  return probability;
}

export async function optimizeCampaign(page: Page) {
  await page.getByTestId('button-optimize-campaign').click();
  
  // Wait for AI optimization
  await page.waitForSelector('[data-testid="campaign-optimization-results"]', { timeout: 20000 });
  
  // Verify optimization components
  await expect(page.getByTestId('story-quality-score')).toBeVisible();
  await expect(page.getByTestId('title-suggestions')).toBeVisible();
  await expect(page.getByTestId('image-quality-assessment')).toBeVisible();
  await expect(page.getByTestId('reward-tier-optimization')).toBeVisible();
  await expect(page.getByTestId('update-frequency-recommendations')).toBeVisible();
  await expect(page.getByTestId('ab-testing-suggestions')).toBeVisible();
}

export async function applyOptimizationSuggestions(page: Page) {
  await page.getByTestId('button-apply-optimizations').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/crowdfunding/campaigns') && response.status() === 200
  );
  
  // Verify success message
  await expect(page.getByText(/optimization.*applied|campaign.*updated/i)).toBeVisible();
}

export async function makeDonation(page: Page, donationData: {
  amount: number;
  recurring?: boolean;
  rewardTierId?: number;
  cardNumber?: string;
}) {
  await page.getByTestId('button-donate').click();
  await page.waitForSelector('[data-testid="donation-form"]');
  
  await page.getByTestId('input-donation-amount').fill(donationData.amount.toString());
  
  if (donationData.recurring) {
    await page.getByTestId('checkbox-recurring-donation').check();
  }
  
  if (donationData.rewardTierId) {
    await page.getByTestId(`select-reward-tier-${donationData.rewardTierId}`).click();
  }
  
  // Fill Stripe card details
  const cardNumber = donationData.cardNumber || '4242424242424242';
  await page.getByTestId('input-card-number').fill(cardNumber);
  await page.getByTestId('input-card-expiry').fill('12/30');
  await page.getByTestId('input-card-cvc').fill('123');
  
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/crowdfunding/donate') && response.status() === 200
  );
  
  await page.getByTestId('button-submit-donation').click();
  
  // Wait for AI fraud detection + payment processing
  await responsePromise;
  
  // Verify confirmation
  await expect(page.getByTestId('donation-confirmation')).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId('thank-you-message')).toBeVisible();
}

export async function generateThankYouMessages(page: Page) {
  // Navigate to donor management
  await page.getByTestId('tab-donors').click();
  
  await page.getByTestId('button-generate-thank-you').click();
  
  // Wait for AI to generate personalized messages
  await page.waitForSelector('[data-testid="thank-you-messages"]', { timeout: 15000 });
  
  // Verify message segmentation
  await expect(page.getByTestId('messages-one-time-donors')).toBeVisible();
  await expect(page.getByTestId('messages-recurring-donors')).toBeVisible();
  await expect(page.getByTestId('messages-whale-donors')).toBeVisible();
}

export async function sendBulkThankYou(page: Page) {
  await page.getByTestId('button-send-bulk-thank-you').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/crowdfunding/thank-you') && response.status() === 200
  );
  
  // Verify success notification
  await expect(page.getByText(/thank.*you.*messages.*sent/i)).toBeVisible();
}

export async function addCampaignUpdate(page: Page, updateData: {
  title: string;
  content: string;
  mediaPath?: string;
}) {
  await page.getByTestId('button-add-update').click();
  await page.waitForSelector('[data-testid="update-form"]');
  
  await page.getByTestId('input-update-title').fill(updateData.title);
  await page.getByTestId('textarea-update-content').fill(updateData.content);
  
  if (updateData.mediaPath) {
    await page.getByTestId('input-update-media').setInputFiles(updateData.mediaPath);
  }
  
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/crowdfunding/updates') && response.status() === 201
  );
  
  await page.getByTestId('button-publish-update').click();
  await responsePromise;
  
  // Verify update published
  await expect(page.getByText(/update.*published/i)).toBeVisible();
}

export async function createSuspiciousCampaign(page: Page) {
  await page.getByTestId('button-create-campaign').click();
  await page.waitForSelector('[data-testid="campaign-form"]');
  
  // Fill with AI-generated/suspicious content
  const suspiciousText = 'This amazing opportunity will change your life forever! ' +
    'I promise guaranteed returns and incredible success! ' +
    'Send money now before this limited time offer expires!';
  
  await page.getByTestId('input-campaign-title').fill('TOO GOOD TO BE TRUE - ACT NOW!!!');
  await page.getByTestId('textarea-campaign-description').fill(suspiciousText);
  await page.getByTestId('input-goal-amount').fill('1000000');
  await page.getByTestId('input-campaign-duration').fill('365');
  
  await page.getByTestId('select-campaign-category').click();
  await page.getByRole('option').first().click();
  
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/crowdfunding/campaigns') && response.status() === 201
  );
  
  await page.getByTestId('button-submit-campaign').click();
  await responsePromise;
}

export async function verifyFraudDetection(page: Page) {
  // Wait for AI fraud detection
  await page.waitForSelector('[data-testid="fraud-alert"]', { timeout: 15000 });
  
  // Verify risk score displayed
  await expect(page.getByTestId('fraud-risk-score')).toBeVisible();
  
  const riskScoreText = await page.getByTestId('fraud-risk-score').textContent();
  const riskScore = parseInt(riskScoreText?.match(/\d+/)?.[0] || '0');
  
  // Should be high risk (> 70)
  expect(riskScore).toBeGreaterThan(70);
  
  // Verify manual review required
  await expect(page.getByText(/manual.*review.*required/i)).toBeVisible();
}

export async function viewMyCampaigns(page: Page) {
  await page.goto('/crowdfunding/my');
  await page.waitForLoadState('networkidle');
  
  // Verify campaigns list displayed
  await expect(page.getByTestId('my-campaigns-list')).toBeVisible();
}

export async function verifyCampaignStatus(page: Page, expectedStatus: string) {
  const statusBadge = page.getByTestId('campaign-status');
  await expect(statusBadge).toHaveText(new RegExp(expectedStatus, 'i'));
}

export async function viewFundingProgress(page: Page) {
  await expect(page.getByTestId('funding-progress-bar')).toBeVisible();
  await expect(page.getByTestId('donor-count')).toBeVisible();
  await expect(page.getByTestId('total-raised')).toBeVisible();
}

export async function pauseCampaign(page: Page) {
  await page.getByTestId('button-pause-campaign').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/crowdfunding/campaigns') && response.status() === 200
  );
  
  await verifyCampaignStatus(page, 'paused');
}

export async function resumeCampaign(page: Page) {
  await page.getByTestId('button-resume-campaign').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/crowdfunding/campaigns') && response.status() === 200
  );
  
  await verifyCampaignStatus(page, 'active');
}

export async function closeCampaignEarly(page: Page) {
  await page.getByTestId('button-close-campaign').click();
  
  // Confirm closure
  await page.getByTestId('button-confirm-close').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/crowdfunding/campaigns') && response.status() === 200
  );
  
  await verifyCampaignStatus(page, 'closed');
}
