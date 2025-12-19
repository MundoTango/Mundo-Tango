/**
 * TANGO EVENTS COMPLETE TEST
 * Tests event creation, RSVP, ticketing, recurrence
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Events Complete', () => {
  test('should create new event', async ({ page }) => {
    await page.goto('/events');
    await page.getByTestId('button-create-event').click();
    
    await page.getByTestId('input-event-title').fill('Milonga Night');
    await page.getByTestId('textarea-description').fill('Weekly milonga at La Catedral');
    await page.getByTestId('input-date').fill('2025-12-20');
    await page.getByTestId('input-time').fill('20:00');
    await page.getByTestId('input-venue').fill('La Catedral');
    
    await page.getByTestId('button-publish-event').click();
    await expect(page.getByText(/published/i)).toBeVisible();
  });

  test('should RSVP to event', async ({ page }) => {
    await page.goto('/events/1');
    await page.getByTestId('button-rsvp').click();
    await expect(page.getByText(/rsvp.*confirmed/i)).toBeVisible();
  });

  test('should purchase ticket', async ({ page }) => {
    await page.goto('/events/1');
    await page.getByTestId('button-buy-ticket').click();
    await page.getByTestId('select-quantity').click();
    await page.getByTestId('option-2-tickets').click();
    await page.getByTestId('button-checkout').click();
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('should create recurring event', async ({ page }) => {
    await page.goto('/events');
    await page.getByTestId('button-create-event').click();
    
    await page.getByTestId('input-event-title').fill('Weekly Practica');
    await page.getByTestId('checkbox-recurring').click();
    await page.getByTestId('select-frequency').click();
    await page.getByTestId('option-weekly').click();
    
    await page.getByTestId('button-publish-event').click();
    await expect(page.getByText(/published/i)).toBeVisible();
  });

  test('should share event', async ({ page }) => {
    await page.goto('/events/1');
    await page.getByTestId('button-share-event').click();
    await expect(page.getByTestId('share-modal')).toBeVisible();
  });
});
