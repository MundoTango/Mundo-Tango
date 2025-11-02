/**
 * COMMUNITY/GROUPS PAGE OBJECT MODEL
 * Handles community discovery and joining
 */

import { Page, Locator } from '@playwright/test';

export class CommunityPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly communitiesList: Locator;
  readonly joinButton: Locator;
  readonly createCommunityButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('input-search-communities');
    this.communitiesList = page.getByTestId('list-communities');
    this.joinButton = page.getByTestId('button-join');
    this.createCommunityButton = page.getByTestId('button-create-community');
  }

  /**
   * Navigate to communities page
   */
  async goto(): Promise<void> {
    await this.page.goto('/groups');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for communities
   */
  async searchCommunities(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  /**
   * Join a community by index
   */
  async joinCommunity(index: number): Promise<void> {
    const community = this.page.getByTestId(`community-${index}`);
    await community.click();
    await this.joinButton.click();
  }

  /**
   * Create new community
   */
  async createCommunity(): Promise<void> {
    await this.createCommunityButton.click();
  }

  /**
   * Get number of communities
   */
  async getCommunityCount(): Promise<number> {
    const communities = this.page.locator('[data-testid^="community-"]');
    return await communities.count();
  }
}
