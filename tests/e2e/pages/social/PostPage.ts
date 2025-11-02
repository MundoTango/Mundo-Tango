/**
 * POST DETAIL PAGE OBJECT MODEL
 * Handles viewing and interacting with individual posts
 */

import { Page, Locator } from '@playwright/test';

export class PostPage {
  readonly page: Page;
  readonly postContent: Locator;
  readonly likeButton: Locator;
  readonly commentButton: Locator;
  readonly shareButton: Locator;
  readonly commentInput: Locator;
  readonly submitCommentButton: Locator;
  readonly commentsContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.postContent = page.getByTestId('text-post-content');
    this.likeButton = page.getByTestId('button-like-post');
    this.commentButton = page.getByTestId('button-comment');
    this.shareButton = page.getByTestId('button-share');
    this.commentInput = page.getByTestId('input-comment');
    this.submitCommentButton = page.getByTestId('button-submit-comment');
    this.commentsContainer = page.getByTestId('container-comments');
  }

  /**
   * Navigate to post detail page
   */
  async goto(postId: number): Promise<void> {
    await this.page.goto(`/post/${postId}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Like the post
   */
  async like(): Promise<void> {
    await this.likeButton.click();
  }

  /**
   * Add a comment
   */
  async addComment(content: string): Promise<void> {
    await this.commentInput.fill(content);
    await this.submitCommentButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Share the post
   */
  async share(): Promise<void> {
    await this.shareButton.click();
  }

  /**
   * Get post content
   */
  async getPostContent(): Promise<string> {
    return await this.postContent.textContent() || '';
  }

  /**
   * Get number of comments
   */
  async getCommentCount(): Promise<number> {
    const comments = this.page.locator('[data-testid^="comment-"]');
    return await comments.count();
  }
}
