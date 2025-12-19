/**
 * USER MANAGEMENT PAGE OBJECT MODEL
 * Handles admin user management operations
 */

import { Page, Locator } from '@playwright/test';

export class UserManagementPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly usersList: Locator;
  readonly filterDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('input-search-users');
    this.usersList = page.getByTestId('list-users');
    this.filterDropdown = page.getByTestId('dropdown-filter-users');
  }

  /**
   * Navigate to user management page
   */
  async goto(): Promise<void> {
    await this.page.goto('/admin/users');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for users
   */
  async searchUsers(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  /**
   * Suspend a user
   */
  async suspendUser(userId: number): Promise<void> {
    const suspendButton = this.page.getByTestId(`button-suspend-${userId}`);
    await suspendButton.click();
    
    const confirmButton = this.page.getByTestId('button-confirm-suspend');
    await confirmButton.click();
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: number): Promise<void> {
    const deleteButton = this.page.getByTestId(`button-delete-${userId}`);
    await deleteButton.click();
    
    const confirmButton = this.page.getByTestId('button-confirm-delete');
    await confirmButton.click();
  }
}
