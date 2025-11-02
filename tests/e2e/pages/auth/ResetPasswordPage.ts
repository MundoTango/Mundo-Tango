/**
 * RESET PASSWORD PAGE OBJECT MODEL
 * Handles password reset flow
 */

import { Page, Locator } from '@playwright/test';

export class ResetPasswordPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly backToLoginLink: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('input-email');
    this.submitButton = page.getByTestId('button-reset-password');
    this.backToLoginLink = page.getByTestId('link-back-to-login');
    this.successMessage = page.getByTestId('text-success');
  }

  /**
   * Navigate to reset password page
   */
  async goto(): Promise<void> {
    await this.page.goto('/reset-password');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Request password reset
   */
  async requestReset(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  /**
   * Navigate back to login
   */
  async backToLogin(): Promise<void> {
    await this.backToLoginLink.click();
  }
}
