/**
 * FinancialPageAgent - Specialized agent for Financial/Payment functionality
 * 
 * MB.MD Level 3: Complete specification of Financial system
 */

import { BasePageAgent, ElementLocation } from './BasePageAgent';
import { BaseFeatureAgent, FeaturePRD, TestableBehavior } from './BaseFeatureAgent';

class FinancialDashboardFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('financial-dashboard', 'Financial Dashboard', 'financial-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'financial-dashboard',
      featureName: 'Financial Dashboard',
      description: 'Overview of user financial data including income, expenses, subscription status, and payment history.',
      expectedBehaviors: [
        { id: 'test-dashboard-load', description: 'Dashboard loads with stats', priority: 'critical', expectedOutcome: 'Financial overview visible', steps: [
          { action: 'navigate', value: '/financial', description: 'Navigate to financial' },
          { action: 'wait', timeout: 2000, description: 'Wait for load' },
          { action: 'assert', target: '[data-testid="financial-dashboard"]', value: 'visible', description: 'Dashboard visible' },
        ]},
        { id: 'test-balance-display', description: 'Balance shows correctly', priority: 'critical', expectedOutcome: 'Current balance visible', steps: [
          { action: 'navigate', value: '/financial', description: 'Navigate to financial' },
          { action: 'assert', target: '[data-testid="balance-display"]', value: 'visible', description: 'Balance visible' },
        ]},
      ],
      dependencies: ['Stripe', '/api/financial'],
      apiEndpoints: [
        { endpoint: '/api/financial/summary', method: 'GET', description: 'Get financial summary' },
        { endpoint: '/api/financial/transactions', method: 'GET', description: 'Get transaction history' },
      ],
      uiElements: [
        { selector: '[data-testid="financial-dashboard"]', description: 'Dashboard container', testId: 'financial-dashboard' },
        { selector: '[data-testid="balance-display"]', description: 'Balance display', testId: 'balance-display' },
        { selector: '[data-testid="transactions-list"]', description: 'Transactions list', testId: 'transactions-list' },
      ],
      knownIssues: [
        { pattern: 'currency format', fix: 'Use Intl.NumberFormat for proper currency display', severity: 'medium' },
      ],
    };
  }
}

class PortfoliosFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('portfolios', 'Financial Portfolios', 'financial-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'portfolios',
      featureName: 'Financial Portfolios',
      description: 'Manage investment portfolios, savings goals, and financial planning for tango-related activities.',
      expectedBehaviors: [
        { id: 'test-portfolios-list', description: 'Portfolios list loads', priority: 'high', expectedOutcome: 'Portfolios visible', steps: [
          { action: 'navigate', value: '/financial/portfolios', description: 'Navigate to portfolios' },
          { action: 'assert', target: '[data-testid="portfolios-list"]', value: 'visible', description: 'Portfolios visible' },
        ]},
        { id: 'test-create-portfolio', description: 'Create portfolio works', priority: 'high', expectedOutcome: 'New portfolio created', steps: [
          { action: 'navigate', value: '/financial/portfolios', description: 'Navigate to portfolios' },
          { action: 'click', target: '[data-testid="create-portfolio-button"]', description: 'Click create' },
          { action: 'assert', target: '[data-testid="portfolio-form"]', value: 'visible', description: 'Form opens' },
        ]},
      ],
      dependencies: ['/api/financial/portfolios'],
      apiEndpoints: [
        { endpoint: '/api/financial/portfolios', method: 'GET', description: 'Get user portfolios' },
        { endpoint: '/api/financial/portfolios', method: 'POST', description: 'Create portfolio' },
      ],
      uiElements: [
        { selector: '[data-testid="portfolios-list"]', description: 'Portfolios list', testId: 'portfolios-list' },
        { selector: '[data-testid="create-portfolio-button"]', description: 'Create button', testId: 'create-portfolio-button' },
        { selector: '[data-testid="portfolio-card"]', description: 'Portfolio card', testId: 'portfolio-card' },
      ],
      knownIssues: [],
    };
  }
}

class BudgetBuilderFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('budget-builder', 'Budget Builder', 'financial-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'budget-builder',
      featureName: 'AI Budget Builder',
      description: 'AI-powered budgeting tool for planning tango travel, events, and lessons expenses.',
      expectedBehaviors: [
        { id: 'test-budget-page', description: 'Budget builder loads', priority: 'high', expectedOutcome: 'Budget tool visible', steps: [
          { action: 'navigate', value: '/financial/budget', description: 'Navigate to budget' },
          { action: 'assert', target: '[data-testid="budget-builder"]', value: 'visible', description: 'Builder visible' },
        ]},
        { id: 'test-ai-suggestions', description: 'AI suggestions generate', priority: 'medium', expectedOutcome: 'AI budget suggestions shown', steps: [
          { action: 'navigate', value: '/financial/budget', description: 'Navigate to budget' },
          { action: 'click', target: '[data-testid="generate-suggestions-button"]', description: 'Click generate' },
          { action: 'wait', timeout: 3000, description: 'Wait for AI' },
          { action: 'assert', target: '[data-testid="ai-suggestions"]', value: 'visible', description: 'Suggestions visible' },
        ]},
      ],
      dependencies: ['OpenAI', '/api/financial/budget'],
      apiEndpoints: [
        { endpoint: '/api/financial/budget', method: 'GET', description: 'Get budget data' },
        { endpoint: '/api/financial/budget/suggestions', method: 'POST', description: 'Get AI suggestions' },
      ],
      uiElements: [
        { selector: '[data-testid="budget-builder"]', description: 'Budget builder', testId: 'budget-builder' },
        { selector: '[data-testid="generate-suggestions-button"]', description: 'Generate button', testId: 'generate-suggestions-button' },
        { selector: '[data-testid="ai-suggestions"]', description: 'AI suggestions', testId: 'ai-suggestions' },
        { selector: '[data-testid="budget-categories"]', description: 'Budget categories', testId: 'budget-categories' },
      ],
      knownIssues: [
        { pattern: 'AI timeout', fix: 'Implement streaming response with loading state', severity: 'medium' },
      ],
    };
  }
}

export class FinancialPageAgent extends BasePageAgent {
  private featureAgents: Map<string, BaseFeatureAgent>;

  constructor() {
    super(
      'financial-page',
      'Financial Page Agent',
      [
        'client/src/pages/FinancialDashboardPage.tsx',
        'client/src/pages/FinancialPortfoliosPage.tsx',
        'client/src/pages/AIBudgetBuilder.tsx',
        'client/src/pages/BillingHistory.tsx',
        'client/src/pages/SubscriptionPlans.tsx',
        'server/routes/budget-routes.ts',
        'server/routes/subscription-routes.ts',
      ]
    );

    this.featureAgents = new Map();
    this.initializeFeatureAgents();
  }

  private initializeFeatureAgents() {
    const agents = [
      new FinancialDashboardFeatureAgent(),
      new PortfoliosFeatureAgent(),
      new BudgetBuilderFeatureAgent(),
    ];
    agents.forEach(a => this.featureAgents.set(a.getFeatureId(), a));
    console.log(`[Financial Page Agent] Initialized ${this.featureAgents.size} feature agents`);
  }

  getFeatureAgents(): BaseFeatureAgent[] {
    return Array.from(this.featureAgents.values());
  }

  getFeatureAgent(id: string): BaseFeatureAgent | undefined {
    return this.featureAgents.get(id);
  }

  async canHandle(query: string): Promise<{ canHandle: boolean; confidence: number; element: ElementLocation | null; reason: string }> {
    const lower = query.toLowerCase();
    if (lower.includes('financial') || lower.includes('payment') || lower.includes('budget') || lower.includes('subscription') || lower.includes('billing')) {
      return { canHandle: true, confidence: 0.90, element: null, reason: 'Financial Page Agent owns all financial functionality' };
    }
    return { canHandle: false, confidence: 0, element: null, reason: 'Query does not match Financial domain' };
  }

  async findElement(query: string): Promise<ElementLocation | null> {
    return null;
  }
}
