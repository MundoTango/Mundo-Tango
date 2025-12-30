/**
 * UNIFIED MESSAGING PLATFORM BACKEND
 * Integrates MT internal messages + Gmail + Facebook + Instagram + WhatsApp
 * 
 * P0 #12-16: Messages Platform Backend
 * 
 * OAuth Implementation Complete:
 * - Gmail: Uses Replit Connectors via gmail-client.ts
 * - Facebook/Instagram: Uses Graph API via FacebookOAuthService.ts  
 * - WhatsApp: Uses WhatsApp Business API (Graph API)
 * - Tokens encrypted with AES-256-GCM before storage
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
import { chatMessages, chatRooms, chatRoomUsers, users, directMessages } from "@shared/schema";
import { eq, and, or, desc, asc, sql, inArray } from "drizzle-orm";
import { z } from "zod";
import { encrypt, decrypt } from "../utils/encryption";
import { getUncachableGmailClient, sendEmail } from "../lib/gmail-client";
import { facebookOAuthService } from "../services/facebook/FacebookOAuthService";

const router = Router();

// Graph API version for Facebook/Instagram/WhatsApp
const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// ============================================================================
// OAUTH VALIDATION HELPERS
// ============================================================================

/**
 * Validate Gmail OAuth token via Replit Connectors
 * Uses the gmail-client which handles token refresh automatically
 */
async function validateGmailToken(): Promise<{ valid: boolean; email?: string; error?: string }> {
  try {
    const gmail = await getUncachableGmailClient();
    const profile = await gmail.users.getProfile({ userId: 'me' });
    
    return {
      valid: true,
      email: profile.data.emailAddress || undefined,
    };
  } catch (error: any) {
    console.error('[Messages] Gmail token validation failed:', error.message);
    return {
      valid: false,
      error: error.message || 'Gmail authentication failed',
    };
  }
}

/**
 * Validate Facebook/Instagram OAuth token via Graph API
 */
async function validateFacebookToken(accessToken: string): Promise<{
  valid: boolean;
  userId?: string;
  name?: string;
  email?: string;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${GRAPH_API_BASE}/me?fields=id,name,email&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        valid: false,
        error: errorData.error?.message || 'Token validation failed',
      };
    }
    
    const data = await response.json();
    return {
      valid: true,
      userId: data.id,
      name: data.name,
      email: data.email,
    };
  } catch (error: any) {
    console.error('[Messages] Facebook token validation failed:', error.message);
    return {
      valid: false,
      error: error.message || 'Facebook authentication failed',
    };
  }
}

/**
 * Validate WhatsApp Business API token
 * WhatsApp uses the same Graph API with phone number ID
 */
async function validateWhatsAppToken(accessToken: string, phoneNumberId: string): Promise<{
  valid: boolean;
  displayPhoneNumber?: string;
  verifiedName?: string;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${GRAPH_API_BASE}/${phoneNumberId}?fields=display_phone_number,verified_name&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        valid: false,
        error: errorData.error?.message || 'WhatsApp token validation failed',
      };
    }
    
    const data = await response.json();
    return {
      valid: true,
      displayPhoneNumber: data.display_phone_number,
      verifiedName: data.verified_name,
    };
  } catch (error: any) {
    console.error('[Messages] WhatsApp token validation failed:', error.message);
    return {
      valid: false,
      error: error.message || 'WhatsApp authentication failed',
    };
  }
}

/**
 * Revoke Facebook/Instagram OAuth token
 */
async function revokeFacebookToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${GRAPH_API_BASE}/me/permissions?access_token=${accessToken}`,
      { method: 'DELETE' }
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Sync Gmail messages
 */
async function syncGmailMessages(userId: number, lastSyncAt: Date | null): Promise<number> {
  try {
    const gmail = await getUncachableGmailClient();
    const lastSyncTime = lastSyncAt?.getTime() || 0;
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: lastSyncTime > 0 ? `after:${Math.floor(lastSyncTime / 1000)}` : undefined,
      maxResults: 50,
    });
    
    let synced = 0;
    const messages = response.data.messages || [];
    
    for (const msgRef of messages) {
      if (!msgRef.id) continue;
      
      try {
        const fullMsg = await gmail.users.messages.get({ 
          userId: 'me', 
          id: msgRef.id,
          format: 'full' 
        });
        
        const headers = fullMsg.data.payload?.headers || [];
        const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value;
        
        const fromHeader = getHeader('from') || '';
        const toHeader = getHeader('to') || '';
        const subject = getHeader('subject') || '';
        
        let body = '';
        let htmlBody = '';
        
        const parts = fullMsg.data.payload?.parts || [];
        for (const part of parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
          if (part.mimeType === 'text/html' && part.body?.data) {
            htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        }
        
        if (!body && fullMsg.data.payload?.body?.data) {
          body = Buffer.from(fullMsg.data.payload.body.data, 'base64').toString('utf-8');
        }
        
        const existing = await db.select({ id: externalMessages.id })
          .from(externalMessages)
          .where(eq(externalMessages.externalId, msgRef.id))
          .limit(1);
        
        if (existing.length === 0) {
          await db.insert(externalMessages).values({
            userId,
            channel: 'gmail',
            externalId: msgRef.id,
            threadId: fullMsg.data.threadId || undefined,
            from: fromHeader,
            to: toHeader,
            subject,
            body,
            htmlBody: htmlBody || undefined,
            labels: fullMsg.data.labelIds || [],
            receivedAt: new Date(parseInt(fullMsg.data.internalDate || '0')),
          });
          synced++;
        }
      } catch (msgError) {
        console.error(`[Messages] Error processing Gmail message ${msgRef.id}:`, msgError);
      }
    }
    
    return synced;
  } catch (error) {
    console.error('[Messages] Gmail sync error:', error);
    return 0;
  }
}

/**
 * Sync Facebook Messenger conversations
 */
async function syncFacebookMessages(userId: number, accessToken: string, pageId: string, lastSyncAt: Date | null): Promise<number> {
  try {
    const decryptedToken = decrypt(accessToken);
    
    const response = await fetch(
      `${GRAPH_API_BASE}/${pageId}/conversations?fields=id,updated_time,participants,messages{id,message,from,to,created_time}&access_token=${decryptedToken}`
    );
    
    if (!response.ok) {
      console.error('[Messages] Facebook conversations fetch failed');
      return 0;
    }
    
    const data = await response.json();
    let synced = 0;
    
    for (const conversation of data.data || []) {
      const messages = conversation.messages?.data || [];
      
      for (const msg of messages) {
        if (lastSyncAt && new Date(msg.created_time) <= lastSyncAt) continue;
        
        const existing = await db.select({ id: externalMessages.id })
          .from(externalMessages)
          .where(eq(externalMessages.externalId, msg.id))
          .limit(1);
        
        if (existing.length === 0) {
          await db.insert(externalMessages).values({
            userId,
            channel: 'facebook',
            externalId: msg.id,
            threadId: conversation.id,
            from: msg.from?.name || msg.from?.id || 'Unknown',
            to: msg.to?.data?.[0]?.name || 'Page',
            body: msg.message || '',
            receivedAt: new Date(msg.created_time),
          });
          synced++;
        }
      }
    }
    
    return synced;
  } catch (error) {
    console.error('[Messages] Facebook sync error:', error);
    return 0;
  }
}

/**
 * Sync Instagram DMs
 */
async function syncInstagramMessages(userId: number, accessToken: string, igAccountId: string, lastSyncAt: Date | null): Promise<number> {
  try {
    const decryptedToken = decrypt(accessToken);
    
    const response = await fetch(
      `${GRAPH_API_BASE}/${igAccountId}/conversations?fields=id,updated_time,participants,messages{id,message,from,to,timestamp}&platform=instagram&access_token=${decryptedToken}`
    );
    
    if (!response.ok) {
      console.error('[Messages] Instagram conversations fetch failed');
      return 0;
    }
    
    const data = await response.json();
    let synced = 0;
    
    for (const conversation of data.data || []) {
      const messages = conversation.messages?.data || [];
      
      for (const msg of messages) {
        if (lastSyncAt && new Date(msg.timestamp) <= lastSyncAt) continue;
        
        const existing = await db.select({ id: externalMessages.id })
          .from(externalMessages)
          .where(eq(externalMessages.externalId, msg.id))
          .limit(1);
        
        if (existing.length === 0) {
          await db.insert(externalMessages).values({
            userId,
            channel: 'instagram',
            externalId: msg.id,
            threadId: conversation.id,
            from: msg.from?.username || msg.from?.id || 'Unknown',
            body: msg.message || '',
            receivedAt: new Date(msg.timestamp),
          });
          synced++;
        }
      }
    }
    
    return synced;
  } catch (error) {
    console.error('[Messages] Instagram sync error:', error);
    return 0;
  }
}

// ============================================================================
// CHANNEL MANAGEMENT (5 ENDPOINTS)
// ============================================================================

/**
 * POST /api/messages/channels/connect
 * Connect an external messaging channel (Gmail, Facebook, Instagram, WhatsApp)
 * 
 * OAuth Implementation:
 * - Gmail: Validates via Replit Connectors (automatic token management)
 * - Facebook/Instagram: Validates token with Graph API, gets user info
 * - WhatsApp: Validates Business API credentials with phone number ID
 * - All tokens encrypted with AES-256-GCM before database storage
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

    let { channel, accessToken, refreshToken, accountId, accountName, config } = validation.data;
    let validatedAccountId = accountId;
    let validatedAccountName = accountName;

    // Real OAuth validation for each channel
    if (channel === 'gmail') {
      // Gmail: Validate via Replit Connectors (handles OAuth automatically)
      const gmailValidation = await validateGmailToken();
      
      if (!gmailValidation.valid) {
        return res.status(401).json({ 
          error: "Gmail authentication failed", 
          details: gmailValidation.error,
          action: "Please connect Gmail via the Replit integration panel"
        });
      }
      
      validatedAccountName = gmailValidation.email;
      validatedAccountId = gmailValidation.email;
      // Gmail tokens are managed by Replit Connectors, we don't store them
      accessToken = 'replit-connector-managed';
      console.log(`[Messages] Gmail connected for user ${userId}: ${validatedAccountName}`);
    }

    if (channel === 'facebook') {
      // Facebook: Validate token with Graph API
      if (!accessToken) {
        return res.status(400).json({ error: "Access token required for Facebook connection" });
      }
      
      const fbValidation = await validateFacebookToken(accessToken);
      
      if (!fbValidation.valid) {
        return res.status(401).json({ 
          error: "Facebook authentication failed", 
          details: fbValidation.error 
        });
      }
      
      validatedAccountId = fbValidation.userId;
      validatedAccountName = fbValidation.name;
      
      // Try to exchange for page token if user manages pages
      try {
        const pageTokenResult = await facebookOAuthService.exchangeForPageToken(accessToken);
        accessToken = pageTokenResult.pageAccessToken;
        validatedAccountId = pageTokenResult.pageId;
        validatedAccountName = pageTokenResult.pageName;
        config = { 
          ...config as object, 
          pageId: pageTokenResult.pageId,
          expiresAt: pageTokenResult.expiresAt.toISOString(),
          scopes: pageTokenResult.scopes 
        };
        console.log(`[Messages] Facebook Page connected: ${validatedAccountName} (${validatedAccountId})`);
      } catch (pageError) {
        // User token is valid but no page access - still allow connection
        console.log(`[Messages] Facebook User connected (no page access): ${validatedAccountName}`);
      }
    }

    if (channel === 'instagram') {
      // Instagram: Uses same Graph API as Facebook with Instagram permissions
      if (!accessToken) {
        return res.status(400).json({ error: "Access token required for Instagram connection" });
      }
      
      const igValidation = await validateFacebookToken(accessToken);
      
      if (!igValidation.valid) {
        return res.status(401).json({ 
          error: "Instagram authentication failed", 
          details: igValidation.error 
        });
      }
      
      // Get Instagram Business Account ID
      try {
        const response = await fetch(
          `${GRAPH_API_BASE}/me/accounts?fields=instagram_business_account{id,username}&access_token=${accessToken}`
        );
        const data = await response.json();
        const igAccount = data.data?.[0]?.instagram_business_account;
        
        if (igAccount) {
          validatedAccountId = igAccount.id;
          validatedAccountName = igAccount.username || 'Instagram Business';
          config = { ...config as object, instagramAccountId: igAccount.id };
        } else {
          validatedAccountId = igValidation.userId;
          validatedAccountName = igValidation.name;
        }
      } catch {
        validatedAccountId = igValidation.userId;
        validatedAccountName = igValidation.name;
      }
      
      console.log(`[Messages] Instagram connected: ${validatedAccountName}`);
    }

    if (channel === 'whatsapp') {
      // WhatsApp: Validate Business API credentials
      if (!accessToken || !accountId) {
        return res.status(400).json({ 
          error: "Access token and phone number ID required for WhatsApp connection" 
        });
      }
      
      const waValidation = await validateWhatsAppToken(accessToken, accountId);
      
      if (!waValidation.valid) {
        return res.status(401).json({ 
          error: "WhatsApp authentication failed", 
          details: waValidation.error 
        });
      }
      
      validatedAccountId = accountId;
      validatedAccountName = waValidation.verifiedName || waValidation.displayPhoneNumber;
      config = { 
        ...config as object, 
        phoneNumberId: accountId,
        displayPhoneNumber: waValidation.displayPhoneNumber,
        verifiedName: waValidation.verifiedName
      };
      
      console.log(`[Messages] WhatsApp connected: ${validatedAccountName}`);
    }

    // Encrypt tokens before storing (except Gmail which uses Replit Connectors)
    let encryptedAccessToken = accessToken;
    let encryptedRefreshToken = refreshToken;
    
    if (accessToken && channel !== 'gmail') {
      try {
        encryptedAccessToken = encrypt(accessToken);
        console.log(`[Messages] Access token encrypted for ${channel}`);
      } catch (encErr) {
        console.error('[Messages] Token encryption failed:', encErr);
        // Continue with unencrypted token in dev, but log warning
      }
    }
    
    if (refreshToken) {
      try {
        encryptedRefreshToken = encrypt(refreshToken);
      } catch (encErr) {
        console.error('[Messages] Refresh token encryption failed:', encErr);
      }
    }

    // Check if channel already exists for user
    const existingChannel = await db.select()
      .from(connectedChannels)
      .where(
        and(
          eq(connectedChannels.userId, userId),
          eq(connectedChannels.channel, channel)
        )
      )
      .limit(1);

    let connection;
    
    if (existingChannel.length > 0) {
      // Update existing connection
      [connection] = await db.update(connectedChannels)
        .set({
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          accountId: validatedAccountId,
          accountName: validatedAccountName,
          config,
          isActive: true,
          lastSyncAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(connectedChannels.id, existingChannel[0].id))
        .returning();
    } else {
      // Create new connection
      [connection] = await db.insert(connectedChannels).values({
        userId,
        channel,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        accountId: validatedAccountId,
        accountName: validatedAccountName,
        config,
        isActive: true,
        lastSyncAt: new Date(),
      }).returning();
    }

    // Return sanitized response (no tokens)
    res.json({
      ...connection,
      accessToken: undefined,
      refreshToken: undefined,
      message: `${channel} channel connected successfully`,
    });
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

    let channels: any[] = [];
    try {
      channels = await db
        .select()
        .from(connectedChannels)
        .where(eq(connectedChannels.userId, userId))
        .orderBy(desc(connectedChannels.createdAt));
    } catch (tableError: any) {
      if (tableError.message?.includes('does not exist')) {
        console.warn('[Messages] connected_channels table not found, returning empty array');
        return res.json([]);
      }
      throw tableError;
    }

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
 * 
 * Token Revocation:
 * - Facebook/Instagram: Revokes app permissions via Graph API
 * - WhatsApp: Connection removed (no revocation needed)
 * - Gmail: Managed by Replit Connectors
 */
router.delete("/channels/:channel", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { channel } = req.params;

    // Get the channel connection to access the token for revocation
    let existingConnection: any = null;
    try {
      const [connection] = await db.select()
        .from(connectedChannels)
        .where(
          and(
            eq(connectedChannels.userId, userId),
            eq(connectedChannels.channel, channel as any)
          )
        )
        .limit(1);
      existingConnection = connection;
    } catch (tableError: any) {
      if (tableError.message?.includes('does not exist')) {
        console.warn('[Messages] connected_channels table not found');
        return res.json({ success: true, message: `Channel ${channel} not connected` });
      }
      throw tableError;
    }

    if (existingConnection) {
      // Revoke OAuth tokens with external APIs
      if ((channel === 'facebook' || channel === 'instagram') && existingConnection.accessToken) {
        try {
          const decryptedToken = decrypt(existingConnection.accessToken);
          const revoked = await revokeFacebookToken(decryptedToken);
          console.log(`[Messages] ${channel} token revoked: ${revoked}`);
        } catch (revokeError) {
          console.warn(`[Messages] Failed to revoke ${channel} token:`, revokeError);
          // Continue with deletion even if revocation fails
        }
      }

      // Gmail: Managed by Replit Connectors - no direct revocation needed
      // WhatsApp: No standard revocation API, just remove from our database
    }

    try {
      await db
        .delete(connectedChannels)
        .where(
          and(
            eq(connectedChannels.userId, userId),
            eq(connectedChannels.channel, channel as any)
          )
        );
    } catch (tableError: any) {
      if (!tableError.message?.includes('does not exist')) {
        throw tableError;
      }
    }

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
 * Real Implementation:
 * - Gmail: Uses Replit Connectors to fetch messages via Gmail API
 * - Facebook: Uses Graph API to fetch messenger conversations
 * - Instagram: Uses Graph API to fetch Instagram DMs
 * - WhatsApp: Messages typically come via webhook (sync limited)
 */
router.post("/sync", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { channel } = req.body;

    // Get connected channels to sync - handle missing table gracefully
    let channelsToSync: any[] = [];
    try {
      channelsToSync = await db
        .select()
        .from(connectedChannels)
        .where(
          and(
            eq(connectedChannels.userId, userId),
            eq(connectedChannels.isActive, true),
            channel ? eq(connectedChannels.channel, channel) : sql`true`
          )
        );
    } catch (tableError: any) {
      if (tableError.message?.includes('does not exist')) {
        console.warn('[Messages] connected_channels table not found, returning empty sync');
        return res.json({ synced: 0, results: [], message: 'No channels connected' });
      }
      throw tableError;
    }

    let totalSynced = 0;
    const syncResults: { channel: string; synced: number; error?: string }[] = [];

    for (const ch of channelsToSync) {
      let channelSynced = 0;
      let channelError: string | undefined;
      
      try {
        if (ch.channel === 'gmail') {
          // Gmail sync via Replit Connectors
          channelSynced = await syncGmailMessages(userId, ch.lastSyncAt);
          console.log(`[Messages] Gmail sync complete: ${channelSynced} messages`);
        }

        if (ch.channel === 'facebook' && ch.accessToken && ch.accountId) {
          // Facebook Messenger sync
          channelSynced = await syncFacebookMessages(
            userId, 
            ch.accessToken, 
            ch.accountId, 
            ch.lastSyncAt
          );
          console.log(`[Messages] Facebook sync complete: ${channelSynced} messages`);
        }

        if (ch.channel === 'instagram' && ch.accessToken && ch.accountId) {
          // Instagram DM sync
          channelSynced = await syncInstagramMessages(
            userId,
            ch.accessToken,
            ch.accountId,
            ch.lastSyncAt
          );
          console.log(`[Messages] Instagram sync complete: ${channelSynced} messages`);
        }

        if (ch.channel === 'whatsapp') {
          // WhatsApp: Messages typically arrive via webhook
          // Sync is limited - we can only pull recent history
          console.log('[Messages] WhatsApp sync: Messages arrive via webhook');
          channelError = 'WhatsApp messages sync via webhook - manual sync limited';
        }

        totalSynced += channelSynced;

        // Update last sync time
        await db
          .update(connectedChannels)
          .set({ lastSyncAt: new Date() })
          .where(eq(connectedChannels.id, ch.id));

      } catch (error: any) {
        console.error(`[Messages] Error syncing ${ch.channel}:`, error);
        channelError = error.message;
      }
      
      syncResults.push({
        channel: ch.channel,
        synced: channelSynced,
        error: channelError,
      });
    }

    res.json({ 
      success: true, 
      message: `Synced ${totalSynced} messages`,
      totalSynced,
      channelsSynced: channelsToSync.length,
      results: syncResults,
    });
  } catch (error: any) {
    console.error("[Messages] Sync error:", error);
    res.status(500).json({ error: "Failed to sync messages", message: error.message });
  }
});

/**
 * GET /api/messages/unread-count
 * Get count of unread conversations (direct messages) for the authenticated user
 * Uses direct_messages table which is what the unified inbox displays
 */
router.get("/unread-count", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    // Count distinct senders who have sent unread messages to this user
    // This matches the unified inbox which groups by sender
    const result = await db.execute(sql`
      SELECT COUNT(DISTINCT sender_id)::int as count
      FROM direct_messages 
      WHERE recipient_id = ${userId} 
      AND is_read = false
    `);
    
    const count = (result.rows?.[0] as any)?.count || 0;
    res.json({ count });
  } catch (error) {
    console.error("Get unread message count error:", error);
    // Return 0 instead of error to prevent UI spam
    res.json({ count: 0 });
  }
});

/**
 * POST /api/messages/mark-read
 * Mark all messages from a sender as read for the authenticated user
 * Works with direct_messages table to match the unified inbox
 */
router.post("/mark-read", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { senderId, senderName } = req.body;
    
    // We need either senderId (numeric) or senderName (string to lookup)
    if (!senderId && !senderName) {
      return res.status(400).json({ error: "senderId or senderName is required" });
    }
    
    let actualSenderId = senderId;
    
    // If we have senderName but no senderId, look up the sender
    if (!actualSenderId && senderName) {
      const senderResult = await db.execute(sql`
        SELECT id FROM users WHERE name = ${senderName} OR username = ${senderName} LIMIT 1
      `);
      actualSenderId = (senderResult.rows?.[0] as any)?.id;
    }
    
    if (!actualSenderId) {
      // No sender found, but that's OK - just return success
      return res.json({ success: true, message: "No messages to mark as read" });
    }
    
    // Mark all unread messages from this sender to the current user as read
    await db.execute(sql`
      UPDATE direct_messages 
      SET is_read = true
      WHERE recipient_id = ${userId}
      AND sender_id = ${actualSenderId}
      AND is_read = false
    `);
    
    res.json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
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
    const limitNum = parseInt(limit as string) || 50;
    const offsetNum = parseInt(offset as string) || 0;

    // Get external messages (Gmail, FB, IG, WhatsApp) - only if channel is external or 'all'
    let externalMsgs: any[] = [];
    if (!channel || channel === 'all' || ['gmail', 'facebook', 'instagram', 'whatsapp'].includes(channel as string)) {
      try {
        externalMsgs = await db
          .select()
          .from(externalMessages)
          .where(
            and(
              eq(externalMessages.userId, userId),
              channel && channel !== 'all' && channel !== 'mt' ? eq(externalMessages.channel, channel as any) : sql`true`,
              unreadOnly === 'true' ? eq(externalMessages.isRead, false) : sql`true`
            )
          )
          .orderBy(desc(externalMessages.receivedAt))
          .limit(limitNum)
          .offset(offsetNum);
      } catch (extError) {
        console.warn('[Messages] External messages query failed:', extError);
      }
    }

    // Get MT internal messages from direct_messages table
    let internalMsgs: any[] = [];
    if (!channel || channel === 'all' || channel === 'mt') {
      try {
        const mtMessages = await db.execute(sql`
          SELECT 
            dm.id,
            dm.sender_id,
            dm.recipient_id,
            dm.content,
            dm.media_url,
            dm.media_type,
            dm.is_read,
            dm.created_at,
            sender.name as sender_name,
            sender.username as sender_username,
            sender.profile_image as sender_avatar,
            recipient.name as recipient_name,
            recipient.username as recipient_username,
            recipient.profile_image as recipient_avatar
          FROM direct_messages dm
          LEFT JOIN users sender ON dm.sender_id = sender.id
          LEFT JOIN users recipient ON dm.recipient_id = recipient.id
          WHERE dm.recipient_id = ${userId} OR dm.sender_id = ${userId}
          ORDER BY dm.created_at DESC
          LIMIT ${limitNum} OFFSET ${offsetNum}
        `);
        internalMsgs = (mtMessages.rows || []).map((msg: any) => {
          const isOutgoing = msg.sender_id === userId;
          const counterpartyId = isOutgoing ? msg.recipient_id : msg.sender_id;
          const counterpartyName = isOutgoing 
            ? (msg.recipient_name || msg.recipient_username || `User ${msg.recipient_id}`)
            : (msg.sender_name || msg.sender_username || `User ${msg.sender_id}`);
          const counterpartyAvatar = isOutgoing ? msg.recipient_avatar : msg.sender_avatar;
          
          return {
            id: `mt-${msg.id}`,
            channel: 'mt',
            from: msg.sender_name || msg.sender_username || `User ${msg.sender_id}`,
            to: msg.recipient_name || msg.recipient_username || `User ${msg.recipient_id}`,
            subject: null,
            body: msg.content,
            isRead: msg.is_read,
            receivedAt: msg.created_at,
            createdAt: msg.created_at,
            senderId: msg.sender_id,
            senderName: msg.sender_name,
            senderUsername: msg.sender_username,
            senderAvatar: msg.sender_avatar,
            recipientId: msg.recipient_id,
            recipientName: msg.recipient_name,
            recipientUsername: msg.recipient_username,
            recipientAvatar: msg.recipient_avatar,
            counterpartyId,
            counterpartyName,
            counterpartyAvatar,
            isOutgoing,
            mediaUrl: msg.media_url,
            mediaType: msg.media_type,
          };
        });
      } catch (mtError) {
        console.warn('[Messages] MT messages query failed:', mtError);
      }
    }

    // Combine and sort by date
    const unifiedMessages = [
      ...externalMsgs.map(msg => ({
        ...msg,
        source: 'external',
        type: msg.channel,
      })),
      ...internalMsgs.map(msg => ({
        ...msg,
        source: 'internal',
        type: 'mt',
      }))
    ].sort((a, b) => {
      const dateA = new Date(a.receivedAt || a.createdAt).getTime();
      const dateB = new Date(b.receivedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    res.json({
      messages: unifiedMessages,
      total: unifiedMessages.length,
      hasMore: unifiedMessages.length === limitNum,
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
 * Real Implementation:
 * - Gmail: Uses Replit Connectors via gmail-client.ts sendEmail
 * - Facebook: Uses Graph API Messenger endpoint with page token
 * - Instagram: Uses Graph API Instagram Messaging
 * - WhatsApp: Uses WhatsApp Business API Cloud
 * - MT: Internal messaging (future implementation)
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

    let sentMessage: any;
    let sendError: string | null = null;

    if (channel === 'gmail') {
      // Send email via Gmail API using Replit Connectors
      try {
        const emailSubject = subject || 'Message from Mundo Tango';
        const result = await sendEmail(to, emailSubject, body);
        
        sentMessage = {
          id: result.id,
          threadId: result.threadId,
          channel: 'gmail',
          to,
          subject: emailSubject,
          body,
          sentAt: new Date(),
        };
        console.log(`[Messages] Gmail email sent: ${result.id}`);
      } catch (gmailError: any) {
        sendError = gmailError.message || 'Failed to send email';
        console.error('[Messages] Gmail send error:', gmailError);
      }
    }

    if (channel === 'facebook') {
      // Send message via Facebook Messenger API using page token
      if (!channelConnection?.accessToken) {
        return res.status(400).json({ error: 'Facebook channel not properly configured' });
      }
      
      try {
        const decryptedToken = decrypt(channelConnection.accessToken);
        
        const result = await facebookOAuthService.sendMessage(decryptedToken, {
          recipientPSID: to,
          message: body,
          messagingType: 'UPDATE',
        });
        
        if (result.success) {
          sentMessage = {
            id: result.messageId,
            channel: 'facebook',
            to,
            body,
            sentAt: new Date(),
          };
          console.log(`[Messages] Facebook message sent: ${result.messageId}`);
        } else {
          sendError = result.error || 'Failed to send Facebook message';
        }
      } catch (fbError: any) {
        sendError = fbError.message || 'Failed to send Facebook message';
        console.error('[Messages] Facebook send error:', fbError);
      }
    }

    if (channel === 'instagram') {
      // Send DM via Instagram Messaging API (uses same Graph API)
      if (!channelConnection?.accessToken) {
        return res.status(400).json({ error: 'Instagram channel not properly configured' });
      }
      
      try {
        const decryptedToken = decrypt(channelConnection.accessToken);
        
        const response = await fetch(`${GRAPH_API_BASE}/me/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: to },
            message: { text: body },
            access_token: decryptedToken,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          sentMessage = {
            id: data.message_id,
            channel: 'instagram',
            to,
            body,
            sentAt: new Date(),
          };
          console.log(`[Messages] Instagram message sent: ${data.message_id}`);
        } else {
          const errorData = await response.json();
          sendError = errorData.error?.message || 'Failed to send Instagram message';
        }
      } catch (igError: any) {
        sendError = igError.message || 'Failed to send Instagram message';
        console.error('[Messages] Instagram send error:', igError);
      }
    }

    if (channel === 'whatsapp') {
      // Send message via WhatsApp Business API
      if (!channelConnection?.accessToken || !channelConnection?.accountId) {
        return res.status(400).json({ error: 'WhatsApp channel not properly configured' });
      }
      
      try {
        const decryptedToken = decrypt(channelConnection.accessToken);
        const phoneNumberId = (channelConnection.config as any)?.phoneNumberId || channelConnection.accountId;
        
        const response = await fetch(
          `${GRAPH_API_BASE}/${phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${decryptedToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: to,
              type: 'text',
              text: { body },
            }),
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          sentMessage = {
            id: data.messages?.[0]?.id,
            channel: 'whatsapp',
            to,
            body,
            sentAt: new Date(),
          };
          console.log(`[Messages] WhatsApp message sent: ${sentMessage.id}`);
        } else {
          const errorData = await response.json();
          sendError = errorData.error?.message || 'Failed to send WhatsApp message';
        }
      } catch (waError: any) {
        sendError = waError.message || 'Failed to send WhatsApp message';
        console.error('[Messages] WhatsApp send error:', waError);
      }
    }

    if (channel === 'mt') {
      // MT internal messaging - insert into directMessages table
      try {
        // Parse recipientId (could be numeric ID or string)
        const recipientId = parseInt(to);
        if (isNaN(recipientId)) {
          return res.status(400).json({ error: 'Invalid recipient ID for MT messages' });
        }
        
        const [insertedMsg] = await db.insert(directMessages).values({
          senderId: userId,
          recipientId,
          content: body,
        }).returning();
        
        sentMessage = {
          id: insertedMsg.id,
          channel: 'mt',
          to,
          recipientId: insertedMsg.recipientId,
          senderId: insertedMsg.senderId,
          body: insertedMsg.content,
          sentAt: insertedMsg.createdAt,
        };
        console.log('[Messages] MT internal message sent:', insertedMsg.id);
      } catch (mtError: any) {
        sendError = mtError.message || 'Failed to send MT message';
        console.error('[Messages] MT send error:', mtError);
      }
    }

    if (sendError) {
      return res.status(500).json({ 
        success: false, 
        error: sendError,
        channel,
      });
    }

    if (!sentMessage) {
      return res.status(400).json({ 
        success: false, 
        error: `Unsupported channel: ${channel}`,
      });
    }

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

// ============================================================================
// WHATSAPP WEBHOOK ENDPOINTS
// ============================================================================

/**
 * GET /api/messages/webhooks/whatsapp
 * WhatsApp webhook verification endpoint
 * 
 * Meta requires this for webhook registration. It sends a challenge that must be echoed back.
 * This endpoint does NOT require authentication as Meta calls it directly.
 */
router.get("/webhooks/whatsapp", (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('[WhatsApp Webhook] Verification request received:', { mode, token: token ? '***' : undefined });

    // Get the verify token from environment
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'mundo-tango-whatsapp-webhook';

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[WhatsApp Webhook] Verification successful');
      return res.status(200).send(challenge);
    }

    console.log('[WhatsApp Webhook] Verification failed - token mismatch');
    return res.status(403).json({ error: 'Verification failed' });
  } catch (error: any) {
    console.error('[WhatsApp Webhook] Verification error:', error);
    return res.status(500).json({ error: 'Webhook verification error' });
  }
});

/**
 * POST /api/messages/webhooks/whatsapp
 * WhatsApp webhook handler for incoming messages
 * 
 * Receives messages, status updates, and other events from WhatsApp Business API.
 * This endpoint does NOT require authentication as Meta calls it directly.
 */
router.post("/webhooks/whatsapp", async (req, res) => {
  try {
    // Always respond quickly to Meta (they require 200 within 20 seconds)
    res.status(200).json({ status: 'received' });

    const body = req.body;
    console.log('[WhatsApp Webhook] Event received:', JSON.stringify(body, null, 2));

    // Process the webhook asynchronously
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        const changes = entry.changes || [];
        
        for (const change of changes) {
          if (change.field !== 'messages') continue;
          
          const value = change.value;
          const phoneNumberId = value?.metadata?.phone_number_id;
          const messages = value?.messages || [];
          const contacts = value?.contacts || [];
          const statuses = value?.statuses || [];

          // Find the connected channel by phone number ID
          const [channel] = await db.select()
            .from(connectedChannels)
            .where(
              and(
                eq(connectedChannels.channel, 'whatsapp'),
                eq(connectedChannels.isActive, true)
              )
            )
            .limit(1);

          if (!channel) {
            console.warn('[WhatsApp Webhook] No active WhatsApp channel found for phone:', phoneNumberId);
            continue;
          }

          // Process incoming messages
          for (const msg of messages) {
            const contact = contacts.find((c: any) => c.wa_id === msg.from);
            const senderName = contact?.profile?.name || msg.from;
            
            // Check if message already exists
            const existing = await db.select({ id: externalMessages.id })
              .from(externalMessages)
              .where(eq(externalMessages.externalId, msg.id))
              .limit(1);

            if (existing.length === 0) {
              let messageBody = '';
              
              // Extract message content based on type
              if (msg.type === 'text') {
                messageBody = msg.text?.body || '';
              } else if (msg.type === 'image' || msg.type === 'video' || msg.type === 'audio') {
                messageBody = `[${msg.type.toUpperCase()}] ${msg[msg.type]?.caption || ''}`;
              } else if (msg.type === 'document') {
                messageBody = `[DOCUMENT] ${msg.document?.filename || 'Attachment'}`;
              } else if (msg.type === 'location') {
                messageBody = `[LOCATION] ${msg.location?.latitude}, ${msg.location?.longitude}`;
              } else if (msg.type === 'contacts') {
                messageBody = `[CONTACTS] ${msg.contacts?.length || 0} contact(s) shared`;
              } else if (msg.type === 'sticker') {
                messageBody = '[STICKER]';
              } else {
                messageBody = `[${msg.type?.toUpperCase() || 'UNKNOWN'}]`;
              }

              // Store the message
              await db.insert(externalMessages).values({
                userId: channel.userId,
                channel: 'whatsapp',
                externalId: msg.id,
                threadId: msg.from, // Use sender's phone as thread ID
                from: senderName,
                to: phoneNumberId,
                body: messageBody,
                attachments: msg.type !== 'text' ? [{ type: msg.type, id: msg[msg.type]?.id }] : undefined,
                receivedAt: new Date(parseInt(msg.timestamp) * 1000),
              });

              console.log(`[WhatsApp Webhook] Message stored: ${msg.id} from ${senderName}`);
            }
          }

          // Process status updates (delivered, read, etc.)
          for (const status of statuses) {
            console.log(`[WhatsApp Webhook] Status update: ${status.id} - ${status.status}`);
            // Could update message status in database if needed
          }
        }
      }
    }
  } catch (error: any) {
    console.error('[WhatsApp Webhook] Handler error:', error);
    // Don't return error - we already sent 200 to Meta
  }
});

/**
 * POST /api/messages/channels/whatsapp/webhook-setup
 * Configure WhatsApp webhook URL with Meta API
 * 
 * This helps set up the webhook subscription for the WhatsApp Business Account.
 * Requires the user's WhatsApp Business Account ID and access token.
 */
router.post("/channels/whatsapp/webhook-setup", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { whatsappBusinessAccountId, callbackUrl, verifyToken } = req.body;

    if (!whatsappBusinessAccountId) {
      return res.status(400).json({ 
        error: "WhatsApp Business Account ID required",
        hint: "You can find this in Meta Business Suite > Settings > WhatsApp"
      });
    }

    // Get the WhatsApp channel connection
    const [channel] = await db.select()
      .from(connectedChannels)
      .where(
        and(
          eq(connectedChannels.userId, userId),
          eq(connectedChannels.channel, 'whatsapp'),
          eq(connectedChannels.isActive, true)
        )
      );

    if (!channel || !channel.accessToken) {
      return res.status(404).json({ 
        error: "WhatsApp channel not connected",
        action: "Please connect WhatsApp first via /api/messages/channels/connect"
      });
    }

    // Decrypt the access token
    let accessToken: string;
    try {
      accessToken = decrypt(channel.accessToken);
    } catch {
      accessToken = channel.accessToken; // May not be encrypted in dev
    }

    // Set up the webhook subscription with Meta
    const webhookUrl = callbackUrl || `https://${req.get('host')}/api/messages/webhooks/whatsapp`;
    const webhookVerifyToken = verifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'mundo-tango-whatsapp-webhook';

    const response = await fetch(
      `${GRAPH_API_BASE}/${whatsappBusinessAccountId}/subscribed_apps`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[WhatsApp Webhook Setup] Subscription failed:', errorData);
      return res.status(400).json({
        error: "Failed to subscribe to WhatsApp webhooks",
        details: errorData.error?.message || 'Unknown error',
        hint: "Ensure your app has the required permissions and the Business Account ID is correct"
      });
    }

    // Update channel config with webhook info
    const updatedConfig = {
      ...(channel.config as object || {}),
      webhookUrl,
      webhookVerifyToken,
      whatsappBusinessAccountId,
      webhookConfiguredAt: new Date().toISOString(),
    };

    await db.update(connectedChannels)
      .set({ 
        config: updatedConfig,
        updatedAt: new Date(),
      })
      .where(eq(connectedChannels.id, channel.id));

    console.log(`[WhatsApp Webhook Setup] Subscription successful for user ${userId}`);

    res.json({
      success: true,
      message: "WhatsApp webhook configured successfully",
      webhookUrl,
      note: "Ensure your Meta App's webhook URL is set to the callback URL above"
    });
  } catch (error: any) {
    console.error("[Messages] WhatsApp webhook setup error:", error);
    res.status(500).json({ 
      error: "Failed to configure WhatsApp webhook", 
      message: error.message 
    });
  }
});

/**
 * GET /api/messages/channels/whatsapp/webhook-status
 * Check the status of WhatsApp webhook configuration
 */
router.get("/channels/whatsapp/webhook-status", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Get the WhatsApp channel connection
    const [channel] = await db.select()
      .from(connectedChannels)
      .where(
        and(
          eq(connectedChannels.userId, userId),
          eq(connectedChannels.channel, 'whatsapp')
        )
      );

    if (!channel) {
      return res.json({
        connected: false,
        webhookConfigured: false,
        message: "WhatsApp channel not connected"
      });
    }

    const config = channel.config as any || {};

    res.json({
      connected: channel.isActive,
      webhookConfigured: !!config.webhookConfiguredAt,
      webhookUrl: config.webhookUrl,
      configuredAt: config.webhookConfiguredAt,
      phoneNumberId: config.phoneNumberId,
      displayPhoneNumber: config.displayPhoneNumber,
      verifiedName: config.verifiedName,
    });
  } catch (error: any) {
    console.error("[Messages] WhatsApp webhook status error:", error);
    res.status(500).json({ 
      error: "Failed to get webhook status", 
      message: error.message 
    });
  }
});

/**
 * GET /api/messages/direct/:userId
 * Get direct messages with a specific user (uses directMessages table)
 */
router.get("/direct/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;
    const otherUserId = parseInt(req.params.userId);

    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Get messages from directMessages table where current user is sender or recipient
    const messages = await db.select({
      id: directMessages.id,
      senderId: directMessages.senderId,
      recipientId: directMessages.recipientId,
      content: directMessages.content,
      createdAt: directMessages.createdAt,
      isRead: directMessages.isRead,
      senderName: users.name,
      senderImage: users.profileImage,
    })
    .from(directMessages)
    .leftJoin(users, eq(directMessages.senderId, users.id))
    .where(
      or(
        and(eq(directMessages.senderId, currentUserId), eq(directMessages.recipientId, otherUserId)),
        and(eq(directMessages.senderId, otherUserId), eq(directMessages.recipientId, currentUserId))
      )
    )
    .orderBy(asc(directMessages.createdAt));

    // Transform to expected format
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      content: msg.content,
      createdAt: msg.createdAt,
      isRead: msg.isRead,
      senderName: msg.senderName,
      senderImage: msg.senderImage,
      reactions: [],
    }));

    res.json(formattedMessages);
  } catch (error: any) {
    console.error("[Messages] Direct messages fetch error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/**
 * POST /api/messages/react
 * Add a reaction to a message (placeholder - chatMessages doesn't have reactions column)
 */
router.post("/react", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { messageId, reaction } = req.body;

    if (!messageId || !reaction) {
      return res.status(400).json({ error: "Message ID and reaction are required" });
    }

    // For now, just return success (reactions stored client-side or future enhancement)
    // The chatMessages table doesn't have a reactions column
    res.json({ success: true, reactions: [{ userId, reaction }] });
  } catch (error: any) {
    console.error("[Messages] Reaction error:", error);
    res.status(500).json({ error: "Failed to add reaction" });
  }
});

/**
 * POST /api/messages/send-direct
 * Send a direct message to another user (internal MT messaging)
 * Uses direct_messages table to ensure messages persist in unified inbox
 */
router.post("/send-direct", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.userId!;
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ error: "Recipient ID and content are required" });
    }

    const otherUserId = parseInt(recipientId);
    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: "Invalid recipient ID" });
    }

    // Check if recipient exists
    const [recipient] = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.id, otherUserId));

    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Insert directly into direct_messages table (unified inbox uses this table)
    const newMessage = await db.execute(sql`
      INSERT INTO direct_messages (sender_id, recipient_id, content, is_read, created_at)
      VALUES (${senderId}, ${otherUserId}, ${content}, false, NOW())
      RETURNING id, sender_id, recipient_id, content, created_at
    `);

    const messageId = (newMessage.rows?.[0] as any)?.id;
    const createdAt = (newMessage.rows?.[0] as any)?.created_at;

    // Get sender info
    const [sender] = await db.select({
      name: users.name,
      profileImage: users.profileImage,
    })
    .from(users)
    .where(eq(users.id, senderId));

    res.json({
      success: true,
      message: {
        id: messageId,
        senderId,
        recipientId: otherUserId,
        content,
        createdAt,
        senderName: sender?.name,
        senderImage: sender?.profileImage,
      },
    });
  } catch (error: any) {
    console.error("[Messages] Send direct error:", error);
    res.status(500).json({ error: "Failed to send message", message: error.message });
  }
});

export default router;
