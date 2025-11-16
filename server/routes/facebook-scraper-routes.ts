/**
 * Facebook Scraper API Routes
 * Endpoints to control and monitor Facebook data scraping
 */

import { Router, Request, Response } from 'express';
import { facebookScraper } from '../services/FacebookScraperService';
import { authenticateToken, requireRoleLevel } from '../middleware/auth';
import * as fs from 'fs/promises';
import * as path from 'path';

const router = Router();

// Track scraping jobs
interface ScrapingJob {
  id: string;
  accountName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  progress?: {
    profile: boolean;
    posts: boolean;
    friends: boolean;
    events: boolean;
    groups: boolean;
  };
}

const jobs = new Map<string, ScrapingJob>();

/**
 * POST /api/scraper/facebook/start
 * Start scraping for all configured accounts
 */
router.post('/start', authenticateToken, requireRoleLevel(2), async (req: Request, res: Response) => {
  try {
    const jobId = `job_${Date.now()}`;
    
    // Create job for each account
    const accounts = ['sboddye', 'mundotango'];
    const createdJobs: ScrapingJob[] = [];

    for (const accountName of accounts) {
      const job: ScrapingJob = {
        id: `${jobId}_${accountName}`,
        accountName,
        status: 'pending',
        progress: {
          profile: false,
          posts: false,
          friends: false,
          events: false,
          groups: false
        }
      };
      
      jobs.set(job.id, job);
      createdJobs.push(job);
    }

    // Start scraping in background
    (async () => {
      for (const job of createdJobs) {
        try {
          jobs.set(job.id, { ...job, status: 'running', startedAt: new Date().toISOString() });
          
          const username = process.env[`facebook_${job.accountName}_username`];
          const password = process.env[`facebook_${job.accountName}_password`];

          if (!username || !password) {
            throw new Error(`Missing credentials for ${job.accountName}`);
          }

          const result = await facebookScraper.scrapeAccount({
            username,
            password,
            accountName: job.accountName,
            headless: false
          });

          if (result.success) {
            jobs.set(job.id, {
              ...job,
              status: 'completed',
              completedAt: new Date().toISOString(),
              progress: {
                profile: !!result.profile,
                posts: (result.posts?.length || 0) > 0,
                friends: (result.friends?.length || 0) > 0,
                events: (result.events?.length || 0) > 0,
                groups: (result.groups?.length || 0) > 0
              }
            });
          } else {
            jobs.set(job.id, {
              ...job,
              status: 'failed',
              completedAt: new Date().toISOString(),
              error: result.errors.join(', ')
            });
          }

        } catch (error: any) {
          jobs.set(job.id, {
            ...job,
            status: 'failed',
            completedAt: new Date().toISOString(),
            error: error.message
          });
        }
      }
    })();

    res.json({
      success: true,
      message: 'Scraping jobs started',
      jobs: createdJobs.map(j => ({
        id: j.id,
        accountName: j.accountName,
        status: j.status
      }))
    });

  } catch (error: any) {
    console.error('[Facebook Scraper API] Error starting scrape:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scraper/facebook/start/:account
 * Start scraping for specific account
 */
router.post('/start/:account', authenticateToken, requireRoleLevel(2), async (req: Request, res: Response) => {
  try {
    const { account } = req.params;
    
    if (!['sboddye', 'mundotango'].includes(account)) {
      return res.status(400).json({ error: 'Invalid account name' });
    }

    const jobId = `job_${Date.now()}_${account}`;
    const job: ScrapingJob = {
      id: jobId,
      accountName: account,
      status: 'pending',
      progress: {
        profile: false,
        posts: false,
        friends: false,
        events: false,
        groups: false
      }
    };
    
    jobs.set(jobId, job);

    // Start scraping in background
    (async () => {
      try {
        jobs.set(jobId, { ...job, status: 'running', startedAt: new Date().toISOString() });
        
        const username = process.env[`facebook_${account}_username`];
        const password = process.env[`facebook_${account}_password`];

        if (!username || !password) {
          throw new Error(`Missing credentials for ${account}`);
        }

        const result = await facebookScraper.scrapeAccount({
          username,
          password,
          accountName: account,
          headless: false
        });

        if (result.success) {
          jobs.set(jobId, {
            ...job,
            status: 'completed',
            completedAt: new Date().toISOString(),
            progress: {
              profile: !!result.profile,
              posts: (result.posts?.length || 0) > 0,
              friends: (result.friends?.length || 0) > 0,
              events: (result.events?.length || 0) > 0,
              groups: (result.groups?.length || 0) > 0
            }
          });
        } else {
          jobs.set(jobId, {
            ...job,
            status: 'failed',
            completedAt: new Date().toISOString(),
            error: result.errors.join(', ')
          });
        }

      } catch (error: any) {
        jobs.set(jobId, {
          ...job,
          status: 'failed',
          completedAt: new Date().toISOString(),
          error: error.message
        });
      }
    })();

    res.json({
      success: true,
      message: `Scraping started for ${account}`,
      jobId,
      status: 'pending'
    });

  } catch (error: any) {
    console.error('[Facebook Scraper API] Error starting scrape:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/facebook/status
 * Get status of all scraping jobs
 */
router.get('/status', authenticateToken, requireRoleLevel(2), async (req: Request, res: Response) => {
  try {
    const allJobs = Array.from(jobs.values());
    
    res.json({
      jobs: allJobs,
      summary: {
        total: allJobs.length,
        pending: allJobs.filter(j => j.status === 'pending').length,
        running: allJobs.filter(j => j.status === 'running').length,
        completed: allJobs.filter(j => j.status === 'completed').length,
        failed: allJobs.filter(j => j.status === 'failed').length
      }
    });

  } catch (error: any) {
    console.error('[Facebook Scraper API] Error getting status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/facebook/status/:jobId
 * Get status of specific job
 */
router.get('/status/:jobId', authenticateToken, requireRoleLevel(2), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);

  } catch (error: any) {
    console.error('[Facebook Scraper API] Error getting job status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/facebook/data/:account
 * Get scraped data for specific account
 */
router.get('/data/:account', authenticateToken, requireRoleLevel(2), async (req: Request, res: Response) => {
  try {
    const { account } = req.params;
    const { type } = req.query;

    if (!['sboddye', 'mundotango'].includes(account)) {
      return res.status(400).json({ error: 'Invalid account name' });
    }

    const basePath = path.join(process.cwd(), 'attached_assets', 'facebook_import', account);

    // If specific type requested, return just that
    if (type) {
      const validTypes = ['profile', 'posts', 'friends', 'events', 'groups'];
      if (!validTypes.includes(type as string)) {
        return res.status(400).json({ error: 'Invalid data type' });
      }

      const filePath = path.join(basePath, `${type}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return res.json(JSON.parse(data));
    }

    // Return all available data
    const data: any = {};
    const files = ['profile', 'posts', 'friends', 'events', 'groups'];

    for (const file of files) {
      try {
        const filePath = path.join(basePath, `${file}.json`);
        const fileData = await fs.readFile(filePath, 'utf-8');
        data[file] = JSON.parse(fileData);
      } catch (error) {
        data[file] = null;
      }
    }

    res.json(data);

  } catch (error: any) {
    console.error('[Facebook Scraper API] Error reading data:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/facebook/files/:account
 * List all files for an account
 */
router.get('/files/:account', authenticateToken, requireRoleLevel(2), async (req: Request, res: Response) => {
  try {
    const { account } = req.params;

    if (!['sboddye', 'mundotango'].includes(account)) {
      return res.status(400).json({ error: 'Invalid account name' });
    }

    const basePath = path.join(process.cwd(), 'attached_assets', 'facebook_import', account);

    async function getFiles(dir: string, fileList: any[] = []): Promise<any[]> {
      const files = await fs.readdir(dir, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          await getFiles(filePath, fileList);
        } else {
          const stats = await fs.stat(filePath);
          fileList.push({
            name: file.name,
            path: filePath.replace(process.cwd(), ''),
            size: stats.size,
            modified: stats.mtime
          });
        }
      }
      
      return fileList;
    }

    const files = await getFiles(basePath);

    res.json({
      account,
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      files
    });

  } catch (error: any) {
    console.error('[Facebook Scraper API] Error listing files:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/scraper/facebook/data/:account
 * Clear scraped data for account
 */
router.delete('/data/:account', authenticateToken, requireRoleLevel(3), async (req: Request, res: Response) => {
  try {
    const { account } = req.params;

    if (!['sboddye', 'mundotango'].includes(account)) {
      return res.status(400).json({ error: 'Invalid account name' });
    }

    const basePath = path.join(process.cwd(), 'attached_assets', 'facebook_import', account);
    
    await fs.rm(basePath, { recursive: true, force: true });
    
    res.json({
      success: true,
      message: `Cleared all data for ${account}`
    });

  } catch (error: any) {
    console.error('[Facebook Scraper API] Error clearing data:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
