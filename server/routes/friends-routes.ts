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

  // Get received friend requests (requests where current user is the receiver)
  router.get("/friends/requests/received", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const requests = await storage.getReceivedFriendRequests(userId);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get sent friend requests (requests where current user is the sender)
  router.get("/friends/requests/sent", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const requests = await storage.getSentFriendRequests(userId);
      res.json(requests);
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
      const userId = req.userId!;
      await storage.declineFriendRequest(requestId, userId);
      res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'You can only decline requests sent to you') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Request not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Alias for reject (frontend compatibility)
  router.post("/friends/decline/:requestId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const userId = req.userId!;
      await storage.declineFriendRequest(requestId, userId);
      res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'You can only decline requests sent to you') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Request not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel sent friend request
  router.delete("/friends/request/:requestId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const userId = req.userId!;
      await storage.cancelFriendRequest(requestId, userId);
      res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'You can only cancel your own requests') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Request not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Get friendship stats with a specific user
  router.get("/friends/friendship/:friendId/stats", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const friendId = parseInt(req.params.friendId);
      const stats = await storage.getFriendshipStats(userId, friendId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get shared data with a friend (posts, likes, events, etc.)
  router.get("/friends/friendship/:friendId/shared-data", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const friendId = parseInt(req.params.friendId);
      const sharedData = await storage.getFriendshipSharedData(userId, friendId);
      res.json(sharedData);
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
