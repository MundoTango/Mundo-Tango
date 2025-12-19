/**
 * HR DASHBOARD PAGE OBJECT MODEL
 * Handles HR agent dashboard (H2AC framework)
 */

import { Page, Locator } from '@playwright/test';

export class HRDashboardPage {
  readonly page: Page;
  readonly recruiterAgentCard: Locator;
  readonly onboardingAgentCard: Locator;
  readonly performanceAgentCard: Locator;
  readonly retentionAgentCard: Locator;
  readonly cultureAgentCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.recruiterAgentCard = page.getByTestId('card-recruiter-agent');
    this.onboardingAgentCard = page.getByTestId('card-onboarding-agent');
    this.performanceAgentCard = page.getByTestId('card-performance-agent');
    this.retentionAgentCard = page.getByTestId('card-retention-agent');
    this.cultureAgentCard = page.getByTestId('card-culture-agent');
  }

  /**
   * Navigate to HR dashboard
   */
  async goto(): Promise<void> {
    await this.page.goto('/hr/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Open recruiter agent
   */
  async openRecruiterAgent(): Promise<void> {
    await this.recruiterAgentCard.click();
  }

  /**
   * Open onboarding agent
   */
  async openOnboardingAgent(): Promise<void> {
    await this.onboardingAgentCard.click();
  }

  /**
   * Open performance agent
   */
  async openPerformanceAgent(): Promise<void> {
    await this.performanceAgentCard.click();
  }
}
