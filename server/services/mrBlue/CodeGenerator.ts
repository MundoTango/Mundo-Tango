/**
 * MR BLUE CODE GENERATOR
 * Prompt Engineering & Code Generation for Vibe Coding Engine
 * 
 * Powered by GROQ Llama-3.1-70b-versatile
 * Week 1, Day 1 Implementation - MB.MD v7.1
 * 
 * Features:
 * - Sophisticated prompt engineering
 * - Context injection from ContextService
 * - Multi-file code generation
 * - File diff generation
 * - Code formatting
 */

import { ContextService, ContextSearchResult } from './ContextService';
import { orchestrateAI, type TaskType } from '../ai/AIOrchestrator';
import * as fs from 'fs/promises';
import * as path from 'path';

interface GenerateRequest {
  request: string;
  interpretation: any;
  context: ContextSearchResult[];
  targetFiles: string[];
  knownErrors?: Array<{
    errorMessage: string;
    suggestedFix: string;
    frequency: number;
  }>;
}

export interface FileChange {
  filePath: string;
  originalContent: string;
  newContent: string;
  diff: string;
  action: 'create' | 'modify' | 'delete';
  reason: string;
}

export class CodeGenerator {
  private contextService: ContextService;

  constructor(contextService: ContextService) {
    this.contextService = contextService;
  }

  /**
   * Generate code changes from request
   */
  async generateChanges(request: GenerateRequest): Promise<FileChange[]> {
    console.log('[CodeGenerator] 🎨 Generating code changes...');

    // Build comprehensive prompt
    const prompt = await this.buildPrompt(request);

    // Generate code using GROQ
    const generatedCode = await this.generateWithGroq(prompt, request);

    // Parse response into file changes
    const fileChanges = await this.parseGeneratedCode(generatedCode, request);

    console.log(`[CodeGenerator] ✅ Generated ${fileChanges.length} file changes`);
    return fileChanges;
  }

  /**
   * Build comprehensive prompt for code generation
   */
  private async buildPrompt(request: GenerateRequest): Promise<string> {
    const contextSnippets = request.context
      .map((ctx, i) => `[Context ${i + 1}] ${ctx.source}:\n${ctx.content}`)
      .join('\n\n');

    // Read target files if specified
    let existingCode = '';
    if (request.targetFiles.length > 0) {
      existingCode = 'Existing Files:\n\n';
      for (const filePath of request.targetFiles) {
        try {
          const fullPath = path.join(process.cwd(), filePath);
          const content = await fs.readFile(fullPath, 'utf-8');
          existingCode += `File: ${filePath}\n\`\`\`\n${content}\n\`\`\`\n\n`;
        } catch (error) {
          existingCode += `File: ${filePath}\n[File not found - will be created]\n\n`;
        }
      }
    }

    // PHASE 2: Build error learning section if known errors exist
    let errorLearningSection = '';
    if (request.knownErrors && request.knownErrors.length > 0) {
      errorLearningSection = `\n**⚠️ CRITICAL - LEARN FROM PAST FAILURES:**\nThe following errors have occurred before with similar requests. AVOID these mistakes:\n\n`;
      request.knownErrors.forEach((error, i) => {
        errorLearningSection += `${i + 1}. Problem: ${error.errorMessage}\n   Solution: ${error.suggestedFix}\n   (Occurred ${error.frequency} time${error.frequency > 1 ? 's' : ''})\n\n`;
      });
      console.log(`[CodeGenerator] 📚 Injecting ${request.knownErrors.length} error patterns into prompt`);
    }

    return `You are an expert full-stack developer working on the Mundo Tango platform using React + TypeScript + Vite.

**CRITICAL CONTEXT UNDERSTANDING:**
- User mentioned "MB.MD" referring to the MB.MD Development Protocol (a methodology)
- This is NOT a file name - do NOT create files named "mb.md.ts" or "mb-md.tsx"
- Focus on the ACTUAL problem described in the user request

**User Request:** ${request.request}

**Interpretation:** ${request.interpretation.summary}
${errorLearningSection}
**Project Context:**
${contextSnippets}

${existingCode}

**Technology Stack:**
- Frontend: React 18 + TypeScript + Vite + Wouter (routing) + TanStack Query
- UI: shadcn/ui + Tailwind CSS
- Backend: Node.js + Express + PostgreSQL + Drizzle ORM
- File Structure: client/src/pages/, client/src/components/, server/

**Instructions:**
1. Generate production-ready code that fulfills the user's request
2. Fix the ACTUAL bug/issue described (e.g., city autocomplete not working)
3. Modify EXISTING files, not create new unrelated files
4. Use TypeScript with proper typing
5. Follow React hooks best practices
6. Include proper error handling
7. Use 2-space indentation, NO tabs

**Output Format:**
Respond with ONLY valid JSON (no markdown, no code blocks):

{
  "files": [
    {
      "filePath": "client/src/pages/onboarding/CitySelectionPage.tsx",
      "action": "modify",
      "reason": "Fix city autocomplete",
      "content": "import statement here...\\n\\nfunction Component() {\\n  return <div></div>\\n}"
    }
  ]
}

**CRITICAL JSON FORMATTING:**
- Wrap files array in a root "files" object
- Escape ALL newlines as \\n (two characters: backslash + n)
- Escape ALL quotes as \\"
- Do NOT use actual line breaks in the content string
- Respond with ONLY the JSON object, nothing before or after

Generate the fix now:`;
  }

  /**
   * Generate code using AI Orchestrator (with automatic fallback)
   * MB.MD Pattern 99: Routes to best AI for code generation (OpenAI preferred, falls back to others)
   */
  private async generateWithGroq(prompt: string, request: GenerateRequest): Promise<string> {
    console.log('[CodeGenerator] 🤖 Calling AI Orchestrator for code generation...');

    const systemPrompt = 'You are an expert full-stack developer. You generate clean, production-ready code following best practices. You MUST respond with valid JSON only - no markdown, no explanations.';

    const aiResponse = await orchestrateAI('code_generation', systemPrompt, prompt, {
      temperature: 0.2,
      maxTokens: 4000, // Reduced from 8000 to stay within limits
    });

    console.log(`[CodeGenerator] ✅ AI response received from ${aiResponse.provider} in ${aiResponse.latencyMs}ms`);
    
    return aiResponse.content;
  }

  /**
   * Parse generated code into file changes
   */
  private async parseGeneratedCode(
    generatedCode: string,
    request: GenerateRequest
  ): Promise<FileChange[]> {
    const fileChanges: FileChange[] = [];

    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = generatedCode.trim();
      
      // Remove markdown code blocks if present
      const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        // Try to find JSON array
        const arrayMatch = jsonStr.match(/\[\s*{[\s\S]*}\s*\]/);
        if (arrayMatch) {
          jsonStr = arrayMatch[0];
        }
      }

      // Clean up any remaining control characters outside of strings
      jsonStr = jsonStr.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '');
      
      const parsed = JSON.parse(jsonStr);
      
      // Handle both old array format and new {files: [...]} format
      let filesArray: any[];
      if (Array.isArray(parsed)) {
        filesArray = parsed;
      } else if (parsed.files && Array.isArray(parsed.files)) {
        filesArray = parsed.files;
      } else {
        throw new Error('Response does not contain a files array');
      }

      for (const item of filesArray) {
        const { filePath, action, reason, content } = item;

        if (!filePath || !action || !content) {
          console.warn('[CodeGenerator] ⚠️ Skipping incomplete file change:', item);
          continue;
        }

        // Read original content if file exists
        let originalContent = '';
        try {
          const fullPath = path.join(process.cwd(), filePath);
          originalContent = await fs.readFile(fullPath, 'utf-8');
        } catch (error) {
          // File doesn't exist - will be created
        }

        // Generate diff
        const diff = this.generateDiff(originalContent, content, filePath);

        fileChanges.push({
          filePath,
          originalContent,
          newContent: content,
          diff,
          action: action as 'create' | 'modify' | 'delete',
          reason: reason || 'No reason provided',
        });
      }
    } catch (error: any) {
      console.error('[CodeGenerator] ❌ Failed to parse generated code:', error);
      console.error('[CodeGenerator] Response was:', generatedCode.substring(0, 500));
      
      // Fallback: create a single file change with the raw response
      fileChanges.push({
        filePath: 'generated-code.txt',
        originalContent: '',
        newContent: generatedCode,
        diff: `+${generatedCode}`,
        action: 'create',
        reason: 'Failed to parse structured response - raw output saved',
      });
    }

    return fileChanges;
  }

  /**
   * Generate simple diff between original and new content
   */
  private generateDiff(original: string, updated: string, filePath: string): string {
    const originalLines = original.split('\n');
    const updatedLines = updated.split('\n');

    let diff = `--- ${filePath}\n+++ ${filePath}\n`;

    // Simple line-by-line diff
    const maxLines = Math.max(originalLines.length, updatedLines.length);
    let addedLines = 0;
    let removedLines = 0;

    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i];
      const updatedLine = updatedLines[i];

      if (originalLine !== updatedLine) {
        if (originalLine !== undefined) {
          diff += `-${originalLine}\n`;
          removedLines++;
        }
        if (updatedLine !== undefined) {
          diff += `+${updatedLine}\n`;
          addedLines++;
        }
      }
    }

    diff = `@@ -1,${originalLines.length} +1,${updatedLines.length} @@\n${diff}`;
    
    return diff;
  }

  /**
   * Format code (basic formatting)
   */
  private formatCode(code: string, fileType: string): string {
    // Basic formatting - ensure consistent line endings and indentation
    let formatted = code
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, '  ');

    return formatted;
  }
}
