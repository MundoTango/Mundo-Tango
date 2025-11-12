/**
 * COMPREHENSIVE PROFILE SYSTEM E2E TESTS
 * 
 * Test Coverage:
 * - Core Profile Tests (10 tests)
 * - Professional Profile Tests (15 tests)
 * - Media Upload Tests (5 tests)
 * - Visibility & Permissions Tests (8 tests)
 * - Analytics Tests (3 tests)
 * 
 * Total: 41 test cases
 */

import { test, expect, Page } from '@playwright/test';
import { 
  generateTestUser, 
  generateTestTeacherProfile,
  generateTestDjProfile,
  generateTestMusicianProfile 
} from './fixtures/test-data';
import * as path from 'path';

// Helper function to register and login a user
async function registerAndLogin(page: Page) {
  const testUser = generateTestUser();
  
  // Register user
  const registerResponse = await page.request.post('/api/auth/register', {
    data: {
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
      name: testUser.name,
    },
  });
  
  expect(registerResponse.ok()).toBeTruthy();
  
  // Login
  await page.goto('/login');
  await page.getByTestId('input-username').fill(testUser.username);
  await page.getByTestId('input-password').fill(testUser.password);
  await page.getByTestId('button-login').click();
  await page.waitForURL('**/feed', { timeout: 10000 });
  
  return testUser;
}

// Helper function to create a second user (for visibility tests)
async function createSecondUser(page: Page) {
  const secondUser = generateTestUser();
  
  await page.request.post('/api/auth/register', {
    data: {
      username: secondUser.username,
      email: secondUser.email,
      password: secondUser.password,
      name: secondUser.name,
    },
  });
  
  return secondUser;
}

test.describe('Profile System - Core Profile Tests', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = await registerAndLogin(page);
  });

  test('1.1 should view own profile', async ({ page }) => {
    // Navigate to own profile
    await page.goto(`/profile/${testUser.username}`);
    
    // Verify profile page loads
    await expect(page.getByTestId('text-profile-name')).toBeVisible();
    await expect(page.getByTestId('text-profile-name')).toContainText(testUser.name);
    
    // Verify edit button is visible for own profile
    await expect(page.getByTestId('button-edit-profile')).toBeVisible();
    
    // Verify bio section
    await expect(page.getByTestId('text-profile-bio')).toBeVisible();
  });

  test('1.2 should edit base profile bio', async ({ page }) => {
    await page.goto('/settings/profile');
    
    // Update bio
    const newBio = 'Updated bio - Passionate tango dancer with 10 years experience';
    await page.getByTestId('textarea-bio').fill(newBio);
    
    // Save changes
    await page.getByTestId('button-save-profile').click();
    
    // Verify success message
    await expect(page.getByText(/profile updated/i)).toBeVisible();
    
    // Verify changes on profile page
    await page.goto(`/profile/${testUser.username}`);
    await expect(page.getByTestId('text-profile-bio')).toContainText(newBio);
  });

  test('1.3 should edit profile city and location', async ({ page }) => {
    await page.goto('/settings/profile');
    
    // Update city
    const newCity = 'Buenos Aires';
    await page.getByTestId('input-city').fill(newCity);
    
    // Update country
    await page.getByTestId('input-country').fill('Argentina');
    
    // Save changes
    await page.getByTestId('button-save-profile').click();
    
    // Verify success
    await expect(page.getByText(/profile updated/i)).toBeVisible();
    
    // Verify location appears on profile
    await page.goto(`/profile/${testUser.username}`);
    await expect(page.getByTestId('text-profile-location')).toContainText(newCity);
  });

  test('1.4 should upload and update profile avatar', async ({ page }) => {
    await page.goto('/settings/profile');
    
    // Upload avatar
    const fileInput = page.getByTestId('input-avatar-upload');
    const testImagePath = path.join(__dirname, 'fixtures', 'test-avatar.jpg');
    
    // If test image doesn't exist, create a placeholder
    await fileInput.setInputFiles({
      name: 'test-avatar.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });
    
    // Wait for upload to process
    await page.waitForTimeout(2000);
    
    // Verify preview appears
    const avatarPreview = page.getByTestId('avatar-preview');
    await expect(avatarPreview).toBeVisible();
    
    // Save profile
    await page.getByTestId('button-save-profile').click();
    
    // Verify success
    await expect(page.getByText(/profile updated/i)).toBeVisible();
  });

  test('1.5 should view public user profile', async ({ page }) => {
    // Create a second user
    const secondUser = await createSecondUser(page);
    
    // Navigate to second user's profile
    await page.goto(`/profile/${secondUser.username}`);
    
    // Verify profile is viewable
    await expect(page.getByTestId('text-profile-name')).toBeVisible();
    await expect(page.getByTestId('text-profile-name')).toContainText(secondUser.name);
    
    // Verify no edit button for other's profile
    await expect(page.getByTestId('button-edit-profile')).not.toBeVisible();
    
    // Verify action buttons are available
    await expect(page.getByTestId('button-follow')).toBeVisible();
    await expect(page.getByTestId('button-message')).toBeVisible();
  });

  test('1.6 should update privacy settings to public', async ({ page }) => {
    await page.goto('/settings/privacy');
    
    // Set profile visibility to public
    const visibilitySelect = page.getByTestId('select-profile-visibility');
    await visibilitySelect.click();
    await page.getByRole('option', { name: 'Public' }).click();
    
    // Save settings
    await page.getByTestId('button-save-privacy').click();
    
    // Verify success
    await expect(page.getByText(/privacy settings updated/i)).toBeVisible();
  });

  test('1.7 should update privacy settings to friends only', async ({ page }) => {
    await page.goto('/settings/privacy');
    
    // Set profile visibility to friends only
    const visibilitySelect = page.getByTestId('select-profile-visibility');
    await visibilitySelect.click();
    await page.getByRole('option', { name: 'Friends Only' }).click();
    
    // Save settings
    await page.getByTestId('button-save-privacy').click();
    
    // Verify success
    await expect(page.getByText(/privacy settings updated/i)).toBeVisible();
  });

  test('1.8 should update privacy settings to private', async ({ page }) => {
    await page.goto('/settings/privacy');
    
    // Set profile visibility to private
    const visibilitySelect = page.getByTestId('select-profile-visibility');
    await visibilitySelect.click();
    await page.getByRole('option', { name: 'Private' }).click();
    
    // Save settings
    await page.getByTestId('button-save-privacy').click();
    
    // Verify success
    await expect(page.getByText(/privacy settings updated/i)).toBeVisible();
  });

  test('1.9 should display profile completion tracking', async ({ page }) => {
    await page.goto('/settings/profile');
    
    // Verify completion indicator exists
    await expect(page.getByTestId('profile-completion-percentage')).toBeVisible();
    
    // Get initial completion
    const completionText = await page.getByTestId('profile-completion-percentage').textContent();
    const initialCompletion = parseInt(completionText?.match(/\d+/)?.[0] || '0');
    
    // Add bio to improve completion
    await page.getByTestId('textarea-bio').fill('Complete bio with detailed information about my tango journey');
    await page.getByTestId('input-city').fill('Buenos Aires');
    await page.getByTestId('input-country').fill('Argentina');
    
    // Save
    await page.getByTestId('button-save-profile').click();
    await expect(page.getByText(/profile updated/i)).toBeVisible();
    
    // Reload and check completion increased
    await page.reload();
    const newCompletionText = await page.getByTestId('profile-completion-percentage').textContent();
    const newCompletion = parseInt(newCompletionText?.match(/\d+/)?.[0] || '0');
    
    expect(newCompletion).toBeGreaterThan(initialCompletion);
  });

  test('1.10 should update contact information', async ({ page }) => {
    await page.goto('/settings/profile');
    
    // Update phone
    await page.getByTestId('input-phone').fill('+54 11 1234-5678');
    
    // Update website
    await page.getByTestId('input-website').fill('https://mytangosite.com');
    
    // Save
    await page.getByTestId('button-save-profile').click();
    
    // Verify success
    await expect(page.getByText(/profile updated/i)).toBeVisible();
    
    // Verify on profile page
    await page.goto(`/profile/${testUser.username}`);
    await expect(page.getByText('mytangosite.com')).toBeVisible();
  });
});

test.describe('Profile System - Professional Profile Tests', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = await registerAndLogin(page);
  });

  // TEACHER PROFILE TESTS
  test('2.1 should create teacher profile', async ({ page }) => {
    const teacherProfile = generateTestTeacherProfile();
    
    await page.goto('/profile/professional/teacher/create');
    
    // Fill in teacher profile form
    await page.getByTestId('input-tagline').fill(teacherProfile.tagline);
    await page.getByTestId('textarea-bio').fill(teacherProfile.bio);
    await page.getByTestId('textarea-teaching-philosophy').fill(teacherProfile.teachingPhilosophy);
    await page.getByTestId('input-years-teaching').fill(teacherProfile.yearsTeaching.toString());
    
    // Set specializations (multi-select)
    for (const spec of teacherProfile.specializations) {
      await page.getByTestId(`checkbox-specialization-${spec}`).check();
    }
    
    // Set pricing
    await page.getByTestId('input-hourly-rate-min').fill(teacherProfile.hourlyRateMin.toString());
    await page.getByTestId('input-hourly-rate-max').fill(teacherProfile.hourlyRateMax.toString());
    
    // Set location
    await page.getByTestId('input-city').fill(teacherProfile.city);
    await page.getByTestId('input-country').fill(teacherProfile.country);
    
    // Submit
    await page.getByTestId('button-create-teacher-profile').click();
    
    // Verify success
    await expect(page.getByText(/teacher profile created/i)).toBeVisible();
    
    // Verify API call
    const profileResponse = await page.request.get(`/api/profiles/teacher/${testUser.username}`);
    expect(profileResponse.ok()).toBeTruthy();
  });

  test('2.2 should edit teacher profile', async ({ page }) => {
    // First create a teacher profile
    const teacherProfile = generateTestTeacherProfile();
    await page.request.post('/api/profiles/teacher', {
      data: teacherProfile,
    });
    
    await page.goto('/profile/professional/teacher/edit');
    
    // Update bio
    const updatedBio = 'Updated teacher bio with new teaching methods and experience';
    await page.getByTestId('textarea-bio').fill(updatedBio);
    
    // Update years
    await page.getByTestId('input-years-teaching').fill('20');
    
    // Submit
    await page.getByTestId('button-save-teacher-profile').click();
    
    // Verify success
    await expect(page.getByText(/profile updated/i)).toBeVisible();
    
    // Verify changes persisted
    await page.reload();
    await expect(page.getByTestId('textarea-bio')).toHaveValue(updatedBio);
  });

  test('2.3 should delete teacher profile', async ({ page }) => {
    // Create teacher profile
    const teacherProfile = generateTestTeacherProfile();
    await page.request.post('/api/profiles/teacher', {
      data: teacherProfile,
    });
    
    await page.goto('/profile/professional/teacher/edit');
    
    // Click delete button
    await page.getByTestId('button-delete-teacher-profile').click();
    
    // Confirm deletion in dialog
    await page.getByTestId('button-confirm-delete').click();
    
    // Verify success message
    await expect(page.getByText(/profile deleted/i)).toBeVisible();
    
    // Verify redirected away from edit page
    await expect(page).not.toHaveURL(/\/teacher\/edit/);
  });

  test('2.4 should search teachers by specialty', async ({ page }) => {
    await page.goto('/teachers');
    
    // Select specialty filter
    await page.getByTestId('filter-specialty').click();
    await page.getByRole('option', { name: 'Vals' }).click();
    
    // Apply search
    await page.getByTestId('button-apply-filters').click();
    
    // Wait for results
    await page.waitForResponse(response => 
      response.url().includes('/api/profiles/teachers/search') && response.status() === 200
    );
    
    // Verify results contain specialty
    const teacherCards = page.getByTestId(/card-teacher-/);
    await expect(teacherCards.first()).toBeVisible();
  });

  test('2.5 should view teacher profile page', async ({ page }) => {
    // Create teacher profile
    const teacherProfile = generateTestTeacherProfile();
    await page.request.post('/api/profiles/teacher', {
      data: teacherProfile,
    });
    
    // Navigate to teacher profile
    await page.goto(`/profile/${testUser.username}/teacher`);
    
    // Verify teacher profile displays
    await expect(page.getByTestId('teacher-profile-tagline')).toContainText(teacherProfile.tagline);
    await expect(page.getByTestId('teacher-profile-bio')).toContainText(teacherProfile.bio);
    await expect(page.getByTestId('teacher-years-experience')).toContainText(teacherProfile.yearsTeaching.toString());
    
    // Verify pricing info
    await expect(page.getByTestId('teacher-hourly-rate')).toBeVisible();
  });

  // DJ PROFILE TESTS
  test('2.6 should create DJ profile', async ({ page }) => {
    const djProfile = generateTestDjProfile();
    
    await page.goto('/profile/professional/dj/create');
    
    // Fill DJ profile form
    await page.getByTestId('input-artist-name').fill(djProfile.artistName);
    await page.getByTestId('textarea-bio').fill(djProfile.bio);
    await page.getByTestId('input-tagline').fill(djProfile.tagline);
    await page.getByTestId('input-years-experience').fill(djProfile.yearsExperience.toString());
    
    // Set genres
    for (const genre of djProfile.genres) {
      await page.getByTestId(`checkbox-genre-${genre}`).check();
    }
    
    // Set pricing
    await page.getByTestId('input-event-rate-min').fill(djProfile.eventRateMin.toString());
    await page.getByTestId('input-event-rate-max').fill(djProfile.eventRateMax.toString());
    
    // Submit
    await page.getByTestId('button-create-dj-profile').click();
    
    // Verify success
    await expect(page.getByText(/dj profile created/i)).toBeVisible();
  });

  test('2.7 should edit DJ profile', async ({ page }) => {
    // Create DJ profile
    const djProfile = generateTestDjProfile();
    await page.request.post('/api/profiles/dj', {
      data: djProfile,
    });
    
    await page.goto('/profile/professional/dj/edit');
    
    // Update artist name
    const newArtistName = 'DJ Tango Master';
    await page.getByTestId('input-artist-name').fill(newArtistName);
    
    // Update events played
    await page.getByTestId('input-events-played').fill('200');
    
    // Submit
    await page.getByTestId('button-save-dj-profile').click();
    
    // Verify success
    await expect(page.getByText(/profile updated/i)).toBeVisible();
  });

  test('2.8 should delete DJ profile', async ({ page }) => {
    // Create DJ profile
    const djProfile = generateTestDjProfile();
    await page.request.post('/api/profiles/dj', {
      data: djProfile,
    });
    
    await page.goto('/profile/professional/dj/edit');
    
    // Delete profile
    await page.getByTestId('button-delete-dj-profile').click();
    await page.getByTestId('button-confirm-delete').click();
    
    // Verify deletion
    await expect(page.getByText(/profile deleted/i)).toBeVisible();
  });

  test('2.9 should search DJs by location', async ({ page }) => {
    await page.goto('/djs');
    
    // Enter location filter
    await page.getByTestId('input-location-search').fill('Berlin');
    
    // Apply search
    await page.getByTestId('button-apply-filters').click();
    
    // Wait for results
    await page.waitForResponse(response => 
      response.url().includes('/api/profiles/djs/search') && response.status() === 200
    );
    
    // Verify results
    const djCards = page.getByTestId(/card-dj-/);
    await expect(djCards.first()).toBeVisible();
  });

  test('2.10 should view DJ profile page', async ({ page }) => {
    // Create DJ profile
    const djProfile = generateTestDjProfile();
    await page.request.post('/api/profiles/dj', {
      data: djProfile,
    });
    
    // Navigate to DJ profile
    await page.goto(`/profile/${testUser.username}/dj`);
    
    // Verify DJ profile displays
    await expect(page.getByTestId('dj-profile-artist-name')).toContainText(djProfile.artistName);
    await expect(page.getByTestId('dj-profile-bio')).toContainText(djProfile.bio);
    await expect(page.getByTestId('dj-years-experience')).toContainText(djProfile.yearsExperience.toString());
  });

  // MUSICIAN PROFILE TESTS
  test('2.11 should create musician profile', async ({ page }) => {
    const musicianProfile = generateTestMusicianProfile();
    
    await page.goto('/profile/professional/musician/create');
    
    // Fill musician profile form
    await page.getByTestId('input-artist-name').fill(musicianProfile.artistName);
    await page.getByTestId('textarea-bio').fill(musicianProfile.bio);
    await page.getByTestId('input-tagline').fill(musicianProfile.tagline);
    await page.getByTestId('input-primary-instrument').fill(musicianProfile.primaryInstrument);
    await page.getByTestId('input-years-experience').fill(musicianProfile.yearsExperience.toString());
    
    // Set pricing
    await page.getByTestId('input-performance-rate-min').fill(musicianProfile.performanceRateMin.toString());
    await page.getByTestId('input-performance-rate-max').fill(musicianProfile.performanceRateMax.toString());
    
    // Submit
    await page.getByTestId('button-create-musician-profile').click();
    
    // Verify success
    await expect(page.getByText(/musician profile created/i)).toBeVisible();
  });

  test('2.12 should edit musician profile', async ({ page }) => {
    // Create musician profile
    const musicianProfile = generateTestMusicianProfile();
    await page.request.post('/api/profiles/musician', {
      data: musicianProfile,
    });
    
    await page.goto('/profile/professional/musician/edit');
    
    // Update bio
    const updatedBio = 'Updated musician bio with additional performance experience';
    await page.getByTestId('textarea-bio').fill(updatedBio);
    
    // Submit
    await page.getByTestId('button-save-musician-profile').click();
    
    // Verify success
    await expect(page.getByText(/profile updated/i)).toBeVisible();
  });

  test('2.13 should delete musician profile', async ({ page }) => {
    // Create musician profile
    const musicianProfile = generateTestMusicianProfile();
    await page.request.post('/api/profiles/musician', {
      data: musicianProfile,
    });
    
    await page.goto('/profile/professional/musician/edit');
    
    // Delete profile
    await page.getByTestId('button-delete-musician-profile').click();
    await page.getByTestId('button-confirm-delete').click();
    
    // Verify deletion
    await expect(page.getByText(/profile deleted/i)).toBeVisible();
  });

  test('2.14 should search musicians by instrument', async ({ page }) => {
    await page.goto('/musicians');
    
    // Select instrument filter
    await page.getByTestId('filter-instrument').click();
    await page.getByRole('option', { name: 'Bandoneon' }).click();
    
    // Apply search
    await page.getByTestId('button-apply-filters').click();
    
    // Wait for results
    await page.waitForResponse(response => 
      response.url().includes('/api/profiles/musicians/search') && response.status() === 200
    );
    
    // Verify results
    const musicianCards = page.getByTestId(/card-musician-/);
    await expect(musicianCards.first()).toBeVisible();
  });

  test('2.15 should view musician profile page', async ({ page }) => {
    // Create musician profile
    const musicianProfile = generateTestMusicianProfile();
    await page.request.post('/api/profiles/musician', {
      data: musicianProfile,
    });
    
    // Navigate to musician profile
    await page.goto(`/profile/${testUser.username}/musician`);
    
    // Verify musician profile displays
    await expect(page.getByTestId('musician-profile-artist-name')).toContainText(musicianProfile.artistName);
    await expect(page.getByTestId('musician-profile-bio')).toContainText(musicianProfile.bio);
    await expect(page.getByTestId('musician-primary-instrument')).toContainText(musicianProfile.primaryInstrument);
  });
});

test.describe('Profile System - Media Upload Tests', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = await registerAndLogin(page);
  });

  test('3.1 should upload portfolio image', async ({ page }) => {
    await page.goto('/profile/media/upload');
    
    // Select image type
    await page.getByTestId('select-media-type').click();
    await page.getByRole('option', { name: 'Portfolio Image' }).click();
    
    // Upload image
    const fileInput = page.getByTestId('input-file-upload');
    await fileInput.setInputFiles({
      name: 'portfolio.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-portfolio-image'),
    });
    
    // Add caption
    await page.getByTestId('input-media-caption').fill('Performance at Buenos Aires milonga');
    
    // Submit upload
    await page.getByTestId('button-upload-media').click();
    
    // Verify success
    await expect(page.getByText(/media uploaded/i)).toBeVisible();
    
    // Verify appears in gallery
    await page.goto(`/profile/${testUser.username}/photos`);
    await expect(page.getByTestId('media-item-portfolio')).toBeVisible();
  });

  test('3.2 should upload sample mix (DJ)', async ({ page }) => {
    // Create DJ profile first
    const djProfile = generateTestDjProfile();
    await page.request.post('/api/profiles/dj', {
      data: djProfile,
    });
    
    await page.goto('/profile/dj/media/upload');
    
    // Select audio type
    await page.getByTestId('select-media-type').click();
    await page.getByRole('option', { name: 'Sample Mix' }).click();
    
    // Upload audio file
    const fileInput = page.getByTestId('input-file-upload');
    await fileInput.setInputFiles({
      name: 'sample-mix.mp3',
      mimeType: 'audio/mpeg',
      buffer: Buffer.from('fake-audio-data'),
    });
    
    // Add title
    await page.getByTestId('input-mix-title').fill('Golden Age Tanda Sample');
    
    // Submit
    await page.getByTestId('button-upload-media').click();
    
    // Verify success
    await expect(page.getByText(/mix uploaded/i)).toBeVisible();
  });

  test('3.3 should upload performance video', async ({ page }) => {
    await page.goto('/profile/media/upload');
    
    // Select video type
    await page.getByTestId('select-media-type').click();
    await page.getByRole('option', { name: 'Performance Video' }).click();
    
    // Upload video
    const fileInput = page.getByTestId('input-file-upload');
    await fileInput.setInputFiles({
      name: 'performance.mp4',
      mimeType: 'video/mp4',
      buffer: Buffer.from('fake-video-data'),
    });
    
    // Add title and description
    await page.getByTestId('input-video-title').fill('Tango Performance at Festival');
    await page.getByTestId('textarea-video-description').fill('Performance from International Tango Festival 2024');
    
    // Submit
    await page.getByTestId('button-upload-media').click();
    
    // Verify upload progress
    await expect(page.getByTestId('upload-progress')).toBeVisible();
    
    // Wait for completion
    await expect(page.getByText(/video uploaded/i)).toBeVisible({ timeout: 15000 });
  });

  test('3.4 should delete media', async ({ page }) => {
    // First upload an image
    await page.goto('/profile/media/upload');
    await page.getByTestId('select-media-type').click();
    await page.getByRole('option', { name: 'Portfolio Image' }).click();
    
    const fileInput = page.getByTestId('input-file-upload');
    await fileInput.setInputFiles({
      name: 'test-delete.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('test-image'),
    });
    
    await page.getByTestId('button-upload-media').click();
    await expect(page.getByText(/media uploaded/i)).toBeVisible();
    
    // Navigate to gallery
    await page.goto(`/profile/${testUser.username}/photos`);
    
    // Find and delete the media
    const mediaItem = page.getByTestId('media-item-portfolio').first();
    await mediaItem.hover();
    await mediaItem.getByTestId('button-delete-media').click();
    
    // Confirm deletion
    await page.getByTestId('button-confirm-delete-media').click();
    
    // Verify deletion
    await expect(page.getByText(/media deleted/i)).toBeVisible();
  });

  test('3.5 should view media gallery', async ({ page }) => {
    // Upload multiple images
    for (let i = 0; i < 3; i++) {
      await page.goto('/profile/media/upload');
      await page.getByTestId('select-media-type').click();
      await page.getByRole('option', { name: 'Portfolio Image' }).click();
      
      const fileInput = page.getByTestId('input-file-upload');
      await fileInput.setInputFiles({
        name: `gallery-${i}.jpg`,
        mimeType: 'image/jpeg',
        buffer: Buffer.from(`gallery-image-${i}`),
      });
      
      await page.getByTestId('button-upload-media').click();
      await expect(page.getByText(/media uploaded/i)).toBeVisible();
    }
    
    // Navigate to gallery
    await page.goto(`/profile/${testUser.username}/photos`);
    
    // Verify gallery grid displays
    await expect(page.getByTestId('media-gallery-grid')).toBeVisible();
    
    // Verify at least 3 items
    const mediaItems = page.getByTestId(/media-item-/);
    await expect(mediaItems).toHaveCount(3, { timeout: 5000 });
    
    // Click on first image to open lightbox
    await mediaItems.first().click();
    
    // Verify lightbox opens
    await expect(page.getByTestId('media-lightbox')).toBeVisible();
    
    // Navigate to next image
    await page.getByTestId('button-next-image').click();
    
    // Close lightbox
    await page.getByTestId('button-close-lightbox').click();
    await expect(page.getByTestId('media-lightbox')).not.toBeVisible();
  });
});

test.describe('Profile System - Visibility & Permissions Tests', () => {
  let testUser: ReturnType<typeof generateTestUser>;
  let secondUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = await registerAndLogin(page);
    secondUser = await createSecondUser(page);
  });

  test('4.1 should access public profile without authentication', async ({ page, context }) => {
    // Set user profile to public
    await page.goto('/settings/privacy');
    const visibilitySelect = page.getByTestId('select-profile-visibility');
    await visibilitySelect.click();
    await page.getByRole('option', { name: 'Public' }).click();
    await page.getByTestId('button-save-privacy').click();
    await expect(page.getByText(/privacy settings updated/i)).toBeVisible();
    
    // Logout
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    
    // Open new incognito context (not logged in)
    const newContext = await context.browser()?.newContext();
    const newPage = await newContext!.newPage();
    
    // Navigate to profile
    await newPage.goto(`/profile/${testUser.username}`);
    
    // Verify profile is accessible
    await expect(newPage.getByTestId('text-profile-name')).toBeVisible();
    await expect(newPage.getByTestId('text-profile-name')).toContainText(testUser.name);
    
    await newContext!.close();
  });

  test('4.2 should block friends-only profile for non-friends', async ({ page, context }) => {
    // Set profile to friends only
    await page.goto('/settings/privacy');
    const visibilitySelect = page.getByTestId('select-profile-visibility');
    await visibilitySelect.click();
    await page.getByRole('option', { name: 'Friends Only' }).click();
    await page.getByTestId('button-save-privacy').click();
    
    // Logout
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    
    // Login as second user
    await page.goto('/login');
    await page.getByTestId('input-username').fill(secondUser.username);
    await page.getByTestId('input-password').fill(secondUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
    
    // Try to access first user's profile
    await page.goto(`/profile/${testUser.username}`);
    
    // Verify access denied
    await expect(page.getByText(/profile is private/i)).toBeVisible();
    await expect(page.getByTestId('text-profile-bio')).not.toBeVisible();
  });

  test('4.3 should block private profile for all others', async ({ page, context }) => {
    // Set profile to private
    await page.goto('/settings/privacy');
    const visibilitySelect = page.getByTestId('select-profile-visibility');
    await visibilitySelect.click();
    await page.getByRole('option', { name: 'Private' }).click();
    await page.getByTestId('button-save-privacy').click();
    
    // Logout
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    
    // Login as second user
    await page.goto('/login');
    await page.getByTestId('input-username').fill(secondUser.username);
    await page.getByTestId('input-password').fill(secondUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
    
    // Try to access first user's profile
    await page.goto(`/profile/${testUser.username}`);
    
    // Verify completely blocked
    await expect(page.getByText(/profile is private/i)).toBeVisible();
    await expect(page.getByTestId('text-profile-name')).not.toBeVisible();
  });

  test('4.4 should allow profile owner to always view own profile', async ({ page }) => {
    // Set profile to private
    await page.goto('/settings/privacy');
    const visibilitySelect = page.getByTestId('select-profile-visibility');
    await visibilitySelect.click();
    await page.getByRole('option', { name: 'Private' }).click();
    await page.getByTestId('button-save-privacy').click();
    
    // Navigate to own profile
    await page.goto(`/profile/${testUser.username}`);
    
    // Verify full access to own profile
    await expect(page.getByTestId('text-profile-name')).toBeVisible();
    await expect(page.getByTestId('text-profile-bio')).toBeVisible();
    await expect(page.getByTestId('button-edit-profile')).toBeVisible();
  });

  test('4.5 should allow friend to view friends-only profile', async ({ page }) => {
    // Set profile to friends only
    await page.goto('/settings/privacy');
    const visibilitySelect = page.getByTestId('select-profile-visibility');
    await visibilitySelect.click();
    await page.getByRole('option', { name: 'Friends Only' }).click();
    await page.getByTestId('button-save-privacy').click();
    
    // Send friend request to second user
    await page.goto(`/profile/${secondUser.username}`);
    await page.getByTestId('button-add-friend').click();
    
    // Accept friend request as second user (via API)
    await page.request.post('/api/friendships/accept', {
      data: { friendId: testUser.username },
    });
    
    // Logout and login as second user
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    
    await page.goto('/login');
    await page.getByTestId('input-username').fill(secondUser.username);
    await page.getByTestId('input-password').fill(secondUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
    
    // Navigate to first user's profile
    await page.goto(`/profile/${testUser.username}`);
    
    // Verify friend can view profile
    await expect(page.getByTestId('text-profile-name')).toBeVisible();
    await expect(page.getByTestId('text-profile-bio')).toBeVisible();
  });

  test('4.6 should hide email from public when privacy setting is off', async ({ page }) => {
    await page.goto('/settings/privacy');
    
    // Toggle show email off
    const showEmailToggle = page.getByTestId('toggle-show-email');
    await showEmailToggle.click();
    
    // Save
    await page.getByTestId('button-save-privacy').click();
    
    // Logout and view as public
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    
    // Navigate to profile
    await page.goto(`/profile/${testUser.username}`);
    
    // Verify email is not visible
    await expect(page.getByText(testUser.email)).not.toBeVisible();
  });

  test('4.7 should hide phone from public when privacy setting is off', async ({ page }) => {
    // First add phone number
    await page.goto('/settings/profile');
    await page.getByTestId('input-phone').fill('+54 11 1234-5678');
    await page.getByTestId('button-save-profile').click();
    
    // Set privacy to hide phone
    await page.goto('/settings/privacy');
    const showPhoneToggle = page.getByTestId('toggle-show-phone');
    await showPhoneToggle.click();
    await page.getByTestId('button-save-privacy').click();
    
    // Logout
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    
    // Navigate to profile
    await page.goto(`/profile/${testUser.username}`);
    
    // Verify phone is not visible
    await expect(page.getByText('+54 11 1234-5678')).not.toBeVisible();
  });

  test('4.8 should hide activity status when privacy setting is off', async ({ page }) => {
    await page.goto('/settings/privacy');
    
    // Toggle show activity off
    const showActivityToggle = page.getByTestId('toggle-show-activity');
    await showActivityToggle.click();
    
    // Save
    await page.getByTestId('button-save-privacy').click();
    
    // Logout and login as second user
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    
    await page.goto('/login');
    await page.getByTestId('input-username').fill(secondUser.username);
    await page.getByTestId('input-password').fill(secondUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
    
    // Navigate to first user's profile
    await page.goto(`/profile/${testUser.username}`);
    
    // Verify "last active" is not visible
    await expect(page.getByTestId('text-last-active')).not.toBeVisible();
  });
});

test.describe('Profile System - Analytics Tests', () => {
  let testUser: ReturnType<typeof generateTestUser>;
  let secondUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = await registerAndLogin(page);
    secondUser = await createSecondUser(page);
  });

  test('5.1 should track profile views', async ({ page }) => {
    // View analytics dashboard
    await page.goto('/profile/analytics');
    
    // Get initial view count
    const initialViews = await page.getByTestId('stat-profile-views').textContent();
    const initialCount = parseInt(initialViews?.match(/\d+/)?.[0] || '0');
    
    // Have second user view the profile
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    
    // Login as second user
    await page.goto('/login');
    await page.getByTestId('input-username').fill(secondUser.username);
    await page.getByTestId('input-password').fill(secondUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
    
    // View first user's profile
    await page.goto(`/profile/${testUser.username}`);
    await page.waitForTimeout(2000); // Wait for analytics to record
    
    // Logout and login back as first user
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    
    await page.goto('/login');
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
    
    // Check analytics again
    await page.goto('/profile/analytics');
    
    const newViews = await page.getByTestId('stat-profile-views').textContent();
    const newCount = parseInt(newViews?.match(/\d+/)?.[0] || '0');
    
    // Verify view count increased
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('5.2 should display analytics dashboard data', async ({ page }) => {
    await page.goto('/profile/analytics');
    
    // Verify dashboard sections exist
    await expect(page.getByRole('heading', { name: /profile analytics/i })).toBeVisible();
    
    // Verify key metrics
    await expect(page.getByTestId('stat-profile-views')).toBeVisible();
    await expect(page.getByTestId('stat-profile-followers')).toBeVisible();
    await expect(page.getByTestId('stat-post-engagements')).toBeVisible();
    
    // Verify charts
    await expect(page.getByTestId('chart-views-over-time')).toBeVisible();
    await expect(page.getByTestId('chart-engagement-rate')).toBeVisible();
    
    // Verify recent viewers section
    await expect(page.getByRole('heading', { name: /recent viewers/i })).toBeVisible();
  });

  test('5.3 should generate insights from analytics', async ({ page }) => {
    await page.goto('/profile/analytics');
    
    // Verify insights section exists
    await expect(page.getByRole('heading', { name: /insights/i })).toBeVisible();
    
    // Verify at least one insight is shown
    const insightCards = page.getByTestId(/insight-card-/);
    await expect(insightCards.first()).toBeVisible();
    
    // Verify insight categories
    await expect(page.getByText(/profile optimization/i)).toBeVisible();
    
    // Check for actionable recommendations
    const recommendations = page.getByTestId(/recommendation-/);
    await expect(recommendations.first()).toBeVisible();
    
    // Verify insight details
    await insightCards.first().click();
    await expect(page.getByTestId('insight-detail-modal')).toBeVisible();
    await expect(page.getByTestId('insight-description')).toBeVisible();
    await expect(page.getByTestId('insight-action-button')).toBeVisible();
  });
});
