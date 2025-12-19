/**
 * BOOKING PAGE OBJECT MODEL
 * Handles housing booking process
 */

import { Page, Locator } from '@playwright/test';

export class BookingPage {
  readonly page: Page;
  readonly checkInInput: Locator;
  readonly checkOutInput: Locator;
  readonly guestsInput: Locator;
  readonly submitButton: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkInInput = page.getByTestId('input-check-in');
    this.checkOutInput = page.getByTestId('input-check-out');
    this.guestsInput = page.getByTestId('input-guests');
    this.submitButton = page.getByTestId('button-submit-booking');
    this.confirmButton = page.getByTestId('button-confirm-booking');
  }

  /**
   * Navigate to booking page
   */
  async goto(listingId: number): Promise<void> {
    await this.page.goto(`/housing/${listingId}/book`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill booking form
   */
  async fillBookingForm(checkIn: string, checkOut: string, guests: number): Promise<void> {
    await this.checkInInput.fill(checkIn);
    await this.checkOutInput.fill(checkOut);
    await this.guestsInput.fill(guests.toString());
  }

  /**
   * Submit booking
   */
  async submitBooking(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Confirm booking
   */
  async confirmBooking(): Promise<void> {
    await this.confirmButton.click();
    await this.page.waitForURL(/\/booking\/confirmation/, { timeout: 10000 });
  }
}
