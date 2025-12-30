import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController';

const router = express.Router();

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

export default router;