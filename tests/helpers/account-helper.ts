import { Page, expect } from '@playwright/test';

/**
 * Account Helper - Settings & Account Management Utilities
 * Used by Agent 5 for testing account/settings pages
 */
export class AccountHelper {
  /**
   * Navigate to settings page
   */
  static async navigateToSettings(page: Page, section?: string) {
    const url = section ? `/settings/${section}` : '/settings';
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verify settings page loaded
   */
  static async verifySettingsPage(page: Page, section: string) {
    await expect(page.getByTestId('settings-page')).toBeVisible();
    await expect(page.getByTestId(`settings-${section}`)).toBeVisible();
  }

  /**
   * Update a setting and verify persistence
   */
  static async updateSetting(page: Page, settingId: string, value: boolean | string) {
    const element = page.getByTestId(settingId);
    
    if (typeof value === 'boolean') {
      // Toggle checkbox/switch
      if (value) {
        await element.check();
      } else {
        await element.uncheck();
      }
    } else {
      // Fill text input
      await element.fill(value);
    }
    
    // Wait for save
    await page.waitForTimeout(1000);
  }

  /**
   * Verify setting persists after reload
   */
  static async verifySettingPersists(page: Page, settingId: string, expectedValue: boolean | string) {
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const element = page.getByTestId(settingId);
    
    if (typeof expectedValue === 'boolean') {
      if (expectedValue) {
        await expect(element).toBeChecked();
      } else {
        await expect(element).not.toBeChecked();
      }
    } else {
      await expect(element).toHaveValue(expectedValue);
    }
  }

  /**
   * List of all settings sections
   */
  static getAllSettingsSections(): string[] {
    return [
      'profile',
      'privacy',
      'security',
      'notifications',
      'email-preferences',
      'accessibility',
      'language',
      'theme',
      'data',
      'subscription'
    ];
  }

  /**
   * Navigate to email verification page
   */
  static async navigateToEmailVerification(page: Page) {
    await page.goto('/email-verification');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to password reset page
   */
  static async navigateToPasswordReset(page: Page) {
    await page.goto('/password-reset');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verify account page loaded
   */
  static async verifyAccountPage(page: Page, pageName: string) {
    const heading = page.getByRole('heading', { name: new RegExp(pageName, 'i') });
    await expect(heading).toBeVisible();
  }
}
