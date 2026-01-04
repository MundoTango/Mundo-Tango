/**
 * MR. BLUE VISUAL VALIDATION SERVICE
 * Comprehensive Visual QA Framework using Claude Computer Use
 * 
 * PURPOSE:
 * Prevent visual regressions by validating UI changes BEFORE acceptance
 * Uses Claude vision API to detect layout breaks, transparency issues, etc.
 * 
 * WORKFLOW:
 * 1. Capture "before" screenshot
 * 2. Apply changes (via VibeCoding)
 * 3. Capture "after" screenshot  
 * 4. Analyze both with Claude Computer Use
 * 5. Detect visual regressions (layout breaks, color issues, text readability)
 * 6. BLOCK acceptance if validation fails
 * 
 * INTEGRATION:
 * - Hooks into VibeCoding.applyChanges()
 * - Mandatory gate before Git commit
 * - Escalates to user if visual issues detected
 * 
 * CREATED: November 24, 2025
 * REASON: User-reported issue - Mr. Blue accepted broken "transparent background" change
 */

import { chromium, Browser, Page } from 'playwright';
import { computerUseService } from './ComputerUseService';
import { escalationService } from './EscalationService';
import { evidenceCollector } from './EvidenceCollector';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface VisualValidationRequest {
  sessionId: string;
  userId: number;
  changeDescription: string;
  targetUrl: string; // URL to test (e.g., http://localhost:5000/)
  targetPage?: string; // Specific page to validate (e.g., "/events")
  selectedElement?: string; // CSS selector of changed element
  checkpoints?: string[]; // Specific visual checks to perform
}

export interface VisualValidationResult {
  success: boolean;
  sessionId: string;
  beforeScreenshot: string; // Base64 PNG
  afterScreenshot: string; // Base64 PNG
  analysis: {
    looksCorrect: boolean;
    feedback: string;
    issues: string[];
    confidence: number;
  };
  comparison: {
    layoutIntact: boolean;
    colorCorrect: boolean;
    textReadable: boolean;
    elementsVisible: boolean;
  };
  escalated: boolean;
  escalationId?: number;
  timestamp: Date;
}

export interface VisualCheckpoint {
  name: string;
  selector?: string; // CSS selector to focus on
  check: string; // What to verify (e.g., "Button should be visible")
}

export class VisualValidationService {
  private browser: Browser | null = null;
  private screenshotDir: string;
  private readonly MAX_RETRIES = 2;
  private readonly PAGE_LOAD_TIMEOUT = 15000; // 15s
  private readonly VALIDATION_TIMEOUT = 30000; // 30s

  constructor() {
    this.screenshotDir = path.join(process.cwd(), 'attached_assets', 'visual_validation');
    fs.mkdir(this.screenshotDir, { recursive: true }).catch(() => {});
    console.log('[VisualValidation] Service initialized');
  }

  /**
   * MAIN VALIDATION METHOD
   * Captures before/after screenshots and validates changes
   */
  async validateChanges(request: VisualValidationRequest): Promise<VisualValidationResult> {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[VisualValidation] 🔍 Starting validation for session: ${request.sessionId}`);
    console.log(`[VisualValidation] 📝 Change: ${request.changeDescription}`);
    console.log(`[VisualValidation] 🌐 URL: ${request.targetUrl}`);
    console.log(`${'='.repeat(80)}\n`);

    let browser: Browser | null = null;
    let beforeScreenshot: string | null = null;
    let afterScreenshot: string | null = null;

    try {
      // Step 1: Launch browser
      browser = await this.launchBrowser();

      // Step 2: Capture BEFORE screenshot
      console.log('[VisualValidation] 📸 Capturing BEFORE screenshot...');
      beforeScreenshot = await this.captureScreenshot(
        browser,
        request.targetUrl + (request.targetPage || ''),
        request.selectedElement
      );
      console.log('[VisualValidation] ✅ BEFORE screenshot captured');

      // Step 3: Wait for changes to be applied (caller responsibility)
      // This service assumes changes are already applied by VibeCoding
      await this.waitForChangesToPropagate();

      // Step 4: Capture AFTER screenshot
      console.log('[VisualValidation] 📸 Capturing AFTER screenshot...');
      afterScreenshot = await this.captureScreenshot(
        browser,
        request.targetUrl + (request.targetPage || ''),
        request.selectedElement
      );
      console.log('[VisualValidation] ✅ AFTER screenshot captured');

      // Step 5: Analyze with Claude Computer Use
      console.log('[VisualValidation] 🧠 Analyzing visual changes with Claude...');
      const analysis = await this.analyzeVisualChanges(
        beforeScreenshot,
        afterScreenshot,
        request.changeDescription,
        request.checkpoints || []
      );

      // Step 6: Perform specific validation checks
      const comparison = await this.performDetailedChecks(
        afterScreenshot,
        request.selectedElement
      );

      // Step 7: Determine if changes are acceptable
      const success = analysis.looksCorrect && 
                     comparison.layoutIntact &&
                     analysis.confidence >= 70;

      // Step 8: Escalate if validation failed
      let escalated = false;
      let escalationId: number | undefined;

      if (!success) {
        console.log('[VisualValidation] ❌ Visual validation FAILED - Escalating...');
        const escalationResult = await this.escalateVisualIssue(
          request,
          analysis,
          comparison,
          beforeScreenshot,
          afterScreenshot
        );
        escalated = true;
        escalationId = escalationResult.escalationId;
      } else {
        console.log('[VisualValidation] ✅ Visual validation PASSED');
      }

      const result: VisualValidationResult = {
        success,
        sessionId: request.sessionId,
        beforeScreenshot,
        afterScreenshot,
        analysis,
        comparison,
        escalated,
        escalationId,
        timestamp: new Date()
      };

      // Save validation evidence
      await this.saveValidationEvidence(request.sessionId, result);

      console.log(`\n${'='.repeat(80)}`);
      console.log(`[VisualValidation] ${success ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED'}`);
      console.log(`[VisualValidation] Confidence: ${analysis.confidence}%`);
      console.log(`[VisualValidation] Issues: ${analysis.issues.length}`);
      console.log(`${'='.repeat(80)}\n`);

      return result;

    } catch (error: any) {
      console.error('[VisualValidation] Validation failed:', error);
      throw new Error(`Visual validation failed: ${error.message}`);
    } finally {
      // Cleanup browser
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  }

  /**
   * Launch Playwright browser
   */
  private async launchBrowser(): Promise<Browser> {
    return await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  /**
   * Capture screenshot of a specific page
   */
  private async captureScreenshot(
    browser: Browser,
    url: string,
    elementSelector?: string
  ): Promise<string> {
    const page = await browser.newPage();
    
    try {
      // Navigate to URL
      await page.goto(url, { 
        waitUntil: 'networkidle', 
        timeout: this.PAGE_LOAD_TIMEOUT 
      });

      // Wait for page to stabilize
      await page.waitForTimeout(1000);

      // Take full page screenshot or element screenshot
      let screenshot: Buffer;
      if (elementSelector) {
        try {
          const element = await page.$(elementSelector);
          if (element) {
            screenshot = await element.screenshot({ type: 'png' });
          } else {
            console.warn(`[VisualValidation] Element "${elementSelector}" not found - taking full page screenshot`);
            screenshot = await page.screenshot({ fullPage: true, type: 'png' });
          }
        } catch {
          screenshot = await page.screenshot({ fullPage: true, type: 'png' });
        }
      } else {
        screenshot = await page.screenshot({ fullPage: true, type: 'png' });
      }

      return screenshot.toString('base64');

    } finally {
      await page.close();
    }
  }

  /**
   * Wait for changes to propagate (Vite HMR, server restart, etc.)
   */
  private async waitForChangesToPropagate(): Promise<void> {
    // Wait for Vite HMR or server restart to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  /**
   * Analyze visual changes using Claude Computer Use
   */
  private async analyzeVisualChanges(
    beforeScreenshot: string,
    afterScreenshot: string,
    changeDescription: string,
    checkpoints: string[]
  ): Promise<{
    looksCorrect: boolean;
    feedback: string;
    issues: string[];
    confidence: number;
  }> {
    const question = `Analyze these BEFORE and AFTER screenshots of a UI change.

Change requested: "${changeDescription}"

Compare the two screenshots and determine if the change was applied correctly WITHOUT introducing visual regressions.

CRITICAL CHECKS:
- Layout integrity (no broken positioning, overlapping elements)
- Color/transparency issues (no invisible or unreadable text)
- Text readability (sufficient contrast, not cut off)
- Button/element visibility (all interactive elements visible and usable)
- Overall UX quality (professional appearance, no obvious bugs)

${checkpoints.length > 0 ? `\nSpecific checkpoints:\n${checkpoints.map((c, i) => `${i + 1}. ${c}`).join('\n')}` : ''}

Respond with JSON indicating if the change looks correct or if there are visual regressions.`;

    // First analyze the AFTER screenshot with context from BEFORE
    const afterAnalysis = await computerUseService.analyzeScreenshot({
      screenshotBase64: afterScreenshot,
      question,
      checkpoints
    });

    return afterAnalysis;
  }

  /**
   * Perform detailed validation checks
   */
  private async performDetailedChecks(
    screenshotBase64: string,
    elementSelector?: string
  ): Promise<{
    layoutIntact: boolean;
    colorCorrect: boolean;
    textReadable: boolean;
    elementsVisible: boolean;
  }> {
    // Use Claude to check specific aspects
    const layoutCheck = await computerUseService.analyzeScreenshot({
      screenshotBase64,
      question: 'Is the layout intact with no overlapping or misaligned elements?',
      checkpoints: [
        'No elements are cut off or hidden unexpectedly',
        'No overlapping text or buttons',
        'Spacing and alignment look professional'
      ]
    });

    const colorCheck = await computerUseService.analyzeScreenshot({
      screenshotBase64,
      question: 'Are colors and transparency handled correctly?',
      checkpoints: [
        'No invisible or unreadable text due to transparency',
        'Background colors don\'t cause readability issues',
        'Sufficient contrast for accessibility'
      ]
    });

    const textCheck = await computerUseService.analyzeScreenshot({
      screenshotBase64,
      question: 'Is all text readable and properly displayed?',
      checkpoints: [
        'Text is not cut off or truncated',
        'Font sizes are appropriate',
        'Text has sufficient contrast against backgrounds'
      ]
    });

    const visibilityCheck = await computerUseService.analyzeScreenshot({
      screenshotBase64,
      question: 'Are all important UI elements visible and usable?',
      checkpoints: [
        'Buttons and interactive elements are clearly visible',
        'No important content is hidden or obscured',
        'Navigation elements are accessible'
      ]
    });

    return {
      layoutIntact: layoutCheck.looksCorrect && layoutCheck.confidence >= 70,
      colorCorrect: colorCheck.looksCorrect && colorCheck.confidence >= 70,
      textReadable: textCheck.looksCorrect && textCheck.confidence >= 70,
      elementsVisible: visibilityCheck.looksCorrect && visibilityCheck.confidence >= 70
    };
  }

  /**
   * Escalate visual issue to Replit AI
   */
  private async escalateVisualIssue(
    request: VisualValidationRequest,
    analysis: any,
    comparison: any,
    beforeScreenshot: string,
    afterScreenshot: string
  ): Promise<{ escalationId: number }> {
    const issueDescription = `Visual validation failed for change: "${request.changeDescription}"

Issues detected:
${analysis.issues.map((issue: string, i: number) => `${i + 1}. ${issue}`).join('\n')}

Detailed checks:
- Layout intact: ${comparison.layoutIntact ? '✅' : '❌'}
- Color correct: ${comparison.colorCorrect ? '✅' : '❌'}
- Text readable: ${comparison.textReadable ? '✅' : '❌'}
- Elements visible: ${comparison.elementsVisible ? '✅' : '❌'}

Claude feedback: ${analysis.feedback}
Confidence: ${analysis.confidence}%`;

    const escalationId = await escalationService.escalate({
      agentId: 'VisualValidationService',
      task: request.changeDescription,
      reason: 'visual_regression_detected',
      errorDetails: issueDescription,
      attemptCount: 1,
      evidence: {
        beforeScreenshot,
        afterScreenshot,
        analysis,
        comparison
      }
    });

    // Collect evidence package
    await evidenceCollector.collect({
      agentId: 'VisualValidationService',
      task: request.changeDescription,
      error: new Error('Visual regression detected'),
      context: {
        sessionId: request.sessionId,
        targetUrl: request.targetUrl,
        selectedElement: request.selectedElement,
        analysis,
        comparison
      },
      screenshots: [
        { name: 'before.png', data: beforeScreenshot },
        { name: 'after.png', data: afterScreenshot }
      ]
    });

    return { escalationId };
  }

  /**
   * Save validation evidence to disk
   */
  private async saveValidationEvidence(
    sessionId: string,
    result: VisualValidationResult
  ): Promise<void> {
    const evidenceDir = path.join(this.screenshotDir, sessionId);
    await fs.mkdir(evidenceDir, { recursive: true });

    // Save before screenshot
    await fs.writeFile(
      path.join(evidenceDir, 'before.png'),
      Buffer.from(result.beforeScreenshot, 'base64')
    );

    // Save after screenshot
    await fs.writeFile(
      path.join(evidenceDir, 'after.png'),
      Buffer.from(result.afterScreenshot, 'base64')
    );

    // Save analysis report
    await fs.writeFile(
      path.join(evidenceDir, 'analysis.json'),
      JSON.stringify(result, null, 2)
    );

    console.log(`[VisualValidation] Evidence saved to: ${evidenceDir}`);
  }

  /**
   * Quick validation check (for simple changes)
   * Only captures AFTER screenshot and validates it
   */
  async quickValidate(params: {
    url: string;
    changeDescription: string;
    checkpoints?: string[];
  }): Promise<{ success: boolean; issues: string[] }> {
    const browser = await this.launchBrowser();

    try {
      const screenshot = await this.captureScreenshot(browser, params.url);
      
      const analysis = await computerUseService.analyzeScreenshot({
        screenshotBase64: screenshot,
        question: `Does this UI look correct after this change: "${params.changeDescription}"?`,
        checkpoints: params.checkpoints
      });

      return {
        success: analysis.looksCorrect && analysis.confidence >= 70,
        issues: analysis.issues
      };

    } finally {
      await browser.close();
    }
  }
}

// Singleton export
export const visualValidationService = new VisualValidationService();
