import * as fs from 'fs';
import * as path from 'path';
import type { Page, TestInfo } from '@playwright/test';

export interface BugReport {
  bugId: string;
  suite: string;
  testName: string;
  testIndex: number;
  error: string;
  screenshot?: string;
  networkLogs: NetworkLog[];
  consoleLogs: ConsoleLog[];
  fixStrategy: FixStrategy;
  timestamp: string;
  url: string;
}

export interface NetworkLog {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  timing?: number;
}

export interface ConsoleLog {
  type: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
}

export interface FixStrategy {
  files: string[];
  issue: string;
  expectedFix: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export class BugReporter {
  private networkLogs: NetworkLog[] = [];
  private consoleLogs: ConsoleLog[] = [];

  constructor(private page: Page) {
    this.setupListeners();
  }

  private setupListeners() {
    this.page.on('request', (request) => {
      this.networkLogs.push({
        url: request.url(),
        method: request.method(),
        requestHeaders: request.headers(),
      });
    });

    this.page.on('response', (response) => {
      const matchingLog = this.networkLogs.find(
        (log) => log.url === response.url() && !log.status
      );
      if (matchingLog) {
        matchingLog.status = response.status();
        matchingLog.statusText = response.statusText();
        matchingLog.responseHeaders = response.headers();
      }
    });

    this.page.on('console', (msg) => {
      this.consoleLogs.push({
        type: msg.type() as ConsoleLog['type'],
        message: msg.text(),
        timestamp: new Date().toISOString(),
      });
    });
  }

  async createBugReport(
    suite: string,
    testName: string,
    testIndex: number,
    error: string,
    fixStrategy: FixStrategy,
    testInfo: TestInfo
  ): Promise<BugReport> {
    const timestamp = Date.now();
    const bugId = `bug-${suite.replace(/\s+/g, '-').toLowerCase()}-${testIndex}-${timestamp}`;
    
    const bugReportsDir = path.join(process.cwd(), 'test-results', 'bug-reports');
    if (!fs.existsSync(bugReportsDir)) {
      fs.mkdirSync(bugReportsDir, { recursive: true });
    }

    let screenshotPath: string | undefined;
    try {
      const screenshotFilename = `${bugId}.png`;
      screenshotPath = path.join(bugReportsDir, screenshotFilename);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
    } catch (e) {
      console.error('Failed to capture screenshot:', e);
    }

    const bugReport: BugReport = {
      bugId,
      suite,
      testName,
      testIndex,
      error,
      screenshot: screenshotPath,
      networkLogs: this.networkLogs.slice(-50),
      consoleLogs: this.consoleLogs.slice(-100),
      fixStrategy,
      timestamp: new Date().toISOString(),
      url: this.page.url(),
    };

    const reportPath = path.join(bugReportsDir, `${bugId}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(bugReport, null, 2));

    return bugReport;
  }

  getNetworkLogs(): NetworkLog[] {
    return [...this.networkLogs];
  }

  getConsoleLogs(): ConsoleLog[] {
    return [...this.consoleLogs];
  }

  clearLogs() {
    this.networkLogs = [];
    this.consoleLogs = [];
  }

  getConsoleErrors(): ConsoleLog[] {
    return this.consoleLogs.filter((log) => log.type === 'error');
  }

  get401Errors(): NetworkLog[] {
    return this.networkLogs.filter((log) => log.status === 401);
  }

  getWebSocketErrors(): ConsoleLog[] {
    return this.consoleLogs.filter(
      (log) =>
        log.type === 'error' &&
        (log.message.toLowerCase().includes('websocket') ||
          log.message.toLowerCase().includes('ws'))
    );
  }
}
