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

    return `You are an expert full-stack developer working on the Mundo Tango platform. You follow best practices, write clean TypeScript code, and adhere to the project's coding standards.

**User Request:** ${request.request}

**Interpretation:** ${request.interpretation.summary}

**Project Context:**
${contextSnippets}

${existingCode}

**Instructions:**
1. Generate production-ready code that fulfills the user's request
2. Follow the existing code patterns and architecture
3. Use TypeScript with proper typing
4. Follow the project's component structure and naming conventions
5. Include proper error handling and validation
6. Add helpful comments for complex logic
7. Format code properly (2-space indentation)

**Output Format:**
Provide your response as a JSON array of file changes:

\`\`\`json
[
  {
    "filePath": "relative/path/to/file.ts",
    "action": "create|modify",
    "reason": "Brief explanation of this change",
    "content": "Complete file content here..."
  }
]
\`\`\`

IMPORTANT: 
- Only include files that need to be changed
- Provide COMPLETE file content (not partial)
- Use proper JSON escaping for quotes and newlines
- Do not truncate code
- Respond ONLY with the JSON array, no additional text

Generate the code changes now:`;
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
