/**
 * TEACHER DETAIL PAGE OBJECT MODEL
 * Handles individual teacher profile
 */

import { Page, Locator } from '@playwright/test';

export class TeacherDetailPage {
  readonly page: Page;
  readonly teacherName: Locator;
  readonly bookLessonButton: Locator;
  readonly reviewsSection: Locator;
  readonly sendMessageButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.teacherName = page.getByTestId('text-teacher-name');
    this.bookLessonButton = page.getByTestId('button-book-lesson');
    this.reviewsSection = page.getByTestId('section-reviews');
    this.sendMessageButton = page.getByTestId('button-send-message');
  }

  /**
   * Navigate to teacher detail page
   */
  async goto(teacherId: number): Promise<void> {
    await this.page.goto(`/teachers/${teacherId}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Book a lesson
   */
  async bookLesson(): Promise<void> {
    await this.bookLessonButton.click();
  }

  /**
   * Send message to teacher
   */
  async sendMessage(): Promise<void> {
    await this.sendMessageButton.click();
  }

  /**
   * Get teacher name
   */
  async getTeacherName(): Promise<string> {
    return await this.teacherName.textContent() || '';
  }
}
