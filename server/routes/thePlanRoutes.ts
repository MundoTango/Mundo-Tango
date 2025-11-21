import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Get current plan progress for the logged-in user
router.get('/progress', async (req, res) => {
  try {
    const userId = (req as any).user?.id || 0; // Default to 0 for anonymous/first user
    
    const progress = await storage.getPlanProgress(userId);
    
    if (!progress) {
      // No progress yet - The Plan is not active
      return res.json({ active: false });
    }
    
    res.json({
      active: progress.active,
      totalPages: progress.totalPages,
      pagesCompleted: progress.pagesCompleted,
      currentPageIndex: progress.currentPageIndex,
      currentPage: progress.currentPage ? JSON.parse(progress.currentPage) : null,
      startedAt: progress.startedAt,
      completedAt: progress.completedAt
    });
  } catch (error) {
    console.error('[The Plan] Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch plan progress' });
  }
});

// Start The Plan validation tour
router.post('/start', async (req, res) => {
  try {
    const userId = (req as any).user?.id || 0;
    
    // Initialize The Plan progress
    const progress = await storage.createOrUpdatePlanProgress(userId, {
      active: true,
      totalPages: 47, // PART 10 spec: 47 pages to validate
      pagesCompleted: 0,
      currentPageIndex: 0,
      currentPage: JSON.stringify({
        name: 'Dashboard / Home Feed',
        checklist: [
          { label: 'Feed loads correctly', status: 'pending' },
          { label: 'Post creation works', status: 'pending' },
          { label: 'Notifications visible', status: 'pending' }
        ]
      }),
      startedAt: new Date()
    });
    
    res.json({ success: true, progress });
  } catch (error) {
    console.error('[The Plan] Error starting plan:', error);
    res.status(500).json({ error: 'Failed to start The Plan' });
  }
});

// Skip The Plan and go straight to dashboard
router.post('/skip', async (req, res) => {
  try {
    const userId = (req as any).user?.id || 0;
    
    // Mark as inactive
    await storage.createOrUpdatePlanProgress(userId, {
      active: false,
      totalPages: 47,
      pagesCompleted: 0,
      currentPageIndex: 0
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('[The Plan] Error skipping plan:', error);
    res.status(500).json({ error: 'Failed to skip The Plan' });
  }
});

// Update progress (mark page as tested)
router.post('/update', async (req, res) => {
  try {
    const userId = (req as any).user?.id || 0;
    
    const schema = z.object({
      pageIndex: z.number(),
      pageName: z.string(),
      checklist: z.array(z.object({
        label: z.string(),
        status: z.enum(['pass', 'fail', 'pending'])
      }))
    });
    
    const data = schema.parse(req.body);
    
    const currentProgress = await storage.getPlanProgress(userId);
    
    if (!currentProgress) {
      return res.status(404).json({ error: 'No active plan found' });
    }
    
    // Check if all checklist items passed
    const allPassed = data.checklist.every(item => item.status === 'pass');
    
    const updatedProgress = await storage.createOrUpdatePlanProgress(userId, {
      currentPageIndex: data.pageIndex,
      pagesCompleted: allPassed ? currentProgress.pagesCompleted + 1 : currentProgress.pagesCompleted,
      currentPage: JSON.stringify({
        name: data.pageName,
        checklist: data.checklist
      })
    });
    
    res.json({ success: true, progress: updatedProgress });
  } catch (error) {
    console.error('[The Plan] Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;
