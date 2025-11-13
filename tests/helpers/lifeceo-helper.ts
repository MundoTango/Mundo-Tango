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
    await expect(page.getByTestId('lifeceo-interface')).toBeVisible({ timeout: 5000 });
  }

  /**
   * Send a query to the AI agent and wait for response
   */
  static async sendQuery(page: Page, query: string) {
    const input = page.getByTestId('input-lifeceo-query');
    await input.fill(query);
    await page.getByTestId('button-lifeceo-send').click();
    
    // Wait for AI response
    await expect(page.getByTestId('lifeceo-response')).toBeVisible({ timeout: 15000 });
  }

  /**
   * Verify agent dashboard loaded correctly
   */
  static async verifyAgentDashboard(page: Page, agentName: string) {
    // Check agent title
    await expect(page.getByTestId(`heading-lifeceo-${agentName}`)).toBeVisible();
    
    // Check input area
    await expect(page.getByTestId('input-lifeceo-query')).toBeVisible();
    
    // Check send button
    await expect(page.getByTestId('button-lifeceo-send')).toBeVisible();
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
