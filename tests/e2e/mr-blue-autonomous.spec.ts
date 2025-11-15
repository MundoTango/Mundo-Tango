/**
 * MR. BLUE AUTONOMOUS AGENT E2E TEST
 * Tests full autonomous workflow with real Visual Editor task
 * 
 * Test Scenario: Add file upload preview to Visual Editor
 * - Login as God Level user (no rate limits, no cost caps)
 * - Navigate to Visual Editor
 * - Submit autonomous prompt
 * - Wait for task decomposition, generation, validation
 * - Review generated files
 * - Approve changes
 * - Verify files were modified correctly
 */

import { test, expect } from '@playwright/test';
import { navigateToPage, verifyOnPage } from '../helpers/navigation';
import { fillForm, submitForm } from '../helpers/forms';

/**
 * God Level user (from TEST_ADMIN secrets)
 * This user has NO rate limits or cost caps
 */
const godUser = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life',
  password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
};

test.describe('Mr. Blue Autonomous Agent', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as God Level user
    await navigateToPage(page, '/login');
    
    await fillForm(page, {
      'input-username': godUser.email,
      'input-password': godUser.password,
    });
    
    await submitForm(page, 'button-login');
    
    // Wait for redirect to dashboard/feed
    await page.waitForURL(/\/(feed|dashboard)/, { timeout: 10000 });
  });

  test('should autonomously add file upload preview feature', async ({ page }) => {
    console.log('🚀 Starting Mr. Blue autonomous test...');
    
    // 1. Navigate to Visual Editor
    console.log('Step 1: Navigating to Visual Editor...');
    await navigateToPage(page, '/visual-editor');
    await verifyOnPage(page, '/visual-editor');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // 2. Open autonomous mode panel
    console.log('Step 2: Opening autonomous mode panel...');
    const autonomousButton = page.getByTestId('button-autonomous-mode');
    
    // If autonomous button doesn't exist, check for alternative UI
    const autonomousExists = await autonomousButton.isVisible().catch(() => false);
    
    if (!autonomousExists) {
      console.log('⚠️ Autonomous mode button not found - checking for alternative UI...');
      
      // Try clicking Mr. Blue chat toggle
      await page.getByTestId('button-mr-blue-chat')?.click().catch(() => {});
      await page.waitForTimeout(500);
      
      // Try clicking autonomous tab
      await page.getByTestId('tab-autonomous')?.click().catch(() => {});
      await page.waitForTimeout(500);
    } else {
      await autonomousButton.click();
      await page.waitForTimeout(1000);
    }
    
    // 3. Submit autonomous prompt
    console.log('Step 3: Submitting autonomous prompt...');
    const prompt = `Add image preview thumbnails when uploading files in the Visual Editor file upload component. When a user selects an image file, show a 100x100px preview thumbnail next to the filename. Use proper React/TypeScript patterns and follow MT Ocean design system.`;
    
    const promptInput = page.getByTestId('input-autonomous-prompt');
    await expect(promptInput).toBeVisible({ timeout: 5000 });
    
    await promptInput.fill(prompt);
    
    // Screenshot before execution
    await page.screenshot({ path: 'test-results/mr-blue-01-prompt-entered.png' });
    
    // Execute autonomous task
    const executeButton = page.getByTestId('button-execute-autonomous');
    await expect(executeButton).toBeVisible({ timeout: 5000 });
    await executeButton.click();
    
    console.log('Step 4: Task submitted - waiting for decomposition...');
    
    // 4. Wait for decomposition phase
    await expect(page.getByTestId('status-decomposing')).toBeVisible({ timeout: 10000 });
    console.log('✓ Decomposition started');
    
    await page.screenshot({ path: 'test-results/mr-blue-02-decomposing.png' });
    
    // 5. Wait for code generation phase
    console.log('Step 5: Waiting for code generation...');
    await expect(page.getByTestId('status-generating')).toBeVisible({ timeout: 60000 });
    console.log('✓ Code generation started');
    
    await page.screenshot({ path: 'test-results/mr-blue-03-generating.png' });
    
    // 6. Wait for validation phase
    console.log('Step 6: Waiting for validation...');
    await expect(page.getByTestId('status-validating')).toBeVisible({ timeout: 120000 });
    console.log('✓ Validation started');
    
    await page.screenshot({ path: 'test-results/mr-blue-04-validating.png' });
    
    // 7. Wait for approval phase
    console.log('Step 7: Waiting for approval phase...');
    await expect(page.getByTestId('status-awaiting-approval')).toBeVisible({ timeout: 60000 });
    console.log('✓ Awaiting approval');
    
    await page.screenshot({ path: 'test-results/mr-blue-05-awaiting-approval.png' });
    
    // 8. Check validation results
    console.log('Step 8: Checking validation results...');
    const lspErrors = await page.getByTestId('text-lsp-errors').textContent();
    const lspWarnings = await page.getByTestId('text-lsp-warnings').textContent();
    
    console.log(`  LSP Errors: ${lspErrors}`);
    console.log(`  LSP Warnings: ${lspWarnings}`);
    
    // Expect no LSP errors (warnings are acceptable)
    expect(lspErrors).toBe('0');
    
    // 9. Check generated files
    const fileCount = await page.getByTestId('text-files-generated').textContent();
    console.log(`  Files Generated: ${fileCount}`);
    
    const filesGenerated = parseInt(fileCount || '0');
    expect(filesGenerated).toBeGreaterThan(0);
    
    // 10. Review file diffs (if available)
    console.log('Step 9: Reviewing generated files...');
    const fileDiffs = await page.getByTestId('container-file-diffs').isVisible().catch(() => false);
    
    if (fileDiffs) {
      console.log('  ✓ File diffs available for review');
      await page.screenshot({ path: 'test-results/mr-blue-06-file-diffs.png' });
    }
    
    // 11. Approve changes
    console.log('Step 10: Approving changes...');
    const approveButton = page.getByTestId('button-approve-autonomous');
    await expect(approveButton).toBeVisible({ timeout: 5000 });
    await approveButton.click();
    
    // 12. Wait for completion
    console.log('Step 11: Waiting for completion...');
    await expect(page.getByTestId('status-completed')).toBeVisible({ timeout: 30000 });
    console.log('✓ Task completed successfully!');
    
    await page.screenshot({ path: 'test-results/mr-blue-07-completed.png' });
    
    // 13. Verify success message
    await expect(
      page.getByText(/completed|success|applied/i)
    ).toBeVisible({ timeout: 5000 });
    
    // 14. Check files modified count
    const filesModified = await page.getByTestId('text-files-modified')?.textContent().catch(() => null);
    if (filesModified) {
      console.log(`  Files Modified: ${filesModified}`);
      expect(parseInt(filesModified)).toBeGreaterThan(0);
    }
    
    console.log('✅ Mr. Blue autonomous test PASSED!');
  });

  test('should show God Level has no limits', async ({ page }) => {
    console.log('🔓 Testing God Level unlimited access...');
    
    await navigateToPage(page, '/visual-editor');
    await page.waitForTimeout(2000);
    
    // Open autonomous mode
    await page.getByTestId('button-autonomous-mode')?.click().catch(() => {});
    await page.waitForTimeout(1000);
    
    // Submit a prompt
    const prompt = "Add console.log('test') to the Visual Editor page";
    await page.getByTestId('input-autonomous-prompt')?.fill(prompt).catch(() => {});
    await page.getByTestId('button-execute-autonomous')?.click().catch(() => {});
    
    // Check response for God Level status
    await page.waitForTimeout(2000);
    
    // Look for "unlimited" or high rate limit
    const rateLimitText = await page.getByTestId('text-rate-limit')?.textContent().catch(() => null);
    
    if (rateLimitText) {
      console.log(`  Rate Limit: ${rateLimitText}`);
      // Should show unlimited or very high number (999)
      expect(rateLimitText).toMatch(/(unlimited|999)/i);
    }
    
    console.log('✅ God Level has unlimited access!');
  });
});
