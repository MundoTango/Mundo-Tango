/**
 * MR BLUE VOICE TEST
 * Tests voice interaction with Mr Blue AI assistant
 */

import { test, expect } from '@playwright/test';

test.describe('Mr Blue - Voice Interaction', () => {
  test('should open Mr Blue chat', async ({ page }) => {
    await page.goto('/feed');
    await page.getByTestId('button-mr-blue').click();
    await expect(page.getByTestId('mr-blue-chat')).toBeVisible();
  });

  test('should send text message to Mr Blue', async ({ page }) => {
    await page.goto('/mr-blue');
    const message = 'Find me tango events this weekend';
    await page.getByTestId('input-mr-blue-message').fill(message);
    await page.getByTestId('button-send').click();
    
    await expect(page.getByText(message)).toBeVisible();
    await expect(page.locator('[data-testid^="mr-blue-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should access voice input button', async ({ page }) => {
    await page.goto('/mr-blue');
    await expect(page.getByTestId('button-voice-input')).toBeVisible();
  });

  test('should view chat history', async ({ page }) => {
    await page.goto('/mr-blue/history');
    await expect(page.getByTestId('chat-history-container')).toBeVisible();
  });

  test('should clear chat', async ({ page }) => {
    await page.goto('/mr-blue');
    await page.getByTestId('button-clear-chat').click();
    await page.getByTestId('button-confirm-clear').click();
    await expect(page.getByText(/cleared/i)).toBeVisible();
  });
});
