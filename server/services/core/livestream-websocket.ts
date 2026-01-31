import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse } from "url";

interface StreamConnection {
  ws: WebSocket;
  streamId: string;
  userId?: number;
}

const connections = new Map<WebSocket, StreamConnection>();

export function initLivestreamWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const { pathname } = parse(request.url || "", true);

    if (pathname?.startsWith("/ws/stream/")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", (ws: WebSocket, request) => {
    const { pathname } = parse(request.url || "", true);
    const streamId = pathname?.split("/ws/stream/")[1];

    if (!streamId) {
      ws.close(1008, "Stream ID required");
      return;
    }

    console.log(`[LiveStream WS] New connection to stream ${streamId}`);

    const connection: StreamConnection = {
      ws,
      streamId,
    };

    connections.set(ws, connection);

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === "join") {
          connection.userId = message.userId;
          console.log(`[LiveStream WS] User ${message.userId} joined stream ${streamId}`);
        } else if (message.type === "chat") {
          broadcastToStream(streamId, {
            type: "chat",
            ...message.data,
          });
        } else if (message.type === "typing") {
          broadcastToStream(streamId, {
            type: "typing",
            userId: connection.userId,
            username: message.username,
          }, ws);
        }
      } catch (error) {
        console.error("[LiveStream WS] Error processing message:", error);
      }
    });

    ws.on("close", () => {
      console.log(`[LiveStream WS] Connection closed for stream ${streamId}`);
      connections.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("[LiveStream WS] WebSocket error:", error);
      connections.delete(ws);
    });

    ws.send(JSON.stringify({
      type: "connected",
      streamId,
    }));
  });

  return wss;
}

export function broadcastToStream(streamId: string, message: any, excludeWs?: WebSocket) {
  let count = 0;
  connections.forEach((connection, ws) => {
    if (connection.streamId === streamId && ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      count++;
    }
  });
  console.log(`[LiveStream WS] Broadcasted message to ${count} clients in stream ${streamId}`);
}

export function getStreamViewerCount(streamId: string): number {
  let count = 0;
  connections.forEach((connection) => {
    if (connection.streamId === streamId) {
      count++;
    }
  });
  return count;
}
