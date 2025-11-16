/**
 * Mr Blue Messenger Routes
 * API endpoints for Facebook Messenger integration
 */

import { Router, type Request, type Response } from 'express';
import { authenticateToken, type AuthRequest, requireRoleLevel } from '../middleware/auth';
import { messengerService } from '../services/mrBlue/MessengerService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const connectPageSchema = z.object({
  pageId: z.string().min(1),
  pageName: z.string().min(1),
  accessToken: z.string().min(1),
});

const sendMessageSchema = z.object({
  recipientId: z.string().min(1),
  message: z.string().min(1).max(2000),
  messageType: z.string().optional().default('text'),
});

const sendInviteSchema = z.object({
  userFacebookId: z.string().min(1),
  inviteMessage: z.string().min(1).max(2000),
});

/**
 * GET /api/mrblue/messenger/webhook
 * Webhook verification endpoint (Facebook initial setup)
 */
router.get('/webhook', (req: Request, res: Response) => {
  try {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    console.log('[MessengerAPI] Webhook verification request:', { mode, token });

    const result = messengerService.verifyWebhook(mode, token, challenge);
    
    if (result) {
      console.log('[MessengerAPI] Webhook verified successfully');
      return res.status(200).send(result);
    } else {
      console.warn('[MessengerAPI] Webhook verification failed');
      return res.status(403).send('Forbidden');
    }
  } catch (error: any) {
    console.error('[MessengerAPI] Webhook verification error:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * POST /api/mrblue/messenger/webhook
 * Receive incoming messages from Facebook
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // Must respond quickly to Facebook (within 20 seconds)
    res.status(200).send('EVENT_RECEIVED');

    const webhookData = req.body;
    console.log('[MessengerAPI] Received webhook event:', JSON.stringify(webhookData, null, 2));

    // Process webhook asynchronously
    const result = await messengerService.handleIncomingMessage(webhookData);

    if (result.success && result.aiResponses && result.aiResponses.length > 0) {
      console.log(`[MessengerAPI] Processed ${result.processedCount} messages`);
      
      // TODO: Route to Mr Blue AI for responses
      // For now, just log the messages that need AI responses
      for (const msg of result.aiResponses) {
        console.log(`[MessengerAPI] Need AI response for: ${msg.message}`);
        // Integration point: Call Mr Blue AI service here
      }
    }
  } catch (error: any) {
    console.error('[MessengerAPI] Webhook processing error:', error);
    // Don't send error to Facebook - already responded with 200
  }
});

/**
 * POST /api/mrblue/messenger/connect
 * Connect a Facebook page to Mr Blue
 * Requires admin access (role level 2+)
 */
router.post('/connect', authenticateToken, requireRoleLevel(2), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validation = connectPageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validation.error.errors 
      });
    }

    const { pageId, pageName, accessToken } = validation.data;

    console.log(`[MessengerAPI] Connecting page ${pageName} for user ${userId}`);

    const result = await messengerService.connectPage({
      pageId,
      pageName,
      accessToken,
      userId,
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Facebook page connected successfully',
        connectionId: result.connectionId,
        verifyToken: messengerService.getVerifyToken(),
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to connect page',
      });
    }
  } catch (error: any) {
    console.error('[MessengerAPI] Connect error:', error);
    res.status(500).json({ 
      message: 'Failed to connect Facebook page',
      error: error.message 
    });
  }
});

/**
 * POST /api/mrblue/messenger/send
 * Send a message to a user
 * Requires authentication
 */
router.post('/send', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validation = sendMessageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validation.error.errors 
      });
    }

    const { recipientId, message, messageType } = validation.data;

    // Get user's active connection
    const connection = await messengerService.getConnectionByUserId(userId);
    if (!connection) {
      return res.status(404).json({ message: 'No active Messenger connection found' });
    }

    console.log(`[MessengerAPI] Sending message to ${recipientId}`);

    const result = await messengerService.sendMessage(
      connection.id,
      recipientId,
      message,
      messageType
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Message sent successfully',
        messageId: result.messageId,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to send message',
      });
    }
  } catch (error: any) {
    console.error('[MessengerAPI] Send error:', error);
    res.status(500).json({ 
      message: 'Failed to send message',
      error: error.message 
    });
  }
});

/**
 * GET /api/mrblue/messenger/conversations
 * Get all conversations for the connected page
 */
router.get('/conversations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit as string) || 20;

    // Get user's active connection
    const connection = await messengerService.getConnectionByUserId(userId);
    if (!connection) {
      return res.status(404).json({ message: 'No active Messenger connection found' });
    }

    const result = await messengerService.getConversations(connection.id, limit);

    if (result.success) {
      res.json({
        success: true,
        conversations: result.conversations || [],
        connection: {
          pageId: connection.pageId,
          pageName: connection.pageName,
          connectedAt: connection.connectedAt,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to fetch conversations',
      });
    }
  } catch (error: any) {
    console.error('[MessengerAPI] Conversations error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch conversations',
      error: error.message 
    });
  }
});

/**
 * POST /api/mrblue/messenger/invite
 * Send invite to a specific user (e.g., @sboddye)
 * Requires authentication
 */
router.post('/invite', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validation = sendInviteSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validation.error.errors 
      });
    }

    const { userFacebookId, inviteMessage } = validation.data;

    // Get user's active connection
    const connection = await messengerService.getConnectionByUserId(userId);
    if (!connection) {
      return res.status(404).json({ message: 'No active Messenger connection found' });
    }

    console.log(`[MessengerAPI] Sending invite to ${userFacebookId}`);

    const result = await messengerService.sendInvite(
      connection.id,
      userFacebookId,
      inviteMessage
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Invite sent successfully',
        messageId: result.messageId,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to send invite',
      });
    }
  } catch (error: any) {
    console.error('[MessengerAPI] Invite error:', error);
    res.status(500).json({ 
      message: 'Failed to send invite',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/mrblue/messenger/disconnect
 * Disconnect Facebook page
 * Requires authentication
 */
router.delete('/disconnect', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user's active connection
    const connection = await messengerService.getConnectionByUserId(userId);
    if (!connection) {
      return res.status(404).json({ message: 'No active Messenger connection found' });
    }

    console.log(`[MessengerAPI] Disconnecting page for user ${userId}`);

    const result = await messengerService.disconnectPage(connection.id);

    if (result.success) {
      res.json({
        success: true,
        message: 'Facebook page disconnected successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to disconnect page',
      });
    }
  } catch (error: any) {
    console.error('[MessengerAPI] Disconnect error:', error);
    res.status(500).json({ 
      message: 'Failed to disconnect page',
      error: error.message 
    });
  }
});

/**
 * GET /api/mrblue/messenger/status
 * Get connection status
 */
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const connection = await messengerService.getConnectionByUserId(userId);

    res.json({
      success: true,
      connected: !!connection,
      connection: connection ? {
        pageId: connection.pageId,
        pageName: connection.pageName,
        isActive: connection.isActive,
        connectedAt: connection.connectedAt,
        lastSyncAt: connection.lastSyncAt,
      } : null,
    });
  } catch (error: any) {
    console.error('[MessengerAPI] Status error:', error);
    res.status(500).json({ 
      message: 'Failed to get connection status',
      error: error.message 
    });
  }
});

export default router;
