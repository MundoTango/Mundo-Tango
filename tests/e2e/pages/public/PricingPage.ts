/**
 * PRICING PAGE OBJECT MODEL
 * Handles pricing plans display
 */

import { Page, Locator } from '@playwright/test';

export class PricingPage {
  readonly page: Page;
  readonly freePlanCard: Locator;
  readonly proPlanCard: Locator;
  readonly selectFreePlanButton: Locator;
  readonly selectProPlanButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.freePlanCard = page.getByTestId('card-free-plan');
    this.proPlanCard = page.getByTestId('card-pro-plan');
    this.selectFreePlanButton = page.getByTestId('button-select-free');
    this.selectProPlanButton = page.getByTestId('button-select-pro');
  }

  /**
   * Navigate to pricing page
   */
  async goto(): Promise<void> {
    await this.page.goto('/pricing');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Select free plan
   */
  async selectFreePlan(): Promise<void> {
    await this.selectFreePlanButton.click();
  }

  /**
   * Select pro plan
   */
  async selectProPlan(): Promise<void> {
    await this.selectProPlanButton.click();
  }
}
