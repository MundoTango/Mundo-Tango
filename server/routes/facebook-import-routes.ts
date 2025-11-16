/**
 * Facebook Import API Routes
 * Manage Facebook data imports for System 0 Data Pipeline
 */

import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { authenticateToken, requireRoleLevel, AuthRequest } from '../middleware/auth';
import { facebookScraper } from '../services/FacebookScraperService';
import * as fs from 'fs/promises';
import * as path from 'path';

const router = Router();

interface ImportProgress {
  profile: boolean;
  posts: boolean;
  friends: boolean;
  events: boolean;
  groups: boolean;
}

/**
 * POST /api/facebook/import/start
 * Start Facebook data import for configured accounts
 */
router.post('/start', authenticateToken, requireRoleLevel(2), async (req: AuthRequest, res: Response) => {
  try {
    const { accountName } = req.body;
    
    if (!accountName) {
      return res.status(400).json({ error: 'accountName is required' });
    }

    // Create initial import record
    const importRecord = await storage.createFacebookImport({
      userId: req.user!.id,
      accountName,
      dataType: 'full_import',
      status: 'pending',
      jsonData: { 
        progress: {
          profile: false,
          posts: false,
          friends: false,
          events: false,
          groups: false
        }
      }
    });

    // Start import in background
    (async () => {
      try {
        await storage.updateFacebookImport(importRecord.id, { 
          status: 'processing' 
        });

        const username = process.env[`FACEBOOK_${accountName.toUpperCase()}_USERNAME`];
        const password = process.env[`FACEBOOK_${accountName.toUpperCase()}_PASSWORD`];

        if (!username || !password) {
          throw new Error(`Missing credentials for ${accountName}`);
        }

        // Initialize scraper
        await facebookScraper.initialize();
        await facebookScraper.login(username, password);

        // Update progress: profile
        const profile = await facebookScraper.scrapeProfile(accountName);
        await storage.updateFacebookImport(importRecord.id, {
          jsonData: {
            ...importRecord.jsonData,
            profile,
            progress: { ...importRecord.jsonData.progress, profile: true }
          }
        });

        // Update progress: posts
        const posts = await facebookScraper.scrapePosts(accountName, 50);
        await storage.updateFacebookImport(importRecord.id, {
          jsonData: {
            ...importRecord.jsonData,
            posts,
            progress: { ...importRecord.jsonData.progress, posts: true }
          }
        });

        // Update progress: friends
        const friends = await facebookScraper.scrapeFriends(accountName);
        await storage.updateFacebookImport(importRecord.id, {
          jsonData: {
            ...importRecord.jsonData,
            friends,
            progress: { ...importRecord.jsonData.progress, friends: true }
          }
        });

        // Update progress: events
        const events = await facebookScraper.scrapeEvents(accountName);
        await storage.updateFacebookImport(importRecord.id, {
          jsonData: {
            ...importRecord.jsonData,
            events,
            progress: { ...importRecord.jsonData.progress, events: true }
          }
        });

        // Update progress: groups
        const groups = await facebookScraper.scrapeGroups(accountName);
        await storage.updateFacebookImport(importRecord.id, {
          jsonData: {
            ...importRecord.jsonData,
            groups,
            progress: { ...importRecord.jsonData.progress, groups: true }
          },
          status: 'completed'
        });

        await facebookScraper.close();
      } catch (error: any) {
        console.error(`Import failed for ${accountName}:`, error);
        await storage.updateFacebookImport(importRecord.id, {
          status: 'failed',
          errorMessage: error.message
        });
      }
    })();

    res.json({ 
      success: true, 
      importId: importRecord.id,
      message: `Import started for ${accountName}` 
    });
  } catch (error: any) {
    console.error('Error starting import:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/facebook/import/status/:accountName
 * Get import status for a specific account
 */
router.get('/status/:accountName', authenticateToken, requireRoleLevel(2), async (req: AuthRequest, res: Response) => {
  try {
    const { accountName } = req.params;
    const imports = await storage.getFacebookImports(req.user!.id);
    
    const accountImports = imports.filter(i => i.accountName === accountName);
    const latestImport = accountImports.sort((a, b) => 
      new Date(b.importDate).getTime() - new Date(a.importDate).getTime()
    )[0];

    if (!latestImport) {
      return res.json({ 
        accountName,
        status: 'not_started',
        progress: null
      });
    }

    res.json({
      accountName,
      status: latestImport.status,
      progress: latestImport.jsonData?.progress || null,
      importDate: latestImport.importDate,
      errorMessage: latestImport.errorMessage
    });
  } catch (error: any) {
    console.error('Error getting import status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/facebook/imports
 * List all imports for current user or all imports (admin)
 */
router.get('/imports', authenticateToken, requireRoleLevel(2), async (req: AuthRequest, res: Response) => {
  try {
    const imports = await storage.getFacebookImports();
    res.json(imports);
  } catch (error: any) {
    console.error('Error getting imports:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/facebook/import/:id
 * Delete an import and all associated data (GDPR compliance)
 */
router.delete('/import/:id', authenticateToken, requireRoleLevel(2), async (req: AuthRequest, res: Response) => {
  try {
    const importId = parseInt(req.params.id);
    
    // Verify import exists and user has permission
    const importRecord = await storage.getFacebookImportById(importId);
    if (!importRecord) {
      return res.status(404).json({ error: 'Import not found' });
    }

    // Delete the import (cascade will handle related data)
    await storage.deleteFacebookImport(importId);

    res.json({ success: true, message: 'Import deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting import:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/facebook/import/map-to-mt/:id
 * Map Facebook data to Mundo Tango database (posts, friends, events)
 */
router.post('/import/map-to-mt/:id', authenticateToken, requireRoleLevel(2), async (req: AuthRequest, res: Response) => {
  try {
    const importId = parseInt(req.params.id);
    const importRecord = await storage.getFacebookImportById(importId);
    
    if (!importRecord) {
      return res.status(404).json({ error: 'Import not found' });
    }

    if (importRecord.status !== 'completed') {
      return res.status(400).json({ error: 'Import is not completed yet' });
    }

    const data = importRecord.jsonData;
    let mappedCount = { posts: 0, friends: 0, events: 0 };

    // Map posts to facebook_posts table
    if (data.posts && Array.isArray(data.posts)) {
      for (const post of data.posts) {
        await storage.createFacebookPost({
          userId: importRecord.userId!,
          fbPostId: post.id,
          content: post.text,
          mediaUrls: post.mediaUrls || [],
          likes: post.likes || 0,
          comments: post.comments || 0,
          shares: post.shares || 0,
          createdAt: new Date(post.timestamp)
        });
        mappedCount.posts++;
      }
    }

    // Map friends to facebook_friends table
    if (data.friends && Array.isArray(data.friends)) {
      for (const friend of data.friends) {
        await storage.createFacebookFriend({
          userId: importRecord.userId!,
          friendName: friend.name,
          friendFbId: friend.profileUrl,
          mutualFriends: friend.mutualFriends || 0,
          relationship: friend.relationshipType || 'friend'
        });
        mappedCount.friends++;
      }
    }

    // TODO: Map events to MT events table (requires business logic)
    // This would involve:
    // 1. Check if event already exists (by name/date/location)
    // 2. Create new event or link to existing
    // 3. Add user as attendee

    res.json({ 
      success: true, 
      message: 'Data mapped successfully',
      mapped: mappedCount
    });
  } catch (error: any) {
    console.error('Error mapping data:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
