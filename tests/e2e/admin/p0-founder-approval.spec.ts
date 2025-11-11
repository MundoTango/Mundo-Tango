/**
 * P0 WORKFLOW #1: FOUNDER APPROVAL TEST
 * Tests feature review and approval system
 */

import { test, expect } from '@playwright/test';

test.describe('P0 - Founder Approval Workflow', () => {
  test('should view founder approval queue', async ({ page }) => {
    await page.goto('/admin/p0/founder-approval');
    await expect(page.getByTestId('approval-queue')).toBeVisible();
  });

  test('should view pending features', async ({ page }) => {
    await page.goto('/admin/p0/founder-approval');
    await expect(page.locator('[data-testid^="feature-"]')).toHaveCount({ min: 0 });
  });

  test('should approve feature', async ({ page }) => {
    await page.goto('/admin/p0/founder-approval');
    await page.locator('[data-testid^="feature-"]').first().click();
    await page.getByTestId('button-approve-feature').click();
    await page.getByTestId('textarea-approval-notes').fill('Looks good!');
    await page.getByTestId('button-confirm-approve').click();
    await expect(page.getByText(/approved/i)).toBeVisible();
  });

  test('should reject feature with feedback', async ({ page }) => {
    await page.goto('/admin/p0/founder-approval');
    await page.locator('[data-testid^="feature-"]').first().click();
    await page.getByTestId('button-reject-feature').click();
    await page.getByTestId('textarea-feedback').fill('Needs more work on UX');
    await page.getByTestId('button-confirm-reject').click();
    await expect(page.getByText(/rejected/i)).toBeVisible();
  });

  test('should request changes', async ({ page }) => {
    await page.goto('/admin/p0/founder-approval');
    await page.locator('[data-testid^="feature-"]').first().click();
    await page.getByTestId('button-request-changes').click();
    await page.getByTestId('textarea-changes-requested').fill('Add dark mode support');
    await page.getByTestId('button-submit-changes').click();
    await expect(page.getByText(/changes.*requested/i)).toBeVisible();
  });
});
