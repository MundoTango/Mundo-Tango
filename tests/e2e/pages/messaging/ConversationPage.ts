/**
 * CONVERSATION PAGE OBJECT MODEL
 * Handles individual conversation details
 */

import { Page, Locator } from '@playwright/test';

export class ConversationPage {
  readonly page: Page;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly messagesContainer: Locator;
  readonly participantName: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.messageInput = page.getByTestId('input-message');
    this.sendButton = page.getByTestId('button-send-message');
    this.messagesContainer = page.getByTestId('container-messages');
    this.participantName = page.getByTestId('text-participant-name');
    this.backButton = page.getByTestId('button-back');
  }

  /**
   * Navigate to conversation
   */
  async goto(conversationId: number): Promise<void> {
    await this.page.goto(`/messages/${conversationId}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Send message in conversation
   */
  async sendMessage(content: string): Promise<void> {
    await this.messageInput.fill(content);
    await this.sendButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Go back to messages list
   */
  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  /**
   * Get participant name
   */
  async getParticipantName(): Promise<string> {
    return await this.participantName.textContent() || '';
  }
}
