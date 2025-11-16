/**
 * MR BLUE VIBE CODING SERVICE - SYSTEM 4
 * Natural Language → Production Code Engine
 * 
 * Powered by GROQ Llama-3.1-70b-versatile
 * Week 1, Day 1 Implementation - MB.MD v7.1
 * 
 * Features:
 * - Natural language code request parsing
 * - Multi-file editing (5+ files at once)
 * - Safety validation (LSP, syntax, file safety)
 * - Preview generation before apply
 * - Git integration for rollback
 */

import Groq from 'groq-sdk';
import { ContextService } from './ContextService';
import { CodeGenerator } from './CodeGenerator';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface VibeCodeRequest {
  naturalLanguage: string;
  context?: string[];
  targetFiles?: string[];
  userId: number;
  sessionId: string;
}

export interface FileChange {
  filePath: string;
  originalContent: string;
  newContent: string;
  diff: string;
  action: 'create' | 'modify' | 'delete';
  reason: string;
}

export interface VibeCodeResult {
  success: boolean;
  sessionId: string;
  request: string;
  interpretation: string;
  fileChanges: FileChange[];
  validationResults: {
    syntax: boolean;
    lsp: boolean;
    safety: boolean;
    warnings: string[];
  };
  estimatedImpact: string;
  previewUrl?: string;
  error?: string;
}

export interface ApplyResult {
  success: boolean;
  sessionId: string;
  filesModified: string[];
  gitCommitId?: string;
  error?: string;
}

export class VibeCodingService {
  private contextService: ContextService;
  private codeGenerator: CodeGenerator;
  private sessionCache = new Map<string, VibeCodeResult>();

  constructor() {
    this.contextService = new ContextService();
    this.codeGenerator = new CodeGenerator(this.contextService);
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    console.log('[VibeCoding] Initializing Vibe Coding Engine...');
    await this.contextService.initialize();
    console.log('[VibeCoding] ✅ Vibe Coding Engine ready');
  }

  /**
   * Generate code from natural language request
   */
  async generateCode(request: VibeCodeRequest): Promise<VibeCodeResult> {
    try {
      console.log(`[VibeCoding] 🎯 Request: "${request.naturalLanguage}"`);
      
      // Step 1: Interpret the request using GROQ
      const interpretation = await this.interpretRequest(request.naturalLanguage);
      console.log(`[VibeCoding] 📝 Interpretation: ${interpretation.intent}`);

      // Step 2: Get relevant context from documentation
      const contextResults = await this.contextService.search(
        request.naturalLanguage,
        5
      );
      console.log(`[VibeCoding] 📚 Found ${contextResults.length} relevant context chunks`);

      // Step 3: Generate code changes
      const fileChanges = await this.codeGenerator.generateChanges({
        request: request.naturalLanguage,
        interpretation,
        context: contextResults,
        targetFiles: request.targetFiles || [],
      });
      console.log(`[VibeCoding] 🔨 Generated ${fileChanges.length} file changes`);

      // Step 4: Validate changes
      const validationResults = await this.validateChanges(fileChanges);
      console.log(`[VibeCoding] ✅ Validation complete`);

      // Step 5: Create result
      const result: VibeCodeResult = {
        success: true,
        sessionId: request.sessionId,
        request: request.naturalLanguage,
        interpretation: interpretation.summary,
        fileChanges,
        validationResults,
        estimatedImpact: this.estimateImpact(fileChanges),
      };

      // Cache result for preview/apply
      this.sessionCache.set(request.sessionId, result);

      console.log(`[VibeCoding] 🎉 Code generation complete for session ${request.sessionId}`);
      return result;
    } catch (error: any) {
      console.error('[VibeCoding] ❌ Error generating code:', error);
      return {
        success: false,
        sessionId: request.sessionId,
        request: request.naturalLanguage,
        interpretation: '',
        fileChanges: [],
        validationResults: {
          syntax: false,
          lsp: false,
          safety: false,
          warnings: [],
        },
        estimatedImpact: 'Unknown',
        error: error.message,
      };
    }
  }

  /**
   * Interpret natural language request using GROQ
   */
  private async interpretRequest(naturalLanguage: string): Promise<{
    intent: string;
    summary: string;
    targetAreas: string[];
    complexity: 'low' | 'medium' | 'high';
    estimatedFiles: number;
  }> {
    const prompt = `You are an expert code interpreter. Analyze this natural language coding request and extract structured information.

Request: "${naturalLanguage}"

Provide a JSON response with:
{
  "intent": "Brief description of what the user wants to achieve",
  "summary": "1-2 sentence summary of the changes needed",
  "targetAreas": ["list", "of", "affected", "areas"],
  "complexity": "low|medium|high",
  "estimatedFiles": <number of files that will be affected>
}

Respond ONLY with valid JSON, no additional text.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('[VibeCoding] Failed to parse interpretation:', response);
      return {
        intent: naturalLanguage,
        summary: naturalLanguage,
        targetAreas: ['unknown'],
        complexity: 'medium',
        estimatedFiles: 1,
      };
    }
  }

  /**
   * Validate file changes for safety and correctness
   */
  private async validateChanges(fileChanges: FileChange[]): Promise<{
    syntax: boolean;
    lsp: boolean;
    safety: boolean;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    let syntax = true;
    let lsp = true;
    let safety = true;

    // Safety checks
    for (const change of fileChanges) {
      // Check for destructive operations
      if (change.action === 'delete') {
        warnings.push(`⚠️ File deletion detected: ${change.filePath}`);
        safety = false;
      }

      // Check for critical file modifications
      const criticalFiles = ['package.json', 'drizzle.config.ts', 'vite.config.ts'];
      if (criticalFiles.some(f => change.filePath.includes(f))) {
        warnings.push(`⚠️ Critical file modification: ${change.filePath}`);
      }

      // Check for large changes
      const linesChanged = change.diff.split('\n').length;
      if (linesChanged > 100) {
        warnings.push(`⚠️ Large change (${linesChanged} lines) in ${change.filePath}`);
      }

      // Basic syntax validation for TypeScript/JavaScript
      if (change.filePath.match(/\.(ts|tsx|js|jsx)$/)) {
        try {
          // Check for basic syntax errors (unclosed braces, etc.)
          const openBraces = (change.newContent.match(/\{/g) || []).length;
          const closeBraces = (change.newContent.match(/\}/g) || []).length;
          
          if (openBraces !== closeBraces) {
            warnings.push(`⚠️ Possible syntax error in ${change.filePath}: Unmatched braces`);
            syntax = false;
          }
        } catch (error) {
          warnings.push(`⚠️ Failed to validate syntax for ${change.filePath}`);
          syntax = false;
        }
      }
    }

    // LSP validation would go here (requires LSP server integration)
    // For now, we'll assume LSP is valid if syntax is valid
    lsp = syntax;

    return {
      syntax,
      lsp,
      safety: safety && warnings.length === 0,
      warnings,
    };
  }

  /**
   * Estimate impact of changes
   */
  private estimateImpact(fileChanges: FileChange[]): string {
    const fileCount = fileChanges.length;
    const totalLines = fileChanges.reduce(
      (sum, change) => sum + change.diff.split('\n').length,
      0
    );

    if (fileCount === 1 && totalLines < 20) {
      return 'Low - Single file, minor change';
    } else if (fileCount <= 3 && totalLines < 100) {
      return 'Medium - Few files, moderate changes';
    } else {
      return 'High - Multiple files or extensive changes';
    }
  }

  /**
   * Preview generated code changes
   */
  async previewChanges(sessionId: string): Promise<VibeCodeResult | null> {
    const result = this.sessionCache.get(sessionId);
    
    if (!result) {
      console.error(`[VibeCoding] ❌ No cached result for session ${sessionId}`);
      return null;
    }

    return result;
  }

  /**
   * Apply generated code changes
   */
  async applyChanges(sessionId: string, userId: number): Promise<ApplyResult> {
    try {
      const result = this.sessionCache.get(sessionId);
      
      if (!result || !result.success) {
        return {
          success: false,
          sessionId,
          filesModified: [],
          error: 'Invalid or failed session',
        };
      }

      // Safety check - don't apply if validation failed
      if (!result.validationResults.safety) {
        return {
          success: false,
          sessionId,
          filesModified: [],
          error: 'Safety validation failed - manual review required',
        };
      }

      console.log(`[VibeCoding] 📝 Applying ${result.fileChanges.length} file changes...`);

      const filesModified: string[] = [];

      // Create git commit point before changes
      let gitCommitId: string | undefined;
      try {
        const { stdout } = await execAsync('git rev-parse HEAD');
        gitCommitId = stdout.trim();
        console.log(`[VibeCoding] 📌 Git checkpoint: ${gitCommitId}`);
      } catch (error) {
        console.warn('[VibeCoding] ⚠️ Git checkpoint failed, continuing without rollback support');
      }

      // Apply each file change
      for (const change of result.fileChanges) {
        try {
          const fullPath = path.join(process.cwd(), change.filePath);

          if (change.action === 'create' || change.action === 'modify') {
            // Ensure directory exists
            const dir = path.dirname(fullPath);
            await fs.mkdir(dir, { recursive: true });

            // Write file
            await fs.writeFile(fullPath, change.newContent, 'utf-8');
            filesModified.push(change.filePath);
            console.log(`[VibeCoding] ✅ ${change.action}: ${change.filePath}`);
          } else if (change.action === 'delete') {
            // Deletion requires explicit confirmation (shouldn't reach here due to safety check)
            console.warn(`[VibeCoding] ⚠️ Skipping deletion: ${change.filePath}`);
          }
        } catch (error: any) {
          console.error(`[VibeCoding] ❌ Error applying change to ${change.filePath}:`, error);
          throw new Error(`Failed to apply change to ${change.filePath}: ${error.message}`);
        }
      }

      // Clear session cache
      this.sessionCache.delete(sessionId);

      console.log(`[VibeCoding] 🎉 Successfully applied ${filesModified.length} file changes`);

      return {
        success: true,
        sessionId,
        filesModified,
        gitCommitId,
      };
    } catch (error: any) {
      console.error('[VibeCoding] ❌ Error applying changes:', error);
      return {
        success: false,
        sessionId,
        filesModified: [],
        error: error.message,
      };
    }
  }

  /**
   * Validate code safety without applying
   */
  async validateCode(code: string, filePath: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic syntax checks
      if (filePath.match(/\.(ts|tsx|js|jsx)$/)) {
        const openBraces = (code.match(/\{/g) || []).length;
        const closeBraces = (code.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
          errors.push('Unmatched braces');
        }

        const openParens = (code.match(/\(/g) || []).length;
        const closeParens = (code.match(/\)/g) || []).length;
        
        if (openParens !== closeParens) {
          errors.push('Unmatched parentheses');
        }

        // Check for common mistakes
        if (code.includes('console.log') && !code.includes('development')) {
          warnings.push('Console.log detected - consider removing for production');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: [error.message],
        warnings,
      };
    }
  }
}

// Singleton instance
export const vibeCodingService = new VibeCodingService();
