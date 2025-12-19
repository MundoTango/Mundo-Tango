/**
 * MARKETING DASHBOARD PAGE OBJECT MODEL
 * Handles marketing agent dashboard
 */

import { Page, Locator } from '@playwright/test';

export class MarketingDashboardPage {
  readonly page: Page;
  readonly seoAgentCard: Locator;
  readonly contentAgentCard: Locator;
  readonly socialMediaAgentCard: Locator;
  readonly analyticsCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.seoAgentCard = page.getByTestId('card-seo-agent');
    this.contentAgentCard = page.getByTestId('card-content-agent');
    this.socialMediaAgentCard = page.getByTestId('card-social-media-agent');
    this.analyticsCard = page.getByTestId('card-analytics');
  }

  /**
   * Navigate to marketing dashboard
   */
  async goto(): Promise<void> {
    await this.page.goto('/marketing');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Open SEO agent
   */
  async openSEOAgent(): Promise<void> {
    await this.seoAgentCard.click();
  }

  /**
   * Open content agent
   */
  async openContentAgent(): Promise<void> {
    await this.contentAgentCard.click();
  }

  /**
   * Open social media agent
   */
  async openSocialMediaAgent(): Promise<void> {
    await this.socialMediaAgentCard.click();
  }
}
