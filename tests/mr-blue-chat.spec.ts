import { test, expect } from '@playwright/test';

test.describe('Mr. Blue Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"], input[type="email"]', 'admin@mundotango.life');
    await page.fill('input[name="password"], input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/(feed|home|dashboard)/, { timeout: 15000 });
  });

  test('should open and close Mr. Blue chat panel', async ({ page }) => {
    const mrBlueButton = page.locator('[data-testid="button-ask-mr-blue"]');
    
    await expect(mrBlueButton).toBeVisible({ timeout: 10000 });
    await mrBlueButton.click();

    const chatPanel = page.locator('[data-testid="chat-side-panel"]').first();
    await expect(chatPanel).toBeVisible({ timeout: 5000 });

    const header = page.locator('text="Mr. Blue"').first();
    await expect(header).toBeVisible();

    const messageInput = page.locator('[data-testid="input-chat-message"]').first();
    await expect(messageInput).toBeVisible();

    await page.waitForTimeout(500);

    const closeButton = page.locator('[data-testid="button-close-chat"]').first();
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await expect(chatPanel).not.toBeVisible({ timeout: 5000 });
  });

  test('should display welcome message from Mr. Blue', async ({ page }) => {
    const mrBlueButton = page.locator('[data-testid="button-ask-mr-blue"]');
    await mrBlueButton.click();

    const chatPanel = page.locator('[data-testid="chat-side-panel"]').first();
    await expect(chatPanel).toBeVisible({ timeout: 5000 });

    const welcomeMessage = page.locator('[data-testid^="message-assistant-"]').first();
    await expect(welcomeMessage).toBeVisible({ timeout: 5000 });
    
    const welcomeText = await welcomeMessage.textContent();
    expect(welcomeText).toBeTruthy();
    expect(welcomeText!.toLowerCase()).toMatch(/welcome|platform|admin|help|walkthrough/);
  });

  test('should allow typing a message', async ({ page }) => {
    const mrBlueButton = page.locator('[data-testid="button-ask-mr-blue"]');
    await mrBlueButton.click();

    const chatPanel = page.locator('[data-testid="chat-side-panel"]').first();
    await expect(chatPanel).toBeVisible();

    const messageInput = page.locator('[data-testid="input-chat-message"]').first();
    await messageInput.fill('Hello Mr. Blue, what is Mundo Tango?');
    
    const inputValue = await messageInput.inputValue();
    expect(inputValue).toBe('Hello Mr. Blue, what is Mundo Tango?');

    const sendButton = page.locator('[data-testid="button-send-message"]').first();
    await expect(sendButton).toBeEnabled();
  });
});
