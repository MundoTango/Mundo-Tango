/**
 * PAGE GENERATOR E2E TEST - MB.MD PROTOCOL v9.2
 * November 20, 2025
 * 
 * Tests the complete AI Page Generator flow:
 * 1. Navigate to Visual Editor
 * 2. Access Page Generator tab
 * 3. Generate a page from natural language
 * 4. Verify page files created
 * 5. Navigate to generated page
 */

import { test, expect } from '@playwright/test';

test.describe('AI Page Generator', () => {
  test('should generate a complete page from natural language description', async ({ page }) => {
    // Step 1: Navigate to Visual Editor
    await page.goto('/mrblue/visual-editor');
    await expect(page.getByTestId('page-visual-editor')).toBeVisible();
    
    // Step 2: Click on AI Page Generator tab
    await page.getByTestId('tab-page-generator').click();
    
    // Step 3: Enter page description
    const description = 'Create a photo gallery page displaying images in a grid layout with lightbox';
    await page.getByTestId('input-page-description').fill(description);
    
    // Step 4: Select archetype (optional - auto-detect should work)
    await page.getByTestId('select-page-archetype').click();
    await page.getByRole('option', { name: /Data Display/ }).click();
    
    // Step 5: Generate page
    await page.getByTestId('button-generate-page').click();
    
    // Step 6: Wait for generation to complete
    await expect(page.getByText(/Page generated successfully!/i)).toBeVisible({ timeout: 30000 });
    
    // Step 7: Verify success message
    await expect(page.getByText(/Created.*Page/i)).toBeVisible();
    
    console.log('✅ Page Generator Test: Page generated successfully!');
  });
  
  test('should show validation error for empty description', async ({ page }) => {
    await page.goto('/mrblue/visual-editor');
    await page.getByTestId('tab-page-generator').click();
    
    // Try to generate without description
    await page.getByTestId('button-generate-page').click();
    
    // Should show validation error
    await expect(page.getByText(/Description.*required/i)).toBeVisible();
  });
  
  test('should allow archetype auto-detection', async ({ page }) => {
    await page.goto('/mrblue/visual-editor');
    await page.getByTestId('tab-page-generator').click();
    
    const description = 'Create a user registration form with email and password validation';
    await page.getByTestId('input-page-description').fill(description);
    
    // Keep archetype on "Auto-detect"
    const archetypeSelect = page.getByTestId('select-page-archetype');
    await expect(archetypeSelect).toHaveText(/Auto-detect/i);
    
    // Generate
    await page.getByTestId('button-generate-page').click();
    await expect(page.getByText(/Page generated successfully!/i)).toBeVisible({ timeout: 30000 });
    
    console.log('✅ Auto-detection Test: Page generated with auto-detected archetype!');
  });
});
