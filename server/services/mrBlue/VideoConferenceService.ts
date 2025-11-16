import axios from "axios";

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  created_at: string;
  config?: {
    exp?: number;
    enable_screenshare?: boolean;
    enable_recording?: string;
  };
}

export interface DailyToken {
  token: string;
  room_name: string;
}

export class VideoConferenceService {
  private apiKey: string;
  private apiUrl: string = "https://api.daily.co/v1";

  constructor() {
    this.apiKey = process.env.DAILY_API_KEY || "";
    if (!this.apiKey) {
      console.warn("[VideoConference] DAILY_API_KEY not configured");
    }
  }

  /**
   * Create a Daily.co room for Mr Blue video conference
   */
  async createRoom(userId: number): Promise<DailyRoom> {
    if (!this.apiKey) {
      throw new Error("Daily.co API key not configured");
    }

    try {
      const roomName = `mrblue-${userId}-${Date.now()}`;
      
      const response = await axios.post(
        `${this.apiUrl}/rooms`,
        {
          name: roomName,
          privacy: "private",
          properties: {
            enable_screenshare: true,
            enable_recording: "cloud",
            enable_chat: true,
            start_video_off: false,
            start_audio_off: false,
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`[VideoConference] Created room: ${roomName}`);
      return response.data;
    } catch (error: any) {
      console.error("[VideoConference] Error creating room:", error.response?.data || error.message);
      throw new Error(`Failed to create Daily.co room: ${error.message}`);
    }
  }

  /**
   * Generate a meeting token for secure access
   */
  async generateToken(roomName: string, userId: number, isOwner: boolean = true): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Daily.co API key not configured");
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/meeting-tokens`,
        {
          properties: {
            room_name: roomName,
            user_name: `User ${userId}`,
            is_owner: isOwner,
            enable_screenshare: true,
            enable_recording: true,
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`[VideoConference] Generated token for room: ${roomName}`);
      return response.data.token;
    } catch (error: any) {
      console.error("[VideoConference] Error generating token:", error.response?.data || error.message);
      throw new Error(`Failed to generate meeting token: ${error.message}`);
    }
  }

  /**
   * Delete a Daily.co room
   */
  async deleteRoom(roomName: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error("Daily.co API key not configured");
    }

    try {
      await axios.delete(`${this.apiUrl}/rooms/${roomName}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      console.log(`[VideoConference] Deleted room: ${roomName}`);
    } catch (error: any) {
      console.error("[VideoConference] Error deleting room:", error.response?.data || error.message);
      throw new Error(`Failed to delete room: ${error.message}`);
    }
  }

  /**
   * Get room details
   */
  async getRoomInfo(roomName: string): Promise<DailyRoom> {
    if (!this.apiKey) {
      throw new Error("Daily.co API key not configured");
    }

    try {
      const response = await axios.get(`${this.apiUrl}/rooms/${roomName}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("[VideoConference] Error getting room info:", error.response?.data || error.message);
      throw new Error(`Failed to get room info: ${error.message}`);
    }
  }

  /**
   * List all active rooms for cleanup
   */
  async listRooms(): Promise<DailyRoom[]> {
    if (!this.apiKey) {
      throw new Error("Daily.co API key not configured");
    }

    try {
      const response = await axios.get(`${this.apiUrl}/rooms`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error("[VideoConference] Error listing rooms:", error.response?.data || error.message);
      throw new Error(`Failed to list rooms: ${error.message}`);
    }
  }

  /**
   * Cleanup expired Mr Blue rooms
   */
  async cleanupExpiredRooms(): Promise<void> {
    try {
      const rooms = await this.listRooms();
      const now = Math.floor(Date.now() / 1000);

      for (const room of rooms) {
        // Only cleanup Mr Blue rooms
        if (room.name.startsWith("mrblue-")) {
          const exp = room.config?.exp;
          if (exp && exp < now) {
            console.log(`[VideoConference] Cleaning up expired room: ${room.name}`);
            await this.deleteRoom(room.name);
          }
        }
      }
    } catch (error: any) {
      console.error("[VideoConference] Error during cleanup:", error.message);
    }
  }
}

export const videoConferenceService = new VideoConferenceService();
