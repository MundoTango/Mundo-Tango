/**
 * BENEFITS AGENT TEST
 * Tests employee benefits administration
 */

import { test, expect } from '@playwright/test';

test.describe('HR - Benefits Agent', () => {
  test('should access benefits agent', async ({ page }) => {
    await page.goto('/admin/agents/benefits');
    await expect(page.getByTestId('benefits-agent-container')).toBeVisible();
  });

  test('should view benefits catalog', async ({ page }) => {
    await page.goto('/admin/agents/benefits');
    await expect(page.getByTestId('benefits-catalog')).toBeVisible();
  });

  test('should enroll employee in benefit', async ({ page }) => {
    await page.goto('/admin/agents/benefits/employee/1');
    await page.getByTestId('button-enroll').first().click();
    await page.getByTestId('select-plan').click();
    await page.getByTestId('option-premium-plan').click();
    await page.getByTestId('button-confirm-enrollment').click();
    await expect(page.getByText(/enrolled/i)).toBeVisible();
  });

  test('should view enrollment status', async ({ page }) => {
    await page.goto('/admin/agents/benefits/employee/1');
    await expect(page.getByTestId('enrollment-status')).toBeVisible();
  });

  test('should process benefits changes', async ({ page }) => {
    await page.goto('/admin/agents/benefits/employee/1');
    await page.getByTestId('button-change-plan').click();
    await page.getByTestId('select-new-plan').click();
    await page.getByTestId('option-basic-plan').click();
    await page.getByTestId('button-submit-change').click();
    await expect(page.getByText(/updated/i)).toBeVisible();
  });
});
