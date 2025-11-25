/**
 * BaseFeatureAgent - Base class for feature-level agents
 * 
 * MB.MD Level 3 Architecture:
 * Feature agents are subordinate to Page agents and handle specific components/features.
 * Each feature agent has:
 * - PRD knowledge (what the feature SHOULD do)
 * - Testable behaviors (Playwright test specifications)
 * - Self-interrogation capability (Q&A for debugging)
 */

export interface FeaturePRD {
  featureId: string;
  featureName: string;
  description: string;
  expectedBehaviors: TestableBehavior[];
  dependencies: string[];
  apiEndpoints: { endpoint: string; method: string; description: string }[];
  uiElements: { selector: string; description: string; testId: string }[];
  knownIssues: { pattern: string; fix: string; severity: 'critical' | 'high' | 'medium' | 'low' }[];
}

export interface TestableBehavior {
  id: string;
  description: string;
  steps: TestStep[];
  expectedOutcome: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface TestStep {
  action: 'navigate' | 'click' | 'type' | 'wait' | 'assert' | 'scroll' | 'hover';
  target?: string;
  value?: string;
  timeout?: number;
  description: string;
}

export interface QAExchange {
  question: string;
  answer: string;
  confidence: number;
  source: 'prd' | 'code' | 'test' | 'inference';
}

export abstract class BaseFeatureAgent {
  protected featureId: string;
  protected featureName: string;
  protected parentPageId: string;
  protected prd: FeaturePRD;
  protected qaHistory: QAExchange[] = [];

  constructor(featureId: string, featureName: string, parentPageId: string) {
    this.featureId = featureId;
    this.featureName = featureName;
    this.parentPageId = parentPageId;
    this.prd = this.initializePRD();
  }

  abstract initializePRD(): FeaturePRD;

  getFeatureId(): string {
    return this.featureId;
  }

  getFeatureName(): string {
    return this.featureName;
  }

  getParentPageId(): string {
    return this.parentPageId;
  }

  getPRD(): FeaturePRD {
    return this.prd;
  }

  /**
   * Self-interrogation: Answer questions about this feature
   * Used by Mr. Blue for research and debugging
   */
  answerQuestion(question: string): QAExchange {
    const lower = question.toLowerCase();
    let answer = '';
    let confidence = 0;
    let source: 'prd' | 'code' | 'test' | 'inference' = 'inference';

    if (lower.includes('what') && lower.includes('do')) {
      answer = `${this.featureName} ${this.prd.description}`;
      confidence = 1.0;
      source = 'prd';
    } else if (lower.includes('test') || lower.includes('behavior')) {
      const behaviors = this.prd.expectedBehaviors.map(b => b.description).join('; ');
      answer = `Testable behaviors: ${behaviors}`;
      confidence = 0.95;
      source = 'prd';
    } else if (lower.includes('api') || lower.includes('endpoint')) {
      const apis = this.prd.apiEndpoints.map(a => `${a.method} ${a.endpoint}`).join(', ');
      answer = `API endpoints: ${apis}`;
      confidence = 0.95;
      source = 'prd';
    } else if (lower.includes('element') || lower.includes('selector')) {
      const elements = this.prd.uiElements.map(e => `${e.testId}: ${e.description}`).join(', ');
      answer = `UI elements: ${elements}`;
      confidence = 0.95;
      source = 'prd';
    } else if (lower.includes('issue') || lower.includes('bug') || lower.includes('problem')) {
      const issues = this.prd.knownIssues.map(i => `${i.pattern}: ${i.fix}`).join('; ');
      answer = issues || 'No known issues documented';
      confidence = 0.90;
      source = 'prd';
    } else if (lower.includes('depend')) {
      answer = `Dependencies: ${this.prd.dependencies.join(', ')}`;
      confidence = 0.95;
      source = 'prd';
    } else {
      answer = `${this.featureName} is a feature of ${this.parentPageId}. ${this.prd.description}`;
      confidence = 0.6;
      source = 'inference';
    }

    const exchange: QAExchange = { question, answer, confidence, source };
    this.qaHistory.push(exchange);
    return exchange;
  }

  /**
   * Get all testable behaviors for Playwright testing
   */
  getTestPlan(): TestableBehavior[] {
    return this.prd.expectedBehaviors;
  }

  /**
   * Generate Playwright test code for this feature
   */
  generatePlaywrightTestPlan(): string {
    const tests: string[] = [];
    
    for (const behavior of this.prd.expectedBehaviors) {
      const steps = behavior.steps.map(step => {
        switch (step.action) {
          case 'navigate':
            return `[Browser] Navigate to ${step.value} - ${step.description}`;
          case 'click':
            return `[Browser] Click on element: ${step.target} - ${step.description}`;
          case 'type':
            return `[Browser] Type "${step.value}" into ${step.target} - ${step.description}`;
          case 'wait':
            return `[Browser] Wait ${step.timeout}ms - ${step.description}`;
          case 'assert':
            return `[Verify] Assert ${step.target}: ${step.value} - ${step.description}`;
          case 'scroll':
            return `[Browser] Scroll ${step.value || 'down'} - ${step.description}`;
          case 'hover':
            return `[Browser] Hover over ${step.target} - ${step.description}`;
          default:
            return `[Action] ${step.description}`;
        }
      }).join('\n');

      tests.push(`
## Test: ${behavior.description}
Priority: ${behavior.priority}
Expected: ${behavior.expectedOutcome}

Steps:
${steps}
`);
    }

    return tests.join('\n---\n');
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    featureId: string;
    featureName: string;
    testableCount: number;
    knownIssueCount: number;
    apiCount: number;
    uiElementCount: number;
  } {
    return {
      featureId: this.featureId,
      featureName: this.featureName,
      testableCount: this.prd.expectedBehaviors.length,
      knownIssueCount: this.prd.knownIssues.length,
      apiCount: this.prd.apiEndpoints.length,
      uiElementCount: this.prd.uiElements.length,
    };
  }
}
