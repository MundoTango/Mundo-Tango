import { test, expect } from '@playwright/test';
import { generateTestUser, generateTestEvent } from './fixtures/test-data';
import { waitForApiResponse } from './helpers/test-helpers';

test.describe('Event Discovery Journey', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    // Register and login
    testUser = generateTestUser();
    await page.request.post('/api/auth/register', {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      },
    });
    
    await page.goto('/login');
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
  });

  test('should browse events', async ({ page }) => {
    // Navigate to events
    await page.goto('/events');
    
    // Verify events page loaded
    await expect(page.getByRole('heading', { name: /events/i })).toBeVisible();
    
    // Verify event cards are displayed
    await expect(page.getByTestId('event-card')).toHaveCount({ min: 1 });
  });

  test('should search for events', async ({ page }) => {
    await page.goto('/events');
    
    // Use search
    const searchInput = page.getByTestId('input-search-events');
    await searchInput.fill('milonga');
    
    await waitForApiResponse(page, '/api/events');
    
    // Verify filtered results
    await expect(page.getByTestId('event-card')).toBeVisible();
  });

  test('should filter events by type', async ({ page }) => {
    await page.goto('/events');
    
    // Apply filter
    await page.getByTestId('select-event-type').click();
    await page.getByTestId('option-milonga').click();
    
    await waitForApiResponse(page, '/api/events');
    
    // Verify filtered results
    const eventCards = page.getByTestId('event-card');
    await expect(eventCards.first()).toBeVisible();
  });

  test('should view event details', async ({ page }) => {
    // Create test event
    const event = generateTestEvent();
    const eventResponse = await page.request.post('/api/events', {
      data: {
        ...event,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    const eventData = await eventResponse.json();
    
    // Navigate to event detail
    await page.goto(`/events/${eventData.id}`);
    
    // Verify event details
    await expect(page.getByRole('heading', { name: event.title })).toBeVisible();
    await expect(page.getByText(event.description)).toBeVisible();
    await expect(page.getByText(event.location)).toBeVisible();
    await expect(page.getByText(event.venue!)).toBeVisible();
  });

  test('should RSVP to an event', async ({ page }) => {
    // Create test event
    const event = generateTestEvent();
    const eventResponse = await page.request.post('/api/events', {
      data: {
        ...event,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    const eventData = await eventResponse.json();
    
    await page.goto(`/events/${eventData.id}`);
    
    // RSVP to event
    await page.getByTestId('button-rsvp').click();
    await page.waitForTimeout(500);
    
    // Verify RSVP success
    await expect(page.getByTestId('button-rsvp')).toContainText(/attending/i);
    await expect(page.getByTestId('attendee-count')).toBeVisible();
  });

  test('should add event to calendar', async ({ page }) => {
    // Create test event
    const event = generateTestEvent();
    const eventResponse = await page.request.post('/api/events', {
      data: {
        ...event,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    const eventData = await eventResponse.json();
    
    await page.goto(`/events/${eventData.id}`);
    
    // Add to calendar
    await page.getByTestId('button-add-calendar').click();
    
    // Verify calendar options appear
    await expect(page.getByTestId('calendar-options')).toBeVisible();
    await expect(page.getByText(/Google Calendar/i)).toBeVisible();
    await expect(page.getByText(/Apple Calendar/i)).toBeVisible();
  });

  test('should comment on an event', async ({ page }) => {
    // Create test event
    const event = generateTestEvent();
    const eventResponse = await page.request.post('/api/events', {
      data: {
        ...event,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    const eventData = await eventResponse.json();
    
    await page.goto(`/events/${eventData.id}`);
    
    // Scroll to comments
    await page.getByTestId('section-comments').scrollIntoViewIfNeeded();
    
    // Add comment
    const commentText = 'Looking forward to this event!';
    await page.getByTestId('textarea-event-comment').fill(commentText);
    await page.getByTestId('button-submit-event-comment').click();
    
    // Verify comment appears
    await expect(page.getByText(commentText)).toBeVisible();
  });
});
