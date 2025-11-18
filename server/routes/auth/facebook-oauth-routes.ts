import { Router } from 'express';
import { z } from 'zod';
import { supabaseSyncService } from '@/server/services/auth/SupabaseSyncService';
import { facebookOAuthService } from '@/server/services/facebook/FacebookOAuthService';

const router = Router();

/**
 * Facebook OAuth Connect Endpoint
 * 
 * Called after user completes Facebook OAuth flow
 * 
 * Flow:
 * 1. Receive Supabase user data + User Access Token
 * 2. Sync Supabase user to MT users table
 * 3. Exchange User Token for Page Access Token
 * 4. Store Page Token in database
 * 5. Return success
 * 
 * MB.MD v9.0 Pattern 25 (Platform Compliance):
 * - Uses official Graph API (no browser automation)
 * - Proper error handling with user-friendly messages
 * - Rate limiting via Graph API built-in limits
 * - No credential logging (tokens never logged in full)
 */

const connectFacebookSchema = z.object({
  supabaseUserId: z.string().min(1),
  userAccessToken: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().optional(),
  facebookUserId: z.string().optional(),
  profileImage: z.string().url().optional(),
});

router.post('/connect', async (req, res) => {
  try {
    console.log('[FacebookOAuth] Connect request received');

    // Validate request body
    const validationResult = connectFacebookSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.error('[FacebookOAuth] Validation failed:', validationResult.error);
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors,
      });
    }

    const { 
      supabaseUserId, 
      userAccessToken, 
      email, 
      fullName, 
      facebookUserId,
      profileImage 
    } = validationResult.data;

    // Step 1: Sync Supabase user to MT database
    console.log('[FacebookOAuth] Syncing user to MT database:', email);
    
    const mtUser = await supabaseSyncService.syncUser({
      supabaseUserId,
      email,
      fullName,
      facebookUserId,
      profileImage,
    });

    console.log('[FacebookOAuth] User synced:', mtUser.id);

    // Step 2: Exchange User Access Token for Page Access Token
    console.log('[FacebookOAuth] Exchanging for Page Access Token...');
    
    let pageTokenData;
    try {
      pageTokenData = await facebookOAuthService.exchangeForPageToken(userAccessToken);
    } catch (tokenError: any) {
      console.error('[FacebookOAuth] Token exchange failed:', tokenError);
      
      // Return partial success - user is synced but no page token
      return res.status(207).json({
        success: true,
        partial: true,
        userId: mtUser.id,
        error: 'User created but Facebook Page connection failed',
        details: tokenError.message,
        action: 'Please ensure you have a Facebook Page and try again',
      });
    }

    // Step 3: Store Page Access Token in database
    console.log('[FacebookOAuth] Storing Page Access Token...');
    
    await supabaseSyncService.updatePageToken(mtUser.id, {
      pageId: pageTokenData.pageId,
      pageAccessToken: pageTokenData.pageAccessToken,
      expiresAt: pageTokenData.expiresAt,
    });

    console.log('[FacebookOAuth] Facebook OAuth connection complete!', {
      userId: mtUser.id,
      pageId: pageTokenData.pageId,
      pageName: pageTokenData.pageName,
    });

    // Step 4: Return success
    return res.status(200).json({
      success: true,
      userId: mtUser.id,
      pageId: pageTokenData.pageId,
      pageName: pageTokenData.pageName,
      expiresAt: pageTokenData.expiresAt.toISOString(),
      message: 'Facebook connected successfully! You can now send Messenger invitations.',
    });

  } catch (error) {
    console.error('[FacebookOAuth] Connect error:', error);
    
    return res.status(500).json({
      error: 'Failed to connect Facebook account',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get Facebook connection status
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hasToken = await supabaseSyncService.hasValidPageToken(userId);
    const user = await supabaseSyncService.getUserBySupabaseId(req.user.supabaseUserId || '');

    return res.status(200).json({
      connected: hasToken,
      pageId: user?.facebookPageId || null,
      expiresAt: user?.facebookTokenExpiresAt || null,
      scopes: user?.facebookScopes || [],
    });

  } catch (error) {
    console.error('[FacebookOAuth] Status check error:', error);
    return res.status(500).json({ error: 'Failed to check connection status' });
  }
});

/**
 * Disconnect Facebook
 */
router.post('/disconnect', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Remove Facebook tokens from database
    await supabaseSyncService.updatePageToken(userId, {
      pageId: '',
      pageAccessToken: '',
      expiresAt: new Date(0),
    });

    return res.status(200).json({
      success: true,
      message: 'Facebook disconnected successfully',
    });

  } catch (error) {
    console.error('[FacebookOAuth] Disconnect error:', error);
    return res.status(500).json({ error: 'Failed to disconnect Facebook' });
  }
});

export default router;
