/**
 * ONBOARDING AGENT TEST
 * Tests employee onboarding and training agent
 */

import { test, expect } from '@playwright/test';

test.describe('HR - Onboarding Agent', () => {
  test('should access onboarding agent', async ({ page }) => {
    await page.goto('/admin/agents/onboarding');
    await expect(page.getByTestId('onboarding-agent-container')).toBeVisible();
  });

  test('should create onboarding checklist', async ({ page }) => {
    await page.goto('/admin/agents/onboarding');
    await page.getByTestId('button-create-checklist').click();
    await page.getByTestId('input-employee-name').fill('John Doe');
    await page.getByTestId('button-save-checklist').click();
    await expect(page.getByText(/created/i)).toBeVisible();
  });

  test('should assign training modules', async ({ page }) => {
    await page.goto('/admin/agents/onboarding/1');
    await page.getByTestId('button-assign-modules').click();
    await page.getByTestId('checkbox-platform-basics').click();
    await page.getByTestId('button-save-assignments').click();
    await expect(page.getByText(/assigned/i)).toBeVisible();
  });

  test('should track progress', async ({ page }) => {
    await page.goto('/admin/agents/onboarding/1');
    await expect(page.getByTestId('progress-tracker')).toBeVisible();
  });
});
