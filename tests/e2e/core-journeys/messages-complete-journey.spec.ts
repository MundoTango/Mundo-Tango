/**
 * MESSAGES COMPLETE JOURNEY TEST
 * Tests direct messaging, conversations, and real-time chat
 */

import { test, expect } from '@playwright/test';

test.describe('Messages - Complete Journey', () => {
  test('should view messages inbox', async ({ page }) => {
    await page.goto('/messages');
    await expect(page.getByTestId('messages-container')).toBeVisible();
  });

  test('should start new conversation', async ({ page }) => {
    await page.goto('/messages');
    await page.getByTestId('button-new-message').click();
    await page.getByTestId('input-recipient').fill('testuser');
    await page.getByTestId('textarea-message').fill('Hello!');
    await page.getByTestId('button-send').click();
    await expect(page.getByText(/sent|delivered/i)).toBeVisible();
  });

  test('should send message in conversation', async ({ page }) => {
    await page.goto('/messages');
    await page.locator('[data-testid^="conversation-"]').first().click();
    await page.getByTestId('textarea-message').fill('Test message');
    await page.getByTestId('button-send').click();
    await expect(page.getByText('Test message')).toBeVisible();
  });

  test('should delete conversation', async ({ page }) => {
    await page.goto('/messages');
    await page.getByTestId('button-conversation-menu').first().click();
    await page.getByTestId('button-delete-conversation').click();
    await page.getByTestId('button-confirm-delete').click();
    await expect(page.getByText(/deleted|removed/i)).toBeVisible();
  });
});
