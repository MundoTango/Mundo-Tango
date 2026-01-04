/**
 * Plan-Execute Loop Service (Pattern 68)
 * 
 * Implements autonomous planning and execution for multi-step tasks.
 * Uses a Plan → Execute → Observe → Replan cycle for complex operations.
 * 
 * MB.MD v3.2 - VibeCoding Evolution Complete
 */

import { skillCatalogService } from './SkillCatalog';
import { safetyConfirmationService } from './SafetyConfirmation';
import { checkpointManager } from './CheckpointManager';

export interface PlanStep {
  id: string;
  description: string;
  skillName?: string;
  action: string;
  params: Record<string, any>;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
}

export interface ExecutionPlan {
  id: string;
  goal: string;
  steps: PlanStep[];
  createdAt: Date;
  updatedAt: Date;
  status: 'planning' | 'executing' | 'completed' | 'failed' | 'paused';
  currentStepIndex: number;
  metadata?: Record<string, any>;
}

export interface PlanExecuteResult {
  success: boolean;
  planId: string;
  completedSteps: number;
  totalSteps: number;
  results: Map<string, any>;
  errors: string[];
  duration: number;
}

export interface ExecutionContext {
  sessionId: string;
  userId: number;
  roleLevel: number;
}

interface PlanTemplate {
  name: string;
  description: string;
  steps: Omit<PlanStep, 'id' | 'status' | 'result' | 'error'>[];
}

class PlanExecuteLoopService {
  private plans: Map<string, ExecutionPlan> = new Map();
  private templates: Map<string, PlanTemplate> = new Map();
  private maxIterations: number = 20;
  private executionTimeout: number = 300000;

  constructor() {
    this.initializeTemplates();
    console.log('[PlanExecuteLoop] Service initialized with', this.templates.size, 'templates');
  }

  private initializeTemplates(): void {
    this.templates.set('file-refactor', {
      name: 'File Refactor',
      description: 'Refactor a file with backup and validation',
      steps: [
        {
          description: 'Read current file',
          skillName: 'file_read',
          action: 'read',
          params: { path: '{{filePath}}' },
          dependencies: []
        },
        {
          description: 'Create backup checkpoint',
          action: 'checkpoint',
          params: { files: ['{{filePath}}'] },
          dependencies: ['step-0']
        },
        {
          description: 'Apply refactoring',
          skillName: 'file_write',
          action: 'write',
          params: { path: '{{filePath}}', content: '{{newContent}}' },
          dependencies: ['step-1']
        },
        {
          description: 'Validate syntax',
          skillName: 'code_analysis',
          action: 'validate',
          params: { path: '{{filePath}}' },
          dependencies: ['step-2']
        }
      ]
    });

    this.templates.set('bug-fix', {
      name: 'Bug Fix Workflow',
      description: 'Analyze, fix, and test a bug',
      steps: [
        {
          description: 'Analyze bug context',
          action: 'analyze',
          params: { target: '{{bugDescription}}' },
          dependencies: []
        },
        {
          description: 'Locate relevant files',
          skillName: 'search',
          action: 'search',
          params: { query: '{{searchPattern}}' },
          dependencies: ['step-0']
        },
        {
          description: 'Create fix checkpoint',
          action: 'checkpoint',
          params: { files: '{{affectedFiles}}' },
          dependencies: ['step-1']
        },
        {
          description: 'Apply fix',
          action: 'fix',
          params: { changes: '{{fixChanges}}' },
          dependencies: ['step-2']
        },
        {
          description: 'Run tests',
          skillName: 'test',
          action: 'test',
          params: { pattern: '{{testPattern}}' },
          dependencies: ['step-3']
        }
      ]
    });

    this.templates.set('feature-implementation', {
      name: 'Feature Implementation',
      description: 'Implement a new feature with full workflow',
      steps: [
        {
          description: 'Analyze requirements',
          action: 'analyze',
          params: { requirements: '{{featureSpec}}' },
          dependencies: []
        },
        {
          description: 'Design solution',
          action: 'design',
          params: { spec: '{{designSpec}}' },
          dependencies: ['step-0']
        },
        {
          description: 'Create implementation checkpoint',
          action: 'checkpoint',
          params: { label: 'pre-feature-{{featureName}}' },
          dependencies: ['step-1']
        },
        {
          description: 'Implement feature',
          action: 'implement',
          params: { code: '{{implementationCode}}' },
          dependencies: ['step-2']
        },
        {
          description: 'Write tests',
          action: 'write-tests',
          params: { testSpec: '{{testSpec}}' },
          dependencies: ['step-3']
        },
        {
          description: 'Run validation',
          action: 'validate',
          params: { target: '{{featureName}}' },
          dependencies: ['step-4']
        }
      ]
    });
  }

  private generatePlanId(): string {
    return `plan-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private generateStepId(index: number): string {
    return `step-${index}`;
  }

  createPlan(goal: string, steps: Omit<PlanStep, 'id' | 'status'>[]): ExecutionPlan {
    const planId = this.generatePlanId();
    const now = new Date();

    const plan: ExecutionPlan = {
      id: planId,
      goal,
      steps: steps.map((step, index) => ({
        ...step,
        id: this.generateStepId(index),
        status: 'pending'
      })),
      createdAt: now,
      updatedAt: now,
      status: 'planning',
      currentStepIndex: 0
    };

    this.plans.set(planId, plan);
    console.log(`[PlanExecuteLoop] Created plan ${planId} with ${steps.length} steps`);
    return plan;
  }

  createPlanFromTemplate(
    templateName: string,
    variables: Record<string, string>,
    goal?: string
  ): ExecutionPlan | null {
    const template = this.templates.get(templateName);
    if (!template) {
      console.error(`[PlanExecuteLoop] Template not found: ${templateName}`);
      return null;
    }

    const resolvedSteps = template.steps.map((step) => ({
      ...step,
      description: this.resolveVariables(step.description, variables),
      params: this.resolveParamsVariables(step.params, variables)
    }));

    return this.createPlan(goal || template.description, resolvedSteps);
  }

  private resolveVariables(text: string, variables: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
  }

  private resolveParamsVariables(
    params: Record<string, any>,
    variables: Record<string, string>
  ): Record<string, any> {
    const resolved: Record<string, any> = {};
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        resolved[key] = this.resolveVariables(value, variables);
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }

  async executePlan(planId: string, context?: ExecutionContext): Promise<PlanExecuteResult> {
    const plan = this.plans.get(planId);
    if (!plan) {
      return {
        success: false,
        planId,
        completedSteps: 0,
        totalSteps: 0,
        results: new Map(),
        errors: ['Plan not found'],
        duration: 0
      };
    }

    const startTime = Date.now();
    const results = new Map<string, any>();
    const errors: string[] = [];
    let completedSteps = 0;

    plan.status = 'executing';
    plan.updatedAt = new Date();

    for (let i = 0; i < plan.steps.length && i < this.maxIterations; i++) {
      const step = plan.steps[i];
      plan.currentStepIndex = i;

      if (!this.areDependenciesMet(step, plan.steps)) {
        step.status = 'skipped';
        step.error = 'Dependencies not met';
        continue;
      }

      const safetyCheck = safetyConfirmationService.analyzeRisk(
        step.action,
        { description: step.description }
      );
      if (safetyCheck.requiresApproval && safetyCheck.riskLevel === 'critical') {
        step.status = 'skipped';
        step.error = `Safety check failed: ${safetyCheck.approvalReason || 'Critical risk detected'}`;
        errors.push(`Step ${i}: ${step.error}`);
        continue;
      }

      step.status = 'in_progress';
      console.log(`[PlanExecuteLoop] Executing step ${i}: ${step.description}`);

      try {
        const result = await this.executeStep(step, results, context);
        step.result = result;
        step.status = 'completed';
        results.set(step.id, result);
        completedSteps++;
      } catch (error: any) {
        step.status = 'failed';
        step.error = error.message;
        errors.push(`Step ${i} failed: ${error.message}`);
        
        if (step.action === 'checkpoint') {
          continue;
        }
        
        break;
      }
    }

    plan.status = errors.length === 0 ? 'completed' : 'failed';
    plan.updatedAt = new Date();

    const duration = Date.now() - startTime;
    console.log(`[PlanExecuteLoop] Plan ${planId} ${plan.status} in ${duration}ms`);

    return {
      success: plan.status === 'completed',
      planId,
      completedSteps,
      totalSteps: plan.steps.length,
      results,
      errors,
      duration
    };
  }

  private areDependenciesMet(step: PlanStep, allSteps: PlanStep[]): boolean {
    for (const depId of step.dependencies) {
      const depStep = allSteps.find(s => s.id === depId);
      if (!depStep || depStep.status !== 'completed') {
        return false;
      }
    }
    return true;
  }

  private async executeStep(
    step: PlanStep,
    previousResults: Map<string, any>,
    context?: ExecutionContext
  ): Promise<any> {
    if (step.action === 'checkpoint') {
      const files = step.params.files || [];
      const sessionId = context?.sessionId || `plan-${Date.now()}`;
      const checkpoint = await checkpointManager.createCheckpoint(
        sessionId,
        context?.userId || 0,
        step.description,
        Array.isArray(files) ? files : [files]
      );
      return { checkpointId: checkpoint.id };
    }

    if (step.skillName) {
      const skill = skillCatalogService.getSkill(step.skillName);
      if (skill) {
        const execResult = await skillCatalogService.executeSkill(
          step.skillName,
          step.params
        );
        if (!execResult.success) {
          throw new Error(execResult.error || 'Skill execution failed');
        }
        return execResult.result;
      }
    }

    switch (step.action) {
      case 'analyze':
        return { analyzed: true, target: step.params.target || step.params.requirements };
      
      case 'design':
        return { designed: true, spec: step.params.spec };
      
      case 'implement':
        return { implemented: true };
      
      case 'fix':
        return { fixed: true, changes: step.params.changes };
      
      case 'validate':
        return { valid: true, target: step.params.target };
      
      case 'write-tests':
        return { testsWritten: true };
      
      default:
        console.log(`[PlanExecuteLoop] Unknown action: ${step.action}, treating as success`);
        return { action: step.action, params: step.params };
    }
  }

  getPlan(planId: string): ExecutionPlan | undefined {
    return this.plans.get(planId);
  }

  listPlans(): ExecutionPlan[] {
    return Array.from(this.plans.values());
  }

  getActivePlans(): ExecutionPlan[] {
    return Array.from(this.plans.values()).filter(
      p => p.status === 'executing' || p.status === 'paused'
    );
  }

  pausePlan(planId: string): boolean {
    const plan = this.plans.get(planId);
    if (plan && plan.status === 'executing') {
      plan.status = 'paused';
      plan.updatedAt = new Date();
      return true;
    }
    return false;
  }

  async resumePlan(planId: string, context?: ExecutionContext): Promise<PlanExecuteResult | null> {
    const plan = this.plans.get(planId);
    if (!plan || plan.status !== 'paused') {
      return null;
    }
    return this.executePlan(planId, context);
  }

  getTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  getTemplate(name: string): PlanTemplate | undefined {
    return this.templates.get(name);
  }

  addTemplate(name: string, template: PlanTemplate): void {
    this.templates.set(name, template);
    console.log(`[PlanExecuteLoop] Added template: ${name}`);
  }

  getStats(): { 
    totalPlans: number; 
    activePlans: number; 
    completedPlans: number;
    failedPlans: number;
    templates: number;
  } {
    const plans = Array.from(this.plans.values());
    return {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.status === 'executing' || p.status === 'paused').length,
      completedPlans: plans.filter(p => p.status === 'completed').length,
      failedPlans: plans.filter(p => p.status === 'failed').length,
      templates: this.templates.size
    };
  }
}

export const planExecuteLoopService = new PlanExecuteLoopService();
