/**
 * FACEBOOK MESSENGER WEBHOOKS
 * 
 * Handles Facebook Messenger Platform webhooks for Mundo Tango
 * Pattern 32: Facebook Messenger Expert Agent (MB.MD v9.0)
 * 
 * Features:
 * - Webhook verification (GET)
 * - Event notifications (POST)
 * - PSID capture and storage
 * - Automatic welcome messages
 * - Signature validation
 */

import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { FacebookMessengerService } from '../services/facebook/FacebookMessengerService';

const router = Router();

// Environment variables
const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'mundo_tango_webhook_2025';
const APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

/**
 * GET /webhooks/facebook - Webhook Verification
 * 
 * Facebook sends this request to verify our webhook endpoint
 */
router.get('/webhooks/facebook', (req, res) => {
  console.log('[Facebook Webhook] Verification request received');
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Facebook Webhook] ✅ Verification successful');
    res.status(200).send(challenge);
  } else {
    console.error('[Facebook Webhook] ❌ Verification failed - token mismatch');
    res.sendStatus(403);
  }
});

/**
 * POST /webhooks/facebook - Event Notifications
 * 
 * Facebook sends events here when users interact with our page
 */
router.post('/webhooks/facebook', async (req, res) => {
  // CRITICAL: Respond immediately (must be within 5 seconds)
  res.status(200).send('EVENT_RECEIVED');
  
  // Process events asynchronously
  try {
    const body = req.body;
    
    console.log('[Facebook Webhook] Event received:', JSON.stringify(body, null, 2));
    
    if (body.object !== 'page') {
      console.log('[Facebook Webhook] Ignoring non-page event');
      return;
    }
    
    // Process each entry
    for (const entry of body.entry) {
      // Process each messaging event
      if (!entry.messaging) continue;
      
      for (const event of entry.messaging) {
        const psid = event.sender?.id;
        
        if (!psid) {
          console.log('[Facebook Webhook] No PSID in event');
          continue;
        }
        
        console.log(`[Facebook Webhook] Processing event for PSID: ${psid}`);
        
        // Handle different event types
        if (event.message) {
          await handleMessage(psid, event.message);
        } else if (event.postback) {
          await handlePostback(psid, event.postback);
        } else if (event.messaging_postbacks) {
          await handlePostback(psid, event.messaging_postbacks);
        }
      }
    }
  } catch (error) {
    console.error('[Facebook Webhook] Error processing event:', error);
  }
});

/**
 * Handle incoming messages
 */
async function handleMessage(psid: string, message: any) {
  console.log(`[Facebook Message] PSID ${psid}: ${message.text || '[attachment]'}`);
  
  try {
    // Store or update PSID in database
    await storePSID(psid);
    
    // Check if this is first message
    const isNewUser = await isFirstMessage(psid);
    
    if (isNewUser) {
      // Send welcome message
      await FacebookMessengerService.sendMessage({
        recipientPSID: psid,
        message: `👋 Welcome to Mundo Tango!

Thanks for reaching out! We're excited to connect with you.

🌟 Mundo Tango is the premier platform for the global tango community - connecting dancers, teachers, and venues worldwide.

How can we help you today?

Reply with:
• "Events" - See upcoming tango events
• "Join" - Create your Mundo Tango account  
• "Info" - Learn more about our platform

Or just tell us what you're looking for! 💃🕺`
      });
    } else {
      // Echo back for testing (remove in production)
      const userMessage = message.text || 'I received your message!';
      
      await FacebookMessengerService.sendMessage({
        recipientPSID: psid,
        message: `You said: "${userMessage}"

This is a test echo. In production, Mr. Blue AI will respond intelligently! 🤖`
      });
    }
  } catch (error) {
    console.error(`[Facebook Message] Error handling message from ${psid}:`, error);
  }
}

/**
 * Handle postback events (button clicks)
 */
async function handlePostback(psid: string, postback: any) {
  console.log(`[Facebook Postback] PSID ${psid}: ${postback.payload}`);
  
  try {
    const payload = postback.payload;
    
    switch (payload) {
      case 'GET_STARTED':
        await FacebookMessengerService.sendMessage({
          recipientPSID: psid,
          message: `🎉 Welcome to Mundo Tango!

Let's get you started. What brings you here?

1️⃣ I want to find tango events
2️⃣ I'm a teacher/venue owner
3️⃣ I just love tango and want to connect
4️⃣ I have a question

Just reply with the number!`
        });
        break;
        
      default:
        console.log(`[Facebook Postback] Unknown payload: ${payload}`);
    }
  } catch (error) {
    console.error(`[Facebook Postback] Error handling postback from ${psid}:`, error);
  }
}

/**
 * Store PSID in database
 */
async function storePSID(psid: string): Promise<void> {
  try {
    // Check if PSID already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.facebookPSID, psid))
      .limit(1);
    
    if (existingUser.length > 0) {
      // Update last message time
      await db
        .update(users)
        .set({
          facebookLastMessageAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.facebookPSID, psid));
      
      console.log(`[Facebook DB] Updated existing user PSID: ${psid}`);
    } else {
      // Note: Cannot create user without email
      // Just log for now - user will be linked later
      console.log(`[Facebook DB] New PSID detected (not yet linked): ${psid}`);
    }
  } catch (error) {
    console.error('[Facebook DB] Error storing PSID:', error);
  }
}

/**
 * Check if this is the first message from this PSID
 */
async function isFirstMessage(psid: string): Promise<boolean> {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.facebookPSID, psid))
      .limit(1);
    
    return user.length === 0 || !user[0].facebookLastMessageAt;
  } catch (error) {
    console.error('[Facebook DB] Error checking first message:', error);
    return false;
  }
}

/**
 * Validate webhook signature (security)
 */
export function validateSignature(req: any, buf: Buffer): void {
  if (!APP_SECRET) {
    console.warn('[Facebook Security] No APP_SECRET configured - skipping validation');
    return;
  }
  
  const signature = req.headers['x-hub-signature-256'];
  
  if (!signature) {
    console.warn('[Facebook Security] No signature in headers');
    return;
  }
  
  const expectedHash = crypto
    .createHmac('sha256', APP_SECRET)
    .update(buf)
    .digest('hex');
  
  const actualHash = signature.split('=')[1];
  
  if (expectedHash !== actualHash) {
    throw new Error('Invalid signature');
  }
}

export default router;
