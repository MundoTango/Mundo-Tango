/**
 * WEBSOCKET ENGAGEMENT SERVICE
 * Real-time likes and comments delivery via WebSocket
 * 
 * Features:
 * - Feature 19: Live reaction/like updates across all viewers
 * - Feature 20: Live comments with typing indicators
 * 
 * AUTHENTICATION: JWT token verified from URL query parameter on handshake
 */

import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set");
}

const JWT_SECRET = process.env.JWT_SECRET;

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

interface EngagementClient {
  userId: number;
  ws: WebSocket;
  subscribedPosts: Set<number>;
  lastPing: number;
}

export class WebSocketEngagementService {
  private clients: Map<number, EngagementClient[]> = new Map();
  private wss: WebSocketServer | null = null;

  initialize(server: any) {
    console.log("[WS Engagement] 🔧 Initializing WebSocketServer on /ws/engagement...");
    
    this.wss = new WebSocketServer({ 
      server, 
      path: "/ws/engagement",
      verifyClient: (info) => {
        console.log("[WS Engagement] 🔍 Verifying client from:", info.origin);
        return true; // Accept all connections
      }
    });

    console.log("[WS Engagement] ✅ WebSocketServer instance created successfully");

    this.wss.on("error", (error) => {
      console.error("[WS Engagement] ❌ WebSocketServer error:", error);
    });

    this.wss.on("connection", (ws: WebSocket, req: any) => {
      console.log("[WS Engagement] ✅ NEW CONNECTION ATTEMPT");
      
      try {
        // Extract token from URL query parameter
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token');
        
        if (!token) {
          console.error('[WS Engagement] ❌ No token provided in URL');
          ws.close(1008, 'Authentication required');
          return;
        }
        
        // Verify JWT token
        let decoded: JWTPayload;
        try {
          decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        } catch (error) {
          console.error('[WS Engagement] ❌ Invalid token:', error);
          ws.close(1008, 'Invalid authentication token');
          return;
        }
        
        if (!decoded || !decoded.userId) {
          console.error('[WS Engagement] ❌ Token missing userId');
          ws.close(1008, 'Invalid authentication token');
          return;
        }
        
        const userId = decoded.userId;
        
        // Add authenticated client
        this.addClient(userId, ws);
        
        // Send authentication success message
        ws.send(JSON.stringify({ 
          type: 'auth_success', 
          userId,
          message: 'WebSocket engagement authenticated successfully'
        }));
        
        console.log(`[WS Engagement] ✅ User ${userId} (${decoded.email}) authenticated and connected`);
        
      } catch (error) {
        console.error('[WS Engagement] ❌ Auth error:', error);
        ws.close(1008, 'Authentication failed');
        return;
      }

      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data.toString());
          const userId = this.findUserIdByWs(ws);
          
          if (!userId) {
            console.error('[WS Engagement] ❌ Message from unauthenticated client');
            return;
          }

          switch (message.type) {
            case "ping":
              // Handle heartbeat ping
              this.updatePing(userId, ws);
              ws.send(JSON.stringify({ type: "pong" }));
              break;

            case "subscribe":
              // Subscribe to post updates
              const postId = message.postId;
              if (postId) {
                this.subscribeToPost(userId, ws, postId);
                console.log(`[WS Engagement] 📌 User ${userId} subscribed to post ${postId}`);
              }
              break;

            case "unsubscribe":
              // Unsubscribe from post updates
              const unsubPostId = message.postId;
              if (unsubPostId) {
                this.unsubscribeFromPost(userId, ws, unsubPostId);
                console.log(`[WS Engagement] 📍 User ${userId} unsubscribed from post ${unsubPostId}`);
              }
              break;

            case "typing":
              // Feature 20: Broadcast typing indicator
              if (message.postId && message.username) {
                this.broadcastToPost(message.postId, {
                  type: 'user_typing',
                  userId,
                  username: message.username,
                  postId: message.postId,
                  timestamp: new Date().toISOString(),
                }, userId); // Exclude sender
                console.log(`[WS Engagement] ⌨️  User ${userId} (${message.username}) typing on post ${message.postId}`);
              }
              break;
          }
        } catch (error) {
          console.error("[WS Engagement] ❌ Error parsing message:", error);
        }
      });

      ws.on("close", (code, reason) => {
        console.log(`[WS Engagement] 🔌 Connection closed - Code: ${code}, Reason: ${reason.toString()}`);
        
        const userId = this.findUserIdByWs(ws);
        if (userId) {
          this.removeClient(userId, ws);
          console.log(`[WS Engagement] 👤 User ${userId} disconnected`);
        }
      });

      ws.on("error", (error) => {
        console.error(`[WS Engagement] ❌ WebSocket connection error:`, error);
        const userId = this.findUserIdByWs(ws);
        if (userId) {
          this.removeClient(userId, ws);
        }
      });
    });

    setInterval(() => this.cleanupStaleConnections(), 60000);

    console.log("[WS Engagement] ✅ WebSocket engagement service fully initialized");
    console.log("[WS Engagement] 📡 Ready to accept connections on /ws/engagement");
  }

  private findUserIdByWs(ws: WebSocket): number | null {
    for (const [userId, clients] of this.clients.entries()) {
      if (clients.some(c => c.ws === ws)) {
        return userId;
      }
    }
    return null;
  }

  private addClient(userId: number, ws: WebSocket) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    
    this.clients.get(userId)!.push({
      userId,
      ws,
      subscribedPosts: new Set(),
      lastPing: Date.now(),
    });
  }

  private removeClient(userId: number, ws: WebSocket) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const filtered = userClients.filter(c => c.ws !== ws);
      if (filtered.length === 0) {
        this.clients.delete(userId);
      } else {
        this.clients.set(userId, filtered);
      }
    }
  }

  private updatePing(userId: number, ws: WebSocket) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const client = userClients.find(c => c.ws === ws);
      if (client) {
        client.lastPing = Date.now();
      }
    }
  }

  private subscribeToPost(userId: number, ws: WebSocket, postId: number) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const client = userClients.find(c => c.ws === ws);
      if (client) {
        client.subscribedPosts.add(postId);
      }
    }
  }

  private unsubscribeFromPost(userId: number, ws: WebSocket, postId: number) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const client = userClients.find(c => c.ws === ws);
      if (client) {
        client.subscribedPosts.delete(postId);
      }
    }
  }

  private cleanupStaleConnections() {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [userId, clients] of this.clients.entries()) {
      const active = clients.filter(c => {
        if (now - c.lastPing > timeout) {
          c.ws.close(4000, "Timeout");
          return false;
        }
        return true;
      });

      if (active.length === 0) {
        this.clients.delete(userId);
      } else {
        this.clients.set(userId, active);
      }
    }
  }

  /**
   * Feature 19: Broadcast like/reaction update to all viewers of a post
   */
  broadcastLikeUpdate(postId: number, userId: number, username: string, reactions: Record<string, number>, currentReaction: string | null, totalReactions: number) {
    const message = {
      type: 'reaction_update',
      postId,
      userId,
      username,
      reactions,
      currentReaction,
      totalReactions,
      timestamp: new Date().toISOString(),
    };
    
    this.broadcastToPost(postId, message);
    console.log(`[WS Engagement] 💙 Broadcasted reaction update for post ${postId} (${totalReactions} total reactions)`);
  }

  /**
   * Feature 20: Broadcast new comment to all viewers of a post
   */
  broadcastNewComment(postId: number, comment: any) {
    const message = {
      type: 'new_comment',
      postId,
      comment,
      timestamp: new Date().toISOString(),
    };
    
    this.broadcastToPost(postId, message);
    console.log(`[WS Engagement] 💬 Broadcasted new comment on post ${postId} by user ${comment.userId}`);
  }

  /**
   * Broadcast message to all clients subscribed to a specific post
   */
  private broadcastToPost(postId: number, message: any, excludeUserId?: number) {
    let sentCount = 0;

    this.clients.forEach((clientsList, userId) => {
      // Skip excluded user (e.g., the one who triggered the action)
      if (excludeUserId && userId === excludeUserId) {
        return;
      }

      clientsList.forEach(client => {
        if (client.subscribedPosts.has(postId) && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(message));
          sentCount++;
        }
      });
    });

    console.log(`[WS Engagement] 📡 Sent ${message.type} to ${sentCount} client(s) for post ${postId}`);
  }

  /**
   * Get count of active clients viewing a specific post
   */
  getPostViewerCount(postId: number): number {
    let count = 0;
    this.clients.forEach(clientsList => {
      clientsList.forEach(client => {
        if (client.subscribedPosts.has(postId)) {
          count++;
        }
      });
    });
    return count;
  }

  /**
   * Check if any clients are subscribed to a post
   */
  hasViewers(postId: number): boolean {
    return this.getPostViewerCount(postId) > 0;
  }
}

export const wsEngagementService = new WebSocketEngagementService();
