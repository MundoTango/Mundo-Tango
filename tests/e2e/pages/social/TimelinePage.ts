/**
 * TIMELINE/FEED PAGE OBJECT MODEL
 * Handles all interactions with the main feed/timeline
 */

import { Page, Locator } from '@playwright/test';

export class TimelinePage {
  readonly page: Page;
  readonly createPostButton: Locator;
  readonly postTextarea: Locator;
  readonly submitPostButton: Locator;
  readonly feedContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createPostButton = page.getByTestId('button-create-post');
    this.postTextarea = page.getByTestId('textarea-post-content');
    this.submitPostButton = page.getByTestId('button-submit-post');
    this.feedContainer = page.getByTestId('container-feed');
  }

  /**
   * Navigate to feed/timeline
   */
  async goto(): Promise<void> {
    await this.page.goto('/feed');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Create a new post
   */
  async createPost(content: string): Promise<void> {
    await this.createPostButton.click();
    await this.postTextarea.fill(content);
    await this.submitPostButton.click();
    await this.page.waitForTimeout(1000); // Wait for post to appear
  }

  /**
   * Like a post by index
   */
  async likePost(postIndex: number = 0): Promise<void> {
    const likeButton = this.page.getByTestId(`button-like-post-${postIndex}`);
    await likeButton.click();
  }

  /**
   * Comment on a post
   */
  async commentOnPost(postIndex: number, comment: string): Promise<void> {
    const commentButton = this.page.getByTestId(`button-comment-${postIndex}`);
    await commentButton.click();
    
    const commentInput = this.page.getByTestId(`input-comment-${postIndex}`);
    await commentInput.fill(comment);
    
    const submitComment = this.page.getByTestId(`button-submit-comment-${postIndex}`);
    await submitComment.click();
  }

  /**
   * Get number of posts visible
   */
  async getPostCount(): Promise<number> {
    const posts = this.page.locator('[data-testid^="card-post-"]');
    return await posts.count();
  }
}
