/**
 * Send First Mundo Tango Invitation - DIRECT EXECUTION
 * Uses token directly from command line (no env needed)
 */

import axios from 'axios';

const TOKEN = process.argv[2] || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const RECIPIENT_PSID = process.argv[3] || process.env.SCOTT_FACEBOOK_PSID;

function generateInvitation(): string {
  return `¡Hola Scott! 🎵

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

async function sendTextMessage(psid: string, text: string) {
  const url = 'https://graph.facebook.com/v18.0/me/messages';
  
  const response = await axios.post(url, {
    recipient: { id: psid },
    message: { text }
  }, {
    params: { access_token: TOKEN }
  });
  
  return response.data;
}

async function sendTemplateMessage(psid: string) {
  const url = 'https://graph.facebook.com/v18.0/me/messages';
  
  const response = await axios.post(url, {
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
              }
            ]
          }]
        }
      }
    }
  }, {
    params: { access_token: TOKEN }
  });
  
  return response.data;
}

async function getConversations() {
  console.log('\n🔍 Looking for Scott in recent conversations...\n');
  
  try {
    const response = await axios.get(
      'https://graph.facebook.com/v18.0/me/conversations',
      {
        params: {
          access_token: TOKEN,
          fields: 'participants,updated_time,messages{message,from}',
          limit: 50
        }
      }
    );
    
    console.log(`✅ Found ${response.data.data.length} conversations\n`);
    
    for (const conv of response.data.data) {
      const participants = conv.participants?.data || [];
      for (const p of participants) {
        console.log(`   PSID: ${p.id} | Name: ${p.name || 'Unknown'}`);
      }
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    return [];
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  MUNDO TANGO - FIRST MESSENGER INVITATION');
  console.log('  Mission: Change the world through tango 🌍');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (!TOKEN) {
    console.error('❌ No token provided. Usage:');
    console.error('   npx tsx scripts/send-invitation-direct.ts <token> <psid>');
    console.error('   OR set FACEBOOK_PAGE_ACCESS_TOKEN env var');
    process.exit(1);
  }
  
  // First, get conversations to find PSIDs
  const conversations = await getConversations();
  
  if (!RECIPIENT_PSID) {
    console.log('\n⚠️  No PSID provided. Found these PSIDs above.');
    console.log('    Run again with: npx tsx scripts/send-invitation-direct.ts <token> <psid>');
    process.exit(0);
  }
  
  try {
    console.log(`\n🚀 Sending invitation to PSID: ${RECIPIENT_PSID}\n`);
    
    // Send text message
    console.log('📤 Sending personalized invitation text...');
    const textResult = await sendTextMessage(RECIPIENT_PSID, generateInvitation());
    console.log('✅ Text sent! Message ID:', textResult.message_id);
    
    // Send template
    console.log('\n📤 Sending rich template with buttons...');
    const templateResult = await sendTemplateMessage(RECIPIENT_PSID);
    console.log('✅ Template sent! Message ID:', templateResult.message_id);
    
    console.log('\n🎉 SUCCESS! First Mundo Tango invitation sent!');
    console.log('📱 Check your Facebook Messenger for the message');
    console.log('\n✨ MISSION ACCOMPLISHED ✨');
    console.log('The journey to change the world begins now. 🚀\n');
    
  } catch (error: any) {
    console.error('\n❌ Failed to send:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.code === 190) {
      console.error('\n🔑 Token is invalid or expired. Get a new one from:');
      console.error('   https://developers.facebook.com/tools/explorer/');
    }
    
    if (error.response?.data?.error?.message?.includes('does not exist')) {
      console.error('\n👤 PSID not found. User needs to message @mundotango1 first, or use a PSID from the list above.');
    }
    
    process.exit(1);
  }
}

main().catch(console.error);
