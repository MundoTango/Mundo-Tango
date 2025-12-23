import { Router } from 'express';
import { N8nWebhookService } from '../services/messaging/N8nWebhookService';

const router = Router();
const n8nService = new N8nWebhookService();

/**
 * Slack Events API webhook endpoint
 * Handles mentions of Mr. Blue in Slack channels
 */
router.post('/slack/events', async (req, res) => {
  try {
    const { type, challenge, event } = req.body;

    // Slack URL verification
    if (type === 'url_verification') {
      return res.json({ challenge });
    }

    // Handle app_mention events (when Mr. Blue is @mentioned)
    if (type === 'event_callback' && event?.type === 'app_mention') {
      const { text, user, channel, ts } = event;
      
      // Remove the @Mr.Blue mention from the text
      const cleanText = text.replace(/<@[A-Z0-9]+>/g, '').trim();

      console.log(`[Slack] Received mention from ${user} in ${channel}: ${cleanText}`);

      // Process the message through N8n webhook
      const incomingMessage = {
        platform: 'slack' as const,
        externalUserId: user,
        userName: user, // Will be enhanced with actual username
        userProfileUrl: null,
        messageText: cleanText,
        messageType: 'text' as const,
        timestamp: new Date(parseFloat(ts) * 1000),
        metadata: {
          channel,
          thread_ts: event.thread_ts || ts
        }
      };

      // Send to n8n for processing
      await n8nService.processIncomingMessage(incomingMessage);

      // Acknowledge receipt immediately
      res.status(200).json({ ok: true });
    } else {
      res.status(200).json({ ok: true });
    }
  } catch (error) {
    console.error('[Slack] Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Slack slash commands endpoint
 * Handles /mrblue command
 */
router.post('/slack/commands', async (req, res) => {
  try {
    const { text, user_name, channel_id, user_id } = req.body;

    console.log(`[Slack] Slash command from ${user_name}: ${text}`);

    const incomingMessage = {
      platform: 'slack' as const,
      externalUserId: user_id,
      userName: user_name,
      userProfileUrl: null,
      messageText: text,
      messageType: 'text' as const,
      timestamp: new Date(),
      metadata: {
        channel: channel_id,
        command: '/mrblue'
      }
    };

    // Send to n8n for processing
    await n8nService.processIncomingMessage(incomingMessage);

    // Respond immediately to Slack
    res.json({
      response_type: 'in_channel',
      text: 'Processing your request... Mr. Blue will respond shortly.'
    });
  } catch (error) {
    console.error('[Slack] Command error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
