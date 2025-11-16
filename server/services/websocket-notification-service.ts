/**
 * WEBSOCKET NOTIFICATION SERVICE
 * Real-time notification delivery via WebSocket
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

interface ConnectedClient {
  userId: number;
  ws: WebSocket;
  lastPing: number;
}

export class WebSocketNotificationService {
  private clients: Map<number, ConnectedClient[]> = new Map();
  private wss: WebSocketServer | null = null;

  initialize(server: any) {
    console.log("[WS Server] 🔧 Initializing WebSocketServer on /ws/notifications...");
    console.log("[WS Server] 🔧 Server object type:", typeof server);
    console.log("[WS Server] 🔧 Server has 'on' method:", typeof server.on === 'function');
    
    this.wss = new WebSocketServer({ 
      server, 
      path: "/ws/notifications",
      verifyClient: (info) => {
        console.log("[WS Server] 🔍 Verifying client from:", info.origin);
        console.log("[WS Server] 🔍 Request URL:", info.req.url);
        console.log("[WS Server] 🔍 Request headers:", JSON.stringify(info.req.headers).substring(0, 200));
        return true; // Accept all connections
      }
    });

    console.log("[WS Server] ✅ WebSocketServer instance created successfully");
    console.log("[WS Server] 📡 Listening on path: /ws/notifications");

    // Add error handler for the WebSocketServer itself
    this.wss.on("error", (error) => {
      console.error("[WS Server] ❌ WebSocketServer error:", error);
    });

    // Add headers handler for debugging
    this.wss.on("headers", (headers, req) => {
      console.log("[WS Server] 📨 Sending handshake headers for:", req.url);
    });

    this.wss.on("connection", (ws: WebSocket, req: any) => {
      console.log("[WS Server] ✅ NEW CONNECTION ATTEMPT");
      console.log("[WS Server] Client address:", req.socket.remoteAddress);
      console.log("[WS Server] Request URL:", req.url);
      
      try {
        // Extract token from URL query parameter
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token');
        
        if (!token) {
          console.error('[WS Server] ❌ No token provided in URL');
          ws.close(1008, 'Authentication required');
          return;
        }
        
        // Verify JWT token
        let decoded: JWTPayload;
        try {
          decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        } catch (error) {
          console.error('[WS Server] ❌ Invalid token:', error);
          ws.close(1008, 'Invalid authentication token');
          return;
        }
        
        if (!decoded || !decoded.userId) {
          console.error('[WS Server] ❌ Token missing userId');
          ws.close(1008, 'Invalid authentication token');
          return;
        }
        
        const userId = decoded.userId;
        
        // Add authenticated client immediately
        this.addClient(userId, ws);
        
        // Send authentication success message
        ws.send(JSON.stringify({ 
          type: 'auth_success', 
          userId,
          message: 'WebSocket authenticated successfully'
        }));
        
        console.log(`[WS Server] ✅ User ${userId} (${decoded.email}) authenticated and connected`);
        console.log(`[WS Server] 📊 Total authenticated users: ${this.clients.size}`);
        
      } catch (error) {
        console.error('[WS Server] ❌ Auth error:', error);
        ws.close(1008, 'Authentication failed');
        return;
      }

      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Handle heartbeat ping
          if (message.type === "ping") {
            const userId = this.findUserIdByWs(ws);
            if (userId) {
              this.updatePing(userId, ws);
              ws.send(JSON.stringify({ type: "pong" }));
            }
          }
        } catch (error) {
          console.error("[WS Server] ❌ Error parsing message:", error);
        }
      });

      ws.on("close", (code, reason) => {
        console.log(`[WS Server] 🔌 Connection closed - Code: ${code}, Reason: ${reason.toString()}`);
        
        // Remove authenticated client
        const userId = this.findUserIdByWs(ws);
        if (userId) {
          this.removeClient(userId, ws);
          console.log(`[WS Server] 👤 User ${userId} disconnected`);
          console.log(`[WS Server] 📊 Remaining authenticated users: ${this.clients.size}`);
        }
      });

      ws.on("error", (error) => {
        console.error(`[WS Server] ❌ WebSocket connection error:`, error);
        const userId = this.findUserIdByWs(ws);
        if (userId) {
          this.removeClient(userId, ws);
        }
      });
    });

    setInterval(() => this.cleanupStaleConnections(), 60000);

    console.log("[WS Server] ✅ WebSocket notification service fully initialized");
    console.log("[WS Server] 📡 Ready to accept connections on /ws/notifications");
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

  private cleanupStaleConnections() {
    const now = Date.now();
    const timeout = 5 * 60 * 1000;

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

  sendNotification(userId: number, notification: any) {
    const userClients = this.clients.get(userId);
    
    if (!userClients || userClients.length === 0) {
      return false;
    }

    const message = JSON.stringify({
      type: "notification",
      data: notification,
    });

    let sent = 0;
    for (const client of userClients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
        sent++;
      }
    }

    console.log(`[WS] Sent notification to ${sent} client(s) for user ${userId}`);
    return sent > 0;
  }

  broadcast(userIds: number[], notification: any) {
    let totalSent = 0;
    for (const userId of userIds) {
      if (this.sendNotification(userId, notification)) {
        totalSent++;
      }
    }
    return totalSent;
  }

  isUserOnline(userId: number): boolean {
    return this.clients.has(userId) && this.clients.get(userId)!.length > 0;
  }

  getOnlineUserCount(): number {
    return this.clients.size;
  }
}

export const wsNotificationService = new WebSocketNotificationService();
