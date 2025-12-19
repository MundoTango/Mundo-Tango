/**
 * GROUPS COMPLETE JOURNEY TEST
 * Tests group creation, membership, and group interactions
 */

import { test, expect } from '@playwright/test';

test.describe('Groups - Complete Journey', () => {
  test('should view groups directory', async ({ page }) => {
    await page.goto('/groups');
    await expect(page.getByTestId('groups-container')).toBeVisible();
  });

  test('should create new group', async ({ page }) => {
    await page.goto('/groups');
    await page.getByTestId('button-create-group').click();
    
    await page.getByTestId('input-group-name').fill(`Test Group ${Date.now()}`);
    await page.getByTestId('textarea-group-description').fill('A group for tango lovers');
    await page.getByTestId('select-privacy').click();
    await page.getByTestId('option-public').click();
    
    await page.getByTestId('button-create').click();
    await expect(page.getByText(/group.*created/i)).toBeVisible();
  });

  test('should join public group', async ({ page }) => {
    await page.goto('/groups');
    await page.getByTestId('button-join-group').first().click();
    await expect(page.getByText(/joined|member/i)).toBeVisible();
  });

  test('should request to join private group', async ({ page }) => {
    await page.goto('/groups');
    await page.getByTestId('button-request-join').first().click();
    await expect(page.getByText(/request.*sent/i)).toBeVisible();
  });

  test('should post in group', async ({ page }) => {
    await page.goto('/groups/1');
    const postText = `Group post ${Date.now()}`;
    await page.getByTestId('textarea-group-post').fill(postText);
    await page.getByTestId('button-post').click();
    await expect(page.getByText(postText)).toBeVisible();
  });

  test('should leave group', async ({ page }) => {
    await page.goto('/groups/1');
    await page.getByTestId('button-group-menu').click();
    await page.getByTestId('button-leave-group').click();
    await page.getByTestId('button-confirm-leave').click();
    await expect(page.getByText(/left.*group/i)).toBeVisible();
  });
});
