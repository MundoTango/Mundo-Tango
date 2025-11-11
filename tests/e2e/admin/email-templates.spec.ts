/**
 * ADMIN EMAIL TEMPLATES TEST
 * Tests email template management and customization
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Email Templates', () => {
  test('should view email templates', async ({ page }) => {
    await page.goto('/admin/email-templates');
    await expect(page.getByTestId('templates-list')).toBeVisible();
  });

  test('should edit email template', async ({ page }) => {
    await page.goto('/admin/email-templates/welcome');
    await expect(page.getByTestId('template-editor')).toBeVisible();
    await page.getByTestId('textarea-email-subject').fill('Welcome to Mundo Tango!');
    await page.getByTestId('button-save-template').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should preview email template', async ({ page }) => {
    await page.goto('/admin/email-templates/welcome');
    await page.getByTestId('button-preview-template').click();
    await expect(page.getByTestId('email-preview')).toBeVisible();
  });

  test('should send test email', async ({ page }) => {
    await page.goto('/admin/email-templates/welcome');
    await page.getByTestId('button-send-test').click();
    await page.getByTestId('input-test-email').fill('test@example.com');
    await page.getByTestId('button-confirm-send').click();
    await expect(page.getByText(/sent/i)).toBeVisible();
  });

  test('should reset template to default', async ({ page }) => {
    await page.goto('/admin/email-templates/welcome');
    await page.getByTestId('button-reset-template').click();
    await page.getByTestId('button-confirm-reset').click();
    await expect(page.getByText(/reset/i)).toBeVisible();
  });
});
