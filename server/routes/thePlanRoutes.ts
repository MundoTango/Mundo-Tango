import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { THE_PLAN_PAGES, getTotalPages, getPageById } from '@shared/thePlanPages';

const router = Router();

// Get current plan progress for the logged-in user
router.get('/progress', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    // If no user logged in, return inactive state (welcome screen won't show)
    if (!userId) {
      return res.json({ active: false });
    }
    
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
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Get first page from THE_PLAN_PAGES
    const firstPage = THE_PLAN_PAGES[0];
    
    // Initialize The Plan progress with 50 pages from PART_10
    const progress = await storage.createOrUpdatePlanProgress(userId, {
      active: true,
      totalPages: getTotalPages(), // 50 pages from PART_10
      pagesCompleted: 0,
      currentPageIndex: 0,
      currentPage: JSON.stringify({
        id: firstPage.id,
        name: firstPage.name,
        phase: firstPage.phase,
        route: firstPage.route,
        checklist: firstPage.checklist
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
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Mark as inactive (50 pages from PART_10)
    await storage.createOrUpdatePlanProgress(userId, {
      active: false,
      totalPages: getTotalPages(),
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
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
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
