import { Router } from 'express';
import { RBACService } from '../services/RBACService';
import { authenticateToken, requireRoleLevel, AuthRequest } from '../middleware/auth';
import { db } from '@shared/db';
import { platformRoles, platformPermissions, platformUserRoles, platformRolePermissions } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get user's current role level
router.get('/my-role-level', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const roleLevel = await RBACService.getUserRoleLevel(req.userId);
    const permissions = await RBACService.getUserPermissions(req.userId);

    res.json({
      roleLevel,
      permissions,
      tierName: getTierName(roleLevel),
    });
  } catch (error) {
    console.error('Get role level error:', error);
    res.status(500).json({ message: 'Error fetching role level' });
  }
});

// Get user's permissions
router.get('/my-permissions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const permissions = await RBACService.getUserPermissions(req.userId);
    res.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ message: 'Error fetching permissions' });
  }
});

// Check if user has specific permission
router.get('/check-permission/:permissionName', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { permissionName } = req.params;
    const hasPermission = await RBACService.hasPermission(req.userId, permissionName);

    res.json({ hasPermission });
  } catch (error) {
    console.error('Check permission error:', error);
    res.status(500).json({ message: 'Error checking permission' });
  }
});

// Get all roles (God/Super Admin only)
router.get('/roles', authenticateToken, requireRoleLevel(7), async (req, res) => {
  try {
    const roles = await db.select().from(platformRoles);
    res.json({ roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Error fetching roles' });
  }
});

// Get all permissions (God/Super Admin only)
router.get('/permissions', authenticateToken, requireRoleLevel(7), async (req, res) => {
  try {
    const permissions = await db.select().from(platformPermissions);
    res.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ message: 'Error fetching permissions' });
  }
});

// Assign role to user (God/Super Admin only)
router.post('/assign-role', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const { userId, roleName } = req.body;

    if (!userId || !roleName) {
      return res.status(400).json({ message: 'userId and roleName are required' });
    }

    await RBACService.assignRole(userId, roleName, req.userId);

    res.json({ message: 'Role assigned successfully' });
  } catch (error: any) {
    console.error('Assign role error:', error);
    res.status(500).json({ message: error.message || 'Error assigning role' });
  }
});

// Remove role from user (God/Super Admin only)
router.delete('/remove-role', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const { userId, roleName } = req.body;

    if (!userId || !roleName) {
      return res.status(400).json({ message: 'userId and roleName are required' });
    }

    await RBACService.removeRole(userId, roleName);

    res.json({ message: 'Role removed successfully' });
  } catch (error: any) {
    console.error('Remove role error:', error);
    res.status(500).json({ message: error.message || 'Error removing role' });
  }
});

// Helper function to get tier name from level
function getTierName(level: number): string {
  const tiers: { [key: number]: string } = {
    8: 'God',
    7: 'Super Admin',
    6: 'Platform Volunteer',
    5: 'Platform Contributor',
    4: 'Admin',
    3: 'Community Leader',
    2: 'Premium User',
    1: 'Free User',
  };
  return tiers[level] || 'Unknown';
}

export default router;
