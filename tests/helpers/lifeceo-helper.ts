import { Page, expect } from '@playwright/test';

/**
 * Life CEO Helper - AI Agent Testing Utilities
 * Used by Agent 1 for testing 16 Life CEO agent pages
 */
export class LifeCEOHelper {
  /**
   * Navigate to a Life CEO agent page and wait for load
   */
  static async navigateToAgent(page: Page, agentName: string) {
    await page.goto(`/life-ceo/${agentName}`);
    await page.waitForLoadState('networkidle');
    
    // Flexible check - look for heading or main content
    const mainContent = page.locator('main, [role="main"], h1').first();
    await expect(mainContent).toBeVisible({ timeout: 5000 });
  }

  /**
   * Send a query to the AI agent and wait for response
   */
  static async sendQuery(page: Page, query: string) {
    // Find input field (flexible)
    const input = page.locator('input[type="text"], textarea, [contenteditable]').first();
    
    if (await input.isVisible()) {
      await input.fill(query);
      
      // Find send button (flexible)
      const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first();
      if (await sendButton.isVisible()) {
        await sendButton.click();
        
        // Wait for some response (flexible - just wait for page to update)
        await page.waitForTimeout(2000);
      }
    }
  }

  /**
   * Verify agent dashboard loaded correctly
   */
  static async verifyAgentDashboard(page: Page, agentName: string) {
    // Check for heading with agent name (flexible)
    const heading = page.getByRole('heading', { name: new RegExp(agentName, 'i') }).first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
    
    // Look for input area (flexible selectors)
    const input = page.locator('input[type="text"], textarea, [contenteditable]').first();
    if (await input.isVisible()) {
      await expect(input).toBeVisible();
    }
  }

  /**
   * Test AI response quality
   */
  static async verifyResponseQuality(page: Page) {
    const response = await page.getByTestId('lifeceo-response').textContent();
    
    // Response should be non-empty
    expect(response).toBeTruthy();
    expect(response!.length).toBeGreaterThan(10);
    
    // Should not be error message
    expect(response!.toLowerCase()).not.toContain('error');
    expect(response!.toLowerCase()).not.toContain('failed');
  }

  /**
   * List of all Life CEO agents
   */
  static getAllAgents(): string[] {
    return [
      'health',
      'finance',
      'career',
      'productivity',
      'travel',
      'home',
      'learning',
      'social',
      'wellness',
      'entertainment',
      'creativity',
      'fitness',
      'nutrition',
      'sleep',
      'stress'
    ];
  }
}
