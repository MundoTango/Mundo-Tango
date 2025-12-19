/**
 * LOGIN PAGE OBJECT MODEL
 * Handles all interactions with the login page
 */

import { Page, Locator } from '@playwright/test';
import { selfHealing } from '../../helpers/self-healing-locator';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId('input-username');
    this.passwordInput = page.getByTestId('input-password');
    this.submitButton = page.getByTestId('button-login');
    this.errorMessage = page.getByTestId('text-error');
    this.registerLink = page.getByTestId('link-register');
    this.forgotPasswordLink = page.getByTestId('link-forgot-password');
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill login form
   */
  async fillLoginForm(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  /**
   * Submit login form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Complete login flow
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillLoginForm(username, password);
    await this.submit();
    await this.page.waitForURL(/\/feed|\/dashboard/, { timeout: 10000 });
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Navigate to register page
   */
  async goToRegister(): Promise<void> {
    await this.registerLink.click();
  }

  /**
   * Navigate to forgot password page
   */
  async goToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }
}
