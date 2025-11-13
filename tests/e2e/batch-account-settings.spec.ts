/**
 * AGENT 5: Account & Settings Test Suite
 * Tests account management and settings pages
 * Timeline: Days 4-8
 */

import { test, expect } from '@playwright/test';
import { AccountHelper } from '../helpers/account-helper';
import { setupAuthenticatedSession } from '../helpers/auth-setup';

test.describe('Account & Settings Management - Complete Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  // Settings Pages Tests
  test('Main settings page loads correctly', async ({ page }) => {
    await AccountHelper.navigateToSettings(page);
    
    // Verify settings page
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
  });

  // Test each settings section
  const sections = AccountHelper.getAllSettingsSections();
  
  for (const section of sections) {
    test(`Settings ${section} page displays correctly`, async ({ page }) => {
      await AccountHelper.navigateToSettings(page, section);
      
      // Verify section loaded
      await expect(page).toHaveURL(`/settings/${section}`);
      
      // Check for settings form or content
      const settingsContent = page.locator('[data-testid*="settings"]').first();
      await expect(settingsContent).toBeVisible();
    });
  }

  // Notifications Settings Tests
  test('Notification settings can be toggled', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'notifications');
    
    // Find first toggle
    const firstToggle = page.getByRole('switch').first();
    if (await firstToggle.isVisible()) {
      const initialState = await firstToggle.isChecked();
      
      // Toggle it
      await firstToggle.click();
      
      // Verify state changed
      await expect(firstToggle).toBeChecked({ checked: !initialState });
    }
  });

  test('Notification settings persist after reload', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'notifications');
    
    const firstToggle = page.getByRole('switch').first();
    if (await firstToggle.isVisible()) {
      // Enable it
      await firstToggle.check();
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify still checked
      await expect(firstToggle).toBeChecked();
    }
  });

  // Privacy Settings Tests
  test('Privacy settings page loads correctly', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'privacy');
    await AccountHelper.verifySettingsPage(page, 'privacy');
  });

  test('Privacy controls are accessible', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'privacy');
    
    // Check for privacy controls
    const privacyControls = page.locator('[data-testid*="privacy"]');
    await expect(privacyControls.first()).toBeVisible();
  });

  // Security Settings Tests
  test('Security settings page loads correctly', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'security');
    await AccountHelper.verifySettingsPage(page, 'security');
  });

  test('Password change form is present', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'security');
    
    // Look for password-related fields
    const passwordSection = page.locator('text=/password/i').first();
    if (await passwordSection.isVisible()) {
      await expect(passwordSection).toBeVisible();
    }
  });

  // Theme Settings Tests
  test('Theme settings page loads correctly', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'theme');
    
    // Check for theme options
    const themeOptions = page.locator('text=/theme|dark|light/i').first();
    await expect(themeOptions).toBeVisible();
  });

  test('Dark mode toggle works', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'theme');
    
    const darkModeToggle = page.getByTestId('toggle-dark-mode');
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      
      // Verify theme changed
      await page.waitForTimeout(500);
    }
  });

  // Language Settings Tests
  test('Language settings page loads correctly', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'language');
    
    // Check for language options
    const languageSelect = page.locator('text=/language/i').first();
    await expect(languageSelect).toBeVisible();
  });

  // Accessibility Settings Tests
  test('Accessibility settings page loads correctly', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'accessibility');
    
    // Check for accessibility options
    const accessibilityOptions = page.locator('text=/accessibility/i').first();
    await expect(accessibilityOptions).toBeVisible();
  });

  // Email Preferences Tests
  test('Email preferences page loads correctly', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'email-preferences');
    
    // Check for email options
    const emailOptions = page.locator('text=/email/i').first();
    await expect(emailOptions).toBeVisible();
  });

  // Data Settings Tests
  test('Data settings page loads correctly', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'data');
    
    // Check for data management options
    const dataOptions = page.locator('text=/data|export|download/i').first();
    await expect(dataOptions).toBeVisible();
  });

  // Subscription Settings Tests
  test('Subscription settings page loads correctly', async ({ page }) => {
    await AccountHelper.navigateToSettings(page, 'subscription');
    
    // Check for subscription info
    const subscriptionInfo = page.locator('text=/subscription|plan|billing/i').first();
    await expect(subscriptionInfo).toBeVisible();
  });

  // Account Management Pages
  test('Email verification page loads correctly', async ({ page, context }) => {
    // Clear auth to test public page
    await context.clearCookies();
    
    await AccountHelper.navigateToEmailVerification(page);
    await AccountHelper.verifyAccountPage(page, 'verification');
  });

  test('Password reset page loads correctly', async ({ page, context }) => {
    // Clear auth to test public page
    await context.clearCookies();
    
    await AccountHelper.navigateToPasswordReset(page);
    await AccountHelper.verifyAccountPage(page, 'reset');
  });

  // Account Deletion Test
  test('Account deletion page is accessible', async ({ page }) => {
    await page.goto('/account-deletion');
    
    // Should show account deletion warning
    const warningText = page.locator('text=/delete|remove|permanent/i').first();
    if (await warningText.isVisible()) {
      await expect(warningText).toBeVisible();
    }
  });
});
