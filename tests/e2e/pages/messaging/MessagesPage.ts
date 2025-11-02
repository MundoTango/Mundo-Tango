/**
 * MESSAGES PAGE OBJECT MODEL
 * Handles messaging functionality
 */

import { Page, Locator } from '@playwright/test';

export class MessagesPage {
  readonly page: Page;
  readonly conversationList: Locator;
  readonly newMessageButton: Locator;
  readonly searchInput: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly messagesContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.conversationList = page.getByTestId('list-conversations');
    this.newMessageButton = page.getByTestId('button-new-message');
    this.searchInput = page.getByTestId('input-search-messages');
    this.messageInput = page.getByTestId('input-message');
    this.sendButton = page.getByTestId('button-send');
    this.messagesContainer = page.getByTestId('container-messages');
  }

  /**
   * Navigate to messages page
   */
  async goto(): Promise<void> {
    await this.page.goto('/messages');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Start new conversation
   */
  async startNewConversation(): Promise<void> {
    await this.newMessageButton.click();
  }

  /**
   * Search messages
   */
  async searchMessages(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  /**
   * Send a message
   */
  async sendMessage(content: string): Promise<void> {
    await this.messageInput.fill(content);
    await this.sendButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Select conversation by index
   */
  async selectConversation(index: number): Promise<void> {
    const conversation = this.page.getByTestId(`conversation-${index}`);
    await conversation.click();
  }
}
