/**
 * CONTACT PAGE OBJECT MODEL
 * Handles contact form
 */

import { Page, Locator } from '@playwright/test';

export class ContactPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId('input-name');
    this.emailInput = page.getByTestId('input-email');
    this.messageInput = page.getByTestId('input-message');
    this.submitButton = page.getByTestId('button-submit-contact');
    this.successMessage = page.getByTestId('text-success');
  }

  /**
   * Navigate to contact page
   */
  async goto(): Promise<void> {
    await this.page.goto('/contact');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill and submit contact form
   */
  async submitContactForm(name: string, email: string, message: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.messageInput.fill(message);
    await this.submitButton.click();
  }
}
