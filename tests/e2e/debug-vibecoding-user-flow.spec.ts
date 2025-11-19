/**
 * MR BLUE VIBECODING - COMPREHENSIVE DEBUGGING TEST
 * 
 * This test reproduces the exact user flow for VibeCoding and captures
 * detailed diagnostics including:
 * - Network request monitoring (especially EventSource/SSE)
 * - Console logs and errors
 * - CSP violations
 * - Authentication headers
 * - API endpoint tracking
 * - Screenshots at each step
 * - Timing analysis
 * 
 * Output: /tmp/vibecoding-debug-report.md
 */

import { test, expect, Page, Request, Response } from '@playwright/test';
import { generateTestUser } from './fixtures/test-data';
import { takeScreenshot } from './helpers/test-helpers';
import fs from 'fs';
import path from 'path';

interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  headers: Record<string, string>;
  timing: {
    startTime: number;
    endTime?: number;
    duration?: number;
  };
  type: string;
  error?: string;
  responseBody?: any;
}

interface EventSourceEvent {
  type: string;
  data: any;
  timestamp: number;
}

interface DiagnosticReport {
  testName: string;
  timestamp: string;
  userFlow: string[];
  networkRequests: NetworkRequest[];
  eventSourceEvents: EventSourceEvent[];
  consoleErrors: string[];
  consoleWarnings: string[];
  consoleLogs: string[];
  cspViolations: string[];
  authenticationStatus: {
    hasAuthToken: boolean;
    tokenIncludedInRequests: boolean;
    authHeaders: string[];
  };
  apiEndpointsCalled: {
    endpoint: string;
    method: string;
    status: number;
    timestamp: string;
  }[];
  screenshots: {
    name: string;
    path: string;
    timestamp: string;
  }[];
  errors: string[];
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    eventSourceConnected: boolean;
    sseEventsReceived: number;
    consoleErrorsCount: number;
    cspViolationsCount: number;
  };
}

test.describe('VibeCoding Debug Flow - Comprehensive Diagnostics', () => {
  let testUser: ReturnType<typeof generateTestUser>;
  let diagnosticReport: DiagnosticReport;
  let networkRequests: NetworkRequest[] = [];
  let eventSourceEvents: EventSourceEvent[] = [];
  let consoleErrors: string[] = [];
  let consoleWarnings: string[] = [];
  let consoleLogs: string[] = [];
  let cspViolations: string[] = [];
  let screenshots: { name: string; path: string; timestamp: string }[] = [];
  let userFlowSteps: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Initialize diagnostic report
    diagnosticReport = {
      testName: 'VibeCoding User Flow Debug',
      timestamp: new Date().toISOString(),
      userFlow: [],
      networkRequests: [],
      eventSourceEvents: [],
      consoleErrors: [],
      consoleWarnings: [],
      consoleLogs: [],
      cspViolations: [],
      authenticationStatus: {
        hasAuthToken: false,
        tokenIncludedInRequests: false,
        authHeaders: [],
      },
      apiEndpointsCalled: [],
      screenshots: [],
      errors: [],
      summary: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        eventSourceConnected: false,
        sseEventsReceived: 0,
        consoleErrorsCount: 0,
        cspViolationsCount: 0,
      },
    };

    // Reset tracking arrays
    networkRequests = [];
    eventSourceEvents = [];
    consoleErrors = [];
    consoleWarnings = [];
    consoleLogs = [];
    cspViolations = [];
    screenshots = [];
    userFlowSteps = [];

    // Setup comprehensive logging
    setupNetworkMonitoring(page);
    setupConsoleMonitoring(page);
    setupCSPMonitoring(page);

    // Generate test user
    testUser = generateTestUser();
    userFlowSteps.push(`Generated test user: ${testUser.username}`);

    // Register user
    try {
      await page.request.post('/api/auth/register', {
        data: {
          username: testUser.username,
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        },
      });
      userFlowSteps.push('User registered successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      userFlowSteps.push(`Registration failed: ${errorMsg}`);
      diagnosticReport.errors.push(`Registration error: ${errorMsg}`);
    }

    // Login
    try {
      await page.goto('/login');
      userFlowSteps.push('Navigated to /login');
      
      await takeDebugScreenshot(page, '01-login-page');
      
      // Wait for login form to be visible
      await page.waitForSelector('[data-testid="input-email"]', { timeout: 5000 });
      
      await page.getByTestId('input-email').fill(testUser.email);
      await page.getByTestId('input-password').fill(testUser.password);
      userFlowSteps.push('Filled login credentials');
      
      await takeDebugScreenshot(page, '02-credentials-filled');
      
      await page.getByTestId('button-login').click();
      userFlowSteps.push('Clicked login button');
      
      // Wait for redirect (could be /feed or /dashboard depending on user role)
      await page.waitForURL((url) => url.pathname.includes('/feed') || url.pathname.includes('/dashboard'), { timeout: 10000 });
      userFlowSteps.push('Successfully logged in - redirected to home');
      
      await takeDebugScreenshot(page, '03-logged-in-feed');

      // Check for auth token in localStorage
      const hasToken = await page.evaluate(() => {
        return localStorage.getItem('auth_token') !== null;
      });
      diagnosticReport.authenticationStatus.hasAuthToken = hasToken;
      userFlowSteps.push(`Auth token in localStorage: ${hasToken}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      userFlowSteps.push(`Login failed: ${errorMsg}`);
      diagnosticReport.errors.push(`Login error: ${errorMsg}`);
    }
  });

  test.afterEach(async ({ page }) => {
    // Compile final report
    diagnosticReport.userFlow = userFlowSteps;
    diagnosticReport.networkRequests = networkRequests;
    diagnosticReport.eventSourceEvents = eventSourceEvents;
    diagnosticReport.consoleErrors = consoleErrors;
    diagnosticReport.consoleWarnings = consoleWarnings;
    diagnosticReport.consoleLogs = consoleLogs;
    diagnosticReport.cspViolations = cspViolations;
    diagnosticReport.screenshots = screenshots;

    // Calculate summary
    diagnosticReport.summary.totalRequests = networkRequests.length;
    diagnosticReport.summary.successfulRequests = networkRequests.filter(r => r.status && r.status >= 200 && r.status < 300).length;
    diagnosticReport.summary.failedRequests = networkRequests.filter(r => r.status && r.status >= 400).length;
    diagnosticReport.summary.eventSourceConnected = networkRequests.some(r => r.url.includes('/api/mrblue/vibecode/stream'));
    diagnosticReport.summary.sseEventsReceived = eventSourceEvents.length;
    diagnosticReport.summary.consoleErrorsCount = consoleErrors.length;
    diagnosticReport.summary.cspViolationsCount = cspViolations.length;

    // Extract API endpoints called
    diagnosticReport.apiEndpointsCalled = networkRequests
      .filter(r => r.url.includes('/api/'))
      .map(r => ({
        endpoint: r.url.split('/api/')[1] || r.url,
        method: r.method,
        status: r.status || 0,
        timestamp: new Date(r.timing.startTime).toISOString(),
      }));

    // Generate markdown report
    const reportContent = generateMarkdownReport(diagnosticReport);
    
    // Write report to /tmp
    const reportPath = '/tmp/vibecoding-debug-report.md';
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n✅ Diagnostic report generated: ${reportPath}\n`);
  });

  test('Main Flow: Navigate → Type Prompt → Monitor SSE Stream', async ({ page }) => {
    console.log('\n🔍 Starting VibeCoding Debug Flow\n');
    
    // STEP 1: Navigate to Visual Editor
    console.log('📍 STEP 1: Navigating to /mr-blue...');
    userFlowSteps.push('STEP 1: Navigating to /mr-blue');
    
    try {
      await page.goto('/mr-blue');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      userFlowSteps.push('Successfully navigated to /mr-blue');
      await takeDebugScreenshot(page, '04-mr-blue-page-loaded');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      userFlowSteps.push(`Navigation to /mr-blue failed: ${errorMsg}`);
      diagnosticReport.errors.push(`Navigation error: ${errorMsg}`);
    }

    // Wait for page elements to load
    try {
      await page.waitForSelector('[data-testid="page-visual-editor"]', { timeout: 5000 });
      userFlowSteps.push('Visual editor page element found');
    } catch (error) {
      userFlowSteps.push('Visual editor page element NOT found - may be different page structure');
    }

    await takeDebugScreenshot(page, '05-before-interaction');

    // STEP 2: Navigate to VibeCoding system
    console.log('📍 STEP 2: Clicking on VibeCoding system card...');
    userFlowSteps.push('STEP 2: Looking for VibeCoding system card');
    
    // Look for the VibeCoding card in Command Center
    const vibeCodeCardSelectors = [
      '[data-testid="card-vibecode"]',
      '[data-testid="system-card-vibecode"]',
      'button:has-text("Vibe")',
      'button:has-text("Code")',
    ];

    let vibeCodeCard: any = null;
    for (const selector of vibeCodeCardSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          vibeCodeCard = element;
          userFlowSteps.push(`Found VibeCoding card using selector: ${selector}`);
          await vibeCodeCard.click();
          userFlowSteps.push('Clicked VibeCoding card');
          await page.waitForTimeout(2000); // Wait for transition
          await takeDebugScreenshot(page, '06-vibecode-interface-loaded');
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (!vibeCodeCard) {
      userFlowSteps.push('VibeCoding card not found, trying direct navigation or checking if already on vibecode interface');
    }

    // STEP 3: Locate chat input on VibeCoding interface
    console.log('📍 STEP 3: Locating VibeCoding input...');
    userFlowSteps.push('STEP 3: Looking for VibeCoding input element');
    
    // Try multiple selectors to find the input/textarea
    const inputSelectors = [
      '[data-testid="input-mr-blue-visual-chat"]',
      '[data-testid="input-prompt"]',
      '[data-testid="textarea-request"]',
      'textarea[placeholder*="natural"]',
      'textarea[placeholder*="describe"]',
      'textarea[placeholder*="Mr"]',
      'textarea',
    ];

    let codeInput: any = null;
    let foundSelector = '';

    for (const selector of inputSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          codeInput = element;
          foundSelector = selector;
          userFlowSteps.push(`Found VibeCoding input using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!codeInput) {
      userFlowSteps.push('❌ CRITICAL: No VibeCoding input found with any selector');
      diagnosticReport.errors.push('VibeCoding input element not found');
      await takeDebugScreenshot(page, '07-input-not-found');
    } else {
      await takeDebugScreenshot(page, '07-input-found');
    }

    // STEP 4: Type test message
    console.log('📍 STEP 4: Typing test message...');
    userFlowSteps.push('STEP 4: Attempting to type test message');
    
    const testMessage = 'Make the login button blue';
    
    try {
      if (codeInput) {
        await codeInput.click();
        userFlowSteps.push('Clicked on VibeCoding input');
        await takeDebugScreenshot(page, '08-input-clicked');

        await codeInput.type(testMessage, { delay: 50 });
        userFlowSteps.push(`Typed message: "${testMessage}"`);
        await takeDebugScreenshot(page, '09-message-typed');

        // Wait a bit for any auto-complete or suggestions
        await page.waitForTimeout(1000);
      } else {
        userFlowSteps.push('Skipped typing - no VibeCoding input found');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      userFlowSteps.push(`Failed to type message: ${errorMsg}`);
      diagnosticReport.errors.push(`Type message error: ${errorMsg}`);
    }

    // STEP 5: Submit message (look for generate button)
    console.log('📍 STEP 5: Submitting message...');
    userFlowSteps.push('STEP 5: Looking for Generate button');

    const submitButtonSelectors = [
      '[data-testid="button-generate"]',
      '[data-testid="button-generate-code"]',
      '[data-testid="button-vibecode-generate"]',
      'button:has-text("Generate")',
      'button:has-text("Create")',
    ];

    let submitButton: any = null;
    let foundSubmitSelector = '';

    for (const selector of submitButtonSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          submitButton = element;
          foundSubmitSelector = selector;
          userFlowSteps.push(`Found Generate button using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (!submitButton) {
      userFlowSteps.push('Generate button not found, trying Enter key');
      try {
        if (codeInput) {
          await codeInput.press('Enter');
          userFlowSteps.push('Pressed Enter key to submit');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        userFlowSteps.push(`Failed to press Enter: ${errorMsg}`);
      }
    } else {
      try {
        await submitButton.click();
        userFlowSteps.push('Clicked Generate button');
        await takeDebugScreenshot(page, '10-generate-clicked');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        userFlowSteps.push(`Failed to click Generate: ${errorMsg}`);
        diagnosticReport.errors.push(`Submit error: ${errorMsg}`);
      }
    }

    // STEP 6: Monitor for network activity and SSE connection
    console.log('📍 STEP 6: Monitoring network activity and SSE connection...');
    userFlowSteps.push('STEP 6: Waiting for network responses and SSE events (15 seconds)');
    
    // Wait for potential API calls and SSE stream
    await page.waitForTimeout(15000);
    await takeDebugScreenshot(page, '11-after-generate-wait');

    // STEP 7: Check for streaming progress indicators and results
    console.log('📍 STEP 7: Checking for streaming progress and results...');
    userFlowSteps.push('STEP 7: Looking for streaming progress indicators and generated code');

    const progressSelectors = [
      '[data-testid="progress-indicator"]',
      '[data-testid="streaming-status"]',
      '[data-testid="generation-status"]',
      '.progress',
      '.loading',
      'text=/Generating/i',
      'text=/Processing/i',
      'text=/Interpreting/i',
    ];

    for (const selector of progressSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          userFlowSteps.push(`Found progress indicator: ${selector} - "${text}"`);
        }
      } catch (e) {
        // Continue
      }
    }

    // Check for generated code result
    const resultSelectors = [
      '[data-testid="generated-code"]',
      '[data-testid="code-result"]',
      '[data-testid="file-changes"]',
      '.code-block',
      'pre code',
    ];

    for (const selector of resultSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          userFlowSteps.push(`Found generated code result: ${selector}`);
          const codeText = await element.textContent();
          if (codeText && codeText.length > 0) {
            userFlowSteps.push(`Code result length: ${codeText.length} characters`);
          }
        }
      } catch (e) {
        // Continue
      }
    }

    await takeDebugScreenshot(page, '12-final-state');
    userFlowSteps.push('Test flow completed');

    // STEP 8: Summary of network activity
    console.log('📍 STEP 8: Analyzing network activity...');
    const sseRequests = networkRequests.filter(r => 
      r.url.includes('/api/mrblue/vibecode') || 
      r.url.includes('/stream') ||
      r.headers['accept']?.includes('text/event-stream')
    );
    
    userFlowSteps.push(`Total network requests: ${networkRequests.length}`);
    userFlowSteps.push(`VibeCoding API requests: ${sseRequests.length}`);
    userFlowSteps.push(`SSE/EventSource requests: ${sseRequests.filter(r => r.url.includes('/stream')).length}`);

    console.log('\n✅ Debug flow completed\n');
  });

  /**
   * Setup network request monitoring
   */
  function setupNetworkMonitoring(page: Page) {
    // Monitor all requests
    page.on('request', (request: Request) => {
      const startTime = Date.now();
      const url = request.url();
      
      const networkReq: NetworkRequest = {
        url,
        method: request.method(),
        headers: request.headers(),
        timing: {
          startTime,
        },
        type: request.resourceType(),
      };

      networkRequests.push(networkReq);

      // Special logging for EventSource/SSE
      if (url.includes('/stream') || request.headers()['accept']?.includes('text/event-stream')) {
        console.log(`🔄 [EventSource] Request initiated: ${url}`);
        userFlowSteps.push(`EventSource request detected: ${url}`);
      }

      // Track API calls
      if (url.includes('/api/mrblue/')) {
        console.log(`📡 [API] ${request.method()} ${url}`);
      }

      // Check for auth headers
      if (request.headers()['authorization']) {
        diagnosticReport.authenticationStatus.tokenIncludedInRequests = true;
        diagnosticReport.authenticationStatus.authHeaders.push(request.headers()['authorization']);
      }
    });

    // Monitor all responses
    page.on('response', async (response: Response) => {
      const url = response.url();
      const request = response.request();
      const endTime = Date.now();

      // Find matching request
      const matchingReq = networkRequests.find(
        r => r.url === url && !r.timing.endTime
      );

      if (matchingReq) {
        matchingReq.status = response.status();
        matchingReq.statusText = response.statusText();
        matchingReq.timing.endTime = endTime;
        matchingReq.timing.duration = endTime - matchingReq.timing.startTime;

        // Try to capture response body for API calls
        if (url.includes('/api/') && response.status() !== 204) {
          try {
            const contentType = response.headers()['content-type'];
            if (contentType?.includes('application/json')) {
              const body = await response.json();
              matchingReq.responseBody = body;
            } else if (contentType?.includes('text/event-stream')) {
              userFlowSteps.push(`EventSource response received: ${response.status()}`);
            }
          } catch (e) {
            // Can't parse body, skip
          }
        }
      }

      // Log important responses
      if (url.includes('/api/mrblue/')) {
        console.log(`✅ [API Response] ${response.status()} ${url}`);
      }

      // Detect SSE connection
      if (response.headers()['content-type']?.includes('text/event-stream')) {
        console.log(`🎯 [EventSource] SSE stream opened: ${url}`);
        userFlowSteps.push(`SSE stream opened: ${url} (status: ${response.status()})`);
        diagnosticReport.summary.eventSourceConnected = true;
      }
    });

    // Monitor request failures
    page.on('requestfailed', (request: Request) => {
      const url = request.url();
      const failure = request.failure();
      
      console.log(`❌ [Request Failed] ${url}: ${failure?.errorText}`);
      
      const matchingReq = networkRequests.find(r => r.url === url && !r.error);
      if (matchingReq) {
        matchingReq.error = failure?.errorText || 'Request failed';
      }

      userFlowSteps.push(`Request failed: ${url} - ${failure?.errorText}`);
      diagnosticReport.errors.push(`Network error: ${url} - ${failure?.errorText}`);
    });
  }

  /**
   * Setup console monitoring
   */
  function setupConsoleMonitoring(page: Page) {
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      const location = msg.location();
      const timestamp = new Date().toISOString();

      const logEntry = `[${timestamp}] ${location.url}:${location.lineNumber} - ${text}`;

      if (type === 'error') {
        consoleErrors.push(logEntry);
        console.log(`🔴 [Console Error] ${text}`);
        
        // Special detection for EventSource errors
        if (text.toLowerCase().includes('eventsource') || text.toLowerCase().includes('sse')) {
          userFlowSteps.push(`EventSource console error: ${text}`);
        }
      } else if (type === 'warning') {
        consoleWarnings.push(logEntry);
        console.log(`⚠️ [Console Warning] ${text}`);
      } else {
        consoleLogs.push(logEntry);
        
        // Log interesting console messages
        if (text.includes('EventSource') || text.includes('SSE') || text.includes('stream')) {
          console.log(`ℹ️ [Console] ${text}`);
          userFlowSteps.push(`Console log: ${text}`);
        }
      }
    });

    // Monitor page errors
    page.on('pageerror', (error) => {
      const errorMsg = error.message;
      consoleErrors.push(`[Page Error] ${errorMsg}\n${error.stack}`);
      console.log(`💥 [Page Error] ${errorMsg}`);
      diagnosticReport.errors.push(`Page error: ${errorMsg}`);
    });
  }

  /**
   * Setup CSP violation monitoring
   */
  function setupCSPMonitoring(page: Page) {
    page.on('console', (msg) => {
      const text = msg.text();
      
      // Detect CSP violations
      if (
        text.includes('Content Security Policy') ||
        text.includes('CSP') ||
        text.includes('Refused to') ||
        text.includes('blocked by CSP')
      ) {
        cspViolations.push(text);
        console.log(`🛡️ [CSP Violation] ${text}`);
        userFlowSteps.push(`CSP violation detected: ${text.substring(0, 100)}...`);
      }
    });
  }

  /**
   * Take screenshot and add to report
   */
  async function takeDebugScreenshot(page: Page, name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${timestamp}.png`;
    const relativePath = `test-results/screenshots/${filename}`;
    
    try {
      await takeScreenshot(page, name);
      screenshots.push({
        name,
        path: relativePath,
        timestamp: new Date().toISOString(),
      });
      console.log(`📸 Screenshot: ${name}`);
    } catch (error) {
      console.log(`❌ Failed to take screenshot: ${name}`);
    }
  }

  /**
   * Generate markdown diagnostic report
   */
  function generateMarkdownReport(report: DiagnosticReport): string {
    const md: string[] = [];

    md.push('# VibeCoding Debug Report\n');
    md.push(`**Generated:** ${report.timestamp}\n`);
    md.push(`**Test:** ${report.testName}\n\n`);

    // Summary
    md.push('## 📊 Summary\n');
    md.push(`- **Total Network Requests:** ${report.summary.totalRequests}`);
    md.push(`- **Successful Requests:** ${report.summary.successfulRequests}`);
    md.push(`- **Failed Requests:** ${report.summary.failedRequests}`);
    md.push(`- **EventSource Connected:** ${report.summary.eventSourceConnected ? '✅ YES' : '❌ NO'}`);
    md.push(`- **SSE Events Received:** ${report.summary.sseEventsReceived}`);
    md.push(`- **Console Errors:** ${report.summary.consoleErrorsCount}`);
    md.push(`- **CSP Violations:** ${report.summary.cspViolationsCount}\n\n`);

    // Authentication Status
    md.push('## 🔐 Authentication Status\n');
    md.push(`- **Has Auth Token:** ${report.authenticationStatus.hasAuthToken ? '✅ YES' : '❌ NO'}`);
    md.push(`- **Token Included in Requests:** ${report.authenticationStatus.tokenIncludedInRequests ? '✅ YES' : '❌ NO'}`);
    md.push(`- **Auth Headers Count:** ${report.authenticationStatus.authHeaders.length}\n\n`);

    // User Flow
    md.push('## 🔄 User Flow Steps\n');
    report.userFlow.forEach((step, i) => {
      md.push(`${i + 1}. ${step}`);
    });
    md.push('\n');

    // API Endpoints Called
    md.push('## 📡 API Endpoints Called\n');
    if (report.apiEndpointsCalled.length === 0) {
      md.push('*No API endpoints called*\n\n');
    } else {
      md.push('| Endpoint | Method | Status | Timestamp |');
      md.push('|----------|--------|--------|-----------|');
      report.apiEndpointsCalled.forEach(api => {
        md.push(`| ${api.endpoint} | ${api.method} | ${api.status} | ${api.timestamp} |`);
      });
      md.push('\n');
    }

    // Network Requests
    md.push('## 🌐 Network Requests\n');
    if (report.networkRequests.length === 0) {
      md.push('*No network requests captured*\n\n');
    } else {
      report.networkRequests.forEach((req, i) => {
        md.push(`### Request ${i + 1}`);
        md.push(`- **URL:** ${req.url}`);
        md.push(`- **Method:** ${req.method}`);
        md.push(`- **Status:** ${req.status || 'pending'} ${req.statusText || ''}`);
        md.push(`- **Type:** ${req.type}`);
        md.push(`- **Duration:** ${req.timing.duration || 'N/A'}ms`);
        if (req.error) {
          md.push(`- **Error:** ${req.error}`);
        }
        md.push('');
      });
      md.push('');
    }

    // EventSource Events
    md.push('## 🔄 EventSource (SSE) Events\n');
    if (report.eventSourceEvents.length === 0) {
      md.push('*No EventSource events captured*\n\n');
    } else {
      report.eventSourceEvents.forEach((event, i) => {
        md.push(`### Event ${i + 1}`);
        md.push(`- **Type:** ${event.type}`);
        md.push(`- **Data:** ${JSON.stringify(event.data, null, 2)}`);
        md.push(`- **Timestamp:** ${new Date(event.timestamp).toISOString()}`);
        md.push('');
      });
      md.push('');
    }

    // Console Errors
    md.push('## 🔴 Console Errors\n');
    if (report.consoleErrors.length === 0) {
      md.push('*No console errors*\n\n');
    } else {
      report.consoleErrors.forEach(error => {
        md.push(`- ${error}`);
      });
      md.push('\n');
    }

    // Console Warnings
    md.push('## ⚠️ Console Warnings\n');
    if (report.consoleWarnings.length === 0) {
      md.push('*No console warnings*\n\n');
    } else {
      report.consoleWarnings.forEach(warning => {
        md.push(`- ${warning}`);
      });
      md.push('\n');
    }

    // CSP Violations
    md.push('## 🛡️ CSP Violations\n');
    if (report.cspViolations.length === 0) {
      md.push('*No CSP violations detected*\n\n');
    } else {
      report.cspViolations.forEach(violation => {
        md.push(`- ${violation}`);
      });
      md.push('\n');
    }

    // Screenshots
    md.push('## 📸 Screenshots\n');
    if (report.screenshots.length === 0) {
      md.push('*No screenshots taken*\n\n');
    } else {
      report.screenshots.forEach(screenshot => {
        md.push(`- **${screenshot.name}** - ${screenshot.timestamp}`);
        md.push(`  - Path: ${screenshot.path}`);
      });
      md.push('\n');
    }

    // Errors
    if (report.errors.length > 0) {
      md.push('## ❌ Errors Encountered\n');
      report.errors.forEach(error => {
        md.push(`- ${error}`);
      });
      md.push('\n');
    }

    // Diagnostic Insights
    md.push('## 🔍 Diagnostic Insights\n');
    
    // Check for EventSource issues
    if (!report.summary.eventSourceConnected) {
      md.push('### ❌ EventSource NOT Connected');
      md.push('**Possible causes:**');
      md.push('- SSE endpoint not being called');
      md.push('- CSP blocking EventSource');
      md.push('- Authentication issues');
      md.push('- Network errors\n');
    } else {
      md.push('### ✅ EventSource Connected');
      if (report.summary.sseEventsReceived === 0) {
        md.push('**However, no SSE events were received.**');
        md.push('**Possible causes:**');
        md.push('- Server not sending events');
        md.push('- Event format issues');
        md.push('- Connection closed prematurely\n');
      } else {
        md.push(`**Successfully received ${report.summary.sseEventsReceived} SSE events.**\n`);
      }
    }

    // Check for authentication issues
    if (!report.authenticationStatus.hasAuthToken) {
      md.push('### ⚠️ No Auth Token Found');
      md.push('User may not be properly authenticated.\n');
    } else if (!report.authenticationStatus.tokenIncludedInRequests) {
      md.push('### ⚠️ Auth Token Not Included in Requests');
      md.push('Token exists but not being sent with API calls.\n');
    }

    // Check for CSP issues
    if (report.summary.cspViolationsCount > 0) {
      md.push('### ⚠️ CSP Violations Detected');
      md.push('Content Security Policy may be blocking requests or scripts.\n');
    }

    md.push('\n---\n');
    md.push('*End of Diagnostic Report*\n');

    return md.join('\n');
  }
});
