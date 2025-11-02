/**
 * TEACHERS PAGE OBJECT MODEL
 * Handles tango teachers directory
 */

import { Page, Locator } from '@playwright/test';

export class TeachersPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly teachersList: Locator;
  readonly filterByLocationSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('input-search-teachers');
    this.teachersList = page.getByTestId('list-teachers');
    this.filterByLocationSelect = page.getByTestId('select-location');
  }

  /**
   * Navigate to teachers page
   */
  async goto(): Promise<void> {
    await this.page.goto('/teachers');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for teachers
   */
  async searchTeachers(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  /**
   * Filter by location
   */
  async filterByLocation(location: string): Promise<void> {
    await this.filterByLocationSelect.click();
    const option = this.page.getByTestId(`location-${location}`);
    await option.click();
  }

  /**
   * Select teacher by index
   */
  async selectTeacher(index: number): Promise<void> {
    const teacher = this.page.getByTestId(`teacher-${index}`);
    await teacher.click();
  }
}
