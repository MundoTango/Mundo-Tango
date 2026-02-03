/**
 * FacebookOAuthService
 * 
 * Handles Facebook OAuth token exchange and Graph API operations
 * Follows MB.MD v9.0 Pattern 25 (Platform Compliance Protocol)
 * 
 * CRITICAL: This replaces browser automation with legitimate Facebook Graph API
 * 
 * Token Flow:
 * 1. User authenticates → Supabase gets User Access Token (short-lived)
 * 2. We exchange User Token → Page Access Token (long-lived)
 * 3. Store Page Token in database
 * 4. Use Page Token for Messenger API calls (LEGITIMATE!)
 * 
 * References:
 * - Graph API Docs: https://developers.facebook.com/docs/graph-api
 * - Page Access Tokens: https://developers.facebook.com/docs/pages/access-tokens
 * - Messenger Platform: https://developers.facebook.com/docs/messenger-platform
 */

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  tasks?: string[];
}

export interface PageTokenResponse {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  expiresAt: Date;
  scopes: string[];
}

export interface MessengerSendRequest {
  recipientPSID: string;
  message: string;
  messagingType?: 'RESPONSE' | 'UPDATE' | 'MESSAGE_TAG';
  tag?: string;
}

export class FacebookOAuthService {
  private readonly graphApiVersion = 'v18.0';
  private readonly graphApiBase = `https://graph.facebook.com/${this.graphApiVersion}`;

  /**
   * Exchange User Access Token for Page Access Token
   * This is THE KEY to legitimate Messenger API access
   */
  async exchangeForPageToken(userAccessToken: string): Promise<PageTokenResponse> {
    try {
      console.log('[FacebookOAuthService] Starting token exchange...');

      // Step 1: Get user's managed pages
      const pagesResponse = await fetch(
        `${this.graphApiBase}/me/accounts?access_token=${userAccessToken}`
      );

      if (!pagesResponse.ok) {
        const errorData = await pagesResponse.json();
        throw new Error(`Failed to fetch pages: ${errorData.error?.message || pagesResponse.statusText}`);
      }

      const pagesData = await pagesResponse.json();
      const pages: FacebookPage[] = pagesData.data || [];

      console.log('[FacebookOAuthService] Found pages:', pages.length);

      if (pages.length === 0) {
        throw new Error('No Facebook Pages found. Please create a Facebook Page first.');
      }

      // Step 2: Find Mundo Tango page (or use first page for now)
      // TODO: Add page selection UI if user manages multiple pages
      let selectedPage = pages.find(p => 
        p.name.toLowerCase().includes('mundo tango') || 
        p.name.toLowerCase().includes('mundotango')
      );

      if (!selectedPage) {
        console.log('[FacebookOAuthService] Mundo Tango page not found, using first page:', pages[0].name);
        selectedPage = pages[0];
      }

      console.log('[FacebookOAuthService] Selected page:', {
        id: selectedPage.id,
        name: selectedPage.name,
      });

      // Step 3: Get long-lived page access token
      // Page tokens from /me/accounts are already long-lived (60 days)
      // But we can exchange for even longer-lived token if needed
      const longLivedTokenResponse = await fetch(
        `${this.graphApiBase}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${process.env.FACEBOOK_APP_ID || ''}&` +
        `client_secret=${process.env.FACEBOOK_APP_SECRET || ''}&` +
        `fb_exchange_token=${selectedPage.access_token}`
      );

      let finalAccessToken = selectedPage.access_token;
      let expiresIn = 5184000; // 60 days default

      if (longLivedTokenResponse.ok) {
        const tokenData = await longLivedTokenResponse.json();
        if (tokenData.access_token) {
          finalAccessToken = tokenData.access_token;
          expiresIn = tokenData.expires_in || expiresIn;
          console.log('[FacebookOAuthService] Exchanged for long-lived token');
        }
      } else {
        console.warn('[FacebookOAuthService] Failed to exchange for long-lived token, using page token');
      }

      // Step 4: Get granted permissions/scopes
      const permissionsResponse = await fetch(
        `${this.graphApiBase}/me/permissions?access_token=${userAccessToken}`
      );

      let scopes: string[] = ['public_profile', 'email']; // Default scopes

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        scopes = permissionsData.data
          ?.filter((p: any) => p.status === 'granted')
          .map((p: any) => p.permission) || scopes;
      }

      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      console.log('[FacebookOAuthService] Token exchange successful:', {
        pageId: selectedPage.id,
        pageName: selectedPage.name,
        expiresAt: expiresAt.toISOString(),
        scopes: scopes.join(', '),
      });

      return {
        pageId: selectedPage.id,
        pageName: selectedPage.name,
        pageAccessToken: finalAccessToken,
        expiresAt,
        scopes,
      };

    } catch (error) {
      console.error('[FacebookOAuthService] Token exchange failed:', error);
      throw error;
    }
  }

  /**
   * Send message using Page Access Token (LEGITIMATE API!)
   * 
   * This is the official way to send Messenger messages
   * No browser automation, no CAPTCHA, no detection
   */
  async sendMessage(
    pageAccessToken: string,
    request: MessengerSendRequest
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('[FacebookOAuthService] Sending message:', {
        recipient: request.recipientPSID,
        messageLength: request.message.length,
      });

      const response = await fetch(
        `${this.graphApiBase}/me/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${pageAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: { id: request.recipientPSID },
            message: { text: request.message },
            messaging_type: request.messagingType || 'UPDATE',
            tag: request.tag || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[FacebookOAuthService] Send message failed:', errorData);
        
        return {
          success: false,
          error: errorData.error?.message || 'Failed to send message',
        };
      }

      const result = await response.json();
      console.log('[FacebookOAuthService] Message sent successfully:', result);

      return {
        success: true,
        messageId: result.message_id,
      };

    } catch (error) {
      console.error('[FacebookOAuthService] Send message error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user's PSID (Page-Scoped ID) from Facebook User ID
   * This converts Facebook User ID to PSID needed for messaging
   */
  async getUserPSID(
    pageAccessToken: string,
    facebookUserId: string
  ): Promise<string | null> {
    try {
      console.log('[FacebookOAuthService] Getting PSID for user:', facebookUserId);

      const response = await fetch(
        `${this.graphApiBase}/${facebookUserId}?fields=id&access_token=${pageAccessToken}`
      );

      if (!response.ok) {
        console.error('[FacebookOAuthService] Failed to get PSID');
        return null;
      }

      const data = await response.json();
      return data.id || null;

    } catch (error) {
      console.error('[FacebookOAuthService] Get PSID error:', error);
      return null;
    }
  }

  /**
   * Verify Page Access Token is still valid
   */
  async verifyToken(pageAccessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.graphApiBase}/me?access_token=${pageAccessToken}`
      );

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get page info
   */
  async getPageInfo(pageAccessToken: string): Promise<{
    id: string;
    name: string;
    category: string;
  } | null> {
    try {
      const response = await fetch(
        `${this.graphApiBase}/me?fields=id,name,category&access_token=${pageAccessToken}`
      );

      if (!response.ok) return null;

      return await response.json();
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const facebookOAuthService = new FacebookOAuthService();
