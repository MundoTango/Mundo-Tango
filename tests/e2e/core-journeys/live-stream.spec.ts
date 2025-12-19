/**
 * LIVE STREAM TEST
 * Tests live streaming events and viewer interaction
 */

import { test, expect } from '@playwright/test';

test.describe('Live Stream', () => {
  test('should view live stream page', async ({ page }) => {
    await page.goto('/live-stream');
    await expect(page.getByTestId('stream-container')).toBeVisible();
  });

  test('should join live stream', async ({ page }) => {
    await page.goto('/live-stream/1');
    await expect(page.getByTestId('video-player')).toBeVisible();
    await expect(page.getByTestId('stream-chat')).toBeVisible();
  });

  test('should send chat message in stream', async ({ page }) => {
    await page.goto('/live-stream/1');
    const message = `Test message ${Date.now()}`;
    await page.getByTestId('input-chat-message').fill(message);
    await page.getByTestId('button-send-message').click();
    await expect(page.getByText(message)).toBeVisible();
  });

  test('should view viewer count', async ({ page }) => {
    await page.goto('/live-stream/1');
    await expect(page.getByTestId('viewer-count')).toBeVisible();
  });
});
