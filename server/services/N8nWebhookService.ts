import { OpenAIService } from './OpenAIService';
import { db } from '@shared/db';
import { socialMessages } from '@shared/schema';

export interface IncomingMessage {
  platform: 'whatsapp' | 'telegram' | 'slack' | 'messenger' | 'instagram';
  externalUserId: string;
  userName: string;
  userProfileUrl?: string;
  messageText: string;
  messageType: 'text' | 'image' | 'voice' | 'file';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface OutgoingMessage {
  platform: string;
  recipientId: string;
  text: string;
  isAiGenerated: boolean;
  sentiment?: string;
  confidence?: number;
}

export interface N8nWebhookPayload {
  workflow: string;
  platform: string;
  event: 'message_received' | 'message_sent' | 'user_joined' | 'reaction';
  data: IncomingMessage;
  n8nExecutionId?: string;
}

export class N8nWebhookService {
  private n8nWebhookUrl: string | null;
  private webhookSecret: string | null;

  constructor() {
    this.n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || null;
    this.webhookSecret = process.env.N8N_WEBHOOK_SECRET || null;
  }

  async processIncomingMessage(payload: N8nWebhookPayload): Promise<OutgoingMessage | null> {
    const { platform, data } = payload;
    
    console.log(`[N8n] Processing ${platform} message from ${data.userName}`);
    
    await this.storeMessage(data);
    
    const sentiment = await this.analyzeSentiment(data.messageText);
    
    const aiResponse = await this.generateAIResponse(data, sentiment);
    
    if (aiResponse) {
      const outgoing: OutgoingMessage = {
        platform,
        recipientId: data.externalUserId,
        text: aiResponse.text,
        isAiGenerated: true,
        sentiment: sentiment.sentiment,
        confidence: aiResponse.confidence
      };
      
      await this.sendToN8n(outgoing);
      
      return outgoing;
    }
    
    return null;
  }

  private async storeMessage(message: IncomingMessage): Promise<void> {
    try {
      await db.insert(socialMessages).values({
        userId: 1,
        platform: message.platform,
        friendName: message.userName,
        friendProfileUrl: message.userProfileUrl || null,
        messageText: message.messageText,
        interactionType: message.messageType,
        timestamp: message.timestamp,
        sentiment: null,
        metadata: message.metadata as any,
        createdAt: new Date()
      });
      console.log(`[N8n] Stored message from ${message.userName}`);
    } catch (error) {
      console.error('[N8n] Failed to store message:', error);
    }
  }

  private async analyzeSentiment(text: string): Promise<{ sentiment: string; score: number }> {
    try {
      const response = await OpenAIService.query({
        prompt: `Analyze the sentiment of this message and respond with only a JSON object: {"sentiment": "positive|neutral|negative", "score": 0.0-1.0}

Message: "${text}"`,
        model: 'gpt-4o-mini',
        systemPrompt: 'You are a sentiment analysis expert. Respond only with valid JSON.',
        temperature: 0.3,
        maxTokens: 100
      });
      
      const result = JSON.parse(response.content);
      return { sentiment: result.sentiment, score: result.score };
    } catch {
      return { sentiment: 'neutral', score: 0.5 };
    }
  }

  private async generateAIResponse(
    message: IncomingMessage, 
    sentiment: { sentiment: string; score: number }
  ): Promise<{ text: string; confidence: number } | null> {
    const tangoContext = `You are Mr. Blue, a friendly AI assistant for Mundo Tango - a global tango community platform.
You help dancers with:
- Finding tango events, milongas, and workshops
- Connecting with teachers and dance partners
- Tango etiquette and dance tips
- Community recommendations

Respond warmly and helpfully. Keep responses concise (1-2 sentences for simple queries).
If asked about specific events or users, mention they can check the Mundo Tango app for details.`;

    try {
      const response = await OpenAIService.query({
        prompt: `User "${message.userName}" on ${message.platform} says: "${message.messageText}"

Sentiment: ${sentiment.sentiment} (${(sentiment.score * 100).toFixed(0)}% confidence)

Respond naturally and helpfully:`,
        model: 'gpt-4o-mini',
        systemPrompt: tangoContext,
        temperature: 0.7,
        maxTokens: 300
      });

      return {
        text: response.content,
        confidence: sentiment.score
      };
    } catch (error) {
      console.error('[N8n] AI response generation failed:', error);
      return null;
    }
  }

  private async sendToN8n(message: OutgoingMessage): Promise<boolean> {
    if (!this.n8nWebhookUrl) {
      console.log('[N8n] No webhook URL configured, skipping send');
      return false;
    }

    try {
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.webhookSecret && { 'X-Webhook-Secret': this.webhookSecret })
        },
        body: JSON.stringify({
          action: 'send_message',
          ...message
        })
      });

      if (!response.ok) {
        throw new Error(`n8n webhook returned ${response.status}`);
      }

      console.log(`[N8n] Sent response to ${message.platform}:${message.recipientId}`);
      return true;
    } catch (error) {
      console.error('[N8n] Failed to send to webhook:', error);
      return false;
    }
  }

  verifyWebhookSignature(signature: string, payload: string): boolean {
    if (!this.webhookSecret) {
      console.error('[N8n] SECURITY ERROR: N8N_WEBHOOK_SECRET not configured - rejecting request');
      return false; // ✅ Reject requests without secret
    }
    
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  getStatus(): { configured: boolean; platforms: string[] } {
    return {
      configured: !!this.n8nWebhookUrl,
      platforms: ['whatsapp', 'telegram', 'slack', 'messenger', 'instagram']
    };
  }
}

export const n8nWebhookService = new N8nWebhookService();
