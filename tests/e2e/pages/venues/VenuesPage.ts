/**
 * VENUES PAGE OBJECT MODEL
 * Handles tango venues directory
 */

import { Page, Locator } from '@playwright/test';

export class VenuesPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly venuesList: Locator;
  readonly mapView: Locator;
  readonly listView: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('input-search-venues');
    this.venuesList = page.getByTestId('list-venues');
    this.mapView = page.getByTestId('button-map-view');
    this.listView = page.getByTestId('button-list-view');
  }

  /**
   * Navigate to venues page
   */
  async goto(): Promise<void> {
    await this.page.goto('/venues');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for venues
   */
  async searchVenues(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  /**
   * Switch to map view
   */
  async switchToMapView(): Promise<void> {
    await this.mapView.click();
  }

  /**
   * Switch to list view
   */
  async switchToListView(): Promise<void> {
    await this.listView.click();
  }

  /**
   * Select venue by index
   */
  async selectVenue(index: number): Promise<void> {
    const venue = this.page.getByTestId(`venue-${index}`);
    await venue.click();
  }
}
