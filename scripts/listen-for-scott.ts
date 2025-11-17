/**
 * Listen for Scott's message to capture his PSID
 * 
 * Scott: Send "Hello" to @mundotango1 on Facebook Messenger
 * This script will capture your PSID and save it
 */

import express from 'express';

const app = express();
app.use(express.json());

const TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || 
  'EAAUnXdgzRfcBPzGRAu7m4Mzh0cfgvNRqZCopMewY4s4topcKx8ZBdFW0hblcofTJZCBwSz0wggezUeCK1WmH48jOa4wmXNkMBkjsrWrTiM0ZA30MgS6aCZB3EZC2ziZCnnlV4UZCgihvpXtKbRf5IBA7pikH6e3PFRCaZC0BLrF6enegNzRpfwU1apbe8seSmcaNVymyLszCUXmuhfw29xk4ALDf77qZCswFD6E0fquDgneyiSebG0UgIRRo8BxCymaXI4dNwymbqtqXQwKubiUZAPx';

const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'MUNDO_TANGO_VERIFY_TOKEN';

let scottPSID: string | null = null;

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receive messages
app.post('/webhook', (req, res) => {
  const body = req.body;
  
  if (body.object === 'page') {
    body.entry?.forEach((entry: any) => {
      const webhookEvent = entry.messaging?.[0];
      
      if (webhookEvent?.message) {
        const senderPSID = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;
        
        console.log('\n🎉 MESSAGE RECEIVED!');
        console.log('═══════════════════════════════════════════');
        console.log('Sender PSID:', senderPSID);
        console.log('Message:', messageText);
        console.log('═══════════════════════════════════════════\n');
        
        if (!scottPSID) {
          scottPSID = senderPSID;
          console.log('✅ SCOTT\'S PSID CAPTURED!');
          console.log('   PSID:', scottPSID);
          console.log('\n📝 Next step: Add to Replit Secrets:');
          console.log('   Key: SCOTT_FACEBOOK_PSID');
          console.log('   Value:', scottPSID);
          console.log('\n🚀 Then run: npx tsx scripts/send-first-invitation.ts', scottPSID);
        }
      }
    });
    
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  LISTENING FOR SCOTT\'S MESSAGE');
  console.log('  Webhook ready on port', PORT);
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('📱 Scott: Send "Hello" to @mundotango1 on Facebook');
  console.log('   https://www.facebook.com/mundotango1\n');
  console.log('⏳ Waiting for message...\n');
});
