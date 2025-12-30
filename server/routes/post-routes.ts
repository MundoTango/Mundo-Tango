import { Router } from 'express';
import storage from '../storage';

const router = Router();

router.post('/api/posts/:id/like', async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await storage.likePost(postId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error liking post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;