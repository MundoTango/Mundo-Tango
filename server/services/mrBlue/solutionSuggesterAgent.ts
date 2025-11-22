import { db } from "@db";
import { sessionBugsFound, errorPatterns } from "@shared/schema";
import { eq } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

// Use Bifrost for Claude access
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

// ============================================================================
// SOLUTION SUGGESTER AGENT - Agent #208
// ============================================================================

export class SolutionSuggesterAgent {
  /**
   * Suggest a fix for a bug (works with both sessionBugsFound and errorPatterns)
   */
  async suggestFix(bugId: number): Promise<{
    code: string;
    explanation: string;
    files: string[];
    confidence: number;
  }> {
    try {
      // ✅ AGENT #6 FIX: Try errorPatterns table first, then sessionBugsFound
      let bug = await db
        .select()
        .from(errorPatterns)
        .where(eq(errorPatterns.id, bugId))
        .limit(1)
        .then(rows => rows[0]);

      let isErrorPattern = !!bug;

      if (!bug) {
        // Fallback to sessionBugsFound
        bug = await db
          .select()
          .from(sessionBugsFound)
          .where(eq(sessionBugsFound.id, bugId))
          .limit(1)
          .then(rows => rows[0]);
      }

      if (!bug) {
        throw new Error(`Bug/Error ${bugId} not found`);
      }

      // Generate fix using Claude 3.5 Sonnet
      const userPrompt = isErrorPattern 
        ? `You are an expert software engineer. Analyze this error and suggest a fix:

Error Type: ${(bug as any).errorType}
Error Message: ${(bug as any).errorMessage}
Stack Trace: ${(bug as any).errorStack || 'N/A'}
Frequency: ${(bug as any).frequency} occurrences
Metadata: ${JSON.stringify((bug as any).metadata, null, 2)}

Provide:
1. Root cause analysis
2. Suggested code fix (with file paths)
3. Explanation of the fix
4. Confidence level (0.0-1.0)

Format as JSON:
{
  "rootCause": "...",
  "code": "...",
  "explanation": "...",
  "files": ["path/to/file1.ts", "path/to/file2.tsx"],
  "confidence": 0.0-1.0
}`
        : `You are an expert software engineer. Analyze this bug and suggest a fix:

Bug Title: ${(bug as any).title}
Description: ${(bug as any).description}
Severity: ${(bug as any).severity}
Reproduction Steps: ${JSON.stringify((bug as any).reproSteps, null, 2)}

Provide:
1. Root cause analysis
2. Suggested code fix (with file paths)
3. Explanation of the fix
4. Confidence level (0.0-1.0)

Format as STRICT JSON (no backticks, no template literals):
{
  "rootCause": "Brief explanation of why this error occurred",
  "code": "Complete code fix as a single string (use \\n for newlines)",
  "explanation": "Clear explanation of how the fix works",
  "files": ["path/to/file1.ts"],
  "confidence": 0.9
}

IMPORTANT: Use escaped newlines (\\n) instead of backticks or template literals!`;

      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

      const content = message.content[0];
      
      console.log('[Solution Suggester Agent] Raw Claude response:', JSON.stringify(content, null, 2));
      
      // Initialize result with defaults
      let result = {
        code: '',
        explanation: 'No explanation provided',
        files: [],
        confidence: 0.5,
      };
      
      if (content.type === 'text') {
        console.log('[Solution Suggester Agent] Claude text response length:', content.text.length);
        
        // Try to extract JSON from the response
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            // Fix: Escape newlines and replace HTML entities before parsing
            let cleanedJson = jsonMatch[0]
              .replace(/\r?\n/g, '\\n')  // Escape actual newlines
              .replace(/\t/g, '\\t')     // Escape tabs
              .replace(/&gt;/g, '>')
              .replace(/&lt;/g, '<')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#x27;/g, "'");
            
            const parsed = JSON.parse(cleanedJson);
            console.log('[Solution Suggester Agent] ✅ Successfully parsed Claude JSON (confidence:', parsed.confidence, ')');
            result = parsed;
          } catch (parseError) {
            console.error('[Solution Suggester Agent] ❌ JSON parse failed:', parseError);
            // Fallback: store the whole response as explanation
            result.explanation = content.text;
          }
        } else {
          console.log('[Solution Suggester Agent] No JSON match found, using fallback');
          // Fallback: treat whole response as explanation
          result = {
            code: '',
            explanation: content.text,
            files: [],
            confidence: 0.5,
          };
        }
      } else {
        console.warn('[Solution Suggester Agent] Unexpected content type:', content.type);
      }
      
      console.log('[Solution Suggester Agent] Final result:', JSON.stringify(result, null, 2));

      return {
        code: result.code || '',
        explanation: result.explanation || 'No explanation provided',
        files: result.files || [],
        confidence: result.confidence || 0.5,
      };
    } catch (error: any) {
      console.error('[Solution Suggester Agent] Error suggesting fix:', error);
      console.error('[Solution Suggester Agent] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      return {
        code: '',
        explanation: `Error generating fix suggestion: ${error.message || 'Unknown error'}`,
        files: [],
        confidence: 0.0,
      };
    }
  }

  /**
   * Generate a Playwright test case for a bug
   */
  async generateTestCase(bug: any): Promise<string> {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `Generate a Playwright test case to verify this bug is fixed:

Bug Title: ${bug.title}
Description: ${bug.description}
Severity: ${bug.severity}
Reproduction Steps: ${JSON.stringify(bug.reproSteps, null, 2)}

Create a complete Playwright test in TypeScript that:
1. Reproduces the bug scenario
2. Verifies the fix works correctly
3. Uses data-testid attributes for selectors
4. Includes proper assertions

Return ONLY the test code, no explanations.`,
          },
        ],
      });

      const content = message.content[0];
      
      if (content.type === 'text') {
        // Extract code block if present
        const codeMatch = content.text.match(/```typescript\n([\s\S]*?)\n```/);
        return codeMatch ? codeMatch[1] : content.text;
      }

      return '// Error generating test case';
    } catch (error) {
      console.error('[Solution Suggester Agent] Error generating test case:', error);
      return '// Error generating test case';
    }
  }

  /**
   * Estimate effort required to fix a bug
   */
  async estimateEffort(bugId: number): Promise<{
    hours: number;
    complexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very_complex';
    reasoning: string;
  }> {
    try {
      // Get the bug details
      const [bug] = await db
        .select()
        .from(sessionBugsFound)
        .where(eq(sessionBugsFound.id, bugId));

      if (!bug) {
        throw new Error(`Bug ${bugId} not found`);
      }

      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `Estimate the effort to fix this bug:

Bug Title: ${bug.title}
Description: ${bug.description}
Severity: ${bug.severity}

Provide effort estimate in JSON:
{
  "hours": number (1-40),
  "complexity": "trivial|simple|moderate|complex|very_complex",
  "reasoning": "brief explanation"
}`,
          },
        ],
      });

      const content = message.content[0];
      let result;

      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        }
      }

      return {
        hours: result?.hours || 4,
        complexity: result?.complexity || 'moderate',
        reasoning: result?.reasoning || 'Unable to estimate',
      };
    } catch (error) {
      console.error('[Solution Suggester Agent] Error estimating effort:', error);
      return {
        hours: 4,
        complexity: 'moderate',
        reasoning: 'Error during estimation',
      };
    }
  }

  /**
   * Generate multiple fix suggestions for a bug
   */
  async generateAlternativeFixes(bugId: number): Promise<Array<{
    approach: string;
    code: string;
    pros: string[];
    cons: string[];
    confidence: number;
  }>> {
    try {
      const [bug] = await db
        .select()
        .from(sessionBugsFound)
        .where(eq(sessionBugsFound.id, bugId));

      if (!bug) {
        throw new Error(`Bug ${bugId} not found`);
      }

      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content: `Generate 3 alternative approaches to fix this bug:

Bug Title: ${bug.title}
Description: ${bug.description}

For each approach, provide:
- Approach name/description
- Code snippet
- Pros and cons
- Confidence level

Return as JSON array:
[
  {
    "approach": "...",
    "code": "...",
    "pros": ["pro1", "pro2"],
    "cons": ["con1", "con2"],
    "confidence": 0.0-1.0
  }
]`,
          },
        ],
      });

      const content = message.content[0];
      
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      return [];
    } catch (error) {
      console.error('[Solution Suggester Agent] Error generating alternatives:', error);
      return [];
    }
  }

  /**
   * Validate a proposed fix
   */
  async validateFix(bugId: number, proposedFix: string): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
    score: number;
  }> {
    try {
      const [bug] = await db
        .select()
        .from(sessionBugsFound)
        .where(eq(sessionBugsFound.id, bugId));

      if (!bug) {
        throw new Error(`Bug ${bugId} not found`);
      }

      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Review this proposed fix for the bug:

Bug: ${bug.title}
Description: ${bug.description}

Proposed Fix:
${proposedFix}

Validate the fix and return JSON:
{
  "isValid": boolean,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "score": 0-100
}`,
          },
        ],
      });

      const content = message.content[0];
      
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      return {
        isValid: false,
        issues: ['Unable to validate'],
        suggestions: [],
        score: 0,
      };
    } catch (error) {
      console.error('[Solution Suggester Agent] Error validating fix:', error);
      return {
        isValid: false,
        issues: ['Error during validation'],
        suggestions: [],
        score: 0,
      };
    }
  }
}

export const solutionSuggesterAgent = new SolutionSuggesterAgent();
