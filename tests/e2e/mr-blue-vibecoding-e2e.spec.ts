import { test, expect, Page } from '@playwright/test';
import { generateTestUser } from './fixtures/test-data';
import { verifyToast, waitForApiResponse, takeScreenshot } from './helpers/test-helpers';

/**
 * Mr. Blue VibeCoding - End-to-End Test Suite
 * 
 * Validates the complete VibeCoding flow including:
 * - Code generation from natural language prompts
 * - Streaming progress indicators
 * - Apply/reject functionality
 * - Error handling
 * - Sequential requests
 */

test.describe('Mr. Blue VibeCoding - End to End', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  // Setup: Register and login before each test
  test.beforeEach(async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[Browser Error] ${msg.text()}`);
      }
    });

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
    await page.waitForURL('**/feed', { timeout: 10000 });
  });

  // Take screenshot on test failure
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      await takeScreenshot(page, `vibecoding-failure-${testInfo.title.replace(/\s+/g, '-')}`);
    }
  });

  test('User generates code → Views streaming progress → Applies changes', async ({ page }) => {
    console.log('[Test] Starting main VibeCoding flow test');
    
    // 1. Navigate to VibeCoding page
    await page.goto('/mr-blue/vibecoding');
    await expect(page.getByTestId('page-vibecoding')).toBeVisible({ timeout: 5000 });
    console.log('[Test] VibeCoding page loaded');

    // 2. Optionally select a file
    await page.getByTestId('file-client/src/App.tsx').click();
    await expect(page.getByTestId('badge-selected-file')).toBeVisible();
    console.log('[Test] File selected');

    // 3. Type a code change request
    const codePrompt = 'Add a new component that displays user statistics with a bar chart';
    await page.getByTestId('input-prompt').fill(codePrompt);
    console.log('[Test] Prompt entered:', codePrompt);

    // 4. Click generate and monitor the request
    const responsePromise = waitForApiResponse(page, '/api/mrblue/vibecode', 30000);
    await page.getByTestId('button-generate').click();
    
    // 5. Verify generating state
    await expect(page.getByTestId('button-generate')).toContainText(/Generating/i, { timeout: 2000 });
    console.log('[Test] Code generation started');

    // 6. Wait for generation to complete
    try {
      await responsePromise;
      console.log('[Test] API response received');
    } catch (error) {
      console.error('[Test] API request failed:', error);
      throw error;
    }

    // 7. Wait for toast notification
    await verifyToast(page, 'Code Generated');
    console.log('[Test] Generation complete toast shown');

    // 8. Verify generated code appears
    await expect(page.getByTestId('card-generated-code')).toBeVisible({ timeout: 5000 });
    console.log('[Test] Generated code card visible');

    // 9. Verify code is displayed in syntax highlighter
    const codeBlock = page.locator('pre, code').first();
    await expect(codeBlock).toBeVisible();
    const codeContent = await codeBlock.textContent();
    expect(codeContent).toBeTruthy();
    expect(codeContent!.length).toBeGreaterThan(10);
    console.log('[Test] Code content verified, length:', codeContent?.length);

    // 10. Click "Apply" button
    const applyButton = page.getByTestId('button-apply-code');
    await expect(applyButton).toBeVisible();
    await expect(applyButton).toBeEnabled();
    await applyButton.click();
    console.log('[Test] Apply button clicked');

    // 11. Verify success state
    await verifyToast(page, 'Code Applied');
    await expect(applyButton).toContainText(/Applied/i);
    await expect(applyButton).toBeDisabled();
    console.log('[Test] Code successfully applied');
  });

  test('should handle error when invalid request is made', async ({ page }) => {
    console.log('[Test] Starting error handling test');
    
    await page.goto('/mr-blue/vibecoding');
    await expect(page.getByTestId('page-vibecoding')).toBeVisible();

    // Try to generate without a prompt (should be disabled)
    const generateButton = page.getByTestId('button-generate');
    await expect(generateButton).toBeDisabled();
    console.log('[Test] Generate button properly disabled without prompt');

    // Enter an extremely short/invalid prompt
    await page.getByTestId('input-prompt').fill('x');
    await expect(generateButton).toBeEnabled();

    // Mock a failed API response
    await page.route('/api/mrblue/vibecode', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'AI service unavailable' })
      });
    });

    await generateButton.click();
    
    // Verify error handling
    await verifyToast(page, 'Failed to generate code');
    console.log('[Test] Error toast displayed correctly');

    // Verify no code card appears
    await expect(page.getByTestId('card-generated-code')).not.toBeVisible();
    console.log('[Test] Error handled gracefully - no code card shown');
  });

  test('should allow rejecting generated code', async ({ page }) => {
    console.log('[Test] Starting code rejection test');
    
    await page.goto('/mr-blue/vibecoding');
    
    // Generate code
    await page.getByTestId('input-prompt').fill('Create a simple button component');
    
    await page.route('/api/mrblue/vibecode', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'export function Button() { return <button>Click me</button>; }',
          language: 'typescript'
        })
      });
    });

    await page.getByTestId('button-generate').click();
    await expect(page.getByTestId('card-generated-code')).toBeVisible({ timeout: 10000 });
    console.log('[Test] Code generated');

    // Reject the code
    const rejectButton = page.getByTestId('button-reject-code');
    await expect(rejectButton).toBeVisible();
    await rejectButton.click();
    console.log('[Test] Reject button clicked');

    // Verify code card is removed
    await verifyToast(page, 'Code Rejected');
    await expect(page.getByTestId('card-generated-code')).not.toBeVisible({ timeout: 2000 });
    console.log('[Test] Code successfully rejected and removed');
  });

  test('should handle multiple sequential code generation requests', async ({ page }) => {
    console.log('[Test] Starting sequential requests test');
    
    await page.goto('/mr-blue/vibecoding');

    const prompts = [
      'Create a header component',
      'Add a footer component',
      'Create a navigation menu'
    ];

    // Mock successful responses for all requests
    let requestCount = 0;
    await page.route('/api/mrblue/vibecode', route => {
      requestCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: `// Generated code for request ${requestCount}\nfunction Component${requestCount}() { return null; }`,
          language: 'typescript'
        })
      });
    });

    for (let i = 0; i < prompts.length; i++) {
      console.log(`[Test] Processing request ${i + 1}/${prompts.length}: ${prompts[i]}`);
      
      // Enter prompt
      await page.getByTestId('input-prompt').fill(prompts[i]);
      
      // Generate
      await page.getByTestId('button-generate').click();
      
      // Wait for completion
      await expect(page.getByTestId('card-generated-code')).toBeVisible({ timeout: 15000 });
      
      // Apply the code
      await page.getByTestId('button-apply-code').click();
      await page.waitForTimeout(500); // Small delay between requests
      
      console.log(`[Test] Request ${i + 1} completed`);
    }

    // Verify iteration history shows all previous generations
    await expect(page.getByTestId('card-iteration-history')).toBeVisible();
    const historyHeader = page.getByText(`Iteration History (${prompts.length - 1})`);
    await expect(historyHeader).toBeVisible();
    console.log(`[Test] All ${prompts.length} requests completed successfully`);
  });

  test('should show proper UI states during generation', async ({ page }) => {
    console.log('[Test] Starting UI state validation test');
    
    await page.goto('/mr-blue/vibecoding');

    // Mock a delayed response to observe states
    await page.route('/api/mrblue/vibecode', async route => {
      await page.waitForTimeout(2000); // Simulate processing delay
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'function TestComponent() { return <div>Test</div>; }',
          language: 'typescript'
        })
      });
    });

    await page.getByTestId('input-prompt').fill('Test prompt');
    const generateButton = page.getByTestId('button-generate');
    
    // Initial state
    await expect(generateButton).toBeEnabled();
    await expect(generateButton).toContainText(/Generate Code/i);
    console.log('[Test] Initial button state verified');

    // Click and verify loading state
    await generateButton.click();
    
    // Button should show loading state
    await expect(generateButton).toBeDisabled({ timeout: 1000 });
    await expect(generateButton).toContainText(/Generating/i);
    console.log('[Test] Loading state verified');

    // Wait for completion
    await expect(page.getByTestId('card-generated-code')).toBeVisible({ timeout: 15000 });
    
    // Verify prompt is cleared
    const promptInput = page.getByTestId('input-prompt');
    const promptValue = await promptInput.inputValue();
    expect(promptValue).toBe('');
    console.log('[Test] Prompt cleared after generation');

    // Verify button returns to enabled state
    await expect(generateButton).toBeEnabled();
    await expect(generateButton).toContainText(/Generate Code/i);
    console.log('[Test] All UI states validated');
  });

  test('should display code with proper syntax highlighting', async ({ page }) => {
    console.log('[Test] Starting syntax highlighting test');
    
    await page.goto('/mr-blue/vibecoding');

    const mockCode = `import React from 'react';

export function UserStats() {
  const [data, setData] = React.useState([]);
  
  return (
    <div className="stats-container">
      <h2>User Statistics</h2>
      <BarChart data={data} />
    </div>
  );
}`;

    await page.route('/api/mrblue/vibecode', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: mockCode,
          language: 'typescript'
        })
      });
    });

    await page.getByTestId('input-prompt').fill('Create user stats component');
    await page.getByTestId('button-generate').click();
    
    await expect(page.getByTestId('card-generated-code')).toBeVisible({ timeout: 10000 });

    // Verify tabs are present
    await expect(page.getByTestId('tab-code')).toBeVisible();
    await expect(page.getByTestId('tab-prompt')).toBeVisible();
    console.log('[Test] Code/Prompt tabs visible');

    // Click on prompt tab
    await page.getByTestId('tab-prompt').click();
    await expect(page.getByText('Create user stats component')).toBeVisible();
    console.log('[Test] Prompt tab shows original prompt');

    // Switch back to code tab
    await page.getByTestId('tab-code').click();
    
    // Verify code content is displayed
    const codeElement = page.locator('pre, code').first();
    const displayedCode = await codeElement.textContent();
    expect(displayedCode).toContain('UserStats');
    expect(displayedCode).toContain('BarChart');
    console.log('[Test] Code properly displayed with syntax highlighting');
  });

  test('should maintain generation history', async ({ page }) => {
    console.log('[Test] Starting history persistence test');
    
    await page.goto('/mr-blue/vibecoding');

    // Mock responses
    await page.route('/api/mrblue/vibecode', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: `function Generated_${Date.now()}() { return null; }`,
          language: 'typescript'
        })
      });
    });

    // Generate first code
    await page.getByTestId('input-prompt').fill('First generation');
    await page.getByTestId('button-generate').click();
    await expect(page.getByTestId('card-generated-code')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('button-apply-code').click();
    console.log('[Test] First generation applied');

    // History should not be visible yet (only 1 item)
    await expect(page.getByTestId('card-iteration-history')).not.toBeVisible();

    // Generate second code
    await page.getByTestId('input-prompt').fill('Second generation');
    await page.getByTestId('button-generate').click();
    await expect(page.getByTestId('card-generated-code')).toBeVisible({ timeout: 10000 });
    console.log('[Test] Second generation complete');

    // History should now be visible (2+ items)
    await expect(page.getByTestId('card-iteration-history')).toBeVisible();
    
    // Verify first generation is in history
    await expect(page.getByText('First generation')).toBeVisible();
    console.log('[Test] History properly maintained and displayed');
  });

  test('should handle file selection correctly', async ({ page }) => {
    console.log('[Test] Starting file selection test');
    
    await page.goto('/mr-blue/vibecoding');
    await expect(page.getByTestId('page-vibecoding')).toBeVisible();

    // Verify file explorer is visible
    await expect(page.getByTestId('card-file-explorer')).toBeVisible();
    console.log('[Test] File explorer visible');

    // Select different files
    const files = [
      'client/src/App.tsx',
      'client/src/pages/HomePage.tsx',
      'server/routes.ts'
    ];

    for (const file of files) {
      await page.getByTestId(`file-${file}`).click();
      console.log(`[Test] Selected file: ${file}`);
      
      // Verify badge shows selected file
      const badge = page.getByTestId('badge-selected-file');
      await expect(badge).toBeVisible();
      await expect(badge).toContainText(file);
      console.log(`[Test] File badge updated correctly`);
    }
  });
});

test.describe('Mr. Blue VibeCoding - Advanced Edge Cases', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
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
    await page.waitForURL('**/feed', { timeout: 10000 });
  });

  test('should prevent duplicate submissions', async ({ page }) => {
    console.log('[Test] Starting duplicate submission prevention test');
    
    await page.goto('/mr-blue/vibecoding');

    // Mock slow response
    let requestsReceived = 0;
    await page.route('/api/mrblue/vibecode', async route => {
      requestsReceived++;
      console.log(`[Test] API received request #${requestsReceived}`);
      await page.waitForTimeout(3000);
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'function Test() {}',
          language: 'typescript'
        })
      });
    });

    await page.getByTestId('input-prompt').fill('Test prompt');
    
    // Click generate button
    const generateButton = page.getByTestId('button-generate');
    await generateButton.click();

    // Try to click again while processing
    await expect(generateButton).toBeDisabled({ timeout: 1000 });
    console.log('[Test] Button disabled during processing');

    // Attempt to click multiple times (should not register)
    await generateButton.click({ force: true }).catch(() => {}); // Expect this to fail
    await generateButton.click({ force: true }).catch(() => {});
    
    // Wait for completion
    await expect(page.getByTestId('card-generated-code')).toBeVisible({ timeout: 15000 });
    
    // Verify only one request was made
    expect(requestsReceived).toBe(1);
    console.log('[Test] Duplicate submissions successfully prevented');
  });

  test('should handle very long code outputs', async ({ page }) => {
    console.log('[Test] Starting long code output test');
    
    await page.goto('/mr-blue/vibecoding');

    // Generate very long code
    const longCode = Array(200)
      .fill(0)
      .map((_, i) => `function Component${i}() { return <div>Component ${i}</div>; }`)
      .join('\n\n');

    await page.route('/api/mrblue/vibecode', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: longCode,
          language: 'typescript'
        })
      });
    });

    await page.getByTestId('input-prompt').fill('Generate many components');
    await page.getByTestId('button-generate').click();
    
    await expect(page.getByTestId('card-generated-code')).toBeVisible({ timeout: 10000 });
    
    // Verify code is scrollable and properly rendered
    const codeElement = page.locator('pre, code').first();
    await expect(codeElement).toBeVisible();
    
    const content = await codeElement.textContent();
    expect(content).toContain('Component0');
    expect(content).toContain('Component199');
    console.log('[Test] Long code output handled correctly');
  });
});
