/**
 * UNIFIED MESSAGING PLATFORM BACKEND
 * Integrates MT internal messages + Gmail + Facebook + Instagram + WhatsApp
 * 
 * P0 #12-16: Messages Platform Backend
 */

import { Router, Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { db } from "@shared/db";
import { 
  connectedChannels,
  externalMessages,
  messageTemplates,
  messageAutomations,
  scheduledMessages,
  insertConnectedChannelSchema,
  insertExternalMessageSchema,
  insertMessageTemplateSchema,
  insertMessageAutomationSchema,
  insertScheduledMessageSchema,
  type ConnectedChannel,
  type ExternalMessage,
  type MessageTemplate,
  type MessageAutomation,
  type ScheduledMessage,
} from "@shared/schema";
import { chatMessages } from "@shared/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// ============================================================================
// CHANNEL MANAGEMENT (5 ENDPOINTS)
// ============================================================================

/**
 * POST /api/messages/channels/connect
 * Connect an external messaging channel (Gmail, Facebook, Instagram, WhatsApp)
 * 
 * Integration Notes:
 * - Gmail: OAuth 2.0 flow, validate accessToken with Google API
 * - Facebook/Instagram: Graph API OAuth, validate with FB API
 * - WhatsApp: Business API, webhook setup for incoming messages
 */
router.post("/channels/connect", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validation = insertConnectedChannelSchema.omit({ userId: true }).safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: validation.error.errors 
      });
    }

    const { channel, accessToken, refreshToken, accountId, accountName, config } = validation.data;

    // TODO: Real OAuth validation would happen here
    // Gmail: Validate token with Google OAuth2 API
    // if (channel === 'gmail') {
    //   const googleAuth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    //   googleAuth.setCredentials({ access_token: accessToken });
    //   const gmail = google.gmail({ version: 'v1', auth: googleAuth });
    //   const profile = await gmail.users.getProfile({ userId: 'me' });
    //   accountName = profile.data.emailAddress;
    // }

    // Facebook/Instagram: Validate token with Graph API
    // if (channel === 'facebook' || channel === 'instagram') {
    //   const response = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`);
    //   const data = await response.json();
    //   accountId = data.id;
    //   accountName = data.name;
    // }

    // WhatsApp: Validate Business API credentials
    // if (channel === 'whatsapp') {
    //   const response = await fetch(`https://graph.facebook.com/v18.0/${accountId}`, {
    //     headers: { 'Authorization': `Bearer ${accessToken}` }
    //   });
    //   // Setup webhook for incoming messages
    // }

    // TODO: In production, encrypt accessToken and refreshToken before storing
    // const encryptedAccessToken = await encrypt(accessToken);
    // const encryptedRefreshToken = refreshToken ? await encrypt(refreshToken) : null;

    const [connection] = await db.insert(connectedChannels).values({
      userId,
      channel,
      accessToken, // Would be encrypted in production
      refreshToken, // Would be encrypted in production
      accountId,
      accountName,
      config,
      isActive: true,
      lastSyncAt: new Date(),
    }).returning();

    res.json(connection);
  } catch (error: any) {
    console.error("[Messages] Channel connect error:", error);
    res.status(500).json({ error: "Failed to connect channel", message: error.message });
  }
});

/**
 * GET /api/messages/channels
 * List all connected channels for the authenticated user
 */
router.get("/channels", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const channels = await db
      .select()
      .from(connectedChannels)
      .where(eq(connectedChannels.userId, userId))
      .orderBy(desc(connectedChannels.createdAt));

    // Don't expose tokens in the response
    const sanitizedChannels = channels.map(ch => ({
      ...ch,
      accessToken: undefined,
      refreshToken: undefined,
    }));

    res.json(sanitizedChannels);
  } catch (error: any) {
    console.error("[Messages] List channels error:", error);
    res.status(500).json({ error: "Failed to list channels", message: error.message });
  }
});

/**
 * DELETE /api/messages/channels/:channel
 * Disconnect a messaging channel
 */
router.delete("/channels/:channel", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { channel } = req.params;

    // TODO: Revoke OAuth tokens with external APIs
    // Gmail: Revoke token via Google API
    // Facebook/Instagram: Revoke app permissions via Graph API
    // WhatsApp: Remove webhook subscription

    await db
      .delete(connectedChannels)
      .where(
        and(
          eq(connectedChannels.userId, userId),
          eq(connectedChannels.channel, channel as any)
        )
      );

    res.json({ success: true, message: `Channel ${channel} disconnected` });
  } catch (error: any) {
    console.error("[Messages] Disconnect channel error:", error);
    res.status(500).json({ error: "Failed to disconnect channel", message: error.message });
  }
});

/**
 * POST /api/messages/sync
 * Manually trigger sync from external channels
 * 
 * Integration Notes:
 * - Gmail: Use Gmail API to fetch new messages since lastSyncAt
 * - Facebook: Use Graph API to fetch messenger conversations
 * - Instagram: Use Instagram Messaging API to fetch DMs
 * - WhatsApp: Messages come via webhook, but can fetch conversation history
 */
router.post("/sync", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { channel } = req.body;

    // Get connected channels to sync
    const channelsToSync = await db
      .select()
      .from(connectedChannels)
      .where(
        and(
          eq(connectedChannels.userId, userId),
          eq(connectedChannels.isActive, true),
          channel ? eq(connectedChannels.channel, channel) : sql`true`
        )
      );

    let totalSynced = 0;

    for (const ch of channelsToSync) {
      try {
        // TODO: Implement real sync logic for each channel
        // const decryptedToken = await decrypt(ch.accessToken);
        
        if (ch.channel === 'gmail') {
          // Gmail sync implementation
          // const gmail = google.gmail({ version: 'v1', auth: googleAuth });
          // const lastSyncTime = ch.lastSyncAt?.getTime() || 0;
          // const response = await gmail.users.messages.list({
          //   userId: 'me',
          //   q: `after:${Math.floor(lastSyncTime / 1000)}`
          // });
          // 
          // for (const msg of response.data.messages || []) {
          //   const fullMsg = await gmail.users.messages.get({ userId: 'me', id: msg.id });
          //   await db.insert(externalMessages).values({
          //     userId,
          //     channel: 'gmail',
          //     externalId: msg.id,
          //     from: extractFrom(fullMsg),
          //     to: extractTo(fullMsg),
          //     subject: extractSubject(fullMsg),
          //     body: extractBody(fullMsg),
          //     receivedAt: new Date(parseInt(fullMsg.data.internalDate)),
          //   });
          //   totalSynced++;
          // }
        }

        if (ch.channel === 'facebook') {
          // Facebook Messenger sync
          // const response = await fetch(
          //   `https://graph.facebook.com/v18.0/me/conversations?access_token=${decryptedToken}`
          // );
          // const data = await response.json();
          // Process and store messages...
        }

        if (ch.channel === 'instagram') {
          // Instagram DM sync
          // const response = await fetch(
          //   `https://graph.facebook.com/v18.0/me/conversations?platform=instagram&access_token=${decryptedToken}`
          // );
          // const data = await response.json();
          // Process and store messages...
        }

        if (ch.channel === 'whatsapp') {
          // WhatsApp conversation history
          // const response = await fetch(
          //   `https://graph.facebook.com/v18.0/${ch.accountId}/messages?access_token=${decryptedToken}`
          // );
          // const data = await response.json();
          // Process and store messages...
        }

        // Update last sync time
        await db
          .update(connectedChannels)
          .set({ lastSyncAt: new Date() })
          .where(eq(connectedChannels.id, ch.id));

      } catch (error) {
        console.error(`[Messages] Error syncing ${ch.channel}:`, error);
      }
    }

    res.json({ 
      success: true, 
      message: `Synced ${totalSynced} messages`,
      channelsSynced: channelsToSync.length 
    });
  } catch (error: any) {
    console.error("[Messages] Sync error:", error);
    res.status(500).json({ error: "Failed to sync messages", message: error.message });
  }
});

/**
 * GET /api/messages/unified
 * Get unified inbox - all messages across all channels (MT internal + external)
 */
router.get("/unified", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { limit = 50, offset = 0, channel, unreadOnly } = req.query;

    // Get external messages (Gmail, FB, IG, WhatsApp)
    const externalMsgs = await db
      .select()
      .from(externalMessages)
      .where(
        and(
          eq(externalMessages.userId, userId),
          channel ? eq(externalMessages.channel, channel as any) : sql`true`,
          unreadOnly === 'true' ? eq(externalMessages.isRead, false) : sql`true`
        )
      )
      .orderBy(desc(externalMessages.receivedAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    // Get MT internal messages (existing chatMessages table)
    // TODO: Join with chatMessages table to include internal MT messages
    // const internalMsgs = await db
    //   .select()
    //   .from(chatMessages)
    //   .where(eq(chatMessages.userId, userId))
    //   .orderBy(desc(chatMessages.createdAt))
    //   .limit(parseInt(limit as string));

    // Combine and sort by date
    const unifiedMessages = [
      ...externalMsgs.map(msg => ({
        ...msg,
        source: 'external',
        type: msg.channel,
      })),
      // ...internalMsgs.map(msg => ({
      //   ...msg,
      //   source: 'internal',
      //   type: 'mt',
      // }))
    ].sort((a, b) => {
      const dateA = new Date(a.receivedAt || a.createdAt).getTime();
      const dateB = new Date(b.receivedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    res.json({
      messages: unifiedMessages,
      total: unifiedMessages.length,
      hasMore: unifiedMessages.length === parseInt(limit as string),
    });
  } catch (error: any) {
    console.error("[Messages] Unified inbox error:", error);
    res.status(500).json({ error: "Failed to fetch messages", message: error.message });
  }
});

// ============================================================================
// MESSAGING (2 ENDPOINTS)
// ============================================================================

/**
 * POST /api/messages/send
 * Send a message to any channel
 * 
 * Integration Notes:
 * - Gmail: Use Gmail API to send email
 * - Facebook: Use Graph API to send Messenger message
 * - Instagram: Use Instagram Messaging API
 * - WhatsApp: Use WhatsApp Business API
 * - MT: Insert into chatMessages table
 */
router.post("/send", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { channel, to, subject, body, threadId, templateId } = req.body;

    if (!channel || !to || !body) {
      return res.status(400).json({ error: "Missing required fields: channel, to, body" });
    }

    // Get channel connection
    const [channelConnection] = await db
      .select()
      .from(connectedChannels)
      .where(
        and(
          eq(connectedChannels.userId, userId),
          eq(connectedChannels.channel, channel),
          eq(connectedChannels.isActive, true)
        )
      );

    if (!channelConnection && channel !== 'mt') {
      return res.status(404).json({ error: `Channel ${channel} not connected` });
    }

    let sentMessage;

    // TODO: Implement real sending logic for each channel
    // const accessToken = channelConnection ? await decrypt(channelConnection.accessToken) : null;

    if (channel === 'gmail') {
      // Send email via Gmail API
      // const gmail = google.gmail({ version: 'v1', auth: googleAuth });
      // const message = createMimeMessage(to, subject, body);
      // const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
      // const response = await gmail.users.messages.send({
      //   userId: 'me',
      //   requestBody: { raw: encodedMessage }
      // });
      // sentMessage = { id: response.data.id, threadId: response.data.threadId };
    }

    if (channel === 'facebook') {
      // Send message via Facebook Messenger API
      // const response = await fetch(`https://graph.facebook.com/v18.0/me/messages`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     recipient: { id: to },
      //     message: { text: body },
      //     access_token: accessToken
      //   })
      // });
      // const data = await response.json();
      // sentMessage = data;
    }

    if (channel === 'instagram') {
      // Send DM via Instagram Messaging API
      // const response = await fetch(`https://graph.facebook.com/v18.0/me/messages`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     recipient: { id: to },
      //     message: { text: body },
      //     access_token: accessToken
      //   })
      // });
    }

    if (channel === 'whatsapp') {
      // Send message via WhatsApp Business API
      // const response = await fetch(
      //   `https://graph.facebook.com/v18.0/${channelConnection.accountId}/messages`,
      //   {
      //     method: 'POST',
      //     headers: { 
      //       'Authorization': `Bearer ${accessToken}`,
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({
      //       messaging_product: 'whatsapp',
      //       to: to,
      //       type: 'text',
      //       text: { body }
      //     })
      //   }
      // );
    }

    if (channel === 'mt') {
      // Send MT internal message (use existing chatMessages table)
      // const [message] = await db.insert(chatMessages).values({
      //   userId,
      //   recipientId: parseInt(to),
      //   content: body,
      // }).returning();
      // sentMessage = message;
    }

    // Mock response for now
    sentMessage = {
      id: `mock-${Date.now()}`,
      channel,
      to,
      subject,
      body,
      sentAt: new Date(),
    };

    res.json({ success: true, message: sentMessage });
  } catch (error: any) {
    console.error("[Messages] Send error:", error);
    res.status(500).json({ error: "Failed to send message", message: error.message });
  }
});

/**
 * POST /api/messages/schedule
 * Schedule a message for later delivery
 */
router.post("/schedule", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validation = insertScheduledMessageSchema.omit({ userId: true }).safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: validation.error.errors 
      });
    }

    const data = validation.data;

    // Validate scheduled time is in the future
    const scheduledTime = new Date(data.scheduledFor);
    if (scheduledTime <= new Date()) {
      return res.status(400).json({ error: "Scheduled time must be in the future" });
    }

    const [scheduledMessage] = await db.insert(scheduledMessages).values({
      userId,
      ...data,
    }).returning();

    // TODO: Set up background job to send message at scheduled time
    // Could use BullMQ, node-cron, or similar
    // queue.add('send-scheduled-message', { messageId: scheduledMessage.id }, { 
    //   delay: scheduledTime.getTime() - Date.now() 
    // });

    res.json(scheduledMessage);
  } catch (error: any) {
    console.error("[Messages] Schedule error:", error);
    res.status(500).json({ error: "Failed to schedule message", message: error.message });
  }
});

// ============================================================================
// TEMPLATES (3 ENDPOINTS)
// ============================================================================

/**
 * GET /api/messages/templates
 * List all message templates for the user
 */
router.get("/templates", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { channel, includePublic } = req.query;

    const templates = await db
      .select()
      .from(messageTemplates)
      .where(
        and(
          or(
            eq(messageTemplates.userId, userId),
            includePublic === 'true' ? eq(messageTemplates.isPublic, true) : sql`false`
          ),
          channel ? sql`${channel} = ANY(${messageTemplates.channels})` : sql`true`
        )
      )
      .orderBy(desc(messageTemplates.createdAt));

    res.json(templates);
  } catch (error: any) {
    console.error("[Messages] List templates error:", error);
    res.status(500).json({ error: "Failed to list templates", message: error.message });
  }
});

/**
 * POST /api/messages/templates
 * Create a new message template
 */
router.post("/templates", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validation = insertMessageTemplateSchema.omit({ userId: true }).safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: validation.error.errors 
      });
    }

    const [template] = await db.insert(messageTemplates).values({
      userId,
      ...validation.data,
    }).returning();

    res.json(template);
  } catch (error: any) {
    console.error("[Messages] Create template error:", error);
    res.status(500).json({ error: "Failed to create template", message: error.message });
  }
});

/**
 * DELETE /api/messages/templates/:id
 * Delete a message template
 */
router.delete("/templates/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const templateId = parseInt(req.params.id);

    await db
      .delete(messageTemplates)
      .where(
        and(
          eq(messageTemplates.id, templateId),
          eq(messageTemplates.userId, userId)
        )
      );

    res.json({ success: true, message: "Template deleted" });
  } catch (error: any) {
    console.error("[Messages] Delete template error:", error);
    res.status(500).json({ error: "Failed to delete template", message: error.message });
  }
});

// ============================================================================
// AUTOMATIONS (4 ENDPOINTS)
// ============================================================================

/**
 * GET /api/messages/automations
 * List all message automations for the user
 */
router.get("/automations", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { channel, automationType, activeOnly } = req.query;

    const automations = await db
      .select()
      .from(messageAutomations)
      .where(
        and(
          eq(messageAutomations.userId, userId),
          channel ? eq(messageAutomations.channel, channel as any) : sql`true`,
          automationType ? eq(messageAutomations.automationType, automationType as string) : sql`true`,
          activeOnly === 'true' ? eq(messageAutomations.isActive, true) : sql`true`
        )
      )
      .orderBy(desc(messageAutomations.createdAt));

    res.json(automations);
  } catch (error: any) {
    console.error("[Messages] List automations error:", error);
    res.status(500).json({ error: "Failed to list automations", message: error.message });
  }
});

/**
 * POST /api/messages/automations
 * Create a new message automation (auto-reply, scheduled, routing, etc.)
 */
router.post("/automations", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validation = insertMessageAutomationSchema.omit({ userId: true }).safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: validation.error.errors 
      });
    }

    const [automation] = await db.insert(messageAutomations).values({
      userId,
      ...validation.data,
    }).returning();

    // TODO: Register automation with background processor
    // If automationType is 'auto_reply', set up webhook handler
    // If automationType is 'scheduled', set up cron job
    // If automationType is 'routing', configure routing rules

    res.json(automation);
  } catch (error: any) {
    console.error("[Messages] Create automation error:", error);
    res.status(500).json({ error: "Failed to create automation", message: error.message });
  }
});

/**
 * PUT /api/messages/automations/:id
 * Update an existing automation
 */
router.put("/automations/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const automationId = parseInt(req.params.id);
    
    // Allow partial updates
    const allowedUpdates = ['name', 'trigger', 'action', 'templateId', 'config', 'isActive'];
    const updates: any = {};
    
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    updates.updatedAt = new Date();

    const [automation] = await db
      .update(messageAutomations)
      .set(updates)
      .where(
        and(
          eq(messageAutomations.id, automationId),
          eq(messageAutomations.userId, userId)
        )
      )
      .returning();

    if (!automation) {
      return res.status(404).json({ error: "Automation not found" });
    }

    res.json(automation);
  } catch (error: any) {
    console.error("[Messages] Update automation error:", error);
    res.status(500).json({ error: "Failed to update automation", message: error.message });
  }
});

/**
 * DELETE /api/messages/automations/:id
 * Delete an automation
 */
router.delete("/automations/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const automationId = parseInt(req.params.id);

    await db
      .delete(messageAutomations)
      .where(
        and(
          eq(messageAutomations.id, automationId),
          eq(messageAutomations.userId, userId)
        )
      );

    // TODO: Unregister automation from background processor
    // Remove webhooks, cron jobs, routing rules, etc.

    res.json({ success: true, message: "Automation deleted" });
  } catch (error: any) {
    console.error("[Messages] Delete automation error:", error);
    res.status(500).json({ error: "Failed to delete automation", message: error.message });
  }
});

export default router;
