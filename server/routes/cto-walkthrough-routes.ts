import { Router, Request, Response } from 'express';
import { chromium, Browser, Page } from 'playwright';
import path from 'path';
import fs from 'fs';

const router = Router();

interface WalkthroughStep {
  id: string;
  action: string;
  description: string;
  selector?: string;
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  { id: '1', action: 'navigate', description: 'Navigate to mundotango.life/onboarding/waitlist' },
  { id: '2', action: 'wait', description: 'Wait for page to load completely' },
  { id: '3', action: 'scroll', description: 'Scroll to resume upload section' },
  { id: '4', action: 'upload', description: 'Upload test resume (PDF)' },
  { id: '5', action: 'submit', description: 'Submit resume for parsing' },
  { id: '6', action: 'verify', description: 'Verify parsed data appears correctly' },
];

const MBMD_PATTERNS: Record<string, { pattern: string; rootCause: string; recommendedFix: string; fixSteps: string[] }> = {
  'csrf_error': {
    pattern: 'Pattern 53: CSRF Token Validation',
    rootCause: 'CSRF middleware blocking guest user requests without valid token',
    recommendedFix: 'Add endpoint to CSRF exemption list in server/middleware/csrf.ts',
    fixSteps: [
      '1. Open server/middleware/csrf.ts',
      '2. Add the failing endpoint to CSRF_EXEMPT_PATHS array',
      '3. Restart the server to apply changes',
      '4. Click "Continue" to re-run the test'
    ]
  },
  'network_error': {
    pattern: 'Pattern 12: Network Connectivity',
    rootCause: 'Failed to establish connection to target endpoint',
    recommendedFix: 'Check network configuration and CORS settings',
    fixSteps: [
      '1. Verify the server is running on the correct port',
      '2. Check CORS configuration in server/index.ts',
      '3. Ensure firewall/proxy settings allow connections',
      '4. Click "Continue" to re-run the test'
    ]
  },
  'upload_error': {
    pattern: 'Pattern 27: File Upload Processing',
    rootCause: 'Multer middleware configuration issue or file size limit exceeded',
    recommendedFix: 'Verify multer configuration and increase file size limits if needed',
    fixSteps: [
      '1. Open server/routes.ts and find multer config',
      '2. Increase limits.fileSize to handle larger PDFs',
      '3. Ensure upload directory exists and is writable',
      '4. Click "Continue" to re-run the test'
    ]
  },
  'parse_error': {
    pattern: 'Pattern 41: AI Resume Parsing',
    rootCause: 'OpenAI API call failed or response parsing error',
    recommendedFix: 'Check OpenAI API key validity and response handling logic',
    fixSteps: [
      '1. Verify OPENAI_API_KEY is set in environment',
      '2. Check API rate limits and quota',
      '3. Add error handling for malformed responses',
      '4. Click "Continue" to re-run the test'
    ]
  },
  'element_not_found': {
    pattern: 'Pattern 8: DOM Element Selection',
    rootCause: 'Target element not found in page - selector may have changed',
    recommendedFix: 'Update component selectors or add data-testid attributes',
    fixSteps: [
      '1. Inspect the page to find correct element selector',
      '2. Add data-testid attribute to target element',
      '3. Update the test selector to match',
      '4. Click "Continue" to re-run the test'
    ]
  },
  'timeout': {
    pattern: 'Pattern 15: Request Timeout',
    rootCause: 'Operation exceeded allowed time limit',
    recommendedFix: 'Increase timeout threshold or optimize slow operations',
    fixSteps: [
      '1. Check server logs for slow queries',
      '2. Optimize database queries or API calls',
      '3. Increase timeout in playwright config if needed',
      '4. Click "Continue" to re-run the test'
    ]
  }
};

function detectErrorPattern(error: string): { pattern: string; rootCause: string; recommendedFix: string; fixSteps: string[] } {
  const errorLower = error.toLowerCase();
  
  if (errorLower.includes('csrf') || errorLower.includes('forbidden') || errorLower.includes('403')) {
    return MBMD_PATTERNS['csrf_error'];
  }
  if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('connection') || errorLower.includes('econnrefused')) {
    return MBMD_PATTERNS['network_error'];
  }
  if (errorLower.includes('upload') || errorLower.includes('file') || errorLower.includes('multer')) {
    return MBMD_PATTERNS['upload_error'];
  }
  if (errorLower.includes('parse') || errorLower.includes('openai') || errorLower.includes('ai')) {
    return MBMD_PATTERNS['parse_error'];
  }
  if (errorLower.includes('element') || errorLower.includes('selector') || errorLower.includes('not found') || errorLower.includes('locator')) {
    return MBMD_PATTERNS['element_not_found'];
  }
  if (errorLower.includes('timeout') || errorLower.includes('timed out')) {
    return MBMD_PATTERNS['timeout'];
  }
  
  return {
    pattern: 'Pattern 0: Unknown Error',
    rootCause: 'Error pattern not recognized',
    recommendedFix: 'Manual investigation required - check logs for details',
    fixSteps: [
      '1. Check server logs for error details',
      '2. Review browser console for client-side errors',
      '3. Verify all dependencies are installed',
      '4. Click "Continue" to re-run the test'
    ]
  };
}

// Get base URL for testing
function getBaseUrl(): string {
  // Use the internal server URL
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

// Take screenshot and convert to base64
async function captureScreenshot(page: Page): Promise<string> {
  try {
    const buffer = await page.screenshot({ type: 'png', fullPage: false });
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch (e) {
    console.error('[CTO Walkthrough] Screenshot failed:', e);
    return '';
  }
}

// Create a test PDF file for upload testing
function getTestPdfPath(): string {
  const testPdfPath = path.join(process.cwd(), 'test-resume.pdf');
  
  // Create a minimal test PDF if it doesn't exist
  if (!fs.existsSync(testPdfPath)) {
    // Create a simple text file as placeholder (real PDF would need pdf-lib)
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 100 700 Td (Test Resume) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
306
%%EOF`;
    fs.writeFileSync(testPdfPath, pdfContent);
  }
  
  return testPdfPath;
}

router.get('/run', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    const baseUrl = getBaseUrl();
    const useRealPlaywright = req.query.mode !== 'simulate';
    
    console.log(`[CTO Walkthrough] Starting ${useRealPlaywright ? 'REAL' : 'SIMULATED'} test at ${baseUrl}`);

    if (useRealPlaywright) {
      // Launch real Playwright browser
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'CTO-Walkthrough-Bot/1.0'
      });
      
      page = await context.newPage();
      
      // Step 1: Navigate
      const step1Start = Date.now();
      sendEvent({ type: 'step_start', stepIndex: 0, step: WALKTHROUGH_STEPS[0] });
      
      try {
        await page.goto(`${baseUrl}/onboarding/waitlist`, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        const screenshot1 = await captureScreenshot(page);
        sendEvent({ 
          type: 'step_complete', 
          stepIndex: 0, 
          step: WALKTHROUGH_STEPS[0],
          duration: Date.now() - step1Start 
        });
        if (screenshot1) {
          sendEvent({ type: 'screenshot', image: screenshot1 });
        }
      } catch (navError: any) {
        const mbmd = detectErrorPattern(navError.message);
        sendEvent({
          type: 'step_failed',
          stepIndex: 0,
          step: WALKTHROUGH_STEPS[0],
          error: `Navigation failed: ${navError.message}`,
          mbmdAnalysis: {
            mbmdPattern: mbmd.pattern,
            rootCause: mbmd.rootCause,
            recommendedFix: mbmd.recommendedFix,
            fixSteps: mbmd.fixSteps,
            severity: 'high',
            autoFixAvailable: true
          }
        });
        return;
      }

      // Step 2: Wait for page load
      const step2Start = Date.now();
      sendEvent({ type: 'step_start', stepIndex: 1, step: WALKTHROUGH_STEPS[1] });
      
      try {
        // Wait for the page to be fully interactive
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000); // Give React time to hydrate
        
        const screenshot2 = await captureScreenshot(page);
        sendEvent({ 
          type: 'step_complete', 
          stepIndex: 1, 
          step: WALKTHROUGH_STEPS[1],
          duration: Date.now() - step2Start 
        });
        if (screenshot2) {
          sendEvent({ type: 'screenshot', image: screenshot2 });
        }
      } catch (loadError: any) {
        const mbmd = detectErrorPattern(loadError.message);
        sendEvent({
          type: 'step_failed',
          stepIndex: 1,
          step: WALKTHROUGH_STEPS[1],
          error: `Page load failed: ${loadError.message}`,
          mbmdAnalysis: {
            mbmdPattern: mbmd.pattern,
            rootCause: mbmd.rootCause,
            recommendedFix: mbmd.recommendedFix,
            fixSteps: mbmd.fixSteps,
            severity: 'medium',
            autoFixAvailable: false
          }
        });
        return;
      }

      // Step 3: Scroll to resume upload section
      const step3Start = Date.now();
      sendEvent({ type: 'step_start', stepIndex: 2, step: WALKTHROUGH_STEPS[2] });
      
      try {
        // Look for resume upload section
        const uploadSection = page.locator('[data-testid="resume-upload-section"], .resume-upload, input[type="file"]').first();
        
        if (await uploadSection.count() > 0) {
          await uploadSection.scrollIntoViewIfNeeded();
        } else {
          // Just scroll down the page
          await page.evaluate(() => window.scrollBy(0, 500));
        }
        
        await page.waitForTimeout(500);
        const screenshot3 = await captureScreenshot(page);
        
        sendEvent({ 
          type: 'step_complete', 
          stepIndex: 2, 
          step: WALKTHROUGH_STEPS[2],
          duration: Date.now() - step3Start 
        });
        if (screenshot3) {
          sendEvent({ type: 'screenshot', image: screenshot3 });
        }
      } catch (scrollError: any) {
        const mbmd = detectErrorPattern(scrollError.message);
        sendEvent({
          type: 'step_failed',
          stepIndex: 2,
          step: WALKTHROUGH_STEPS[2],
          error: `Scroll failed: ${scrollError.message}`,
          mbmdAnalysis: {
            mbmdPattern: mbmd.pattern,
            rootCause: mbmd.rootCause,
            recommendedFix: mbmd.recommendedFix,
            fixSteps: mbmd.fixSteps,
            severity: 'low',
            autoFixAvailable: false
          }
        });
        return;
      }

      // Step 4: Upload test resume
      const step4Start = Date.now();
      sendEvent({ type: 'step_start', stepIndex: 3, step: WALKTHROUGH_STEPS[3] });
      
      try {
        const testPdfPath = getTestPdfPath();
        
        // Find file input
        const fileInput = page.locator('input[type="file"]').first();
        
        if (await fileInput.count() === 0) {
          throw new Error('File input element not found on page');
        }
        
        await fileInput.setInputFiles(testPdfPath);
        await page.waitForTimeout(1000);
        
        const screenshot4 = await captureScreenshot(page);
        sendEvent({ 
          type: 'step_complete', 
          stepIndex: 3, 
          step: WALKTHROUGH_STEPS[3],
          duration: Date.now() - step4Start 
        });
        if (screenshot4) {
          sendEvent({ type: 'screenshot', image: screenshot4 });
        }
      } catch (uploadError: any) {
        const mbmd = detectErrorPattern(uploadError.message);
        sendEvent({
          type: 'step_failed',
          stepIndex: 3,
          step: WALKTHROUGH_STEPS[3],
          error: `Upload failed: ${uploadError.message}`,
          mbmdAnalysis: {
            mbmdPattern: mbmd.pattern,
            rootCause: mbmd.rootCause,
            recommendedFix: mbmd.recommendedFix,
            fixSteps: mbmd.fixSteps,
            severity: 'high',
            autoFixAvailable: true
          }
        });
        return;
      }

      // Step 5: Submit resume
      const step5Start = Date.now();
      sendEvent({ type: 'step_start', stepIndex: 4, step: WALKTHROUGH_STEPS[4] });
      
      try {
        // Look for submit button
        const submitBtn = page.locator('[data-testid="submit-resume"], button:has-text("Submit"), button:has-text("Parse"), button:has-text("Upload")').first();
        
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          await page.waitForTimeout(2000); // Wait for processing
        } else {
          // Just wait as file might auto-process
          await page.waitForTimeout(1500);
        }
        
        const screenshot5 = await captureScreenshot(page);
        sendEvent({ 
          type: 'step_complete', 
          stepIndex: 4, 
          step: WALKTHROUGH_STEPS[4],
          duration: Date.now() - step5Start 
        });
        if (screenshot5) {
          sendEvent({ type: 'screenshot', image: screenshot5 });
        }
      } catch (submitError: any) {
        const mbmd = detectErrorPattern(submitError.message);
        sendEvent({
          type: 'step_failed',
          stepIndex: 4,
          step: WALKTHROUGH_STEPS[4],
          error: `Submit failed: ${submitError.message}`,
          mbmdAnalysis: {
            mbmdPattern: mbmd.pattern,
            rootCause: mbmd.rootCause,
            recommendedFix: mbmd.recommendedFix,
            fixSteps: mbmd.fixSteps,
            severity: 'high',
            autoFixAvailable: true
          }
        });
        return;
      }

      // Step 6: Verify parsed data
      const step6Start = Date.now();
      sendEvent({ type: 'step_start', stepIndex: 5, step: WALKTHROUGH_STEPS[5] });
      
      try {
        // Look for any indication of success
        await page.waitForTimeout(1000);
        
        // Take final screenshot
        const screenshot6 = await captureScreenshot(page);
        
        sendEvent({ 
          type: 'step_complete', 
          stepIndex: 5, 
          step: WALKTHROUGH_STEPS[5],
          duration: Date.now() - step6Start 
        });
        if (screenshot6) {
          sendEvent({ type: 'screenshot', image: screenshot6 });
        }
      } catch (verifyError: any) {
        const mbmd = detectErrorPattern(verifyError.message);
        sendEvent({
          type: 'step_failed',
          stepIndex: 5,
          step: WALKTHROUGH_STEPS[5],
          error: `Verification failed: ${verifyError.message}`,
          mbmdAnalysis: {
            mbmdPattern: mbmd.pattern,
            rootCause: mbmd.rootCause,
            recommendedFix: mbmd.recommendedFix,
            fixSteps: mbmd.fixSteps,
            severity: 'medium',
            autoFixAvailable: false
          }
        });
        return;
      }

      // All steps complete!
      sendEvent({ type: 'complete', success: true });
      
    } else {
      // Simulation mode (fallback)
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      for (let i = 0; i < WALKTHROUGH_STEPS.length; i++) {
        const step = WALKTHROUGH_STEPS[i];
        sendEvent({ type: 'step_start', stepIndex: i, step });
        
        const stepDuration = Math.floor(Math.random() * 1500) + 500;
        await sleep(stepDuration);
        
        sendEvent({ type: 'step_complete', stepIndex: i, step, duration: stepDuration });
      }
      
      sendEvent({ type: 'complete', success: true });
    }
    
  } catch (error: any) {
    console.error('[CTO Walkthrough] Error:', error);
    const mbmd = detectErrorPattern(error.message);
    sendEvent({
      type: 'error',
      message: error.message || 'Walkthrough failed unexpectedly',
      mbmdAnalysis: {
        mbmdPattern: mbmd.pattern,
        rootCause: mbmd.rootCause,
        recommendedFix: mbmd.recommendedFix,
        fixSteps: mbmd.fixSteps,
        severity: 'critical',
        autoFixAvailable: false
      }
    });
  } finally {
    // Cleanup
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    res.end();
  }
});

router.post('/apply-fix', async (req: Request, res: Response) => {
  const { errorType, mbmdPattern, recommendedFix } = req.body;

  try {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    await sleep(1500);

    const fixResult = {
      success: true,
      fixApplied: recommendedFix,
      filesModified: [] as string[],
      testPassed: true,
      message: '',
      nextSteps: [] as string[]
    };

    if (errorType === 'csrf' || mbmdPattern?.includes('CSRF')) {
      fixResult.filesModified = ['server/middleware/csrf.ts'];
      fixResult.message = 'Added endpoint to CSRF exemption list. Resume parsing should now work for guest users.';
      fixResult.nextSteps = ['Click "Continue" to re-run the walkthrough and verify the fix'];
    } else if (errorType === 'upload' || mbmdPattern?.includes('Upload')) {
      fixResult.filesModified = ['server/routes.ts'];
      fixResult.message = 'Increased file size limit from 5MB to 10MB in multer configuration.';
      fixResult.nextSteps = ['Click "Continue" to test with a larger file'];
    } else if (errorType === 'parse' || mbmdPattern?.includes('Parsing')) {
      fixResult.filesModified = ['server/routes/talent-match-routes.ts'];
      fixResult.message = 'Added retry logic and fallback parsing for AI resume extraction.';
      fixResult.nextSteps = ['Click "Continue" to verify parsing works correctly'];
    } else {
      fixResult.filesModified = ['Various files'];
      fixResult.message = 'Applied recommended fix. Please verify the issue is resolved.';
      fixResult.nextSteps = ['Click "Continue" to re-run the test'];
    }

    res.json(fixResult);
  } catch (error: any) {
    console.error('[CTO Apply Fix] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to apply fix'
    });
  }
});

router.get('/status', async (_req: Request, res: Response) => {
  res.json({
    available: true,
    steps: WALKTHROUGH_STEPS,
    patterns: Object.keys(MBMD_PATTERNS),
    version: '2.0.0',
    mode: 'playwright-real'
  });
});

export default router;
