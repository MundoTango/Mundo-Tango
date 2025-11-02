/**
 * MR BLUE CHAT PAGE OBJECT MODEL
 * Handles Mr Blue AI chat interface
 */

import { Page, Locator } from '@playwright/test';

export class MrBlueChatPage {
  readonly page: Page;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly messagesContainer: Locator;
  readonly clearChatButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chatInput = page.getByTestId('input-mr-blue-chat');
    this.sendButton = page.getByTestId('button-send-message');
    this.messagesContainer = page.getByTestId('container-chat-messages');
    this.clearChatButton = page.getByTestId('button-clear-chat');
  }

  /**
   * Navigate to Mr Blue chat page
   */
  async goto(): Promise<void> {
    await this.page.goto('/mr-blue-chat');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Send message to Mr Blue
   */
  async sendMessage(message: string): Promise<void> {
    await this.chatInput.fill(message);
    await this.sendButton.click();
    await this.page.waitForTimeout(1000); // Wait for AI response
  }

  /**
   * Clear chat history
   */
  async clearChat(): Promise<void> {
    await this.clearChatButton.click();
  }

  /**
   * Get last message
   */
  async getLastMessage(): Promise<string> {
    const messages = this.page.locator('[data-testid^="message-"]');
    const count = await messages.count();
    if (count > 0) {
      const lastMessage = messages.nth(count - 1);
      return await lastMessage.textContent() || '';
    }
    return '';
  }
}
