/**
 * Mr Blue Messenger Service
 * Facebook Messenger Platform integration for two-way messaging
 * 
 * Features:
 * - Connect Facebook pages
 * - Send/receive messages via webhook
 * - Message templates and typing indicators
 * - Read receipts
 * - Conversation management
 * 
 * Facebook Graph API v18.0
 */

import crypto from 'crypto';
import { db } from '@shared/db';
import { messengerConnections, messengerMessages } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface FacebookPageConnection {
  pageId: string;
  pageName: string;
  accessToken: string;
  userId: number;
}

export interface MessengerMessage {
  senderId: string;
  recipientId: string;
  message: string;
  messageType?: string;
}

export interface WebhookEntry {
  id: string;
  time: number;
  messaging: Array<{
    sender: { id: string };
    recipient: { id: string };
    timestamp: number;
    message?: {
      mid: string;
      text: string;
      quick_reply?: any;
      attachments?: any[];
    };
    delivery?: any;
    read?: any;
  }>;
}

export class MessengerService {
  private verifyToken: string;

  constructor() {
    // Use environment variable or generate a secure verify token
    this.verifyToken = process.env.MESSENGER_VERIFY_TOKEN || this.generateVerifyToken();
    if (!process.env.MESSENGER_VERIFY_TOKEN) {
      console.log('[MessengerService] Generated verify token:', this.verifyToken);
      console.log('[MessengerService] Set MESSENGER_VERIFY_TOKEN environment variable for production');
    }
  }

  /**
   * Generate a secure verify token for webhook setup
   */
  private generateVerifyToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt access token before storing in database
   */
  private encryptAccessToken(token: string): string {
    const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt access token when retrieving from database
   */
  private decryptAccessToken(encryptedToken: string): string {
    const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Verify webhook challenge from Facebook
   * Used during webhook setup
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      console.log('[MessengerService] Webhook verified successfully');
      return challenge;
    }
    console.warn('[MessengerService] Webhook verification failed');
    return null;
  }

  /**
   * Connect a Facebook page to Mr Blue
   */
  async connectPage(connection: FacebookPageConnection): Promise<{ success: boolean; connectionId?: number; error?: string }> {
    try {
      console.log(`[MessengerService] Connecting page ${connection.pageName} (${connection.pageId})`);

      // Verify access token is valid
      const isValid = await this.verifyAccessToken(connection.accessToken, connection.pageId);
      if (!isValid) {
        return { success: false, error: 'Invalid access token or page ID' };
      }

      // Encrypt access token
      const encryptedToken = this.encryptAccessToken(connection.accessToken);

      // Check if connection already exists
      const existing = await db.query.messengerConnections.findFirst({
        where: and(
          eq(messengerConnections.userId, connection.userId),
          eq(messengerConnections.pageId, connection.pageId)
        ),
      });

      let connectionId: number;

      if (existing) {
        // Update existing connection
        await db.update(messengerConnections)
          .set({
            accessToken: encryptedToken,
            pageName: connection.pageName,
            isActive: true,
            lastSyncAt: new Date(),
          })
          .where(eq(messengerConnections.id, existing.id));
        connectionId = existing.id;
        console.log(`[MessengerService] Updated existing connection ${connectionId}`);
      } else {
        // Create new connection
        const [newConnection] = await db.insert(messengerConnections)
          .values({
            userId: connection.userId,
            pageId: connection.pageId,
            pageName: connection.pageName,
            accessToken: encryptedToken,
            isActive: true,
          })
          .returning();
        connectionId = newConnection.id;
        console.log(`[MessengerService] Created new connection ${connectionId}`);
      }

      // Subscribe to webhook events
      await this.subscribeWebhook(connection.pageId, connection.accessToken);

      return { success: true, connectionId };
    } catch (error) {
      console.error('[MessengerService] Failed to connect page:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Verify access token with Facebook API
   */
  private async verifyAccessToken(accessToken: string, pageId: string): Promise<boolean> {
    try {
      const response = await fetch(`${GRAPH_API_BASE}/${pageId}?access_token=${accessToken}`);
      return response.ok;
    } catch (error) {
      console.error('[MessengerService] Token verification failed:', error);
      return false;
    }
  }

  /**
   * Subscribe page to webhook events
   */
  async subscribeWebhook(pageId: string, accessToken: string): Promise<boolean> {
    try {
      console.log(`[MessengerService] Subscribing page ${pageId} to webhook`);
      
      const response = await fetch(
        `${GRAPH_API_BASE}/${pageId}/subscribed_apps`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscribed_fields: ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads'],
            access_token: accessToken,
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log(`[MessengerService] Webhook subscription successful for page ${pageId}`);
        return true;
      } else {
        console.error('[MessengerService] Webhook subscription failed:', data);
        return false;
      }
    } catch (error) {
      console.error('[MessengerService] Failed to subscribe webhook:', error);
      return false;
    }
  }

  /**
   * Send message to a user via Messenger
   */
  async sendMessage(
    connectionId: number,
    recipientId: string,
    message: string,
    messageType: string = 'text'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Get connection with decrypted token
      const connection = await db.query.messengerConnections.findFirst({
        where: eq(messengerConnections.id, connectionId),
      });

      if (!connection || !connection.isActive) {
        return { success: false, error: 'Connection not found or inactive' };
      }

      const accessToken = this.decryptAccessToken(connection.accessToken);

      // Send typing indicator
      await this.sendTypingIndicator(connection.pageId, recipientId, accessToken, true);

      // Send message via Facebook API
      const response = await fetch(
        `${GRAPH_API_BASE}/me/messages?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: message },
            messaging_type: 'RESPONSE',
          }),
        }
      );

      const data = await response.json();

      if (data.message_id) {
        // Store message in database
        await db.insert(messengerMessages).values({
          connectionId,
          conversationId: recipientId,
          senderId: connection.pageId,
          recipientId,
          message,
          messageType,
        });

        // Turn off typing indicator
        await this.sendTypingIndicator(connection.pageId, recipientId, accessToken, false);

        console.log(`[MessengerService] Message sent: ${data.message_id}`);
        return { success: true, messageId: data.message_id };
      } else {
        console.error('[MessengerService] Failed to send message:', data);
        return { success: false, error: data.error?.message || 'Failed to send message' };
      }
    } catch (error) {
      console.error('[MessengerService] Error sending message:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send typing indicator
   */
  private async sendTypingIndicator(
    pageId: string,
    recipientId: string,
    accessToken: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      await fetch(
        `${GRAPH_API_BASE}/me/messages?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: recipientId },
            sender_action: isTyping ? 'typing_on' : 'typing_off',
          }),
        }
      );
    } catch (error) {
      console.warn('[MessengerService] Failed to send typing indicator:', error);
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(connectionId: number, senderId: string): Promise<boolean> {
    try {
      const connection = await db.query.messengerConnections.findFirst({
        where: eq(messengerConnections.id, connectionId),
      });

      if (!connection) return false;

      const accessToken = this.decryptAccessToken(connection.accessToken);

      await fetch(
        `${GRAPH_API_BASE}/me/messages?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: senderId },
            sender_action: 'mark_seen',
          }),
        }
      );

      return true;
    } catch (error) {
      console.error('[MessengerService] Failed to mark as read:', error);
      return false;
    }
  }

  /**
   * Handle incoming webhook data
   */
  async handleIncomingMessage(webhookData: { object: string; entry: WebhookEntry[] }): Promise<{
    success: boolean;
    processedCount: number;
    aiResponses?: Array<{ recipientId: string; message: string }>;
  }> {
    try {
      if (webhookData.object !== 'page') {
        return { success: false, processedCount: 0 };
      }

      let processedCount = 0;
      const aiResponses: Array<{ recipientId: string; message: string }> = [];

      for (const entry of webhookData.entry) {
        const pageId = entry.id;

        // Get connection for this page
        const connection = await db.query.messengerConnections.findFirst({
          where: and(
            eq(messengerConnections.pageId, pageId),
            eq(messengerConnections.isActive, true)
          ),
        });

        if (!connection) {
          console.warn(`[MessengerService] No active connection found for page ${pageId}`);
          continue;
        }

        for (const event of entry.messaging) {
          if (event.message && event.message.text) {
            // Store incoming message
            await db.insert(messengerMessages).values({
              connectionId: connection.id,
              conversationId: event.sender.id,
              senderId: event.sender.id,
              recipientId: pageId,
              message: event.message.text,
              messageType: 'text',
            });

            // Mark as read
            await this.markAsRead(connection.id, event.sender.id);

            console.log(`[MessengerService] Received message from ${event.sender.id}: ${event.message.text}`);
            
            // Queue for AI response (this will be handled by the API route)
            aiResponses.push({
              recipientId: event.sender.id,
              message: event.message.text,
            });

            processedCount++;
          } else if (event.delivery) {
            // Update message delivery status
            console.log(`[MessengerService] Message delivered to ${event.recipient.id}`);
          } else if (event.read) {
            // Update message read status
            console.log(`[MessengerService] Message read by ${event.sender.id}`);
          }
        }
      }

      return { success: true, processedCount, aiResponses };
    } catch (error) {
      console.error('[MessengerService] Error handling webhook:', error);
      return { success: false, processedCount: 0 };
    }
  }

  /**
   * Get all conversations for a page
   */
  async getConversations(connectionId: number, limit: number = 20): Promise<{
    success: boolean;
    conversations?: Array<{
      conversationId: string;
      lastMessage: string;
      lastMessageAt: Date;
      unreadCount: number;
    }>;
    error?: string;
  }> {
    try {
      const messages = await db.query.messengerMessages.findMany({
        where: eq(messengerMessages.connectionId, connectionId),
        orderBy: [desc(messengerMessages.sentAt)],
        limit: limit * 2, // Get more to group by conversation
      });

      // Group messages by conversation
      const conversationMap = new Map<string, {
        conversationId: string;
        lastMessage: string;
        lastMessageAt: Date;
        unreadCount: number;
      }>();

      for (const msg of messages) {
        if (!conversationMap.has(msg.conversationId)) {
          conversationMap.set(msg.conversationId, {
            conversationId: msg.conversationId,
            lastMessage: msg.message,
            lastMessageAt: msg.sentAt,
            unreadCount: msg.readAt ? 0 : 1,
          });
        } else {
          const conv = conversationMap.get(msg.conversationId)!;
          if (!msg.readAt) conv.unreadCount++;
        }
      }

      const conversations = Array.from(conversationMap.values()).slice(0, limit);

      return { success: true, conversations };
    } catch (error) {
      console.error('[MessengerService] Error fetching conversations:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send an invite message to a specific user (e.g., @sboddye)
   */
  async sendInvite(
    connectionId: number,
    userFacebookId: string,
    inviteMessage: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log(`[MessengerService] Sending invite to ${userFacebookId}`);
    return await this.sendMessage(connectionId, userFacebookId, inviteMessage, 'invite');
  }

  /**
   * Disconnect a Facebook page
   */
  async disconnectPage(connectionId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await db.update(messengerConnections)
        .set({ isActive: false })
        .where(eq(messengerConnections.id, connectionId));

      console.log(`[MessengerService] Disconnected page connection ${connectionId}`);
      return { success: true };
    } catch (error) {
      console.error('[MessengerService] Failed to disconnect page:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get connection by user ID
   */
  async getConnectionByUserId(userId: number): Promise<any> {
    return await db.query.messengerConnections.findFirst({
      where: and(
        eq(messengerConnections.userId, userId),
        eq(messengerConnections.isActive, true)
      ),
    });
  }

  /**
   * Get verify token for webhook setup
   */
  getVerifyToken(): string {
    return this.verifyToken;
  }

  /**
   * Get conversation message history
   */
  async getConversationMessages(
    connectionId: number,
    conversationId: string,
    limit: number = 50
  ): Promise<{
    success: boolean;
    messages?: Array<{
      id: number;
      senderId: string;
      recipientId: string;
      message: string;
      messageType: string;
      sentAt: Date;
      readAt: Date | null;
      isFromPage: boolean;
    }>;
    error?: string;
  }> {
    try {
      const connection = await db.query.messengerConnections.findFirst({
        where: eq(messengerConnections.id, connectionId),
      });

      if (!connection) {
        return { success: false, error: 'Connection not found' };
      }

      const messages = await db.query.messengerMessages.findMany({
        where: and(
          eq(messengerMessages.connectionId, connectionId),
          eq(messengerMessages.conversationId, conversationId)
        ),
        orderBy: [desc(messengerMessages.sentAt)],
        limit,
      });

      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        recipientId: msg.recipientId,
        message: msg.message,
        messageType: msg.messageType,
        sentAt: msg.sentAt,
        readAt: msg.readAt,
        isFromPage: msg.senderId === connection.pageId,
      })).reverse(); // Reverse to show oldest first

      return { success: true, messages: formattedMessages };
    } catch (error) {
      console.error('[MessengerService] Error fetching conversation messages:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get Facebook contacts/friends via Graph API
   */
  async getContacts(connectionId: number): Promise<{
    success: boolean;
    contacts?: Array<{
      id: string;
      name: string;
      profilePic?: string;
    }>;
    error?: string;
  }> {
    try {
      const connection = await db.query.messengerConnections.findFirst({
        where: eq(messengerConnections.id, connectionId),
      });

      if (!connection || !connection.isActive) {
        return { success: false, error: 'Connection not found or inactive' };
      }

      const accessToken = this.decryptAccessToken(connection.accessToken);

      // Fetch conversations to get PSIDs of people who have messaged the page
      const response = await fetch(
        `${GRAPH_API_BASE}/${connection.pageId}/conversations?fields=participants,updated_time&access_token=${accessToken}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: this.handleFacebookError(errorData) 
        };
      }

      const data = await response.json();
      
      const contacts: Array<{ id: string; name: string; profilePic?: string }> = [];
      
      if (data.data && Array.isArray(data.data)) {
        for (const conversation of data.data) {
          if (conversation.participants?.data) {
            for (const participant of conversation.participants.data) {
              // Skip the page itself
              if (participant.id === connection.pageId) continue;

              // Fetch user details
              const userResponse = await fetch(
                `${GRAPH_API_BASE}/${participant.id}?fields=name,profile_pic&access_token=${accessToken}`
              );

              if (userResponse.ok) {
                const userData = await userResponse.json();
                contacts.push({
                  id: participant.id,
                  name: userData.name || participant.id,
                  profilePic: userData.profile_pic || undefined,
                });
              } else {
                // Fallback if we can't get user details
                contacts.push({
                  id: participant.id,
                  name: participant.name || participant.id,
                });
              }
            }
          }
        }
      }

      // Remove duplicates based on ID
      const uniqueContacts = Array.from(
        new Map(contacts.map(c => [c.id, c])).values()
      );

      return { success: true, contacts: uniqueContacts };
    } catch (error) {
      console.error('[MessengerService] Error fetching contacts:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send message with template (quick replies, buttons, generic template)
   */
  async sendMessageWithTemplate(
    connectionId: number,
    recipientId: string,
    messagePayload: {
      text?: string;
      quickReplies?: Array<{ title: string; payload: string }>;
      buttons?: Array<{ type: string; title: string; url?: string; payload?: string }>;
      attachment?: any;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const connection = await db.query.messengerConnections.findFirst({
        where: eq(messengerConnections.id, connectionId),
      });

      if (!connection || !connection.isActive) {
        return { success: false, error: 'Connection not found or inactive' };
      }

      const accessToken = this.decryptAccessToken(connection.accessToken);

      // Send typing indicator
      await this.sendTypingIndicator(connection.pageId, recipientId, accessToken, true);

      // Build message object
      const messageBody: any = {
        recipient: { id: recipientId },
        messaging_type: 'RESPONSE',
      };

      if (messagePayload.attachment) {
        messageBody.message = { attachment: messagePayload.attachment };
      } else if (messagePayload.text) {
        messageBody.message = { text: messagePayload.text };
        
        // Add quick replies if provided
        if (messagePayload.quickReplies && messagePayload.quickReplies.length > 0) {
          messageBody.message.quick_replies = messagePayload.quickReplies.map(qr => ({
            content_type: 'text',
            title: qr.title,
            payload: qr.payload,
          }));
        }
        
        // Add buttons if provided
        if (messagePayload.buttons && messagePayload.buttons.length > 0) {
          messageBody.message = {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'button',
                text: messagePayload.text,
                buttons: messagePayload.buttons.map(btn => {
                  if (btn.type === 'web_url') {
                    return {
                      type: 'web_url',
                      url: btn.url,
                      title: btn.title,
                    };
                  } else {
                    return {
                      type: 'postback',
                      title: btn.title,
                      payload: btn.payload,
                    };
                  }
                }),
              },
            },
          };
        }
      }

      const response = await fetch(
        `${GRAPH_API_BASE}/me/messages?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: this.handleFacebookError(data) 
        };
      }

      if (data.message_id) {
        // Store message in database
        await db.insert(messengerMessages).values({
          connectionId,
          conversationId: recipientId,
          senderId: connection.pageId,
          recipientId,
          message: messagePayload.text || '[Template Message]',
          messageType: messagePayload.buttons ? 'button_template' : messagePayload.quickReplies ? 'quick_reply' : 'text',
        });

        // Turn off typing indicator
        await this.sendTypingIndicator(connection.pageId, recipientId, accessToken, false);

        console.log(`[MessengerService] Template message sent: ${data.message_id}`);
        return { success: true, messageId: data.message_id };
      } else {
        return { success: false, error: data.error?.message || 'Failed to send message' };
      }
    } catch (error) {
      console.error('[MessengerService] Error sending template message:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Handle Facebook API errors with user-friendly messages
   */
  private handleFacebookError(errorData: any): string {
    if (!errorData.error) {
      return 'Unknown Facebook API error';
    }

    const { code, message, error_subcode } = errorData.error;

    // Rate limiting
    if (code === 4 || code === 17 || code === 32 || code === 613) {
      return 'Rate limit exceeded. Please wait a few minutes and try again.';
    }

    // Invalid PSID
    if (code === 551 || error_subcode === 2018065) {
      return 'Invalid recipient ID (PSID). This user may not have messaged your page yet.';
    }

    // OAuth/Token errors
    if (code === 190) {
      if (error_subcode === 463) {
        return 'Access token has expired. Please reconnect your Facebook page.';
      } else if (error_subcode === 467) {
        return 'Access token has been invalidated. Please reconnect your Facebook page.';
      } else {
        return 'Invalid access token. Please reconnect your Facebook page.';
      }
    }

    // Permission errors
    if (code === 10 || code === 200) {
      return 'Permission denied. Please ensure your page has the necessary permissions.';
    }

    // User opted out
    if (code === 551 && message.includes('opt')) {
      return 'This user has opted out of messages from your page.';
    }

    // Generic error with message
    return message || 'Facebook API error occurred';
  }
}

export const messengerService = new MessengerService();
