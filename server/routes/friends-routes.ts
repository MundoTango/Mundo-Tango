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

  // IMPORTANT: Specific routes must come BEFORE parameterized routes
  // /friends/requests must be before /friends/:friendId to avoid matching "requests" as friendId
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
      const suggestions = await storage.getFriendSuggestions(userId);
      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get friendship status with a specific user (for profile page buttons)
  router.get("/friends/status/:userId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const currentUserId = req.userId!;
      const targetUserId = parseInt(req.params.userId);
      
      console.log(`[FriendsAPI] Getting friendship status: currentUser=${currentUserId}, targetUser=${targetUserId}`);
      
      // Check if they're friends
      const friends = await storage.getUserFriends(currentUserId);
      const isFriend = friends.some((f: any) => f.id === targetUserId);
      
      // Check for incoming request (target sent to current user)
      const incomingRequests = await storage.getFriendRequests(currentUserId);
      const incomingRequest = incomingRequests.find((r: any) => r.senderId === targetUserId);
      
      // Check for outgoing request (current user sent to target)
      const outgoingRequest = await storage.getOutgoingFriendRequest(currentUserId, targetUserId);
      
      console.log(`[FriendsAPI] Friendship status result:`, {
        isFriend,
        hasIncomingRequest: !!incomingRequest,
        hasOutgoingRequest: !!outgoingRequest,
      });
      
      res.json({
        isFriend,
        incomingRequest: incomingRequest || null,
        outgoingRequest: outgoingRequest || null,
        hasIncomingRequest: !!incomingRequest,
        hasOutgoingRequest: !!outgoingRequest,
      });
    } catch (error: any) {
      console.error(`[FriendsAPI] Error getting friendship status:`, error);
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

  // Parameterized route MUST come AFTER all specific routes
  router.get("/friends/:friendId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const friendId = parseInt(req.params.friendId);
      const friendship = await storage.getFriendshipById(userId, friendId);
      res.json(friendship);
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
      const receiverData = req.body ? {
        receiverMessage: req.body.receiverMessage,
        receiverPrivateNote: req.body.receiverPrivateNote,
      } : undefined;
      await storage.acceptFriendRequest(requestId, receiverData);
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

  router.delete("/friends/requests/:requestId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const senderId = req.userId!;
      await storage.cancelFriendRequest(requestId, senderId);
      res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'Request not found or not owned by user') {
        return res.status(404).json({ error: error.message });
      }
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

  router.get("/friends/friendship/:friendId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const friendId = parseInt(req.params.friendId);
      
      const friendship = await storage.getFriendshipInfo(userId, friendId);
      if (!friendship) {
        return res.status(404).json({ error: "Friendship not found" });
      }
      res.json(friendship);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/friends/friendship/:friendId/stats", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const friendId = parseInt(req.params.friendId);
      
      const stats = await storage.getFriendshipStats(userId, friendId);
      if (!stats) {
        return res.json({
          daysSinceFriendship: 0,
          closenessScore: 0,
          sharedEvents: 0,
          sharedGroups: 0,
          lastInteraction: new Date().toISOString()
        });
      }
      // Ensure lastInteraction is always a string for frontend compatibility
      res.json({
        ...stats,
        lastInteraction: stats.lastInteraction || new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/friends/friendship/:friendId/shared-data", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const friendId = parseInt(req.params.friendId);
      
      const sharedData = await storage.getFriendshipSharedData(userId, friendId);
      if (!sharedData) {
        return res.json({
          sharedPosts: [],
          sharedLikes: [],
          sharedTravel: [],
          sharedComments: [],
          commonCities: [],
          sharedEventsDetails: []
        });
      }
      res.json(sharedData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
