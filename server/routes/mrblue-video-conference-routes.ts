import { Router, type Request, type Response } from "express";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { videoConferenceService } from "../services/mrBlue/VideoConferenceService";

const router = Router();

/**
 * Create a new video conference room for Mr Blue
 */
router.post("/create-room", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const room = await videoConferenceService.createRoom(userId);

    // Generate token for the user
    const token = await videoConferenceService.generateToken(room.name, userId, true);

    res.json({
      room: {
        id: room.id,
        name: room.name,
        url: room.url,
      },
      token,
    });
  } catch (error: any) {
    console.error("[VideoConference API] Error creating room:", error);
    res.status(500).json({ 
      message: "Failed to create video conference room",
      error: error.message 
    });
  }
});

/**
 * Generate a join token for an existing room
 */
router.post("/join-token", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { roomName } = req.body;
    if (!roomName) {
      return res.status(400).json({ message: "Room name is required" });
    }

    // Verify room exists
    const room = await videoConferenceService.getRoomInfo(roomName);
    
    // Generate token for the user
    const token = await videoConferenceService.generateToken(roomName, userId, false);

    res.json({
      token,
      room: {
        id: room.id,
        name: room.name,
        url: room.url,
      },
    });
  } catch (error: any) {
    console.error("[VideoConference API] Error generating token:", error);
    res.status(500).json({ 
      message: "Failed to generate join token",
      error: error.message 
    });
  }
});

/**
 * End a video call and cleanup the room
 */
router.delete("/end-call", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { roomName } = req.body;
    if (!roomName) {
      return res.status(400).json({ message: "Room name is required" });
    }

    // Verify the room belongs to this user (rooms are named mrblue-{userId}-{timestamp})
    if (!roomName.startsWith(`mrblue-${userId}-`)) {
      return res.status(403).json({ message: "You don't have permission to delete this room" });
    }

    await videoConferenceService.deleteRoom(roomName);

    res.json({ message: "Video call ended successfully" });
  } catch (error: any) {
    console.error("[VideoConference API] Error ending call:", error);
    res.status(500).json({ 
      message: "Failed to end video call",
      error: error.message 
    });
  }
});

/**
 * Get room information
 */
router.get("/room/:roomName", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { roomName } = req.params;
    
    const room = await videoConferenceService.getRoomInfo(roomName);
    
    res.json({ room });
  } catch (error: any) {
    console.error("[VideoConference API] Error getting room info:", error);
    res.status(500).json({ 
      message: "Failed to get room information",
      error: error.message 
    });
  }
});

export default router;
