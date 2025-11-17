/**
 * Get Scott's Facebook PSID (Page-Scoped ID)
 * 
 * PSID is required to send messages to a user via Messenger.
 * There are 3 ways to get it:
 * 
 * METHOD 1: Scott messages @mundotango1 first (webhook captures PSID)
 * METHOD 2: Use Graph API with user access token
 * METHOD 3: Manual lookup via account linking
 * 
 * This script attempts all methods automatically.
 */

import axios from 'axios';

const PAGE_ID = process.env.FACEBOOK_PAGE_ID || '344494235403137';
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

/**
 * Method 1: Check webhook logs for Scott's recent messages
 * If Scott sent any message to @mundotango1, we can get his PSID from logs
 */
async function checkRecentConversations() {
  console.log('\n📋 METHOD 1: Checking recent page conversations...\n');
  
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${PAGE_ID}/conversations`,
      {
        params: {
          access_token: PAGE_TOKEN,
          fields: 'participants,updated_time,messages{message,from}',
          limit: 20
        }
      }
    );
    
    console.log('✅ Found', response.data.data.length, 'recent conversations');
    
    // Look for conversations with sboddye@gmail.com or Scott Boddye
    for (const conversation of response.data.data) {
      const participants = conversation.participants?.data || [];
      
      for (const participant of participants) {
        console.log(`   - Participant PSID: ${participant.id} (Name: ${participant.name || 'Unknown'})`);
        
        // If this is Scott, save his PSID
        if (participant.email === 'sboddye@gmail.com' || 
            participant.name?.toLowerCase().includes('scott') ||
            participant.name?.toLowerCase().includes('boddye')) {
          console.log('\n🎯 FOUND SCOTT\'S PSID!');
          console.log('   PSID:', participant.id);
          console.log('   Name:', participant.name);
          console.log('\n   Add to Replit Secrets:');
          console.log('   Key: SCOTT_FACEBOOK_PSID');
          console.log('   Value:', participant.id);
          return participant.id;
        }
      }
    }
    
    console.log('\n⚠️  Scott not found in recent conversations.');
    console.log('   Ask Scott to send a message to @mundotango1 first.');
    
  } catch (error: any) {
    console.error('❌ Failed to fetch conversations:', error.response?.data || error.message);
  }
  
  return null;
}

/**
 * Method 2: Use Page Messaging Insights
 * Get list of all users who've messaged the page
 */
async function checkPageInsights() {
  console.log('\n📊 METHOD 2: Checking page messaging insights...\n');
  
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${PAGE_ID}/insights/page_messages_total_messaging_connections`,
      {
        params: {
          access_token: PAGE_TOKEN,
          period: 'day',
          since: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 // Last 30 days
        }
      }
    );
    
    console.log('✅ Messaging insights:', response.data);
    
  } catch (error: any) {
    console.error('❌ Failed to fetch insights:', error.response?.data || error.message);
  }
  
  return null;
}

/**
 * Method 3: Instructions for manual PSID lookup
 */
function showManualInstructions() {
  console.log('\n📝 METHOD 3: Manual PSID Lookup\n');
  console.log('Since automated methods failed, Scott needs to:');
  console.log('\n1. Send a message to @mundotango1 on Facebook:');
  console.log('   https://www.facebook.com/mundotango1');
  console.log('   Message: "Hello" (any text)');
  console.log('\n2. Check webhook logs in Replit console:');
  console.log('   Look for: [Webhook] Message received: { sender: \'XXXXXXXXX\', ... }');
  console.log('   The number after "sender:" is the PSID');
  console.log('\n3. Add PSID to Replit Secrets:');
  console.log('   Key: SCOTT_FACEBOOK_PSID');
  console.log('   Value: <the PSID from step 2>');
  console.log('\n4. Run: npx tsx scripts/send-first-invitation.ts');
}

/**
 * Test if a PSID is valid
 */
async function testPSID(psid: string) {
  console.log(`\n🧪 Testing PSID: ${psid}\n`);
  
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${psid}`,
      {
        params: {
          access_token: PAGE_TOKEN,
          fields: 'name,first_name,last_name,profile_pic'
        }
      }
    );
    
    console.log('✅ PSID is valid!');
    console.log('   User info:', response.data);
    return true;
    
  } catch (error: any) {
    console.error('❌ PSID test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  GET SCOTT\'S FACEBOOK PSID');
  console.log('  Required to send first Mundo Tango invitation');
  console.log('═══════════════════════════════════════════════════════');
  
  // Check environment
  if (!PAGE_TOKEN) {
    console.error('\n❌ FACEBOOK_PAGE_ACCESS_TOKEN not set in environment');
    console.error('   Add it to Replit Secrets first');
    process.exit(1);
  }
  
  // Try Method 1: Recent conversations
  let psid = await checkRecentConversations();
  
  if (psid) {
    const valid = await testPSID(psid);
    if (valid) {
      console.log('\n✅ SUCCESS! Scott\'s PSID:', psid);
      process.exit(0);
    }
  }
  
  // Try Method 2: Page insights
  await checkPageInsights();
  
  // Show manual instructions
  showManualInstructions();
}

main().catch(console.error);
