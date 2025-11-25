/**
 * AdminPageAgent - Specialized agent for Admin Dashboard functionality
 * 
 * MB.MD Level 3: Complete specification of Admin system
 */

import { BasePageAgent, ElementLocation } from './BasePageAgent';
import { BaseFeatureAgent, FeaturePRD, TestableBehavior } from './BaseFeatureAgent';

class UserManagementFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('user-management', 'User Management', 'admin-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'user-management',
      featureName: 'User Management',
      description: 'Admin interface for managing users including viewing, editing, banning, and role assignment.',
      expectedBehaviors: [
        { id: 'test-user-list', description: 'User list loads with pagination', priority: 'critical', expectedOutcome: 'User table visible', steps: [
          { action: 'navigate', value: '/admin/users', description: 'Navigate to user management' },
          { action: 'wait', timeout: 2000, description: 'Wait for load' },
          { action: 'assert', target: '[data-testid="users-table"]', value: 'visible', description: 'Users table visible' },
        ]},
        { id: 'test-user-search', description: 'User search works', priority: 'high', expectedOutcome: 'Filtered results shown', steps: [
          { action: 'navigate', value: '/admin/users', description: 'Navigate to user management' },
          { action: 'type', target: '[data-testid="user-search-input"]', value: 'test@example.com', description: 'Search for user' },
          { action: 'wait', timeout: 1000, description: 'Wait for search' },
          { action: 'assert', target: '[data-testid="search-results"]', value: 'visible', description: 'Results shown' },
        ]},
        { id: 'test-edit-user', description: 'Edit user modal works', priority: 'high', expectedOutcome: 'Edit modal opens with user data', steps: [
          { action: 'navigate', value: '/admin/users', description: 'Navigate to user management' },
          { action: 'click', target: '[data-testid="edit-user-button"]:first-child', description: 'Click edit' },
          { action: 'assert', target: '[data-testid="edit-user-modal"]', value: 'visible', description: 'Edit modal opens' },
        ]},
      ],
      dependencies: ['RBAC middleware', '/api/admin/users'],
      apiEndpoints: [
        { endpoint: '/api/admin/users', method: 'GET', description: 'Get users with pagination' },
        { endpoint: '/api/admin/users/:id', method: 'PATCH', description: 'Update user' },
        { endpoint: '/api/admin/users/:id/ban', method: 'POST', description: 'Ban user' },
      ],
      uiElements: [
        { selector: '[data-testid="users-table"]', description: 'Users table', testId: 'users-table' },
        { selector: '[data-testid="user-search-input"]', description: 'Search input', testId: 'user-search-input' },
        { selector: '[data-testid="edit-user-button"]', description: 'Edit button', testId: 'edit-user-button' },
        { selector: '[data-testid="ban-user-button"]', description: 'Ban button', testId: 'ban-user-button' },
      ],
      knownIssues: [
        { pattern: 'admin role check', fix: 'Verify user.role includes admin before allowing access', severity: 'critical' },
      ],
    };
  }
}

class SystemHealthFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('system-health', 'System Health', 'admin-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'system-health',
      featureName: 'System Health Dashboard',
      description: 'Real-time system health monitoring including server status, database health, API latency, and error rates.',
      expectedBehaviors: [
        { id: 'test-health-dashboard', description: 'Health dashboard loads', priority: 'critical', expectedOutcome: 'Health metrics visible', steps: [
          { action: 'navigate', value: '/admin/system-health', description: 'Navigate to system health' },
          { action: 'wait', timeout: 2000, description: 'Wait for metrics' },
          { action: 'assert', target: '[data-testid="health-dashboard"]', value: 'visible', description: 'Dashboard visible' },
        ]},
        { id: 'test-db-status', description: 'Database status shows', priority: 'high', expectedOutcome: 'DB connection status visible', steps: [
          { action: 'navigate', value: '/admin/system-health', description: 'Navigate to system health' },
          { action: 'assert', target: '[data-testid="db-status"]', value: 'visible', description: 'DB status visible' },
        ]},
      ],
      dependencies: ['Prometheus metrics', '/api/admin/health'],
      apiEndpoints: [
        { endpoint: '/api/admin/health', method: 'GET', description: 'Get system health status' },
        { endpoint: '/api/admin/metrics', method: 'GET', description: 'Get Prometheus metrics' },
      ],
      uiElements: [
        { selector: '[data-testid="health-dashboard"]', description: 'Health dashboard', testId: 'health-dashboard' },
        { selector: '[data-testid="db-status"]', description: 'Database status', testId: 'db-status' },
        { selector: '[data-testid="api-latency"]', description: 'API latency chart', testId: 'api-latency' },
        { selector: '[data-testid="error-rate"]', description: 'Error rate display', testId: 'error-rate' },
      ],
      knownIssues: [],
    };
  }
}

class FeatureFlagsFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('feature-flags', 'Feature Flags', 'admin-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'feature-flags',
      featureName: 'Feature Flags Management',
      description: 'Admin interface for toggling feature flags, A/B tests, and gradual rollouts.',
      expectedBehaviors: [
        { id: 'test-flags-list', description: 'Feature flags list loads', priority: 'high', expectedOutcome: 'Flags table visible', steps: [
          { action: 'navigate', value: '/admin/feature-flags', description: 'Navigate to feature flags' },
          { action: 'assert', target: '[data-testid="flags-table"]', value: 'visible', description: 'Flags visible' },
        ]},
        { id: 'test-toggle-flag', description: 'Toggling a flag works', priority: 'critical', expectedOutcome: 'Flag state changes', steps: [
          { action: 'navigate', value: '/admin/feature-flags', description: 'Navigate to feature flags' },
          { action: 'click', target: '[data-testid="flag-toggle"]:first-child', description: 'Toggle flag' },
          { action: 'wait', timeout: 1000, description: 'Wait for update' },
          { action: 'assert', target: '[data-testid="toast-success"]', value: 'visible', description: 'Success message' },
        ]},
      ],
      dependencies: ['/api/admin/feature-flags'],
      apiEndpoints: [
        { endpoint: '/api/admin/feature-flags', method: 'GET', description: 'Get all flags' },
        { endpoint: '/api/admin/feature-flags/:id', method: 'PATCH', description: 'Update flag' },
      ],
      uiElements: [
        { selector: '[data-testid="flags-table"]', description: 'Flags table', testId: 'flags-table' },
        { selector: '[data-testid="flag-toggle"]', description: 'Flag toggle switch', testId: 'flag-toggle' },
        { selector: '[data-testid="create-flag-button"]', description: 'Create flag button', testId: 'create-flag-button' },
      ],
      knownIssues: [],
    };
  }
}

class RolesPermissionsFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('roles-permissions', 'Roles & Permissions', 'admin-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'roles-permissions',
      featureName: 'Roles & Permissions',
      description: '8-tier RBAC system management for assigning roles and permissions to users.',
      expectedBehaviors: [
        { id: 'test-roles-list', description: 'Roles list loads', priority: 'critical', expectedOutcome: 'All 8 role tiers visible', steps: [
          { action: 'navigate', value: '/admin/roles', description: 'Navigate to roles' },
          { action: 'assert', target: '[data-testid="roles-table"]', value: 'visible', description: 'Roles table visible' },
        ]},
        { id: 'test-assign-role', description: 'Assigning role to user works', priority: 'critical', expectedOutcome: 'Role assigned with confirmation', steps: [
          { action: 'navigate', value: '/admin/roles', description: 'Navigate to roles' },
          { action: 'click', target: '[data-testid="assign-role-button"]', description: 'Click assign' },
          { action: 'assert', target: '[data-testid="assign-role-modal"]', value: 'visible', description: 'Modal opens' },
        ]},
      ],
      dependencies: ['RBAC system', '/api/admin/roles'],
      apiEndpoints: [
        { endpoint: '/api/admin/roles', method: 'GET', description: 'Get all roles' },
        { endpoint: '/api/admin/roles/:userId', method: 'PATCH', description: 'Assign role to user' },
      ],
      uiElements: [
        { selector: '[data-testid="roles-table"]', description: 'Roles table', testId: 'roles-table' },
        { selector: '[data-testid="assign-role-button"]', description: 'Assign role button', testId: 'assign-role-button' },
        { selector: '[data-testid="permissions-matrix"]', description: 'Permissions matrix', testId: 'permissions-matrix' },
      ],
      knownIssues: [
        { pattern: 'role hierarchy violation', fix: 'Ensure user can only assign roles below their own level', severity: 'critical' },
      ],
    };
  }
}

export class AdminPageAgent extends BasePageAgent {
  private featureAgents: Map<string, BaseFeatureAgent>;

  constructor() {
    super(
      'admin-page',
      'Admin Page Agent',
      [
        'client/src/pages/admin/AdminDashboardPage.tsx',
        'client/src/pages/admin/UserManagementPage.tsx',
        'client/src/pages/admin/SystemHealthPage.tsx',
        'client/src/pages/admin/FeatureFlagsPage.tsx',
        'client/src/pages/admin/RolesPermissionsPage.tsx',
        'client/src/pages/admin/ReportsLogsPage.tsx',
        'server/routes/admin-routes.ts',
      ]
    );

    this.featureAgents = new Map();
    this.initializeFeatureAgents();
  }

  private initializeFeatureAgents() {
    const agents = [
      new UserManagementFeatureAgent(),
      new SystemHealthFeatureAgent(),
      new FeatureFlagsFeatureAgent(),
      new RolesPermissionsFeatureAgent(),
    ];
    agents.forEach(a => this.featureAgents.set(a.getFeatureId(), a));
    console.log(`[Admin Page Agent] Initialized ${this.featureAgents.size} feature agents`);
  }

  getFeatureAgents(): BaseFeatureAgent[] {
    return Array.from(this.featureAgents.values());
  }

  getFeatureAgent(id: string): BaseFeatureAgent | undefined {
    return this.featureAgents.get(id);
  }

  async canHandle(query: string): Promise<{ canHandle: boolean; confidence: number; element: ElementLocation | null; reason: string }> {
    const lower = query.toLowerCase();
    if (lower.includes('admin') || lower.includes('user management') || lower.includes('system health') || lower.includes('feature flag') || lower.includes('role') || lower.includes('permission')) {
      return { canHandle: true, confidence: 0.90, element: null, reason: 'Admin Page Agent owns all admin functionality' };
    }
    return { canHandle: false, confidence: 0, element: null, reason: 'Query does not match Admin domain' };
  }

  async findElement(query: string): Promise<ElementLocation | null> {
    return null;
  }
}
