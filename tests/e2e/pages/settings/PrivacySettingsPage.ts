/**
 * PRIVACY SETTINGS PAGE OBJECT MODEL
 * Handles privacy controls
 */

import { Page, Locator } from '@playwright/test';

export class PrivacySettingsPage {
  readonly page: Page;
  readonly profileVisibilitySelect: Locator;
  readonly showEmailCheckbox: Locator;
  readonly showPhoneCheckbox: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.profileVisibilitySelect = page.getByTestId('select-profile-visibility');
    this.showEmailCheckbox = page.getByTestId('checkbox-show-email');
    this.showPhoneCheckbox = page.getByTestId('checkbox-show-phone');
    this.saveButton = page.getByTestId('button-save-privacy');
  }

  /**
   * Navigate to privacy settings
   */
  async goto(): Promise<void> {
    await this.page.goto('/settings/privacy');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Set profile visibility
   */
  async setProfileVisibility(visibility: 'public' | 'friends' | 'private'): Promise<void> {
    await this.profileVisibilitySelect.click();
    const option = this.page.getByTestId(`option-${visibility}`);
    await option.click();
  }

  /**
   * Toggle email visibility
   */
  async toggleEmailVisibility(): Promise<void> {
    await this.showEmailCheckbox.click();
  }

  /**
   * Save privacy settings
   */
  async saveSettings(): Promise<void> {
    await this.saveButton.click();
  }
}
