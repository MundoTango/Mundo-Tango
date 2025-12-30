import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController';

const router = express.Router();

router.get('/messages', getMessages);
router.post('/messages', sendMessage);

export default router;