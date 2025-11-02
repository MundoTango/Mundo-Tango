/**
 * HOUSING LISTINGS PAGE OBJECT MODEL
 * Handles housing marketplace browsing and filtering
 */

import { Page, Locator } from '@playwright/test';

export class HousingListingsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly priceMinInput: Locator;
  readonly priceMaxInput: Locator;
  readonly listingsList: Locator;
  readonly filterButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('input-search-location');
    this.priceMinInput = page.getByTestId('input-price-min');
    this.priceMaxInput = page.getByTestId('input-price-max');
    this.listingsList = page.getByTestId('list-listings');
    this.filterButton = page.getByTestId('button-apply-filters');
  }

  /**
   * Navigate to housing listings page
   */
  async goto(): Promise<void> {
    await this.page.goto('/housing');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search by location
   */
  async searchByLocation(location: string): Promise<void> {
    await this.searchInput.fill(location);
    await this.filterButton.click();
  }

  /**
   * Filter by price range
   */
  async filterByPrice(min: number, max: number): Promise<void> {
    await this.priceMinInput.fill(min.toString());
    await this.priceMaxInput.fill(max.toString());
    await this.filterButton.click();
  }

  /**
   * Select listing by index
   */
  async selectListing(index: number): Promise<void> {
    const listing = this.page.getByTestId(`listing-${index}`);
    await listing.click();
  }

  /**
   * Get number of listings
   */
  async getListingCount(): Promise<number> {
    const listings = this.page.locator('[data-testid^="listing-"]');
    return await listings.count();
  }
}
