/**
 * Realtime Voice WebSocket Routes
 * Handles WebSocket connections for OpenAI Realtime API
 */

import { Router } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { realtimeVoiceService } from '../services/realtimeVoiceService';
import type { Server } from 'http';

const router = Router();

/**
 * Initialize WebSocket server for Realtime Voice
 */
export function initRealtimeVoiceWebSocket(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws/realtime'
  });

  wss.on('connection', async (ws: WebSocket, req) => {
    console.log('[RealtimeVoice] New WebSocket connection');

    try {
      // Extract user info from query params or headers
      // In production, you'd extract this from JWT token
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const userId = parseInt(url.searchParams.get('userId') || '0');
      const role = url.searchParams.get('role') || 'user';
      const mode = url.searchParams.get('mode') as 'visual_editor' | 'chat' | 'global';
      const page = url.searchParams.get('page') || '/';

      if (!userId) {
        ws.close(1008, 'User ID required');
        return;
      }

      // Initialize Realtime session
      const sessionId = await realtimeVoiceService.initializeSession(
        ws,
        userId,
        role,
        {
          mode,
          page
        }
      );

      console.log(`[RealtimeVoice] Session ${sessionId} initialized for user ${userId}`);

      // Send ready message
      ws.send(JSON.stringify({
        type: 'session.created',
        session: {
          id: sessionId,
          object: 'realtime.session',
          model: 'gpt-4o-realtime-preview-2024-10-01',
          modalities: ['text', 'audio'],
          voice: 'alloy'
        }
      }));

    } catch (error: any) {
      console.error('[RealtimeVoice] Connection error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: {
          message: error.message || 'Failed to initialize voice session',
          code: 'INIT_ERROR'
        }
      }));
      ws.close();
    }
  });

  wss.on('error', (error) => {
    console.error('[RealtimeVoice] WebSocket server error:', error);
  });

  console.log('[RealtimeVoice] WebSocket server initialized on /ws/realtime');

  return wss;
}

/**
 * GET /api/realtime/status
 * Get current Realtime API status
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    activeConnections: realtimeVoiceService.getActiveSessionCount(),
    available: true
  });
});

export default router;
