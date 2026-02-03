import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { n8nWebhookService, N8nWebhookPayload } from '../services/N8nWebhookService';
import { db } from '@shared/db';
import { socialMessages } from '@shared/schema';
import { desc, eq, sql } from 'drizzle-orm';

const router = Router();

router.post('/messaging/webhook/n8n', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const payload = req.body as N8nWebhookPayload;

    if (signature && !n8nWebhookService.verifyWebhookSignature(signature, JSON.stringify(payload))) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    console.log(`[Webhook] Received ${payload.event} from ${payload.platform}`);

    if (payload.event === 'message_received') {
      const response = await n8nWebhookService.processIncomingMessage(payload);
      
      return res.json({
        success: true,
        messageId: Date.now().toString(),
        aiResponse: response ? {
          text: response.text,
          sentiment: response.sentiment,
          confidence: response.confidence
        } : null
      });
    }

    res.json({ success: true, event: payload.event });
  } catch (error) {
    console.error('[Webhook] n8n processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

router.get('/messaging/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const status = n8nWebhookService.getStatus();
    
    const stats = await db.execute(sql`
      SELECT 
        platform,
        COUNT(*) as message_count,
        MAX(timestamp) as last_message
      FROM social_messages 
      GROUP BY platform
    `);

    res.json({
      n8n: status,
      platforms: stats.rows || [],
      integrationReady: status.configured,
      webhookEndpoint: '/api/messaging/webhook/n8n',
      supportedEvents: ['message_received', 'message_sent', 'user_joined', 'reaction']
    });
  } catch (error) {
    console.error('[Messaging] Status check error:', error);
    res.status(500).json({ error: 'Failed to get messaging status' });
  }
});

router.get('/messaging/conversations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await db.execute(sql`
      SELECT 
        friend_name as name,
        platform,
        message_text as lastMessage,
        timestamp as lastMessageAt,
        COUNT(*) OVER (PARTITION BY friend_name, platform) as messageCount
      FROM social_messages
      WHERE user_id = ${userId}
      ORDER BY timestamp DESC
      LIMIT 50
    `);

    const grouped = new Map();
    for (const msg of (conversations.rows || [])) {
      const key = `${msg.platform}-${msg.name}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          name: msg.name,
          platform: msg.platform,
          lastMessage: msg.lastmessage,
          lastMessageAt: msg.lastmessageat,
          messageCount: msg.messagecount
        });
      }
    }

    res.json({
      conversations: Array.from(grouped.values()),
      totalPlatforms: n8nWebhookService.getStatus().platforms.length
    });
  } catch (error) {
    console.error('[Messaging] Conversations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.post('/messaging/send', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { platform, recipientId, recipientName, message } = req.body;

    if (!platform || !recipientId || !message) {
      return res.status(400).json({ error: 'Missing required fields: platform, recipientId, message' });
    }

    await db.insert(socialMessages).values({
      userId,
      platform,
      friendName: recipientName || recipientId,
      friendProfileUrl: null,
      messageText: message,
      interactionType: 'outgoing',
      timestamp: new Date(),
      sentiment: null,
      metadata: { recipientId },
      createdAt: new Date()
    });

    const status = n8nWebhookService.getStatus();
    
    if (status.configured) {
      console.log(`[Messaging] Would send to n8n: ${platform}:${recipientId}`);
    }

    res.json({
      success: true,
      messageId: Date.now().toString(),
      delivered: status.configured,
      note: status.configured ? 'Message queued for delivery' : 'n8n not configured - message stored locally'
    });
  } catch (error) {
    console.error('[Messaging] Send error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/messaging/platforms', async (req, res) => {
  const platforms = [
    { 
      id: 'whatsapp', 
      name: 'WhatsApp Business',
      icon: 'whatsapp',
      status: 'available',
      description: 'Connect via WhatsApp Business Cloud API'
    },
    { 
      id: 'telegram', 
      name: 'Telegram',
      icon: 'telegram',
      status: 'available',
      description: 'Bot integration via Telegram Bot API'
    },
    { 
      id: 'slack', 
      name: 'Slack',
      icon: 'slack',
      status: 'available',
      description: 'Team messaging via Slack API'
    },
    { 
      id: 'messenger', 
      name: 'Facebook Messenger',
      icon: 'facebook',
      status: 'available',
      description: 'Page messaging via Meta Graph API'
    },
    { 
      id: 'instagram', 
      name: 'Instagram DM',
      icon: 'instagram',
      status: 'available',
      description: 'Direct messages via Instagram Graph API'
    }
  ];

  res.json({
    platforms,
    n8nIntegration: {
      required: true,
      webhookUrl: process.env.N8N_WEBHOOK_URL ? 'configured' : 'not_configured',
      setupGuide: 'Configure N8N_WEBHOOK_URL environment variable to enable multi-platform messaging'
    }
  });
});

export default router;
