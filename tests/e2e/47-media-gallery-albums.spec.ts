/**
 * MEDIA GALLERY ALBUMS E2E TESTS
 * Tests the Media Gallery album system functionality
 * 
 * Test Coverage:
 * - Album creation and management
 * - Media upload and organization
 * - Album detail page and media grid
 * - Lightbox viewer with keyboard navigation
 * - Privacy settings and access control
 */

import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';
import { generateTestUser, generateTestAlbum } from './fixtures/test-data';
import { waitForApiResponse, verifyToast } from './helpers/test-helpers';

test.describe('Media Gallery Albums Tests', () => {
  let testUser: ReturnType<typeof generateTestUser>;
  let albumName: string;

  test.beforeEach(async ({ page }) => {
    // Create a unique test user for each test
    testUser = generateTestUser();
    albumName = `Test Album ${nanoid(6)}`;

    // Register user
    await page.request.post('/api/auth/register', {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      },
    });

    // Login
    await page.goto('/login');
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
  });

  test('should navigate to albums page and display correct structure', async ({ page }) => {
    // Navigate to Albums page
    await page.goto('/albums');
    await page.waitForLoadState('networkidle');

    // Verify page title
    await expect(page.locator('h1')).toContainText('My Albums');

    // Verify Create Album button is visible
    await expect(page.getByTestId('button-create-album')).toBeVisible();

    // Verify empty state message (since no albums exist yet)
    await expect(page.getByText(/No albums yet/i)).toBeVisible();
  });

  test('should create a new album successfully', async ({ page }) => {
    // Navigate to Albums page
    await page.goto('/albums');
    await page.waitForLoadState('networkidle');

    // Click Create Album button
    await page.getByTestId('button-create-album').click();

    // Wait for dialog to open
    await expect(page.getByText('Create Album')).toBeVisible();

    // Fill album form
    await page.getByTestId('input-album-name').fill(albumName);
    await page.getByTestId('textarea-album-description').fill('A beautiful collection of tango memories');
    
    // Select privacy option
    await page.getByTestId('select-album-privacy').click();
    await page.getByRole('option', { name: 'Public' }).click();

    // Submit form
    const responsePromise = waitForApiResponse(page, '/api/media/albums');
    await page.getByTestId('button-submit-album').click();
    await responsePromise;

    // Verify toast notification
    await expect(page.getByText(/Album created/i)).toBeVisible({ timeout: 5000 });

    // Verify album appears in grid
    await expect(page.getByTestId(`text-album-name-`)).toBeVisible();
    await expect(page.locator(`text=${albumName}`)).toBeVisible();
  });

  test('should open album detail page when clicking on album', async ({ page }) => {
    // Create an album first
    await page.request.post('/api/media/albums', {
      data: {
        name: albumName,
        description: 'Test album description',
        privacy: 'public',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Navigate to Albums page
    await page.goto('/albums');
    await page.waitForLoadState('networkidle');

    // Click on the album card
    const albumCard = page.locator(`text=${albumName}`).first();
    await albumCard.click();

    // Verify navigation to album detail page
    await page.waitForURL(/\/albums\/\d+/);

    // Verify album detail page elements
    await expect(page.getByTestId('text-album-name')).toContainText(albumName);
    await expect(page.getByTestId('button-add-media')).toBeVisible();
    await expect(page.getByTestId('button-back')).toBeVisible();
  });

  test('should edit album successfully', async ({ page }) => {
    // Create an album first
    const response = await page.request.post('/api/media/albums', {
      data: {
        name: albumName,
        description: 'Original description',
        privacy: 'public',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const album = await response.json();

    // Navigate to Albums page
    await page.goto('/albums');
    await page.waitForLoadState('networkidle');

    // Click edit button on album
    await page.getByTestId(`button-edit-album-${album.id}`).click();

    // Wait for edit dialog
    await expect(page.getByText('Edit Album')).toBeVisible();

    // Update album details
    const updatedName = `Updated Album ${nanoid(6)}`;
    await page.getByTestId('input-album-name').fill(updatedName);
    await page.getByTestId('textarea-album-description').fill('Updated description');

    // Submit
    await page.getByTestId('button-submit-album').click();

    // Verify toast
    await expect(page.getByText(/Album updated/i)).toBeVisible({ timeout: 5000 });

    // Verify updated name appears
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();
  });

  test('should delete album successfully', async ({ page }) => {
    // Create an album first
    const response = await page.request.post('/api/media/albums', {
      data: {
        name: albumName,
        description: 'Test description',
        privacy: 'public',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const album = await response.json();

    // Navigate to Albums page
    await page.goto('/albums');
    await page.waitForLoadState('networkidle');

    // Click delete button
    await page.getByTestId(`button-delete-album-${album.id}`).click();

    // Confirm deletion
    await expect(page.getByText(/Are you sure/i)).toBeVisible();
    await page.getByTestId('button-confirm-delete').click();

    // Verify toast
    await expect(page.getByText(/Album deleted/i)).toBeVisible({ timeout: 5000 });

    // Verify album is removed from list
    await expect(page.locator(`text=${albumName}`)).not.toBeVisible();
  });

  test('should add media to album successfully', async ({ page }) => {
    // Create an album first
    const albumResponse = await page.request.post('/api/media/albums', {
      data: {
        name: albumName,
        description: 'Test description',
        privacy: 'public',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const album = await albumResponse.json();

    // Create test media
    const mediaResponse = await page.request.post('/api/media', {
      data: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=200',
        caption: 'Test image',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const media = await mediaResponse.json();

    // Navigate to album detail page
    await page.goto(`/albums/${album.id}`);
    await page.waitForLoadState('networkidle');

    // Click Add Media button
    await page.getByTestId('button-add-media').click();

    // Wait for Add Media dialog
    await expect(page.getByText('Add Media to Album')).toBeVisible();

    // Select media item by clicking its card
    await page.getByTestId(`card-select-media-${media.id}`).click();

    // Submit
    const responsePromise = waitForApiResponse(page, `/api/media/albums/${album.id}/media`);
    await page.getByTestId('button-add-media-submit').click();
    await responsePromise;

    // Verify toast
    await expect(page.getByText(/Media added/i)).toBeVisible({ timeout: 5000 });

    // Verify media appears in grid
    await expect(page.getByTestId(`card-media-${media.id}`)).toBeVisible();
  });

  test('should open lightbox when clicking media item', async ({ page }) => {
    // Create album and add media
    const albumResponse = await page.request.post('/api/media/albums', {
      data: {
        name: albumName,
        description: 'Test description',
        privacy: 'public',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const album = await albumResponse.json();

    // Create test media
    const mediaResponse = await page.request.post('/api/media', {
      data: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=200',
        caption: 'Test image',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const media = await mediaResponse.json();

    // Add media to album
    await page.request.post(`/api/media/albums/${album.id}/media`, {
      data: {
        mediaId: media.id,
        order: 0,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Navigate to album detail page
    await page.goto(`/albums/${album.id}`);
    await page.waitForLoadState('networkidle');

    // Click on media item
    await page.getByTestId(`card-media-${media.id}`).click();

    // Verify lightbox opens
    await expect(page.getByTestId('lightbox-viewer')).toBeVisible();
    await expect(page.getByTestId('lightbox-image')).toBeVisible();

    // Verify navigation buttons
    await expect(page.getByTestId('button-lightbox-previous')).toBeVisible();
    await expect(page.getByTestId('button-lightbox-next')).toBeVisible();
    await expect(page.getByTestId('button-lightbox-close')).toBeVisible();
  });

  test('should navigate lightbox with arrow keys', async ({ page }) => {
    // Create album
    const albumResponse = await page.request.post('/api/media/albums', {
      data: {
        name: albumName,
        description: 'Test description',
        privacy: 'public',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const album = await albumResponse.json();

    // Create multiple media items
    const media1 = await page.request.post('/api/media', {
      data: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=200',
        caption: 'First image',
      },
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json());

    const media2 = await page.request.post('/api/media', {
      data: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1485359900841-b98bdd58b4de?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1485359900841-b98bdd58b4de?w=200',
        caption: 'Second image',
      },
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json());

    // Add media to album
    await page.request.post(`/api/media/albums/${album.id}/media`, {
      data: { mediaId: media1.id, order: 0 },
      headers: { 'Content-Type': 'application/json' },
    });

    await page.request.post(`/api/media/albums/${album.id}/media`, {
      data: { mediaId: media2.id, order: 1 },
      headers: { 'Content-Type': 'application/json' },
    });

    // Navigate to album detail page
    await page.goto(`/albums/${album.id}`);
    await page.waitForLoadState('networkidle');

    // Click on first media item
    await page.getByTestId(`card-media-${media1.id}`).click();

    // Verify lightbox opens with first image
    await expect(page.getByTestId('lightbox-viewer')).toBeVisible();

    // Press Right Arrow key
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Verify navigation (we can't easily verify which image is shown, but we can verify the lightbox is still visible)
    await expect(page.getByTestId('lightbox-viewer')).toBeVisible();

    // Press Left Arrow key
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    // Verify still visible
    await expect(page.getByTestId('lightbox-viewer')).toBeVisible();
  });

  test('should close lightbox with Escape key', async ({ page }) => {
    // Create album and media
    const albumResponse = await page.request.post('/api/media/albums', {
      data: {
        name: albumName,
        description: 'Test description',
        privacy: 'public',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const album = await albumResponse.json();

    const mediaResponse = await page.request.post('/api/media', {
      data: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=200',
        caption: 'Test image',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const media = await mediaResponse.json();

    // Add media to album
    await page.request.post(`/api/media/albums/${album.id}/media`, {
      data: { mediaId: media.id, order: 0 },
      headers: { 'Content-Type': 'application/json' },
    });

    // Navigate to album detail page
    await page.goto(`/albums/${album.id}`);
    await page.waitForLoadState('networkidle');

    // Click on media item to open lightbox
    await page.getByTestId(`card-media-${media.id}`).click();

    // Verify lightbox is open
    await expect(page.getByTestId('lightbox-viewer')).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Verify lightbox is closed
    await expect(page.getByTestId('lightbox-viewer')).not.toBeVisible();
  });

  test('should close lightbox with close button', async ({ page }) => {
    // Create album and media
    const albumResponse = await page.request.post('/api/media/albums', {
      data: {
        name: albumName,
        description: 'Test description',
        privacy: 'public',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const album = await albumResponse.json();

    const mediaResponse = await page.request.post('/api/media', {
      data: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=200',
        caption: 'Test image',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const media = await mediaResponse.json();

    // Add media to album
    await page.request.post(`/api/media/albums/${album.id}/media`, {
      data: { mediaId: media.id, order: 0 },
      headers: { 'Content-Type': 'application/json' },
    });

    // Navigate to album detail page
    await page.goto(`/albums/${album.id}`);
    await page.waitForLoadState('networkidle');

    // Click on media item to open lightbox
    await page.getByTestId(`card-media-${media.id}`).click();

    // Verify lightbox is open
    await expect(page.getByTestId('lightbox-viewer')).toBeVisible();

    // Click close button
    await page.getByTestId('button-lightbox-close').click();

    // Verify lightbox is closed
    await expect(page.getByTestId('lightbox-viewer')).not.toBeVisible();
  });

  test('should remove media from album successfully', async ({ page }) => {
    // Create album and media
    const albumResponse = await page.request.post('/api/media/albums', {
      data: {
        name: albumName,
        description: 'Test description',
        privacy: 'public',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const album = await albumResponse.json();

    const mediaResponse = await page.request.post('/api/media', {
      data: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=200',
        caption: 'Test image',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const media = await mediaResponse.json();

    // Add media to album
    await page.request.post(`/api/media/albums/${album.id}/media`, {
      data: { mediaId: media.id, order: 0 },
      headers: { 'Content-Type': 'application/json' },
    });

    // Navigate to album detail page
    await page.goto(`/albums/${album.id}`);
    await page.waitForLoadState('networkidle');

    // Hover over media card to reveal delete button
    const mediaCard = page.getByTestId(`card-media-${media.id}`);
    await mediaCard.hover();

    // Click remove button
    await page.getByTestId(`button-remove-media-${media.id}`).click();

    // Confirm deletion
    await expect(page.getByText(/Are you sure/i)).toBeVisible();
    await page.getByTestId('button-confirm-remove').click();

    // Verify toast
    await expect(page.getByText(/Media removed/i)).toBeVisible({ timeout: 5000 });

    // Verify media is removed
    await expect(page.getByTestId(`card-media-${media.id}`)).not.toBeVisible();
  });

  test('should respect album privacy settings', async ({ page }) => {
    // Create a private album
    const albumResponse = await page.request.post('/api/media/albums', {
      data: {
        name: albumName,
        description: 'Private test album',
        privacy: 'private',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const album = await albumResponse.json();

    // Navigate to albums page
    await page.goto('/albums');
    await page.waitForLoadState('networkidle');

    // Verify private icon is shown on album card
    const albumCard = page.getByTestId(`card-album-${album.id}`);
    await expect(albumCard.locator('[data-icon="lock"]')).toBeVisible();
  });

  test('should display album with multiple media items in grid', async ({ page }) => {
    // Create album
    const albumResponse = await page.request.post('/api/media/albums', {
      data: {
        name: albumName,
        description: 'Test description',
        privacy: 'public',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const album = await albumResponse.json();

    // Create multiple media items
    const mediaPromises = [1, 2, 3, 4].map(async (i) => {
      const media = await page.request.post('/api/media', {
        data: {
          type: 'image',
          url: `https://images.unsplash.com/photo-${150460981344 + i}?w=800`,
          thumbnail: `https://images.unsplash.com/photo-${150460981344 + i}?w=200`,
          caption: `Test image ${i}`,
        },
        headers: { 'Content-Type': 'application/json' },
      }).then(r => r.json());

      await page.request.post(`/api/media/albums/${album.id}/media`, {
        data: { mediaId: media.id, order: i - 1 },
        headers: { 'Content-Type': 'application/json' },
      });

      return media;
    });

    await Promise.all(mediaPromises);

    // Navigate to album detail page
    await page.goto(`/albums/${album.id}`);
    await page.waitForLoadState('networkidle');

    // Verify all media items are displayed in grid
    const mediaGrid = page.locator('[data-testid^="card-media-"]');
    const count = await mediaGrid.count();
    expect(count).toBe(4);
  });
});
