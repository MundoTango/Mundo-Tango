import { Page, expect } from '@playwright/test';

/**
 * Profile Helper - 23-Tab Profile System Testing Utilities
 * Used by Agent 2 for testing profile tab pages
 */
export class ProfileHelper {
  /**
   * Navigate to a specific profile tab
   */
  static async navigateToTab(page: Page, tabName: string, userId?: number) {
    const userPath = userId ? `/${userId}` : '';
    await page.goto(`/profile${userPath}/${tabName}`);
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verify tab is active and content loaded
   */
  static async verifyTabActive(page: Page, tabName: string) {
    // Check tab is marked as active
    const tab = page.getByTestId(`tab-${tabName}`);
    await expect(tab).toBeVisible();
    
    // Check tab content area loaded
    await expect(page.getByTestId(`${tabName}-content`)).toBeVisible();
  }

  /**
   * Verify tab navigation works
   */
  static async testTabNavigation(page: Page, fromTab: string, toTab: string) {
    await this.navigateToTab(page, fromTab);
    await this.verifyTabActive(page, fromTab);
    
    // Click on target tab
    await page.getByTestId(`tab-${toTab}`).click();
    await page.waitForURL(`**/profile/**/${toTab}`);
    await this.verifyTabActive(page, toTab);
  }

  /**
   * List of all profile tabs
   */
  static getAllTabs(): string[] {
    return [
      'overview',     // Main profile
      'about',        // About section
      'photos',       // Photo gallery
      'videos',       // Video gallery
      'events',       // User events
      'groups',       // User groups
      'music',        // Music preferences
      'workshops',    // Workshop history
      'reviews',      // Reviews given/received
      'travel',       // Travel plans
      'connections',  // Friend connections
      'badges',       // Achievements/badges
      'timeline',     // Activity timeline
      'achievements', // Gamification
      'stats',        // User statistics
      'media',        // All media
      'activity',     // Recent activity
      'analytics',    // Personal analytics
      'professional', // Professional info
      'portfolio',    // Work portfolio
      'schedule',     // Calendar/availability
      'settings',     // Profile settings
      'privacy'       // Privacy controls
    ];
  }

  /**
   * Get tabs that require authentication
   */
  static getAuthenticatedTabs(): string[] {
    return ['settings', 'privacy', 'analytics'];
  }

  /**
   * Verify profile header (common across all tabs)
   */
  static async verifyProfileHeader(page: Page) {
    await expect(page.getByTestId('profile-header')).toBeVisible();
    await expect(page.getByTestId('profile-avatar')).toBeVisible();
    await expect(page.getByTestId('profile-name')).toBeVisible();
  }
}
