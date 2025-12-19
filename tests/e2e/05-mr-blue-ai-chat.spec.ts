import { test, expect } from '@playwright/test';
import { generateTestUser } from './fixtures/test-data';

test.describe('Mr Blue AI Chat Journey', () => {
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

  test('should open Mr Blue AI chat', async ({ page }) => {
    // Click Mr Blue chat button
    await page.getByTestId('button-mr-blue-chat').click();
    
    // Verify chat interface
    await expect(page.getByTestId('mr-blue-chat-container')).toBeVisible();
    await expect(page.getByTestId('mr-blue-welcome-message')).toBeVisible();
    await expect(page.getByTestId('input-mr-blue-message')).toBeVisible();
  });

  test('should send message and receive AI response', async ({ page }) => {
    // Open chat
    await page.getByTestId('button-mr-blue-chat').click();
    await page.waitForTimeout(500);
    
    // Send message
    const userMessage = 'What are the best tango events this week?';
    await page.getByTestId('input-mr-blue-message').fill(userMessage);
    await page.getByTestId('button-send-mr-blue-message').click();
    
    // Verify user message appears
    await expect(page.getByText(userMessage)).toBeVisible();
    
    // Wait for AI response (streaming)
    await expect(page.getByTestId('mr-blue-response').last()).toBeVisible({ timeout: 15000 });
    
    // Verify response contains content
    const response = page.getByTestId('mr-blue-response').last();
    await expect(response).not.toBeEmpty();
  });

  test('should handle multi-turn conversation', async ({ page }) => {
    await page.getByTestId('button-mr-blue-chat').click();
    
    // First message
    await page.getByTestId('input-mr-blue-message').fill('Tell me about tango');
    await page.getByTestId('button-send-mr-blue-message').click();
    await page.waitForTimeout(2000);
    
    // Second message
    await page.getByTestId('input-mr-blue-message').fill('Where can I learn it?');
    await page.getByTestId('button-send-mr-blue-message').click();
    await page.waitForTimeout(2000);
    
    // Verify conversation history
    const messages = page.getByTestId('chat-message');
    await expect(messages).toHaveCount({ min: 4 }); // 2 user + 2 AI messages
  });

  test('should show typing indicator while AI responds', async ({ page }) => {
    await page.getByTestId('button-mr-blue-chat').click();
    
    await page.getByTestId('input-mr-blue-message').fill('Hello Mr Blue');
    await page.getByTestId('button-send-mr-blue-message').click();
    
    // Verify typing indicator appears
    await expect(page.getByTestId('mr-blue-typing-indicator')).toBeVisible({ timeout: 2000 });
  });

  test('should persist chat history', async ({ page }) => {
    // Send a message
    await page.getByTestId('button-mr-blue-chat').click();
    const testMessage = 'Remember this message';
    await page.getByTestId('input-mr-blue-message').fill(testMessage);
    await page.getByTestId('button-send-mr-blue-message').click();
    await page.waitForTimeout(2000);
    
    // Close and reopen chat
    await page.getByTestId('button-close-mr-blue').click();
    await page.waitForTimeout(500);
    await page.getByTestId('button-mr-blue-chat').click();
    
    // Verify message is still there
    await expect(page.getByText(testMessage)).toBeVisible();
  });
});
