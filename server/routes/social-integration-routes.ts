import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { MultiPlatformScraper, validateFacebookDYIData } from '../services/facebook/MultiPlatformScraper';
import { ClosenessCalculator } from '../services/facebook/ClosenessCalculator';
import multer from 'multer';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

router.post(
  '/import/facebook',
  authenticateToken,
  upload.single('file'),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please upload a Facebook DYI JSON file'
        });
      }

      const userId = req.user!.id;
      const userName = req.user!.name;

      const fileContent = req.file.buffer.toString('utf-8');
      let facebookData;

      try {
        facebookData = JSON.parse(fileContent);
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid JSON file',
          message: 'The uploaded file is not valid JSON'
        });
      }

      const validation = await validateFacebookDYIData(facebookData);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Invalid Facebook DYI data',
          message: 'The file does not match the expected Facebook DYI format',
          details: validation.errors
        });
      }

      const clearExisting = req.body.clearExisting === 'true';

      const scraper = new MultiPlatformScraper(userId, userName);

      if (clearExisting) {
        await scraper.clearExistingData();
      }

      const progress = await scraper.importFacebookData(facebookData);

      const calculator = new ClosenessCalculator(userId);
      const metrics = await calculator.calculateAllCloseness();

      return res.json({
        success: true,
        message: 'Facebook data imported successfully',
        progress: {
          totalThreads: progress.totalThreads,
          processedThreads: progress.processedThreads,
          totalMessages: progress.totalMessages,
          processedMessages: progress.processedMessages,
          friendsFound: progress.friendsFound,
          errors: progress.errors
        },
        metrics: {
          totalFriends: metrics.length,
          tier1Count: metrics.filter(m => m.tier === 1).length,
          tier2Count: metrics.filter(m => m.tier === 2).length,
          tier3Count: metrics.filter(m => m.tier === 3).length
        }
      });

    } catch (error) {
      console.error('[social-integration] Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return res.status(500).json({
        error: 'Import failed',
        message: errorMessage
      });
    }
  }
);

router.get(
  '/closeness/:userId',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (req.user!.id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only view your own closeness metrics'
        });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const calculator = new ClosenessCalculator(userId);
      const friends = await calculator.getAllFriends(limit);

      return res.json({
        success: true,
        count: friends.length,
        friends
      });

    } catch (error) {
      console.error('[social-integration] Get closeness error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return res.status(500).json({
        error: 'Failed to get closeness data',
        message: errorMessage
      });
    }
  }
);

router.get(
  '/closeness/:userId/:friendName',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const friendName = req.params.friendName;
      
      if (req.user!.id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only view your own closeness metrics'
        });
      }

      const calculator = new ClosenessCalculator(userId);
      const friend = await calculator.getFriendCloseness(decodeURIComponent(friendName));

      if (!friend) {
        return res.status(404).json({
          error: 'Not found',
          message: `Friend "${friendName}" not found`
        });
      }

      return res.json({
        success: true,
        friend
      });

    } catch (error) {
      console.error('[social-integration] Get friend closeness error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return res.status(500).json({
        error: 'Failed to get friend closeness',
        message: errorMessage
      });
    }
  }
);

router.post(
  '/calculate-closeness/:userId',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (req.user!.id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only recalculate your own closeness metrics'
        });
      }

      const calculator = new ClosenessCalculator(userId);
      const metrics = await calculator.calculateAllCloseness();

      return res.json({
        success: true,
        message: 'Closeness scores recalculated',
        count: metrics.length,
        metrics: {
          totalFriends: metrics.length,
          tier1Count: metrics.filter(m => m.tier === 1).length,
          tier2Count: metrics.filter(m => m.tier === 2).length,
          tier3Count: metrics.filter(m => m.tier === 3).length,
          averageScore: Math.round(
            metrics.reduce((sum, m) => sum + m.closenessScore, 0) / metrics.length
          )
        }
      });

    } catch (error) {
      console.error('[social-integration] Calculate closeness error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return res.status(500).json({
        error: 'Failed to calculate closeness',
        message: errorMessage
      });
    }
  }
);

router.get(
  '/tiers/:userId',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (req.user!.id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only view your own tier data'
        });
      }

      const calculator = new ClosenessCalculator(userId);
      const tiers = await calculator.getFriendsByTier();

      return res.json({
        success: true,
        tiers
      });

    } catch (error) {
      console.error('[social-integration] Get tiers error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return res.status(500).json({
        error: 'Failed to get tier data',
        message: errorMessage
      });
    }
  }
);

router.get(
  '/stats/:userId',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (req.user!.id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only view your own stats'
        });
      }

      const calculator = new ClosenessCalculator(userId);
      const stats = await calculator.getStats();

      return res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('[social-integration] Get stats error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return res.status(500).json({
        error: 'Failed to get stats',
        message: errorMessage
      });
    }
  }
);

export default router;
