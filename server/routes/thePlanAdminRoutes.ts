import { Router } from 'express';
import { db } from '../db';
import { pageInventory, auditIssues } from '@shared/schema';
import { THE_PLAN_PAGES } from '@shared/thePlanPages';
import { eq, desc, sql } from 'drizzle-orm';
import { ComprehensiveAuditRunner } from '../services/orchestration/ComprehensiveAuditRunner';
import { videoRecordingService } from '../services/video/VideoRecordingService';

const router = Router();

// Singleton instance for audit runner to maintain state across requests
let auditRunner: ComprehensiveAuditRunner | null = null;
let isAuditRunning = false;

function getAuditRunner(): ComprehensiveAuditRunner {
  if (!auditRunner) {
    auditRunner = new ComprehensiveAuditRunner();
  }
  return auditRunner;
}

router.get('/pages', async (req, res) => {
  try {
    const pages = await db.select().from(pageInventory).orderBy(desc(pageInventory.priority));
    
    if (pages.length === 0) {
      // Map phase names to valid category enum values
      const categoryMap: Record<string, string> = {
        'Core Platform': 'dashboard',
        'Social Features': 'profile',
        'Events & Calendar': 'events',
        'Groups & Communities': 'groups',
        'Messaging & Communication': 'messages',
        'AI & Productivity': 'mrblue',
        'Professional Services': 'professional',
        'Travel & Housing': 'travel',
        'Admin & Settings': 'admin',
        'Marketing & Growth': 'marketing'
      };
      
      const seedPages = THE_PLAN_PAGES.map((page, index) => ({
        id: `page-${page.id}`,
        name: page.name,
        path: page.route,
        category: categoryMap[page.phase] || 'other',
        priority: index < 10 ? 'critical' : index < 30 ? 'high' : 'medium',
        auditStatus: 'pending' as const,
        dependencies: [],
        components: [],
        apiEndpoints: [],
        roleRequired: 0,
        issueCount: 0
      }));
      
      for (const page of seedPages) {
        await db.insert(pageInventory).values(page).onConflictDoNothing();
      }
      
      const seededPages = await db.select().from(pageInventory).orderBy(desc(pageInventory.priority));
      return res.json(seededPages);
    }
    
    res.json(pages);
  } catch (error) {
    console.error('[The Plan Admin] Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(pageInventory);
    const pendingResult = await db.select({ count: sql<number>`count(*)` }).from(pageInventory).where(eq(pageInventory.auditStatus, 'pending'));
    const auditingResult = await db.select({ count: sql<number>`count(*)` }).from(pageInventory).where(eq(pageInventory.auditStatus, 'auditing'));
    const completedResult = await db.select({ count: sql<number>`count(*)` }).from(pageInventory).where(eq(pageInventory.auditStatus, 'completed'));
    const failedResult = await db.select({ count: sql<number>`count(*)` }).from(pageInventory).where(eq(pageInventory.auditStatus, 'failed'));
    const issuesResult = await db.select({ count: sql<number>`count(*)` }).from(auditIssues);
    const resolvedResult = await db.select({ count: sql<number>`count(*)` }).from(auditIssues).where(eq(auditIssues.status, 'resolved'));
    
    res.json({
      total: Number(totalResult[0]?.count || 0),
      pending: Number(pendingResult[0]?.count || 0),
      auditing: Number(auditingResult[0]?.count || 0),
      completed: Number(completedResult[0]?.count || 0),
      failed: Number(failedResult[0]?.count || 0),
      issuesFound: Number(issuesResult[0]?.count || 0),
      issuesResolved: Number(resolvedResult[0]?.count || 0)
    });
  } catch (error) {
    console.error('[The Plan Admin] Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.post('/audit/start', async (req, res) => {
  try {
    const { perspectives = ['cto', 'marketing', 'ui', 'ux', 'graphic', 'journey'] } = req.body;
    
    if (isAuditRunning) {
      return res.json({ success: false, message: 'Audit already running' });
    }
    
    const pendingPages = await db.select().from(pageInventory).where(eq(pageInventory.auditStatus, 'pending'));
    
    if (pendingPages.length === 0) {
      return res.json({ success: false, message: 'No pending pages to audit' });
    }
    
    // Update pages to auditing status
    for (const page of pendingPages) {
      await db.update(pageInventory)
        .set({ 
          auditStatus: 'auditing'
        })
        .where(eq(pageInventory.id, page.id));
    }
    
    // Mark audit as running
    isAuditRunning = true;
    
    // Start async audit execution (non-blocking)
    const runner = getAuditRunner();
    
    // First ensure batches are created from database pages
    runner.createBatches().then(async (batches) => {
      console.log(`[The Plan Admin] Created ${batches.length} audit batches`);
      
      // Now run the audit
      return runner.resumeFromNextPending();
    }).then(async (result) => {
      console.log(`[The Plan Admin] Audit batch completed: ${result.message}`);
      
      // Update page statuses based on audit results
      const auditingPages = await db.select().from(pageInventory).where(eq(pageInventory.auditStatus, 'auditing'));
      for (const page of auditingPages) {
        await db.update(pageInventory)
          .set({ auditStatus: 'completed' })
          .where(eq(pageInventory.id, page.id));
      }
      
      isAuditRunning = false;
    }).catch((error) => {
      console.error('[The Plan Admin] Audit failed:', error);
      isAuditRunning = false;
    });
    
    res.json({ 
      success: true, 
      message: `Started audit of ${pendingPages.length} pages with ${perspectives.length} perspectives`,
      pagesQueued: pendingPages.length,
      perspectives
    });
  } catch (error) {
    console.error('[The Plan Admin] Error starting audit:', error);
    res.status(500).json({ error: 'Failed to start audit' });
  }
});

router.post('/audit/stop', async (req, res) => {
  try {
    // Mark audit as stopped
    isAuditRunning = false;
    
    // Reset the audit runner instance to clear any in-progress state
    auditRunner = null;
    
    const auditingPages = await db.select().from(pageInventory).where(eq(pageInventory.auditStatus, 'auditing'));
    
    for (const page of auditingPages) {
      await db.update(pageInventory)
        .set({ auditStatus: 'pending' })
        .where(eq(pageInventory.id, page.id));
    }
    
    res.json({ 
      success: true, 
      message: `Stopped audit of ${auditingPages.length} pages`,
      pagesStopped: auditingPages.length
    });
  } catch (error) {
    console.error('[The Plan Admin] Error stopping audit:', error);
    res.status(500).json({ error: 'Failed to stop audit' });
  }
});

router.get('/audit/progress', async (req, res) => {
  try {
    const runner = getAuditRunner();
    const batchProgress = await runner.getBatchProgress();
    
    res.json({
      isRunning: isAuditRunning,
      ...batchProgress
    });
  } catch (error) {
    console.error('[The Plan Admin] Error fetching audit progress:', error);
    res.status(500).json({ error: 'Failed to fetch audit progress' });
  }
});

router.post('/capture-video/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const page = await db.select().from(pageInventory).where(eq(pageInventory.id, pageId));
    
    if (!page.length) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const { pageVideoCaptureService } = await import('../services/video/PageVideoCaptureService');
    
    const { queued, position } = await pageVideoCaptureService.queueCapture({
      pageId: page[0].id,
      pageName: page[0].name,
      pagePath: page[0].path
    });
    
    res.json({ 
      success: true, 
      message: `Video capture queued for ${page[0].name}`,
      pageId,
      queuePosition: position,
      queued
    });
  } catch (error) {
    console.error('[The Plan Admin] Error capturing video:', error);
    res.status(500).json({ error: 'Failed to capture video' });
  }
});

router.get('/issues', async (req, res) => {
  try {
    const issues = await db.select().from(auditIssues).orderBy(desc(auditIssues.createdAt));
    res.json(issues);
  } catch (error) {
    console.error('[The Plan Admin] Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

router.get('/videos', async (req, res) => {
  try {
    const { pageVideoCaptureService } = await import('../services/video/PageVideoCaptureService');
    
    const pageVideos = await pageVideoCaptureService.getPageVideos();
    const journeyVideos = await videoRecordingService.getVideoLibrary();
    const queueStatus = pageVideoCaptureService.getQueueStatus();
    
    res.json({ 
      pageVideos,
      journeyVideos: journeyVideos.videos,
      totalCount: pageVideos.length + journeyVideos.totalCount,
      queueStatus,
      message: pageVideos.length === 0 && journeyVideos.totalCount === 0 
        ? 'Video capture system ready. Click capture buttons to record page demos.' 
        : undefined
    });
  } catch (error) {
    console.error('[The Plan Admin] Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

router.get('/tours', async (req, res) => {
  try {
    const { tourGenerationService } = await import('../services/tour/TourGenerationService');
    
    const tours = await tourGenerationService.generateToursFromAuditData();
    const stats = await tourGenerationService.getTourStats();
    
    res.json({ 
      tours,
      stats,
      message: tours.length === 0 
        ? 'Tour generation ready. Complete page audits to create Mr Blue user tours.' 
        : undefined
    });
  } catch (error) {
    console.error('[The Plan Admin] Error fetching tours:', error);
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
});

export default router;
