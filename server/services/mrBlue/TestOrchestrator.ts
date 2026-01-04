/**
 * Test Orchestrator Service (Pattern 75)
 * 
 * Manages test execution and self-verification for Mr. Blue.
 * Enables autonomous testing of code changes before completion.
 * 
 * MB.MD v3.1 - VibeCoding Evolution
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface TestResult {
  success: boolean;
  testsPassed: number;
  testsFailed: number;
  testsSkipped: number;
  duration: number;
  coverage?: CoverageReport;
  failures: TestFailure[];
  output: string;
}

export interface TestFailure {
  testName: string;
  file: string;
  error: string;
  expected?: string;
  actual?: string;
}

export interface CoverageReport {
  lines: number;
  statements: number;
  functions: number;
  branches: number;
}

export interface TestConfig {
  testPattern?: string;
  timeout?: number;
  coverage?: boolean;
  watch?: boolean;
  verbose?: boolean;
}

class TestOrchestratorService {
  private isRunning: boolean = false;
  private lastRun?: Date;
  private testHistory: TestResult[] = [];
  private readonly MAX_HISTORY = 50;

  constructor() {
    console.log('[TestOrchestrator] Service initialized');
  }

  async runVitest(config: TestConfig = {}): Promise<TestResult> {
    if (this.isRunning) {
      throw new Error('Tests already running');
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      const args = ['npx', 'vitest', 'run'];
      
      if (config.testPattern) {
        args.push(config.testPattern);
      }
      
      if (config.coverage) {
        args.push('--coverage');
      }
      
      if (config.verbose) {
        args.push('--reporter=verbose');
      }

      const command = args.join(' ');
      console.log(`[TestOrchestrator] Running: ${command}`);

      const { stdout, stderr } = await execAsync(command, {
        timeout: config.timeout || 300000,
        maxBuffer: 10 * 1024 * 1024,
        cwd: process.cwd()
      });

      const result = this.parseVitestOutput(stdout, stderr, Date.now() - startTime);
      this.addToHistory(result);
      this.lastRun = new Date();

      return result;

    } catch (error: any) {
      const result = this.parseVitestOutput(
        error.stdout || '',
        error.stderr || error.message,
        Date.now() - startTime
      );
      this.addToHistory(result);
      return result;

    } finally {
      this.isRunning = false;
    }
  }

  async runPlaywright(config: TestConfig = {}): Promise<TestResult> {
    if (this.isRunning) {
      throw new Error('Tests already running');
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      const args = ['npx', 'playwright', 'test'];
      
      if (config.testPattern) {
        args.push(config.testPattern);
      }

      const command = args.join(' ');
      console.log(`[TestOrchestrator] Running: ${command}`);

      const { stdout, stderr } = await execAsync(command, {
        timeout: config.timeout || 600000,
        maxBuffer: 10 * 1024 * 1024,
        cwd: process.cwd()
      });

      const result = this.parsePlaywrightOutput(stdout, stderr, Date.now() - startTime);
      this.addToHistory(result);
      this.lastRun = new Date();

      return result;

    } catch (error: any) {
      const result = this.parsePlaywrightOutput(
        error.stdout || '',
        error.stderr || error.message,
        Date.now() - startTime
      );
      this.addToHistory(result);
      return result;

    } finally {
      this.isRunning = false;
    }
  }

  private parseVitestOutput(stdout: string, stderr: string, duration: number): TestResult {
    const failures: TestFailure[] = [];
    let testsPassed = 0;
    let testsFailed = 0;
    let testsSkipped = 0;

    const passMatch = stdout.match(/(\d+)\s+passed/i);
    const failMatch = stdout.match(/(\d+)\s+failed/i);
    const skipMatch = stdout.match(/(\d+)\s+skipped/i);

    if (passMatch) testsPassed = parseInt(passMatch[1], 10);
    if (failMatch) testsFailed = parseInt(failMatch[1], 10);
    if (skipMatch) testsSkipped = parseInt(skipMatch[1], 10);

    const failurePattern = /FAIL\s+(.+?)\s+>\s+(.+?)(?:\n|$)([\s\S]*?)(?=FAIL|$)/g;
    let match;
    while ((match = failurePattern.exec(stdout + stderr)) !== null) {
      failures.push({
        file: match[1].trim(),
        testName: match[2].trim(),
        error: match[3].trim().slice(0, 500)
      });
    }

    return {
      success: testsFailed === 0,
      testsPassed,
      testsFailed,
      testsSkipped,
      duration,
      failures,
      output: stdout.slice(0, 5000)
    };
  }

  private parsePlaywrightOutput(stdout: string, stderr: string, duration: number): TestResult {
    const failures: TestFailure[] = [];
    let testsPassed = 0;
    let testsFailed = 0;
    let testsSkipped = 0;

    const passMatch = stdout.match(/(\d+)\s+passed/i);
    const failMatch = stdout.match(/(\d+)\s+failed/i);
    const skipMatch = stdout.match(/(\d+)\s+skipped/i);

    if (passMatch) testsPassed = parseInt(passMatch[1], 10);
    if (failMatch) testsFailed = parseInt(failMatch[1], 10);
    if (skipMatch) testsSkipped = parseInt(skipMatch[1], 10);

    return {
      success: testsFailed === 0,
      testsPassed,
      testsFailed,
      testsSkipped,
      duration,
      failures,
      output: stdout.slice(0, 5000)
    };
  }

  private addToHistory(result: TestResult): void {
    this.testHistory.push(result);
    if (this.testHistory.length > this.MAX_HISTORY) {
      this.testHistory.shift();
    }
  }

  async runQuickCheck(files: string[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const file of files) {
      if (!fs.existsSync(file)) {
        errors.push(`File not found: ${file}`);
        continue;
      }

      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          await execAsync(`npx tsc --noEmit "${file}"`, { timeout: 10000 });
        } catch (error: any) {
          errors.push(`TypeScript error in ${file}: ${error.stderr || error.message}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  getStatus(): {
    isRunning: boolean;
    lastRun?: Date;
    recentResults: TestResult[];
    successRate: number;
  } {
    const recentResults = this.testHistory.slice(-10);
    const successCount = recentResults.filter(r => r.success).length;
    const successRate = recentResults.length > 0 ? successCount / recentResults.length : 0;

    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      recentResults,
      successRate
    };
  }

  getHistory(): TestResult[] {
    return [...this.testHistory];
  }

  clearHistory(): void {
    this.testHistory = [];
    console.log('[TestOrchestrator] History cleared');
  }
}

export const testOrchestratorService = new TestOrchestratorService();
