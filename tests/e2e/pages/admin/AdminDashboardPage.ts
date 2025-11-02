/**
 * ADMIN DASHBOARD PAGE OBJECT MODEL
 * Handles admin dashboard navigation and statistics
 */

import { Page, Locator } from '@playwright/test';

export class AdminDashboardPage {
  readonly page: Page;
  readonly userManagementLink: Locator;
  readonly contentModerationLink: Locator;
  readonly analyticsLink: Locator;
  readonly agentHealthLink: Locator;
  readonly totalUsersCard: Locator;
  readonly activeUsersCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userManagementLink = page.getByTestId('link-user-management');
    this.contentModerationLink = page.getByTestId('link-content-moderation');
    this.analyticsLink = page.getByTestId('link-analytics');
    this.agentHealthLink = page.getByTestId('link-agent-health');
    this.totalUsersCard = page.getByTestId('card-total-users');
    this.activeUsersCard = page.getByTestId('card-active-users');
  }

  /**
   * Navigate to admin dashboard
   */
  async goto(): Promise<void> {
    await this.page.goto('/admin/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to user management
   */
  async goToUserManagement(): Promise<void> {
    await this.userManagementLink.click();
  }

  /**
   * Navigate to content moderation
   */
  async goToContentModeration(): Promise<void> {
    await this.contentModerationLink.click();
  }

  /**
   * Navigate to analytics
   */
  async goToAnalytics(): Promise<void> {
    await this.analyticsLink.click();
  }

  /**
   * Navigate to agent health
   */
  async goToAgentHealth(): Promise<void> {
    await this.agentHealthLink.click();
  }

  /**
   * Get total users count
   */
  async getTotalUsers(): Promise<string> {
    return await this.totalUsersCard.textContent() || '0';
  }
}
