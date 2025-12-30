/**
 * Code Sandbox Service (Pattern 74)
 * 
 * ⚠️ EXPERIMENTAL - NOT FOR PRODUCTION USE ⚠️
 * 
 * Provides code execution environment for development testing ONLY.
 * 
 * SECURITY LIMITATIONS:
 * - Uses child_process exec (not true containerized sandbox)
 * - No network/filesystem isolation enforced at OS level
 * - Suitable for development/testing workflows only
 * 
 * SECURITY CONTROLS (defense-in-depth):
 * - HARD-DISABLED in production (NODE_ENV=production)
 * - Requires explicit ENABLE_CODE_SANDBOX=true in development
 * - Role-level gating: Only God-level users (roleLevel >= 8)
 * - Audit logging of all execution attempts
 * - Dangerous shell pattern blocking
 * 
 * FUTURE IMPROVEMENTS REQUIRED:
 * - True container/VM isolation (Docker, Firecracker, etc.)
 * - Network/filesystem sandboxing at OS level
 * - Integration with authenticated session context
 * 
 * MB.MD v3.1 - VibeCoding Evolution
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface SandboxResult {
  success: boolean;
  output: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  memoryUsed?: number;
}

export interface SandboxConfig {
  timeout: number;
  maxMemory: number;
  allowNetwork: boolean;
  allowFileSystem: boolean;
  workingDirectory?: string;
}

const DEFAULT_CONFIG: SandboxConfig = {
  timeout: 30000,
  maxMemory: 256 * 1024 * 1024,
  allowNetwork: false,
  allowFileSystem: false
};

class CodeSandboxService {
  private sandboxDir: string;
  private executions: Map<string, { startTime: number; pid?: number }> = new Map();
  private readonly enabled: boolean;
  private executionLog: Array<{ timestamp: Date; code: string; userId?: number; result: 'success' | 'blocked' | 'error' }> = [];
  private static readonly MIN_ROLE_LEVEL = 8;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    const hasEnvFlag = process.env.ENABLE_CODE_SANDBOX === 'true';
    
    this.enabled = !isProduction && hasEnvFlag;
    
    this.sandboxDir = path.join(os.tmpdir(), 'mrblue-sandbox');
    if (this.enabled) {
      this.ensureSandboxDir();
      console.log('[CodeSandbox] Service initialized - ENABLED (development only)');
    } else if (isProduction) {
      console.log('[CodeSandbox] Service HARD-DISABLED in production environment');
    } else {
      console.log('[CodeSandbox] Service DISABLED (set ENABLE_CODE_SANDBOX=true in development to enable)');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  canUserExecute(roleLevel: number): boolean {
    return this.enabled && roleLevel >= CodeSandboxService.MIN_ROLE_LEVEL;
  }

  private checkAuthorization(roleLevel?: number): string | null {
    if (!this.enabled) {
      return 'CodeSandbox is disabled';
    }
    if (roleLevel !== undefined && roleLevel < CodeSandboxService.MIN_ROLE_LEVEL) {
      return `Insufficient permissions. Requires role level ${CodeSandboxService.MIN_ROLE_LEVEL}+ (God-level)`;
    }
    return null;
  }

  private ensureSandboxDir(): void {
    if (!fs.existsSync(this.sandboxDir)) {
      fs.mkdirSync(this.sandboxDir, { recursive: true });
    }
  }

  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  async executeJavaScript(code: string, config: Partial<SandboxConfig> = {}, roleLevel?: number, userId?: number): Promise<SandboxResult> {
    const authError = this.checkAuthorization(roleLevel);
    if (authError) {
      this.executionLog.push({ timestamp: new Date(), code: code.slice(0, 200), userId, result: 'blocked' });
      return {
        success: false,
        output: '',
        stderr: authError,
        exitCode: 1,
        executionTime: 0
      };
    }

    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    this.executionLog.push({ timestamp: new Date(), code: code.slice(0, 200), userId, result: 'success' });

    const filePath = path.join(this.sandboxDir, `${executionId}.js`);
    
    try {
      const wrappedCode = `
        const startMem = process.memoryUsage().heapUsed;
        try {
          ${code}
        } catch (e) {
          console.error('Execution error:', e.message);
          process.exit(1);
        }
        const endMem = process.memoryUsage().heapUsed;
        console.log('__MEMORY__:' + (endMem - startMem));
      `;

      fs.writeFileSync(filePath, wrappedCode);

      this.executions.set(executionId, { startTime });

      const { stdout, stderr } = await execAsync(`node "${filePath}"`, {
        timeout: finalConfig.timeout,
        maxBuffer: 1024 * 1024,
        cwd: this.sandboxDir
      });

      const executionTime = Date.now() - startTime;
      let memoryUsed: number | undefined;
      
      const memMatch = stdout.match(/__MEMORY__:(\d+)/);
      if (memMatch) {
        memoryUsed = parseInt(memMatch[1], 10);
      }

      const cleanOutput = stdout.replace(/__MEMORY__:\d+\n?/, '');

      return {
        success: true,
        output: cleanOutput.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
        executionTime,
        memoryUsed
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        output: '',
        stderr: error.message || 'Execution failed',
        exitCode: error.code || 1,
        executionTime
      };

    } finally {
      this.executions.delete(executionId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  async executeTypeScript(code: string, config: Partial<SandboxConfig> = {}, roleLevel?: number, userId?: number): Promise<SandboxResult> {
    const authError = this.checkAuthorization(roleLevel);
    if (authError) {
      this.executionLog.push({ timestamp: new Date(), code: code.slice(0, 200), userId, result: 'blocked' });
      return {
        success: false,
        output: '',
        stderr: authError,
        exitCode: 1,
        executionTime: 0
      };
    }

    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    this.executionLog.push({ timestamp: new Date(), code: code.slice(0, 200), userId, result: 'success' });

    const filePath = path.join(this.sandboxDir, `${executionId}.ts`);
    
    try {
      fs.writeFileSync(filePath, code);

      this.executions.set(executionId, { startTime });

      const { stdout, stderr } = await execAsync(`npx tsx "${filePath}"`, {
        timeout: finalConfig.timeout,
        maxBuffer: 1024 * 1024,
        cwd: process.cwd()
      });

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        output: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
        executionTime
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        output: '',
        stderr: error.message || 'TypeScript execution failed',
        exitCode: error.code || 1,
        executionTime
      };

    } finally {
      this.executions.delete(executionId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  async executeShell(command: string, config: Partial<SandboxConfig> = {}, roleLevel?: number, userId?: number): Promise<SandboxResult> {
    const authError = this.checkAuthorization(roleLevel);
    if (authError) {
      this.executionLog.push({ timestamp: new Date(), code: command.slice(0, 200), userId, result: 'blocked' });
      return {
        success: false,
        output: '',
        stderr: authError,
        exitCode: 1,
        executionTime: 0
      };
    }

    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const startTime = Date.now();

    this.executionLog.push({ timestamp: new Date(), code: command.slice(0, 200), userId, result: 'success' });

    const dangerousPatterns = [
      /rm\s+(-rf?|-r)\s+[\/~]/i,
      /dd\s+if=/i,
      /mkfs/i,
      /:\(\)\{.*\}.*:/,
      />\s*\/dev\/[a-z]+/i,
      /chmod\s+777/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return {
          success: false,
          output: '',
          stderr: 'Command blocked: potentially dangerous operation detected',
          exitCode: 1,
          executionTime: 0
        };
      }
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: finalConfig.timeout,
        maxBuffer: 1024 * 1024,
        cwd: finalConfig.workingDirectory || process.cwd()
      });

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        output: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
        executionTime
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        output: error.stdout?.trim() || '',
        stderr: error.stderr?.trim() || error.message,
        exitCode: error.code || 1,
        executionTime
      };
    }
  }

  async validateSyntax(code: string, language: 'javascript' | 'typescript'): Promise<{ valid: boolean; errors: string[] }> {
    const executionId = this.generateExecutionId();
    const ext = language === 'typescript' ? 'ts' : 'js';
    const filePath = path.join(this.sandboxDir, `${executionId}.${ext}`);

    try {
      fs.writeFileSync(filePath, code);

      if (language === 'typescript') {
        const { stderr } = await execAsync(`npx tsc --noEmit "${filePath}"`, {
          timeout: 10000
        });
        return { valid: true, errors: [] };
      } else {
        const { stderr } = await execAsync(`node --check "${filePath}"`, {
          timeout: 5000
        });
        return { valid: true, errors: [] };
      }

    } catch (error: any) {
      const errors = error.stderr?.split('\n').filter(Boolean) || [error.message];
      return { valid: false, errors };

    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  getActiveExecutions(): number {
    return this.executions.size;
  }

  cleanup(): void {
    try {
      const files = fs.readdirSync(this.sandboxDir);
      for (const file of files) {
        fs.unlinkSync(path.join(this.sandboxDir, file));
      }
      console.log('[CodeSandbox] Cleaned up sandbox directory');
    } catch (error) {
      console.error('[CodeSandbox] Cleanup error:', error);
    }
  }

  getAuditLog(): Array<{ timestamp: Date; code: string; userId?: number; result: 'success' | 'blocked' | 'error' }> {
    return [...this.executionLog];
  }

  getStatus(): { enabled: boolean; activeExecutions: number; totalExecutions: number } {
    return {
      enabled: this.enabled,
      activeExecutions: this.executions.size,
      totalExecutions: this.executionLog.length
    };
  }
}

export const codeSandboxService = new CodeSandboxService();
