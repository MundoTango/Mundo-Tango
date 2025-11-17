/**
 * Facebook Messenger Routes
 * API endpoints for Facebook invite generation and sending
 */

import { Router } from 'express';
import { db } from '@shared/db';
import { friendInvitations, users, insertFriendInvitationSchema } from '@shared/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { AIInviteGenerator } from '../services/facebook/AIInviteGenerator';
import { FacebookMessengerService } from '../services/facebook/FacebookMessengerService';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();

// ============================================================================
// PHASE 1: TOKEN VALIDATION (P0 CRITICAL)
// ============================================================================

router.get('/validate-token', async (req, res) => {
  try {
    console.log('[API] Testing Facebook token validation...');
    const result = await FacebookMessengerService.validateToken();
    
    if (result.isValid) {
      return res.json({
        success: true,
        message: '✅ Facebook token is VALID',
        token: {
          appId: result.appId,
          userId: result.userId,
          expiresAt: result.expiresAt,
          scopes: result.scopes,
          neverExpires: !result.expiresAt
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: '❌ Facebook token is INVALID',
        error: result.error,
        details: result.details
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Token validation failed',
      error: error.message
    });
  }
});

// ============================================================================
// GENERATE INVITE MESSAGE
// ============================================================================

const generateInviteSchema = z.object({
  friendName: z.string().min(1).max(255),
  friendEmail: z.string().email().optional(),
  relationship: z.string().optional(),
  sharedInterests: z.array(z.string()).optional(),
  customContext: z.string().optional(),
  variationCount: z.number().min(1).max(5).optional().default(1)
});

router.post('/generate-invite', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = generateInviteSchema.parse(req.body);

    // Generate invite(s)
    if (data.variationCount && data.variationCount > 1) {
      const variations = await AIInviteGenerator.generateVariations(data, data.variationCount);
      
      return res.json({
        success: true,
        variations: variations.map(v => ({
          message: v.message,
          wordCount: v.wordCount,
          validation: AIInviteGenerator.validateMessage(v.message)
        })),
        totalCost: variations.reduce((sum, v) => sum + v.cost, 0),
        metadata: variations[0].metadata
      });
    } else {
      const invite = await AIInviteGenerator.generateInvite(data);
      const validation = AIInviteGenerator.validateMessage(invite.message);

      return res.json({
        success: true,
        message: invite.message,
        wordCount: invite.wordCount,
        cost: invite.cost,
        validation,
        metadata: invite.metadata
      });
    }
  } catch (error: any) {
    console.error('[Facebook] Generate invite error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to generate invite'
    });
  }
});

// ============================================================================
// SEND INVITE
// ============================================================================

const sendInviteSchema = z.object({
  friendName: z.string().min(1).max(255),
  friendEmail: z.string().email().optional(),
  friendFacebookId: z.string().optional(),
  message: z.string().min(50).max(2000),
  closenessScore: z.number().min(0).max(100).optional()
});

router.post('/send-invite', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const data = sendInviteSchema.parse(req.body);

    // Check rate limits
    const rateLimit = FacebookMessengerService.getRateLimitStatus(userId);
    if (!rateLimit.canSend) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        rateLimit
      });
    }

    // Generate unique invite code
    const inviteCode = crypto.randomBytes(16).toString('hex');

    // Send via Facebook Messenger
    let sendResult;
    if (data.friendFacebookId) {
      sendResult = await FacebookMessengerService.sendMessage({
        recipientId: data.friendFacebookId,
        message: data.message
      });
    } else if (data.friendEmail) {
      // For now, we'll log that we'd send via email as fallback
      sendResult = {
        success: true,
        messageId: `email_${inviteCode}`,
        timestamp: new Date()
      };
      console.log(`[Facebook] Would send invite to ${data.friendEmail} via email fallback`);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either friendFacebookId or friendEmail must be provided'
      });
    }

    if (!sendResult.success) {
      return res.status(500).json({
        success: false,
        error: sendResult.error || 'Failed to send message'
      });
    }

    // Track invite in database
    const [invitation] = await db.insert(friendInvitations).values({
      invitedBy: userId,
      invitedFriendName: data.friendName,
      invitedFriendEmail: data.friendEmail,
      invitedFriendFacebookId: data.friendFacebookId,
      inviteCode,
      inviteMessage: data.message,
      sentVia: data.friendFacebookId ? 'facebook_messenger' : 'email',
      closenessScore: data.closenessScore
    }).returning();

    // Track for rate limiting
    FacebookMessengerService.trackSentInvite(userId);

    return res.json({
      success: true,
      invitation,
      sendResult,
      rateLimit: FacebookMessengerService.getRateLimitStatus(userId)
    });
  } catch (error: any) {
    console.error('[Facebook] Send invite error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send invite'
    });
  }
});

// ============================================================================
// GET INVITE PROGRESS/STATS
// ============================================================================

router.get('/invites/progress', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Get all invites sent by user
    const invites = await db
      .select()
      .from(friendInvitations)
      .where(eq(friendInvitations.invitedBy, userId))
      .orderBy(desc(friendInvitations.sentAt));

    // Calculate stats
    const totalSent = invites.length;
    const opened = invites.filter(i => i.opened).length;
    const registered = invites.filter(i => i.registered).length;
    
    const openRate = totalSent > 0 ? (opened / totalSent) * 100 : 0;
    const conversionRate = totalSent > 0 ? (registered / totalSent) * 100 : 0;

    // Get rate limit info
    const rateLimit = FacebookMessengerService.getRateLimitStatus(userId);

    // Get today's invites
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sentToday = invites.filter(i => i.sentAt && new Date(i.sentAt) >= today).length;

    return res.json({
      success: true,
      stats: {
        totalSent,
        opened,
        registered,
        openRate: Math.round(openRate * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        sentToday
      },
      rateLimit
    });
  } catch (error: any) {
    console.error('[Facebook] Get progress error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get progress'
    });
  }
});

// ============================================================================
// GET INVITE HISTORY
// ============================================================================

router.get('/invites/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Get paginated invites
    const invites = await db
      .select()
      .from(friendInvitations)
      .where(eq(friendInvitations.invitedBy, userId))
      .orderBy(desc(friendInvitations.sentAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(friendInvitations)
      .where(eq(friendInvitations.invitedBy, userId));

    const totalPages = Math.ceil(Number(count) / limit);

    return res.json({
      success: true,
      invites,
      pagination: {
        page,
        limit,
        totalItems: Number(count),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error: any) {
    console.error('[Facebook] Get history error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get history'
    });
  }
});

// ============================================================================
// VERIFY FACEBOOK CONNECTION
// ============================================================================

router.get('/verify-connection', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const isConnected = await FacebookMessengerService.verifyConnection();
    
    if (isConnected) {
      const pageInfo = await FacebookMessengerService.getPageInfo();
      return res.json({
        success: true,
        connected: true,
        pageInfo
      });
    } else {
      return res.json({
        success: false,
        connected: false,
        error: 'Facebook connection failed'
      });
    }
  } catch (error: any) {
    console.error('[Facebook] Verify connection error:', error);
    return res.status(500).json({
      success: false,
      connected: false,
      error: error.message || 'Failed to verify connection'
    });
  }
});

export default router;
