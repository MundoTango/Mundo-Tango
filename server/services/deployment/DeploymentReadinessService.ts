import { buildValidator } from './BuildValidator';
import { validationService } from '../validation/ValidationService';
import { gitService } from '../git/GitService';
import { sequentialOrchestrator } from '../orchestration/SequentialOrchestrator';
import type { WorkflowStep } from '@shared/types/a2a';
import { db } from '../../db';
import { deploymentChecks } from '../../../shared/schema';

export interface DeploymentCheck {
  name: string;
  passed: boolean;
  message: string;
  blocker: boolean;
}

export interface DeploymentReadinessResult {
  ready: boolean;
  checks: DeploymentCheck[];
  blockers: number;
  warnings: number;
  score: number;
}

export class DeploymentReadinessService {
  /**
   * Orchestrate all deployment readiness checks (Pattern 32)
   * Execute sequentially: Build → Test → Git → Deploy
   */
  async checkReadiness(): Promise<DeploymentReadinessResult> {
    console.log('[DeploymentReadinessService] Starting deployment readiness checks');

    const checks: DeploymentCheck[] = [];

    // Define checks as workflow steps
    const steps: WorkflowStep[] = [
      {
        id: 'git-clean',
        agentId: 'git-service',
        task: 'check-status'
      },
      {
        id: 'build',
        agentId: 'build-validator',
        task: 'validate'
      },
      {
        id: 'validation',
        agentId: 'quality-validator',
        task: 'validate-all'
      }
    ];

    try {
      // Execute checks sequentially
      const result = await sequentialOrchestrator.execute(steps);

      // Process results
      for (const stepResult of result.results) {
        const check = this.processStepResult(stepResult);
        checks.push(check);
      }

      // Add manual checks
      const manualChecks = await this.performManualChecks();
      checks.push(...manualChecks);

      // Calculate readiness
      const blockers = checks.filter(c => !c.passed && c.blocker).length;
      const warnings = checks.filter(c => !c.passed && !c.blocker).length;
      const passedChecks = checks.filter(c => c.passed).length;
      const score = checks.length > 0 ? passedChecks / checks.length : 0;
      const ready = blockers === 0;

      // Store result
      await this.storeCheck({
        ready,
        checks,
        blockers,
        warnings,
        score
      });

      console.log(`[DeploymentReadinessService] Readiness: ${ready ? 'READY' : 'NOT READY'}`);
      console.log(`[DeploymentReadinessService] Blockers: ${blockers}, Warnings: ${warnings}, Score: ${score.toFixed(2)}`);

      return {
        ready,
        checks,
        blockers,
        warnings,
        score
      };
    } catch (error: any) {
      console.error('[DeploymentReadinessService] Check failed:', error);

      return {
        ready: false,
        checks: [
          {
            name: 'Deployment Check',
            passed: false,
            message: error.message,
            blocker: true
          }
        ],
        blockers: 1,
        warnings: 0,
        score: 0
      };
    }
  }

  /**
   * Process workflow step result into deployment check
   */
  private processStepResult(stepResult: any): DeploymentCheck {
    const stepId = stepResult.stepId;

    switch (stepId) {
      case 'git-clean':
        return {
          name: 'Git Repository Clean',
          passed: stepResult.success,
          message: stepResult.success ? 'No uncommitted changes' : 'Uncommitted changes found',
          blocker: false
        };

      case 'build':
        return {
          name: 'Build Validation',
          passed: stepResult.success,
          message: stepResult.success ? 'Build successful' : 'Build failed',
          blocker: true
        };

      case 'validation':
        return {
          name: 'Code Quality',
          passed: stepResult.success,
          message: stepResult.success ? 'All validation checks passed' : 'Validation errors found',
          blocker: true
        };

      default:
        return {
          name: stepId,
          passed: stepResult.success,
          message: 'Check completed',
          blocker: false
        };
    }
  }

  /**
   * Perform manual checks
   */
  private async performManualChecks(): Promise<DeploymentCheck[]> {
    const checks: DeploymentCheck[] = [];

    // Check environment variables
    const hasGroqKey = !!process.env.GROQ_API_KEY;
    checks.push({
      name: 'Environment Variables',
      passed: hasGroqKey,
      message: hasGroqKey ? 'Required env vars present' : 'Missing GROQ_API_KEY',
      blocker: true
    });

    // Check database connection
    try {
      await db.execute('SELECT 1');
      checks.push({
        name: 'Database Connection',
        passed: true,
        message: 'Database accessible',
        blocker: true
      });
    } catch (error) {
      checks.push({
        name: 'Database Connection',
        passed: false,
        message: 'Database not accessible',
        blocker: true
      });
    }

    // Check build artifacts
    const buildExists = await buildValidator.buildExists();
    checks.push({
      name: 'Build Artifacts',
      passed: buildExists,
      message: buildExists ? 'Build artifacts present' : 'No build artifacts found',
      blocker: false
    });

    return checks;
  }

  /**
   * Store deployment check to database
   */
  private async storeCheck(result: DeploymentReadinessResult): Promise<void> {
    try {
      await db.insert(deploymentChecks).values({
        ready: result.ready,
        blockers: result.blockers,
        warnings: result.warnings,
        score: result.score,
        checks: result.checks as any
      });
    } catch (error) {
      console.error('[DeploymentReadinessService] Failed to store check:', error);
    }
  }

  /**
   * Suggest deployment if ready
   */
  async suggestDeploymentIfReady(): Promise<boolean> {
    const result = await this.checkReadiness();

    if (result.ready) {
      console.log('[DeploymentReadinessService] 🚀 DEPLOYMENT READY - suggesting deploy');
      // In production, call suggest_deploy tool here
      return true;
    }

    console.log('[DeploymentReadinessService] ❌ NOT READY - blockers must be resolved');
    return false;
  }
}

export const deploymentReadinessService = new DeploymentReadinessService();
