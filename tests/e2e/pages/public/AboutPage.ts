/**
 * ABOUT PAGE OBJECT MODEL
 * Handles about page content
 */

import { Page, Locator } from '@playwright/test';

export class AboutPage {
  readonly page: Page;
  readonly missionSection: Locator;
  readonly teamSection: Locator;
  readonly contactButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.missionSection = page.getByTestId('section-mission');
    this.teamSection = page.getByTestId('section-team');
    this.contactButton = page.getByTestId('button-contact');
  }

  /**
   * Navigate to about page
   */
  async goto(): Promise<void> {
    await this.page.goto('/about');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Scroll to mission
   */
  async scrollToMission(): Promise<void> {
    await this.missionSection.scrollIntoViewIfNeeded();
  }

  /**
   * Scroll to team
   */
  async scrollToTeam(): Promise<void> {
    await this.teamSection.scrollIntoViewIfNeeded();
  }

  /**
   * Go to contact
   */
  async goToContact(): Promise<void> {
    await this.contactButton.click();
  }
}
