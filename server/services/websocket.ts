/**
 * WebSocket Service for Real-Time Progress Updates
 * Provides real-time updates for autonomous workflow execution
 * 
 * Features:
 * - User-specific broadcasts
 * - Event-based messaging
 * - Connection management
 * - Automatic cleanup
 */

import { WebSocketServer, WebSocket } from "ws";

interface ConnectedClient {
  userId: number;
  ws: WebSocket;
  lastPing: number;
  subscribedEvents: Set<number>;
}

class WebSocketService {
  private clients: Map<number, ConnectedClient[]> = new Map();
  private eventSubscribers: Map<number, Set<number>> = new Map(); // eventId -> Set of userIds
  private wss: WebSocketServer | null = null;

  /**
   * Initialize WebSocket server
   */
  initialize(server: any) {
    this.wss = new WebSocketServer({ server, path: "/ws/autonomous" });

    this.wss.on("connection", (ws: WebSocket, req: any) => {
      const userId = this.extractUserId(req);
      
      if (!userId) {
        ws.close(4001, "Unauthorized");
        return;
      }

      this.addClient(userId, ws);

      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === "ping") {
            this.updatePing(userId, ws);
            ws.send(JSON.stringify({ type: "pong" }));
          } else if (message.type === "subscribe_event" && message.eventId) {
            this.subscribeToEvent(userId, message.eventId, ws);
            ws.send(JSON.stringify({ type: "subscribed", eventId: message.eventId }));
          } else if (message.type === "unsubscribe_event" && message.eventId) {
            this.unsubscribeFromEvent(userId, message.eventId, ws);
            ws.send(JSON.stringify({ type: "unsubscribed", eventId: message.eventId }));
          }
        } catch (error) {
          console.error("[WS Autonomous] Error parsing message:", error);
        }
      });

      ws.on("close", () => {
        this.removeClient(userId, ws);
      });

      ws.on("error", (error) => {
        console.error(`[WS Autonomous] Error for user ${userId}:`, error);
        this.removeClient(userId, ws);
      });

      ws.send(JSON.stringify({ type: "connected", userId }));
      console.log(`[WS Autonomous] User ${userId} connected`);
    });

    setInterval(() => this.cleanupStaleConnections(), 60000);

    console.log("[WS Autonomous] WebSocket service initialized on /ws/autonomous");
  }

  private extractUserId(req: any): number | null {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const userId = url.searchParams.get("userId");
    return userId ? parseInt(userId) : null;
  }

  private addClient(userId: number, ws: WebSocket) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    
    this.clients.get(userId)!.push({
      userId,
      ws,
      lastPing: Date.now(),
      subscribedEvents: new Set(),
    });
  }

  private subscribeToEvent(userId: number, eventId: number, ws?: WebSocket) {
    if (!this.eventSubscribers.has(eventId)) {
      this.eventSubscribers.set(eventId, new Set());
    }
    this.eventSubscribers.get(eventId)!.add(userId);
    
    const userClients = this.clients.get(userId);
    if (userClients && ws) {
      const client = userClients.find(c => c.ws === ws);
      if (client) {
        client.subscribedEvents.add(eventId);
      }
    }
    
    console.log(`[WS] User ${userId} subscribed to event ${eventId}`);
  }

  private unsubscribeFromEvent(userId: number, eventId: number, ws?: WebSocket) {
    const userClients = this.clients.get(userId);
    
    if (userClients && ws) {
      const client = userClients.find(c => c.ws === ws);
      if (client) {
        client.subscribedEvents.delete(eventId);
      }
    }
    
    const userStillSubscribed = userClients?.some(c => c.subscribedEvents.has(eventId)) ?? false;
    
    if (!userStillSubscribed) {
      const subscribers = this.eventSubscribers.get(eventId);
      if (subscribers) {
        subscribers.delete(userId);
        if (subscribers.size === 0) {
          this.eventSubscribers.delete(eventId);
        }
      }
    }
    
    console.log(`[WS] User ${userId} unsubscribed from event ${eventId}`);
  }

  private unsubscribeClientFromAllEvents(userId: number, ws: WebSocket) {
    const userClients = this.clients.get(userId);
    const client = userClients?.find(c => c.ws === ws);
    
    if (client) {
      for (const eventId of client.subscribedEvents) {
        this.unsubscribeFromEvent(userId, eventId, ws);
      }
    }
  }

  private removeClient(userId: number, ws: WebSocket) {
    this.unsubscribeClientFromAllEvents(userId, ws);
    
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

  /**
   * Broadcast event to specific user
   */
  broadcastToUser(userId: number, event: string, data: any) {
    const userClients = this.clients.get(userId);
    
    if (!userClients || userClients.length === 0) {
      console.log(`[WS Autonomous] No clients connected for user ${userId}`);
      return false;
    }

    const message = JSON.stringify({
      type: event,
      data,
      timestamp: new Date().toISOString()
    });

    let sent = 0;
    for (const client of userClients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
        sent++;
      }
    }

    console.log(`[WS Autonomous] Sent ${event} to ${sent} client(s) for user ${userId}`);
    return sent > 0;
  }

  /**
   * Check if user has active connections
   */
  isUserOnline(userId: number): boolean {
    return this.clients.has(userId) && this.clients.get(userId)!.length > 0;
  }

  /**
   * Get total online user count
   */
  getOnlineUserCount(): number {
    return this.clients.size;
  }

  /**
   * Broadcast event to all users subscribed to a specific event
   */
  broadcastToEvent(eventId: number, event: string, data: any) {
    const subscribers = this.eventSubscribers.get(eventId);
    
    if (!subscribers || subscribers.size === 0) {
      console.log(`[WS] No subscribers for event ${eventId}`);
      return 0;
    }

    const message = JSON.stringify({
      type: event,
      data: { ...data, eventId },
      timestamp: new Date().toISOString()
    });

    let totalSent = 0;
    for (const userId of subscribers) {
      const userClients = this.clients.get(userId);
      if (userClients) {
        for (const client of userClients) {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(message);
            totalSent++;
          }
        }
      }
    }

    console.log(`[WS] Broadcast ${event} to ${totalSent} client(s) for event ${eventId}`);
    return totalSent;
  }
}

export const wsService = new WebSocketService();
export const broadcastToUser = (userId: number, event: string, data: any) => 
  wsService.broadcastToUser(userId, event, data);
export const broadcastToEvent = (eventId: number, event: string, data: any) =>
  wsService.broadcastToEvent(eventId, event, data);
