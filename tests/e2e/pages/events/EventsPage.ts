/**
 * EVENTS PAGE OBJECT MODEL
 * Handles event discovery and filtering
 */

import { Page, Locator } from '@playwright/test';

export class EventsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly filterButton: Locator;
  readonly eventsList: Locator;
  readonly createEventButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('input-search-events');
    this.filterButton = page.getByTestId('button-filter');
    this.eventsList = page.getByTestId('list-events');
    this.createEventButton = page.getByTestId('button-create-event');
  }

  /**
   * Navigate to events page
   */
  async goto(): Promise<void> {
    await this.page.goto('/events');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for events
   */
  async searchEvents(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  /**
   * Filter events by type
   */
  async filterByType(type: string): Promise<void> {
    await this.filterButton.click();
    const filterOption = this.page.getByTestId(`filter-${type}`);
    await filterOption.click();
  }

  /**
   * Select event by index
   */
  async selectEvent(index: number): Promise<void> {
    const event = this.page.getByTestId(`event-card-${index}`);
    await event.click();
  }

  /**
   * Create new event
   */
  async createEvent(): Promise<void> {
    await this.createEventButton.click();
  }

  /**
   * Get number of events displayed
   */
  async getEventCount(): Promise<number> {
    const events = this.page.locator('[data-testid^="event-card-"]');
    return await events.count();
  }
}
