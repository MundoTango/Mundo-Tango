/**
 * AgentTestOrchestrator - Mr. Blue tasks all agents to self-test and validate work
 * 
 * MB.MD Level 2: Orchestrates comprehensive testing across all 33 feature agents
 */

import { agentRegistry } from './AgentRegistry';
import { BasePageAgent } from './BasePageAgent';
import { BaseFeatureAgent, TestableBehavior } from './BaseFeatureAgent';

export interface AgentTestResult {
  agentId: string;
  agentName: string;
  pageId: string;
  testResults: {
    behaviorId: string;
    description: string;
    priority: string;
    status: 'pending' | 'passed' | 'failed' | 'skipped';
    reason?: string;
    playwrightTestPath?: string;
  }[];
  criticalIssues: string[];
  recommendations: string[];
  selfCritique: string;
  overallScore: number;
}

export interface OrchestratorReport {
  timestamp: string;
  totalAgents: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  criticalIssuesFound: number;
  agentResults: AgentTestResult[];
  playwrightTestFiles: string[];
  overallHealthScore: number;
}

interface PageAgentWithFeatures extends BasePageAgent {
  getFeatureAgents(): BaseFeatureAgent[];
}

function hasFeatureAgents(agent: BasePageAgent): agent is PageAgentWithFeatures {
  return 'getFeatureAgents' in agent && typeof (agent as any).getFeatureAgents === 'function';
}

export class AgentTestOrchestrator {
  private lastReport: OrchestratorReport | null = null;

  constructor() {
    console.log('[AgentTestOrchestrator] Initialized - Ready to coordinate agent testing');
  }

  /**
   * Task all agents to self-test and be critical of their work
   */
  async taskAllAgentsToTest(): Promise<OrchestratorReport> {
    console.log('[AgentTestOrchestrator] 🚀 Tasking all agents to self-test...');
    
    const timestamp = new Date().toISOString();
    const agentResults: AgentTestResult[] = [];
    const playwrightTestFiles: string[] = [];
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let criticalIssuesFound = 0;

    const allAgents = agentRegistry.getAllAgents();

    for (const pageAgent of allAgents) {
      if (hasFeatureAgents(pageAgent)) {
        const featureAgents = pageAgent.getFeatureAgents();
        
        for (const featureAgent of featureAgents) {
          const result = await this.taskAgentToSelfTest(featureAgent, pageAgent.getId());
          agentResults.push(result);
          
          // Aggregate counts
          totalTests += result.testResults.length;
          passedTests += result.testResults.filter(t => t.status === 'passed').length;
          failedTests += result.testResults.filter(t => t.status === 'failed').length;
          skippedTests += result.testResults.filter(t => t.status === 'skipped').length;
          criticalIssuesFound += result.criticalIssues.length;
          
          // Track test file paths
          const testPath = `tests/e2e/${pageAgent.getId()}/${featureAgent.getFeatureId()}.spec.ts`;
          playwrightTestFiles.push(testPath);
        }
      }
    }

    const report: OrchestratorReport = {
      timestamp,
      totalAgents: agentResults.length,
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      criticalIssuesFound,
      agentResults,
      playwrightTestFiles,
      overallHealthScore: this.calculateHealthScore(passedTests, failedTests, totalTests, criticalIssuesFound),
    };

    this.lastReport = report;
    console.log(`[AgentTestOrchestrator] ✅ Testing complete: ${totalTests} tests, ${criticalIssuesFound} critical issues`);
    
    return report;
  }

  /**
   * Task a single agent to self-test and be critical
   */
  private async taskAgentToSelfTest(agent: BaseFeatureAgent, pageId: string): Promise<AgentTestResult> {
    const prd = agent.getPRD();
    const behaviors = agent.getTestPlan();
    
    const testResults = behaviors.map(behavior => {
      // Agent critically evaluates each test
      const evaluation = this.criticallyEvaluateBehavior(behavior, prd);
      
      return {
        behaviorId: behavior.id,
        description: behavior.description,
        priority: behavior.priority,
        status: evaluation.status,
        reason: evaluation.reason,
        playwrightTestPath: `tests/e2e/${pageId}/${agent.getFeatureId()}.spec.ts`,
      };
    });

    // Generate self-critique
    const selfCritique = this.generateSelfCritique(agent, prd, testResults);
    
    // Identify critical issues
    const criticalIssues = prd.knownIssues
      .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
      .map(issue => `${issue.pattern}: ${issue.fix}`);

    // Generate recommendations
    const recommendations = this.generateRecommendations(prd, testResults);

    return {
      agentId: agent.getFeatureId(),
      agentName: agent.getFeatureName(),
      pageId,
      testResults,
      criticalIssues,
      recommendations,
      selfCritique,
      overallScore: this.calculateAgentScore(testResults),
    };
  }

  /**
   * Critically evaluate a behavior test
   */
  private criticallyEvaluateBehavior(
    behavior: TestableBehavior,
    prd: any
  ): { status: 'pending' | 'passed' | 'failed' | 'skipped'; reason: string } {
    // Check if test has proper steps
    if (!behavior.steps || behavior.steps.length === 0) {
      return { status: 'failed', reason: 'No test steps defined' };
    }

    // Check if all required elements are specified
    const hasNavigate = behavior.steps.some(s => s.action === 'navigate');
    const hasAssertion = behavior.steps.some(s => s.action === 'assert');
    
    if (!hasNavigate) {
      return { status: 'failed', reason: 'Missing navigation step' };
    }
    
    if (!hasAssertion) {
      return { status: 'failed', reason: 'Missing assertion step' };
    }

    // Check if UI elements are defined in PRD
    const usedSelectors = behavior.steps
      .filter(s => s.target)
      .map(s => s.target);
    
    const definedSelectors = prd.uiElements?.map((e: any) => e.selector) || [];
    const undefinedSelectors = usedSelectors.filter(s => !definedSelectors.includes(s));
    
    if (undefinedSelectors.length > 0) {
      return { status: 'skipped', reason: `Undefined UI elements: ${undefinedSelectors.join(', ')}` };
    }

    // Check for related known issues
    const relatedIssues = prd.knownIssues?.filter((issue: any) => 
      behavior.description.toLowerCase().includes(issue.pattern.toLowerCase().split(' ')[0])
    ) || [];
    
    if (relatedIssues.length > 0) {
      return { status: 'pending', reason: `Known issue may affect: ${relatedIssues[0].pattern}` };
    }

    return { status: 'passed', reason: 'Test specification complete and valid' };
  }

  /**
   * Generate self-critique for an agent
   */
  private generateSelfCritique(agent: BaseFeatureAgent, prd: any, testResults: any[]): string {
    const passed = testResults.filter(t => t.status === 'passed').length;
    const total = testResults.length;
    const coverage = Math.round((passed / total) * 100);
    
    const critiques: string[] = [];
    
    if (coverage < 80) {
      critiques.push(`Test coverage is only ${coverage}% - needs improvement`);
    }
    
    if (prd.knownIssues?.length > 3) {
      critiques.push(`${prd.knownIssues.length} known issues tracked - should prioritize fixing`);
    }
    
    if (!prd.apiEndpoints || prd.apiEndpoints.length === 0) {
      critiques.push('No API endpoints documented - may cause integration issues');
    }
    
    if (!prd.uiElements || prd.uiElements.length < 3) {
      critiques.push('Insufficient UI element documentation - tests may be fragile');
    }

    const failedCritical = testResults.filter(t => t.status === 'failed' && t.priority === 'critical');
    if (failedCritical.length > 0) {
      critiques.push(`${failedCritical.length} CRITICAL tests failed - blocking issue`);
    }

    return critiques.length > 0 
      ? critiques.join('; ') 
      : 'All tests well-specified. Ready for Playwright execution.';
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(prd: any, testResults: any[]): string[] {
    const recommendations: string[] = [];
    
    const failed = testResults.filter(t => t.status === 'failed');
    if (failed.length > 0) {
      recommendations.push(`Fix ${failed.length} failing test specifications`);
    }

    const skipped = testResults.filter(t => t.status === 'skipped');
    if (skipped.length > 0) {
      recommendations.push(`Define missing UI elements for ${skipped.length} skipped tests`);
    }

    if (prd.knownIssues?.some((i: any) => i.severity === 'critical')) {
      recommendations.push('Address critical known issues before production release');
    }

    if (prd.dependencies?.includes('Stripe')) {
      recommendations.push('Ensure Stripe test keys are configured for payment testing');
    }

    return recommendations;
  }

  /**
   * Calculate agent score
   */
  private calculateAgentScore(testResults: any[]): number {
    const total = testResults.length;
    if (total === 0) return 0;
    
    const passed = testResults.filter(t => t.status === 'passed').length;
    const pending = testResults.filter(t => t.status === 'pending').length;
    
    return Math.round(((passed + pending * 0.5) / total) * 100);
  }

  /**
   * Calculate overall health score
   */
  private calculateHealthScore(passed: number, failed: number, total: number, criticalIssues: number): number {
    if (total === 0) return 0;
    
    const baseScore = (passed / total) * 100;
    const criticalPenalty = criticalIssues * 5;
    
    return Math.max(0, Math.round(baseScore - criticalPenalty));
  }

  /**
   * Generate Playwright test code for a feature agent
   */
  generatePlaywrightTestCode(featureAgent: BaseFeatureAgent, pageId: string): string {
    const prd = featureAgent.getPRD();
    const behaviors = featureAgent.getTestPlan();
    
    let testCode = `import { test, expect } from '@playwright/test';

/**
 * ${featureAgent.getFeatureName()} - Automated Tests
 * Generated by Mr. Blue Agent Test Orchestrator
 * Page: ${pageId}
 * 
 * Known Issues:
${prd.knownIssues.map((i: any) => ` * - ${i.pattern}: ${i.fix}`).join('\n') || ' * None tracked'}
 */

test.describe('${featureAgent.getFeatureName()}', () => {
`;

    for (const behavior of behaviors) {
      testCode += this.generateTestCase(behavior, prd);
    }

    testCode += `});
`;

    return testCode;
  }

  /**
   * Generate a single test case
   */
  private generateTestCase(behavior: TestableBehavior, prd: any): string {
    const testType = behavior.priority === 'critical' ? 'test' : 'test';
    
    let code = `
  ${testType}('${behavior.id}: ${behavior.description}', async ({ page }) => {
    // Expected: ${behavior.expectedOutcome}
`;

    for (const step of behavior.steps) {
      code += this.generateStepCode(step);
    }

    code += `  });
`;

    return code;
  }

  /**
   * Generate code for a test step
   */
  private generateStepCode(step: any): string {
    switch (step.action) {
      case 'navigate':
        return `    await page.goto('${step.value}');\n`;
      
      case 'click':
        return `    await page.locator('${step.target}').click();\n`;
      
      case 'type':
        return `    await page.locator('${step.target}').fill('${step.value}');\n`;
      
      case 'wait':
        return `    await page.waitForTimeout(${step.timeout || 1000});\n`;
      
      case 'assert':
        if (step.value === 'visible') {
          return `    await expect(page.locator('${step.target}')).toBeVisible();\n`;
        } else if (step.value === 'hidden') {
          return `    await expect(page.locator('${step.target}')).toBeHidden();\n`;
        } else {
          return `    await expect(page.locator('${step.target}')).toContainText('${step.value}');\n`;
        }
      
      case 'scroll':
        if (step.value === 'bottom') {
          return `    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));\n`;
        } else {
          return `    await page.evaluate(() => window.scrollTo(0, 0));\n`;
        }
      
      default:
        return `    // ${step.action}: ${step.description}\n`;
    }
  }

  /**
   * Get last test report
   */
  getLastReport(): OrchestratorReport | null {
    return this.lastReport;
  }
}

// Export singleton
export const agentTestOrchestrator = new AgentTestOrchestrator();
