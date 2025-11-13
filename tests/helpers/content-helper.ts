import { Page, expect } from '@playwright/test';

/**
 * Content Helper - Blog, Stories, Music Testing Utilities
 * Used by Agent 4 for testing content system pages
 */
export class ContentHelper {
  /**
   * Create a test blog post via API
   */
  static async createBlogPost(page: Page, data?: Partial<any>) {
    const response = await page.request.post('/api/blog', {
      data: {
        title: data?.title || 'Test Blog Post About Tango',
        content: data?.content || 'This is a test blog post about Argentine tango...',
        excerpt: data?.excerpt || 'Test excerpt',
        published: data?.published ?? true,
      }
    });
    return await response.json();
  }

  /**
   * Navigate to blog post detail page
   */
  static async navigateToBlogPost(page: Page, postId: number) {
    await page.goto(`/blog/${postId}`);
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verify blog post page loaded
   */
  static async verifyBlogPostPage(page: Page) {
    await expect(page.getByTestId('blog-post-detail')).toBeVisible();
    await expect(page.getByTestId('blog-post-title')).toBeVisible();
    await expect(page.getByTestId('blog-post-content')).toBeVisible();
  }

  /**
   * Create a test story via API
   */
  static async createStory(page: Page, data?: Partial<any>) {
    const response = await page.request.post('/api/stories', {
      data: {
        content: data?.content || 'Test story content',
        media_url: data?.media_url || null,
        expires_at: data?.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    });
    return await response.json();
  }

  /**
   * Navigate to story page
   */
  static async navigateToStory(page: Page, storyId: number) {
    await page.goto(`/stories/${storyId}`);
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verify story page loaded
   */
  static async verifyStoryPage(page: Page) {
    await expect(page.getByTestId('story-viewer')).toBeVisible();
  }

  /**
   * Navigate to music library track
   */
  static async navigateToTrack(page: Page, trackId: number) {
    await page.goto(`/music-library/${trackId}`);
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verify music track page loaded
   */
  static async verifyTrackPage(page: Page) {
    await expect(page.getByTestId('track-detail')).toBeVisible();
    await expect(page.getByTestId('track-title')).toBeVisible();
  }

  /**
   * Navigate to album detail page
   */
  static async navigateToAlbum(page: Page, albumId: number) {
    await page.goto(`/albums/${albumId}`);
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verify album page loaded
   */
  static async verifyAlbumPage(page: Page) {
    await expect(page.getByTestId('album-detail')).toBeVisible();
    await expect(page.getByTestId('album-title')).toBeVisible();
  }
}
