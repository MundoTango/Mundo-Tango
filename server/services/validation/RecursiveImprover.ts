import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export class RecursiveImprover {
  /**
   * Improve code based on validation errors
   * Uses Gödel Agent pattern - recursive self-validation
   */
  async improveCode(
    files: Array<{ path: string; content: string }>,
    errors: Array<{ file: string; line?: number; message: string; severity: string }>
  ): Promise<Array<{ path: string; content: string }>> {
    console.log(`[RecursiveImprover] Improving ${files.length} files with ${errors.length} errors`);

    const improved: Array<{ path: string; content: string }> = [];

    for (const file of files) {
      // Get errors for this file
      const fileErrors = errors.filter(e => e.file === file.path);

      if (fileErrors.length === 0) {
        // No errors, keep original
        improved.push(file);
        continue;
      }

      console.log(`[RecursiveImprover] Fixing ${fileErrors.length} errors in ${file.path}`);

      // Use AI to fix errors
      const fixed = await this.fixFile(file, fileErrors);
      improved.push(fixed);
    }

    return improved;
  }

  /**
   * Fix file using AI
   */
  private async fixFile(
    file: { path: string; content: string },
    errors: Array<{ file: string; line?: number; message: string; severity: string }>
  ): Promise<{ path: string; content: string }> {
    try {
      const errorDescriptions = errors
        .map(e => `${e.severity.toUpperCase()}: ${e.message}${e.line ? ` (line ${e.line})` : ''}`)
        .join('\n');

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a code improvement expert. Fix validation errors in code.

Rules:
- Fix ONLY the errors mentioned
- Maintain code style and structure
- Return ONLY the fixed code, no explanations
- Preserve all functionality
- Don't introduce new bugs`
          },
          {
            role: 'user',
            content: `File: ${file.path}

Errors to fix:
${errorDescriptions}

Original Code:
\`\`\`
${file.content}
\`\`\`

Fixed Code:`
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      });

      let fixedContent = response.choices[0].message.content?.trim() || file.content;

      // Remove code fences if present
      fixedContent = fixedContent.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');

      console.log(`[RecursiveImprover] Fixed ${file.path}`);

      return {
        path: file.path,
        content: fixedContent
      };
    } catch (error: any) {
      console.error(`[RecursiveImprover] Failed to fix ${file.path}:`, error.message);
      return file; // Return original on error
    }
  }

  /**
   * Assess improvement quality
   */
  async assessImprovement(
    original: string,
    improved: string,
    errors: string[]
  ): Promise<number> {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Assess code improvement quality on a scale of 0-1. Respond with ONLY a number.'
          },
          {
            role: 'user',
            content: `Original errors: ${errors.join(', ')}\n\nAssess if improvement fixes these issues.\n\nQuality Score:`
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      const score = parseFloat(response.choices[0].message.content?.trim() || '0');
      return Math.min(Math.max(score, 0), 1);
    } catch (error) {
      return 0.5;
    }
  }
}

export const recursiveImprover = new RecursiveImprover();
