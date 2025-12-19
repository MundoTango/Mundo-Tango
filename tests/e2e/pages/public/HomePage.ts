/**
 * PUBLIC HOME PAGE OBJECT MODEL
 * Handles landing page interactions
 */

import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly getStartedButton: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly featuresSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getStartedButton = page.getByTestId('button-get-started');
    this.loginButton = page.getByTestId('button-login');
    this.registerButton = page.getByTestId('button-register');
    this.featuresSection = page.getByTestId('section-features');
  }

  /**
   * Navigate to home page
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click get started
   */
  async getStarted(): Promise<void> {
    await this.getStartedButton.click();
  }

  /**
   * Go to login
   */
  async goToLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Go to register
   */
  async goToRegister(): Promise<void> {
    await this.registerButton.click();
  }

  /**
   * Scroll to features
   */
  async scrollToFeatures(): Promise<void> {
    await this.featuresSection.scrollIntoViewIfNeeded();
  }
}
