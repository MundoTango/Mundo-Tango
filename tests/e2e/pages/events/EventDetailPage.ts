/**
 * EVENT DETAIL PAGE OBJECT MODEL
 * Handles viewing and RSVP for individual events
 */

import { Page, Locator } from '@playwright/test';

export class EventDetailPage {
  readonly page: Page;
  readonly eventTitle: Locator;
  readonly eventDescription: Locator;
  readonly rsvpButton: Locator;
  readonly shareButton: Locator;
  readonly addToCalendarButton: Locator;
  readonly attendeesList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.eventTitle = page.getByTestId('text-event-title');
    this.eventDescription = page.getByTestId('text-event-description');
    this.rsvpButton = page.getByTestId('button-rsvp');
    this.shareButton = page.getByTestId('button-share-event');
    this.addToCalendarButton = page.getByTestId('button-add-to-calendar');
    this.attendeesList = page.getByTestId('list-attendees');
  }

  /**
   * Navigate to event detail page
   */
  async goto(eventId: number): Promise<void> {
    await this.page.goto(`/events/${eventId}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * RSVP to event
   */
  async rsvp(): Promise<void> {
    await this.rsvpButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Share event
   */
  async shareEvent(): Promise<void> {
    await this.shareButton.click();
  }

  /**
   * Add event to calendar
   */
  async addToCalendar(): Promise<void> {
    await this.addToCalendarButton.click();
  }

  /**
   * Get event title
   */
  async getEventTitle(): Promise<string> {
    return await this.eventTitle.textContent() || '';
  }

  /**
   * Get attendee count
   */
  async getAttendeeCount(): Promise<number> {
    const attendees = this.page.locator('[data-testid^="attendee-"]');
    return await attendees.count();
  }
}
