/**
 * SETTINGS PAGE OBJECT MODEL
 * Handles user settings and preferences
 */

import { Page, Locator } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;
  readonly accountTab: Locator;
  readonly privacyTab: Locator;
  readonly notificationsTab: Locator;
  readonly securityTab: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountTab = page.getByTestId('tab-account');
    this.privacyTab = page.getByTestId('tab-privacy');
    this.notificationsTab = page.getByTestId('tab-notifications');
    this.securityTab = page.getByTestId('tab-security');
    this.saveButton = page.getByTestId('button-save-settings');
  }

  /**
   * Navigate to settings page
   */
  async goto(): Promise<void> {
    await this.page.goto('/settings');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Go to account settings
   */
  async goToAccount(): Promise<void> {
    await this.accountTab.click();
  }

  /**
   * Go to privacy settings
   */
  async goToPrivacy(): Promise<void> {
    await this.privacyTab.click();
  }

  /**
   * Go to notification settings
   */
  async goToNotifications(): Promise<void> {
    await this.notificationsTab.click();
  }

  /**
   * Go to security settings
   */
  async goToSecurity(): Promise<void> {
    await this.securityTab.click();
  }

  /**
   * Save settings
   */
  async saveSettings(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Update profile field
   */
  async updateField(fieldName: string, value: string): Promise<void> {
    const field = this.page.getByTestId(`input-${fieldName}`);
    await field.fill(value);
  }
}
