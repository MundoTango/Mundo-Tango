/**
 * SEARCH PAGE OBJECT MODEL
 * Handles global search functionality
 */

import { Page, Locator } from '@playwright/test';

export class SearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly usersTab: Locator;
  readonly postsTab: Locator;
  readonly eventsTab: Locator;
  readonly resultsContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('input-search');
    this.usersTab = page.getByTestId('tab-users');
    this.postsTab = page.getByTestId('tab-posts');
    this.eventsTab = page.getByTestId('tab-events');
    this.resultsContainer = page.getByTestId('container-results');
  }

  /**
   * Navigate to search page
   */
  async goto(): Promise<void> {
    await this.page.goto('/search');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Perform search
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(1000); // Wait for results
  }

  /**
   * Filter by users
   */
  async filterUsers(): Promise<void> {
    await this.usersTab.click();
  }

  /**
   * Filter by posts
   */
  async filterPosts(): Promise<void> {
    await this.postsTab.click();
  }

  /**
   * Filter by events
   */
  async filterEvents(): Promise<void> {
    await this.eventsTab.click();
  }

  /**
   * Get results count
   */
  async getResultsCount(): Promise<number> {
    const results = this.page.locator('[data-testid^="result-"]');
    return await results.count();
  }
}
