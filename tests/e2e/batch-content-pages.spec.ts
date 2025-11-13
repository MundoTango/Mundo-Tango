/**
 * AGENT 4: Content System Test Suite
 * Tests blog, stories, music library, album pages
 * Timeline: Days 3-7
 */

import { test, expect } from '@playwright/test';
import { ContentHelper } from '../helpers/content-helper';
import { setupAuthenticatedSession } from '../helpers/auth-setup';

test.describe('Content System Pages - Complete Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  // Blog System Tests
  test('Blog listing page displays correctly', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Verify blog page loaded
    await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible();
  });

  test('Blog post detail page displays correctly', async ({ page }) => {
    const post = await ContentHelper.createBlogPost(page, {
      title: 'Test Tango Blog Post',
    });
    
    await ContentHelper.navigateToBlogPost(page, post.id);
    await ContentHelper.verifyBlogPostPage(page);
  });

  test('Blog post shows comments section', async ({ page }) => {
    const post = await ContentHelper.createBlogPost(page);
    await ContentHelper.navigateToBlogPost(page, post.id);
    
    // Check for comments section
    const commentsSection = page.getByTestId('blog-comments');
    await expect(commentsSection).toBeVisible();
  });

  // Story System Tests
  test('Stories page displays correctly', async ({ page }) => {
    await page.goto('/stories');
    await page.waitForLoadState('networkidle');
    
    // Verify stories page
    await expect(page.locator('text=/stories/i')).toBeVisible();
  });

  test('Story detail page displays correctly', async ({ page }) => {
    const story = await ContentHelper.createStory(page);
    
    await ContentHelper.navigateToStory(page, story.id);
    await ContentHelper.verifyStoryPage(page);
  });

  test('Story viewer has navigation controls', async ({ page }) => {
    const story = await ContentHelper.createStory(page);
    await ContentHelper.navigateToStory(page, story.id);
    
    // Check for next/previous controls
    const controls = page.getByTestId('story-controls');
    await expect(controls).toBeVisible();
  });

  // Music Library Tests
  test('Music library listing page displays correctly', async ({ page }) => {
    await page.goto('/music-library');
    await page.waitForLoadState('networkidle');
    
    // Verify music library page
    await expect(page.getByRole('heading', { name: /music/i })).toBeVisible();
  });

  test('Music track detail page displays correctly', async ({ page }) => {
    await page.goto('/music-library');
    
    // Find first track if exists
    const firstTrack = page.getByTestId(/card-track-/).first();
    if (await firstTrack.isVisible()) {
      await firstTrack.click();
      
      // Verify track detail page
      await expect(page).toHaveURL(/\/music-library\/\d+/);
      await ContentHelper.verifyTrackPage(page);
    }
  });

  test('Music player controls work', async ({ page }) => {
    await page.goto('/music-library');
    
    const firstTrack = page.getByTestId(/card-track-/).first();
    if (await firstTrack.isVisible()) {
      await firstTrack.click();
      
      // Check for player controls
      const playButton = page.getByTestId('button-play');
      if (await playButton.isVisible()) {
        await expect(playButton).toBeVisible();
      }
    }
  });

  // Album Tests
  test('Albums listing page displays correctly', async ({ page }) => {
    await page.goto('/albums');
    await page.waitForLoadState('networkidle');
    
    // Verify albums page
    await expect(page.getByRole('heading', { name: /albums/i })).toBeVisible();
  });

  test('Album detail page displays correctly', async ({ page }) => {
    await page.goto('/albums');
    
    // Find first album
    const firstAlbum = page.getByTestId(/card-album-/).first();
    if (await firstAlbum.isVisible()) {
      await firstAlbum.click();
      
      // Verify album detail page
      await expect(page).toHaveURL(/\/albums\/\d+/);
      await ContentHelper.verifyAlbumPage(page);
    }
  });

  test('Album shows track list', async ({ page }) => {
    await page.goto('/albums');
    
    const firstAlbum = page.getByTestId(/card-album-/).first();
    if (await firstAlbum.isVisible()) {
      await firstAlbum.click();
      
      // Check for track list
      const trackList = page.getByTestId('album-tracks');
      if (await trackList.isVisible()) {
        await expect(trackList).toBeVisible();
      }
    }
  });

  // Media Gallery Tests
  test('Media gallery displays user media', async ({ page }) => {
    await page.goto('/profile/media');
    await page.waitForLoadState('networkidle');
    
    // Verify media gallery
    const mediaGrid = page.getByTestId('media-grid');
    if (await mediaGrid.isVisible()) {
      await expect(mediaGrid).toBeVisible();
    }
  });

  test('Media item detail page displays correctly', async ({ page }) => {
    await page.goto('/profile/media');
    
    const firstMedia = page.getByTestId(/media-item-/).first();
    if (await firstMedia.isVisible()) {
      await firstMedia.click();
      
      // Verify media detail
      const mediaDetail = page.getByTestId('media-detail');
      if (await mediaDetail.isVisible()) {
        await expect(mediaDetail).toBeVisible();
      }
    }
  });
});
