import express from 'express';
import { getMessages, sendMessage, getUnreadCount } from '../controllers/messageController';
import { sendReplyEmail } from '../services/emailReplyService';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users, conversations } from '@shared/schema';

const router = express.Router();

async function getConversationById(id: string) {
  const result = await db.select().from(conversations).where(eq(conversations.id, parseInt(id))).limit(1);
  return result[0] || null;
}

router.get('/messages', async (req, res) => {
  try {
    const messages = await getMessages();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/messages', sendMessage);

router.get('/messages/unread-count', async (req, res) => {
  try {
    const count = await getUnreadCount(req.user!.id);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/reply-external', async (req, res) => {
  const { id } = req.params;
  const { to, subject, body } = req.body;
  try {
    const conversation = await getConversationById(id);
    if (!conversation || !conversation.externalContactEmail) {
      return res.status(400).json({ error: 'Invalid conversation or no external contact email.' });
    }
    const from = await db.select({ proPageContactEmail: users.proPageContactEmail }).from(users).where(eq(users.id, conversation.userId));
    const email = from[0]?.proPageContactEmail;
    const result = await sendReplyEmail({ to, from: email, subject, body });
    if (result.success) {
      res.status(200).json({ messageId: result.messageId });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error sending reply email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;