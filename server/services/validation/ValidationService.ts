import type { WorkflowStep } from '@shared/types/a2a';
import { loopOrchestrator } from '../orchestration/LoopOrchestrator';
import { syntaxChecker } from './SyntaxChecker';
import { lspIntegration } from './LSPIntegration';
import { recursiveImprover } from './RecursiveImprover';
import { db } from '../../db';
import { validationResults } from '../../../shared/schema';

export interface ValidationConfig {
  maxAttempts: number;
  tiers: ValidationTier[];
  strictMode: boolean;
}

export interface ValidationTier {
  name: string;
  weight: number;
  validator: (code: string) => Promise<ValidationResult>;
}

export interface ValidationResult {
  passed: boolean;
  tier: string;
  errors: Array<{
    file: string;
    line?: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  score: number;
  suggestions?: string[];
}

export class ValidationService {
  private defaultConfig: ValidationConfig = {
    maxAttempts: 3,
    strictMode: true,
    tiers: []
  };

  constructor() {
    // Initialize validation tiers
    this.defaultConfig.tiers = [
      {
        name: 'Syntax',
        weight: 0.4,
        validator: this.validateSyntax.bind(this)
      },
      {
        name: 'LSP',
        weight: 0.3,
        validator: this.validateLSP.bind(this)
      },
      {
        name: 'TypeScript',
        weight: 0.2,
        validator: this.validateTypeScript.bind(this)
      },
      {
        name: 'BestPractices',
        weight: 0.1,
        validator: this.validateBestPractices.bind(this)
      }
    ];
  }

  /**
   * Multi-tier validation with Loop Orchestrator (Pattern 29)
   * Retry until ALL tiers pass OR max attempts reached
   */
  async validate(
    files: Array<{ path: string; content: string }>,
    config: Partial<ValidationConfig> = {}
  ): Promise<ValidationResult> {
    const cfg = { ...this.defaultConfig, ...config };

    console.log(`[ValidationService] Starting validation: ${files.length} files, ${cfg.tiers.length} tiers`);

    const step: WorkflowStep = {
      id: 'validation',
      agentId: 'quality-validator',
      task: { files },
      context: { config: cfg }
    };

    // Execute validation loop
    const result = await loopOrchestrator.execute(step, {
      maxIterations: cfg.maxAttempts,
      shouldContinue: (iteration, result) => {
        // Continue if validation failed
        return result?.validation?.passed === false;
      },
      improveTask: async (task, previousResult, errors) => {
        if (!previousResult?.validation) {
          return task;
        }

        // Use recursive improver to fix errors
        const improved = await recursiveImprover.improveCode(
          task.files,
          previousResult.validation.errors
        );

        return {
          ...task,
          files: improved,
          previousAttempt: iteration,
          previousErrors: errors
        };
      }
    });

    return result.results[result.results.length - 1]?.validation || {
      passed: false,
      tier: 'unknown',
      errors: [{ file: 'unknown', message: 'Validation failed', severity: 'error' as const }],
      score: 0
    };
  }

  /**
   * Execute all validation tiers
   */
  async validateAll(
    files: Array<{ path: string; content: string }>
  ): Promise<ValidationResult> {
    const results: ValidationResult[] = [];
    let totalScore = 0;
    let totalWeight = 0;
    const allErrors: any[] = [];

    for (const tier of this.defaultConfig.tiers) {
      console.log(`[ValidationService] Running ${tier.name} validation`);

      const result = await tier.validator(JSON.stringify(files));
      results.push(result);

      totalScore += result.score * tier.weight;
      totalWeight += tier.weight;
      allErrors.push(...result.errors);
    }

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const passed = allErrors.filter(e => e.severity === 'error').length === 0;

    const finalResult: ValidationResult = {
      passed,
      tier: 'All Tiers',
      errors: allErrors,
      score: finalScore,
      suggestions: results.flatMap(r => r.suggestions || [])
    };

    // Store result in database
    await this.storeResult(finalResult);

    console.log(`[ValidationService] Validation ${passed ? 'PASSED' : 'FAILED'} (score: ${finalScore.toFixed(2)})`);

    return finalResult;
  }

  /**
   * Tier 1: Syntax validation
   */
  private async validateSyntax(code: string): Promise<ValidationResult> {
    return syntaxChecker.check(code);
  }

  /**
   * Tier 2: LSP validation
   */
  private async validateLSP(code: string): Promise<ValidationResult> {
    return lspIntegration.validate(code);
  }

  /**
   * Tier 3: TypeScript validation
   */
  private async validateTypeScript(code: string): Promise<ValidationResult> {
    // TypeScript compiler API validation (to be implemented)
    return {
      passed: true,
      tier: 'TypeScript',
      errors: [],
      score: 1.0
    };
  }

  /**
   * Tier 4: Best practices validation
   */
  private async validateBestPractices(code: string): Promise<ValidationResult> {
    // Best practices checks (to be implemented)
    return {
      passed: true,
      tier: 'BestPractices',
      errors: [],
      score: 1.0
    };
  }

  /**
   * Store validation result to database
   */
  private async storeResult(result: ValidationResult): Promise<void> {
    try {
      await db.insert(validationResults).values({
        tier: result.tier,
        passed: result.passed,
        score: result.score,
        errors: result.errors as any,
        suggestions: result.suggestions as any
      });
    } catch (error) {
      console.error('[ValidationService] Failed to store result:', error);
    }
  }
}

export const validationService = new ValidationService();
