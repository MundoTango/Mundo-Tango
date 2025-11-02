/**
 * WORKSHOP PAGE OBJECT MODEL
 * Handles workshop listings and registration
 */

import { Page, Locator } from '@playwright/test';

export class WorkshopPage {
  readonly page: Page;
  readonly workshopsList: Locator;
  readonly searchInput: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.workshopsList = page.getByTestId('list-workshops');
    this.searchInput = page.getByTestId('input-search-workshops');
    this.registerButton = page.getByTestId('button-register');
  }

  /**
   * Navigate to workshops page
   */
  async goto(): Promise<void> {
    await this.page.goto('/workshops');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search workshops
   */
  async searchWorkshops(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  /**
   * Register for workshop
   */
  async registerForWorkshop(index: number): Promise<void> {
    const workshop = this.page.getByTestId(`workshop-${index}`);
    await workshop.click();
    await this.registerButton.click();
  }
}
