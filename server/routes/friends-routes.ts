import { Router } from "express";
import type { IStorage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";

export function createFriendsRoutes(storage: IStorage) {
  const router = Router();

  router.get("/friends", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const friends = await storage.getUserFriends(userId);
      res.json(friends);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/friends/requests", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const requests = await storage.getFriendRequests(userId);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific friend request by ID (for modal deep-linking from notifications)
  router.get("/friends/requests/:requestId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const requestId = parseInt(req.params.requestId);
      
      // Get the specific request and validate the current user is involved
      const request = await storage.getFriendRequestById(requestId, userId);
      if (!request) {
        return res.status(404).json({ error: 'Friend request not found' });
      }
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/friends/suggestions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const suggestions = await storage.getFriendSuggestions(userId);
      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/friends/mutual/:userId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const currentUserId = req.userId!;
      const targetUserId = parseInt(req.params.userId);
      
      const mutualFriends = await storage.getMutualFriends(currentUserId, targetUserId);
      res.json(mutualFriends);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/friends/connection-degree/:userId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const currentUserId = req.userId!;
      const targetUserId = parseInt(req.params.userId);
      
      const degree = await storage.getConnectionDegree(currentUserId, targetUserId);
      res.json({ degree });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/friends/request/:userId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const senderId = req.userId!;
      const receiverId = parseInt(req.params.userId);
      
      const request = await storage.sendFriendRequest({
        senderId,
        receiverId,
        ...req.body,
      });
      res.json(request);
    } catch (error: any) {
      if (error.message === 'Friend request already exists') {
        return res.status(409).json({ error: 'You have already sent a friend request to this user' });
      }
      if (error.message === 'Cannot send friend request to yourself') {
        return res.status(400).json({ error: 'Cannot send friend request to yourself' });
      }
      if (error.message === 'Already friends') {
        return res.status(409).json({ error: 'You are already friends with this user' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/friends/requests/:requestId/accept", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      await storage.acceptFriendRequest(requestId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/friends/requests/:requestId/reject", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      await storage.declineFriendRequest(requestId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/friends/requests/:requestId/snooze", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const days = req.body.days || 7;
      await storage.snoozeFriendRequest(requestId, days);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete("/friends/:friendId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const friendId = parseInt(req.params.friendId);
      
      await storage.removeFriend(userId, friendId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
