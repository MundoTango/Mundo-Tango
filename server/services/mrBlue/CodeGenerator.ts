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

import Groq from 'groq-sdk';
import { ContextService, ContextSearchResult } from './ContextService';
import * as fs from 'fs/promises';
import * as path from 'path';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface GenerateRequest {
  request: string;
  interpretation: any;
  context: ContextSearchResult[];
  targetFiles: string[];
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

    return `You are an expert full-stack developer working on the Mundo Tango platform using React + TypeScript + Vite.

**CRITICAL CONTEXT UNDERSTANDING:**
- User mentioned "MB.MD" referring to the MB.MD Development Protocol (a methodology)
- This is NOT a file name - do NOT create files named "mb.md.ts" or "mb-md.tsx"
- Focus on the ACTUAL problem described in the user request

**User Request:** ${request.request}

**Interpretation:** ${request.interpretation.summary}

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
Provide ONLY a JSON array with NO markdown code blocks:

[
  {
    "filePath": "client/src/pages/onboarding/CitySelectionPage.tsx",
    "action": "modify",
    "reason": "Fix city autocomplete",
    "content": "import statement here...\\n\\nfunction Component() {\\n  return <div></div>\\n}"
  }
]

**CRITICAL JSON FORMATTING:**
- Escape ALL newlines as \\n (two characters: backslash + n)
- Escape ALL quotes as \\"
- Do NOT use actual line breaks in the content string
- Respond with ONLY the JSON array, nothing before or after

Generate the fix now:`;
  }

  /**
   * Generate code using GROQ
   */
  private async generateWithGroq(prompt: string, request: GenerateRequest): Promise<string> {
    console.log('[CodeGenerator] 🤖 Calling GROQ API...');

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert full-stack developer. You generate clean, production-ready code following best practices. You always respond with valid JSON containing complete file contents.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 8000,
    });

    const response = completion.choices[0]?.message?.content || '[]';
    console.log('[CodeGenerator] ✅ GROQ response received');
    
    return response;
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

      // AGGRESSIVE JSON REPAIR: Fix unescaped newlines/tabs in content strings
      // GROQ often returns literal newlines instead of \n escapes
      // Strategy: Find all "content": "..." blocks and escape their contents
      jsonStr = jsonStr.replace(/"content"\s*:\s*"([^"]*)"/gs, (match, content) => {
        // Escape the content properly
        const escaped = content
          .replace(/\\/g, '\\\\')  // Escape backslashes first
          .replace(/\n/g, '\\n')   // Then newlines
          .replace(/\r/g, '\\r')   // Carriage returns
          .replace(/\t/g, '\\t')   // Tabs
          .replace(/"/g, '\\"');   // Quotes
        return `"content": "${escaped}"`;
      });
      
      // Also clean up any remaining control characters outside of strings
      jsonStr = jsonStr.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '');
      
      const parsed = JSON.parse(jsonStr);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      for (const item of parsed) {
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
