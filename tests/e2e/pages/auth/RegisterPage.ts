/**
 * REGISTER PAGE OBJECT MODEL
 * Handles all interactions with the registration page
 */

import { Page, Locator } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId('input-name');
    this.usernameInput = page.getByTestId('input-username');
    this.emailInput = page.getByTestId('input-email');
    this.passwordInput = page.getByTestId('input-password');
    this.confirmPasswordInput = page.getByTestId('input-confirm-password');
    this.submitButton = page.getByTestId('button-register');
    this.loginLink = page.getByTestId('link-login');
    this.errorMessage = page.getByTestId('text-error');
  }

  /**
   * Navigate to register page
   */
  async goto(): Promise<void> {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill registration form
   */
  async fillRegisterForm(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.usernameInput.fill(data.username);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.password);
  }

  /**
   * Submit registration form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Complete registration flow
   */
  async register(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.fillRegisterForm(data);
    await this.submit();
    await this.page.waitForURL(/\/feed|\/onboarding/, { timeout: 10000 });
  }

  /**
   * Navigate to login page
   */
  async goToLogin(): Promise<void> {
    await this.loginLink.click();
  }
}
