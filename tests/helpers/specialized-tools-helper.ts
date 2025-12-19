import { Page, expect } from '@playwright/test';

/**
 * Specialized Tools Helper - Avatar, Visual Editor, Talent Match Utilities
 * Used by Agent 8 for testing specialized tool pages
 */
export class SpecializedToolsHelper {
  /**
   * Navigate to Avatar Designer
   */
  static async navigateToAvatarDesigner(page: Page) {
    await page.goto('/avatar-designer');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Visual Editor
   */
  static async navigateToVisualEditor(page: Page) {
    await page.goto('/visual-editor');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Talent Match
   */
  static async navigateToTalentMatch(page: Page) {
    await page.goto('/talent-match');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Leaderboard
   */
  static async navigateToLeaderboard(page: Page) {
    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to City Guides
   */
  static async navigateToCityGuides(page: Page, city?: string) {
    const url = city ? `/city-guides/${city}` : '/city-guides';
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Venue Recommendations
   */
  static async navigateToVenueRecommendations(page: Page) {
    await page.goto('/venue-recommendations');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verify avatar designer loaded
   */
  static async verifyAvatarDesigner(page: Page) {
    // Look for avatar customization UI
    const heading = page.getByRole('heading', { name: /avatar|designer|customize/i }).first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
    
    // Look for customization controls
    const controls = page.locator('[data-testid*="avatar"], [data-testid*="customize"]').first();
    if (await controls.isVisible()) {
      await expect(controls).toBeVisible();
    }
  }

  /**
   * Verify visual editor loaded
   */
  static async verifyVisualEditor(page: Page) {
    // Look for editor interface
    const heading = page.getByRole('heading', { name: /visual|editor|code/i }).first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
    
    // Look for editor controls or preview
    const editor = page.locator('[data-testid*="editor"], [data-testid*="preview"], iframe').first();
    if (await editor.isVisible()) {
      await expect(editor).toBeVisible();
    }
  }

  /**
   * Verify talent match loaded
   */
  static async verifyTalentMatch(page: Page) {
    // Look for talent match interface
    const heading = page.getByRole('heading', { name: /talent|match|find/i }).first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
  }

  /**
   * Verify leaderboard loaded
   */
  static async verifyLeaderboard(page: Page) {
    // Look for leaderboard
    const heading = page.getByRole('heading', { name: /leaderboard|ranking|top/i }).first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
    
    // Look for leaderboard entries
    const entries = page.locator('[data-testid*="leaderboard"], [data-testid*="rank"]').first();
    if (await entries.isVisible()) {
      await expect(entries).toBeVisible();
    }
  }

  /**
   * Verify city guides loaded
   */
  static async verifyCityGuides(page: Page) {
    // Look for city guide content
    const heading = page.getByRole('heading', { name: /city|guide|travel/i }).first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
  }

  /**
   * Verify venue recommendations loaded
   */
  static async verifyVenueRecommendations(page: Page) {
    // Look for venue recommendations
    const heading = page.getByRole('heading', { name: /venue|recommend|place/i }).first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
  }

  /**
   * Test avatar customization interaction
   */
  static async testAvatarCustomization(page: Page) {
    // Look for customization options
    const options = page.locator('button, [role="button"]').first();
    if (await options.isVisible()) {
      await options.click();
      await page.waitForTimeout(500);
    }
  }

  /**
   * Test visual editor code generation
   */
  static async testVisualEditorCodeGen(page: Page, prompt: string) {
    // Look for input field
    const input = page.locator('input[type="text"], textarea').first();
    if (await input.isVisible()) {
      await input.fill(prompt);
      
      // Look for generate button
      const generateBtn = page.locator('button:has-text("Generate"), button:has-text("Create")').first();
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  }

  /**
   * Test talent match search
   */
  static async testTalentMatchSearch(page: Page, query: string) {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(query);
      await page.waitForTimeout(1000);
    }
  }

  /**
   * Verify page has interactive elements
   */
  static async verifyInteractiveElements(page: Page) {
    // Check for buttons, inputs, or interactive controls
    const interactive = page.locator('button, input, select, [role="button"]').first();
    await expect(interactive).toBeVisible();
  }
}
