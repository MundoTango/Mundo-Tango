import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BuildResult {
  success: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
  output: string;
}

export class BuildValidator {
  /**
   * Execute npm run build and validate result (Pattern 32)
   */
  async validate(): Promise<BuildResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('[BuildValidator] Starting build validation');

    try {
      const { stdout, stderr } = await execAsync('npm run build', {
        cwd: process.cwd(),
        timeout: 300000, // 5 minutes
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });

      const output = stdout + stderr;
      const duration = Date.now() - startTime;

      // Parse build output for errors and warnings
      this.parseOutput(output, errors, warnings);

      const success = errors.length === 0;

      console.log(`[BuildValidator] Build ${success ? 'PASSED' : 'FAILED'} in ${duration}ms`);
      console.log(`[BuildValidator] Errors: ${errors.length}, Warnings: ${warnings.length}`);

      return {
        success,
        duration,
        errors,
        warnings,
        output
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      console.error('[BuildValidator] Build failed:', error.message);

      // Parse error output
      const output = (error.stdout || '') + (error.stderr || '');
      this.parseOutput(output, errors, warnings);

      if (errors.length === 0 && error.message) {
        errors.push(error.message);
      }

      return {
        success: false,
        duration,
        errors,
        warnings,
        output
      };
    }
  }

  /**
   * Parse build output for errors and warnings
   */
  private parseOutput(output: string, errors: string[], warnings: string[]): void {
    const lines = output.split('\n');

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Detect errors
      if (
        lowerLine.includes('error:') ||
        lowerLine.includes('✗') ||
        lowerLine.includes('failed') ||
        lowerLine.includes('cannot find') ||
        lowerLine.includes('unexpected token')
      ) {
        errors.push(line.trim());
      }
      // Detect warnings
      else if (
        lowerLine.includes('warning:') ||
        lowerLine.includes('⚠') ||
        lowerLine.includes('deprecated')
      ) {
        warnings.push(line.trim());
      }
    }
  }

  /**
   * Get build artifacts size
   */
  async getBuildSize(): Promise<number> {
    try {
      const { stdout } = await execAsync('du -sk dist', {
        cwd: process.cwd()
      });

      const size = parseInt(stdout.split('\t')[0]) * 1024; // Convert KB to bytes
      return size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if build artifacts exist
   */
  async buildExists(): Promise<boolean> {
    try {
      await execAsync('[ -d dist ]', { cwd: process.cwd() });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const buildValidator = new BuildValidator();
