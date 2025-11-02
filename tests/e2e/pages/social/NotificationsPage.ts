/**
 * NOTIFICATIONS PAGE OBJECT MODEL
 * Handles viewing and managing notifications
 */

import { Page, Locator } from '@playwright/test';

export class NotificationsPage {
  readonly page: Page;
  readonly notificationsList: Locator;
  readonly markAllReadButton: Locator;
  readonly filterDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.notificationsList = page.getByTestId('list-notifications');
    this.markAllReadButton = page.getByTestId('button-mark-all-read');
    this.filterDropdown = page.getByTestId('dropdown-filter-notifications');
  }

  /**
   * Navigate to notifications page
   */
  async goto(): Promise<void> {
    await this.page.goto('/notifications');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<void> {
    await this.markAllReadButton.click();
  }

  /**
   * Filter notifications by type
   */
  async filterByType(type: string): Promise<void> {
    await this.filterDropdown.click();
    const option = this.page.getByTestId(`filter-${type}`);
    await option.click();
  }

  /**
   * Click notification by index
   */
  async clickNotification(index: number): Promise<void> {
    const notification = this.page.getByTestId(`notification-${index}`);
    await notification.click();
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const unread = this.page.locator('[data-testid^="notification-"][data-unread="true"]');
    return await unread.count();
  }
}
