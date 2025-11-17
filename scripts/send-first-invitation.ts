/**
 * Send First Mundo Tango Invitation via Facebook Messenger
 * From: admin@mundotango.life (Page: @mundotango1)
 * To: sboddye@gmail.com (Scott's Facebook account)
 * 
 * Usage:
 *   npx tsx scripts/send-first-invitation.ts
 */

import Messenger from 'messenger-node';
import dotenv from 'dotenv';

dotenv.config();

const client = new Messenger.Client({
  page_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN!,
  api_version: 'v18.0'
});

interface InvitationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

/**
 * Generate AI-powered personalized invitation
 */
function generatePersonalizedInvitation(recipientName: string = 'Friend'): string {
  return `¡Hola ${recipientName}! 🎵

This is Scott from Mundo Tango - I'm building something incredible and I want YOU to be part of it.

**What is Mundo Tango?**
The world's first AI-powered global tango community platform. Think "The Anti-Facebook" - authentic connections, not algorithms for ad revenue.

**Why am I reaching out?**
You're getting this exclusive early invite because you're part of my journey to reverse the negative impacts of social media. I've been coding 18 hrs/day since September to make this real.

**What's in it for you?**
• Connect with 10,000+ tango dancers worldwide 🌍
• Find milongas, teachers, events in ANY city
• AI-powered talent matching (find your perfect dance partner)
• Mr. Blue AI assistant (your personal tango concierge)
• First 1,000 members get LIFETIME Core access ($240/year value)

**The Mission:**
Replace division with community. Replace extraction with miracles. Change the world through tango.

Ready to join the movement?
👉 https://mundotango.life

Questions? Just reply here - I read every message.

Con abrazo,
Scott Boddye
Founder, Mundo Tango
admin@mundotango.life

P.S. This is invite #1 from our new Messenger bot. You're literally the first person to get this. History in the making! 🚀`;
}

/**
 * Send invitation with template (rich UI)
 */
async function sendInvitationWithTemplate(psid: string): Promise<InvitationResult> {
  const timestamp = new Date().toISOString();
  
  try {
    console.log('🚀 Preparing to send first Mundo Tango invitation...');
    console.log('📧 From: admin@mundotango.life (@mundotango1 Page)');
    console.log('📬 To PSID:', psid);
    console.log('⏰ Time:', timestamp);
    
    // First, send the personalized text message
    const textResponse = await client.sendMessage({
      recipient: { id: psid },
      message: {
        text: generatePersonalizedInvitation('Scott')
      }
    });
    
    console.log('✅ Text message sent. Message ID:', textResponse.message_id);
    
    // Then send a rich template with buttons
    const templateResponse = await client.sendMessage({
      recipient: { id: psid },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [{
              title: 'Join Mundo Tango Today! 💃🕺',
              subtitle: 'The global tango community awaits you',
              image_url: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800',
              buttons: [
                {
                  type: 'web_url',
                  url: 'https://mundotango.life/register',
                  title: 'Create Account'
                },
                {
                  type: 'web_url',
                  url: 'https://mundotango.life',
                  title: 'Learn More'
                },
                {
                  type: 'postback',
                  title: 'Ask Me Anything',
                  payload: 'ASK_QUESTION'
                }
              ]
            }]
          }
        }
      }
    });
    
    console.log('✅ Template sent. Message ID:', templateResponse.message_id);
    console.log('\n🎉 SUCCESS! First Mundo Tango invitation sent successfully!');
    console.log('📊 Track delivery in Facebook Page Inbox');
    
    return {
      success: true,
      messageId: templateResponse.message_id,
      timestamp
    };
    
  } catch (error: any) {
    console.error('\n❌ ERROR sending invitation:', error.message);
    
    if (error.code === 190) {
      console.error('\n🔑 TOKEN ERROR: Page Access Token is invalid or expired');
      console.error('   Follow these steps to fix:');
      console.error('   1. Go to: https://developers.facebook.com/tools/explorer/');
      console.error('   2. Select "Mundo Tango" app');
      console.error('   3. Select "Get Page Access Token"');
      console.error('   4. Check: pages_messaging, pages_manage_metadata, pages_read_engagement');
      console.error('   5. Copy token and run: npx tsx scripts/exchange-facebook-token.ts');
      console.error('   6. Try again');
    }
    
    return {
      success: false,
      error: error.message,
      timestamp
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  MUNDO TANGO - FIRST MESSENGER INVITATION');
  console.log('  Mission: Change the world through tango 🌍');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Validate environment
  if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
    console.error('❌ ERROR: FACEBOOK_PAGE_ACCESS_TOKEN not found in environment');
    console.error('   Set it in Replit Secrets or .env file');
    process.exit(1);
  }
  
  // IMPORTANT: You need to get Scott's PSID first
  // Option 1: Scott sends a message to @mundotango1 page first (then we can get his PSID)
  // Option 2: Use Facebook's test users feature
  // Option 3: Manual lookup via Graph API
  
  const SCOTT_PSID = process.env.SCOTT_FACEBOOK_PSID || '';
  
  if (!SCOTT_PSID) {
    console.error('\n⚠️  SCOTT\'S FACEBOOK PSID NOT SET\n');
    console.error('To get Scott\'s PSID, follow these steps:');
    console.error('1. Scott: Send any message to @mundotango1 page on Facebook');
    console.error('2. The webhook will log the PSID in console');
    console.error('3. Add PSID to .env: SCOTT_FACEBOOK_PSID=<psid>');
    console.error('4. Run this script again\n');
    console.error('Alternative: Use Facebook\'s Graph API to look up PSID by email');
    process.exit(1);
  }
  
  // Send the invitation!
  const result = await sendInvitationWithTemplate(SCOTT_PSID);
  
  if (result.success) {
    console.log('\n✨ MISSION ACCOMPLISHED ✨');
    console.log('First invitation in Mundo Tango history has been sent!');
    console.log('Message ID:', result.messageId);
    console.log('Timestamp:', result.timestamp);
    console.log('\nThe journey to change the world begins now. 🚀');
  } else {
    console.log('\n❌ Mission incomplete. Error:', result.error);
    console.log('Debug the issue and try again.');
  }
}

// Execute
main().catch(console.error);
