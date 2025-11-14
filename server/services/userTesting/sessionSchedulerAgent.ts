import { db } from "@db";
import {
  userTestingSessions,
  insertUserTestingSessionSchema,
  type InsertUserTestingSession,
  type SelectUserTestingSession,
} from "@shared/schema";
import { eq } from "drizzle-orm";

interface DailyRoomConfig {
  roomUrl: string;
  token: string;
  expiresAt: Date;
}

/**
 * Agent #163: Session Scheduler
 * 
 * Schedules live testing sessions with volunteers and manages Daily.co room creation
 */
export class SessionSchedulerAgent {
  private dailyApiKey: string;
  private dailyApiUrl = "https://api.daily.co/v1";

  constructor() {
    this.dailyApiKey = process.env.DAILY_API_KEY || "";
    
    if (!this.dailyApiKey) {
      console.warn("DAILY_API_KEY not set - Daily.co integration will not work");
    }
  }

  /**
   * Create a new testing session
   */
  async createSession(
    volunteerId: number,
    scenarioId: number,
    scheduledAt: Date
  ): Promise<SelectUserTestingSession> {
    try {
      const sessionData: InsertUserTestingSession = {
        volunteerId,
        scenarioId,
        sessionType: "live_qa",
        status: "scheduled",
        scheduledStartAt: scheduledAt,
      };

      const [session] = await db
        .insert(userTestingSessions)
        .values(sessionData)
        .returning();

      return session;
    } catch (error) {
      console.error("Error creating session:", error);
      throw new Error("Failed to create testing session");
    }
  }

  /**
   * Create a Daily.co room for the session with 2-hour expiry
   */
  async createDailyRoom(sessionId: number): Promise<DailyRoomConfig> {
    if (!this.dailyApiKey) {
      throw new Error("DAILY_API_KEY not configured");
    }

    try {
      const [session] = await db
        .select()
        .from(userTestingSessions)
        .where(eq(userTestingSessions.id, sessionId));

      if (!session) {
        throw new Error("Session not found");
      }

      // Create room with 2-hour expiry
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const roomName = `user-testing-${sessionId}-${Date.now()}`;

      const roomResponse = await fetch(`${this.dailyApiUrl}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.dailyApiKey}`,
        },
        body: JSON.stringify({
          name: roomName,
          privacy: "private",
          properties: {
            enable_recording: "cloud",
            enable_screenshare: true,
            enable_chat: true,
            exp: Math.floor(expiresAt.getTime() / 1000),
            max_participants: 10,
          },
        }),
      });

      if (!roomResponse.ok) {
        const error = await roomResponse.text();
        throw new Error(`Daily.co API error: ${error}`);
      }

      const roomData = await roomResponse.json();
      const roomUrl = roomData.url;

      // Create meeting token for observer
      const tokenResponse = await fetch(`${this.dailyApiUrl}/meeting-tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.dailyApiKey}`,
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            is_owner: false,
            enable_recording: true,
          },
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        throw new Error(`Failed to create meeting token: ${error}`);
      }

      const tokenData = await tokenResponse.json();

      // Update session with room URL
      await db
        .update(userTestingSessions)
        .set({ dailyRoomUrl: roomUrl })
        .where(eq(userTestingSessions.id, sessionId));

      return {
        roomUrl,
        token: tokenData.token,
        expiresAt,
      };
    } catch (error) {
      console.error("Error creating Daily.co room:", error);
      throw error;
    }
  }

  /**
   * Send email reminder to volunteer about upcoming session
   */
  async notifyVolunteer(sessionId: number): Promise<void> {
    try {
      const [session] = await db
        .select()
        .from(userTestingSessions)
        .where(eq(userTestingSessions.id, sessionId));

      if (!session) {
        throw new Error("Session not found");
      }

      // TODO: Integrate with email service (Resend)
      console.log(`Sending notification for session ${sessionId} to volunteer ${session.volunteerId}`);
      
      // For now, just log - would normally use Resend API here
      // const emailService = new ResendService();
      // await emailService.sendTestingSessionReminder(session);
    } catch (error) {
      console.error("Error notifying volunteer:", error);
      throw error;
    }
  }

  /**
   * Cancel a testing session with reason
   */
  async cancelSession(sessionId: number, reason: string): Promise<void> {
    try {
      const [session] = await db
        .update(userTestingSessions)
        .set({
          status: "cancelled",
        })
        .where(eq(userTestingSessions.id, sessionId))
        .returning();

      if (!session) {
        throw new Error("Session not found");
      }

      // Delete Daily.co room if it exists
      if (session.dailyRoomUrl && this.dailyApiKey) {
        const roomName = session.dailyRoomUrl.split('/').pop();
        if (roomName) {
          await fetch(`${this.dailyApiUrl}/rooms/${roomName}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${this.dailyApiKey}`,
            },
          });
        }
      }

      console.log(`Session ${sessionId} cancelled. Reason: ${reason}`);
    } catch (error) {
      console.error("Error cancelling session:", error);
      throw error;
    }
  }

  /**
   * Get session details
   */
  async getSession(sessionId: number): Promise<SelectUserTestingSession | null> {
    try {
      const [session] = await db
        .select()
        .from(userTestingSessions)
        .where(eq(userTestingSessions.id, sessionId));

      return session || null;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }

  /**
   * List all sessions with optional filtering
   */
  async listSessions(status?: string): Promise<SelectUserTestingSession[]> {
    try {
      if (status) {
        return await db
          .select()
          .from(userTestingSessions)
          .where(eq(userTestingSessions.status, status))
          .orderBy(userTestingSessions.scheduledStartAt);
      }

      return await db
        .select()
        .from(userTestingSessions)
        .orderBy(userTestingSessions.scheduledStartAt);
    } catch (error) {
      console.error("Error listing sessions:", error);
      return [];
    }
  }
}
