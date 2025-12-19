import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test('Mr. Blue mode switcher accessible via keyboard', async ({ page }) => {
    await page.goto('/mr-blue');
    
    // Tab to mode switcher
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focus on first mode button
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(focusedElement).toBe('button-mode-text');
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowRight');
    const nextFocused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(nextFocused).toBe('button-mode-voice');
    
    // Activate with Enter
    await page.keyboard.press('Enter');
    
    // Verify mode changed
    const voiceButton = page.locator('[data-testid="button-mode-voice"]');
    await expect(voiceButton).toHaveClass(/default/);
  });
  
  test('Visual Editor element selection via keyboard', async ({ page }) => {
    await page.goto('/visual-editor');
    
    // Tab through controls
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return window.getComputedStyle(el!).outline !== 'none';
    });
    expect(focusedElement).toBeTruthy();
  });
  
  test('Chat input accessible via keyboard', async ({ page }) => {
    await page.goto('/mr-blue');
    
    // Focus on input
    const input = page.locator('[data-testid="input-message"]');
    await input.focus();
    
    // Type message
    await page.keyboard.type('Hello Mr. Blue');
    
    // Submit with Enter
    await page.keyboard.press('Enter');
    
    // Verify message sent
    await expect(page.locator('text=Hello Mr. Blue')).toBeVisible();
  });
});
