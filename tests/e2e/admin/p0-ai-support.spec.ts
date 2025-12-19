/**
 * P0 WORKFLOW #4: AI SUPPORT TEST
 * Tests AI-powered customer support with human escalation
 */

import { test, expect } from '@playwright/test';

test.describe('P0 - AI Support Workflow', () => {
  test('should view AI support dashboard', async ({ page }) => {
    await page.goto('/admin/p0/ai-support');
    await expect(page.getByTestId('ai-support-dashboard')).toBeVisible();
  });

  test('should view active tickets', async ({ page }) => {
    await page.goto('/admin/p0/ai-support');
    await expect(page.getByTestId('active-tickets')).toBeVisible();
  });

  test('should view escalated tickets', async ({ page }) => {
    await page.goto('/admin/p0/ai-support/escalated');
    await expect(page.getByTestId('escalated-tickets')).toBeVisible();
  });

  test('should take over AI conversation', async ({ page }) => {
    await page.goto('/admin/p0/ai-support/escalated');
    await page.locator('[data-testid^="ticket-"]').first().click();
    await page.getByTestId('button-take-over').click();
    await expect(page.getByTestId('chat-interface')).toBeVisible();
  });

  test('should send message to user', async ({ page }) => {
    await page.goto('/admin/p0/ai-support/escalated');
    await page.locator('[data-testid^="ticket-"]').first().click();
    await page.getByTestId('textarea-message').fill('Hello, I can help with that');
    await page.getByTestId('button-send-message').click();
    await expect(page.getByText('Hello, I can help with that')).toBeVisible();
  });

  test('should resolve ticket', async ({ page }) => {
    await page.goto('/admin/p0/ai-support/escalated');
    await page.locator('[data-testid^="ticket-"]').first().click();
    await page.getByTestId('button-resolve-ticket').click();
    await page.getByTestId('textarea-resolution-notes').fill('Issue resolved');
    await page.getByTestId('button-confirm-resolve').click();
    await expect(page.getByText(/resolved/i)).toBeVisible();
  });

  test('should view AI performance metrics', async ({ page }) => {
    await page.goto('/admin/p0/ai-support/metrics');
    await expect(page.getByTestId('metric-resolution-rate')).toBeVisible();
    await expect(page.getByTestId('metric-avg-response-time')).toBeVisible();
  });
});
