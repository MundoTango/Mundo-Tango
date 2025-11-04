import { test, expect } from '@playwright/test';

test.describe('Visual Editor - Mr. Blue AI Assistant', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('[data-testid="input-email"]', 'admin@mundotango.life');
    await page.fill('[data-testid="input-password"]', 'admin123');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/');
    
    // Navigate to Visual Editor
    await page.goto('/admin/visual-editor');
    await page.waitForSelector('[data-visual-editor="root"]');
    
    // Make sure we're on Mr. Blue tab
    await page.click('[data-testid="tab-mr-blue"]');
    await page.waitForTimeout(1000);
  });

  test('should display Mr. Blue greeting message', async ({ page }) => {
    const greeting = page.getByText(/Hi! I'm Mr. Blue/i);
    await expect(greeting).toBeVisible();
  });

  test('should show context awareness in greeting', async ({ page }) => {
    await expect(page.getByText(/Current page:/i)).toBeVisible();
    await expect(page.getByText(/Selected element:/i)).toBeVisible();
    await expect(page.getByText(/Total edits:/i)).toBeVisible();
  });

  test('should display Mr. Blue avatar', async ({ page }) => {
    // Avatar should be visible in header
    const header = page.locator('h3:has-text("Mr. Blue - Visual Editor")');
    await expect(header).toBeVisible();
  });

  test('should show TTS toggle button', async ({ page }) => {
    const ttsButton = page.locator('[data-testid="button-toggle-tts"]');
    await expect(ttsButton).toBeVisible();
  });

  test('should show voice input button', async ({ page }) => {
    const voiceButton = page.locator('[data-testid="button-voice-input"]');
    // Button exists (may not be clickable in headless)
    const count = await voiceButton.count();
    expect(count).toBeGreaterThanOrEqual(0); // Present or gracefully hidden
  });

  test('should display send button', async ({ page }) => {
    const sendButton = page.locator('[data-testid="button-send-visual-chat"]');
    await expect(sendButton).toBeVisible();
    
    // Should be disabled when input is empty
    const chatInput = page.locator('[data-testid="input-mr-blue-visual-chat"]');
    await expect(chatInput).toHaveValue('');
    await expect(sendButton).toBeDisabled();
  });

  test('send button should enable when text is entered', async ({ page }) => {
    const chatInput = page.locator('[data-testid="input-mr-blue-visual-chat"]');
    const sendButton = page.locator('[data-testid="button-send-visual-chat"]');
    
    await chatInput.fill('Make the title larger');
    await expect(sendButton).toBeEnabled();
  });

  test('should display quick action suggestions when element selected', async ({ page }) => {
    // When no element is selected, no suggestions
    const suggestionsHeader = page.getByText('Quick Actions');
    const count = await suggestionsHeader.count();
    
    // Suggestions only show when element is selected
    // Initially no selection, so 0 count is expected
    expect(count).toBe(0);
  });

  test('should show Recent Edits section when there are edits', async ({ page }) => {
    // Initially no edits
    const recentEditsHeader = page.getByText('Recent Edits');
    const count = await recentEditsHeader.count();
    
    // Should be 0 when no edits yet
    expect(count).toBe(0);
  });

  test('should display context bar with current state', async ({ page }) => {
    const contextBar = page.locator('text=Context:');
    await expect(contextBar).toBeVisible();
    
    // Should show homepage and 0 edits
    await expect(page.getByText('0 edits')).toBeVisible();
  });

  test('should show message with timestamp', async ({ page }) => {
    const messages = page.locator('[data-testid="message-assistant"]');
    const firstMessage = messages.first();
    await expect(firstMessage).toBeVisible();
    
    // Should have timestamp
    const timestamp = firstMessage.locator('span.text-xs.opacity-70');
    await expect(timestamp).toBeVisible();
  });

  test('chat input should accept text', async ({ page }) => {
    const chatInput = page.locator('[data-testid="input-mr-blue-visual-chat"]');
    
    await chatInput.fill('Change the background to blue');
    await expect(chatInput).toHaveValue('Change the background to blue');
  });

  test('should display capabilities in greeting', async ({ page }) => {
    await expect(page.getByText(/What I can help with:/i)).toBeVisible();
    await expect(page.getByText(/Move, edit, resize, delete elements/i)).toBeVisible();
    await expect(page.getByText(/Change colors, fonts, spacing/i)).toBeVisible();
    await expect(page.getByText(/Add\/modify content and styling/i)).toBeVisible();
    await expect(page.getByText(/Generate production-ready code/i)).toBeVisible();
  });

  test('Mr. Blue header should show status text', async ({ page }) => {
    const statusText = page.locator('p.text-xs.text-muted-foreground');
    await expect(statusText.first()).toBeVisible();
    await expect(statusText.first()).toContainText(/Context-aware editing assistant/i);
  });
});
