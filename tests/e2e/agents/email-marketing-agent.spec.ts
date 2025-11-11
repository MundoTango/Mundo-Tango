/**
 * EMAIL MARKETING AGENT TEST
 * Tests email campaign creation and management
 */

import { test, expect } from '@playwright/test';

test.describe('Marketing - Email Marketing Agent', () => {
  test('should access email marketing agent', async ({ page }) => {
    await page.goto('/admin/agents/email-marketing');
    await expect(page.getByTestId('email-marketing-agent-container')).toBeVisible();
  });

  test('should create email campaign', async ({ page }) => {
    await page.goto('/admin/agents/email-marketing');
    await page.getByTestId('button-create-campaign').click();
    await page.getByTestId('input-campaign-name').fill('December Newsletter');
    await page.getByTestId('button-save-campaign').click();
    await expect(page.getByText(/created/i)).toBeVisible();
  });

  test('should design email template', async ({ page }) => {
    await page.goto('/admin/agents/email-marketing/campaigns/1');
    await page.getByTestId('button-design-email').click();
    await expect(page.getByTestId('email-designer')).toBeVisible();
  });

  test('should send test email', async ({ page }) => {
    await page.goto('/admin/agents/email-marketing/campaigns/1');
    await page.getByTestId('button-send-test').click();
    await page.getByTestId('input-test-email').fill('test@example.com');
    await page.getByTestId('button-confirm-send').click();
    await expect(page.getByText(/sent/i)).toBeVisible();
  });

  test('should view campaign analytics', async ({ page }) => {
    await page.goto('/admin/agents/email-marketing/campaigns/1/analytics');
    await expect(page.getByTestId('open-rate')).toBeVisible();
    await expect(page.getByTestId('click-rate')).toBeVisible();
  });
});
