import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  startAutonomousLoop, 
  stopAutonomousLoop, 
  triggerManualLoop,
  getLoopStatus 
} from '../workers/autonomous-worker';

/**
 * AUTONOMOUS LOOP API ENDPOINTS
 * MB.MD Protocol v9.2: Phase 2 - Control 24/7 autonomous operations
 * 
 * Endpoints:
 * - GET /status - Get loop status
 * - POST /start - Start 24/7 loop
 * - POST /stop - Stop loop
 * - POST /trigger - Manual trigger
 */

const router = Router();

/**
 * Get autonomous loop status
 */
router.get('/status', async (req, res) => {
  try {
    const status = await getLoopStatus();
    
    res.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('[Autonomous Loop API] Status check failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Start 24/7 autonomous loop
 * Requires authentication (admin/god-level only in production)
 */
router.post('/start', authenticateToken, async (req, res) => {
  try {
    await startAutonomousLoop();
    
    res.json({
      success: true,
      message: '24/7 autonomous loop started',
    });
  } catch (error) {
    console.error('[Autonomous Loop API] Start failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Stop autonomous loop
 */
router.post('/stop', authenticateToken, async (req, res) => {
  try {
    await stopAutonomousLoop();
    
    res.json({
      success: true,
      message: 'Autonomous loop stopped',
    });
  } catch (error) {
    console.error('[Autonomous Loop API] Stop failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Manually trigger loop iteration
 */
router.post('/trigger', authenticateToken, async (req, res) => {
  try {
    const { context } = req.body;
    
    await triggerManualLoop(context);
    
    res.json({
      success: true,
      message: 'Manual loop iteration triggered',
    });
  } catch (error) {
    console.error('[Autonomous Loop API] Trigger failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
