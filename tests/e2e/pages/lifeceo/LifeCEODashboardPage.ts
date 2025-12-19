/**
 * LIFE CEO DASHBOARD PAGE OBJECT MODEL
 * Handles Life CEO dashboard with 16 agents
 */

import { Page, Locator } from '@playwright/test';

export class LifeCEODashboardPage {
  readonly page: Page;
  readonly healthAgentCard: Locator;
  readonly financeAgentCard: Locator;
  readonly careerAgentCard: Locator;
  readonly productivityAgentCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.healthAgentCard = page.getByTestId('card-health-agent');
    this.financeAgentCard = page.getByTestId('card-finance-agent');
    this.careerAgentCard = page.getByTestId('card-career-agent');
    this.productivityAgentCard = page.getByTestId('card-productivity-agent');
  }

  /**
   * Navigate to Life CEO dashboard
   */
  async goto(): Promise<void> {
    await this.page.goto('/life-ceo');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Open health agent
   */
  async openHealthAgent(): Promise<void> {
    await this.healthAgentCard.click();
  }

  /**
   * Open finance agent
   */
  async openFinanceAgent(): Promise<void> {
    await this.financeAgentCard.click();
  }

  /**
   * Open career agent
   */
  async openCareerAgent(): Promise<void> {
    await this.careerAgentCard.click();
  }

  /**
   * Open productivity agent
   */
  async openProductivityAgent(): Promise<void> {
    await this.productivityAgentCard.click();
  }
}
