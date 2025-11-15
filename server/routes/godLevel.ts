import express from 'express';
import { approvalService } from '../services/godLevel/approvalService';
import { quotaService } from '../services/godLevel/quotaService';
import { costTrackerService } from '../services/godLevel/costTrackerService';
import { notificationService } from '../services/godLevel/notificationService';
import { requireGodLevel, requireAdmin, GodLevelRequest } from '../middleware/requireGodLevel';

const router = express.Router();

router.post('/request', async (req: GodLevelRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { reason } = req.body;
    if (!reason || reason.trim().length < 20) {
      return res.status(400).json({ 
        error: 'Please provide a detailed reason (at least 20 characters)'
      });
    }

    const result = await approvalService.requestGodLevelAccess(req.user.id, reason);
    
    const adminEmail = process.env.TEST_ADMIN_EMAIL || 'scott@mundotango.com';
    await notificationService.sendApprovalRequest(
      adminEmail, 
      req.user.id, 
      reason,
      'User'
    );

    res.json({ 
      success: true,
      message: 'God Level access request submitted',
      requestId: result.requestId
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/pending', requireAdmin, async (req: GodLevelRequest, res) => {
  try {
    const requests = await approvalService.getPendingRequests();
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/approve/:userId', requireAdmin, async (req: GodLevelRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = parseInt(req.params.userId);
    await approvalService.approveRequest(userId, req.user.id);
    
    await quotaService.ensureQuotaExists(userId);
    
    res.json({ 
      success: true,
      message: 'God Level access approved'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/reject/:userId', requireAdmin, async (req: GodLevelRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = parseInt(req.params.userId);
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Please provide a rejection reason (at least 10 characters)'
      });
    }

    await approvalService.rejectRequest(userId, reason, req.user.id);
    
    res.json({ 
      success: true,
      message: 'God Level access rejected'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/status', async (req: GodLevelRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = await approvalService.getRequestStatus(req.user.id);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/quota', requireGodLevel(), async (req: GodLevelRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const quota = await quotaService.getQuotaStatus(req.user.id);
    res.json(quota);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cost/monthly', requireGodLevel(), async (req: GodLevelRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const month = req.query.month ? new Date(req.query.month as string) : new Date();
    const spend = await costTrackerService.getMonthlySpend(req.user.id, month);
    const breakdown = await costTrackerService.getUserCostBreakdown(req.user.id, month);

    res.json({ spend, breakdown });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cost/history', requireGodLevel(), async (req: GodLevelRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const months = req.query.months ? parseInt(req.query.months as string) : 3;
    const history = await costTrackerService.getUserSpendHistory(req.user.id, months);

    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cost/predict', requireGodLevel(), async (req: GodLevelRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const prediction = await costTrackerService.predictMonthlyBill(req.user.id);
    res.json({ prediction });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/spenders', requireAdmin, async (req: GodLevelRequest, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const spenders = await costTrackerService.getTopSpenders(limit);
    const totalCost = await costTrackerService.getTotalProgramCost();

    res.json({ 
      spenders,
      totalCost
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/quota/:userId', requireAdmin, async (req: GodLevelRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { quotaType, newLimit } = req.body;

    if (!quotaType || !['video', 'voice'].includes(quotaType)) {
      return res.status(400).json({ 
        error: 'Invalid quotaType. Must be "video" or "voice"'
      });
    }

    if (!newLimit || newLimit < 0) {
      return res.status(400).json({ 
        error: 'Invalid newLimit. Must be a positive number'
      });
    }

    await quotaService.setCustomQuota(userId, quotaType, newLimit);

    res.json({ 
      success: true,
      message: `Quota updated for user ${userId}`
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/admin/users', requireAdmin, async (req: GodLevelRequest, res) => {
  try {
    const godUsers = await quotaService.getAllGodUsers();
    
    const usersWithQuotas = await Promise.all(
      godUsers.map(async (user) => {
        const quota = await quotaService.getQuotaStatus(user.userId);
        const breakdown = await costTrackerService.getUserCostBreakdown(user.userId);
        return {
          ...user,
          quota,
          breakdown
        };
      })
    );

    res.json(usersWithQuotas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
