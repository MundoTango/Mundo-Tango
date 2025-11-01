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

  router.get("/friends/suggestions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      
      const allUsers = await storage.getAllUsers();
      const friends = await storage.getUserFriends(userId);
      const pendingRequests = await storage.getFriendRequests(userId);
      
      const friendIds = new Set(friends.map((f: any) => f.id));
      const pendingIds = new Set(pendingRequests.map((r: any) => r.senderId));
      
      const suggestions = allUsers
        .filter(u => u.id !== userId && !friendIds.has(u.id) && !pendingIds.has(u.id))
        .slice(0, 10)
        .map(u => ({
          ...u,
          reason: "Suggested for you",
        }));
      
      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/friends/mutual/:userId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const currentUserId = req.userId!;
      const targetUserId = parseInt(req.params.userId);
      
      const currentFriends = await storage.getUserFriends(currentUserId);
      const targetFriends = await storage.getUserFriends(targetUserId);
      
      const currentFriendIds = new Set(currentFriends.map((f: any) => f.id));
      const mutualFriends = targetFriends.filter((f: any) => currentFriendIds.has(f.id));
      
      res.json(mutualFriends);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/friends/request/:userId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const senderId = req.userId!;
      const receiverId = parseInt(req.params.userId);
      
      const request = await storage.sendFriendRequest(senderId, receiverId);
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/friends/accept/:requestId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      await storage.acceptFriendRequest(requestId, req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/friends/decline/:requestId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      await storage.declineFriendRequest(requestId, req.userId!);
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
