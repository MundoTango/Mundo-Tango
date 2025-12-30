import express from 'express';
import { updateFriendshipStatus } from '../controllers/friendController';

const router = express.Router();

router.post('/friendship/:id/accept', async (req, res) => {
  try {
    const friendshipId = req.params.id;
    await updateFriendshipStatus(friendshipId, 'accepted');
    res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

router.post('/friendship/:id/reject', async (req, res) => {
  try {
    const friendshipId = req.params.id;
    await updateFriendshipStatus(friendshipId, 'rejected');
    res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject friend request' });
  }
});

export default router;